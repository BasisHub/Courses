---
phase: 06-exercises-dwc-gap-audit
plan: 12
subsystem: dwc-content
tags: [audit, kept-material, images]
requires: [06-11]
provides: [chapter 01 kept material, tools/data/dwc-gap-image-map.json]
key-files:
  created:
    - tools/data/dwc-gap-image-map.json
    - docs/docs/dwc/01-gui-to-bui-to-dwc/img/ (17 PNG, 1 SVG)
  modified:
    - docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md
    - docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md
    - docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md
requirements: [AUDIT-02]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 12: Kept material for units 0P, 0R, 1A, 1B, 1C Summary

Chapter 01 now shows the kept Moodle screenshots (17 PNG plus the window-structure SVG) with hand-written alt text and image-map entries, plus adapted prose for grid units, iOS zoom, the viewport trade-off and the browser-console step.

## Results

- Units 0P and 0R have no keep rows, so `prerequisites.mdx` and `resources.mdx` are unchanged and Task 1 produced no commit.
- Chapter 01 commit: `c5001cc` (`docs(06-12): add kept course-4 material to 01-gui-to-bui-to-dwc (AUDIT-02)`).
- 1C-14 and 1C-31/33/36 prose was adapted with `--dwc-space-m`, `--dwc-space-xl` and `--dwc-font-size`, all confirmed present in `docs/static/css/dwc-ui.css`.
- No BBj code was added; no new sub-page; no heading or id changed.
- Gates: Vale 0 errors, no em dashes, build, routes, anchors, audit (4471 checks), `kept --allow-parked --units 0P,0R,1A,1B,1C` (338 checks) all pass; sync-samples check passes; 44 `.bbj` files.

## Deviations from Plan

- [Rule 1] Two alt texts tripped Vale (exclamation mark, lowercase "bbj") and were reworded before the commit.
- The audit row 1C-14 wording about the three `setPanelStyle` round trips was merged into the "Both methods are valid" paragraph under CSS Grid Explanation.
- I copied the screenshots by hash (SHA-1 verified against the map) and relied on the audit's earlier viewing for personal-data screening; I did not re-view the images in this run.

## Human checks

- `bbj-top-level-window-structure.svg` passed the script/foreignObject/on*=/external href grep, but it has hard-coded fills; confirm it reads in dark mode.
- Glance at the screenshots on the three chapter-01 pages for correct placement.

## Self-Check: PASSED
