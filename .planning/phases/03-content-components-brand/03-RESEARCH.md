# Phase 3: Content Components & Brand - Research

**Researched:** 2026-10-03
**Domain:** Docusaurus 3.10.2 theme components (admonition, MDX components, Prism, search, zoom), brand assets
**Confidence:** HIGH for Docusaurus/plugin behavior (prototyped on a real build in a scratch copy), MEDIUM for BBj token facts (BBj MCP not reachable from this agent, see Assumptions)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Brand assets are in `/Users/beff/Downloads/BASISlogo/`. Web source is `BASISlogo.svg` (2024, viewBox 193x66), two fills: swoosh `.st0 #BCC9D2`, wordmark `.st1 #26446B`. `Artboard 1.png` is the reversed (light) version. 2006 EPS/PSD/TIF/GIF/JPG and the `www.basis.com` variant are not used.
- **D-02:** Navbar is dark in both themes. Navbar logo is a recolored copy `docs/static/img/basis-logo.svg`: navy `#26446B` becomes white, swoosh `#BCC9D2` stays. One SVG serves both themes (no `srcDark`). Keep Illustrator path data intact, only change fill. Dropping the XML comment and the `enable-background` style is fine.
- **D-03:** Keep the full lockup including "International" and the registered mark. Do not crop the artwork for the navbar.
- **D-04:** Navbar shows logo + the text "Courses". Replaces the Phase 1 text-only title. Browser tab and social title still read "BASIS Courses".
- **D-05:** Favicon derived from the logo SVG: an SVG favicon plus a 32 px PNG fallback. Replaces the Phase 1 placeholder `docs/static/img/favicon.svg`. Claude decides how to make the mark legible at 16 to 32 px. Stephan reviews.
- **D-06:** Claude builds the 1200x630 social cover: dark DWC/navy background, reversed BASIS logo, "Courses", one-line tagline. SVG source committed next to the rendered PNG (e.g. `docs/static/img/social-cover.svg` and `.png`). Set as `themeConfig.image`.
- **D-07:** Navbar GitHub link points to `https://github.com/BasisHub/Courses`. Use webforJ's `header-github-link` icon style.
- Footer is a single HTML line, "Copyright (c) {year} BASIS International Ltd. All rights reserved." (with the (c) sign).
- **D-08:** `<YouTube id title />` is a click-to-load facade. Poster with play button; the `youtube-nocookie.com/embed/<id>` iframe (autoplay) is created only on click. No request reaches Google before the click. Responsive 16:9, `title` required, registered globally in `MDXComponents`, no page import.
- **D-09:** Poster is a neutral DWC-styled placeholder: dark card, play icon, video title. No real thumbnail, no `i.ytimg.com`. Style with DWC tokens (`--dwc-border-radius-m`, `--dwc-surface-*`).
- **D-10:** One-line consent notice under the play button, e.g. "Plays from YouTube (youtube-nocookie.com). Loading it sends data to Google." Final wording must be Vale-clean.
- **D-11:** The proving page is a deployed but unlisted docs page, e.g. `/Courses/docs/authoring/components`, `unlisted: true`. Reachable by URL, out of sidebar, navbar, sitemap and search, covered by broken-link and Vale gates. Exercises: `:::exercise`, `<YouTube>`, BBj fences (variables, labels, fields, rem, mnemonics, classes), a code block over 40 lines, `Tabs`, `DocCardList`, a Mermaid diagram, a wide wrapped table, a zoomable image. Research must confirm `unlisted` works for a docs folder outside the two book sidebars and how `docusaurus-plugin-llms` treats unlisted docs (answered below).
- **D-12:** Success criterion 4 is proven against the stub book pages (overview and sample chapter text) on a production build served locally. The unlisted fixture stays out of the search index.
- **D-13:** Prism's built-in `bbj` grammar stays the base (identical in prismjs 1.30 and the v2 branch). Gaps are closed by a small local extension, e.g. `docs/src/prism/bbj-extend.js`, via `Prism.languages.insertBefore` / grammar patching. Not a full replacement grammar. Deleted once a released prismjs contains the fixes.
- **D-14:** The extension adds or fixes: `$` string variables and `!` object variables; labels (`name:` at line start); `#` fields; mnemonics as their own token (`'CS'`, `'BOX'`, `'LF'`; single quotes delimit mnemonics, not strings); BBj strings with the `""` escape (base uses backslash escapes); known BBj class names (BBjWindow, BBjButton, BBjAPI, ...) as `class-name`, from a list generated from the BBj docs MCP; keywords missing from Prism's list (seed 6.4 list, e.g. `next`, `wait`, `open`, `close`, `input`, `new`, `cast`, `write`, `release`, `extends`), each verified with `bbj_reserved_word` / `bbj_lookup`, never guessed. Method calls keep the base `function` token.
- **D-15:** Claude prepares the upstream PrismJS PR; Stephan submits it. The phase produces a ready patch against `PrismJS/prism` (v2 `src/languages/bbj.js`, plus the 1.x component if applicable) with tests in Prism's format and PR text, stored under `.planning/` or a fork branch. Nothing is pushed to PrismJS from this repo's automation.

### Claude's Discretion
- Exercise admonition details beyond the seed (DWC success palette, "Try it yourself" label, all default admonition keywords re-listed): icon, whether the title can be overridden, spacing.
- `YouTube` extras: a "Watch on YouTube" text link next to the player, print styling (facade prints as title + URL). Exact consent-line wording (Vale-clean).
- Local search options (`hashed`, `indexPages`, `docsRouteBasePath: '/docs'`, navbar slot), exact form of the commented Algolia block.
- `ExpandableCode` and `TableWrapper` integration details when copying from webforJ (MIT header, which `MDXComponents` entries to keep, how the 40-line threshold is applied: by the author or automatically).
- Favicon construction (D-05) and social cover layout and tagline (D-06), both reviewed by Stephan.
- How to get the BBj class-name list out of the MCP and keep it maintainable (generated list file vs inline regex).

