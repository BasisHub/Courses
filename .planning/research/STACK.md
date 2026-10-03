# Technology Stack

**Project:** BASIS Courses (Docusaurus training-book site)
**Researched:** 2026-10-03
**Mode:** Verify and pin the seed stack. Versions checked against the npm registry, GitHub releases API, and a fresh clone of both reference repos on 2026-10-03.

## Headline findings (read these first)

1. **The seed stack is current and compatible. No redesign needed.** Docusaurus 3.10.2 is `latest` (3.9.x is no longer newest). Pin 3.10.x, not 3.9.x. Both 3.9.2 (DWC-Course) and 3.10 work with React 19. (HIGH, npm)
2. **Prism already ships a BBj grammar.** `prismjs@1.30.0` contains `components/prism-bbj.js`. That is why `additionalLanguages: ['bbj']` builds in DWC-Course with no grammar file under `src/`: Docusaurus's `prism-include-languages` does `require('prismjs/components/prism-' + lang)` for each entry. Seed 6.4 ("Prism has no BBj grammar") and section 2.0's open question are both answered. (HIGH, read `node_modules/@docusaurus/theme-classic/lib/theme/prism-include-languages.js` and `prismjs/components/prism-bbj.js` from a fresh install; DWC-Course lockfile resolves prismjs 1.30.0.)
   - The stock grammar is thin: no `$`/`!` variable tokens, no labels, no `#` field prefix, no `""` escape handling, a `;rem` lookbehind quirk, and a keyword list that is partly odd (`day`, `tim`, `sys`, `new`/`cast`/`wait`/`open`/`close` missing). It is good enough to colour DWC-Course today.
   - **Recommendation:** keep `'bbj'` in `additionalLanguages` for phase 1 so the build works, then in the Prism phase swizzle `src/theme/prism-include-languages.js` and *extend* (`Prism.languages.bbj = Prism.languages.extend('bbj', {...})` or `insertBefore`) instead of writing a grammar from scratch. If the extension runs after `require('prismjs/components/prism-bbj')`, nothing else changes. Verify keywords with the BBj MCP as planned. (HIGH on mechanism, MEDIUM on the exact override ordering; test it.)
3. **webforj-documentation HEAD is on React 18, not 19.** It uses `react ^18.0.0`, `@docusaurus/* ^3.9.1`, `docusaurus-plugin-llms ^0.4.0`, `docusaurus-plugin-sass ^0.2.5`, `sass ^1.79.4`, `prism-react-renderer ^2.1.0`, `clsx ^1.2.1`, `engines node >=18`. Do not copy its version numbers. Use current ones (below). Its theme overrides are plain JS with no React-19-only or React-18-only APIs seen, but smoke-test `Heading`, `CodeBlock/Line`, `MDXContent` on React 19. (HIGH for what it uses, MEDIUM for "overrides work on 19".)
4. **BaseUrl trap in the copied config.** webforJ registers `scripts: [{src: '/js/dwc-theme-switcher.js'}, ...]`. Docusaurus does **not** prefix `baseUrl` to `scripts`/`stylesheets` entries (verified in `core/lib/server/plugins/synthetic.js`: the `src` is emitted verbatim). webforJ gets away with it because its `baseUrl` is `/`. Here it is `/Courses/`, so write `src: '/Courses/js/dwc-theme-switcher.js'` (build it from a `baseUrl` constant at the top of the config). Same trap for any `url(/img/...)` in SCSS and any hard-coded `/docs/...` string in copied theme code (use `useBaseUrl`/`<Link>`). (HIGH)
5. **`_sidebar-icons.scss` needs `@tabler/icons`.** It does `url("../../node_modules/@tabler/icons/icons/outline/<name>.svg")`. Add `@tabler/icons` as a devDependency (webforJ has `^3.44.0`) even though the seed's drop-list does not mention it. Note the relative `node_modules` path assumes the file stays at `docs/src/css/`. (HIGH)
6. **GitHub Actions are all on v5+ / Node 24 runtimes now.** Seed text says `upload-pages-artifact@v3`; current is v5. See the Actions table. (HIGH, GitHub releases API)
7. **`errata-ai/vale-action` is stale but still works.** Latest release v3.0.0 branch `reviewdog` is what webforJ uses (`errata-ai/vale-action@reviewdog`); repo is not archived, last push 2026-08-03. (MEDIUM; see Vale section.)

