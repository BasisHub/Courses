# Phase 1: Site Scaffold & Quality Gates - Pattern Map

**Mapped:** 2026-10-03
**Files analyzed:** about 45 (new, greenfield repo)
**Analogs found:** all files have an analog: either the verified prototype or the webforJ clone, or both

## Analog roots (all read-only)

| Alias | Absolute path | Use |
|-------|---------------|-----|
| PROTO | `/private/tmp/claude-501/-Users-beff--workspace-BBjCourses/68b0bdc1-497a-4cfa-9b7d-9708a290d579/scratchpad/proto` | Verified working scaffold (built, served, screenshotted, gates proven). Primary analog. Scratchpad is session-scoped, so copy from it early or re-create from 01-RESEARCH.md Code Examples 1-6. |
| UPSTREAM | `/private/tmp/claude-501/-Users-beff--workspace-BBjCourses/68b0bdc1-497a-4cfa-9b7d-9708a290d579/scratchpad/webforj-documentation/docs` | webforJ `docs/` clone (MIT, (c) 2022 webforJ). |
| DWC-COURSE | `.../scratchpad/DWC-Course` | Only for the dwc card blurb (`docs/index.md`). |

Strategy: most files are byte-identical copies of UPSTREAM already present in PROTO. Copy from PROTO; the table says which ones differ from UPSTREAM.

## File Classification

Verified by `diff` of PROTO against UPSTREAM: IDENT = byte-identical, DIFF = edited, NEW = not upstream.

| New file (under `docs/` unless noted) | Role | Data flow | Analog | Diff vs upstream | MIT notice |
|---|---|---|---|---|---|
| `package.json`, `package-lock.json`, `.nvmrc` | config | n/a | PROTO `docs/package.json` (rewrite; upstream is unusable) | NEW | no |
| `docusaurus.config.js` | config | build-time | PROTO `docs/docusaurus.config.js` = RESEARCH Code Example 1 | rewrite | no (written fresh; structure inspired by upstream) |
| `sidebars.js` | config | build-time transform | PROTO `docs/sidebars.js` | NEW | no |
| `src/data/books.js` | config/registry | build + render | PROTO `docs/src/data/books.js` | NEW | no |
| `src/data/book-icons-css.js` | utility | build-time file-I/O | PROTO `docs/src/data/book-icons-css.js` | NEW | no |
| `src/plugins/mermaid-elk-stub.js` | plugin | build-time | extract inline `mermaidElkStub` from PROTO config | NEW | no |
| `src/pages/index.js` | component (page) | request-response (static) | PROTO `docs/src/pages/index.js`; UPSTREAM is only a `<Redirect>` | rewrite | no |
| `src/css/custom.scss` | style | n/a | UPSTREAM `src/css/custom.scss` via PROTO | DIFF (3 `@use` lines, fonts, `.MuiChip-root` block removed) | yes |
| `src/css/_alerts, _announcement, _category, _footer, _navbar, _pagination, _prism, _reset, _root, _sidebar, _tables, _toc, _tutorial-content, _utils.scss` | style | n/a | UPSTREAM same names | IDENT | yes |
| `src/css/_sidebar-icons.scss` | style | n/a | UPSTREAM; PROTO left it untouched (IDENT). RESEARCH says trim the 20 `.cat-icon--*` rules | IDENT in PROTO, trim in plan | yes |
| `src/css/_content.scss` | style | n/a | UPSTREAM + 2-line `@use` fix | DIFF | yes |
| `src/css/mixins/_content-block.scss` | style | n/a | UPSTREAM | IDENT | yes |
| `src/css/_book-icons.scss` | style | n/a | PROTO | NEW | no |
| `src/css/_print.scss` | style | print | PROTO | NEW | no |
| `src/theme/prism-dwc-theme.js` | config (code theme) | n/a | UPSTREAM | IDENT | yes |
| `static/js/dwc-theme-switcher.js`, `static/js/link-decorator.js` | script | event-driven (DOM) | UPSTREAM | IDENT | yes |
| `static/css/dwc-ui.css` | vendored asset | n/a | PROTO `docs/static/css/dwc-ui.css` (snapshot of `https://cdn.webforj.com/next/dwc-ui.css`); add header comment with source URL + fetch date (D-10) | not MIT; licence stance is RESEARCH A3 | no (record in Phase 2 notices) |
| `static/img/favicon.svg` | asset | n/a | none; neutral geometric SVG | NEW | no |
| `docs/intro-bbj/00-overview.mdx`, `docs/intro-bbj/01-<chapter>/{_category_.json,index.md,01-<page>.md}` | content | n/a | PROTO `docs/docs/dwc/...` mirror | NEW | no |
| `docs/dwc/00-overview.mdx`, `docs/dwc/01-<chapter>/{...}` | content | n/a | PROTO `docs/docs/dwc/...` | NEW | no |
| `tools/prove-gates.sh` | test script | batch | PROTO `tools/prove-gates.sh` = RESEARCH Code Example 5 | NEW | no |
| `tools/verify-phase1.sh` | test script | batch | assemble from RESEARCH "Validation Architecture" table; no code analog | NEW | no |
| `tools/requirements.txt` | config | n/a | RESEARCH Installation block | NEW | no |
| `.gitignore` | config | n/a | existing repo `.gitignore` (already has `import/`, `.DS_Store`, `node_modules/`); add `docs/build/`, `docs/.docusaurus/` | modify | no |

