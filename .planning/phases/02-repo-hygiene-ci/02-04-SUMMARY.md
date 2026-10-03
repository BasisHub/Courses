---
phase: 02-repo-hygiene-ci
plan: 04
subsystem: ci
tags: [github-actions, pages, vale, reviewdog, rulesets]
requires: ["02-01"]
provides:
  - deploy workflow (push to main, Pages)
  - PR build check and Vale check workflows
  - ruleset definition for main
affects: [02-05, 02-06]
key-files:
  created:
    - .github/workflows/deploy.yml
    - .github/workflows/test-build.yml
    - .github/workflows/reviewdog.yml
    - tools/data/ruleset-main.json
decisions:
  - "Followed plan exactly; vale-action SHA taken from plan (518a9136...), no gh lookup needed"
metrics:
  tasks: 2
  files: 4
  completed: 2026-10-03
---

# Phase 2 Plan 04: CI workflows and ruleset Summary

Three least-privilege GitHub Actions workflows (Pages deploy on main, PR build check, SHA-pinned Vale via reviewdog) plus a reproducible ruleset JSON for main.

## Commits

- 36b2425: deploy.yml and test-build.yml
- 7066fce: reviewdog.yml and tools/data/ruleset-main.json

## Deviations from Plan

None. Plan executed as written.

## Verification

Run: `python3 -c 'import json; json.load(...)'` on the ruleset: OK. Grep check: no `paths`, `@v3/@v4`, or `pull_request` in deploy.yml; `pages: write` and `id-token: write` only in deploy.yml (deploy job).

NOT RUN (permission policy denied shell tools):
- `tools/.bin/actionlint .github/workflows/*.yml`
- `bash tools/verify-phase2.sh --local` (expect all `[ci]` lines PASS)

User should run both commands.

## Known Stubs

None.

## Self-Check: PARTIAL

Files and commits exist (verified by successful commits). actionlint and verify-phase2.sh were not executed.
