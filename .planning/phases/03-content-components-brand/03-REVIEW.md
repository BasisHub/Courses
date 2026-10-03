---
phase: 03-content-components-brand
reviewed: 2026-10-03T18:49:05Z
depth: standard
files_reviewed: 25
files_reviewed_list:
  - docs/docs/authoring/components.mdx
  - docs/docusaurus.config.js
  - docs/package.json
  - docs/src/components/DocsTools/ExpandableCode/index.js
  - docs/src/components/DocsTools/ExpandableCode/styles.css
  - docs/src/components/DocsTools/TableWrapper/index.js
  - docs/src/components/DocsTools/TableWrapper/styles.css
  - docs/src/components/YouTube/index.js
  - docs/src/components/YouTube/styles.css
  - docs/src/css/_alerts.scss
  - docs/src/css/_navbar.scss
  - docs/src/css/_print.scss
  - docs/src/prism/bbj-classes.json
  - docs/src/prism/bbj-extend.js
  - docs/src/theme/Admonition/Types.js
  - docs/src/theme/CodeBlock/index.js
  - docs/src/theme/MDXComponents.js
  - docs/src/theme/prism-include-languages.js
  - docs/static/img/basis-logo.svg
  - docs/static/img/favicon.svg
  - docs/static/img/social-cover.svg
  - tools/data/bbj-token-verification.md
  - tools/test-bbj-grammar.js
  - tools/verify-phase3.sh
findings:
  critical: 3
  warning: 10
  info: 9
  total: 22
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-10-03T18:49:05Z
**Depth:** standard
**Files Reviewed:** 25
**Status:** issues_found

## Summary

I reviewed the Phase 3 component, brand, Prism and acceptance-suite files. To get evidence, I checked them against the existing `docs/build` output (built 20:43, one minute before HEAD), the installed `@docusaurus/theme-classic` 3.10.2 sources, and a Node probe of the patched BBj grammar. I could not run `tools/verify-phase3.sh` (permission denied), so I ran each of its checks by hand with the same grep/file/python commands.

Three findings block shipping:

1. `verify-phase3.sh` cannot pass. Docusaurus never server-renders the copy button, so "Copy code to clipboard" appears 0 times in the built HTML.
2. A copied webforJ media query hides both book links in the navbar at viewport widths from 997 to 1260 px.
3. When you print a page, collapsed code blocks are cut off after about 40 lines because the print stylesheet never removes the clip.

The BBj grammar has no catastrophic-backtracking risk: every pattern is linear. It does mis-tokenize suffixed variables whose stem is a keyword, and it lets strings run across newlines. The YouTube facade meets the privacy goals: it makes no network request before the click, uses the nocookie host, and has an accessible button. However, keyboard focus is lost when the facade is activated.

## Critical Issues

### CR-01: verify-phase3 comp04 copy-button check always fails

**File:** `tools/verify-phase3.sh:75`
**Issue:** `count_is "$H" 'Copy code to clipboard' ge 4` greps the static HTML. In Docusaurus 3.10.2, `theme/CodeBlock/Buttons/index.js` wraps `CopyButton` in `<BrowserOnly>`, with the comment "Code block buttons are not server-rendered on purpose". So the string never reaches `components.html`: `grep -oF 'Copy code to clipboard' docs/build/docs/authoring/components.html | wc -l` returns `0`. The suite exits 1 on every run, and the phase gate cannot go green. This check also could never verify "copy copies everything", which is the claim it seems meant to prove.
**Fix:** Replace it with something the SSR output does contain, and leave copy behaviour to a browser test or a manual step:
```bash
count_is "$H" 'class="prism-code' ge 4 && pass "at least 4 rendered code blocks" || fail "at least 4 rendered code blocks"
# Full-text-in-DOM proxy for "copy copies all": the 41st line of the collapsed fence is in the HTML.
hasf "$H" 'line41' && pass "collapsed block keeps all lines in DOM" || fail "collapsed block keeps all lines in DOM"
```

### CR-02: Navbar hides both book links between 997 px and 1260 px

**File:** `docs/src/css/_navbar.scss:147-151`
**Issue:** `.theme-layout-navbar-left .navbar__item:nth-last-child(-n + 2) { display: none; }` comes from webforJ, where the last two left items are optional extras. Here, the built `index.html` shows that the left container's last two children are the only two book links (`BBj Basics`, `DWC`). Docusaurus switches to the mobile menu only at ≤996 px, so on common laptop and split-window widths (997 to 1260 px) the desktop navbar shows no book navigation at all. Readers lose the primary entry point to both books.
**Fix:** Delete the rule. If you need overflow handling later, write it against this site's items:
```scss
// remove entirely
@media (max-width: 1260px) {
  .theme-layout-navbar-left .navbar__item:nth-last-child(-n + 2) { display: none; }
}
```

