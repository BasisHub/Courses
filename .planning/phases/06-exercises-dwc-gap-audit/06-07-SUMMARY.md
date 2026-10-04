---
phase: 06-exercises-dwc-gap-audit
plan: 07
subsystem: docs
tags: [audit, dwc, moodle]
requires: [06-01, 06-02]
provides:
  - audit fragments for 4A and 5A
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/audit/15-4A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/16-5A.md
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/5A-21.bbj
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 6 Plan 07: Gap audit fragments for 4A and 5A Summary

Verdict tables for DWC Controls With Extended Attributes (page_69) and CSS Layout Options (page_71), including all 8 parked images; both fragments pass `check-dwc-phase6.py audit --fragment`.

## Counts

| Unit | Rows | keep | covered | drop |
|------|------|------|---------|------|
| 4A | 23 | 4 | 14 | 5 |
| 5A | 44 | 16 | 20 | 8 |

## Parked image verdicts

| File | Unit | Verdict | Why |
|------|------|---------|-----|
| message-box.png | 4A | keep | theme "primary" example for the kept theme text |
| hello-dwc-4a.png | 4A | keep | theme "success" and expanse example |
| css-grid-playground-2.png | 5A | keep | named areas step, absent from the page |
| css-grid-playground-3.png | 5A | keep | row and column template step (Method 2) |
| hello-bbj-dwc-grid.png | 5A | keep | Developer Tools grid overlay of the 180px auto window |
| css-layout-samples-6.png | 5A | keep | layout 8 in Responsive mode |
| css-layout-samples-5.png | 5A | drop | 40x38 px Device Emulation icon |
| responsive-demo.png | 5A | drop | 32x34 px icon, redundant; contains no tab title, so T-06-09 does not apply |

Note: the draft maps css-layout-samples-5 (e614abad) to 5A-35, responsive-demo (8ce7ce0f) to 5A-36 and css-layout-samples-6 (6bd73580) to 5A-37.

## Kept BBj snippets

- 5A-21 (`snippets/5A-21.bbj`, two setPanelStyle calls, verbatim). Not yet checked; hand-off to 06-09.

## Deviations from Plan

- The 5A-36 Excerpt abbreviates the long Moodle file name with `...` to stay within the 140 character limit of the checker.
- Task 1 had no separate commit; the plan prescribes one commit for both fragments after Task 2.
- The worktree started on an older base and was reset to 14283b3 as the branch check prescribes. `bbj_lookup` was not run: the snippet only repeats calls already used in the 01 chapter, and the check is the orchestrator's (06-09).

## Commits

- docs(06-07): draft gap audit verdicts for 4A, 5A

## Self-Check: PASSED
