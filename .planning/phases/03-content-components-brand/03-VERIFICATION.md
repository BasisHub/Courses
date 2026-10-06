---
phase: 03-content-components-brand
verified: 2026-10-06T00:00:00Z
status: passed
score: 12/12 must-haves verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 10/12
  gaps_closed:
    - "One command (bash tools/verify-phase3.sh) proves COMP-01 to COMP-06, SITE-05 and D-11 with PASS/FAIL lines (CR-01, commit 9e8ec23)"
    - "Navbar shows book navigation at desktop widths (CR-02, commit b9c05d5)"
    - "Print output keeps full code (CR-03, commit 92034c9)"
  gaps_remaining: []
  regressions: []
environment_caveats:
  - check: "verify-phase3.sh [site05] favicon 32x32 and social cover 1200x630"
    cause: "The `file` command is not installed in the verification container; verify-phase3.sh:132-133 pipe `file` into grep, so both checks FAIL without it."
    evidence: "PNG IHDR read with python: docs/static/img/favicon-32.png = 32x32, docs/static/img/social-cover.png = 1200x630. Assets are correct."
    suggestion: "Have the script fall back to reading the PNG IHDR header (bytes 16-23) when `file` is absent."
---

# Phase 3: Content Components and Brand Verification Report

**Phase Goal:** Authors can use every shared component the books need, and the site carries the BASIS brand, before any real content lands
**Verified:** 2026-10-06
**Status:** passed
**Re-verification:** Yes. The previous report (2026-10-03, gaps_found, 10/12) predates the code-review fixes in 03-REVIEW-FIX.md.

## Prior gaps and how each closed

| ID | Prior gap | Fix | Evidence in code (2026-10-06) | Status |
| --- | --- | --- | --- | --- |
| CR-01 | verify-phase3.sh required 4 or more "Copy code to clipboard" strings in static HTML; the button is BrowserOnly, so the suite could never pass | 9e8ec23 | `grep "Copy code to clipboard" tools/verify-phase3.sh` finds nothing. Line 90 counts `class="prism-code` (4 or more), line 91 checks `line41`, line 93 checks `open41`. The current build has 5 prism-code blocks, `line41` present, 2 collapsed blocks. Copy behavior moved to UAT test 6 (pass) | CLOSED |
| CR-02 | `_navbar.scss` `@media (max-width: 1260px)` hid the last two left items, which are the only two book links, between 997 and 1260 px | b9c05d5 | `_navbar.scss` has no `1260`, no `nth-last-child` and no `display: none`; the only media query left is `max-width: 996px`. Config still generates the two `position: 'left'` book items. UAT test 2 (pass) confirms both links visible at 997 to 1260 px | CLOSED |
| CR-03 | `_print.scss` did not undo the collapse, so collapsed code printed truncated | 92034c9 | `_print.scss` sets `.expandable-code--collapsed .expandable-code__body { max-height: none !important; overflow: visible !important; }` and hides `::after`, `.expandable-code__toggle` and `.table-wrapper__expand`. Selectors match ExpandableCode/index.js and styles.css. `custom.scss:20` has `@use "./print"`. UAT test 11 (pass) confirms full code in print preview | CLOSED |

## Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | COMP-01 exercise admonition registered | VERIFIED | theme/Admonition/Types.js, _alerts.scss; verify-phase3 comp01 PASS; UAT test 4 pass (both themes) |
| 2 | COMP-02 YouTube no-import, nocookie facade | VERIFIED | components/YouTube registered in MDXComponents.js; UAT test 7 pass (no requests before click, nocookie iframe, focus moves) |
| 3 | COMP-03 BBj grammar extends Prism | VERIFIED | `node tools/test-bbj-grammar.js` PASS; UAT test 5 pass |
| 4 | COMP-04 collapsible >40 lines, copy button | VERIFIED | ExpandableCode + CodeBlock swizzle; verify-phase3 prism-code/line41/open41 PASS; UAT test 6 pass (copy yields all 41 lines) |
| 5 | COMP-05 Tabs, DocCardList, Mermaid, TableWrapper, zoom | VERIFIED | Config/package.json wiring; UAT tests 8 and 9 pass |
| 6 | COMP-06 local search, Algolia commented | VERIFIED | Config search item and commented Algolia block; UAT test 10 pass |
| 7 | SITE-05 logo, GitHub link, cover, favicon, footer | VERIFIED | verify-phase3 site05 index checks PASS; PNG headers 32x32 and 1200x630; UAT tests 2 and 3 pass |
| 8 | Navbar usable at desktop widths | VERIFIED | CR-02 closed (see above) |
| 9 | Fixture unlisted page exists | VERIFIED | docs/build/docs/authoring/components.html present; UAT test 10 confirms it is absent from search and sidebar |
| 10 | Acceptance suite verify-phase3.sh can pass | VERIFIED | CR-01 closed; 52 PASS, 2 FAIL, both FAILs environmental (see caveat) |
| 11 | Brand assets present | VERIFIED | basis-logo.svg, favicon.svg, favicon-32.png, social-cover.png present with correct dimensions |
| 12 | Print keeps code | VERIFIED | CR-03 closed; UAT test 11 pass |