### CR-03: Printed pages silently cut off collapsed code blocks

**File:** `docs/src/css/_print.scss:44-62` (with `docs/src/components/DocsTools/ExpandableCode/styles.css:5-17`)
**Issue:** Every fence longer than 40 lines, and every `<ExpandableCode>`, renders with `.expandable-code--collapsed`, which sets `max-height` and `overflow: hidden` on the body and adds a fade overlay. `_print.scss` overrides neither, so a printed or PDF-exported chapter loses every line after about 40 with no indication. The "Show all N lines" toggle also prints as a button. For a training book with a print stylesheet, this is content loss in the output.
**Fix:**
```scss
@media print {
  .expandable-code--collapsed .expandable-code__body {
    max-height: none !important;
    overflow: visible !important;
  }
  .expandable-code--collapsed .expandable-code__body::after,
  .expandable-code__toggle,
  .table-wrapper__expand {
    display: none !important;
  }
}
```

## Warnings

### WR-01: Keywords tokenize as keywords when they are the stem of a suffixed variable

**File:** `docs/src/prism/bbj-extend.js:58-70`
**Issue:** `variable` is inserted before `function`, which places it after `keyword`, and the keyword regex ends in `\b`. That boundary matches between a letter and `$`/`!`/`%`. Node probe results:
- `list! = new BBjVector()` gives `keyword "list"` followed by the bare text `"!"`.
- `start$`, `input$`, `to!` and `end$` behave the same way.

The added keywords (`to`, `step`, `next`, `input`, `open`, `close`, `wait`, `new`, `auto`) make this more frequent. Note: I could not re-check with `bbj_reserved_word` whether BBj accepts each of these stems as a variable name. `list!`-style object names are common in BBj samples, though.
**Fix:** Insert `variable` before `keyword`, or add a negative lookahead to the keyword pattern:
```js
Prism.languages.insertBefore('bbj', 'keyword', {
  variable: /\b[A-Za-z_]\w*[$!%]/,
});
// or: liveRegExp.source.replace(/\)\\b$/, '|' + ADDED_KEYWORDS.join('|') + ')\\b(?![$!%])')
```
Add `list!` and `input$` cases to `tools/test-bbj-grammar.js`.

### WR-02: String and mnemonic tokens run across line breaks

**File:** `docs/src/prism/bbj-extend.js:27`, `:38`
**Issue:** `/"(?:[^"]|"")*"/` uses `[^"]`, which matches `\n`. The upstream pattern used `.`, which does not. With `greedy: true`, one unbalanced quote (an incomplete snippet in a lesson, or a deliberate syntax-error example) colours every following line until the next `"`. The probe confirms this: `print "unterminated\nx$ = "a"` becomes one string token that spans both lines. The mnemonic's `\([^)]*\)` has the same problem. BBj strings cannot span lines.
**Fix:**
```js
pattern: /"(?:[^"\r\n]|"")*"/,
// mnemonic:
pattern: /'[A-Za-z0-9_]+'/,
```

### WR-03: YouTube facade drops keyboard focus on activation

**File:** `docs/src/components/YouTube/index.js:14-30`
**Issue:** When you activate the button, the component swaps the whole `<figure>` content for an iframe. The focused button unmounts, so focus falls back to `<body>`. Keyboard and screen-reader users lose their place and have to tab through the page again to reach the player. The privacy side is correct: nothing loads before the click, the embed uses `youtube-nocookie.com`, and the button has an `aria-label`.
**Fix:** Focus the iframe after it mounts:
```js
const frameRef = useRef(null);
useEffect(() => { if (playing && frameRef.current) frameRef.current.focus(); }, [playing]);
// <iframe ref={frameRef} tabIndex={-1} ... />
```
`loading="lazy"` on an iframe that is created by a user click adds nothing, and can delay playback when the facade is near the viewport edge. Drop it.

### WR-04: ExpandableCode renders an empty block for non-string children and always collapses

**File:** `docs/src/components/DocsTools/ExpandableCode/index.js:49-55`
**Issue:**
- `typeof children === 'string' ? ... : ''` swallows any child that is not a template literal. An author who writes plain MDX text or JSX between the tags gets an empty code block with no error, and the build still passes.
- The component also collapses unconditionally. A 3-line snippet shows a pointless "Show all 3 lines" toggle, and the clip and fade sit over code that is already fully visible.

YouTube throws on bad props, so this component is inconsistent with it.
**Fix:**
```js
if (typeof children !== 'string') {
  throw new Error('ExpandableCode: pass the code as a template literal, e.g. {`...`}.');
}
const code = children.replace(/\n$/, '');
const lineCount = code.split('\n').length;
if (lineCount <= previewLines) return <CodeBlock language={language} title={title} noCollapse>{code}</CodeBlock>;
```

