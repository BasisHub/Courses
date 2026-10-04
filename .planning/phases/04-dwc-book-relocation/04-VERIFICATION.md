---
phase: 04-dwc-book-relocation
verified: 2026-10-04T00:00:00Z
status: human_needed
score: 4/4 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open the built site (npm run serve) and view /Courses/docs/dwc/ chapters with images in light and dark mode"
    expected: "Sidebar is flat and numbered, overview first; images render and are legible in both themes; sample download links work"
    why_human: "Visual rendering and theme behavior (VALIDATION.md manual item) cannot be checked by grep"
---

# Phase 4: DWC Book Relocation Verification Report

**Phase Goal:** Readers find the whole "BBj DWC Training" book under `/Courses/docs/dwc/` with the old text unchanged
**Status:** human_needed (all automated checks pass)

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 12 chapters in flat numbered sidebar, overview first, text unchanged (pure relocation commit) | VERIFIED | `docs/docs/dwc` has 00-overview.mdx, 01..12 chapter folders, prerequisites/samples/resources. `python3 tools/check-dwc-relocation.py --rev 542399a` (commit 1) reports "all checks passed": every hunk vs DWC-Course 965da6d is allowlisted. Working-tree run fails 26 hunks, but that is expected: later commits (D-05 Vale fixes, D-07/D-08 normalization) edit text, and verify-phase4 deliberately checks commit 1. `check-dwc-routes.py` and `check-dwc-anchors.py` pass (306 old anchors present, 1 allowlisted). `npm run build` succeeds. |
| 2 | Images colocated in `img/`, kebab-case, plain Markdown images; rename map in `tools/data/` | VERIFIED | `tools/data/dwc-image-map.json` exists; checker confirms identical sha256, every reference resolves, every moved image referenced. No `<Image>`/IdealImage usage remains in docs/docs/dwc. No uppercase or space names under any `img/`. Unused images parked in `tools/data/dwc-unused-img`. |
| 3 | Samples downloadable from `static/files/dwc/`, plain sources in `examples/dwc/`, synced by script | VERIFIED | 10 sample ZIPs plus dwc-samples.zip in `docs/static/files/dwc/`; 10 sample dirs plus LICENSE and README.md in `docs/examples/dwc/`. `python3 tools/sync-samples.py --check` passes for all ZIPs. verify-phase4 (orchestrator) checks that page download links resolve. |
| 4 | Old build and sitemap snapshotted in `tools/data/` before the move | VERIFIED | `tools/data/dwc-old-sitemap.xml` (28 locs) and `dwc-old-routes.json` (27 content routes, 307 anchors) exist; snapshot commit 5a99edc precedes relocation commit 542399a. |

**Score:** 4/4

## Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
|-------------|-------------|--------|----------|
| DWC-01 | 04-01, 04-03, 04-05, 04-06 | SATISFIED | Truth 1. Note: REQUIREMENTS.md still shows `[ ]` / "Pending" for DWC-01 (deliberate in 1216c4f); update to Complete. |
| DWC-02 | 04-03, 04-06 | SATISFIED | Truth 2 |
| DWC-03 | 04-02, 04-03, 04-05, 04-06 | SATISFIED | Truth 3 |
| DWC-04 | 04-01, 04-06 | SATISFIED | Truth 4 |

No orphaned requirements; all four IDs map to Phase 4 and are claimed by plans.

## Script Evidence

Run by me: the three `check-dwc-*.py` checkers, `sync-samples.py --check`, `npm run build` (all pass). Not run by me, relied on orchestrator evidence: `verify-phase4.sh --no-build` (18/18), `verify-phase1.sh` (38/38), `verify-phase2.sh --local` (only the expected branch check fails), `verify-phase3.sh`. The CR-01 fix (ca18fe2) was confirmed by the orchestrator against docs/build.

## Anti-Patterns

No TBD/FIXME/XXX debt markers in phase files (the only grep hit is a `mktemp XXXXXX` template in verify-phase1.sh). 04-REVIEW.md warnings WR-01 to WR-07 are open: they concern tooling robustness (link-target allowlist laxness, compressed ZIP payload not verified, no CI drift check, no `.gitattributes`, relocate script re-run guard, book arg validation, staleness check). They are WARNINGS, not goal blockers, but WR-01 means the "text unchanged" proof can false-pass on link-target changes. Recommend handling before or in Phase 7.

## Known Deferred Item

`SetStyle.bbj` fails `bbj_check_syntax` (43/44 pass), recorded in `tools/data/dwc-samples-syntax.md` per D-20 for Phase 7. Not part of Phase 4 success criteria.

## Human Verification Required

1. **Visual light/dark check.** Serve the build and open each DWC chapter in light and dark mode. Expect a flat numbered sidebar with overview first, readable images in both themes, working sample download links. Why human: visual rendering.

## Gaps Summary

No gaps. Automated verification supports all four success criteria; only the visual check remains.

_Verifier: Claude (gsd-verifier)_
