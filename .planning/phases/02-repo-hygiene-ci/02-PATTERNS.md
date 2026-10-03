# Phase 2: Repo Hygiene & CI - Pattern Map

**Mapped:** 2026-10-03
**Files analyzed:** 20 new/modified (groups counted once)
**Analogs found:** 18 / 20

Local analogs are in `/Users/beff/_workspace/BBjCourses`. The webforJ clone is at `/Users/beff/_workspace/webforj-documentation` (referred to as `WJ/`). Do not copy webforJ's `ubuntu-slim`, `paths-ignore`, `actions/checkout@v3/v4`, or `[*.{md,txt}]` glob. The research overrides them.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `.github/workflows/deploy.yml` | config (CI) | event-driven (push) | RESEARCH Pattern 3 (DWC-Course deploy.yml is not local) | spec-match, no local analog |
| `.github/workflows/test-build.yml` | config (CI) | event-driven (PR) | `WJ/.github/workflows/test-build.yml` | exact (structure) |
| `.github/workflows/reviewdog.yml` | config (CI) | event-driven (PR) | `WJ/.github/workflows/reviewdog.yml` | exact |
| `.vale.ini` | config | batch (lint) | `WJ/.vale.ini` | exact |
| `.github/.styles/Google/**` | config (vendored) | batch | `WJ/.github/.styles/Google/` | exact (copy) |
| `.github/.styles/BASIS/*.yml` | config (rules) | batch | `WJ/.github/.styles/webforJ/*.yml` | exact (rename) |
| `.github/.styles/config/vocabularies/BASIS/{accept,reject}.txt` | config | batch | `WJ/.github/.styles/config/vocabularies/webforj/` | exact (rename + append) |
| `.editorconfig` | config | n/a | `WJ/.editorconfig` | exact |
| `CONTRIBUTING.md` | doc | n/a | `WJ/CONTRIBUTING.md` | role-match (rewrite for staff) |
| `CLAUDE.md` (rewrite) | doc | n/a | `.planning/migration-seed.md` section 7 + `WJ/CLAUDE.md` shape | exact (seed text) |
| `THIRD_PARTY_NOTICES.md` | doc | n/a | `LICENSES/webforJ-MIT.txt` | partial |
| `.planning/migration-seed.md` (moved) + ref updates | doc | file-I/O | none | no analog |
| `tools/verify-phase2.sh` | utility (test) | request-response / batch | `tools/verify-phase1.sh` | exact |
| `tools/` ruleset JSON (optional, `tools/data/` or doc) | config | CRUD (API) | RESEARCH Pattern 4 | spec-match |
| MIT headers: `docs/src/css/_print.scss`, `_book-icons.scss`, `plugins/mermaid-elk-stub.js`, `clientModules/link-decorator.js`, `data/*.js`, `pages/index.js` (audit only) | config (header) | n/a | `docs/src/css/_sidebar.scss` line 1; `docs/static/js/dwc-theme-switcher.js` line 1 | exact |

## Pattern Assignments

### `tools/verify-phase2.sh` (utility, batch checks)

**Analog:** `tools/verify-phase1.sh` (lines 1-40 and 120-end), `tools/prove-gates.sh`.

**Header, helpers, and flag parsing** (`verify-phase1.sh` lines 1-23). Phase 2 adds `--local` (static and vale only) versus the full mode (adds `gh` and `curl` live checks):
```bash
#!/usr/bin/env bash
# Phase 1 acceptance suite. Usage: bash tools/verify-phase1.sh [--with-ci]
# Prints one PASS/FAIL/SKIP line per check; exits non-zero if any check failed.
set -u
cd "$(dirname "$0")/.." || exit 1
FAILS=0
pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  $1"; }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}
```

**Pass/fail on a pipeline condition** (lines 118-124):
```bash
check "import/*.mbz is git-ignored" git check-ignore -q import/anything.mbz
if [ -z "$(git ls-files import)" ]; then pass "no tracked files under import/"; else fail "no tracked files under import/"; fi
```

