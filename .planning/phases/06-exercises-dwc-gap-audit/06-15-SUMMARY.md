---
phase: 06-exercises-dwc-gap-audit
plan: 15
subsystem: dwc-content
tags: [audit, kept-material, images]
requires: [06-14]
provides: [chapter 07 to 11 kept material, parked image folder removed]
key-files:
  created:
    - docs/docs/dwc/10-embedding-components/img/shoelace-split-panel.png
    - docs/docs/dwc/10-embedding-components/img/shoelace-splitter-result.png
  modified:
    - docs/docs/dwc/07-icon-pools/index.md
    - docs/docs/dwc/08-control-validation/index.md
    - docs/docs/dwc/09-browser-constraints/index.md
    - docs/docs/dwc/10-embedding-components/index.md
    - docs/docs/dwc/11-advanced-responsive/01-media-queries.md
    - docs/docs/dwc/11-advanced-responsive/02-transitions.md
    - tools/data/dwc-image-map.json
    - tools/data/dwc-gap-image-map.json
  deleted:
    - tools/data/dwc-unused-img/ (3 files)
requirements: [AUDIT-02]
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 15: Kept material for units 6A to 10B and parked folder removal Summary

Chapters 07 to 11 now carry every keep row of units 6A, 7A, 8A, 8B, 9A, 9B, 9C, 10A and 10B, and `tools/data/dwc-unused-img/` is gone. `check-dwc-phase6.py kept` passes without flags (978 checks), which completes AUDIT-02.

## Commits

- `608b5a1` chapter 07 (6A)
- `ed137bb` chapter 08 (7A)
- `0bd3fed` chapter 09 (8A, 8B)
- `e086424` chapter 10 (9A, 9B, 9C; two Shoelace screenshots)
- `acf619a` chapter 11 (10A-05, 10B-07)
- `ad48a41` removal of the parked folder (last kept-series commit)

## Keep rows applied

| Rows | Page | Anchor |
|------|------|--------|
| 6A-03, 6A-05 | 07/index.md | scalable-vector-graphics (new H2) |
| 6A-08, 6A-10, 6A-11 | 07/index.md | available-icon-pools (Feather, bbj pool, fa naming, why pools; 2022 counts left out) |
| 6A-16, 6A-20, 6A-21, 6A-24, 6A-25, 6A-26 | 07/index.md | example---adding-icons-to-buttons (two H3s; load-and-run sentence dropped) |
| 6A-29, 6A-30, 6A-31, 6A-34 to 6A-38 | 07/index.md | custom-icon-pools (new H2 with two H3s; Ionicons 7.4.0 only; fence 6A-34 tagged bbj) |
| 7A-04 to 7A-06, 7A-11 to 7A-14 | 08/index.md | form-validation (new H2; 2012 article and BUI claim left out) |
| 7A-17 | 08/index.md | client-side-validation (new H2; bug history dropped) |
| 7A-22, 7A-34, 7A-35 | 08/index.md | pattern-validation (zip pattern text and fence after the existing email fence) |
| 7A-26, 7A-29 | 08/index.md | controlling-when-validation-runs (new H2, attribute table) |
| 7A-37, 7A-41 to 7A-46 | 08/index.md | javascript-validation (new H2; fences tagged bbj) |
| 7A-48, 7A-50, 7A-52, 7A-54, 7A-55, 7A-58 | 08/index.md | validation-customization (new H2) |
| 7A-61 to 7A-63 | 08/index.md | disabling-the-submit-button (new H2) |
| 8A-01 | 09/index.md | handling-client-files |
| 8A-03 | 09/index.md | file-uploads |
| 8A-06, 8A-07 | 09/index.md | file-downloads (prose and link only, no new code) |
| 8B-01, 8B-02 | 09/index.md | printing-and-print-preview (fence 8B-02 as checked; prose does not claim MODE="PDF" is required) |
| 8B-03, 8B-04, 8B-06 | 09/index.md | print-preview |
| 9A-01, 9A-02, 9A-04 (fixed), 9A-05 (fixed), 9A-06 | 10/index.md | using-the-bbjhtmlview-to-embed-third-party-components (new H2) |
| 9A-07 to 9A-15 (9A-09 fixed) | 10/index.md | embedding-a-javascript-chart-component |
| 9B-01, 9B-02, 9B-04, 9B-05 to 9B-08 | 10/index.md | receiving-events-from-javascript-in-bbj |
| 9C-01 | 10/index.md | working-with-slots |
| 9C-02 to 9C-07 (9C-06 fixed), 9C-05, 9C-09 | 10/index.md | example-for-slots-a-splitter-component-from-shoelace (new H3; two screenshots) |
| 10A-05 | 11/01-media-queries.md | overview (MDN link) |
| 10B-07 | 11/02-transitions.md | transition-properties (sentence only; "ask an AI" advice dropped) |

