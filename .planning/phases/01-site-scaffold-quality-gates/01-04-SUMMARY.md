---
phase: 01-site-scaffold-quality-gates
plan: 04
subsystem: verification
tags: [acceptance, gate-proof, build, quality-gates]
requires: [01-01, 01-02, 01-03]
provides: [tools/prove-gates.sh, tools/verify-phase1.sh, Phase 1 acceptance evidence]
affects: []
key-files:
  created:
    - tools/prove-gates.sh
    - tools/verify-phase1.sh
decisions:
  - "External-host scan excludes only line 1 of css/dwc-ui.css (the D-10 provenance comment); the host scan itself stays"
metrics:
  tasks: 2
  completed: 2026-10-03
---

# Phase 1 Plan 04: Acceptance and gate proof Summary

Two scripts prove Phase 1 end to end: `tools/prove-gates.sh` shows the build throws on a broken link, anchor, Markdown link and image (each probe restored, control build clean), and `tools/verify-phase1.sh` runs the 39-check acceptance suite (lockfile install, build, landing, sidebars, self-hosted assets, sitemap, llms files, print output, pins).

## Tasks

| Task | Commit | Result |
|------|--------|--------|
| 1 Full build and gate-proof script | 1b077d9 | `tools/prove-gates.sh` |
| 2 Acceptance suite script | b3f30f2 | `tools/verify-phase1.sh` |
| Fix: narrow external-host check | f4d79f5 | false positive removed |

## Evidence

Stephan ran `bash tools/verify-phase1.sh --with-ci` on 2026-10-03 (agent execution of the scripts is denied by policy, so this is the user-run result): 38 PASS, 1 FAIL.

PASS: npm ci from lockfile; build; landing order (intro-bbj before dwc); both overviews with sidebar; two navbar book items; each sidebar lists its own chapter and omits the other's; server up on 3111; GET 200 for `/Courses/`, both overviews, the dwc sample page, `dwc-theme-switcher.js`, `link-decorator.js`, `css/dwc-ui.css`; switcher referenced once; all `<link>` hrefs local; Inter and JetBrains Mono emitted; CSS references self-hosted fonts; sitemap has root and both books; `llms.txt` has both books; `llms-full.txt` non-empty; print output has content and no chrome; import dir ignored/untracked; six `@docusaurus` pins at 3.10.2; lockfile and requirements tracked; requirements pins 3 libraries; four gate probes plus control build; prove-gates.sh.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] False positive in "no external font/CDN hosts in build"**
- **Found during:** user run of the acceptance suite
- **Issue:** The only match in `docs/build` was line 1 of `docs/build/css/dwc-ui.css`, the D-10 provenance comment (`/* Snapshot of https://cdn.webforj.com/next/dwc-ui.css fetched 2026-10-03 ... */`). The snapshot body has 0 `url(` and 0 `@import`, so no runtime request goes to that host.
- **Fix:** The scan now filters out only `^[^:]*/css/dwc-ui\.css:1:/\* Snapshot of ` (file, line 1, comment prefix). Any other host hit still fails. Checked with the plain grep pipeline against the existing build: filtered output is empty, unfiltered output is exactly that one line. Also added `wait "$SERVER_PID"` after the kill to silence the "Terminated: 15" job message.
- **Files modified:** tools/verify-phase1.sh
- **Commit:** f4d79f5
- The corrected script was not re-run (agent execution denied); the re-run is a human-check item.

## Screenshots

Headless Chrome against `npm run serve -- --port 3111 --no-open` (server stopped afterwards), 1440x900, light theme:
- `/private/tmp/claude-501/-Users-beff--workspace-BBjCourses/68b0bdc1-497a-4cfa-9b7d-9708a290d579/scratchpad/screens/landing-light.png`
- `/private/tmp/claude-501/-Users-beff--workspace-BBjCourses/68b0bdc1-497a-4cfa-9b7d-9708a290d579/scratchpad/screens/doc-light.png`

Dark captures were not obtained: the site does not follow `prefers-color-scheme` in headless Chrome, so the attempt rendered light and was discarded. Dark needs the theme toggle (manual). Observed in the light shots: dark navbar with book icons, two landing cards with icons and blurbs, sidebar with active item, breadcrumb, TOC, edit link, prev/next. The internal link "sample page" carries an external-style arrow from link-decorator (relevant to RESEARCH Q2).

## Human-check items (end of phase)

1. DWC look in light and dark mode, including the dark screenshots not captured here.
2. Theme toggle circle-reveal animation.
3. Network panel shows only same-origin requests.
4. link-decorator arrows: confirm whether internal links should show the arrow (seen on the "sample page" link, RESEARCH Q2).
5. Landing card blurbs and icons review (D-05).
6. The stub BBj line `PRINT "Hello, World!"` was NOT verified with the BBj documentation MCP (unavailable); verify when the MCP is available.
7. Re-run `bash tools/verify-phase1.sh --with-ci` once to confirm 39/39 after the f4d79f5 fix.

## Known Stubs

Overview and sample pages in both books are intentional Phase 1 placeholders (see 01-03).

## Self-Check: PASSED