**Probe-file with trap cleanup** (`prove-gates.sh` lines 1-27). Copy this for the Vale `oaicite` probe at `docs/docs/dwc/99-probe.mdx`:
```bash
PROBE="docs/dwc/99-gate-probe.md"
trap 'rm -f "$PROBE"' EXIT
probe() {
  local name="$1" body="$2" expected="$3" out code
  printf -- '---\ntitle: Gate probe\n---\n\n## Probe\n\n%s\n' "$body" > "$PROBE"
  out=$(npm run build 2>&1); code=$?
  rm -f "$PROBE"
  if [ "$code" -ne 0 ] && grep -qi -- "$expected" <<<"$out"; then echo "PASS  $name (exit $code)"
  else echo "FAIL  $name (exit $code, expected message: $expected)"; FAILS=$((FAILS + 1)); fi
}
```
Vale probe body is `See oaicite here.` and the expected message is `BASIS.AIArtifacts` (exit 1). Also run `vale docs/docs` expecting exit 0.

**Tail** (lines 195-198):
```bash
echo
if [ "$FAILS" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "$FAILS CHECK(S) FAILED"; fi
[ "$FAILS" -eq 0 ]
```

**Checks to include** (from the RESEARCH validation map): `actionlint .github/workflows/*.yml`, grep for `checkout@v7|setup-node@v7|upload-pages-artifact@v5|deploy-pages@v5`, the four docs exist, header grep (`head -3 | grep -q webforJ-MIT`), `test ! -f migration-seed.md`, no stale refs, `git ls-files import` empty, `git ls-files .claude` empty. The live deep-URL curl loop is in RESEARCH "Live deep-URL check". Use `/Courses/...` asset paths as phase 1 does (`$BASE/Courses/docs/dwc/first-chapter/sample-page`). Note that the built route has no numeric prefix: `/docs/dwc/first-chapter/sample-page`.

---

### `.github/workflows/test-build.yml` (CI config, event-driven)

**Analog:** `WJ/.github/workflows/test-build.yml` (whole file, 28 lines). Keep its triggers, `concurrency` block and the `name:` job-label style. Replace the JDK/Maven steps with the Node steps from RESEARCH Pattern 3.
```yaml
on:
  pull_request:
    branches:
      - main
  workflow_dispatch:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  test-build-war:
    name: Test WAR Build (No Deployment)
    runs-on: ubuntu-slim          # -> ubuntu-latest
```
Target job `name: Test build (no deploy)` must equal the ruleset required-check context. Add `permissions: contents: read`, `defaults.run.working-directory: docs`, and `node-version-file: docs/.nvmrc` / `cache-dependency-path: docs/package-lock.json` (these need the `docs/` prefix because the working-directory default applies only to `run` steps).

---

### `.github/workflows/deploy.yml` (CI config, event-driven)

**Analog:** none local. Use RESEARCH Pattern 3 verbatim (`on: push main + workflow_dispatch`; `permissions: contents read, pages write, id-token write`; `concurrency: group pages, cancel-in-progress false`; build job then deploy job with `environment: github-pages`). Reuse the `build` steps from `test-build.yml` and add `actions/upload-pages-artifact@v5` with `path: docs/build`. The deploy job uses `actions/deploy-pages@v5`. No `paths` filters.

---

### `.github/workflows/reviewdog.yml` (CI config, event-driven)

**Analog:** `WJ/.github/workflows/reviewdog.yml` (whole file):
```yaml
name: reviewdog
on:
  pull_request:
    paths-ignore:            # DROP: a skipped required check blocks the PR forever
      - 'docs/blog/**'
jobs:
  vale:
    name: runner / vale      # KEEP: this is the required-check context
    runs-on: ubuntu-slim     # -> ubuntu-latest
    steps:
      - uses: actions/checkout@v3          # -> @v7
      - uses: errata-ai/vale-action@reviewdog   # -> SHA 518a9136acc6e6668ce7c00d367051e0941e87ff # reviewdog (v3.0.0)
        with:
          fail_on_error: true
          reporter: github-pr-review
        env:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```
