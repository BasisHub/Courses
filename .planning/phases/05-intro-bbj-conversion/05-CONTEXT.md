# Phase 5: Intro-BBj Conversion - Context

**Gathered:** 2026-10-04
**Status:** Ready for planning

<domain>
## Phase Boundary

A throwaway `tools/moodle2docusaurus.py` converts the course-2 Moodle backup into the `intro-bbj` book, once. It produces 28 chapter pages plus an overview, 4 section index pages, 5 exercise pages, 10 YouTube embeds, 9 images with hand-written alt text, and the 4 sample resources as downloads. The converter and the generated docs land as separate commits. After that, the Markdown is the source of truth, and fixes happen in the Markdown, not in the converter.

Not in this phase: content rewrites beyond the minimal edits below, Vale warnings and suggestions (Phase 7), modernizing 2021-era BBj patterns, and anything touching the DWC book.

</domain>

<decisions>
## Implementation Decisions

### Backup facts the plan must build on (verified 2026-10-04 by unpacking the .mbz)
These correct or sharpen the seed. They are facts, not choices.
- **5 assignments, not 6** (seed §2.4 is wrong; the roadmap is right): `assign_6` Tic-Tac-Toe, `assign_7` computer player (optional), `assign_14` Login Dialog, `assign_15` OO Tic-Tac-Toe (optional), `assign_19` responsive Login Dialog. All `<activity>` fields are empty. No solution files are attached.
- **28 chapters in 5 Book modules:** `book_10` "Introduction - PLEASE READ FIRST!" (3, in section 0), `book_8` (8, section 1), `book_12` (5, section 2), `book_16` (8, section 3), `book_20` (4, section 4). **Order chapters by `<pagenum>`, not XML order.** In `book_12` and `book_16`, pagenum 1 comes last in the XML. No chapter is hidden, and none is a subchapter.
- Section sequences: S0 `9,10` (forum hidden, skip) · S1 `8,11,6,7` · S2 `12,13,14,15` · S3 `16,17,18,19` · S4 `20`. All section summaries are empty. Section 4 has no assignment and no resource. Only `book_8` has an `<intro>`, which is used for the section 1 index page. The course summary (`course/course.xml`) feeds the overview.
- **No `<pre>` blocks anywhere.** Code appears as inline `<code>` (34 occurrences), whole-paragraph `<code>` with `<br>` line breaks, and **unmarked `<p>` text**. Examples: the `.mypanel{...}` CSS rule and `wnd!.addPanelStyle("mypanel")` in "Adding an external CSS file". Also a malformed `<code><p>...</p><code>` (unclosed) around `::BBUtils.bbj::BBUtils.applyCss(...)`.
- **Videos are `<video controls><source src="https://youtu.be/ID">https://youtu.be/ID</video>`**, not `<a>` anchors as the seed says. Each URL appears twice (src and text), so dedupe by ID. There are 10 unique videos, at most one per chapter.
- **All 9 images are named `image.png` or `image (1).png`.** Resolve `@@PLUGINFILE@@` by `component=mod_book`, `filearea=chapter`, `itemid=<chapter id>` plus the filename. The filename alone is ambiguous. All `alt` attributes are empty (`role="presentation"`).
- The `$@NULL@$` token appears 65 times (e.g. the section 0 name). The report must show none left in output.
- HTML noise: 144 `<br>`, 109 style-only `<span>`, empty headings that hold only `<br>`, `<h5>` used as sub-headings, one content `<h1>`, `&nbsp;`, and the literal text `&lt;temporary chapter - this will soon change&gt;` (MDX-hostile once unescaped).
- No internal Moodle links (`view.php`) exist. The external links are listed under D-17/D-18.

