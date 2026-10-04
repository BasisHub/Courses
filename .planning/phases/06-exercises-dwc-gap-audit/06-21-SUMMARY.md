---
phase: 06-exercises-dwc-gap-audit
plan: 21
subsystem: tooling
tags: [checker, exercises, gap-closure]
requires: [06-18, 06-19, 06-20]
provides:
  - Hardened tools/check-dwc-phase6.py (D-08 c/d, WR-12, WR-13)
key-files:
  modified:
    - tools/check-dwc-phase6.py
requirements-completed: [EXER-02, AUDIT-02]
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 6 Plan 21: Checker hardening Summary

The Phase 6 checker now fails when an exercise page names a BBj variable its starter lacks (CR-01 class) or shows a snippet line absent from its starter (WR-01 class), scans GUISample.bbj and every SOLUTIONS starter for D-08 (b) (WR-13), and requires a 'kept' commit (WR-12).

## Commits

- 845148a test(06-21): catch starter variable and snippet mismatches in the Phase 6 checker (EXER-02)

## Task 1

- Starter set is the union of SOLUTIONS starters and `Exercise-*.bbj`, read from all `*.bbj`; a check per SOLUTIONS starter proves it was found.
- D-08 (c): page must name `` `starter` `` outside details; each backticked `name!`/`name$` must occur in the starter text.
- D-08 (d): every non-blank line of a bbj fence outside details must equal a stripped starter line.
- cmd_commits loop now includes "kept". Exercises check count rose from 430 to 456.

## Task 2: negative tests (scratch copy under the scratchpad via --root, deleted afterwards)

- (a) `json!` replaced by `css!` on the grid page: `FAIL 06-flow-layouts/90-exercise-css-grid-layout.mdx: names variable `css!` that starter Exercise-ConvertToCssLayout.bbj does not contain (CR-01)`, exit 1.
- (b) Flexbox snippet split into two lines: `FAIL 06-flow-layouts/91-exercise-css-flexbox.mdx:22: snippet line not in starter Exercise-ConvertToCssFlexbox.bbj: 'myName! = window!.addEditBox("Joe Blow")'` (and the second line), exit 1.
- (c) 5 GUISample lines appended outside details: `FAIL 01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx: 5 or more lines copied from starter GUISample.bbj outside details (D-08)`, exit 1.

## Gates run in this worktree

- `python3 tools/check-dwc-phase6.py all --build docs/build`: all commands 0 failed.
- `npm run build` (docs/node_modules symlinked read-only, removed afterwards): SUCCESS.
- Vale on docs/docs/dwc: 0 errors.
- NOT run: `tools/prove-gates.sh`, `verify-phase1..6.sh`. The sandbox denied executing shell scripts. The change touches only tools/check-dwc-phase6.py, whose subcommands those scripts call and which pass directly; the orchestrator should re-run these after merge.

## Deviations from Plan

- Worktree base was off (merge-base differed); reset to 09f7f16 per the branch-check instructions.
- Negative tests were done with Edit on a scratch copy instead of sed (sandbox restrictions); same outcome.

## Self-Check: PASSED (commit 845148a exists; tools/check-dwc-phase6.py modified; real pages untouched)
