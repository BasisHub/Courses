# Moodle to Docusaurus migration: seed instructions for Claude Code

Read this file completely before touching anything. It describes the inputs, the target repository, the conversion rules, and the reference repository whose tooling, styling and behaviour this site mirrors. Build the converter as a throwaway script, run it until the output is clean, commit the generated Markdown, and from then on treat the Markdown as the source of truth. Do not build a sync tool back to Moodle.

## 1. Goal

One Docusaurus site that hosts BASIS training "books" as plain reading material. Two books exist today; more will follow. Each book is a sequence of chapters with text, screenshots, code samples, embedded YouTube videos, downloadable sample files, and "Try it yourself" exercises. There is no login, no enrolment, no submission, no completion tracking and no grading. Exercises are text the reader works through on their own.

The site looks and behaves like https://docs.webforj.com, whose source is https://github.com/webforj/webforj-documentation (MIT licensed, so its SCSS, theme overrides and workflows may be copied with the license notice kept). It lives in the GitHub repository `BasisHub/Courses` (to be created) and is served by GitHub Pages at `https://basishub.github.io/Courses/`.

One of the two books already exists as a Docusaurus site: `BasisHub/DWC-Course`, published at https://basishub.github.io/DWC-Course/. It is not re-imported from Moodle; it is moved into `Courses` as the first book (section 3). Only the Introduction book is converted from a Moodle backup.

## 2. Inputs

### 2.0 The existing DWC-Course repository

`git clone https://github.com/BasisHub/DWC-Course ../DWC-Course`. What is in it, as of the "complete v1 milestone" commit (2026-01-31):

- Docusaurus 3.9.2, React 19, TypeScript config (`docusaurus.config.ts`, `sidebars.ts`), `routeBasePath: '/'`, `baseUrl: '/DWC-Course/'`, deployed by `.github/workflows/deploy.yml` (Node 20, `npm run typecheck`, build, `upload-pages-artifact`, `deploy-pages`; PRs build without deploying).
- Plugins and themes: `@easyops-cn/docusaurus-search-local` (Cmd+K), `@docusaurus/theme-mermaid`, `@docusaurus/plugin-ideal-image` (pages use `import Image from '@theme/IdealImage'` with `require('@site/static/img/...')`), `docusaurus-plugin-zooming`.
- Content: `docs/index.md`, `prerequisites.md`, `samples.md`, `resources.md`, and 12 numbered chapter folders `01-gui-to-bui-to-dwc` ... `12-deployment`, each with `index.md` and zero to four sub-pages. The hand-written `sidebars.ts` groups the chapters into "Getting Started", "Core Concepts", "Advanced Topics", "Deployment". Roughly 14,800 words in total. Exercises are inline in some chapter pages, not separate pages. Chapters 3 (DWC Debugging) and 12 (Deployment) have no counterpart in Moodle.
- `samples/` with ten folders of BBj sources (`01_GUI2BUI2DWC` ... `09_EmbeddingOtherComponents`), its own LICENSE and README.
- `static/img/` with about 50 screenshots and GIFs, flat, CamelCase names.
- `src/components/Hero`, `HomepageFeatures`, `ChapterCards` and `src/css/custom.css` (its own blue palette; to be replaced by the webforJ look).
- `CLAUDE.md`, `README.md`, a `.planning/` folder (PROJECT.md, MILESTONES.md, STATE.md, phases, research) from the process that built v1, and `BASIS Dynamic Web Client (DWC) Implementation.md` at the root.
- `themeConfig.prism.additionalLanguages` lists `'bbj'`, but there is no grammar file under `src/`; check how the build resolves this before relying on it (6.4 provides a real grammar either way).

The content of this repo is a condensed rewrite of the Moodle course, not a transcript: the Moodle page "1C. Taking an App From GUI to BUI to DWC" alone has about 3,000 words and 15 screenshots, and the Moodle Assignments carry exercise text that the rewrite partly folded into chapter prose. Treat the repo as the current, better-structured version and the Moodle backup as the richer source to audit it against (section 3.4).

### 2.1 Moodle backups

Two Moodle course backups, made 2026-10-03 with user data switched off (the `-nu` suffix):

| File | Course | Size | Use |
|---|---|---|---|
| `backup-moodle2-course-2-bbj_development_basics-20261003-1014-nu.mbz` | Introduction to BBj Development (course id 2) | 243 KB | Converted to the `intro-bbj` book (sections 5 and 6) |
| `backup-moodle2-course-4-bbjdwc-20261003-1015-nu.mbz` | BBj 24.02+ DWC Training (course id 4) | 16.7 MB | Gap audit of the existing DWC book only (3.4). Not converted wholesale |

Ignore course 3 ("BBj DWC Training"); it is the superseded predecessor of course 4.

