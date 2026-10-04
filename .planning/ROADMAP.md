# Roadmap: BASIS Courses

## Overview

One Docusaurus site (`BasisHub/Courses`) in the webforJ look, hosting two books. The path: prove an empty two-book site on `/Courses/`, wire CI and repo hygiene, land the shared content components, then bring in content (DWC pure relocation, then the Moodle-converted intro-bbj book), enrich DWC through exercises and the gap audit, review and go live, and only then cut the redirect-only build for the old DWC-Course repo and archive it.

Spec: `.planning/migration-seed.md`, corrected by `.planning/research/SUMMARY.md`.

## Phases

- [x] **Phase 1: Site Scaffold & Quality Gates** - Empty two-book site in the webforJ look, working under `/Courses/`, with throwing build gates (completed 2026-10-03)
- [x] **Phase 2: Repo Hygiene & CI** - Deploy, PR build gate and Vale on PRs; contributor docs; first proven Pages deploy (completed 2026-10-03)
- [x] **Phase 3: Content Components & Brand** - Exercise box, YouTube, BBj highlighting, ExpandableCode, search, brand assets (completed 2026-10-03)
- [x] **Phase 4: DWC Book Relocation** - DWC-Course moved in as a pure relocation under `/docs/dwc/` (completed 2026-10-04)
- [x] **Phase 5: Intro-BBj Conversion** - Throwaway Moodle converter produces the "Introduction to BBj Development" book (completed 2026-10-04)
- [x] **Phase 6: Exercises & DWC Gap Audit** - Exercise pages in both books; missing course-4 material added to DWC before go-live (completed 2026-10-04)
- [ ] **Phase 7: Review, Acceptance & Go-Live** - Hand review, Vale and syntax checks clean, acceptance gates pass, site public
- [ ] **Phase 8: Redirects & Archive** - Old DWC-Course URLs redirect to Courses; old repo archived

### Phase merging rationale

Research suggested 10 phases; standard granularity calls for 5-8. Merges made:

- Research phases 1 and 2 stay split (scaffold vs. CI) because the CI deploy proves the scaffold on real Pages and has its own gates (Vale glob, workflow versions).
- Exercises (research 6) + gap audit (research 7) merged: both mine Moodle course 4 and both edit DWC pages before go-live; exercises need the converter output from Phase 5 and the audit shares its stages.
- Hand review/Vale/syntax (research 8) + acceptance/go-live (research 9) merged: review feeds acceptance directly and neither delivers a separate user-visible capability.
- Redirects (research 10) stays alone: it must come strictly after go-live and its target map is cut from the live sitemap.

## Phase Details

### Phase 1: Site Scaffold & Quality Gates

**Goal**: A reader can open a two-book stub site under `/Courses/` that looks like webforJ/DWC in light and dark mode, and any broken link or image fails the build
**Depends on**: Nothing (first phase)
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-06, SITE-07, SITE-08, REPO-04, REPO-05
**Success Criteria** (what must be TRUE):

  1. `npm run build && npm run serve` in `docs/` serves a landing page at `/Courses/` with a card per book from `src/data/books.js`, and each card opens that book at `/Courses/docs/<book>/...` with its own sidebar and a navbar item with icon
  2. The site renders in the DWC look in both light and dark mode; the animated theme switcher and external-link decoration work under the `/Courses/` base URL
  3. A page request loads Inter, JetBrains Mono and `dwc-ui.css` from the site itself (no Google Fonts/CDN requests in the browser network panel)
  4. Deliberately introducing a broken link, anchor, Markdown link and Markdown image each makes `npm run build` fail
  5. `sitemap.xml` and `llms.txt`/`llms-full.txt` list both stub books under `/Courses/`, and printing a page hides navbar, sidebar and TOC
  6. `import/` is gitignored, and the lockfile plus exact Docusaurus 3.10.2 pins are committed (with `tools/requirements.txt`)

