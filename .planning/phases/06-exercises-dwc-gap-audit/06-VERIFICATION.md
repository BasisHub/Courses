---
phase: 06-exercises-dwc-gap-audit
verified: 2026-10-04T18:00:00Z
status: human_needed
score: 4/4 roadmap truths verified
re_verification:
  previous_status: gaps_found
  previous_score: 3/4
  gaps_closed:
    - "CR-01: grid and Flexbox exercise pages told the reader to edit a css! variable that the starters do not have"
    - "WR-01 (Flexbox goal 4) and WR-02 (flag $00100000$ vs $00100083$) exercise text"
    - "WR-03..WR-13 content and checker defects, per 06-REVIEW.md re-review"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Open the 'Possible solution' blocks in light and dark mode"
    expected: "Collapsed by default, readable in both themes"
    why_human: "Visual rendering"
  - test: "Look at the screenshots marked with the outdated-screenshot TODO comment, and the hard-coded-fill SVG in chapter 01"
    expected: "No marker text leaks into the page; SVG legible in dark mode"
    why_human: "Visual rendering"
  - test: "Run bash tools/verify-phase2.sh --local on branch main after merge"
    expected: "Fully green; the only failure so far is the '[hygiene] branch is main' check, which fails because the work sits on gsd/phase-04-dwc-book-relocation"
    why_human: "Environmental, depends on merge state"
---

# Phase 6: Exercises & DWC Gap Audit Verification Report (re-verification)

**Phase Goal:** The DWC book carries its exercises and all worthwhile course-4 material, and both books have an exercise index
**Status:** human_needed (no gaps; only visual and environmental checks remain)
**Re-verification:** Yes, after gap closure plans 06-18..06-21

## Previous gaps

| Previous gap | Now | Evidence |
|---|---|---|
| CR-01: `css!` in 7 goals of the grid and Flexbox exercises, starters use `json!` | CLOSED | `grep -c 'css!'` on both pages: 0. `grep -c 'json!'`: 15 (grid), 12 (Flexbox). The remaining `css!` hits are in the separate demo `docs/examples/dwc/05_CssLayouts/DWCFlexbox.bbj`, not in exercise starters. |
| WR-02: flag `$00100000$` replaced the `$83` bits | CLOSED | Exercise 01 line 18 now says to add `$00100083$` and explains that this adds the flow-layout bit `$00100000$` to the `$83` flags. |
| WR-01 (Flexbox goal 4) and WR-03..WR-13 | CLOSED | 06-REVIEW.md re-review (committed) reports all resolved. I did not re-read every paragraph. The checks below back this up. |

## Goal Achievement

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | DWC exercises as `9N-exercise-*.mdx`; each book has an exercise index | VERIFIED | 11 exercise pages in `docs/docs/dwc/*/9*-exercise-*.mdx`. `check-dwc-phase6.py exercises`: 456 checks, 0 failed. `indexes`: 64, 0 failed. `pointers`: 21, 0 failed. CR-01 is closed, so the grid and Flexbox pages now agree with their starters. |
| 2 | Possible solution in collapsed block where a sample exists | VERIFIED | `solutions`: 92 checks, 0 failed. |
| 3 | `tools/data/dwc-gap-audit.md` with keep/drop/covered verdicts | VERIFIED | `audit`: 4471 checks, 0 failed. |
| 4 | Kept material on DWC pages as a commit series, no slug renames; 2022 screenshots marked | VERIFIED | `kept`: 974, `commits`: 46, `screenshots`: 450 checks, 0 failed. 59 listed entries and 59 marked references. |

**Score:** 4/4

## Requirements Coverage

| ID | Status | Evidence |
|---|---|---|
| EXER-02 | SATISFIED | 11 exercise pages; CR-01 closed; `exercises` check passes |
| EXER-03 | SATISFIED | Both `exercises.mdx` indexes; `indexes` check passes |
| EXER-04 | SATISFIED | `solutions` check passes |
| AUDIT-01 | SATISFIED | `audit` check passes |
| AUDIT-02 | SATISFIED | `kept` and `commits` pass |
| AUDIT-03 | SATISFIED | `screenshots` pass |

All six IDs appear in REQUIREMENTS.md and in plan frontmatter. No orphaned requirements.

## Behavioral Spot-Checks and Probes

| Check | Result |
|---|---|
| `python3 tools/check-dwc-phase6.py all --build docs/build` (run by me) | All 8 modes, 0 failed |
| grep `css!` / `json!` in the grid and Flexbox exercise pages | 0 / 15 and 0 / 12 |
| Debt markers (TBD, FIXME, XXX) in exercise pages | None |
| Build, Vale (0 errors), prove-gates, verify-phase1/3/4/5/6, `bbj_check_syntax`, `bbj_lookup` | Reported by the orchestrator. I did not rerun them. |

## Review warning: starter-consistency check covers 6 of 11 pages

The check only runs for the 6 pages with a SOLUTIONS entry. The 5 pages without one are theming, bbjgridexwidget, embed-component, media-queries and button-transition. I grepped all 11 pages for backticked `name!` / `name$` identifiers. Only the grid and Flexbox pages contain any (`json!`), and both are covered by the check. The 5 unchecked pages name no starter variable, so the CR-01 failure class cannot currently occur there. **Advisory, not a goal blocker.** Extending the check to a separate `STARTERS` map is worthwhile hardening for Phase 7.

## Anti-Patterns

None blocking. The 5 info items in 06-REVIEW.md are cosmetic (for example dead defensive code in the checker).

## Human Verification Required

1. **Light and dark rendering of the "Possible solution" blocks.** Expected: collapsed by default, readable in both themes.
2. **Outdated-screenshot marker comments and the hard-coded-fill SVG in chapter 01.** Expected: no marker leaks into the page; SVG legible in dark mode.
3. **`verify-phase2.sh --local` on `main`.** The `[hygiene] branch is main` failure is environmental: the work sits on `gsd/phase-04-dwc-book-relocation`. Expected: green after merge.

## Gaps Summary

No gaps. The one blocker from the previous report (CR-01, with WR-01 and WR-02) is closed, and all automated checks pass. Only human visual checks and the post-merge branch check remain.

_Verified: 2026-10-04_
_Verifier: Claude (gsd-verifier)_
