---
phase: 03-content-components-brand
plan: 02
subsystem: ui
tags: [prism, bbj, syntax-highlighting, docusaurus-swizzle]
requires: []
provides:
  - "extendBbj(Prism, classes) patch of Prism.languages.bbj"
  - "35-name MCP-verified BBj class list"
  - "Wrapped prism-include-languages swizzle"
  - "Node smoke test for the grammar"
affects: [03-content-components-brand, fixture page, content phases]
tech-stack:
  added: []
  patterns: ["wrap-and-patch swizzle via @theme-original", "duck-typed RegExp checks for cross-realm loading"]
key-files:
  created:
    - docs/src/prism/bbj-extend.js
    - docs/src/prism/bbj-classes.json
    - docs/src/theme/prism-include-languages.js
    - tools/test-bbj-grammar.js
    - tools/data/bbj-token-verification.md
  modified: []
key-decisions:
  - "class-name pattern has a negative lookahead for .TRUE/.FALSE so BBjAPI.TRUE stays a boolean token"
  - "label token uses lookbehind on line start so the token text excludes indentation"
requirements-completed: [COMP-03]
duration: 20min
completed: 2026-10-03
---

# Phase 3 Plan 02: BBj Prism Grammar Extension Summary

A minimal patch over prismjs 1.30's built-in bbj grammar (doubled-quote strings, mnemonics, labels, #fields, hex strings, variable suffixes, 35 verified class names, 10 added keywords, `not` removed from operators), wired through a wrapped swizzle and proven by a 41-assertion Node smoke test.

## Tasks

1. Extension, class list, swizzle, smoke test: commit 033a8d8. `node tools/test-bbj-grammar.js` exits 0 with 41 PASS and no FAIL, runs in about 0.05 s; `npm run build` passes.
2. Evidence file `tools/data/bbj-token-verification.md`: commit 2caeb73. All 35 class names, fd516a9d, "No errors found" present; no em dash.

## BBj verification

The BBj Documentation MCP was not used by this executor, as the plan directs. Only keywords, class names, the hex-string rule and the snippet from 03-RESEARCH.md "BBj MCP Verification" were used, verbatim. No unverified names. Nothing was added beyond that list; no extra tokens are needed.

## Deviations from Plan

**1. [Rule 1 - Bug] Cross-realm RegExp detection.** The test loads bbj-extend.js through node:vm, so `instanceof RegExp` is false for regexes in the sandbox and the first run threw. Fix: duck-typed `isRegExp` in bbj-extend.js and a `reOf` helper in the test. Also replaced `Prism.util.stringify` (absent in Node Prism) with a small text helper in the test.

**2. [Rule 1 - Bug] BBjAPI.TRUE/FALSE.** Placing class-name before the base boolean token would have swallowed `BBjAPI` of `BBjAPI.TRUE`. Added a negative lookahead; no new BBj facts involved.

## Issues Encountered

- Build prints a pre-existing postcss-calc CSS minimizer warning, unrelated to this plan. Local Node is v22 (docs/.nvmrc says 24); build still succeeded.
- Vale was not run: only a data file under `tools/` and code were added, nothing under `docs/docs`.

## Upstream notes for Stephan

Base prismjs 1.30 bbj grammar: `string` uses backslash escapes and treats single quotes as strings (BBj doubles quotes, single quotes are mnemonics); `operator` contains `not`, which BBj does not have; `comment` regex can match `rem` inside a string; the keyword list lacks next/to/step/write/open/close/wait/input/new/auto; `punctuation` swallows the label colon.

## Next Phase Readiness

The fixture page can show the grammar using the pre-verified snippet. Highlighting in the browser is covered by the build only; the visual check belongs to the fixture page plan.

## Self-Check: PASSED

All five created files exist; commits 033a8d8 and 2caeb73 exist.
