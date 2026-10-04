#!/usr/bin/env python3
"""Phase 6 checker: exercises, indexes and the Moodle gap audit of the DWC book.

Usage:
    python3 tools/check-dwc-phase6.py <command> [--root DIR] [--build DIR]
    python3 tools/check-dwc-phase6.py audit [--fragment PATH [PATH ...]]
    python3 tools/check-dwc-phase6.py kept [--units 1A,1B] [--allow-parked]

Commands:
    exercises    the 11 DWC exercise pages (EXER-02, D-01, D-03, D-08 a-d)
    pointers     exercise pointers in the chapter pages (D-04)
    indexes      exercises.mdx of both books and the overview links (EXER-03, D-09)
    solutions    inline solutions against docs/examples/dwc (EXER-04, D-06, D-07)
    audit        tools/data/dwc-gap-audit.md against 06-AUDIT-FORMAT.md (AUDIT-01)
    kept         kept course-4 material: anchors, image map, orphans (AUDIT-02)
    screenshots  2022 screenshot list and markers (AUDIT-03, D-16, D-17)
    commits      order of the D-18 content commits
    all          every command above

Output: "FAIL <msg>" per failure, "SKIP <msg>" per skipped part and
"<name>: N checks, M failed" per command.
Exit: 0 pass, 1 failure, 2 missing required input (build dir, audit file, JSON).
Python 3 standard library only; git is only read.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import zipfile

REPO = pathlib.Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------ fixed data
# D-01: page (relative to docs/docs/dwc) -> Moodle assignment id
EXERCISES = {
    "01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx": 61,
    "02-browser-developer-tools/90-exercise-theming-support.mdx": 65,
    "04-upgrading-apps/90-exercise-bbjgridexwidget.mdx": 68,
    "05-dwc-controls/90-exercise-search-bbjtree.mdx": 70,
    "06-flow-layouts/90-exercise-css-grid-layout.mdx": 72,
    "06-flow-layouts/91-exercise-css-flexbox.mdx": 73,
    "07-icon-pools/90-exercise-icon-static-text.mdx": 75,
    "08-control-validation/90-exercise-email-validation.mdx": 77,
    "10-embedding-components/90-exercise-embed-component.mdx": 83,
    "11-advanced-responsive/90-exercise-media-queries.mdx": 122,
    "11-advanced-responsive/91-exercise-button-transition.mdx": 123,
}

# D-06: page -> (solution files under docs/examples/dwc in display order, ZIP, starter file)
SOLUTIONS = {
    "01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx":
        (["01_GUI2BUI2DWC/DWC1.bbj", "01_GUI2BUI2DWC/DWC2.bbj"], "01_GUI2BUI2DWC.zip", "GUISample.bbj"),
    "05-dwc-controls/90-exercise-search-bbjtree.mdx":
        (["04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj"], "04_ExtendedAttributes.zip",
         "Exercise-SearchBBjTree.bbj"),
    "06-flow-layouts/90-exercise-css-grid-layout.mdx":
        (["05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj"], "05_CssLayouts.zip",
         "Exercise-ConvertToCssLayout.bbj"),
    "06-flow-layouts/91-exercise-css-flexbox.mdx":
        (["05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj"], "05_CssLayouts.zip",
         "Exercise-ConvertToCssFlexbox.bbj"),
    "07-icon-pools/90-exercise-icon-static-text.mdx":
        (["06_IconPools/Exercise-IconPoolsComplete.bbj"], "06_IconPools.zip", "Exercise-IconPools.bbj"),
    "08-control-validation/90-exercise-email-validation.mdx":
        (["07_ControlValiation/Exercise-BuiltInValidationComplete.bbj"], "07_ControlValiation.zip",
         "Exercise-BuiltInValidation.bbj"),
}

# D-02: the line every solution page carries between the front matter and the exercise box
POINTER_LINE = "A possible solution is at the end of this page."
# D-16: fence language per solution file extension
FENCE_LANG_BY_EXT = {".bbj": "bbj", ".css": "css"}

# D-04: file -> (exact heading line, required link targets inside that H2 section)
POINTERS = {
    "08-control-validation/index.md":
        ("## Exercise: Adding Validation to an Email Field", ["./90-exercise-email-validation.mdx"]),
    "10-embedding-components/index.md":
        ("## Exercise: Embed a Third-Party Component {#exercise-embed-a-3rd-party-component}",
         ["./90-exercise-embed-component.mdx"]),
    "11-advanced-responsive/01-media-queries.md":
        ("## Exercise: Media Queries", ["./90-exercise-media-queries.mdx"]),
    "11-advanced-responsive/02-transitions.md":
        ("## Exercise: Transition on Button", ["./91-exercise-button-transition.mdx"]),
    "11-advanced-responsive/index.md":
        ("## Exercises", ["./90-exercise-media-queries.mdx", "./91-exercise-button-transition.mdx"]),
}

# (book, page map) pairs checked by `solutions`; extended with the intro-bbj book further down
SOLUTION_BOOKS = [("dwc", SOLUTIONS)]

INTRO_EXERCISES = [
    "01-getting-started/90-exercise-tic-tac-toe.mdx",
    "01-getting-started/91-exercise-computer-player.mdx",
    "02-object-oriented-syntax/90-exercise-login-dialog.mdx",
    "02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx",
    "03-web-development/90-exercise-responsive-login-dialog.mdx",
]

# 12 parked images: file name -> (SHA-1 prefix, unit code)
PARKED = {
    "css-grid-playground-2.png": ("85ee968b", "5A"),
    "css-grid-playground-3.png": ("c73eee12", "5A"),
    "css-layout-samples-5.png": ("e614abad", "5A"),
    "css-layout-samples-6.png": ("6bd73580", "5A"),
    "hello-bbj-dwc-grid.png": ("2ce434e1", "5A"),
    "responsive-demo.png": ("8ce7ce0f", "5A"),
    "dev-tools-screenshot-1.png": ("0c93f9d6", "2B"),
    "dev-tools-screenshot-2.png": ("2ba367e1", "2B"),
    "dev-tools-screenshot-3.png": ("c59d3ba6", "2B"),
    "dev-tools-screenshot-4.png": ("d6db442d", "2B"),
    "hello-dwc-4a.png": ("7bcb6d08", "4A"),
    "message-box.png": ("37eade8d", "4A"),
}

MODULE_IDS = ["book_56", "page_57", "page_58", "page_59", "page_60", "page_116", "page_62", "page_63",
              "page_64", "page_66", "book_67", "page_69", "page_71", "page_74", "page_76", "page_78",
              "page_79", "page_80", "page_81", "page_82", "page_117", "page_120"]

# 25 audit units in course order: (NN, code, module, chapter or None)
UNITS = [
    ("01", "0P", "book_56", "35"), ("02", "0R", "page_57", None), ("03", "1A", "page_58", None),
    ("04", "1B", "page_59", None), ("05", "1C", "page_60", None), ("06", "2A", "page_116", None),
    ("07", "2B", "page_62", None), ("08", "2C", "page_63", None), ("09", "2D", "page_64", None),
    ("10", "3A", "page_66", None), ("11", "3B1", "book_67", "36"), ("12", "3B2", "book_67", "37"),
    ("13", "3B3", "book_67", "38"), ("14", "3B4", "book_67", "39"), ("15", "4A", "page_69", None),
    ("16", "5A", "page_71", None), ("17", "6A", "page_74", None), ("18", "7A", "page_76", None),
    ("19", "8A", "page_78", None), ("20", "8B", "page_79", None), ("21", "9A", "page_80", None),
    ("22", "9B", "page_81", None), ("23", "9C", "page_82", None), ("24", "10A", "page_117", None),
    ("25", "10B", "page_120", None),
]

MARKER = "{/* TODO: screenshot outdated? */}"
IMAGE_REF = re.compile(r"^!\[([^\]]*)\]\(\./img/([^)\s]+\.(?:png|gif|svg))\)\s*$")
KEBAB_IMG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*\.(png|gif|svg)$")
FENCE_LANGS = {"bbj", "java", "css", "html", "javascript", "bash", "json"}
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})\s*([^\s`]*)")
EM_DASH = chr(0x2014)
HEX40 = re.compile(r"^[0-9a-f]{40}$")

# D-18 commit subjects, in series order
COMMIT_RE = [
    ("audit", re.compile(r"^docs\(06-\d\d\): add DWC gap audit")),
    ("exercise pages", re.compile(r"^docs\(06-\d\d\): add DWC exercise pages")),
    ("kept", re.compile(r"^docs\(06-\d\d\): add kept course-4 material")),
    ("removal", re.compile(r"^chore\(06-\d\d\): remove parked DWC images")),
    ("markers", re.compile(r"^docs\(06-\d\d\): mark 2022 screenshots")),
    ("indexes", re.compile(r"^docs\(06-\d\d\): add exercise indexes")),
    ("verify", re.compile(r"^test\(06-\d\d\): add Phase 6 verify script")),
]

EXERCISE_BANS = [
    "DWCTraining/", "github.com/BasisHub/DWCTraining", "basis-next", "&nbsp;", "<br", "<span", "$@",
    "PLUGINFILE", "MediaQueries.bbj", "MediaQueryExample.css", "transitionToButtonCompleted.bbj",
    "<script", "<iframe", "onclick=", "javascript:",
]
EXERCISE_BANS_CI = ["moodle", "due date", "submission", "grading", "submit your"]

AUDIT_TYPES = ["summary", "paragraph", "code (bbj)", "code (css)", "code (html)", "code (javascript)",
               "code (java)", "code (json)", "code (bash)", "code (text)", "screenshot", "link", "attachment"]
META_RE = re.compile(r"^Unit: (\d{1,2}[A-Z]\d?)\. Module: ((?:page|book)_\d+)(?:, chapter (\d+))?\. "
                     r"DWC target: (.+)\.$")
TABLE_HEADER = "| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |"
TABLE_SEP = "|------|------|-----------------|-------|---------|--------|--------|"
SUMMARY_HEADER = "| Unit | Module | keep | covered | drop |"
CELL_SPLIT = re.compile(r"(?<!\\)\|")


class MissingInput(Exception):
    pass


class Ctx:
    def __init__(self, name: str) -> None:
        self.name = name
        self.checks = 0
        self.failed = 0

    def check(self, ok: bool, msg: str) -> bool:
        self.checks += 1
        if not ok:
            self.failed += 1
            print(f"FAIL {msg}")
        return ok

    def skip(self, msg: str) -> None:
        print(f"SKIP {msg}")

    def done(self) -> int:
        print(f"{self.name}: {self.checks} checks, {self.failed} failed")
        return 1 if self.failed else 0


# --------------------------------------------------------------------- helpers
def read_text(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def front_matter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    fm: dict = {}
    if not m:
        return fm
    for line in m.group(1).split("\n"):
        k = re.match(r"^([A-Za-z_]+):\s*(.*)$", line)
        if k:
            v = k.group(2).strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
                q = v[0]
                v = v[1:-1].replace(q + q, q) if q == "'" else v[1:-1].replace('\\"', '"')
            fm[k.group(1)] = v
    return fm


def split_fences(text: str):
    """Return (rows, unclosed). rows: (lineno, line, in_fence, lang_or_None, opens)."""
    out = []
    marker = None
    for n, line in enumerate(text.split("\n"), 1):
        m = FENCE_RE.match(line)
        if marker is None:
            if m:
                marker = (m.group(1)[0], len(m.group(1)))
                out.append((n, line, True, m.group(2), True))
            else:
                out.append((n, line, False, None, False))
        else:
            if m and m.group(1)[0] == marker[0] and len(m.group(1)) >= marker[1] and not m.group(2) \
                    and line.strip() == m.group(1):
                marker = None
                out.append((n, line, True, None, False))
            else:
                out.append((n, line, True, None, False))
    return out, marker is not None


def fence_blocks(text: str):
    """List of dicts: open_line (1-based), line (opening text), lang, body (list of lines)."""
    rows, _ = split_fences(text)
    blocks = []
    cur = None
    for n, line, in_f, lang, opens in rows:
        if opens:
            cur = {"open_line": n, "line": line, "lang": lang, "body": []}
            blocks.append(cur)
        elif in_f and cur is not None:
            if line.strip().startswith(("```", "~~~")) and not line.strip().strip("`~"):
                cur = None
            else:
                cur["body"].append(line)
        else:
            cur = None
    return blocks


def route_of(rel: str) -> str:
    parts = [re.sub(r"^\d+-", "", p) for p in rel.split("/")]
    parts[-1] = re.sub(r"\.mdx?$", "", parts[-1])
    if parts[-1] == "index":
        parts = parts[:-1]
    return "/".join(parts)


def built_html(build: pathlib.Path, rel: str, book: str = "dwc"):
    """Built HTML of a docs/docs/<book> source path, or None."""
    route = route_of(rel)
    base = build / "docs" / book
    cands = [base / f"{route}.html", base / route / "index.html"] if route else [base / "index.html"]
    for c in cands:
        if c.is_file():
            return c
    return None


def sha1_file(p: pathlib.Path) -> str:
    return hashlib.sha1(p.read_bytes()).hexdigest()


def book_dir(root: pathlib.Path, book: str) -> pathlib.Path:
    return root / "docs" / "docs" / book


def book_examples(root: pathlib.Path, book: str) -> pathlib.Path:
    return root / "docs" / "examples" / book


def book_static(root: pathlib.Path, book: str) -> pathlib.Path:
    return root / "docs" / "static" / "files" / book


def dwc_dir(root: pathlib.Path) -> pathlib.Path:
    return book_dir(root, "dwc")


def examples_dir(root: pathlib.Path) -> pathlib.Path:
    return book_examples(root, "dwc")


def need_dir(p: pathlib.Path, what: str) -> None:
    if not p.is_dir():
        raise MissingInput(f"missing input: {what} {p}")


def load_json_required(p: pathlib.Path):
    if not p.is_file():
        raise MissingInput(f"missing input: {p}")
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except ValueError as e:
        raise MissingInput(f"unreadable JSON: {p} ({e})")


def details_range(lines: list):
    """(start_idx, end_idx) of the <details> ... </details> lines, or None."""
    s = e = None
    for i, l in enumerate(lines):
        if l == "<details>" and s is None:
            s = i
        if l == "</details>":
            e = i
    if s is None or e is None or e < s:
        return None
    return s, e


# ------------------------------------------------------------------- exercises
def cmd_exercises(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("exercises")
    dwc = dwc_dir(root)
    need_dir(dwc, "book")
    actual = {p.relative_to(dwc).as_posix() for p in dwc.glob("*/9[0-9]-exercise-*.mdx")}
    for rel in EXERCISES:
        if rel not in actual:
            c.check(False, f"missing exercise page docs/docs/dwc/{rel}")
    for rel in sorted(actual - set(EXERCISES)):
        c.check(False, f"unexpected exercise page {rel}")
    present = [r for r in EXERCISES if r in actual]

    # starter files for the D-08 overlap scan
    starter_names = {v[2] for v in SOLUTIONS.values()}
    starter_names |= {f.name for f in examples_dir(root).rglob("Exercise-*.bbj")}
    starters = {}
    starter_text = {}
    for f in sorted(examples_dir(root).rglob("*.bbj")):
        if f.name not in starter_names or "Complete" in f.name:
            continue
        starter_text[f.name] = read_text(f)
        ls = [l.rstrip() for l in starter_text[f.name].split("\n")]
        wins = set()
        for i in range(len(ls) - 4):
            w = tuple(ls[i:i + 5])
            if all(x.strip() for x in w):
                wins.add(w)
        starters[f.name] = wins
    for name in sorted({v[2] for v in SOLUTIONS.values()}):
        c.check(name in starters, f"starter {name} not found under docs/examples/dwc")

    allowed_new = set()
    banned_old = set()
    if present:
        lm = load_json_required(root / "tools" / "data" / "dwc-exercise-link-map.json")
        for e in lm:
            if e.get("verdict") in ("kept", "replaced", "provisional"):
                allowed_new.add(e.get("new"))
            if e.get("verdict") in ("unlinked", "replaced") and e.get("old"):
                banned_old.add(e["old"])

    for rel in present:
        p = dwc / rel
        t = read_text(p)
        lines = t.split("\n")
        fm = front_matter(t)
        c.check(fm.get("title", "").startswith("Exercise: "), f"{rel}: title must start with 'Exercise: '")
        c.check(1 <= len(fm.get("description", "")) <= 160, f"{rel}: description must have 1 to 160 characters")
        if ":::exercise" in lines:
            i = lines.index(":::exercise")
            c.check(":::" in lines[i + 1:], f"{rel}: exercise block is not closed with ':::'")
        else:
            c.check(False, f"{rel}: line ':::exercise' missing")
        rows, unclosed = split_fences(t)
        c.check(not unclosed, f"{rel}: unclosed code fence")
        for n, line, in_f, lang, opens in rows:
            if not in_f and line.startswith("# "):
                c.check(False, f"{rel}:{n}: H1 heading in content")
            if opens:
                c.check(lang in FENCE_LANGS, f"{rel}:{n}: code fence without a known language ({lang!r})")
        c.check(EM_DASH not in t, f"{rel}: contains an em dash")
        for b in EXERCISE_BANS:
            c.check(b not in t, f"{rel}: contains banned text {b!r}")
        low = t.lower()
        for b in EXERCISE_BANS_CI:
            c.check(b not in low, f"{rel}: contains banned text {b!r}")
        for name in re.findall(r"pathname:///files/dwc/([^)\s\"'>]+)", t):
            c.check((root / "docs" / "static" / "files" / "dwc" / name).is_file(),
                    f"{rel}: download target docs/static/files/dwc/{name} missing")

        dr = details_range(lines)
        blocks = fence_blocks(t)
        outside = [b for b in blocks if b["lang"] == "bbj" and
                   not (dr and dr[0] < b["open_line"] - 1 < dr[1])]
        want_out = 1 if rel == "06-flow-layouts/91-exercise-css-flexbox.mdx" else 0
        c.check(len(outside) == want_out, f"{rel}: {len(outside)} bbj fences outside details, want {want_out}")

        # D-08 (a)
        sol_names = [pathlib.PurePosixPath(s).name for s in SOLUTIONS[rel][0]] if rel in SOLUTIONS else []
        for b in blocks:
            m = re.search(r'title="([^"]*)"', b["line"])
            title = m.group(1) if m else ""
            if re.fullmatch(r"Exercise-.*\.bbj", title):
                c.check("Complete" in title, f"{rel}:{b['open_line']}: starter file {title} inlined (D-08)")
            inside = dr is not None and dr[0] < b["open_line"] - 1 < dr[1]
            if inside and rel in SOLUTIONS:
                c.check(title in sol_names, f"{rel}:{b['open_line']}: fence in details has title {title!r}, "
                        f"want one of {sol_names}")
        # D-08 (b)
        keep = [l.rstrip() for i, l in enumerate(lines) if not (dr and dr[0] <= i <= dr[1])]
        for sname, wins in starters.items():
            hit = None
            for i in range(len(keep) - 4):
                w = tuple(keep[i:i + 5])
                if w in wins:
                    hit = i
                    break
            c.check(hit is None, f"{rel}: 5 or more lines copied from starter {sname} outside details (D-08)")

        # D-08 (c) and (d): page content must agree with its starter
        if rel in SOLUTIONS and SOLUTIONS[rel][2] in starter_text:
            sname = SOLUTIONS[rel][2]
            stext = starter_text[sname]
            out_text = "\n".join(keep)
            c.check(f"`{sname}`" in out_text, f"{rel}: does not name its starter `{sname}` outside details")
            for v in sorted(set(re.findall(r"`([A-Za-z_][A-Za-z0-9_]*[!$])`", out_text))):
                c.check(re.search(r"(?<![A-Za-z0-9_])" + re.escape(v), stext) is not None,
                        f"{rel}: names variable `{v}` that starter {sname} does not contain (CR-01)")
            slines = {l.strip() for l in stext.split("\n")}
            for b in outside:
                for line in b["body"].split("\n") if isinstance(b["body"], str) else b["body"]:
                    if line.strip():
                        c.check(line.strip() in slines,
                                f"{rel}:{b['open_line']}: snippet line not in starter {sname}: {line.strip()!r}")

        # URLs
        for url in re.findall(r"https?://[^\s)>\"'\]]+", t):
            url = url.rstrip(".,;:")
            c.check(url in allowed_new, f"{rel}: URL not in dwc-exercise-link-map.json (kept/replaced/"
                    f"provisional): {url}")
        for old in banned_old:
            c.check(old not in t, f"{rel}: contains retired URL {old}")
    return c.done()


# -------------------------------------------------------------------- pointers
def cmd_pointers(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("pointers")
    dwc = dwc_dir(root)
    need_dir(dwc, "book")
    for rel, (heading, targets) in POINTERS.items():
        p = dwc / rel
        if not c.check(p.is_file(), f"{rel}: file missing"):
            continue
        lines = read_text(p).split("\n")
        n = lines.count(heading)
        if not c.check(n == 1, f"{rel}: heading {heading!r} occurs {n} times, want 1"):
            continue
        i = lines.index(heading)
        j = i + 1
        while j < len(lines) and not lines[j].startswith("## "):
            j += 1
        sec = "\n".join(lines[i + 1:j])
        for tg in targets:
            c.check(f"]({tg})" in sec, f"{rel}: pointer section lacks link ]({tg})")
        c.check("DWCTraining/" not in sec, f"{rel}: pointer section contains DWCTraining/")
    return c.done()


# --------------------------------------------------------------------- indexes
def cmd_indexes(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("indexes")
    for book_name, want in (("dwc", sorted(EXERCISES)), ("intro-bbj", sorted(INTRO_EXERCISES))):
        book = root / "docs" / "docs" / book_name
        need_dir(book, "book")
        idx = book / "exercises.mdx"
        if not c.check(idx.is_file(), f"{book_name}: exercises.mdx missing"):
            continue
        t = read_text(idx)
        fm = front_matter(t)
        try:
            pos = float(fm.get("sidebar_position", "x"))
        except ValueError:
            pos = None
        c.check(pos == 0.4, f"{book_name}/exercises.mdx: sidebar_position {fm.get('sidebar_position')!r}, want 0.4")
        c.check(fm.get("title") == "Exercises", f"{book_name}/exercises.mdx: title must be 'Exercises'")
        c.check(1 <= len(fm.get("description", "")) <= 160,
                f"{book_name}/exercises.mdx: description must have 1 to 160 characters")
        targets = []
        for m in re.finditer(r"\]\((\.[^)\s#]*\.mdx)(?:#[^)]*)?\)", t):
            targets.append(m.group(1))
        norm = []
        for tg in targets:
            c.check((book / tg).is_file(), f"{book_name}/exercises.mdx: link target {tg} does not resolve")
            norm.append(re.sub(r"^\./", "", tg))
        ex_links = [n for n in norm if re.search(r"/9\d-exercise-", "/" + n)]
        c.check(sorted(set(ex_links)) == want,
                f"{book_name}/exercises.mdx: exercise links {sorted(set(ex_links))} differ from {want}")
        for n in sorted(set(ex_links)):
            c.check(ex_links.count(n) == 1, f"{book_name}/exercises.mdx: {n} linked {ex_links.count(n)} times")
        actual = sorted(p.relative_to(book).as_posix() for p in book.glob("*/9[0-9]-exercise-*.mdx"))
        c.check(actual == want, f"{book_name}: exercise files on disk differ from the expected list")
        lines = t.split("\n")
        if book_name == "dwc":
            sol_pages = set(SOLUTIONS)
            marked = [l for l in lines if "(solution included)" in l]
            c.check(len(marked) == 6, f"dwc/exercises.mdx: '(solution included)' on {len(marked)} lines, want 6")
            for l in marked:
                c.check(any(s in l for s in sol_pages), f"dwc/exercises.mdx: marker on a line without a solution "
                        f"page link: {l[:60]}")
            for l in lines:
                if any(s in l for s in sol_pages):
                    c.check("(solution included)" in l, f"dwc/exercises.mdx: solution page line lacks marker: "
                            f"{l[:60]}")
        else:
            c.check("(solution included)" not in t, "intro-bbj/exercises.mdx: contains '(solution included)'")
            c.check(not re.search(r"^!\[", t, re.M) and "![" not in t,
                    "intro-bbj/exercises.mdx: contains an image reference")
        ov = book / "00-overview.mdx"
        if c.check(ov.is_file(), f"{book_name}/00-overview.mdx missing"):
            ot = read_text(ov)
            c.check("](./exercises.mdx)" in ot, f"{book_name}/00-overview.mdx: link ](./exercises.mdx) missing")
            if book_name == "intro-bbj":
                ol = ot.split("\n")
                s = next((i for i, l in enumerate(ol) if l.startswith("<DocCardList")), None)
                if s is not None:
                    e = next((i for i in range(s, len(ol)) if "]} />" in ol[i]), s)
                    c.check("](./exercises.mdx)" not in "\n".join(ol[s:e + 1]),
                            "intro-bbj/00-overview.mdx: exercises link is inside the DocCardList block")
    return c.done()


# ------------------------------------------------------------------- solutions
def only_filter(opts) -> list:
    """--only: comma separated substrings matched against '<book>/<rel>'."""
    raw = getattr(opts, "only", None) or ""
    return [s.strip() for s in raw.split(",") if s.strip()]


def zip_entries(path: pathlib.Path):
    """dict entry name -> bytes of a ZIP file, or None when it is missing or unreadable."""
    try:
        with zipfile.ZipFile(path) as zf:
            return {n: zf.read(n) for n in zf.namelist()}
    except (OSError, zipfile.BadZipFile):
        return None


def cmd_solutions(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("solutions")
    only = only_filter(opts)
    zips: dict = {}

    def zip_of(path: pathlib.Path):
        if path not in zips:
            zips[path] = zip_entries(path)
        return zips[path]

    for book, pages in SOLUTION_BOOKS:
        bdir = book_dir(root, book)
        need_dir(bdir, "book")
        for rel, (files, zipname, starter) in pages.items():
            key = f"{book}/{rel}"
            if only and not any(o in key for o in only):
                continue
            pre = f"{key}: "
            p = bdir / rel
            if not p.is_file():
                c.check(False, f"{pre}missing exercise page docs/docs/{key}")
                continue
            t = read_text(p)
            lines = t.split("\n")
            for marker, name in (("<details>", "<details>"),
                                 ("<summary>Possible solution</summary>", "<summary>"),
                                 ("</details>", "</details>")):
                c.check(lines.count(marker) == 1, f"{pre}{name} line occurs {lines.count(marker)} times, want 1")
            # (a) pointer line, D-02
            fm_end = next((k for k in range(1, len(lines)) if lines[k] == "---"), None) \
                if lines and lines[0] == "---" else None
            first = None
            if fm_end is not None:
                first = next((k for k in range(fm_end + 1, len(lines)) if lines[k].strip()), None)
            c.check(first is not None and lines[first] == POINTER_LINE,
                    f"{pre}pointer line {POINTER_LINE!r} is not the first line after the front matter")
            c.check(lines.count(POINTER_LINE) == 1,
                    f"{pre}pointer line occurs {lines.count(POINTER_LINE)} times, want 1")
            ex_at = lines.index(":::exercise") if ":::exercise" in lines else None
            if POINTER_LINE in lines and ex_at is not None:
                c.check(lines.index(POINTER_LINE) < ex_at, f"{pre}pointer line is not before ':::exercise'")
            # (b) details block, summary and order
            close = None
            if ex_at is not None:
                close = next((k for k in range(ex_at + 1, len(lines)) if lines[k] == ":::"), None)
            c.check(close is not None, f"{pre}exercise block not closed")
            dr = details_range(lines)
            if not c.check(dr is not None, f"{pre}no <details> block"):
                continue
            s, e = dr
            if close is not None:
                c.check(close < s, f"{pre}<details> is not after the line ':::' closing the exercise block")
                sm = lines.index("<summary>Possible solution</summary>") \
                    if "<summary>Possible solution</summary>" in lines else -1
                c.check(sm > close, f"{pre}<summary> is not after the closing ':::'")
            last = next((l for l in reversed(lines) if l.strip()), "")
            c.check(last == "</details>", f"{pre}last non-blank line of the page is {last!r}, want '</details>'")
            # (c) fences in the details block against the file list, in order, D-07 and D-16
            blocks = [b for b in fence_blocks(t) if s < b["open_line"] - 1 < e]
            c.check(len(blocks) == len(files), f"{pre}{len(blocks)} fences in details, want {len(files)}")
            for b, f in zip(blocks, files):
                base = pathlib.PurePosixPath(f).name
                lang = FENCE_LANG_BY_EXT.get(pathlib.PurePosixPath(f).suffix)
                if not c.check(lang is not None, f"{pre}no fence language for {f}"):
                    continue
                want_open = f'```{lang} title="{base}"'
                c.check(b["line"] == want_open,
                        f"{pre}{b['open_line']}: fence opening is {b['line']!r}, want {want_open}")
                fp = book_examples(root, book) / f
                if not c.check(fp.is_file(), f"{pre}solution file docs/examples/{book}/{f} missing"):
                    continue
                ft = "\n".join(b["body"]).rstrip("\n")
                xt = read_text(fp).rstrip("\n")
                if ft != xt:
                    fl, xl = ft.split("\n"), xt.split("\n")
                    d = next((k for k in range(min(len(fl), len(xl))) if fl[k] != xl[k]), min(len(fl), len(xl)))
                    c.check(False, f"{pre}solution fence differs from docs/examples/{book}/{f} at fence line "
                            f"{d + 1} (page line {b['open_line'] + 1 + d})")
                else:
                    c.check(True, "")
            # (d) ZIP membership, D-04
            sdir = book_static(root, book)
            for f in files:
                folder_zip = f.split("/")[0] + ".zip"
                c.check(folder_zip == zipname, f"{pre}file {f} belongs to {folder_zip}, mapped ZIP is {zipname}")
                fp = book_examples(root, book) / f
                want = fp.read_bytes() if fp.is_file() else None
                for zpath, entry in ((sdir / folder_zip, f), (sdir / f"{book}-samples.zip", f"{book}-samples/{f}")):
                    zname = zpath.relative_to(root).as_posix()
                    ents = zip_of(zpath)
                    if not c.check(ents is not None, f"{pre}ZIP {zname} missing or unreadable"):
                        continue
                    if not c.check(entry in ents, f"{pre}ZIP {zname} lacks entry {entry}"):
                        continue
                    if want is not None:
                        c.check(ents[entry] == want, f"{pre}ZIP {zname} entry {entry} differs from the example file")
            # (e) download link and starter
            c.check(f"pathname:///files/{book}/{zipname}" in t, f"{pre}download link for {zipname} missing")
            if starter is not None:
                c.check(starter in t, f"{pre}starter file name {starter} missing")
            # (f) built HTML
            if build.is_dir():
                h = built_html(build, rel, book)
                if h is None:
                    c.check(False, f"{pre}built HTML not found under {build}")
                else:
                    ht = read_text(h)
                    c.check("Possible solution" in ht, f"{pre}built HTML lacks 'Possible solution'")
                    c.check(POINTER_LINE in ht, f"{pre}built HTML lacks the pointer line")
            else:
                c.skip(f"{pre}no build directory, built HTML not checked")
    return c.done()


# --------------------------------------------------------------------- commits
def git_out(root: pathlib.Path, args: list):
    r = subprocess.run(["git", "-C", str(root)] + args, capture_output=True, text=True)
    return r.returncode, r.stdout


def cmd_commits(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("commits")
    rc, out = git_out(root, ["log", "--format=%H%x09%s"])
    if rc != 0:
        c.skip("git log failed")
        return c.done()
    found = {name: [] for name, _ in COMMIT_RE}
    for line in out.split("\n"):
        if "\t" not in line:
            continue
        h, s = line.split("\t", 1)
        for name, rx in COMMIT_RE:
            if rx.search(s):
                found[name].append(h)
    if not found["audit"]:
        c.skip("commit series not found (squashed history?)")
        return c.done()
    for name in ("exercise pages", "kept", "removal", "markers", "indexes", "verify"):
        c.check(bool(found[name]), f"no commit for step '{name}'")

    def before(a: str, b: str) -> None:
        for x in found[a]:
            for y in found[b]:
                r, _ = git_out(root, ["merge-base", "--is-ancestor", x, y])
                c.check(r == 0, f"commit order: '{a}' {x[:7]} must precede '{b}' {y[:7]}")

    for a, b in (("audit", "exercise pages"), ("exercise pages", "kept"), ("exercise pages", "removal"),
                 ("kept", "removal"), ("removal", "markers"), ("markers", "indexes"), ("indexes", "verify")):
        before(a, b)
    return c.done()


# ----------------------------------------------------------------------- audit
def split_cells(line: str):
    s = line.strip()
    if not (s.startswith("|") and s.endswith("|")):
        return None
    parts = CELL_SPLIT.split(s)
    return [x.strip() for x in parts[1:-1]]


def parse_sections(text: str, label: str, problems: list):
    """Parse unit sections. Returns list of dicts."""
    lines = text.split("\n")
    secs = []
    for i, l in enumerate(lines):
        if not l.startswith("## ") or l.strip() == "## Summary":
            continue
        sec = {"title": l[3:], "line": i + 1, "rows": [], "label": label}
        m = META_RE.match(lines[i + 2]) if i + 2 < len(lines) else None
        if lines[i + 1:i + 2] != [""] or not m:
            problems.append(f"{label}:{i + 1}: section '{l[3:]}' lacks blank line plus metadata line")
            continue
        sec.update(code=m.group(1), module=m.group(2), chapter=m.group(3), targets=m.group(4))
        if lines[i + 3:i + 4] != [""] or lines[i + 4:i + 5] != [TABLE_HEADER] or lines[i + 5:i + 6] != [TABLE_SEP]:
            problems.append(f"{label}:{i + 1}: section {sec['code']} lacks blank line, header or separator")
            continue
        j = i + 6
        while j < len(lines) and lines[j].strip() != "" and not lines[j].startswith("#"):
            cells = split_cells(lines[j])
            if cells is None or len(cells) != 7:
                problems.append(f"{label}:{j + 1}: row is not a 7-cell table row")
            else:
                sec["rows"].append((j + 1, cells))
            j += 1
        secs.append(sec)
    return secs


def check_sections(c: Ctx, secs: list, root: pathlib.Path, full: bool) -> None:
    unit_keys = {(u[1], u[2], u[3]) for u in UNITS}
    seen = []
    for s in secs:
        key = (s["code"], s["module"], s["chapter"])
        c.check(key in unit_keys, f"{s['label']}:{s['line']}: unit {key} is not one of the 25 audit units")
        seen.append(key)
    for k in set(seen):
        c.check(seen.count(k) == 1, f"unit {k} appears {seen.count(k)} times")
    if full:
        order = [(u[1], u[2], u[3]) for u in UNITS]
        c.check(seen == order, "the 25 sections are not in course order or incomplete")
        c.check(sorted({s["module"] for s in secs}) == sorted(MODULE_IDS),
                f"module ids differ from the 22 expected ({len({s['module'] for s in secs})} found)")
    for s in secs:
        paths = re.findall(r"`([^`]+)`", s["targets"])
        c.check(bool(paths), f"{s['code']}: DWC target list has no backticked path")
        for p in paths:
            c.check((root / p).exists(), f"{s['code']}: DWC target {p} does not exist")
        n = 0
        for lineno, cells in s["rows"]:
            n += 1
            item, typ, exc, sha, verdict, target, reason = cells
            tag = f"{s['label']}:{lineno} {s['code']}"
            c.check(item == f"{s['code']}-{n:02d}", f"{tag}: Item {item!r}, want {s['code']}-{n:02d}")
            c.check(typ in AUDIT_TYPES, f"{tag}: Type {typ!r} not allowed")
            ex = exc.replace("\\|", "|")
            c.check(0 < len(ex) <= 140, f"{tag}: Excerpt length {len(ex)} not in 1..140")
            if typ in ("screenshot", "attachment"):
                if "not in backup" in reason:
                    c.check(sha == "-" or bool(HEX40.match(sha)), f"{tag}: SHA-1 {sha!r} invalid")
                else:
                    c.check(bool(HEX40.match(sha)), f"{tag}: SHA-1 must be 40 lowercase hex")
            else:
                c.check(sha == "-", f"{tag}: SHA-1 must be '-' for type {typ}")
            c.check(verdict in ("keep", "covered", "drop"), f"{tag}: Verdict {verdict!r} invalid")
            if verdict == "keep":
                m = re.fullmatch(r"`(docs/docs/dwc/[^`#]+)#([^`]+)`", target)
                c.check(bool(m), f"{tag}: keep Target must be `docs/docs/dwc/<path>#<anchor>`")
                tpath = m.group(1) if m else None
            elif verdict == "covered":
                m = re.fullmatch(r"`(docs/docs/dwc/[^`#]+)(#[^`]*)?`", target)
                c.check(bool(m), f"{tag}: covered Target must be a backticked docs/docs/dwc path")
                tpath = m.group(1) if m else None
            else:
                c.check(target == "-", f"{tag}: drop Target must be '-'")
                tpath = None
            if tpath and "new sub-page" not in reason:
                c.check((root / tpath).exists(), f"{tag}: Target file {tpath} does not exist")
            if verdict in ("keep", "drop"):
                c.check(reason not in ("", "-"), f"{tag}: Reason required for {verdict}")
            if full and typ == "code (bbj)" and verdict == "keep":
                c.check("bbj_check_syntax: pass" in reason or "bbj_check_syntax: fixed (" in reason,
                        f"{tag}: keep bbj row lacks a bbj_check_syntax result in Reason")
    # parked
    codes = {s["code"] for s in secs}
    for fname, (prefix, unit) in PARKED.items():
        if not full and unit not in codes:
            continue
        hits = []
        for s in secs:
            for lineno, cells in s["rows"]:
                if f"(parked `{fname}`)" in cells[2]:
                    hits.append((s, cells))
        if not c.check(len(hits) == 1, f"parked image {fname} appears in {len(hits)} rows, want 1"):
            continue
        s, cells = hits[0]
        c.check(s["code"] == unit, f"parked image {fname} is in unit {s['code']}, want {unit}")
        c.check(cells[3].startswith(prefix), f"parked image {fname}: SHA-1 does not start with {prefix}")


def bans_in(c: Ctx, text: str, label: str) -> None:
    c.check("import/" not in text, f"{label}: contains 'import/'")
    c.check(EM_DASH not in text, f"{label}: contains an em dash")
    c.check("/Users/" not in text, f"{label}: contains '/Users/'")


def audit_sections_from(root: pathlib.Path):
    p = root / "tools" / "data" / "dwc-gap-audit.md"
    if not p.is_file():
        raise MissingInput(f"missing input: {p}")
    text = read_text(p)
    problems: list = []
    secs = parse_sections(text, "dwc-gap-audit.md", problems)
    return text, secs, problems


def cmd_audit(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("audit")
    frags = getattr(opts, "fragment", None)
    if frags:
        secs = []
        for f in frags:
            fp = pathlib.Path(f)
            if not fp.is_absolute():
                fp = root / fp
            if not fp.is_file():
                raise MissingInput(f"missing input: {fp}")
            text = read_text(fp)
            problems: list = []
            secs += parse_sections(text, fp.name, problems)
            for pr in problems:
                c.check(False, pr)
            bans_in(c, text, fp.name)
            c.check(bool(parse_sections(text, fp.name, [])), f"{fp.name}: no unit section found")
        check_sections(c, secs, root, full=False)
        return c.done()

    text, secs, problems = audit_sections_from(root)
    for pr in problems:
        c.check(False, pr)
    lines = text.split("\n")
    c.check(bool(lines) and lines[0] == "# DWC gap audit: Moodle course 4", "H1 must be '# DWC gap audit: Moodle course 4'")
    bans_in(c, text, "dwc-gap-audit.md")
    check_sections(c, secs, root, full=True)
    c.check(len(secs) == 25, f"{len(secs)} sections, want 25")
    # summary
    try:
        si = lines.index("## Summary")
    except ValueError:
        c.check(False, "## Summary heading missing")
        return c.done()
    first = min((s["line"] for s in secs), default=len(lines) + 1)
    c.check(si + 1 < first, "## Summary must come before the first section")
    j = si + 1
    while j < len(lines) and lines[j].strip() != SUMMARY_HEADER:
        j += 1
    if not c.check(j < len(lines), f"summary table header {SUMMARY_HEADER!r} missing"):
        return c.done()
    j += 2
    rows = []
    while j < len(lines) and lines[j].startswith("|"):
        cells = split_cells(lines[j])
        if cells:
            rows.append(cells)
        j += 1
    body = [r for r in rows if r and r[0] != "Total"]
    tot = [r for r in rows if r and r[0] == "Total"]
    c.check(len(body) == len(secs), f"summary has {len(body)} unit rows, want {len(secs)}")
    sums = [0, 0, 0]
    for r, s in zip(body, secs):
        mod = s["module"] + (f", chapter {s['chapter']}" if s["chapter"] else "")
        c.check(r[0] == s["code"], f"summary row {r[0]} out of order, want {s['code']}")
        c.check(len(r) == 5 and r[1] == mod, f"summary row {s['code']}: Module {(r[1:2] or ['?'])[0]!r}, want {mod!r}")
        want = [sum(1 for _, cl in s["rows"] if cl[4] == v) for v in ("keep", "covered", "drop")]
        try:
            got = [int(x) for x in r[2:5]]
        except ValueError:
            got = None
        c.check(got == want, f"summary row {s['code']}: counts {got}, table has {want}")
        if got:
            sums = [a + b for a, b in zip(sums, got)]
    if c.check(len(tot) == 1 and tot[0][1] == "22 modules", "Total row '| Total | 22 modules |' missing"):
        try:
            got = [int(x) for x in tot[0][2:5]]
        except ValueError:
            got = None
        c.check(got == sums, f"Total row {got} differs from column sums {sums}")
    return c.done()


# ------------------------------------------------------------------------ kept
def all_pages(dwc: pathlib.Path):
    return sorted(list(dwc.rglob("*.md")) + list(dwc.rglob("*.mdx")))


def cmd_kept(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("kept")
    if not build.is_dir():
        raise MissingInput(f"missing input: build directory {build}")
    _text, secs, problems = audit_sections_from(root)
    for pr in problems:
        c.check(False, pr)
    dwc = dwc_dir(root)
    units = None
    if getattr(opts, "units", None):
        units = {u.strip() for u in opts.units.split(",") if u.strip()}
    entries = []
    mp = root / "tools" / "data" / "dwc-gap-image-map.json"
    if mp.is_file():
        entries = json.loads(mp.read_text(encoding="utf-8"))
    by_sha = {e.get("sha1") for e in entries}
    for s in secs:
        if units is not None and s["code"] not in units:
            continue
        for lineno, cells in s["rows"]:
            if cells[4] != "keep":
                continue
            m = re.fullmatch(r"`(docs/docs/dwc/[^`#]+)#([^`]+)`", cells[5])
            if not m:
                continue
            tpath, anchor = m.group(1), m.group(2)
            tag = f"{cells[0]}"
            if not c.check((root / tpath).is_file(), f"{tag}: target file {tpath} missing"):
                continue
            h = built_html(build, tpath[len("docs/docs/dwc/"):])
            if h is None:
                c.check(False, f"{tag}: built HTML for {tpath} not found")
            else:
                c.check(f'id="{anchor}"' in read_text(h), f"{tag}: anchor id {anchor!r} not in built {tpath}")
            if cells[1] == "screenshot":
                c.check(cells[3] in by_sha, f"{tag}: keep screenshot {cells[3][:8]} has no dwc-gap-image-map.json entry")
    for e in entries:
        nm = e.get("moodle_name", "?")
        path = e.get("path", "")
        fp = root / path
        c.check(re.match(r"^docs/docs/dwc/[^/]+/img/[^/]+$", path) is not None, f"{nm}: path {path} not under docs/docs/dwc/<chapter>/img/")
        c.check(bool(KEBAB_IMG.match(pathlib.PurePosixPath(path).name)), f"{nm}: file name of {path} is not kebab-case")
        if c.check(fp.is_file(), f"{nm}: {path} missing"):
            c.check(sha1_file(fp) == e.get("sha1"), f"{nm}: SHA-1 of {path} differs from the map")
        c.check(bool(str(e.get("alt", "")).strip()), f"{nm}: alt text empty")
        c.check(e.get("source") in ("moodle", "parked"), f"{nm}: source must be moodle or parked")
        pg = root / e.get("page", "")
        if c.check(pg.is_file(), f"{nm}: page {e.get('page')} missing"):
            base = pathlib.PurePosixPath(path).name
            ok = False
            for l in read_text(pg).split("\n"):
                m = IMAGE_REF.match(l)
                if m and m.group(2) == base and m.group(1).strip():
                    ok = True
            c.check(ok, f"{nm}: page {e.get('page')} has no image line with {base} and alt text")
    # orphans
    for img in sorted(dwc.rglob("img/*")):
        if not img.is_file():
            continue
        chapter = img.parent.parent
        refs = [read_text(p) for p in chapter.glob("*.md*")]
        c.check(any(f"./img/{img.name}" in r for r in refs), f"orphan image {img.relative_to(root).as_posix()}")
    for p in all_pages(dwc):
        for n, l in enumerate(read_text(p).split("\n"), 1):
            m = IMAGE_REF.match(l)
            if m:
                c.check(bool(m.group(1).strip()), f"{p.relative_to(root).as_posix()}:{n}: image without alt text")
    parked = root / "tools" / "data" / "dwc-unused-img"
    if getattr(opts, "allow_parked", False):
        c.skip("tools/data/dwc-unused-img check (--allow-parked)")
    else:
        c.check(not parked.exists(), "tools/data/dwc-unused-img still exists")
    rc, out = git_out(root, ["ls-files", "import"])
    c.check(out.strip() == "", "files under import/ are tracked")
    return c.done()


# ----------------------------------------------------------------- screenshots
def cmd_screenshots(root: pathlib.Path, build: pathlib.Path, opts) -> int:
    c = Ctx("screenshots")
    data = load_json_required(root / "tools" / "data" / "dwc-2022-screenshots.json")
    dwc = dwc_dir(root)

    def norm(p: str) -> str:
        if (root / p).exists():
            return pathlib.PurePosixPath(p).as_posix()
        return "docs/docs/dwc/" + p

    paths = [e.get("dwc_path", "") for e in data]
    c.check(paths == sorted(paths), "entries are not sorted by dwc_path")
    c.check(len(set(paths)) == len(paths), "duplicate dwc_path entries")
    c.check(len(data) >= 30, f"{len(data)} entries, want at least 30")
    listed = {}
    for e in data:
        p = norm(e.get("dwc_path", ""))
        sha = e.get("sha1", "")
        c.check(bool(HEX40.match(sha)), f"{p}: sha1 is not 40 lowercase hex")
        c.check("2022" in e.get("moodle_name", ""), f"{p}: moodle_name lacks 2022")
        fp = root / p
        if c.check(fp.is_file(), f"{p}: file missing"):
            c.check(sha1_file(fp) == sha, f"{p}: file SHA-1 differs from the list")
        listed[p] = sha
    shas = set(listed.values())
    for img in sorted(dwc.rglob("img/*")):
        if img.is_file():
            rel = img.relative_to(root).as_posix()
            if sha1_file(img) in shas:
                c.check(rel in listed, f"{rel}: has the SHA-1 of a listed image but is not listed")
    marked = 0
    for p in all_pages(dwc):
        lines = read_text(p).split("\n")
        rel = p.relative_to(root).as_posix()
        for i, l in enumerate(lines):
            m = IMAGE_REF.match(l)
            if m:
                target = (p.parent / "img" / m.group(2)).relative_to(root).as_posix()
                prev = next((lines[k] for k in range(i - 1, -1, -1) if lines[k].strip()), "")
                if target in listed:
                    marked += 1
                    c.check(prev == MARKER, f"{rel}:{i + 1}: listed image {m.group(2)} lacks the marker")
                else:
                    c.check(prev != MARKER, f"{rel}:{i + 1}: marker above unlisted image {m.group(2)}")
            if l == MARKER:
                nxt = next((lines[k] for k in range(i + 1, len(lines)) if lines[k].strip()), "")
                m2 = IMAGE_REF.match(nxt)
                ok = bool(m2) and (p.parent / "img" / m2.group(2)).relative_to(root).as_posix() in listed
                c.check(ok, f"{rel}:{i + 1}: marker not followed by an image reference to a listed file")
    print(f"screenshots: {len(listed)} listed entries, {marked} marked references")
    return c.done()


COMMANDS = [("exercises", cmd_exercises), ("pointers", cmd_pointers), ("indexes", cmd_indexes),
            ("solutions", cmd_solutions), ("audit", cmd_audit), ("kept", cmd_kept),
            ("screenshots", cmd_screenshots), ("commits", cmd_commits)]


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description="Phase 6 checker for the DWC book (exercises, gap audit)")
    ap.add_argument("command", choices=[n for n, _ in COMMANDS] + ["all"])
    ap.add_argument("--build", default="docs/build", help="Docusaurus build directory")
    ap.add_argument("--root", default=str(REPO), help="repository root")
    ap.add_argument("--fragment", nargs="+", metavar="PATH",
                    help="audit: check these fragment files instead of tools/data/dwc-gap-audit.md")
    ap.add_argument("--only", metavar="SUBSTR[,SUBSTR]",
                    help="solutions, exercises: only pages whose '<book>/<path>' contains one of these substrings")
    ap.add_argument("--units", help="kept: comma separated unit codes to check")
    ap.add_argument("--allow-parked", action="store_true",
                    help="kept: do not fail while tools/data/dwc-unused-img still exists")
    a = ap.parse_args(argv)
    root = pathlib.Path(a.root).resolve()
    build = pathlib.Path(a.build)
    if not build.is_absolute():
        build = root / build
    todo = COMMANDS if a.command == "all" else [(n, f) for n, f in COMMANDS if n == a.command]
    rc = 0
    missing = False
    for n, fn in todo:
        try:
            rc |= fn(root, build, a)
        except MissingInput as e:
            print(f"{n}: {e}", file=sys.stderr)
            missing = True
    if missing and a.command != "all":
        return 2
    return 1 if (rc or missing) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