Put both files in `import/` at the repo root. After the first successful run add `import/unpacked/` to `.gitignore`. Commit the 243 KB archive; keep the 16.7 MB one out of git (or in Git LFS) and note in `import/README.md` where it lives.

### 2.2 Archive format

An `.mbz` is either a gzip tar or a zip; Moodle 3.x and 4.x default to tar. Check with `file`, then unpack:

```bash
mkdir -p import/unpacked/intro import/unpacked/dwc
tar -xzf import/backup-moodle2-course-2-*.mbz -C import/unpacked/intro || unzip -q import/backup-moodle2-course-2-*.mbz -d import/unpacked/intro
tar -xzf import/backup-moodle2-course-4-*.mbz -C import/unpacked/dwc   || unzip -q import/backup-moodle2-course-4-*.mbz -d import/unpacked/dwc
```

### 2.3 What is inside

```
moodle_backup.xml          course title, ordered list of sections and activities (moduleid, modulename, sectionid, directory)
course/course.xml          fullname, shortname, summary
sections/section_N/section.xml      name, summary (HTML), sequence (ordered module ids), visible
activities/book_N/book.xml          <name>, <intro>, <chapters><chapter id><pagenum><subchapter><title><content><hidden>
activities/page_N/page.xml          <name>, <intro>, <content>
activities/assign_N/assign.xml      <name>, <intro> (the exercise text), <activity> (optional extra instructions)
activities/resource_N/resource.xml  a downloadable file; the file itself is referenced through inforef.xml
activities/*/module.xml             <visible>, <completion>, <idnumber>; use <visible> to skip hidden modules
activities/*/inforef.xml            <fileref><file><id> list: which entries in files.xml belong to this module
files.xml                  one <file> per stored file: id, contenthash, contextid, component, filearea, itemid, filepath, filename, mimetype
files/ab/abcdef0123...     the actual binaries, named by contenthash, in two-hex-digit subfolders
```

HTML content fields refer to attached files as `@@PLUGINFILE@@/Some%20Name.png`. Resolve them by URL-decoding the name and matching `files.xml` on `filename` within the module's `inforef.xml` file ids (or, equivalently, on `contextid` plus `component` plus `filearea` plus `itemid`: book chapters use `mod_book` / `chapter` / `<chapter id>`, pages use `mod_page` / `content` / `0`, assignment intros use `mod_assign` / `intro` / `0`, resources use `mod_resource` / `content` / `0`). Ignore `files.xml` entries whose `filename` is `.` (directory markers).

### 2.4 Observed content in Moodle, so you know what to expect

Introduction to BBj Development (course 2): four topic sections plus "General". Content lives in five Book modules (chaptered), each book is one lesson. Videos are YouTube links (`https://youtu.be/...`) stored as plain `<a>` anchors; Moodle's media filter turns them into players at render time, the backup holds only the anchor. Sample files: `BetterHelloWorld.bbj`, a ZIP with `Car.bbj`, `CarApplication.bbj`, `MyDialog.bbj`, plus `Sample.bbj` and `sample.css`. Six Assignments carry the exercises (Tic-Tac-Toe, computer player, Login Dialog, OO Tic-Tac-Toe, responsive Login Dialog). The "Announcements" forum is hidden and irrelevant.

BBj 24.02+ DWC Training (course 4): ten numbered sections plus "General" and "Feedback". Content is mostly Page modules (one per sub-lesson, named "1A.", "1B.", ...), two Books ("Prerequisites - READ FIRST!", "3B. Upgrading BBjGrids"), and one Page of resource links. Pages are image-heavy (up to 15 screenshots per page, filenames with spaces and timestamps such as `Microsoft Edge - Hello BBj DWC- screenshot 2022-06-30 at 08.27.21.png`) and have many `<pre>` blocks without a language class, mixing BBj, CSS and HTML. The HTML uses `<br>` runs instead of paragraphs and inline `<span style>` / `<strong>` formatting heavily. Twelve Assignments carry the exercises. Skip the forum and the Feedback module.

## 3. Reference repository: what to mirror from webforj-documentation

Clone it next to this repo for reference: `git clone --depth 1 https://github.com/webforj/webforj-documentation ../webforj-documentation`. The Docusaurus site lives in its `docs/` subfolder (the repo root holds a Maven project for the webforJ demo server, which is irrelevant here). Everything below refers to paths inside that `docs/` folder unless marked "repo root".

### 3.1 Mirror as is (copy, then adapt names)

