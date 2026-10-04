# Phase 6: Exercises & DWC Gap Audit - Research

**Researched:** 2026-10-04
**Domain:** Docusaurus 3.10.2 content migration (Moodle course 4 into the DWC book), MDX authoring, repo check tooling
**Confidence:** HIGH (everything below was measured in this repo or the unpacked backup; items tagged `[ASSUMED]` are listed in the Assumptions Log)

<user_constraints>
## User Constraints (from CONTEXT.md)

CONTEXT.md decisions D-01 to D-18 are locked. The planner MUST read `06-CONTEXT.md` in full. This research does not re-decide them. Key locked points that shape the findings below:

- 11 exercise pages `9N-exercise-*.mdx` in the mapped DWC chapter folders (D-01); text from Moodle assignment `<intro>` (D-02); minimal Moodle-ism rewrites (D-03); old exercise headings stay as pointer sections with their ids (D-04); BBj code checked with `bbj_check_syntax` after reading `bbj://primer` (D-05).
- Six exercises get a collapsed "Possible solution" `<details>` with the solution inline as a `bbj` fence with `title=`; `docs/examples/dwc/` stays the only hand-edited copy; verify script fails on drift (D-06, D-07, D-08).
- `exercises.mdx` per book at `sidebar_position` 0.4 (D-09).
- Audit file `tools/data/dwc-gap-audit.md`, verdicts keep/covered/drop, parked images each get a row, `tools/data/dwc-unused-img/` deleted at the end (D-10 to D-12, D-15).
- Kept material goes into existing pages, no slug renames, Vale error-clean (D-13, D-14).
- 2022 marker rule: SHA-1 equals contenthash of a Moodle file whose name has a 2022 timestamp; list committed as `tools/data/dwc-2022-screenshots.json`; marker `{/* TODO: screenshot outdated? */}` on its own line directly above each matching image line (D-16, D-17).
- Commit order: audit, exercise pages, kept material per chapter, 2022 markers, indexes, `tools/verify-phase6.sh` (D-18).

### Deferred Ideas (OUT OF SCOPE)
Missing samples (`MediaQueries.bbj`, `MediaQueryExample.css`, `transitionToButtonCompleted.bbj`, solutions for 65/68/83), re-capturing screenshots, Vale warnings/suggestions (Phase 7), fixing `SetStyle.bbj` (Phase 7 QUAL-03), updating the provisional DWCThemer link.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EXER-02 | DWC exercise pages from inline stubs and course-4 assignments | Section 3 (assignment intro HTML), Section 5 (converter reuse), Section 6 (page shape, pointer anchors) |
| EXER-03 | Per-book exercise index | Section 7 (sidebar positions), Section 8 (check changes the new `exercises.mdx` forces) |
| EXER-04 | Collapsed "Possible solution" block | Section 4 (renders, probe-verified), Section 4.3 (byte-compare pitfalls) |
| AUDIT-01 | `tools/data/dwc-gap-audit.md` | Section 1 (unit table and sizes), Section 2 (pre-fill method), parked image table |
| AUDIT-02 | Kept material on DWC pages, no renames | Section 8 (checks that must stay green), Section 9 (pitfalls) |
| AUDIT-03 | 2022 screenshot markers | Section 2.3 (exact match list, 30 + 12), Section 4.2 (marker placement proven) |
</phase_requirements>

## Summary

The phase is content work on top of a stable, green baseline. Verified this session: `npm run build` passes, `check-dwc-routes.py`, `check-dwc-anchors.py` (306 anchors, 1 allowlisted), `sync-samples.py --check`, `check-intro-bbj.py structure` (195 checks) and `check-dwc-relocation.py --rev 542399a` all pass on the current tree. `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` reports 0 errors (418 warnings, 54 suggestions remain for Phase 7).

Three findings change the plan shape. (1) Two existing checkers hard-code the Phase 4 and Phase 5 end state and WILL FAIL as soon as an exercise page or `exercises.mdx` is added: `tools/check-dwc-routes.py` (extra routes, top-level order, sub-page order) and `tools/check-intro-bbj.py` (`expected_files()` is an exact file set, plus a literal `38 .mdx files` contract). They must be edited in the same commit that adds the pages. (2) The count of audit units is 22 Moodle modules (20 pages including the resource page, plus 2 books), or 25 if the chapters of the two books are counted separately. The "30" in CONTEXT does not reconcile with the backup (see Open Questions). (3) The 2022 marker list is 30 images in chapter `img/` folders today, not 42: the other 12 of the 42 hash matches are the parked images, which only get a marker if the audit moves them into a chapter.

Everything the exercise pages need is proven to render in this site: `<details><summary>` with a titled `bbj` fence works in `.mdx`, `ExpandableCode`-style collapsing (>40 lines) applies inside `<details>`, and a `{/* */}` line above a Markdown image in a `.md` file builds and renders nothing.

**Primary recommendation:** Plan the work as (a) a scratch pre-fill script that imports `tools/moodle2docusaurus.py` helpers read-only, (b) per-chapter-group plans for audit and apply, and (c) a Wave 0 plan that first updates `check-dwc-routes.py`, `check-intro-bbj.py` and `verify-phase4/5` expectations for the new pages, then writes `tools/verify-phase6.sh` with a small Python checker `tools/check-dwc-phase6.py` (the shell script alone cannot do byte-compare and hash work cleanly).

## Architectural Responsibility Map

Static documentation site; there is no runtime tier except the build.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Exercise pages, index pages, kept prose | Markdown source in `docs/docs/dwc` and `docs/docs/intro-bbj` | Docusaurus build (MDX compile, link/anchor gates) | Markdown is the single source of truth |
| Solution code shown inline | `docs/examples/dwc/**` (hand-edited copy) | MDX fence (derived copy), verify script (drift gate) | D-07: no raw-loader |
| Sample downloads | `docs/static/files/dwc/*.zip` generated by `tools/sync-samples.py` | `pathname:///files/dwc/...` links | Link form already gated by build and `verify-phase4.sh` |
| Gap audit and 2022 list | `tools/data/` (committed Markdown/JSON) | `import/unpacked/dwc/` (local only, deleted later) | Audit must not depend on `import/` |
| Syntax checks of BBj | Orchestrator with BBj Documentation MCP | Executors (partial, see Section 10) | MCP availability differs by agent |

## Standard Stack

No new packages. Everything reuses the repo's pinned tooling.

| Tool | Version | Purpose | Source |
|------|---------|---------|--------|
| Docusaurus (all `@docusaurus/*`) | 3.10.2 exact | Build, MDX, sidebar autogeneration | `docs/package.json` [VERIFIED: repo] |
| Node | `.nvmrc` says 24; this machine runs v22.22.0 and the build still passes | build | [VERIFIED: `node --version`, build run] |
| Vale | 3.24.0 at `tools/.bin/vale` | prose gate | [VERIFIED: `tools/.bin/vale`, `.vale.ini`] |
| Python venv `.venv` (3.11.4) with beautifulsoup4 4.15.0, lxml 6.1.3, markdownify 1.2.3, six 1.17.0 | pinned in `tools/requirements.txt` | one-off audit pre-fill and exercise HTML clean-up | [VERIFIED: `.venv/bin/python -c "import bs4, markdownify, lxml"`] |
| System `python3` | has no `bs4` | stdlib-only checkers (`check-dwc-*.py`, `sync-samples.py`) | [VERIFIED: import error] |

### Package Legitimacy Audit

No external packages are installed in this phase. The converter's four pinned packages were approved in Phase 5 (`05-01-SUMMARY.md`). slopcheck was not run because there is nothing to install. Packages removed: none. Packages flagged: none.

Rule for the planner: any new dependency (for example a hashing or diff library) is not needed; use `hashlib`, `difflib`, `xml.etree`, `zipfile` from the standard library.

## Section 1: Moodle unit to DWC page map (Q1)

Measured from `import/unpacked/dwc/` with a scratch script (BeautifulSoup text word count, `<pre>` count, `<img>` references, hash comparison against all SHA-1 of `docs/docs/dwc/**/img/*`). "cov" = image already in the DWC chapter by SHA-1; "park" = matches a parked image; "other" = neither (includes 2 images with no file in the backup, see Pitfall 5). DWC words are `wc -w` of the target page including front matter.

There are **22 modules**: 20 pages (one is the resource page `page_57`) and 2 books (`book_56` prerequisites with 1 chapter, `book_67` upgrading with 4 chapters). 11 `assign_*`, `forum_55`, `feedback_121` are not audit units. All 35 modules are `visible=1`, no hidden book chapters.

