---
phase: 01-site-scaffold-quality-gates
verified: 2026-10-03T00:00:00Z
status: human_needed
score: 6/6 roadmap success criteria verified in code (SC2 and SC3 have visual or network parts left for a human)
overrides_applied: 0
gaps: []
human_verification:
  - test: "Open the served site (npm run build && npm run serve in docs/) at /Courses/ in a real browser, in light and in dark mode (OS setting and the animated toggle)."
    expected: "DWC look matches docs.webforj.com in both modes. The toggle animates and persists. Landing shows intro-bbj card first, then dwc. Navbar items carry book icons."
    why_human: "Visual fidelity and animation cannot be checked by grep. Headless dark-mode screenshots failed on prefers-color-scheme."
  - test: "Open DevTools Network panel (disable cache), load /Courses/ and a doc page."
    expected: "Every request is same-origin. Inter and JetBrains Mono load from /Courses/assets/fonts/*.woff2, dwc-ui.css from /Courses/css/dwc-ui.css. No fonts.googleapis.com, fonts.gstatic.com or cdn.webforj.com."
    why_human: "Static build grep is clean (see SC3), but the browser network panel is the stated criterion."
  - test: "Re-run bash tools/verify-phase1.sh --with-ci after commit f4d79f5."
    expected: "39/39 PASS. The earlier 'no external font/CDN hosts' FAIL was a false positive on the provenance comment in css/dwc-ui.css line 1."
    why_human: "Agents may not execute the script. The narrowed check has not been re-run."
  - test: "Print preview (Cmd+P) of a doc page, in light and in dark mode."
    expected: "Navbar, sidebar, TOC, footer, pagination hidden. Code and admonitions stay readable in dark mode (WR-03 risk)."
    why_human: "Print rendering is visual. The dark-mode print case is untested."
  - test: "Verify the stub line PRINT \"Hello, World!\" with the BBj docs MCP (bbj_check_syntax) in the two sample-page.md files."
    expected: "Valid BBj. If not, fix the stub."
    why_human: "CLAUDE.md requires BBj code to be MCP-verified. The MCP was unavailable this session."
---

# Phase 1: Site Scaffold & Quality Gates Verification Report

**Phase Goal:** A reader can open a two-book stub site under `/Courses/` that looks like webforJ/DWC in light and dark mode, and any broken link or image fails the build
**Status:** human_needed (no blocking gaps found; visual/network/script re-run checks remain)
**Re-verification:** No, initial verification

## Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Landing at /Courses/ with a card per book from books.js; each opens /Courses/docs/<book>/..., own sidebar, navbar item with icon | VERIFIED (build) | I ran `npm run build` and it succeeded. `build/index.html`, `docs/intro-bbj/overview` and `docs/dwc/overview` exist. config builds navbar `docSidebar` items from `books.map` with `book-icon--<id>` classes plus `bookIconsCss()` headTag. Sidebars are per-book. Serve smoke is covered by human-run verify-phase1 (38 PASS). |
| 2 | DWC look in light and dark mode; animated switcher and link decorator work under /Courses/ | PARTIAL: wired, visual is human | `scripts` use the `${baseUrl}js/...` constant. Both JS files exist in `build/js`. `colorMode.respectPrefersColorScheme: true`. Look and animation: human item. See WR below for the decorator loop bug. |
| 3 | Inter, JetBrains Mono and dwc-ui.css served from the site | VERIFIED (static) | `grep -rlE "fonts.googleapis\|fonts.gstatic\|cdn.webforj"` over `build/` returns only `css/dwc-ui.css`, and the single match is the provenance comment on line 1. Fonts are emitted under `build/assets/fonts/*.woff2` via Fontsource. `stylesheets` points to `/Courses/css/dwc-ui.css`. Browser network panel: human item. |
| 4 | Broken link, anchor, Markdown link, Markdown image each fail the build | VERIFIED (config) + human-run proof | Config sets `onBrokenLinks`, `onBrokenAnchors`, `markdown.hooks.onBrokenMarkdownLinks`, `onBrokenMarkdownImages` all to `'throw'`. Stephan ran `tools/prove-gates.sh` with 5/5 PASS (clean build plus four deliberate failures). I did not run it, as agents are denied. |
| 5 | sitemap.xml and llms.txt/llms-full.txt list both books under /Courses/; print hides navbar, sidebar, TOC | VERIFIED | `sitemap.xml` has 7 `<loc>` entries under `https://basishub.github.io/Courses/` covering both books. `llms.txt` lists 6 docs for both books. `llms-full.txt` has both books' sections (6 documents processed). `_print.scss` `@media print` hides `.navbar`, `.theme-doc-sidebar-container`, `.theme-doc-toc-desktop/mobile`, footer, pagination. Actual print output: human item. |
| 6 | import/ gitignored; lockfile and exact 3.10.2 pins committed; tools/requirements.txt | VERIFIED | `git check-ignore import` matches. `git ls-files import` is empty. `docs/package-lock.json` and `tools/requirements.txt` are tracked. Six `@docusaurus/*` packages are all `3.10.2` exact (core, plugin-client-redirects, preset-classic, theme-mermaid, module-type-aliases, types). Python pins use `==`. |