**Score:** 12/12 truths verified (0 present, behavior-unverified)

## Suite and build results (orchestrator-recorded, 2026-10-06)

| Command | Result | Status |
| --- | --- | --- |
| `cd docs && npm run build` | exit 0 | PASS |
| `bash tools/verify-phase1.sh` | exit 0, 38 PASS, 0 FAIL | PASS |
| `bash tools/verify-phase2.sh --local` | exit 0, 120 PASS, 0 FAIL (vale 3.24.0, actionlint 1.7.12 installed) | PASS |
| `bash tools/verify-phase3.sh` | 52 PASS, 2 FAIL (`[site05] favicon 32x32`, `[site05] social cover 1200x630`) | PASS with environment caveat |
| `bash tools/prove-gates.sh` | exit 0, 5 PASS | PASS |

Verifier spot-checks run on 2026-10-06:

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| CR-01 check replaced | `grep -n "Copy code to clipboard\|prism-code\|line41" tools/verify-phase3.sh` | No copy-text check; lines 90, 91, 93 | PASS |
| Built fixture satisfies new checks | `grep -o 'class="prism-code' components.html \| wc -l`; `grep -c line41` | 5; 1 | PASS |
| PNG sizes | python IHDR read | favicon-32.png 32x32; social-cover.png 1200x630 | PASS |
| `file` availability | `command -v file` | not installed | caveat confirmed |

## Environment caveat (not a phase gap)

The two verify-phase3 FAILs come from `tools/verify-phase3.sh:132-133`, which pipe the `file` command into grep. `file` is not installed in this container, so both checks fail regardless of the assets. A direct PNG header read shows the assets have the required sizes. Suggested hardening: when `command -v file` fails, read bytes 16 to 23 of the PNG (IHDR width and height) instead.

## Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
| --- | --- | --- | --- |
| COMP-01 | 03-03, 03-05, 03-06 | SATISFIED | Truth 1 |
| COMP-02 | 03-03, 03-06 | SATISFIED | Truth 2 |
| COMP-03 | 03-02, 03-06 | SATISFIED | Truth 3 |
| COMP-04 | 03-04, 03-06 | SATISFIED | Truth 4, 12 |
| COMP-05 | 03-03, 03-04, 03-05, 03-06 | SATISFIED | Truth 5 |
| COMP-06 | 03-05, 03-06 | SATISFIED | Truth 6 |
| SITE-05 | 03-01, 03-05, 03-06 | SATISFIED | Truths 7, 8, 11 |

No orphaned requirements.

## Anti-Patterns

No TBD, FIXME, XXX, TODO or HACK markers in tools/verify-phase3.sh, docs/src/css/_navbar.scss or docs/src/css/_print.scss. From 03-REVIEW-FIX.md, 21 of 22 findings are fixed. IN-05 (collapsed height `1.31em + 2rem` ignores a code-block title bar, so a titled block shows fewer than 40 lines) stays open as an info-level item; it does not affect any must-have.

## Human Verification

All items in the previous human_verification list are covered by 03-UAT.md (status complete, 11/11 pass, 2026-10-03): suite runs (orchestrator, above), light/dark and exercise palette (tests 2, 4, 5), YouTube facade (test 7), collapse and copy (test 6), Mermaid, table dialog, zoom and search (tests 8, 9, 10), favicon, logo and social cover (tests 2, 3), print preview (test 11). No open human items.

## Gaps Summary

None. The three gaps from the 2026-10-03 report are closed in code and confirmed by build, suites and UAT. The only red lines in verify-phase3.sh are environmental (missing `file` binary), recorded above as a caveat with a suggested fallback.

---

_Verified: 2026-10-06_
_Verifier: Claude (gsd-verifier)_
