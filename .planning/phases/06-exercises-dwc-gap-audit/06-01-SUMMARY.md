---
phase: 06-exercises-dwc-gap-audit
plan: 01
subsystem: tooling
tags: [checker, python, dwc, exercises, audit]
requires: []
provides:
  - "tools/check-dwc-phase6.py with subcommands exercises, pointers, indexes, solutions, audit, kept, screenshots, commits, all"
affects: [06-02, 06-17]
tech-stack:
  added: []
  patterns: ["stdlib-only checker with Ctx check/done, FAIL/SKIP output, exit 0/1/2"]
key-files:
  created: [tools/check-dwc-phase6.py]
  modified: []
key-decisions:
  - "Missing required input raises MissingInput and exits 2 (single command); under all it is reported and counted as failure"
  - "exercises loads the link map only when at least one exercise page exists, so today's tree prints the 11 missing-page FAIL lines"
  - "solutions looks for the ZIP link and starter file name anywhere in the page, since the plan's 'block' was ambiguous"
requirements-completed: [EXER-02, EXER-03, EXER-04, AUDIT-01, AUDIT-02, AUDIT-03]
duration: 20min
completed: 2026-10-04
---

# Phase 6 Plan 01: Phase 6 Checker Summary

One stdlib-only Python checker with eight subcommands plus `all` that verifies every Phase 6 outcome (exercise pages, pointers, indexes, inline solutions, gap audit, kept material, 2022 screenshot markers, commit order).

## Tasks

| Task | Result | Commit |
|------|--------|--------|
| 1 and 2 | Whole checker written in one file and committed together (both tasks target the same file and the plan asks for one commit) | 8b45688 |

## Verification

- Today's tree: `exercises` prints 11 missing-page FAIL lines, `solutions` 6, `pointers` and `indexes` fail as expected, `commits` prints SKIP and exits 0, `audit`, `kept` and `screenshots` exit 2 (no audit file, no build, no JSON). No tracebacks, `all` runs end to end.
- `audit --fragment` tested on a small synthetic fragment: 23 checks, 0 failed.
- The exercises, solutions, kept, screenshots and full-audit paths could not be exercised against real data yet (no pages, audit, build or JSON exist); they are untested beyond syntax and the missing-input paths.

## Deviations from Plan

Tasks 1 and 2 were committed as a single commit (the plan's Task 1 has no commit message of its own and Task 2 requires one commit of this file alone). The worktree base was corrected with `git reset --hard 156ce09` at start, as the branch check prescribes.

## Known Stubs

None.

## Self-Check: PASSED

tools/check-dwc-phase6.py exists and is executable; commit 8b45688 exists.
