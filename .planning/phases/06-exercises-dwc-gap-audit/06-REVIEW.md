---
phase: 06-exercises-dwc-gap-audit
reviewed: 2026-10-04T12:30:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md
  - docs/docs/dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx
  - docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md
  - docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md
  - docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx
  - docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx
  - docs/docs/dwc/06-flow-layouts/index.md
  - docs/docs/dwc/07-icon-pools/index.md
  - docs/docs/dwc/08-control-validation/index.md
  - docs/docs/dwc/09-browser-constraints/index.md
  - docs/docs/dwc/10-embedding-components/index.md
  - docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS.bbj
  - docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS_NoEventFromJS.bbj
  - tools/check-dwc-phase6.py
  - tools/data/dwc-exercise-link-map.json
  - tools/data/dwc-samples-syntax.md
findings:
  critical: 0
  warning: 1
  info: 5
  total: 6
status: issues_found
---

# Phase 6: Code Review Report (re-review after gap closure)

**Reviewed:** 2026-10-04
**Depth:** standard (diff a8feeac..HEAD, whole files for context)
**Status:** issues_found

## Summary

The gap-closure commits fix CR-01 and all of WR-01..WR-13. No regressions found. The ZIP `docs/static/files/dwc/09_EmbeddingOtherComponents.zip` contains the corrected Chart.js handler (line 40 and 136 now clear `ON_SCRIPT_LOADED`; the remaining `ON_PAGE_LOADED` clears at lines 31 and 127 are in `handlePageLoaded` and correct). The `{#example-chartsjs-integration}` explicit anchor is backed by `tools/data/dwc-old-routes.json:818`, so it is intentional. The new checker code has one real false-negative class and a few smaller gaps. IN-01..IN-09 from the prior review were out of the gap scope; their status is listed below.

## Prior findings status

| ID | Status | Evidence |
|----|--------|----------|
| CR-01 (`css!` variable) | resolved | Grid and Flexbox goals now say `json!` (grid mdx lines 14-20, flexbox 14-18); starters use `json!` (Exercise-ConvertToCssLayout.bbj lines 10-17, Flexbox line 39). Checker now enforces it (see NEW below). |
| WR-01 (Flexbox goal 4) | resolved | Text describes chaining; fence indented 3 spaces inside item 4; snippet is a single chained line matching the solution. |
| WR-02 (`$00100000$` flag) | resolved | Exercise 01 line 18 now says add `$00100083$` after the window title and explains the added flow-layout bit; matches DWC1.bbj line 11. |
| WR-03 (Button link) | resolved | URL is `https://dwc.style/docs/#/dwc/BBjButton` in page and in link map with updated note. |
| WR-04 (`inline-grid` vs `grid`) | resolved | Snippet and prose use `grid`; DWC1.bbj line 13 confirms. |
| WR-05 (`display: grid;` line) | resolved | Added as first CSS line in the repeat() fence. |
| WR-06 (`justify-self`) | resolved | Rewritten as per-item override. |
| WR-07 (`demos` folder) | resolved | Now `demo`. |
| WR-08 (icon pools sample) | resolved | Now names `DWC2.bbj`, Tabler icon, comments for the others. |
| WR-09 (`ON_PAGE_LOADED` clear) | resolved | Fixed in page, both samples, and the ZIP (verified by unzip). `dwc-samples-syntax.md` records a re-check. |
| WR-10 (duplicate validation screenshots) | resolved | Old generic references removed; each of validation-1/4/5/demo2 now appears once, with the descriptive alt text (lines 48, 100, 210, 239). |
| WR-11 (`getClientFile()` argument) | resolved | Now `getClientFile(clientFileName$)`. |
| WR-12 (kept commits never checked) | resolved | `"kept"` added to the existence loop at check-dwc-phase6.py:614. |
| WR-13 (`GUISample.bbj` invisible to D-08) | resolved | Starter set now built from `SOLUTIONS` starter names plus `Exercise-*.bbj`; a "starter not found" check guards renames. |
| IN-01..IN-05 (checker robustness) | still-open | Not touched (per-page URL scope, exit code docstring, nested fences, "new sub-page" exemption, JSON/`tot[0]` robustness). |
| IN-06 (JS placeholder comment) | resolved | Now `/* further JavaScript code */`. |
| IN-07 (icon comment/tag) | partly resolved | Comment now says "Ionicons"; `<dwc-icon>` vs `<bbj-icon>` mismatch with the sample remains. |
| IN-08 (duplicate prose) | partly resolved | Duplicate tip in 03-gui-to-bui-to-dwc.md and duplicate printer sentence in 09-browser-constraints removed; the "use the external CSS file in production" duplication is gone with the tip. |
| IN-09 (wording) | resolved | "In BUI, on the left", "flow control", "Plug-In Manager", "Chart.js" all fixed. |

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: D-08 (c)/(d) checks only cover 6 of 11 exercise pages and trust any backticked name to be present anywhere in the starter

