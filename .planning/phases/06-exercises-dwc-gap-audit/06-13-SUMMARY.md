---
phase: 06-exercises-dwc-gap-audit
plan: 13
subsystem: dwc-content
tags: [audit, kept-material, images]
requires: [06-12]
provides: [chapter 02 kept material]
key-files:
  created:
    - docs/docs/dwc/02-browser-developer-tools/img/ (19 PNG)
  modified:
    - docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md
    - docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md
    - docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md
    - tools/data/dwc-gap-image-map.json
    - tools/data/dwc-image-map.json
requirements: [AUDIT-02]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 13: Kept material for units 2A, 2B, 2C, 2D Summary

Chapter 02 now carries all kept Moodle material: 19 screenshots with hand-written alt text, the button background symptom, the injectStyle versus setStyle explanation, the `::part(control)` versus `::part(label)` contrast, the points versus pixels font comparison, and a new "Applying a Theme to the DWC UI Kit" section.

## Commits

- `d94ce3d` Task 1 (2B, 2D, with parked moves)
- `ca22623` Task 2 (2C)

Unit 2A has no keep rows and `index.md` / `01-intro-to-css.md` are unchanged.

## Keep rows applied

| Rows | Page | Anchor |
|------|------|--------|
| 2B-22, 2B-23, 2B-26 | 02-developer-tools.md | button-background-considerations |
| 2B-29 | 02-developer-tools.md | complex-background-example |
| 2C-09, 2C-10 | 03-css-custom-properties.md | the-dwcs-css-custom-properties |
| 2C-12 | 03-css-custom-properties.md | example-1---setting-custom-values-for-css-custom-properties |
| 2C-23 | 03-css-custom-properties.md | example-2---setting-a-dwc-app-to-dark-mode |
| 2C-26 | 03-css-custom-properties.md | method-2-injectstyle-with-class |
| 2C-27 | 03-css-custom-properties.md | modifying-a-bbjcontrols-style-properties |
| 2C-34, 2C-35 | 03-css-custom-properties.md | dwc-vs-bui |
| 2C-43 to 2C-48 | 03-css-custom-properties.md | styling-shadow-dom-elements |
| 2C-51 to 2C-54 | 03-css-custom-properties.md | font-size-compatibility |
| 2D-11, 2D-12 | 04-dwc-themes.md | step-3-test |
| 2D-13, 2D-14, 2D-17, 2D-18 | 04-dwc-themes.md | the-dwc-themer (new H3 "Applying a Theme to the DWC UI Kit") |

No row was changed under step 6. Parked files 2, 3 and 4 were moved with `git mv` and mapped (verdict moved); `dev-tools-screenshot-1.png` stays parked (drop). The image map still has 66 entries.

## Results

- Gates: Vale 0 errors, one pre-existing em dash (none added), build, routes, anchors, audit (4471 checks), `kept --allow-parked --units 0P,0R,1A,1B,1C,2A,2B,2C,2D` (603 checks), sync-samples check, 44 `.bbj` files all pass.
- The only BBj fence added is 2C-45 (`::part(control)` snippet), byte-equal to `snippets/2C-45.bbj`. The audit row says "::part(label) variant", but the checked snippet text uses `control`, so the prose tells the reader to change `control` to `label`.

## Deviations from Plan

- [Rule 1] Vale flagged alt text and a sentence (lowercase dwc, css, basis, rest); reworded before the Task 2 commit. The alt texts avoid file names like `dwc-ui.css` as a result.
- The existing placeholder HTML blocks under "DWC vs BUI" were kept; the screenshots were added below them.

## Human checks

- Glance at the new figures on the three pages for placement; I viewed all 19 images and found no personal data (the "Gregory Baldrake" name in the UI Kit is sample data).
- 2D-14 link host `us.bbx.kitchen` is provisional per P5 D-27.

## Self-Check: PASSED