## Recommended Stack

### Core framework
| Technology | Version (pin) | Purpose | Why | Confidence |
|---|---|---|---|---|
| `@docusaurus/core`, `@docusaurus/preset-classic`, `@docusaurus/theme-mermaid`, `@docusaurus/plugin-client-redirects`, `@docusaurus/module-type-aliases`, `@docusaurus/types` | `3.10.2` (exact, all identical) | Site generator, classic theme, Mermaid, redirects | `latest` dist-tag on 2026-10-03. Docusaurus requires every `@docusaurus/*` package at the same version. Use exact pins (as DWC-Course does with `3.9.2`) plus Renovate/Dependabot, not carets. Node `>=20`. 3.9.x to 3.10 is a minor bump; webforJ's `onBrokenMarkdownLinks` under `markdown.hooks` is already the non-deprecated form. A `4.0.0-canary` exists: do **not** use it. | HIGH |
| `react`, `react-dom` | `^19.2` (npm shows 19.3.0 latest) | UI runtime | Docusaurus peer deps are `^18 \|\| ^19`; DWC-Course already runs 19. webforJ is on 18, so there is no reason to downgrade. | HIGH |
| `@mdx-js/react` | `^3.0.0` | MDX provider | Required peer of Docusaurus 3. | HIGH |
| `prism-react-renderer` | `^2.4.1` | Code highlighting runtime and the `prism-dwc-theme` base | Docusaurus theme-classic depends on `^2.3.0`; keep the app's range compatible. Do not pin a separate `prismjs`; it comes through theme-classic (1.30.0, includes `bbj`). | HIGH |
| `clsx` | `^2.1.1` | Class joining | webforJ has `^1.2.1`; the copied code only uses the default call signature, which is the same in 2.x. DWC-Course uses `^2`. | HIGH |

### Styling
| Technology | Version | Purpose | Why | Confidence |
|---|---|---|---|---|
| `docusaurus-plugin-sass` | `^0.2.7` | SCSS compilation | Latest 0.2.7 (2026-09). Peer `sass ^1.30`, `@docusaurus/core ^2 \|\| ^3`. Register as a bare string plugin (`'docusaurus-plugin-sass'`) as webforJ does. | HIGH |
| `sass` | `^1.105.1` (current) | Sass compiler (Dart Sass) | webforJ's SCSS uses `@use`; check the copied partials for deprecated global built-ins (`darken()`, `map-get`, `/` division) and `@import`. Dart Sass 1.8x+ already warns, and new 1.10x releases keep warning, so builds still pass. Fix or silence during the styling phase; do not downgrade. | MEDIUM |
| `@tabler/icons` (dev) | `^3.44.0` | Sidebar category icon SVGs (consumed through CSS `url()`) | Needed by `_sidebar-icons.scss`. Do not import it as a JS package; the 5000-icon barrel kills build time. | HIGH |
| `dwc-ui.css` | CDN `https://cdn.webforj.com/next/dwc-ui.css` | DWC design tokens and components | `next` is a moving target (see Pitfalls). Pin to a specific version path if the CDN offers one; check the cdn.webforj.com directory listing during scaffold. | MEDIUM (not verified that a versioned path exists) |
| Inter, JetBrains Mono | Google Fonts via `headTags` | Typography | Same as webforJ. Consider self-hosting later (GDPR; the company is EU-based, `skillspilot.de` and `basis-europe`). Not blocking. | MEDIUM |