### Deferred Ideas (OUT OF SCOPE)
- Submitting the PrismJS PR and following it up after this phase (Stephan owns it). Remove `bbj-extend.js` once a prismjs release contains the fixes.
- Phase 2 review follow-ups (Vale WR-03 vocabulary not enforced, WR-04/WR-05 over-broad AI rules, WR-02 ruleset bypass mode). WR-04/05 may bite on the Phase 3 fixture text.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | `:::exercise Try it yourself` styled box (DWC success palette), both themes | `docs.admonitions.keywords: ['exercise']` + `src/theme/Admonition/Types.js` swizzle + `.alert--exercise` in `_alerts.scss`; prototype built and rendered `alert--exercise` |
| COMP-02 | `<YouTube id title />` without import, responsive, lazy, nocookie | New facade component + global registration in swizzled `MDXComponents.js` |
| COMP-03 | BBj fences highlighted (variables, labels, fields, rem, keywords), MCP-verified | Wrap `@theme-original/prism-include-languages`, patch `Prism.languages.bbj`; prototype tokenizes every D-14 token class |
| COMP-04 | >40 line blocks collapsible; copy button on every block | Collapse via CodeBlock wrapper and/or `ExpandableCode`; copy is built into theme-classic CodeBlock; pitfall: copy of collapsed preview |
| COMP-05 | Tabs, DocCardList, Mermaid, TableWrapper, image zoom | Global registration; DocCardList needs explicit `items` outside a sidebar; `docusaurus-plugin-zooming` 1.0.0; TableWrapper must be rewritten without MUI |
| COMP-06 | Cmd+K local search, Algolia commented in place | `@easyops-cn/docusaurus-search-local` 0.55.3 verified on 3.10.2 build; `searchBarShortcut` default true |
| SITE-05 | Navbar logo + GitHub, favicon, social cover, single-line footer | Config recipe, rsvg-convert / magick available for SVG to PNG |
</phase_requirements>

## Summary

All components can be built on stock Docusaurus 3.10.2 theme hooks plus two small npm additions (`@easyops-cn/docusaurus-search-local` ^0.55.3 and `docusaurus-plugin-zooming` ^1.0.0). I verified the risky parts by building a scratch copy of `docs/` with the plugins, an unlisted fixture page, an `Admonition/Types` swizzle, a wrapped `prism-include-languages` and a BBj extension (scratchpad only, repo untouched). Results: the unlisted page builds with `noindex, nofollow`, stays out of `sitemap.xml` and out of the local search index, but IS listed in `llms.txt` and `llms-full.txt` unless `ignoreFiles: ['authoring/**']` is set on `docusaurus-plugin-llms` (verified: zero hits after).

Two seed assumptions are wrong or outdated. (1) `docs.admonitions.keywords` does NOT replace the defaults in 3.10.2: `extendDefaults` defaults to true, so `keywords: ['exercise']` is enough. (2) webforJ's `TableWrapper` and `ExpandableCode` import `@mui/*`, which this site does not install and must not (out of scope): both need an MUI-free rewrite, not a plain copy. A third trap: `Prism.languages.insertBefore` returns a NEW object and replaces `Prism.languages.bbj`, so any local `const bbj = Prism.languages.bbj` captured before it goes stale (caught in the prototype).

BBj token facts: I could not call the BBj Documentation MCP from this agent (no such tools were exposed). Single-quoted mnemonics are confirmed by BASIS docs; the `""` string escape, the keyword additions and the class list are therefore tagged `[ASSUMED]` and the plan must include MCP verification tasks (`bbj_reserved_word`, `bbj_lookup`, `bbj_check_syntax`) as a gate before the extension is committed.