| Sec | Module | Moodle name | DWC target page(s) | Moodle words / `<pre>` / images (cov, park, other) | DWC words / fences / images |
|-----|--------|-------------|--------------------|-----------------------------------------------------|------------------------------|
| 0 | book_56 (chapter 35) | Prerequisites - READ FIRST! | `prerequisites.mdx` | 511 / 0 / 1 (0,0,1: `iconInfoLogo.png`, not in backup) | 543 / 0 / 0 |
| 0 | page_57 | Useful Resource Links | `resources.mdx` | 504 / 0 / 0 | 515 / 0 / 0 |
| 1 | page_58 | 1A. Registering and Launching a DWC App | `01-gui-to-bui-to-dwc/01-registering-launching.md` | 1,117 / 0 / 10 (2,0,8) | 1,032 / 0 / 2 |
| 1 | page_59 | 1B. Running a "Hello World" App in BUI and DWC | `.../02-hello-world.md` | 1,072 / 2 / 9 (0,0,9); attachments `MessageBox.bbj`, `01_GUI2BUI2DWC.zip` | 977 / 2 / 0 |
| 1 | page_60 | 1C. Taking an App From GUI to BUI to DWC | `.../03-gui-to-bui-to-dwc.md` | 3,447 / 8 / 15 (0,0,15, one is the 250 KB `BBjTopLevelWindow Structure.svg`); attachments ZIP, `GUISample.bbj`, `DWC1.bbj`, `DWC2.bbj`, `Sample.bbj`, `Sample.css` | 1,400 / 15 / 0 |
| 2 | page_116 | 2A. Introduction to CSS | `02-browser-developer-tools/01-intro-to-css.md` | 880 / 8 / 0 | 929 / 8 / 0 |
| 2 | page_62 | 2B. Introduction to the Browser's Developer Tools | `.../02-developer-tools.md` | 2,667 / 2 / 15 (6,4,5); attachments `2A_Files.zip`, `DWC1.bbj` | 1,144 / 6 / 6 |
| 2 | page_63 | 2C. CSS Styles and CSS Custom Properties | `.../03-css-custom-properties.md` | 3,722 / 18 / 18 (0,0,18) | 1,087 / 20 / 0 |
| 2 | page_64 | 2D. DWC Themes | `.../04-dwc-themes.md` | 893 / 5 / 7 (0,0,7) | 670 / 4 / 0 |
| 3 | page_66 | 3A. Working with ARC Files | `04-upgrading-apps/01-arc-files.md` | 312 / 0 / 2 (2,0,0) | 372 / 0 / 2 |
| 3 | book_67 (chapters 36 to 39) | 3B. Upgrading BBjGrids | `.../02-upgrading-grids.md` | 1,196 / 5 / 0 (Overview 409, Installation 157, ResultSet and DataRow 478 with 4 pre, Simple GridEx 152 with 1 pre) | 399 / 0 / 0 |
| 4 | page_69 | 4A. DWC Controls With Extended Attributes | `05-dwc-controls/index.md` | 1,388 / 0 / 9 (7,2,0) | 572 / 0 / 7 |
| 5 | page_71 | 5A. CSS Layout Options | `06-flow-layouts/index.md` | 4,119 / 4 / 15 (9,6,0) | 677 / 6 / 9 |
| 6 | page_74 | 6A. Icon Pools | `07-icon-pools/index.md` | 1,531 / 7 / 8 (7,0,1) | 273 / 5 / 7 |
| 7 | page_76 | 7A. Control Validation | `08-control-validation/index.md` | 2,921 / 13 / 13 (13,0,0) | 386 / 5 / 13 |
| 8 | page_78 | Handling Client Files | `09-browser-constraints/index.md` | 156 / 0 / 1 (1,0,0) | 313 / 5 / 1 (whole chapter) |
| 8 | page_79 | Printing and Print Preview in the Client | `09-browser-constraints/index.md` | 188 / 1 / 2 (0,0,2) | (same page) |
| 9 | page_80 | Embedding a JavaScript Chart Component | `10-embedding-components/index.md` | 717 / 7 / 0 | 381 / 4 / 0 (whole chapter) |
| 9 | page_81 | Receiving Events from JavaScript in BBj | `10-embedding-components/index.md` | 218 / 2 / 0 | (same page) |
| 9 | page_82 | Working with Slots | `10-embedding-components/index.md` | 354 / 1 / 2 (0,0,2) | (same page) |
| 10 | page_117 | 10A. Media Queries | `11-advanced-responsive/01-media-queries.md` | 436 / 1 / 1 (1,0,0) | 403 / 4 / 1 |
| 10 | page_120 | 10B. Transitions | `11-advanced-responsive/02-transitions.md` | 230 / 2 / 0 | 394 / 7 / 0 |

Notes:
- DWC chapters 03 (`03-dwc-debugging`) and 12 (`12-deployment`) have no Moodle counterpart. Chapter 11 `index.md` and the chapter `index.md` files of 01, 02, 04 have no module; section summaries for S1 (170 words), S2 (147), S3 (64) are "Concepts Covered in This Chapter" lists and S4 to S10 summaries are empty. [VERIFIED: `sections/section_*/section.xml`] The chapter overview lists likely already exist in the DWC `index.md` pages; the audit can record them as one "section summary" row per chapter.
- Where the Moodle page is much larger than its DWC target (1C 3,447 vs 1,400 words and 15 images vs 0; 2C 3,722 vs 1,087 and 18 images vs 0; 5A 4,119 vs 677; 7A 2,921 vs 386; 6A 1,531 vs 273; 2B) the audit has real keep/drop work. Pages 3A, 8A/8B, 9A to 9C and 10A/10B are small.
- Total across all units: 89 `<pre>` blocks in pages, books and assignment intros; about 128 `<img>` references in the 22 modules (about 72 not matched by hash to any current DWC or parked image).

**Suggested split for audit and apply work** (by size, not a plan): (1) S0 plus S3 plus S8 to S10 light units (about 4,000 words, 8 images); (2) S1 (5.6k words, 34 images, 15 `<pre>`), 1C alone is 3.4k words; (3) S2 split into 2A+2B+2D and 2C (2C has 18 `<pre>` and 18 uncovered images); (4) S4 plus S5 (5.5k words, 24 images, 16 covered and 8 parked); (5) S6 plus S7 (4.4k words, 21 images, 20 `<pre>`). The audit file itself is one commit (D-18) but can be written by several plans/waves into separate unit sections.

## Section 2: Parked images, hash method, and the 2022 list (Q8, Q9)

### 2.1 Method (reusable by a one-off script, no `import/` needed afterward)
1. `files.xml` lists each file with `contenthash` (SHA-1 of the blob), `filename`, `component`, `filearea`, `itemid`, `contextid`, `mimetype`. Skip rows with `filename == "."` (directories).
2. SHA-1 every file in `docs/docs/dwc/**/img/*` and `tools/data/dwc-unused-img/*` with `hashlib.sha1`.
3. Match on `contenthash`. A match is a "2022 match" when any Moodle filename sharing that hash contains `2022`. In this backup every 2022 name is a `screenshot 2022-MM-DD at HH.MM.SS` timestamp (138 file rows, 127 unique hashes), and no DWC hash is shared between a 2022-named and a non-2022-named Moodle file (no ambiguous case). [VERIFIED: scratch scripts]
4. Result: all 60 DWC images (48 in chapters, 12 parked) match a Moodle file; 42 match a 2022 name: **30 in chapters** and **12 parked** (all 12 parked have 2022 names). 18 chapter images match non-2022 names (for example `EclipsePreferences.png`, `CSSGrid.png`).
5. Moodle totals: 199 image file rows (189 png, 9 gif, 1 svg), 180 unique hashes. This does not equal the 184/130 figures in CONTEXT; the 42-image result does reproduce. Use the measured numbers in the audit summary.

### 2.2 Every referencing page and line
Every one of the 30 chapter images is referenced exactly once, from one page, and every image reference in `docs/docs/dwc` begins a line flush left (`![alt](./img/...)`, 48 references; none in lists or tables). Three images (`css-layout-samples-2/3/4`) sit directly under a bold caption line (`06-flow-layouts/index.md` lines 145, 148, 151); an inserted `{/* */}` line between caption and image is fine (see Section 4.2).

### 2.3 Exact current list: chapter images to mark (30)
Paths relative to `docs/docs/dwc/`. Line numbers are today's; markers shift them, so the verify script must match by reference text, not line number.

