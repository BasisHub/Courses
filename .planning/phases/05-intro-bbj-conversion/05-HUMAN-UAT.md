---
status: partial
phase: 05-intro-bbj-conversion
source: [05-VERIFICATION.md]
started: 2026-10-04T08:11:10Z
updated: 2026-10-04T08:11:10Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Read the intro-bbj book in light and dark mode
expected: `cd docs && npm run serve`, open /Courses/docs/intro-bbj/overview; sidebar order matches the Moodle outline, cards render, download links work, code is readable in both themes
result: [pending]

### 2. Images match their alt text
expected: each of the 8 images shows what its hand-written alt text describes (tools/data/intro-bbj-image-map.json)
result: [pending]

### 3. Video facades play
expected: a few of the 10 YouTube facades show their "BBx Clues N:" title and play on click
result: [pending]

### 4. dwc.style successor links land on the right pages
expected: each dwc.style hash route in tools/data/intro-bbj-link-map.json opens the intended DWC/theme-engine page
result: [pending]

### 5. Provisional Theme Editor link (D-27)
expected: https://us.bbx.kitchen/webapp/DWCThemer opens the DWC Themer; remains a review TODO in STATE.md
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
