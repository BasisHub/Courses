---
phase: 06-exercises-dwc-gap-audit
plan: 04
subsystem: dwc-gap-audit
tags: [audit, dwc, moodle, chapter-1]
requires: [06-01, 06-02]
provides: [audit fragments 03-1A, 04-1B, 05-1C]
affects: [06-09, 06-10, 06-12]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/audit/03-1A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/04-1B.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/05-1C.md
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 6 Plan 04: Chapter 1 gap audit fragments Summary

Verdict tables for 1A, 1B and 1C (GUI to BUI to DWC), 22 keep, 43 covered, 14 drop rows, all passing `check-dwc-phase6.py audit --fragment` (600 checks, 0 failed).

## Counts per unit

| Unit | keep | covered | drop |
|------|------|---------|------|
| 1A | 2 | 6 | 6 |
| 1B | 5 | 11 | 4 |
| 1C | 15 | 26 | 4 |

## Kept BBj snippets

None. Every `code (bbj)`, `code (css)` and `code (html)` block (1B: 2, 1C: 8 pre blocks) already appears in a DWC fence, so all are covered and `snippets/` gets no file from this plan.

## Kept screenshots (all opened and viewed; none shows personal data)

- 1A-04, 1A-05: Run BUI Program (34 px) and Run DWC Program (64 px) toolbar icons; the page names the buttons but never shows them.
- 1B-08, 1B-10, 1B-11, 1B-13, 1B-14: message box in GUI, BUI, DWC primary, danger and default themes; the page has no result images.
- 1C-04: GUISample in the GUI client (sample names Joe and Blow only).
- 1C-09, 1C-15, 1C-16, 1C-17, 1C-23: flow layout, grid, column-span, column-2 and xl/success button results.
- 1C-25, 1C-26: Safari before/after of the column-width fix (only localhost in the address bar).
- 1C-37, 1C-38: BBj mini console and browser Console output.
- 1C-21: `BBjTopLevelWindow Structure.svg` (attachment row, SHA-1 `18b4c234...`); grep of the SVG for script, foreignObject, href="http and on*= found nothing (still re-check in 06-12).

Dropped: inline toolbar glyphs and Add/Save icons, duplicates by hash, Moodle Q&A icon, the addWindow help-table image, the BBjUtils keyword-help screenshot, a redundant Console crop, and the off-site Context Configuration image (not in backup).

Kept prose: grid explanation details (1C-14), why iOS zooms and the viewport trade-off (1C-31, 1C-33), the browser Console `answer()` step (1C-36). 1C-31 notes to use the current `--dwc-font-size` token, since the Moodle text mixes `--bbj-` and `--dwc-` names.

## Deviations from Plan

- The worktree started on an old base; per the branch check it was reset to 14283b3 before any work.
- Link rows from the drafts are folded into the paragraph decisions (format contract granularity rule), so there are no `link` rows.
- The SVG is one `attachment` row (as the plan requires) instead of a `screenshot` row, so 1C has 14 screenshot rows plus the SVG attachment row.
- Two screenshot file names that embed a hostname/person-like token are abbreviated with `...` in the Excerpt cell (SHA-1 identifies them).
- The SUMMARY commit follows the required subject commit, so HEAD is the summary commit rather than `docs(06-04): draft gap audit verdicts for S1` (that commit is HEAD~1). Task 1 was committed separately as `docs(06-04): draft gap audit verdicts for 1A and 1B`.

## Commits

- 104b3fe: docs(06-04): draft gap audit verdicts for 1A and 1B
- docs(06-04): draft gap audit verdicts for S1 (1C fragment)

## Self-Check: PASSED