### WR-05: TableWrapper adds an "Expand table" button to every table, which also prints and gets indexed

**File:** `docs/src/components/DocsTools/TableWrapper/index.js:31-37`
**Issue:** `table: TableWrapper` in MDXComponents wraps every Markdown table, including two-column ones that never overflow, with an always-visible "Expand table" button. The button text ends up in static HTML, so the local search index and `llms-full.txt` pick it up as content. `_print.scss` does not hide it, so it also prints. A backdrop click does not close the dialog either. Only Escape and the Close button do.
**Fix:** Hide `.table-wrapper__expand` in print (see CR-03). Consider rendering the button only when the table overflows: measure `scrollWidth > clientWidth` in a `useEffect` and keep the button state client-side. Add a backdrop-click handler (`onClick={(e) => e.target === dialogRef.current && closeDialog()}`).

### WR-06: verify-phase3 has checks that pass when nothing was checked

**File:** `tools/verify-phase3.sh:56`, `:98`
**Issue:**
- Line 56 greps `$LOG` for "No admonition component found". With `--no-build`, `$LOG` is an empty `mktemp` file, so the check always reports PASS while verifying nothing.
- Line 98 runs `grep -q authoring sitemap.xml llms.txt llms-full.txt 2>/dev/null`. If those files are missing, grep exits 2 and the `if` falls through to PASS. A plugin regression that stops writing sitemap or llms output would read as "authoring absent".
- Line 113 has the same pattern for the CDN-host check.
**Fix:**
```bash
if [ "$BUILD" -eq 1 ]; then
  if grep -q "No admonition component found" "$LOG"; then fail ...; else pass ...; fi
else echo "SKIP  [comp01] unknown admonition warning (needs build log)"; fi

for f in "$B/sitemap.xml" "$B/llms.txt" "$B/llms-full.txt"; do
  [ -f "$f" ] || { fail "missing $f"; continue; }
  grep -q authoring "$f" && fail "authoring in $f" || pass "authoring absent from $f"
done
```

### WR-07: The comp01 default-title check cannot detect a broken default

**File:** `tools/verify-phase3.sh:58`; `docs/docs/authoring/components.mdx:15`
**Issue:** The fixture's second exercise sets its explicit title to "Try it yourself", which is the same string as the default in `Admonition/Types.js:25`. If the default stopped working, the first box would fall back to some other title. The page would still contain one "Try it yourself" from the explicit title, plus a possible match from the Mermaid source `B[Try it yourself]` once it is server-rendered. The `ge 2` check therefore proves very little. The fixture also never shows a custom title.
**Fix:** Give the second exercise a distinct title (`:::exercise Change the title`). Then assert `count_is "$H" 'Try it yourself' ge 1` and `hasf "$H" 'Change the title'`, and remove "Try it yourself" from the Mermaid node text.

### WR-08: Unicode escapes in hrefs hide words from Vale

**File:** `docs/docs/authoring/components.mdx:214-215`
**Issue:** `'/docs/dwc/overview'` and `'/docs/intro-bbj/overview'` obfuscate the paths so that Vale.Terms does not flag `dwc`/`bbj`. It works, but the next author who copies a card list will either reintroduce the Vale error or copy an escape they do not understand. Grep for `/docs/dwc/` also misses these links, which matters for the redirect and link audits in this project. Hiding text from the linter is a workaround, not a fix.
**Fix:** Turn the rule off around the block (Vale 3 understands MDX comments), or ignore URL-like tokens in `.vale.ini` (`TokenIgnores = (/docs/[\w/-]+)`):
```mdx
{/* vale Vale.Terms = NO */}
<DocCardList items={[
  {type: 'link', label: 'DWC overview', href: '/docs/dwc/overview', description: 'The DWC book start page.'},
  {type: 'link', label: 'BBj Basics overview', href: '/docs/intro-bbj/overview', description: 'The BBj book start page.'},
]} />
{/* vale Vale.Terms = YES */}
```

### WR-09: _navbar.scss hardcodes colors and keeps webforJ-only selectors

**File:** `docs/src/css/_navbar.scss:43-81`, `:87-139`, `:141-145`, `:165-167`, `:170-175`
**Issue:** CLAUDE.md requires DWC tokens and no hardcoded colors. `.DocSearch-Button` and `.DocSearch-Button-Key` use about 12 literal `rgba(...)` values. Those selectors are also dead, because the site uses `@easyops-cn/docusaurus-search-local`, not DocSearch. `#webforj-version-badge`, `#startforj-link`, `.localeDropdown` and `.separator` do not exist on this site. Dead copied rules like these make CR-02-style surprises likely.
**Fix:** Delete the webforJ-only blocks (DocSearch, version badge, startforj, locale, separator, both width media queries). If you need search-button styling, target the easyops classes and use `--dwc-*` tokens.