**Score:** 6/6 criteria satisfied in code; 2 carry human-only parts.

## Requirements Coverage

All nine IDs from PLAN frontmatter (01: REPO-04, REPO-05; 02: SITE-02, SITE-04, SITE-08; 03: SITE-01, SITE-03, SITE-06, SITE-07) match REQUIREMENTS.md and the ROADMAP list. No orphans. SITE-05 is mapped to Phase 3, not this phase.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| SITE-01 | SATISFIED | books.js-driven landing, build output verified |
| SITE-02 | SATISFIED in code, look is human | SCSS set, switcher, decorator wired under baseUrl |
| SITE-03 | SATISFIED | per-book sidebars, navbar items with icons |
| SITE-04 | SATISFIED (static) | no external hosts in build apart from a comment |
| SITE-06 | SATISFIED | all four hooks at throw; prove-gates 5/5 (human-run) |
| SITE-07 | SATISFIED | sitemap and llms outputs verified |
| SITE-08 | SATISFIED in code | print stylesheet present; dark-mode print is untested |
| REPO-04 | SATISFIED | ignored, nothing tracked |
| REPO-05 | SATISFIED | exact pins, lockfile, requirements.txt |

## Anti-Patterns and Review Findings (advisory, none blocks the goal)

No TBD, FIXME or XXX markers were checked beyond the review. Findings from 01-REVIEW.md that I confirmed or weigh in on:

| Item | Severity | Note |
|------|----------|------|
| CR-01 `docs/static/js/link-decorator.js:9-19` runs `tryDecorate` as an event listener, so `retries` becomes an Event and the 50 ms loop never ends (confirmed in code). Each popstate adds another loop. | WARNING | The decorator works but wastes CPU. It does not break SC2. Fix before the content phases. |
| CR-02 No LICENSE or THIRD_PARTY notice with the MIT permission text. Only one-line pointers exist (confirmed: no LICENSE file at the root). | WARNING | The plan truth (one-line provenance) is met, but the CLAUDE.md constraint "copied webforJ files keep their MIT notice" is arguably not. Add the notice file. |
| WR-01 `@tabler/icons` and `docusaurus-plugin-llms` are devDependencies but needed at build time | WARNING | Breaks under `npm ci --omit=dev`. The CI plan in Phase 2/3 should install normally or move them. |
| WR-02 unanchored `import/` in .gitignore | WARNING | Use `/import/`. |
| WR-03 dark-mode print | WARNING | Human item above. |
| WR-04 to WR-07 weak or leaky checks in tools/verify-phase1.sh | WARNING | Test-harness quality only. The build facts above were checked independently. |
| Build warning: postcss-calc lexical error on `c * 3` in minified CSS | INFO | Build still succeeds. Likely from vendored CSS. |
| BBj stub line unverified against MCP | WARNING | Human item. |

No stubs affecting the goal: the stub book pages are intentional placeholders for this phase.

## Gaps Summary

No blocking gaps. All six success criteria are backed by code and my own independent `npm run build` (success, both books in sitemap and llms outputs, no external hosts in the build). Status is `human_needed` because the DWC look in both modes, the same-origin network panel, the re-run of verify-phase1 after f4d79f5, dark-mode printing and the BBj MCP check cannot be confirmed programmatically. Recommended follow-up: fix CR-01, add the MIT notice (CR-02), anchor `/import/`.

---

_Verified: 2026-10-03_
_Verifier: Claude (gsd-verifier)_
