---
phase: 6
slug: exercises-dwc-gap-audit
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-04
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Source: 06-RESEARCH.md "Validation Architecture".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Python 3 stdlib checker `tools/check-dwc-phase6.py` (new, Wave 0), existing `tools/check-*.py`, Docusaurus build (link/anchor/image gates throw), Vale 3.24.0, wrapper `tools/verify-phase6.sh` |
| **Config file** | none (scripts); `.vale.ini`; `docs/docusaurus.config.js` |
| **Quick run command** | `python3 tools/check-dwc-phase6.py <subcommand> && tools/.bin/vale --minAlertLevel=error <touched files>` |
| **Full suite command** | `bash tools/verify-phase6.sh` (user runs with `!`), then `verify-phase4.sh --no-build`, `verify-phase5.sh --no-build`, `verify-phase1.sh`, `verify-phase3.sh`, `verify-phase2.sh --local`, `prove-gates.sh` |
| **Estimated runtime** | ~120 seconds (build dominates) |

Executors cannot run `bash tools/*.sh`; plan verifies use the underlying Python and npm commands.

---

## Sampling Rate

- **After every task commit:** `python3 tools/check-dwc-phase6.py <relevant subcommand>`, Vale errors on touched files, `node tools/check-mdx.mjs <new .mdx>`
- **After every plan wave:** `cd docs && npm run build`, then `python3 tools/check-dwc-routes.py`, `python3 tools/check-dwc-anchors.py`, `python3 tools/sync-samples.py --check`, `python3 tools/check-intro-bbj.py structure --build docs/build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~120 seconds

---

## Per-Requirement Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| EXER-02 | 11 exercise pages at D-01 paths, format, no Moodle-isms, ZIP links resolve | structural | `python3 tools/check-dwc-phase6.py exercises` | ❌ W0 | ⬜ pending |
| EXER-02 | pages compile as MDX | compile | `node tools/check-mdx.mjs <exercise files>` | ✅ | ⬜ pending |
| EXER-02 | old exercise anchors survive, stubs point to new pages | build + structural | `python3 tools/check-dwc-anchors.py && python3 tools/check-dwc-phase6.py pointers` | ✅ / ❌ W0 | ⬜ pending |
| EXER-02 | routes and sidebar order incl. new pages | build | `python3 tools/check-dwc-routes.py` (edited W0) | ✅ edit W0 | ⬜ pending |
| EXER-03 | both `exercises.mdx` indexes complete, positioned 0.4, linked from overviews | structural + build | `python3 tools/check-dwc-phase6.py indexes && python3 tools/check-intro-bbj.py structure --build docs/build` | ❌ W0 / edit W0 | ⬜ pending |
| EXER-04 | six solution blocks, fences byte-equal to examples (after rstrip) | structural | `python3 tools/check-dwc-phase6.py solutions` | ❌ W0 | ⬜ pending |
| AUDIT-01 | audit file shape, verdicts, SHA-1s, 12 parked rows, counts | structural | `python3 tools/check-dwc-phase6.py audit` | ❌ W0 | ⬜ pending |
| AUDIT-02 | keep rows land at existing targets; kept images mapped; unused-img removed; no renames; samples in sync; Vale errors 0 | structural + build + lint | `python3 tools/check-dwc-phase6.py kept && python3 tools/check-dwc-routes.py && python3 tools/sync-samples.py --check && tools/.bin/vale --minAlertLevel=error docs/docs/dwc` | ❌ W0 / ✅ | ⬜ pending |
| AUDIT-03 | 2022 list matches hashes; every listed reference marked, none else | structural | `python3 tools/check-dwc-phase6.py screenshots` | ❌ W0 | ⬜ pending |
| Regression | Phase 4/5 gates green | existing | `python3 tools/check-dwc-relocation.py --rev 542399a`, `python3 tools/check-intro-bbj.py structure` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/check-dwc-phase6.py` (subcommands: exercises, pointers, indexes, solutions, audit, kept, screenshots, commits; stdlib only)
- [ ] `tools/verify-phase6.sh` (verify-phase4/5 pattern)
- [ ] Edit `tools/check-dwc-routes.py` (allow 12 new routes, `TOP_ORDER`, `SUB_ORDER`)
- [ ] Edit `tools/check-intro-bbj.py` (`TOP_PAGES` + `exercises.mdx`: 0.4, 38 → 39 files)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Solution blocks and marked screenshots render in light and dark mode | EXER-04, AUDIT-03 | Visual | `npm run serve`, open the six solution pages and two marked pages in both themes |
| BBj snippets in exercise text and kept material pass `bbj_check_syntax` | EXER-02, AUDIT-02 | BBj MCP only reachable from the orchestrator | Orchestrator runs the check per snippet and records results |
| Gap audit verdicts are sensible | AUDIT-01 | Editorial judgment | Stephan reviews the audit commit in the PR |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
