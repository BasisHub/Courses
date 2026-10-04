---
phase: 06-exercises-dwc-gap-audit
verified: 2026-10-04T12:00:00Z
status: gaps_found
score: 3/4 roadmap truths verified (SC1 partial)
gaps:
  - truth: "Reader finds DWC exercises as 9N-exercise-*.mdx pages that can be completed as written"
    status: partial
    reason: "CR-01 confirmed real. The grid and Flexbox exercise pages tell the reader to edit a css! variable. Neither starter file has one; both use a json! JsonObject applied via setPanelStyle."
    artifacts:
      - path: "docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx"
        issue: "Goals 1-4 (lines 14-20) say css! variable; starter Exercise-ConvertToCssLayout.bbj uses json!"
      - path: "docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx"
        issue: "Goals 1-3 (lines 14-18) say css! variable; starter Exercise-ConvertToCssFlexbox.bbj uses json!"
    missing:
      - "Replace css! with json! in the 7 goals (grid 1-4, flexbox 1-3)"
      - "Also fix WR-01 (Flexbox goal 4 describes unchained setAttribute; fence not indented into list item) and WR-02 (flag $00100000$ vs $00100083$ in exercise 01)"
---

# Phase 6: Exercises & DWC Gap Audit Verification Report

**Phase Goal:** The DWC book carries its exercises and all worthwhile course-4 material, and both books have an exercise index
**Status:** gaps_found
**Re-verification:** No

## Goal Achievement

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | DWC exercises as 9N-exercise-*.mdx pages; each book has an exercise index | PARTIAL (BLOCKER) | 11 exercise pages and both indexes exist; `check-dwc-phase6.py exercises` (430) and `indexes` (64) pass with 0 failed. But two pages (grid, Flexbox) cannot be completed as written (CR-01, verified by grep: 7 occurrences of `css!` on the pages, 0 in the starter files, which use `json!`). |
| 2 | Possible solution in collapsed block where a sample exists | VERIFIED | `check-dwc-phase6.py solutions`: 92 checks, 0 failed. |
| 3 | `tools/data/dwc-gap-audit.md` with keep/drop/covered verdicts per page | VERIFIED | `audit`: 4471 checks, 0 failed. |
| 4 | Kept material on DWC pages as one commit series, no slug renames; 2022 screenshots marked | VERIFIED | `kept` 978, `commits` 45, `screenshots` 458 checks, 0 failed (59 listed entries, 63 marked references). Weakness: WR-12 says the commit check never confirms the "kept" commits exist. |

**Score:** 3/4

## Requirements Coverage

| ID | Status | Evidence |
|---|---|---|
| EXER-02 | BLOCKED (partial) | Pages exist, but the grid and Flexbox exercises are not completable as written (CR-01) |
| EXER-03 | SATISFIED | Both `exercises.mdx` indexes; `indexes` check passes |
| EXER-04 | SATISFIED | `solutions` check passes |
| AUDIT-01 | SATISFIED | `audit` check passes |
| AUDIT-02 | SATISFIED | `kept` and `commits` checks pass (see WR-12 caveat) |
| AUDIT-03 | SATISFIED | `screenshots` check passes |

All six IDs are accounted for in REQUIREMENTS.md. No orphaned requirements.

## Anti-Patterns / Review Warnings (not blockers on their own)

Content paragraphs that contradict the code they describe, none caught by the checkers (full detail in 06-REVIEW.md): WR-01 (Flexbox goal 4), WR-02 (flag replaces `$83` bits), WR-03 (Button link goes to docs root), WR-04 (`inline-grid` vs `grid`), WR-05 (`display: grid;` line missing), WR-06 (wrong `justify-self` claim), WR-07 (`demos` vs `demo`), WR-08 (icon pools misdescribes DWC2.bbj), WR-09 (Chart.js clears ON_PAGE_LOADED instead of ON_SCRIPT_LOADED), WR-10 to WR-13 (duplicate screenshots, getClientFile argument, checker blind spots). Fix these in the same gap-closure pass; WR-01 and WR-02 directly affect exercise completability.

## Behavioral Spot-Checks

| Check | Result |
|---|---|
| `python3 tools/check-dwc-phase6.py all` | All 9 subcommands, 0 failed |
| grep `css!` in exercise pages vs starters | Pages: 7 hits; starters: 0 (use `json!`) |

I did not run `npm run build`, Vale or the verify scripts in this pass. The review reports the build as passing.

## Human Verification Required

1. **Run `! bash tools/verify-phase6.sh`** (and the phase 1 to 5 verify scripts). Expected: all green. Denied for me.
2. **Light and dark rendering** of the "Possible solution" blocks. Expected: readable in both themes, collapsed by default.
3. **Marked screenshots** (`{/* TODO: screenshot outdated? */}`) and the hard-coded-fill SVG in chapter 01. Expected: no marker leaks into the page, and the SVG is legible in dark mode.

## Gaps Summary

One blocker. The Grid and Flexbox exercise pages instruct readers to modify a `css!` variable that does not exist in the provided starter programs, so these exercises cannot be done as written. The fix is small and mechanical (seven goal lines), but the goal "the DWC book carries its exercises" is not met until it is made. Once fixed, plus the WR-01 and WR-02 exercise text corrections, re-verify. Human items 1 to 3 remain after that.

_Verified: 2026-10-04_
_Verifier: Claude (gsd-verifier)_