Add `branches: [main]`, `permissions: contents: read, pull-requests: write`, and `version: 3.24.0`, `files: docs/docs`, `filter_mode: file`, `sync: "false"` (see RESEARCH Pattern 2). If `github-pr-review` does not surface out-of-diff findings (Pitfall 3), fall back to `github-pr-check`.

---

### `.vale.ini` (config)

**Analog:** `WJ/.vale.ini`. Keep the header and the `[formats] mdx = md` block, and the Google toggle list. Drop `[**/blog/**/*.md]`, `[**/i18n/**]`, `[docs/cookbook/**/*.mdx]` and the `JavadocLink` ignore:
```ini
StylesPath = .github/.styles
Vocab = webforj                     # -> BASIS
MinAlertLevel = suggestion
Packages = Google

[*.{md,txt}]                        # -> [docs/docs/**/*.{md,mdx}]  (webforJ's glob skips mdx)
BasedOnStyles = Google, webforJ     # -> Google, BASIS
Google.Semicolons = NO
Google.Passive = NO
Google.Will = NO
Google.Parens = NO
Google.Latin = NO
BlockIgnores = "{#.*?}"
TokenIgnores = (?s)<JavadocLink[^>]*>.*?</JavadocLink>, <(?:span|img)[^>]*>   # -> (\{/\*.*?\*/\}), <(?:span|img)[^>]*>
[formats]
mdx = md
```
Final file is RESEARCH Pattern 1 (dry-run proven: 0 errors on the stubs). `Google.WordListCase` warns on "chapter". Optionally set `Google.WordListCase = NO` (RESEARCH Open Question 3).

---

### `.github/.styles/BASIS/*.yml`, `.github/.styles/Google/**`, `config/vocabularies/BASIS/*` (vendored rules)

**Analog:** `WJ/.github/.styles/webforJ/` (AIArtifacts, AIDisclaimer, AIVocab, BeDirect, Capitalization, EmDashes, Hedging, Parallelism, Puffery, Simplify, SmartQuotes, Weasel) and `WJ/.github/.styles/Google/` (53 files). Do not copy `WJ/.github/.styles/Blog`.

Steps: `cp -R` webforJ to BASIS, and `cp -R` Google. Rename the vocabulary folder `vocabularies/webforj` to `vocabularies/BASIS`. Append `BBj`, `BBjGridExWidget`, `SysGui`, `BUI`, `ARC`, `webforJ`, `DWC` to `accept.txt` if absent. Prepend a `#` provenance header to each BASIS `.yml` (YAML `#` is valid):
```yaml
# Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
extends: existence
message: "Remove chatbot artifact '%s' left over from pasted AI output."
level: error            # the only error-level rule: this is the D-11/D-13 probe target
ignorecase: true
tokens:
  - 'oaicite'
```
Do not use `EmDashes` as the probe: its level is `warning` and it fired nothing in the dry run. `.txt` vocab files and Google (vendored `errata-ai/Google`, MIT) cannot take headers. Cover them by directory in `THIRD_PARTY_NOTICES.md`.

---

### `.editorconfig` (config)

**Analog:** `WJ/.editorconfig`. Copy it unchanged (22 lines). It is plain text with `[*]` utf-8, 2-space indent, lf, and an `[*.md]` override (`insert_final_newline = false`, `trim_trailing_whitespace = false`). A `# http://editorconfig.org` first line is its only comment. Add a copied-from line, or cover it in the notices.

---

### `CLAUDE.md` (doc, rewrite)

