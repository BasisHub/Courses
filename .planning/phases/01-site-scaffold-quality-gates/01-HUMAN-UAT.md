---
status: partial
phase: 01-site-scaffold-quality-gates
source: [01-VERIFICATION.md]
started: 2026-10-03T11:07:10Z
updated: 2026-10-03T11:07:10Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. DWC look in light and dark mode, animated theme toggle
expected: Served site at /Courses/ shows the webforJ/DWC look in both modes (OS setting and toggle); the toggle animates (circle reveal) and the choice persists; intro-bbj card before dwc card; book icons in navbar.
result: [pending]

### 2. Network panel shows only same-origin requests
expected: DevTools (cache disabled) on /Courses/docs/dwc/overview — every request same origin; fonts from /Courses/assets/fonts/, dwc-ui.css from /Courses/css/; no Google Fonts or cdn.webforj.com.
result: [pending]

### 3. Re-run acceptance suite after f4d79f5
expected: `bash tools/verify-phase1.sh --with-ci` ends with ALL CHECKS PASSED (39/39).
result: [pending]

### 4. Print preview in light and dark mode
expected: Printing a doc page hides navbar, sidebar and TOC; code stays readable when printed from dark mode (review WR-03).
result: [pending]

### 5. BBj stub code verified
expected: `PRINT "Hello, World!"` in both sample-page.md files passes bbj_check_syntax (BBj docs MCP was unavailable during execution).
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
