---
phase: 03-content-components-brand
fixed_at: 2026-10-03T19:07:14Z
review_path: .planning/phases/03-content-components-brand/03-REVIEW.md
iteration: 1
findings_in_scope: 22
fixed: 21
skipped: 1
status: partial
---

# Phase 3: Code Review Fix Report

**Fixed at:** 2026-10-03T19:07:14Z
**Source review:** .planning/phases/03-content-components-brand/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 22 (fix scope: all)
- Fixed: 21 (19 own commits; IN-01 landed with WR-02 and IN-08's comment removal with WR-09)
- Skipped: 1

## Fixed Issues

### CR-01: verify-phase3 comp04 copy-button check always fails

**Files modified:** `tools/verify-phase3.sh`
**Commit:** 9e8ec23
**Applied fix:** Replaced the "Copy code to clipboard" count with `class="prism-code` (4 or more) and a `line41` check that shows all lines of the collapsed block are in the DOM. A comment explains that the copy button is client-only (BrowserOnly).

### CR-02: Navbar hides both book links between 997 px and 1260 px

**Files modified:** `docs/src/css/_navbar.scss`
**Commit:** b9c05d5
**Applied fix:** Removed the `@media (max-width: 1260px)` rule that hid the last two left navbar items.

### CR-03: Printed pages silently cut off collapsed code blocks

**Files modified:** `docs/src/css/_print.scss`
**Commit:** 92034c9
**Applied fix:** In print, the collapsed body now has `max-height: none` and `overflow: visible`. The fade, the "Show all" toggle and `.table-wrapper__expand` are hidden.

### WR-01: Keywords tokenize as keywords when they are the stem of a suffixed variable

**Files modified:** `docs/src/prism/bbj-extend.js`, `tools/test-bbj-grammar.js`
**Commit:** f949296
**Applied fix:** `variable` is now inserted before `keyword`, not before `function`. New tests cover `list!`, `input$`, `start$`, `end$` and `to!`. This change only reorders tokens. It adds no keyword or class, so no new MCP verification was needed.

### WR-02: String and mnemonic tokens run across line breaks

**Files modified:** `docs/src/prism/bbj-extend.js`, `tools/test-bbj-grammar.js`
**Commit:** 9ff379e
**Applied fix:** The string pattern is now `/"(?:[^"\r\n]|"")*"/` and the mnemonic pattern is `/'[A-Za-z0-9_]+'/`. New tests cover an unterminated string, a string on the next line and `'BOX'(1,2)`.

### WR-03: YouTube facade drops keyboard focus on activation

**Files modified:** `docs/src/components/YouTube/index.js`
**Commit:** 30860bb
**Applied fix:** A ref plus `useEffect` focuses the iframe after it mounts. `loading="lazy"` is gone. `tabIndex={-1}` was left out on purpose so the player stays in the tab order.

### WR-04: ExpandableCode renders an empty block for non-string children and always collapses

**Files modified:** `docs/src/components/DocsTools/ExpandableCode/index.js`
**Commit:** 6ba116c
**Applied fix:** The component throws on non-string children. Code at or under `previewLines` renders as a plain `CodeBlock` with no collapse shell.

### WR-05: TableWrapper adds an "Expand table" button to every table

**Files modified:** `docs/src/components/DocsTools/TableWrapper/index.js`
**Commit:** a1c3365 (print hiding in 92034c9)
**Applied fix:** The button renders client-side only, when `scrollWidth > clientWidth`, measured by a ResizeObserver. It is no longer in the static HTML, the search index or `llms-full.txt`. A click on the backdrop, outside the dialog box, closes the dialog.

### WR-06: verify-phase3 has checks that pass when nothing was checked

**Files modified:** `tools/verify-phase3.sh`
**Commit:** 42598b5
**Applied fix:** With `--no-build`, the admonition-warning check reports SKIP. Each of sitemap.xml, llms.txt and llms-full.txt must exist and is checked separately. The host check fails if there is no built HTML.

### WR-07: The comp01 default-title check cannot detect a broken default

**Files modified:** `docs/docs/authoring/components.mdx`, `tools/verify-phase3.sh`
**Commit:** bed6e7b
**Applied fix:** The second exercise now has the title "Change the title". The Mermaid node is now "Practice". The checks look for "Try it yourself" at least once (the default) and for "Change the title".

### WR-08: Unicode escapes in hrefs hide words from Vale

**Files modified:** `.vale.ini`, `docs/docs/authoring/components.mdx`
**Commit:** 0ef1fac
**Applied fix:** The fixture uses plain `/docs/dwc/overview` and `/docs/intro-bbj/overview` hrefs. The suggested `{/* vale ... */}` toggles did not work here, because `.vale.ini` maps mdx to md and TokenIgnores strips `{/* */}`. Instead, `(/docs/[\w/-]+)` was added to `TokenIgnores`. Vale on `docs/docs` still reports the same 0 errors and 9 warnings as before.

### WR-09: _navbar.scss hardcodes colors and keeps webforJ-only selectors

**Files modified:** `docs/src/css/_navbar.scss`
**Commit:** 101c4e6
**Applied fix:** Removed the DocSearch, DocSearch-Button-Key, separator, version badge, startforJ and 1450/600 px rules and the dead parts of the 996 px query. None of these selectors appear in the built HTML. Kept `.theme-layout-navbar-right` in the 996 px query. Noted the removal in the MIT header's "Local change" line. The file has no rgba or hex literals left.

### WR-10: Grammar test depends on an undeclared transitive package

**Files modified:** `docs/package.json`, `docs/package-lock.json`, `tools/test-bbj-grammar.js`
**Commit:** 042db14
**Applied fix:** Added `"prismjs": "1.30.0"` (exact) to devDependencies. The lockfile was updated with `npm install --package-lock-only --offline`; only the root devDependencies entry changed. theme-classic loads `prism-bbj` from this same package.

### IN-01: The mnemonic parameter branch is dead

**Files modified:** `docs/src/prism/bbj-extend.js`
**Commit:** 9ff379e (together with WR-02)
**Applied fix:** The mnemonic pattern is now `/'[A-Za-z0-9_]+'/`.

### IN-02: The class-name lookahead is case-sensitive while `boolean` is not

**Files modified:** `docs/src/prism/bbj-extend.js`, `tools/test-bbj-grammar.js`
**Commit:** 4d58fdf
**Applied fix:** The lookahead is now `(?!\.(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])\b)`. Tests cover `BBjAPI.TRUE`, `.True` and `.false` as `boolean`.

### IN-03: useState called after a conditional throw

**Files modified:** `docs/src/components/YouTube/index.js`
**Commit:** d560cf5
**Applied fix:** All hooks now run before the prop validation throws.

### IN-04: Print output of the YouTube facade is inconsistent

**Files modified:** `docs/src/components/YouTube/index.js`, `docs/src/css/_print.scss`
**Commit:** 8f8be3d
**Applied fix:** In print, the consent text and the "Watch on YouTube" link (new class `youtube-facade__link`) are hidden. The playing state also renders the `__print` line, and its 16:9 box is dropped in print.

### IN-05: The collapsed height is a magic number

See Skipped Issues.

### IN-06: Some verify-phase3 checks are weak

**Files modified:** `tools/verify-phase3.sh`
**Commit:** 5772f0d
**Applied fix:** The year check now matches `Copyright © YYYY`. A new check scans every built page for external `<link>`/`<script>` tags, excluding canonical and alternate. `--no-build` fails when a file under docs/docs, docs/src, docs/static or the config is newer than `build/index.html`. The unquoted `$IDX` is documented and marked with a shellcheck directive.

### IN-07: The engines field disagrees with the Node 24 policy

**Files modified:** `docs/package.json`, `docs/package-lock.json`
**Commit:** 2ebd3bc
**Applied fix:** `engines.node` is now `>=24` in package.json and in the lockfile root entry.

### IN-08: Commented-out code and stray indentation in _navbar.scss

**Files modified:** `docs/src/css/_navbar.scss`
**Commit:** 5cc176d (commented declarations removed in 101c4e6)
**Applied fix:** Outdented the top-level `[data-theme='light']` rule.

### IN-09: Fenced code cannot opt out of auto-collapse

**Files modified:** `docs/src/theme/CodeBlock/index.js`, `docs/docs/authoring/components.mdx`, `tools/verify-phase3.sh`
**Commit:** ab5da14
**Applied fix:** `metastring` containing `noCollapse` now skips the collapse. The fixture gained a 41-line ```` ```javascript noCollapse ```` fence, and the suite checks for `open41`. The existing "exactly 2 collapsed blocks" check proves that fence stays open.

## Skipped Issues

### IN-05: The collapsed height is a magic number

**File:** `docs/src/components/DocsTools/ExpandableCode/styles.css:6`
**Reason:** A correct fix needs a visual check in a browser, which this run could not do. `1.31em` is not arbitrary: it equals infima's `--ifm-code-font-size` (90%) times `--ifm-pre-line-height` (1.45), and `2rem` is 2 × `--ifm-pre-padding`. The percentage token cannot be turned into a calc factor. Moving the clip onto the `pre` would fix titled blocks, but it moves the fade overlay and the CR-03 print override, and it needs a browser check in both themes.
**Original issue:** `1.31em + 2rem` is relative to the wrapper font size and ignores the title bar, so a titled block shows fewer than 40 lines.

---

_Fixed: 2026-10-03T19:07:14Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
