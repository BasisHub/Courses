#!/usr/bin/env python3
"""One-shot converter for the Moodle course-2 backup into the intro-bbj book (CONV-01).

Reads the .mbz (gzip tar, local only, never committed) and writes
  <out>/docs/docs/intro-bbj        28 chapter pages, overview, 4 section indexes, 5 exercises, images
  <out>/docs/examples/intro-bbj    the 7 sample files, LICENSE and README.md
Editorial decisions (titles, slugs, image names and alt text, video titles, code
overrides) live in this file and in tools/data/intro-bbj-{image,video}-map.json,
so a re-run without network reproduces the same bytes.

Re-runnable into the repo only until the generated-docs commit "feat(05-04): generate
intro-bbj book from Moodle course-2 backup" exists. After that the Markdown is the
source of truth and the script refuses (exit 2) unless --force is given.

Usage (run with the project venv):
  .venv/bin/python tools/moodle2docusaurus.py [--src MBZ] [--out ROOT] [--force]
                                              [--fetch-video-titles] [--dump-images DIR]
Exit codes: 0 ok, 1 unresolved items, count mismatch or MDX failure,
            2 missing input or the generated-docs commit is already in history.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

from bs4 import BeautifulSoup, NavigableString, Tag
from markdownify import markdownify

REPO = pathlib.Path(__file__).resolve().parent.parent
DATA = REPO / "tools" / "data"
IMAGE_MAP = DATA / "intro-bbj-image-map.json"
VIDEO_MAP = DATA / "intro-bbj-video-map.json"
C2_SUBJECT = "feat(05-04): generate intro-bbj book from Moodle course-2 backup"
BOOK = "intro-bbj"
ZIP_URL = "pathname:///files/intro-bbj/"

OVERVIEW_TITLE = "Introduction to BBj Development"
OVERVIEW_DESCRIPTION = (
    "You already write software in another language. "
    "Learn to set up BBj and build GUI and browser applications with it."
)

# Moodle section number -> (folder, label, position, description, intro or None for book_8's intro)
SECTIONS = {
    1: ("01-getting-started", "Set up your environment and get started", 1,
        "Install your tools, write your first programs and learn the basic syntax of BBj.", None),
    2: ("02-object-oriented-syntax", "Object-oriented syntax in BBj", 2,
        "Learn how to write classes in BBj, use them across programs and build an object-oriented dialog.",
        "In this section, you learn how BBj implements object-oriented programming. "
        "You write a first class, reference classes from other programs and build an object-oriented dialog."),
    3: ("03-web-development", "Web development with BBj's DWC", 3,
        "Run your BBj programs in the browser with the DWC and style them with CSS.",
        "In this section, you use the Dynamic Web Client (DWC) to run your BBj programs in the browser. "
        "You move from pixel-based layout to CSS layout and styling."),
    4: ("04-theming-and-styling", "Theming and styling the BBj web components", 4,
        "Style the BBj web components with CSS parts and themes, and switch to the dark theme.",
        "In this section, you style the web components that BBj uses for its controls. "
        "You reach their inner parts with CSS, switch to the dark theme and learn about the Theme Editor."),
}

# Chapter id -> (section, file slug, title, description). Section 0 pages are top-level.
TOP = {9: ("structure", "0.1"), 10: ("audience", "0.2"), 11: ("contribute", "0.3")}
PAGES = {
    9: (0, "structure", "Structure of this material",
        "Learn how this course works: it explains concepts and points you to the product documentation."),
    10: (0, "audience", "Who can use this course",
         "Find out who this course is for and which programming skills you need before you start."),
    11: (0, "contribute", "Help improve this course",
         "Tell us what is missing or unclear so the course gets better for the next developer."),
    2: (1, "01-setup", "Set up Java, BBj and Eclipse",
        "Install Java, BBj and Eclipse so you can write and run your first BBj program."),
    3: (1, "02-first-hello-world", "A first Hello World",
        "Write your first BBj program with a message box and learn where to find the documentation for each verb."),
    4: (1, "03-syntax-and-variables", "Basics about syntax and variables",
        "Learn the BBj syntax rules and the variable suffixes for strings, numbers, integers and objects."),
    5: (1, "04-better-hello-world", "A better Hello World",
        "Build a Hello World program with a real window and a button, and react to the button push with a callback."),
    6: (1, "05-loops-and-if-statements", "Loops and IF statements",
        "Learn how to write IF statements and loops in BBj, and how to exit a loop or skip to the next pass."),
    7: (1, "06-input-field-types", "Types of input fields",
        "Get to know the BBj input controls and the masks that format what users enter."),
    8: (1, "07-multiplying-calculator", "Next sample: a multiplying calculator",
        "Study a small calculator that multiplies two numbers and updates with every keystroke."),
    12: (1, "08-more-hints", "More hints",
         "Pick up more hints about control IDs and keyboard navigation, using the calculator sample."),
    17: (2, "01-what-is-oop", "What is object-oriented programming?",
         "Refresh what object orientation means and find reading material if you are new to it."),
    13: (2, "02-first-class", "A first class in BBj",
         "Write your first class in BBj and see the syntax of object-oriented code blocks."),
    14: (2, "03-reference-classes", "Reference classes from other programs",
         "Use the USE verb to reference classes that live in other BBj programs."),
    15: (2, "04-oo-dialog", "An object-oriented dialog",
         "Develop an object-oriented dialog class that takes user input and returns it to the calling program."),
    16: (2, "05-more-hints-and-docs", "Additional documentation and useful hints",
         "Find more documentation and hints about BBj classes, reflection and upgrading older object-oriented code."),
    25: (3, "01-introduction", "Introduction",
         "Watch a short video that introduces how you develop for the web with the BBj DWC."),
    18: (3, "02-basics", "Basics",
         "Deploy a BBj program as a web application in Enterprise Manager and open it in the browser."),
    19: (3, "03-developing-for-the-web", "Developing for the web",
         "Start from a pixel-based program, run it in the web client and prepare it for CSS layout."),
    20: (3, "04-window-layout-mode", "Change the layout mode for a window",
         "Set the window flag that switches a BBj window from pixel layout to CSS layout."),
    21: (3, "05-css-layout-instructions", "Add CSS layout instructions",
         "Apply a CSS grid layout to a window with setPanelStyle."),
    22: (3, "06-css-on-controls", "Adding CSS to BBj controls",
         "Style single controls with setStyle and try more CSS properties on controls and windows."),
    23: (3, "07-style-attributes", "Setting style attributes on controls",
         "Change the look of a control with the attributes that its web component exposes."),
    24: (3, "08-external-css-file", "Adding an external CSS file",
         "Move your styles into an external CSS file and register it with your web app."),
    26: (4, "01-shadow-dom-parts", "Styling parts in the shadow DOM",
         "Style the inner parts of a BBj control with the CSS ::part selector."),
    27: (4, "02-dark-theme", "Switching your BBj app to dark theme",
         "Switch your BBj app to the dark theme and add a toggle that changes the theme at run time."),
    28: (4, "03-theme-editor", "Use the DWC Theme Editor to create your own theme",
         "Learn about the DWC Theme Editor that creates your own BBj theme."),
    29: (4, "04-theming-reference", "Reference manual on theming",
         "Find the reference manual that explains the theming options from the ground up."),
}

# Assignment id -> (section, file slug, title, description)
ASSIGNMENTS = {
    6: (1, "90-exercise-tic-tac-toe", "Exercise: Write a Tic-Tac-Toe game",
        "Write a two-player Tic-Tac-Toe game in BBj that takes mouse input and checks for a winner."),
    7: (1, "91-exercise-computer-player", "Bonus exercise: Add a computer player",
        "Turn your Tic-Tac-Toe game into a one-player game where the computer plays the other side."),
    14: (2, "90-exercise-login-dialog", "Exercise: Build a login dialog",
         "Write a login dialog as a BBj class that checks a user name and password pair."),
    15: (2, "91-exercise-oo-tic-tac-toe", "Bonus exercise: Make your Tic-Tac-Toe object-oriented",
         "Refactor your Tic-Tac-Toe game into an object-oriented design and decide how many classes you need."),
    19: (3, "90-exercise-responsive-login-dialog", "Exercise: Make your login dialog responsive",
         "Make your login dialog responsive with CSS so that it works on phones, tablets and desktops."),
}

# Resource id -> (sample folder, chapter id, position, zip name, expected sample files)
RESOURCES = {
    11: ("better-hello-world", 5, "end", "better-hello-world.zip", ["BetterHelloWorld.bbj"]),
    13: ("oo-samples", 15, "end", "oo-samples.zip", ["Car.bbj", "CarApplication.bbj", "MyDialog.bbj"]),
    17: ("dwc-lesson-start", 19, "start", "dwc-lesson-start.zip", ["Sample.bbj"]),
    18: ("dwc-lesson-result", 24, "end", "dwc-lesson-result.zip", ["Sample.bbj", "sample.css"]),
}
ALL_ZIP = "intro-bbj-samples.zip"
DOWNLOAD_NOTES = {
    "better-hello-world.zip": "The Better Hello World program from section 1.",
    "oo-samples.zip": "Car.bbj, CarApplication.bbj and MyDialog.bbj from the object-oriented videos.",
    "dwc-lesson-start.zip": "The Sample.bbj file where the web development lesson starts.",
    "dwc-lesson-result.zip": "Sample.bbj and sample.css as they look after the web development lesson.",
    ALL_ZIP: "All samples in one ZIP.",
}

# (chapter id, text anchor, language, kind). kind "code" makes a fence, "prose" confirms running text.
CODE_OVERRIDES = [
    (3, 'MSGBOX("Hello World")', "bbj", "code"),
    (4, "SomeNumber = 3.14", "bbj", "code"),
    (4, "SomeIntegerNumber%", "bbj", "code"),
    (21, "display=inline-grid", "css", "code"),
    (24, ".mypanel{", "css", "code"),
    (24, 'addPanelStyle("mypanel")', "bbj", "code"),
    (24, "::BBUtils.bbj::", "bbj", "code"),
    (26, "::part(control)", "css", "code"),
    (24, "For the time being", "", "prose"),
]

BBJ_START = ("rem ", "declare ", "print ", "use ", "method ", "class ", "wait", "goto ", "gosub ",
             "process_events", "return", "release", "bye", "if ", "for ", "while ")
CODE_LIKE = [
    re.compile(r"\w!\.\w"), re.compile(r"\w!\s*="), re.compile(r"\w\$\s*="), re.compile(r"\w%\s*="),
    re.compile(r"^\s*::"), re.compile(r"::\w+\.bbj"),
    re.compile(r"^\s*[.#]?[\w-]+\s*(::part\([^)]*\))?\s*\{[^}]*:[^}]*;"),
]
KEYWORD_START = re.compile(r"^\s*(rem|declare|print|use|method|class|goto|gosub|process_events|release|bye|if|for|while)\b",
                           re.I)
SAFE_SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
KEBAB_PNG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*\.png$")
YT_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
YT_SRC = re.compile(r"youtu\.be/([A-Za-z0-9_-]{11})")
VIDEO_BLOCK = re.compile(
    r"<p\b[^>]*>(?:\s|&nbsp;)*(<video\b.*?</video>)(?:\s|&nbsp;|<br\s*/?>)*</p>", re.S)
VIDEO_ANY = re.compile(r"<video\b.*?</video>", re.S)
TOKEN = re.compile(r"ZZRAW(\d+)ZZ")
FENCE_LINE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE = re.compile(r"(`+[^`\n]*`+)")

ALLOWED = {"p", "ul", "ol", "li", "strong", "b", "em", "i", "a", "code", "br", "img",
           "h1", "h2", "h3", "h4", "h5", "h6", "html", "body"}
DROP = {"script", "style", "iframe", "object", "embed", "form", "input", "button", "video", "source", "link", "meta"}
BLOCK = {"p", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "div", "table", "blockquote", "pre", "hr"}

LICENSE_TEXT = """MIT License

