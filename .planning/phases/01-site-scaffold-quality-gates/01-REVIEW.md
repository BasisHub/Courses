---
phase: 01-site-scaffold-quality-gates
reviewed: 2026-10-03T00:00:00Z
depth: standard
files_reviewed: 43
files_reviewed_list:
  - .gitignore
  - docs/.nvmrc
  - docs/package.json
  - docs/docusaurus.config.js
  - docs/sidebars.js
  - docs/src/data/books.js
  - docs/src/data/book-icons-css.js
  - docs/src/pages/index.js
  - docs/src/plugins/mermaid-elk-stub.js
  - docs/src/theme/prism-dwc-theme.js
  - docs/src/css/custom.scss
  - docs/src/css/_book-icons.scss
  - docs/src/css/_print.scss
  - docs/src/css/_content.scss
  - docs/src/css/_sidebar-icons.scss
  - docs/src/css/mixins/_content-block.scss
  - docs/src/css/_alerts.scss
  - docs/src/css/_announcement.scss
  - docs/src/css/_category.scss
  - docs/src/css/_footer.scss
  - docs/src/css/_navbar.scss
  - docs/src/css/_pagination.scss
  - docs/src/css/_prism.scss
  - docs/src/css/_reset.scss
  - docs/src/css/_sidebar.scss
  - docs/src/css/_tables.scss
  - docs/src/css/_toc.scss
  - docs/src/css/_tutorial-content.scss
  - docs/src/css/_utils.scss
  - docs/static/js/dwc-theme-switcher.js
  - docs/static/js/link-decorator.js
  - docs/static/img/favicon.svg
  - docs/docs/intro-bbj/00-overview.mdx
  - docs/docs/intro-bbj/01-getting-started/_category_.json
  - docs/docs/intro-bbj/01-getting-started/index.md
  - docs/docs/intro-bbj/01-getting-started/01-sample-page.md
  - docs/docs/dwc/00-overview.mdx
  - docs/docs/dwc/01-first-chapter/_category_.json
  - docs/docs/dwc/01-first-chapter/index.md
  - docs/docs/dwc/01-first-chapter/01-sample-page.md
  - tools/prove-gates.sh
  - tools/verify-phase1.sh
  - tools/requirements.txt
findings:
  critical: 2
  warning: 7
  info: 7
  total: 16
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-10-03T00:00:00Z
**Depth:** standard
**Files Reviewed:** 41 (plus the scripts and requirements file listed above)
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

I reviewed the scaffold: the Docusaurus config, the sidebars and book data, the landing page, the SCSS (I diffed the copied partials against `/Users/beff/_workspace/webforj-documentation`), the static JS, the placeholder book content and the two acceptance scripts. I did not run the scripts; this is a static review.

The config itself is sound: the gates throw, the `baseUrl` is handled correctly, the six `@docusaurus/*` packages are pinned to one version, and every doc id resolves. The copied partials match upstream apart from the added header line, CRLF to LF line endings, and the documented `@import` to `@use` change in `_content.scss`.

The serious problems are elsewhere:

- `link-decorator.js`, shipped on every page, starts a timer loop that never stops.
- The repo does not include the MIT permission notice for the copied webforJ files.
- Several acceptance checks can pass when the thing they are meant to test is broken.

## Critical Issues

### CR-01: link-decorator.js polls forever, and each back/forward navigation adds another endless loop

**File:** `docs/static/js/link-decorator.js:10-18`
**Issue:** `tryDecorate(retries = 10)` is registered directly as an event listener. The DOM therefore passes the `Event` object as `retries`, so the default value of 10 never applies. The comparison `Event <= 0` becomes `NaN <= 0`, which is `false`. The next call gets `retries - 1`, which is `NaN`, and `NaN <= 0` is also `false`. The loop never ends.

The result: from `DOMContentLoaded` on, `document.querySelectorAll('a')` runs every 50 ms for the life of the tab. Every `popstate` event (back/forward) starts one more endless loop, so the loops pile up.

Line 18 listens for `pushstate`, which is not a real DOM event and never fires. The intended "re-decorate after client-side navigation" only works because of the endless polling. (The bug is inherited from upstream, but this repo now ships it.)
**Fix:**
```js
function tryDecorate(retries) {
  if (typeof retries !== 'number') retries = 10;
  if (retries <= 0) return;
  decorateLinks();
  setTimeout(() => tryDecorate(retries - 1), 50);
}
document.addEventListener('DOMContentLoaded', () => tryDecorate());
window.addEventListener('popstate', () => tryDecorate());
```
For SPA route changes, use a Docusaurus client module with `onRouteDidUpdate() { tryDecorate(); }` instead of the made-up `pushstate` event. Record this as a local change next to the provenance header.