### Plugins and themes
| Library | Version | Purpose | Notes | Confidence |
|---|---|---|---|---|
| `docusaurus-plugin-llms` | `^0.6.1` (webforJ is on `^0.4.0`) | `llms.txt`, `llms-full.txt` | Latest, modified 2026-10-03 (actively maintained). Peer `@docusaurus/core ^3`, Node `>=18`. Reuse webforJ's option block (`generateLLMsTxt`, `generateLLMsFullTxt`, `generateMarkdownFiles: false`, `docsDir: 'docs'`, `excludeImports`, `removeDuplicateHeadings`, `includeBlog: false`) and **re-read the 0.4 to 0.6 changelog** for renamed or new options. Mark as devDependency like webforJ, or regular dependency; either builds. | MEDIUM (option names carried from 0.4, not diffed against 0.6) |
| `@easyops-cn/docusaurus-search-local` | `^0.55.3` (DWC-Course has `^0.52.3`) | Offline search, Cmd+K | Latest 0.55.3 (2026-07). Peers: theme-common `^2 \|\| ^3`, react `^16.14 \|\| 17 \|\| 18 \|\| 19`; `open-ask-ai` peer is optional and not needed. Register under `themes`, not `plugins`. **Set `docsRouteBasePath: '/docs'` (matches `routeBasePath: 'docs'`) and `hashed: true`; with `baseUrl: '/Courses/'` set `indexDocs: true`, `indexBlog: false`, `indexPages: true` if the landing page should be searchable.** Search index builds only on `npm run build`, not `start`; that is expected. It adds a `search` navbar item; webforJ's `type: 'search'` item is Algolia's, so it must be replaced or the local theme's own navbar slot used. | HIGH on version, MEDIUM on config |
| `docusaurus-plugin-zooming` | `^1.0.0` | Click-to-zoom screenshots | Last published 2025-08-15 (stale but it is a tiny wrapper around `medium-zoom`; DWC-Course runs it on 3.9.2). Peer `@docusaurus/theme-classic >=3.0.0`. Keep `selector: '.markdown img'`. | HIGH it works (in use on 3.9.2), MEDIUM it keeps working past 3.10 (not tested) |
| `@docusaurus/theme-mermaid` | `3.10.2` | Diagrams | Needs `markdown.mermaid: true` and `themes: ['@docusaurus/theme-mermaid']`. | HIGH |
| `@docusaurus/plugin-client-redirects` | `3.10.2` | Future chapter renames | Start with an empty `redirects: []`. Note: it only emits redirect pages for paths under this site; it does **not** solve the cross-repo DWC-Course redirect (seed 3.3 handles that separately). Redirect `from` paths must not carry the `baseUrl`. | HIGH |
| `@docusaurus/plugin-ideal-image` | **drop** | | Seed already drops it. | HIGH |
| `@docusaurus/faster` | **optional, skip initially** | Rspack-based builds | Optional peer of core. About 14,800 + intro words and ~100 images is a small site. Adds risk with `docusaurus-plugin-sass`/custom webpack. Revisit only if builds exceed minutes. | MEDIUM |
| `@docusaurus/plugin-google-gtag` / `-tag-manager` | **omit** | | No IDs (seed 3.2). | HIGH |

### Config values to carry over (verified in webforJ HEAD, adjust for baseUrl)
- `themeConfig.prism = { theme: codeTheme, darkTheme: codeTheme, additionalLanguages: ['bbj', 'java', 'css', 'markup', 'javascript', 'bash', 'json'] }`. All of these exist as `prismjs/components/prism-*.js` (`markup` and `css` are core grammars already bundled; listing them is harmless). Note webforJ's list uses mixed case (`'Ini'`); on case-sensitive Linux CI use lowercase names only (`ini`).
- `markdown: { mermaid: true, hooks: { onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw' } }`, `onBrokenLinks: 'throw'`, `onBrokenAnchors: 'throw'`, `trailingSlash: false`. (Seed matches webforJ HEAD.)
- `presets[0][1].docs.admonitions.keywords` must list **all** allowed admonition keywords including the defaults, as the seed says. With `@docusaurus/preset-classic` the option is `docs.admonitions`, and the custom `exercise` keyword needs an explicit `extendDefaults: true` (default) or the defaults list; check the docs once when implementing (MEDIUM, not re-verified here).
- `i18n: { defaultLocale: 'en', locales: ['en'] }`; remove webforJ's `start --locale en` flag only if no i18n is configured (harmless to keep).

