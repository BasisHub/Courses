# Phase 6: Exercises & DWC Gap Audit - Context

**Gathered:** 2026-10-04 (`--auto`: every gray area resolved with the recommended option; see 06-DISCUSSION-LOG.md)
**Status:** Ready for planning

<domain>
## Phase Boundary

The DWC book gets its exercises as `9N-exercise-*.mdx` pages, built from the Moodle course-4 assignments. Exercises with an existing sample solution get a collapsed "Possible solution" block. Both books get an exercise index. A chapter-by-chapter gap audit of Moodle course 4 against the DWC book goes to `tools/data/dwc-gap-audit.md`. Kept material lands on the DWC pages as its own commit series, with no slug renames. DWC screenshots that match 2022-era Moodle images by content hash carry `{/* TODO: screenshot outdated? */}`.

Not in this phase:
- Vale warnings and suggestions (Phase 7 full pass).
- Fixing the failing `SetStyle.bbj` sample (Phase 7 QUAL-03).
- Re-capturing screenshots. The marker only flags them.
- Writing new BBj samples for files the assignments mention but nobody shipped.
- Any change to intro-bbj beyond its exercise index.
- Moodle course 3.

</domain>

<decisions>
## Implementation Decisions

### Backup facts the plan must build on (verified 2026-10-04 by unpacking course 4 into `import/unpacked/dwc/`)
These correct the seed. They are facts, not choices.
- **11 assignments, not 12** (seed §2.4 says twelve): `assign_61` GUI to BUI to DWC (S1), `assign_65` Add Theming Support (S2), `assign_68` BBjGridExWidget (S3), `assign_70` search in a BBjTree (S4), `assign_72` CSS grid layout and `assign_73` CSS Flexbox (S5), `assign_75` icon in a static text (S6), `assign_77` email validation (S7), `assign_83` Embed a 3rd party component (S9), `assign_122` Media Queries and `assign_123` Transition on Button (S10). S8 has no assignment. Every `<activity>` is empty. **No assignment has an attached file.**
- **Moodle section → DWC chapter:** S1→01, S2→02, S3→04, S4→05, S5→06, S6→07, S7→08, S8→09, S9→10, S10→11. DWC 03 (debugging) and 12 (deployment) have no Moodle counterpart. S0 holds `book_56` "Prerequisites - READ FIRST!" (→ `prerequisites.mdx`) and `page_57` "Useful Resource Links" (→ `resources.mdx`). Skip `forum_55` and `feedback_121`.
- **Audit units (22 modules; corrected by 06-RESEARCH.md):** 20 Page modules (including the resource page) and 2 Books (the 1-chapter prerequisites book and the 4-chapter "3B. Upgrading BBjGrids" book, audited per chapter). Earlier drafts said 30; the verify script counts module ids, not a literal. The largest are 5A CSS Layout Options (4,125 words, 15 images), 2C CSS Styles (3,761 words, 18 images, 18 `<pre>`), 1C GUI to BUI to DWC (3,488 words, 15 images), 7A Control Validation (2,944 words), and 2B Developer Tools (2,639 words).
- Page attachments beyond images: 1B `MessageBox.bbj`, `01_GUI2BUI2DWC.zip`. 1C `BBjTopLevelWindow Structure.svg`, the ZIP, `GUISample.bbj`, `DWC1.bbj`, `DWC2.bbj`, `Sample.bbj`, `Sample.css`. 2B `2A_Files.zip`, `DWC1.bbj`.
- **The four DWC "inline exercises" are stubs**, not exercise text. Each is a heading plus "Run `DWCTraining/...`":
  - `08-control-validation/index.md` "Exercise: Adding Validation to an Email Field", followed by validation and Regex101 screenshots
  - `10-embedding-components/index.md` `{#exercise-embed-a-3rd-party-component}`
  - `11-advanced-responsive/01-media-queries.md`
  - `11-advanced-responsive/02-transitions.md`

  `11-advanced-responsive/index.md` has an `## Exercises` list. The `DWCTraining/` paths point at a repo that is not this one, and `10_AdvancedResponsive/` (`MediaQueries.bbj`, `Transitions.bbj`) does not exist in `docs/examples/dwc/`.