**Analog:** `.planning/migration-seed.md` section 7 (lines 267-318), applied with the D-06 corrections. Shape sections: intro, `## Tool calling`, `## Conventions`, `## Before committing`, `## Adding a new book`, `## Forbidden`. Keep the seed's lines as the base:
```markdown
## Before committing
- cd docs && npm run build passes (broken links, anchors and images throw).
- vale docs/docs reports zero issues on the files you touched.
- Every .bbj under docs/examples/ passes bbj_check_syntax. Fix the sample, not the check.
```
Apply the corrections:
- Add `tools/prove-gates.sh` and `tools/verify-phase1.sh` / `verify-phase2.sh` to "Before committing".
- `Adding a new book` must also mention `docs/src/data/books.js`.
- MDX comments use `{/* ... */}`.
- Fonts come from `@fontsource-variable/*`, and `dwc-ui.css` is a vendored snapshot (no CDN, no Google Fonts).
- Audit outputs go to `tools/data/`, and `import/` is never committed.
- `@docusaurus/*` is exact-pinned at 3.10.2, Node 24, and CI uses only `npm ci`.

**GSD markers to preserve** (current `CLAUDE.md`). Keep these exact pairs. Remove the stack, conventions and architecture blocks only if the tools tolerate their absence; otherwise leave them as short stubs:
```
<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement
...(slim text)...
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile
> Profile not yet configured. Run `/gsd:profile-user` ...
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
```
The other pairs present are `GSD:project-start/end` (source:PROJECT.md), `GSD:stack-start/end` (source:research/STACK.md, lines 25-153), `GSD:conventions-start/end`, `GSD:architecture-start/end` and `GSD:skills-start/end`. Put the seed section 7 text above the first GSD block, outside any marker, so regeneration does not overwrite it.

---

### `CONTRIBUTING.md` (doc)

**Analog:** `WJ/CONTRIBUTING.md` (role-match). Reuse its skeleton: intro, what to write, workflow, style, PR checklist. Rewrite for BASIS staff only (D-14). Remove the "What contributions are welcome / aren't ideal" outside-contributor sections. Add sections for adding or editing chapters, local preview (`cd docs && npm ci && npm start`), local `vale` and `actionlint` install lines, and before-commit checks (same list as CLAUDE.md). Also record the `Google.WordListCase` "chapter" note and the ruleset JSON location.

---

### `THIRD_PARTY_NOTICES.md` (doc)

**Analog:** `LICENSES/webforJ-MIT.txt` (starts `MIT License` / `Copyright (c) 2022 webforJ`). The notices file should point at it and list:
- webforJ: SCSS/JS files carrying the header, `.github/.styles/BASIS`, `vocabularies/BASIS`, `.vale.ini`, `.editorconfig`, and the CONTRIBUTING shape.
- `errata-ai/Google` Vale package (MIT) under `.github/.styles/Google`.
- Directory-level coverage for files that cannot carry a header (JSON, `.txt`).

---

### MIT headers (modified files, audit)

**Analog:** the existing convention, three variants (all already present):
```scss
/* Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt). */   // docs/src/css/_sidebar.scss:1
```
```js
// Copied from webforj/webforj-documentation (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).   // docs/static/js/dwc-theme-switcher.js:1
// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).   // docs/static/js/link-decorator.js:1 (modified variant)
```
Files without a header today (first lines read):
- `docs/src/css/_print.scss` starts with `@media print {`.
- `docs/src/css/_book-icons.scss` has an original comment.
- `docs/src/plugins/mermaid-elk-stub.js` has an original comment about docusaurus #11430.
- `docs/src/clientModules/link-decorator.js` has an original wrapper comment.
- `docs/src/pages/index.js` and `docs/src/data/books.js` are original.

Method: `diff` each against the WJ counterpart and add a header only where lines match. `_print.scss` is the likeliest candidate, because its first line is not a descriptive comment. Use the `/* */` form for SCSS and `//` for JS.

---

### `.planning/migration-seed.md` (move) and reference updates

