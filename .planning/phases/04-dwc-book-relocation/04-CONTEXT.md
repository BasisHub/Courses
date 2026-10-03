# Phase 4: DWC Book Relocation - Context

**Gathered:** 2026-10-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Move the "BBj DWC Training" book from BasisHub/DWC-Course into `docs/docs/dwc/`, replacing the Phase 1 stub, so readers find all 26 old content pages under `/Courses/docs/dwc/` with the old text unchanged. The move covers:

- 27 Markdown pages: `index.md`, `prerequisites.md`, `samples.md`, `resources.md` and 12 numbered chapter folders.
- 48 referenced images, colocated per chapter with a committed rename map.
- 10 sample folders, as plain source in `docs/examples/dwc/` and as downloads in `docs/static/files/dwc/`, kept in sync by a script.
- A snapshot of the old site's routes and anchors in `tools/data/` as input for the Phase 8 redirects.

Not in this phase: exercise extraction, the gap audit and the 2022-screenshot TODOs (Phase 6); Vale warnings and suggestions, the alt-text and heading review, and fixing failing BBj samples (Phase 7); the redirect build (Phase 8).

Source: the local clone `../bbj-dwc-tutorial` (remote `BasisHub/DWC-Course`). Copy from **origin/main `965da6d`** ("chore: complete v1 milestone"). The clone has one unpushed commit (`e59a4ef`) and local edits that touch only `CLAUDE.md`, `.claude/` and `.auto-claude-security.json`. None of it is content, so it is ignored.

</domain>

<decisions>
## Implementation Decisions

### Commit series (purity boundary)
- **D-01:** The phase lands as one PR with separate, reviewable commits in this order:
  1. **Pure relocation.** Paths, image syntax (`<Image img={require(...)}>` and `/img/...` links become `![alt](./img/name.png)`) and link targets only, plus the overview rebuild (D-09), which this commit needs because the old components don't exist here. Remove the Phase 1 stub (`docs/docs/dwc/01-first-chapter/`). The commit message names the source SHA `965da6d` and points to the rename map.
  2. **Normalization** (D-07, D-08).
  3. **Vale error fixes** (D-05).

  The sample sync script, the snapshot and the syntax report can be separate commits in any order. The snapshot (D-15) must be taken before the old repo changes, so it naturally comes first.
- **D-02:** **Plain copy, no history import.** The DWC-Course history stays in the archived repo, and the commit message records the source SHA. No `git filter-repo` or unrelated-history merge.
- **D-03:** Root-relative links (`/gui-to-bui-to-dwc/hello-world`) and bare relative links (`gui-to-bui-to-dwc/`, `samples`) become relative **file** links (`./01-gui-to-bui-to-dwc/02-hello-world.md`). Then they survive `baseUrl`, and the throwing link gate checks them. These are path fixes and belong in commit 1.
- **D-04:** URLs stay identical apart from the prefix: `/DWC-Course/<p>` becomes `/Courses/docs/dwc/<p>` for all 26 content routes. `/` becomes `/docs/dwc/overview`, and `/search` is not content. Verify this against the new build's sitemap, not by assumption. Every `_category_.json` sets an explicit `link` (doc id `dwc/<chapter-slug>/index`). Chapter 1 has both `index.md` and `03-gui-to-bui-to-dwc.md`, so both `/gui-to-bui-to-dwc` and `/gui-to-bui-to-dwc/gui-to-bui-to-dwc` must build.

### Vale gate
- **D-05:** The required Vale check (reviewdog, `filter_mode: file`, `fail_on_error: true`) must pass on the PR **without admin bypass and without excluding `dwc` from the glob**. Commit 3 fixes **error-level findings only**. Warnings and suggestions wait for the Phase 7 full pass. Fixes are minimal wording changes and no rewrites.
- **D-06:** Heading text **may** change when a Vale error requires it. The old anchor is then pinned with an explicit heading ID (`## New text {#old-id}`), so old `#fragment` links keep working. A script compares the anchors of the new build against the snapshot (D-15) and fails on any missing old anchor. The H1 removal in D-07 doesn't affect anchors, because page title anchors aren't fragment targets.

### Normalization (commit 2, mechanical only)
- **D-07:**
  - Drop each page's H1 when it duplicates the front matter `title`.
  - Add a `description` to every page's front matter. Claude drafts it, it must be Vale-clean, and at most 160 characters.
  - Give the roughly 3 language-less opening fences a language.
  - Remove `sidebar_position` values that conflict with the folder/filename order, or align them.

  No prose rewrites. Alt text is copied verbatim (D-13).
