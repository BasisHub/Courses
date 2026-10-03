---
phase: 03-content-components-brand
plan: 03
subsystem: components
tags: [docusaurus, admonition, youtube, mdx]
requires: []
provides:
  - exercise admonition type ("Try it yourself" default title)
  - YouTube click-to-load facade (youtube-nocookie, no pre-click requests)
  - global MDX registry (YouTube, Tabs, TabItem, DocCardList)
affects: [03-04, 03-05, 03-06]
key-files:
  created:
    - docs/src/theme/Admonition/Types.js
    - docs/src/components/YouTube/index.js
    - docs/src/components/YouTube/styles.css
    - docs/src/theme/MDXComponents.js
  modified:
    - docs/src/css/_alerts.scss
    - docs/src/css/_print.scss
    - THIRD_PARTY_NOTICES.md
key-decisions:
  - "Consent wording: Plays from YouTube (youtube-nocookie.com). Loading the video sends data to Google."
  - "YouTube CSS is global (not a module) so _print.scss can target stable class names"
metrics:
  tasks: 2
  files: 7
  completed: 2026-10-03
---

# Phase 3 Plan 03: Exercise admonition, YouTube facade, MDX registry Summary

Exercise admonition (success palette, explicit title fallback), privacy-first YouTube facade with id/title validation that throws at build, and a global MDX registry for YouTube, Tabs, TabItem and DocCardList.

## Commits
- 9c1f1fe: exercise admonition type and styles
- ce52697: YouTube facade, print rules, MDXComponents, notices entry

## Verification
- `cd docs && npm run build` succeeds (Node 22 locally; one pre-existing postcss-calc warning from the vendored DWC CSS, unrelated).
- Consent sentence checked with Vale (placed temporarily under docs/docs): `0 errors, 0 warnings and 0 suggestions in 1 file.` No rewording needed.
- Grep gate for DocChip/JavadocLink/ComponentDemo/@mui under docs/src/theme and docs/src/components: no matches. No `import YouTube` in docs/docs.
- `_alerts.scss` header stays within the first 3 lines and names webforJ-MIT; the new block has no color literals.

## Deviations from Plan
None. Plan executed as written. Text color token `--dwc-color-default-text` was chosen after confirming it is already used in the CSS.

## Known Stubs
None.

## Self-Check: PASSED
