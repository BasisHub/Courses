#!/usr/bin/env python3
"""One-shot relocation of the DWC-Course book into docs/docs/dwc (D-01, D-02, D-03, D-13, D-14).

Reads the old book only through `git archive 965da6d docs static/img` (never the
working tree of the clone), copies the 26 content pages with three mechanical
transforms (image syntax, link targets, IdealImage import removal), colocates the
48 referenced images under kebab-case names, parks 12 unreferenced screenshots in
tools/data/dwc-unused-img/ and writes tools/data/dwc-image-map.json.

Re-runnable only until commit 1 of Phase 4 exists; afterwards the Markdown is the
only source of truth. 00-overview.mdx is never touched (written by hand, D-09).

Usage: python3 tools/relocate-dwc.py
Environment: DWC_SOURCE_REPO overrides the clone location (default ../bbj-dwc-tutorial).
Exit 0 on success, 1 on a failed count or unresolved link, 2 when the clone is missing.
"""
from __future__ import annotations

import io
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
_env = os.environ.get("DWC_SOURCE_REPO")
SOURCE_REPO = pathlib.Path(_env) if _env else ROOT.parent / "bbj-dwc-tutorial"
SOURCE_SHA = "965da6d"
DST = ROOT / "docs" / "docs" / "dwc"
PARK = ROOT / "tools" / "data" / "dwc-unused-img"
MAP_FILE = ROOT / "tools" / "data" / "dwc-image-map.json"

LABELS = {
    "01-gui-to-bui-to-dwc": "GUI to BUI to DWC",
    "02-browser-developer-tools": "Browser Developer Tools, CSS, and Themes",
    "03-dwc-debugging": "DWC Debugging",
    "04-upgrading-apps": "Upgrading Apps to DWC",
    "05-dwc-controls": "DWC Controls With Extended Attributes",
    "06-flow-layouts": "Flow Layouts and CSS for Responsive Design",
    "07-icon-pools": "Icon Pools",
    "08-control-validation": "Control Validation",
    "09-browser-constraints": "Browser Constraints",
    "10-embedding-components": "Embedding 3rd Party Components",
    "11-advanced-responsive": "Advanced Responsive Design",
    "12-deployment": "Deployment Options",
}
TOP = {"prerequisites": "0.1", "samples": "0.2", "resources": "0.3"}
OVERRIDES = {"Hello_BBj_DWC_Grid.png": "hello-bbj-dwc-grid.png", "Hello_DWC_4A.png": "hello-dwc-4a.png"}
PARKED_STEMS = {
    "DevTools_Screenshot_1", "DevTools_Screenshot_2", "DevTools_Screenshot_3", "DevTools_Screenshot_4",
    "Hello_DWC_4A", "Hello_BBj_DWC_Grid", "MessageBox", "Responsive_Demo",
    "CSS_Grid_Playground_2", "CSS_Grid_Playground_3", "CSS_Layout_Samples_5", "CSS_Layout_Samples_6",
}
SITE_ASSETS = {"docusaurus.png", "docusaurus-social-card.jpg", "dwc-logo.png", "logo.svg", "favicon.ico", "favicon.png"}

IMAGE_RE = re.compile(r"<Image img=\{require\('@site/static/img/([^']+)'\)\} alt=\"(.*?)\" />")
GIF_RE = re.compile(r"!\[([^\]]*)\]\(/img/([^)]+)\)")
LINK_RE = re.compile(r"(?<!!)\[([^\]]*)\]\(([^)\s]+)\)")
IMPORT_LINE = "import Image from '@theme/IdealImage';"
FENCE_RE = re.compile(r"^\s*(```|~~~)")


def kebab(name: str) -> str:
    if name in OVERRIDES:
        return OVERRIDES[name]
    base, ext = os.path.splitext(name)
    base = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1-\2", base)
    base = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", base)
    base = re.sub(r"[_ ]+", "-", base).lower()
    return base + ext.lower()