- **Existing solutions** in `docs/examples/dwc/`, all passing `bbj_check_syntax` (`tools/data/dwc-samples-syntax.md`):

  | Assignment | Solution files |
  |------------|----------------|
  | assign_70 | `04_ExtendedAttributes/Exercise-SearchBBjTree.bbj` → `...Complete.bbj` (94 lines) |
  | assign_72 | `05_CssLayouts/Exercise-ConvertToCssLayout.bbj` → `...Complete-Grid.bbj` (102) |
  | assign_73 | `05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` → `...Complete.bbj` (51) |
  | assign_75 | `06_IconPools/Exercise-IconPools.bbj` → `...Complete.bbj` (51) |
  | assign_77 | `07_ControlValiation/Exercise-BuiltInValidation.bbj` → `...Complete.bbj` (117) |
  | assign_61 | `01_GUI2BUI2DWC/DWC1.bbj` (39) and `DWC2.bbj` (53); the chapter itself calls them the result of the exercises |

  No solution exists for 65, 68, 83, 122 or 123. `transitionToButtonCompleted.bbj`, `MediaQueries.bbj` and `MediaQueryExample.css`, which assignments 122 and 123 mention, ship nowhere.
- **Hash matching works:** Moodle `files.xml` `contenthash` is the SHA-1 of the file. All 60 DWC images (48 in chapter `img/` folders and 12 parked in `tools/data/dwc-unused-img/`) match a Moodle file. 42 of them match a Moodle file whose name has a 2022 timestamp: 30 referenced in chapter `img/` folders and the 12 parked images (corrected by 06-RESEARCH.md). Moodle holds 184 images, 130 of them with 2022 names.
- Docusaurus `markdown.format` is unset (default `mdx`), so `{/* ... */}` works in the DWC `.md` pages. No `raw-loader` is installed.

### DWC exercise pages (EXER-02)
- **D-01:** **One page per assignment, 11 pages,** in the mapped chapter folder after the chapter's pages:
  - `01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx` (seed §3.4 example name)
  - `02-.../90-exercise-theming-support.mdx`
  - `04-.../90-exercise-bbjgridexwidget.mdx`
  - `05-.../90-exercise-search-bbjtree.mdx`
  - `06-.../90-exercise-css-grid-layout.mdx`, `91-exercise-css-flexbox.mdx`
  - `07-.../90-exercise-icon-static-text.mdx`
  - `08-.../90-exercise-email-validation.mdx`
  - `10-.../90-exercise-embed-component.mdx`
  - `11-.../90-exercise-media-queries.mdx`, `91-exercise-button-transition.mdx`

  Exact slugs are the planner's call within this pattern. Chapters 03, 09 and 12 get none. Single-page chapters (05, 07, 08, 10) gain a sub-page next to `index.md`. Page format follows intro-bbj (P5 D-04): title "Exercise: ..." in sentence case, a `description`, and the body inside `:::exercise`. Drop due dates, submission and grading text. None of the course-4 assignments is optional, so no "Bonus exercise".
- **D-02:** **The Moodle assignment `<intro>` is the exercise text,** converted by hand or with a small one-off script reusing `tools/moodle2docusaurus.py` helpers (HTML clean-up, `<pre>` → language fence). It is not a converter run that the build depends on. The DWC stubs add nothing beyond the heading, so there is nothing to merge.
- **D-03:** **Moodle-isms in exercise text get minimal rewrites** (as P5 D-15):
  - "the GitHub training repository" and `DWCTraining/<folder>/<file>` become the file name plus a link to that folder's ZIP in `static/files/dwc/`, using the file-path link form the build checks.
  - "Based on your previous work" stays.
  - Steps that reference Eclipse/BDT, Enterprise Manager or the CDStore database stay as written.
  - assign_65's `https://us.bbx.kitchen/webapp/DWCThemer` reuses the provisional successor from P5 D-27 and its open review todo (no new link decision).
  - Files that ship nowhere (`MediaQueries.bbj`, `MediaQueryExample.css`, `transitionToButtonCompleted.bbj`): drop the sentence that offers them, or rephrase it to point at the chapter's own example. Never link to a missing file.
- **D-04:** **The old chapter exercise headings stay as short pointer sections, so old anchors survive.** `tools/check-dwc-anchors.py` and `verify-phase4.sh` must stay green (CLAUDE.md), and Phase 8 redirects preserve `#fragments`. Each stub heading keeps its text and id, and its "Run `DWCTraining/...`" line becomes one sentence linking the new exercise page. `11-advanced-responsive/index.md`'s `## Exercises` list links both pages. In chapter 08, the validation and Regex101 screenshots under the heading stay in the chapter. The gap audit (D-10) may move them if it finds they belong to the exercise.
- **D-05:** BBj code that ends up in exercise text (for example the email regex hint or `css!` lines) is checked with `bbj_check_syntax`, and its API names with `bbj_lookup`, after reading `bbj://primer`. CSS and HTML fences need a language tag but no MCP check.

