#!/usr/bin/env python3
"""Phase 5 checker: the Introduction to BBj book after the Moodle conversion.
Phase 6.1 added the exercises folder (nine solution files) and exercises.zip.

Usage: python3 tools/check-intro-bbj.py {structure|content|samples|commits|edits|syntax|all}
                                        [--build docs/build] [--root DIR]

One subcommand per concern:
  structure  exact file set, front matter, categories, overview cards, exercises, built routes
  content    Moodle leftovers, entities, raw HTML (outside code fences), fence languages,
             YouTube embeds, images against tools/data/intro-bbj-image-map.json
  samples    docs/examples/intro-bbj, LICENSE, ZIPs, download links
  commits    converter commit and generated-docs commit, order, reproducibility
  edits      hand-edit outcomes, link map, Vale errors
  syntax     tools/data/intro-bbj-syntax.md covers every BBj sample and fence

--root DIR is the tree whose docs/docs/intro-bbj, docs/examples/intro-bbj and
docs/static/files/intro-bbj are checked (default: the repository). Maps in
tools/data, docs/src/data/books.js and git history are always read from the repository.

Each failed assertion prints one line starting "FAIL ". Each subcommand ends with
"<subcommand>: N checks, M failed".
Exit codes: 0 pass, 1 any FAIL, 2 missing input (for example no docs/docs/intro-bbj).
"""
from __future__ import annotations

import argparse
import io
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile

REPO = pathlib.Path(__file__).resolve().parent.parent
DATA = REPO / "tools" / "data"

C1_SUBJECT = "feat(05-03): add Moodle course-2 converter and intro-bbj maps"
C2_SUBJECT = "feat(05-04): generate intro-bbj book from Moodle course-2 backup"

TOP_PAGES = {  # file -> sidebar_position
    "00-overview.mdx": 0,
    "structure.mdx": 0.1,
    "audience.mdx": 0.2,
    "contribute.mdx": 0.3,
    "exercises.mdx": 0.4,
}

# folder, label, position, slug, chapter files
SECTIONS = [
    ("01-getting-started", "Set up your environment and get started", 1, "getting-started", [
        "01-setup", "02-first-hello-world", "03-syntax-and-variables", "04-better-hello-world",
        "05-loops-and-if-statements", "06-input-field-types", "07-multiplying-calculator",
        "08-more-hints", "90-exercise-tic-tac-toe", "91-exercise-computer-player"]),
    ("02-object-oriented-syntax", "Object-oriented syntax in BBj", 2, "object-oriented-syntax", [
        "01-what-is-oop", "02-first-class", "03-reference-classes", "04-oo-dialog",
        "05-more-hints-and-docs", "90-exercise-login-dialog", "91-exercise-oo-tic-tac-toe"]),
    ("03-web-development", "Web development with BBj's DWC", 3, "web-development", [
        "01-introduction", "02-basics", "03-developing-for-the-web", "04-window-layout-mode",
        "05-css-layout-instructions", "06-css-on-controls", "07-style-attributes",
        "08-external-css-file", "90-exercise-responsive-login-dialog"]),
    ("04-theming-and-styling", "Theming and styling the BBj web components", 4, "theming-and-styling", [
        "01-shadow-dom-parts", "02-dark-theme", "03-theme-editor", "04-theming-reference"]),
]

EXERCISES = {
    "01-getting-started/90-exercise-tic-tac-toe.mdx": "Exercise: ",
    "01-getting-started/91-exercise-computer-player.mdx": "Bonus exercise: ",
    "02-object-oriented-syntax/90-exercise-login-dialog.mdx": "Exercise: ",
    "02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx": "Bonus exercise: ",
    "03-web-development/90-exercise-responsive-login-dialog.mdx": "Exercise: ",
}

