---
phase: 06-exercises-dwc-gap-audit
plan: 14
subsystem: dwc-content
tags: [audit, kept-material, images]
requires: [06-13]
provides: [chapter 04, 05, 06 kept material]
key-files:
  created:
    - docs/docs/dwc/05-dwc-controls/img/message-box-primary-theme.png
    - docs/docs/dwc/05-dwc-controls/img/hello-window-success-theme.png
    - docs/docs/dwc/06-flow-layouts/img/css-grid-playground-2.png
    - docs/docs/dwc/06-flow-layouts/img/css-grid-playground-3.png
    - docs/docs/dwc/06-flow-layouts/img/hello-window-grid-overlay.png
    - docs/docs/dwc/06-flow-layouts/img/css-layout-samples-responsive-mode.png
  modified:
    - docs/docs/dwc/04-upgrading-apps/01-arc-files.md
    - docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md
    - docs/docs/dwc/05-dwc-controls/index.md
    - docs/docs/dwc/06-flow-layouts/index.md
    - tools/data/dwc-image-map.json
    - tools/data/dwc-gap-image-map.json
requirements: [AUDIT-02]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 14: Kept material for units 3A, 3B1 to 3B4, 4A, 5A Summary

Chapters 04 to 06 now carry all kept Moodle material: install, ResultSet/DataRow and simple BBjGridExWidget sections with the checked BBj samples, the Themer and theme attribute text with two screenshots, and the grid, media query, template, repeat() and alignment explanations with four screenshots.

## Commits

- `c6607da` chapter 04 (3A, 3B1 to 3B4)
- `69e9df4` chapter 05 (4A)
- `a3f88ad` chapter 06 (5A)

## Keep rows applied

| Rows | Page | Anchor |
|------|------|--------|
| 3A-05 | 04/01-arc-files.md | changing-a-window-in-an-arc-file-to-use-flexible-css-based-layout (GRAVITY link) |
| 3B1-02, 3B1-07 | 04/02-upgrading-grids.md | bbjgridexwidget-plug-in, differences-between-bbjstandardgrid-and-bbjgridexwidget (intro page links) |
| 3B2-01 to 3B2-05 | 04/02-upgrading-grids.md | install-the-plug-in (new H2, H3 Inspect the Demos, Review the JavaDoc) |
| 3B3-01 to 3B3-21 | 04/02-upgrading-grids.md | working-with-resultset-and-datarow (new H2; fences 3B3-07.fixed, 3B3-11.fixed, 3B3-15, 3B3-19) |
| 3B4-01 to 3B4-06 | 04/02-upgrading-grids.md | set-up-a-simple-bbjgridexwidget (new H2; fence 3B4-02; H3 Styling and Configuring the Grid) |
| 4A-04, 4A-08, 4A-10 | 05/index.md | color-properties (Themer paragraph), setting-the-theme-attribute (new H3 with two screenshots) |
| 4A-14 | 05/index.md | example-1---setting-attributes-on-bbjtree (step 5) |
| 5A-03 | 06/index.md | media-queries |
| 5A-11 | 06/index.md | css-grid |
| 5A-13, 5A-17, 5A-19, 5A-21, 5A-22, 5A-23 | 06/index.md | placing-controls (named areas walkthrough, bold "Method 3: Row and column templates", 5A-21 bbj fence) |
| 5A-16 | 06/index.md | fractional-units-fr (link plus explanation) |
| 5A-24, 5A-28 | 06/index.md | responsive-grids-with-repeat |
| 5A-32, 5A-37, 5A-38, 5A-39 | 06/index.md | example-2---css-grid-layouts |
| 5A-40 | 06/index.md | justification-and-alignment |

## Parked images moved

| From (tools/data/dwc-unused-img/) | To |
|------|----|
| message-box.png | docs/docs/dwc/05-dwc-controls/img/message-box-primary-theme.png |
| hello-dwc-4a.png | docs/docs/dwc/05-dwc-controls/img/hello-window-success-theme.png |
| css-grid-playground-2.png | docs/docs/dwc/06-flow-layouts/img/css-grid-playground-2.png |
| css-grid-playground-3.png | docs/docs/dwc/06-flow-layouts/img/css-grid-playground-3.png |
| hello-bbj-dwc-grid.png | docs/docs/dwc/06-flow-layouts/img/hello-window-grid-overlay.png |
| css-layout-samples-6.png | docs/docs/dwc/06-flow-layouts/img/css-layout-samples-responsive-mode.png |

Image map: 66 entries, six updated to verdict moved. `css-layout-samples-5.png` and `responsive-demo.png` have no keep row and stay parked (06-15 removes the folder). I viewed all six moved images; none shows personal data.

## Results

Vale 0 errors, no em dashes, build, routes, anchors, audit (4471), cumulative `kept --allow-parked` through 5A (775 checks), exercises (430), solutions (92), sync-samples check pass; 44 `.bbj` files; image map 66.

## Deviations from Plan

- 5A "Method 2" in the audit text clashes with the page, where Method 2 is already "Named areas". The row-and-column-template material is labelled "Method 3: Row and column templates" under the same anchor. No row changed.
- 4A-04: the Themer paragraph sits under color-properties and the theme-attribute text under the new H3, so both audited anchors exist.
- No 3B and 5A table or code row changed; no BBj code beyond the checked snippets.

## Human checks

- Glance at the placement of the new H2 sections before "Migration Steps" and at the "Method 3" label.
- External links (basishub.github.io JavaDoc, BBj-Plugins) were taken from the audit rows and not fetched.

## Self-Check: PASSED
