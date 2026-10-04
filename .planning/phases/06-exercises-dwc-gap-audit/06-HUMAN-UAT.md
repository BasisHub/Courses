---
status: partial
phase: 06-exercises-dwc-gap-audit
source: [06-VERIFICATION.md]
started: 2026-10-04T13:03:24Z
updated: 2026-10-04T13:03:24Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Collapsed "Possible solution" blocks in light and dark mode
expected: Each exercise page's solution block is collapsed by default, expands on click, and the code is readable in both the light and dark theme.
result: [pending]

### 2. Outdated-screenshot markers and the chapter 01 SVG
expected: No marker comment text leaks into the rendered pages; the SVG with hard-coded fills in chapter 01 is legible in dark mode.
result: [pending]

### 3. verify-phase2.sh --local on main
expected: After the branch is merged to main, `bash tools/verify-phase2.sh --local` passes, including "[hygiene] branch is main".
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