### Book shape
- **D-01:** The 3 "PLEASE READ FIRST" chapters become **top-level pages right after the Overview**, ordered with fractional `sidebar_position` (0.1, 0.2, 0.3), the same pattern as DWC's `prerequisites.mdx` (0.1). This keeps the 28-page count of CONV-02 and the roadmap.
- **D-02:** The 4 Moodle sections become folders `01-` to `04-`. Each category **label drops the number and uses sentence case**, e.g. "Set up your environment and get started", "Object-oriented syntax in BBj", "Web development with BBj's DWC", "Theming and styling the BBj web components". This matches DWC labels. The folder prefix keeps the order.
- **D-03:** Each section folder gets an **`index.mdx`** with a short intro and `<DocCardList />`. `_category_.json` links to it (`link: {type: 'doc', id: 'intro-bbj/<section-slug>/index'}`), same as DWC chapters. Section 1 uses `book_8`'s `<intro>` text. The other three get a Claude-drafted, Vale-clean line.
- **D-04:** Exercise pages are `9N-exercise-<slug>.mdx` after their section's chapters, inside `:::exercise`. Required assignments are titled **"Exercise: ..."**. The two optional ones are titled **"Bonus exercise: ..."**, e.g. "Bonus exercise: Add a computer player" (`91-exercise-computer-player.mdx`). Section 1: 90 tic-tac-toe, 91 computer player. Section 2: 90 login dialog, 91 OO tic-tac-toe. Section 3: 90 responsive login dialog. Section 4: none. Drop due dates, submission and grading text.
- **D-05:** Page titles use **sentence case with light cleanup**, kept close to the Moodle wording: "...some more hints:" becomes "More hints", "Next Sample: A multiplying Calculator" becomes "Next sample: a multiplying calculator", and 'A first "Hello World"' becomes "A first Hello World". Titles live in a **title map** in the converter.
- **D-06:** Chapter file slugs (and so URLs) come from a **short hand-picked slug map** in the converter, e.g. `02-first-hello-world`, `03-syntax-and-variables`, like the seed examples. Re-runs stay stable.
- **D-07:** `00-overview.mdx` holds the course summary as prose, `<DocCardList />`, a plain "Start with [...](./01-.../index.mdx)." link line, and a short list of the sample downloads (D-24). It keeps the existing front matter pattern (`title`, `sidebar_label: Overview`, `sidebar_position: 0`, `description`), mirroring the DWC overview (P4 D-09/D-10/D-11).
- **D-08:** The Phase 1 stubs (`01-getting-started/index.md`, `01-sample-page.md`, the stub overview text) are **replaced in the generated-docs commit**. If a verify script still runs the Phase 3 search proof, point it at real intro-bbj content.

### Code recovery and BBj checks
- **D-09:** Code detection uses a **heuristic plus an explicit override table** in the converter. Paragraph-level `<code>` runs become fences automatically, with the language from the seed §6.1.4 heuristic. The override table (chapter + text anchor → "code block, language X") marks unmarked `<p>` code and repairs the malformed `<code><p>` case. The report's "unclassified code" count reaches zero because every case is either classified or listed, not because detection is skipped.
- **D-10:** **Own paragraph = fence.** A `<code>` that is the whole paragraph, or that spans `<br>` lines, becomes a fenced block. A `<code>` inside running text stays inline backticks. Cheat-sheet one-liners (e.g. `MyString$ = "Hello World"`) each get their own small fence. Every fence carries a language (CLAUDE.md).
- **D-11:** **The generated-docs commit is verbatim converter output.** Afterwards, run `bbj_check_syntax` over every BBj snippet in the pages and every `.bbj` in `docs/examples/intro-bbj/`, and record the results per snippet/file in `tools/data/` (e.g. `intro-bbj-syntax.md`, mirroring `dwc-samples-syntax.md`). Real errors are **fixed in this phase**, in a separate hand-edit commit, with every API checked through `bbj_lookup` (read `bbj://primer` first). Fix the sample, not the check. Unlike DWC (P4 D-20), intro-bbj meets the CLAUDE.md rule from day one.
- **D-12:** **Keep the code as taught.** Only syntax errors and verified API mistakes are fixed. Patterns that are outdated but valid (e.g. `::BBUtils.bbj::BBUtils.applyCss`) stay. Modernizing is deferred.

