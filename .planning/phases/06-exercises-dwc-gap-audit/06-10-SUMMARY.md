---
phase: 06-exercises-dwc-gap-audit
plan: 10
subsystem: content-audit
tags: [audit, dwc, moodle]
requires: [06-01, 06-09]
provides: [tools/data/dwc-gap-audit.md]
affects: [06-11, 06-12, 06-13, 06-14, 06-15, 06-16]
key-files:
  created:
    - tools/data/dwc-gap-audit.md
decisions:
  - "Audit assembled from the 25 fragments by a one-off script; the BBj check suffix is appended from 06-bbj-syntax-raw.tsv"
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 10: DWC gap audit Summary

`tools/data/dwc-gap-audit.md` assembles the 25 fragments (22 modules) with a summary table and the `bbj_check_syntax` result on every kept BBj snippet. It is the first commit of the D-18 series: `570f9a2`.

## Totals

keep 191, covered 259, drop 124 (574 rows). The Summary table matches the row counts.

## BBj check results on kept rows

36 kept `code (bbj)` rows: 30 pass, 6 fixed (3B3-07, 3B3-11, 9A-04, 9A-05, 9A-09, 9C-06; the seventh fix, EX73-01, is an exercise snippet and has no audit row). No row was not checkable, so none needed a verdict change. Note from 06-09: 8B-02 uses `MODE="PDF"`, which the docs do not list.

## Verification

`python3 tools/check-dwc-phase6.py audit` reports 4471 checks, 0 failed. No `import/`, `/Users/` or U+2014 in the file. No exercise, kept, marker or index commit existed before this one.

## Deviations from Plan

None. The plan executed as written.

## Self-Check: PASSED
