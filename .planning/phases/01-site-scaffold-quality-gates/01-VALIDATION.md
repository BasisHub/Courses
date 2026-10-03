---
phase: 1
slug: site-scaffold-quality-gates
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-10-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (static site): shell assertions against the production build, plus `tools/prove-gates.sh` |
| **Config file** | none (Wave 0 creates `tools/verify-phase1.sh` and `tools/prove-gates.sh`) |
| **Quick run command** | `cd docs && npm run build` |
| **Full suite command** | `bash tools/verify-phase1.sh` |
| **Estimated runtime** | quick ~25 s; full ~120 s |

---

## Sampling Rate

- **After every task commit:** Run `cd docs && npm run build`
- **After every plan wave:** Run `bash tools/verify-phase1.sh` (once it exists)
- **Before `/gsd:verify-work`:** Full suite must be green, including `npm ci` rebuild
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

Filled in by the planner/executor per task. Requirement-level map (from 01-RESEARCH.md § Validation Architecture):

| Requirement / SC | Behavior | Test Type | Automated Command | File Exists | Status |
|------------------|----------|-----------|-------------------|-------------|--------|
| SC1, SITE-01/03 | Build passes; landing lists intro-bbj then dwc; overviews and sidebars exist; ≥2 navbar book items | smoke | `cd docs && npm run build` + grep assertions in `tools/verify-phase1.sh` | ❌ W0 | ⬜ pending |
| SC1 | Served under `/Courses/` (landing + both overviews 200) | smoke | `npm run serve -- --port 3111 --no-open` + `curl -fsS` | ❌ W0 | ⬜ pending |
| SC2, SITE-02 | Switcher/decorator scripts resolve under baseUrl | smoke | `curl -fsI .../Courses/js/dwc-theme-switcher.js`, `.../link-decorator.js` | ❌ W0 | ⬜ pending |
| SC3, SITE-04 | No Google Fonts / CDN hosts; fonts under `/Courses/assets/fonts/` | static scan | `! grep -rEl 'fonts\.googleapis|fonts\.gstatic|cdn\.webforj' docs/build` + link-tag scan | ❌ W0 | ⬜ pending |
| SC4, SITE-06 | Broken link, anchor, MD link, MD image each fail build; control passes | integration | `bash tools/prove-gates.sh` | ❌ W0 | ⬜ pending |
| SC5, SITE-07 | sitemap.xml and llms.txt/llms-full.txt list both books under `/Courses/` | smoke | grep on `docs/build/sitemap.xml`, `llms.txt`, `test -s llms-full.txt` | ❌ W0 | ⬜ pending |
| SC5, SITE-08 | Print hides navbar, sidebar, TOC | smoke | headless Chrome `--print-to-pdf` + `pdftotext` negative grep | ❌ W0 | ⬜ pending |
| SC6, REPO-04 | `import/` ignored and never tracked | unit | `git check-ignore -q import/x.mbz && ! git ls-files import | grep .` | ✅ | ⬜ pending |
| SC6, REPO-05 | Exact `@docusaurus/*` 3.10.2 pins; lockfile + `tools/requirements.txt` tracked | unit | node pin check + `git ls-files --error-unmatch docs/package-lock.json tools/requirements.txt` | ❌ W0 | ⬜ pending |
| Reproducibility | Lockfile installs cleanly | smoke | `cd docs && rm -rf node_modules && npm ci && npm run build` | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tools/prove-gates.sh` — injects each of the four defects into a temp copy, expects distinct failure messages, plus a passing control build
- [ ] `tools/verify-phase1.sh` — bash (not zsh); wraps build, serve (trap-cleaned), SC1/SC2/SC3/SC5/SC6 assertions, print check, and `prove-gates.sh`
- [ ] Scaffold itself (`docs/` tree, lockfile, `tools/requirements.txt`) — nothing exists yet

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DWC look in light and dark mode | SITE-02 / SC2 | Visual judgement | Headless screenshots (light + `--force-dark-mode`) of `/Courses/` and a doc page; compare with docs.webforj.com |
| Animated theme-switch circle reveal | SITE-02 / SC2 | Animation | Click the toggle once in a real browser on `npm run serve` |
| Network panel shows only same-origin requests | SITE-04 / SC3 | Browser-level observation | DevTools Network on `/Courses/docs/dwc/overview` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