| DWC image | Moodle file name (2022) | SHA-1 | Referenced at |
|-----------|--------------------------|-------|----------------|
| 01-gui-to-bui-to-dwc/img/em-registration.png | Microsoft Edge - localhost8888bbjememapp- screenshot 2022-07-01 at 13.17.10.png | acc8abf4f8ae143d7caeb0d177c529da6da8eba9 | 01-gui-to-bui-to-dwc/01-registering-launching.md:82 |
| 05-dwc-controls/img/discrete-labels.png | Microsoft Edge - Using Discrete Labels- screenshot 2022-07-12 at 16.50.35.png | c00e1f8d65e615474a7f347149b5b3ddbb7de4fe | 05-dwc-controls/index.md:108 |
| 05-dwc-controls/img/dwc-themer.png | Microsoft Edge - BBj DWC Themer- screenshot 2022-07-11 at 16.22.00.png | 3f22531690492bf396e3e3aeb635139031a25163 | 05-dwc-controls/index.md:43 |
| 05-dwc-controls/img/label-attributes.png | Microsoft Edge - Using Label Attributes- screenshot 2022-07-12 at 16.49.04.png | 0dbb11708239c156575140cc60bfdf3a744f9f9f | 05-dwc-controls/index.md:106 |
| 05-dwc-controls/img/tree-search.png | Microsoft Edge - BBj Tree Search- screenshot 2022-07-11 at 16.15.12.png | a291d932b05a49dfb8c6626deffea545cd7fbd2a | 05-dwc-controls/index.md:73 |
| 06-flow-layouts/img/css-grid-playground-1.png | Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.34.55.png | d019b9dae938a53654a4e544a25e8ed2fa6e48fc | 06-flow-layouts/index.md:139 |
| 06-flow-layouts/img/css-layout-samples-1.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.30.19.png | 5d7baa17d23a840bef25d3eb1d3ecd7596ac9a03 | 06-flow-layouts/index.md:135 |
| 06-flow-layouts/img/css-layout-samples-2.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.31.17.png | 0c3b458892c42c949440aa052e52e942242de51d | 06-flow-layouts/index.md:146 |
| 06-flow-layouts/img/css-layout-samples-3.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.31.50.png | 67f8792c60f87d523daf53f340f49f6e7ec1d243 | 06-flow-layouts/index.md:149 |
| 06-flow-layouts/img/css-layout-samples-4.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 14.49.56.png | f9a42ee80d5ecaeca639e8606a47c201000ee766 | 06-flow-layouts/index.md:152 |
| 07-icon-pools/img/icon-pools-1.png | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.26.43.png | 0b43585e49cb684a14ca78e4ab9636a8ad4eeef8 | 07-icon-pools/index.md:20 |
| 07-icon-pools/img/icon-pools-2.png | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.28.33.png | 873fc56a693e39a0abf6d35f503fab14aa5d1882 | 07-icon-pools/index.md:57 |
| 07-icon-pools/img/icon-pools-3.png | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 18.29.12.png | 73dbd77682e22ec2bf75950ac293f2741159a1c9 | 07-icon-pools/index.md:59 |
| 07-icon-pools/img/icon-pools-4.png | Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 15.55.25.png | 2600307395fab30fdff48d3b84dd4c41ae2b1c1e | 07-icon-pools/index.md:83 |
| 07-icon-pools/img/icon-pools-5.png | Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 15.58.16.png | 312569a02c887ef3986550390613b159574e5d23 | 07-icon-pools/index.md:85 |
| 07-icon-pools/img/icon-pools-6.png | Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 16.38.04.png | f575c3547b6594715f6a02464fc1b16b58818f69 | 07-icon-pools/index.md:87 |
| 07-icon-pools/img/icon-pools-7.png | Microsoft Edge - DWC Icon Pools- screenshot 2022-07-12 at 16.46.25.png | b44abe49b789518eee7f90cde56ba92fa4e57cd3 | 07-icon-pools/index.md:89 |
| 08-control-validation/img/regex101.png | Google Chrome - regex101 build test and debug regex- screenshot 2022-07-18 at 07.36.14.png | 2fabc6c2daaacccf922c9850037b50730d6e8fe9 | 08-control-validation/index.md:115 |
| 08-control-validation/img/validation-1.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 19.40.44.png | 3f6abc1c62b60f23a283d7558fcf45554a49e2d8 | 08-control-validation/index.md:47 |
| 08-control-validation/img/validation-2.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 20.35.11.png | b7c645fcb4c601274bd880d68afa101babe5949b | 08-control-validation/index.md:49 |
| 08-control-validation/img/validation-3.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 07.31.31.png | a2c74e4733272ec280300bcc8a157a453ca1e00e | 08-control-validation/index.md:84 |
| 08-control-validation/img/validation-4.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 08.35.16.png | 7bf34d2a52034005eaeda73998483b16d0172f3b | 08-control-validation/index.md:86 |
| 08-control-validation/img/validation-5.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 10.46.11.png | bad61b8e5120520d8bcd05e2615651fb969009b6 | 08-control-validation/index.md:99 |
| 08-control-validation/img/validation-6.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.21.28.png | e94da338558f053ea15f9c5943944aba38f678cb | 08-control-validation/index.md:107 |
| 08-control-validation/img/validation-7.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.22.25.png | 452aec4fde5a8f7463d5b379c3e40211c32ec59c | 08-control-validation/index.md:109 |
| 08-control-validation/img/validation-8.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.26.37.png | 5f3bd7044e42f5238e93acf01d5ff7fcbb63dcaa | 08-control-validation/index.md:117 |
| 08-control-validation/img/validation-9.png | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 12.35.50.png | ee215cbc7b324b459416a12df6042fed68f82706 | 08-control-validation/index.md:121 |
| 08-control-validation/img/validation-demo.gif | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 20.30.58.gif | c450a12285b6d0a4c728e57c903a3dd4a0eec10c | 08-control-validation/index.md:59 |
| 08-control-validation/img/validation-demo2.gif | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 11.01.58.gif | 27af0af1c707640002b611328172894b4be9bdca | 08-control-validation/index.md:101 |
| 08-control-validation/img/validation-demo3.gif | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-18 at 12.49.24.gif | 80e1ee9343c0acbacf8fda855dd8adac70d4dc8f | 08-control-validation/index.md:119 |

Chapters 02, 04, 09, 11 images and the other 18 images match non-2022 Moodle names and get no marker. Note that GIFs are in the list; the verify script's reference regex must accept `.gif` (and `.svg` for new content), not only `.png`.

### 2.4 Parked images (12): Moodle file and unit (Q9)
All 12 match exactly one Moodle file by SHA-1; each is used in exactly one unit and every one has a 2022 name, so a "keep" move into a chapter adds it to the marker list (the markers commit comes after kept material, D-18).

| Parked file (`tools/data/dwc-unused-img/`) | SHA-1 prefix | Moodle unit | Moodle file name |
|--------------------------------------------|--------------|-------------|-------------------|
| css-grid-playground-2.png | 85ee968b | page_71 (5A) | Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.36.14.png |
| css-grid-playground-3.png | c73eee12 | page_71 (5A) | Safari - CSS Grid Playground- screenshot 2022-07-17 at 13.50.26.png |
| css-layout-samples-5.png | e614abad | page_71 (5A) | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 17.37.11.png |
| css-layout-samples-6.png | 6bd73580 | page_71 (5A) | Microsoft Edge - BBj DWC CSS Layout Samples- screenshot 2022-07-17 at 17.42.33.png |
| hello-bbj-dwc-grid.png | 2ce434e1 | page_71 (5A) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-17 at 13.58.07.png |
| responsive-demo.png | 8ce7ce0f | page_71 (5A) | Google Chrome - 24625 ... client-side validation functions ...- screenshot 2022-07-17 at 17.38.06.png |
| dev-tools-screenshot-1.png | 0c93f9d6 | page_62 (2B) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 14.54.21.png |
| dev-tools-screenshot-2.png | 2ba367e1 | page_62 (2B) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 15.16.53.png |
| dev-tools-screenshot-3.png | c59d3ba6 | page_62 (2B) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-05 at 15.19.27.png |
| dev-tools-screenshot-4.png | d6db442d | page_62 (2B) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-01 at 09.54.59.png |
| hello-dwc-4a.png | 7bcb6d08 | page_69 (4A) | Microsoft Edge - Hello BBj DWC- screenshot 2022-07-11 at 15.23.51.png |
| message-box.png | 37eade8d | page_69 (4A) | Microsoft Edge - MessageBox- screenshot 2022-07-11 at 15.22.07.png |

So the parked images belong to three units (5A: 6, 2B: 4, 4A: 2). The scratch script should print the full 40-hex SHA-1 into the audit rows.

### 2.5 Image-map choice
`tools/data/dwc-image-map.json` has 66 entries (48 moved, 12 parked, 6 not-moved) and `check-dwc-relocation.py` asserts those exact counts. It reads the map and files at commit 1 (`--rev 542399a`), so editing the working-tree map does not break it (Section 8), but a working-tree run of that script already fails today (26 failures, verified) and nobody uses it that way. Recommendation: leave `dwc-image-map.json` untouched and record all Phase 6 image moves in a sibling `tools/data/dwc-gap-image-map.json` (Moodle file name, SHA-1, new path, alt source), including "parked to chapter" moves. CONTEXT D-15 allows either.

## Section 3: Assignment intro HTML (Q10)

Eleven assign intros, no attached files, no `<img>`, no `<code>` elements, `duedate` set on 70, 72, 73, 75, 77 (drop). Measured:

| Assign | Section | Words | `<pre>` | Links in the intro | Notes |
|--------|---------|-------|---------|--------------------|-------|
| 61 GUI to BUI to DWC | S1 | 139 | 0 | `github.com/BasisHub/DWCTraining/blob/main/01_GUI2BUI2DWC/GUISample.bbj` ("provided sample"), `github.com/BasisHub/DWCTraining` ("GitHub training repository"), `basishub.github.io/basis-next/#/dwc/bbj-button?id=properties` | Replace first two with file name plus `pathname:///files/dwc/01_GUI2BUI2DWC.zip`. basis-next is the dead predecessor host; Phase 5 mapped it to `https://dwc.style/docs/#/dwc/...` (`tools/data/intro-bbj-link-map.json`). Uses `$00100000$` (BBj hex flag, keep in inline code). |
| 65 Add Theming Support | S2 | 53 | 0 | `https://us.bbx.kitchen/webapp/DWCThemer` | Provisional successor (P5 D-27); same URL already in `dwc/resources.mdx`. |
| 68 BBjGridExWidget | S3 | 54 | 0 | none | Mentions Eclipse, `Demo.bbj`, CDStore `CDINVENTORY`; no ZIP applies except `03C_Grid2GridEx.zip` (only if the sentence needs a download). |
| 70 search in a BBjTree | S4 | 246 | 0 | `basishub.github.io/basis-next/docs/#/dwc/BBjTree` twice | Names `DWCTraining/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj`; link to `04_ExtendedAttributes.zip`. Dead link maps to `https://dwc.style/docs/#/dwc/` form (verify target by hand; not verified here). |
| 72 CSS grid layout | S5 | 246 | 0 | none | `DWCTraining/05_CssLayouts/Exercise-ConvertToCssLayout.bbj`; ZIP `05_CssLayouts.zip`. Numbered goals "1)" to "5)" come out as plain paragraphs from the converter (Pitfall 7). |
| 73 CSS Flexbox | S5 | 127 | 1 (single-line `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")`) | none | The `<pre>` is unwrapped to a bold paragraph by `convert`; make it a `bbj` fence and `bbj_check_syntax` it (D-05). |
| 75 icon in a static text | S6 | 85 | 0 | none | `DWCTraining/06_IconPools/Exercise-IconPools.bbj`, refers to `DownloadButton.bbj` in the same folder (exists in `docs/examples/dwc/06_IconPools/`). ZIP `06_IconPools.zip`. |
| 77 email validation | S7 | 68 | 0 | none | `DWCTraining/07_ControlValiation/Exercise-BuiltInValidation.bbj` (folder name typo `ControlValiation` is real). ZIP `07_ControlValiation.zip`. |
| 83 embed a 3rd party component | S9 | 16 | 0 | `ionicframework.com/docs/components`, `shoelace.style/` | Live external links; keep. "3rd party" trips Google.Ordinal (error level), write "third-party". |
| 122 Media Queries | S10 | 101 | 1 (the `@media (width < 600px) { <CSS Selector> { <CSS Styles> } }` skeleton) | none | The `<pre>` becomes `css` fence. Offers `MediaQueryExample.css` and `MediaQueries.bbj` that ship nowhere: drop or rephrase (D-03). "DWCTraining Github" text goes. |
| 123 Transition on Button | S10 | 62 | 1 (`transition: <property> <duration> <timing-function> <delay>;`) | none | Offers `transitionToButtonCompleted.bbj` (ships nowhere): drop or rephrase. Source `<pre>` has an unclosed `<property` angle bracket; write `<property> <duration> ...` in a `css` fence. |