### Possible solution blocks (EXER-04)
- **D-06:** **Six exercises get a solution block:** 61 (DWC1 and DWC2), 70, 72, 73, 75 and 77. The block sits at the end of the page, after the `:::exercise` box. It is a `<details><summary>Possible solution</summary>` holding:
  1. one sentence naming the starter and solution files,
  2. a link to the folder ZIP,
  3. the solution source inline as a `bbj` fence with a `title="<FileName>.bbj"`. Code over 40 lines collapses through `ExpandableCode`.

  The intro-bbj exercises have no solutions, so they get no block.
- **D-07:** **`docs/examples/dwc/` stays the only hand-edited copy.** No raw-loader is added. Inline solution fences are byte-identical copies of the example files, and the phase verify script fails on any drift (fence content ≠ file content). If the planner finds a zero-dependency way to render the file directly in MDX, that is fine too. The no-drift guarantee is what matters.
- **D-08:** The starter files (`Exercise-*.bbj`) are linked, not inlined: the reader downloads the folder ZIP and starts from there.

### Exercise index (EXER-03)
- **D-09:** **Each book gets a top-level `exercises.mdx` page** titled "Exercises":
  - `docs/docs/dwc/exercises.mdx` sits after Resources, at fractional `sidebar_position` 0.4 (P4 D-12 order: Overview, Prerequisites, Sample Code, Resources, Exercises, chapters).
  - `docs/docs/intro-bbj/exercises.mdx` sits after the three read-first pages, at 0.4.

  Each page is a hand-written list grouped by chapter or section: the exercise title as a relative file link plus a one-line summary, with a "(solution included)" note where D-06 applies. Each book's overview gets one line linking its index. The phase verify script checks that every `9N-exercise-*.mdx` in a book appears in that book's index and that no index entry is dangling. LIVE-01's sidebar diff against the old site must treat the new DWC "Exercises" page as an intended addition. Note that in the verify script and the Phase 7 hand-off.

### Gap audit method (AUDIT-01)
- **D-10:** **`tools/data/dwc-gap-audit.md` has one section per Moodle unit (22 modules, 3B split by chapter) in course order.** Each section has a header with the Moodle unit name, module id and the matching DWC page(s), then a table of items: type (paragraph / code / screenshot / link / attachment), a short excerpt or file name, verdict, target DWC page and anchor for kept items, and a one-line reason.
  - Each Moodle `<pre>` block and each image is its own item.
  - Paragraphs are grouped by Moodle sub-heading.
  - Images are identified by Moodle file name plus SHA-1, so an image already in DWC is "covered" by hash, not by eye.
  - A summary table at the top gives counts per verdict per unit.
  - Each of the 12 parked images in `tools/data/dwc-unused-img/` gets its own verdict row (P4 D-14).
- **D-11:** **Verdict rules:**
  - **keep:** teaching content that is still correct for current BBj/DWC and missing from the DWC page.
  - **covered:** the DWC page says the same thing, even in fewer words, or shows the same image by hash.
  - **drop:** Moodle-isms (navigation, "submit", course logistics), content superseded by a newer DWC chapter, redundant screenshots of the same dialog, or content that is factually outdated.

  Every keep or drop needs its one-line reason. Claude decides the verdicts. Stephan reviews them in the PR, where the audit file is its own first commit. There is no mid-phase checkpoint, so the `--auto` chain can run.
