---
phase: 3
slug: content-components-brand
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-03
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No unit test framework. Gates are build + grep + node scripts, same style as `tools/verify-phase1.sh` / `tools/verify-phase2.sh` |
| **Config file** | none; Wave 0 adds `tools/verify-phase3.sh` and `tools/test-bbj-grammar.js` |
| **Quick run command** | `node tools/test-bbj-grammar.js` |
| **Full suite command** | `cd docs && npm run build && cd .. && bash tools/verify-phase3.sh && bash tools/verify-phase1.sh && bash tools/verify-phase2.sh --local && tools/.bin/vale docs/docs` |
| **Estimated runtime** | ~120 seconds (build dominates) |

---

## Sampling Rate

- **After every task commit:** `node tools/test-bbj-grammar.js` for grammar work; `cd docs && npm run build` for anything touching config, theme or components
- **After every plan wave:** full suite command
- **Before `/gsd:verify-work`:** full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Every task has an `<automated>` verify; the full command lives in the plan's `<verify>` block. Key gates per task:

| Task ID | Plan | Wave | Requirement | Automated Command (key gates) | Human check (end of phase) | Status |
|---------|------|------|-------------|-------------------------------|----------------------------|--------|
| 03-01-T1 | 03-01 | 1 | SITE-05 (D-02, D-05) | `basis-logo.svg` has `BCC9D2`, no `26446B`, no `enable-background`, no comments, 20 shapes; `file favicon-32.png` reports 32 x 32; `favicon.svg` viewBox 0 0 32 32 | Stephan: favicon legible at 16/32/180 px | ⬜ pending |
| 03-01-T2 | 03-01 | 1 | SITE-05 (D-06) | `file social-cover.png` reports 1200 x 630; SVG has "Courses" and tagline, no external hrefs/fonts; PNG under 300 KB | Stephan: cover layout | ⬜ pending |
| 03-02-T1 | 03-02 | 1 | COMP-03 | `node tools/test-bbj-grammar.js && cd docs && npm run build`; 35 unique classes; `grep -cE '^\s*import\b' bbj-extend.js` = 0 | none | ⬜ pending |
| 03-02-T2 | 03-02 | 1 | COMP-03 | `tools/data/bbj-token-verification.md` has `fd516a9d`, `No errors found`, every class name, no em dash | none | ⬜ pending |
| 03-03-T1 | 03-03 | 1 | COMP-01 | `alert--exercise` and "Try it yourself" in `Admonition/Types.js`; `_alerts.scss` MIT header; no color literals in `.alert--exercise`; build | fixture look in both themes | ⬜ pending |
| 03-03-T2 | 03-03 | 1 | COMP-02 | `youtube-nocookie.com/embed` in component, no `ytimg`, 11-char id regex, print rule, `YouTube` in MDXComponents with MIT header, notices entry, no webforJ-only components; build | poster click plays video | ⬜ pending |
| 03-04-T1 | 03-04 | 2 | COMP-04 | CodeBlock wraps `theme-original/CodeBlock`, `COLLAPSE_AFTER_LINES = 40`, `noCollapse`, `CollapsibleShell` export, MIT header, no `@mui`, no color literals; build | exactly 40 preview lines while collapsed; copy copies all lines | ⬜ pending |
| 03-04-T2 | 03-04 | 2 | COMP-05 | TableWrapper has `table-container` and `showModal`, MIT header; MDXComponents maps `table: TableWrapper`, `ExpandableCode`, `YouTube`; notices entries; no color literals; build | table dialog opens | ⬜ pending |
| 03-05-T1 | 03-05 | 3 | COMP-01, COMP-05, COMP-06, D-11 | all `@docusaurus/*` at 3.10.2; both new deps present; `keywords: ['exercise']`, zooming plugin, `ignoreFiles: ['authoring/**']`, commented algolia only; `npm ci && npm run build`; `build/search-index*.json` exists | Cmd+K opens search | ⬜ pending |
| 03-05-T2 | 03-05 | 3 | SITE-05 | navbar logo not inverted, MIT header; build; `index.html` has `basis-logo.svg`, GitHub link + class, `favicon-32.png`, `og:image` cover URL, one "All rights reserved.", current-year copyright, `BASIS Courses</title>`, 2+ `navbar-book` | lockup reads in both themes | ⬜ pending |
| 03-06-T1 | 03-06 | 4 | COMP-01..05, D-11 | no imports in fixture; Vale clean; build log free of "No admonition component found"; fixture has `alert--exercise`, 2+ "Try it yourself", `youtube-facade`, no iframe, 4 BBj token classes, exactly 2 `expandable-code--collapsed`, `tabs__item`, DWC overview card, `table-container`, `noindex`; `authoring` absent from sitemap and llms files; `flowchart LR` in a JS chunk or mermaid container class in fixture HTML | fixture in both themes; Mermaid renders | ⬜ pending |
| 03-06-T2 | 03-06 | 4 | all | `tools/verify-phase3.sh` executable, `set -u`, `--no-build`, sections grammar, comp01..comp06, unlisted, site05, hosts, headers | user runs `! bash tools/verify-phase3.sh` | ⬜ pending |
| 03-06-T3 | 03-06 | 4 | regression | CLAUDE.md and CONTRIBUTING.md mention fixture, `bbj-extend.js`, `verify-phase3.sh`, `ExpandableCode`; Vale clean on both plus `docs/docs`; grammar test; build | user runs verify-phase1/2/3 and prove-gates | ⬜ pending |

