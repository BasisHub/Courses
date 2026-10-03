# Phase 3: Content Components & Brand - Pattern Map

**Mapped:** 2026-10-03
**Files analyzed:** 26 new/modified
**Analogs found:** 17 / 26 (rest are new-by-nature, covered by RESEARCH.md prototypes)

Note: the repo has no `docs/src/components/`, no `docs/src/theme/` swizzles besides `prism-dwc-theme.js`, no `docs/docs/authoring/`, and only `favicon.svg` in `docs/static/img/`. The webforJ originals are not in this repo; the MUI-free rewrites follow RESEARCH.md Patterns 1 to 7 (prototyped on 3.10.2).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/docusaurus.config.js` (mod) | config | build-time | itself (`docs/docusaurus.config.js`) | exact |
| `docs/package.json`, lockfile (mod) | config | build-time | itself | exact |
| `docs/src/theme/Admonition/Types.js` | component (swizzle) | request-response (render) | none in repo; RESEARCH Pattern 1 | no analog |
| `docs/src/theme/MDXComponents.js` | provider (swizzle) | render registry | none in repo; RESEARCH Pattern 5 | no analog |
| `docs/src/theme/prism-include-languages.js` | config (swizzle wrapper) | transform | `docs/src/theme/prism-dwc-theme.js` (same dir, header) | role-partial |
| `docs/src/theme/CodeBlock/index.js` | component (swizzle wrapper) | transform | none; RESEARCH Pattern 4 | no analog |
| `docs/src/theme/prism-dwc-theme.js` (mod, optional) | config | transform | itself | exact |
| `docs/src/prism/bbj-extend.js` | utility | transform | `node_modules/prismjs/components/prism-bbj.js`; RESEARCH Pattern 2 | role-match |
| `docs/src/prism/bbj-classes.json` | config/data | static | `docs/src/data/books.js` (data module) | partial |
| `docs/src/components/YouTube/index.js` + `styles.module.css` | component | event-driven (click) | `docs/src/pages/index.js` (React + Docusaurus imports) | partial |
| `docs/src/components/DocsTools/ExpandableCode/` | component | transform | none (MUI-free rewrite); `_tables.scss` for CSS style | no analog |
| `docs/src/components/DocsTools/TableWrapper/` | component | transform | `docs/src/css/_tables.scss` (`.table-container`) | role-match |
| `docs/src/css/_alerts.scss` (mod) | style | static | itself | exact |
| `docs/src/css/_prism.scss` (mod, optional) | style | static | itself | exact |
| `docs/src/css/_print.scss` (mod) | style | static | itself | exact |
| `docs/src/css/_navbar.scss` / `custom.scss` (mod, logo sizing only) | style | static | itself | exact |
| `docs/src/css/_footer.scss` (maybe untouched) | style | static | itself | exact |
| `docs/docs/authoring/components.mdx` (+ `img/`) | fixture page | static | `docs/docs/dwc/` stub pages | role-match |
| `docs/static/img/basis-logo.svg`, `favicon.svg`, `favicon-32.png`, `social-cover.svg/.png` | asset | file-I/O | `docs/static/img/favicon.svg` | role-match |
| `tools/verify-phase3.sh` | test/script | batch | `tools/verify-phase2.sh`, `tools/verify-phase1.sh` | exact |
| `tools/test-bbj-grammar.js` | test | transform | none (new); RESEARCH "BBj tokenization test" | no analog |
| `tools/data/bbj-token-verification.md` | doc/evidence | static | `tools/data/` existing outputs | partial |
| `THIRD_PARTY_NOTICES.md` (mod) | docs | static | itself | exact |
| `CONTRIBUTING.md` / `CLAUDE.md` (one sentence on `authoring/`) | docs | static | itself | exact |

## Pattern Assignments

### `docs/docusaurus.config.js` (config, build-time)

**Analog:** itself. Existing structure to extend (lines as read):

**Existing shape to preserve** (top, `baseUrl` constant, headTags, plugins, themes):
```js
const baseUrl = '/Courses/';
module.exports = {
  title: 'BASIS Courses',
  favicon: 'img/favicon.svg',
  ...
  headTags: [{tagName: 'style', attributes: {id: 'book-icons'}, innerHTML: bookIconsCss()}],
  presets: [['classic', {docs: {routeBasePath: 'docs', sidebarPath: ..., editUrl: '...'}, blog: false, theme: {customCss: [...]}}]],
  plugins: ['docusaurus-plugin-sass', require.resolve('./src/plugins/mermaid-elk-stub.js'),
    ['docusaurus-plugin-llms', {generateLLMsTxt: true, ..., docsDir: 'docs', excludeImports: true, title: 'BASIS Courses', ...}],
    ['@docusaurus/plugin-client-redirects', {redirects: []}]],
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    colorMode: {...},
    navbar: {title: 'BASIS Courses', style: 'dark', items: books.map((b) => ({type: 'docSidebar', sidebarId: `${b.id}Sidebar`, label: b.navLabel, position: 'left', className: `navbar-book book-icon--${b.id}`}))},
    docs: {sidebar: {...}},
    prism: {theme: codeTheme, darkTheme: codeTheme, additionalLanguages: ['bbj','java','css','markup','javascript','bash','json']},
  },
};
```

**Edits (all from RESEARCH Pattern 7, verified):**
- `presets[0][1].docs.admonitions = {keywords: ['exercise']}` (defaults kept, `extendDefaults` true).
- `themes`: `['@docusaurus/theme-mermaid', ['@easyops-cn/docusaurus-search-local', {hashed: true, indexBlog: false, indexPages: false, docsRouteBasePath: '/docs', language: 'en', explicitSearchResultPath: true}]]`.
- `plugins`: add `'docusaurus-plugin-zooming'`; add `ignoreFiles: ['authoring/**']` to the existing llms options object (the fixture otherwise leaks into `llms.txt`).
- `navbar`: `title: 'Courses'`, add `logo: {alt: 'BASIS International', src: 'img/basis-logo.svg'}`; append after `books.map(...)` via spread: `...books.map(...)`, `{type: 'search', position: 'right'}`, `{href: 'https://github.com/BasisHub/Courses', position: 'right', className: 'header-github-link', 'aria-label': 'GitHub repository'}`. Keep top-level `title: 'BASIS Courses'`.
- `themeConfig.image: 'img/social-cover.png'`; `footer: {links: [{html: \`<p>Copyright &copy; ${year} BASIS International Ltd. All rights reserved.</p>\`}]}` with `const year = new Date().getFullYear();` near `baseUrl`. The `links: [{html}]` form matches `_footer.scss` (`.footer__link-item p`).
- Commented Algolia block with placeholders only, inside `themeConfig`, same style as the existing commented `announcementBar` (`// D-13: off` plus `//` lines).
- Favicon PNG fallback via the existing `headTags` array, using the `baseUrl` constant (headTags get no baseUrl): `{tagName: 'link', attributes: {rel: 'icon', type: 'image/png', sizes: '32x32', href: \`${baseUrl}img/favicon-32.png\`}}`.
- Keep `'bbj'` in `additionalLanguages` (the wrapped swizzle patches after it loads).

---

### `docs/src/theme/prism-include-languages.js` (swizzle wrapper, transform)

**Analog:** `docs/src/theme/prism-dwc-theme.js` for the header convention only; body from RESEARCH Pattern 2. This file is original code, no webforJ header needed.

**Core pattern (RESEARCH Pattern 2):**
```js
import prismIncludeLanguages from '@theme-original/prism-include-languages';
import extendBbj from '../prism/bbj-extend';
export default function (PrismObject) {
  prismIncludeLanguages(PrismObject);
  extendBbj(PrismObject);
}
```
Pitfall: patch the passed `PrismObject`, never `require('prismjs')`.

---

### `docs/src/prism/bbj-extend.js` (utility, transform)

**Analog:** `docs/node_modules/prismjs/components/prism-bbj.js` (base grammar being patched; read it at implementation time) and RESEARCH Pattern 2 prototype.

**Rules to copy (RESEARCH Pattern 2 + "BBj MCP Verification", authoritative):**
```js
export default function extendBbj(Prism) {
  if (!Prism.languages.bbj) return;
  Prism.languages.bbj.string = {pattern: /"(?:[^"]|"")*"/, greedy: true};   // same key keeps order
  Prism.languages.insertBefore('bbj', 'number', {
    mnemonic: {pattern: /'[A-Za-z0-9_]+(?:\([^)]*\))?'/, greedy: true, alias: 'builtin'},
    label: {pattern: /^[ \t]*[A-Za-z_]\w*(?=:)/m, alias: 'symbol'},
    field: {pattern: /#[A-Za-z_]\w*[$!%]?/, alias: 'variable'},
    'hex-string': {pattern: /\$[0-9A-Fa-f]*\$/, alias: 'number'},   // must precede `variable`
    'class-name': new RegExp('\\b(?:' + classes.join('|') + ')\\b'),  // from bbj-classes.json (35 names)
  });
  Prism.languages.insertBefore('bbj', 'function', {variable: /\b[A-Za-z_]\w*[$!%]/});
  // insertBefore returns a NEW object: re-read Prism.languages.bbj afterwards
  // add next|to|step|write|open|close|wait|input|new|auto to keyword; remove `not` from operator; keep `cast` out
}
```
Constraints: ESM `export default` for the Docusaurus path, yet `tools/test-bbj-grammar.js` must load it (use dynamic `import()` or a CJS shim in the test). No browser-only imports. Executors may use only the keywords and 35 class names in RESEARCH "BBj MCP Verification"; no additions. Token types `mnemonic/label/field` alias onto existing theme styles (`builtin` to string color, `symbol` to number color, `variable`), so `prism-dwc-theme.js` needs no change unless Stephan asks.

---

### `docs/src/prism/bbj-classes.json` (data)

**Analog:** `docs/src/data/books.js` (plain data module, comment header explaining order and permanence).
Shape: `{"source": "bbj-docs hosted 2026-09-21 fd516a9d, verified 2026-10-03", "classes": ["BBjAPI", ...35]}`.

---

### `docs/src/theme/Admonition/Types.js` (swizzle, render)

**Analog:** none in repo. Copy RESEARCH Pattern 1 verbatim (`@theme-original/Admonition/Types`, `@theme/Admonition/Layout`, `clsx`; `title="Try it yourself"`, className `alert alert--success alert--exercise`, export `{...DefaultTypes, exercise: Exercise}`). Add an inline-SVG icon component in the same file. Test the unlabeled `:::exercise` form (A7).

**Style analog (`docs/src/css/_alerts.scss`)**, extend the file (keep header on line 1, then change header to "Copied ... and modified" and list in notices):
```scss
.alert--success {
  --ifm-alert-background-color: var(--dwc-color-success-alt);
  --ifm-alert-background-color-highlight: var(--dwc-color-success-alt);
  --ifm-alert-foreground-color: var(--dwc-color-success-text);
  --ifm-alert-border-color: var(--dwc-color-success);
}
```
Add only `.alert--exercise { ... }` extras with `--dwc-*` or `--ifm-*` vars; never hardcode colors.

---

### `docs/src/theme/MDXComponents.js` (swizzle, registry)

**Analog:** none in repo. RESEARCH Pattern 5. Shape:
```js
import MDXComponents from '@theme-original/MDXComponents';
import DocCardList from '@theme/DocCardList';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import YouTube from '@site/src/components/YouTube';
import ExpandableCode from '@site/src/components/DocsTools/ExpandableCode';
import TableWrapper from '@site/src/components/DocsTools/TableWrapper';
export default {...MDXComponents, DocCardList, Tabs, TabItem, YouTube, ExpandableCode, table: TableWrapper};
```
Do not register ComponentDemo, DocChip, JavadocLink, ParentLink, TableBuilder, Gallery*, Giscus, AskMenu, etc. (CLAUDE.md Forbidden). If the file copies webforJ structure, carry the MIT header line (`// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).`) and add to notices.

---

### `docs/src/components/YouTube/index.js` + `styles.module.css` (component, event-driven)

**Analog (imports/style only):** `docs/src/pages/index.js`:
```js
import React from 'react';
import Link from '@docusaurus/Link';
```
Core from RESEARCH Pattern 3: `useState(false)`; before click a `<button type="button">` with inline SVG play icon, title, consent `<p>`; after click `<iframe src={\`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0\`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin">`; plus `<a href={\`https://www.youtube.com/watch?v=${id}\`}>Watch on YouTube</a>`. Validate `id` against `/^[A-Za-z0-9_-]{11}$/` and require `title` (throw so a bad page fails the build). CSS module: `aspect-ratio: 16/9`, `--dwc-border-radius-m`, `--dwc-surface-*`. This is original code: no MIT header. Print rule (hide button, show title + URL) goes in `_print.scss`.

---

### `docs/src/components/DocsTools/TableWrapper/` (component, transform)

**Analog:** `docs/src/css/_tables.scss` already styles the target markup (copied from webforJ):
```scss
.table-container { border: 1px solid var(--dwc-border-color); border-radius: var(--dwc-border-radius-xl); overflow: hidden; margin: var(--ifm-spacing-vertical) 0; }
.table-container table { margin: 0 !important; width: 100%; border-collapse: collapse; display: table; }
```
So the wrapper must render `<div className="table-container"><table {...props} /></div>` (plus an expand-in-native-`<dialog>` button, no MUI). Adapted from webforJ: MIT header and notices entry.

### `docs/src/components/DocsTools/ExpandableCode/` (component, transform)

No analog. RESEARCH Pattern 4: pass the full code to `@theme/CodeBlock` and clip with `max-height` plus gradient CSS (copy button must copy the full text); props `previewLines`, `title`; inline SVG chevron instead of MUI. `src/theme/CodeBlock/index.js` wraps `@theme-original/CodeBlock` and auto-clips string children over 40 lines; guard against double wrapping inside `ExpandableCode`. Boundary: 40 lines not clipped, 41 clipped.

---

### `docs/src/css/_print.scss`, `_navbar.scss`, `_prism.scss` (style)

**Analog:** themselves.
- Print rules live in `@media print { ... display: none !important; ... }` (see list of hidden selectors); add `.youtube` facade rules there.
- `_navbar.scss` already has the GitHub icon, no change needed:
```scss
.header-github-link::before { background: var(--header-github-link) no-repeat; content: ""; display: flex; height: 24px; width: 24px; }
```
The `--header-github-link` var is defined in `custom.scss` line 47 (white-filled SVG). Only add logo height rules (e.g. `.navbar__logo`) under `#__docusaurus .navbar` if the 193x66 lockup needs sizing.
- `_prism.scss` token vars: `--dwc-code-{text,comment,keyword,string,number,function,class,variable,punctuation,operator,control,regex}` defined for light (`:root`/default) and dark blocks. New token colors, if wanted, must add a var in both blocks and a style entry in `prism-dwc-theme.js` (`{types: [...], style: {color: 'var(--dwc-code-...)'}}`).

---

### `docs/docs/authoring/components.mdx` (fixture)

**Analog:** stub pages under `docs/docs/dwc/` (front matter `title`, `description`; H2 start). Front matter (RESEARCH): `title`, `description`, `unlisted: true`. Rules: every fence has a language; MDX comments `{/* */}`; image `./img/name.png` with alt; `<YouTube id="..." title="..." />` with no import; `<DocCardList items={[{type: 'link', label: 'DWC overview', href: '/docs/dwc/overview', description: '...'}]} />` (no `docId`, no bare form); BBj fence is exactly the pre-verified snippet in RESEARCH "BBj MCP Verification"; no new BBj code. No `import YouTube` anywhere in `.mdx`. Prose must pass Vale (no em dashes, no "please"). Not in `books.js` or sidebars.

---

### `tools/verify-phase3.sh` (script, batch)

**Analog:** `tools/verify-phase2.sh` (sections/flags, helpers) and `tools/verify-phase1.sh` (build + serve on port).

**Helpers to copy** (verify-phase2.sh lines 7-30):
```bash
set -u
cd "$(dirname "$0")/.." || exit 1
FAILS=0; SEC=""
pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { local name="$1"; shift; if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi; }
has() { grep -q -- "$2" "$1" 2>/dev/null; }
hasf() { grep -qF -- "$2" "$1" 2>/dev/null; }
```
Flags pattern: `MODE_*` variables, `for a in "$@"; do case ... --local ...; *) echo "Unknown flag" >&2; exit 2`; `trap cleanup EXIT`.

**Build + serve pattern** (verify-phase1.sh lines 14-27, 47, 63-80): `kill_tree`/`stop_server` with `trap stop_server EXIT`; build `(cd docs && npm run build >/dev/null 2>&1)`; refuse if port in use (`lsof -tiTCP:"$PORT" -sTCP:LISTEN`); start `(cd docs && exec npm run serve -- --port "$PORT" --no-open >/dev/null 2>&1) &`, poll `curl -fsS` up to 30 s. Use a different port than 3111 if phases may overlap.

Checks to implement come from the RESEARCH "Phase Requirements to Test Map" (alert--exercise, no `<iframe`/`ytimg`/`youtube.com/embed` in built HTML, `noindex`, `authoring` absent from `sitemap.xml`/`llms.txt`/`llms-full.txt`/`search-index.json`, image sizes via `file`, footer string once, `og:image`). Reuse the existing external-host check from verify-phase1 (lines ~100-105): `fonts.googleapis|fonts.gstatic|cdn.webforj` must stay absent. Note: the sitemap gains `/search`; verify-phase1 link checks still pass. Agents cannot run shell scripts here; the user runs them with `!`.

### `tools/test-bbj-grammar.js` (test, transform)

No analog (no node test files). Keep it a short smoke test (D-15 superseded: no upstream PrismJS patch, Prism-format tests or PR text are in scope). RESEARCH "BBj tokenization test": load `prismjs` + `prismjs/components/prism-bbj` from `docs/node_modules`, apply `bbj-extend.js`, `Prism.tokenize` the pre-verified snippet, assert token types listed under "Expected tokens". Include a stale-reference guard (Pitfall 5).

### `THIRD_PARTY_NOTICES.md` (mod)

**Analog:** itself, "Copied or adapted files" list under "webforJ documentation". Add entries for each file with a webforJ header: `docs/src/theme/MDXComponents.js`, `docs/src/components/DocsTools/TableWrapper/*`, `ExpandableCode/*` (if adapted), and note modified `_alerts.scss`. Original files (YouTube, Admonition/Types, prism wrapper, bbj-extend) carry no header. Also extend the "header audit" sentence only if new files were audited. The `prism-dwc-theme.js` header shows the "modified" form:
```js
// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
// Local change: ...
```

### Brand assets (`docs/static/img/*`)

**Analog:** `docs/static/img/favicon.svg` (to be replaced). Source: `/Users/beff/Downloads/BASISlogo/BASISlogo.svg` (outside repo). Commands from RESEARCH: `rsvg-convert -w 32 -h 32 ... -o docs/static/img/favicon-32.png`; `rsvg-convert -w 1200 -h 630 docs/static/img/social-cover.svg -o docs/static/img/social-cover.png`. Recolor `.st1 #26446B` to `#fff`, keep `.st0 #BCC9D2`, drop XML comment and `enable-background`. Cover text as paths or system font stack, no web font or CDN.

## Shared Patterns

### MIT header for webforJ-derived files
**Source:** `docs/src/css/_alerts.scss` line 1, `docs/src/css/custom.scss` lines 1-4
**Apply to:** any file copied/adapted from webforJ (MDXComponents, TableWrapper, ExpandableCode, modified `_alerts.scss`)
```scss
/* Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
   Local changes: ... */
```
JS form: `// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).` Add each to `THIRD_PARTY_NOTICES.md`.

### DWC tokens, no hardcoded colors, both themes
**Source:** `_alerts.scss`, `_tables.scss`, `_prism.scss` (`var(--dwc-*)`, `var(--ifm-*)`)
**Apply to:** all new CSS (exercise, YouTube module, TableWrapper dialog, ExpandableCode gradient, navbar logo)

### Self-hosted only, no external hosts
**Source:** verify-phase1.sh section 4 (grep for `fonts.googleapis|fonts.gstatic|cdn.webforj`; all `<link>` hrefs under `/Courses/`)
**Apply to:** YouTube facade (no request before click), cover SVG fonts, search/zoom plugins

### Config uses `baseUrl` constant for non-Docusaurus-prefixed URLs
**Source:** `docusaurus.config.js` (`scripts: [{src: \`${baseUrl}js/...\`}]`)
**Apply to:** favicon PNG headTag

### Build gates throw on broken links/anchors/images
**Source:** `docusaurus.config.js` (`onBrokenLinks: 'throw'`, `onBrokenAnchors`, `markdown.hooks`)
**Apply to:** fixture page (relative `./img/` images, explicit DocCardList hrefs)

### Plugin-guard style with explanatory comments
**Source:** `docs/src/plugins/mermaid-elk-stub.js` (header comment stating why, when to delete)
**Apply to:** `bbj-extend.js` (state "delete when a released prismjs contains the fixes"), any workaround

### Conventions from CLAUDE.md
Kebab-case file names for docs/assets, front matter `title` + `description`, language on every fence, MDX comments `{/* */}`, no em dashes, Vale clean, no BBj tokens beyond the MCP-verified lists.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/theme/Admonition/Types.js` | swizzle | render | No swizzles exist; use RESEARCH Pattern 1 |
| `src/theme/MDXComponents.js` | swizzle | render registry | Same; RESEARCH Pattern 5 |
| `src/theme/CodeBlock/index.js` | swizzle wrapper | transform | RESEARCH Pattern 4 |
| `src/components/DocsTools/ExpandableCode/` | component | transform | webforJ original uses MUI, rewrite |
| `src/components/YouTube/` | component | event-driven | No interactive components exist |
| `tools/test-bbj-grammar.js` | test | transform | No node test scripts exist |

## Metadata

**Analog search scope:** `docs/src/**`, `docs/docusaurus.config.js`, `tools/*.sh`, `THIRD_PARTY_NOTICES.md`, `docs/static/img`
**Files scanned:** about 30
**Pattern extraction date:** 2026-10-03
