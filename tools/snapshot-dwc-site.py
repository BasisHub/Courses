#!/usr/bin/env python3
"""Snapshot the old DWC-Course build for the Phase 8 redirects (D-15).

Copies the old sitemap and records every content route with the ids of its
h1 to h6 headings inside <article>. Stdlib only.

Usage: python3 tools/snapshot-dwc-site.py --old-build ../bbj-dwc-tutorial/build --out tools/data
"""
from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
PREFIX = "https://basishub.github.io/DWC-Course"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
HEADINGS = {"h1", "h2", "h3", "h4", "h5", "h6"}


class AnchorParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.depth = 0
        self.anchors: list[dict] = []

    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.depth += 1
        elif tag in HEADINGS and self.depth > 0:
            ident = dict(attrs).get("id")
            if ident:
                self.anchors.append({"tag": tag, "id": ident})

    def handle_endtag(self, tag):
        if tag == "article" and self.depth > 0:
            self.depth -= 1


def resolve(p: str) -> pathlib.Path:
    path = pathlib.Path(p)
    return path if path.is_absolute() else (ROOT / path).resolve()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--old-build", default="../bbj-dwc-tutorial/build")
    ap.add_argument("--out", default="tools/data")
    args = ap.parse_args()
    build = resolve(args.old_build)
    out = resolve(args.out)
    src = build / "sitemap.xml"
    if not src.is_file():
        print("missing sitemap: %s" % src, file=sys.stderr)
        return 1
    out.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, out / "dwc-old-sitemap.xml")

    locs = [e.text.strip() for e in ET.parse(src).getroot().iter(NS + "loc")]
    routes = []
    for loc in locs:
        if not loc.startswith(PREFIX):
            print("unexpected loc: %s" % loc, file=sys.stderr)
            return 2
        route = loc[len(PREFIX):] or "/"
        if ".." in route or "\\" in route:
            print("refusing route: %s" % route, file=sys.stderr)
            return 2
        if route == "/search":
            routes.append({"route": route, "content": False, "anchors": []})
            continue
        name = "index.html" if route == "/" else route.lstrip("/") + ".html"
        page = build / name
        parser = AnchorParser()
        parser.feed(page.read_text(encoding="utf-8"))
        routes.append({"route": route, "content": True, "anchors": parser.anchors})
    routes.sort(key=lambda r: r["route"])

    content = sum(1 for r in routes if r["content"])
    count = sum(len(r["anchors"]) for r in routes)
    data = {
        "source": "BasisHub/DWC-Course@965da6d",
        "base": "/DWC-Course",
        "total_locs": len(locs),
        "content_routes": content,
        "anchor_count": count,
        "routes": routes,
    }
    (out / "dwc-old-routes.json").write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print("locs=%d content=%d anchors=%d" % (len(locs), content, count))
    return 0 if (len(locs), content) == (28, 27) else 1


if __name__ == "__main__":
    sys.exit(main())