**Primary recommendation:** Build in this order: config + deps, Admonition/MDXComponents/prism swizzles, YouTube + code components, fixture page, brand assets, then `tools/verify-phase3.sh`. Use the prototype snippets below as the starting point.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `:::exercise` parsing | Build (remark in mdx-loader) | Browser (render) | Directive keyword list is a build-time config; React component renders |
| BBj highlighting | Browser/SSR (prism-react-renderer) | Build config | Tokenizing runs at SSG and in the browser from the same Prism object |
| YouTube facade | Browser (click creates iframe) | SSG (static poster markup) | No network before click is a runtime guarantee |
| Local search | Build (index generation) | Browser (lunr query, Cmd+K) | Index only exists after `docusaurus build`; dev server has no search |
| Image zoom | Browser (client module) | - | Pure DOM behavior on `.markdown img` |
| Favicon, cover, logo | Static assets | Build config (`favicon`, `image`, `navbar.logo`) | Generated once, committed |
| Fixture unlisted/noindex | Build (docs plugin) | llms plugin config | `unlisted` handled by docs plugin; llms plugin needs explicit ignore |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@docusaurus/*` | 3.10.2 (already exact-pinned) | Theme, swizzle targets `Admonition/Types`, `prism-include-languages`, `MDXComponents`, `CodeBlock` | Project pin; all prototyping done on it |
| `prismjs` | 1.30.0 (transitive, already installed) | Built-in `bbj` grammar base | D-13 |
| `@easyops-cn/docusaurus-search-local` | ^0.55.3 (npm latest 0.55.3, modified 2026-07-29) | Cmd+K local search | In STACK.md; works with 3.10.2 (prototype build OK) |
| `docusaurus-plugin-zooming` | ^1.0.0 (npm latest 1.0.0, 2025-08-15; peer `@docusaurus/theme-classic >=3`) | Click-to-zoom images | In STACK.md; depends on `zooming` ^2.1.1 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` | ^2.1.1 (installed) | Class composition in swizzles | Admonition type, components |
| `rsvg-convert` / `magick` (system) | rsvg 2.61.3 present | SVG to PNG for favicon and cover | Asset generation, not an npm dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zooming plugin (721 downloads/week, single maintainer) | `medium-zoom` + own client module | Plugin is tiny; fallback if it breaks on a Docusaurus bump. Keep plugin per STACK.md |
| webforJ MUI `TableWrapper` | Own plain React + native `<dialog>` | MUI is out of scope; own version is ~40 lines |

**Installation (run once, in `docs/`, with the lockfile update done on purpose; never `npx --yes`):**
```bash
npm install @easyops-cn/docusaurus-search-local@^0.55.3 docusaurus-plugin-zooming@^1.0.0
```
Do not add `@mui/*`, `@emotion/*`, `mermaid` extras, `open-ask-ai` (optional peer of search-local, not needed).

**Version verification:** `npm view` confirmed versions and dates above on 2026-10-03 [VERIFIED: npm registry]. Neither has a `postinstall` script.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| @easyops-cn/docusaurus-search-local | npm | ~6 yrs (2020-10) | ~426k/wk | github.com/easyops-cn/docusaurus-search-local | [OK] | Approved |
| docusaurus-plugin-zooming | npm | ~2.5 yrs (2024-04) | ~721/wk | github.com/inovector/docusaurus-plugin-zooming | [OK] | Approved (low usage; named in STACK.md and discovered via project research, still gate on lockfile diff review) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

Note: slopcheck is a Python tool that installs the packages as a side effect (`slopcheck install ...`). It was run once and modified the real `docs/package.json`; that was reverted with `git checkout` + `npm ci` and the working tree was verified clean. The planner must run `slopcheck scan`/the plain `npm install` form deliberately, not `slopcheck install`, if it re-checks.

## Architecture Patterns

### System Architecture Diagram

```
 MDX source (docs/docs/**)
    |  remark: admonition keywords (exercise + defaults), mermaid fence
    v
 MDX components map  <---- src/theme/MDXComponents.js (YouTube, Tabs, TabItem, DocCardList,
    |                                                    ExpandableCode, table -> TableWrapper)
    |-- ```bbj fence --> theme CodeBlock (copy btn, >40 lines collapse)
    |                       -> prism-react-renderer Prism <-- src/theme/prism-include-languages.js
    |                              (1) original loop loads prismjs/components/prism-bbj
    |                              (2) src/prism/bbj-extend.js patches Prism.languages.bbj
    |                       -> token types -> prism-dwc-theme.js -> --dwc-code-* vars
    |-- :::exercise  --> theme Admonition/Types.js -> alert alert--success alert--exercise
    |-- <YouTube>    --> facade button; click -> youtube-nocookie iframe (only network call)
    |-- img          --> docusaurus-plugin-zooming client module (.markdown img)
    v
 docusaurus build
    |-- sitemap.xml (skips noindex pages, adds /search)
    |-- search-index.json (search-local; skips unlisted)
    |-- llms.txt / llms-full.txt (ignoreFiles must exclude authoring/**)
    v
 build/ --serve--> Cmd+K lunr search (production build only)
```

### Recommended Project Structure
```
docs/
├── docs/authoring/components.mdx     # unlisted fixture (+ img/ for zoom test)
├── src/
│   ├── components/
│   │   ├── YouTube/{index.js,styles.module.css}
│   │   └── DocsTools/{ExpandableCode,TableWrapper}/   # MIT header, MUI removed
│   ├── prism/bbj-extend.js            # D-13 extension (+ bbj-classes.json generated)
│   ├── theme/
│   │   ├── Admonition/Types.js
│   │   ├── MDXComponents.js
│   │   ├── CodeBlock/index.js         # optional auto-collapse wrapper
│   │   └── prism-include-languages.js
│   └── css/_alerts.scss (+ exercise), _print.scss (+ youtube), _prism.scss (token colors)
├── static/img/{basis-logo.svg,favicon.svg,favicon-32.png,social-cover.svg,social-cover.png}
tools/{verify-phase3.sh, gen-bbj-classes.md or script}
.planning/phases/03-.../prism-pr/     # D-15 patch + PR text
```

### Pattern 1: Exercise admonition (verified in prototype)
Config (verified in source: `extendDefaults` is true by default, so defaults are kept):
```js
// docusaurus.config.js, presets[0][1].docs
admonitions: {keywords: ['exercise']},
```
```jsx
// src/theme/Admonition/Types.js  [prototype built OK]
import React from 'react';
import clsx from 'clsx';
import DefaultTypes from '@theme-original/Admonition/Types';
import AdmonitionLayout from '@theme/Admonition/Layout';
function Exercise(props) {
  return (
    <AdmonitionLayout title="Try it yourself" icon={<ExerciseIcon />} {...props}
      className={clsx('alert alert--success alert--exercise', props.className)}>
      {props.children}
    </AdmonitionLayout>
  );
}
export default {...DefaultTypes, exercise: Exercise};
```
`alert--success` already carries the DWC success palette (`_alerts.scss`: `--dwc-color-success-alt` background, `--dwc-color-success` border), so both themes work without new colors; add only `.alert--exercise` extras (icon size, spacing). Without the swizzle an unknown keyword logs "No admonition component found" and falls back to the Info style (observed). Keywords apply only to the docs plugin Markdown, not to `src/pages` MDX. The prototype fixture supplied the title in the directive label, so the default "Try it yourself" (`:::exercise` with no label) still needs a test.

### Pattern 2: BBj extension via wrapped swizzle (verified by tokenizing and by a full build)
```js
// src/theme/prism-include-languages.js
import prismIncludeLanguages from '@theme-original/prism-include-languages';
import extendBbj from '../prism/bbj-extend';
export default function (PrismObject) {
  prismIncludeLanguages(PrismObject);   // loads prism-bbj through additionalLanguages (keep 'bbj' listed)
  extendBbj(PrismObject);               // then patch
}
```
```js
// src/prism/bbj-extend.js (prototype, passes tokenization of all D-14 classes)
export default function extendBbj(Prism) {
  if (!Prism.languages.bbj) return;
  Prism.languages.bbj.string = {pattern: /"(?:[^"]|"")*"/, greedy: true}; // same key = same order
  Prism.languages.insertBefore('bbj', 'number', {
    mnemonic: {pattern: /'[A-Za-z0-9_]+(?:\([^)]*\))?'/, greedy: true, alias: 'builtin'},
    label: {pattern: /^[ \t]*[A-Za-z_]\w*(?=:)/m, alias: 'symbol'},
    field: {pattern: /#[A-Za-z_]\w*[$!%]?/, alias: 'variable'},
    'class-name': /\bBBj[A-Z]\w*\b/,        // replace with generated exact list
  });
  Prism.languages.insertBefore('bbj', 'function', {variable: /\b[A-Za-z_]\w*[$!%]/});
  // re-read Prism.languages.bbj: insertBefore returned a NEW object
  Prism.languages.bbj.keyword = new RegExp(
    Prism.languages.bbj.keyword.source.replace('(?:', '(?:next|to|step|wait|...|'), 'i');
}
```
Notes: the file runs in the browser bundle, so use ESM `export default` (the prototype `module.exports` worked in Node tests; use `import`/`export` in the theme path). Aliases (`builtin`, `symbol`, `variable`) map onto existing `prism-dwc-theme.js` styles, verified in built HTML (inline `color:var(--dwc-code-*)`), so no theme change is required; add distinct entries to `prism-dwc-theme.js` + `_prism.scss` only if Stephan wants different colors. The base keyword list lacks `to`, `step`, `next`, `auto` among others [VERIFIED: grammar read]; gaps worth fixing in the PR too: base `comment` regex `(^|[^\\:])rem\s+.*` matches `rem` inside a string and at the tail of identifiers (e.g. `a rem b"` inside quotes) [prototype reasoning, add a test case]; base `punctuation` swallows `:` so labels need the extension.

### Pattern 3: YouTube facade
Plain React component `src/components/YouTube/index.js`: `useState(false)`; before click render a `<button type="button">` with inline SVG play icon, the `title`, and the consent `<p>`; after click render `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin">`. Wrapper `aspect-ratio: 16/9`, tokens `--dwc-border-radius-m`, `--dwc-surface-*`. Add `<a href="https://www.youtube.com/watch?v=ID">Watch on YouTube</a>`. Print: hide button, show title + URL in `_print.scss`. Throw if `id` or `title` missing so a bad conversion fails the build. SSG renders no iframe, so no Google request on page load. The referrer policy is there because YouTube embeds reject requests with no Referer [ASSUMED, known 2025 "error 153" reports; test with a real click on the deployed site].

### Pattern 4: Code blocks (copy + collapse)
Copy button is built into `@theme/CodeBlock` [VERIFIED: theme-classic CodeBlock/Buttons present]. webforJ's `ExpandableCode` renders a `CodeBlock` with only the preview slice when collapsed, so the copy button copies a truncated block. Do it differently: pass the full code and clip with `max-height` + gradient CSS. Recommended: keep an `ExpandableCode` component (explicit API from webforJ: `previewLines`, `title`) AND make >40 lines automatic through a `src/theme/CodeBlock/index.js` wrapper that wraps the original and applies the clip when the line count of string children exceeds 40 (a `noCollapse` guard prevents double wrapping inside `ExpandableCode`). Replace the MUI `ChevronRight` with an inline SVG. Keep `src/theme/CodeBlock/Line` out (no need).

### Pattern 5: MDXComponents
Registers: `DocCardList` (`@theme/DocCardList`), `Tabs`, `TabItem`, `YouTube`, `ExpandableCode`, `table: TableWrapper`. Drop everything MUI, ComponentDemo, DocChip, JavadocLink, ParentLink, TableBuilder, Gallery*, GiscusComments, AskMenu, AccordionGroup, ExperimentalWarning, AutomatedUpgradeTip, AISkillTip (CLAUDE.md forbids copying webforJ-specific components). Without the swizzle, `<DocCardList />` fails the build with "Expected component `DocCardList` to be defined" (observed).

### Pattern 6: DocCardList on a page outside a sidebar
Bare `<DocCardList />` on an unlisted page fails the build (observed, no current sidebar). Use explicit items in the fixture:
```mdx
<DocCardList items={[{type: 'link', label: 'DWC overview', href: '/docs/dwc/overview', description: 'x'}]} />
```
Do NOT pass `docId` (`docId: 'dwc/00-overview'` fails: "no version doc found"; real doc ids drop the number prefix). Real chapter index pages (Phase 4+) use bare `<DocCardList />` inside a category index, where a sidebar exists.

### Pattern 7: Config recipe (navbar, footer, search, zoom)
```js
const year = new Date().getFullYear();   // evaluated at build, no document.write
themeConfig: {
  image: 'img/social-cover.png',
  navbar: { title: 'Courses', logo: {alt: 'BASIS International', src: 'img/basis-logo.svg'}, style: 'dark',
    items: [...books.map(...), {type: 'search', position: 'right'},
            {href: 'https://github.com/BasisHub/Courses', position: 'right',
             className: 'header-github-link', 'aria-label': 'GitHub repository'}] },
  footer: {links: [{html: `<p>Copyright &copy; ${year} BASIS International Ltd. All rights reserved.</p>`}]},
  // algolia: { appId: 'YOUR_APP_ID', apiKey: 'YOUR_SEARCH_API_KEY', indexName: 'YOUR_INDEX_NAME', contextualSearch: true },
}
themes: ['@docusaurus/theme-mermaid',
  ['@easyops-cn/docusaurus-search-local', {hashed: true, indexBlog: false, indexPages: false,
    docsRouteBasePath: '/docs', language: 'en', explicitSearchResultPath: true}]],
plugins: [..., 'docusaurus-plugin-zooming'],     // default selector '.markdown img'
// docusaurus-plugin-llms: add ignoreFiles: ['authoring/**']
```
Footer uses the webforJ `links: [{html}]` form because the copied `_footer.scss` styles `.footer__link-item p`. The navbar title is `Courses` while top-level `title: 'BASIS Courses'` stays for the tab. Use placeholder Algolia values, never the webforJ keys. Switching to Algolia later means removing the search-local theme (two themes both provide `SearchBar`).

### Anti-Patterns to Avoid
- Capturing `Prism.languages.bbj` before `insertBefore` and mutating the old reference (silently ignored).
- Importing `prismjs` directly in the extension: it would patch a different Prism instance than prism-react-renderer's. Use the `PrismObject` argument.
- Copying webforJ `TableWrapper`/`ExpandableCode` verbatim (pulls `@mui/*`).
- Relying on `npm start` for search: the index only exists after a production build.
- Hardcoding colors in the exercise style; use `--dwc-*`/`--ifm-alert-*` vars.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Copy button | custom clipboard UI | theme-classic `CodeBlock` | Built in, accessible |
| Tabs / card lists | custom components | `@theme/Tabs`, `@theme/DocCardList` | Registered via swizzle only |
| Mermaid | own renderer | `@docusaurus/theme-mermaid` (already wired, `layout: elk` blocked by the stub) | Phase 1 done |
| Image zoom | own lightbox | `docusaurus-plugin-zooming` | Handles theme background, keyboard |
| Search | own index | search-local | Build-time lunr index |
| Whole BBj grammar | new grammar | patch of built-in | D-13 |
| SVG to PNG | node tooling | `rsvg-convert` / `magick` (present locally) | No new deps |

**Key insight:** every piece is a thin registration or a small component; the risk is in integration details (instance of Prism, sidebar context, MUI imports), not in features.

## Runtime State Inventory
Not applicable (no rename/refactor). The only replaced artifacts: Phase 1 `docs/static/img/favicon.svg` placeholder and navbar title text; no stored data or OS state.

## Common Pitfalls

### Pitfall 1: llms plugin includes the unlisted page
**What goes wrong:** `/docs/authoring/components` appeared in `llms.txt` and `llms-full.txt` (verified), leaking the fixture to AI crawlers while sitemap and search exclude it.
**How to avoid:** `ignoreFiles: ['authoring/**']` on `docusaurus-plugin-llms` (verified: 0 matches after). `verify-phase3.sh` greps both files for `authoring`.

### Pitfall 2: Unlisted banner and noindex
**What happens:** The built page has `<meta name="robots" content="noindex, nofollow">` and renders a caution banner ("unlisted"). That is acceptable for an author fixture; do not hide it. The sitemap does not list it (verified). Note that `unlisted: true` pages are served by direct URL only; there is no sidebar on that page (it sits in no sidebar and builds fine).

### Pitfall 3: search-local adds `/search` to sitemap
The sitemap gains `https://basishub.github.io/Courses/search`. Harmless; `verify-phase1.sh` sitemap checks (root + both books) still pass. The search-local build did not add non-local `<link>` hrefs (verified against the Phase 1 check).

### Pitfall 4: Search is production-only
Cmd+K does nothing under `npm start`. Verification must `npm run build && npm run serve`. The default `searchBarShortcut` is true [VERIFIED: validateOptions default].

### Pitfall 5: Stale grammar reference after insertBefore
See Pattern 2. Add a tokenization test (`node` script over `Prism.tokenize`) so a stale reference is caught.

### Pitfall 6: MUI imports sneak in
`TableWrapper` and `ExpandableCode` copies import `@mui/*`. Build fails ("Can't resolve") if copied unchanged. Rewrite; keep MIT header line and add entries to `THIRD_PARTY_NOTICES.md` (they are adapted from webforJ, so they carry "Copied from ... and modified").

### Pitfall 7: Vale on the fixture
Fixture prose and the YouTube consent line must pass Vale (Google + BASIS). Keep prose plain, no em dashes, no "please", no passive-style hedges. Code fences are ignored by Vale; prose in the fixture is not. Run `tools/.bin/vale docs/docs/authoring`.

### Pitfall 8: `docs/docs/authoring/` is not a book
CLAUDE.md says books are folders under `docs/docs/<book>/`. The authoring folder is an intentional exception; add one sentence to CONTRIBUTING.md/CLAUDE.md so later phases do not "fix" it, and keep it out of `books.js` and `sidebars.js` (sidebars are generated per book from `books.js`, so it is automatically outside both).

### Pitfall 9: Local Node version
The shell has Node 22.22.0 while `.nvmrc` says 24; the prototype built fine on 22. CI uses 24. Not a blocker; just note when comparing build output.

### Pitfall 10: Build warning "postcss-calc ... c * 3"
A CSS minimizer warning appeared on every scratch build (non-fatal). It likely originates in the existing stylesheet set, not in the new plugins, but this was not compared against a baseline build. The planner should record whether a baseline build shows it, so it is not blamed on Phase 3.

## Code Examples

See Patterns 1, 2, 3, 6, 7. Additional verified snippets:

### BBj tokenization test (Node, no Docusaurus; runs in under a second)
```js
const Prism = require('prismjs'); require('prismjs/components/prism-bbj');
require('./extend-cjs')(Prism);   // thin CJS wrapper or use dynamic import in the test
const toks = Prism.tokenize(sample, Prism.languages.bbj);
// assert type sets: mnemonic, label, field, class-name, variable, comment, string, keyword
```
Prototype output for the sample was: `comment, keyword(declare), class-name(BBjWindow), variable(wnd!), variable(name$), string("say ""hi"""), keyword(print), mnemonic('CS'), mnemonic('BOX'), label(START), field(#count), keyword(for/to/next), comment(rem after), function(setTitle)`.

### Fixture front matter
```yaml
---
title: Components fixture
description: Every shared component on one page, for authors and for the Phase 3 gates.
unlisted: true
---
```

### Favicon and cover (local tools)
```bash
rsvg-convert -w 32 -h 32 docs/static/img/favicon.svg -o docs/static/img/favicon-32.png
rsvg-convert -w 1200 -h 630 docs/static/img/social-cover.svg -o docs/static/img/social-cover.png
```
The logo is a wide lockup (swoosh path `.st0` x1, wordmark `.st1` x19 paths); it is unreadable at 32 px. Recommended favicon: the "B" glyph (one `.st1` path, to be isolated by bounding box) in white on a rounded `#26446B` square, with a swoosh-only fallback if the B isolates poorly. Render at 16, 32 and 180 px and let Stephan review (D-05). Declare in config: `favicon: 'img/favicon.svg'`, plus `headTags` link `rel=icon type=image/png sizes=32x32 href=/Courses/img/favicon-32.png` (headTags do not get baseUrl; use the existing `baseUrl` constant). Font for "Courses" and the tagline in the SVG cover must be converted to paths or use a system font stack: no web font fetch.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Seed: `keywords` list replaces defaults | `extendDefaults: true` by default | 3.x (verified in 3.10.2 source) | Only `['exercise']` needed |
| Seed: own `src/prism/bbj.js` grammar | Patch built-in grammar (D-13) | CONTEXT 2026-10-03 | Smaller diff, upstream PR |
| Plain lazy iframe | Click-to-load facade (D-08) | CONTEXT | No Google request before click |
| webforJ uses Algolia | search-local with Algolia commented | project choice | webforJ config is not a model for search |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | **VERIFIED (orchestrator, see BBj MCP Verification)** BBj strings escape a double quote by doubling it (`""`) | Pattern 2 | Wrong string token on lines with quotes; needs `bbj_lookup`/`bbj_check_syntax` confirmation. Locked by D-14 but not confirmed in the docs I could fetch |
| A2 | **VERIFIED (orchestrator)** Keywords `next`, `to`, `step`, `wait`, `open`, `close`, `input`, `new`, `cast`, `write`, `auto` and the rest of the seed 6.4 list are real BBj keywords | Pattern 2 | A wrong keyword highlights an identifier. Verify each with `bbj_reserved_word` (execution task, gate) |
| A3 | **RESOLVED (orchestrator): exact verified list below** BBj class names follow `BBj[A-Z]\w*`; an exact list must be generated from the MCP | Pattern 2 | The prototype regex over-matches (any `BBjXyz`); exact list should replace it. Not generated here (MCP unavailable) |
| A4 | **VERIFIED (orchestrator)** `#` fields and `name:` labels as described in D-14; label may be followed by `rem` without semicolon | Pattern 2 | Edge cases in label/comment ordering |
| A5 | YouTube nocookie embeds need a Referer (hence `referrerPolicy`) | Pattern 3 | Embed could show an error on GitHub Pages; test after deploy |
| A6 | Upstream PrismJS v2 layout (`src/languages/bbj.js`, tests format) is as in CONTEXT | D-15 task | PR patch format needs a look at the `v2` branch at execution time |
| A7 | `:::exercise` with no label shows "Try it yourself" via the swizzle default | Pattern 1 | Prototype only tested a labeled directive; test the unlabeled form |

## BBj MCP Verification (orchestrator, 2026-10-03)

The researcher agent had no BBj Documentation MCP access. The plan-phase orchestrator ran these checks itself, so A1 to A4 are no longer assumptions. Executor agents also lack the MCP: they must use the lists below verbatim and must not add BBj tokens, classes or snippets that are not listed here. Any new BBj snippet must go back to the orchestrator for `bbj_check_syntax` before commit.

Source build: bbj-docs · hosted · docs 2026-09-21 · fd516a9d. Primer read first (`bbj://primer`).

**A1, string escape:** a literal quote inside a string is written as two quotes. Primer gotchas/10 and two_string_worlds/5 (https://documentation.basis.cloud/BASISHelp/WebHelp/usr/Language_Concepts/strings.htm). There is no backslash escape. Prism's base `string` pattern (`(['"])(?:(?!\1|\\).|\\.)*\1`) is wrong on both counts.

**Mnemonics:** single ticks delimit mnemonics (`'CS'`, `'BOX'(...)`), optionally followed by a parenthesized parameter list (primer two_string_worlds/5). Hex strings are `$...$` with an even number of hex digits (`$0a$`, `$00090003$`); they must not be tokenized as a `$` variable suffix. Add a `hex-string` token, pattern `/\$[0-9A-Fa-f]*\$/`, alias `number`, inserted before `variable`.

**A4, labels and fields:** a label is an identifier followed by a colon at line start, e.g. `CHECK_ACCOUNT:` (primer language_concepts/8, https://documentation.basis.cloud/BASISHelp/WebHelp/usr/Language_Concepts/commands_and_statements.htm). A label line may carry `rem` without a semicolon (MCP server instructions, https://documentation.basis.cloud/BASISHelp/WebHelp/commands/rem_verb.htm). `#field`, `#method()`, `#this!` and `#super!` are instance references inside a class (primer java_object_model/6). A trailing comment on a statement needs `; rem` (primer gotchas/2).

**Variable suffixes:** `$` string, `!` object, `%` integer (primer language_concepts/7, two_string_worlds/8).

**A2, keyword additions:** each checked with `bbj_reserved_word`; all `reserved: true`.

| Word | Category | Add to keyword list |
|------|----------|---------------------|
| next | Verbs | yes |
| to | Keywords | yes |
| step | Keywords | yes |
| write | Verbs | yes |
| open | Verbs | yes |
| close | Verbs | yes |
| wait | Verbs | yes |
| input | Verbs | yes |
| new | Keywords | yes |
| auto | Keywords | yes |
| cast | Functions | **no**: base `function` token already matches `cast(` |

Already in Prism's base list (no change): declare, use, class, classend, method, methodend, methodret, field, interface, interfaceend, if, then, else, endif, fi, while, wend, for, switch, case, swend, goto, gosub, return, print, let, dim, read, process_events, callback, release, end, seterr, setesc, extends, implements, public, private, protected, static, void.

**Upstream fix for the D-15 PR:** Prism's base `operator` includes `not`, but BBj has no `NOT` keyword or function; negation is `!` (primer language_concepts/4, https://documentation.basis.cloud/BASISHelp/WebHelp/commands/_operator_invert_numeric_expression.htm). The local extension removes `not` from `operator`, and the PR proposes the same. (`and`, `or`, `xor` stay.)

**A3, exact class list (`class-name` token):** each verified with `bbj_lookup` (kind class or event). Replace the `BBj[A-Z]\w*` regex with an alternation of exactly these 35 names:

BBjAPI, BBjSysGui, BBjControl, BBjWindow, BBjTopLevelWindow, BBjChildWindow, BBjButton, BBjToolButton, BBjMenuButton, BBjStaticText, BBjEditBox, BBjCEdit, BBjInputE, BBjInputN, BBjInputD, BBjListBox, BBjListButton, BBjListEdit, BBjCheckBox, BBjRadioButton, BBjTree, BBjStandardGrid, BBjDataAwareGrid, BBjHtmlView, BBjHtmlEdit, BBjFileChooser, BBjVector, BBjNumber, BBjString, BBjInt, BBjNamespace, BBjTemplatedString, BBjButtonPushEvent, BBjFormValidationEvent, BBjNativeJavaScriptEvent

(BBjInt resolves via the BBj API signature `com.basis.bbj.proxies.BBjInt`, not a citable page.)

**Not BBj classes in this docs build** (do not list): BBjGridExWidget (a plugin library), BBjPanel, BBjDocViewer, BBjWebManager, BBjBuiManager.

Store the list as `docs/src/prism/bbj-classes.json` with a header field `"source": "bbj-docs hosted 2026-09-21 fd516a9d, verified 2026-10-03"`; adding a name later requires a new `bbj_lookup`.

**Pre-verified fixture snippet** (`bbj_check_syntax`: "No errors found", stock BBj 26.03). The fixture page's BBj token demo and `tools/test-bbj-grammar.js` use exactly this program. It covers `use`, `declare`, `!`/`$`/`%` variables, the `""` escape, a `'CS'` mnemonic, `for ... to ... step` / `next`, `new`, `; rem`, `gosub`, a label, `release`, `class`/`field`/`method`/`methodret`/`methodend`/`classend` and `#field`:

```bbj
use java.util.HashMap

declare BBjNumber total!
total! = 0
msg$ = "She said ""hi"" to me"
print 'CS', msg$
count% = 3
for i = 1 to count% step 1
    total! = total! + i
next i
counter! = new Counter()
counter!.add(5)
print counter!.getCount(); rem show the count
gosub done
release

done:
    print "done"
return

class public Counter
    field private BBjNumber count
    method public void add(BBjNumber n)
        #count = #count + n
    methodend
    method public BBjNumber getCount()
        methodret #count
    methodend
classend
```

Expected tokens for the grammar test: `msg$`, `total!`, `count%`, `counter!` → variable; `"She said ""hi"" to me"` → one string token; `'CS'` → mnemonic; `done` on `done:` → label; `#count` → field; `BBjNumber` → class-name; `rem show the count` → comment; `to`, `step`, `next`, `new`, `for`, `gosub`, `release`, `class`, `method`, `methodret` → keyword.

## Open Questions

1. **BBj MCP verification**
   - Known: single-quoted mnemonics are documented (documentation.basis.cloud "Using Mnemonics"); `rem` form is documented.
   - **RESOLVED by the orchestrator:** see "BBj MCP Verification" above. Executors cannot call the MCP; they use those lists and that snippet verbatim.
2. **Auto vs explicit collapse** (Claude's discretion): recommended hybrid in Pattern 4; planner confirms.
3. **Favicon glyph** (D-05): B glyph vs swoosh; Stephan reviews.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node/npm | build | yes | Node 22.22.0 (repo `.nvmrc` 24) | none needed |
| `rsvg-convert` | favicon/cover PNG | yes | 2.61.3 | `magick` |
| ImageMagick `magick` | PNG fallback | yes | present | rsvg-convert |
| Vale | prose gate | via `tools/.bin/vale` | 3.24.0 | run `bash tools/install-lint-tools.sh` |
| BBj Documentation MCP | token verification | not exposed to this research agent | n/a | execution agent runs it; fallback: documentation.basis.cloud pages |
| Brand source files | D-01 | yes | `/Users/beff/Downloads/BASISlogo/BASISlogo.svg` | none |
| Shell scripts by agents | `verify-phase3.sh` | agents cannot run scripts here (CONTEXT) | n/a | user runs with `!`; agents run the individual commands |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No unit test framework. Gates are build + grep + node scripts, same as `tools/verify-phase1.sh` / `verify-phase2.sh` |
| Config file | none; add `tools/verify-phase3.sh` (same PASS/FAIL line format) |
| Quick run command | `node tools/test-bbj-grammar.js` (tokenization checks, under 1 s) |
| Full suite command | `cd docs && npm run build` then `bash tools/verify-phase3.sh` (build + serve checks), plus existing `verify-phase1.sh`, `verify-phase2.sh --local`, Vale |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | exercise box rendered with success classes, default title, unknown-type warning absent | build + grep | `grep -q 'alert--exercise' build/docs/authoring/components.html` and build log has no `No admonition component found`; CSS rule `.alert--exercise` exists in `_alerts.scss`; theme check is manual (screenshot both themes) | Wave 0 |
| COMP-02 | YouTube registered globally, no iframe and no `youtube` host in SSR HTML, nocookie host only in component source, title required | build + grep | `! grep -q '<iframe' build/docs/authoring/components.html`; `! grep -E 'youtube\.com/embed|ytimg' build/**/*.html`; `grep -q youtube-nocookie.com src/components/YouTube/index.js`; no `import YouTube` in any `.mdx` | Wave 0 |
| COMP-03 | bbj token classes | node script | `node tools/test-bbj-grammar.js` asserts mnemonic, label, field, class-name, variable, comment, `""` string, each added keyword; also `grep 'token mnemonic' build/docs/authoring/components.html`; MCP verification of keywords/classes recorded in `tools/data/bbj-token-verification.md` (manual MCP step) | Wave 0 |
| COMP-04 | >40 lines collapse; copy button | build + grep | fixture contains a 45 line fence; grep the built HTML for the collapse container class and `copyButton` aria-label; 40-line boundary tested by a 40 and a 41 line fence | Wave 0 |
| COMP-05 | Tabs, DocCardList, Mermaid, table wrapper, zoom | build + grep | grep built fixture for `tabs__item`, `DWC overview` card, mermaid container (`class="mermaid` or `data-mermaid`), `table-wrapper`; `grep -l 'zooming' build/assets/js/*.js`; plugin in config | Wave 0 |
| COMP-06 | search index has stub book text, not fixture; Algolia commented | build + python | `python3` over `build/search-index.json`: titles include `BBj DWC Training`, none from `authoring`; `grep -c zebra... == 0`; `grep -q '// *algolia' docusaurus.config.js`; manual Cmd+K check on `npm run serve` | Wave 0 |
| SITE-05 | logo, github link, favicon, cover, footer | build + grep | `grep 'basis-logo' build/index.html`; `grep 'github.com/BasisHub/Courses' build/index.html`; `file docs/static/img/social-cover.png` reports 1200 x 630; `favicon-32.png` is 32x32; footer string `All rights reserved.` exactly once and contains the current year; `og:image` meta points at `/Courses/img/social-cover.png` | Wave 0 |
| D-11 | fixture unlisted | build + grep | `grep -q 'noindex' build/docs/authoring/components.html`; `! grep -q authoring build/sitemap.xml`; `! grep -q authoring build/llms.txt build/llms-full.txt` | Wave 0 |
| Regression | Phase 1/2 gates stay green | scripts | `bash tools/verify-phase1.sh`, `bash tools/verify-phase2.sh --local`, `tools/.bin/vale docs/docs` | exists |

