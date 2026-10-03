---
phase: 01-site-scaffold-quality-gates
fixed_at: 2026-10-03T00:00:00Z
review_path: .planning/phases/01-site-scaffold-quality-gates/01-REVIEW.md
iteration: 1
findings_in_scope: 16
fixed: 15
skipped: 1
status: partial
---

# Phase 1: Code Review Fix Report

**Fixed at:** 2026-10-03T00:00:00Z
**Source review:** .planning/phases/01-site-scaffold-quality-gates/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 16 (fix scope: all)
- Fixed: 15
- Skipped: 1 (IN-07, needs an asset)

**Verification after all fixes:** `npm run build` in `docs/` exits 0. The only warning is the known, harmless postcss-calc warning. `tools/verify-phase1.sh` reports ALL CHECKS PASSED (39 checks, including the print check and `prove-gates.sh`). The 01-01-PLAN check that `requirements.txt` has exactly 4 pinned lines also still passes.

## Fixed Issues

### CR-01: link-decorator.js polls forever, and each back/forward navigation adds another endless loop

**Files modified:** `docs/static/js/link-decorator.js`, `docs/src/clientModules/link-decorator.js` (new), `docs/docusaurus.config.js`
**Commit:** 6762345
**Applied fix:**
- `tryDecorate(retries)` now treats any non-number argument as 10, so the loop stops after 10 runs.
- The listeners use wrapper arrows, so the DOM `Event` is no longer passed in as the retry count.
- The fake `pushstate` listener is removed.
- The script exposes `window.tryDecorate`. A new client module, registered through `clientModules`, calls it from `onRouteDidUpdate` after each SPA route change.
- The header now says "and modified" and lists the local changes.

**Status:** fixed: requires human verification. This is a logic and behaviour fix. Check in a browser that `.empty-link` decoration still appears after client-side navigation.

### CR-02: The MIT permission notice for the copied webforJ files is missing from the repo

**Files modified:** `LICENSES/webforJ-MIT.txt` (new), plus the provenance header on line 1 of all 20 copied files (17 SCSS files under `docs/src/css/`, `docs/src/theme/prism-dwc-theme.js`, `docs/static/js/dwc-theme-switcher.js`, `docs/static/js/link-decorator.js`)
**Commit:** 4dffc18
**Applied fix:** I copied the upstream `LICENSE` verbatim from the local clone at `/Users/beff/_workspace/webforj-documentation/LICENSE`. The holder line, "Copyright (c) 2022 webforJ", is therefore confirmed and needs no human check. Each header now ends with `see LICENSES/webforJ-MIT.txt`.

### WR-01: Build-time inputs are devDependencies and are read through a hard-coded node_modules path

**Files modified:** `docs/package.json`, `docs/package-lock.json`, `docs/src/data/book-icons-css.js`
**Commit:** c3f92ae
**Applied fix:**
- Moved `@tabler/icons` and `docusaurus-plugin-llms` to `dependencies`. The lockfile was regenerated with `npm install --package-lock-only`; the only change is that the `dev: true` flags were dropped.
- `book-icons-css.js` now uses `require.resolve('@tabler/icons/outline/<icon>.svg')`.
- I adapted the reviewer's suggestion here. `require.resolve('@tabler/icons/package.json')` throws, because the package's `exports` map (`"./*": "./icons/*"`) does not expose `package.json`.
- The generated CSS is byte-identical to the old output.

**Not changed:** `_sidebar-icons.scss` still uses a relative `../../node_modules/...` `url()`. Sass `url()` cannot use Node resolution, and those rules are currently unused (see IN-03).

### WR-02: The unanchored `import/` ignore rule hides any directory named `import` anywhere in the tree

**Files modified:** `.gitignore`
**Commit:** 8bde788
**Applied fix:** `import/` is now `/import/`. Checks:
- `git check-ignore import/anything.mbz` still matches.
- `docs/static/img/import/x.png` is no longer ignored.

### WR-03: Printing in dark mode produces near-invisible code and themed blocks

**Files modified:** `docs/src/css/_print.scss`
**Commit:** e290b87
**Applied fix:** Inside `@media print`, `html[data-theme='dark'] article *` now gets `color: #000`, a transparent background and grey borders, all `!important`. Code, admonitions and tables therefore print black on white.

**Status:** fixed: requires human verification. I did not add a dark-mode case to `verify-phase1.sh`: `pdftotext` cannot see colours, so it would need a pixel-level check. Print a page from dark mode once by hand.

### WR-04: The "landing: intro-bbj card before dwc card" check actually tests navbar order