- **D-08:** `samples.md`: replace the `git clone https://github.com/BasisHub/DWC-Course.git` block with links to the new downloads in `static/files/dwc/` (D-17). The DWC-Course repo is about to be archived, and the LIVE-01 grep forbids `DWC-Course/` in `docs/docs`. Point the sample table's chapter links at the relocated pages. Fix any other `DWC-Course/` mention in `docs/docs` the same way.

### Overview page
- **D-09:** The old `docs/index.md` (front matter `slug: /`, components `Hero`, `HomepageFeatures`, `ChapterCards`, plus a `Link` button) becomes `docs/docs/dwc/00-overview.mdx`, **rebuilt as Markdown**:
  - Hero and feature-tile text ("12 Progressive Chapters", "Hands-On Code Samples", "Modern Web Standards") become prose, keeping the wording where possible.
  - `ChapterCards` becomes `<DocCardList />`, which is already registered globally.
  - The old "Getting Started / Core Concepts / Advanced Topics / Deployment" grouping is not reproduced.

  Do not port the three components. Drop `slug: /`.
- **D-10:** The "Begin Chapter 1" button becomes a **plain link line**, e.g. "Start with [GUI to BUI to DWC](./01-gui-to-bui-to-dwc/index.md)." No button styling.
- **D-11:** The overview's front matter matches `docs/docs/intro-bbj/00-overview.mdx`: `title`, `sidebar_label: Overview`, `sidebar_position: 0` and `description`. Drop `hide_table_of_contents: true`.

### Sidebar
- **D-12:** The sidebar is flat and autogenerated (the existing `sidebars.js` line per book), in the **same order as the old site**: Overview, Prerequisites, Sample Code, Resources, then chapters 01 to 12. The old four section groups go away (PROJECT key decision). The top-level files follow the seed's names (`00-overview.mdx`, `prerequisites`, `samples`, `resources`, as `.mdx` per seed §3.4). Their order comes from position prefixes or `sidebar_position`, whichever gives the old order without colliding with the `01-` to `12-` chapter folders. Their URLs stay `/docs/dwc/prerequisites`, `/samples` and `/resources`, so no prefix leaks into the slug. LIVE-01 later diffs this order against the old site.

### Images
- **D-13:** Each of the 48 referenced images moves into the `img/` folder of the chapter whose page references it. No image is shared across pages.
  - Names are **mechanical kebab-case** from the old name: `ARC_image_1.png` becomes `arc-image-1.png`, `DWC1_showGridSize.png` becomes `dwc1-show-grid-size.png`, `Validation_demo.gif` becomes `validation-demo.gif`.
  - Alt text is copied **verbatim** from the `<Image alt>`. Better alt text belongs to the Phase 7 review.
  - Drop `import Image from '@theme/IdealImage'`. A page with no other JSX can stay `.md`.
  - `plugin-ideal-image` is not added. `docusaurus-plugin-zooming` already provides click-to-enlarge.
- **D-14:** The **18 unreferenced images** are handled as follows:
  - Content screenshots are **parked** in `tools/data/dwc-unused-img/` (committed, mechanical kebab names): `DevTools_Screenshot_1-4`, `Hello_DWC_4A`, `Hello_BBj_DWC_Grid`, `MessageBox`, `Responsive_Demo`, `CSS_Grid_Playground_2/3`, `CSS_Layout_Samples_5/6`.
  - The old site assets `docusaurus.png`, `docusaurus-social-card.jpg`, `dwc-logo.png`, `logo.svg` and `favicon.*` are **not** moved.
  - Phase 6 (gap audit) either moves each parked image into a chapter's `img/` or drops it, and deletes the folder at the end of the audit.
  - The rename map (`tools/data/dwc-image-map.*` or similar) lists every old file with one of three verdicts: moved to `<path>`, parked, or not moved (site asset).

### Snapshot (DWC-04)
- **D-15:** Commit to `tools/data/`:
  - the old `sitemap.xml` (28 `<loc>`: 26 content pages, the root and `/search`). The local `build/sitemap.xml` (2026-01-31) matches the live sitemap, which resolves the "26+1 vs 28" blocker in STATE.
  - a generated JSON listing each old route with its page's heading anchor ids, taken from `../bbj-dwc-tutorial/build/` HTML.

  Do not commit the full 21 MB `build/`. If the local `build/` might be stale against `965da6d`, rebuild it from that SHA first, or compare its routes and anchors with the live site.

