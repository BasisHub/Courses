#!/usr/bin/env python3
"""Prove that docs/docs/dwc is a pure relocation of DWC-Course 965da6d (D-01, D-13, D-14).

Check A: every diff hunk between the old pages (git archive 965da6d) and the new
         pages is explained by one allowlisted rule.
Check B: the file set under docs/docs/dwc is exactly the expected one.
Check C: tools/data/dwc-image-map.json is consistent with the tree and the source blobs.

Usage: python3 tools/check-dwc-relocation.py [--rev REV]
  --rev REV  read pages from git revision REV instead of the working tree
             (images are always read from the working tree).
Environment: DWC_SOURCE_REPO overrides the clone location (default ../bbj-dwc-tutorial).
Exit 0 on pass, 1 on any failure, 2 when the source clone or commit is missing.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import io
import json
import os
import pathlib
import re
import subprocess
import sys
import tarfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
_env = os.environ.get("DWC_SOURCE_REPO")
SOURCE_REPO = pathlib.Path(_env) if _env else ROOT.parent / "bbj-dwc-tutorial"
SOURCE_SHA = "965da6d"
DWC = "docs/docs/dwc"
MAP_FILE = "tools/data/dwc-image-map.json"
IMPORT_LINE = "import Image from '@theme/IdealImage';"
TOP = {"prerequisites", "samples", "resources"}

IMAGE_RE = re.compile(r"^(.*?)<Image img=\{require\('@site/static/img/([^']+)'\)\} alt=\"(.*)\" />(.*)$")
GIF_RE = re.compile(r"^(.*)!\[([^\]]*)\]\(/img/([^)]+)\)(.*)$")
TARGET_RE = re.compile(r"\]\(([^)]*)\)")

failures = 0


def report(ok: bool, name: str, detail: str = "") -> None:
    global failures
    print(("PASS " if ok else "FAIL ") + name + (f": {detail}" if detail else ""))
    if not ok:
        failures += 1


def git(*args: str, cwd=None, binary=False):
    r = subprocess.run(["git", *args], cwd=cwd or ROOT, capture_output=True)
    if r.returncode != 0:
        return None
    return r.stdout if binary else r.stdout.decode("utf-8")


def source_check() -> None:
    if not SOURCE_REPO.is_dir():
        print(f"source clone missing: {SOURCE_REPO}", file=sys.stderr)
        sys.exit(2)
    r = subprocess.run(["git", "-C", str(SOURCE_REPO), "rev-parse", "--verify", f"{SOURCE_SHA}^{{commit}}"],
                       capture_output=True)
    if r.returncode != 0:
        print(f"commit {SOURCE_SHA} not found in {SOURCE_REPO}", file=sys.stderr)
        sys.exit(2)


def old_files() -> dict[str, bytes]:
    p = subprocess.run(["git", "-C", str(SOURCE_REPO), "archive", SOURCE_SHA, "docs", "static/img"],
                       capture_output=True, check=True)
    out: dict[str, bytes] = {}
    with tarfile.open(fileobj=io.BytesIO(p.stdout), mode="r|") as tf:
        for m in tf:
            if m.isfile():
                f = tf.extractfile(m)
                assert f is not None
                out[m.name] = f.read()
    return out


def read_new(rev: str | None, rel: str) -> str | None:
    if rev:
        return git("show", f"{rev}:{rel}")
    p = ROOT / rel
    return p.read_text(encoding="utf-8") if p.is_file() else None


def list_new(rev: str | None) -> list[str]:
    if rev:
        out = git("ls-tree", "-r", "--name-only", rev, "--", DWC) or ""
        return sorted(out.split())
    base = ROOT / DWC
    return sorted(p.relative_to(ROOT).as_posix() for p in base.rglob("*") if p.is_file())


def targets_ok(line: str) -> bool:
    return all(t.startswith("./") or t.startswith("#") for t in TARGET_RE.findall(line))


def explains(old: str, new: str, kebab_of: dict[str, str], top: bool) -> bool:
    m = IMAGE_RE.match(old)
    if m:
        pre, name, alt, post = m.groups()
        k = kebab_of.get(name)
        return k is not None and new == f"{pre}![{alt}](./img/{k}){post}"
    m = GIF_RE.match(old)
    if m:
        pre, alt, name, post = m.groups()
        k = kebab_of.get(name)
        return k is not None and new == f"{pre}![{alt}](./img/{k}){post}"
    if TARGET_RE.sub("](<>)", old) == TARGET_RE.sub("](<>)", new) and old != new and targets_ok(new):
        return True
    if top and old.startswith("sidebar_position:") and new.startswith("sidebar_position:"):
        return True
    return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rev")
    args = ap.parse_args()
    source_check()
    old = old_files()

    # image map
    mp_text = read_new(args.rev, MAP_FILE)
    if mp_text is None:
        report(False, "image map present", MAP_FILE)
        print(f"{failures} failure(s)")
        sys.exit(1)
    mp = json.loads(mp_text)
    kebab_of = {e["old"][len("static/img/"):]: pathlib.PurePosixPath(e["new"]).name
                for e in mp if e["new"]}

    # Check A
    pages = []
    for name in sorted(old):
        if name.startswith("docs/") and name.endswith(".md") and name != "docs/index.md":
            rel = name[len("docs/"):]
            new_rel = rel[:-3] + ".mdx" if "/" not in rel else rel
            pages.append((name, new_rel))
    report(len(pages) == 26, "26 pages in old tree", str(len(pages)))
    for oname, new_rel in pages:
        new_text = read_new(args.rev, f"{DWC}/{new_rel}")
        if new_text is None:
            report(False, "page exists", new_rel)
            continue
        top = "/" not in new_rel
        a = old[oname].decode("utf-8").split("\n")
        b = new_text.split("\n")
        bad = 0
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
            if tag == "equal":
                continue
            ol, nl = a[i1:i2], b[j1:j2]
            if tag == "delete":
                nonblank = [x for x in ol if x.strip()]
                if nonblank == [IMPORT_LINE] and len(ol) - 1 <= 1:
                    continue
            elif tag == "replace" and len(ol) == len(nl):
                if all(explains(x, y, kebab_of, top) for x, y in zip(ol, nl)):
                    continue
            elif tag == "replace":
                # import removal combined with an adjacent change is not allowed
                pass
            bad += 1
            print(f"FAIL {new_rel}: unexplained hunk {tag} old[{i1}:{i2}] new[{j1}:{j2}]")
            for x in ol[:3]:
                print(f"    - {x}")
            for y in nl[:3]:
                print(f"    + {y}")
        report(bad == 0, f"text unchanged {new_rel}")

    # Check B
    files = list_new(args.rev)
    expected = {f"{DWC}/00-overview.mdx"}
    expected |= {f"{DWC}/{n}.mdx" for n in TOP}
    expected |= {f"{DWC}/{n}" for _, n in pages if "/" in n}
    chapters = {n.split("/")[0] for _, n in pages if "/" in n}
    expected |= {f"{DWC}/{c}/_category_.json" for c in chapters}
    expected |= {e["new"] for e in mp if e["verdict"] == "moved"}
    extra = sorted(set(files) - expected)
    miss = sorted(expected - set(files))
    report(not extra and not miss, "file set", f"extra={extra[:5]} missing={miss[:5]}")
    report(len(chapters) == 12, "12 chapters", str(len(chapters)))
    report(not any(pathlib.PurePosixPath(f).name.startswith(".") for f in files), "no dotfiles")
    report(not any("01-first-chapter" in f for f in files), "stub folder absent")

    # Check C
    verdicts = {}
    for e in mp:
        verdicts[e["verdict"]] = verdicts.get(e["verdict"], 0) + 1
    report(len(mp) == 66, "66 map entries", str(len(mp)))
    report(verdicts == {"moved": 48, "parked": 12, "not-moved": 6}, "verdict counts", str(verdicts))
    report([e["old"] for e in mp] == sorted(e["old"] for e in mp), "map sorted by old")
    bad = []
    for e in mp:
        blob = old.get(e["old"])
        if blob is None:
            bad.append(f"no source blob {e['old']}")
            continue
        if e["verdict"] == "not-moved":
            if e["new"] is not None:
                bad.append(f"not-moved with new: {e['old']}")
            continue
        if args.rev:
            data = git("show", f"{args.rev}:{e['new']}", binary=True)
        else:
            p = ROOT / e["new"]
            data = p.read_bytes() if p.is_file() else None
        if data is None:
            bad.append(f"missing {e['new']}")
        elif hashlib.sha256(data).hexdigest() != hashlib.sha256(blob).hexdigest():
            bad.append(f"sha256 differs {e['new']}")
    report(not bad, "image files exist with identical sha256", "; ".join(bad[:5]))

    moved_by_new = {e["new"]: e for e in mp if e["verdict"] == "moved"}
    refd: set[str] = set()
    ref_bad = []
    for f in files:
        if not f.endswith((".md", ".mdx")):
            continue
        text = read_new(args.rev, f) or ""
        in_fence = False
        for line in text.split("\n"):
            if re.match(r"^\s*(```|~~~)", line):
                in_fence = not in_fence
            if in_fence:
                continue
            for m in re.finditer(r"\]\(\./img/([^)]+)\)", line):
                target = f"{pathlib.PurePosixPath(f).parent.as_posix()}/img/{m.group(1)}"
                e = moved_by_new.get(target)
                if e is None or e["page"] != f:
                    ref_bad.append(f"{f} -> {m.group(1)}")
                refd.add(target)
    unref = sorted(n for n in moved_by_new if n not in refd)
    report(not ref_bad, "image references resolve to moved entries", "; ".join(ref_bad[:5]))
    report(not unref, "every moved image is referenced", "; ".join(unref[:5]))

    print(f"{failures} failure(s)" if failures else "all checks passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
