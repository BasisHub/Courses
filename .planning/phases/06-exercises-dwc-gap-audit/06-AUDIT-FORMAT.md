# Phase 6 gap audit: format contract

Shared contract for `tools/check-dwc-phase6.py audit` (06-01), the pre-fill drafts (06-02), the audit fragment plans (06-03 to 06-08), the BBj check hand-off (06-09), the assembly (06-10) and the kept-material plans (06-12 to 06-15). Implements CONTEXT D-10, D-11, D-12. Every plan that writes or reads the audit follows this file exactly.

## Units (25 sections, 22 module ids, course order)

The fragment file name is `NN-<code>.md` under `.planning/phases/06-exercises-dwc-gap-audit/audit/`. The pre-fill draft for the same unit is `import/work/dwc-gap-drafts/NN-<code>.md` (local only, never committed). Paths in the DWC target column are relative to `docs/docs/dwc/`.

| NN | Code | Module | Book chapter | DWC target page(s) | Fragment plan | Kept plan |
|----|------|--------|--------------|--------------------|---------------|-----------|
| 01 | 0P | book_56 | 35 | `prerequisites.mdx` | 06-03 | 06-12 |
| 02 | 0R | page_57 | - | `resources.mdx` | 06-03 | 06-12 |
| 03 | 1A | page_58 | - | `01-gui-to-bui-to-dwc/01-registering-launching.md` (S1 section summary rows: `01-gui-to-bui-to-dwc/index.md`) | 06-04 | 06-12 |
| 04 | 1B | page_59 | - | `01-gui-to-bui-to-dwc/02-hello-world.md` | 06-04 | 06-12 |
| 05 | 1C | page_60 | - | `01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md` | 06-04 | 06-12 |
| 06 | 2A | page_116 | - | `02-browser-developer-tools/01-intro-to-css.md` (S2 section summary rows: `02-browser-developer-tools/index.md`) | 06-05 | 06-13 |
| 07 | 2B | page_62 | - | `02-browser-developer-tools/02-developer-tools.md` | 06-05 | 06-13 |
| 08 | 2C | page_63 | - | `02-browser-developer-tools/03-css-custom-properties.md` | 06-06 | 06-13 |
| 09 | 2D | page_64 | - | `02-browser-developer-tools/04-dwc-themes.md` | 06-05 | 06-13 |
| 10 | 3A | page_66 | - | `04-upgrading-apps/01-arc-files.md` (S3 section summary rows: `04-upgrading-apps/index.md`) | 06-03 | 06-14 |
| 11 | 3B1 | book_67 | 36 | `04-upgrading-apps/02-upgrading-grids.md` | 06-03 | 06-14 |
| 12 | 3B2 | book_67 | 37 | `04-upgrading-apps/02-upgrading-grids.md` | 06-03 | 06-14 |
| 13 | 3B3 | book_67 | 38 | `04-upgrading-apps/02-upgrading-grids.md` | 06-03 | 06-14 |
| 14 | 3B4 | book_67 | 39 | `04-upgrading-apps/02-upgrading-grids.md` | 06-03 | 06-14 |
| 15 | 4A | page_69 | - | `05-dwc-controls/index.md` | 06-07 | 06-14 |
| 16 | 5A | page_71 | - | `06-flow-layouts/index.md` | 06-07 | 06-14 |
| 17 | 6A | page_74 | - | `07-icon-pools/index.md` | 06-08 | 06-15 |
| 18 | 7A | page_76 | - | `08-control-validation/index.md` | 06-08 | 06-15 |
| 19 | 8A | page_78 | - | `09-browser-constraints/index.md` | 06-03 | 06-15 |
| 20 | 8B | page_79 | - | `09-browser-constraints/index.md` | 06-03 | 06-15 |
| 21 | 9A | page_80 | - | `10-embedding-components/index.md` | 06-03 | 06-15 |
| 22 | 9B | page_81 | - | `10-embedding-components/index.md` | 06-03 | 06-15 |
| 23 | 9C | page_82 | - | `10-embedding-components/index.md` | 06-03 | 06-15 |
| 24 | 10A | page_117 | - | `11-advanced-responsive/01-media-queries.md` | 06-03 | 06-15 |
| 25 | 10B | page_120 | - | `11-advanced-responsive/02-transitions.md` | 06-03 | 06-15 |

