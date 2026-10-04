---
phase: 06-exercises-dwc-gap-audit
plan: 11
subsystem: dwc-exercises
tags: [exercises, dwc, solutions, link-map]
requires: [06-01, 06-02, 06-09, 06-10]
provides: [11 DWC exercise pages, 6 Possible solution blocks, tools/data/dwc-exercise-link-map.json]
key-files:
  created:
    - docs/docs/dwc/*/9[01]-exercise-*.mdx (11 pages)
    - tools/data/dwc-exercise-link-map.json
  modified:
    - docs/docs/dwc/08-control-validation/index.md
    - docs/docs/dwc/10-embedding-components/index.md
    - docs/docs/dwc/11-advanced-responsive/index.md
    - docs/docs/dwc/11-advanced-responsive/01-media-queries.md
    - docs/docs/dwc/11-advanced-responsive/02-transitions.md
    - tools/check-dwc-routes.py
decisions:
  - "basis-next links: bbj-button fell back to https://dwc.style/docs/#/dwc/ (404 on bbj-button.md); BBjTree maps to https://dwc.style/docs/#/dwc/BBjTree (200)"
  - "Four comment URLs inside the byte-copied DWC2.bbj solution are recorded as kept (HTTP 200) so the exercises check passes"
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 11: DWC exercise pages Summary

Eleven DWC exercise pages (EXER-02) with six collapsed "Possible solution" blocks that are byte copies of the reviewed `docs/examples/dwc` files (EXER-04), five pointer sections, a link map with HTTP evidence, and an updated routes checker.

## Commits

- Task 1: `docs(06-11): add DWC exercise pages for chapters 01 to 06 (EXER-02, EXER-04)` (pages 61, 65, 68, 70, 72, 73, link map, routes checker)
- Task 2: `docs(06-11): add DWC exercise pages for chapters 07 to 11 and pointer sections (EXER-02, EXER-04)` (pages 75, 77, 83, 122, 123, five pointer edits, routes checker, link map)

## Verification

Build passes; check-dwc-routes, check-dwc-anchors, and check-dwc-phase6 exercises (430 checks), pointers (21) and solutions (92) all pass with 0 failures; Vale error level reports 0 on docs/docs/dwc; exactly 6 built exercise pages contain "Possible solution"; the LIVE-01 grep is empty.

## Deviations from Plan

**1. [Rule 3 - Blocking] Comment URLs in the solution sample**
- **Found during:** Task 1 exercises check
- **Issue:** DWC2.bbj (byte copy in the page 61 solution block) has four URLs in rem comments; the check requires every URL in the link map.
- **Fix:** Probed all four (HTTP 200) and added them as `kept` entries.
- **Files modified:** tools/data/dwc-exercise-link-map.json

**2. Vale fixes.** Rewrote "rest of the tree", "tabler pool", "css variable" (description) and a quoted string/bare URL link text to satisfy Vale.Terms and Google.Quotes errors.

The only BBj code on pages beyond solution byte copies is the EX73-01 fixed snippet (two statements).

## Known Stubs

None.

## Self-Check: PASSED
