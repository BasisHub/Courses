# Phase 1: Site Scaffold & Quality Gates - Research

**Researched:** 2026-10-03
**Domain:** Docusaurus 3.10.2 static site scaffold, webforJ/DWC theme transplant under a `/Courses/` baseUrl, throwing build gates
**Confidence:** HIGH (everything below was exercised in a scratch build: `npm install`, `docusaurus build`, `serve`, `start`, headless Chrome screenshots, print-to-PDF, four deliberate gate failures)

## Summary

The phase is a transplant job: copy the webforJ SCSS set and a few static scripts, rewrite `package.json` and `docusaurus.config.js`, add a data-driven landing page and two stub books. I built that whole scaffold in a scratch directory (`<scratchpad>/proto/docs`) and ran it. It builds in about 25 s, serves the landing page at `/Courses/`, renders in light and dark mode with the webforJ look, embeds fonts and `dwc-ui.css` from the site itself, and all four gates fail the build with distinct messages. The code in this document is therefore tested, not recalled.

**One finding changes the plan: `@docusaurus/theme-mermaid@3.10.2` does not build without a workaround.** A clean install with `markdown.mermaid: true` and the theme registered fails the client bundle with `Module not found: Can't resolve '@mermaid-js/layout-elk'`, although the package is declared an optional peer and the theme's own probe correctly reports it absent. Webpack still tries to resolve the dead dynamic import. Pinning webpack 5.104.1 did not help. A 3-line inline plugin that aliases `@mermaid-js/layout-elk` to `false` fixes it (build, dev server and a rendered Mermaid diagram verified). The seed, STACK.md and SUMMARY.md did not know about this. The alternative is installing `@mermaid-js/layout-elk` (peer range `^0.1.9`, while latest is 1.0.1 for mermaid 12, so it would raise a peer conflict); the stub is cheaper and safer.