The 22 module ids: book_56, page_57, page_58, page_59, page_60, page_116, page_62, page_63, page_64, page_66, book_67, page_69, page_71, page_74, page_76, page_78, page_79, page_80, page_81, page_82, page_117, page_120. Not audit units: the 11 `assign_*` (they become exercise pages), forum_55, feedback_121.

Section summaries (Moodle `sections/section_*/section.xml`, S1 170 words, S2 147, S3 64; S4 to S10 empty) become rows of type `summary` in the first unit of their section (1A, 2A, 3A).

## Parked images (12, one row each, D-10, P4 D-14)

| Parked file (`tools/data/dwc-unused-img/`) | SHA-1 prefix | Unit |
|--------------------------------------------|--------------|------|
| css-grid-playground-2.png | 85ee968b | 5A |
| css-grid-playground-3.png | c73eee12 | 5A |
| css-layout-samples-5.png | e614abad | 5A |
| css-layout-samples-6.png | 6bd73580 | 5A |
| hello-bbj-dwc-grid.png | 2ce434e1 | 5A |
| responsive-demo.png | 8ce7ce0f | 5A |
| dev-tools-screenshot-1.png | 0c93f9d6 | 2B |
| dev-tools-screenshot-2.png | 2ba367e1 | 2B |
| dev-tools-screenshot-3.png | c59d3ba6 | 2B |
| dev-tools-screenshot-4.png | d6db442d | 2B |
| hello-dwc-4a.png | 7bcb6d08 | 4A |
| message-box.png | 37eade8d | 4A |

A parked row is the screenshot row of the Moodle image whose SHA-1 equals the parked file. Its Excerpt cell reads: backticked Moodle file name, a space, then `(parked ` + backticked parked file name + `)`.

## Fragment and section format

A fragment file holds one or more unit sections, nothing else (no H1, no summary). Each section is:

1. A heading line `## <Moodle name>`. For book_67 chapters: `## 3B. Upgrading BBjGrids: <chapter title>`. For book_56: `## Prerequisites - READ FIRST!`.
2. A blank line, then exactly one metadata line:
   `Unit: <code>. Module: <module id>. DWC target: <targets>.`
   or for book chapters
   `Unit: <code>. Module: <module id>, chapter <N>. DWC target: <targets>.`
   `<targets>` is one or more backticked `docs/docs/dwc/...` paths separated by `, `.
   Regex: `^Unit: (\d{1,2}[A-Z]\d?)\. Module: ((?:page|book)_\d+)(?:, chapter (\d+))?\. DWC target: (.+)\.$`
3. A blank line, then the item table with this exact header and separator:
   `| Item | Type | Excerpt or file | SHA-1 | Verdict | Target | Reason |`
   `|------|------|-----------------|-------|---------|--------|--------|`
4. One row per item, in Moodle order.

Column rules:

| Column | Rule |
|--------|------|
| Item | `<code>-NN`, two-digit, sequential from 01 within the unit |
| Type | one of `summary`, `paragraph`, `code (bbj)`, `code (css)`, `code (html)`, `code (javascript)`, `code (java)`, `code (json)`, `code (bash)`, `code (text)`, `screenshot`, `link`, `attachment` |
| Excerpt or file | at most 140 characters; paragraphs: the Moodle sub-heading in bold plus the first words; code: first line in backticks; screenshot and attachment: backticked Moodle file name (URL-decoded, `?time=` stripped); link: backticked URL. Escape `|` as `\|`. |
| SHA-1 | 40 lowercase hex for `screenshot` and `attachment` rows; `-` for other types, and for a screenshot whose file is not in the backup (Reason then contains `not in backup`) |
| Verdict | `keep`, `covered` or `drop` (D-11) |
| Target | keep: backticked `docs/docs/dwc/<path>#<anchor>` (anchor = an existing heading id on that page, or the id of a new heading the kept material adds, which the Reason then names); covered: backticked `docs/docs/dwc/<path>` (with or without `#anchor`) where the content already is; drop: `-` |
| Reason | one line, required (not `-`) for keep and drop; covered may be `-`. A covered screenshot says `same image by hash: <dwc img path>`. A keep or drop of a new sub-page names `new sub-page` (D-13). For `code (bbj)` keep rows the final audit (06-10) appends `bbj_check_syntax: pass`, `bbj_check_syntax: pass (wrapped)` or `bbj_check_syntax: fixed (<one-line fix>)`. |