Not copied (do not touch): UPSTREAM `_accordion.scss`, `_blog.scss`, `components/`, `src/theme/{Heading,MDXContent,MDXComponents,CodeBlock,BlogLayout,BlogTagsListPage,NavbarItem}`, `static/js/dwc-doc-components.js`, upstream `package.json`/`docusaurus.config.js`. They are coupled to MUI, Giscus, i18n.

## Pattern Assignments

### `docs/package.json` (config)

**Analog:** PROTO `docs/package.json` (verified, installs and builds). Copy as is, set `engines.node` to `>=20`, add `docs/.nvmrc` = `24`. All six `@docusaurus/*` are exact `3.10.2`.

```json
"dependencies": {
  "@docusaurus/core": "3.10.2", "@docusaurus/plugin-client-redirects": "3.10.2",
  "@docusaurus/preset-classic": "3.10.2", "@docusaurus/theme-mermaid": "3.10.2",
  "@fontsource-variable/inter": "^5.3.0", "@fontsource-variable/jetbrains-mono": "^5.3.0",
  "@mdx-js/react": "^3.1.1", "clsx": "^2.1.1", "docusaurus-plugin-sass": "^0.2.7",
  "prism-react-renderer": "^2.4.1", "react": "^19.2.0", "react-dom": "^19.2.0", "sass": "^1.105.1"
},
"devDependencies": {
  "@docusaurus/module-type-aliases": "3.10.2", "@docusaurus/types": "3.10.2",
  "@tabler/icons": "^3.44.0", "docusaurus-plugin-llms": "^0.6.1"
}
```
Scripts: `docusaurus`, `start`, `build`, `serve`, `clear`, `swizzle`, `write-heading-ids`. No `prebuild`/`prestart`. Commit the lockfile.

### `docs/docusaurus.config.js` (config)

**Analog:** PROTO `docs/docusaurus.config.js` (full text in 01-RESEARCH.md Code Example 1, lines 296-375). Load-bearing patterns:

**baseUrl constant** (Docusaurus does not prefix `scripts`/`stylesheets`):
```js
const baseUrl = '/Courses/';
scripts: [{src: `${baseUrl}js/dwc-theme-switcher.js`, async: false}, {src: `${baseUrl}js/link-decorator.js`}],
stylesheets: [`${baseUrl}css/dwc-ui.css`],
```
**Gates** (hooks under `markdown`, not top level):
```js
onBrokenLinks: 'throw', onBrokenAnchors: 'throw',
markdown: {mermaid: true, hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'}},
```
**Fonts before custom.scss, in `theme.customCss`:**
```js
require.resolve('@fontsource-variable/inter/wght.css'),
require.resolve('@fontsource-variable/inter/wght-italic.css'),
require.resolve('@fontsource-variable/jetbrains-mono/index.css'),
require.resolve('./src/css/custom.scss'),
```
**Mermaid workaround (required; build fails otherwise)**, move into `src/plugins/mermaid-elk-stub.js`:
```js
function mermaidElkStub() {
  return {name: 'mermaid-elk-stub', configureWebpack: () => ({resolve: {alias: {'@mermaid-js/layout-elk': false}}})};
}
```
**Navbar from registry** (text-only title, no logo, no search/GitHub item, D-09/D-14):
```js
navbar: {title: 'BASIS Courses', style: 'dark',
  items: books.map((b) => ({type: 'docSidebar', sidebarId: `${b.id}Sidebar`, label: b.navLabel,
    position: 'left', className: `navbar-book book-icon--${b.id}`}))},
colorMode: {respectPrefersColorScheme: true},
```
Also: add `favicon: 'img/favicon.svg'`; keep `announcementBar` commented out (D-13); `editUrl` per D-15; `additionalLanguages` lowercase only; llms plugin options and `['@docusaurus/plugin-client-redirects', {redirects: []}]` as in Example 1. `headTags` carries only the book-icon `<style>`, no Google Fonts.