Copyright (c) 2021 BASIS International Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

README_TEXT = """# Introduction to BBj Development samples

These are the sample programs from the Introduction to BBj Development training book.
Each folder holds the files for one lesson. Open them in your IDE, run them and change them.

- `better-hello-world/` shows a window with a button that opens a message box.
- `oo-samples/` holds the Car classes and the dialog class from the object-oriented videos.
- `dwc-lesson-start/` is the program where the web development lesson starts.
- `dwc-lesson-result/` is the program and the CSS file as they look after the lesson.
"""

EXPECTED = dict(chapters=28, top_pages=3, section_pages=25, exercises=5, index_pages=4, youtube=10,
                videos_skipped=1, images=8, images_dropped=1, resources=4, sample_files=7)


def fail(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)


class Report:
    def __init__(self) -> None:
        self.counts = {k: 0 for k in EXPECTED}
        self.unresolved_files = 0
        self.unresolved_tokens = 0
        self.unresolved_links = 0
        self.unclassified_code = 0
        self.mdx_failed = 0
        self.details: list[str] = []
        self.written_mdx: list[pathlib.Path] = []

    def note(self, msg: str) -> None:
        self.details.append(msg)


# ------------------------------------------------------------------ output paths

class Out:
    """Every writer goes through here; paths must stay inside the two allowed dirs (T-05-07)."""

    def __init__(self, root: pathlib.Path) -> None:
        self.root = root.resolve()
        self.book = (self.root / "docs" / "docs" / BOOK).resolve()
        self.examples = (self.root / "docs" / "examples" / BOOK).resolve()
        for d in (self.book, self.examples):
            if self.root not in d.parents:
                fail(f"output dir {d} escapes {self.root}", 2)

    def clean(self) -> None:
        for d in (self.book, self.examples):
            if d.exists():
                shutil.rmtree(d)

    def path(self, base: pathlib.Path, rel: str) -> pathlib.Path:
        assert base in (self.book, self.examples)
        parts = pathlib.PurePosixPath(rel).parts
        if pathlib.PurePosixPath(rel).is_absolute() or ".." in parts:
            fail(f"unsafe output path {rel}")
        for p in parts[:-1]:
            if not (SAFE_SLUG.match(p) or p == "img"):
                fail(f"unsafe output folder {p} in {rel}")
        dest = (base / rel).resolve()
        if dest != base and base not in dest.parents:
            fail(f"output path {dest} escapes {base}")
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest

    def text(self, base: pathlib.Path, rel: str, content: str) -> pathlib.Path:
        dest = self.path(base, rel)
        dest.write_bytes(content.encode("utf-8"))
        return dest

    def bytes(self, base: pathlib.Path, rel: str, content: bytes) -> pathlib.Path:
        dest = self.path(base, rel)
        dest.write_bytes(content)
        return dest