### WR-10: Grammar test depends on an undeclared transitive package

**File:** `tools/test-bbj-grammar.js:9-10`; `docs/package.json:29-51`
**Issue:** `require.resolve('prismjs', {paths: [docsDir]})` only works because npm hoists `prismjs`, a dependency of `@docusaurus/theme-classic`. `prismjs` is not in `docs/package.json`. A change to hoisting or to Docusaurus internals breaks the grammar gate with a resolution error. The test also checks prismjs 1.30's core, while the site highlights with prism-react-renderer's bundled Prism, so a version drift between the two would go unnoticed.
**Fix:** Add `"prismjs": "1.30.0"` to `devDependencies` (exact, matching what theme-classic resolves), or resolve it through theme-classic explicitly and document the coupling.

## Info

### IN-01: The mnemonic parameter branch is dead

**File:** `docs/src/prism/bbj-extend.js:38`
**Issue:** `(?:\([^)]*\))?` sits inside the quotes. Per `tools/data/bbj-token-verification.md`, the parameters follow the closing tick (`'WINDOW'(10,10,...)`), and the probe confirms they tokenize as ordinary punctuation and numbers. The branch only adds the multi-line risk from WR-02.
**Fix:** Use `/'[A-Za-z0-9_]+'/`.

### IN-02: The class-name lookahead is case-sensitive while `boolean` is not

**File:** `docs/src/prism/bbj-extend.js:34`
**Issue:** `BBjAPI.True` gives `class-name "BBjAPI"` followed by the plain text `.True`. The upstream `boolean` regex is `/i`, but the lookahead `(?!\.(?:TRUE|FALSE)\b)` is not.
**Fix:** Use `(?!\.(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])\b)`, or build the RegExp with the `i` flag on a separate lookahead check.

### IN-03: useState called after a conditional throw

**File:** `docs/src/components/YouTube/index.js:7-14`
**Issue:** Because the function throws, this is safe at runtime, but `react-hooks/rules-of-hooks` flags it.
**Fix:** Call `useState` first, then validate.

### IN-04: Print output of the YouTube facade is inconsistent

**File:** `docs/src/css/_print.scss:55-62`; `docs/src/components/YouTube/index.js:17-29,44-50`
**Issue:** In the facade state, the consent paragraph and the "Watch on YouTube" link print next to the `__print` line, so the URL information appears twice. In the playing state, the iframe is hidden and no `__print` fallback exists, so the video disappears from the printout.
**Fix:** Hide `.youtube-facade__consent` and the anchor in print, and render the `__print` paragraph in both states.

### IN-05: The collapsed height is a magic number

**File:** `docs/src/components/DocsTools/ExpandableCode/styles.css:6`
**Issue:** `1.31em + 2rem` is relative to the wrapper font size, not the code font size and line height, and it ignores the title bar. A titled block shows noticeably fewer than 40 lines.
**Fix:** Derive the value from `--ifm-pre-line-height`/`--ifm-code-font-size`, or measure the 40th line in JS.

### IN-06: Some verify-phase3 checks are weak

**File:** `tools/verify-phase3.sh:88`, `:107`, `:114`, `:45`
**Issue:**
- `"$(date +%Y)"` anywhere in `index.html` is a near-vacuous check. Match `Copyright © $(date +%Y)` instead.
- The external `<link>` check only covers `index.html` and ignores `<script src>`.
- `$IDX` is intentionally unquoted (SC2086).
- `--no-build` accepts a stale build without a freshness check.

Portability is fine: `\|` in BRE works in macOS BSD grep 2.6 (verified locally) and in GNU grep, and nothing requires bash 4.
**Fix:** Tighten the year check, and scan all built HTML for `src="https?://` and `href="https?://` outside the canonical/alternate tags.

### IN-07: The engines field disagrees with the Node 24 policy

**File:** `docs/package.json:5-7`
**Issue:** `"node": ">=20"`, but CLAUDE.md and `.nvmrc` say Node 24.
**Fix:** Use `"node": ">=24"`.

### IN-08: Commented-out code and stray indentation in _navbar.scss

**File:** `docs/src/css/_navbar.scss:3-5`, `:98-99`
**Fix:** Remove the commented declarations and outdent the top-level rule.

### IN-09: Fenced code cannot opt out of auto-collapse

**File:** `docs/src/theme/CodeBlock/index.js:8`
**Issue:** `noCollapse` can only be set from JSX. A long fence that must stay open, for example a full listing that an exercise walks through line by line, has no Markdown-level escape hatch.
**Fix:** Also honour `metastring` containing `noCollapse` (`/\bnoCollapse\b/.test(rest.metastring ?? '')`).

---

_Reviewed: 2026-10-03T18:49:05Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