### Prose, links and Moodle-isms
- **D-13:** Vale in this phase covers **error-level findings plus obvious typos** ("sensistivity", "instrutions", "previos", "changes" → "changed" where clearly wrong). Use minimal wording changes, no rewrites. Warnings and suggestions wait for the Phase 7 full pass (as in P4 D-05). The reviewdog check on the PR must pass without bypass. Every intro-bbj file is new, so every file is checked whole.
- **D-14:** "Please Contribute!" becomes a **feedback page** in the same slot, retitled along the lines of "Help improve this course". Feedback goes to **GitHub issues on `BasisHub/Courses`**. The free-mentoring text, the attendee mailing list `bbj-training-course@basis.com` and the Google Doc scratchpad are dropped. This is reading material only: no forms, no accounts.
- **D-15:** **Minimal rewrite of Moodle- and time-specific wording**, in a hand-edit commit after the generated one:
  - "You can find a copy of the program in the Files-Section of this Section" and "Right-click and select Save as..." point to the download link instead.
  - Drop "(September 2021) work in progress" and "<temporary chapter - this will soon change>", or bring them up to date if D-18 finds the shipped Theme Editor.
  - Other prose stays as written.
- **D-16:** "Who can use this course" keeps its content. Only the dated "work in progress" clause goes (D-15). The "check with your manager or mentor" advice stays.
- **D-17:** **Converter rule:** `documentation.basis.com` becomes `documentation.basis.cloud`. All 20 old paths were checked and return 200 on `.cloud`, including `docs/BBjCustomObjects.pdf`. External links to MDN, css-tricks, Wikipedia, GeeksforGeeks, w3schools and the "upgrading OO code" Google Doc (`17vgI1...`) stay. `http://localhost:8888/...` URLs describe the reader's own Enterprise Manager and stay as text or code, not as live links.
- **D-18:** **Dead links get a verified successor.** These return 404: `basishub.github.io/basis-next/#/dwc/...` (4 links: DWC component docs, bbj-button shadow parts, dark theme, theme engine), `hot.bbx.kitchen/webapp/DWCThemeEditor`, and `www.basis.com/eclipseplug-ins`. Research finds the current equivalents, e.g. the DWC component and theming docs on documentation.basis.cloud or docs.webforj.com, the Theme Editor shipped with BBj, and the Eclipse plug-in or BDT setup page. Where no successor exists, unlink and keep the text. Record every old URL → new URL or "unlinked" in a link map in `tools/data/` (e.g. `intro-bbj-link-map.json`). Apply the swaps in the hand-edit commit, not the converter, except D-17.