# ------------------------------------------------------------------ backup access

def wanted_member(name: str) -> bool:
    return (name in ("files.xml",) or name.startswith(("course/", "sections/", "files/"))
            or re.match(r"^activities/(book|assign|resource)_\d+(/|$)", name) is not None
            or name in ("activities", "course", "sections", "files"))


def unpack(src: pathlib.Path, dest: pathlib.Path) -> None:
    with tarfile.open(src, "r:gz") as tf:
        members = []
        for m in tf.getmembers():
            parts = pathlib.PurePosixPath(m.name).parts
            if m.name.startswith("/") or ".." in parts or m.issym() or m.islnk():
                fail(f"unsafe tar member rejected: {m.name}")
            if wanted_member(m.name):
                members.append(m)
        tf.extractall(dest, members=members, filter="data")


def xml_text(el: ET.Element | None) -> str:
    return (el.text or "") if el is not None else ""


class Backup:
    def __init__(self, root: pathlib.Path) -> None:
        self.root = root
        self.chapters: dict[int, dict] = {}   # id -> dict(section, pagenum, title, content)
        self.books: dict[int, int] = {}       # book module id -> section number
        self.book_intro: dict[int, str] = {}  # section number -> intro html
        self.assigns: dict[int, dict] = {}
        self.resources: dict[int, dict] = {}
        self.section_mods: dict[int, list] = {}
        self.files: list[dict] = []
        self.course_summary = ""
        self._load()

    def _load(self) -> None:
        r = self.root
        course = ET.parse(r / "course" / "course.xml").getroot()
        self.course_summary = xml_text(course.find("summary"))
        for sx in sorted((r / "sections").glob("section_*/section.xml")):
            sec = ET.parse(sx).getroot()
            number = int(xml_text(sec.find("number")))
            mods = []
            for mid in [x for x in xml_text(sec.find("sequence")).split(",") if x.strip()]:
                for kind in ("book", "assign", "resource"):
                    if (r / "activities" / f"{kind}_{mid.strip()}").is_dir():
                        mods.append((kind, int(mid)))
            self.section_mods[number] = mods
        for number, mods in self.section_mods.items():
            for kind, mid in mods:
                d = r / "activities" / f"{kind}_{mid}"
                if kind == "book":
                    root = ET.parse(d / "book.xml").getroot()
                    self.books[mid] = number
                    self.book_intro[number] = xml_text(root.find("book/intro"))
                    for ch in root.iter("chapter"):
                        if xml_text(ch.find("hidden")).strip() == "1":
                            continue
                        self.chapters[int(ch.get("id"))] = dict(
                            section=number, pagenum=int(xml_text(ch.find("pagenum"))),
                            title=xml_text(ch.find("title")), content=xml_text(ch.find("content")))
                elif kind == "assign":
                    root = ET.parse(d / "assign.xml").getroot()
                    a = root.find("assign")
                    self.assigns[mid] = dict(section=number, name=xml_text(a.find("name")),
                                             intro=xml_text(a.find("intro")))
                else:
                    root = ET.parse(d / "resource.xml").getroot()
                    a = root.find("resource")
                    self.resources[mid] = dict(section=number, name=xml_text(a.find("name")),
                                               intro=xml_text(a.find("intro")),
                                               contextid=root.get("contextid"))
        fx = ET.parse(r / "files.xml").getroot()
        for f in fx.findall("file"):
            self.files.append({k: xml_text(f.find(k)) for k in
                               ("contenthash", "contextid", "component", "filearea", "itemid", "filename")})

    def blob(self, contenthash: str) -> bytes:
        if not re.fullmatch(r"[0-9a-f]{40}", contenthash):
            fail(f"bad content hash {contenthash!r}")
        return (self.root / "files" / contenthash[:2] / contenthash).read_bytes()

    def chapter_images(self) -> dict[tuple[int, str], dict]:
        out = {}
        for f in self.files:
            if f["component"] == "mod_book" and f["filearea"] == "chapter" and f["filename"] != ".":
                out[(int(f["itemid"]), f["filename"])] = f
        return out