Verdict rules (D-11): keep = teaching content still correct for current BBj/DWC and missing from the DWC page; covered = the DWC page says the same thing (even in fewer words) or shows the same image by hash; drop = Moodle-isms (navigation, submit, course logistics), content superseded by a newer DWC chapter, redundant screenshots of the same dialog, or factually outdated content.

Granularity (D-10): each Moodle `<pre>` block is one row; each image is one row; paragraphs are grouped by Moodle sub-heading (one row per sub-heading group); each external link that the DWC page lacks is a `link` row only when it is not already part of a paragraph row's decision; each page attachment (non-image file) is an `attachment` row.

Forbidden in fragments and the final audit: the string `import/`, em dashes (U+2014), absolute local paths, user names or e-mail addresses from the backup.

## Kept BBj snippets (D-05, D-14)

For every `code (bbj)` row with verdict keep, the fragment plan writes the snippet verbatim (Moodle `code_text`, LF line ends, no trailing spaces added or removed beyond a single final newline) to `.planning/phases/06-exercises-dwc-gap-audit/snippets/<Item>.bbj`, for example `snippets/1C-07.bbj`. The exercise snippet from assignment 73 is `snippets/EX73-01.bbj` (written by 06-02). 06-09 checks every file in `snippets/` and records results in `.planning/phases/06-exercises-dwc-gap-audit/06-bbj-syntax-raw.tsv`; when a real error is fixed it writes `snippets/<Item>.fixed.bbj`. Kept-material and exercise plans use `<Item>.fixed.bbj` when it exists, otherwise `<Item>.bbj`, byte for byte.

## Final file `tools/data/dwc-gap-audit.md` (06-10)

1. `# DWC gap audit: Moodle course 4`
2. A provenance paragraph: source backup name `backup-moodle2-course-4-bbjdwc-20261003-1015-nu.mbz` (file name only, no path), date, method (SHA-1 against Moodle `contenthash`), measured totals (199 image file rows, 180 unique hashes; 60 DWC images matched, 42 with 2022 names), and the sentence that verdicts follow D-11 and were reviewed in the PR.
3. `## Summary` with the table `| Unit | Module | keep | covered | drop |`, one row per section in course order (Unit = code, Module = module id plus `, chapter N` for book chapters), then `| Total | 22 modules | <k> | <c> | <d> |`.
4. The 25 sections in course order (fragments concatenated in NN order).

## Fragment procedure (06-03 to 06-08)

For each unit assigned to the plan, in NN order:

1. Read the draft `/Users/beff/_workspace/BBjCourses/import/work/dwc-gap-drafts/NN-<code>.md` and the DWC target page(s) in full.
2. Decide a verdict per draft item using the D-11 rules above. A `<pre>` whose code (ignoring whitespace and comments) already appears in a DWC fence is covered. An image with status `covered:` is covered by hash (Reason `same image by hash: <path>`). An image with status `parked:` gets its own row (parked rule above); keep it only if the DWC page lacks the step it illustrates. Images with status `new` or `unresolved`: open the blob path from the draft with the Read tool before deciding; `unresolved` becomes drop with Reason `not in backup`. Redundant screenshots of the same dialog are drop.
3. For every keep row choose the insertion point on the target page and write `#<anchor>`: the explicit `{#id}` of the heading if it has one, otherwise the Docusaurus slug of the heading text (lowercase, drop characters other than letters, digits, spaces and hyphens, spaces to hyphens). If no existing heading fits, name the new H2 or H3 the kept material will add, use its slug, and say `new heading "<text>"` in the Reason. A new sub-page is the last resort (D-13); say `new sub-page <file name>` in the Reason. The kept-material plan confirms the anchor against the build.
4. For a keep screenshot, look at the image and drop it instead if it shows personal data (names, e-mail addresses, hostnames other than localhost, licence keys); Reason `shows personal data`.
5. Write the unit section into `.planning/phases/06-exercises-dwc-gap-audit/audit/NN-<code>.md` in the section format above. Write each `code (bbj)` keep snippet to `snippets/<Item>.bbj` verbatim.
6. Run `python3 tools/check-dwc-phase6.py audit --fragment <the plan's fragment files>` until it passes.

