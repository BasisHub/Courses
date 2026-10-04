---
last_mapped_commit: a302c591e556408168f897dff732d78aa3210063
last_mapped_at: 2026-10-04
---
# Technology Stack

**Analysis Date:** 2026-10-04

## Languages

**Primary:**
- JavaScript/JSX - Site configuration, client code, theme customization
- Markdown/MDX - Documentation content and interactive components

**Secondary:**
- Python 3.11+ - Tooling scripts for migration, sample sync, and verification

## Runtime

**Environment:**
- Node.js 24 LTS (specified in `docs/.nvmrc`)

**Package Manager:**
- npm
- Lockfile: `docs/package-lock.json` present
- Install mode: `npm ci` (exact reproducible installs) for CI, `npm install` only for updates

## Frameworks

**Core:**
- Docusaurus 3.10.2 (exact pin) - Static site generator for documentation
  - `@docusaurus/core` 3.10.2
  - `@docusaurus/preset-classic` 3.10.2
  - `@docusaurus/module-type-aliases` 3.10.2 (devDependency)
  - `@docusaurus/types` 3.10.2 (devDependency)

**UI Framework:**
- React 19.3.0 - Component library for Docusaurus theme
- react-dom 19.3.0 - DOM rendering

**Markup:**
- MDX 3.1.1 - Markdown with embedded React components

**Code Highlighting:**
- Prism 1.30.0 (devDependency) - BBj, Java, CSS, JavaScript syntax highlighting
- prism-react-renderer 2.4.1 - React wrapper for Prism
- Custom BBj grammar extension in `docs/src/prism/bbj-extend.js`

**Diagrams:**
- `@docusaurus/theme-mermaid` 3.10.2 - Mermaid diagram support

## Key Dependencies

**Critical:**
- `@mdx-js/react` 3.1.1 - MDX provider for Docusaurus 3
- `clsx` 2.1.1 - Utility for conditional CSS class names

**Styling:**
- `sass` 1.105.1 - Dart Sass compiler for SCSS
- `docusaurus-plugin-sass` 0.2.7 - Sass compilation plugin for Docusaurus
- `@fontsource-variable/inter` 5.3.0 - Variable Inter font family
- `@fontsource-variable/jetbrains-mono` 5.3.0 - Variable JetBrains Mono font

**Search:**
- `@easyops-cn/docusaurus-search-local` 0.55.3 - Offline client-side search

**Icons:**
- `@tabler/icons` 3.48.0 (devDependency) - SVG icons for sidebar categories

**Plugins:**
- `docusaurus-plugin-llms` 0.6.1 - Generates llms.txt and llms-full.txt for LLM consumption
- `docusaurus-plugin-zooming` 1.0.0 - Click-to-zoom image viewer
- `@docusaurus/plugin-client-redirects` 3.10.2 - URL redirect handling for renamed/moved pages

## Configuration

**Environment:**
- `docs/.nvmrc`: Node version specification
- `docs/package.json`: Exact pinned versions for all @docusaurus/* packages
- `docs/docusaurus.config.js`: Main site configuration (JS, not TypeScript)
  - Base URL: `/Courses/`
  - Deployed at: `https://basishub.github.io/Courses/`

**Code Quality:**
- `.editorconfig` - Editor formatting rules (2-space indent, UTF-8, LF line endings)
- `.vale.ini` - Prose linting configuration (Google and BASIS styles)
- `.github/.styles/` - Vale style definitions (Google, BASIS custom rules)

**Build:**
- `npm run build` - Docusaurus build (produces `docs/build/`)
- `npm run start` - Dev server with hot reload
- `npm run serve` - Serve production build locally
- `npm run clear` - Clean Docusaurus cache

## Platform Requirements

**Development:**
- Node 24 LTS
- npm (included with Node)
- Python 3.11+ (for tools only, not required for site generation)
- Vale 3.24.0 (for prose linting, installed separately)

**Production:**
- GitHub Pages hosting (via GitHub Actions)
- Git repository: https://github.com/BasisHub/Courses

## CI/CD Stack

**Runner:** ubuntu-latest
- `actions/checkout@v7`
- `actions/setup-node@v7` with npm cache
- `actions/upload-pages-artifact@v5` for GitHub Pages artifact
- `actions/deploy-pages@v5` for GitHub Pages deployment
- `errata-ai/vale-action@reviewdog` (v3.0.0) for prose linting

---

*Stack analysis: 2026-10-04*
