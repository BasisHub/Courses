# Phase 2: Repo Hygiene & CI - Context

**Gathered:** 2026-10-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Put the local repo on GitHub as `BasisHub/Courses` and make every push to `main` deploy the stub site to GitHub Pages. Every PR gets a build check and a Vale check. The contributor docs go in place: `CLAUDE.md`, `CONTRIBUTING.md`, `.editorconfig`, `THIRD_PARTY_NOTICES.md` and MIT headers on copied webforJ files. Requirements: REPO-01, REPO-02, REPO-03.

Not in this phase: brand assets, search, content components (Phase 3); any real book content (Phases 4/5); a full-repo Vale cleanup (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Repository creation & visibility
- **D-01:** `BasisHub/Courses` does not exist yet (verified 2026-10-03, and the local repo has no remote). Claude creates it with `gh repo create`, adds the `origin` remote, pushes `main`, and sets the Pages source to "GitHub Actions" through the API. This is outward-facing, so the plan has an explicit **confirm checkpoint** before the create and push. If the gh token lacks org repo-create rights, the plan falls back to Stephan creating the empty repo by hand.
- **D-02:** The repo is **public from day one**. The stub site goes live at `https://basishub.github.io/Courses/` in this phase. That is accepted: nothing links to it until Phase 7/8, and "go-live" in Phase 7 means complete content plus the announcement.
- **D-03:** Push the **full existing history including `.planning/`** (GSD `commit_docs` stays on). No history rewrite and no squash.
- **D-04:** `migration-seed.md` (currently untracked at the repo root) **moves into `.planning/`** (e.g. `.planning/migration-seed.md`) and is committed there. Update every reference to it: root `CLAUDE.md`, `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `research/SUMMARY.md`, `ARCHITECTURE.md`, `FEATURES.md`. Before committing, scan it for anything that must not be public (it names `moodle.basis-europe` and backup paths, which is acceptable, but no credentials).

### CLAUDE.md
- **D-05:** Root `CLAUDE.md` becomes the **seed §7 maintenance instructions** (same shape as webforJ's: tool calling, conventions, before committing, adding a book, forbidden actions), followed by a **slim GSD section** at the end that keeps the workflow enforcement short. The long stack research and constraint tables move out, because `.planning/research/` already holds them. Keep the GSD-managed markers/sections that GSD tools regenerate (e.g. the Developer Profile block) intact or in a form those tools still recognise.
- **D-06:** Fold these research corrections into the seed text:
  - Fonts come from `@fontsource-variable/*` and `dwc-ui.css` is a vendored snapshot. No Google Fonts and no CDN (Phase 1 D-10/D-11).
  - `import/` is never committed, and audit/mapping outputs go to `tools/data/` (replaces the seed's `import/dwc-gap-audit.md`).
  - `@docusaurus/*` is exact-pinned at one version, Node 24 (`docs/.nvmrc`), and only `npm ci` is used in CI.
  - "Before committing" names the throwing build gates plus `tools/prove-gates.sh` and the verify scripts, next to `npm run build` and Vale.
  - MDX comment syntax `{/* ... */}`, not `<!-- -->` (research SUMMARY).
- **D-07:** Audience is **Claude and human maintainers**. Write imperative rules that a BASIS colleague can also read as a checklist.

### Vale
- **D-08:** Lint **book content only**: `docs/docs/**/*.{md,mdx}` (the `.vale.ini` glob must include `mdx`, see research). Exclude `.planning/`, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md` and `tools/`. Set the reviewdog workflow's `files`/paths to match.
- **D-09:** PRs check **whole changed files**: reviewdog `filter_mode: file`. Touching a page means the whole page must be clean. The full-tree zero-findings run stays a Phase 7 gate.
- **D-10:** **Keep** webforJ's `AIArtifacts`, `AIDisclaimer` and `AIVocab` rules in the renamed `BASIS` style (this overrides the seed's "drop unless wanted"), because Claude drafts and converts a lot of this content.
- **D-11:** **Only error-level alerts fail** the check (`fail_on_error: true`). Warnings and suggestions appear as PR review comments only. The deliberate violation used to prove success criterion 2 must therefore trigger an **error-level** rule.
- Carried forward: style folder `webforJ` is renamed `BASIS`, BBj vocabulary goes in `.github/.styles/config/vocabularies/BASIS/accept.txt`, and BBj acronyms go in the Google acronym/heading exceptions (research says to test whether the vocab reaches them).

### Merge gates & workflow
- **D-12:** Add a branch ruleset on `main` that **requires PRs with the build and Vale checks passing, with admin bypass**, so Stephan (and GSD planning commits) can still push directly when needed. Create it through `gh api` after the first workflows have run (required checks need to exist by name), under the same confirm checkpoint as D-01 or a second one.
- **D-13:** Prove success criterion 2 with a **throwaway PR**. It adds an error-level Vale violation to a stub `.mdx`, and Claude records that the Vale check fails and the build check runs **without deploying**. Then Claude closes the PR and deletes the branch. This is outward-facing and needs a confirm step.
- **D-14:** Write `CONTRIBUTING.md` for **BASIS staff only**: an internal author guide (adding or editing chapters, conventions, local preview, before-commit checks) adapted from webforJ's file. It does not invite outside contributions.
- **D-15:** Ship the **seed's three workflow files**:
  - `.github/workflows/deploy.yml` builds and deploys on push to `main`, with `defaults.run.working-directory: docs`, `cache-dependency-path: docs/package-lock.json` and artifact `path: docs/build`.
  - `test-build.yml` runs `npm ci && npm run build` on PRs and never deploys.
  - `reviewdog.yml` runs Vale on PRs.

  This mirrors webforJ's layout. The duplicated build step is accepted.

