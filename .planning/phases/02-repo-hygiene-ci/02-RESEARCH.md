# Phase 2: Repo Hygiene & CI - Research

**Researched:** 2026-10-03
**Domain:** GitHub repo bootstrap, GitHub Pages via Actions, Vale prose linting in CI, contributor docs, MIT attribution
**Confidence:** HIGH (action versions, Vale behaviour, and gh permissions were verified in this session); MEDIUM on reviewdog `filter_mode: file` behaviour and ruleset JSON (prove in the throwaway PR)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Repository creation & visibility**
- **D-01:** `BasisHub/Courses` does not exist yet (verified 2026-10-03, and the local repo has no remote). Claude creates it with `gh repo create`, adds the `origin` remote, pushes `main`, and sets the Pages source to "GitHub Actions" through the API. This is outward-facing, so the plan has an explicit **confirm checkpoint** before the create and push. If the gh token lacks org repo-create rights, the plan falls back to Stephan creating the empty repo by hand.
- **D-02:** The repo is **public from day one**. The stub site goes live at `https://basishub.github.io/Courses/` in this phase. That is accepted: nothing links to it until Phase 7/8, and "go-live" in Phase 7 means complete content plus the announcement.
- **D-03:** Push the **full existing history including `.planning/`** (GSD `commit_docs` stays on). No history rewrite and no squash.
- **D-04:** `migration-seed.md` (currently untracked at the repo root) **moves into `.planning/`** (e.g. `.planning/migration-seed.md`) and is committed there. Update every reference to it: root `CLAUDE.md`, `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `research/SUMMARY.md`, `ARCHITECTURE.md`, `FEATURES.md`. Before committing, scan it for anything that must not be public (it names `moodle.basis-europe` and backup paths, which is acceptable, but no credentials).

**CLAUDE.md**
- **D-05:** Root `CLAUDE.md` becomes the **seed §7 maintenance instructions** (same shape as webforJ's: tool calling, conventions, before committing, adding a book, forbidden actions), followed by a **slim GSD section** at the end that keeps the workflow enforcement short. The long stack research and constraint tables move out, because `.planning/research/` already holds them. Keep the GSD-managed markers/sections that GSD tools regenerate (e.g. the Developer Profile block) intact or in a form those tools still recognise.
- **D-06:** Fold these research corrections into the seed text:
  - Fonts come from `@fontsource-variable/*` and `dwc-ui.css` is a vendored snapshot. No Google Fonts and no CDN (Phase 1 D-10/D-11).
  - `import/` is never committed, and audit/mapping outputs go to `tools/data/` (replaces the seed's `import/dwc-gap-audit.md`).
  - `@docusaurus/*` is exact-pinned at one version, Node 24 (`docs/.nvmrc`), and only `npm ci` is used in CI.
  - "Before committing" names the throwing build gates plus `tools/prove-gates.sh` and the verify scripts, next to `npm run build` and Vale.
  - MDX comment syntax `{/* ... */}`, not `<!-- -->` (research SUMMARY).
- **D-07:** Audience is **Claude and human maintainers**. Write imperative rules that a BASIS colleague can also read as a checklist.

**Vale**
- **D-08:** Lint **book content only**: `docs/docs/**/*.{md,mdx}` (the `.vale.ini` glob must include `mdx`, see research). Exclude `.planning/`, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md` and `tools/`. Set the reviewdog workflow's `files`/paths to match.
- **D-09:** PRs check **whole changed files**: reviewdog `filter_mode: file`. Touching a page means the whole page must be clean. The full-tree zero-findings run stays a Phase 7 gate.
- **D-10:** **Keep** webforJ's `AIArtifacts`, `AIDisclaimer` and `AIVocab` rules in the renamed `BASIS` style (this overrides the seed's "drop unless wanted"), because Claude drafts and converts a lot of this content.
- **D-11:** **Only error-level alerts fail** the check (`fail_on_error: true`). Warnings and suggestions appear as PR review comments only. The deliberate violation used to prove success criterion 2 must therefore trigger an **error-level** rule.
- Carried forward: style folder `webforJ` is renamed `BASIS`, BBj vocabulary goes in `.github/.styles/config/vocabularies/BASIS/accept.txt`, and BBj acronyms go in the Google acronym/heading exceptions (research says to test whether the vocab reaches them).