### Sampling Rate
- **Per task commit:** `node tools/test-bbj-grammar.js` for grammar work; `cd docs && npm run build` for anything that touches config or components.
- **Per wave merge:** build + `verify-phase3.sh` + Vale on `docs/docs`.
- **Phase gate:** all of the above plus `verify-phase1.sh` and `verify-phase2.sh --local` green, then manual review (below).

### Manual-only checks (justified: visual or interaction)
- Both themes: exercise box, BBj colors, YouTube facade, table dialog, zoom background (screenshot or eyeballing on `npm run serve`).
- Cmd+K opens the search and finds stub text in a production build.
- Click on the YouTube facade loads the nocookie iframe (needs network and a real video id).
- Favicon legibility at 16 and 32 px; social cover layout (Stephan reviews).

### Wave 0 Gaps
- [ ] `tools/verify-phase3.sh` (same helper style as phase 2)
- [ ] `tools/test-bbj-grammar.js` (tokenization assertions; loads `docs/src/prism/bbj-extend.js`, so keep the extension free of browser-only imports)
- [ ] fixture page `docs/docs/authoring/components.mdx` (+ `img/` sample)
- [ ] `tools/data/bbj-token-verification.md` (MCP evidence for each added keyword and the class list)
- [ ] D-15 patch folder with Prism-format tests

