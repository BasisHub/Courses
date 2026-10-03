---
phase: 4
slug: dwc-book-relocation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-03
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No unit-test framework: shell verify scripts, Python stdlib checkers, Docusaurus build (onBroken*: throw), Vale |
| **Config file** | `.vale.ini`, `docs/docusaurus.config.js` |
| **Quick run command** | `cd docs && npm run build` and `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` |
| **Full suite command** | `bash tools/verify-phase4.sh && bash tools/verify-phase1.sh && bash tools/verify-phase2.sh --local && bash tools/verify-phase3.sh && bash tools/prove-gates.sh` |
| **Estimated runtime** | ~60 seconds (quick), ~240 seconds (full) |

---

## Sampling Rate

- **After every task commit:** `npm run build` + Vale error level on touched files + the checker script for that task
- **After every plan wave:** `bash tools/verify-phase4.sh` and `bash tools/prove-gates.sh`
- **Before `/gsd:verify-work`:** Full suite must be green, `python3 tools/sync-samples.py --check` green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

Requirement-level map from RESEARCH.md; the planner binds each row to task IDs.

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| DWC-01 | 26 pages relocated, text unchanged except allowlisted lines | script | `python3 tools/check-dwc-relocation.py` (diff vs `git archive 965da6d`) | ❌ W0 | ⬜ pending |
| DWC-01 | 27 dwc routes in new sitemap, no extras | script | `python3 tools/check-dwc-routes.py` | ❌ W0 | ⬜ pending |
| DWC-01 | Sidebar order Overview, Prerequisites, Sample Code, Resources, 01..12 | script | sidebar href order in `docs/build/docs/dwc/overview/index.html` | ❌ W0 | ⬜ pending |
| DWC-01 | All old anchors present (allowlist root `ready-to-get-started`) | script | `python3 tools/check-dwc-anchors.py` | ❌ W0 | ⬜ pending |
| DWC-01 | No `<Image`, IdealImage, `DWC-Course/`, moodle in `docs/docs` | grep | LIVE-01 grep in `tools/verify-phase4.sh` | ❌ W0 | ⬜ pending |
| DWC-01 | Vale clean at error level | lint | `tools/.bin/vale --minAlertLevel=error docs/docs/dwc` | ✅ | ⬜ pending |
| DWC-02 | 48 images colocated, kebab names, rename map complete | script | map assertions + `npm run build` | ❌ W0 | ⬜ pending |
| DWC-03 | ZIPs match `docs/examples/dwc/` | script | `python3 tools/sync-samples.py --check` | ❌ W0 | ⬜ pending |
| DWC-03 | Download links resolve | script | each `pathname:///files/dwc/*.zip` target exists in `docs/build/files/dwc/` | ❌ W0 | ⬜ pending |
| DWC-04 | Snapshot present: 28 `<loc>`, 27 content routes, 307 anchors | script | assertions in `tools/verify-phase4.sh` | ❌ W0 | ⬜ pending |
| D-20 | 44 `.bbj` syntax results recorded | manual (BBj MCP) | `tools/data/dwc-samples-syntax.md` lists 44 files | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/snapshot-dwc-site.py` + `tools/data/dwc-old-sitemap.xml`, `dwc-old-routes.json` (first commit)
- [ ] `tools/sync-samples.py` with `--check`
- [ ] `tools/check-dwc-{relocation,routes,anchors}.py` (or one checker with subcommands)
- [ ] `tools/verify-phase4.sh` following the verify-phase1/2/3 pattern
- [ ] Repoint Phase 1 stub references in `prove-gates.sh`, `verify-phase1.sh`, `verify-phase2.sh`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `bbj_check_syntax` over 44 `.bbj` files | D-20 | Needs the BBj Documentation MCP in the executing session | Run per file, record pass/fail/unsubmittable in `tools/data/dwc-samples-syntax.md` |
| Overview and chapter pages render well in light and dark | DWC-01, DWC-02 | Visual check | `npm run serve`, open `/Courses/docs/dwc/overview` and two chapters with images |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