- **D-12:** The audit generator may be a one-off script (Claude's choice) that reads `import/unpacked/dwc/` and pre-fills units, items and hash matches. The verdicts are judgment and are hand-written. The committed audit must not depend on `import/`, which gets deleted. It records Moodle file names and hashes, not paths into `import/`.

### Applying kept material (AUDIT-02)
- **D-13:** **Kept material goes into existing DWC pages,** at the anchor named in the audit, as new paragraphs, sections, fences or images. Existing slugs and existing heading ids never change (no renames). If a heading must change for Vale, pin the old id (P4 D-06). A new sub-page is allowed only when a kept block has no fitting home in any existing page. Its new slug must not collide with an old route, and the audit records it.
- **D-14:** **Kept prose is adapted, not pasted:** DWC book voice, second person, direct, no em dashes, Vale error-clean on every touched file (same gate as P4 D-05 and P5 D-13; warnings and suggestions wait for Phase 7). Moodle formatting noise (`<br>` runs, inline spans) is gone.
  - Kept BBj code follows D-05: `bbj_check_syntax` and `bbj_lookup`. Fix real errors in the snippet and note the fix in the audit row. Language tags follow the seed §6.1.4 heuristic.
  - Kept attachments (`BBjTopLevelWindow Structure.svg`, anything useful in `2A_Files.zip`): an image goes into the chapter's `img/` folder. A sample file goes into the matching `docs/examples/dwc/<folder>/`, and then `tools/sync-samples.py` regenerates the ZIPs.
- **D-15:** **Kept screenshots are copied from Moodle** into the target chapter's `img/` with **descriptive kebab-case names and hand-written alt text** (P5 D-19 style, not the mechanical P4 D-13 names, which only applied to existing files). Each one gets an entry in `tools/data/dwc-image-map.json` (or a sibling `dwc-gap-image-map.json`) with the Moodle file name and SHA-1. Parked images with a keep verdict move from `tools/data/dwc-unused-img/` into a chapter `img/` and update the P4 image map. **The folder `tools/data/dwc-unused-img/` is deleted at the end of the audit** (P4 D-14).

### 2022 screenshot markers (AUDIT-03)
- **D-16:** **Match rule:** an image in `docs/docs/dwc/**/img/` gets the marker when its SHA-1 equals the `contenthash` of a Moodle course-4 file **whose Moodle file name has a 2022 timestamp** (the seed's criterion; today 30 referenced images, plus any parked or Moodle image the audit keeps that has a 2022 name). Matching is by content hash, never by the DWC file name, which P4 renamed. The match list (DWC path, Moodle file name, hash) is committed as `tools/data/dwc-2022-screenshots.json`, so the check needs no `import/` after the migration.
- **D-17:** **Marker placement:** `{/* TODO: screenshot outdated? */}` goes on its own line directly above each Markdown image line that references a matched file, in every page that shows it. The verify script checks that each listed image reference has the marker and that no unlisted image has one.

### Commit series
- **D-18:** One PR, separate commits, in this order:
  1. **Gap audit file** (`tools/data/dwc-gap-audit.md`) plus any one-off audit script.
  2. **DWC exercise pages** (D-01 to D-08), including the chapter pointer edits (D-04).
  3. **Kept material,** one commit per DWC chapter touched (D-13 to D-15), with ZIP re-sync where samples change, and the `dwc-unused-img/` removal last.
  4. **2022 markers** plus `dwc-2022-screenshots.json` (D-16, D-17). This comes after step 3 so that newly added images are covered.
  5. **Exercise indexes** for both books plus the overview links (D-09).
  6. **`tools/verify-phase6.sh`.**

  Steps may be split further but not folded together. The audit commit comes first so that reviewers can read the verdicts before the content changes.

### Claude's Discretion
- Exact exercise slugs and titles within D-01, index wording and summaries (D-09), and kept-prose wording (D-14). All Vale-clean, direct, second person, no em dashes.
- Whether the audit pre-fill and the exercise HTML clean-up are scripts or manual. Scripts are throwaway and may live in `tools/`.
- The audit table's exact columns, beyond what D-10 requires.
- `tools/verify-phase6.sh`, following the `verify-phase1..5.sh` pattern. It could check:
  - 11 DWC exercise pages exist, each with `:::exercise`
  - indexes are complete in both books (D-09)
  - solution fences match the example files byte for byte (D-07)
  - every row of `dwc-2022-screenshots.json` is marked, and no unlisted image is (D-17)
  - `tools/data/dwc-unused-img/` is gone
  - every audit keep row names an existing target page
  - `check-dwc-anchors.py` and `sync-samples.py --check` pass
  - the build is green

  The user runs shell scripts with `!`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec and scope
- `.planning/migration-seed.md` §1.2 and §2.4 (course 4 shape; this CONTEXT's backup facts correct "twelve assignments"), §3.4 steps 4–5 (exercise extraction, gap audit; the output path is `tools/data/`, not `import/`), §5 (assignment mapping row), §6.1.4 (language heuristic), §6.3 (exercise page format, "Possible solution" `<details>`), §9 (2022 TODO marker).
- `.planning/ROADMAP.md` Phase 6: goal and 4 success criteria.
- `.planning/REQUIREMENTS.md`: EXER-02, EXER-03, EXER-04, AUDIT-01, AUDIT-02, AUDIT-03.
- `.planning/PROJECT.md`: Key Decisions (gap audit before go-live as its own commit series after the relocation; 2022 screenshot flagging; `import/` never committed).
- `CLAUDE.md`: conventions, BBj MCP rules, before-commit gates, "MDX comments use `{/* */}`".

### Prior phase decisions that constrain this one
- `.planning/phases/04-dwc-book-relocation/04-CONTEXT.md`: D-05 (Vale errors-only gate), D-06 (pinned heading ids, anchor check), D-12 (top-level page order, fractional `sidebar_position`), D-13/D-14 (image naming, parked images and their Phase 6 fate), D-16 to D-19 (examples as the only hand-edited copy, ZIP model, legacy folder names), D-20 (syntax report).
- `.planning/phases/05-intro-bbj-conversion/05-CONTEXT.md`: D-04 (exercise page format and titles), D-15 (Moodle-ism rewrites), D-19 (descriptive image names and hand-written alt), D-27 (provisional DWCThemer link).
- `.planning/phases/03-content-components-brand/03-CONTEXT.md`: `:::exercise` admonition, `ExpandableCode` (>40 lines).

### Input (local only, never committed)
- `import/backup-moodle2-course-4-bbjdwc-20261003-1015-nu.mbz`, unpacked to `import/unpacked/dwc/` (`sections/`, `activities/{page,book,assign}_N/`, `files.xml`, `files/<hash[0:2]>/<hash>`).

### Existing data and tools to build on
- `tools/data/dwc-samples-syntax.md`: syntax status of every DWC sample. All solution files pass; `SetStyle.bbj` fails (Phase 7).
- `tools/data/dwc-image-map.json`, `tools/data/dwc-unused-img/`: P4 image map and the 12 parked images.
- `tools/data/dwc-old-routes.json`, `tools/check-dwc-anchors.py`: old anchors that must keep resolving.
- `tools/moodle2docusaurus.py`: HTML clean-up and `<pre>` language heuristic to reuse.
- `tools/sync-samples.py`: ZIP regeneration and `--check`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `:::exercise` admonition and `ExpandableCode` (globally registered, P3). `DocCardList` is registered globally too.
- `docs/docs/intro-bbj/*/9N-exercise-*.mdx` (5 pages): the exercise page shape to copy.
- `tools/moodle2docusaurus.py`: Moodle HTML clean-up, `@@PLUGINFILE@@` resolution, code-language heuristic. These are the building blocks for the audit pre-fill and the exercise text.
- `tools/sync-samples.py`, `tools/check-dwc-anchors.py`, `tools/verify-phase4.sh`/`verify-phase5.sh`: patterns for `verify-phase6.sh`.

### Established Patterns
- Top-level book pages use fractional `sidebar_position` (Overview 0, then 0.1, 0.2, ...). Chapter `_category_.json` links to `<book>/<chapter>/index`.
- Images: `./img/name.png`, kebab-case, alt text required. MDX comments `{/* */}`. Every fence has a language. No content H1.
- DWC pages are `.md` but parsed as MDX (default format), so JSX `<details>` and `{/* */}` work there. The new exercise pages are `.mdx`.
- Sample download links use relative file paths into `static/files/dwc/` that the link gate checks (see `samples.mdx`).

### Integration Points
- `docs/docs/dwc/<chapter>/` (new exercise pages, pointer edits, kept material, markers), `docs/docs/dwc/exercises.mdx`, `docs/docs/intro-bbj/exercises.mdx`, both `00-overview.mdx`.
- `docs/examples/dwc/` and `docs/static/files/dwc/` only if a kept attachment adds a sample.
- `tools/data/dwc-gap-audit.md`, `tools/data/dwc-2022-screenshots.json`, the image map(s), removal of `tools/data/dwc-unused-img/`.

</code_context>

<specifics>
## Specific Ideas

- Old exercise anchors such as `/docs/dwc/embedding-components#exercise-embed-a-3rd-party-component` keep landing on a heading that sends the reader to the new exercise page.
- The "Possible solution" block shows the actual `...Complete.bbj` file, so a reader can compare without downloading.
- The audit lets a reviewer answer "what did the rewrite drop from 1C?" in one place, with a reason for each drop.

</specifics>

<deferred>
## Deferred Ideas

- Writing the missing `MediaQueries.bbj`, `MediaQueryExample.css` and `transitionToButtonCompleted.bbj` samples, or solutions for 65, 68 and 83: new content, a later milestone.
- Re-capturing the flagged 2022 screenshots: Phase 7 review or later.
- Vale warnings and suggestions on DWC pages: Phase 7 full pass.
- Fixing `SetStyle.bbj`: Phase 7 QUAL-03.
- Updating the provisional DWCThemer link (P5 D-27 todo), which also appears in the theming exercise.

</deferred>

---

*Phase: 06-exercises-dwc-gap-audit*
*Context gathered: 2026-10-04*
