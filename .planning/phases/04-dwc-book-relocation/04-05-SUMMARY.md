---
phase: 04-dwc-book-relocation
plan: 05
subsystem: docs
tags: [dwc, normalization, samples, downloads]
requires: [04-02, 04-03]
provides:
  - Normalized DWC pages (front matter, headings, fences, order)
  - Samples page with 11 ZIP downloads
affects: [04-06]
key-files:
  modified:
    - docs/docs/dwc/ (26 pages)
decisions:
  - "Fences without language use text"
  - "Download links use pathname:/// to avoid hashed asset URLs"
metrics:
  completed: 2026-10-04
---

# Phase 4 Plan 05: DWC normalization and sample downloads Summary

Commit 2 (c319e3c) normalizes the 26 relocated DWC pages mechanically and replaces the `git clone` instructions on the samples page with 11 ZIP download links.

## What changed

- H1 dropped where it equaled the front matter title (22 pages).
- Four pages keep a differing H1, listed for Phase 7: `02-browser-developer-tools/index.md`, `04-upgrading-apps/index.md`, `06-flow-layouts/index.md`, `prerequisites.mdx`.
- `description` added to all 26 pages (at most 160 characters, no em dash, no Vale finding on those lines).
- 2 bare fences in `12-deployment/index.md` now use `text`.
- `sidebar_position` removed from all chapter-folder pages; top-level 0.1/0.2/0.3 and overview 0 kept.
- `samples.mdx` "Getting the Samples" now lists `dwc-samples.zip` plus the 10 per-folder ZIPs through `pathname:///files/dwc/` links. Stale "samples/ directory of the repository" wording fixed in `prerequisites.mdx` and `resources.mdx`.

## Verification

- `npm run build` passes; routes check, anchors check (306 anchors) and `sync-samples.py --check` pass.
- All 11 `pathname:///files/dwc/*.zip` targets exist in `docs/static` and `docs/build`.
- No `DWC-Course/`, `git clone` or `cloned the repository` remains in `docs/docs`.
- Commit touches only `docs/docs/dwc/`.
- Not run: `verify-phase2.sh --local` (by instruction, its Vale section fails until 04-06) and `verify-phase4` (not part of this plan).

## Deviations from Plan

None. One extra wording fix: the prerequisites sentence was reworded to "You can download the sample code ... from the Sample Code page" to avoid a redundant self-link.

## CLAUDE.md exception

Commit 2 still carries pre-existing Vale errors on untouched lines: `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` reports 36 errors in 27 files after the commit. CLAUDE.md "Forbidden: committing with Vale findings" normally rules this out. The exception is deliberate under D-01 (separate mechanical commit) and D-05 (errors cleared in commit 3, plan 04-06). Conditions: do not push the branch before commit 3 exists, and merge the PR with commits preserved (no squash).

## Requirements

DWC-01 stays pending (finished in 04-06). DWC-03: download links resolve in the build and sync-samples --check passes.

## Self-Check: PASSED