## Kept-material procedure (06-12 to 06-15)

Applies D-13, D-14, D-15. For each keep row of the plan's units in tools/data/dwc-gap-audit.md, grouped by target page:

1. Insert the kept material at the row's anchor. Prose is adapted, not pasted (D-14): book voice, second person, direct, no em dashes, no `<br>` or span noise, Vale error-clean. Every fence has a language tag. A `bbj` fence takes the text of `snippets/<Item>.fixed.bbj` if it exists, else `snippets/<Item>.bbj`, byte for byte (checked in 06-09). Never rename an existing heading or change its id; if Vale forces a heading change, pin the old id with `{#old-id}`. Add a new heading only where the Reason says `new heading "<text>"`; avoid repeating an existing heading text on the same page.
2. A new sub-page only where the Reason says `new sub-page <file>` (D-13): its route must not be in tools/data/dwc-old-routes.json; add the route to PHASE6_ROUTES and SUB_ORDER in tools/check-dwc-routes.py in the same commit.
3. A kept Moodle screenshot: copy `/Users/beff/_workspace/BBjCourses/import/unpacked/dwc/files/<sha1[0:2]>/<sha1>` to `docs/docs/dwc/<chapter>/img/<name>.<png|gif|svg>` with a descriptive kebab-case name matching `^[a-z0-9]+(-[a-z0-9]+)*\.(png|gif|svg)$` (never a raw Moodle name), view it, and write the alt text by hand describing what it shows (D-15, P5 D-19 style). Reference it on its own flush-left line `![<alt>](./img/<name>)`. Append to tools/data/dwc-gap-image-map.json (a JSON list, created by the first plan that needs it, indent 2, final newline) an object with keys moodle_name, sha1, source "moodle", path, alt, page.
4. A kept parked image: `git mv tools/data/dwc-unused-img/<file> docs/docs/dwc/<chapter>/img/<name>` (same or more descriptive kebab name), hand-written alt, map entry with source "parked", and in tools/data/dwc-image-map.json update that file's existing entry: `new` to the new path, `verdict` to `moved`, `page` to the page (D-15). The entry count stays 66; check-dwc-relocation.py reads the map at `--rev 542399a`, so the working-tree edit does not affect it (RESEARCH 2.5).
5. A kept attachment: an SVG is handled as in step 3 after confirming it contains none of `<script`, `foreignObject`, ` on` followed by letters and `=`, `href="http`. No new `.bbj` sample (verify-phase4 requires exactly 44); a non-BBj sample goes into `docs/examples/dwc/<folder>/`, then `git add` it and run `python3 tools/sync-samples.py dwc`.
6. If a keep row turns out wrong while applying (already present, anchor unsuitable), update that row (verdict, target, reason) and the Summary counts in tools/data/dwc-gap-audit.md in the same commit and record the change in the SUMMARY; `python3 tools/check-dwc-phase6.py audit` must still pass.
7. Gates per chapter commit: `tools/.bin/vale --minAlertLevel=error <touched pages>` reports 0; no U+2014 in touched pages; `cd docs && npm run build`; `python3 tools/check-dwc-routes.py`; `python3 tools/check-dwc-anchors.py`; `python3 tools/check-dwc-phase6.py audit`; `python3 tools/check-dwc-phase6.py kept --allow-parked --units <the plan's codes>`; `python3 tools/sync-samples.py --check`; `find docs/examples/dwc -name '*.bbj' | wc -l` prints 44. Commit subject: `docs(06-NN): add kept course-4 material to <chapter folder> (AUDIT-02)`. A chapter without keep rows gets no commit (say so in the SUMMARY). Markers for 2022 images are not added here (06-16).
