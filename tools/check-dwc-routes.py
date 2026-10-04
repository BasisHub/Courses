#!/usr/bin/env python3
"""Check the new build's DWC routes and sidebar order against the old snapshot (D-04, D-12).

Usage: python3 tools/check-dwc-routes.py [--build docs/build]
Exit 0 on pass, 1 on any failure, 2 when the build or snapshot is missing.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "tools" / "data" / "dwc-old-routes.json"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
SITE = "https://basishub.github.io/Courses/docs/dwc"
BASE = "/Courses/docs/dwc"

TOP_ORDER = [
    "overview", "prerequisites", "samples", "resources", "gui-to-bui-to-dwc",
    "browser-developer-tools", "dwc-debugging", "upgrading-apps", "dwc-controls",
    "flow-layouts", "icon-pools", "control-validation", "browser-constraints",
    "embedding-components", "advanced-responsive", "deployment",
]
SUB_ORDER = {
    "gui-to-bui-to-dwc": ["registering-launching", "hello-world", "gui-to-bui-to-dwc"],
    "browser-developer-tools": ["intro-to-css", "developer-tools", "css-custom-properties", "dwc-themes"],
    "upgrading-apps": ["arc-files", "upgrading-grids"],
    "advanced-responsive": ["media-queries", "transitions"],
}


class MenuParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        d = dict(attrs)
        href = d.get("href") or ""
        if "menu__link" in (d.get("class") or "") and href.startswith(BASE):
            if href not in self.hrefs:
                self.hrefs.append(href)


def menu(path: pathlib.Path) -> list[str]:
    p = MenuParser()
    p.feed(path.read_text(encoding="utf-8"))
    return p.hrefs


failures = 0


def report(ok: bool, name: str, detail: str = "") -> None:
    global failures
    if ok:
        print("PASS  " + name)
    else:
        failures += 1
        print("FAIL  %s%s" % (name, ": " + detail if detail else ""))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default=str(ROOT / "docs" / "build"))
    args = ap.parse_args()
    build = pathlib.Path(args.build)
    if not build.is_dir() or not (build / "sitemap.xml").is_file() or not SNAPSHOT.is_file():
        print("missing build or snapshot", file=sys.stderr)
        return 2

    snap = json.load(open(SNAPSHOT, encoding="utf-8"))
    n_content = sum(1 for r in snap["routes"] if r["content"])
    # An empty or truncated snapshot must not pass vacuously.
    report(n_content > 0 and n_content == snap.get("content_routes"), "snapshot content routes",
           "%d listed, content_routes says %s" % (n_content, snap.get("content_routes")))
    expected = {SITE + r["route"] for r in snap["routes"] if r["content"] and r["route"] != "/"}
    expected.add(SITE + "/overview")
    actual = set()
    for e in ET.parse(build / "sitemap.xml").getroot().iter(NS + "loc"):
        loc = e.text.strip()
        if loc == SITE or loc.startswith(SITE + "/"):
            actual.add(loc)
    for u in sorted(expected - actual):
        report(False, "missing route " + u)
    for u in sorted(actual - expected):
        report(False, "extra route " + u)
    if expected == actual:
        report(True, "%d dwc routes match snapshot" % len(expected))

    overview = build / "docs" / "dwc" / "overview.html"
    if overview.is_file():
        top = [h[len(BASE) + 1:] for h in menu(overview)
               if h.startswith(BASE + "/") and "/" not in h[len(BASE) + 1:]]
        report(top == TOP_ORDER, "top-level sidebar order", "got %s" % top)
    else:
        report(False, "top-level sidebar order", "overview.html missing")

    for chapter, pages in SUB_ORDER.items():
        f = build / "docs" / "dwc" / (chapter + ".html")
        if not f.is_file():
            report(False, "sub-page order " + chapter, "page missing")
            continue
        hrefs = menu(f)
        got = [h for h in hrefs if h.startswith("%s/%s/" % (BASE, chapter))]
        want = ["%s/%s/%s" % (BASE, chapter, p) for p in pages]
        report(got == want, "sub-page order " + chapter, "got %s" % got)

    print("%d failure(s)" % failures if failures else "all checks passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