Moodle-specific or dead links: every `github.com/BasisHub/DWCTraining` URL (repo is not this one), every `basishub.github.io/basis-next` URL. None of the intros contains `moodle.basis-europe`, `pluginfile`, or `$@`.

## Section 4: Rendering facts proven by a probe build (Q3, Q4)

I added two temporary probe files in `docs/docs/dwc/05-dwc-controls/` (`90-exercise-probe.mdx` with `:::exercise` plus `<details>`, and `91-probe.md` with the marker), built, inspected `docs/build/...`, ran the route and anchor checks, and deleted both. `git status` is clean of them. [VERIFIED: probe build]

### 4.1 `<details>` with a titled fence in `.mdx`
Working shape (blank line after `<summary>`, blank line before `</details>`):

```mdx
:::exercise
...
:::

<details>
<summary>Possible solution</summary>

One sentence naming `Exercise-SearchBBjTree.bbj` and `Exercise-SearchBBjTreeComplete.bbj`, and a [ZIP link](pathname:///files/dwc/04_ExtendedAttributes.zip).

```bbj title="Exercise-SearchBBjTreeComplete.bbj"
...94 lines of source...
```

</details>
```

Observed output: `<details class="... alert alert--info ..." data-collapsed="true">` containing the paragraph with the ZIP link (`/Courses/files/dwc/...zip`), then `div.expandable-code expandable-code--collapsed` holding the code block with `div.codeBlockTitle` = the `title=`. The button read "Show all 95 lines". So the swizzled `docs/src/theme/CodeBlock/index.js` (`COLLAPSE_AFTER_LINES = 40`, wraps every fenced block whose children are a string, opt-out `noCollapse` in the meta string) applies inside `<details>`. `pathname:///files/dwc/<zip>` renders correctly inside details. Docusaurus' own `<details>` styling is used, no component import needed.

Rules: no indentation of the fence inside the JSX; leave the blank line after `</summary>` or the Markdown inside is not parsed. A fence file may have been missing its final newline (4.3).

### 4.2 `{/* */}` above an image in a `.md` file
A `.md` page with
```
{/* TODO: screenshot outdated? */}
![Tree Search Demo](./img/tree-search.png)
```
builds (default `markdown.format` is `mdx`, so `.md` is MDX), the HTML has no "TODO" text and the `<img ... class="img_ev3q">` is unchanged. `docusaurus-plugin-zooming` is configured with no custom options in `docusaurus.config.js`, so zoom is untouched. `onBrokenMarkdownImages: 'throw'` still validates the image path. Vale ignores the marker through `TokenIgnores = (\{/\*.*?\*/\})` in `.vale.ini`; the probe pair gave 0 errors/0 warnings/0 suggestions. If the marker directly follows a caption line (flow layout case), inserting it between the two lines keeps one paragraph and is fine.