### Infrastructure (GitHub Actions)
| Item | Version to use | Why | Confidence |
|---|---|---|---|
| Node on CI | **24** (Active LTS) | Docusaurus 3.10 needs `>=20`; DWC-Course used 20 (Node 20 reached EOL April 2026, so move). Node 22 also works. Put `engines: {node: ">=20"}` in `docs/package.json` and add `docs/.nvmrc` with `24`. Do not use Node 26 ("Current" line), no benefit. | MEDIUM (LTS status from knowledge, not re-fetched) |
| `actions/checkout` | `@v5` or newer (latest `v7.0.1`) | v4 still runs but on the deprecated Node 20 runtime. Pin to major `@v7` or `@v6` (check; `v7.0.1` is latest per releases API). | HIGH on latest, MEDIUM on "v4 deprecated" |
| `actions/setup-node` | `@v7` (latest `v7.0.0`) with `cache: npm`, `cache-dependency-path: docs/package-lock.json` | | HIGH |
| `actions/configure-pages` | `@v6` (latest `v6.0.0`) | Optional; not needed for Docusaurus since `url`/`baseUrl` are set in config, and DWC-Course omits it. Skip. | HIGH |
| `actions/upload-pages-artifact` | **`@v5`** (latest `v5.0.0`; seed said v3) | v4 **dropped dotfiles from the artifact**. Docusaurus output has none that matter, but a `static/.nojekyll`, `.well-known/` or similar would silently vanish. v5 added an `include-hidden-files` input. GitHub Pages via Actions does not run Jekyll, so `.nojekyll` is not needed. `path: docs/build`. | HIGH |
| `actions/deploy-pages` | **`@v5`** (latest `v5.0.1`; seed said v4) | Node 24 runtime. Pair with upload-pages-artifact v5 (the two are released together). Job needs `permissions: pages: write, id-token: write` and `environment: github-pages`. | HIGH |
| `errata-ai/vale-action` | `@reviewdog` (what webforJ uses) or pin `@v3.0.0`... see note | Latest release `v3.0.0`; branches `master`, `reviewdog`, `fast`, `refresh`. The `reviewdog` branch is the one that supports `reporter: github-pr-review` and `fail_on_error`. Vale CLI latest is `v3.24.0`; the action downloads Vale itself, so `version:` input can pin it. Pin the action to a commit SHA for supply-chain hygiene, and set `vale_flags`/`files: docs/docs` explicitly. | MEDIUM |
| Runner label | `ubuntu-latest` | webforJ uses `ubuntu-slim` (a lighter runner; fine for Vale and builds, but undocumented in the seed and may need org enablement). Use `ubuntu-latest` unless you confirm `ubuntu-slim` works for `BasisHub`. | MEDIUM |
| `actions/setup-python` | `@v7` | Only if CI later runs converter checks. Not needed for the site build. | HIGH |

`reviewdog.yml` trigger note: webforJ's `paths-ignore: docs/blog/**, docs/cookbook/**` should become a `paths:` allowlist (`docs/docs/**/*.md`, `docs/docs/**/*.mdx`, `.vale.ini`, `.github/.styles/**`) so Vale runs only on prose. Also copy the `pull_request` permissions: reviewdog needs `pull-requests: write` for `github-pr-review`; on PRs from forks the token is read-only and the check will fail, so use `reporter: github-check` or restrict to same-repo PRs. (MEDIUM)