# ------------------------------------------------------------------ editorial maps

def load_json(path: pathlib.Path, default):
    if not path.is_file():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def fetch_video_title(vid: str) -> str:
    if not YT_ID.match(vid):
        fail(f"bad YouTube id {vid!r}")
    url = "https://www.youtube.com/oembed?" + urllib.parse.urlencode(
        {"url": f"https://youtu.be/{vid}", "format": "json"})
    if urllib.parse.urlparse(url).hostname != "www.youtube.com":
        fail("oEmbed host check failed")
    with urllib.request.urlopen(url, timeout=10) as resp:  # noqa: S310 (fixed https host)
        title = json.loads(resp.read().decode("utf-8"))["title"]
    return re.sub(r" {2,}", " ", title).strip()


# ------------------------------------------------------------------ conversion helpers

def lang_of(text: str) -> str | None:
    t = text.lstrip().lower()
    if re.search(r"[.#\w-]+\s*(::part\([^)]*\))?\s*\{", text) and ":" in text and ";" in text:
        return "css"
    if t.startswith("<"):
        return "html"
    if any(k in t for k in ("function ", "const ", "=>", "document.")):
        return "javascript"
    if t.startswith(BBJ_START) or "!" in text or "$" in text or "::" in text:
        return "bbj"
    return None


def looks_like_code(text: str) -> bool:
    if any(rx.search(text) for rx in CODE_LIKE):
        return True
    return bool(KEYWORD_START.match(text)) and any(c in text for c in "(=!$") and len(text) < 160


def override_for(chapter_key, text: str):
    for ch, anchor, lang, kind in CODE_OVERRIDES:
        if ch == chapter_key and anchor in text:
            return lang, kind
    return None


def code_text(el: Tag) -> str:
    """Text of a code element or paragraph: child p are line groups, br is a newline."""
    groups = [c for c in el.children if isinstance(c, Tag) and c.name == "p"] if el.name == "code" else []
    if not groups:
        groups = [el]
    lines = []
    for g in groups:
        g = BeautifulSoup(str(g), "lxml").body
        for br in g.find_all("br"):
            br.replace_with("\n")
        t = g.get_text().replace("\xa0", " ").replace("\t", "    ")
        core = t.rstrip("\n")
        if core.strip() and len(t) - len(core) >= 2:
            core += "\n"  # a trailing double line break is one blank line
        lines.append(core)
    text = "\n".join(lines)
    text = "\n".join(ln.rstrip() for ln in text.split("\n"))
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip("\n")


class Ctx:
    def __init__(self, key, report: Report, video_map: dict, image_map: dict, backup: Backup,
                 images_out: dict, fetch: bool) -> None:
        self.key = key
        self.report = report
        self.video_map = video_map
        self.image_map = image_map
        self.backup = backup
        self.images_out = images_out
        self.fetch = fetch
        self.raws: list[str] = []
        self.youtube: list[str] = []

    def raw(self, text: str) -> str:
        self.raws.append(text)
        return f"ZZRAW{len(self.raws) - 1}ZZ"


def placeholder(soup: BeautifulSoup, token: str) -> Tag:
    p = soup.new_tag("p")
    p["data-raw"] = "1"
    p.string = token
    return p


def raw_fixes(html: str, key, ctx: Ctx) -> str:
    if key == 24:
        html, n = re.subn(r'(<br></p>)<code>(\s*<p dir="ltr">What this does)', r"\1</code>\2", html)
        if n != 1:
            fail("chapter 24: unclosed <code> repair did not match")
        html = html.rstrip()
        if html.endswith("</code></code>"):
            html = html[: -len("</code></code>")]

    def video_repl(m):
        ids = YT_SRC.findall(m.group(0))
        if not ids:
            ctx.report.counts["videos_skipped"] += 1
            return ""
        return f'<p data-youtube="{ids[0]}"></p>'

    html = VIDEO_BLOCK.sub(video_repl, html)
    html = VIDEO_ANY.sub(video_repl, html)
    return html


