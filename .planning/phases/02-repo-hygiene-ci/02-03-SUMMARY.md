---
phase: 02-repo-hygiene-ci
plan: 03
subsystem: repo-hygiene
tags: [licensing, contributing, editorconfig]
requires: []
provides: [editorconfig, third-party-notices, staff-contributing-guide]
affects: []
key-files:
  created: [.editorconfig, THIRD_PARTY_NOTICES.md, LICENSES/errata-ai-Google-MIT.txt, CONTRIBUTING.md]
  modified: []
decisions:
  - "No MIT headers added: none of the 7 audit candidates share 3+ lines with webforJ"
metrics:
  completed: 2026-10-03
---

# Phase 2 Plan 03: Contributor and licence files Summary

.editorconfig (webforJ copy plus `[*.mdx]`), THIRD_PARTY_NOTICES.md with the Google Vale MIT text, and a staff-only CONTRIBUTING.md.

## MIT header audit

| Candidate | webforJ counterpart | Decision | Reason |
|---|---|---|---|
| docs/src/css/_print.scss | none (no `@media print` in webforJ docs/src) | no header | original |
| docs/src/css/_book-icons.scss | none | no header | original (`book-icon-mask` absent in webforJ) |
| docs/src/plugins/mermaid-elk-stub.js | none | no header | original |
| docs/src/clientModules/link-decorator.js | none (`window.tryDecorate` absent) | no header | original wrapper |
| docs/src/data/books.js | none | no header | original |
| docs/src/data/book-icons-css.js | none | no header | original |
| docs/src/pages/index.js | none (`topics-section` absent) | no header | original |

## Deviations from Plan

None. The `npm run build` check was skipped because no source file was edited (no node_modules in the worktree, and the audit produced comment-free changes of zero files). THIRD_PARTY_NOTICES.md records the audit outcome.

## Known Stubs

None.

## Self-Check: PASSED