### `docs/sidebars.js` and `docs/src/data/books.js` (registry, build-time transform)

**Analog:** PROTO `docs/sidebars.js`, `docs/src/data/books.js`.

```js
// sidebars.js
const books = require('./src/data/books');
module.exports = Object.fromEntries(
  books.map((b) => [`${b.id}Sidebar`, [{type: 'autogenerated', dirName: b.id}]]),
);
```
`books.js` is CommonJS (`module.exports = [...]`, entries `{id, title, navLabel, icon, description, to}`), order intro-bbj then dwc. Use the PROTO descriptions as a start; the D-05 draft blurbs are in RESEARCH Open Question 3.

### `docs/src/data/book-icons-css.js` (utility, file-I/O)

**Analog:** PROTO `docs/src/data/book-icons-css.js` (RESEARCH Example 2). Reads Tabler SVG by filesystem path (the package `exports` map blocks `require.resolve`):
```js
const file = path.join(__dirname, '../../node_modules/@tabler/icons/icons/outline', `${b.icon}.svg`);
const uri = `data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(file, 'utf8').trim()).toString('base64')}`;
return `.book-icon--${b.id}{--book-icon:url("${uri}")}`;
```

### `docs/src/pages/index.js` (component, static render)

**Analog:** PROTO `docs/src/pages/index.js` (RESEARCH Example 4). Imports: `Layout from '@theme/Layout'`, `Link from '@docusaurus/Link'`, `Heading from '@theme/Heading'`, `books from '../data/books'`. Card structure must keep the upstream card classes for `_category.scss` styling:
```jsx
<section className="row topics-section">
  {books.map((b) => (
    <article key={b.id} className={`col col--6 margin-bottom--lg book-icon--${b.id}`}>
      <Link to={b.to} className="card padding--lg book-card">
        <span className="book-card__icon" aria-hidden="true" />
        <Heading as="h2">{b.title}</Heading>
        <p>{b.description}</p>
```
Do not use `DocCardList` (cannot show a Tabler icon) or `[class^="row list"]`.

### `docs/src/css/custom.scss` and copied partials (style)

**Analog:** UPSTREAM `src/css/custom.scss` via PROTO. Edits against upstream (confirmed by diff):
- Remove `@use "./accordion"; @use "./blog"; @use "components/dwc-doc-components";`, add `@use "./book-icons"; @use "./print";`
- Fonts: `--ifm-font-family-base` / `--ifm-heading-font-family` start with `'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif`; `--ifm-font-family-monospace` starts with `'JetBrains Mono Variable', 'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace`. The `Variable` suffix is mandatory or fonts silently fall back.
- Delete the whole `.MuiChip-root` block (about 27 lines).

`_content.scss` edit (removes the only Sass deprecation):
```scss
@use "./mixins/content-block";        // was: @import "./mixins/content-block.scss";
    @include content-block.content-block;   // was: @include content-block;
```
All other partials: copy verbatim, prepend `/* Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ). */`. SCSS files have no upstream header today. For `_sidebar-icons.scss` keep the `_icon` mixin and `category-icons` base block, drop the 20 `.cat-icon--*` rules (PROTO did not trim it, so the trim is untested; rebuild after).

### `docs/src/css/_book-icons.scss` and `_print.scss` (style, NEW)

**Analog:** PROTO files, copy verbatim (full text in RESEARCH Examples 3 and 5). `_book-icons.scss` uses a `%book-icon-mask` placeholder with `-webkit-mask`/`mask: var(--book-icon) center / contain no-repeat` on `.navbar__item.navbar-book::before` and `.book-card__icon`. `_print.scss` is a single `@media print` block hiding `.navbar`, `.theme-doc-sidebar-container`, TOC, `.footer`, `.pagination-nav`, breadcrumbs, edit link, announcement bar, and widening `docMainContainer`/`docItemCol`/`main`. The `a[href^="http"]::after` URL rule is optional.