Requirement-level map from RESEARCH.md:

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| COMP-01 | `:::exercise` renders with `alert--success alert--exercise`, default title "Try it yourself", no "No admonition component found" in build log | build + grep | `grep -q 'alert--exercise' docs/build/docs/authoring/components.html` | ❌ W0 | ⬜ pending |
| COMP-02 | `<YouTube>` global, no iframe / youtube host in SSR HTML, nocookie host in component | build + grep | `! grep -q '<iframe' <fixture html>`; `grep -q youtube-nocookie.com docs/src/components/YouTube/index.js`; no `import YouTube` in `.mdx` | ❌ W0 | ⬜ pending |
| COMP-03 | BBj tokens: variable, label, field, mnemonic, `""` string, class-name (35 verified names), comment, added keywords; `not` removed from operator | node | `node tools/test-bbj-grammar.js` | ❌ W0 | ⬜ pending |
| COMP-04 | >40 lines collapse (40 stays open, 41 collapses); copy button on every block; copy gets full code | build + grep | exactly 2 `expandable-code--collapsed` in fixture HTML; 4+ copy button aria-labels | ❌ W0 | ⬜ pending |
| COMP-05 | Tabs, DocCardList (explicit items), Mermaid, table wrapper, image zoom | build + grep | grep fixture HTML for `tabs__item`, card, mermaid container, table wrapper; zooming in JS bundle | ❌ W0 | ⬜ pending |
| COMP-06 | search index has stub book text, no fixture; Algolia block commented | build + python | `python3` over `docs/build/search-index*.json`; `grep -q '// *algolia' docs/docusaurus.config.js` | ❌ W0 | ⬜ pending |
| SITE-05 | logo, GitHub link, favicon (svg + 32 px png), 1200×630 social cover, single-line footer | build + grep | grep built index for `basis-logo`, `github.com/BasisHub/Courses`, `og:image`; image dimension checks | ❌ W0 | ⬜ pending |
| D-11 | fixture unlisted: noindex, absent from sitemap, search, llms.txt | build + grep | `grep -q noindex`; `! grep -q authoring docs/build/sitemap.xml docs/build/llms*.txt` | ❌ W0 | ⬜ pending |
| Regression | Phase 1/2 gates + Vale | scripts | `bash tools/verify-phase1.sh && bash tools/verify-phase2.sh --local && tools/.bin/vale docs/docs` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/verify-phase3.sh` — PASS/FAIL checks for COMP-01..06, SITE-05, D-11
- [ ] `tools/test-bbj-grammar.js` — tokenizes the pre-verified snippet from RESEARCH.md "BBj MCP Verification" and asserts expected tokens
- [ ] `docs/docs/authoring/components.mdx` (+ `img/`) — unlisted fixture page
- [ ] `tools/data/bbj-token-verification.md` — copy of the orchestrator's MCP evidence (keywords, 35 classes, snippet check result, docs build fd516a9d)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Exercise box, BBj colors, YouTube poster, table, zoom look right in light and dark | COMP-01..05 | Visual | `npm run build && npm run serve`, toggle theme on `/Courses/docs/authoring/components` |
| Cmd+K opens search and finds stub text | COMP-06 | Keyboard interaction on production build | `npm run serve`, press Cmd+K, search a stub-page word |
| Click on YouTube poster loads nocookie iframe and plays | COMP-02 | Needs network + real video | Click poster on served build; also re-check after deploy (A5 referrer policy) |
| Favicon legible at 16/32 px; social cover layout | SITE-05 | Design judgement (Stephan reviews, D-05/D-06) | Open favicon and cover PNGs |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [ ] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
