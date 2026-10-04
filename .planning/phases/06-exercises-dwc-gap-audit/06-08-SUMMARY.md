---
phase: 06-exercises-dwc-gap-audit
plan: 08
subsystem: docs
tags: [audit, dwc, icon-pools, validation]
requires: [06-01, 06-02]
provides:
  - audit fragments for units 6A (page_74) and 7A (page_76)
  - 19 kept BBj snippets for the 06-09 syntax check
affects: [06-09, 06-10, 06-15]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/audit/17-6A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/18-7A.md
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/6A-*.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/7A-*.bbj
decisions:
  - "Three Moodle fences tagged javascript (6A-34, 7A-41, 7A-45) are BBj code, so their rows are typed code (bbj) and saved as snippets."
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 08: Gap audit for 6A and 7A Summary

Verdict tables for Icon Pools (41 items) and Control Validation (64 items) with 19 kept BBj snippets; both fragments pass `check-dwc-phase6.py audit --fragment` (799 checks).

## Counts

| Unit | Rows | keep | covered | drop | pre blocks | screenshots |
|------|------|------|---------|------|------------|-------------|
| 6A | 41 | 19 | 10 | 12 | 7 | 8 |
| 7A | 64 | 29 | 19 | 16 | 13 | 13 |

## Kept BBj snippets (snippets/)

- 6A: 6A-20, 6A-21, 6A-24, 6A-25, 6A-34, 6A-36, 6A-37
- 7A: 7A-11, 7A-13, 7A-29, 7A-34, 7A-41, 7A-43, 7A-45, 7A-50, 7A-52, 7A-54, 7A-58, 7A-62

Kept snippets still await `bbj_check_syntax` in 06-09. They are indented fragments saved verbatim from Moodle; 06-09 may need to wrap them.

## Notes for later plans

- 6A: one screenshot (6A-07, external screw-head SVG) is not matched by hash; viewed and dropped as redundant. 7 images are covered by hash.
- 7A: all 13 images are covered by hash. regex101.png (7A-33) shows the zip pattern from Example 2, so 06-15 should move it to Pattern Validation. validation-6, -7, -8, -9 and validation-demo3 illustrate validation-icon and auto-disable (Validation Customization, Disabling the Submit Button), not the email exercise (D-04); their Reasons say so.
- New headings the kept material needs: 6A "Scalable Vector Graphics", "Custom Icon Pools"; 7A "Form Validation", "Client-Side Validation", "Controlling When Validation Runs", "JavaScript Validation", "Validation Customization", "Disabling the Submit Button". The anchor `example---adding-icons-to-buttons` for 6A must be confirmed against the build.
- The 6A-34 code uses `injectScript`; the sample file uses `executeScript` and ionicons 6.0.2 while Moodle uses 7.4.0. 06-09 and 06-15 should verify the method.
- Observation, out of scope: the current 08-control-validation page uses `isValid()`, `setCustomValidity()` and `invalid-message`, which are not in the Moodle material; they should be verified before the chapter is finished.

## Deviations from Plan

- The BBj MCP tools were not available in this agent, so no `bbj_lookup` was done; nothing in this plan writes BBj into a page.
- The worktree base was corrected with `git reset --hard 14283b3` per the start-up check.

## Self-Check: PASSED

Fragments and snippets exist, commit e625eff exists, fragment check reports 0 failures.
