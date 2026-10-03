---
phase: 03-content-components-brand
plan: 04
subsystem: components
tags: [docusaurus, code-block, table, mdx]
requires: ["03-03"]
provides:
  - ExpandableCode and CodeBlock auto-collapse for fences over 40 lines
  - TableWrapper (scroll container plus native dialog) for every Markdown table
affects: [03-06]
key-files:
  created:
    - docs/src/components/DocsTools/ExpandableCode/index.js
    - docs/src/components/DocsTools/ExpandableCode/styles.css
    - docs/src/theme/CodeBlock/index.js
    - docs/src/components/DocsTools/TableWrapper/index.js
    - docs/src/components/DocsTools/TableWrapper/styles.css
  modified:
    - docs/src/theme/MDXComponents.js
    - THIRD_PARTY_NOTICES.md
key-decisions:
  - "Hybrid collapse: every fence over 40 lines collapses automatically; ExpandableCode stays for explicit use"
  - "Full code is rendered and clipped with CSS so the copy button copies everything"
requirements-completed: [COMP-04, COMP-05]
metrics:
  tasks: 2
  files: 7
  completed: 2026-10-03
---

# Phase 3 Plan 04: ExpandableCode and TableWrapper Summary

MUI-free collapsible code (CSS-clipped, copy gets all lines) with a CodeBlock wrapper that collapses fences over 40 lines, plus a TableWrapper with horizontal scroll and a native dialog, both registered globally.

## Commits
- Task 1: ExpandableCode, CollapsibleShell, CodeBlock wrapper
- Task 2: TableWrapper, MDXComponents registry, notices

## Verification
- `cd docs && npm run build` succeeds (Node 22; the postcss-calc warning from the vendored DWC CSS is pre-existing).
- No `@mui` in docs/src; no color literals in the new CSS.
- Not run: Vale (no Markdown touched). Visual 40/41-line boundary, em-based max-height and dialog behavior are deferred to the 03-06 browser pass as planned.

## Deviations from Plan
None.

## Known Stubs
None.

## Self-Check: PASSED
