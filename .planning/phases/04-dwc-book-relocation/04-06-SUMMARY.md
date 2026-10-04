---
phase: 04-dwc-book-relocation
plan: 06
subsystem: docs
tags: [dwc, vale, verification]
requires: [04-01, 04-04, 04-05]
provides:
  - Commit 3 of D-01 (Vale error fixes), DWC pages clean at error level
  - tools/verify-phase4.sh acceptance suite (written, not yet run: see Verification gaps)
affects: [phase-05, phase-06, phase-07]
key-files:
  created: [tools/verify-phase4.sh]
  modified: [docs/docs/dwc/ (13 pages), docs/docs/dwc/10-embedding-components/_category_.json]
decisions:
  - Chapter 10 title, category label and overview card all read "Embedding Third-Party Components"
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 4 Plan 06: Vale fixes and Phase 4 acceptance suite Summary

Commit 3 clears all 36 error-level Vale findings in the DWC book with minimal wording changes, and `tools/verify-phase4.sh` bundles every Phase 4 check. The script's full run is pending because `bash tools/*.sh` was denied by permissions.

## Commits

- 1929fb4 fix(04-06): clear Vale errors in DWC pages (D-05)
- 31432da test(04-06): add Phase 4 acceptance suite

## Task 1: Vale errors

- Errors before (after commit 2): 36 in 13 files. After: 0 (`vale --minAlertLevel=error docs/docs/dwc` exits 0).
- Remaining for Phase 7: 422 warnings and 56 suggestions (27 files).
- Fixes: inline code for file names and tokens, "ARC file", "third-party", commas and periods inside quotes, exclamation points to periods, "newly launched".
- Heading that changed: `## Exercise: Embed a Third-Party Component {#exercise-embed-a-3rd-party-component}` (old id kept). Headings that only gained inline code keep their ids.
- Chapter 10 label change: title in `index.md`, `_category_.json` label and the overview card (already "Third-Party") now agree. This is the one sidebar label that differs from the old site.
- `.vale.ini`, styles and `.github` untouched; no `vale off` comments.
- Verified after the edits: `npm run build` passes, `check-dwc-anchors.py` (306 old anchors present, 1 allowlisted) and `check-dwc-routes.py` pass.

## Task 2: verify-phase4.sh

Sections: build, snapshot, routes, relocation, samples, content. The relocation section prints `SKIP  [relocation]` (no failure) when the source clone or commit 1 is missing. The script is mode 755 and copies the verify-phase3 skeleton.

## Verification gaps (user must run with `!`)

The permission system denied `bash tools/*.sh` invocations, and I did not work around that. NOT run:

- `bash tools/verify-phase4.sh` (and `bash -n` / shellcheck on it; shellcheck is not installed)
- `DWC_SOURCE_REPO=/nonexistent/dwc-src bash tools/verify-phase4.sh --no-build` (skip path)
- The injection sanity test (append `DWC-Course/` to `docs/docs/dwc/resources.mdx`, expect exit 1, restore with git checkout)
- `bash tools/verify-phase1.sh`, `bash tools/verify-phase2.sh --local`, `bash tools/verify-phase3.sh --no-build`, `bash tools/prove-gates.sh` (the full verify-phase2 --local is first required to pass now that commit 3 exists)

Run directly instead (all pass): vale error level on dwc, `npm run build`, `check-dwc-anchors.py`, `check-dwc-routes.py`, `sync-samples.py --check`, `check-dwc-relocation.py --rev 542399a` (all checks passed), and by hand the script's other checks: 27 routes and 307 anchors in the snapshot, 11 download targets in static and build, a syntax row for all 44 samples, LIVE-01 grep and `<Image`/`IdealImage` greps empty, no dotfiles, `01-first-chapter` gone, test-build.yml and THIRD_PARTY_NOTICES entries present.

DWC-01 and the phase are therefore NOT marked complete or verified.

## Deferred

- Em dash in `02-browser-developer-tools/01-intro-to-css.md` (Vale does not raise it at error level): Phase 7.
- D-20: the CLAUDE.md rule "every .bbj passes `bbj_check_syntax`" holds from Phase 7 (baseline in `tools/data/dwc-samples-syntax.md`: 43 pass, 1 fail).
- The live deep-URL check in verify-phase2 passes only after deploy.

## Merge instructions

Push the branch and open the PR only now that commit 3 exists. Merge with commits preserved (merge commit or rebase merge, never squash): commits 1 and 2 knowingly carry Vale errors (CLAUDE.md exception recorded in the 04-03 and 04-05 SUMMARYs), and commit 1 must stay addressable for `check-dwc-relocation.py --rev`.

## Point-in-time note

`verify-phase4.sh` and the `check-dwc-*.py` checkers are a Phase 4 point-in-time gate: they assert the exact Phase 4 end state (route set, file set, image references). Phases 5 to 7 that add dwc pages (for example 90- exercises) or move parked images must update these checkers in the same change so the script stays green.

## Deviations

None from the plan except the permission-denied script runs above.