**Plans**: 4 plans

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Repo hygiene, exact-pinned npm install with legitimacy checkpoint, lockfile, Python pins, webforJ reference clone (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — webforJ SCSS transplant, book-icon and print partials, theme switcher and link decorator, vendored dwc-ui.css (wave 2)
- [x] 01-03-PLAN.md — books.js registry, docusaurus.config.js with throwing gates and baseUrl constant, sidebars, landing page, two stub books (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — First build, tools/prove-gates.sh, tools/verify-phase1.sh with npm ci rebuild, end-of-phase human check (wave 3)

**UI hint**: yes

### Phase 2: Repo Hygiene & CI

**Goal**: Every push to `main` deploys to GitHub Pages and every PR is build-checked and Vale-checked, with contributor docs in place
**Depends on**: Phase 1
**Requirements**: REPO-01, REPO-02, REPO-03
**Success Criteria** (what must be TRUE):

  1. Pushing to `main` publishes the stub site at `https://basishub.github.io/Courses/` and a deep URL loads its CSS, JS, fonts and images
  2. A PR runs the site build without deploying, and a PR containing a deliberate Vale violation in an `.mdx` file fails the Vale check
  3. `CLAUDE.md`, `CONTRIBUTING.md`, `.editorconfig` and `THIRD_PARTY_NOTICES.md` exist, and copied webforJ files carry their MIT headers

**Plans**: 6 plans

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Pinned lint-tool installer, tools/verify-phase2.sh harness, Vale config with Google + BASIS styles and BBj vocabulary
- [x] 02-02-PLAN.md — Move .planning/migration-seed.md into .planning/ with reference updates; rewrite CLAUDE.md from seed section 7 with slim GSD blocks
- [x] 02-03-PLAN.md — .editorconfig, MIT header audit, THIRD_PARTY_NOTICES.md with licence texts, staff-only CONTRIBUTING.md

**Wave 2** *(blocked on 02-01)*

- [x] 02-04-PLAN.md — deploy.yml, test-build.yml, reviewdog.yml (verified action pins, least privilege) and tools/data/ruleset-main.json

**Wave 3** *(blocked on Waves 1-2)*

- [x] 02-05-PLAN.md — Preflight, confirm checkpoint, create public BasisHub/Courses, enable Pages, push, live deep-URL check

**Wave 4** *(blocked on 02-05)*

- [x] 02-06-PLAN.md — Confirm checkpoint, throwaway Vale probe PRs (in-diff and file mode), main ruleset with admin bypass, cleanup, full verify

### Phase 3: Content Components & Brand

**Goal**: Authors can use every shared component the books need, and the site carries the BASIS brand, before any real content lands
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, SITE-05
**Success Criteria** (what must be TRUE):

  1. A fixture page with `:::exercise Try it yourself` shows a styled success-palette box in both themes, and `<YouTube id title />` (no import) shows a responsive, lazy, youtube-nocookie player
  2. A BBj code fence highlights `$`/`!` variables, labels, `#` fields, `rem` comments and keywords (verified against the BBj MCP); fences over 40 lines collapse and every block has a copy button
  3. Tabs, DocCardList, Mermaid diagrams and wrapped tables render, and images zoom on click
  4. Cmd+K local search finds fixture content on a production build served locally, with the Algolia config commented in place
  5. Navbar shows the BASIS logo and GitHub link; the favicon, social cover and single-line BASIS footer are in place

**Plans**: 6 plans
**UI hint**: yes
**Dependency**: Brand assets supplied by Stephan in /Users/beff/Downloads/BASISlogo/ (D-01); favicon and social cover need his visual review at the end of the phase.

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Brand assets: recolored navbar logo, logo-derived favicon (SVG + 32 px PNG), 1200x630 social cover
- [x] 03-02-PLAN.md — BBj highlighting: local extension of Prism's bbj grammar, verified class list, wrapped swizzle, smoke test, MCP evidence
- [x] 03-03-PLAN.md — Exercise admonition, YouTube click-to-load facade, base MDXComponents registry

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-04-PLAN.md — ExpandableCode + 40-line auto-collapse, TableWrapper, registry and notices update

**Wave 3** *(blocked on Wave 2 completion; runs alone because it reinstalls node_modules)*

- [x] 03-05-PLAN.md — New deps (search-local, zooming) and all docusaurus.config.js changes: search, zoom, exercise keyword, llms ignore, navbar/footer/favicon/cover

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 03-06-PLAN.md — Unlisted component fixture, tools/verify-phase3.sh, CLAUDE.md/CONTRIBUTING.md notes, final regression

### Phase 4: DWC Book Relocation

**Goal**: Readers find the whole "BBj DWC Training" book under `/Courses/docs/dwc/` with the old text unchanged
**Depends on**: Phase 3
**Requirements**: DWC-01, DWC-02, DWC-03, DWC-04
**Success Criteria** (what must be TRUE):

  1. All 12 DWC chapters appear in a flat numbered sidebar, overview first, with text unchanged from DWC-Course (pure relocation commit)
  2. Every chapter image is colocated in its `img/` folder with a kebab-case name and renders as a plain Markdown image; the rename map exists in `tools/data/`
  3. Reader can download each DWC sample from `static/files/dwc/`, and the plain sources sit in `examples/dwc/`, kept in sync by a script
  4. The old DWC-Course `build/` and `sitemap.xml` are snapshotted (in `tools/data/`) before the move, as redirect input

**Plans**: 6 plans

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Snapshot old DWC-Course routes and anchors (first commit), route/sidebar and anchor checkers
- [x] 04-02-PLAN.md — Samples as plain source in docs/examples/dwc, reproducible ZIPs via tools/sync-samples.py, CI drift check, PrismJS notice

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-03-PLAN.md — Commit 1: pure relocation from 965da6d, rebuilt overview, colocated images and rename map, stub removed, gate scripts repointed
- [x] 04-04-PLAN.md — bbj_check_syntax report for the 44 DWC samples (D-20, needs the BBj MCP)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-05-PLAN.md — Commit 2: normalization (H1, descriptions, fence languages, sidebar_position) and samples page downloads

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04-06-PLAN.md — Commit 3: Vale error fixes with pinned anchors, tools/verify-phase4.sh, full suite

### Phase 5: Intro-BBj Conversion

**Goal**: Readers can read the complete "Introduction to BBj Development" book, converted once from the Moodle course-2 backup
**Depends on**: Phase 3 (components); Phase 4 not required, but sequenced after it
**Requirements**: CONV-01, CONV-02, CONV-03, CONV-04, CONV-05, CONV-06, CONV-07, EXER-01
**Success Criteria** (what must be TRUE):

  1. `tools/moodle2docusaurus.py` runs against the course-2 backup and prints a report with zero unresolved files, `$@...@$` tokens, links and unclassified code, and every generated file compiles as MDX
  2. The book shows 28 chapter pages plus overview in an order matching the Moodle outline, with language-tagged code fences and no leftover HTML entities or `<br>` artefacts
  3. All 10 videos appear as `<YouTube>` embeds and all 8 referenced images appear with hand-written alt text
  4. Reader can download `BetterHelloWorld.bbj`, the OO samples ZIP, `Sample.bbj` and `samples.zip`, each unpacked into its own folder under `examples/intro-bbj/`
  5. Each of the 5 Moodle assignments is its own `9N-exercise-*.mdx` page after its section; the converter and the generated docs are committed separately

**Plans**: 6 plans

Plans:
**Wave 1**

- [x] 05-01-PLAN.md — Python pin legitimacy gate, local .venv, MDX compile check (wave 1)
- [x] 05-02-PLAN.md — Phase 5 checker and verify-phase5.sh against the output contract (wave 1)

**Wave 2** *(blocked on 05-01)*

- [x] 05-03-PLAN.md — Converter plus image/video maps, zero-unresolved scratch run, commit C1 (wave 2)

**Wave 3** *(blocked on 05-02, 05-03)*

- [x] 05-04-PLAN.md — Generated book, samples and ZIPs as verbatim commit C2 (wave 3)

**Wave 4**

- [x] 05-05-PLAN.md — Hand edits and link map (C3), Vale errors and typos (C4) (wave 4)

**Wave 5**

- [x] 05-06-PLAN.md — BBj syntax report and fixes (C5), full phase gate (wave 5)

### Phase 6: Exercises & DWC Gap Audit

**Goal**: The DWC book carries its exercises and all worthwhile course-4 material, and both books have an exercise index
**Depends on**: Phase 5
**Requirements**: EXER-02, EXER-03, EXER-04, AUDIT-01, AUDIT-02, AUDIT-03
**Success Criteria** (what must be TRUE):

  1. Reader finds DWC exercises as `9N-exercise-*.mdx` pages (inline ones extracted, missing ones from course-4 assignments), and each book has an exercise index listing all its exercises
  2. Where a sample solution exists, the exercise page shows it in a collapsed "Possible solution" block
  3. `tools/data/dwc-gap-audit.md` lists per course-4 page the missing paragraphs, code and screenshots with keep/drop/covered verdicts
  4. Kept material appears on the DWC pages (one commit series after the relocation, no slug renames), and screenshots matching 2022-era Moodle images by content hash carry `{/* TODO: screenshot outdated? */}`

**Plans**: 21 plans (17 + 4 gap closure)

Plans:
**Wave 1**

- [x] 06-01-PLAN.md — Phase 6 checker tools/check-dwc-phase6.py (8 subcommands)
- [x] 06-02-PLAN.md — Gap audit pre-fill script, unit and assignment drafts, assign-73 snippet

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-03-PLAN.md — Audit fragments: S0, S3 (3A, 3B1-3B4), S8 to S10
- [x] 06-04-PLAN.md — Audit fragments: S1 (1A, 1B, 1C)
- [x] 06-05-PLAN.md — Audit fragments: 2A, 2B (4 parked), 2D
- [x] 06-06-PLAN.md — Audit fragment: 2C
- [x] 06-07-PLAN.md — Audit fragments: 4A, 5A (8 parked)
- [x] 06-08-PLAN.md — Audit fragments: 6A, 7A

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 06-09-PLAN.md — Orchestrator BBj MCP check of kept and exercise snippets (non-autonomous)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 06-10-PLAN.md — Assemble and commit tools/data/dwc-gap-audit.md (D-18 step 1)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 06-11-PLAN.md — 11 DWC exercise pages, 6 solution blocks, pointer sections (D-18 step 2)

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 06-12-PLAN.md — Kept material: top-level pages and chapter 01

**Wave 7** *(blocked on Wave 6 completion)*

- [x] 06-13-PLAN.md — Kept material: chapter 02

**Wave 8** *(blocked on Wave 7 completion)*

- [x] 06-14-PLAN.md — Kept material: chapters 04 to 06

**Wave 9** *(blocked on Wave 8 completion)*

- [x] 06-15-PLAN.md — Kept material: chapters 07 to 11, remove parked images

**Wave 10** *(blocked on Wave 9 completion)*

- [x] 06-16-PLAN.md — 2022 screenshot markers, exercise indexes for both books (D-18 steps 4, 5)

**Wave 11** *(blocked on Wave 10 completion)*

- [x] 06-17-PLAN.md — tools/verify-phase6.sh and full gate (D-18 step 6)

**Gap closure, wave 1** *(after verification gaps_found)*

- [x] 06-18-PLAN.md — Exercise pages: json! in grid/Flexbox goals, Flexbox goal 4, exercise 01 flags and Button link (CR-01, WR-01..WR-03)
- [x] 06-19-PLAN.md — Kept prose: grid material, demo folder, icon sample, wording (WR-04..WR-08, IN-07..IN-09 part)
- [x] 06-20-PLAN.md — Chart.js callback in page and samples, validation duplicates, getClientFile (WR-09..WR-11, IN-06, IN-08/09 part)

**Gap closure, wave 2** *(blocked on 06-18..06-20)*

- [ ] 06-21-PLAN.md — Checker hardening: starter variable/snippet checks, WR-12, WR-13, full gate run

**Cross-cutting constraints:**

- Every kept BBj snippet is saved verbatim for the orchestrator check (D-05, D-14)

### Phase 7: Review, Acceptance & Go-Live

**Goal**: Both books are reviewed, clean and publicly live on GitHub Pages
**Depends on**: Phase 6
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04, QUAL-05, LIVE-01, LIVE-02
**Success Criteria** (what must be TRUE):

  1. Both books pass a hand review (headings, fences, entities, alt text, overviews) in light and dark mode, with fixes made in the Markdown
  2. Vale reports zero issues across all content, and every `.bbj` under `docs/examples/` passes `bbj_check_syntax`
  3. The intro book's last page and the DWC overview link to each other, and `docs/ROADMAP.md` carries the useful open items from DWC-Course's `.planning/`
  4. Acceptance passes: build green, the `PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/` grep in `docs/docs` is empty, sidebar orders match the Moodle outline and old site, PR build green
  5. The live site at `https://basishub.github.io/Courses/` loads a deep URL with all CSS, JS, fonts, images and search under `/Courses/`

**Plans**: TBD
**UI hint**: yes

### Phase 8: Redirects & Archive

**Goal**: Every old DWC-Course URL lands on the matching Courses page, and the old repo is archived
**Depends on**: Phase 7
**Requirements**: REDIR-01, REDIR-02, REDIR-03
**Success Criteria** (what must be TRUE):

  1. Opening any old `https://basishub.github.io/DWC-Course/<path>` URL lands on the matching `/Courses/docs/dwc/<path>` page with its `#fragment` preserved; unknown old paths show a `404.html` pointing to Courses
  2. A verification script confirms every redirect target against the live Courses sitemap
  3. DWC-Course's README points to Courses and the repository is archived, only after the redirects are verified live

**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Site Scaffold & Quality Gates | 4/4 | Complete    | 2026-10-03 |
| 2. Repo Hygiene & CI | 6/6 | Complete    | 2026-10-03 |
| 3. Content Components & Brand | 6/6 | Complete   | 2026-10-03 |
| 4. DWC Book Relocation | 6/6 | Complete   | 2026-10-04 |
| 5. Intro-BBj Conversion | 6/6 | Complete    | 2026-10-04 |
| 6. Exercises & DWC Gap Audit | 20/21 | In Progress|  |
| 7. Review, Acceptance & Go-Live | 0/TBD | Not started | - |
| 8. Redirects & Archive | 0/TBD | Not started | - |