### CR-02: The MIT permission notice for the copied webforJ files is missing from the repo

**File:** repository root (no `LICENSE` or third-party notice file); headers in `docs/src/css/*.scss`, `docs/static/js/*.js`, `docs/src/theme/prism-dwc-theme.js`
**Issue:** The upstream files carry no per-file header. Their MIT notice lives in the upstream `LICENSE` ("Copyright (c) 2022 webforJ" plus the permission text). This repo adds a one-line pointer, `Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ).`, but no file anywhere in the repo contains the permission notice.

The MIT license requires that "the above copyright notice and this permission notice shall be included in all copies or substantial portions". CLAUDE.md lists this as a constraint ("copied webforJ files keep their MIT notice"). As it stands, the repo does not meet the license terms.
**Fix:** Add `THIRD_PARTY_NOTICES.md` (or `LICENSES/webforJ-MIT.txt`) at the repo root containing the full upstream MIT text verbatim. Extend each header to point to it, for example `/* Copied from webforj/webforj-documentation. MIT, (c) 2022 webforJ. See LICENSES/webforJ-MIT.txt. */`.

## Warnings

### WR-01: Build-time inputs are devDependencies and are read through a hard-coded node_modules path

**File:** `docs/package.json:44-48`, `docs/src/data/book-icons-css.js:10-14`, `docs/src/css/_sidebar-icons.scss:3`
**Issue:** `docusaurus.config.js` requires `docusaurus-plugin-llms` and, through `bookIconsCss()`, reads `@tabler/icons` at config-load time. Both are listed under `devDependencies`. If anyone installs with `NODE_ENV=production npm ci` or `npm ci --omit=dev`, which is common in deploy images, the build fails.

`book-icons-css.js` also hard-codes `../../node_modules/@tabler/icons/...` rather than resolving the package. That path breaks under npm workspaces or any hoisting change.
**Fix:** Move `@tabler/icons` and `docusaurus-plugin-llms` to `dependencies`. In `book-icons-css.js`, resolve the directory with `path.join(path.dirname(require.resolve('@tabler/icons/package.json')), 'icons/outline', b.icon + '.svg')`.

### WR-02: The unanchored `import/` ignore rule hides any directory named `import` anywhere in the tree

**File:** `.gitignore:1`
**Issue:** `import/` matches a directory of that name at any depth. A chapter folder or asset directory called `import` (for example `docs/docs/intro-bbj/05-import/` after slug stripping, or `docs/static/img/import/`) would be silently untracked. It would build locally and then break CI with a missing-file error, or the content would simply be lost.
**Fix:** Anchor the rule to the root with `/import/`. `verify-phase1.sh:136` still passes after this change.

### WR-03: Printing in dark mode produces near-invisible code and themed blocks

**File:** `docs/src/css/_print.scss:26-36`
**Issue:** The print rules force `#000` text on `#fff` for `html, body, article`, but leave the `--dwc-code-*` token colors and `data-app-theme="dark"` in place. When the reader is in dark mode, code blocks keep the dark palette's light token colors. Browsers drop backgrounds by default when printing, so that light code text ends up on white paper. Admonitions and tables are affected the same way.
**Fix:** Inside `@media print`, reset the dark tokens, for example `[data-theme="dark"] { --dwc-dark-mode: 0; }`, and override the code variables (`--dwc-code-text: #000; --dwc-code-bg: #fff; ...`) or set `pre, pre * { color: #000 !important; }`. Add a dark-mode case to the print check in `verify-phase1.sh`.

### WR-04: The "landing: intro-bbj card before dwc card" check actually tests navbar order

**File:** `tools/verify-phase1.sh:46-47`
**Issue:** The navbar `docSidebar` items render `href="/Courses/docs/<book>/overview"` before the cards do, in the same `books.js` order. After `awk '!s[$0]++'` removes duplicates, the first two hrefs always come from the navbar. Reordering or removing the landing cards would not make this check fail.
**Fix:** Limit the search to the cards, for example by extracting only anchors with `class="card padding--lg book-card"`:
```bash
order=$(grep -oE '<a [^>]*class="card[^"]*book-card"[^>]*href="/Courses/docs/[a-z-]*/overview"|<a [^>]*href="/Courses/docs/[a-z-]*/overview"[^>]*class="card[^"]*book-card"' "$INDEX" | grep -oE '/Courses/docs/[a-z-]*/overview' | tr '\n' ' ')
```