**Analog:** none. Use `git mv` semantics: the file is currently untracked, so `mv migration-seed.md .planning/` then `git add`. Update refs in root `CLAUDE.md`, `.planning/{PROJECT,REQUIREMENTS,ROADMAP}.md` and `.planning/research/{SUMMARY,ARCHITECTURE,FEATURES}.md`. Verify with the grep in RESEARCH's validation map. Leave the 01 and 02 phase CONTEXT/DISCUSSION-LOG files alone.

---

### Ruleset and Pages API calls (config, CRUD via `gh api`)

**Analog:** RESEARCH Pattern 4 (no local analog). Order: `gh repo create ... --source=. --remote=origin` (no `--push`), then `POST repos/BasisHub/Courses/pages -f build_type=workflow`, then `git push -u origin main`, wait for the three workflows, then `POST rulesets --input ruleset.json`. Contexts must equal the job names `Test build (no deploy)` and `runner / vale`. Each step goes behind a confirm checkpoint. Check `git rev-parse --abbrev-ref HEAD` equals `main` and `git ls-files .claude import` is empty first.

## Shared Patterns

### MIT attribution
**Source:** the header lines above and `LICENSES/webforJ-MIT.txt`.
**Apply to:** every copied or modified-from-webforJ file (SCSS, JS, BASIS `.yml` rules). Files that cannot carry a header go in `THIRD_PARTY_NOTICES.md` by directory.

### Job names equal required-check contexts
**Source:** `WJ/.github/workflows/reviewdog.yml` job `name: runner / vale` and the new `Test build (no deploy)`.
**Apply to:** `reviewdog.yml`, `test-build.yml`, the ruleset JSON, and `verify-phase2.sh` checks.

### Bash verification style
**Source:** `tools/verify-phase1.sh` lines 1-23 and 195-198, and `tools/prove-gates.sh` (trap-cleaned probe).
**Apply to:** `tools/verify-phase2.sh` and any helper scripts.

### Least-privilege workflow permissions and pinned actions
**Source:** RESEARCH Standard Stack and Pattern 2/3. Top-level `permissions: contents: read`. `pull-requests: write` only in `reviewdog.yml`. `pages`/`id-token: write` only in `deploy.yml`. `actions/*` pinned to a major (`@v7`, `@v5`), and `errata-ai/vale-action` pinned to a SHA with a comment.
**Apply to:** all three workflows.

### No path filters on required workflows
**Apply to:** `test-build.yml` and `reviewdog.yml`. Do not copy `paths-ignore` from webforJ.

### Docs-in-repo conventions for text
Kebab-case, `{/* */}` MDX comments, no em dashes (house rule), English, direct. Apply to `CLAUDE.md`, `CONTRIBUTING.md` and `THIRD_PARTY_NOTICES.md`.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `.github/workflows/deploy.yml` | CI config | push event | `BasisHub/DWC-Course` deploy.yml is not cloned locally and webforJ deploys via Maven. Use RESEARCH Pattern 3. |
| Ruleset JSON and `gh api` bootstrap | config | API CRUD | Nothing in the repo or webforJ. Use RESEARCH Pattern 4 and validate by the API's response (A3). |
| `.planning/migration-seed.md` move | doc | file-I/O | A plain relocation plus a grep-driven reference update. |

## Metadata

**Analog search scope:** `/Users/beff/_workspace/BBjCourses` (`tools/`, `docs/src`, `docs/static/js`, `LICENSES/`, `CLAUDE.md`, `.gitignore`, `.planning/migration-seed.md` section 7) and `/Users/beff/_workspace/webforj-documentation` (`.vale.ini`, `.editorconfig`, `.github/workflows`, `.github/.styles`, `CONTRIBUTING.md`, `CLAUDE.md` headings). No `.github/` and no `.vale.ini` exist yet in this repo.
**Files scanned:** about 40
**Pattern extraction date:** 2026-10-03
