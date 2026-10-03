---
phase: 02-repo-hygiene-ci
plan: 06
subsystem: ci
tags: [github-rulesets, vale, reviewdog, probe-prs]
requires: ["02-05"]
provides:
  - "Active ruleset 24417928 on main (PR + both checks, admin bypass)"
  - "Proof of success criterion 2 and D-09 on real PRs"
affects: [tools/data/ruleset-main.json]
key-files:
  modified: []
decisions:
  - "Ruleset applied unchanged; integration_id 15368 confirmed from real check runs"
  - "reviewdog.yml kept at github-pr-review; the file-mode fallback was not needed"
metrics:
  completed: 2026-10-03
---

# Phase 2 Plan 06: Probe PRs and main ruleset Summary

Two throwaway PRs proved that an error-level Vale violation fails `runner / vale` while the build check passes and nothing deploys. A ruleset now protects main with admin bypass.

## Task 1: decision

User answer: **approve** (all four steps), 2026-10-03.

## Task 2: probe evidence

**PR A (#1, ci-probe/vale-error, head 3dbb297)**
- Check runs, both from app id 15368: `runner / vale` = failure, `Test build (no deploy)` = success.
- Finding, shown as a review comment: `BASIS.AIArtifacts: Remove chatbot artifact 'oaicite' left over from pasted AI output.`
- A warning-level `Google.WordListCase` comment also appeared, as expected (D-11).
- No `deploy.yml` run exists for any `ci-probe/*` branch.

**PR B (#2, ci-probe/file-mode-head into ci-probe/file-mode-base)**
- `runner / vale` = failure and `Test build (no deploy)` = success, both app id 15368.
- `gh pr diff 2` contains no `oaicite`, because the PR only rewords line 10. The violation sits on an untouched line.
- Finding, shown as a review comment: `BASIS.AIArtifacts: Remove chatbot artifact 'oaicite' left over from pasted AI output.`
- D-09 and research assumption A2 are confirmed: file mode evaluates the whole changed file and surfaces the finding. The fallback (`github-pr-check`) was not needed, so `reviewdog.yml` is unchanged.

## Task 3: ruleset and cleanup

- The observed app id is 15368, which equals `integration_id` in `tools/data/ruleset-main.json`. The context names match character for character. No JSON change was needed.
- `POST repos/BasisHub/Courses/rulesets` succeeded on the first attempt. **Ruleset id: 24417928.**
- `rules/branches/main` types: `deletion,non_fast_forward,pull_request,required_status_checks`. The required contexts are `Test build (no deploy)` and `runner / vale`.
- Bypass actors: `RepositoryRole`, actor_id 5, `always`.
- PR A `mergeStateStatus` = **BLOCKED**.
- Cleanup: PRs #1 and #2 closed with a comment, and their branches deleted. `ci-probe/file-mode-base` was deleted remotely. All three local probe branches were deleted. `git ls-remote --heads origin 'ci-probe/*'` prints nothing.
- The push of main with the pending local commits and the resulting deploy are recorded in the final section below.

## Deviations from Plan

None. The plan was executed as written.

## Pending user-run commands

The permission policy denied `bash tools/verify-phase2.sh`. Please run:

`! bash tools/verify-phase2.sh`

The equivalent acceptance criteria were checked with gh and git commands, as shown above.

## Self-Check: PARTIAL

All acceptance criteria were verified directly except the full `tools/verify-phase2.sh` run, which is left for the user.

## Push of main

(see the end of this file, updated after the push)