No new .bbj files. Snippets were inserted by script from the checked files, byte for byte.

## Images

- New: `shoelace-split-panel.png` (9C-05), `shoelace-splitter-result.png` (9C-09), both viewed, no personal data; two entries added to `dwc-gap-image-map.json`.
- Chapter 08 screenshots (D-04): no 7A row said "belongs to exercise 77". The audit rows for validation-6 to 9 and validation-demo3 said to keep them out of the exercise heading, and regex101 to move to Pattern Validation. I moved all of them into their sections (Validation Customization, Disabling the Submit Button, Testing Regular Expressions). The exercise heading and its pointer sentence are unchanged. I used the audit notes for the alt text and did not re-view those existing images. 90-exercise-email-validation.mdx was not touched.

## Fate of the 12 parked images

Nine moved in plans 06-12 to 06-14. The last three had drop rows with matching SHA-1 and were removed with the folder; their P4 entries are now `verdict: dropped`, `new: null`, `page: null`, note "Phase 6 gap audit: drop" (map still 66 entries, none parked).

| File | Row |
|------|-----|
| css-layout-samples-5.png | 5A-35 drop |
| dev-tools-screenshot-1.png | 2B-16 drop |
| responsive-demo.png | 5A-36 drop |

## Results

Vale error level 0 on docs/docs/dwc; no new em dash; build, routes, anchors, audit (4471), kept without flags (978), exercises (430), pointers (21), solutions (92), sync-samples check, relocation check (rev 542399a) pass; 44 .bbj files; map 66.

## Deviations from Plan

- 7A D-04: handled as above (rows asked to keep images out of the exercise section instead of moving them into it).
- Chapter 11 needed no image work; only two keep rows existed.
- Vale forced `bbj` as a pool name into code spans, and one quote-punctuation rewrite.

## Contradictions with existing fences (not edited)

- 09 File Downloads: existing fence uses `web!.download(...)`; the kept Moodle text names `BBjClientFilesystem::copyToClient()`. Only the prose and link were added.
- 10 Chart section: existing fence calls `web!.injectUrl(...)`; the kept (checked) Moodle sample calls `htmlview!.injectUrl(url$,1)`.
- 08: the existing `invalid-message`, `isValid()` and `setCustomValidity` fences coexist with the kept `setClientValidationFunction` and `setClientValidationMessage` material.

## Issues for Phase 7

From the orchestrator's bbj_lookup findings on existing fences (left unedited, not copied):

- 09-browser-constraints/index.md: `wnd!.addFileChooser()` with no arguments; `BBjFileChooser.ON_FILE_SELECTED` (documented: ON_FILECHOOSER_APPROVE / ON_FILECHOOSER_CANCEL); `web!.download(...)` (BBjWebManager::download not documented).
- 10-embedding-components/index.md: `web!.injectUrl(...)` on BBjWebManager (exists on BBjHtmlView); `web!.executeScript` is documented.
- 08-control-validation/index.md: `editBox!.isValid()` (documented: ClientValidation::isClientValidationValid), `setCustomValidity`, `invalid-message`.
- Pre-existing em dash in docs/docs/dwc/02-browser-developer-tools/01-intro-to-css.md line 46 (not from this plan).

## Human checks

- Glance at the new H2 order on pages 08 and 10 and at the claim that BBJasper print preview works in the DWC (taken from 8B-06, not tested).
- 8B-02 prose says the output appears in the browser without PREVIEW; the MODE="PDF" option itself is not explained.
- 6A-30 links and the Ionicons 7.4.0 URL come from the audit rows and were not fetched.

## Self-Check: PASSED
