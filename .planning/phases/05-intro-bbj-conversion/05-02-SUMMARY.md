---
phase: 05-intro-bbj-conversion
plan: 02
subsystem: testing
tags: [python, bash, acceptance-suite, intro-bbj]
requires: []
provides:
  - tools/check-intro-bbj.py with structure, content, samples, commits, edits, syntax and all subcommands
  - tools/verify-phase5.sh Phase 5 acceptance harness
affects: [05-03, 05-04, 05-05, 05-06]
tech-stack:
  added: []
  patterns: [fence-aware prose checks, --root override for scratch converter output]
key-files:
  created: [tools/check-intro-bbj.py, tools/verify-phase5.sh]
  modified: []
key-decisions:
  - "Tasks 1 to 3 were committed together as one commit (daba925), as the plan's Task 3 specifies a single commit for both files"
requirements-completed: []
duration: 25min
completed: 2026-10-04
---

# Phase 5 Plan 02: Phase 5 Acceptance Suite Summary

Stdlib Python checker with six subcommands plus `all`, and a verify-phase5.sh harness, encoding the full Phase 5 contract before any content exists.

## Accomplishments
- structure: exact 38 .mdx file set, categories, overview cards, exercise titles, built routes (SKIP when no build).
- content: fence-aware prose bans, fence languages, 10 YouTube embeds against the video map, 8 images against the image map.
- samples, commits (SKIP before C1/C2 exist, tar extraction rejects unsafe members), edits, syntax.
- Harness mirrors verify-phase4.sh and includes the MDX compile check.

## Verification performed
- `py_compile` passes; on the stub tree structure, content, samples, edits, syntax and all exit 1 with FAIL lines; commits prints SKIP and exits 0.
- Scratch `--root` test: `<span`, `<br`, `&amp;`, `&lt;` inside an html fence produce no FAIL; `<span` in prose does.
- Checker source contains no literal em dash.

## Deviations from Plan
None in code. Execution gaps (not run, because the Bash tool denied these commands in this session):
- `chmod +x tools/verify-phase5.sh` was not applied; the file is committed non-executable (run `chmod +x` or `git update-index --chmod=+x`). `bash tools/verify-phase5.sh` works regardless.
- `bash -n tools/verify-phase5.sh`, the unknown-flag exit 2 check, the `--no-build` exit 1 run and shellcheck were not run. The script is a near-verbatim copy of verify-phase4.sh and should be run once by the orchestrator.

## Known Stubs
None.

## Self-Check: PASSED
Files exist, commit daba925 exists. STATE.md and ROADMAP.md updated via gsd-sdk.

## Post-plan harness checks (run by Stephan, 2026-10-04)

- `chmod +x tools/verify-phase5.sh`; `bash -n` prints SYNTAX-OK.
- `bash tools/verify-phase5.sh --no-build` exits 1 on the stub tree with `FAIL  [structure]`, `[content]`, `[samples]`, `[edits]`, `[syntax]`; `[commits]` and MDX compile PASS. Matches the plan.
