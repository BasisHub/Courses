# Phase 3: Content Components & Brand - Context

**Gathered:** 2026-10-03
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the shared authoring components that both books need, plus the BASIS brand chrome, before any real content lands (COMP-01 to COMP-06, SITE-05):

- the `:::exercise` admonition
- the globally registered `<YouTube>` component
- BBj code highlighting
- `ExpandableCode` for blocks over 40 lines, and a copy button on every block
- `Tabs`, `DocCardList`, Mermaid, `TableWrapper` and image zoom
- Cmd+K local search, with the Algolia block left commented in place
- navbar logo, GitHub link, favicon, social cover and the single-line BASIS footer

Book content (Phases 4 to 6) is not part of this phase.

</domain>

<decisions>
## Implementation Decisions

### Brand assets & navbar (SITE-05)
- **D-01:** Stephan has supplied the brand assets in `/Users/beff/Downloads/BASISlogo/`. The source for the web is `BASISlogo.svg` (2024, viewBox 193×66). It has two fills: swoosh `.st0 #BCC9D2` and wordmark `.st1 #26446B`. `Artboard 1.png` is the reversed (light) version of the same artwork. The 2006 EPS/PSD/TIF/GIF/JPG files and the `www.basis.com` variant are not used. No asset dependency blocks this phase anymore.
- **D-02:** The navbar is dark in both themes (webforJ `navbar-dark`). For that reason the navbar logo is a **recolored copy** of `BASISlogo.svg`, saved as `docs/static/img/basis-logo.svg`: the navy `#26446B` fill becomes white and the swoosh `#BCC9D2` stays. One SVG serves both themes, so `srcDark` is not needed. Keep the Illustrator path data intact and only change the fill. A small cleanup is fine: drop the XML comment and the `enable-background` style.
- **D-03:** Keep the **full lockup** as supplied, including "International" and ®. Do not crop the trademarked artwork for the navbar.
- **D-04:** The navbar shows **logo + the text "Courses"**. The logo carries "BASIS", like webforJ's logo + "docs" pattern. This replaces the Phase 1 text-only title "BASIS Courses" (Phase 1 D-14). The browser tab and social title still read "BASIS Courses".
- **D-05:** The **favicon is derived from the logo SVG**: an SVG favicon plus a 32 px PNG fallback. It replaces the Phase 1 placeholder `docs/static/img/favicon.svg`. Claude decides how to make the mark legible at 16 to 32 px. Stephan reviews the result.
- **D-06:** **Claude builds the 1200×630 social cover**: a dark DWC/navy background, the reversed BASIS logo, "Courses" and a one-line tagline. The SVG source is committed next to the rendered PNG (e.g. `docs/static/img/social-cover.svg` and `.png`) so the cover can be regenerated. Set it as `themeConfig.image`.
- **D-07:** The navbar GitHub link points to **`https://github.com/BasisHub/Courses`**, the same repo as `editUrl`. Use webforJ's `header-github-link` icon style.
- Carried from the seed: the footer is a single HTML line, "Copyright © {year} BASIS International Ltd. All rights reserved."

### YouTube embeds (COMP-02)
- **D-08:** `<YouTube id title />` is a **click-to-load facade**, not the seed's plain lazy iframe. It shows a poster with a play button, and the `youtube-nocookie.com/embed/<id>` iframe (autoplay) is created only on click. **No request reaches Google before the reader clicks.** It stays responsive at 16:9, `title` is required, and it is registered globally in `MDXComponents`, so pages need no import.
- **D-09:** The poster is a **neutral DWC-styled placeholder**: a dark card with a play icon and the video title. It is not a real thumbnail, so there is no `i.ytimg.com` fetch and nothing is committed per video. Style it with DWC tokens (`--dwc-border-radius-m`, `--dwc-surface-*`).
- **D-10:** A **one-line consent notice** sits under the play button, along the lines of "Plays from YouTube (youtube-nocookie.com). Loading it sends data to Google." The final wording must be Vale-clean.

