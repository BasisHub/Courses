---
phase: 02-repo-hygiene-ci
verified: 2026-10-03T14:00:00Z
status: passed
score: 3/3 must-haves verified
overrides_applied: 0
---

# Phase 2: Repo Hygiene & CI Verification Report

**Phase Goal:** Every push to `main` deploys to GitHub Pages and every PR is build-checked and Vale-checked, with contributor docs in place
**Status:** passed
**Re-verification:** No, initial verification

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Push to `main` publishes the stub site and a deep URL loads CSS/JS/fonts/images | VERIFIED | `gh run list`: "Deploy to GitHub Pages" succeeded on main push (latest 37126300996, plus 3 earlier). Pages `build_type=workflow`. `curl` of the site root returns 200 and references `/Courses/css/dwc-ui.css` and `/Courses/js/*.js`. The deep URL `/Courses/docs/dwc/first-chapter/sample-page` returns 200. |
| 2 | A PR runs the build without deploying, and a deliberate Vale violation in `.mdx` fails the Vale check | VERIFIED | `test-build.yml` triggers on `pull_request`, runs `npm ci` and `npm run build` with `contents: read` and no deploy. Probe PR `ci-probe/vale-error` ran "Test build" (success) and "reviewdog" (failure). The failed log shows Vale with `fail_on_error: true` flagging `docs/docs/dwc/00-overview.mdx` and `docs/docs/intro-bbj/00-overview.mdx` at Severity error. |
| 3 | `CLAUDE.md`, `CONTRIBUTING.md`, `.editorconfig`, `THIRD_PARTY_NOTICES.md` exist; copied webforJ files carry MIT headers | VERIFIED | All four exist at the repo root. `LICENSES/webforJ-MIT.txt` and `LICENSES/errata-ai-Google-MIT.txt` are present. `THIRD_PARTY_NOTICES.md` references both. The `docs/src/css/*.scss` files contain MIT notices. |

**Score:** 3/3

## Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| REPO-01 | SATISFIED | `deploy.yml` triggers on push to `main`. It uses Node from `.nvmrc`, `upload-pages-artifact@v5` and `deploy-pages@v5`. Live runs succeeded. |
| REPO-02 | SATISFIED | `test-build.yml` plus `reviewdog.yml` (Vale 3.24.0, SHA-pinned action, `.vale.ini`). The probe PR proved the failure path. |
| REPO-03 | SATISFIED | The files above exist. The headers audit is covered by the 02-03 SUMMARY. |

No orphaned requirements. REQUIREMENTS.md maps only REPO-01 to REPO-03 to Phase 2, and all are claimed by the plans. The REQUIREMENTS.md checkboxes and traceability table still show "Pending", so the orchestrator should tick them.

## Probe and Harness Evidence

I could not run the shell scripts because of the permission policy. The user ran them on 2026-10-03:
- `tools/verify-phase2.sh --local`: ALL CHECKS PASSED
- `actionlint`: clean
- full `tools/verify-phase2.sh`: ALL CHECKS PASSED

These results are taken from the SUMMARYs. The gh and curl spot-checks above corroborate them independently.

## Review Warnings Bearing on the Goal (advisory, none fail a success criterion)

- WR-03: the Vale vocabulary is not enforced. This is a quality gap against REPO-02's "BBj vocabulary" wording. The Vale gate itself works.
- WR-07: no full-tree Vale run on `main`.
- WR-09: `workflow_dispatch` can be run from any branch.
- `main` is protected by repository ruleset 24417928 ("main protection", enforcement active), created from `tools/data/ruleset-main.json` in plan 02-06. `gh api repos/BasisHub/Courses/rules/branches/main` lists deletion, non_fast_forward, pull_request and required_status_checks ("Test build (no deploy)", "runner / vale"). (Orchestrator correction: the classic `branches/main/protection` endpoint returns 404 for ruleset-based protection, which is expected.)

## Anti-Patterns

None blocking. I did not run a debt-marker scan beyond the review report, which found 0 critical issues.

## Human Verification Required

None required for the success criteria. Optionally, Stephan can apply the ruleset to `main`.

## Gaps Summary

No gaps. All three success criteria are backed by live GitHub evidence.

---

_Verified: 2026-10-03_
_Verifier: Claude (gsd-verifier)_
