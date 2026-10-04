---
phase: 5
slug: intro-bbj-conversion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-04
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No unit-test framework: shell verify scripts, Python checkers (in `.venv` from `tools/requirements.txt`), MDX compile, Docusaurus build (onBroken*: throw), Vale |
| **Config file** | `.vale.ini`, `docs/docusaurus.config.js`, `tools/requirements.txt` |
| **Quick run command** | `bash tools/verify-phase5.sh --no-build` and `tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj` |
| **Full suite command** | `bash tools/verify-phase5.sh && bash tools/verify-phase1.sh && bash tools/verify-phase2.sh --local && bash tools/verify-phase3.sh && bash tools/verify-phase4.sh && bash tools/prove-gates.sh` |
| **Estimated runtime** | ~30 seconds (quick), ~240 seconds (full) |

---

## Sampling Rate

- **After every task commit:** `bash tools/verify-phase5.sh --no-build` + Vale error level on touched files
- **After every plan wave:** full suite with a fresh `npm run build`
- **Before `/gsd:verify-work`:** full suite green, `python3 tools/sync-samples.py --check` green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

Requirement-level map from RESEARCH.md; the planner binds each row to task IDs.

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| CONV-01 | Converter report shows zero unresolved files, `$@...@$` tokens, links, unclassified code; exit 0 | smoke | `python3 tools/moodle2docusaurus.py ... --check` | ❌ W0 | ⬜ pending |
| CONV-01 | Every generated `.mdx` compiles | script | MDX compile check or `cd docs && npm run build` | ❌ W0 | ⬜ pending |
| CONV-01 | Converter is deterministic | script | run twice (offline second run), `diff -r` empty | ❌ W0 | ⬜ pending |
| CONV-02 | 28 chapters + overview in Moodle order | script | page count and order list in `tools/verify-phase5.sh`; built sidebar order | ❌ W0 | ⬜ pending |
| CONV-03 | No `PLUGINFILE`, `$@`, `&nbsp;`, `&lt;`, `&gt;`, `&amp;`, `<br`, moodle refs | grep | grep block in `tools/verify-phase5.sh` | ❌ W0 | ⬜ pending |
| CONV-03 | Every code fence carries a language | script | fence awk in `tools/verify-phase5.sh` | ❌ W0 | ⬜ pending |
| CONV-04 | 10 unique `<YouTube id title>` embeds, no `<iframe`/`<video` | grep | `tools/verify-phase5.sh` | ❌ W0 | ⬜ pending |
| CONV-05 | 8 images with non-empty alt, files exist, kebab names (D-26) | script | `tools/verify-phase5.sh` + build | ❌ W0 | ⬜ pending |
| CONV-06 | Four sample folders, LF endings, ZIPs in sync, LICENSE 2021 | script | `test -f` list + `python3 tools/sync-samples.py --check` | ❌ W0 | ⬜ pending |
| CONV-07 | Converter commit precedes generated-docs commit and touches no `docs/docs/intro-bbj` | git | `git log`/`git show --stat` assertion | ❌ W0 | ⬜ pending |
| EXER-01 | 5 `9N-exercise-*.mdx` pages with `:::exercise` | grep | `tools/verify-phase5.sh` | ❌ W0 | ⬜ pending |
| D-13 | Vale clean at error level | lint | `tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj` | ✅ | ⬜ pending |
| D-18/D-27 | Link map complete, Theme Editor entry flagged for review | script | JSON check of `tools/data/intro-bbj-link-map.json` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.venv` + `pip install -r tools/requirements.txt` (bs4, markdownify, lxml pinned)
- [ ] `tools/verify-phase5.sh` following the verify-phase4 pattern (`--no-build`, PASS/FAIL/SKIP)
- [ ] Update `tools/verify-phase1.sh` lines 66-67 (stub `getting-started` route) in the generated-docs commit

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `bbj_check_syntax` over every BBj snippet and `.bbj` | D-11 | Needs the BBj Documentation MCP in the executing session | Record per snippet/file in `tools/data/intro-bbj-syntax.md` |
| Alt-text quality and image names | CONV-05 | Judgment after viewing each image | Review `tools/data/intro-bbj-image-map.json` against the images |
| Dead-link successors on hash routes | D-18 | `dwc.style` hash routes not checkable by curl | Open each mapped URL in a browser |
| Pages render well in light and dark | CONV-02 | Visual check | `npm run serve`, open overview and two chapters with code and images |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