### Component fixture page
- **D-11:** The page that proves every component is a **deployed but unlisted** docs page, e.g. `/Courses/docs/authoring/components`, with `unlisted: true`. It is reachable by URL, kept out of the sidebar, navbar, sitemap and search, and covered by the broken-link and Vale gates. It exercises: `:::exercise`, `<YouTube>`, BBj fences (variables, labels, fields, rem, mnemonics, classes), a code block over 40 lines (`ExpandableCode`), `Tabs`, `DocCardList`, a Mermaid diagram, a wide wrapped table and a zoomable image. The research must confirm that `unlisted` works for a docs folder outside the two book sidebars, and how `docusaurus-plugin-llms` treats unlisted docs.
- **D-12:** Success criterion 4 ("search finds fixture content") is proven **against the stub book pages** (overview and sample chapter text) on a production build served locally. The unlisted fixture stays out of the search index.

### BBj highlighting (COMP-03)
- **D-13:** **Prism's built-in `bbj` grammar stays the base.** It is identical in prismjs 1.30 (installed) and the unreleased v2 branch (`src/languages/bbj.js`). Gaps are closed with a **small local extension**, e.g. `docs/src/prism/bbj-extend.js`, that changes the existing grammar through `Prism.languages.insertBefore` / grammar patching. It is not a full replacement grammar, which reverses the seed §6.4 "own grammar" plan. The extension is deleted once a released prismjs contains the fixes.
- **D-14:** The extension adds or fixes:
  - `$` string variables and `!` object variables
  - labels (`name:` at line start)
  - `#` fields
  - **mnemonics as their own token**, e.g. `'CS'`, `'BOX'`, `'LF'`. In BBj, single quotes delimit mnemonics, not strings. The base grammar wrongly treats `'...'` as a string.
  - **BBj strings with the `""` escape**. The base uses backslash escapes, which BBj does not have.
  - **known BBj class names** (BBjWindow, BBjButton, BBjAPI, ...) as `class-name`, from a list generated from the BBj docs MCP
  - the keywords missing from Prism's list, taken from the seed §6.4 list, e.g. `next`, `wait`, `open`, `close`, `input`, `new`, `cast`, `write`, `release`, `extends`. Each one is verified with `bbj_reserved_word` / `bbj_lookup`, never guessed.
  - Method calls keep the base `function` token.
- **D-15:** **Claude prepares the upstream PrismJS PR; Stephan submits it** under his account. The phase produces a ready patch against `PrismJS/prism` (v2 `src/languages/bbj.js`, plus the 1.x component if applicable), with tests or examples in Prism's format and PR text, stored under `.planning/` or a fork branch. Nothing is pushed to PrismJS from this repo's automation.

### Claude's Discretion
- Exercise admonition details beyond the seed (DWC success palette, "Try it yourself" label, all default admonition keywords re-listed): icon, whether the title can be overridden, and spacing.
- `YouTube` extras: a "Watch on YouTube" text link next to the player, and print styling (the facade prints as title + URL). Exact consent-line wording, which must be Vale-clean.
- Local search options (`hashed`, `indexPages`, `docsRouteBasePath: '/docs'`, navbar slot), and the exact form of the commented Algolia block.
- `ExpandableCode` and `TableWrapper` integration details when copying from webforJ (MIT header, which `MDXComponents` entries to keep, and how the 40-line threshold is applied: by the author or automatically).
- Favicon construction (D-05) and social cover layout and tagline (D-06), both reviewed by Stephan.
- How to get the BBj class-name list out of the MCP and keep it maintainable (generated list file vs inline regex).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project spec
- `.planning/migration-seed.md` §2 (webforJ copy table: navbar, footer, MDXComponents keep/drop list, search), §6.3 (exercise admonition), §6.4 (BBj grammar; superseded in part by D-13/D-14), §6.5 (YouTube; superseded by D-08 to D-10), §7 (CLAUDE.md conventions: `<YouTube>` never raw iframes)
- `.planning/REQUIREMENTS.md`: COMP-01 to COMP-06, SITE-05
- `.planning/ROADMAP.md`: Phase 3 goal and success criteria 1 to 5

### Brand assets (supplied by Stephan)
- `/Users/beff/Downloads/BASISlogo/BASISlogo.svg`: the vector source for the logo, favicon and cover (outside the repo; copy the derived files into `docs/static/img/`)
- `/Users/beff/Downloads/BASISlogo/Artboard 1.png`: Stephan's reversed version, the color reference for D-02

