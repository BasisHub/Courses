---
phase: 03
slug: content-components-brand
status: verified
threats_open: 0
asvs_level: 1
created: 2026-10-03
---

# Phase 3: Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| local file -> repo | Brand source vector read locally, derived SVG/PNG committed | Public brand artwork |
| SVG asset -> browser | Committed SVGs served as images | Static markup, no script |
| author Markdown -> Prism tokenizer | Code fence text tokenized at build and in the browser | Public sample code |
| author MDX props -> iframe URL | YouTube id/title from page source build the embed URL | Video id (validated) |
| reader browser -> YouTube/Google | Third-party request, only after an explicit click | Reader IP, cookies-free embed |
| author Markdown -> React render | Code and table content rendered by components | Public content |
| npm registry -> repo | search-local and zooming packages enter the build | Third-party code |
| built site -> crawlers/LLMs/public | sitemap, llms.txt and the unlisted fixture are public | Page lists, demo content |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-03-01 | Information disclosure | social-cover.svg fonts | mitigate | System font stack only; no href/@import/url() (social-cover.svg:9-10) | closed |
| T-03-02 | Tampering | SVG script injection | mitigate | Only svg/g/path/rect/style/text elements; no script, foreignObject, on* or href | closed |
| T-03-03 | Repudiation | trademarked artwork altered | mitigate | basis-logo.svg keeps 20 shapes (18 path, 2 rect); only .st1 fill changed (commit 4de8297) | closed |
| T-03-04 | Denial of service | bbj-extend.js regexes | mitigate | Linear patterns, no nested quantifiers; escaped literal class alternation; test-bbj-grammar.js runs in 0.07 s after WR-01/WR-02/IN-02 | closed |
| T-03-05 | Tampering | wrong Prism instance patched | mitigate | prism-include-languages.js:7-9 patches only the passed PrismObject; prismjs devDependency imported only by tools/test-bbj-grammar.js | closed |
| T-03-06 | Repudiation | unverified BBj tokens | mitigate | bbj-classes.json has 35 classes, asserted by test-bbj-grammar.js:118; evidence in tools/data/bbj-token-verification.md | closed |
| T-03-07 | Information disclosure | YouTube facade | mitigate | Button + consent line only before click; iframe on youtube-nocookie.com after; verify-phase3.sh:74-76 greps built HTML | closed |
| T-03-08 | Tampering | iframe src from id prop | mitigate | YouTube/index.js:4 ID_PATTERN ^[A-Za-z0-9_-]{11}$, throws on mismatch; fixed https host + encodeURIComponent; no URL prop | closed |
| T-03-09 | Spoofing | iframe sandboxing | accept | YouTube's own origin; allow list limited to autoplay, encrypted-media, picture-in-picture, fullscreen | closed |
| T-03-10 | Elevation of privilege | forbidden webforJ components | mitigate | No DocChip/JavadocLink/ComponentDemo/@mui in src, config, package.json, sidebars.js | closed |
| T-03-11 | Tampering | ExpandableCode/TableWrapper rendering | mitigate | No dangerouslySetInnerHTML anywhere in docs/src | closed |
| T-03-12 | Information disclosure | copy of collapsed code | mitigate | Full code rendered, CSS-clipped (ExpandableCode/styles.css:6-7); copy returns full text (UAT test 6 passed) | closed |
| T-03-13 | Tampering | supply chain via MUI | mitigate | No @mui/@emotion imports or dependencies | closed |
| T-03-SC | Tampering | npm: @easyops-cn/docusaurus-search-local 0.55.3, docusaurus-plugin-zooming 1.0.0 | mitigate | No hasInstallScript on either; @docusaurus/* exact 3.10.2 (package.json:30-33); CI uses npm ci (deploy.yml:34, test-build.yml:33) | closed |
| T-03-14 | Information disclosure | Algolia block | mitigate | Commented out with placeholders only (docusaurus.config.js:114-116) | closed |
| T-03-15 | Information disclosure | fixture in llms.txt | mitigate | ignoreFiles: ['authoring/**'] (docusaurus.config.js:84-85); verify-phase3.sh:117-120 greps sitemap and llms files | closed |
| T-03-16 | Information disclosure | third-party hosts in built HTML | mitigate | Local lunr search index; verify-phase3.sh:137 fails on Google Fonts/CDN hosts | closed |
| T-03-17 | Information disclosure | unlisted fixture | accept | unlisted is obscurity only; fixture holds public demo content; noindex and sitemap/search/llms exclusion verified | closed |
| T-03-18 | Information disclosure | third-party requests on page load | mitigate | verify-phase3.sh:74 scans all built HTML for iframe/ytimg/youtube.com/embed; :137 for font/CDN hosts | closed |
| T-03-19 | Tampering | unverified BBj code on a public page | mitigate | Single bbj fence (components.mdx:25) re-checked 2026-10-03 with bbj_check_syntax: no errors (stock BBj 26.03) | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-09 | The player runs on YouTube's own origin after an explicit click; the allow list grants only autoplay, encrypted-media, picture-in-picture and fullscreen. Sandboxing would break playback. | Plan 03-03 threat model | 2026-10-03 |
| AR-03-02 | T-03-17 | The component fixture is public demo content; unlisted plus noindex and sitemap/search/llms exclusion is enough. No access control is needed. | Plan 03-06 threat model | 2026-10-03 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-03 | 20 | 20 | 0 | gsd-security-auditor (sonnet) + orchestrator re-checks: bbj_check_syntax on T-03-19 snippet, verify-phase3.sh --no-build all PASS |

## Security Audit 2026-10-03
| Metric | Count |
|--------|-------|
| Threats found | 20 |
| Closed | 20 |
| Open | 0 |

Audited on HEAD after the 21 code-review fixes (03-REVIEW-FIX.md). No unregistered threat flags.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-03