**Files modified:** `tools/verify-phase1.sh`
**Commit:** 32f6a12
**Applied fix:** The check now extracts only the `<a>` tags whose class contains `book-card`, then reads their hrefs. Against the built `index.html` it found the 2 cards in the expected order. With one `book-card` class removed, it found only 1 card, which confirms the navbar links are no longer counted.

### WR-05: The "sidebar omits other book" checks pass when the page is missing

**Files modified:** `tools/verify-phase1.sh`
**Commit:** fe14d83
**Applied fix:** Both "omits" checks now run `test -f '<page>' && ! grep -q ...`.

### WR-06: The served smoke test can pass against a foreign server, and cleanup kills whatever listens on port 3111

**Files modified:** `tools/verify-phase1.sh`
**Commit:** 1347547
**Applied fix:**
- If something is already listening on `$PORT`, the script reports a FAIL and does not start the server.
- The wait loop stops early if our own server process dies.
- `stop_server` kills only the process tree under `$SERVER_PID`, through a recursive `kill_tree` built on `pgrep -P`. It no longer kills by port.
- After the full suite ran, nothing was left listening on port 3111.

**Status:** fixed: requires human verification. This changes process-control logic. I did not test the busy-port branch directly.

### WR-07: The print check in verify-phase1.sh leaks a temp file, and on Linux it writes to the working directory

**Files modified:** `tools/verify-phase1.sh`
**Commit:** 9f9c2f3
**Applied fix:** The PDF is now written to `out.pdf` inside `mktemp -d "${TMPDIR:-/tmp}/verify-phase1.XXXXXX"`, and the script runs `rm -rf` on that directory afterwards. Explicit `X`s work with both BSD and GNU mktemp.

### IN-01: The landing page title renders as "Home | BASIS Courses"

**Files modified:** `docs/src/pages/index.js`
**Commit:** 311c39f
**Applied fix:** Removed `title="Home"`, so the page uses the site title.

### IN-02: The provenance header in custom.scss claims a straight copy, but the file has local changes

**Files modified:** `docs/src/css/custom.scss`, `docs/src/css/_content.scss`, `docs/src/css/_sidebar-icons.scss`
**Commit:** 9ac5e4f
**Applied fix:** I diffed every partial against the upstream clone. Only these three differ (apart from the header and line endings). Each header now says "and modified" and lists the changes:
- `custom.scss`: the `@use` list, the font stacks and the MUI chip rules.
- `_content.scss`: `@import` replaced by `@use`.
- `_sidebar-icons.scss`: the webforJ `.cat-icon--*` rules removed.

### IN-03: The category and experimental icon CSS is dead code

**Files modified:** `docs/src/css/_sidebar-icons.scss`
**Commit:** 5348781
**Applied fix:** I kept the rules and added a comment. It says that nothing emits `.cat-icon` or `.experimental-content` yet, that the rules are kept for chapter category icons (set through `className` in `_category_.json`), and that the two `@include`s in `_sidebar.scss` should be dropped if that plan is abandoned. I left `_sidebar.scss` alone so it stays an unmodified upstream copy.

### IN-04: The elk stub breaks any diagram that sets `layout: elk`, and the error does not say why

**Files modified:** `docs/src/plugins/mermaid-elk-stub.js`
**Commit:** d57b93c
**Applied fix:**
- Added a comment that explains this side effect of the stub.
- Added a `loadContent()` hook that scans `docs/**/*.md(x)` for `layout: elk` and fails the build with a clear error listing the files.
- Tested both ways: the real site passes, and a scratch site with an elk diagram is rejected.

### IN-05: The prism theme comment points to the wrong file for the variables

**Files modified:** `docs/src/theme/prism-dwc-theme.js`
**Commit:** f5be078
**Applied fix:** The comment now names `src/css/_prism.scss`. The header now says "and modified" and notes this change.

### IN-06: requirements.txt pins only one transitive dependency

**Files modified:** `tools/requirements.txt`
**Commit:** 0612ebd
**Applied fix:** The single comment line now states the pinning policy: direct dependencies plus `six` (needed by markdownify), not a full freeze.

I changed this approach during the run. My first commit removed `six`, but 01-01-PLAN requires exactly four pinned lines including `six`. I dropped that commit locally before it was merged, and the final commit only changes the comment.

## Skipped Issues

### IN-07: There is no social card or `themeConfig.image`

**File:** `docs/docusaurus.config.js:82-107`
**Reason:** This needs the social cover image, which Stephan supplies (see CLAUDE.md, Assets). Any fix without the asset would point to a missing file. Add `image: 'img/social-card.png'` when the asset arrives.
**Original issue:** Social cards are missing until Stephan supplies the assets.

---

_Fixed: 2026-10-03T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
