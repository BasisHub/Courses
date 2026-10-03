# Domain Pitfalls

**Domain:** Moodle (.mbz) to Docusaurus 3.9 multi-book migration, DWC-Course relocation, webforJ-style tooling, GitHub Pages under `/Courses/`
**Researched:** 2026-10-03
**Overall confidence:** MEDIUM-HIGH. The items marked EMPIRICAL were checked against the real `.mbz` archives, the real `bbj-dwc-tutorial` checkout (old DWC-Course) and the published `prismjs` / `@docusaurus/*` 3.9.2 packages. Items marked DOCS come from docusaurus.io. Items marked TRAINING rest on memory and need a quick test before you rely on them.

Phase labels follow seed section 8: **P1** scaffold, **P2** hygiene + CI, **P3** DWC relocation, **P4** converter + intro-bbj, **P5** components (Prism, YouTube, exercise, search, landing), **P6** hand review, **P7** Vale, **P8** acceptance and go-live, **P9** DWC gap audit, **P10** DWC-Course redirect build and archive.

---

## Seed corrections to make first

The seed contains five statements that the evidence contradicts. Fix them in the roadmap before they cost time.

| Seed statement | Reality | Source |
|---|---|---|
| "Prism has no BBj grammar" (6.4) | `prismjs@1.30.0` ships `components/prism-bbj.js`, a minimal grammar. Old DWC-Course lists `'bbj'` in `additionalLanguages` and builds, because that is the built-in grammar. | EMPIRICAL (npm tarball, old config) |
| `<!-- TODO: screenshot outdated? -->` marker | Invalid in MDX. Docusaurus 3 parses `.md` as MDX by default, so it fails there too. Use `{/* TODO: screenshot outdated? */}`. | DOCS + EMPIRICAL |
| Internal Moodle links look like `mod/page/view.php?id=N` (6.1 step 6) | Backups encode them as `$@PAGEVIEWBYID*57@$`, `$@COURSEVIEWBYID*4@$#section-1`, sometimes with a `&forceview=1` suffix. Zero `view.php` links were found. | EMPIRICAL (course 4: 3 hits in `book_56`, `page_62`) |
| Only `@@PLUGINFILE@@` needs resolving (6.1 step 1, acceptance grep) | Course 4 section summaries contain absolute `https://moodle.basis-europe.eu/pluginfile.php/313/course/section/9/...png` URLs (2 files). Their component is `course` / `section`, which the seed's mapping does not list. | EMPIRICAL |
| Custom `:::exercise` needs only `docs.admonitions.keywords` (6.3) | Docusaurus also needs `src/theme/Admonition/Types.js` mapping the keyword to a component. There is no default fallback for unknown types. | DOCS |

---

## Critical Pitfalls

Mistakes that cause rewrites, broken public links, or a build that cannot pass the acceptance gate.