**Merge gates & workflow**
- **D-12:** Add a branch ruleset on `main` that **requires PRs with the build and Vale checks passing, with admin bypass**, so Stephan (and GSD planning commits) can still push directly when needed. Create it through `gh api` after the first workflows have run (required checks need to exist by name), under the same confirm checkpoint as D-01 or a second one.
- **D-13:** Prove success criterion 2 with a **throwaway PR**. It adds an error-level Vale violation to a stub `.mdx`, and Claude records that the Vale check fails and the build check runs **without deploying**. Then Claude closes the PR and deletes the branch. This is outward-facing and needs a confirm step.
- **D-14:** Write `CONTRIBUTING.md` for **BASIS staff only**: an internal author guide (adding or editing chapters, conventions, local preview, before-commit checks) adapted from webforJ's file. It does not invite outside contributions.
- **D-15:** Ship the **seed's three workflow files**: `deploy.yml` (build and deploy on push to `main`, `defaults.run.working-directory: docs`, `cache-dependency-path: docs/package-lock.json`, artifact `path: docs/build`), `test-build.yml` (`npm ci && npm run build` on PRs, never deploys), `reviewdog.yml` (Vale on PRs). The duplicated build step is accepted.

### Claude's Discretion
- Exact wording and length of `CONTRIBUTING.md`, `CLAUDE.md` and `THIRD_PARTY_NOTICES.md`.
- `.editorconfig` contents (start from webforJ's).
- Whether `deploy.yml` also triggers on `workflow_dispatch`, and the `concurrency` settings for Pages.
- Pinning the vale-action to a commit SHA (research recommends it) and the Vale version input.
- Runner label: use `ubuntu-latest` unless `ubuntu-slim` is confirmed to work for BasisHub.
- How to verify success criterion 1 ("deep URL loads CSS, JS, fonts, images"): a curl/script check against the live URL is fine.
- Repo description and topics.

### Deferred Ideas (OUT OF SCOPE)
None. (Possible later topics nobody raised: Dependabot/Renovate for the pins, issue templates.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REPO-01 | Every push to `main` builds and deploys to GitHub Pages (Node 24, `npm ci` in `docs/`, current Pages actions) | Verified action versions and SHAs, `deploy.yml` skeleton, Pages-enable-before-push ordering, live-URL curl check |
| REPO-02 | Every PR runs the build without deploying and runs Vale, failing on errors | Verified vale-action inputs, working `.vale.ini` (dry run), error-level probe (`oaicite`), required-check naming pitfalls, ruleset |
| REPO-03 | `CLAUDE.md`, `CONTRIBUTING.md`, `.editorconfig`, `THIRD_PARTY_NOTICES.md` + MIT headers | Header audit list, license facts (webforJ MIT, Google Vale package MIT), doc shapes |
</phase_requirements>

## Summary

Phase 2 is mostly copy-and-adapt work plus a few outward-facing GitHub operations. The gh token (`StephanWald`, scopes `repo`, `read:org`, `gist`) is an **org admin of BasisHub** (verified via `memberships` API: role `admin`), so `gh repo create BasisHub/Courses` should work; the manual fallback in D-01 is unlikely to be needed. `BasisHub/DWC-Course` is public, so Pages on a public repo in this org is already proven to work.

I did a **dry run of the Vale setup** in the scratchpad: copied webforJ's `.github/.styles` (Google package is committed there, 53 files), renamed `webforJ` to `BASIS`, wrote an `.vale.ini` with a `[docs/docs/**/*.{md,mdx}]` section and `[formats] mdx = md`, and ran Vale 3.24.0 on the current stub pages. Result: **0 errors**, 9 warnings (all `Google.WordListCase` flagging the word "chapter"), so stubs pass the error-level gate. A probe `.mdx` containing `oaicite` fails with `BASIS.AIArtifacts` (error, exit 1). That is the right deliberate violation for D-11/D-13. A bare em dash (`result—really`) produced **no** finding at all (webforJ `EmDashes` is `occurrence`, scope `summary`, `max: 1`, warning; Google's `EmDash` did not fire either), so do **not** use an em dash as the probe.

All GitHub Actions versions in CLAUDE.md are confirmed current. `errata-ai/vale-action` branch `reviewdog` and tag `v3.0.0` resolve to the same commit, so pin that SHA.

**Primary recommendation:** Enable Pages (`build_type=workflow`) before the first push, push, watch `deploy.yml` go green, then create the ruleset with the actual job names, then run the throwaway PR using an `oaicite` probe in an `.mdx` stub.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Build and deploy | GitHub Actions (CI) | GitHub Pages (CDN/static) | Static artifact from `docs/build`; no server |
| PR build check | GitHub Actions | none | Same build as deploy, no deploy job |
| Prose lint | GitHub Actions (vale-action + reviewdog) | local `vale` CLI | CI is the gate; local run is the author loop |
| Merge gate | GitHub repo ruleset | none | Server-side enforcement with admin bypass |
| Contributor docs and license notices | Repo files | none | Static text, no runtime |

## Standard Stack

### Core (all verified against the GitHub releases/refs API on 2026-10-03)
| Item | Version | SHA (for pinning) | Notes |
|------|---------|-------------------|-------|
| `actions/checkout` | `v7.0.1` | `3d3c42e5aac5ba805825da76410c181273ba90b1` | Use `@v7`; the SHA is optional. [VERIFIED: GitHub API] |
| `actions/setup-node` | `v7.0.0` | `820762786026740c76f36085b0efc47a31fe5020` | `node-version-file: docs/.nvmrc`, `cache: npm`, `cache-dependency-path: docs/package-lock.json`. [VERIFIED: GitHub API] |
| `actions/upload-pages-artifact` | `v5.0.0` | n/a | `path: docs/build`. v4+ drops dotfiles; v5 has `include-hidden-files`. [VERIFIED: GitHub API; CLAUDE.md stack note] |
| `actions/deploy-pages` | `v5.0.1` | n/a | Needs `pages: write`, `id-token: write`, `environment: github-pages`. [VERIFIED: GitHub API] |
| `errata-ai/vale-action` | `v3.0.0` = branch `reviewdog` | `518a9136acc6e6668ce7c00d367051e0941e87ff` | `runs.using: node24`; default reviewdog 0.21.0. Pin the SHA with a `# reviewdog (v3.0.0)` comment. [VERIFIED: action.yml at that SHA] |
| Vale CLI | `3.24.0` | n/a | Pass `version: 3.24.0` to the action to stop drift. Dry run used 3.24.0 locally. [VERIFIED] |
| Runner | `ubuntu-latest` | n/a | webforJ uses `ubuntu-slim` (only seen in its workflows); not confirmed for BasisHub, so do not use. |

### vale-action inputs verified at the pinned SHA
`version`, `files`, `sync`, `reporter`, `fail_on_error`, `fail_level` (takes precedence over `fail_on_error`), `level`, `filter_mode` (`added|diff_context|file|nofilter`, default `added`), `workdir`, `config`, `filter`, `glob`, `min_alert_level`, `vale_flags`, `separator`, `reviewdog_version`, `token`. [VERIFIED: action.yml]

### Tools used for local verification
| Tool | Version | Available here? |
|------|---------|-----------------|
| `vale` | 3.24.0 | not installed; binary fetched to the scratchpad via `gh release download v3.24.0 -R errata-ai/vale -p '*macOS_arm64.tar.gz'`. Plan: `brew install vale` or the same download. |
| `actionlint` | 1.7.12 | not installed; same pattern via `rhysd/actionlint` release. Run on `.github/workflows/*.yml`. |
| `gh` | present, authed | yes |

No npm/pip packages are added in this phase, so the Package Legitimacy Gate does not apply (nothing is installed from npm or PyPI). Actions are pinned from the official `actions/*` and `errata-ai/*` owners.

## Package Legitimacy Audit

No external npm/PyPI/crates packages are installed in this phase. Not applicable. The Vale `Google` style is a vendored copy of `errata-ai/Google` (MIT, verified via the license API), not a package install.

## Architecture Patterns

### System Architecture Diagram

```
push to main ──> deploy.yml
                   build job: checkout -> setup-node(24, npm cache) -> npm ci -> npm run build -> upload-pages-artifact(docs/build)
                   deploy job (needs build, environment github-pages) -> deploy-pages -> https://basishub.github.io/Courses/

pull_request ──> test-build.yml : checkout -> setup-node -> npm ci -> npm run build   (no upload, no deploy)
             └─> reviewdog.yml  : checkout -> vale-action(.vale.ini, files docs/docs) -> reviewdog -> PR review comments
                                   error-level finding -> job fails

ruleset on main: PR required; required checks = job names of test-build + reviewdog; admin bypass
```

### Recommended file layout (new in this phase)
```
.vale.ini
.editorconfig
CONTRIBUTING.md
CLAUDE.md                      (rewritten)
THIRD_PARTY_NOTICES.md
.github/
├── .styles/{Google,BASIS,config/vocabularies/BASIS/{accept.txt,reject.txt}}
└── workflows/{deploy.yml,test-build.yml,reviewdog.yml}
.planning/migration-seed.md    (moved)
tools/verify-phase2.sh
```

### Pattern 1: `.vale.ini` (dry-run proven)
```ini
StylesPath = .github/.styles
Vocab = BASIS
MinAlertLevel = suggestion
Packages = Google

[formats]
mdx = md

[docs/docs/**/*.{md,mdx}]
BasedOnStyles = Google, BASIS
Google.Semicolons = NO
Google.Passive = NO
Google.Will = NO
Google.Parens = NO
Google.Latin = NO
BlockIgnores = "{#.*?}"
TokenIgnores = (\{/\*.*?\*/\}), <(?:span|img)[^>]*>
```
Notes: drop webforJ's Blog, i18n, cookbook sections and the `JavadocLink` ignore. The `TokenIgnores` entry for `{/* ... */}` comments comes from PITFALLS (TODO screenshot markers). Accepted vocabulary reached `Google.Acronyms` in the dry run (`BUI`, `DWC`, `ARC` produced no finding; unknown `CUI` gave a suggestion only), so the open question "does the vocab reach the acronym exceptions" is answered yes for acronyms. Heading exceptions (`Google.Headings`) were not tested; test when Phase 3/4 content with BBj headings arrives, or add a heading probe in `verify-phase2.sh`.

Vocabulary: copy `config/vocabularies/webforj/accept.txt` (96 lines) to `BASIS/`, then append `BBj`, `BBjGridExWidget`, `SysGui`, `BUI`, `ARC`, `webforJ`, `DWC` (some already present). Prune webforJ-only terms (`JSR`, `classpath`, `WillEnterEvent`, etc.) only if wanted; harmless to keep.

### Pattern 2: `reviewdog.yml`
```yaml
name: reviewdog
on:
  pull_request:
    branches: [main]          # no paths/paths-ignore, see Pitfall 2
permissions:
  contents: read
  pull-requests: write
jobs:
  vale:
    name: runner / vale
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: errata-ai/vale-action@518a9136acc6e6668ce7c00d367051e0941e87ff # reviewdog (v3.0.0)
        with:
          version: 3.24.0
          files: docs/docs
          reporter: github-pr-review
          filter_mode: file
          fail_on_error: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
`files: docs/docs` plus the `.vale.ini` section glob gives D-08 twice over. `sync`: webforJ commits the Google folder, and the action runs `vale sync` by default, which re-downloads the latest Google package over the committed copy. For deterministic CI set `sync: "false"` (input is a string) so the committed copy is what runs. [ASSUMED] that sync is safe either way; the dry run used the committed copy only.

### Pattern 3: `test-build.yml` and `deploy.yml`
```yaml
# test-build.yml
name: Test build
on:
  pull_request:
    branches: [main]
  workflow_dispatch:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
permissions:
  contents: read
jobs:
  build:
    name: Test build (no deploy)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: docs
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: docs/.nvmrc
          cache: npm
          cache-dependency-path: docs/package-lock.json
      - run: npm ci
      - run: npm run build
```
```yaml
# deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: docs
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: docs/.nvmrc
          cache: npm
          cache-dependency-path: docs/package-lock.json
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: docs/build
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```
`node-version-file: docs/.nvmrc` reads the committed `24`. Because the working-directory default applies only to `run` steps, `node-version-file` and `cache-dependency-path` need the explicit `docs/` prefix (as written). DWC-Course's deploy.yml (public, fetched) ran build on PRs inside deploy.yml; here PRs are handled by `test-build.yml` per D-15, so deploy.yml triggers only on push and `workflow_dispatch`. [VERIFIED: DWC-Course deploy.yml content]

### Pattern 4: Repo creation, Pages, ruleset (all behind confirm checkpoints)
```bash
gh repo create BasisHub/Courses --public --source=. --remote=origin \
  --description "BASIS training books for BBj and DWC developers" --disable-wiki   # no --push yet
gh api -X POST repos/BasisHub/Courses/pages -f build_type=workflow     # Pages source = GitHub Actions
git push -u origin main
# after deploy.yml, test-build.yml, reviewdog.yml have each run once:
gh api -X POST repos/BasisHub/Courses/rulesets --input ruleset.json
```
`ruleset.json` shape [CITED: docs.github.com REST "repository rules"; field names from memory, validate by the API's response]:
```json
{
  "name": "main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
  "bypass_actors": [{"actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "always"}],
  "rules": [
    {"type": "pull_request", "parameters": {"required_approving_review_count": 0, "dismiss_stale_reviews_on_push": false, "require_code_owner_review": false, "require_last_push_approval": false, "required_review_thread_resolution": false}},
    {"type": "required_status_checks", "parameters": {"strict_required_status_checks_policy": false, "required_status_checks": [{"context": "Test build (no deploy)"}, {"context": "runner / vale"}]}}
  ]
}
```
`actor_id: 5` is the built-in Admin repository role. Use `"bypass_mode": "always"` so direct pushes work (a PR-only bypass would block GSD commits). Required check `context` equals the job `name:` (or the job id if no `name`), not the workflow name. After creation, read back the ruleset and confirm the contexts match the check names shown on a real PR: `gh api repos/BasisHub/Courses/commits/<sha>/check-runs --jq '.check_runs[].name'`.

### Anti-Patterns to Avoid
- **`paths`/`paths-ignore` on required workflows:** a workflow that is skipped by path filter never reports its check, so a required check stays "Expected" and blocks the PR forever. webforJ's `reviewdog.yml` uses `paths-ignore`; do not copy that.
- **Pushing before enabling Pages:** the first `deploy-pages` run fails with a Pages-not-enabled error. Enable first (API call above) or re-run the workflow after.
- **Em dash as the Vale probe:** it does not raise an error (see Summary).
- **Linting `.planning/`, `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`:** keep the Vale section glob at `docs/docs/**`, so these never get styles even locally.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PR lint comments | custom Vale-to-GitHub script | `errata-ai/vale-action` + reviewdog | Handles annotations, review comments and exit codes |
| Pages deploy | `gh-pages` branch push script | `upload-pages-artifact` + `deploy-pages` | Official, environment-aware |
| Style rules | own prose rules | webforJ `BASIS` copy + Google package | Already tuned; only rename |
| Required-checks gate | branch protection by hand | `gh api rulesets` JSON in repo (`tools/` or documented in CONTRIBUTING) | Reproducible |
| YAML validation | eyeballing | `actionlint` | Catches input typos and expression errors |

## Runtime State Inventory

Not a rename phase in the strict sense, but `migration-seed.md` moves and references change, plus the style folder is renamed.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. No databases. | None |
| Live service config | None yet. GitHub repo, Pages and ruleset are created fresh in this phase. | Created via `gh api` |
| OS-registered state | None | None |
| Secrets/env vars | None needed. `GITHUB_TOKEN` is automatic. | None |
| Build artifacts | `docs/build`, `docs/.docusaurus` exist locally and are gitignored | None |
| References to moved file | `migration-seed.md` is named in `CLAUDE.md`, `.planning/{PROJECT,REQUIREMENTS,ROADMAP}.md`, `.planning/research/{SUMMARY,ARCHITECTURE,FEATURES}.md`, `01-CONTEXT.md`, `02-CONTEXT.md`, `02-DISCUSSION-LOG.md` (grep verified) | Code edit: `git mv`-style move plus reference update. Phase 1 and 2 CONTEXT/DISCUSSION-LOG mentions may stay as history (decide; D-04 lists only the first six, so leave 01/02 phase artifacts alone) |

Secret scan done: grepping all history (`git grep` across all revs) and `migration-seed.md` for `password|secret|token|api key|private key` found only prose about design tokens and `GITHUB_TOKEN`; no credentials. Largest tracked files are `docs/package-lock.json` (753 KB) and `dwc-ui.css` (91 KB); `.git` is 2.3 MB. [VERIFIED: local grep]

## Common Pitfalls

### Pitfall 1: Detached or odd branch state at first push
**What goes wrong:** The session snapshot reported `Current branch: HEAD`, but `git branch -a` shows `* main` and there are 56 commits.
**How to avoid:** `git rev-parse --abbrev-ref HEAD` must print `main` before `git push -u origin main`.

### Pitfall 2: Required checks that never report
Described in Anti-Patterns. Also: a ruleset created **before** the workflows ran lets you type any context but nothing will satisfy it. Create the ruleset after first runs and match names exactly.

### Pitfall 3: `filter_mode: file` with `github-pr-review`
**What goes wrong:** `github-pr-review` can only attach comments to lines inside the PR diff. With `filter_mode: file`, findings on untouched lines of a changed file are in scope for pass/fail but may not be postable as inline review comments. Behaviour of reviewdog 0.21.0 here was not verified.
**How to avoid:** Prove it in the throwaway PR: put the violation on a line that the PR does **not** touch (edit another line in the same file) and confirm the job fails and the finding is visible (comment or log). If it is only in the log, fall back to `reporter: github-pr-check` (annotations support file-level filtering). [ASSUMED: needs the PR experiment]

### Pitfall 4: `Google.WordListCase` flags "chapter"
Every book page uses "chapter"; Vale gives a warning (non-failing) per use. Do not "fix" content in Phase 2. Phase 7 is the zero-findings gate and must decide: set `Google.WordListCase = NO` in `.vale.ini`, or accept per-case. Record this in CONTRIBUTING/ROADMAP so it is not rediscovered. Consider turning it off now to keep PR comments quiet (Claude's discretion).

### Pitfall 5: Stub pages and Vale
Stub pages produced 0 errors, so the first PR touching them passes the error gate (warnings only). This is why D-09 `filter_mode: file` is safe for this phase. [VERIFIED: dry run on the real `docs/docs` tree]

### Pitfall 6: Case sensitivity and `baseUrl` on the live check
Pages serves under `/Courses/`. A deep URL such as `/Courses/docs/dwc/01-first-chapter/sample-page` must load CSS/JS/fonts from `/Courses/assets/...`. Also, GitHub Pages returns its own 404 for unknown paths unless `404.html` exists (Docusaurus emits one). Check asset URLs by parsing the deep page HTML, not by guessing.

### Pitfall 7: Public repo, `.claude/worktrees` and other local state
`.claude/` exists locally with `worktrees`. `git status` shows it as not untracked, so it is ignored or empty; confirm `git ls-files .claude` is empty before the first push.

### Pitfall 8: MIT header audit
`docs/src/css/_book-icons.scss` and `_print.scss` have no header and are original (first-line comments describe them as site-specific), `docs/static/js/*` and `link-decorator` files already carry "Copied from" headers. Files to check against the webforJ clone at `/Users/beff/_workspace/webforj-documentation` (it exists; the last HEAD there is `9f4349f5641b1bbc3af7910e0cd8e78aa54adee8`): `docs/src/css/_print.scss`, `_book-icons.scss`, `docs/src/plugins/mermaid-elk-stub.js`, `docs/src/clientModules/link-decorator.js` (a thin wrapper around the static copied script; it needs a header only if it contains copied code; the first lines show original wrapper text), `docs/src/data/*.js`, `docs/src/pages/index.js`. Method: `diff` each against the webforJ counterpart; add a header only where lines match. Put the same one-line header convention as Phase 1 (`// Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).`; use `/* */` in SCSS, `#` comment in `.ini`/`.txt` is not supported in `.yml` style files (YAML `#` comments work) so use a `#` comment in the BASIS `.yml` rules; JSON and `accept.txt` cannot carry headers, so cover them by directory in `THIRD_PARTY_NOTICES.md`).

## Code Examples

### Local Vale proof (used in `tools/verify-phase2.sh`)
```bash
# error-level probe must exit non-zero and name BASIS.AIArtifacts
printf -- '---\ntitle: Probe\n---\n\n## Probe\n\nSee oaicite here.\n' > docs/docs/dwc/99-probe.mdx
vale docs/docs/dwc/99-probe.mdx ; echo $?        # expected: 1, "BASIS.AIArtifacts", 1 error
rm docs/docs/dwc/99-probe.mdx
vale docs/docs                                   # expected: exit 0 on the stubs
```
Real output from the dry run: `7:5  error  Remove chatbot artifact 'oaicite' left over from pasted AI output.  BASIS.AIArtifacts` then `✖ 1 error, 0 warnings and 0 suggestions in 1 file.`, exit 1. [VERIFIED: local Vale 3.24.0]

### Live deep-URL check (success criterion 1)
```bash
BASE=https://basishub.github.io/Courses
URL=$BASE/docs/dwc/01-first-chapter/sample-page      # confirm actual route from docs/build/sitemap.xml
html=$(curl -fsS "$URL")
for p in $(grep -oE '(href|src)="/Courses/[^"]+"' <<<"$html" | sed -E 's/.*"(.*)"/\1/' | sort -u); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://basishub.github.io$p"); echo "$code $p"
done | grep -v '^200' && echo "FAIL" || echo "PASS"
# also check at least one .css, .js, .woff2 and one image appear in the list
```
Fonts are referenced from the CSS bundle, not the HTML: additionally fetch the main CSS and curl each `url(...)` ending in `.woff2`.

## CLAUDE.md rewrite guidance (D-05/D-06)

- Base text: seed §7 (lines 267-318 of the seed). Apply the five D-06 corrections. Specific fixes to the seed text: replace "vale docs/docs" with `vale docs/docs` plus the verify scripts; replace "Language: ... No em dashes" with the actual Vale arbiter note (em dash is only a warning, but house rule stays); add MDX comment syntax; "Adding a new book" must also mention `books.js` registry (SITE-01 is driven by `src/data/books.js`), not only `index.js`.
- GSD tools regenerate marked blocks. The current `CLAUDE.md` has sections `## Project`, `## Technology Stack`, `## Conventions`, `## Architecture`, `## Project Skills`, `## GSD Workflow Enforcement`, `## Developer Profile` (the profile one says "managed by `generate-claude-profile` -- do not edit manually"). Before rewriting, grep `~/.claude/get-shit-done` for the exact marker strings (`<!-- GSD:` style) GSD uses and keep those markers around the slim GSD block. [ASSUMED: marker format; verify by reading the current `CLAUDE.md` raw and the GSD claude-md tooling during planning]
- The `.planning/research/STACK.md` already holds the removed stack tables, so no content is lost; the old CLAUDE.md headline text is a copy of it.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `upload-pages-artifact@v3`, `deploy-pages@v4`, `checkout@v4`, Node 20 | `@v5`, `@v5`, `@v7`, Node 24 | Seed and DWC-Course are outdated; use CLAUDE.md versions |
| vale-action `@reviewdog` floating branch | SHA pin of the same commit as `v3.0.0` | Supply chain hygiene |
| Repo branch protection | Rulesets (`gh api .../rulesets`) | Bypass actors, `~DEFAULT_BRANCH` |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `sync: "false"` is safe and desirable with the committed Google folder | Pattern 2 | Low; omit the input and accept `vale sync` |
| A2 | `filter_mode: file` with `github-pr-review` fails the job and surfaces out-of-diff findings | Pitfall 3 | Medium; fallback is `github-pr-check` |
| A3 | Ruleset JSON field names and `actor_id: 5` = Admin role | Pattern 4 | Low; API returns a validation error, fix and retry |
| A4 | GSD marker format in CLAUDE.md | CLAUDE.md guidance | Medium; GSD could rewrite or duplicate blocks |
| A5 | `Google.Headings` honours BBj vocabulary | Pattern 1 | Low; test in Phase 3/4 |

## Open Questions

1. **Does `reporter: github-pr-review` surface out-of-diff findings under `filter_mode: file`?** Resolved empirically in the D-13 throwaway PR (design the PR so the violation sits on an untouched line).
2. **Phase 1 and 2 planning docs that mention `migration-seed.md`:** update or leave as history? Recommendation: update the six files D-04 lists, leave the phase CONTEXT/DISCUSSION-LOG files.
3. **Turn off `Google.WordListCase` now?** Recommendation: yes if PR comment noise matters; otherwise leave as warnings and decide in Phase 7.
4. **First push triggers the deploy before the ruleset exists** (correct; the ruleset comes later). A direct push to `main` by Stephan afterwards works via admin bypass.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `gh` CLI | repo, Pages, ruleset, PR | yes | authed as StephanWald, scopes `repo, read:org, gist`; BasisHub role `admin` | manual repo create by Stephan |
| Node/npm | local build | yes (docs/node_modules present) | `.nvmrc` 24 | none |
| `vale` | local lint | no | scratchpad binary 3.24.0 | `brew install vale` or release download |
| `actionlint` | workflow lint | no | scratchpad binary 1.7.12 | release download |
| Network to github.com | live checks | yes | n/a | n/a |

Missing with no fallback: none.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Bash verify scripts, same style as `tools/verify-phase1.sh` and `tools/prove-gates.sh`; no JS test framework in repo |
| Config file | none; add `tools/verify-phase2.sh` (Wave 0) |
| Quick run command | `bash tools/verify-phase2.sh --local` |
| Full suite command | `bash tools/verify-phase2.sh` (adds live checks via `gh` and `curl`) |

### Phase Requirements to Test Map
| Req ID / Criterion | Behavior | Test Type | Automated Command | Local or on GitHub |
|--------------------|----------|-----------|-------------------|---------------------|
| REPO-01 / SC1 | workflows are valid | static | `actionlint .github/workflows/*.yml` | local |
| REPO-01 / SC1 | no action uses old versions; Node 24; `docs/` paths | static | `grep -E 'checkout@v7|setup-node@v7|upload-pages-artifact@v5|deploy-pages@v5' ...` and `grep -c 'docs/build'` | local |
| REPO-01 / SC1 | push to main deploys; deep URL loads CSS/JS/fonts/images | live | `gh run list -w deploy.yml -L1 --json conclusion`; curl script above | **needs real push** |
| REPO-02 / SC2 | Vale config clean on stubs | local | `vale docs/docs` (exit 0) | local |
| REPO-02 / SC2 | `.mdx` is linted (error-level probe fails) | local | probe file with `oaicite`, expect exit 1 and `BASIS.AIArtifacts` | local |
| REPO-02 / SC2 | PR with violation fails Vale, build check runs, no deploy | live | `gh pr checks <n>`; `gh run list -w deploy.yml` shows no run for the PR branch | **needs real PR** (D-13) |
| REPO-02 | ruleset requires the two checks, admin bypass | live | `gh api repos/BasisHub/Courses/rulesets` and `.../rules/branches/main` | **needs repo** |
| REPO-03 / SC3 | four docs exist | static | `test -f CLAUDE.md CONTRIBUTING.md .editorconfig THIRD_PARTY_NOTICES.md` | local |
| REPO-03 / SC3 | copied files carry MIT header | static | for each file in the audit list, `head -3 \| grep -q 'webforJ-MIT'`; `.github/.styles/BASIS/*.yml` too; `THIRD_PARTY_NOTICES.md` mentions webforJ and Google Vale package | local |
| D-04 | no stale `migration-seed.md` at root; refs updated | static | `test ! -f migration-seed.md; grep -rn 'migration-seed.md' CLAUDE.md .planning/*.md .planning/research \| grep -v '.planning/migration-seed.md'` | local |
| D-03 / REPO-04 | `import/` not tracked | static | `git ls-files import \| wc -l` = 0 | local |

### Sampling Rate
- **Per task commit:** `bash tools/verify-phase2.sh --local`
- **Per wave merge:** same plus `cd docs && npm run build`
- **Phase gate:** full `verify-phase2.sh` including live checks, and the throwaway PR record, before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/verify-phase2.sh` with `--local` and full modes
- [ ] local `vale` and `actionlint` installation instructions (a line in CONTRIBUTING, scratch binaries for CI-free runs)

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | n/a (no user auth) |
| V3 Session Management | no | n/a |
| V4 Access Control | yes | Ruleset on `main`; workflow `permissions:` least privilege; Pages deploy only from the `github-pages` environment |
| V5 Input Validation | no | n/a (static content) |
| V6 Cryptography | no | n/a |
| V14 Config/Supply chain | yes | Actions pinned (vale-action by SHA, official actions by major), exact Docusaurus pins, `npm ci` |

### Known Threat Patterns
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Compromised third-party action | Tampering | SHA pin for `errata-ai/vale-action`; official `actions/*` owners |
| Over-privileged `GITHUB_TOKEN` | Elevation | Top-level `permissions: contents: read`; `pull-requests: write` only in reviewdog; `pages`/`id-token: write` only in deploy |
| Secrets or personal data in public repo | Information disclosure | Scan done (clean); `import/` gitignored and not tracked; confirm `git ls-files import` empty and no `.mbz` committed before the push |
| Public history exposure | Information disclosure | D-03 accepts `.planning/` in history; `migration-seed.md` names the internal Moodle host, accepted by D-04 |
| Direct pushes bypassing review | Tampering | Ruleset with admin-only bypass |

## Sources

### Primary (HIGH)
- GitHub REST API (via `gh api`), 2026-10-03: latest releases and tag SHAs for `actions/checkout`, `setup-node`, `upload-pages-artifact`, `deploy-pages`, `errata-ai/vale-action`, `errata-ai/vale`; `errata-ai/vale-action` `action.yml` at the pinned SHA; `BasisHub` membership role; `BasisHub/DWC-Course` visibility and `deploy.yml`; `errata-ai/Google` license (MIT).
- Local dry run: Vale 3.24.0 on copies of webforJ `.github/.styles` and the real `docs/docs` tree; `actionlint` 1.7.12 fetched.
- webforJ clone `/Users/beff/_workspace/webforj-documentation` (`.vale.ini`, `.github/workflows/reviewdog.yml`, `test-build.yml`, `.editorconfig`, `.github/.styles`, `LICENSE` "Copyright (c) 2022 webforJ").
- `/Users/beff/_workspace/BBjCourses/.planning/research/{SUMMARY,PITFALLS,STACK}.md`, `migration-seed.md` §3.1, §3.3, §7, §8.

### Secondary (MEDIUM)
- GitHub rulesets REST schema from training knowledge (see A3).

## Metadata

**Confidence breakdown:**
- Standard stack (action versions, SHAs, inputs): HIGH, queried live
- Vale config and probe: HIGH, executed locally
- Architecture and workflows: HIGH for structure, MEDIUM for reviewdog file-mode behaviour
- Ruleset JSON: MEDIUM
- Pitfalls: HIGH for the ones reproduced; others from PITFALLS.md

**Research date:** 2026-10-03
**Valid until:** about 30 days (action versions move; re-run the `gh api releases/latest` queries when executing)
