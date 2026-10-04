---
last_mapped_commit: a302c591e556408168f897dff732d78aa3210063
last_mapped_at: 2026-10-04
---
# Coding Conventions

**Analysis Date:** 2026-10-04

## Naming Patterns

**Files:**
- kebab-case ASCII only, no spaces or special characters
- Two-digit position prefix: `01-`, `02-`, `03-`, etc.
- Exercises use `90-` and up (e.g., `90-exercise-tic-tac-toe.mdx`, `91-exercise-oo-tic-tac-toe.mdx`)
- Example: `01-setup.mdx`, `02-first-hello-world.mdx`, `03-syntax-and-variables.mdx`

**Directories:**
- kebab-case with two-digit position prefixes
- Example: `01-getting-started/`, `02-object-oriented-syntax/`, `03-web-development/`

**Functions/Variables (JavaScript):**
- camelCase for functions and variables
- Example: `setPlaying`, `frameRef`, `watchUrl`, `extendBbj`
- Regular expressions in SCREAMING_SNAKE_CASE: `ID_PATTERN`, `PROBE`

**Types/Classes (BBj):**
- Retain case-sensitivity for Java classes: `HashMap`, `BBjNumber`, `Counter`
- Variable suffixes indicate type: `$` for strings, `%` for integers, `!` for objects
- Example: `msg$`, `count%`, `counter!`, `total!`

**CSS/SCSS Variables:**
- Double-dash prefix with category segments: `--dwc-color-primary-text`, `--dwc-surface-3`, `--ifm-font-family-base`
- Use existing DWC tokens; never hardcode colors

## Code Style

**Formatting:**
- JavaScript: 2-space indentation (evident in `docusaurus.config.js`, component files)
- SCSS: 2-space indentation with partials prefixed with underscore (`_alerts.scss`, `_sidebar.scss`)
- No configuration file enforced (ESLint/Prettier not used)
- Docusaurus configuration uses JSDoc comments for type information: `/** @type {...} */`

**Linting:**
- Vale 3.24.0: enforces Google + BASIS styles on Markdown/MDX
- Configured in `.vale.ini`
- MinAlertLevel: suggestion (warnings and suggestions appear as review comments)
- Only errors fail the build
- No spelling check (Vale.Spelling = NO)
- Semicolons, passive voice, "will", parentheses, and Latin disabled for Google style exceptions

**Vale Styles:**
- basedOnStyles: Vale, Google, BASIS
- Custom BASIS rules in `.github/.styles/BASIS/` enforce:
  - AIDisclaimer, AIDisclaimerSoft, AIVocab (AI artifact handling)
  - BeDirect (avoid hedging)
  - Capitalization rules
  - EmDashes (forbidden — use hyphens)
  - Hedging words flagged
  - No weasel words
  - Parallelism in lists

## Import Organization

**JavaScript:**
- React/hooks first
- Library imports next
- Local imports (relative paths) last
- Example from `YouTube/index.js`:
  ```javascript
  import React, {useEffect, useRef, useState} from 'react';
  import './styles.css';
  ```

**Module.exports Pattern:**
- CommonJS: `module.exports = [...]` for node scripts
- ES6 export: `export default function Component(props) {}`

## Markdown/MDX Conventions

**Front Matter:**
- Required fields: `title` and `description`
- Format: YAML with three dashes
- Example:
  ```yaml
  ---
  title: "Set up Java, BBj and Eclipse"
  description: "Install Java, BBj and Eclipse so you can write and run your first BBj program."
  ---
  ```

**Content Headings:**
- Start at H2 (`##`); H1 reserved for front matter title
- Use sentence case, not Title Case

**Code Fences:**
- Every fence must specify a language: `bbj`, `java`, `css`, `html`, `javascript`, `bash`, `json`
- Examples:
  ```bbj
  A=MSGBOX("Hello World")
  RELEASE
  ```
  ```javascript
  const watchUrl = 'https://www.youtube.com/watch?v=' + id;
  ```

**Comments in MDX:**
- Use `{/* ... */}` for comments
- Never use `<!-- ... -->`

**Exercise Admonitions:**
- Use custom `:::exercise` admonition (registered in `docusaurus.config.js`)
- Rendered as special alert boxes
- Exercise files numbered `90-` and up