def clean_dom(soup: BeautifulSoup) -> None:
    for t in list(soup.find_all(True)):
        if t.parent is None:
            continue
        if t.name in DROP:
            t.decompose()
        elif t.name == "span":
            t.unwrap()
        elif t.name not in ALLOWED:
            t.unwrap()
    for t in soup.find_all(True):
        keep = {k: v for k, v in t.attrs.items()
                if (t.name == "a" and k == "href") or (t.name == "img" and k in ("src", "alt"))
                or k in ("data-youtube", "data-raw")}
        t.attrs = keep
    for s in list(soup.find_all(string=True)):
        if "\xa0" in s and not s.find_parent("code"):
            s.replace_with(s.replace("\xa0", " "))


def code_pass(soup: BeautifulSoup, key, ctx: Ctx) -> None:
    """(3) Fenced blocks from block code and from overridden plain paragraphs."""
    report = ctx.report

    def fence(text: str, forced: str | None) -> str:
        lang = forced or lang_of(text)
        if lang is None:
            report.unclassified_code += 1
            report.note(f"unclassified code, chapter {key}: {text[:60]!r}")
            lang = ""
        return f"```{lang}\n{text}\n```"

    for code in list(soup.find_all("code")):
        if code.parent is None:
            continue
        text = code_text(code)
        parent = code.parent
        ptext = parent.get_text().replace("\xa0", " ").strip() if parent is not None else ""
        if not text.strip():
            if parent.name == "p" and not parent.get_text().strip() and not parent.find(["img", "a"]):
                parent.decompose()
            else:
                code.decompose()
            continue
        whole = parent.name == "p" and ptext == code.get_text().replace("\xa0", " ").strip()
        if not (code.find(["p", "br"]) or whole):
            continue  # inline code stays backticks
        ov = override_for(key, text)
        token = ctx.raw(fence(text, ov[0] if ov and ov[1] == "code" else None))
        target = parent if whole else code
        target.replace_with(placeholder(soup, token))

    for p in list(soup.find_all("p")):
        if p.parent is None or p.get("data-raw") or p.get("data-youtube") or p.find_parent("li"):
            continue
        text = code_text(p)
        if not text.strip():
            continue
        ov = override_for(key, text)
        if ov and ov[1] == "code":
            p.replace_with(placeholder(soup, ctx.raw(fence(text, ov[0]))))
        elif ov and ov[1] == "prose":
            continue
        elif looks_like_code(text):
            report.unclassified_code += 1
            report.note(f"unclassified paragraph, chapter {key}: {text[:60]!r}")


def media_pass(soup: BeautifulSoup, key, ctx: Ctx) -> None:
    report = ctx.report
    for p in list(soup.find_all("p", attrs={"data-youtube": True})):
        vid = p["data-youtube"]
        if vid in ctx.youtube:
            p.decompose()
            continue
        ctx.youtube.append(vid)
        title = ctx.video_map.get(vid)
        if title is None and ctx.fetch:
            title = fetch_video_title(vid)
            ctx.video_map[vid] = title
        if not title:
            report.unresolved_tokens += 1
            report.note(f"no video title for {vid}")
            title = vid
        quote = '"' if '"' not in title else "'"
        tag = f"<YouTube id=\"{vid}\" title={quote}{title}{quote} />"
        p.replace_with(placeholder(soup, ctx.raw(tag)))
    for img in list(soup.find_all("img")):
        src = img.get("src", "")
        prefix = "@@PLUGINFILE@@/"
        if not src.startswith(prefix):
            report.unresolved_files += 1
            report.note(f"chapter {key}: image source {src!r}")
            img.decompose()
            continue
        fname = urllib.parse.unquote(src[len(prefix):])
        ctx.images_out.setdefault((key, fname), None)
        entry = ctx.image_map.get((key, fname))
        if not entry or entry.get("verdict") != "moved" or not entry.get("name") or not (entry.get("alt") or "").strip():
            report.unresolved_files += 1
            report.note(f"chapter {key}: no moved image-map entry for {fname!r}")
            img.decompose()
            continue
        name, alt = entry["name"], entry["alt"].strip()
        if not KEBAB_PNG.match(name) or any(c in alt for c in "[]\n"):
            report.unresolved_files += 1
            report.note(f"chapter {key}: bad image name or alt for {fname!r}")
            img.decompose()
            continue
        ctx.images_out[(key, fname)] = entry
        img.replace_with(NavigableString(ctx.raw(f"![{alt}](./img/{name})")))


def link_pass(soup: BeautifulSoup, key, ctx: Ctx) -> None:
    """(5) Link rewrite: .com to .cloud, localhost as code, scheme allow-list."""
    for a in list(soup.find_all("a")):
        href = (a.get("href") or "").strip()
        if not href:
            a.unwrap()
            continue
        href = href.replace("://documentation.basis.com", "://documentation.basis.cloud")
        parsed = urllib.parse.urlparse(href)
        if parsed.scheme in ("http", "https") and parsed.hostname == "localhost":
            code = soup.new_tag("code")
            code.string = href.rstrip("/ ") if href.endswith(" ") else href
            a.replace_with(code)
            continue
        if parsed.scheme in ("http", "https", "mailto") or (not parsed.scheme and not parsed.netloc
                                                            and "pluginfile" not in href and "view.php" not in href):
            a["href"] = href
            for s in a.find_all(string=True):
                if "documentation.basis.com" in s:
                    s.replace_with(s.replace("documentation.basis.com", "documentation.basis.cloud"))
        else:
            ctx.report.unresolved_links += 1
            ctx.report.note(f"chapter {key}: link {href!r}")
            a.unwrap()