YOUTUBE = {
    "Ovk8kznQfGs": "01-getting-started/01-setup.mdx",
    "fF9LaVXJGuA": "01-getting-started/02-first-hello-world.mdx",
    "DRjpwGLKzQA": "01-getting-started/03-syntax-and-variables.mdx",
    "oG1Q5wVf3u4": "01-getting-started/04-better-hello-world.mdx",
    "jxSfPOuj_nk": "01-getting-started/05-loops-and-if-statements.mdx",
    "Yyilg_zJ4wc": "02-object-oriented-syntax/02-first-class.mdx",
    "aN518WzvIOQ": "02-object-oriented-syntax/03-reference-classes.mdx",
    "z3g51m9Mc_0": "02-object-oriented-syntax/04-oo-dialog.mdx",
    "a33nWuuyX7o": "03-web-development/01-introduction.mdx",
    "9HQBN-PVHWs": "04-theming-and-styling/01-shadow-dom-parts.mdx",
}

SAMPLE_FILES = [
    "LICENSE", "README.md",
    "better-hello-world/BetterHelloWorld.bbj",
    "oo-samples/Car.bbj", "oo-samples/CarApplication.bbj", "oo-samples/MyDialog.bbj",
    "dwc-lesson-start/Sample.bbj",
    "dwc-lesson-result/Sample.bbj", "dwc-lesson-result/sample.css",
    "exercises/TicTacToe.bbj", "exercises/TicTacToeComputer.bbj",
    "exercises/LoginDialog.bbj", "exercises/ResponsiveLoginDialog.bbj",
    "exercises/responsive-login.css",
    "exercises/oo-tic-tac-toe/Board.bbj", "exercises/oo-tic-tac-toe/Player.bbj",
    "exercises/oo-tic-tac-toe/GameWindow.bbj", "exercises/oo-tic-tac-toe/PlayTicTacToe.bbj",
]
ZIPS = ["better-hello-world.zip", "oo-samples.zip", "dwc-lesson-start.zip",
        "dwc-lesson-result.zip", "exercises.zip", "intro-bbj-samples.zip"]
ZIP_LINK_PAGES = {
    "better-hello-world.zip": "01-getting-started/04-better-hello-world.mdx",
    "oo-samples.zip": "02-object-oriented-syntax/04-oo-dialog.mdx",
    "dwc-lesson-start.zip": "03-web-development/03-developing-for-the-web.mdx",
    "dwc-lesson-result.zip": "03-web-development/08-external-css-file.mdx",
}
ZIP_PREFIX = "pathname:///files/intro-bbj/"

