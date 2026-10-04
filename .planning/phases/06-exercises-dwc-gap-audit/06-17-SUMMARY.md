---
phase: 06-exercises-dwc-gap-audit
plan: 17
subsystem: verification
tags: [verify, gate, dwc, exercises, audit]
requires: [06-16]
provides:
  - "tools/verify-phase6.sh: one-command Phase 6 acceptance suite"
affects: [tools/verify-phase4.sh, tools/verify-phase5.sh]
tech-stack:
  added: []
  patterns: ["verify-phaseN.sh section/check helper pattern"]
key-files:
  created: [tools/verify-phase6.sh]
  modified: [tools/verify-phase4.sh, tools/verify-phase5.sh]
key-decisions:
  - "verify-phase6.sh closes the D-18 series; the commits check confirms the order"
requirements-completed: [EXER-02, EXER-03, EXER-04, AUDIT-01, AUDIT-02, AUDIT-03]
metrics:
  duration: short
  completed: 2026-10-04
---

# Phase 6 Plan 17: Phase 6 verify script Summary

`tools/verify-phase6.sh` checks the whole Phase 6 end state in ten sections (build, exercises, pointers, solutions, indexes, audit, kept, screenshots, regression, commits), one check line per `check-dwc-phase6.py` subcommand, plus the earlier-phase regression gates.

## Tasks

1. Write verify-phase6.sh, add one header comment line each to verify-phase4.sh and verify-phase5.sh. Commit `9adea54` `test(06-17): add Phase 6 verify script`. The two older scripts gained exactly one line and lost none.
2. Full gate through the underlying commands (executors cannot run `bash tools/*.sh`). No fixes were needed.

## Gate results (last line of each command)

- `npm run build`: `[SUCCESS] Generated static files in "build".`
- `check-dwc-phase6.py all`: exercises 430/0, pointers 21/0, indexes 64/0, solutions 92/0, audit 4471/0, kept 978/0, screenshots 458/0 (59 listed, 63 marked), commits 45/0; exit 0
- `check-dwc-routes.py`: all checks passed
- `check-dwc-anchors.py`: 306 old anchors present (1 allowlisted), all checks passed
- `sync-samples.py --check`: exit 0
- `check-intro-bbj.py`: structure 200/0, content 10007/0, edits 586/0, samples 41/0, syntax 34/0
- `check-dwc-relocation.py --rev 542399a`: all checks passed
- Vale `--minAlertLevel=error docs/docs`: 0 errors, 0 warnings, 0 suggestions in 79 files
- LIVE-01 grep over docs/docs: empty; `git ls-files import`: 0

## D-18 commit list (in order)

- a3c58ad docs(06-11): exercise pages, chapters 01 to 06
- cf1abd8 docs(06-11): exercise pages, chapters 07 to 11 and pointers
- 570f9a2 docs(06-10): DWC gap audit
- c5001cc, d94ce3d, ca22623, c6607da, 69e9df4, a3f88ad, 608b5a1, ed137bb, 0bd3fed, e086424, acf619a: kept course-4 material per chapter (06-12 to 06-15)
- 75d55e1 fix(06-15): BBjClientFile owns copyToClient
- bb42327 docs(06-16): 2022 screenshot markers
- 8028d85 docs(06-16): exercise indexes
- 9adea54 test(06-17): verify script (last)

## Deviations from Plan

None in outcome. The first draft of the script was produced with a shell heredoc that the permission system denied, so it was written with the Write tool instead; content is the same.

## Phase 7 hand-off

- LIVE-01 must treat the new DWC Exercises page and the 11 exercise sub-pages as intended additions in the sidebar diff against the old site.
- The DWCThemer provisional link from P5 D-27 also appears in the theming exercise.
- Vale warnings remain for Phase 7.
- SetStyle.bbj stays for QUAL-03.
- Existing DWC fences with unverified or undocumented APIs are listed in 06-15-SUMMARY.md "Issues for Phase 7".
- The dwc.style hash-route links in tools/data/dwc-exercise-link-map.json were "verified" by HTTP 200 on a `#` fragment URL. That does not prove the target route exists; recheck them.
- STATE.md's current-plan counter is known to be off; progress is tracked through `roadmap update-plan-progress`.

## Pending human checks

1. Run `! bash tools/verify-phase6.sh`, then `! bash tools/verify-phase4.sh --no-build`, `! bash tools/verify-phase5.sh --no-build`, `! bash tools/verify-phase1.sh`, `! bash tools/verify-phase2.sh --local`, `! bash tools/verify-phase3.sh`, `! bash tools/prove-gates.sh`; each ends with its all-passed line.
2. `cd docs && npm run serve`; open /Courses/docs/dwc/exercises and /Courses/docs/intro-bbj/exercises in light and dark mode. Sidebar order for DWC: Overview, Prerequisites, Sample Code, Resources, Exercises, then chapters. Every link opens its exercise.
3. Open the six DWC exercises with solutions: "Possible solution" is collapsed, opens, shows the titled code; long code collapses behind "Show all N lines"; the ZIP link downloads.
4. Open /Courses/docs/dwc/flow-layouts and /Courses/docs/dwc/control-validation: images render, no TODO text visible; check any kept SVG in dark mode.
5. Review tools/data/dwc-gap-audit.md verdicts in the PR (D-11).

## Known Stubs

None.

## Self-Check: PASSED

tools/verify-phase6.sh exists and is executable; commit 9adea54 exists.