### Python side (converter, throwaway)
| Library | Version | Purpose | Why | Confidence |
|---|---|---|---|---|
| Python | 3.11+ (3.11.4 on the dev machine) | Runtime | Fine. | HIGH |
| `lxml` | `6.1.3` | XML parsing of `moodle_backup.xml`, `*.xml`, and as the BeautifulSoup parser | Fast, tolerant of Moodle's HTML-in-XML. Use `lxml` for the `.xml` backup files and `BeautifulSoup(html, 'lxml')` for HTML content. | HIGH |
| `beautifulsoup4` | `4.15.0` | HTML DOM pre-processing (6.1 rules) | The seed's pre-processing rules are DOM surgery (unwrap spans, collapse `<br>` runs, classify `<pre>`, rewrite links). BS4 is the ergonomic tool. | HIGH |
| `markdownify` | `1.2.3` | HTML to Markdown | **Choose markdownify, not pandoc.** Reasons: (a) it is a pip dependency, pandoc is not installed on the dev machine and adds a CI/dev prerequisite for a throwaway script; (b) it operates on the same BS4 tree you already pre-processed, so custom handlers are small subclass overrides (`convert_pre` for language fences, `convert_youtube` for the placeholder, `convert_img`); (c) the seed's needs (custom `<youtube>` element, language-tagged fences, selective raw-HTML tables) are easier to hook in than via pandoc Lua filters. Pandoc (3.12 current) is better at tables and escaping, but its `gfm-raw_html` mode drops the custom placeholder and the colspan tables the seed wants to keep as HTML. Set `heading_style='ATX'`, `bullets='-'`, `code_language_callback`, `escape_underscores=False`, `escape_asterisks=False` then run your own MDX-escape pass (6.2). | MEDIUM-HIGH |
| `pandoc` | **not used** | | Optional fallback only for one-off table conversions. | MEDIUM |
| `python-slugify` or hand-rolled `re` | any | kebab-case filenames | Hand-roll with `unicodedata.normalize('NFKD')`, 6 lines. Not worth a dependency. | HIGH |
| stdlib: `tarfile`, `zipfile`, `urllib.parse`, `shutil`, `argparse`, `json` | | Unpack, resolve `@@PLUGINFILE@@`, copy files, CLI, mapping file | | HIGH |

Install note: `pip install lxml==6.1.3 beautifulsoup4==4.15.0 markdownify==1.2.3` into a `tools/.venv` or with `pipx`; commit a `tools/requirements.txt`. Do not add Python to the site's CI.

## What NOT to use
| Do not use | Why |
|---|---|
| Docusaurus 3.9.x as the target, or `^3.9.1` ranges like webforJ | 3.10.2 is current; carets let the six `@docusaurus/*` packages drift. Pin one exact version. |
| `@docusaurus/plugin-ideal-image` | Seed drops it; plain Markdown images + zoom plugin. |
| `@mui/*`, `@emotion/*`, `react-material-ui-carousel`, `openai`, `p-limit`, `proxy-agent`, `tsx`, `md5`, `@types/md5`, `fs-extra`, `fast-glob`, `gray-matter`, `commander`, `jiti`, `dotenv`, `rimraf` | All serve webforJ's cookbook/i18n/Maven pipeline or MUI; the copy-over of `package.json` must be a rewrite, not a prune-by-guess. `rimraf` is only used by `npm run clear`. |
| webforJ `prebuild`/`prestart` scripts (`generate-cookbook-index.mjs`, `preflight-start.mjs`) | Reference tools that do not exist here; leaving them breaks `npm run build`. |
| `@docusaurus/plugin-content-docs` as an explicit dependency/plugin entry | Already in `preset-classic`. webforJ registers it a second time with `id: 'cookbook'`; this site has no second docs instance. |
| `@docusaurus/faster` (for now) | Complexity without payoff at this size. |
| TypeScript config (`docusaurus.config.ts`, `tsc` typecheck) | Seed says `.js` (like webforJ). DWC-Course's `npm run typecheck` step in `deploy.yml` goes away. TypeScript 7.0.2 is `latest` on npm and is a native-compiler rewrite; do not adopt it incidentally. |
| Writing the BBj Prism grammar from scratch | A base grammar ships in prismjs 1.30.0; extend it. |
| Pandoc in the pipeline | See Python table. |
| `gh-pages` branch / `docusaurus deploy` | Seed uses the Pages-via-Actions artifact flow. |
| `actions/upload-pages-artifact@v3`, `deploy-pages@v4` | Superseded; v3 uses deprecated `upload-artifact` internals. |
| Algolia DocSearch for now | Out of scope; keep the config block commented. |

