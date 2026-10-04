#!/usr/bin/env python3
"""One-off pre-fill for the Phase 6 DWC gap audit (CONTEXT D-02, D-12, D-16).

Run with the repo venv (needs bs4, markdownify, lxml):

    /Users/beff/_workspace/BBjCourses/.venv/bin/python dwc_gap_prefill.py units
    ... exercises
    ... screenshots --json PATH

Reads the unpacked Moodle course-4 backup (local, gitignored) and writes drafts
under <out> (default: import/work, gitignored). Nothing is written into docs/
or tools/. The only repo file it may write is the --json path given to
`screenshots`, and a snippet file for assign 73. tools/moodle2docusaurus.py is
imported read-only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET

REPO = pathlib.Path(__file__).resolve().parents[4]
sys.path.insert(0, str(REPO / "tools"))

from bs4 import BeautifulSoup, NavigableString, Tag  # noqa: E402

import moodle2docusaurus  # noqa: E402  (read-only helper import)
from moodle2docusaurus import Ctx, Report, code_text, convert, lang_of  # noqa: E402

DEFAULT_BACKUP = pathlib.Path("/Users/beff/_workspace/BBjCourses/import/unpacked/dwc")
DEFAULT_OUT = pathlib.Path("/Users/beff/_workspace/BBjCourses/import/work")
SNIPPET = pathlib.Path(__file__).resolve().parents[1] / "snippets" / "EX73-01.bbj"

# (NN, code, module, chapter id or None, [DWC targets relative to docs/docs/dwc/], section summary number)
UNITS = [
    ("01", "0P", "book_56", 35, ["prerequisites.mdx"], None),
    ("02", "0R", "page_57", None, ["resources.mdx"], None),
    ("03", "1A", "page_58", None, ["01-gui-to-bui-to-dwc/01-registering-launching.md", "01-gui-to-bui-to-dwc/index.md"], 1),
    ("04", "1B", "page_59", None, ["01-gui-to-bui-to-dwc/02-hello-world.md"], None),
    ("05", "1C", "page_60", None, ["01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md"], None),
    ("06", "2A", "page_116", None, ["02-browser-developer-tools/01-intro-to-css.md", "02-browser-developer-tools/index.md"], 2),
    ("07", "2B", "page_62", None, ["02-browser-developer-tools/02-developer-tools.md"], None),
    ("08", "2C", "page_63", None, ["02-browser-developer-tools/03-css-custom-properties.md"], None),
    ("09", "2D", "page_64", None, ["02-browser-developer-tools/04-dwc-themes.md"], None),
    ("10", "3A", "page_66", None, ["04-upgrading-apps/01-arc-files.md", "04-upgrading-apps/index.md"], 3),
    ("11", "3B1", "book_67", 36, ["04-upgrading-apps/02-upgrading-grids.md"], None),
    ("12", "3B2", "book_67", 37, ["04-upgrading-apps/02-upgrading-grids.md"], None),
    ("13", "3B3", "book_67", 38, ["04-upgrading-apps/02-upgrading-grids.md"], None),
    ("14", "3B4", "book_67", 39, ["04-upgrading-apps/02-upgrading-grids.md"], None),
    ("15", "4A", "page_69", None, ["05-dwc-controls/index.md"], None),
    ("16", "5A", "page_71", None, ["06-flow-layouts/index.md"], None),
    ("17", "6A", "page_74", None, ["07-icon-pools/index.md"], None),
    ("18", "7A", "page_76", None, ["08-control-validation/index.md"], None),
    ("19", "8A", "page_78", None, ["09-browser-constraints/index.md"], None),
    ("20", "8B", "page_79", None, ["09-browser-constraints/index.md"], None),
    ("21", "9A", "page_80", None, ["10-embedding-components/index.md"], None),
    ("22", "9B", "page_81", None, ["10-embedding-components/index.md"], None),
    ("23", "9C", "page_82", None, ["10-embedding-components/index.md"], None),
    ("24", "10A", "page_117", None, ["11-advanced-responsive/01-media-queries.md"], None),
    ("25", "10B", "page_120", None, ["11-advanced-responsive/02-transitions.md"], None),
]

ASSIGNS = [61, 65, 68, 70, 72, 73, 75, 77, 83, 122, 123]

BLOCKS = {"p", "li", "ul", "ol", "div", "tr", "table", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6"}


# ------------------------------------------------------------------ helpers

def sha1_file(p: pathlib.Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()


def xt(el: ET.Element | None) -> str:
    return (el.text or "") if el is not None else ""


class Files:
    """files.xml index."""

    def __init__(self, backup: pathlib.Path) -> None:
        self.backup = backup
        self.rows: list[dict] = []
        root = ET.parse(backup / "files.xml").getroot()
        for f in root.findall("file"):
            fn = xt(f.find("filename"))
            if fn == ".":
                continue
            self.rows.append({
                "hash": xt(f.find("contenthash")), "name": fn, "component": xt(f.find("component")),
                "area": xt(f.find("filearea")), "itemid": xt(f.find("itemid")),
                "ctx": xt(f.find("contextid")), "mime": xt(f.find("mimetype")),
            })
        self.names_by_hash: dict[str, list[str]] = {}
        for r in self.rows:
            self.names_by_hash.setdefault(r["hash"], []).append(r["name"])

    def blob(self, h: str) -> pathlib.Path:
        return self.backup / "files" / h[:2] / h

    def has_2022(self, h: str) -> bool:
        return any("2022" in n for n in self.names_by_hash.get(h, []))

    def resolve(self, ctxid: str, filename: str) -> tuple[str | None, str]:
        """Return (hash or None, note). Order: same context, course/section, any context."""
        for pred, label in (
            (lambda r: r["ctx"] == ctxid, "ctx"),
            (lambda r: r["component"] == "course" and r["area"] == "section", "section"),
            (lambda r: True, "any"),
        ):
            cands = [r for r in self.rows if r["name"] == filename and pred(r)]
            if cands:
                hashes = {r["hash"] for r in cands}
                note = label if len(hashes) == 1 else f"{label}, ambiguous ({len(hashes)} hashes)"
                return sorted(hashes)[0], note
        return None, "not in backup"


def local_images() -> tuple[dict[str, str], dict[str, str]]:
    """(hash -> docs/docs/dwc path, hash -> tools/data/dwc-unused-img/file)."""
    dwc: dict[str, str] = {}
    parked: dict[str, str] = {}
    for p in sorted((REPO / "docs/docs/dwc").glob("*/img/*")):
        if p.is_file():
            dwc.setdefault(sha1_file(p), p.relative_to(REPO).as_posix())
    d = REPO / "tools/data/dwc-unused-img"
    if d.is_dir():
        for p in sorted(d.iterdir()):
            if p.is_file():
                parked.setdefault(sha1_file(p), p.name)
    return dwc, parked


def norm_ws(s: str) -> str:
    s = s.replace("\xa0", " ")
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in s.split("\n")]
    out = "\n".join(ln for ln in lines if ln)
    return out.strip()


def words(html: str) -> int:
    return len(BeautifulSoup(html, "lxml").get_text(" ").split())


def wc_w(p: pathlib.Path) -> int:
    return len(p.read_text(encoding="utf-8").split()) if p.exists() else -1


# ------------------------------------------------------------------ HTML walker

def bold_only(p: Tag) -> bool:
    txt = re.sub(r"\s+", "", p.get_text())
    if not txt or len(txt) > 160:
        return False
    bold = "".join(re.sub(r"\s+", "", b.get_text()) for b in p.find_all(["strong", "b"]) if not b.find_parent(["strong", "b"]))
    return bold == txt


class Walker:
    def __init__(self) -> None:
        self.items: list[dict] = []
        self.heading = ""
        self.buf: list[str] = []
        self.media: list[dict] = []

    def flush(self) -> None:
        text = norm_ws("".join(self.buf))
        if text:
            self.items.append({"type": "paragraph", "heading": self.heading, "text": text})
        self.items.extend(self.media)
        self.buf, self.media = [], []

    def walk(self, node) -> None:
        if isinstance(node, NavigableString):
            self.buf.append(str(node))
            return
        if not isinstance(node, Tag):
            return
        n = node.name
        if n == "pre":
            self.flush()
            txt = code_text(node)
            self.items.append({"type": "code", "lang": lang_of(txt) or "text", "text": txt})
            return
        if n in ("h2", "h3", "h4", "h5") or (n == "p" and bold_only(node)):
            self.flush()
            self.heading = norm_ws(node.get_text(" "))
            for c in list(node.children):  # keep images and links that sit inside a heading
                if isinstance(c, Tag) and (c.name in ("img", "a") or c.find(["img", "a"])):
                    saved, self.buf = self.buf, []
                    self.walk(c)
                    self.buf = saved
            return
        if n == "img":
            self.media.append({"type": "image", "src": node.get("src", "")})
            return
        if n == "br":
            self.buf.append("\n")
            return
        if n == "a":
            href = node.get("href", "")
            if href and not href.startswith("#") and "@@PLUGINFILE@@" not in href:
                self.media.append({"type": "link", "url": href, "anchor": norm_ws(node.get_text(" "))})
            elif "@@PLUGINFILE@@" in href:
                self.media.append({"type": "pluginfile", "src": href})
        if n in BLOCKS:
            self.buf.append("\n")
        for c in list(node.children):
            self.walk(c)
        if n in BLOCKS:
            self.buf.append("\n")


def plugin_name(src: str) -> str:
    """File name of an image or file reference: @@PLUGINFILE@@/x, a pluginfile.php URL, or any URL."""
    s = src.split("@@PLUGINFILE@@/", 1)[-1]
    s = s.split("?", 1)[0].split("#", 1)[0]
    if re.match(r"^https?://", s):
        s = s.rsplit("/", 1)[-1]
    return urllib.parse.unquote(s)


# ------------------------------------------------------------------ units

def load_unit_html(backup: pathlib.Path, module: str, chapter: int | None) -> tuple[str, str, str, str]:
    """(name, chapter title, html, contextid)."""
    d = backup / "activities" / module
    root = ET.parse(d / f"{module.split('_')[0]}.xml").getroot()
    ctxid = root.get("contextid", "")
    if module.startswith("page_"):
        pg = root.find("page")
        return xt(pg.find("name")), "", xt(pg.find("content")), ctxid
    bk = root.find("book")
    for ch in bk.find("chapters").findall("chapter"):
        if int(ch.get("id")) == chapter:
            return xt(bk.find("name")), xt(ch.find("title")), xt(ch.find("content")), ctxid
    raise SystemExit(f"chapter {chapter} not found in {module}")


def section_summary(backup: pathlib.Path, number: int) -> str:
    for p in sorted((backup / "sections").glob("section_*/section.xml")):
        r = ET.parse(p).getroot()
        if xt(r.find("number")) == str(number):
            return xt(r.find("summary"))
    return ""


def cmd_units(a) -> None:
    backup, out = pathlib.Path(a.backup), pathlib.Path(a.out)
    files = Files(backup)
    dwc_hash, parked_hash = local_images()
    ddir = out / "dwc-gap-drafts"
    ddir.mkdir(parents=True, exist_ok=True)
    tsv = ["path\tsha1\tmoodle_names\thas_2022"]
    for h, pth in sorted(dwc_hash.items(), key=lambda kv: kv[1]):
        tsv.append(f"{pth}\t{h}\t{' | '.join(sorted(set(files.names_by_hash.get(h, []))))}\t{int(files.has_2022(h))}")
    for h, nm in sorted(parked_hash.items(), key=lambda kv: kv[1]):
        tsv.append(f"tools/data/dwc-unused-img/{nm}\t{h}\t{' | '.join(sorted(set(files.names_by_hash.get(h, []))))}\t{int(files.has_2022(h))}")
    (ddir / "images.tsv").write_text("\n".join(tsv) + "\n", encoding="utf-8")

    for nn, code, module, chap, targets, secno in UNITS:
        name, ctitle, html, ctxid = load_unit_html(backup, module, chap)
        w = Walker()
        w.walk((BeautifulSoup(html, "lxml").body))
        w.flush()
        items = list(w.items)
        # attachments: non-image files in the module context content area
        referenced = {plugin_name(i["src"]) for i in items if i["type"] in ("pluginfile", "image")}
        att_seen: set[str] = set()
        for r in files.rows:
            if r["ctx"] == ctxid and r["area"] == "content" and not r["mime"].startswith("image/") and r["name"] not in att_seen:
                att_seen.add(r["name"])
                items.append({"type": "attachment", "name": r["name"], "hash": r["hash"]})
        summ = section_summary(backup, secno) if secno else ""

        counts = dict(pre=0, covered=0, parked=0, new=0, unresolved=0)
        lines = [f"# Unit {code} (draft, local only)", "",
                 f"- Unit: {code}", f"- Module: {module}" + (f", chapter {chap}" if chap else ""),
                 f"- Moodle name: {name}" + (f" / chapter title: {ctitle}" if ctitle else ""),
                 f"- Moodle words: {words(html)}"]
        for t in targets:
            lines.append(f"- DWC target: docs/docs/dwc/{t} ({wc_w(REPO / 'docs/docs/dwc' / t)} words)")
        lines += ["", "Items in Moodle order. Numbering is `<code>-NN`.", ""]
        k = 0

        def nxt() -> str:
            nonlocal k
            k += 1
            return f"{code}-{k:02d}"

        if summ:
            lines += [f"## {nxt()} summary (section {secno} summary)", "", norm_ws(BeautifulSoup(summ, "lxml").get_text("\n")), ""]
        for it in items:
            t = it["type"]
            if t == "paragraph":
                head = f"**{it['heading']}** " if it["heading"] else ""
                lines += [f"## {nxt()} paragraph", "", f"Sub-heading: {it['heading'] or '(none)'}", "", it["text"], ""]
                del head
            elif t == "code":
                counts["pre"] += 1
                lines += [f"## {nxt()} code ({it['lang']})", "", "```" + (it["lang"] if it["lang"] != "text" else ""), it["text"], "```", ""]
            elif t == "image":
                fn = plugin_name(it["src"])
                h, note = files.resolve(ctxid, fn)
                if h is None:
                    status = "unresolved"
                elif h in dwc_hash:
                    status = f"covered: {dwc_hash[h]}"
                elif h in parked_hash:
                    status = f"parked: {parked_hash[h]}"
                else:
                    status = "new"
                counts[status.split(":")[0]] += 1
                lines += [f"## {nxt()} screenshot", "", f"- Moodle file: {fn}", f"- SHA-1: {h or '-'}",
                          f"- Status: {status}", f"- Resolver: {note}",
                          f"- 2022 flag: {'yes' if h and files.has_2022(h) else 'no'}",
                          f"- Blob (view with Read): {files.blob(h) if h else '-'}", ""]
            elif t == "link":
                lines += [f"## {nxt()} link", "", f"- URL: {it['url']}", f"- Anchor text: {it['anchor']}", ""]
            elif t == "pluginfile":
                pass  # reported as attachment below
            elif t == "attachment":
                lines += [f"## {nxt()} attachment", "", f"- Moodle file: {it['name']}", f"- SHA-1: {it['hash']}", ""]
        out_path = ddir / f"{nn}-{code}.md"
        out_path.write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")
        print(f"{nn} {code:4s} items={k:3d} pre={counts['pre']:2d} images: covered={counts['covered']} "
              f"parked={counts['parked']} new={counts['new']} unresolved={counts['unresolved']}")


# ------------------------------------------------------------------ exercises

def cmd_exercises(a) -> None:
    backup, out = pathlib.Path(a.backup), pathlib.Path(a.out)
    edir = out / "dwc-exercise-drafts"
    edir.mkdir(parents=True, exist_ok=True)
    for n in ASSIGNS:
        root = ET.parse(backup / "activities" / f"assign_{n}" / "assign.xml").getroot()
        asg = root.find("assign")
        name, intro = xt(asg.find("name")), xt(asg.find("intro"))
        ctx = Ctx(f"a{n}", Report(), {}, {}, None, {}, False)
        md = convert(intro, f"a{n}", ctx)
        soup = BeautifulSoup(intro, "lxml")
        lines = [f"# assign_{n}: {name}", "", "## Converted intro", "", md, ""]
        pres = soup.find_all("pre")
        for i, pre in enumerate(pres, 1):
            lines += [f"## PRE {i}", "", "```", code_text(pre), "```", ""]
            if n == 73 and i == 1:
                SNIPPET.parent.mkdir(parents=True, exist_ok=True)
                SNIPPET.write_text(code_text(pre).strip("\n") + "\n", encoding="utf-8", newline="\n")
        lines += ["## Links", ""]
        for al in soup.find_all("a", href=True):
            lines.append(f"- {al['href']}  ({norm_ws(al.get_text(' '))})")
        (edir / f"assign_{n}.md").write_text("\n".join(lines).rstrip("\n") + "\n", encoding="utf-8")
        print(f"assign_{n}: pre={len(pres)} words={words(intro)}")


# ------------------------------------------------------------------ screenshots

def cmd_screenshots(a) -> None:
    files = Files(pathlib.Path(a.backup))
    res = []
    for p in sorted((REPO / "docs/docs/dwc").glob("*/img/*")):
        if not p.is_file():
            continue
        h = sha1_file(p)
        names = sorted(n for n in files.names_by_hash.get(h, []) if "2022" in n)
        if names:
            res.append({"dwc_path": p.relative_to(REPO).as_posix(), "moodle_name": names[0], "sha1": h})
    res.sort(key=lambda e: e["dwc_path"])
    pathlib.Path(a.json).write_text(json.dumps(res, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(res)} entries -> {a.json}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--backup", default=str(DEFAULT_BACKUP))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("units", help="25 unit drafts and images.tsv").set_defaults(fn=cmd_units)
    sub.add_parser("exercises", help="11 assignment drafts and the assign 73 snippet").set_defaults(fn=cmd_exercises)
    sp = sub.add_parser("screenshots", help="regenerate the 2022 screenshot list")
    sp.add_argument("--json", required=True)
    sp.set_defaults(fn=cmd_screenshots)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