### 4.3 Byte-compare pitfalls for solution fences (D-07)
Of the 7 solution files, five have no trailing newline: `Exercise-SearchBBjTreeComplete.bbj`, `Exercise-ConvertToCssLayoutComplete-Grid.bbj`, `Exercise-ConvertToCssFlexboxComplete.bbj`, `Exercise-BuiltInValidationComplete.bbj`, `DWC1.bbj`; `Exercise-IconPoolsComplete.bbj` and `DWC2.bbj` end with `\n`. None has CR, tabs, backticks, or non-ASCII. [VERIFIED: `od`/`grep`] Consequences: (a) when writing the fence, put the closing ``` on its own line (appending it to the last source line breaks the fence; the first probe failed with "Expected a closing tag for `<details>`"); (b) the drift check must compare `fence_text.rstrip("\n") == file_text.rstrip("\n")` (`wc -l` is one smaller than the displayed line count, the CodeBlock shows `lines+1` when there is no final newline); (c) generate the fences with a script rather than by hand, to prevent silent drift. Line counts to expect for the `ExpandableCode` threshold (>40 collapses): 04 Tree 95, 05 Grid 103, 05 Flexbox 52, 06 IconPools 51, 07 Validation 118, DWC1 40 (not collapsed), DWC2 53, using displayed lines. [VERIFIED for 04 Tree only; others derived from `wc -l`+1 for no-final-newline files]

### 4.4 Sample download link form (Q4)
Exact form in `docs/docs/dwc/samples.mdx`: `[01_GUI2BUI2DWC.zip](pathname:///files/dwc/01_GUI2BUI2DWC.zip)`. `pathname:///` bypasses Docusaurus' broken-link check; the existence of the target is checked instead by `verify-phase4.sh` (`grep -rhoE 'pathname:///files/dwc/[^)" ]+' docs/docs/dwc`, then `docs/static/files/dwc/<name>` and `docs/build/files/dwc/<name>` must exist) and by the intro book check for its own prefix. The existing ZIP names to use: `01_GUI2BUI2DWC.zip`, `02_CSSStylesAndCustomProperties.zip`, `03B_ArcFiles.zip`, `03C_Grid2GridEx.zip`, `04_ExtendedAttributes.zip`, `05_CssLayouts.zip`, `06_IconPools.zip`, `07_ControlValiation.zip`, `08_BrowserConstraints.zip`, `09_EmbeddingOtherComponents.zip`, `dwc-samples.zip`. There is no ZIP for `10_AdvancedResponsive`, so exercises 122/123 link no ZIP. Links to other docs pages use relative file paths (`./90-exercise-x.mdx`), validated by `onBrokenMarkdownLinks: throw`.

## Section 5: Tooling to reuse (Q2, first part)

### 5.1 `tools/moodle2docusaurus.py`
It is import-safe (`main()` is behind `if __name__ == "__main__"`), needs the venv (`.venv/bin/python`), and refuses to run as a converter after the Phase 5 generated-docs commit (`check_not_committed`, exit 2 unless `--force`); importing does not trigger that guard. Do NOT edit this file: `check-intro-bbj.py commits` regenerates the intro book from it and compares bytes with commit C2 whenever `import/*course-2*.mbz` exists.

Proven in this session (scratch script, `sys.path.insert(0, "tools"); import moodle2docusaurus as m`):
```python
rep = m.Report()
ctx = m.Ctx("a73", rep, {}, {}, None, {}, False)   # key, report, video_map, image_map, backup, images_out, fetch
md  = m.convert(assign_intro_html, "a73", ctx)       # works for the 11 assign intros (no images)
```
Reusable pieces: `convert` (clean_dom, link_pass incl. `documentation.basis.com` to `.cloud` and `http://localhost` to inline code, mdx_escape of `{`, `<`, tidy), `code_text(el)` (turns `<pre>`/`<p>`/`<br>` into plain text lines), `lang_of(text)`, `looks_like_code`, `wrap_loose`, `trim_breaks`, `mdx_escape`, `tidy`, `yaml_scalar`, `front_matter`, `xml_text`.

Not reusable as is:
- `Backup` only loads `book`, `assign`, `resource` activities and ignores `page_*` (`wanted_member` also filters pages out of unpacking). Write a small loader in the scratch script (`activities/page_N/page.xml` has `<page><name>`, `<content>` HTML-escaped, `contextid` on the root; books keep chapters in `book.xml`).
- `media_pass` requires an `image_map` entry per `(key, filename)` with `verdict "moved"`, a kebab `.png` name and alt text; for the audit use your own image resolver instead of calling `convert` on pages.
- `code_pass` only fences `<code>` elements (`clean_dom` unwraps `<pre>` as not in `ALLOWED`). For the 3 assign `<pre>` blocks and the 89 `<pre>` blocks in pages, call `code_text()` on `soup.find_all("pre")` yourself. `CODE_OVERRIDES` is keyed by course-2 chapter ids and must not be reused.
- `lang_of` is a first guess: over the 89 course-4 `<pre>` blocks it returns bbj 53, css 11, html 2, javascript 7, None 16. Anything containing `!`, `$`, or `::` is classed bbj, so CSS or text with `!important`/`::part` can be misclassed; every kept block still needs a human language decision and the MCP check for `bbj`.

### 5.2 Image resolution for the audit pre-fill (important)
Do not resolve `@@PLUGINFILE@@/<name>` against the page's own context only:
- 11 images used by S1 (1A, and `EclipsePreferences.png`) and S2 live in `component=course, filearea=section, itemid=20|21`, not in the page's `mod_page` context. Fall back to a global lookup by filename, preferring the same context.
- The same filename can map to different contents (`image.png` x4, `image (1).png` x3, `QASmall.png` x3 across contexts), so prefer same-context, then section area, then report ambiguity.
- Strip `?time=...` and URL-decode (`dwc_titlebar_text_example.png?time=1719896091228`, `CSSCustomPropertiesDarkMode.png?time=...`, `sizeChange.png?time=...`, `%20`).
- Two references have no file in the backup: `iconInfoLogo.png` (prerequisites chapter, a Moodle icon) and a long hash-named external image in 1A (`vixBfU9q...`, an off-site URL). `QASmall.png` is a small Moodle Q&A icon (content not inspected).
- `docs/docs/dwc/**` GIFs and the 250 KB `BBjTopLevelWindow Structure.svg` (`18b4c234`, no `<script>`, `foreignObject`, or external refs; black fills, check it in dark mode) must be accepted by any new image regex.

### 5.3 Moodle samples already in the repo
The Moodle attachments are the same as `docs/examples/dwc/` after normalising CRLF to LF: `DWC1.bbj`, `GUISample.bbj`, `MessageBox.bbj`, `DWC_ExternalCSS/Sample.bbj` match; `DWC2.bbj` differs only by the already-updated `dwc.style` links and comment edits. `01_GUI2BUI2DWC.zip` contents (DWC_AppThemes, DWC_ExternalCSS, DWC1, DWC2, GUISample, MessageBox) are all in `docs/examples/dwc/01_GUI2BUI2DWC/`. `2A_Files.zip` holds `DWC1.bbj` (same) and `SetStyle.bbj` which is longer than the repo copy (4,420 vs 2,921 characters; the repo copy has abbreviated wording). That longer file is a possible lead for Phase 7 QUAL-03 (`SetStyle.bbj` fails the syntax check), not for this phase. The only attachment not in the repo is `BBjTopLevelWindow Structure.svg`. A new `.bbj` sample would break `verify-phase4.sh` ("syntax report covers all 44 samples", Section 8), so avoid adding any.

## Section 6: Page shapes and pointer anchors

### 6.1 Exercise page shape (copy from intro-bbj)
`docs/docs/intro-bbj/03-web-development/90-exercise-responsive-login-dialog.mdx`: front matter `title: "Exercise: ..."` (sentence case) and `description: "..."` (at most 160 chars, Phase 5 contract), no H1, body inside `:::exercise` ... `:::` (the Admonition keyword is registered in `docusaurus.config.js` `admonitions.keywords: ['exercise']`; the custom type lives in `docs/src/theme/Admonition/Types.js`). `docs/docs/authoring/components.mdx` is the fixture. Headings inside the exercise start at H3 if a page heading is needed, since the converter ranks "Exercise Goals" to H2 (Pitfall 7).

### 6.2 Old exercise anchors that must keep resolving (from `tools/data/dwc-old-routes.json`)
| Route | Anchor id | File today |
|-------|-----------|------------|
| /advanced-responsive | `exercises` | `11-advanced-responsive/index.md:60` `## Exercises` (two-bullet list) |
| /advanced-responsive/media-queries | `exercise-media-queries` | `01-media-queries.md:107` `## Exercise: Media Queries` |
| /advanced-responsive/transitions | `exercise-transition-on-button` | `02-transitions.md:133` `## Exercise: Transition on Button` |
| /control-validation | `exercise-adding-validation-to-an-email-field` | `08-control-validation/index.md:103`, with `validation-6`, `validation-7`, `regex101`, `validation-8`, `validation-demo3`, `validation-9` below it |
| /embedding-components | `exercise-embed-a-3rd-party-component` | `10-embedding-components/index.md:92` `{#exercise-embed-a-3rd-party-component}` explicit id |

`check-dwc-anchors.py` reads each old route's page from `docs/build/docs/dwc/<name>.html` and requires the `id` in an `<h1-6>` inside `<article>`; extra ids are fine. The stub pointer text ("Run `DWCTraining/...`") is the only thing that changes (D-04). The other `DWCTraining/` mentions in `06-flow-layouts`, `04-dwc-themes`, `05-dwc-controls`, `08`, `10` are outside the exercise stubs; leave them (D-03 covers exercise text only) unless the audit moves them.

### 6.3 Folder and route facts for the 11 pages
Slugs drop numeric prefixes, e.g. `01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx` becomes `/docs/dwc/gui-to-bui-to-dwc/exercise-gui-to-bui-to-dwc`. No collision with the 27 old routes. Chapters 05, 06, 07, 08, 10 are single-page (`index.md` only; CONTEXT lists 05, 07, 08, 10, and chapter 06 is also single-page and gets two exercises 90 and 91). Chapter 01 gets one, 02 one (`02-browser-developer-tools/90-exercise-theming-support.mdx`), 04 one (`04-upgrading-apps/90-exercise-bbjgridexwidget.mdx`), 11 two.

## Section 7: Sidebar (Q7)

- DWC top-level positions today: overview 0, prerequisites 0.1, samples 0.2, resources 0.3; intro-bbj: overview 0, structure 0.1, audience 0.2, contribute 0.3. [VERIFIED: grep] `sidebar_position: 0.4` places `exercises.mdx` after the last of these and before chapter categories (`_category_.json` positions 1 to 12 for DWC, 1 to 4 for intro). Sidebars are autogenerated (`docs/sidebars.js` over `dirName: <book id>`).
- Single-page chapter plus a 90-page: probe-verified. `05-dwc-controls` kept its category link (`/docs/dwc/dwc-controls`, `_category_.json` link `{"type":"doc","id":"dwc/dwc-controls/index"}`) and the sidebar HTML for that page listed the new sub-pages (`.../dwc-controls/exercise-probe`, `.../dwc-controls/probe`); `check-dwc-routes.py` top-level order still passed. Sub-pages order by numeric prefix (90 after 01/02/03).
- New page also creates `sitemap.xml` entries; `check-dwc-routes.py` treats unknown routes as failures (Section 8).

## Section 8: Existing checks and how new content interacts (Q2, second part)

Baseline verified green on the unchanged tree: build, `check-dwc-routes.py`, `check-dwc-anchors.py`, `sync-samples.py --check`, `check-intro-bbj.py structure`, `check-dwc-relocation.py --rev 542399a` (needs `../bbj-dwc-tutorial` clone, present), Vale error level on `docs/docs/dwc` (0).

| Check | Command | What new content does | Required change |
|-------|---------|------------------------|-----------------|
| DWC routes and sidebar | `python3 tools/check-dwc-routes.py` | FAILS: `expected` is the 27 snapshot routes plus `/overview`; any new page is reported "extra route" (the probe produced exactly that). Also `TOP_ORDER` (must gain `exercises` after `resources`) and `SUB_ORDER` (chapters 01 and 11 gain exercise pages; `got` is every menu href below the chapter, so adding a page changes it). | Edit in the commit that adds the pages: add the 12 new routes (11 exercises + `/exercises`) as a named allowlist, update `TOP_ORDER`, extend `SUB_ORDER` for 01 and 11 and optionally add the single-page chapters (05, 06, 07, 08, 10). Keep the "snapshot content routes" assertion (27) unchanged. |
| DWC anchors | `python3 tools/check-dwc-anchors.py` | Stays green if old headings keep their ids (306 present, 1 allowlisted). Extra anchors are fine. | none; guard the five anchors in Section 6.2. |
| Relocation | `python3 tools/check-dwc-relocation.py --rev <C1>` | Unaffected: Check A, B, C all read pages, file list, map and image blobs from git revision `542399a` (`read_new`/`list_new`/`git show`). Only the old tree comes from `../bbj-dwc-tutorial` (`965da6d`). Without `--rev` it already fails (26 failures) and is never run that way. `verify-phase4.sh` finds C1 by exact subject and SKIPs if the source clone or the commit is missing. | none. Do not rewrite or squash history containing `542399a`; merge with commits preserved (Phase 4 conditions). |
| `verify-phase4.sh` samples section | via `bash tools/verify-phase4.sh` | `sync-samples.py --check` stays green if ZIP sources are unchanged. "download targets exist" needs at least 11 targets and every `pathname:///files/dwc/...` in `docs/docs/dwc` must exist in static and build: new ZIP links to existing ZIPs pass. "syntax report covers all 44 samples" requires exactly 44 `.bbj` files in `docs/examples/dwc` and a row for each in `tools/data/dwc-samples-syntax.md`: adding or removing a `.bbj` fails it. | Avoid new `.bbj` files; if unavoidable, update the 44 count and add syntax rows in the same change. |
| `verify-phase4.sh` content section | | LIVE-01 grep `PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/` must stay empty over `docs/docs`; no `<Image`/`IdealImage`; no dotfiles; Vale error level on `docs/docs/dwc`. Exercise text with `$00100000$` is not matched by `\$@[A-Z]+`. | Keep Moodle-isms out; Vale error level clean. |
| Intro-bbj structure | `python3 tools/check-intro-bbj.py structure --build docs/build` (inside `verify-phase5.sh`) | FAILS when `docs/docs/intro-bbj/exercises.mdx` exists: `expected_files()` is exactly `TOP_PAGES` + section files, anything else is "unexpected file", and `len(.mdx expected) == 38` is a literal contract. `exercises.mdx` also needs title, description of at most 160 chars, and a built route. | Edit `tools/check-intro-bbj.py`: add `"exercises.mdx": 0.4` to `TOP_PAGES` and change `38` to `39` (line ~235). |
| Intro-bbj overview | same | Overview checks: `<DocCardList items=` hrefs equal the 4 section slugs in order, and a "Start with [...](./01-getting-started/index.mdx)" line. | Put the exercises link in prose outside the `DocCardList` block (for example a sentence after "Start with"). Never add a card or `/docs/intro-bbj/...` href inside the block. |
| Intro-bbj content | `check-intro-bbj.py content` | Counts exactly 8 image references over `docs/docs/intro-bbj`, bans `&nbsp;`, `<br`, `<span`, H1, localhost links, fence languages outside `{bbj, java, css, html, javascript, bash, json}`. | The intro `exercises.mdx` must contain no images and only allowed fence languages. |
| Intro-bbj edits | `check-intro-bbj.py edits` | Over every intro page: no em dash (U+2014), no banned strings (`basishub.github.io/basis-next`, `hot.bbx.kitchen`, `Save as`, ...), Vale errors, link-map replacements. | Page content must obey these. |
| Intro-bbj commits | `check-intro-bbj.py commits` | Reads commits C1/C2 by subject and regenerates from the converter; independent of later edits as long as `tools/moodle2docusaurus.py` is unmodified. | Do not edit `moodle2docusaurus.py`. |
| `sync-samples.py --check` | | `tracked_files` uses `git ls-files`: any new sample must be `git add`ed before ZIP regeneration. | No new sample expected; if a kept attachment adds one, `git add` then `python3 tools/sync-samples.py dwc`. |
| `verify-phase1/2/3.sh`, `prove-gates.sh` | | Reference dwc only through the chapter route `gui-to-bui-to-dwc/registering-launching` and the sidebar of `overview.html` (unchanged). Phase 2 `--local` runs `vale docs/docs` (exit 0 means no errors) and a probe file `docs/docs/dwc/99-vale-probe.mdx`. | none. |
| GitHub `reviewdog.yml` | PR | `vale-action` with `files: docs/docs`, `filter_mode: file`, `fail_on_error: true`: every file touched in the PR is checked in full, warnings and suggestions are posted as review comments, only error-level findings fail the job. | Expect many warning comments on touched DWC pages (Google.Headings, Colons, WordListCase, We); they do not fail. Keep error level at 0 on every touched file. |

Shell scripts: `bash tools/*.sh` was denied to executor subagents in Phases 4 and 5 (`04-03`, `04-06`, `05-04`, `05-06` SUMMARYs); this agent also had it denied. Plans must say "user runs `bash tools/verify-phase6.sh` with `!`" and give the underlying Python and npm commands that agents can run directly.

## Section 9: Architecture, pitfalls, and don't-hand-roll

### Pre-fill script design (D-12)
```
import/unpacked/dwc/{files.xml, files/<aa>/<sha1>, activities/*, sections/*}
        |
        v  (scratch script, .venv python, imports tools/moodle2docusaurus helpers read-only)
   per module: HTML -> items (heading groups, <pre> via code_text + lang_of, <img> via resolver, <a> links, attachments)
        |  SHA-1 of every DWC image (chapters + dwc-unused-img) -> covered/parked/new
        v
   draft tables  ->  Claude hand-writes verdict + reason  ->  tools/data/dwc-gap-audit.md (committed)
                                        |  keep rows  ->  edits in docs/docs/dwc/** + img/ + gap image map
        v
   tools/data/dwc-2022-screenshots.json (DWC path, Moodle name, sha1) generated AFTER kept material (needs import/ once)
```
The committed audit must carry Moodle file names and SHA-1s only, no `import/` paths (D-12). Do not commit the scratch script unless it is useful; if committed, put it in `tools/` and keep it from depending on `import/` at import time.

### Common Pitfalls
1. **Route and order checkers fail on the first new page.** Cause: `check-dwc-routes.py` and `check-intro-bbj.py` pin the end state. Avoid: edit the checkers in the same commit as the pages (Section 8). Warning sign: "extra route" or "unexpected file" lines.
2. **Solution fence drifts from the example file.** Cause: five of the seven files lack a final newline; hand-pasting loses/adds blank lines. Avoid: generate fences with a script and compare with `rstrip("\n")`.
3. **MDX blank-line rules in `<details>`.** No blank line after `</summary>` leaves the fence unparsed; unclosed fence yields "Expected a closing tag for `<details>`". Avoid: shape from 4.1, `node tools/check-mdx.mjs <file.mdx>` on new pages.
4. **Marker verification by line number.** Markers shift lines. Avoid: match `![...](./img/NAME)` references and require the previous non-empty line to be the exact marker; reject markers whose next line is not an image of a listed hash.
5. **Image resolution errors in the audit.** Section-area files, duplicate filenames with different content, `?time=` suffixes, off-site and missing icons (5.2). Avoid: resolver order and an explicit "unresolved" verdict row, not silent skip.
6. **"42 images" is not "42 markers".** 30 chapter images today. The 12 parked get markers only if kept and moved (D-15 then D-16), so generate the JSON last.
7. **Converter output needs hand fixes for assignment text.** Numbered goals "1)" stay as separate paragraphs, `**Exercise Goals:**` becomes an H2, bold-wrapped code lines are not fenced, `<pre>` is unwrapped, `{`/`<` in prose are escaped with backslashes (`\{`, `\<`). All three `<pre>` cases (73, 122, 123) need fences. Re-check the result in the build; use `{`...`}` only inside fences.
8. **Vale error rules that fire on Moodle-derived prose** (from Phase 4/5 SUMMARYs and `.github/.styles`): `Google.Quotes` (commas and periods go inside double quotes), `Google.Exclamation` ("Good luck!" from 122/123), `Google.Ordinal` ("3rd party", chapter 10 label), `Google.LyHyphens` ("newly-launched"), `Vale.Terms` (accept.txt casing, for example `DWC`, `CSS`, `JavaScript`, `REST`), `Google.Spacing`, `Google.Units`, `Google.Slang`, `Google.OptionalPlurals`, `BASIS.AIArtifacts`, `Google.AMPM`, `Google.DateFormat`, `Google.Periods`. File names, CSS values like `500px`/`75vh`, and tokens go in inline code. `BASIS.EmDashes` is only a warning in Vale, but the house rule forbids em dashes: grep for U+2014 in touched files (one em dash already exists in `02-browser-developer-tools/01-intro-to-css.md`, deferred to Phase 7).
9. **Heading ids.** Do not rename existing headings. If Vale forces a rename, pin the old id with `{#old-id}` (`.vale.ini` `BlockIgnores = "{#.*?}"`). New headings in kept material can create duplicate ids on a page, which `onBrokenAnchors: throw` may surface only through links; avoid repeated heading text on one page.
10. **Do not edit `tools/moodle2docusaurus.py`, `tools/data/dwc-image-map.json`, or `dwc-old-routes.json`** (reproducibility and the 66/27/307 contracts).
11. **`DocCardList` on single-page chapters.** Chapter `index.md` files that are plain pages do not render a card list; do not add one to point at the exercise, use a pointer sentence with a relative link.
12. **ZIP drift.** Editing any file under `docs/examples/dwc/` requires `python3 tools/sync-samples.py dwc` (and `git add`) or `--check` fails.

### Don't Hand-Roll
| Problem | Don't build | Use instead |
|---------|-------------|-------------|
| Moodle HTML to Markdown | a new converter | `tools/moodle2docusaurus.py` `convert()` and `code_text()` imported read-only, then hand-edit |
| ZIPs | manual zip | `tools/sync-samples.py` |
| Diffs of fence vs file | custom diff | `difflib`/plain equality after `rstrip("\n")` |
| Drift between examples and page | raw-loader or a build plugin | generate fence text once with a script; verify script re-checks |
| Solution collapsing | a React component | native `<details>` (probe-verified) plus the existing CodeBlock wrapper |

## Section 10: BBj syntax checks in practice (Q5)

- `bbj_check_syntax`, `bbj_lookup` and `bbj://primer` are in the BBj Documentation MCP (claude.ai server, hosted check, stock BBj 26.03, footer `bbj-docs · hosted · docs 2026-09-21 · fd516a9d` in Phases 4/5). [VERIFIED: `tools/data/dwc-samples-syntax.md`, `tools/data/intro-bbj-syntax.md`]
- Phase 4 plan 04-04: the executor subagent could call `bbj_check_syntax` (44 files, one call each) but could NOT read `bbj://primer` ("no MCP resource-reader tool; `bbj_fetch_page` rejects the URI"); it recorded that as a deviation. [CITED: `04-04-SUMMARY.md`]
- Phase 5 plan 05-06 Task 1 was explicitly "run by the orchestrator, which has the BBj Documentation MCP": it read `bbj://primer` first, checked 30 targets, and wrote raw evidence (`05-06-syntax-raw.tsv`, `05-06-task1-notes.md`); executor tasks then applied fixes. [CITED: `05-06-SUMMARY.md`]
- This research agent has no MCP tools either, so no snippet was checked in this research.
- Planner consequence: any BBj snippet that goes into exercise text or kept material (D-05) needs an orchestrator step (or a `checkpoint`-style task) that reads the primer and runs `bbj_lookup`/`bbj_check_syntax`; executors should be given the exact snippets and a place to record results, and applying fixes. Candidate checks in this phase: the single-line `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")` (assign 73), kept `<pre>` blocks tagged bbj (53 candidates across the Moodle pages), and any email-regex hint line in exercise 77. The six solution files already pass (`tools/data/dwc-samples-syntax.md`, 43 pass, `SetStyle.bbj` fails and is Phase 7). CSS/HTML fences need no MCP check. The mechanical keep list is small, so one orchestrator pass at the end of the kept-material wave is enough; record results in `tools/data/dwc-samples-syntax.md`-style rows in the audit (fix noted in the audit row per D-14).
- Prism BBj highlighting: tokens come from `docs/src/prism/bbj-extend.js`; do not add keywords for new snippets without an MCP check recorded in `tools/data/bbj-token-verification.md`.

## Section 11: Vale (Q6)

- Run: `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` (or a file list); full output `tools/.bin/vale docs/docs/dwc`. Default exit code is 1 only on error-level alerts. Install with `bash tools/install-lint-tools.sh`. Current baseline: 0 errors, 418 warnings, 54 suggestions in 29 files (top rules: Google.Headings 247, Google.Colons 75, Google.WordListCase 64, Google.Acronyms 28, Google.We 18, Google.Contractions 17, BASIS.BeDirect 9). [VERIFIED: vale JSON output]
- `.vale.ini`: `[docs/docs/**/*.{md,mdx}]`, `BasedOnStyles = Vale, Google, BASIS`; `Vale.Spelling` off; `Google.Passive`, `Will`, `Semicolons`, `Parens`, `Latin` off; `TokenIgnores` covers `{/* ... */}`, `<span|img ...>` and `/docs/...` path fragments; `BlockIgnores = "{#.*?}"`.
- Error-level rules in the tree: BASIS/AIArtifacts, AIDisclaimer; Google/AMPM, DateFormat, EmDash, Exclamation, Gender, GenderBias, Latin (disabled), LyHyphens, OptionalPlurals, Ordinal, Periods, Quotes, Slang, Spacing, Units.
- Reviewdog runs file-level (`filter_mode: file`), so a PR that touches a whole DWC page reports every finding on it; only errors fail.
- Vale was run on the `.mdx` and `.md` probe pair: 0 findings.

## Section 12: Security and threat model (Q11)

Security enforcement is not disabled in `.planning/config.json` (absent means enabled). The surface is a static documentation site plus local one-off scripts. No secrets, auth, sessions, or server code are touched.

### Applicable ASVS categories (L1)
| ASVS Category | Applies | Control |
|---------------|---------|---------|
| V5 Input validation / output encoding | yes (content from an external backup) | MDX compile (`check-mdx.mjs`), `mdx_escape`, no raw HTML beyond `<details>`/`<summary>` |
| V12 Files and resources | yes (images, SVG, ZIPs, path handling in scripts) | kebab-case ASCII names, path allow-list, no executables, SVG screened |
| V14 Configuration / dependencies | marginal | no new packages; pinned venv only |
| V2, V3, V4, V6 | no | no auth, sessions, access control or crypto |

### Known threat patterns
| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Moodle HTML with script or event handlers carried into MDX | Tampering / XSS | `convert()` drops `script/style/iframe/object/embed/form/input/button/video/source/link/meta` and keeps only `a[href]`, `img[src,alt]`; hand-written MDX must not introduce raw `<script>` or `on*=` attributes; verify script greps for `<script`, `<iframe`, `onclick=`, `javascript:` in touched pages |
| `javascript:` or unexpected schemes in carried links | Tampering | `link_pass` allows only http, https, mailto and relative; keep only that |
| Dead or hijackable external links (`basishub.github.io/basis-next`, old hosts) | Spoofing | replace with `dwc.style` mapping or drop; do not link to hosts that no longer belong to BASIS (checked with the intro link map as precedent) |
| Path traversal or overwrite when a script copies images into `img/` | Tampering | validate names against `^[a-z0-9]+(-[a-z0-9]+)*\.(png|gif|svg)$`, write only below `docs/docs/dwc/<chapter>/img/`, never join raw Moodle filenames into paths |
| Unsafe archive extraction | Tampering | the backup is already unpacked; do not re-extract inside new scripts, or reuse the `unpack()` guard (rejects absolute, `..`, symlinks) |
| SVG with script (the 250 KB `BBjTopLevelWindow Structure.svg`) | XSS if opened directly | screened: no `<script>`, `foreignObject`, event handlers or external hrefs; keep it referenced via `<img>`/Markdown image only; re-grep before commit |
| Information disclosure from Moodle (hostnames, usernames, emails, grade or user data in `files.xml`, screenshots) | Information disclosure | only copy images and text into the repo; audit rows carry file names and hashes only (file names include a developer hostname `nick-mbp.local`, low risk, already part of the old site's history; the planner may shorten names in the audit if preferred); never copy `users.xml`/gradebook; visually review each kept screenshot for personal data; `import/` is gitignored (`git check-ignore import` prints `import`) and must never be staged (`git status` check in verify) |
| Inline code in solutions | Tampering | solutions are existing, reviewed samples; fences are byte copies; no new executable content is added as a downloadable |
| Supply chain | Tampering | no new dependencies |

## Validation Architecture

`workflow.nyquist_validation` is `true` in `.planning/config.json`. The repo has no unit-test framework; validation is the `tools/check-*.py`, `tools/verify-phaseN.sh`, Docusaurus build (broken links, anchors, Markdown images throw) and Vale pattern. Phase 6 adds one Python checker and one shell wrapper.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shell wrapper `tools/verify-phase6.sh` (same PASS/FAIL line format as `verify-phase4.sh`/`verify-phase5.sh`), Python 3 stdlib checker `tools/check-dwc-phase6.py` (new), existing checkers, `npm run build`, Vale 3.24.0 |
| Config file | none (scripts); `.vale.ini`; `docs/docusaurus.config.js` |
| Quick run command | `python3 tools/check-dwc-phase6.py && tools/.bin/vale --minAlertLevel=error docs/docs/dwc docs/docs/intro-bbj` |
| Full suite command | `bash tools/verify-phase6.sh` (user runs with `!`; it builds first), then `bash tools/verify-phase4.sh --no-build`, `bash tools/verify-phase5.sh --no-build`, `bash tools/verify-phase1.sh`, `bash tools/verify-phase3.sh`, `bash tools/verify-phase2.sh --local`, `bash tools/prove-gates.sh` |

Because executors cannot run `bash tools/*.sh`, each plan's own verify uses the Python and npm commands directly (`cd docs && npm run build`, `python3 tools/check-dwc-phase6.py <subcommand>`, `python3 tools/check-dwc-routes.py`, ...).

### Phase Requirements to Test Map
| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| EXER-02 | 11 files `docs/docs/dwc/*/9N-exercise-*.mdx` exist at the D-01 paths; none in 03, 09, 12; each has front matter `title` starting `Exercise: ` and `description` of at most 160 chars, a `:::exercise` line and a closing `:::`, no H1, no em dash; none contains `DWCTraining/`, `github.com/BasisHub/DWCTraining`, `basis-next`, `due`, `submit`, `&nbsp;`, `<br`, `<span`, `$@`, `PLUGINFILE`, `moodle`; every `pathname:///files/dwc/*.zip` link resolves to `docs/static/files/dwc/`; no link to `MediaQueries.bbj`, `MediaQueryExample.css`, `transitionToButtonCompleted.bbj` | structural | `python3 tools/check-dwc-phase6.py exercises` | no, Wave 0 |
| EXER-02 | each page compiles as MDX | compile | `node tools/check-mdx.mjs $(find docs/docs/dwc -name '9*-exercise-*.mdx' \| LC_ALL=C sort)` | yes (`tools/check-mdx.mjs`) |
| EXER-02 | the 5 old exercise anchors survive; the 4 stub sections link to the new pages by relative file links; `11-advanced-responsive/index.md` `## Exercises` links both new pages | build + structural | `cd docs && npm run build && cd .. && python3 tools/check-dwc-anchors.py` and `python3 tools/check-dwc-phase6.py pointers` | anchors yes; pointers Wave 0 |
| EXER-02 | routes and sidebar order after the new pages | build | `python3 tools/check-dwc-routes.py` (after the Section 8 edit) | yes, edit needed |
| EXER-03 | `docs/docs/dwc/exercises.mdx` and `docs/docs/intro-bbj/exercises.mdx` exist, `sidebar_position: 0.4`, title "Exercises", description at most 160 chars; every `9N-exercise-*.mdx` of the book is linked once from its index, with a relative file link; no link in the index is dangling; "(solution included)" appears exactly for the six D-06 pages; each overview contains a link to its index | structural | `python3 tools/check-dwc-phase6.py indexes` | no, Wave 0 |
| EXER-03 | built pages and menu position (Overview, Prerequisites, Sample Code, Resources, Exercises, then chapters) | build | `python3 tools/check-dwc-routes.py` and `python3 tools/check-intro-bbj.py structure --build docs/build` (both after edits) | yes, edits needed |
| EXER-04 | exactly six exercise pages have `<details>` with `<summary>Possible solution</summary>`, the others have none; each solution fence is `bbj title="<File>.bbj"` and its content equals the example file after `rstrip("\n")` (61: `DWC1.bbj` and `DWC2.bbj`; 70, 72 Grid, 73, 75, 77 `...Complete*.bbj`); the block sits after the `:::exercise` close; a ZIP link and the starter and solution file names are present | structural | `python3 tools/check-dwc-phase6.py solutions` | no, Wave 0 |
| EXER-04 | built HTML contains `<details` and "Possible solution" on those six pages; collapsing applies (`expandable-code__toggle` where the fence exceeds 40 lines) | build output grep | `grep -l 'Possible solution' docs/build/docs/dwc/*/exercise-*.html` (count 6) | no, Wave 0 |
| AUDIT-01 | `tools/data/dwc-gap-audit.md`: summary table at top; one section per Moodle module (22 module ids from Section 1, or the count the planner confirms); each section header has name, module id, DWC target page(s) that exist; rows have type, excerpt/file name, verdict in {keep, covered, drop}, one-line reason for keep and drop, target page and anchor for keep; images rows carry a 40-hex SHA-1; 12 parked-image rows present; summary counts equal row counts; no `import/` path, no em dash | structural | `python3 tools/check-dwc-phase6.py audit` | no, Wave 0 |
| AUDIT-01 | Vale on the audit file is not required (outside `docs/docs`) but em dash and `import/` greps are | grep | `! grep -n $'\xe2\x80\x94' tools/data/dwc-gap-audit.md` and `! grep -n 'import/' tools/data/dwc-gap-audit.md` | n/a |
| AUDIT-02 | every keep row's target page exists and its anchor (heading id from the page source or the built HTML) resolves; kept images exist in the chapter `img/`, are referenced by a page, have non-empty alt text, kebab names, and an entry in `tools/data/dwc-gap-image-map.json` whose SHA-1 equals the file's SHA-1; every parked image with a keep verdict moved; `tools/data/dwc-unused-img/` is gone | structural | `python3 tools/check-dwc-phase6.py kept` and `test ! -e tools/data/dwc-unused-img` | no, Wave 0 |
| AUDIT-02 | no slug renames: route set equals the 27 snapshot routes plus the 12 Phase 6 routes; anchors green; no unreferenced image in `docs/docs/dwc/**/img` | build | `python3 tools/check-dwc-routes.py && python3 tools/check-dwc-anchors.py` | yes |
| AUDIT-02 | samples and ZIPs stay in sync, no new `.bbj` or counts updated | check | `python3 tools/sync-samples.py --check` and `test $(find docs/examples/dwc -name '*.bbj' \| wc -l) -eq 44` | yes |
| AUDIT-02 | Vale errors 0 and no Moodle leftovers in touched pages | lint | `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` and `! grep -rIEn 'PLUGINFILE\|pluginfile\.php\|\$@[A-Z]+\|moodle\.basis-europe\|DWC-Course/' docs/docs` | yes |
| AUDIT-02 | commit series order (audit file first, then exercise pages, kept material per chapter, markers, indexes, verify script) | git | `python3 tools/check-dwc-phase6.py commits` (subjects `docs(06-..)` etc.; SKIP if squashed) | no, Wave 0 |
| AUDIT-03 | `tools/data/dwc-2022-screenshots.json` entries (DWC path, Moodle file name, 40-hex SHA-1) are sorted, each file exists and its SHA-1 equals the entry, each Moodle name contains `2022`; every Markdown reference to a listed image has the exact line `{/* TODO: screenshot outdated? */}` directly above it; no other image reference has the marker; the set of images in `docs/docs/dwc/**/img` whose SHA-1 is in the list equals the JSON set; expected count is 30 plus the 2022-named images the audit adds (and 12 if every parked image is kept) | structural | `python3 tools/check-dwc-phase6.py screenshots` | no, Wave 0 |
| AUDIT-03 | markers do not break the build or Vale | build + lint | `cd docs && npm run build` and `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` | yes |
| Regression | Phase 4 and 5 gates stay green with the edited checkers | existing | `python3 tools/check-dwc-relocation.py --rev 542399a` (needs `../bbj-dwc-tutorial`), `python3 tools/check-intro-bbj.py structure|content|samples|edits|syntax`, `python3 tools/check-intro-bbj.py commits` | yes |
| Hygiene | `import/` never staged; no dotfiles; `git status --porcelain` shows no `import/` path | git | `git ls-files import \| wc -l` equals 0 | n/a |

### Sampling Rate
- **Per task commit:** `python3 tools/check-dwc-phase6.py <relevant subcommand>`, `tools/.bin/vale --minAlertLevel=error <touched files>`, `node tools/check-mdx.mjs <new .mdx>`.
- **Per wave merge:** `cd docs && npm run build` plus `python3 tools/check-dwc-routes.py`, `check-dwc-anchors.py`, `sync-samples.py --check`, `check-intro-bbj.py structure`.
- **Phase gate:** `bash tools/verify-phase6.sh` plus the earlier phase scripts green before `/gsd:verify-work`. Human checks that cannot be automated: render the six solution blocks and a few marked screenshots in light and dark mode (`npm run serve`), confirm LIVE-01 treats the new DWC "Exercises" page as an intended addition (note in the script header and Phase 7 hand-off).

### Wave 0 Gaps
- [ ] `tools/check-dwc-phase6.py` with subcommands `exercises pointers indexes solutions audit kept screenshots commits` (stdlib only, runs under system `python3`).
- [ ] `tools/verify-phase6.sh` (wrapper in the verify-phase4/5 pattern, sections: build, exercises, solutions, indexes, audit, kept, screenshots, regression).
- [ ] Edit `tools/check-dwc-routes.py` (allowlist of 12 new routes, `TOP_ORDER`, `SUB_ORDER`).
- [ ] Edit `tools/check-intro-bbj.py` (`TOP_PAGES` + `exercises.mdx`, `38` to `39`).
- [ ] Update the point-in-time header comments in `verify-phase4.sh` and `verify-phase5.sh` (their own text says later phases must update the checkers).
- [ ] Framework install: none.

## State of the Art

| Old approach | Current approach | Impact |
|--------------|------------------|--------|
| Exercises as Moodle assignments with submission | Reading-material `:::exercise` pages with an optional collapsed solution | No LMS features (CLAUDE.md) |
| Image identity by file name | Identity by SHA-1 against Moodle `contenthash` | Survives the Phase 4 renames |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Displayed line counts for solution fences other than the 04 Tree file (Grid 103, Flexbox 52, IconPools 51, Validation 118, DWC1 40, DWC2 53) are derived from `wc -l` rather than rendered | 4.3 | Only affects whether a collapse toggle appears; the verify script should not hard-code line counts |
| A2 | `dwc.style` replacements for the two `basishub.github.io/basis-next` links in assignments 61 and 70 are not verified; only Phase 5's mapped examples exist | 3 | A wrong target link in an exercise; planner should have the orchestrator or Stephan confirm |
| A3 | `QASmall.png` is a Moodle Q&A icon (not opened) | 5.2 | Could be a real figure; open it during the audit |
| A4 | Reading `.planning/config.json` as "security enforcement enabled" because the key is absent | 12 | A short threat model is added anyway |
| A5 | The 30 versus 22/25 audit-unit count discrepancy comes from how CONTEXT counted | Open Questions | Plan sizing only |

## Open Questions

1. **How many audit units?**
   - Known: CONTEXT says 30 (22 Pages, the prerequisites book, the 4-chapter book, the resource page). The backup has 20 page modules (including the resource page) and 2 books: 22 modules, or 25 chapter-level units (20 + 1 + 4). Adding the three non-empty section summaries (S1, S2, S3) and the 20-word course summary gives 29. No hidden items.
   - Unclear: which 30 CONTEXT meant.
   - Recommendation: the audit file gets one section per module (22), with 3B subdivided by its four chapters and one short "section summaries" row group per chapter; verify script counts module ids, not a literal 30. State the real count in the audit's summary table.
2. **Which `docs/examples` file does the "Possible solution" for 61 show?** CONTEXT D-06 says DWC1 and DWC2 inline; the assign text asks for modifications to `GUISample.bbj`, so the starter is `GUISample.bbj` and the results are `DWC1.bbj` (39 lines) and `DWC2.bbj` (53 lines). Recommendation: two fences in one `<details>`, `DWC2.bbj` last.
3. **Exercise 65, 68, 83 have no solution and no ZIP of their own.** For 65 the related folder is `01_GUI2BUI2DWC.zip` (DWC_AppThemes); for 68 `03C_Grid2GridEx.zip`; for 83 `09_EmbeddingOtherComponents.zip`. Recommendation: link the ZIP only when the text names a file from it.
4. **Moodle images that are not in the backup** (`iconInfoLogo.png`, the off-site image in 1A): audit them as "drop, not in backup".

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build | yes | v22.22.0 (`.nvmrc` 24; build passes) | none needed |
| `.venv/bin/python` with bs4, lxml, markdownify | audit pre-fill, exercise clean-up | yes | Python 3.11.4 | none |
| system `python3` | stdlib checkers | yes (no bs4) | n/a | n/a |
| `tools/.bin/vale` | Vale gate | yes | 3.24.0 | `bash tools/install-lint-tools.sh` |
| `import/unpacked/dwc/` | audit and markers | yes (gitignored, local) | course 4 | none; markers JSON is committed so later checks do not need it |
| `../bbj-dwc-tutorial` clone with `965da6d` | `check-dwc-relocation.py --rev` | yes | n/a | verify-phase4 SKIPs without it |
| BBj Documentation MCP | D-05 syntax checks | orchestrator only (not this agent, not reliably executors) | hosted, stock BBj 26.03 | none: checkpoint to orchestrator |
| `bash tools/*.sh` for subagents | verify scripts | denied to subagents in earlier phases and here | n/a | user runs with `!`; agents run underlying commands |

## Sources

### Primary (HIGH confidence, measured in this repo)
- `.planning/phases/06-exercises-dwc-gap-audit/06-CONTEXT.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `CLAUDE.md`
- `import/unpacked/dwc/` (`files.xml`, `activities/*`, `sections/*`) via scratch scripts
- `tools/moodle2docusaurus.py`, `tools/check-dwc-routes.py`, `tools/check-dwc-anchors.py`, `tools/check-dwc-relocation.py`, `tools/check-intro-bbj.py`, `tools/sync-samples.py`, `tools/check-mdx.mjs`, `tools/verify-phase4.sh`, `tools/verify-phase5.sh`
- `docs/docusaurus.config.js`, `docs/sidebars.js`, `docs/src/theme/CodeBlock/index.js`, `docs/src/theme/Admonition/Types.js`, `docs/src/theme/MDXComponents.js`, `docs/src/components/DocsTools/ExpandableCode/index.js`, `.vale.ini`, `.github/workflows/reviewdog.yml`, `.github/.styles/`
- Probe build of `<details>` plus fence plus marker (temporary files, removed)
- `.planning/phases/04-dwc-book-relocation/04-03/04-04/04-06-SUMMARY.md`, `.planning/phases/05-intro-bbj-conversion/05-04/05-05/05-06-SUMMARY.md`, `tools/data/*.md|json`

### Secondary / Tertiary
- None. No external documentation was needed; no web search was used.

## Metadata

**Confidence breakdown:**
- Unit map and image/hash data: HIGH (computed from the backup and repo)
- Checker interactions: HIGH (read the code; routes failure reproduced by the probe)
- Rendering facts: HIGH (probe build and HTML inspection)
- Syntax-check workflow: HIGH for history, no MCP call possible here
- Assignment dead-link replacements: LOW to MEDIUM (A2)

**Research date:** 2026-10-04
**Valid until:** until Phase 6 plans execute (the repo state is the dependency); recompute counts if `docs/docs/dwc` changes first.
