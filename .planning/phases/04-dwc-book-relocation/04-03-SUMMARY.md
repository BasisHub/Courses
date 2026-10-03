---
phase: 04-dwc-book-relocation
plan: 03
subsystem: content
tags: [relocation, dwc, images, link-rewrite, gates]
requires: [04-01]
provides:
  - tools/relocate-dwc.py (one-shot git archive relocation)
  - tools/check-dwc-relocation.py (text-unchanged proof, image map checks, --rev)
  - docs/docs/dwc/ (26 pages, 12 chapters, 48 colocated images)
  - tools/data/dwc-image-map.json (66 verdicts)
affects: [04-04, 04-05, 04-06]
key-files:
  created:
    - tools/relocate-dwc.py
    - tools/check-dwc-relocation.py
    - tools/data/dwc-image-map.json
    - tools/data/dwc-unused-img/ (12 files)
    - docs/docs/dwc/ (chapters, top-level pages)
  modified:
    - docs/docs/dwc/00-overview.mdx
    - tools/prove-gates.sh
    - tools/verify-phase1.sh
    - tools/verify-phase2.sh
requirements-completed: [DWC-02]
completed: 2026-10-03
---

# Phase 4 Plan 03: DWC book relocation (commit 1) Summary

The DWC-Course book is relocated from `git archive 965da6d` into `docs/docs/dwc/` as a mechanically proven pure copy, with a hand-written Markdown overview, 48 images colocated under kebab-case names, and the three gate scripts repointed from the removed Phase 1 stub.

## Commits

- 656186e `feat(04-03)`: relocation script and checker
- 542399a `feat(04-03)`: the relocation (D-01 commit 1)
- c41afdd `test(04-03)`: gate scripts repointed

## Results

- Relocation counts: pages=26 images_moved=48 parked=12 not_moved=6 links_rewritten=25 image_tags=44 gifs=4 imports_removed=9.
- `python3 tools/check-dwc-relocation.py --rev 542399a` passes: every diff hunk explained, file set exact, 66-entry map consistent with sha256 of the source blobs.
- `npm run build` passes; `check-dwc-routes.py` and `check-dwc-anchors.py` pass (306 anchors plus 1 allowlisted); no `IdealImage` or `<Image` remains.
- Overview Vale: zero findings at suggestion level. Chapter 10 card label reads "Embedding Third-Party Components" because Google.Ordinal flags "3rd"; the page title and `_category_.json` label still say "3rd Party" and must be aligned in plan 04-06 commit 3.
- `vale --minAlertLevel=error docs/docs/dwc`: 37 pre-existing errors in relocated text (expected, cleared by 04-06).

## Deviations from Plan

**1. [D-09 deviation] Explicit DocCardList items.** D-09 names a bare `<DocCardList />`. The overview uses `<DocCardList items={[...]} />` with 12 explicit chapter entries because the bare form renders 16 cards including a self-link to the overview and would show empty card text until commit 2 adds descriptions. The ChapterCards one-liners were carried over (lightly reworded to satisfy Vale).

**2. [Rule 3 - Blocked] Gate scripts not run.** In Task 3 the Bash tool denied every invocation of `bash ...` (including `bash -n` and `bash tools/prove-gates.sh`), so `prove-gates.sh`, `verify-phase1.sh`, `verify-phase3.sh` and the `bash -n` syntax checks were NOT run. The edits were verified only by `grep` (no `first-chapter`, `sample-page` or `First steps` left in the three scripts) and `git diff`. These runs must be done by the orchestrator or in 04-06. `verify-phase2.sh --local` was deliberately not a gate here (its Vale section fails until 04-06 commit 3, which runs it in 04-06 Task 2); its live deep-URL check returns 200 only after the PR is deployed.

## CLAUDE.md exception

Commit 542399a knowingly carries the 37 pre-existing Vale error findings of the relocated text, which "Forbidden: committing with Vale findings" normally rules out. This is deliberate under D-01 (pure relocation commit, reviewable on its own) and D-05 (errors cleared in commit 3, plan 04-06). Conditions: the branch is not pushed before commit 3 exists, and the PR is merged with its commits preserved (merge commit or rebase merge, never squash) so commit 1 stays provable with `check-dwc-relocation.py --rev`.

## Known Stubs

None.

## Self-Check: PASSED (with the gate-script runs outstanding, see Deviation 2)
