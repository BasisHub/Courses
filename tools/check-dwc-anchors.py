#!/usr/bin/env python3
"""Check that every old DWC-Course heading anchor exists in the new build (D-06).

Usage: python3 tools/check-dwc-anchors.py [--build docs/build]
Exit 0 on pass, 1 on any failure, 2 when the build or snapshot is missing.
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "tools" / "data" / "dwc-old-routes.json"
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}

# Dropped on purpose: the old landing page's Ready to Get Started section is not rebuilt (Phase 4 D-09)
ALLOWLIST = {("/", "ready-to-get-started")}


class IdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.depth = 0
        self.ids: set[str] = set()

    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.depth += 1
        elif tag in HEADINGS and self.depth > 0:
            ident = dict(attrs).get("id")
            if ident:
                self.ids.add(ident)

    def handle_endtag(self, tag):
        if tag == "article" and self.depth > 0:
            self.depth -= 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--build", default=str(ROOT / "docs" / "build"))
    args = ap.parse_args()
    build = pathlib.Path(args.build)
    if not build.is_dir() or not SNAPSHOT.is_file():
        print("missing build or snapshot", file=sys.stderr)
        return 2

    snap = json.load(open(SNAPSHOT, encoding="utf-8"))
    failures = 0
    checked = 0
    allowed = 0
    total = sum(len(r["anchors"]) for r in snap["routes"] if r["content"])
    if total == 0 or total != snap.get("anchor_count"):
        # An empty or truncated snapshot must not pass vacuously.
        print("FAIL  snapshot has %d anchors, anchor_count says %s" % (total, snap.get("anchor_count")))
        failures += 1
    for r in snap["routes"]:
        if not r["content"]:
            continue
        route = r["route"]
        name = "overview" if route == "/" else route.lstrip("/")
        page = build / "docs" / "dwc" / (name + ".html")
        if not page.is_file():
            print("FAIL  missing page %s: %s" % (route, page))
            failures += 1
            continue
        p = IdParser()
        p.feed(page.read_text(encoding="utf-8"))
        for a in r["anchors"]:
            if (route, a["id"]) in ALLOWLIST:
                allowed += 1
                continue
            if a["id"] in p.ids:
                checked += 1
            else:
                print("FAIL  missing anchor %s#%s" % (route, a["id"]))
                failures += 1
    if checked == 0:
        print("FAIL  no anchors checked")
        failures += 1
    if failures:
        print("%d failure(s)" % failures)
        return 1
    print("PASS  %d old anchors present (%d allowlisted)" % (checked, allowed))
    print("all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