Other seed corrections found here: copied webforJ `Heading`, `MDXContent` and `MDXComponents` are not "anchor behaviour / trim" candidates, they are wired to MUI, AskMenu, Giscus and i18n and must not be copied in Phase 1 at all. Category `link` ids must use the numeric-prefix-stripped doc id. `dwc-ui.css` is best served as a static file through the config `stylesheets` option with the baseUrl constant (loads before the bundle, like webforJ's `headTags`, and avoids CSS minifier risk).

**Primary recommendation:** Build the scaffold exactly as in the Code Examples below (it is the verified prototype), copy only the SCSS partials and two static scripts listed in the Copy/Strip table, add the mermaid-elk alias plugin, and prove the four gates with `tools/prove-gates.sh`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Landing page (`src/pages/index.js`)**
- **D-01:** A short intro block sits above the cards: a heading (working title "BASIS Training Books"), a one-line description, then the cards. No full marketing hero and no call-to-action banner.
- **D-02:** Each card shows only the title, a 1–2 sentence blurb and the book's Tabler icon. No audience tag, chapter count or prerequisite link. All of it comes from `src/data/books.js`.
- **D-03:** The cards sit in a responsive grid that reuses webforJ's `_category.scss` card look: 2 columns on desktop, 1 on mobile, and more columns as books are added.
- **D-04:** Book order is learning order: **intro-bbj first, then dwc**, on the landing page and in the navbar. `books.js` order is the single source for both.
- **D-05:** Claude drafts the intro text and card blurbs (Vale-clean, direct, second person) from the Moodle course-2 summary and the DWC-Course index. Stephan reviews them.

**Books & navbar**
- **D-06:** Book slugs are permanent: `intro-bbj` and `dwc` (URLs `/Courses/docs/intro-bbj/...`, `/Courses/docs/dwc/...`; the Phase 8 redirect target depends on `dwc`).
- **D-07:** Navbar labels are short: **"BBj Basics"** (intro-bbj) and **"DWC"** (dwc). Full titles ("Introduction to BBj Development", "BBj DWC Training") appear on the cards and overview pages. There are two `docSidebar` navbar items and no dropdown yet.
- **D-08:** Each stub book has `00-overview.mdx` plus **one numbered sample chapter folder** with `_category_.json` (explicit `link`) and at least one page. The point is to prove sidebar numbering, prefix stripping, prev/next, the category link behaviour and the category/index spikes. Phases 4/5 replace the stub content.
- **D-09:** Phase 1 navbar = the two book items + the dark/light theme toggle **only**. No GitHub link and no search placeholder; both arrive in Phase 3 (SITE-05, COMP-06).

**Vendored DWC assets**
- **D-10:** `dwc-ui.css` is **one committed snapshot** of `https://cdn.webforj.com/next/dwc-ui.css` (e.g. `docs/static/css/dwc-ui.css`), with a header comment giving the source URL and the fetch date. Keep it simple: no refresh script, and updates are manual if ever needed. Verified 2026-10-03: only `/next/` is served (versioned paths return 403), there is no npm package, the file is about 91 KB and has no `url()`/`@import`, so it is self-contained.
- **D-11:** Fonts come from `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` npm packages, imported through the bundler so the woff2 files are emitted and baseUrl-prefixed automatically. No Google Fonts `headTags`.

**Theme & chrome defaults**
- **D-12:** Color mode follows the system (`respectPrefersColorScheme: true`), and the toggle is always available. The webforJ animated theme switcher is used, with its script path baseUrl-prefixed.
- **D-13:** Announcement bar is **off**. Keep the copied `_announcement.scss` and a commented-out `announcementBar` config block so it can be switched on with one edit later (e.g. "DWC-Course has moved here").
- **D-14:** Until the Phase 3 brand assets arrive, the navbar shows the **text-only title "BASIS Courses"**, with no logo image, and the favicon is a neutral placeholder. Do not reuse the DWC-Course logo.
- **D-15:** Set `editUrl: 'https://github.com/BasisHub/Courses/tree/main/docs/'` now. It 404s until the repo exists, which is accepted.

### Claude's Discretion
- Tabler icon choice per book (e.g. `code`/`book` for BBj Basics, `browser`/`world-www` for DWC). Stephan reviews the picks; they are changed in `books.js`.
- Exact wording of the intro block and blurbs (D-05).
- Mechanics of proving the four throwing gates (a script that injects a broken link/anchor/MD link/image and expects a build failure, or a documented manual check).
- Print stylesheet details beyond "hide navbar, sidebar, TOC".
- Which stub chapter titles to use.

### Deferred Ideas (OUT OF SCOPE)
- "Books" navbar dropdown once there are 3+ books (seed §3.2): later, not this milestone.
- An announcement bar message such as "DWC-Course has moved here": could be switched on around go-live (Phase 7/8).
- A refresh script for `dwc-ui.css`: rejected for now ("keep it simple"). Revisit if DWC tokens drift visibly.

Not in this phase (from the phase boundary): CI/deploy and Vale (Phase 2); search, the GitHub navbar link, the BASIS logo, favicon, social cover and footer brand assets, the exercise admonition, YouTube, the BBj Prism extension, ExpandableCode (Phase 3); real book content (Phases 4/5).
</user_constraints>

## Project Constraints (from CLAUDE.md)

- Stack: Docusaurus 3.9 classic preset (research pins 3.10.2 exact), SCSS via `docusaurus-plugin-sass`, Mermaid, `docusaurus-plugin-llms`, `plugin-client-redirects`; Python for the converter.
- Hosting: `url: https://basishub.github.io`, `baseUrl: /Courses/`, `routeBasePath: 'docs'`, `trailingSlash: false`.
- Quality gates: build must throw on broken links, anchors, Markdown links and images. (Vale is Phase 2.)
- Naming: kebab-case ASCII, two-digit position prefixes, content headings start at H2, every code fence has a language.
- Licensing: copied webforJ files keep their MIT notice.
- Assets: Stephan supplies BASIS logo and social cover in Phase 3; do not invent them.
- GSD workflow: file changes go through a GSD command (execution is via `/gsd:execute-phase`).
- What not to use (STACK.md): MUI, emotion, openai, tsx, gray-matter, rimraf and the other webforJ pipeline deps; `prebuild`/`prestart` scripts; ideal-image; TS config; Algolia; faster; gtag/GTM.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SITE-01 | Book-card landing page driven by `src/data/books.js` | Landing page + `books.js` + card markup reusing `row topics-section` classes (Code Examples 1, 6); verified rendering |
| SITE-02 | webforJ/DWC look light and dark, animated switcher, external-link decoration under `/Courses/` | Copy/Strip table; `scripts` baseUrl constant; screenshots verified in light and dark; selector of switcher matches 3.10.2 toggle class |
| SITE-03 | `/Courses/docs/<book>/...`, own autogenerated sidebar, navbar item per book with icon | One docs instance, `sidebars.js` generated from `books.js`, stripped-id category links, icon CSS variable mechanism (Code Examples 1-4) |
| SITE-04 | Fonts and `dwc-ui.css` from the site itself | Fontsource via `customCss` (bundled, `/Courses/assets/fonts/*.woff2`) and static `dwc-ui.css` via `stylesheets`; static scan proof (Validation) |
| SITE-06 | Build fails on broken link, anchor, MD link, MD image | All four hooks at `throw`; `tools/prove-gates.sh` verified with four distinct errors (Code Example 5) |
| SITE-07 | `sitemap.xml`, `llms.txt`/`llms-full.txt` for both books under `/Courses/` | Built and inspected; title/description quirks documented |
| SITE-08 | Print stylesheet | `_print.scss` verified by headless-Chrome print-to-PDF + `pdftotext` |
| REPO-04 | `import/` gitignored | Already in `.gitignore` and effective (git status shows `import/` not untracked); add build outputs |
| REPO-05 | Exact pins, lockfile committed, `tools/requirements.txt` | Verified versions; lockfile v3 generated; Python pins verified on PyPI |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Book registry (`books.js`) | Build-time config (Node) | Browser (landing page reads it at bundle time) | Single source consumed by config, sidebars and the page |
| Landing page cards, navbar items | Browser / static HTML (SSG) | Build-time config | Pure static render; no server |
| Per-book sidebars | Build-time (docs plugin autogenerated) | — | Derived from folder structure |
| Fonts, `dwc-ui.css`, SCSS | CDN/Static (GitHub Pages) | Build (webpack emits hashed woff2) | Self-hosted for GDPR; no third-party origin |
| Theme switcher, link decorator | Browser (static JS under `/Courses/js/`) | — | Plain scripts, need baseUrl-prefixed `src` |
| Broken link/anchor/image gates | Build (Docusaurus) | Scripted proof in `tools/` | Failure must happen at `docusaurus build` |
| `sitemap.xml`, `llms*.txt` | Build (plugins postBuild) | — | Generated into `build/` |
| Print stylesheet | Browser (CSS `@media print`) | — | Pure CSS |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@docusaurus/core`, `preset-classic`, `theme-mermaid`, `plugin-client-redirects` (deps); `module-type-aliases`, `types` (dev) | `3.10.2` exact | Site, theme, redirects (empty) | [VERIFIED: npm registry, `latest` on 2026-10-03; scratch build green] |
| `react`, `react-dom` | `^19.2.0` (resolved 19.3.0) | Runtime | [VERIFIED: scratch install] |
| `@mdx-js/react` | `^3.1.1` | MDX provider | [VERIFIED: npm] |
| `prism-react-renderer` | `^2.4.1` | Code theme runtime | [VERIFIED: npm] |
| `clsx` | `^2.1.1` | Class joining (only needed once components land; harmless now) | [VERIFIED: npm] |
| `docusaurus-plugin-sass` + `sass` | `^0.2.7` + `^1.105.1` | SCSS | [VERIFIED: npm; build emits zero Sass deprecation warnings once `@import` is replaced by `@use`] |
| `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` | `^5.3.0` (both, OFL-1.1) | Self-hosted variable fonts | Locked by D-11. [VERIFIED: npm view, installed file contents; no install scripts] |
| `@tabler/icons` (devDependency) | `^3.44.0` (resolves 3.48.0) | SVG source for CSS-mask icons | [VERIFIED: file `icons/outline/*.svg` exist; `exports` map blocks `require.resolve`, use a filesystem path] |
| `docusaurus-plugin-llms` (devDependency) | `^0.6.1` | `llms.txt`, `llms-full.txt` | [VERIFIED: option names below confirmed against the plugin's docs site and a real run] |

### Supporting
None for this phase. `docusaurus-plugin-zooming`, `@easyops-cn/docusaurus-search-local` are Phase 3/4. Do not add them now.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Alias stub for `@mermaid-js/layout-elk` | Install `@mermaid-js/layout-elk@0.1.9` | Heavy dep, peer-range conflict with mermaid 12; stub is 3 lines and keeps ELK off |
| `dwc-ui.css` in `static/` + `stylesheets` | `src/css/dwc-ui.css` in `customCss` array | Bundled/minified path is hashed and baseUrl-free but runs 91 KB of `oklch()`/`color-mix()` through cssnano; static avoids that and matches D-10 |
| Fixed Docusaurus 3.9.2 | 3.10.2 | 3.9.2 is the documented fallback; 3.10.2 works with the alias stub, so stay on 3.10.2 |

**Installation (in `docs/`):**
```bash
npm install --save-exact @docusaurus/core@3.10.2 @docusaurus/preset-classic@3.10.2 @docusaurus/theme-mermaid@3.10.2 @docusaurus/plugin-client-redirects@3.10.2
npm install --save-exact --save-dev @docusaurus/module-type-aliases@3.10.2 @docusaurus/types@3.10.2
npm install react@^19.2.0 react-dom@^19.2.0 @mdx-js/react@^3.1.1 prism-react-renderer@^2.4.1 clsx@^2.1.1 docusaurus-plugin-sass@^0.2.7 sass@^1.105.1 @fontsource-variable/inter@^5.3.0 @fontsource-variable/jetbrains-mono@^5.3.0
npm install --save-dev @tabler/icons@^3.44.0 docusaurus-plugin-llms@^0.6.1
```
Commit `docs/package-lock.json` (lockfileVersion 3, about 1,400 packages). Optional: `docs/.nvmrc` = `24`, `engines.node >=20`. Local machine runs Node 22.22.0 / npm 10.9.4, which works.

**Python (REPO-05), `tools/requirements.txt`:**
```
beautifulsoup4==4.15.0
lxml==6.1.3
markdownify==1.2.3
```
[VERIFIED: PyPI JSON API 2026-10-03.] markdownify 1.2.3 also requires `six>=1.15,<2` (transitive). Pin `six` too if a fully reproducible freeze is wanted (check `pip index versions six` at execution time).

## Package Legitimacy Audit

slopcheck was installable via pip but the `slopcheck` command was not available on PATH in this session, so the automated verdict could not be produced. Per protocol the table records what was verified by hand; the planner may gate the installs behind one `checkpoint:human-verify` if strict. None of these has an `install`, `preinstall` or `postinstall` script (checked with `npm view <pkg> scripts.*`).

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `@docusaurus/*` 3.10.2 | npm | years | github.com/facebook/docusaurus | unavailable | Approved (official, named in CLAUDE.md and webforJ's package.json) |
| `docusaurus-plugin-sass` | npm | 6 yrs (2020-03) | github.com/rlamana/docusaurus-plugin-sass | unavailable | Approved (used by webforJ) |
| `docusaurus-plugin-llms` | npm | 1.4 yrs (2025-05) | github.com/rachfop/docusaurus-plugin-llms | unavailable | Approved (used by webforJ at 0.4) [ASSUMED: single maintainer, so pin via lockfile] |
| `@tabler/icons` | npm | 5.9 yrs | github.com/tabler/tabler-icons | unavailable | Approved (used by webforJ) |
| `@fontsource-variable/inter`, `/jetbrains-mono` | npm | 3.4 yrs (2023-05) | github.com/fontsource/font-files | unavailable | Approved (locked by user decision D-11; repository field verified) |
| `beautifulsoup4`, `lxml`, `markdownify` | PyPI | years | well-known | unavailable | Approved (versions verified on PyPI) |

**Packages removed due to [SLOP]:** none. **Flagged [SUS]:** none.
`npm audit` on the scratch install reports 44 findings (40 high), all in Docusaurus's transitive tree (webpack-dev tooling, `yaml` etc.), none actionable by this repo [VERIFIED: npm audit output]. Treat as known background noise; do not run `npm audit fix --force`.

## Architecture Patterns

### System Architecture Diagram

```
 src/data/books.js  (ordered registry: id, title, navLabel, icon, description, to)
        │
        ├──► sidebars.js ───────► one autogenerated sidebar per book (dirName = book id)
        ├──► docusaurus.config.js
        │        ├─ navbar: one docSidebar item per book (className book-icon--<id>)
        │        ├─ headTags: <style> with --book-icon:url(data:svg) per book   ◄── @tabler/icons/*.svg (read at config time)
        │        ├─ stylesheets: /Courses/css/dwc-ui.css     ◄── static/css/dwc-ui.css (snapshot)
        │        ├─ scripts: /Courses/js/{dwc-theme-switcher,link-decorator}.js ◄── static/js
        │        ├─ theme.customCss: fontsource css → custom.scss (+ partials, print)
        │        └─ plugins: sass | mermaid-elk alias | llms | client-redirects([])
        └──► src/pages/index.js  → cards (row topics-section) → /docs/<book>/overview

 docs/docs/<book>/00-overview.mdx + 01-<chapter>/{_category_.json,index.md,01-page.md}
        │  docs plugin (routeBasePath docs; ids strip numeric prefixes)
        ▼
 docusaurus build ─► link/anchor/md-link/md-image checks (throw) ─► build/
        ├─ html + /assets/css (fonts inlined as /Courses/assets/fonts/*.woff2)
        ├─ sitemap.xml  (plugin-sitemap, from preset)
        └─ llms.txt / llms-full.txt (postBuild)
 npm run serve ─► http://localhost:3000/Courses/
```

### Recommended Project Structure
```
docs/
├── package.json, package-lock.json, .nvmrc
├── docusaurus.config.js, sidebars.js
├── docs/
│   ├── intro-bbj/00-overview.mdx, 01-<chapter>/{_category_.json,index.md,01-*.md}
│   └── dwc/       00-overview.mdx, 01-<chapter>/{...}
├── src/
│   ├── data/{books.js, book-icons-css.js}
│   ├── pages/index.js
│   ├── plugins/mermaid-elk-stub.js         # the 3-line alias plugin (extract from config)
│   ├── css/{custom.scss, _alerts, _tables, _announcement, _prism, _navbar, _sidebar, _sidebar-icons(trimmed), _footer, _category, _content, _toc, _pagination, _tutorial-content, _utils, _reset, _root, _book-icons, _print, mixins/_content-block}.scss
│   └── theme/prism-dwc-theme.js
├── static/{css/dwc-ui.css, js/{dwc-theme-switcher,link-decorator}.js, img/favicon.svg(placeholder)}
tools/{prove-gates.sh, requirements.txt}
```

### Copy / adapt / strip table (webforJ `docs/` → this repo)

| Item | Action | Detail (verified by reading the files) |
|---|---|---|
| `src/css/_alerts, _tables, _announcement, _prism, _navbar, _footer, _category, _toc, _pagination, _tutorial-content, _utils, _reset, _root, _sidebar` and `mixins/_content-block` | Copy | No `url(/...)` absolute paths anywhere; only `data:` URIs. `_reset.scss` holds the `.empty-link::after` arrow rule (link decorator) |
| `_content.scss` | Copy + edit | Replace `@import "./mixins/content-block.scss"` with `@use "./mixins/content-block";` and `@include content-block.content-block;` (removes the only Sass deprecation warning, Dart Sass 3 would break it) |
| `_sidebar-icons.scss` | Copy + trim | Keep the `_icon` mixin and the `category-icons` base block; delete all 20 webforJ-named `.cat-icon--*` rules (dead CSS, each inlines an SVG). Path `../../node_modules/@tabler/icons/icons/outline/<name>.svg` is correct as long as `docs/` is the package root; css-loader inlines it as `data:` so baseUrl is irrelevant. Chapters get no icon (seed); books get icons on navbar and cards |
| `custom.scss` | Copy + edit | Remove `@use "./accordion"`, `"./blog"`, `"components/dwc-doc-components"` and the whole `.MuiChip-root` block; add `@use "./book-icons"; @use "./print";`; change fonts to `'Inter Variable', 'Inter', system-ui...` and `'JetBrains Mono Variable', 'JetBrains Mono', ...` (Fontsource family names carry the `Variable` suffix) |
| `_accordion.scss` (MUI), `_blog.scss`, `components/_dwc-doc-components.scss` | Do not copy | MUI / blog / webforJ components |
| `custom.scss` `--header-github-link` var + `_navbar.scss` github/version-badge/`startforj`/locale/DocSearch rules | Keep or trim, harmless | Unused in Phase 1; GitHub link arrives Phase 3 |
| `src/theme/prism-dwc-theme.js` | Copy verbatim | Pure object of CSS vars |
| `src/theme/Heading/`, `MDXContent/`, `MDXComponents.js`, `CodeBlock/Line`, `BlogLayout`, `BlogTagsListPage`, `NavbarItem/LocaleDropdown` | Do not copy | Heading imports MUI icons, `AskMenu`, `useDocusaurusContext().i18n`; MDXContent renders `GiscusComments` and dereferences `props.children.type.metadata.frontMatter` (breaks without it); MDXComponents imports MUI, Giscus, ComponentDemo and 15 others; `CodeBlock/Line` is a pass-through. Docusaurus defaults suffice. Phase 3 writes its own small `MDXComponents.js` |
| `static/js/dwc-theme-switcher.js`, `link-decorator.js` | Copy verbatim | The switcher's selector `[class*="toggleButton"][class*="ColorModeToggle"]` matches the 3.10.2 toggle (`toggleButton_… darkNavbarColorModeToggle_…`) [VERIFIED: built HTML] |
| `static/js/dwc-doc-components.js` | Do not copy | webforJ components |
| `src/pages/index.js` | Rewrite | Upstream is a `<Redirect>` to getting-started |
| `docusaurus.config.js` | Rewrite | Upstream has async version fetch, 7 locales, Algolia keys, gtag/GTM IDs, cookbook plugin, `/js/...` unprefixed scripts, Google Fonts `headTags`, `favicon` from the web |
| `package.json` | Rewrite | See Installation; no prebuild/prestart hooks, no MUI/emotion/openai/tsx/etc. |

Add a one-line provenance header to each copied file, e.g. `/* Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ). */` (REPO-03 in Phase 2 adds `THIRD_PARTY_NOTICES.md`; the per-file notice satisfies the CLAUDE.md licensing rule now). Upstream files have no header themselves; the notice text is in the upstream `LICENSE`.

### Pattern 1: baseUrl constant for everything Docusaurus does not prefix
`scripts` and `stylesheets` entries are written verbatim; they do not get `baseUrl` prepended [VERIFIED: with `baseUrl+'css/dwc-ui.css'` the built HTML contains `href="/Courses/css/dwc-ui.css"`; without it a `/css/...` path would hit the domain root]. Define `const baseUrl = '/Courses/'` once and use it for `baseUrl`, `scripts`, `stylesheets`. CSS `url()` to node_modules assets, fonts and images goes through css-loader and is prefixed automatically (fonts emitted as `/Courses/assets/fonts/inter-latin-wght-normal-<hash>.woff2`).

### Pattern 2: Fonts through `customCss`
`theme.customCss` accepts an array; entries are imported in order. Put the Fontsource CSS before `custom.scss`. Use `@fontsource-variable/inter/wght.css` and `wght-italic.css` (upright and italic; the package default `index.css` is upright only), and `@fontsource-variable/jetbrains-mono/index.css`. Use `require.resolve(...)`: Fontsource's `exports` map exposes `./*.css` so this resolves. Unicode-range subsets mean the browser requests only `latin` (about 48 KB) unless other glyphs appear; the other ~14 subset files are in `build/` but not fetched [VERIFIED: Chrome net log fetched `inter-latin-wght-normal` only].

### Pattern 3: One source of truth for books, including icons
`books.js` (CommonJS so `sidebars.js` and the config can `require` it; the page can `import` it) holds `{id, title, navLabel, icon, description, to}`. `src/data/book-icons-css.js` reads each `@tabler/icons/icons/outline/<icon>.svg` at config time and emits `.book-icon--<id>{--book-icon:url("data:image/svg+xml;base64,…")}`, injected with a `headTags` `<style>`. `_book-icons.scss` renders the mask for the navbar item (`.navbar__item.navbar-book::before`) and the card (`.book-card__icon`). Changing an icon means editing only `books.js`. Do not `require('@tabler/icons/...')` (blocked by `exports`); use `path.join(__dirname, '../../node_modules/@tabler/icons/icons/outline', name + '.svg')`.

### Pattern 4: Landing cards reusing the webforJ card look
`_category.scss` styles `[class^="row topics-section"] a` (no shadow, bordered hover). Upstream gets that class from `<DocCardList className="topics-section">`. On a custom page, emit the same structure by hand: `<section className="row topics-section"><article className="col col--6 …"><Link className="card padding--lg book-card">`. Result: 2 columns on desktop, 1 on mobile, more columns by adding books (`col--6` wraps). Do not use `[class^="row list"]` (forces a single flex column, the docs-index look). A `DocCardList` cannot carry the Tabler icon (DocCard hard-codes an emoji), so keep the custom markup.

### Pattern 5: Stub-book content rules (spikes D-08 answered)
- **Doc ids drop numeric prefixes** (`01-getting-started/index.md` becomes `intro-bbj/getting-started/index`). A `_category_.json` link `{"type":"doc","id":"intro-bbj/getting-started/index"}` works; the unstripped id `intro-bbj/01-getting-started/index` fails the build with `Can't find any doc with ID` [VERIFIED].
- `index.md` inside a chapter folder is used as the category landing page and is not duplicated in the sidebar; the chapter URL is the folder URL (`/docs/dwc/first-chapter`, no trailing slash) [VERIFIED].
- `00-overview.mdx` gets id `<book>/overview`, URL `/docs/<book>/overview`; the navbar `docSidebar` item links to the sidebar's first doc, which is the overview [VERIFIED: href in built HTML].
- **Do not create a book-level `_category_.json`** (it is never rendered when the sidebar uses `dirName: '<book>'`; book metadata lives in `books.js`).
- Give every page a `title` and the overview pages a `description`: otherwise `llms.txt` shows `01 Page` and `Overview` twice, and descriptions are the first paragraph.
- Stub pages: headings start at H2, every fence has a language (`bbj` is registered in `additionalLanguages`).

### Anti-Patterns to Avoid
- **Copying webforJ `Heading`/`MDXContent`/`MDXComponents`:** MUI + Giscus + i18n coupling. Start from Docusaurus defaults.
- **Root-relative `/js/...`, `/css/...` in config:** 404 on Pages. Always `baseUrl + ...`.
- **`@import` in SCSS:** deprecated; use `@use` with namespaces.
- **Setting `onBrokenMarkdownLinks` at the top level:** deprecated form; keep it under `markdown.hooks` (3.10.2 config shown below validates).
- **Using `generated-index` category links:** slug collisions are a documented pitfall; use `doc` links to an `index.md`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font hosting and subsetting | Download woff2 by hand, write `@font-face` | `@fontsource-variable/*` through `customCss` | Hashed, baseUrl-correct, unicode-range subsets |
| Per-book sidebars | Hand-written item lists | `{type:'autogenerated', dirName: book.id}` generated from `books.js` | Folder structure is the truth |
| Icons | Inline SVG React components or an icon font | Tabler SVG as CSS mask via `--book-icon` | One edit in `books.js`; recolours with `currentColor` in both themes |
| Sitemap | Custom generator | `@docusaurus/plugin-sitemap` (already in preset-classic) | Emits `/Courses/...` URLs with `trailingSlash: false` |
| llms files | Custom script | `docusaurus-plugin-llms` | Reads `docs/` and builds both files |
| Broken-link gates | Link checker script | Built-in hooks at `throw` | Failure happens inside `docusaurus build` |
| Print layout | JS print helpers | `@media print` SCSS | Infima already hides navbar, sidebar and TOC in print (see below) |

## Runtime State Inventory

Not a rename/refactor/migration phase. Omitted.

## Common Pitfalls

### Pitfall 1: Mermaid theme breaks the build on 3.10.2
**What goes wrong:** `Module not found: Can't resolve '@mermaid-js/layout-elk'`, "Client bundle compiled with errors". **Why:** theme-mermaid 3.10.2 contains `await import('@mermaid-js/layout-elk')` behind a DefinePlugin flag; webpack resolves the dead branch anyway (known family of issues, facebook/docusaurus #11430, fix PR #11437 targeted 3.9; 3.10.2 still fails on a clean install). **Avoid:** the alias plugin (Code Example 1). **Detect:** any `npm run build` on a fresh clone. Verified that `docusaurus start` and a rendered `graph TD; A-->B;` diagram work with the stub.

### Pitfall 2: Unprefixed `scripts` / `stylesheets`
**What goes wrong:** theme switcher and decorator 404 on Pages while `localhost:3000/` works. **Avoid:** baseUrl constant. **Detect:** `curl -I http://localhost:3000/Courses/js/dwc-theme-switcher.js` returns 200 under `serve`.

### Pitfall 3: Category link ids with numeric prefixes
See Pattern 5. Error text: `Can't find any doc with ID … Available doc IDs: …` (the list shows the real ids; copy from there).

### Pitfall 4: Fontsource family names
`Inter Variable` / `JetBrains Mono Variable`, not `Inter`. webforJ's `custom.scss` names `'Inter'`, so copying it unmodified silently falls back to `system-ui` (fonts are downloaded but not used). **Detect:** the screenshot shows Inter glyphs (verified) or computed `font-family` in devtools.

### Pitfall 5: The link decorator marks every text-only link, internal ones too
`link-decorator.js` adds `empty-link` to every `<a>` that has text and no children, and `_reset.scss` then draws `↗` after it. In the scratch build in-site links (`anchor↗`, `other book↗`) get the arrow. That is upstream behaviour and matches SITE-02 ("external-link decoration"). Accept it or restrict it later (Open Question 2); do not "fix" it silently.

### Pitfall 6: `postcss-calc` warning on the dark navbar
Every build prints `[WARNING] … postcss-calc … Lexical error … c * 3`. It comes from `--navbar-dark-background-color: oklch(from … calc(c * 3) …)` in `custom.scss`. Output is intact (the minified CSS keeps `max(0,min(calc(c * 3),0.004))`), the build exits 0. Do not treat it as a failure, and do not add a "no warnings" assertion.

### Pitfall 7: `llms.txt` quality
Titles come from front matter/filename, descriptions from the first paragraph. `llms-full.txt` contains raw Markdown, so relative links such as `./01-page.md` and `../../intro-bbj/00-overview.mdx` appear unresolved. `addMdExtension` defaults to `true` but with `generateMarkdownFiles: false` links are emitted without `.md` and point at real pages (verified). Acceptable for Phase 1; Phase 9 re-checks.

### Pitfall 8: Probe slug
The gate probe file `99-gate-probe.md` gets the slug `gate-probe` (prefix stripped), which shows up in error messages as `/Courses/docs/dwc/gate-probe`. Clean up the probe in a `trap` so a failed run never leaves it behind.

## Code Examples

All of the following were run in the scratch project and produced the results quoted in Validation.

### 1. `docs/docusaurus.config.js`
```js
// @ts-check
const codeTheme = require('./src/theme/prism-dwc-theme');
const books = require('./src/data/books');
const bookIconsCss = require('./src/data/book-icons-css');

const baseUrl = '/Courses/';

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'BASIS Courses',
  tagline: 'Training books for BBj and DWC developers.',
  url: 'https://basishub.github.io',
  baseUrl,
  organizationName: 'BasisHub',
  projectName: 'Courses',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  i18n: {defaultLocale: 'en', locales: ['en']},
  // Docusaurus does not prefix baseUrl on scripts/stylesheets.
  scripts: [
    {src: `${baseUrl}js/dwc-theme-switcher.js`, async: false},
    {src: `${baseUrl}js/link-decorator.js`},
  ],
  stylesheets: [`${baseUrl}css/dwc-ui.css`],
  headTags: [{tagName: 'style', attributes: {id: 'book-icons'}, innerHTML: bookIconsCss()}],
  markdown: {
    mermaid: true,
    hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'},
  },
  presets: [
    ['classic', {
      docs: {
        routeBasePath: 'docs',
        sidebarPath: require.resolve('./sidebars.js'),
        editUrl: 'https://github.com/BasisHub/Courses/tree/main/docs/',
      },
      blog: false,
      theme: {customCss: [
        require.resolve('@fontsource-variable/inter/wght.css'),
        require.resolve('@fontsource-variable/inter/wght-italic.css'),
        require.resolve('@fontsource-variable/jetbrains-mono/index.css'),
        require.resolve('./src/css/custom.scss'),
      ]},
    }],
  ],
  plugins: [
    'docusaurus-plugin-sass',
    // theme-mermaid 3.10.2 cannot build without this (see Pitfall 1)
    function mermaidElkStub() {
      return {name: 'mermaid-elk-stub', configureWebpack: () => ({resolve: {alias: {'@mermaid-js/layout-elk': false}}})};
    },
    ['docusaurus-plugin-llms', {
      generateLLMsTxt: true, generateLLMsFullTxt: true, generateMarkdownFiles: false,
      docsDir: 'docs', excludeImports: true, removeDuplicateHeadings: true, includeBlog: false,
      title: 'BASIS Courses', description: 'Training books for BBj and DWC developers.',
    }],
    ['@docusaurus/plugin-client-redirects', {redirects: []}],
  ],
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    // announcementBar: {id: 'dwc-moved', content: 'DWC-Course has moved here.', isCloseable: true},  // D-13: off
    navbar: {
      title: 'BASIS Courses',          // D-14: text only, no logo
      style: 'dark',
      items: books.map((b) => ({
        type: 'docSidebar', sidebarId: `${b.id}Sidebar`, label: b.navLabel,
        position: 'left', className: `navbar-book book-icon--${b.id}`,
      })),
    },
    docs: {sidebar: {hideable: false, autoCollapseCategories: false}},
    footer: {links: [{html: '<p>Copyright © <script>document.write(/\\d{4}/.exec(Date())[0])</script> <a href="https://basis.cloud/contact/">BASIS International Ltd.</a> All rights reserved.</p>'}]},
    prism: {theme: codeTheme, darkTheme: codeTheme,
      additionalLanguages: ['bbj', 'java', 'css', 'markup', 'javascript', 'bash', 'json']},
  },
};
```
Notes: `favicon` is omitted in the prototype; D-14 wants a neutral placeholder, so add `favicon: 'img/favicon.svg'` (Docusaurus prefixes baseUrl for `favicon`) with a plain geometric SVG [ASSUMED: visual content is the planner's choice; do not use the DWC-Course logo]. The footer is the seed's single-line BASIS copyright; SITE-05 formally belongs to Phase 3, so it is fine to keep it here or reduce to a minimal footer. `additionalLanguages` is lowercase only (case-sensitive Linux CI). The `markup` and `css` entries are harmless.

### 2. `docs/src/data/books.js`, `sidebars.js`, `book-icons-css.js`
```js
// books.js : order here = landing order = navbar order (D-04)
module.exports = [
  {id: 'intro-bbj', title: 'Introduction to BBj Development', navLabel: 'BBj Basics', icon: 'code',
   description: '...', to: '/docs/intro-bbj/overview'},
  {id: 'dwc', title: 'BBj DWC Training', navLabel: 'DWC', icon: 'browser',
   description: '...', to: '/docs/dwc/overview'},
];
```
```js
// sidebars.js
const books = require('./src/data/books');
module.exports = Object.fromEntries(
  books.map((b) => [`${b.id}Sidebar`, [{type: 'autogenerated', dirName: b.id}]]),
);
```
```js
// src/data/book-icons-css.js
const fs = require('fs'); const path = require('path'); const books = require('./books');
module.exports = function bookIconsCss() {
  return books.map((b) => {
    const file = path.join(__dirname, '../../node_modules/@tabler/icons/icons/outline', `${b.icon}.svg`);
    const uri = `data:image/svg+xml;base64,${Buffer.from(fs.readFileSync(file, 'utf8').trim()).toString('base64')}`;
    return `.book-icon--${b.id}{--book-icon:url("${uri}")}`;
  }).join('\n');
};
```
Icon picks verified to exist and render: `code` (intro-bbj), `browser` (dwc). Stephan reviews.

### 3. `src/css/_book-icons.scss`
```scss
%book-icon-mask {
  content: ""; display: inline-block; flex: 0 0 auto; width: 1.1em; height: 1.1em;
  background-color: currentColor;
  -webkit-mask: var(--book-icon) center / contain no-repeat;
  mask: var(--book-icon) center / contain no-repeat;
}
.navbar__item.navbar-book::before { @extend %book-icon-mask; margin-right: 0.4em; vertical-align: -0.15em; }
.book-card__icon { @extend %book-icon-mask; width: 1.75rem; height: 1.75rem; color: var(--ifm-color-primary); }
.book-card { height: 100%; display: block; text-decoration: none; color: inherit; }
```

### 4. Landing page `src/pages/index.js`
```jsx
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import books from '../data/books';

export default function Home() {
  return (
    <Layout title="Home" description="Training books for BBj and DWC developers.">
      <main className="container margin-vert--xl">
        <Heading as="h1">BASIS Training Books</Heading>
        <p className="margin-bottom--lg">{/* D-05 intro line */}</p>
        <section className="row topics-section">
          {books.map((b) => (
            <article key={b.id} className={`col col--6 margin-bottom--lg book-icon--${b.id}`}>
              <Link to={b.to} className="card padding--lg book-card">
                <span className="book-card__icon" aria-hidden="true" />
                <Heading as="h2">{b.title}</Heading>
                <p>{b.description}</p>
              </Link>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
```
Rendered result checked in light and dark (headless Chrome screenshots): Inter text, DWC colours, dark navbar with both book items and icons, two cards with blue icons; footer single line.

### 5. `_print.scss` and the gate-proof script
```scss
@media print {
  .navbar, .theme-doc-sidebar-container, .theme-doc-toc-desktop, .theme-doc-toc-mobile, .footer,
  .pagination-nav, .theme-doc-breadcrumbs, .theme-edit-this-page, .theme-doc-footer,
  [class*="announcementBar"], button[class*="backToTop"] { display: none !important; }
  [class*="docMainContainer"], [class*="docItemCol"], main {
    max-width: 100% !important; flex: 0 0 100% !important; margin: 0 !important; padding: 0 !important;
  }
  a[href^="http"]:not(.hash-link)::after { content: " (" attr(href) ")"; font-size: 0.8em; }
}
```
Finding: Infima already hides navbar, sidebar and TOC in print; the control run without `_print.scss` still printed breadcrumbs and the footer. So the print file's real contribution is breadcrumbs/footer/edit link/pagination hiding, full-width content and external URLs. The URL-after-link rule is optional (it stacks with the `↗` decorator on external links).

`tools/prove-gates.sh` (ran green in 26 s; each probe writes a throwaway `docs/docs/dwc/99-gate-probe.md`, runs `npm run build`, requires non-zero exit AND an expected message, removes the file via `trap`, then runs a clean control build):
```bash
#!/usr/bin/env bash
set -u
cd "$(dirname "$0")/../docs"
PROBE="docs/dwc/99-gate-probe.md"
trap 'rm -f "$PROBE"' EXIT
fail=0
probe() { # name, body, expected-substring
  printf -- '---\ntitle: Gate probe\n---\n\n## Probe\n\n%s\n' "$2" > "$PROBE"
  out=$(npm run build 2>&1); code=$?
  rm -f "$PROBE"
  if [ $code -ne 0 ] && grep -qi -- "$3" <<<"$out"; then echo "PASS  $1 (exit $code)"
  else echo "FAIL  $1 (exit $code, expected failure mentioning '$3')"; fail=1; fi
}
probe "broken link"           '[x](/docs/does-not-exist)'                          'found broken links'
probe "broken anchor"         '[x](./01-first-chapter/01-page.md#no-such-anchor)'  'found broken anchors'
probe "broken markdown link"  '[x](./no-such-file.md)'                             "onBrokenMarkdownLinks"
probe "broken markdown image" '![x](./img/no-such-image.png)'                      "onBrokenMarkdownImages"
rm -f "$PROBE"; npm run build >/dev/null 2>&1 && echo "PASS  control build is clean" || { echo "FAIL  control build"; fail=1; }
exit $fail
```
The prototype used looser substrings and passed; the exact messages observed were: `Docusaurus found broken links!`, `Docusaurus found broken anchors!`, `Markdown link with URL ... couldn't be resolved ... onBrokenMarkdownLinks`, `Markdown image with URL ... couldn't be resolved to an existing local image file ... onBrokenMarkdownImages`. The anchor probe path must match a real stub page filename (`01-first-chapter/01-page.md` in the `dwc` stub); adjust to the planner's stub names. A bare `[x](#no-such-anchor)` also throws.

### 6. Stub book files
```
docs/docs/dwc/00-overview.mdx          ---\ntitle: BBj DWC Training\nsidebar_label: Overview\ndescription: ...\n---
docs/docs/dwc/01-<chapter>/_category_.json   {"label":"...","position":1,"link":{"type":"doc","id":"dwc/<chapter>/index"}}
docs/docs/dwc/01-<chapter>/index.md    title + one H2
docs/docs/dwc/01-<chapter>/01-<page>.md   H2, a bbj fence, an internal md link and anchor link (so gates have something to protect)
```
(Same for `intro-bbj`.) Include at least one cross-book Markdown link (`../../intro-bbj/00-overview.mdx`, file path form, resolves) to prove cross-book links work.

## State of the Art

| Old Approach (seed) | Current Approach | Impact |
|---|---|---|
| `headTags` link to CDN `dwc-ui.css`, Google Fonts | Static snapshot via `stylesheets` + Fontsource via `customCss` | No third-party requests (GDPR), SITE-04 |
| Docusaurus `^3.9.1` | `3.10.2` exact, plus the mermaid alias stub | Build is reproducible |
| `onBrokenMarkdownLinks` at top level | Under `markdown.hooks` | Not deprecated |
| `@import` in SCSS | `@use` | No Sass deprecation warnings with sass 1.105 |

**Deprecated/outdated:** `@docusaurus/plugin-ideal-image`, TS config, Algolia block (all out of scope).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `docusaurus-plugin-llms` is single-maintainer; lockfile pin mitigates | Package Audit | Low (supply chain) |
| A2 | Neutral favicon content (plain geometric SVG) is acceptable placeholder | Code Example 1 notes | Low; Stephan swaps in Phase 3 |
| A3 | Redistributing the `dwc-ui.css` snapshot in this repo is acceptable (public CDN file of the same product family as the MIT webforJ docs repo; no explicit licence header found in the file) | Standard Stack / D-10 | Low-medium; ask Stephan to confirm the licence stance, record it in Phase 2 `THIRD_PARTY_NOTICES.md` |
| A4 | CI Node 24 will behave like local Node 22 for this scaffold | Standard Stack | Low; verified only on Node 22.22.0, CI is Phase 2 |

## Open Questions (RESOLVED)

1. **Does the `@mermaid-js/layout-elk` workaround survive a future 3.10.x patch?**
   - Known: alias to `false` works on 3.10.2; a fixed release would make the stub a harmless no-op.
   - Recommendation: keep the stub in `src/plugins/` with a comment and revisit on any Docusaurus bump. If a bump lands without the bug, delete the plugin.
   - RESOLVED: 01-03 Task 1 creates `docs/src/plugins/mermaid-elk-stub.js` (aliases `@mermaid-js/layout-elk` to `false`) and registers it in `plugins`, with a comment to revisit on any Docusaurus bump.
2. **Should the link decorator skip internal links?**
   - Known: upstream decorates all text-only links, so internal links show `↗`; D-12 wants the decorator "working".
   - Recommendation: ship upstream behaviour in Phase 1, flag in the human review; if Stephan dislikes arrows on internal links, a one-line change (`a[href^="http"]` filter in `link-decorator.js`) is the fix, noted as a deliberate deviation from "copy verbatim".
   - RESOLVED: upstream `link-decorator.js` ships as-is (copied verbatim in 01-02); the arrows on internal links are flagged in the 01-04 end-of-phase human check, where Stephan decides whether to apply the one-line filter later.
3. **Intro text and card blurbs (D-05).**
   - Source material is reachable: the Moodle course-2 backup unpacks in scratch space and `course/course.xml` holds the summary: "This course is for all who know how to write software in some programming language like Java, C#, or others, and who want to quickly navigate BBj to write for the GUI or for the browser. It explains the very first steps for setting up the development environment and then builds all the basic knowledge that a developer should know to successfully develop in BBj." (fullname "Introduction to BBj Development", shortname "BBj Development Basics"). DWC source: `DWC-Course/docs/index.md` + Hero: "A comprehensive 12-chapter course to master the Dynamic Web Client, from first concepts to production deployment." (tagline "Dynamic Web Client Training Course").
   - Draft (Vale-clean, direct, second person; Stephan reviews): intro-bbj: "You already write software in another language. Learn to set up BBj and build GUI and browser applications with it." dwc: "Build modern browser applications with the Dynamic Web Client, from first concepts to deployment." Intro line: "Pick a book and start reading."
   - Do NOT unpack the `.mbz` into `import/` and commit anything from it; the summary text above is enough, no archive access is needed at execution time.
   - RESOLVED: 01-03 uses the drafted intro line and card blurbs above verbatim in `books.js`/landing page; Stephan reviews the copy in the 01-04 human check.
4. **`ubuntu-slim` etc.** are Phase 2; not relevant here.
4. **`ubuntu-slim` etc.** are Phase 2; not relevant here.
   - RESOLVED: out of Phase 1 scope; handled by the Phase 2 CI plans.
5. **`dwc-ui.css` licence stance (local snapshot served from `static/css/`).**
   - RESOLVED: deferred to Phase 2, which records the snapshot and its source/licence in `THIRD_PARTY_NOTICES.md`; Phase 1 only snapshots the file locally (01-02/01-03) so no CDN request is made (SITE-04).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build | yes | 22.22.0 (docusaurus needs >=20) | none needed; CI Node 24 in Phase 2 |
| npm | install | yes | 10.9.4 | — |
| Python | `tools/requirements.txt` pins only | yes | 3.11.4 | — |
| Google Chrome (headless) | Print and network/visual checks | yes (macOS app) | 154 | Manual browser check |
| `pdftotext` (poppler) | Print assertion | yes (`/opt/homebrew/bin`) | — | Manual print preview |
| git | repo checks | yes | — | — |
| slopcheck | package audit | no (pip installed, binary not on PATH) | — | Manual registry checks (done) |
| Network to npm and `cdn.webforj.com` | install; one-time snapshot of `dwc-ui.css` | yes | — | — |

No blocking gaps. Chrome/pdftotext checks are local-only (macOS dev machine); they are not CI gates.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (static site). Shell assertions against the production build plus `tools/prove-gates.sh`. No unit test framework is warranted |
| Config file | none |
| Quick run command | `cd docs && npm run build` (about 25 s; exit code is the first gate) |
| Full suite command | `bash tools/verify-phase1.sh` (new, wraps everything below; includes `tools/prove-gates.sh`, about 2 min) |

### Phase Requirements to Test Map

| Req / SC | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| SC1, SITE-01/03 | Build passes; landing lists both books in order; each overview and sidebar exists | smoke | `cd docs && npm run build && grep -o 'href="/Courses/docs/[a-z-]*/overview"' build/index.html \| awk '!s[$0]++' \| head -2` must print intro-bbj then dwc; `test -f build/docs/intro-bbj/overview.html -a -f build/docs/dwc/overview.html`; `grep -l 'theme-doc-sidebar-container' build/docs/dwc/overview.html`; `grep -c 'navbar-book' build/index.html` >= 2 | Wave 0 |
| SC1 | Served under `/Courses/` | smoke | `npm run serve -- --port 3111 --no-open &` then `curl -fsS -o /dev/null -w '%{http_code}' http://localhost:3111/Courses/` and the two overview URLs return 200 | Wave 0 |
| SC2, SITE-02 | Scripts resolve under baseUrl; switcher and decorator present | smoke | `curl -fsI http://localhost:3111/Courses/js/dwc-theme-switcher.js` and `.../link-decorator.js` return 200; `grep -c '/Courses/js/dwc-theme-switcher.js' build/index.html` = 1 | Wave 0 |
| SC2 | Looks like DWC in light and dark | manual-only (human UAT) | Headless screenshots for review: `"$CHROME" --headless=new --window-size=1280,700 --virtual-time-budget=4000 --screenshot=out.png http://localhost:3111/Courses/` (add `--force-dark-mode --enable-features=WebContentsForceDark` for dark). Visual judgement cannot be asserted by grep; also click the toggle once in a real browser to see the circle-reveal | — |
| SC3, SITE-04 | No third-party font/CSS hosts, assets under `/Courses/` | static scan | `! grep -rEl 'fonts\.googleapis\|fonts\.gstatic\|cdn\.webforj' docs/build`; `grep -o '<link[^>]*>' docs/build/index.html \| grep -v 'href="/Courses/\|rel="canonical"\|rel="alternate"'` must be empty; `ls docs/build/assets/fonts/inter-latin-wght-normal-*.woff2 docs/build/assets/fonts/jetbrains-mono-latin-wght-normal-*.woff2`; `grep -o 'url(/Courses/assets/fonts/[^)]*)' docs/build/assets/css/styles.*.css \| head -1` | Wave 0 |
| SC3 | Browser network panel shows only `localhost`/site requests | manual (once) | DevTools Network on `/Courses/docs/dwc/overview`: every request same origin. (Chrome's own background traffic to google.com in a net log is browser noise, not the page.) | — |
| SC4, SITE-06 | Four gates fail the build | integration | `bash tools/prove-gates.sh` (exit 0 only if all four fail correctly and the control build passes) | Wave 0 |
| SC5, SITE-07 | Sitemap and llms cover both books | smoke | `grep -c 'https://basishub.github.io/Courses/docs/intro-bbj/' docs/build/sitemap.xml docs/build/llms.txt` and same for `dwc` (all >= 1); `grep -q '<loc>https://basishub.github.io/Courses/</loc>' docs/build/sitemap.xml`; `test -s docs/build/llms-full.txt` | Wave 0 |
| SC5, SITE-08 | Print hides navbar, sidebar, TOC (and breadcrumbs/footer) | smoke (local) | `"$CHROME" --headless=new --no-pdf-header-footer --print-to-pdf=/tmp/p.pdf http://localhost:3111/Courses/docs/dwc/first-chapter/page && ! pdftotext /tmp/p.pdf - \| grep -E 'BBj Basics\|On this page\|Copyright'` (page path adapts to the stub names) | Wave 0 |
| SC6, REPO-04 | `import/` ignored, never staged | unit | `git check-ignore -q import/anything.mbz && ! git ls-files import \| grep .` | exists (`.gitignore`) |
| SC6, REPO-05 | Exact pins, lockfile, Python pins | unit | `node -e "const p=require('./docs/package.json');const d={...p.dependencies,...p.devDependencies};const bad=Object.entries(d).filter(([k,v])=>k.startsWith('@docusaurus/')&&v!=='3.10.2');if(bad.length){console.error(bad);process.exit(1)}"`; `git ls-files --error-unmatch docs/package-lock.json tools/requirements.txt`; `grep -E '^(beautifulsoup4\|lxml\|markdownify)==' tools/requirements.txt \| wc -l` = 3 | Wave 0 |
| Reproducibility | Lockfile installs cleanly | smoke | `cd docs && rm -rf node_modules && npm ci && npm run build` | — |

### Sampling Rate
- **Per task commit:** `cd docs && npm run build` (25 s).
- **Per wave merge:** build plus the SC1/SC3/SC5 grep assertions above (a `tools/verify-phase1.sh` script).
- **Phase gate:** full `tools/verify-phase1.sh` including `tools/prove-gates.sh` and `npm ci` rebuild; then human UAT for the two visual items (light/dark look, toggle animation) per `human_verify_mode: end-of-phase`.

### Wave 0 Gaps
- [ ] `tools/prove-gates.sh` (Code Example 5).
- [ ] `tools/verify-phase1.sh` combining the assertions above (server start/stop with a trap, bash not zsh: the zsh shell here fails on `--include=*.html` globs; use `#!/usr/bin/env bash`).
- [ ] The whole scaffold (nothing exists yet): `docs/` tree, lockfile, `tools/requirements.txt`.

## Security Domain

Static, public, read-only site; no authentication, sessions, user input or server code. `security_enforcement` is on, ASVS level 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | minimal | No user input; MDX content is authored in-repo. Build-time hooks reject broken refs |
| V6 Cryptography | no | None hand-rolled; no secrets in repo |
| V10/V14 Supply chain / config | yes | Exact Docusaurus pins, committed lockfile, `npm ci`; no packages with install scripts; no third-party runtime origins (fonts and `dwc-ui.css` self-hosted, also the GDPR position) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Compromised or typosquatted npm package | Tampering | Lockfile + exact pins; packages named in CLAUDE.md/webforJ/CONTEXT only; audited table above |
| Third-party CDN content injection (`cdn.webforj.com/next/` is a moving target) | Tampering | Vendored snapshot (D-10) removes the runtime dependency |
| Third-party tracking via Google Fonts | Information disclosure | Self-hosted Fontsource (D-11); verified no external hosts in `build/` |
| `docusaurus-plugin-llms`/footer inline `document.write` script | Tampering | Footer script is the seed's static year snippet; accepted, no user data |
| Secrets in repo (`import/` Moodle archives may contain personal data) | Information disclosure | `import/` gitignored (REPO-04); verify with `git check-ignore` and `git ls-files import` |

## Sources

### Primary (HIGH confidence)
- Scratch project built from this research: `npm install` + `docusaurus build/serve/start`, headless Chrome screenshots, print-to-PDF, four gate failures, mermaid render (all 2026-10-03, Node 22.22.0).
- Cloned `webforj/webforj-documentation` HEAD: `docs/docusaurus.config.js`, `package.json`, `sidebars.js`, `src/css/*`, `src/theme/*`, `static/js/*`, `src/components/DocsTools/*`, `LICENSE` (MIT, (c) 2022 webforJ).
- Cloned `BasisHub/DWC-Course`: `docs/index.md`, `package.json`, `docusaurus.config.ts`, `src/components/Hero`, `package-lock.json`.
- npm registry (`npm view`) versions listed above; PyPI JSON API for markdownify/bs4/lxml (and markdownify `requires_dist`).
- Installed package sources: `@docusaurus/theme-mermaid@3.10.2/lib/{index,client/loadMermaid}.js`, `@docusaurus/theme-classic@3.10.2` `DocCardList`/`DocCard`, `@fontsource-variable/inter` file listing and `exports`.
- Moodle course-2 backup `course/course.xml` (unpacked to scratch space only, not into the repo).

### Secondary (MEDIUM confidence)
- docusaurus-plugin-llms configuration reference: https://rachfop.github.io/docusaurus-plugin-llms/docs/configuration (option names; no 0.4-to-0.6 changelog available, but every option used was exercised in a real 0.6.1 run).
- facebook/docusaurus issue #11430 and PR #11437 (optional layout-elk dependency bug): https://github.com/facebook/docusaurus/issues/11430 (fix version not stated; 3.10.2 still reproduces on a clean install).

### Tertiary (LOW confidence)
- None relied on.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, installed and built.
- Architecture: HIGH, prototype rendered and screenshotted in both themes.
- Pitfalls: HIGH, each reproduced (mermaid, prefix ids, font names, postcss warning, decorator).
- Visual fidelity to docs.webforj.com beyond the sampled pages: MEDIUM, not compared pixel-by-pixel; human UAT covers it.

**Research date:** 2026-10-03
**Valid until:** 2026-11-02 (Docusaurus 3.10.x/4.0 canary moves; re-run the scratch build before executing if later)
