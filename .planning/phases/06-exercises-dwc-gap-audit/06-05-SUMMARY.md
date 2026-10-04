---
phase: 06-exercises-dwc-gap-audit
plan: 05
subsystem: docs-audit
tags: [audit, dwc, moodle, gap-audit]
requires: [06-01, 06-02]
provides: [audit fragments 06-2A, 07-2B, 09-2D]
affects: [06-10, 06-13]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/audit/06-2A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/07-2B.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/09-2D.md
decisions:
  - "Parked dev-tools-screenshot-2, -3, -4 are kept; -1 is dropped as redundant"
  - "Themer screenshots with the author's browser profile photo are dropped (personal data)"
requirements: [AUDIT-01]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 05: Gap audit fragments for 2A, 2B, 2D Summary

Verdict tables for the three chapter 2 units (2C is plan 06-06); all three pass `check-dwc-phase6.py audit --fragment` (712 checks, 0 failed).

## Counts

| Unit | Rows | keep | covered | drop |
|------|------|------|---------|------|
| 2A | 27 | 0 | 26 | 1 |
| 2B | 41 | 4 | 20 | 17 |
| 2D | 27 | 6 | 14 | 7 |

2A has 8 code rows (3 css, 5 text), the S2 section summary row (covered, index.md), no screenshots. 2B has 15 screenshot rows and 2 attachment rows. 2D has 7 screenshot rows and 5 bbj code rows (all covered).

## Parked verdicts (2B)

- dev-tools-screenshot-1.png (0c93f9d6): drop, redundant with dwc-titlebar-text.png.
- dev-tools-screenshot-2.png (2ba367e1): keep, `#button-background-considerations` (background-color corners-only symptom).
- dev-tools-screenshot-3.png (c59d3ba6): keep, `#button-background-considerations` (background shorthand result).
- dev-tools-screenshot-4.png (d6db442d): keep, `#complex-background-example`.

2B also keeps paragraph 2B-22 (corners-only observation) with the two button images.

## Other notable verdicts

- 2A_Files.zip: drop, Phase 7 QUAL-03 lead (longer SetStyle.bbj); not extracted. DWC1.bbj: covered, samples.mdx.
- 2D keeps: BBjButton-LightMode and DarkMode (`#step-3-test`), a before/after UI Kit paragraph plus the two UI Kit screenshots under new heading "Applying a Theme to the DWC UI Kit", and the Themer link (us.bbx.kitchen, provisional per P5 D-27). The two DWCThemer screenshots show the author's browser profile photo and are dropped.
- Old DWC docs link (basishub.github.io/basis-next) dropped as superseded.

## Kept BBj snippets

None. All BBj code rows in 2B and 2D are covered by existing DWC fences, so no files were added under snippets/. The draft 2B-21 snippet had missing closing parentheses in var(); the DWC page already carries the corrected form.

## Deviations from Plan

- The worktree started on the wrong base; reset to 14283b3 per the branch check. Otherwise none.
- Rows are 1:1 with draft items (not regrouped by sub-heading), keeping draft numbering for traceability.

## Self-Check: PASSED

Fragments exist, commit a8fdde7 exists, checker passes.