### WR-05: The "sidebar omits other book" checks pass when the page is missing

**File:** `tools/verify-phase1.sh:58,60`
**Issue:** `bash -c "! grep -q PATTERN FILE"` returns success when `grep` exits 2 because the file does not exist. If the overview page moves or fails to render, both "omits" checks report PASS.
**Fix:** Check that the file exists first: `bash -c "test -f '$F' && ! grep -q '...' '$F'"`.

### WR-06: The served smoke test can pass against a foreign server, and cleanup kills whatever listens on port 3111

**File:** `tools/verify-phase1.sh:22-33,63-69`
**Issue:** If some other process already listens on port 3111, `npm run serve` fails to bind, but the curl probe gets a response from that process and reports "server up". The GET checks then test the wrong server. `stop_server` then runs `kill $(lsof -tiTCP:3111 -sTCP:LISTEN)` and kills that unrelated process.
**Fix:** Before starting the server, fail if the port is already in use (`lsof -tiTCP:$PORT -sTCP:LISTEN && { fail "port $PORT busy"; ...; }`). In `stop_server`, only kill descendants of `$SERVER_PID` (`pkill -P "$SERVER_PID"`) instead of every listener on the port.

### WR-07: The print check in verify-phase1.sh leaks a temp file, and on Linux it writes to the working directory

**File:** `tools/verify-phase1.sh:121,130`
**Issue:** `mktemp -t verify-phase1` creates a file, and the script then uses a different name (`<that>.pdf`). `rm -f "$pdf"` removes only the `.pdf`, so the mktemp file is left behind on every run. On GNU mktemp, a `-t` template with no `X`s is an error, so `pdf` becomes `.pdf`, a file in the repo root, and Chrome writes there.
**Fix:** `pdf="$(mktemp "${TMPDIR:-/tmp}/verify-phase1.XXXXXX.pdf")"`, or use `mktemp -d` and write `out.pdf` inside it, then `rm -rf` the directory.

## Info

### IN-01: The landing page title renders as "Home | BASIS Courses"

**File:** `docs/src/pages/index.js:9`
**Issue:** `title="Home"` makes the browser tab and social title generic.
**Fix:** Omit `title` so the site title is used, or pass `title="BASIS Courses"`.

### IN-02: The provenance header in custom.scss claims a straight copy, but the file has local changes

**File:** `docs/src/css/custom.scss:1`
**Issue:** The fonts, the `@use` list and the MUI removal all differ from upstream (`_content.scss` and `_sidebar-icons.scss` are also modified). The header gives no hint of this, which makes future upstream syncs error-prone.
**Fix:** Write "Copied from ... and modified" and list the changes, as `dwc-theme-switcher.js:27` already does.

### IN-03: The category and experimental icon CSS is dead code

**File:** `docs/src/css/_sidebar-icons.scss:8-51`, `docs/src/css/_sidebar.scss:159-160`
**Issue:** Nothing in this site emits the `.cat-icon` or `.experimental-content` classes. The rules are emitted into the bundle but never match.
**Fix:** Keep them if they are planned, with a comment saying so; otherwise drop the `@include`s.

### IN-04: The elk stub breaks any diagram that sets `layout: elk`, and the error does not say why

**File:** `docs/src/plugins/mermaid-elk-stub.js:10`
**Issue:** Aliasing the package to `false` gives an empty module. Any Mermaid config that requests the elk layout will then call `registerLayoutLoaders(undefined)` and fail at runtime in the browser, not at build time.
**Fix:** Note this in the comment, or add a Vale/grep rule that rejects `layout: elk` in the docs.

### IN-05: The prism theme comment points to the wrong file for the variables

**File:** `docs/src/theme/prism-dwc-theme.js:3`
**Issue:** The comment says `--dwc-code-*` is defined in `custom.scss`. It is actually defined in `_prism.scss`.
**Fix:** Correct the comment.

### IN-06: requirements.txt pins only one transitive dependency

**File:** `tools/requirements.txt:5`
**Issue:** `six` is pinned, but other transitive dependencies (`soupsieve`, `typing-extensions`) are not, so the environment is only partly reproducible.
**Fix:** Pin either only the direct dependencies or the full `pip freeze` output, and add a comment saying which.

### IN-07: There is no social card or `themeConfig.image`

**File:** `docs/docusaurus.config.js:82-107`
**Issue:** Social cards are missing until Stephan supplies the assets. Track this so it is not forgotten.
**Fix:** Add `image: 'img/social-card.png'` when the asset arrives.

---

_Reviewed: 2026-10-03T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