| What | Where in webforj-documentation | Notes |
|---|---|---|
| Repo shape: site in `docs/`, `CLAUDE.md`, `CONTRIBUTING.md`, `.editorconfig`, `.vale.ini`, `.github/.styles/` at repo root | repo root | Keep the `docs/` subfolder even though there is no Maven part, so the two repos stay navigable the same way |
| Docusaurus 3.9 classic preset, SCSS via `docusaurus-plugin-sass`, `@docusaurus/theme-mermaid`, `docusaurus-plugin-llms` (generates `llms.txt` and `llms-full.txt`), `@docusaurus/plugin-client-redirects` | `package.json`, `docusaurus.config.js` | Drop `@mui/*`, `@emotion/*`, `react-material-ui-carousel`, the i18n translator and its `openai` dependency, the cookbook plugin and its `tools/*.mjs`. Keep `prism-react-renderer`, `clsx`, `sass` |
| DWC look: `dwc-ui.css` from `https://cdn.webforj.com/next/dwc-ui.css` in `headTags`, Inter and JetBrains Mono from Google Fonts, Infima variables mapped to `--dwc-*` tokens | `docusaurus.config.js` `headTags`, `src/css/custom.scss` | Copy `custom.scss` and the partials it `@use`s: `_alerts`, `_tables`, `_announcement`, `_prism`, `_navbar`, `_sidebar`, `_footer`, `_category`, `_content`, `_toc`, `_pagination`, `_tutorial-content`, `_utils`, `_reset`, `_accordion`, `_root`, `mixins/`. Skip `_blog.scss` and `components/dwc-doc-components.scss`. Remove the `.MuiChip-root` rules |
| Dark/light behaviour: the theme switcher that mirrors Docusaurus `data-theme` into `data-app-theme` for DWC and animates the toggle with a view transition | `static/js/dwc-theme-switcher.js`, registered in `scripts` | Copy verbatim |
| External link decoration | `static/js/link-decorator.js` | Copy verbatim |
| Code theme | `src/theme/prism-dwc-theme.js`, used for both `theme` and `darkTheme` | Copy verbatim, add the `bbj` grammar (5.4) |
| Theme overrides: `Heading` (anchor behaviour), `CodeBlock/Line`, `MDXContent` | `src/theme/` | Copy; trim `MDXComponents.js` to what this site uses (see 3.2) |
| Dark navbar with logo, GitHub icon on the right (`header-github-link` class with the inline SVG variable), `trailingSlash: false`, `onBrokenAnchors: 'throw'`, `markdown.hooks.onBrokenMarkdownLinks: 'throw'`, `onBrokenMarkdownImages: 'throw'` | `docusaurus.config.js` | Same values |
| Footer: single HTML block "Copyright © year BASIS International Ltd. All rights reserved." | `docusaurus.config.js` `footer` | Same |
| Category icons via `_category_.json` `className: "cat-icon cat-icon--<name>"` and `link: {type: 'doc', id: ...}` | `docs/*/_category_.json`, `src/css/_sidebar-icons.scss` | Use the pattern for book-level categories; sections inside a book get no icon |
| Vale prose linting with the Google package plus the house style, run on PRs through `errata-ai/vale-action@reviewdog` with `fail_on_error: true` | repo root `.vale.ini`, `.github/.styles/webforJ/*.yml`, `.github/workflows/reviewdog.yml` | Copy the style folder, rename `webforJ` to `BASIS` in `.vale.ini` and the folder, keep the rules (`EmDashes`, `Puffery`, `Hedging`, `Weasel`, `BeDirect`, `Simplify`, `Capitalization`, `SmartQuotes`, `Parallelism`); drop `AIArtifacts`, `AIDisclaimer`, `AIVocab` unless wanted. Add BBj vocabulary (`BBj`, `DWC`, `BUI`, `BBjGridExWidget`, `SysGui`, `ARC`, `webforJ`) to `.github/.styles/config/vocabularies/BASIS/accept.txt` |
| PR build check | `.github/workflows/test-build.yml` | Rewrite for `npm ci && npm run build` in `docs/` instead of Maven (see 3.3) |
| `CLAUDE.md` structure: tool rules, documentation standards, validation requirements, code verification workflow, quality checklist, forbidden actions | repo root `CLAUDE.md` | Rewrite for BBj (section 7); keep the shape |

### 3.2 Adapt rather than copy