### Samples
- **D-16:** `docs/examples/dwc/` is the **only hand-edited copy**: all 10 folders plus `LICENSE` and `README.md`.
- **D-17:** Readers download **one ZIP per sample folder** (`static/files/dwc/01_GUI2BUI2DWC.zip`, ...) plus **one ZIP with everything** (e.g. `dwc-samples.zip`), each including `LICENSE` and `README.md`. Individual files are not mirrored under `static/files/`.
- **D-18:** `tools/sync-samples` (Claude picks Node or Python) generates the ZIPs from `docs/examples/dwc/`, and the ZIPs are **committed**. Builds are **reproducible**: fixed timestamps, sorted entries and stable compression, so an unchanged source gives a byte-identical ZIP. A `--check` mode runs in the PR build (`test-build.yml`) and fails on drift. The script is generic per book (`<book>` argument or a loop over `docs/examples/*`), so intro-bbj in Phase 5 reuses it.
- **D-19:** Sample folder names **keep their old form** (`01_GUI2BUI2DWC` ... `09_EmbeddingOtherComponents`, including the `07_ControlValiation` typo). They are code, the README and pages use them, and readers' local copies match. This is a documented exception to the kebab-case file convention.
- **D-20:** Phase 4 runs `bbj_check_syntax` over all 44 `.bbj` files and records the results per file in `tools/data/` (e.g. `dwc-samples-syntax.md`). Failing samples are **not** edited in this phase. QUAL-03 in Phase 7 fixes them ("fix the sample, not the check"). The CLAUDE.md rule "every `.bbj` under `docs/examples/` passes" therefore holds only from Phase 7. Note this in the report.

### Claude's Discretion
- Which language the sync and snapshot scripts are written in, and their exact file names and data formats (JSON or Markdown map).
- How to get the top-level page order (D-12): prefixes or `sidebar_position`.
- Wording of the rebuilt overview prose (D-09) and of the `description` lines (D-07). Both must be Vale-clean, direct, second person, with no em dashes.
- Whether a `tools/verify-phase4.sh` bundles the checks: old routes present in the new sitemap, anchors present, ZIP sync `--check`, no `DWC-Course/` or `@theme/IdealImage` left in `docs/docs`, and every image map entry resolved. It follows the `verify-phase1/2/3.sh` pattern. Shell scripts are run by the user with `!`.
- Where the download links sit (only `samples.md`, or also per chapter). The minimum is `samples.md`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project spec and requirements
- `.planning/migration-seed.md` §2.0 (what DWC-Course contains), §3.3 (URL change, redirect plan), §3.4 steps 1 to 3 (relocation, autogenerated sidebar, top-level page renames). Step 5 (gap audit) is Phase 6. Its `import/dwc-gap-audit.md` path is superseded by `tools/data/`.
- `.planning/REQUIREMENTS.md`: DWC-01 to DWC-04, LIVE-01 (acceptance grep and sidebar-order diff that this phase must not break), QUAL-03 (BBj syntax, Phase 7).
- `.planning/ROADMAP.md`: Phase 4 goal and success criteria 1 to 4.
- `.planning/PROJECT.md`: Key Decisions (flat DWC chapters, gap audit after the pure relocation, 2022-screenshot flag).