**File:** `tools/check-dwc-phase6.py:410-424`
**Issue:** The new starter-consistency block is guarded by `if rel in SOLUTIONS`, so the five exercises without a solution entry (theming, bbjgridexwidget, embed-component, media-queries, button-transition) get no check that named variables or snippets agree with their starters. That is exactly the class of defect (CR-01) the check was added for. Also, the variable test is a plain substring search over the whole starter text including comments and strings, so a variable that appears only in a comment still passes. Only identifiers ending in `!` or `$` are examined; a name like `json` or a numeric variable is never checked, and a prose reference outside backticks is invisible.
**Fix:** Extend the starter mapping to all 11 pages (a `STARTERS` dict separate from `SOLUTIONS`) and run the (c) and (d) checks for each. Optionally strip `rem` lines from the starter before the variable search.

## Info

### IN-10: `(d)` snippet check iterates a body that is always a list

**File:** `tools/check-dwc-phase6.py:418`
**Issue:** `b["body"].split("\n") if isinstance(b["body"], str) else b["body"]` is dead defensiveness; `fence_blocks` always returns a list (line 234 docstring). Precedence also makes the for-expression read ambiguously.
**Fix:** `for line in b["body"]:`.

### IN-11: Snippet check only covers `bbj` fences, and an indented fence line is compared after `strip()` only

**File:** `tools/check-dwc-phase6.py:414-421`
**Issue:** `outside` holds only `lang == "bbj"` fences. A css, json or html fence outside details that contradicts the starter is not compared. Exact-line matching also means any harmless reformat of the snippet (for example `"label","Name:"` versus `"label", "Name:"`) fails, which is a false-positive risk when someone edits prose later.
**Fix:** Either document that only bbj fences are compared, or normalize whitespace around commas before comparing.

### IN-12: Starter-name presence is satisfied by any file of that name anywhere under `docs/examples/dwc`

**File:** `tools/check-dwc-phase6.py:324-340`
**Issue:** `starters` and `starter_text` are keyed by bare file name via `rglob`. If two directories ever hold a file with the same name, the later one silently overwrites the earlier one. Currently unique, so latent only.
**Fix:** Key by relative path, or assert uniqueness.

### IN-13: Mixed `<dwc-icon>` and `<bbj-icon>` tags remain on the icon pools page

**File:** `docs/docs/dwc/07-icon-pools/index.md:114-140, 175-176`
**Issue:** Carry-over from prior IN-07: snippets use `<dwc-icon>` while the prose-quoted `DownloadButton.bbj` and the exercise solution use `<bbj-icon>`. Readers copying between pages get different tags.
**Fix:** Pick the tag used by the samples and use it everywhere on the page.

### IN-14: Prior checker Info items IN-01 to IN-05 remain open

**File:** `tools/check-dwc-phase6.py` (lines as listed in the prior report)
**Issue:** Unchanged and still valid: URL allow-list ignores per-page `pages` scope, `all` mode exit code contradicts the docstring, `fence_blocks` vs `split_fences` nested-fence disagreement, "new sub-page" exemption never expires, and missing JSON/`tot[0]` guards.
**Fix:** Carry to Phase 7 or fix as described in the prior report.

---

_Reviewed: 2026-10-04_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
