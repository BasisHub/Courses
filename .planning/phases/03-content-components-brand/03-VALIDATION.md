---
phase: 3
slug: content-components-brand
status: draft
nyquist_compliant: false
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

Filled in by the planner per task. Requirement-level map from RESEARCH.md:

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| COMP-01 | `:::exercise` renders with `alert--success alert--exercise`, default title "Try it yourself", no "No admonition component found" in build log | build + grep | `grep -q 'alert--exercise' docs/build/docs/authoring/components/index.html` | ❌ W0 | ⬜ pending |
| COMP-02 | `<YouTube>` global, no iframe / youtube host in SSR HTML, nocookie host in component | build + grep | `! grep -q '<iframe' <fixture html>`; `grep -q youtube-nocookie.com docs/src/components/YouTube/index.js`; no `import YouTube` in `.mdx` | ❌ W0 | ⬜ pending |
| COMP-03 | BBj tokens: variable, label, field, mnemonic, `""` string, class-name (35 verified names), comment, added keywords; `not` removed from operator | node | `node tools/test-bbj-grammar.js` | ❌ W0 | ⬜ pending |
| COMP-04 | >40 lines collapse (40 stays open, 41 collapses); copy button on every block; copy gets full code | build + grep | grep fixture HTML for collapse class and copy button aria-label | ❌ W0 | ⬜ pending |
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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