## Alternatives considered
| Category | Recommended | Alternative | Why not |
|---|---|---|---|
| Search | `@easyops-cn/docusaurus-search-local` | Algolia DocSearch | Needs a public site to apply; deferred by decision. |
| HTML to MD | markdownify | pandoc, `html2text` | See table; pandoc is a system binary, `html2text` is less hookable. |
| BBj highlighting | Extend prismjs's `bbj` | Custom grammar file registered via swizzled `prism-include-languages.js` | The seed plan; viable but redundant. Do it only if the extension approach cannot cover needs (`$`/`!` variables, labels). |
| Bundler | Webpack (default) | `@docusaurus/faster` (Rspack) | Not needed at this size. |
| Node on CI | 24 | 22 / 20 | 20 is EOL; 22 is acceptable if a toolchain issue appears. |

## Installation

```bash
# docs/package.json (exact Docusaurus pins)
cd docs
npm install --save-exact \
  @docusaurus/core@3.10.2 @docusaurus/preset-classic@3.10.2 \
  @docusaurus/theme-mermaid@3.10.2 @docusaurus/plugin-client-redirects@3.10.2
npm install \
  react@^19.2 react-dom@^19.2 @mdx-js/react@^3 \
  prism-react-renderer@^2.4.1 clsx@^2.1.1 \
  docusaurus-plugin-sass@^0.2.7 sass@^1.105 \
  docusaurus-plugin-llms@^0.6.1 \
  docusaurus-plugin-zooming@^1.0.0 \
  @easyops-cn/docusaurus-search-local@^0.55.3
npm install -D --save-exact @docusaurus/module-type-aliases@3.10.2 @docusaurus/types@3.10.2
npm install -D @tabler/icons@^3.44

# converter (repo root)
python3 -m venv tools/.venv && tools/.venv/bin/pip install lxml==6.1.3 beautifulsoup4==4.15.0 markdownify==1.2.3
```

`docs/package.json` scripts to keep: `docusaurus`, `start`, `build`, `serve`, `clear`, `swizzle`, `write-heading-ids`. Delete the cookbook, i18n and `prebuild`/`prestart` hooks. Set `"engines": {"node": ">=20.0"}`.

### Reference `deploy.yml` skeleton
```yaml
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: docs } }
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 24, cache: npm, cache-dependency-path: docs/package-lock.json }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with: { path: docs/build }
  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```
(Both pages actions are ones whose major versions were verified via the GitHub releases API; `checkout@v7`/`setup-node@v7` likewise. If a v7 tag is not yet on the floating-major ref, fall back to `@v6`/`@v5`.)

## Open items for later phases
- Diff `docusaurus-plugin-llms` 0.4 to 0.6 options (MEDIUM gap).
- Confirm a version-pinned `dwc-ui.css` URL exists, or accept `next` drift (MEDIUM gap).
- Test the `prism-include-languages` swizzle ordering with prismjs's own `bbj` before writing any grammar.
- Check that `docusaurus-plugin-zooming` still behaves on 3.10 (last release predates 3.10).
- Confirm `ubuntu-slim` availability for `BasisHub` or stay on `ubuntu-latest`.
- Do a Sass deprecation sweep on the copied partials with the pinned `sass` version.

## Sources
- npm registry (`npm view`) for all package versions and peer dependencies, 2026-10-03. HIGH.
- Fresh clones: `webforj/webforj-documentation` (HEAD commit 2026-10-02) `docs/package.json`, `docs/docusaurus.config.js`, `.github/workflows/*.yml`, `docs/src/css/_sidebar-icons.scss`; `BasisHub/DWC-Course` `package.json`, `docusaurus.config.ts`, `.github/workflows/deploy.yml`, `package-lock.json`. HIGH.
- `@docusaurus/theme-classic@3.10.2` `lib/theme/prism-include-languages.js` and `@docusaurus/core@3.10.2` `lib/server/plugins/synthetic.js` (read from installed packages). HIGH.
- `prismjs@1.30.0` `components/prism-bbj.js` (installed package). HIGH.
- GitHub releases API: `actions/checkout`, `setup-node`, `upload-pages-artifact`, `deploy-pages`, `configure-pages`, `setup-python`, `errata-ai/vale-action`, `errata-ai/vale`, `facebook/docusaurus`, `jgm/pandoc`. HIGH.
- PyPI JSON API for `markdownify`, `beautifulsoup4`, `lxml`. HIGH.
- Node LTS schedule and Node 20 EOL: training knowledge, not re-fetched. MEDIUM.
