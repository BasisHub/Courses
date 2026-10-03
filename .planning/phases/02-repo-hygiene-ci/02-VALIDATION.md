---
phase: 2
slug: repo-hygiene-ci
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-10-03
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Bash verify scripts (same style as `tools/verify-phase1.sh`, `tools/prove-gates.sh`) |
| **Config file** | none — Wave 0 adds `tools/verify-phase2.sh` |
| **Quick run command** | `bash tools/verify-phase2.sh --local` |
| **Full suite command** | `bash tools/verify-phase2.sh` (adds live `gh`/`curl` checks) |
| **Estimated runtime** | ~60 seconds local (incl. `npm run build`), live checks depend on GitHub |

---

## Sampling Rate

- **After every task commit:** Run `bash tools/verify-phase2.sh --local`
- **After every plan wave:** Run `bash tools/verify-phase2.sh --local` plus `cd docs && npm run build`
- **Before `/gsd:verify-work`:** Full suite green, throwaway PR (D-13) recorded
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Filled in by the planner/executor per task. Requirement-level map:

| Requirement / Criterion | Behavior | Test Type | Automated Command | Where | Status |
|-------------------------|----------|-----------|-------------------|-------|--------|
| REPO-01 / SC1 | Workflows valid | static | `actionlint .github/workflows/*.yml` | local | ⬜ pending |
| REPO-01 / SC1 | Pinned action versions, Node 24, `docs/` paths | static | `grep -E 'checkout@v7\|setup-node@v7\|upload-pages-artifact@v5\|deploy-pages@v5' .github/workflows/*.yml` | local | ⬜ pending |
| REPO-01 / SC1 | Push to main deploys; deep URL loads CSS/JS/fonts/images | live | `gh run list -w deploy.yml -L1 --json conclusion`; curl deep-URL asset check | GitHub | ⬜ pending |
| REPO-02 / SC2 | Vale clean on stubs | local | `vale docs/docs` exits 0 | local | ⬜ pending |
| REPO-02 / SC2 | `.mdx` linted (error probe fails) | local | probe `.mdx` with `oaicite` → exit 1, `BASIS.AIArtifacts` | local | ⬜ pending |
| REPO-02 / SC2 | PR with violation fails Vale, build runs, no deploy | live | `gh pr checks <n>`; `gh run list -w deploy.yml` no PR run | GitHub | ⬜ pending |
| REPO-02 | Ruleset requires both checks, admin bypass | live | `gh api repos/BasisHub/Courses/rulesets` | GitHub | ⬜ pending |
| REPO-03 / SC3 | Four contributor docs exist | static | `test -f CLAUDE.md -a -f CONTRIBUTING.md -a -f .editorconfig -a -f THIRD_PARTY_NOTICES.md` | local | ⬜ pending |
| REPO-03 / SC3 | Copied webforJ files carry MIT header | static | header grep over audit list; `THIRD_PARTY_NOTICES.md` names webforJ + Google Vale package | local | ⬜ pending |
| D-04 | Seed moved, refs updated | static | `test ! -f migration-seed.md`; grep for stale refs | local | ⬜ pending |
| D-03 | `import/` not tracked | static | `git ls-files import \| wc -l` = 0 | local | ⬜ pending |

### Per-task map (planner, 2026-10-03)

| Task | Plan | Wave | Requirement | Automated verify | Where |
|------|------|------|-------------|------------------|-------|
| 02-01-T1 | 01 | 1 | REPO-02 (Wave 0 harness) | `bash tools/install-lint-tools.sh`; `bash -n tools/verify-phase2.sh`; no `FAIL  [tools]`/`[hygiene]` | local |
| 02-01-T2 | 01 | 1 | REPO-02 | `tools/.bin/vale docs/docs` exit 0; no `FAIL  [vale]` (oaicite probe) | local |
| 02-02-T1 | 02 | 1 | REPO-03 (D-04) | `[seed]` checks: seed tracked under .planning, no stale refs | local |
| 02-02-T2 | 02 | 1 | REPO-03 | CLAUDE.md headings, 7 GSD marker pairs, D-06 strings | local |
| 02-03-T1 | 03 | 1 | REPO-03 | `.editorconfig` header, notices strings, `npm run build` | local |
| 02-03-T2 | 03 | 1 | REPO-03 | CONTRIBUTING.md string checks | local |
| 02-04-T1 | 04 | 2 | REPO-01 | `actionlint` on deploy/test-build; pin and path-filter greps | local |
| 02-04-T2 | 04 | 2 | REPO-02 | `actionlint .github/workflows/*.yml`; ruleset JSON parses; no `FAIL  [ci]` | local |
| 02-05-T1 | 05 | 3 | REPO-01 | preflight: branch main, clean tree, nothing in import/.claude, `--local` green | local |
| 02-05-T2 | 05 | 3 | REPO-01 | checkpoint (decision) | user |
| 02-05-T3 | 05 | 3 | REPO-01 | `bash tools/verify-phase2.sh --deploy` ALL CHECKS PASSED | GitHub |
| 02-06-T1 | 06 | 4 | REPO-02 | checkpoint (decision) | user |
| 02-06-T2 | 06 | 4 | REPO-02 | PR A check runs: vale failure, build success, no deploy run; PR B vale failure | GitHub |
| 02-06-T3 | 06 | 4 | REPO-02 | `bash tools/verify-phase2.sh` (all modes) ALL CHECKS PASSED | GitHub |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/verify-phase2.sh` — `--local` and full modes covering the map above
- [ ] Local `vale` 3.24.0 and `actionlint` available (scratch binaries or install note in CONTRIBUTING.md)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Deep URL renders correctly in a browser | REPO-01 | Visual check beyond HTTP 200s | Open a deep docs URL on `https://basishub.github.io/Courses/`, confirm styling, fonts, images |
| Throwaway Vale-violation PR | REPO-02 | Needs a real PR on GitHub | Open PR with `oaicite` in an `.mdx`, confirm Vale check fails, build runs, no deploy; close PR |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