## Security Domain

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication / V3 Session | no | No accounts (project rule) |
| V4 Access Control | no | Static public site; `unlisted` is obscurity, not access control: do not put anything sensitive in the fixture |
| V5 Input Validation | yes (limited) | `YouTube` validates `id` against `^[A-Za-z0-9_-]{11}$` and requires `title` before building the iframe URL; React escapes `title` |
| V6 Cryptography | no | none |
| V14 Config / third-party | yes | Exact lockfile review for the two new packages; no CDN; no postinstall scripts; Algolia placeholders only (no keys committed) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Privacy leak to third party before consent | Information disclosure | Facade: no iframe, no thumbnail fetch until click (D-08/D-09), nocookie host, consent line (D-10); grep gate on built HTML |
| Malicious iframe URL via `id` | Tampering | Strict id regex; fixed host, never accept a URL |
| Supply chain (new npm packages) | Tampering | slopcheck OK; `npm ci` in CI; review lockfile diff; zooming is low-download, keep fallback `medium-zoom` |
| Fixture exposed to crawlers/LLM | Information disclosure | noindex (automatic), `ignoreFiles` for llms |
| Leaking real API keys in commented Algolia block | Information disclosure | Placeholders only |

## Sources

### Primary (HIGH confidence)
- Local source of `@docusaurus/mdx-loader` admonitions, `theme-classic` `Admonition`, `prism-include-languages`, `plugin-content-docs` (3.10.2 installed) - read directly
- Prototype builds on a scratch copy of this repo's `docs/` (Docusaurus 3.10.2, Node 22): unlisted/noindex/sitemap/search/llms behavior, Admonition swizzle, wrapped prism swizzle, DocCardList failure modes
- `docs/node_modules/prismjs/components/prism-bbj.js` (1.30.0) - read directly
- npm registry via `npm view` (versions, peers, dependencies, no postinstall) 
- webforj/webforj-documentation `docs/docusaurus.config.js`, `src/theme/MDXComponents.js`, `src/components/DocsTools/{TableWrapper.js,ExpandableCode/}` (fetched via GitHub API)
- https://documentation.basis.cloud/BASISHelp/WebHelp/usr/Character_Devices/General/using_mnemonics.htm (mnemonics in single quotes; surfaced by search)
- https://documentation.basis.cloud/BASISHelp/WebHelp/commands/rem_verb.htm (REM form)

### Secondary (MEDIUM confidence)
- https://documentation.basis.cloud/BASISHelp/WebHelp/usr/BBj_Enhancements/bbj_data_types.htm (`$`, `%`, `!` suffixes; does not state the `""` escape or `#`)
- slopcheck 0.6.1 verdicts (both packages OK)

### Tertiary (LOW confidence)
- YouTube embed referrer requirement (A5), BBj keyword list (A2), `""` escape (A1): training knowledge / project decision, unverified by the MCP

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified, both plugins built on 3.10.2
- Architecture: HIGH - every swizzle prototyped and built
- BBj token facts: MEDIUM/LOW - MCP unavailable to this agent; must be verified at execution
- Pitfalls: HIGH for those observed in builds, MEDIUM for A5

**Research date:** 2026-10-03
**Valid until:** 2026-11-02 (Docusaurus pinned, plugins stable; recheck if the pin moves)
