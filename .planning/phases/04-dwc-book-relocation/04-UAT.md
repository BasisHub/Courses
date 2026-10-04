---
status: complete
phase: 04-dwc-book-relocation
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md]
started: 2026-10-04T00:00:00Z
updated: 2026-10-04T00:40:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. DWC book reachable from the site
expected: The landing page and navbar offer "BBj DWC Training"; clicking it opens /Courses/docs/dwc/ with the DWC overview. No Phase 1 stub ("First steps", first-chapter) page remains.
result: pass

### 2. Flat numbered sidebar, overview first
expected: The DWC sidebar shows the overview first, then Prerequisites, Sample Code, Resources and the 12 chapters (GUI to BUI to DWC through Deployment) in the old course order. Chapter 10 reads "Embedding Third-Party Components".
result: pass
note: \"Labels carry no leading numbers; user accepted plain labels (folder prefixes set the order).\"

### 3. Overview chapter cards
expected: The overview page shows 12 chapter cards, each with a one-line description, each linking to its chapter. No card links back to the overview itself and no card is empty.
result: pass

### 4. Page text and headings
expected: Opening a few chapter pages (for example Flow Layouts and Control Validation), the title appears once (no duplicated H1), the text reads like the old DWC-Course, and code blocks are highlighted (BBj, CSS) with no bare unstyled fences.
result: pass

### 5. Images in light mode
expected: Pages with screenshots (for example Browser Developer Tools and DWC Debugging) show every image, including animated GIFs. No broken image icons.
result: pass

### 6. Images in dark mode
expected: Switching to dark mode, the same images and pages stay legible; text, code blocks and admonitions use the dark theme with no white boxes or unreadable contrast.
result: pass

### 7. Sample downloads
expected: The Sample Code page lists dwc-samples.zip plus 10 per-folder ZIPs and no "git clone" instructions. Clicking a link downloads the ZIP; it unpacks to a folder with LICENSE, README.md and the .bbj files.
result: pass

### 8. Old deep links map onto the new paths
expected: Old DWC-Course paths with the /DWC-Course/ prefix swapped for /Courses/docs/dwc/ land on the right page and heading, for example http://localhost:3000/Courses/docs/dwc/advanced-responsive/media-queries#common-breakpoints scrolls to "Common Breakpoints".
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
