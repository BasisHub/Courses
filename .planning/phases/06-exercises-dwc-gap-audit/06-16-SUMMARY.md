---
phase: 06-exercises-dwc-gap-audit
plan: 16
subsystem: dwc-content
tags: [screenshots, exercise-index]
requires: [06-15]
provides: [2022 screenshot list and markers, exercise indexes for both books]
key-files:
  created:
    - tools/data/dwc-2022-screenshots.json
    - docs/docs/dwc/exercises.mdx
    - docs/docs/intro-bbj/exercises.mdx
  modified:
    - docs/docs/dwc/00-overview.mdx
    - docs/docs/intro-bbj/00-overview.mdx
    - tools/check-intro-bbj.py
    - tools/check-dwc-routes.py
requirements: [AUDIT-03, EXER-03]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 16: 2022 screenshot markers and exercise indexes Summary

59 DWC images (30 plus 29 added in this phase, matched by SHA-1 against 2022-named Moodle files) are listed in `tools/data/dwc-2022-screenshots.json` and carry the `{/* TODO: screenshot outdated? */}` marker above all 63 references. Both books now have an Exercises page at sidebar position 0.4, linked from their overviews.

## Commits

- `bb42327` mark 2022 screenshots (AUDIT-03); the diff outside the JSON is marker lines only
- `8028d85` (subject `docs(06-16): add exercise indexes to both books (EXER-03)`) for the indexes, overview links and the two checker edits

## Results

- `check-dwc-phase6.py screenshots` (458 checks) and `indexes` (64) pass; routes, intro `structure`, `content`, `edits` pass with the 39-file contract.
- Vale error level 0; build passes; the built flow-layouts page has no "screenshot outdated" text.
- dwc/exercises.mdx marks exactly the six D-06 solution pages.

## Deviations from Plan

None in substance. The first draft of the DWC intro sentence quoted the "(solution included)" marker and tripped the indexes check; reworded.

## Self-Check: PASSED