### Research
- `.planning/research/ARCHITECTURE.md` "Decision (4): DWC-Course relocation + image renaming map" (mapping table, apply-by-script steps, link rewriting, old-to-new route contract), item 3 under the category index notes (explicit `link` for chapter 1's `index.md` vs `03-gui-to-bui-to-dwc.md`), and Anti-Pattern 6 (content edits inside the relocation commit).
- `.planning/research/ARCHITECTURE.md` redirect section: what Phase 8 needs from the D-15 snapshot (route list, `#fragment` forwarding).

### Source repository (outside this repo)
- `../bbj-dwc-tutorial/`: the local clone of `BasisHub/DWC-Course`. Copy from origin/main `965da6d`.
  - `docs/` (27 pages), `static/img/` (66 files: 48 referenced, 18 not), `samples/` (10 folders, LICENSE, README).
  - `sidebars.ts` (the old order, for D-12 and the LIVE-01 diff).
  - `src/components/{Hero,HomepageFeatures,ChapterCards}/index.tsx`: the text to carry into the rebuilt overview (D-09).
  - `build/sitemap.xml` and `build/**.html`: the snapshot input (D-15).
- `https://basishub.github.io/DWC-Course/sitemap.xml`: the live sitemap (28 URLs, matches the local build).

### Prior phase context
- `.planning/phases/01-site-scaffold-quality-gates/01-CONTEXT.md`: D-06 (`dwc` slug is permanent), D-08 (the stub chapter that this phase replaces).
- `.planning/phases/02-repo-hygiene-ci/02-CONTEXT.md`: D-08 to D-12 (Vale glob, `filter_mode: file`, error-only failures, ruleset with admin bypass), D-15 (`test-build.yml`, where the sync `--check` goes).
- `.planning/phases/03-content-components-brand/03-CONTEXT.md`: components available to the moved pages (Mermaid, zooming, `ExpandableCode` auto-collapse over 40 lines with the `noCollapse` meta opt-out, `DocCardList`, BBj highlighting).
- `CLAUDE.md` (repo root): conventions (kebab-case, H2 start, fence languages, `./img/` references, `docs/examples` and `static/files` kept in sync), and the before-committing checks.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `docs/sidebars.js`: already generates one `{type: 'autogenerated', dirName: <book>}` sidebar per entry in `src/data/books.js`. No sidebar code changes are needed for `dwc`.
- `docs/src/data/books.js`: the `dwc` entry already exists (title "BBj DWC Training"). Only its `start`/first-doc path may need checking against the new overview id.
- `docs/src/theme/MDXComponents.js`: `DocCardList`, `Tabs`, `ExpandableCode` and `YouTube` are global, so the rebuilt overview needs no imports.
- `docusaurus-plugin-zooming` and `@docusaurus/theme-mermaid` are configured. The one Mermaid block in chapter 1 `index.md` renders as-is.
- The BBj Prism extension (`docs/src/prism/bbj-extend.js`): 61 `bbj` fences in the DWC pages get highlighting with no work.
- `tools/verify-phase{1,2,3}.sh` and `tools/prove-gates.sh`: the pattern for a phase verify script.

### Established Patterns
- `_category_.json` with label, position and an explicit `link: {type: 'doc', id: '<book>/<chapter-slug>/index'}`, as in the stub `docs/docs/dwc/01-first-chapter/_category_.json`.
- The overview pattern: `docs/docs/intro-bbj/00-overview.mdx` (front matter `title`, `sidebar_label: Overview`, `sidebar_position: 0`, `description`; content starts at H2).
- The build throws on broken links, anchors, Markdown links and images. Every rewritten link and image path is therefore checked automatically.
- Auto-collapse: fences over 40 lines collapse in `ExpandableCode`. Long DWC samples will now render collapsed, which is accepted. `noCollapse` meta opts a fence out if one must stay open.
- Vale on PRs checks whole changed files at error level (Phase 2 D-09, D-11). A PR touching all DWC pages has to make each of them error-free (D-05).

### Integration Points
- `docs/docs/dwc/`: replace the stub (`00-overview.mdx`, `01-first-chapter/`) with the relocated tree.
- `docs/examples/dwc/` and `docs/static/files/dwc/`: new folders. `docs/examples/` doesn't exist yet.
- `.github/workflows/test-build.yml`: add the `tools/sync-samples --check` step (working directory `docs`; adjust paths).
- `tools/data/`: new `dwc-image-map.*`, `dwc-unused-img/`, old `sitemap.xml`, route/anchor JSON, `dwc-samples-syntax.md`.
- `THIRD_PARTY_NOTICES.md` / samples `LICENSE`: the samples keep their own LICENSE inside `docs/examples/dwc/`. Check whether it needs a notices entry.

</code_context>

<specifics>
## Specific Ideas

- The old landing page's tone ("Ready to Get Started?", "Begin Chapter 1") becomes calmer book-overview prose plus a single link line. The site's landing page cards already do the marketing.
- Inventory taken during the discussion (from `../bbj-dwc-tutorial`):
  - 44 `<Image>` tags across 9 pages, plus 4 GIFs linked as `/img/*.gif`.
  - 61 `bbj`, 30 `css`, 7 `html`, 1 `bash`, 1 `json` and 1 `mermaid` fence, and roughly 3 openers with no language.
  - 51 sample files: 44 `.bbj`, 3 `.css`, 1 `.arc`, 1 `.js`, and 1 `.md` in a sample folder.

</specifics>

<deferred>
## Deferred Ideas

- Better alt text for the 48 DWC images: Phase 7 hand review (QUAL-01).
- Vale warnings and suggestions on DWC pages: Phase 7 full-tree pass.
- Fixing `.bbj` samples that fail `bbj_check_syntax`: Phase 7 (QUAL-03), using the D-20 report.
- Deciding the fate of the parked screenshots in `tools/data/dwc-unused-img/`: Phase 6 gap audit, which deletes the folder when done.
- Renaming sample folders to kebab-case (and fixing the `ControlValiation` typo): rejected for now (D-19). Revisit only if the samples are restructured.

</deferred>

---

*Phase: 04-dwc-book-relocation*
*Context gathered: 2026-10-03*