### Images, videos and downloads
- **D-19:** The 9 images get **descriptive, hand-picked kebab-case names** (e.g. `em-add-web-app.png`, `em-css-file-setting.png`), chosen after viewing each one. They live in the section's `img/` folder. Name and **hand-written alt text** (CONV-05) are both stored in `tools/data/intro-bbj-image-map.json`, so re-runs stay stable.
- **D-20:** **Video titles are the real YouTube titles.** Fetch them once via YouTube oEmbed at conversion time, clean them to sentence case (Vale-clean), and store them in a map in `tools/data/` (e.g. `intro-bbj-video-map.json`) so re-runs need no network. Output is `<YouTube id="..." title="..." />` (P3 D-08 facade, globally registered, no import).
- **D-21:** Sample folders under `docs/examples/intro-bbj/` use **descriptive kebab-case**: `better-hello-world/`, `oo-samples/`, `dwc-lesson-start/` and `dwc-lesson-result/` (exact names are the planner's call within this pattern). File names inside stay as shipped (`BetterHelloWorld.bbj`, `Car.bbj`, `CarApplication.bbj`, `MyDialog.bbj`, `Sample.bbj`, `sample.css`). This separates the two `Sample.bbj` files. The P4 D-19 legacy-name exception does not apply here, because there are no legacy names.
- **D-22:** Downloads come from **`tools/sync-samples.py`**: one reproducible ZIP per folder plus `intro-bbj-samples.zip` in `docs/static/files/intro-bbj/`, generated from `docs/examples/intro-bbj/`, the only hand-edited copy. Syntax fixes (D-11) therefore reach the downloads, and the existing `--check` in `test-build.yml` and `deploy.yml` guards drift. Single `.bbj` files ship as one-file ZIPs, and no raw files are mirrored. The original Moodle ZIP names (`BBj OO Samples.zip`, `samples.zip`) are not reproduced. CONV-06 counts as met by these ZIPs. Reword its file list at phase transition.
- **D-23:** sync-samples requires `LICENSE` and `README.md` in `docs/examples/intro-bbj/`. The README is Claude-written. For the LICENSE, reuse the DWC MIT license (Copyright BASIS International) and **confirm with Stephan at the plan checkpoint**, because the Moodle samples carry no license.
- **D-24:** Download links sit **in the chapter that uses the sample**, with the Moodle resource `<intro>` text adapted:
  - Better Hello World ZIP: in "A better Hello World".
  - OO samples ZIP: in the last of the three OO video chapters.
  - DWC lesson start file: at the start of the first hands-on DWC chapter.
  - DWC lesson result: at the end of "Adding an external CSS file".

  The overview also lists all downloads (D-07). Links use the file path form that the build's link checker validates.

### Commit series (CONV-07)
- **D-25:** One PR, separate commits in this order:
  1. **Converter** (`tools/moodle2docusaurus.py`, its maps in `tools/data/`, `requirements.txt` if changed).
  2. **Generated docs**: verbatim converter output, stubs replaced, examples and ZIPs.
  3. **Hand edits**: Moodle-isms, feedback page, dead-link successors (D-14/D-15/D-18).
  4. **Vale errors and typos** (D-13).
  5. **BBj syntax report and fixes** (D-11), re-syncing ZIPs.

  Commits 3 to 5 may be split further but must not be folded into commit 2. Commit 2 must stay reproducible by re-running the converter.

### Decisions after research (Stephan, 2026-10-04)
- **D-26:** **8 images, not 9.** The book shows the 8 images the chapter HTML references. The 9th file (chapter 24's unannotated `image.png`, a duplicate of the annotated `image (1).png`) is not published; the converter records it as an intentional drop in its report and in `tools/data/intro-bbj-image-map.json`. CONV-05 and roadmap criterion 3 now say 8 images, and D-19 applies to those 8. `verify-phase5.sh` asserts 8.
- **D-27:** **Theme Editor successor:** `hot.bbx.kitchen/webapp/DWCThemeEditor` maps to `https://us.bbx.kitchen/webapp/DWCThemer` in the D-18 link map. This is provisional: it carries a review TODO (STATE.md Pending Todos) and the link map entry is marked `"review": true`. Chapter 28's "(September 2021) work in progress" / "<temporary chapter ...>" wording is still dropped per D-15.
- **D-28:** **Video titles keep the "BBx Clues N:" prefix** verbatim from oEmbed; the only cleanup is collapsing double spaces (and whatever is needed for Vale error-level cleanliness). This refines D-20's "sentence case".
- **D-29:** **`docs/examples/intro-bbj/LICENSE` is MIT, "Copyright (c) 2021 BASIS International Ltd."** (confirmed by Stephan; resolves the D-23 checkpoint, so no plan checkpoint is needed for it).

### Claude's Discretion
- The exact slug and title maps (D-05/D-06), section index wording (D-03), and overview prose (D-07). All must be Vale-clean, direct, second person, with no em dashes.
- The converter's internal structure and CLI (seed suggests `--src import/unpacked/intro --book intro-bbj --title "..."`), its report format, and where it unpacks. `import/` stays uncommitted.
- Whether the language heuristic and override table live in code or in a `tools/data/` file.
- A `tools/verify-phase5.sh` following the `verify-phase1..4.sh` pattern. It could check:
  - the converter report is all zeros
  - 28+1 pages, plus index and exercise pages, exist in the expected order
  - 10 `<YouTube` and 9 images with non-empty alt
  - no `PLUGINFILE`, `pluginfile.php`, `moodle.basis-europe`, `$@`, `&nbsp;`/`&lt;` entities or `<br>` in `docs/docs/intro-bbj`
  - every fence has a language
  - sync-samples `--check` passes

  The user runs shell scripts with `!`.
- The exact sample folder names within D-21's pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Spec and scope
- `.planning/migration-seed.md` §2.2–2.4 (archive format, contents), §5 (mapping rules), §6.1–6.3 (HTML→MDX pre/post-processing, exercises), §8 step 4 (converter report). Where this CONTEXT's "Backup facts" contradict §2.4 (6 assignments, `<a>` video anchors, `<pre>` blocks), this CONTEXT wins.
- `.planning/ROADMAP.md` Phase 5: goal and 5 success criteria.
- `.planning/REQUIREMENTS.md`: CONV-01..07, EXER-01.
- `.planning/PROJECT.md`: Key Decisions (converter is throwaway, `import/` never committed, Markdown is source of truth).
- `CLAUDE.md`: conventions, BBj MCP rules, before-commit gates.

### Prior phase decisions that constrain this one
- `.planning/phases/04-dwc-book-relocation/04-CONTEXT.md`: D-05 (Vale errors-only gate), D-07 (no content H1, description ≤160 chars), D-09–D-11 (overview pattern), D-12 (fractional `sidebar_position` for top-level pages), D-17/D-18 (sync-samples ZIP model), D-20 (syntax report format).
- `.planning/phases/03-content-components-brand/03-CONTEXT.md`: D-08–D-10 (YouTube facade, `title` required), D-11 (component fixture), D-13/D-14 (BBj Prism extension).

### Input
- `import/backup-moodle2-course-2-bbj_development_basics-20261003-1014-nu.mbz`: the source (gzip tar, local only, never committed).

### Existing outputs to mirror
- `tools/data/dwc-samples-syntax.md`: format for the intro-bbj syntax report.
- `tools/data/dwc-image-map.json`: shape for the intro-bbj image map.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/sync-samples.py [--check] [book ...]`: generic per book. Builds `<folder>.zip` and `<book>-samples.zip` from `docs/examples/<book>/` (needs `LICENSE` and `README.md`, and only git-tracked files go in). The `--check` step already runs in `test-build.yml` and `deploy.yml`.
- `tools/requirements.txt`: already pins the converter deps (`beautifulsoup4==4.15.0`, `lxml==6.1.3`, `markdownify==1.2.3`, `six==1.17.0`).
- `docs/src/components/YouTube` and `docs/src/components/DocsTools/ExpandableCode`, registered globally with `DocCardList` in `docs/src/theme/MDXComponents.js`. No import lines are needed in pages.
- `:::exercise` admonition (`docs/src/theme/Admonition`, P3).
- `tools/relocate-dwc.py`, `tools/check-dwc-*.py`, `tools/verify-phase4.sh`: Python tooling and verify-script patterns to copy.

### Established Patterns
- `docs/src/data/books.js` already registers `intro-bbj` (title, navLabel "BBj Basics", `to: '/docs/intro-bbj/overview'`). `docs/sidebars.js` autogenerates one sidebar per book. No registry change is needed.
- DWC `_category_.json`: `{label, position, link: {type: 'doc', id: '<book>/<slug>/index'}}`. The doc id drops the numeric prefix.
- Top-level pages in a book: `sidebar_position` 0 (overview), then 0.1, 0.2, ...
- MDX comments use `{/* */}`. No content H1. Every fence has a language. Images are `./img/name.png`.

### Integration Points
- `docs/docs/intro-bbj/` (replace the stubs), `docs/examples/intro-bbj/` (new), `docs/static/files/intro-bbj/` (generated ZIPs), `tools/data/intro-bbj-*` (maps, report).
- `docs/docs/authoring/components.mdx` needs no change unless a shared component changes.
- The build gate (`npm run build`) throws on broken links, anchors and images. Vale reviewdog runs on every changed `docs/docs/**/*.{md,mdx}`.

</code_context>

<specifics>
## Specific Ideas

- "Please Contribute!" → "Help improve this course", linking to GitHub issues on `BasisHub/Courses`.
- Image names like `em-add-web-app.png` and `em-css-file-setting.png`, with descriptive alt text written by viewing the actual screenshots (Enterprise Manager dialogs, browser output).
- Video titles taken from YouTube itself, so a reader who clicks through sees the same name.

</specifics>

<deferred>
## Deferred Ideas

- Modernizing 2021-era BBj patterns in intro-bbj (e.g. `BBUtils.applyCss`, Enterprise Manager steps that may have changed): a content revision, not conversion. Candidate for a later milestone.
- Vale warnings and suggestions on intro-bbj pages: Phase 7 full pass.
- Better or refreshed screenshots of current Enterprise Manager UI: Phase 7 review or later.
- Rewording CONV-06's file list to match the ZIP downloads (D-22): at phase transition.

</deferred>

---

*Phase: 05-intro-bbj-conversion*
*Context gathered: 2026-10-04*