### BBj grammar
- `docs/node_modules/prismjs/components/prism-bbj.js`: the base grammar shipped with prismjs 1.30
- `https://github.com/PrismJS/prism/blob/v2/src/languages/bbj.js`: the upstream v2 grammar (identical rules), the target of the D-15 PR
- The BBj documentation MCP (`bbj_reserved_word`, `bbj_lookup`, `bbj_search`, resource `bbj://primer`): the only valid source for keywords and class names

### Prior phase context
- `.planning/phases/01-site-scaffold-quality-gates/01-CONTEXT.md`: D-09 (GitHub link and search arrive in Phase 3), D-12 (theme switcher), D-14 (text title and favicon placeholder, now replaced by D-04/D-05)
- `.planning/phases/02-repo-hygiene-ci/02-CONTEXT.md` and `02-REVIEW.md`: Vale BASIS rules and their open warnings (WR-03 to WR-06). The new fixture page and the consent line must pass Vale.
- `.planning/research/` (STACK/SUMMARY): plugin versions for `@easyops-cn/docusaurus-search-local` ^0.55.3 and `docusaurus-plugin-zooming` ^1.0.0, and the admonition `keywords` caveat

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/src/css/_alerts.scss` (webforJ copy, MIT header): extend with the `exercise` admonition styles.
- `docs/src/css/_navbar.scss`: already contains the `header-github-link` icon rule (`--header-github-link`), ready for D-07.
- `docs/src/theme/prism-dwc-theme.js`: the code theme for light and dark. The new tokens (mnemonic, class-name, variable, label) need colors in it, or must map onto existing token types.
- `docs/src/plugins/mermaid-elk-stub.js` and `themes: ['@docusaurus/theme-mermaid']`: Mermaid is already wired in Phase 1.
- `docs/src/data/books.js`: the registry that drives the navbar items. The GitHub item is appended after the book items.

### Established Patterns
- Files copied from webforJ carry the MIT header, and `THIRD_PARTY_NOTICES.md` lists them. `ExpandableCode`, `TableWrapper` and `MDXComponents` copies must follow this.
- Assets are self-hosted only: no CDN and no Google requests (SITE-04). The YouTube facade (D-08/D-09) extends the same principle.
- `tools/verify-phase2.sh` is the pattern for a per-phase verification script. A `tools/verify-phase3.sh` would follow it. Note that shell scripts cannot be run by agents in this environment: the user runs them with `!`.
- Build gates throw on broken links, anchors, Markdown links and images, so the fixture page must link cleanly.

### Integration Points
- `docs/docusaurus.config.js`:
  - `navbar` (title becomes "Courses", add `logo` and the GitHub item)
  - `favicon`
  - `themeConfig.image`
  - `footer` (none yet)
  - `themes` (add the search-local theme)
  - `plugins` (add zooming)
  - `presets[0][1].docs.admonitions`
  - `prism.additionalLanguages`
- `docs/src/theme/`: needs a new `MDXComponents.js` (registers `YouTube`, `Tabs`, `TabItem`, `DocCardList`, `ExpandableCode`, `TableWrapper` as `table`) and `prism-include-languages.js` (or a client module) that loads `bbj` and then the extension.
- `docs/src/components/YouTube/` and `docs/src/components/DocsTools/` are new.

</code_context>

<specifics>
## Specific Ideas

- "There is https://github.com/PrismJS/prism/blob/v2/src/languages/bbj.js. Let's run with that. If we find missing pieces we'll open a PR." This is the basis for D-13 to D-15.
- The navbar should look like webforJ's logo + "docs": the BASIS lockup, then "Courses".

</specifics>

<deferred>
## Deferred Ideas

- Submitting the PrismJS PR and following it up after this phase. Stephan owns it. Remove `bbj-extend.js` once a prismjs release contains the fixes.
- Phase 2 review follow-ups (Vale WR-03 vocabulary not enforced, WR-04/WR-05 over-broad AI rules, WR-02 ruleset bypass mode). These belong to `/gsd:code-review 02 --fix`, not this phase. WR-04/05 may bite on the Phase 3 fixture text.

</deferred>

---

*Phase: 03-content-components-brand*
*Context gathered: 2026-10-03*