**Images:**
- Stored in section's `img/` subfolder: `./img/filename.png`
- Names: kebab-case, no spaces, no timestamps
- Alt text required on all images
- Example: `![Description of image](./img/setting-up-eclipse.png)`

**YouTube Videos:**
- Use custom `<YouTube>` component, never raw iframes
- Format: `<YouTube id="VIDEO_ID" title="Full Title" />`
- Example: `<YouTube id="fF9LaVXJGuA" title='BBx Clues 2: A first "Hello World"' />`

## Error Handling & Validation

**BBj Verification:**
- Every BBj snippet must pass `bbj_check_syntax` before committing
- BBj API names verified with `bbj_lookup` against BBj Documentation MCP
- Keywords and mnemonics recorded in `tools/data/bbj-token-verification.md`
- Syntax stored in `tools/data/intro-bbj-syntax.md` and `tools/data/dwc-samples-syntax.md`

**Broken Links:**
- Docusaurus configured to throw on broken links (`onBrokenLinks: 'throw'`)
- Broken anchors cause build failure (`onBrokenAnchors: 'throw'`)
- Markdown link and image failures throw (`onBrokenMarkdownLinks/Images: 'throw'`)
- Tested via `tools/prove-gates.sh`

**Sample Synchronization:**
- `docs/examples/<book>/` must be kept in sync with `docs/static/files/<book>/`
- Verified by `tools/sync-samples.py --check` (runs on every build in CI)

## Language & Voice

**Prose Style:**
- English, direct, second person
- Vale (Google + BASIS styles) is the arbiter
- House rule: no em dashes; use hyphens instead
- Examples: "you already write software", "your first BBj program"

**Terminology:**
- Exact naming for BBj/DWC/webforJ concepts
- No ambiguous shortcuts; use full term on first reference
- Example: "Dynamic Web Client (DWC)" on first use

## Component Patterns

**React Components:**
- Functional components with hooks
- Hooks run first, in same order on every render
- Props validated early with informative error messages
- Example from `YouTube/index.js`:
  ```javascript
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(null);
  
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('YouTube: the "title" prop is required and must not be empty.');
  }
  ```
- Default exports in `index.js` files
- Inline styles with className for styling

**Docusaurus Configuration:**
- JSDoc TypeScript annotations: `/** @type {...} */`
- Modular plugins configuration
- External build gates configured as top-level settings (`onBrokenLinks`, `onBrokenAnchors`)

## Dependency Management

**Node/Package Manager:**
- Node 24 required (specified in `docs/.nvmrc`)
- `npm ci` for fresh clones (uses exact `package-lock.json`)
- `npm install` only when updating lockfile intentionally
- All `@docusaurus/*` packages exact-pinned at 3.10.2

**Fonts:**
- `@fontsource-variable/inter` for body text
- `@fontsource-variable/jetbrains-mono` for monospace
- Never add Google Fonts or CDN links
- Vendored CSS snapshot: `docs/static/css/dwc-ui.css`

## Special Conventions

**Downloadable Samples:**
- Dual location: source in `docs/examples/<book>/` and downloadable ZIP in `docs/static/files/<book>/`
- Both kept in sync via `tools/sync-samples.py`

**Styling:**
- All colors via DWC tokens (`--dwc-*`) mapped to Infima (`--ifm-*`)
- Don't hardcode hex colors
- Light and dark themes both supported
- SCSS partials imported in `custom.scss` via `@use` statements

**Third-Party Code:**
- Copied webforJ files retain MIT header comment
- Listed in `THIRD_PARTY_NOTICES.md`
- Marked with attribution in CLAUDE.md conventions section

**Component Fixture:**
- `docs/docs/authoring/components.mdx` is unlisted, not a book
- Keep out of `books.js` and `sidebars.js`
- Update when shared components change

**Prism BBj Highlighting:**
- BBj grammar extensions in `docs/src/prism/bbj-extend.js`
- Keywords recorded in `bbj-classes.json`
- Add only after MCP verification, recorded in `tools/data/bbj-token-verification.md`

---

*Convention analysis: 2026-10-04*