### Claude's Discretion
- Exact wording and length of `CONTRIBUTING.md`, `CLAUDE.md` and `THIRD_PARTY_NOTICES.md`.
- `.editorconfig` contents (start from webforJ's).
- Whether `deploy.yml` also triggers on `workflow_dispatch`, and the `concurrency` settings for Pages.
- Pinning the vale-action to a commit SHA (research recommends it) and the Vale version input.
- Runner label: use `ubuntu-latest` unless `ubuntu-slim` is confirmed to work for BasisHub.
- How to verify success criterion 1 ("deep URL loads CSS, JS, fonts, images"): a curl/script check against the live URL is fine.
- Repo description and topics.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Specification
- `migration-seed.md` (moving to `.planning/migration-seed.md` per D-04) §3.1 (Vale, PR build, CLAUDE.md shape rows), §3.3 (Pages hosting, deploy.yml), §4 (repo layout incl. `.github/`), §7 (CLAUDE.md text), §8 step 2: the authoritative brief
- `.planning/REQUIREMENTS.md` REPO-01, REPO-02, REPO-03
- `.planning/ROADMAP.md` Phase 2 success criteria

### Research corrections (override the seed where they conflict)
- `.planning/research/SUMMARY.md`: Vale `mdx` glob fix, CI action versions (checkout@v7, setup-node@v7, upload-pages-artifact@v5, deploy-pages@v5, vale-action@reviewdog pinned to a SHA), `ubuntu-latest`, MDX comment syntax
- `.planning/research/STACK.md`: Infrastructure table (Node 24, Pages action versions and the v4 dotfile change)
- `.planning/research/PITFALLS.md`: baseUrl and Vale pitfalls

### Reference repositories (cloned next to this repo)
- `../webforj-documentation/.vale.ini`: base config (note `[*.{md,txt}]` skips mdx and `[formats] mdx = md`)
- `../webforj-documentation/.github/.styles/`: Google package, `webforJ` style (rename to `BASIS`), `config/vocabularies/`
- `../webforj-documentation/.github/workflows/reviewdog.yml`, `test-build.yml`: workflow bases
- `../webforj-documentation/CONTRIBUTING.md`, `CLAUDE.md`, `.editorconfig`: doc shapes to adapt
- DWC-Course `.github/workflows/deploy.yml` (in `BasisHub/DWC-Course`, public; not cloned locally): the Pages deploy pattern to start from

### Prior phase
- `.planning/phases/01-site-scaffold-quality-gates/01-CONTEXT.md`: D-10/D-11 (self-hosted assets), D-15 (editUrl)
- `LICENSES/webforJ-MIT.txt`: the MIT text that the headers and THIRD_PARTY_NOTICES reference

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `tools/prove-gates.sh`, `tools/verify-phase1.sh`: existing verification scripts. A `verify-phase2.sh` in the same style fits.
- `docs/.nvmrc` (Node 24) and `docs/package-lock.json` are already committed, so CI can use `npm ci` and the setup-node cache directly.
- `LICENSES/webforJ-MIT.txt` already exists.

### Established Patterns
- MIT header line on copied files: `/* Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt). */`. It is already present on most copied SCSS/JS files.
- Files without a header that need checking for webforJ origin: `docs/src/css/_print.scss`, `_book-icons.scss`, `docs/src/plugins/mermaid-elk-stub.js`, `docs/src/clientModules/link-decorator.js`, `docs/src/data/*.js`, `docs/src/pages/index.js`. Most are original work and need no header, but `clientModules/link-decorator.js` may derive from webforJ's `link-decorator.js`. The Vale style files copied in this phase also need attribution, and `THIRD_PARTY_NOTICES.md` should cover the Google Vale package too.

### Integration Points
- `.gitignore` already excludes `/import/`, `docs/build/` and `docs/.docusaurus/`.
- `docs/docusaurus.config.js` already has `url`, `baseUrl: '/Courses/'`, `organizationName`/`projectName` and `editUrl` for `BasisHub/Courses`.
- Stub `.mdx`/`.md` pages under `docs/docs/intro-bbj/` and `docs/docs/dwc/` must pass Vale once the check is live (otherwise the first real PR touching them fails).

</code_context>

<specifics>
## Specific Ideas

- Every outward-facing GitHub action goes through a confirm checkpoint: repo create, first push, Pages settings, branch ruleset, throwaway PR.
- The site is publicly reachable from this phase on, but stays unannounced until Phase 7.

</specifics>

<deferred>
## Deferred Ideas

None. The discussion stayed within phase scope. (Possible later topics nobody raised: Dependabot/Renovate for the pins, issue templates.)

</deferred>

---

*Phase: 02-repo-hygiene-ci*
*Context gathered: 2026-10-03*