### Pitfall 1: HTML comments in MDX, and the wrong replacement per file type
**What goes wrong:** `<!-- TODO: screenshot outdated? -->` makes the MDX compiler throw ("Unexpected character `!` before name"). The build fails on the first flagged page.
**Why it happens:** MDX 2/3 parses `<` as JSX. HTML comments are not JSX. `markdown.format` defaults to `'mdx'`, so `.md` files are MDX too. Only `format: 'detect'` makes `.md` plain CommonMark, and then `{/* */}` would render as visible text instead. The old DWC-Course config does not set `format`, so its `.md` files are MDX. The one `<!--` in its docs sits inside a code fence, which is safe.
**Consequences:** Build break. Or, if someone "fixes" it with `format: 'detect'`, visible `{/* ... */}` junk in `.md` pages.
**Prevention:**
- Marker form: `{/* TODO: screenshot outdated? */}` on its own line, directly after the image paragraph, with a blank line on each side. It emits no DOM.
- Do not set `markdown.format: 'detect'`. Keep the default `mdx` so one comment syntax works in `.md` and `.mdx`.
- Make the converter emit the marker. It must also reject any `<!--` that reaches the output outside a fence (Moodle's editor and Word paste can leave them). Count them in the report.
- Add `TokenIgnores = (\{/\*.*?\*/\})` to `.vale.ini` so Vale does not lint the marker text.
- Add `grep -rn "TODO: screenshot outdated" docs/docs` to `docs/ROADMAP.md` as the re-capture worklist.
**Detection:** `Unexpected character '!' (U+0021) before name` in the build log. `{/*` visible in a rendered page.
**Phase:** P4 (converter emits it), P5 (config check), P6.

### Pitfall 2: The 2022 screenshot flag cannot be derived from DWC-Course filenames
**What goes wrong:** The rule "flag images whose original filename has a 2022 timestamp" works for Moodle-derived intro-bbj images. DWC-Course already renamed its images to CamelCase (`Eclipse-RunBUIProgram.png`), so the timestamps are gone. Most DWC screenshots would silently go unflagged.
**Why it happens:** The old site is a rewrite, and the timestamp lived only in the Moodle filenames (for example `Google Chrome - myApp- screenshot 2022-06-27 at 15.49.33.png` in course 4).
**Prevention:** Match by content. A Moodle `contenthash` is the SHA-1 of the file bytes, so `sha1sum` every file in DWC-Course `static/img/`, join against `files.xml` of course 4, and flag any hit whose Moodle filename matches `20\d\d-\d\d-\d\d`. Do the join in P9, or in P3 if you want flags at go-live. Compute the flags before the kebab-case rename and store them in the mapping table.
**Detection:** Zero flags in the DWC book after the sweep is a red flag.
**Phase:** P3 (rename mapping), P9 (join).

### Pitfall 3: Meta-refresh redirect build for DWC-Course loses fragments, 404s, and the archive trap
**What goes wrong:** Several separate failures.
- Old URLs are not a 1:1 prefix swap. The new URL for old `/DWC-Course/gui-to-bui-to-dwc` is `/Courses/docs/dwc/gui-to-bui-to-dwc`. Old `/` goes to `docs/dwc/overview`. The old `index.md` is now `overview.mdx`, `prerequisites` is `00-prerequisites`, and `search` has no counterpart. Also check `/gui-to-bui-to-dwc/gui-to-bui-to-dwc` (the sub-page that shares its folder's name), which exists today.
- `<meta http-equiv="refresh">` drops `#anchor` fragments. Deep links to sections land at the top.
- A stub site has no 404 handling. Unknown old paths get GitHub's generic 404.
- If you archive the repo before the redirect build deploys, nothing can ever run again. Archived repos are read-only and their workflows cannot run. The old site would then keep serving the stale DWC-Course.
- Google treats a 0-second meta refresh as a redirect and uses the canonical link. But the host (`basishub.github.io`) is unchanged, so there is no Search Console change-of-address option. Transfer is slow.
**Prevention:**
- Generate the route list from the old `build/sitemap.xml` (28 entries today, EMPIRICAL) plus `404.html`. Write an explicit old-to-new map, committed as a table, and test every row with `curl -sI` after deploy.
- Each stub: `<meta http-equiv="refresh" content="0; url=NEW">`, `<link rel="canonical" href="NEW">`, a visible fallback `<a>`, plus a tiny script `location.replace('NEW' + location.hash)` so anchors survive. Do not add `noindex`.
- Emit stubs as `route/index.html` (served at `/route` and `/route/`). The old site emitted `route.html` files plus folders. Keep both `/x` and `/x/` working.
- Add a `404.html` that sends unknown paths to the Courses landing page, not a blank page.
- Keep the old `sitemap.xml` listing the old URLs so crawlers revisit them.
- Order: deploy the redirect build, verify the live redirects, update the README, then archive. Never in the other order.
- Target URLs use `trailingSlash: false` form with no trailing slash (see Pitfall 11).
**Detection:** A redirect map row that 404s; fragments dropped; Pages deployment failing after archive.
**Phase:** P10. Capture the old `sitemap.xml` and `build/` before P3 changes anything, because P3 is when URL knowledge starts to drift.

### Pitfall 4: Sidebar ordering and the book-level `_category_.json` do not behave as the seed assumes
**What goes wrong:**
- Unnumbered files (`overview.mdx`, `samples.mdx`, `resources.mdx`) get no position. Autogenerated sidebars sort them after all numbered siblings. The "overview" page lands last, not first. The seed layout has exactly this problem.
- A sidebar defined as `{type: 'autogenerated', dirName: 'dwc'}` renders the folder's children. The `_category_.json` in `docs/docs/dwc/` (label, `cat-icon` className, link to overview) is never rendered as an item, so the book-level icon does not appear.
**Prevention:**
- Name the files `00-overview.mdx`, `00-prerequisites.mdx` and number `samples`/`resources` (for example `98-samples.mdx`, `99-resources.mdx`) so numeric prefixes keep working with no front matter positions. Docusaurus strips the prefix from the URL, so URLs stay `/overview`, `/prerequisites`.
- Decide the book wrapper once: either each sidebar is `[{type: 'category', label, className: 'cat-icon cat-icon--dwc', link: {type: 'doc', id: ...}, items: [{type: 'autogenerated', dirName: 'dwc'}]}]`, or icons live only on the landing-page cards. Test the first page in P1 or P5 with two stub books.
- Verify the `id` format in `link: {type: 'doc', id}` empirically: with multi-folder docs it is path-based and prefix-stripped. Check how it resolves instead of assuming.
- When a chapter has both `index.md` and a same-named sub-page (`01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md`), keep the order test. The old site resolves it fine, but make the sidebar diff a build check.
**Detection:** Overview page last in the sidebar; icons missing; "sidebar order matches old site" acceptance fails.
**Phase:** P1 (decide shape on stubs), P3, P8.

### Pitfall 5: Custom admonition without the theme component
**What goes wrong:** `:::exercise` is registered in `docs.admonitions.keywords` but nothing renders it, because there is no default fallback. The seed leaves out `src/theme/Admonition/Types.js`.
**Prevention:**
- Add `src/theme/Admonition/Types.js` that spreads the default types and adds `exercise: ExerciseAdmonition`. Build `ExerciseAdmonition` on `@theme/Admonition/Layout`, with the "Try it yourself" default title and an icon.
- `extendDefaults` is `true` by default, so you do not need to relist `note|tip|info|warning|danger`.
- Style by the class the component sets (for example `alert--exercise` in `_alerts.scss`). It does not exist unless you create it.
- Write exercise bodies with blank lines after `:::exercise ...` and before the closing `:::`. Inside `<details>`, put blank lines around the fence content or the Markdown inside is treated as raw text.
**Detection:** Exercise pages render as plain text containing `:::exercise`, or the build errors on an unknown type.
**Phase:** P5.

### Pitfall 6: MDX v3 strictness hits converted prose and tables
**What goes wrong:**
- `{` and `}` in prose (BBj `{` is rare, but code-like text and JSON show up).
- Any `<` not followed by a letter: BBj `<>` (not equal) parses as an empty JSX fragment; `<=`, `a<5`, `x < y` throw "Unexpected character before name".
- `markdownify` emits autolinks as `<https://...>` when link text equals the href (its `autolinks` option defaults to on). MDX does not support `<url>` autolinks. This is the most likely source of mass failures, because Moodle pages contain bare URLs.
- Raw HTML kept for tables (6.1 step 7) must be valid JSX: void tags need self-closing (`<br />`, `<img />`, `<col />`), `class` and `style="..."` string attributes break or misbehave, and `<o:p>`/`<font>` leftovers from Word paste do not parse.
- `<youtube>` placeholder: if the post-pass does not convert it to `<YouTube ... />` exactly, the lowercase tag becomes an unknown element.
- `markdownify` escapes `_` and `*` in text (`my\_var!`). It is harmless in rendering, but ugly and unfriendly to Vale spelling. Never run your own `{`/`<` escaping inside inline code spans, or the backslash shows literally.
**Why it happens:** MDX is JSX plus Markdown. The Docusaurus docs say to escape `{` and `<` with a backslash (`\{`, `\<`). CommonMark habits do not carry over.
**Prevention:**
- Converter options: `autolinks=False`, ATX headings (`heading_style='ATX'`), `escape_underscores=False` for prose you control (re-escape selectively), `strip` unknown tags, and a final post-pass.
- The post-pass tokenises the Markdown (fence, inline code, text) and only escapes `{`, `}` and `<` in text tokens. Use `&lt;` or `\<`, not `\{` inside code.
- Serialise leftover HTML tables through lxml's XML serializer so tags self-close, rename `class` to `className`, and drop `style`. Prefer GFM when there is no rowspan/colspan (only 1 `<table>` exists in course 4).
- A hard gate in the converter: after generating each file, compile it with `@mdx-js/mdx` (or run `docusaurus build` on a single book) and fail the run on any error. Do not rely on the full-site build to find them one at a time.
- Check there are zero `<br>` left, since course 2 has 148 and course 4 has 1,064 escaped `<br` occurrences.
**Detection:** `Unexpected character`, `Expected a closing tag for <br>`, `Could not parse expression with acorn` in the build log.
**Phase:** P4.

### Pitfall 7: Moodle backup references the seed does not handle
**What goes wrong:** The converter reports "all unresolved counts zero" while links and images are silently wrong, because the unresolved-counter only searches for patterns the seed lists.
Observed in the real archives (EMPIRICAL):
- Course 4 section summaries (component `course`, filearea `section`, 14 files) use absolute `https://moodle.basis-europe.eu/pluginfile.php/313/course/section/<n>/<name>` image URLs, not `@@PLUGINFILE@@`.
- Internal links are `$@PAGEVIEWBYID*57@$`, `$@COURSEVIEWBYID*4@$#section-1` (fragment after the token), and `$@PAGEVIEWBYID*57@$&forceview=1`. A regex that expects `?id=` finds none and passes.
- `$@NULL@$` appears 127 and 229 times in the XML. It is Moodle's null encoding for metadata fields (idnumber and similar), not content. Do not treat it as a link token, but make sure a grep for `\$@` in the output reports zero.
- Same file in many contexts: course 4 has 226 `files.xml` entries, 17 are directory markers (`filename` = `.`), 16 filenames appear more than once, and 18 contenthashes occur more than once (same bytes referenced by several pages or the section summary). The same filename can map to different bytes: `image.png` and `image (1).png` appear in course 2, and 2 filenames in course 4 have different hashes in different places.
- Moodle pasted-image names (`image.png`, `image (1).png`) carry no meaning. Kebab-casing them gives `image-1.png` and an alt text of "image 1".
**Prevention:**
- Resolve files by `(contextid, component, filearea, itemid, filename)` for each module, never by filename alone. Copy by contenthash, then write per-page names.
- Dedupe in the report, not in the filenames: the same bytes can be copied once per page folder.
- Extend the acceptance grep and the converter's unresolved counter to cover `PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|mod/(page|book)/view`.
- Map `$@PAGEVIEWBYID*N@$` and the book equivalents through the module-id map, keep a trailing `#fragment`, and drop `forceview`.
- For meaningless image names, generate a name from the surrounding heading (`tic-tac-toe-board.png`) or from a manual mapping file, and require a hand-written alt. Do not use the filename as alt for these.
- Keep a committed `import/image-map.csv` (old name, hash, new name, page, flagged-2022 yes/no).
**Detection:** Images render in preview but show moodle.basis-europe.eu in the Network tab. Alt text such as "image 1".
**Phase:** P4, with the gap audit (P9) reusing the same resolver.

### Pitfall 8: Entities, NBSP and typography left in code
**What goes wrong:** Code blocks contain `&lt;`, `&gt;`, `&amp;`, `&quot;` text, non-breaking spaces or curly quotes, so `bbj_check_syntax` fails on pasted code and readers see `&lt;` on screen.
**Why it happens:** Moodle stores content XML-escaped, and the HTML inside is escaped once more. EMPIRICAL counts from the XML: course 4 has `&amp;lt;` 74 times, `&amp;gt;` 91, `&amp;quot;` 1,096, `&amp;nbsp;` 1,102; course 2 has `&amp;nbsp;` 99. After XML decoding, these are correct HTML entities. The danger is decoding twice (once by the XML parser, once more by a regex "cleanup"), or decoding zero times when someone reads the file as text and not through an XML parser.
**Prevention:**
- Parse `book.xml` / `page.xml` with an XML parser (one decode), then parse the result with an HTML parser (second decode). Never run `html.unescape` on top of that.
- After conversion, in fences: replace U+00A0 with a space, normalise `\r\n`, replace curly quotes and en/em dashes with ASCII, and assert there is no `&(lt|gt|amp|quot|nbsp|#\d+);` left. Make this assertion part of the converter report ("entities in fences: 0").
- Outside fences, convert NBSP to a normal space, except where it prevents a bad line break in a unit.
- Add a script that compiles every `.bbj` block through the BBj syntax check before they land in `examples/`. It catches NBSP and smart quotes immediately.
**Detection:** `&lt;` visible on a page; syntax check errors on otherwise-correct code.
**Phase:** P4, P6.

### Pitfall 9: Image renaming breaks references and fails only on CI
**What goes wrong:**
- The DWC pages use `require('@site/static/img/Foo.png')`. The rename to colocated `./img/foo.png` needs every reference rewritten. A missed one makes `onBrokenMarkdownImages` throw, which is good. But raw `<img src="/img/x.png">` in MDX is not prefixed with `/Courses/` and is not checked by the same hook.
- macOS APFS is case-insensitive by default. A file that exists as `Foo.PNG` locally and is referenced as `foo.png` works on your Mac and fails on Linux CI. A case-only rename (`Logo.png` to `logo.png`) is invisible to git without a two-step `git mv`.
- The same image used by two chapters cannot be colocated once, so the move must either copy it or use `../`.
- 2022 flags and the mapping table (Pitfall 2) are lost if you rename before you record the map.
**Prevention:**
- Build the mapping table first (`old path`, `new path`, `sha1`, `used in`) and commit it in the commit message as the seed requests. Rewrite references by script from that table, then grep for `static/img`, `IdealImage` and `require(`.
- Lowercase extensions, always `git mv`, and do any case-only rename as `git mv a.PNG tmp && git mv tmp a.png`.
- CI is the case-sensitivity check. Run the PR build gate on `ubuntu-latest` from the first commit.
- Forbid raw `<img>` in content (CLAUDE.md says Markdown images). Add a grep for `<img ` in `docs/docs`.
**Detection:** Works on `npm start` locally, fails in CI. A 404 on an image in production only.
**Phase:** P3, P4.

### Pitfall 10: `onBrokenAnchors: 'throw'` surprises
**What goes wrong:** Anchors that worked in the old site break after conversion.
- Heading IDs are generated from text. Duplicate headings on one page get `-1` suffixes, so repeated "Exercise" or "Next steps" headings produce unstable IDs.
- Demoting headings (H1 to H2) does not change IDs, but changing heading text during the Vale pass does. Vale fixes in P7 (for example removing "very" or an em dash from a heading) silently break any `#anchor` that points to it.
- Links to anchors on other pages are checked too. A converted Moodle link `...#section-1` points to a Moodle section that now is a folder. It has no anchor and throws.
- `onBrokenAnchors` was added in a recent 3.x and its behaviour is per-page. If the webforJ `Heading` override changes how IDs or anchor links are generated, check the combination in P1.
**Prevention:**
- Prefer links to pages, not headings, in converter output. Resolve `#section-N` to the section's first page or generated index.
- Give explicit IDs to headings that are anchor targets (`## Title {#id}` is valid Docusaurus heading syntax), and avoid renaming them in the Vale pass.
- Run the full build after every Vale batch, not only at the end.
**Detection:** `Docusaurus found broken anchors!` at build.
**Phase:** P4, P7.

### Pitfall 11: `baseUrl`, `trailingSlash: false` and absolute paths on GitHub Pages
**What goes wrong:**
- Docusaurus docs say GitHub Pages adds a trailing slash by default and recommend setting `trailingSlash` explicitly. With `false` the build writes `page.html` files. GitHub Pages serves `/page`, but `/page/` returns 404 (the old DWC-Course already works this way, EMPIRICAL: `build/upgrading-apps.html` plus `build/upgrading-apps/`). Reports exist of directory-style pages 404ing in this configuration. Every internal link and every external redirect target must use the no-slash form.
- Absolute paths in places Docusaurus does not rewrite: raw `<img src="/img/...">`, `<a href="/files/x.zip">` inside raw HTML, SCSS `url(/img/...)` (css-loader leaves absolute `/` URLs alone), and `headTags` entries. All 404 under `/Courses/`. (How `scripts: ['/js/...']` is treated: TRAINING, test it.)
- `baseUrl` is case-sensitive: `/Courses/`. `url` is lowercase `https://basishub.github.io` with no trailing slash; `organizationName: 'BasisHub'` keeps its capitals.
- `/Courses/docs` (the `routeBasePath` root) has no page and returns 404. Do not link to it, and do not make the navbar "Docs" item point there.
- Dev (`npm start`) hides some of these. `npm run serve` on the production build exposes them.
**Prevention:**
- Use `useBaseUrl` for assets in JSX, Markdown images and links for content, and relative `url(...)` or webpack-resolved assets in SCSS. Audit the copied webforJ partials (`_sidebar-icons.scss`, `_category.scss`, fonts) for absolute `url(/...)`.
- Make P2 prove a deployed page at a nested route loads with CSS, JS, favicon, theme switcher and an image under `/Courses/`, and that a hard refresh on a deep URL works.
- Decide links to downloadable files once: `/files/<book>/<name>` as a Markdown link. Confirm the broken-link checker accepts it, and that `.bbj` and `.zip` downloads work (browsers may display text files instead of downloading, so add the `download` attribute via a small component if wanted).
- If a custom domain arrives later, `baseUrl` change is a one-line change only if nothing hardcodes `/Courses/`. Grep for `Courses/` in `docs/` source.
**Detection:** Blank page or unstyled page on Pages only; 404 on `/x/`.
**Phase:** P1, P2, P8.

### Pitfall 12: Vale sections silently skip `.mdx` files
**What goes wrong:** webforJ's `.vale.ini` maps MDX to Markdown (`[formats]`) but applies its main rule block to `*.{md,txt}`. A section glob matches on file name, so `.mdx` files get no styles. Since the new site is mostly `.mdx`, Vale reports "0 issues" on content it never checked, and the "clean Vale pass" acceptance criterion is meaningless.
**Prevention:**
- Change the glob to `[*.{md,mdx,txt}]`. Prove it with a deliberate violation (an em dash) in a throwaway `.mdx` file and confirm that reviewdog flags it.
- Keep `Vocab = BASIS` identical in case to the folder `.github/.styles/config/vocabularies/BASIS/`. Linux CI is case-sensitive.
- Vale reads front matter `title` poorly and JSX attributes not at all. Check `description:` strings by hand.
- `Google.Acronyms` and `Google.Headings` keep their own exception lists inside the style files. A vocabulary file does not feed them (TRAINING, verify). Add `DWC`, `BUI`, `ARC`, `BBj`, `SysGui`, `UI` to those exception lists or set the rules to a lower level for this repo.
- Add all BBj API identifiers that appear in prose without backticks to `accept.txt`, or wrap them in backticks (Vale skips inline code and fences). Prefer backticks: they also fix MDX rendering.
- Keep `AIArtifacts`, `AIDisclaimer`, `AIVocab` out unless wanted (seed 3.1). Check the dropped rules do not leave dangling references in `.vale.ini`.
**Detection:** Zero findings on a first run over raw imported Moodle prose (the seed itself expects many).
**Phase:** P2 (config and proof), P7.

### Pitfall 13: Prism: the seed's custom-language plan collides with the built-in grammar
**What goes wrong:**
- Docusaurus 3.9.2 `prism-include-languages` does `require('prismjs/components/prism-${lang}')` with no try/catch for every `additionalLanguages` entry. A name with no Prism component throws at build ("Cannot find module"). `'bbj'` works today only because Prism ships it. Any typo or a made-up alias (`'bbjx'`, `'basis'`) crashes the build.
- Listing `'bbj'` in `additionalLanguages` loads the built-in minimal grammar. Your custom `src/prism/bbj.js` then has to overwrite `Prism.languages.bbj`. If the swizzled file does the assignment before the loop, the built-in overwrites yours.
- Importing `prismjs` directly in `src/prism/bbj.js` gives you a different Prism instance from prism-react-renderer's. The grammar registers but never highlights. Register on the `PrismObject` argument.
- Token names that `prism-dwc-theme` does not style (for example a custom `label` or `variable` token) render uncoloured. The theme only knows standard types.
- The built-in grammar misses `$` and `!` variable suffixes, labels, `#` fields, `class`/`method` structures and `;rem`. Its keyword list also contains items such as `begin`, `day`, `tim`, `sys` that are wrong to colour in prose-like snippets. Verify against `bbj_reserved_word` as the seed says.
- Magic comments (`// highlight-next-line`) do not exist for `rem` comments. Do not promise line highlighting in BBj fences without configuring `magicComments`.
**Prevention:**
- Swizzle once: `docusaurus swizzle @docusaurus/theme-classic prism-include-languages --eject`. In the swizzled file, run the standard loop first, then `import './bbj'`-style registration that assigns `PrismObject.languages.bbj = {...}` (after, so it wins). Keep `'bbj'` out of `additionalLanguages` once the custom file is the source, so there is no ambiguity. Either approach works; pick one and write it in `CLAUDE.md`.
- Use only standard token names in the grammar (`comment`, `string`, `number`, `keyword`, `function`, `variable`, `operator`, `punctuation`, `class-name`, `boolean`). Map extras to those.
- Test fixture: one page in P5 with BBj, CSS, HTML, JS fences in light and dark mode. Keep it as a regression check.
**Detection:** BBj code renders in one colour or the build says "Cannot find module 'prismjs/components/prism-xyz'".
**Phase:** P5.

---

## Moderate Pitfalls

### Pitfall 14: Numeric-prefix stripping and slug collisions
**What goes wrong:** `01-first-hello-world.mdx` and `02-first-hello-world.mdx` in one folder both become `/first-hello-world`: a duplicate-route error or a silent overwrite. `03a-string-operations` is not stripped, because the default parser only recognises digits followed by `-`, `_` or `.`, so its URL keeps the `03a-` (the seed says to use that pattern for sub-chapters). `90-exercise-...` becomes `/exercise-...`, so two exercises with the same slug in one folder collide. Stripped prefixes also change old URLs: `00-prerequisites` becomes `/prerequisites`.
**Prevention:**
- Generate slugs deterministically from titles, assert uniqueness per folder in the converter, and fail the run on a collision.
- For sub-chapters, choose one pattern and test the URL: either numbers only (`04-string-operations`) or accept `03a-` in the URL. Do not mix them.
- Give exercises distinct names (`90-exercise-tic-tac-toe`).
- Compare the `sitemap.xml` of the new build against the redirect map (Pitfall 3) in CI.
**Detection:** `Duplicate routes found!` warning at build time; wrong URL in the sidebar.
**Phase:** P4.

### Pitfall 15: `<br>` runs and nested spans produce broken Markdown
**What goes wrong:** Course 2 has 148 and course 4 about 1,064 `<br` tags in escaped HTML, plus 213+ `<span` openers. `markdownify` turns `<br><br>` into a hard break followed by another, not a paragraph break. `<span style>` wrappers around bold or inline code split emphasis (`**` + space + `**`). A bold run broken by a span becomes `**foo** **bar**`. Lists nested in `<br>`-delimited lines never become lists.
**Prevention:**
- Pre-process the DOM in this order: unwrap style-only spans, merge adjacent identical `<strong>`/`<em>`, split `<p>` at `<br><br>`, convert lines starting with `1.`/`-`/`•` into lists, then run markdownify.
- Trim whitespace inside emphasis (`**foo **` is invalid emphasis).
- Check three hand-picked pages after the first run (a text-heavy one, a list-heavy one, a table page) and keep them as the golden samples for re-runs.
**Detection:** Doubled `**`, stray `\` at line ends, blank paragraphs.
**Phase:** P4, P6.

### Pitfall 16: Code language heuristic misclassifies
**What goes wrong:** The seed's heuristic (`print`, `use `, `declare`, ...) misfires on CSS or JavaScript that happens to contain those words, and a one-line BBj call is tagged `bash`. There are 86 plain `<pre>` and 3 `<pre style>` blocks in course 4. Misclassification mostly shows as wrong colouring, but a block tagged `html` that contains `{` is also fine in MDX only because it is in a fence.
**Prevention:** Run the heuristic, write the result to a review file (`import/pre-classification.csv`: page, first line, assigned language, confidence), review it by hand, and feed corrections back as an override map. Prefer `text` over a wrong tag. The seed says every fence needs a language, so `text` satisfies the rule.
**Phase:** P4, P6.

### Pitfall 17: `ExpandableCode` wrapping breaks the fence
**What goes wrong:** `<ExpandableCode>` around a fence needs blank lines before and after the fence, no indentation, and the component must be registered in `MDXComponents`. Moving code inside JSX changes how MDX parses the fence if the blank lines are missing. The 40-line collapse rule also hits examples that must be copied whole.
**Prevention:** Emit exactly `<ExpandableCode>`, blank line, fence, blank line, `</ExpandableCode>`. Compile-check in the converter (Pitfall 6). Use a `title` for the collapsed state so a reader knows what hides inside.
**Phase:** P4, P5.

### Pitfall 18: `onBrokenMarkdownLinks` config placement
**What goes wrong:** In 3.9 the top-level `onBrokenMarkdownLinks` is deprecated in favour of `markdown.hooks.onBrokenMarkdownLinks`. The old DWC-Course config sets it to `'warn'` in `hooks`, so a copied block can leave the gate at `warn`, and a missing image or link passes. `onBrokenMarkdownImages` exists in the 3.9.2 hooks type (EMPIRICAL).
**Prevention:** In P1, set all of `onBrokenLinks`, `onBrokenAnchors` and the two hooks to `'throw'`. Prove each one with a deliberately broken link, anchor, Markdown link and image in a scratch page, and record that the build fails. Note that npm now lists Docusaurus 3.10.2 as `latest` (EMPIRICAL). Pin the version webforJ uses and do not float with `^` on the first install without a lockfile, so config keys do not move under you.
**Phase:** P1, P8.

### Pitfall 19: `docusaurus-plugin-sass` with the webforJ partials
**What goes wrong:**
- The partials use Sass module syntax and mixins in `mixins/`. Copying only some of them breaks `@use` resolution. The seed's skip list (`_blog`, `dwc-doc-components`) must also be removed from `custom.scss`'s `@use` list, or the build fails on a missing partial.
- Rules left over for dropped features (`.MuiChip-root`, blog, DocChip, Ask AI, gallery) stay as dead CSS. Selectors for removed theme parts do no harm, but `@use` of a removed partial fails.
- Dart Sass prints many deprecation warnings (`@import`, mixed declarations) during build. They are noise, not failures. Do not let them hide a real error: filter them in CI logs only when you know they are the known ones.
- The `sass` package is a peer of the plugin. Install both with versions the plugin supports.
**Prevention:** Copy the partials as a set, delete the `@use` lines for skipped ones in one commit, and build immediately. Keep a one-line file header "From webforj/webforj-documentation (MIT)" on each copied file (Pitfall 23).
**Phase:** P1.

### Pitfall 20: Third-party CDNs in a German-hosted public site
**What goes wrong:** `dwc-ui.css` is loaded from `https://cdn.webforj.com/next/dwc-ui.css`. The `next` channel moves, so a webforJ release can change the look of every page overnight, and the site fails if the CDN does. Google Fonts loaded from Google's servers is a GDPR risk in Germany (courts have ruled against dynamic Google Fonts embedding). The YouTube embed is already privacy-enhanced, but the Inter and JetBrains Mono links are not.
**Prevention:** Self-host Inter and JetBrains Mono (fontsource packages or files in `static/`), pin the `dwc-ui.css` version in the URL (or vendor the file), and record the decision in `docs/ROADMAP.md`. Lazy-load the YouTube iframe behind a click-to-load poster if the privacy bar needs it.
**Confidence:** MEDIUM on the legal side (TRAINING, ask the owner), HIGH on the pinning concern.
**Phase:** P1.

### Pitfall 21: Local search and the multi-book setup
**What goes wrong:** `@easyops-cn/docusaurus-search-local` must match `routeBasePath: 'docs'` (`docsRouteBasePath`) and should set `indexBlog: false` since there is no blog. With the plugin's hashed index it only works on a production build, so it looks "broken" under `npm start`. The old repo's `/search` route disappears, and `/search` is in the old sitemap.
**Prevention:** Test search against `npm run serve`, set the options explicitly, and include `/search` in the redirect map.
**Phase:** P5, P10.

### Pitfall 22: `docusaurus-plugin-llms` and `plugin-client-redirects` produce wrong output quietly
**What goes wrong:** `llms.txt` and `llms-full.txt` include every page, including generated-index pages and any draft exercise stubs, and use `url + baseUrl`. If `baseUrl` is wrong the links in them are wrong. `plugin-client-redirects` fails the build if a `to` route does not exist, so the later "rename a chapter" workflow only works when `redirects` is updated in the same commit.
**Prevention:** Check the generated `llms.txt` links in the P2 deploy. Document "rename means add a redirect" in `CLAUDE.md`.
**Phase:** P2, P8.

### Pitfall 23: Copying MIT files without the notice
**What goes wrong:** MIT requires the copyright and permission notice in "all copies or substantial portions". The webforJ repo's licence is "Copyright (c) 2022 webforJ" (EMPIRICAL). A repo that copies SCSS, theme overrides, workflows and the Vale style folder, but has only its own licence, does not comply. Some webforJ assets (logos, brand images, documentation text) may not be covered by the code licence.
**Prevention:**
- Add `THIRD_PARTY_NOTICES.md` at the repo root with the full MIT text and the copyright line, plus the list of copied paths and the source commit hash.
- Keep any licence header already in a copied file. Add a one-line "Adapted from webforj/webforj-documentation (MIT)" comment on each copied SCSS/JS file.
- Do not copy webforJ logos, `webforj.svg`, `social-cover.png`, or doc text/images. The seed already asks for BASIS-level assets.
- The old DWC-Course `samples/` has its own LICENSE; carry it into `docs/examples/dwc/` and `static/files/dwc/` as the seed says. Check that the Moodle-derived intro samples have a stated licence or an owner decision.
**Phase:** P1, P2.

### Pitfall 24: Large archive and personal data in git
**What goes wrong:**
- The 17 MB course-4 archive (EMPIRICAL: 17,483,247 bytes) committed once stays in history forever. Even if deleted later, clones carry it. Git LFS has pitfalls of its own: GitHub Actions `checkout` does not fetch LFS objects unless `lfs: true`, free quota is limited, and forks lose access.
- Moodle archives hold more than course text: `users.xml` (absent here, with `-nu`), `roles.xml`, `groups.xml`, `grade_history.xml`, `questions.xml`, `moodle_backup.xml` (site URL, creator names), `completion.xml`. Course 2 (243 KB) would go into a public repo. Check for emails, teacher names, internal URLs and copyright of third-party material before committing it.
- `import/unpacked/` is large and noisy. The seed adds it to `.gitignore` only "after the first successful run".
**Prevention:**
- Add `import/unpacked/` and `import/*course-4*.mbz` to `.gitignore` in P1, not later. Store the large archive as a GitHub Release asset or on the BASIS file share, and record the location and SHA-256 in `import/README.md`. Skip LFS: the file is read once for the audit.
- Before committing course 2, run `tar -tzf` and grep for `@` addresses and names in `moodle_backup.xml`, `roles.xml`, `groups.xml`. If anything personal shows up, commit only the converter output and keep the archive private.
- `dwc-gap-audit.md` quotes Moodle text. It is as public as the site itself, so it needs the same review.
**Phase:** P1, P4, P9.

### Pitfall 25: Gap audit scope and timing
**What goes wrong:** The decision is to audit before go-live (PROJECT.md), but the seed says "after". If the audit is scheduled after P8, public go-live ships the thin version and the audit PRs reshuffle URLs and anchors that external people already linked. The audit also adds images (more renames, more 2022 flags) and Vale findings late.
**Prevention:** Put P9 before the public announcement and before P10. P10 (redirect build) freezes URLs, so any new DWC pages must exist before the redirect map is cut. Treat the audit output as new pages in the existing numbering, with no renames of existing slugs. Re-run the sidebar-order and anchors checks after each audit commit.
**Phase:** P9 before P10.

---

## Minor Pitfalls

### Pitfall 26: `.md` to `.mdx` renames in the DWC relocation
Renaming `index.md`, `prerequisites.md`, `samples.md`, `resources.md` to `.mdx` while "no content edits" muddies the pure-relocation commit. They need no JSX. Keep them `.md` in P3 (MDX still applies, Pitfall 1), rename later if a component is needed. `git mv` keeps history either way.

### Pitfall 27: Hidden and skipped modules leak
Forum, Feedback, Announcements and `visible=0` modules must be skipped by `module.xml` `<visible>`, not by name. Section `<visible>` must be checked too, and `book.xml` chapters with `<hidden>1`. Report skipped modules with the reason (the seed already asks for it). Check that a hidden label does not sneak in through `sequence`.

### Pitfall 28: Section order from the wrong source
Order must come from `section.xml` `<sequence>`, not directory order. Missing ids, empty sections and modules listed in the sequence but absent from `moodle_backup.xml` are possible. Fail loudly on any mismatch, and print the final outline for comparison with the Moodle course page.

### Pitfall 29: Admonition titles and Vale `Capitalization`
"Try it yourself" and the admonition label may trip `Capitalization`/`Headings` rules. Allow-list the exact string.

### Pitfall 30: YouTube placeholder titles
`title` is required by the component. A converter that outputs `title=""` or a generic title hurts accessibility. Take the title from the link text when it is not the URL, otherwise from the surrounding heading, and review the list by hand.

### Pitfall 31: Pages deployment prerequisites
Pages source must be "GitHub Actions" before the first deploy, the repo must be public (or a plan that supports private Pages), and the `github-pages` environment must allow `main`. PRs build but must not deploy (the seed covers it). Pin `actions/*` versions that match Node 20 and the lockfile (`cache-dependency-path: docs/package-lock.json`, a common slip when the site moves into `docs/`).

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| P1 scaffold | Broken-link gates | Hooks left at `warn` (18) | Prove each gate with a deliberate failure |
| P1 | Sidebar shape | Book-level `_category_.json` not rendered; overview sorts last (4) | Test with two stub books first |
| P1 | Absolute paths, CDNs | `/img/...` in SCSS and head tags 404 under `/Courses/`; unpinned CDN (11, 20) | Test on `serve`; self-host fonts; pin `dwc-ui.css` |
| P1 | Sass partials | Missing partials after skip list (19) | Copy as a set, build immediately |
| P1 | Git hygiene | Large archive committed (24) | `.gitignore` on day one |
| P1/P2 | MIT notice | Copied files without notice (23) | `THIRD_PARTY_NOTICES.md` and file headers |
| P2 | Vale | `.mdx` skipped by section glob; vocab does not reach Google rules (12) | Violation test file; extend exceptions |
| P2 | Deploy | Wrong working dir / cache path; trailing-slash 404 (11, 31) | Verify nested URL on live Pages |
| P3 DWC relocation | Image renames | Missed references, case-only renames, lost 2022 info (2, 9) | Mapping table first, `git mv`, CI on Linux |
| P3 | Old URL knowledge | Old sitemap/build lost (3) | Snapshot old `build/` and `sitemap.xml` before moving |
| P4 converter | MDX strictness | Autolinks, `<>`, void tags, entities (6, 8) | Compile each file in the converter; `autolinks=False` |
| P4 | Moodle references | `$@...@$` tokens, absolute pluginfile URLs, duplicate hashes (7) | Resolve by context tuple; extend grep and counters |
| P4 | Slugs | Collisions, `03a-` not stripped (14) | Assert uniqueness; pick one sub-chapter scheme |
| P4 | Language tagging | Misclassified fences (16) | Review CSV, override map, `text` fallback |
| P5 components | Exercise admonition | No `Admonition/Types.js` (5) | Add the swizzled mapping and CSS class |
| P5 | Prism | Built-in grammar overrides custom; wrong instance; unthemed tokens (13) | Swizzle, register after the loop, standard token names |
| P5 | Search | `docsRouteBasePath` and `indexBlog` (21) | Test on `serve` |
| P6 review | Leftovers | `&lt;`, NBSP, doubled bold, bad alt text (8, 15, 7) | Golden pages, grep gates |
| P7 Vale | Anchors | Heading edits break `#anchors` (10) | Build after every Vale batch; explicit IDs on targets |
| P8 acceptance | Grep gate | Gate misses `$@`, absolute pluginfile (7) | Extended grep list |
| P8 | Sidebar order | Mismatch with Moodle outline or old site (4, 28) | Diff generated sidebar against the expected outline |
| P9 audit | Timing and new images | Audit after go-live shifts URLs (25) | Finish before P10 and before announcing |
| P10 redirects | Meta refresh | Lost fragments, no 404, archive before deploy (3) | JS hash carry-over, `404.html`, deploy then archive |

## Research flags for the roadmap

- **P5 (Prism and admonition):** needs a short spike. Two integration details (swizzle order, `Admonition/Types.js`) are verified only at the source or doc level, not built.
- **P10 (redirects):** needs a dedicated plan and a curl-based verification script. The map is not a prefix swap.
- **P4 (converter):** needs the fixture approach (compile each file, golden pages). Standard patterns otherwise, with the Moodle specifics from Pitfall 7.
- **P1:** standard patterns once the sidebar shape is tested with stub books.
- **P2 (Vale):** verify the `.mdx` glob and the acronym/heading exception behaviour with a test file.

## Open items to verify by experiment (TRAINING-level claims)

- Whether `scripts` / `stylesheets` / `headTags` paths that start with `/` get `baseUrl` prepended in 3.9 (affects `dwc-theme-switcher.js` and `link-decorator.js`).
- Whether Vale vocabularies apply to `Google.Acronyms` and `Google.Headings` exceptions.
- Whether a doc linked as `_category_.json` `link` is removed from the category's item list automatically, or shows twice.
- Whether `<img>` JSX inside MDX goes through Docusaurus's image transform in 3.9, or only Markdown images do.
- GDPR position on Google Fonts and the CDN for the BASIS legal owner.

## Sources

- Docusaurus MDX syntax differences: https://docusaurus.io/docs/markdown-features/react (HIGH; recommends `\{`, `\<`, `{/* */}`)
- Docusaurus admonitions, custom keywords and the `Admonition/Types` swizzle: https://docusaurus.io/docs/markdown-features/admonitions (HIGH)
- Docusaurus deployment, GitHub Pages and `trailingSlash`: https://docusaurus.io/docs/deployment (HIGH)
- `@docusaurus/theme-classic@3.9.2` `lib/theme/prism-include-languages.js`, unguarded `require` of `prismjs/components/prism-${lang}` (HIGH, read from the npm tarball)
- `prismjs@1.30.0` `components/prism-bbj.js` (HIGH, read from the npm tarball)
- `@docusaurus/types@3.9.2` `markdown.d.ts` (hooks include `onBrokenMarkdownImages`) (HIGH); npm dist-tags show `latest` 3.10.2 (HIGH)
- The two `.mbz` archives in `/Users/beff/_workspace/BBjCourses/import/`, unpacked and counted for this report (HIGH for the counts quoted)
- Old site checkout `/Users/beff/_workspace/bbj-dwc-tutorial`: `docusaurus.config.ts`, `build/` layout, `build/sitemap.xml` (HIGH)
- webforj-documentation LICENSE (MIT, Copyright (c) 2022 webforJ) and `.vale.ini` (section globs `*.{md,txt}`, MDX mapped to Markdown): https://github.com/webforj/webforj-documentation (HIGH on content; the conclusion that `.mdx` is skipped is MEDIUM until tested)
- Trailing-slash behaviour on GitHub Pages: https://github.com/slorber/trailing-slash-guide and related Docusaurus issues (MEDIUM)