- `MDXComponents.js`: keep `Tabs`, `TabItem`, `DocCardList`, `ExpandableCode` (collapsible long code blocks, useful for the DWC samples), `TableWrapper` (as `table`). Add the site's own `YouTube` and drop everything webforJ-specific (`ComponentDemo`, `DocChip`, `JavadocLink`, `ParentLink`, `TableBuilder`, `ComponentArchetype`, `GiscusComments`, `AskMenu`, gallery and MUI accordion components). If reader comments are wanted later, `GiscusComments.js` is the ready-made way (GitHub Discussions backed), but do not enable it for the first release.
- Navbar items: replace "Getting Started / Components / craftforJ" with one `docSidebar` item per book (or a "Books" dropdown once there are more than three), keep the search item, the GitHub link and the dark style. No version badge, no locale dropdown, no "Start your app" link.
- `announcementBar`: keep the mechanism, set it to a neutral message or disable until there is news.
- Search: webforJ uses Algolia DocSearch with Ask AI. Apply for the free DocSearch program once the site is public (https://docsearch.algolia.com/apply); until the credentials arrive use `@easyops-cn/docusaurus-search-local` so search works from day one. Keep the Algolia config block commented in place so switching is a one-line change.
- `i18n`: `defaultLocale: 'en'`, `locales: ['en']`. webforJ's translator pipeline is out of scope.
- Analytics (`gtag`, `googleTagManager`): omit unless Stephan provides IDs.
- Redirects: start empty; this plugin exists so that renaming a chapter later never breaks an external link.

### 3.3 Hosting: GitHub Pages instead of the WAR pipeline

webforJ packages the Docusaurus build into a WAR with Maven and uploads it to S3 (`build-and-deploy-war.yml`) because the same deployment serves the live Java demos embedded in the docs. This site has no server-side part, so the equivalent that stays entirely in GitHub is Pages:

- Start from DWC-Course's `.github/workflows/deploy.yml`, which already does this correctly (build job with `npm ci`, `npm run typecheck`, `npm run build`, `upload-pages-artifact@v3`; deploy job with `deploy-pages@v4`, gated on `push` to `main`; PRs run the build job only). Change the working directory to `docs/` (`defaults.run.working-directory: docs`, `cache-dependency-path: docs/package-lock.json`, artifact `path: docs/build`). This replaces both of webforJ's Maven workflows.
- Repository: `BasisHub/Courses`, Pages source "GitHub Actions". Config values: `url: 'https://basishub.github.io'`, `baseUrl: '/Courses/'`, `organizationName: 'BasisHub'`, `projectName: 'Courses'`, `trailingSlash: false`, `editUrl: 'https://github.com/BasisHub/Courses/tree/main/docs/'`. No `CNAME` for now; if a custom domain comes later, add `docs/static/CNAME` and set `baseUrl: '/'` the way webforJ does.
- Keep `routeBasePath: 'docs'` as in webforJ, so the DWC book moves from `https://basishub.github.io/DWC-Course/<path>` to `https://basishub.github.io/Courses/docs/dwc/<path>`.
- Old URLs must keep working, since the DWC course is public and linked. GitHub Pages cannot redirect across repositories, so after `Courses` is live, replace the DWC-Course site with a redirect-only build: one `index.html` per old route (generate the list from the old `build/` output or the sitemap) containing `<meta http-equiv="refresh" content="0; url=https://basishub.github.io/Courses/docs/dwc/<new-path>">` plus a canonical link and a plain fallback link. Commit that as the only content of DWC-Course's `main`, keep its deploy workflow, archive the repository, and update its README to point to `Courses`.

### 3.4 Folding DWC-Course into Courses

1. Move the content as is: `docs/docs/*` → `docs/docs/dwc/`, `static/img/*` → `docs/docs/dwc/<chapter>/img/` (colocated, renamed to kebab-case; a mapping table in the commit message), `samples/*` → `docs/examples/dwc/` and `docs/static/files/dwc/` (keep its LICENSE and README). Replace `import Image from '@theme/IdealImage'` plus `<Image img={require(...)}/>` with plain Markdown images `![alt](./img/name.png)`; drop `plugin-ideal-image`. Keep `docusaurus-plugin-zooming` (image zoom on click) and Mermaid, both fit the webforJ base.
2. Replace the hand-written sidebar groups ("Getting Started", "Core Concepts", "Advanced Topics", "Deployment") with an autogenerated sidebar for `dwc`, keeping the four groups as `_category_.json` folders only if the chapter order needs them; otherwise the numbered chapter folders are enough.
3. The existing `index.md`, `prerequisites.md`, `samples.md`, `resources.md` become `dwc/overview.mdx`, `dwc/00-prerequisites.mdx`, `dwc/samples.mdx`, `dwc/resources.mdx`.
4. Extract the inline exercises into `9N-exercise-*.mdx` pages with the `:::exercise` admonition (6.3) so both books follow one pattern. Where a chapter has no exercise but the Moodle Assignment for that section exists, take the exercise text from `activities/assign_N/assign.xml` in the backup.
5. Gap audit against the Moodle backup, chapter by chapter: for each Moodle Page or Book chapter, find the corresponding `dwc` page and list paragraphs, code samples and screenshots that the rewrite dropped. Write the list to `import/dwc-gap-audit.md` with a keep / drop / already-covered verdict per item, and add the kept material to the pages. Do this as a separate commit series after the move, so the move itself stays a pure relocation.
6. Carry over what is worth keeping from the old repo's `.planning/` (the content audit and the open "Active" requirements such as Algolia and i18n) into `docs/ROADMAP.md`; do not copy the `.planning/` machinery itself. Delete `src/components/Hero`, `HomepageFeatures`, `ChapterCards` and `src/css/custom.css` in favour of the webforJ styling and a book-card landing page (section 4).

## 4. Target repository layout

```
.
├── CLAUDE.md
├── CONTRIBUTING.md
├── .editorconfig
├── .vale.ini
├── .github/
│   ├── .styles/                     Google package + BASIS style (from webforJ)
│   └── workflows/
│       ├── deploy.yml               GitHub Pages
│       ├── test-build.yml           PR build gate
│       └── reviewdog.yml            Vale on PRs
├── import/                          the .mbz archives, import/README.md, dwc-gap-audit.md
├── tools/
│   └── moodle2docusaurus.py         the throwaway converter
└── docs/                            the Docusaurus site (same subfolder convention as webforJ)
    ├── package.json
    ├── docusaurus.config.js
    ├── sidebars.js                  one autogenerated sidebar per book
    ├── docs/
    │   ├── intro-bbj/               book: Introduction to BBj Development
    │   │   ├── _category_.json      label, position, className "cat-icon cat-icon--intro-bbj", link to overview
    │   │   ├── overview.mdx         book landing page (course summary + "Introduction - PLEASE READ FIRST" book)
    │   │   ├── 01-getting-started/
    │   │   │   ├── _category_.json
    │   │   │   ├── 01-first-hello-world.mdx
    │   │   │   ├── 02-syntax-and-variables.mdx
    │   │   │   ├── ...
    │   │   │   ├── 90-exercise-tic-tac-toe.mdx
    │   │   │   ├── 91-exercise-computer-player.mdx
    │   │   │   └── img/
    │   │   └── 02-object-oriented/ ...
    │   └── dwc/                     book: BBj DWC Training (moved from BasisHub/DWC-Course, 3.4)
    │       ├── _category_.json
    │       ├── overview.mdx
    │       ├── 00-prerequisites.mdx
    │       ├── samples.mdx
    │       ├── resources.mdx
    │       ├── 01-gui-to-bui-to-dwc/
    │       │   ├── index.md
    │       │   ├── 01-registering-launching.md
    │       │   ├── 02-hello-world.md
    │       │   ├── 03-gui-to-bui-to-dwc.md
    │       │   ├── 90-exercise-gui-to-bui-to-dwc.mdx
    │       │   └── img/
    │       └── ... 12-deployment/
    ├── ROADMAP.md                   carried over from DWC-Course/.planning
    ├── examples/                    the .bbj samples as plain source, syntax-checked in CI (dwc/ from the old samples/)
    ├── static/
    │   ├── CNAME
    │   ├── img/                     logo, social cover, favicon
    │   ├── js/                      dwc-theme-switcher.js, link-decorator.js (from webforJ)
    │   └── files/<book>/            downloadable samples
    └── src/
        ├── components/
        │   ├── YouTube/             responsive youtube-nocookie embed
        │   └── DocsTools/           ExpandableCode, TableWrapper (from webforJ)
        ├── css/                     custom.scss and partials (from webforJ)
        ├── prism/bbj.js
        └── theme/                   prism-dwc-theme.js, Heading, CodeBlock/Line, MDXContent, MDXComponents.js
```

Naming: folders and files are kebab-case ASCII, prefixed with a two-digit position (`01-`, `02-`) so Docusaurus orders them without front matter positions; Docusaurus strips the numeric prefix from the URL. Exercises get `90-` and up so they sort after the chapters of their section. Book folder names are stable identifiers; the display title lives in `_category_.json` and `overview.mdx`.

Docs plugin `routeBasePath: 'docs'` as in webforJ, so book URLs are `/Courses/docs/intro-bbj/...` and `/Courses/docs/dwc/...`. The site root `/` is a small `src/pages/index.js` listing the books as cards (reuse webforJ's `_category.scss` card look).

## 5. Mapping rules

| Moodle | Docusaurus |
|---|---|
| Course | Book folder under `docs/docs/`, sidebar entry, navbar item |
| Course fullname and summary | `docs/<book>/overview.mdx`, linked from the book's `_category_.json` |
| Section (topic) | Folder with `_category_.json` (label = section name; decide once whether the leading number stays in the label and apply it everywhere). Section `summary` becomes the category's `link: {type: "generated-index", description: ...}` so the summary text is not lost |
| Book module with chapters | One `.mdx` per chapter; chapter `title` becomes front matter `title` (Docusaurus renders the H1); `subchapter=1` chapters stay flat but get the parent chapter's slug as prefix (`03-syntax-and-variables`, `03a-string-operations`); `hidden=1` chapters are skipped |
| Book `intro` | Lead paragraph of the first chapter page, or dropped if it only repeats the name |
| Page module | One `.mdx`; `name` becomes the title; strip the leading "1A." style code from the title but keep it in the file position |
| Assignment | One `.mdx` named `9N-exercise-<slug>.mdx` holding the `intro` HTML (plus `activity` if non-empty) inside an `:::exercise` admonition. Drop dates, submission settings, grading, and completion entirely |
| Resource (File) | Copy to `static/files/<book>/<original-filename>` and to `examples/<book>/`. Unzip ZIPs into both places and keep the ZIP too. Where the course page showed a description under the file (the `intro`), add a short "Download" paragraph with that text and a link `/files/<book>/<name>` at the end of the chapter that precedes it in the section sequence |
| Forum, Feedback, Announcements, anything with `visible=0` | Skip |
| Labels (modtype `label`) | Inline into the preceding page as a paragraph, or into the category description if first in the section |

Sequence comes from `section.xml` `<sequence>` (comma-separated module ids), not from the order of directories.

## 6. HTML to MDX conversion rules

Use Python with `lxml` or `BeautifulSoup` for the pre-processing and `markdownify` (or pandoc `html -t gfm-raw_html`) for the final conversion. Pre-process before converting; post-process after. `npm run build` with the throw settings from 3.1 is the acceptance test, Vale is the second.

### 6.1 Pre-processing (on the HTML DOM)

1. Replace `@@PLUGINFILE@@/<encoded-name>` with the resolved file. Images: copy to the page's sibling `img/` folder under a kebab-case name without spaces, timestamps or duplicate words (`eclipse-run.png`, `hello-bbj-dwc-edge.png`); keep a mapping file so re-runs are stable. Non-image attachments: copy to `static/files/<book>/` and link.
2. Turn `<a href="https://youtu.be/ID">` and `<a href="https://www.youtube.com/watch?v=ID">` (also bare URLs in text) into a placeholder `<youtube id="ID"></youtube>`; post-processing turns it into `<YouTube id="ID" title="..." />`. `YouTube` is registered globally in `MDXComponents.js`, so no import line is needed in the pages.
3. Collapse `<br><br>` runs into paragraph breaks; a single `<br>` inside a `<p>` stays a line break. Unwrap `<span>` with only style attributes. Map `<strong>`/`<b>` to bold and `<em>`/`<i>` to italics; drop font-size and color styling entirely. Convert `<h2>`..`<h5>` so that content headings start at H2 (the title is the only H1).
4. `<pre>` blocks: trim, normalize line endings, and classify the language with a heuristic so the Markdown fence gets a tag: lines starting with `rem`, `REM`, `declare`, `print`, `use `, `method`, `class`, `wait`, `goto`, `gosub`, `process_events`, or containing `!` method calls or `$` string variables → `bbj`; `{ ... :  ...; }` with selectors → `css`; starts with `<` → `html`; `function`, `const`, `=>`, `document.` → `javascript`; otherwise no tag. Anything that is one line and looks like a path or command → `bash` or plain. Review the unclassified ones by hand after the first run; there should be few. Blocks longer than 40 lines are wrapped in `<ExpandableCode>` (from webforJ) so pages stay scannable.
5. `<img>` inside `<a>` pointing to the same image (lightbox pattern) → plain image. Keep `alt`; when `alt` is empty, use the cleaned filename as alt.
6. Internal links to other Moodle pages (`mod/page/view.php?id=N`, `mod/book/view.php?id=N&chapterid=M`, `course/view.php?id=N#section-K`) → resolve to the generated relative doc path through the module id map. Links to `documentation.basis.cloud`, GitHub, and other external sites stay as they are.
7. Tables stay as HTML if they have colspan/rowspan, otherwise convert to GFM tables.

### 6.2 Post-processing (on the Markdown text)

1. Escape MDX-hostile characters that appear in BBj prose and code outside fences: `{`, `}`, `<` followed by a letter. Inside fences nothing needs escaping. BBj uses `!` and `$` suffixes and `<>` for not-equal; double-check that comparison operators in running text survived.
2. Normalize headings so there is exactly one blank line before and after.
3. Front matter per page:
   ```yaml
   ---
   title: "A first Hello World"
   description: "<first sentence of the page, max 160 chars>"
   ---
   ```
   Add `sidebar_label` only where the title is too long for the sidebar.
4. Make sure every file ends with a single newline and contains no `@@PLUGINFILE@@`, no `pluginfile.php`, no `moodle.basis-europe.eu` URLs. Grep for these as part of the acceptance test.
5. Run `vale docs/docs` and fix what it flags in the Markdown. Expect the imported Moodle prose to trip `Puffery`, `Hedging` and `EmDashes` often; fixing those by hand is part of the migration, not a converter task.

### 6.3 Exercises

Register a custom admonition `exercise` in `docusaurus.config.js` (`presets[0][1].docs.admonitions = { keywords: ['exercise', 'note', 'tip', 'info', 'warning', 'danger'] }`) and style it in `src/css/_alerts.scss` next to webforJ's `.alert--*` rules, using the DWC success palette (`--dwc-color-success-alt` background, `--dwc-color-success` border) and a "Try it yourself" label. Each exercise page looks like:

```mdx
---
title: "Exercise: Write a Tic-Tac-Toe game"
---

:::exercise Try it yourself

<exercise text from the assignment intro, converted>

:::
```

No due dates, no "submit", no "mark as done". If an assignment has a sample solution attached as a file, link it at the end inside a `<details><summary>Possible solution</summary>` block.

### 6.4 Code highlighting for BBj

Prism has no BBj grammar. Add `src/prism/bbj.js` with a grammar covering: `rem` comments (both `rem ...` on its own line and `; rem ...` after a statement), strings in double quotes with `""` escapes, numeric literals, `$` string variables and `!` object variables, labels (`name:` at line start), keywords (`declare`, `use`, `class`, `classend`, `method`, `methodend`, `field`, `interface`, `if`, `then`, `else`, `endif`, `fi`, `while`, `wend`, `for`, `next`, `switch`, `case`, `swend`, `goto`, `gosub`, `return`, `print`, `let`, `dim`, `read`, `write`, `open`, `close`, `process_events`, `callback`, `wait`, `release`, `end`, `seterr`, `setesc`, `new`, `cast`, `extends`, `implements`, `public`, `private`, `protected`, `static`, `void`, `auto`) case-insensitively, and the `#` field prefix. Register it in `src/theme/prism-include-languages.js` and set `additionalLanguages: ['bbj', 'java', 'css', 'markup', 'javascript', 'bash', 'json']` under `themeConfig.prism`, keeping webforJ's `prism-dwc-theme` for both light and dark. Verify keywords against the BBj documentation MCP (`bbj_reserved_word`, `bbj_lookup`) rather than guessing.

### 6.5 Videos

`src/components/YouTube/index.js`: a responsive 16:9 wrapper around a privacy-enhanced iframe (`https://www.youtube-nocookie.com/embed/<id>`), `loading="lazy"`, `title` required, styled with DWC tokens (`--dwc-border-radius-m`, `--dwc-surface-2`). Do not download or re-host the videos.

## 7. CLAUDE.md to put in the repo root

Write this file; it is what makes later maintenance one-prompt work. It follows the shape of webforJ's `CLAUDE.md` (tool rules, standards, validation, verification workflow, checklist, forbidden actions) with BBj content.

```markdown
# Claude Instructions

You maintain the BASIS training books (github.com/BasisHub/Courses, served at basishub.github.io/Courses):
a Docusaurus site under docs/ that mirrors the tooling and look of webforj/webforj-documentation. Books today:
docs/docs/intro-bbj (Introduction to BBj Development) and docs/docs/dwc (BBj DWC Training, formerly the
BasisHub/DWC-Course repository). The content teaches BBj and DWC development. There are no LMS features:
no login, no tracking, no submissions. Exercises are reading material in :::exercise admonitions.

## Tool calling
1. Before writing or changing BBj code, read bbj://primer from the BBj Documentation MCP, then verify every
   verb, function, BBjAPI class and method with bbj_lookup. Never guess an API.
2. Check every BBj snippet with bbj_check_syntax before it goes into a page or into examples/.
3. Run vale on changed Markdown and fix all findings before committing.
4. Explain why you call a tool before calling it; wait for results.

## Conventions
- Site lives in docs/. Books are folders under docs/docs/<book>/; sections are numbered folders inside.
- Files and folders: kebab-case, two-digit position prefix (01-, 02-). Exercises use 90+ within a section.
- Front matter has title and description. Content starts at H2.
- Code fences always carry a language: bbj, java, css, html, javascript, bash, json.
- Screenshots live in the section's img/ folder, referenced as ./img/name.png. Names: kebab-case, no spaces,
  no timestamps. Alt text required.
- Videos: <YouTube id="..." title="..." />. Never raw iframes.
- Downloadable samples live in static/files/<book>/ and as plain source in examples/<book>/. Keep both in sync.
- Styling comes from DWC tokens (--dwc-*) through src/css; do not hardcode colors. Light and dark both work.
- Language: English, direct, second person. Vale (Google + BASIS styles) is the arbiter. No em dashes.
- Never reference moodle.basis-europe.eu.

## Before committing
- cd docs && npm run build passes (broken links, anchors and images throw).
- vale docs/docs reports zero issues on the files you touched.
- Every .bbj under docs/examples/ passes bbj_check_syntax. Fix the sample, not the check.

## Adding a new book
1. mkdir docs/docs/<book-slug>; add _category_.json (label, position, className "cat-icon cat-icon--<book-slug>",
   link to overview) and overview.mdx.
2. Add a sidebar in sidebars.js, a navbar item in docusaurus.config.js, a card on src/pages/index.js,
   and a sidebar icon rule in src/css/_sidebar-icons.scss.
3. tools/moodle2docusaurus.py exists for importing further Moodle backups; it is not maintained beyond that.

## Forbidden
- Committing with Vale findings or a failing build.
- Unverified BBj API names or syntax.
- Adding LMS-style features (progress, quizzes with grading, accounts).
- Copying webforJ-specific components (DocChip, JavadocLink, ComponentDemo) into this site.
```

## 8. Work plan for the first sessions

1. Create `BasisHub/Courses` (empty, `main`, Pages source "GitHub Actions"). Clone `webforj/webforj-documentation` and `BasisHub/DWC-Course` next to it. Scaffold `docs/` with `npx create-docusaurus@latest docs classic`, then replace `package.json` dependencies, `docusaurus.config.js`, `src/css`, `src/theme`, `static/js` with the webforJ versions per 3.1 and 3.2, set the `BasisHub/Courses` values from 3.3, delete the blog and sample docs, and get `npm run start` showing an empty site in the DWC look with working dark mode. Commit.
2. Copy `.vale.ini`, `.github/.styles`, `.editorconfig`, `CONTRIBUTING.md` from webforJ, rename the style, add the BBj vocabulary. Adapt DWC-Course's `deploy.yml` (3.3). Commit; confirm the empty site deploys to `https://basishub.github.io/Courses/`.
3. Move DWC-Course in (3.4 steps 1 to 3): pure relocation, no content edits. Build must pass. Commit.
4. Unpack the Introduction archive (2.2). Write `tools/moodle2docusaurus.py` taking `--src import/unpacked/intro --book intro-bbj --title "Introduction to BBj Development"`. Print a report at the end: pages written, images copied, unresolved `@@PLUGINFILE@@` refs, unclassified `<pre>` blocks, internal links not resolved, skipped modules with reason. Run it, fix the converter until all unresolved counts are zero. Commit the converter and the generated docs separately.
5. Add the Prism grammar (6.4), the YouTube component (6.5), the exercise admonition (6.3), `ExpandableCode`, local search, the book-card landing page, `CLAUDE.md` (7), `ROADMAP.md`. Extract the DWC inline exercises into exercise pages (3.4 step 4).
6. Hand-review both books in `npm run start`: headings, code fences (right language, no HTML entities left such as `&lt;`), exercise pages, image alt texts, the overview pages, light and dark mode. Fix in the Markdown, not in the converter, once the converter output is accepted.
7. Run Vale over everything and work through the findings. Expect many in the moved DWC pages too; they were never linted.
8. Acceptance: `npm run build` passes; `grep -r "PLUGINFILE\|pluginfile.php\|moodle.basis-europe\|DWC-Course/" docs/docs` is empty; Vale is clean; every `.bbj` under `docs/examples/` passes the syntax check; the `intro-bbj` sidebar order matches the Moodle outline (2.4) and the `dwc` order matches the old site; the PR build is green; the deploy publishes to Pages.
9. After acceptance: the DWC gap audit against the Moodle backup (3.4 step 5) as its own PR series, then the DWC-Course redirect build and archive (3.3).

## 9. Decisions still open for Stephan

- Whether the four sidebar groups of the old DWC site ("Getting Started", "Core Concepts", "Advanced Topics", "Deployment") stay, or the twelve chapters sit flat under the book.
- Whether the gap audit (3.4 step 5) should be done before or after going live with `Courses`; the plan above says after, so the move stays a relocation.
- Custom domain for Pages later (would change `baseUrl` to `/` and add `CNAME`), or `basishub.github.io/Courses` for good.
- Logo and social cover image for `static/img/` (the old site has `dwc-logo.png`, `logo.svg`, `social-card.jpg`; webforJ uses `webforj.svg` and `social-cover.png`). The site needs a BASIS-level logo now, not a DWC one.
- Whether to apply for Algolia DocSearch right away (it was already on the old site's roadmap) or stay with local search.
- Whether the superseded Moodle course 3 content should be checked for chapters that course 4 dropped but that are still worth keeping.
- Whether screenshots that show BBj 22-era UI should be flagged for re-capture (add a `<!-- TODO: screenshot outdated? -->` comment where the image filename has a 2022 timestamp, so they can be found later).