def wrap_loose(body: Tag, soup: BeautifulSoup) -> None:
    buf: list = []

    def flush() -> None:
        nodes = [n for n in buf if not (isinstance(n, NavigableString) and not n.strip())]
        buf.clear()
        has = any((isinstance(n, NavigableString) and n.strip()) or (isinstance(n, Tag) and n.get_text().strip())
                  for n in nodes)
        if not nodes:
            return
        if not has:
            for n in nodes:
                n.extract()
            return
        p = soup.new_tag("p")
        nodes[0].insert_before(p)
        for n in nodes:
            p.append(n.extract())

    for node in list(body.children):
        if isinstance(node, Tag) and node.name in BLOCK:
            flush()
        elif isinstance(node, Tag) and node.name == "br":
            flush()
            node.decompose()
        else:
            buf.append(node)
    flush()


def trim_breaks(soup: BeautifulSoup) -> None:
    for el in soup.find_all(["p", "li", "h1", "h2", "h3", "h4", "h5", "h6"]):
        for direction in ("first", "last"):
            while True:
                kids = [c for c in el.contents if not (isinstance(c, NavigableString) and not c.strip())]
                if not kids:
                    break
                node = kids[0] if direction == "first" else kids[-1]
                if isinstance(node, Tag) and node.name == "br":
                    node.decompose()
                else:
                    break


