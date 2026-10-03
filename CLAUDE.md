# Claude Instructions

You maintain the BASIS training books (github.com/BasisHub/Courses, served at https://basishub.github.io/Courses/): a Docusaurus site under `docs/` that mirrors the tooling and look of webforj/webforj-documentation. Books live in `docs/docs/<book>/`. Today: `docs/docs/intro-bbj` (Introduction to BBj Development) and `docs/docs/dwc` (BBj DWC Training, formerly the BasisHub/DWC-Course repository). The content teaches BBj and DWC development. There are no LMS features: no login, no tracking, no submissions. Exercises are reading material in `:::exercise` admonitions.

Spec: `.planning/migration-seed.md`. Decisions: `.planning/PROJECT.md`. Stack detail: `.planning/research/STACK.md`.

## Tool calling
1. Before writing or changing BBj code, read `bbj://primer` from the BBj Documentation MCP, then verify every verb, function, BBjAPI class and method with `bbj_lookup`. Never guess an API.
2. Check every BBj snippet with `bbj_check_syntax` before it goes into a page or into `docs/examples/`.
3. Run Vale on changed Markdown and fix all findings before committing.
4. Explain why you call a tool before calling it; wait for results.

## Conventions
- Site lives in `docs/`. Books are folders under `docs/docs/<book>/`; sections are numbered folders inside.
- Files and folders: kebab-case ASCII, two-digit position prefix (`01-`, `02-`). Exercises use `90-` and up within a section.
- Front matter has `title` and `description`. Content headings start at H2.
- Every code fence carries a language: bbj, java, css, html, javascript, bash, json.
- Screenshots live in the section's `img/` folder, referenced as `./img/name.png`. Names: kebab-case, no spaces, no timestamps. Alt text required.
- Videos: `<YouTube id="..." title="..." />`. Never raw iframes.
- MDX comments use `{/* ... */}`, never `<!-- -->`.
- Downloadable samples live in `docs/static/files/<book>/` and as plain source in `docs/examples/<book>/`. Keep both in sync.
- Styling comes from DWC tokens (`--dwc-*`) through `docs/src/css`; do not hardcode colors. Light and dark both work.
- Fonts come from `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`; `docs/static/css/dwc-ui.css` is a vendored snapshot. Never add Google Fonts or CDN links.
- `import/` is a local workspace that is never committed. Audit and mapping outputs go to `tools/data/`.
- All `@docusaurus/*` packages are exact-pinned at one version (3.10.2). Node 24 per `docs/.nvmrc`. CI and fresh clones use `npm ci`; run `npm install` only to update the lockfile on purpose.
- Language: English, direct, second person. Vale (Google + BASIS styles) is the arbiter for prose. House rule: no em dashes.
- Copied webforJ files keep their MIT header line and are listed in `THIRD_PARTY_NOTICES.md`.
- Never reference moodle.basis-europe.eu.

## Before committing
- `cd docs && npm run build` passes (broken links, anchors, Markdown links and images throw).
- `tools/.bin/vale docs/docs` (after `bash tools/install-lint-tools.sh`) shows no errors on files you touched.
- `bash tools/prove-gates.sh` passes after config changes.
- `bash tools/verify-phase1.sh` and `bash tools/verify-phase2.sh --local` stay green.
- Every `.bbj` under `docs/examples/` passes `bbj_check_syntax`. Fix the sample, not the check.

## Adding a new book
1. `mkdir docs/docs/<book-slug>`; add `_category_.json` (label, position, className `cat-icon cat-icon--<book-slug>`, link to overview) and `overview.mdx`.
2. Register the book in `docs/src/data/books.js` (the registry that drives the landing page and navbar), add a sidebar in `docs/sidebars.js`, and add a sidebar icon rule in `docs/src/css/_sidebar-icons.scss`.
3. `tools/moodle2docusaurus.py` exists for importing further Moodle backups; it is not maintained beyond that.

## Forbidden
- Committing with Vale findings or a failing build.
- Unverified BBj API names or syntax.
- Adding LMS-style features (progress, quizzes with grading, accounts).
- Copying webforJ-specific components (DocChip, JavadocLink, ComponentDemo) into this site.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**BASIS Courses**

One Docusaurus site that hosts BASIS training books for BBj and DWC developers in the webforJ look, served by GitHub Pages.

**Core Value:** Both books read well and correctly on one public site, and every old DWC-Course link still lands on the right page. After the migration, the Markdown is the only source of truth.

See `.planning/PROJECT.md` for scope and decisions, and `.planning/migration-seed.md` for the full spec.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

Docusaurus 3.10.2 exact pins, Node 24, Vale 3.24.0. Details: `.planning/research/STACK.md`.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
