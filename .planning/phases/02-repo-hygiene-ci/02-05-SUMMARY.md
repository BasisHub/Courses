---
phase: 02-repo-hygiene-ci
plan: 05
subsystem: infra
tags: [github, pages, deploy, actions]
requires:
  - phase: 02-repo-hygiene-ci
    provides: deploy.yml, test-build.yml, reviewdog.yml, verify-phase2.sh
provides:
  - Public repo BasisHub/Courses with full history pushed
  - Pages build_type workflow, first successful deploy
  - Live site at https://basishub.github.io/Courses/
affects: [03-onward]
key-files:
  created: []
  modified: []
duration: n/a
completed: 2026-10-03
---

# Phase 2 Plan 05: Create repo, push, deploy Summary

Created the public repo `BasisHub/Courses`, enabled Pages (workflow build), pushed `main`, and the first `deploy.yml` run published the site at https://basishub.github.io/Courses/.

## Task results

- **Task 1 Preflight:** clean tree on `main`, no remote, repo did not exist; no `import/`, `.claude/`, `.mbz` or archives in any revision; secret scan hits were only the regex text quoted in plan files (no credentials); largest blob `docs/package-lock.json` (~753 KB).
- **Task 2 Approved actions (all six run):**
  1. `gh repo create BasisHub/Courses --public --source=. --remote=origin ... --disable-wiki` -> https://github.com/BasisHub/Courses
  2. Topics added: docusaurus, bbj, dwc, basis, training
  3. Workflow permissions: default read, PR approval disabled
  4. Pages enabled: `build_type=workflow`, `html_url` https://basishub.github.io/Courses/, https enforced
  5. Secret scanning and push protection: PATCH accepted; read back as `secret_scanning: enabled`, `secret_scanning_push_protection: enabled`
  6. `git push -u origin main` (pushed SHA `f566eef919892ecd361b3a06f300bca1511ef80a`)
- **Task 3 Deploy and live check:**
  - Run id **37125842428**, workflow "Deploy to GitHub Pages", conclusion **success** (Build 1m4s, Deploy 11s)
  - Run URL: https://github.com/BasisHub/Courses/actions/runs/37125842428

## Live checks (curl replication of `verify-phase2.sh --deploy`)

`bash tools/verify-phase2.sh --deploy` was denied by the permission policy (tried once). Equivalent checks run with curl:

| Check | Result |
|---|---|
| https://basishub.github.io/Courses (no slash) | 301 (redirect to slash form) |
| /docs/dwc/first-chapter/sample-page (deep URL) | 200 |
| 12 distinct `/Courses/` href/src URLs on the deep page | all 200 |
| Page links at least one CSS (2) and one JS (4) | yes |
| CSS `url()` assets (18 woff2 fonts, Inter and JetBrains Mono) | all 200 |
| /sitemap.xml | 200 |
| /llms.txt | 200 |
| References to fonts.googleapis.com or cdn.webforj.com in the page HTML | 0 |

Not replicated: the `gh`-based checks (repo PUBLIC, Pages build_type, latest run conclusion) were verified manually above through `gh api` and `gh run view`.

## Remaining for the user

Run `! bash tools/verify-phase2.sh --deploy` (and optionally `--gates`) to confirm with the official script.

## Deviations from Plan

None. The summary commit push triggers a second deploy, which is expected. Annotation noted: `ubuntu-latest` migrates to Ubuntu 26 on 2026-10-19 (informational).

## Self-Check: PASSED

Deploy succeeded; deep URL and all its assets returned 200 (script run itself left to the user).
