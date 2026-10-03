---
phase: 03-content-components-brand
verified: 2026-10-03T19:30:00Z
status: gaps_found
score: 10/12 must-haves verified
gaps:
  - truth: "One command (bash tools/verify-phase3.sh) proves COMP-01 to COMP-06, SITE-05 and D-11 with PASS/FAIL lines"
    status: failed
    reason: "CR-01 confirmed. verify-phase3.sh:75 expects >=4 'Copy code to clipboard' in static HTML; build/docs/authoring/components.html contains 0 (button is BrowserOnly). The suite cannot go green."
    artifacts:
      - path: "tools/verify-phase3.sh"
        issue: "line 75 check is unsatisfiable"
    missing:
      - "Replace with an SSR-observable check (e.g. count of prism-code blocks, full text of collapsed block in DOM); move copy behaviour to human check"
  - truth: "Navbar shows book navigation (SITE-05 navbar / phase goal: site carries brand with working navigation)"
    status: failed
    reason: "CR-02 confirmed. _navbar.scss:147-151 hides .theme-layout-navbar-left .navbar__item:nth-last-child(-n+2) at <=1260px. Config has only 2 left items (the book links), so both are hidden from 997-1260px, where Docusaurus has not yet switched to the mobile menu (<=996px)."
    artifacts:
      - path: "docs/src/css/_navbar.scss"
        issue: "copied webforJ rule hides the only two book links"
    missing:
      - "Delete the max-width:1260px rule"
  - truth: "Print output keeps full code (COMP-04 collapsible code must not lose content)"
    status: partial
    reason: "CR-03 confirmed. _print.scss has no override for .expandable-code--collapsed max-height/overflow, nor the toggle button. Collapsed blocks print truncated. Not a stated ROADMAP criterion, so a warning-level gap."
    artifacts:
      - path: "docs/src/css/_print.scss"
        issue: "no undo of collapse"
    missing:
      - "Print rule setting max-height:none, overflow:visible, hiding ::after and toggle"
human_verification:
  - test: "Run bash tools/verify-phase1.sh, bash tools/verify-phase2.sh --local, bash tools/verify-phase3.sh, bash tools/prove-gates.sh"
    expected: "All green (phase3 only after CR-01 is fixed)"
    why_human: "Script execution was permission-denied for agents"
  - test: "Toggle light/dark; view exercise admonition, tables, code blocks"
    expected: "DWC success palette on exercise box, readable in both themes"
    why_human: "Visual"
  - test: "Click the YouTube poster with DevTools network open"
    expected: "No request to YouTube/Google before click; youtube-nocookie iframe after"
    why_human: "Browser behaviour"
  - test: "Open a >40-line fence, toggle, press copy"
    expected: "Collapsed to ~40 lines; copy yields full code"
    why_human: "Collapse height and clipboard"
  - test: "Mermaid diagram, table expand dialog, image zoom, Cmd+K search on production build"
    expected: "SVG renders, dialog opens, image zooms, search finds stub book text"
    why_human: "Browser only"
  - test: "Check favicon at 16/32 px, white-wordmark navbar logo, social cover"
    expected: "Legible, on-brand"
    why_human: "Visual brand judgement"
  - test: "Print preview of components page"
    expected: "Full code after CR-03 fix"
    why_human: "Print rendering"
---

# Phase 3: Content Components and Brand Verification Report

**Phase Goal:** Authors can use every shared component the books need, and the site carries the BASIS brand, before any real content lands
**Status:** gaps_found
**Re-verification:** No

## Independent check of review blockers

| ID | Verdict | Evidence |
| --- | --- | --- |
| CR-01 | Confirmed | `grep -c "Copy code to clipboard" docs/build/docs/authoring/components.html` returns 0; the check at verify-phase3.sh:75 requires >=4 |
| CR-02 | Confirmed | docusaurus.config.js navbar: only two `position: 'left'` items (books); the `<=1260px` rule in _navbar.scss:147 hides the last two left children |
| CR-03 | Confirmed | _print.scss lines 1-63 contain no rule touching `.expandable-code`; ExpandableCode/styles.css:5-8 clips collapsed body |

## Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | COMP-01 exercise admonition registered | VERIFIED (code) | theme/Admonition/Types.js, _alerts.scss present; visual check human |
| 2 | COMP-02 YouTube no-import, nocookie facade | VERIFIED (code) | components/YouTube, registered in MDXComponents.js; WR-03 focus loss is a warning |
| 3 | COMP-03 BBj grammar extends Prism | VERIFIED | `node tools/test-bbj-grammar.js` all PASS; WR-01/02 are mis-tokenization warnings |
| 4 | COMP-04 collapsible >40 lines, copy button | VERIFIED (code) | ExpandableCode + CodeBlock swizzle; copy-button runtime in human list |
| 5 | COMP-05 Tabs, DocCardList, Mermaid, TableWrapper, zoom | VERIFIED | docusaurus-plugin-zooming in config/package.json, TableWrapper present (03-05 delivered zoom; checkbox now matches reality) |
| 6 | COMP-06 local search, Algolia commented | VERIFIED | config has search item and commented Algolia block with placeholders |
| 7 | SITE-05 logo, GitHub link, cover, favicon, footer | VERIFIED (assets/config) | basis-logo.svg, favicon.svg, social-cover.svg, `image: img/social-cover.png`, footer line in config |
| 8 | Navbar usable at desktop widths | FAILED | CR-02 |
| 9 | Fixture unlisted page exists | VERIFIED | docs/build/docs/authoring/components.html exists |
| 10 | Acceptance suite verify-phase3.sh can pass | FAILED | CR-01 |
| 11 | Brand assets present | VERIFIED | files exist |
| 12 | Print keeps code | PARTIAL | CR-03 |

**Score:** 10/12

## Requirements Coverage

All seven IDs (COMP-01..06, SITE-05) appear in PLAN frontmatter (03-06 lists all) and in REQUIREMENTS.md, checked [x] and mapped Complete. No orphans. COMP-05 checkbox is consistent with 03-05 delivering zoom. SITE-05 is satisfied except for the navbar book-link defect (CR-02), which does not remove logo or GitHub link but defeats navigation.

## Anti-Patterns

CR-01..03 above; 10 warnings in 03-REVIEW.md (WR-01 keyword/suffix variable tokenization, WR-02 strings across newlines, WR-03 YouTube focus, WR-04 ExpandableCode) remain open.

## Gaps Summary

Components and brand are present and wired. Two small blockers prevent sign-off: the acceptance suite has an unsatisfiable check (CR-01), and the navbar hides both book links at 997-1260px (CR-02). CR-03 is a print content-loss gap. All three are one-line to few-line fixes. Shell suites were not executed by me and are listed for human confirmation.

_Verified: 2026-10-03_
_Verifier: Claude (gsd-verifier)_
