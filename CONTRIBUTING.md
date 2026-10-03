# Contributing to BASIS Courses

This guide is for BASIS staff who write and maintain the books on this site. The repository is public for reading, but it does not take outside contributions.

## Repository layout

- `docs/`: the Docusaurus site. Book content lives in `docs/docs/<book>/`, the book registry in `docs/src/data/books.js`, downloads in `docs/static/files/<book>/`.
- `tools/`: scripts. `tools/data/` holds mapping and audit data.
- `.github/`: workflows and the Vale styles.
- `.planning/`: GSD planning files. The specification is `.planning/migration-seed.md`.
- `docs/docs/authoring/components.mdx` is an unlisted component fixture, not a book. Keep it out of the registry and the sidebars, and update it when a shared component changes.
- `LICENSES/`: licence texts for copied third-party material.
- `import/` is a local, gitignored workspace.

## Local setup and preview

Use Node 24 (see `docs/.nvmrc`).

```bash
cd docs
npm ci
npm start
```

`npm start` runs the dev server. To preview the production build under `/Courses/`, run `npm run build && npm run serve`.

Never edit `package-lock.json` by hand. The `@docusaurus/*` packages stay exact-pinned.

## Writing and editing chapters

- Use kebab-case ASCII file names with two-digit position prefixes.
- Exercises start at `90-` and go up.
- Content headings start at H2.
- Every code fence has a language.
- Put images in the chapter's `img/` folder and use plain Markdown images with alt text.
- Write comments as MDX comments: `{/* ... */}`.
- Do not use em dashes.
- Check BBj samples with `bbj_check_syntax`.

These components work in any page without imports. [The components fixture](/docs/authoring/components) shows each one live.

- `:::exercise` for an exercise box.
- `<YouTube id="..." title="..." />` for a video.
- `Tabs` and `TabItem` for tabbed content.
- `DocCardList` for a list of cards.
- `ExpandableCode` for a collapsible code block.
- Mermaid fences for diagrams.

Code fences over 40 lines collapse automatically.

To add a book, create a folder under `docs/docs/<book>/`, add an entry in `docs/src/data/books.js` and add the sidebar in `docs/sidebars.js`.

## Prose linting with Vale

Run `bash tools/install-lint-tools.sh`. It installs pinned Vale 3.24.0 and actionlint 1.7.12 into `tools/.bin/`. Then lint a folder or a single file:

```bash
tools/.bin/vale docs/docs
```

Only book content under `docs/docs/` is linted. Errors fail the PR check. Warnings and suggestions appear as review comments.

Known issue: `Google.WordListCase` warns on "chapter". Leave it until Phase 7 settles the zero-findings rule.

Vocabulary lives in `.github/.styles/config/vocabularies/BASIS/accept.txt`. Add product terms there instead of rewording.

## Before committing

- The build passes (`cd docs && npm run build`).
- Vale is clean on the files you touched.
- After config changes, run `bash tools/prove-gates.sh`.
- `bash tools/verify-phase1.sh`, `bash tools/verify-phase2.sh --local` and `bash tools/verify-phase3.sh` are green.
- BBj samples pass `bbj_check_syntax`.
- Workflow edits pass `tools/.bin/actionlint`.

## Pull requests and branch rules

`main` is protected by a ruleset. It requires a pull request with the checks `Test build (no deploy)` and `runner / vale` passing. Repository admins can bypass it.

The ruleset definition is `tools/data/ruleset-main.json`. To recreate it:

```bash
gh api -X POST repos/BasisHub/Courses/rulesets --input tools/data/ruleset-main.json
```

Do not add `paths` filters to these workflows. A skipped required check blocks the PR.

Always open a pull request from a branch, never from `main`.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml` and publishes `https://basishub.github.io/Courses/`. PR builds never deploy.

## Copied code and licences

Files copied from webforJ keep the one-line MIT header. List any new third-party material in `THIRD_PARTY_NOTICES.md`.