### `docs/static/js/dwc-theme-switcher.js`, `link-decorator.js` (script, event-driven)

**Analog:** UPSTREAM, identical in PROTO. Copy verbatim with MIT header comment. `link-decorator.js` adds `empty-link` to every text-only `<a>` (internal ones too, so they get the arrow; accepted, RESEARCH Open Question 2). Pitfall: the switcher selector `[class*="toggleButton"][class*="ColorModeToggle"]` matches 3.10.2 markup.

### Stub book content (content)

**Analog:** PROTO `docs/docs/dwc/**` and `docs/docs/intro-bbj/**`.

`00-overview.mdx` (add `description`, and a real `title`, so `llms.txt` is not "Overview" twice):
```mdx
---
id: overview
title: Overview
sidebar_position: 0
---
## Hi
Stub. See [chapter](./01-first-chapter/01-page.md).
```
`_category_.json`: link id must use the numeric-prefix-stripped id:
```json
{"label":"Sample chapter","position":1,"link":{"type":"doc","id":"dwc/first-chapter/index"}}
```
Page with gate-protected content (internal anchor, cross-book file-path link, `bbj` fence, mermaid fence):
```md
## First
Text. [anchor](#first) and [other book](../../intro-bbj/00-overview.mdx).
```
Rules: H2 headings only, every fence has a language, no book-level `_category_.json`, give every page `title` front matter. The anchor probe in `prove-gates.sh` hard-codes `./01-first-chapter/01-page.md`, so keep those stub names or edit the script.

### `tools/prove-gates.sh` (test script, batch)

**Analog:** PROTO `tools/prove-gates.sh` (RESEARCH Example 5, lines 469-488). Pattern: `#!/usr/bin/env bash`, `trap 'rm -f "$PROBE"' EXIT`, a `probe name body expected-substring` function that writes `docs/dwc/99-gate-probe.md`, runs `npm run build`, requires non-zero exit AND the expected message (`found broken links`, `found broken anchors`, `onBrokenMarkdownLinks`, `onBrokenMarkdownImages`), then a clean control build. Must be bash, not zsh.

## Shared Patterns

### MIT notice on copied files
Applies to: every UPSTREAM-derived file: all `_*.scss` partials, `custom.scss`, `mixins/_content-block.scss`, `prism-dwc-theme.js`, both static JS files. Add a one-line header, e.g. `/* Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ). */` (JS: `//` form). Upstream files carry no header; licence text is in UPSTREAM `LICENSE`. Phase 2 adds `THIRD_PARTY_NOTICES.md`. Files written fresh (config, books, page, `_book-icons`, `_print`, scripts) need none. `dwc-ui.css` is not MIT-covered: provenance comment only, licence confirmation per RESEARCH A3.

### baseUrl handling
Applies to: config `scripts`, `stylesheets`; any future static reference. Use the `baseUrl` constant; Docusaurus prefixes only `favicon`, `Link`, bundled assets (css-loader `url()`), not `scripts`/`stylesheets`. No `url(/...)` absolute paths exist in the copied SCSS (only `data:`).

### Single registry
Applies to: config navbar, `sidebars.js`, landing page, icon CSS. All read `src/data/books.js`; order there is learning order.

### Stub content conventions
Applies to: all Markdown/MDX. kebab-case ASCII, two-digit prefixes, H2 start, language on every fence, `title` front matter, ids and `_category_.json` links stripped of prefixes.

### Known benign noise
Every build prints a `postcss-calc ... c * 3` warning from `custom.scss` (navbar dark oklch). Exit code is 0; do not assert on a warning-free build.

## No Analog Found

| File | Role | Reason |
|------|------|--------|
| `tools/verify-phase1.sh` | test script | Only exists as the assertion table in RESEARCH "Validation Architecture"; write from that |
| `docs/static/img/favicon.svg` | asset | Neutral placeholder required (D-14); not DWC-Course logo |
| `docs/.nvmrc`, `tools/requirements.txt` | config | One-liners from RESEARCH (`24`; `beautifulsoup4==4.15.0`, `lxml==6.1.3`, `markdownify==1.2.3`) |

## Metadata

**Analog search scope:** PROTO (full file list reviewed), UPSTREAM `src/css`, `static/js`, `src/theme/prism-dwc-theme.js` (byte-diffed against PROTO), RESEARCH.md code examples.
**Files scanned:** about 40 (diff-based comparison, selective reads).
**Pattern extraction date:** 2026-10-03