FENCE_LANGS = {"bbj", "java", "css", "html", "javascript", "bash", "json"}
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})\s*([^\s`]*)")
EM_DASH = chr(0x2014)

WHOLE_FILE_BANS = ["PLUGINFILE", "pluginfile.php", "moodle.basis-europe", "documentation.basis.com", "view.php"]
PROSE_BANS = ["$@", "&nbsp;", "&lt;", "&gt;", "&amp;", "&#", "<br", "<iframe", "<video", "<source",
              "<span", 'role="presentation"']
YT_RE = re.compile(r'<YouTube id="([A-Za-z0-9_-]{11})" title=(?:"([^"]*)"|\'([^\']*)\'|\{"([^"]*)"\}|\{\'([^\']*)\'\})')
IMG_RE = re.compile(r"!\[([^\]]*)\]\(([^)]*)\)")
KEBAB_PNG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*\.png$")

# (text, case_sensitive)
EDIT_BANS = [
    ("basishub.github.io/basis-next", False), ("hot.bbx.kitchen", False),
    ("www.basis.com/eclipseplug-ins", False), ("bbj-training-course@basis.com", False),
    ("Files-Section", True), ("Save as", True), ("work in progress", False),
    ("temporary chapter", False), ("will be added during the session", False),
    ("September 2021", True), ("sensistivity", False), ("instrutions", False), ("previos", False),
]


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

    def done(self) -> int:
        print(f"{self.name}: {self.checks} checks, {self.failed} failed")
        return 1 if self.failed else 0


def read_text(p: pathlib.Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def load_json(p: pathlib.Path, c: Ctx, label: str):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        c.check(False, f"{label}: cannot read {p.relative_to(REPO) if p.is_relative_to(REPO) else p} ({e})")
        return None


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
    """Yield (lineno, line, in_fence, lang_or_None, opens). lang is set on opening-fence lines.
    Also returns a list of problems (unclosed fence) via the final tuple (None marker)."""
    out = []
    marker = None  # (char, length)
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


def book_mdx(book: pathlib.Path):
    return sorted(book.rglob("*.mdx"))


def expected_files() -> set:
    files = set(TOP_PAGES)
    for folder, _l, _p, _s, chapters in SECTIONS:
        files.add(f"{folder}/_category_.json")
        files.add(f"{folder}/index.mdx")
        for ch in chapters:
            files.add(f"{folder}/{ch}.mdx")
    return files


def route_of(rel: str) -> str:
    parts = [re.sub(r"^\d+-", "", p) for p in rel.split("/")]
    last = parts[-1]
    last = re.sub(r"\.mdx$", "", last)
    parts[-1] = last
    if last == "index":
        parts = parts[:-1]
    return "/".join(parts)


# ---------------------------------------------------------------- structure
def cmd_structure(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("structure")
    book = root / "docs" / "docs" / "intro-bbj"
    exp = expected_files()
    actual = set()
    for p in book.rglob("*"):
        if p.is_file():
            rel = p.relative_to(book).as_posix()
            if re.fullmatch(r"[^/]+/img/[^/]+\.png", rel):
                continue
            actual.add(rel)
    for rel in sorted(exp - actual):
        c.check(False, f"{rel}: missing")
    for rel in sorted(actual - exp):
        c.check(False, f"{rel}: unexpected file")
    c.check(len([e for e in exp if e.endswith(".mdx")]) == 39, "expected set has 39 .mdx files (contract)")

    for rel in sorted(exp & actual):
        if not rel.endswith(".mdx"):
            continue
        fm = front_matter(read_text(book / rel))
        c.check(bool(fm.get("title")), f"{rel}: front matter title missing")
        d = fm.get("description", "")
        c.check(bool(d), f"{rel}: front matter description missing")
        c.check(len(d) <= 160, f"{rel}: description longer than 160 characters ({len(d)})")

    for fname, pos in TOP_PAGES.items():
        p = book / fname
        if p.is_file():
            fm = front_matter(read_text(p))
            try:
                got = float(fm.get("sidebar_position", "x"))
            except ValueError:
                got = None
            c.check(got == pos, f"{fname}: sidebar_position {fm.get('sidebar_position')!r}, want {pos}")
    ov = book / "00-overview.mdx"
    if ov.is_file():
        t = read_text(ov)
        fm = front_matter(t)
        c.check(fm.get("title") == "Introduction to BBj Development", "00-overview.mdx: title")
        c.check(fm.get("sidebar_label") == "Overview", "00-overview.mdx: sidebar_label Overview")
        books = (REPO / "docs" / "src" / "data" / "books.js")
        desc = None
        if books.is_file():
            m = re.search(r"id:\s*'intro-bbj'.*?description:\s*'((?:[^'\\]|\\.)*)'", read_text(books), re.S)
            if m:
                desc = re.sub(r"\\(.)", r"\1", m.group(1))
        c.check(desc is not None and fm.get("description") == desc,
                "00-overview.mdx: description equals books.js intro-bbj description")
        i = t.find("<DocCardList items=")
        c.check(i >= 0, "00-overview.mdx: <DocCardList items= missing")
        if i >= 0:
            block = t[i:t.find("/>", i) + 2]
            hrefs = re.findall(r"/docs/intro-bbj/([a-z0-9-]+)", block)
            c.check(hrefs == [s[3] for s in SECTIONS],
                    f"00-overview.mdx: card hrefs {hrefs}, want section slugs in order")
        c.check(any(l.startswith("Start with [") and "](./01-getting-started/index.mdx)" in l
                    for l in t.split("\n")),
                "00-overview.mdx: line 'Start with [' linking ./01-getting-started/index.mdx missing")
    ct = book / "contribute.mdx"
    if ct.is_file():
        c.check(front_matter(read_text(ct)).get("title") == "Help improve this course",
                "contribute.mdx: title")

    for folder, label, pos, slug, _chs in SECTIONS:
        cat = book / folder / "_category_.json"
        if cat.is_file():
            try:
                j = json.loads(read_text(cat))
            except ValueError as e:
                c.check(False, f"{folder}/_category_.json: invalid JSON ({e})")
                continue
            c.check(j.get("label") == label, f"{folder}/_category_.json: label {j.get('label')!r}, want {label!r}")
            c.check(j.get("position") == pos, f"{folder}/_category_.json: position {j.get('position')!r}, want {pos}")
            want = {"type": "doc", "id": f"intro-bbj/{slug}/index"}
            c.check(j.get("link") == want, f"{folder}/_category_.json: link {j.get('link')!r}, want {want}")
        idx = book / folder / "index.mdx"
        if idx.is_file():
            c.check("<DocCardList />" in read_text(idx), f"{folder}/index.mdx: <DocCardList /> missing")

    for rel, prefix in EXERCISES.items():
        p = book / rel
        if not p.is_file():
            continue
        t = read_text(p)
        lines = t.split("\n")
        c.check(any(re.match(r"^:::exercise(\s.*)?$", l) for l in lines), f"{rel}: ':::exercise' line missing")
        c.check(any(l.strip() == ":::" for l in lines), f"{rel}: closing ':::' missing")
        c.check(front_matter(t).get("title", "").startswith(prefix), f"{rel}: title must start with {prefix!r}")

    bb = build / "docs" / "intro-bbj"
    if bb.is_dir():
        for rel in sorted(e for e in exp if e.endswith(".mdx")):
            r = route_of(rel)
            base = build / "docs" / "intro-bbj"
            target = base / r
            ok = target.with_name(target.name + ".html").is_file() or (target / "index.html").is_file()
            c.check(ok, f"{rel}: built route /docs/intro-bbj/{r} missing in {build}")
    else:
        print("SKIP build routes")
    return c.done()


# ------------------------------------------------------------------ content
def cmd_content(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("content")
    book = root / "docs" / "docs" / "intro-bbj"
    vmap = load_json(DATA / "intro-bbj-video-map.json", c, "video map")
    imap = load_json(DATA / "intro-bbj-image-map.json", c, "image map")
    yt: dict = {}
    img_refs: dict = {}  # dir -> set of names
    total_imgs = 0

    for p in book_mdx(book):
        rel = p.relative_to(book).as_posix()
        t = read_text(p)
        for s in WHOLE_FILE_BANS:
            c.check(s not in t, f"{rel}: contains {s!r}")
        lines, unclosed = split_fences(t)
        c.check(not unclosed, f"{rel}: unclosed code fence")
        for n, line, infence, lang, opens in lines:
            if opens:
                c.check(lang in FENCE_LANGS, f"{rel}:{n}: fence language {lang!r} not allowed")
            if infence:
                continue
            for s in PROSE_BANS:
                c.check(s not in line, f"{rel}:{n}: prose contains {s!r}")
            c.check(not line.startswith("# "), f"{rel}:{n}: H1 heading in content")
            c.check(not re.search(r"\]\(\s*http://localhost", line), f"{rel}:{n}: http://localhost link target")
            for m in IMG_RE.finditer(line):
                total_imgs += 1
                alt, tgt = m.group(1), m.group(2)
                c.check(bool(alt.strip()), f"{rel}:{n}: image without alt text")
                ok = bool(re.fullmatch(r"\./img/[a-z0-9]+(-[a-z0-9]+)*\.png", tgt))
                c.check(ok, f"{rel}:{n}: image target {tgt!r} is not ./img/<kebab>.png")
                if ok:
                    img_refs.setdefault(p.parent, set()).add(tgt[len("./img/"):])
        for m in YT_RE.finditer(t):
            title = next((g for g in m.groups()[1:] if g is not None), "")
            yt.setdefault(m.group(1), []).append((rel, title))

    c.check(set(yt) == set(YOUTUBE), f"YouTube ids {sorted(set(yt))} differ from the 10 contract ids")
    for vid, page in YOUTUBE.items():
        hits = yt.get(vid, [])
        c.check(len(hits) == 1, f"{vid}: {len(hits)} embeds, want exactly 1")
        for rel, title in hits:
            c.check(rel == page, f"{vid}: embedded on {rel}, want {page}")
            c.check(bool(title.strip()), f"{vid}: empty title attribute")
            if isinstance(vmap, dict) and vid in vmap:
                c.check(title == vmap[vid], f"{vid}: title {title!r} differs from video map {vmap[vid]!r}")
    if isinstance(vmap, dict):
        c.check(len(vmap) == 10, f"video map has {len(vmap)} keys, want 10")
        for k, v in vmap.items():
            c.check(isinstance(v, str) and v.startswith("BBx Clues "), f"video map {k}: title must start 'BBx Clues '")
            c.check(isinstance(v, str) and "  " not in v, f"video map {k}: double space in title")
    elif vmap is not None:
        c.check(False, "video map is not an object")

    c.check(total_imgs == 8, f"{total_imgs} image references, want 8")
    if isinstance(imap, list):
        c.check(len(imap) == 9, f"image map has {len(imap)} entries, want 9")
        moved = [e for e in imap if e.get("verdict") == "moved"]
        dropped = [e for e in imap if e.get("verdict") == "dropped"]
        c.check(len(moved) == 8, f"image map: {len(moved)} moved, want 8")
        c.check(len(dropped) == 1 and dropped[0].get("chapter") == 24 and dropped[0].get("file") == "image.png",
                "image map: want exactly one dropped entry (chapter 24, image.png)")
        for e in moved:
            name, alt, page = e.get("name"), e.get("alt"), e.get("page")
            c.check(isinstance(name, str) and bool(KEBAB_PNG.match(name)), f"image map: bad name {name!r}")
            if not (isinstance(name, str) and isinstance(page, str) and alt):
                c.check(False, f"image map: incomplete moved entry {e.get('file')!r}")
                continue
            pp = root / page
            c.check((pp.parent / "img" / name).is_file(), f"{page}: img/{name} missing")
            c.check(pp.is_file() and f"![{alt}](./img/{name})" in read_text(pp),
                    f"{page}: expected ![{alt}](./img/{name})")
    elif imap is not None:
        c.check(False, "image map is not an array")

    for imgdir in sorted(book.glob("*/img")):
        for f in sorted(imgdir.iterdir()):
            c.check(f.name in img_refs.get(imgdir.parent, set()),
                    f"{f.relative_to(book).as_posix()}: image not referenced by any page")
    return c.done()


# ------------------------------------------------------------------ samples
def cmd_samples(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("samples")
    book = root / "docs" / "docs" / "intro-bbj"
    ex = root / "docs" / "examples" / "intro-bbj"
    files = {p.relative_to(ex).as_posix() for p in ex.rglob("*") if p.is_file()} if ex.is_dir() else set()
    c.check(ex.is_dir(), "docs/examples/intro-bbj missing")
    for f in sorted(set(SAMPLE_FILES) - files):
        c.check(False, f"docs/examples/intro-bbj/{f}: missing")
    for f in sorted(files - set(SAMPLE_FILES)):
        c.check(False, f"docs/examples/intro-bbj/{f}: unexpected file")
    lic = ex / "LICENSE"
    if lic.is_file():
        t = read_text(lic)
        c.check("MIT License" in t, "LICENSE: 'MIT License' missing")
        c.check("Copyright (c) 2021 BASIS International Ltd." in t, "LICENSE: 2021 BASIS copyright line missing")
    for f in sorted(files):
        data = (ex / f).read_bytes()
        c.check(b"\r" not in data, f"{f}: contains CR byte")
        c.check(data.endswith(b"\n") and not data.endswith(b"\n\n"), f"{f}: must end with exactly one newline")

    if root.resolve() == REPO.resolve():
        r = subprocess.run([sys.executable, str(REPO / "tools" / "sync-samples.py"), "--check", "intro-bbj"],
                           capture_output=True, text=True, cwd=REPO)
        c.check(r.returncode == 0, f"sync-samples.py --check intro-bbj exited {r.returncode}: "
                                   f"{(r.stdout + r.stderr).strip().splitlines()[-1:]}")
    else:
        print("SKIP sync-samples (--root differs from repository)")

    zd = root / "docs" / "static" / "files" / "intro-bbj"
    zfiles = {p.name for p in zd.iterdir() if p.is_file()} if zd.is_dir() else set()
    c.check(zd.is_dir(), "docs/static/files/intro-bbj missing")
    for z in sorted(set(ZIPS) - zfiles):
        c.check(False, f"docs/static/files/intro-bbj/{z}: missing")
    for z in sorted(zfiles - set(ZIPS)):
        c.check(False, f"docs/static/files/intro-bbj/{z}: unexpected file")

    for z, page in ZIP_LINK_PAGES.items():
        p = book / page
        c.check(p.is_file() and ZIP_PREFIX + z in read_text(p), f"{page}: download link {ZIP_PREFIX}{z} missing")
    ov = book / "00-overview.mdx"
    ovt = read_text(ov) if ov.is_file() else ""
    for z in ZIPS:
        c.check(ZIP_PREFIX + z in ovt, f"00-overview.mdx: download link {ZIP_PREFIX}{z} missing")
    for p in book_mdx(book):
        for tgt in re.findall(re.escape(ZIP_PREFIX) + r"([^)\"' ]+)", read_text(p)):
            c.check((zd / tgt).is_file(), f"{p.relative_to(book).as_posix()}: link target {tgt} does not exist")
    return c.done()


# ------------------------------------------------------------------ commits
def find_commit(subject: str):
    r = subprocess.run(["git", "log", "--format=%H %s", "--fixed-strings", f"--grep={subject}"],
                       capture_output=True, text=True, cwd=REPO)
    for line in r.stdout.splitlines():
        h, _, s = line.partition(" ")
        if s == subject:
            return h
    return None


def commit_paths(h: str):
    r = subprocess.run(["git", "show", "--name-only", "--format=", h], capture_output=True, text=True, cwd=REPO)
    return [l for l in r.stdout.splitlines() if l]


def safe_extract(data: bytes, dest: pathlib.Path, c: Ctx) -> None:
    with tarfile.open(fileobj=io.BytesIO(data), mode="r|") as tf:
        for m in tf:
            parts = pathlib.PurePosixPath(m.name).parts
            if m.name.startswith("/") or ".." in parts or m.issym() or m.islnk():
                c.check(False, f"unsafe tar member rejected: {m.name}")
                continue
            if m.isdir():
                (dest / m.name).mkdir(parents=True, exist_ok=True)
            elif m.isfile():
                f = dest / m.name
                f.parent.mkdir(parents=True, exist_ok=True)
                ef = tf.extractfile(m)
                if ef is not None:
                    f.write_bytes(ef.read())


def tree_map(base: pathlib.Path) -> dict:
    return {p.relative_to(base).as_posix(): p.read_bytes() for p in sorted(base.rglob("*")) if p.is_file()}


def cmd_commits(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("commits")
    c1, c2 = find_commit(C1_SUBJECT), find_commit(C2_SUBJECT)
    if not c1 or not c2:
        print("SKIP commits not in history")
        return c.done()
    anc = subprocess.run(["git", "merge-base", "--is-ancestor", c1, c2], cwd=REPO)
    c.check(anc.returncode == 0, "converter commit is not an ancestor of the generated-docs commit")
    p1, p2 = commit_paths(c1), commit_paths(c2)
    c.check("tools/moodle2docusaurus.py" in p1, "C1 does not change tools/moodle2docusaurus.py")
    c.check(not any(p.startswith(("docs/docs/intro-bbj", "docs/examples/intro-bbj")) for p in p1),
            "C1 touches generated book or sample paths")
    c.check(any(p.startswith("docs/docs/intro-bbj") for p in p2), "C2 does not change docs/docs/intro-bbj")
    c.check("tools/moodle2docusaurus.py" not in p2, "C2 changes tools/moodle2docusaurus.py")

    venv = REPO / ".venv" / "bin" / "python"
    mbz = sorted((REPO / "import").glob("*course-2*.mbz")) if (REPO / "import").is_dir() else []
    if not venv.is_file() or len(mbz) != 1:
        print("SKIP reproducibility (no .venv or backup)")
        return c.done()
    t1 = pathlib.Path(tempfile.mkdtemp(prefix="intro-bbj-regen-"))
    t2 = pathlib.Path(tempfile.mkdtemp(prefix="intro-bbj-c2-"))
    try:
        r = subprocess.run([str(venv), "tools/moodle2docusaurus.py", "--out", str(t1)],
                           capture_output=True, text=True, cwd=REPO, timeout=900)
        if not c.check(r.returncode == 0, f"converter exited {r.returncode}: {r.stderr.strip()[-200:]}"):
            return c.done()
        a = subprocess.run(["git", "archive", c2, "docs/docs/intro-bbj", "docs/examples/intro-bbj"],
                           capture_output=True, cwd=REPO)
        c.check(a.returncode == 0, "git archive of C2 failed")
        safe_extract(a.stdout, t2, c)
        for sub in ("docs/docs/intro-bbj", "docs/examples/intro-bbj"):
            m1, m2 = tree_map(t1 / sub), tree_map(t2 / sub)
            for f in sorted(set(m1) ^ set(m2)):
                c.check(False, f"{sub}/{f}: present only in {'regenerated' if f in m1 else 'C2'} tree")
            for f in sorted(set(m1) & set(m2)):
                c.check(m1[f] == m2[f], f"{sub}/{f}: regenerated bytes differ from C2")
    finally:
        shutil.rmtree(t1, ignore_errors=True)
        shutil.rmtree(t2, ignore_errors=True)
    return c.done()


# -------------------------------------------------------------------- edits
def cmd_edits(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("edits")
    book = root / "docs" / "docs" / "intro-bbj"
    pages = {p.relative_to(book).as_posix(): read_text(p) for p in book_mdx(book)}
    alltext = "\n".join(pages.values())
    for rel, t in pages.items():
        c.check(EM_DASH not in t, f"{rel}: contains an em dash (U+2014)")
        for s, cs in EDIT_BANS:
            hit = (s in t) if cs else (s.lower() in t.lower())
            c.check(not hit, f"{rel}: contains {s!r}")
    ct = pages.get("contribute.mdx", "")
    c.check("github.com/BasisHub/Courses/issues" in ct, "contribute.mdx: link to github.com/BasisHub/Courses/issues missing")

    lm = load_json(DATA / "intro-bbj-link-map.json", c, "link map")
    if isinstance(lm, list):
        olds = [e.get("old") for e in lm]
        c.check(olds == sorted(olds), "link map is not sorted by old")
        for e in lm:
            old = e.get("old")
            c.check(isinstance(old, str) and bool(old), f"link map: entry without old: {e}")
            c.check("new" in e and (e["new"] is None or isinstance(e["new"], str)), f"link map {old}: new must be string or null")
            c.check(e.get("verdict") in ("replaced", "unlinked"), f"link map {old}: verdict {e.get('verdict')!r}")
            c.check(isinstance(e.get("pages"), list) and bool(e.get("pages")), f"link map {old}: pages empty")
            new = e.get("new")
            if e.get("verdict") == "replaced":
                c.check(isinstance(new, str) and new in alltext, f"link map {old}: replacement {new!r} not found in book")
            if isinstance(old, str) and not (isinstance(new, str) and old in new):
                c.check(old not in alltext, f"link map {old}: old URL still in book")
        te = [e for e in lm if e.get("old") == "https://hot.bbx.kitchen/webapp/DWCThemeEditor"]
        c.check(len(te) == 1 and te[0].get("new") == "https://us.bbx.kitchen/webapp/DWCThemer"
                and te[0].get("review") is True,
                "link map: DWCThemeEditor entry must map to https://us.bbx.kitchen/webapp/DWCThemer with review true")
    elif lm is not None:
        c.check(False, "link map is not an array")

    vale = REPO / "tools" / ".bin" / "vale"
    if vale.is_file():
        r = subprocess.run([str(vale), "--minAlertLevel=error", str(book)], capture_output=True, text=True, cwd=REPO)
        c.check(r.returncode == 0, f"Vale errors in docs/docs/intro-bbj: {r.stdout.strip()[-300:]}")
    else:
        print("SKIP vale (tools/.bin/vale missing)")
    return c.done()


# ------------------------------------------------------------------- syntax
def cmd_syntax(root: pathlib.Path, build: pathlib.Path) -> int:
    c = Ctx("syntax")
    book = root / "docs" / "docs" / "intro-bbj"
    rep = DATA / "intro-bbj-syntax.md"
    if not c.check(rep.is_file(), "tools/data/intro-bbj-syntax.md missing"):
        return c.done()
    text = read_text(rep)
    rows = []
    for line in text.split("\n"):
        if line.startswith("|"):
            cells = [x.strip() for x in line.strip().strip("|").split("|")]
            m = re.match(r"^`([^`]+)`$", cells[0]) if cells else None
            if m:
                rows.append((m.group(1), cells[1].lower() if len(cells) > 1 else ""))
    paths = {r[0] for r in rows}
    ex = root / "docs" / "examples" / "intro-bbj"
    want = set()
    for p in sorted(ex.rglob("*.bbj")) if ex.is_dir() else []:
        want.add(p.relative_to(root).as_posix())
    for p in book_mdx(book):
        lines, _ = split_fences(read_text(p))
        n = 0
        for _ln, _l, _inf, lang, opens in lines:
            if opens and lang == "bbj":
                n += 1
                want.add(f"{p.relative_to(root).as_posix()}#{n}")
    for w in sorted(want - paths):
        c.check(False, f"no syntax row for {w}")
    for x in sorted(paths - want):
        c.check(False, f"syntax row for unknown target {x}")
    for path, res in rows:
        c.check(res != "fail", f"{path}: result is fail")
    m = re.search(r"Pass: (\d+)\. Fail: (\d+)\. Not checkable: (\d+)\. Total: (\d+)\.", text)
    if c.check(bool(m), "counts line 'Pass: N. Fail: 0. Not checkable: N. Total: N.' missing") and m:
        c.check(m.group(2) == "0", f"counts line reports Fail: {m.group(2)}")
        c.check(int(m.group(4)) == len(rows), f"Total {m.group(4)} differs from row count {len(rows)}")
    return c.done()


COMMANDS = [("structure", cmd_structure), ("content", cmd_content), ("samples", cmd_samples),
            ("commits", cmd_commits), ("edits", cmd_edits), ("syntax", cmd_syntax)]


def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description="Phase 5 checker for the intro-bbj book")
    ap.add_argument("command", choices=[n for n, _ in COMMANDS] + ["all"])
    ap.add_argument("--build", default="docs/build")
    ap.add_argument("--root", default=str(REPO))
    a = ap.parse_args(argv)
    root = pathlib.Path(a.root).resolve()
    build = pathlib.Path(a.build)
    if not build.is_absolute():
        build = REPO / build
    todo = COMMANDS if a.command == "all" else [(n, f) for n, f in COMMANDS if n == a.command]
    if any(n != "commits" for n, _ in todo) and not (root / "docs" / "docs" / "intro-bbj").is_dir():
        print(f"missing input: {root / 'docs' / 'docs' / 'intro-bbj'}", file=sys.stderr)
        return 2
    rc = 0
    for _n, fn in todo:
        rc |= fn(root, build)
    return 1 if rc else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
