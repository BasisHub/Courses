---
status: complete
phase: 03-content-components-brand
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md]
started: 2026-10-03T19:30:00Z
updated: 2026-10-03T19:25:10Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Stop any running dev server. On Node 24, run `cd docs && npm run build && npm run serve`. The build finishes without errors (the known postcss-calc warning is fine). http://localhost:3000/Courses/ loads the landing page with both books.
result: pass

### 2. Navbar brand and book links
expected: The navbar shows the BASIS logo with a white wordmark and light swoosh, the two book links, and the GitHub link, in light and dark themes. At window widths between 997 and 1260 px, both book links stay visible (CR-02). At 996 px and below, the mobile menu takes over.
result: pass

### 3. Favicon and social cover
expected: The browser tab shows the "B" favicon and it reads clearly at tab size. docs/static/img/social-cover.png (1200x630) shows the lockup, "Courses" and the tagline, and looks on-brand.
result: pass

### 4. Exercise admonitions
expected: On http://localhost:3000/Courses/docs/authoring/components, "Exercise box" shows two boxes in the DWC success palette. The first is titled "Try it yourself", the second "Change the title". Both read well in light and dark.
result: pass

### 5. BBj code highlighting
expected: In "BBj code", keywords, strings, mnemonics, labels, #fields, class names and variables have distinct colors. A suffixed variable such as `list!` or `input$` is colored as one token, not split into keyword plus suffix. Strings do not run past the end of their line.
result: pass
note: "Upstream PrismJS PR for enhanced BBj support is open and pending review (user, 2026-10-03)."

### 6. Collapsible code and copy
expected: In "Long code", the 41-line fence shows about 40 lines with a fade and a toggle. The toggle expands and collapses it. The copy button copies all 41 lines, even while the block is collapsed. The second 41-line fence (noCollapse) is fully open, with no toggle.
result: pass

### 7. YouTube facade
expected: With DevTools Network open and the page freshly loaded, there are no requests to YouTube or Google. Clicking the poster loads a youtube-nocookie.com iframe, the video plays, and keyboard focus moves to the player (Tab or Space acts on the player).
result: pass

### 8. Wide table expand dialog
expected: In "Wide table" at a narrow window, the table scrolls horizontally and an "Expand table" button appears. At a width where the table fits, the button does not appear. The dialog opens on click and closes with Esc and with a click on the backdrop.
result: pass

### 9. Tabs, cards, diagram, image zoom
expected: The tabs switch content. The card list shows the DWC and Intro BBj overview cards, and both links open the right book. The Mermaid diagram renders as a drawing, not as code. Clicking the zoom sample image enlarges it, and clicking again closes it.
result: pass

### 10. Local search
expected: Cmd+K (or the search box) opens search. Typing a word from a book overview page finds that page. The components fixture page does not appear in results or in the sidebar.
result: pass

### 11. Print preview
expected: Print preview of the fixture page shows the full 41 lines of every collapsed code block, with no fade, toggle or "Expand table" button. The video prints as one line with its title and URL.
result: pass

## Summary

total: 11
passed: 11
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