def drop_empty(soup: BeautifulSoup) -> None:
    for el in list(soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol"])):
        if el.parent is None or el.get("data-raw"):
            continue
        if not el.get_text().strip() and not el.find(["img", "a", "code"]):
            el.decompose()


def rank_headings(soup: BeautifulSoup) -> None:
    levels = sorted({int(h.name[1]) for h in soup.find_all(re.compile(r"^h[1-6]$"))})
    mapping = {lv: min(2 + i, 6) for i, lv in enumerate(levels)}
    for h in soup.find_all(re.compile(r"^h[1-6]$")):
        h.name = f"h{mapping[int(h.name[1])]}"


def mdx_escape(text: str) -> str:
    out = []
    in_fence = False
    for line in text.split("\n"):
        if FENCE_LINE.match(line):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue
        parts = INLINE_CODE.split(line)
        for i in range(0, len(parts), 2):
            s = parts[i].replace("{", r"\{").replace("}", r"\}")
            parts[i] = re.sub(r"<(?=[A-Za-z/])", r"\\<", s)
        out.append("".join(parts))
    return "\n".join(out)


def tidy(text: str) -> str:
    lines = text.replace("\xa0", " ").split("\n")
    res = []
    in_fence = False
    for i, ln in enumerate(lines):
        if FENCE_LINE.match(ln):
            in_fence = not in_fence
            res.append(ln)
            continue
        if not in_fence:
            nxt = lines[i + 1] if i + 1 < len(lines) else ""
            if not nxt.strip():
                ln = ln.rstrip()
        res.append(ln)
    text = "\n".join(res)
    return re.sub(r"\n{3,}", "\n\n", text).strip("\n")


def convert(html: str, key, ctx: Ctx) -> str:
    """HTML of one Moodle item to MDX body text (no front matter)."""
    html = raw_fixes(html, key, ctx)
    soup = BeautifulSoup(html, "lxml")
    body = soup.body or soup
    clean_dom(soup)
    code_pass(soup, key, ctx)
    media_pass(soup, key, ctx)
    link_pass(soup, key, ctx)
    trim_breaks(soup)
    wrap_loose(body, soup)
    drop_empty(soup)
    rank_headings(soup)
    md = markdownify(str(body), heading_style="ATX", bullets="-", autolinks=False,
                     escape_underscores=False, escape_asterisks=False, escape_misc=False)
    md = mdx_escape(tidy(md))
    md = TOKEN.sub(lambda m: ctx.raws[int(m.group(1))], md)
    return md.strip("\n")


# ------------------------------------------------------------------ page writers

def yaml_scalar(s: str) -> str:
    if re.search(r"[:#\"'`{}\[\]&*!|>%@,]", s) or s != s.strip() or s[:1] in "-?":
        return json.dumps(s, ensure_ascii=False)
    return s


def front_matter(title: str, description: str, extra: list[tuple[str, str]] | None = None,
                 sidebar: str | None = None) -> str:
    lines = ["---", f"title: {yaml_scalar(title)}"]
    for k, v in extra or []:
        lines.append(f"{k}: {v}")
    if sidebar is not None:
        lines.append(f"sidebar_position: {sidebar}")
    lines.append(f"description: {yaml_scalar(description)}")
    lines.append("---")
    return "\n".join(lines) + "\n\n"


def js_str(s: str) -> str:
    return f'"{s}"' if "'" in s else f"'{s}'"


def page_text(fm: str, body: str) -> str:
    return fm + body.strip("\n") + "\n"


def download_line(zipname: str) -> str:
    return f"[Download {zipname}]({ZIP_URL}{zipname})"


# ------------------------------------------------------------------ guards and CLI

def check_not_committed() -> None:
    r = subprocess.run(["git", "-C", str(REPO), "log", "--format=%H %s", "--fixed-strings", "--grep", C2_SUBJECT],
                       capture_output=True, text=True)
    if r.returncode != 0:
        fail("git log failed; cannot tell whether the book is committed (use --force to override)", 2)
    if any(line.split(" ", 1)[1:] == [C2_SUBJECT] for line in r.stdout.splitlines()):
        fail("generated docs already committed; the Markdown is now the source of truth (use --force to override)", 2)


def find_src(arg: str | None) -> pathlib.Path:
    if arg:
        p = pathlib.Path(arg)
        if not p.is_file():
            fail(f"backup not found: {p}", 2)
        return p
    found = sorted((REPO / "import").glob("*course-2*.mbz"))
    if len(found) != 1:
        fail(f"expected exactly one import/*course-2*.mbz, found {len(found)}", 2)
    return found[0]


def dump_images(backup: Backup, dest: pathlib.Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    n = 0
    for (chapter, fname), f in sorted(backup.chapter_images().items()):
        safe = re.sub(r"[^A-Za-z0-9._-]+", "_", fname)
        (dest / f"{chapter}-{safe}").write_bytes(backup.blob(f["contenthash"]))
        n += 1
    print(f"dumped {n} images to {dest}")


def write_samples(backup: Backup, out: Out, report: Report) -> list[str]:
    zips = []
    by_ctx: dict[str, list[dict]] = {}
    for f in backup.files:
        if f["component"] == "mod_resource" and f["filearea"] == "content" and f["filename"] != ".":
            by_ctx.setdefault(f["contextid"], []).append(f)
    for rid in sorted(RESOURCES):
        folder, _chapter, _pos, zipname, expected = RESOURCES[rid]
        res = backup.resources.get(rid)
        if res is None:
            fail(f"resource {rid} missing from backup")
        files = by_ctx.get(res["contextid"], [])
        if len(files) != 1:
            fail(f"resource {rid}: expected one file, found {len(files)}")
        f = files[0]
        blob = backup.blob(f["contenthash"])
        members: dict[str, bytes] = {}
        if f["filename"].lower().endswith(".zip"):
            import io
            with zipfile.ZipFile(io.BytesIO(blob)) as zf:
                for info in zf.infolist():
                    if info.is_dir():
                        continue
                    n = info.filename
                    parts = pathlib.PurePosixPath(n).parts
                    if n.startswith("/") or ".." in parts or len(parts) > 2:
                        fail(f"unsafe ZIP entry rejected: {n}")
                    base = parts[-1]
                    if base in expected:
                        members[base] = zf.read(info)
        else:
            members[f["filename"]] = blob
        if sorted(members) != sorted(expected):
            fail(f"resource {rid}: got {sorted(members)}, want {sorted(expected)}")
        for name in expected:
            data = members[name].replace(b"\r\n", b"\n").replace(b"\r", b"\n").rstrip(b"\n") + b"\n"
            out.bytes(out.examples, f"{folder}/{name}", data)
            report.counts["sample_files"] += 1
        report.counts["resources"] += 1
        zips.append(zipname)
    out.text(out.examples, "LICENSE", LICENSE_TEXT)
    out.text(out.examples, "README.md", README_TEXT)
    return zips


def main() -> None:
    ap = argparse.ArgumentParser(description="Convert the Moodle course-2 backup into the intro-bbj book.")
    ap.add_argument("--src", help="path to the .mbz (default: the single import/*course-2*.mbz)")
    ap.add_argument("--out", help="output root (default: repo root)")
    ap.add_argument("--force", action="store_true", help="run although the generated-docs commit exists")
    ap.add_argument("--fetch-video-titles", action="store_true", help="fetch missing titles from YouTube oEmbed")
    ap.add_argument("--dump-images", metavar="DIR", help="write all chapter images to DIR and exit")
    args = ap.parse_args()

    src = find_src(args.src)
    out_root = pathlib.Path(args.out).resolve() if args.out else REPO
    if out_root == REPO and not args.force and not args.dump_images:
        check_not_committed()

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="intro-bbj-"))
    try:
        unpack(src, tmp)
        backup = Backup(tmp)
        if args.dump_images:
            dump_images(backup, pathlib.Path(args.dump_images))
            return
        run(backup, Out(out_root), args)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def run(backup: Backup, out: Out, args) -> None:
    report = Report()
    video_map = load_json(VIDEO_MAP, {})
    image_entries = load_json(IMAGE_MAP, [])
    image_map = {(e["chapter"], e["file"]): e for e in image_entries}

    if set(backup.chapters) != set(PAGES):
        fail(f"chapter ids differ from the page table: {sorted(set(backup.chapters) ^ set(PAGES))}")
    if set(backup.assigns) != set(ASSIGNMENTS) or set(backup.resources) != set(RESOURCES):
        fail("assignment or resource ids differ from the tables")
    for ch, (sec, *_rest) in PAGES.items():
        if backup.chapters[ch]["section"] != sec:
            fail(f"chapter {ch} is in section {backup.chapters[ch]['section']}, table says {sec}")

    out.clean()
    images_out: dict = {}

    def ctx_for(key) -> Ctx:
        return Ctx(key, report, video_map, image_map, backup, images_out, args.fetch_video_titles)

    ctxs: list[Ctx] = []

    def conv(html: str, key) -> str:
        c = ctx_for(key)
        ctxs.append(c)
        return convert(html, key, c)

    # order check: file prefixes must follow pagenum within each section
    for sec in SECTIONS:
        items = sorted((backup.chapters[c]["pagenum"], PAGES[c][1]) for c in PAGES if PAGES[c][0] == sec)
        slugs = [s for _, s in items]
        if slugs != sorted(slugs):
            fail(f"section {sec}: pagenum order differs from file order: {slugs}")

    resource_md: dict[int, tuple[str, str]] = {}
    for rid, (folder, chapter, pos, zipname, _exp) in RESOURCES.items():
        intro = conv(backup.resources[rid]["intro"], f"resource{rid}")
        resource_md[chapter] = (pos, f"{intro}\n\n{download_line(zipname)}")

    # chapters
    for ch in sorted(PAGES, key=lambda c: (PAGES[c][0], backup.chapters[c]["pagenum"])):
        sec, slug, title, desc = PAGES[ch]
        body = conv(backup.chapters[ch]["content"], ch)
        if ch in resource_md:
            pos, md = resource_md[ch]
            body = f"{md}\n\n{body}" if pos == "start" else f"{body}\n\n{md}"
        if sec == 0:
            name, position = TOP[ch]
            fm = front_matter(title, desc, sidebar=position)
            rel = f"{name}.mdx"
            report.counts["top_pages"] += 1
        else:
            fm = front_matter(title, desc)
            rel = f"{SECTIONS[sec][0]}/{slug}.mdx"
            report.counts["section_pages"] += 1
        report.written_mdx.append(out.text(out.book, rel, page_text(fm, body)))
        report.counts["chapters"] += 1

    # exercises
    for aid, (sec, slug, title, desc) in sorted(ASSIGNMENTS.items()):
        body = conv(backup.assigns[aid]["intro"], f"assign{aid}")
        text = page_text(front_matter(title, desc), f":::exercise\n\n{body}\n\n:::")
        report.written_mdx.append(out.text(out.book, f"{SECTIONS[sec][0]}/{slug}.mdx", text))
        report.counts["exercises"] += 1

    # section folders
    for sec, (folder, label, pos, desc, intro) in SECTIONS.items():
        slug = folder[3:]
        intro_md = conv(backup.book_intro[sec], f"intro{sec}") if intro is None else intro
        text = page_text(front_matter(label, desc), f"{intro_md}\n\n<DocCardList />")
        report.written_mdx.append(out.text(out.book, f"{folder}/index.mdx", text))
        report.counts["index_pages"] += 1
        out.text(out.book, f"{folder}/_category_.json",
                 "{\n"
                 f'  "label": {json.dumps(label, ensure_ascii=False)},\n'
                 f'  "position": {pos},\n'
                 f'  "link": {{"type": "doc", "id": "{BOOK}/{slug}/index"}}\n'
                 "}\n")

    # samples and overview
    zips = write_samples(backup, out, report)
    cards = ",\n".join(
        f"  {{type: 'link', label: {js_str(SECTIONS[s][1])}, href: '/docs/{BOOK}/{SECTIONS[s][0][3:]}', "
        f"description: {js_str(SECTIONS[s][3])}}}" for s in sorted(SECTIONS))
    downloads = "\n".join(f"- [{z}]({ZIP_URL}{z}): {DOWNLOAD_NOTES[z]}" for z in zips + [ALL_ZIP])
    summary = conv(backup.course_summary, "course")
    first = SECTIONS[1]
    overview = page_text(
        "---\n"
        f"title: {OVERVIEW_TITLE}\n"
        "sidebar_label: Overview\n"
        "sidebar_position: 0\n"
        f"description: {yaml_scalar(OVERVIEW_DESCRIPTION)}\n"
        "---\n\n",
        f"## About this course\n\n{summary}\n\n"
        f"Start with [{first[1]}](./{first[0]}/index.mdx).\n\n"
        f"## Sections\n\n<DocCardList items={{[\n{cards},\n]}} />\n\n"
        f"## Sample downloads\n\n{downloads}")
    report.written_mdx.append(out.text(out.book, "00-overview.mdx", overview))

    # images: copy moved files, require a verdict for every chapter image
    all_images = backup.chapter_images()
    for (chapter, fname), entry in sorted(image_map.items(), key=lambda kv: (kv[0][0], kv[0][1])):
        if (chapter, fname) not in all_images:
            report.unresolved_files += 1
            report.note(f"image map entry without backup file: chapter {chapter} {fname!r}")
    used_names: dict[tuple[str, str], tuple] = {}
    for (chapter, fname), f in sorted(all_images.items()):
        referenced = images_out.get((chapter, fname))
        entry = image_map.get((chapter, fname))
        if referenced is not None:
            sec = PAGES[chapter][0]
            folder = SECTIONS[sec][0]
            key = (folder, entry["name"])
            if key in used_names:
                report.unresolved_files += 1
                report.note(f"image name collision {key}")
                continue
            used_names[key] = (chapter, fname)
            out.bytes(out.book, f"{folder}/img/{entry['name']}", backup.blob(f["contenthash"]))
            report.counts["images"] += 1
        elif (chapter, fname) in images_out:
            continue  # referenced but unresolved, already counted
        elif entry and entry.get("verdict") == "dropped":
            report.counts["images_dropped"] += 1
        else:
            report.unresolved_files += 1
            report.note(f"unreferenced image without dropped entry: chapter {chapter} {fname!r}")

    report.counts["youtube"] = sum(len(c.youtube) for c in ctxs)

    if args.fetch_video_titles:
        VIDEO_MAP.write_text(json.dumps(dict(sorted(video_map.items())), indent=2, ensure_ascii=False) + "\n",
                             encoding="utf-8")

    # leftovers in the written tree
    for p in sorted(out.book.rglob("*.mdx")):
        t = p.read_text(encoding="utf-8")
        report.unresolved_tokens += t.count("$@")
        report.unresolved_files += t.count("@@PLUGINFILE@@")
        if "\xa0" in t or "&nbsp;" in t:
            report.note(f"{p.name}: non-breaking space left")
            report.unresolved_tokens += 1

    # MDX compile check of every written page
    r = subprocess.run(["node", str(REPO / "tools" / "check-mdx.mjs")] + [str(p) for p in sorted(report.written_mdx)],
                       capture_output=True, text=True, cwd=REPO)
    if r.returncode != 0:
        fails = [ln for ln in (r.stdout + r.stderr).splitlines() if ln.startswith("FAIL")]
        report.mdx_failed = max(len(fails), 1)
        for ln in (fails or (r.stdout + r.stderr).splitlines()[:5]):
            report.note(f"mdx: {ln}")

    print(" ".join(f"{k}={report.counts[k]}" for k in EXPECTED))
    print(f"unresolved_files={report.unresolved_files} unresolved_tokens={report.unresolved_tokens} "
          f"unresolved_links={report.unresolved_links} unclassified_code={report.unclassified_code} "
          f"mdx_failed={report.mdx_failed}")
    for d in report.details:
        print(f"  {d}")
    bad = (report.counts != EXPECTED or report.unresolved_files or report.unresolved_tokens
           or report.unresolved_links or report.unclassified_code or report.mdx_failed)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