def fail(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


def check_source() -> None:
    if not SOURCE_REPO.is_dir():
        fail(f"source clone missing: {SOURCE_REPO}", 2)
    r = subprocess.run(["git", "-C", str(SOURCE_REPO), "rev-parse", "--verify", f"{SOURCE_SHA}^{{commit}}"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        fail(f"commit {SOURCE_SHA} not found in {SOURCE_REPO}", 2)


def extract(tmp: pathlib.Path) -> None:
    p = subprocess.run(["git", "-C", str(SOURCE_REPO), "archive", SOURCE_SHA, "docs", "static/img"],
                       capture_output=True, check=True)
    with tarfile.open(fileobj=io.BytesIO(p.stdout), mode="r|") as tf:
        for m in tf:
            parts = pathlib.PurePosixPath(m.name).parts
            if m.name.startswith("/") or ".." in parts or m.issym() or m.islnk():
                fail(f"unsafe tar member rejected: {m.name}")
            if m.isdir():
                (tmp / m.name).mkdir(parents=True, exist_ok=True)
            elif m.isfile():
                dest = tmp / m.name
                dest.parent.mkdir(parents=True, exist_ok=True)
                f = tf.extractfile(m)
                assert f is not None
                dest.write_bytes(f.read())
            else:
                fail(f"unsupported tar member type: {m.name}")


def old_pages(tmp: pathlib.Path):
    """Yield (old_rel, new_rel) for the 26 pages; paths relative to docs/ and docs/docs/dwc/."""
    docs = tmp / "docs"
    for p in sorted(docs.rglob("*.md")):
        rel = p.relative_to(docs).as_posix()
        if rel == "index.md":
            continue
        if "/" not in rel:
            yield rel, rel[:-3] + ".mdx"
        else:
            yield rel, rel


def route_of(new_rel: str) -> str:
    parts = [re.sub(r"^\d+-", "", s) for s in new_rel.split("/")]
    last = parts[-1]
    last = re.sub(r"\.mdx?$", "", last)
    parts[-1] = last
    if last == "index":
        parts = parts[:-1]
    return "/".join(parts)


def main() -> None:
    check_source()
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="dwc-reloc-"))
    try:
        extract(tmp)
        pages = list(old_pages(tmp))
        routes = {route_of(new): new for _, new in pages}

        # (1) clean the target (never 00-overview.mdx)
        stub = DST / "01-first-chapter"
        if stub.exists():
            subprocess.run(["git", "-C", str(ROOT), "rm", "-r", "-q", "--ignore-unmatch", "-f", str(stub)], check=False)
            shutil.rmtree(stub, ignore_errors=True)
        for d in list(DST.glob("[0-1][0-9]-*")):
            if d.is_dir():
                shutil.rmtree(d)
        for n in TOP:
            for ext in (".mdx", ".md"):
                (DST / (n + ext)).unlink(missing_ok=True)
        if PARK.exists():
            shutil.rmtree(PARK)
        PARK.mkdir(parents=True)

        counts = dict(links=0, tags=0, gifs=0, imports=0)
        refs: dict[str, tuple[str, str]] = {}  # old image name -> (page new_rel, kebab)
        used_kebab: dict[str, str] = {}
        unresolved: list[str] = []

        for old_rel, new_rel in pages:
            text = (tmp / "docs" / old_rel).read_text(encoding="utf-8")
            out: list[str] = []
            in_fence = False
            for line in text.split("\n"):
                if FENCE_RE.match(line):
                    in_fence = not in_fence
                    out.append(line)
                    continue
                if in_fence:
                    out.append(line)
                    continue
                if line.strip() == IMPORT_LINE:
                    counts["imports"] += 1
                    # drop adjacent blank line: skip this line, and drop one following blank (handled below)
                    out.append("\0IMPORT")
                    continue

                def img_sub(m, new_rel=new_rel):
                    name, alt = m.group(1), m.group(2)
                    k = kebab(name)
                    register(name, k, new_rel)
                    counts["tags"] += 1
                    return f"![{alt}](./img/{k})"

                def gif_sub(m, new_rel=new_rel):
                    alt, name = m.group(1), m.group(2)
                    k = kebab(name)
                    register(name, k, new_rel)
                    counts["gifs"] += 1
                    return f"![{alt}](./img/{k})"

                def register(name, k, page):
                    if name in refs and refs[name][0] != page:
                        fail(f"image {name} referenced from two pages")
                    if name in refs:
                        return
                    if k in used_kebab and used_kebab[k] != name:
                        fail(f"kebab collision: {k}")
                    used_kebab[k] = name
                    refs[name] = (page, k)

                line = IMAGE_RE.sub(img_sub, line)
                line = GIF_RE.sub(gif_sub, line)

                def link_sub(m, new_rel=new_rel):
                    label, target = m.group(1), m.group(2)
                    if re.match(r"^(https?:|mailto:|#)", target) or target.startswith("./img/"):
                        return m.group(0)
                    path, _, frag = target.partition("#")
                    key = path
                    if key.startswith("./"):
                        key = key[2:]
                    key = key.strip("/")
                    if key not in routes:
                        unresolved.append(f"{new_rel}: {target}")
                        return m.group(0)
                    dest = routes[key]
                    rel = os.path.relpath(dest, os.path.dirname(new_rel) or ".")
                    rel = "./" + rel if not rel.startswith(".") else rel
                    counts["links"] += 1
                    return f"[{label}]({rel}{'#' + frag if frag else ''})"

                line = LINK_RE.sub(link_sub, line)
                out.append(line)

            # remove import marker plus at most one resulting double blank line
            final: list[str] = []
            for i, l in enumerate(out):
                if l == "\0IMPORT":
                    if final and final[-1] == "" and i + 1 < len(out) and out[i + 1] == "":
                        out[i + 1] = "\0SKIP"
                    continue
                if l == "\0SKIP":
                    continue
                final.append(l)
            body = "\n".join(final)

            stem = pathlib.PurePosixPath(new_rel).stem
            if "/" not in new_rel and stem in TOP:
                pos = TOP[stem]
                if re.search(r"^sidebar_position:.*$", body, re.M):
                    body = re.sub(r"^sidebar_position:.*$", f"sidebar_position: {pos}", body, count=1, flags=re.M)
                elif body.startswith("---\n"):
                    body = body.replace("---\n", f"---\nsidebar_position: {pos}\n", 1)
                else:
                    fail(f"no front matter in {new_rel}")
            dest = DST / new_rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(body, encoding="utf-8")

        if unresolved:
            fail("unresolved links:\n  " + "\n  ".join(unresolved))

        # (4) category files
        for folder, label in LABELS.items():
            pos = int(folder[:2])
            slug = folder[3:]
            cat = DST / folder / "_category_.json"
            cat.parent.mkdir(parents=True, exist_ok=True)
            cat.write_text(
                "{\n"
                f'  "label": {json.dumps(label)},\n'
                f'  "position": {pos},\n'
                f'  "link": {{"type": "doc", "id": "dwc/{slug}/index"}}\n'
                "}\n",
                encoding="utf-8",
            )

        # (5) images and map
        entries = []
        moved = parked = notmoved = 0
        src_img = tmp / "static" / "img"
        for f in sorted(src_img.iterdir()):
            name = f.name
            old = f"static/img/{name}"
            stem = f.stem
            if name in SITE_ASSETS:
                entries.append({"old": old, "new": None, "verdict": "not-moved", "page": None})
                notmoved += 1
            elif stem in PARKED_STEMS:
                k = kebab(name)
                shutil.copyfile(f, PARK / k)
                entries.append({"old": old, "new": f"tools/data/dwc-unused-img/{k}", "verdict": "parked", "page": None})
                parked += 1
            elif name in refs:
                page, k = refs[name]
                chapter = pathlib.PurePosixPath(page).parent.as_posix()
                d = DST / chapter / "img"
                d.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(f, d / k)
                entries.append({"old": old, "new": f"docs/docs/dwc/{chapter}/img/{k}", "verdict": "moved",
                                "page": f"docs/docs/dwc/{page}"})
                moved += 1
            else:
                fail(f"image without verdict: {name}")
        missing = set(refs) - {f.name for f in src_img.iterdir()}
        if missing:
            fail(f"referenced images missing from source: {sorted(missing)}")
        entries.sort(key=lambda e: e["old"])
        MAP_FILE.write_text(json.dumps(entries, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        print(f"pages={len(pages)} images_moved={moved} parked={parked} not_moved={notmoved} "
              f"links_rewritten={counts['links']} image_tags={counts['tags']} gifs={counts['gifs']} "
              f"imports_removed={counts['imports']}")
        want = dict(pages=26, moved=48, parked=12, notmoved=6, tags=44, gifs=4)
        got = dict(pages=len(pages), moved=moved, parked=parked, notmoved=notmoved,
                   tags=counts["tags"], gifs=counts["gifs"])
        if want != got:
            fail(f"count mismatch: want {want} got {got}")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
