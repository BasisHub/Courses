---
phase: 06-exercises-dwc-gap-audit
reviewed: 2026-10-04T10:50:03Z
depth: standard
files_reviewed: 43
files_reviewed_list:
  - docs/docs/dwc/00-overview.mdx
  - docs/docs/dwc/01-gui-to-bui-to-dwc/01-registering-launching.md
  - docs/docs/dwc/01-gui-to-bui-to-dwc/02-hello-world.md
  - docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md
  - docs/docs/dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx
  - docs/docs/dwc/02-browser-developer-tools/02-developer-tools.md
  - docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md
  - docs/docs/dwc/02-browser-developer-tools/04-dwc-themes.md
  - docs/docs/dwc/02-browser-developer-tools/90-exercise-theming-support.mdx
  - docs/docs/dwc/04-upgrading-apps/01-arc-files.md
  - docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md
  - docs/docs/dwc/04-upgrading-apps/90-exercise-bbjgridexwidget.mdx
  - docs/docs/dwc/05-dwc-controls/90-exercise-search-bbjtree.mdx
  - docs/docs/dwc/05-dwc-controls/index.md
  - docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx
  - docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx
  - docs/docs/dwc/06-flow-layouts/index.md
  - docs/docs/dwc/07-icon-pools/90-exercise-icon-static-text.mdx
  - docs/docs/dwc/07-icon-pools/index.md
  - docs/docs/dwc/08-control-validation/90-exercise-email-validation.mdx
  - docs/docs/dwc/08-control-validation/index.md
  - docs/docs/dwc/09-browser-constraints/index.md
  - docs/docs/dwc/10-embedding-components/90-exercise-embed-component.mdx
  - docs/docs/dwc/10-embedding-components/index.md
  - docs/docs/dwc/11-advanced-responsive/01-media-queries.md
  - docs/docs/dwc/11-advanced-responsive/02-transitions.md
  - docs/docs/dwc/11-advanced-responsive/90-exercise-media-queries.mdx
  - docs/docs/dwc/11-advanced-responsive/91-exercise-button-transition.mdx
  - docs/docs/dwc/11-advanced-responsive/index.md
  - docs/docs/dwc/exercises.mdx
  - docs/docs/intro-bbj/00-overview.mdx
  - docs/docs/intro-bbj/exercises.mdx
  - tools/check-dwc-phase6.py
  - tools/check-dwc-routes.py
  - tools/check-intro-bbj.py
  - tools/data/dwc-2022-screenshots.json
  - tools/data/dwc-exercise-link-map.json
  - tools/data/dwc-gap-audit.md
  - tools/data/dwc-gap-image-map.json
  - tools/data/dwc-image-map.json
  - tools/verify-phase4.sh
  - tools/verify-phase5.sh
  - tools/verify-phase6.sh
findings:
  critical: 1
  warning: 13
  info: 9
  total: 23
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-10-04T10:50:03Z
**Depth:** standard
**Files Reviewed:** 43
**Status:** issues_found

## Summary

I reviewed the 11 new DWC exercise pages, the two exercise indexes, the changed lines in the existing DWC chapter pages (diff against 156ce09), the Phase 6 checker and verify script, and the data maps.

Every `check-dwc-phase6.py` command passes against the current tree and build (exercises 430, pointers 21, indexes 64, solutions 92, audit 4471, kept 978, screenshots 458, commits 45; all with 0 failed). `dwc-image-map.json` agrees with the files on disk: every `new` path exists and is referenced from its `page`, and no `parked` entries are left. The `{/* TODO: screenshot outdated? */}` markers in `.md` files are compiled as MDX comments and do not leak into the built HTML.

The defects are in the content, where the checkers cannot see them. Two exercise pages tell readers to edit a variable that does not exist in the starter file. Several new prose paragraphs contradict the code they describe: DWC1.bbj's grid mode, a `display: grid;` line that does not exist, the "one icon from each pool" claim, and the `demos` folder name. The Chart.js handler clears the wrong callback, and some screenshots are reused with mismatched context. In the checker, the commit-order check never confirms that the "kept" commits exist, and the D-08 starter-overlap scan cannot see `GUISample.bbj`.

Pre-existing fences already listed for Phase 7 in 06-15-SUMMARY.md are not reported again.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: Grid and Flexbox exercises tell the reader to edit a `css!` variable that does not exist

**File:** `docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx:14-20`, `docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx:14-18`
**Issue:** Each goal says "Add code to the `css!` variable" or "Augment the `css!` variable". Both starter files (`docs/examples/dwc/05_CssLayouts/Exercise-ConvertToCssLayout.bbj` lines 10-20 and 46-50, and `Exercise-ConvertToCssFlexbox.bbj` lines 7-13) and both inline solutions build the window style in a `json!` JsonObject and apply it with `setPanelStyle("@element", json!.toString())`. Neither starter contains a `css!` variable. A reader who follows the page cannot find what they are told to change, and both exercises become unworkable as written. The checker cannot catch this, because it only scans for copied starter lines.
**Fix:** Match the starter's own goal comments:
```markdown
1. Add code to the `json!` JsonObject that is applied to the window to change the CSS `display` to `grid`, ...
2. Augment the `json!` variable to set the `grid-template-columns` CSS property ...
```
Make the same change in all three Flexbox goals.

## Warnings

### WR-01: Flexbox goal 4 describes and shows code that the starter does not contain

**File:** `docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx:20-25`
**Issue:** The page says the program "then calls the `BBjControl::setAttribute()` method" and shows two separate statements (`myName! = window!.addEditBox(...)` then `myName!.setAttribute(...)`). The starter and the solution (line 70) chain the calls on one line: `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")`. The starter's own comment says "we chained the BBjControl::setAttribute() method". The fence also sits at column 0 after list item 4, so it ends the ordered list instead of rendering inside item 4.
**Fix:** Describe the chained form, or say the snippet is the unchained equivalent. Indent the fence by 3 spaces so it belongs to item 4.

### WR-02: Exercise 01 says to set the window flag to `$00100000$`, which conflicts with the chapter

**File:** `docs/docs/dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx:18`
**Issue:** "Set the window creation flag to `$00100000$`" reads as replacing the flags. The chapter (`03-gui-to-bui-to-dwc.md` "Begin by changing the code to specify the `$00100083$` flags") and the solution DWC1.bbj (line 40) keep the existing `$83` bits and add the flow-layout bit. A reader who follows the exercise literally drops the existing window flags.
**Fix:** "Add the flow-layout flag `$00100000$` to the window's creation flags (for example `$00100083$`) and run the program again in the DWC."

### WR-03: Exercise 01 "properties documentation of the Button element" links to the DWC docs root

**File:** `docs/docs/dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx:20`; `tools/data/dwc-exercise-link-map.json` (entry `basis-next/#/dwc/bbj-button`)
**Issue:** The replacement URL `https://dwc.style/docs/#/dwc/` is the generic landing page. The link map note says `bbj-button.md` returned 404, but `https://dwc.style/docs/dwc/BBjButton.md` returns 200. That URL follows the same naming pattern already used for `#/dwc/BBjTree`. The link promises the Button properties and lands elsewhere.
**Fix:** Use `https://dwc.style/docs/#/dwc/BBjButton` on the page and in the link map (`verdict: replaced`).

### WR-04: 06-flow-layouts says DWC1.bbj uses `inline-grid`; it uses `grid`

**File:** `docs/docs/dwc/06-flow-layouts/index.md:116-122`
**Issue:** "The `DWC1.bbj` program from the first chapter uses this method" is followed by `setPanelStyle("display","inline-grid")` plus `"180px auto"`, and the prose says "sets the window to use an inline grid". DWC1.bbj line 13 (and the solution on the exercise 01 page, line 42) uses `"grid"`. Only DWC2.bbj uses `inline-grid`, and it uses `1fr 2fr`. The snippet matches neither sample.
**Fix:** Change the snippet and the prose to `setPanelStyle("display","grid")` and "a grid".

### WR-05: The "repeat()" walkthrough describes a first line, `display: grid;`, that the example does not have

**File:** `docs/docs/dwc/06-flow-layouts/index.md:145`
**Issue:** "Here is how the example breaks down. The first line, `display: grid;` ... In the second line:" The only example in that section (lines 129-131) is a single line, `grid-template-columns: repeat(auto-fit, ...)`. The kept Moodle prose referred to a two-line snippet that was not carried over.
**Fix:** Add `display: grid;` as the first line of the CSS fence at line 130, or rewrite the walkthrough to cover only the one line.

### WR-06: Incorrect claim that `justify-self` only matters for nested grids

**File:** `docs/docs/dwc/06-flow-layouts/index.md:252`
**Issue:** "`justify-self` only matters when you nest grids" is wrong. `justify-self` aligns any grid item inside its own grid area. The table four lines above describes it correctly as "Override for single item". The page now contradicts itself.
**Fix:** "`justify-self` (and `align-self`) override the container's alignment for a single item, for example to right-align one button in its cell."

### WR-07: The GridExWidget demos folder is `demo`, not `demos`

**File:** `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md:209`
**Issue:** "You find the demos in the `demos` subfolder". The linked repository folder is `tree/master/demo` (HTTP 200); `tree/master/demos` returns 404. The CD-Store link at line 186 also uses `demo/`.
**Fix:** Replace `demos` with `demo`.

### WR-08: Icon pools page misdescribes the first-chapter sample

**File:** `docs/docs/dwc/07-icon-pools/index.md:40`
**Issue:** "The Hello World program from the first chapter does this on its button, with one icon from each of the three pools." The program is DWC2.bbj, not Hello World, and it uses one icon (Tabler `speakerphone`). The Feather and Font Awesome lines are commented-out `rem` alternatives (exercise 01 page, lines 94-107).
**Fix:** "`DWC2.bbj` from the first chapter puts a Tabler icon on its button and shows the Feather and Font Awesome alternatives as comments."

### WR-09: The Chart.js `handleScriptLoaded` clears `ON_PAGE_LOADED` instead of `ON_SCRIPT_LOADED`

**File:** `docs/docs/dwc/10-embedding-components/index.md:123`
**Issue:** The generic pattern on the same page (line 49) clears `ON_SCRIPT_LOADED` in `handleScriptLoaded` and explains why each step runs once. The concrete Chart.js handler clears `ON_PAGE_LOADED` again, which `handlePageLoaded` already cleared, and leaves the script-loaded callback registered. Any later script injection re-runs the chart setup. The page contradicts its own pattern. The bug was copied from `ChartJS.bbj` and `ChartJS_NoEventFromJS.bbj` (line 40 and line 35).
**Fix:**
```bbj
handleScriptLoaded:
  htmlview!.clearCallback(htmlview!.ON_SCRIPT_LOADED)
```
Consider fixing the two sample files and their `static/files` ZIP at the same time.

### WR-10: Validation screenshots are now shown twice, and the old placements contradict the new captions

**File:** `docs/docs/dwc/08-control-validation/index.md:48/119, 100/162, 176/222, 179/251`
**Issue:** The kept material places `validation-1.png` (the "first and last name required" message box), `validation-4.png`, `validation-5.png` (the first-name popover) and `validation-demo2.gif` in context. The pre-existing references stay in place with generic alt text, so each image appears twice. Two of the old placements are now visibly wrong: `validation-1.png` illustrates "Visual Feedback" (label colour change) but shows an alert, and `validation-5.png` sits under "Example - Email Validation" but shows a first-name popover.
**Fix:** Remove the old duplicate references at lines 119, 162, 176 and 179, together with their markers.

### WR-11: `getClientFile()` shown without its required file-name argument

**File:** `docs/docs/dwc/09-browser-constraints/index.md:32`
**Issue:** "Get the `BBjClientFile` from `BBjAPI().getThinClient().getClientFileSystem().getClientFile()`". `BBjClientFileSystem::getClientFile` takes the client file name. As written, the chain reads as a no-argument call. This prose is new in this phase, so per CLAUDE.md the API needs a `bbj_lookup` check.
**Fix:** Write `getClientFile(clientFileName$)` after confirming the signature with `bbj_lookup`.

### WR-12: The commit-order check never checks that the "kept" commits exist

**File:** `tools/check-dwc-phase6.py:592`
**Issue:** The existence loop checks `("exercise pages", "removal", "markers", "indexes", "verify")` but leaves out `"kept"`. The order checks `("exercise pages","kept")` and `("kept","removal")` iterate over `found["kept"]`. If it is empty they run zero checks and pass. A history with no kept-material commits passes D-18.
**Fix:**
```python
for name in ("exercise pages", "kept", "removal", "markers", "indexes", "verify"):
```

### WR-13: The D-08 starter-overlap scan cannot see `GUISample.bbj`

**File:** `tools/check-dwc-phase6.py:325`
**Issue:** Starters are collected with `rglob("Exercise-*.bbj")`. The starter for exercise 01 is `GUISample.bbj` (see `SOLUTIONS`, line 56), so pasting it into exercise 01 outside `<details>` would pass D-08 (b) unnoticed.
**Fix:** Build the starter set from `SOLUTIONS` instead of the glob:
```python
names = {s[2] for s in SOLUTIONS.values()}
for f in sorted(examples_dir(root).rglob("*.bbj")):
    if f.name not in names or "Complete" in f.name:
        continue
```

## Info

### IN-01: The URL allow-list ignores the link map's `pages` scope

**File:** `tools/check-dwc-phase6.py:339-342, 405-408`
**Issue:** Any URL marked kept, replaced or provisional for one exercise page is accepted on every exercise page. The `pages` field is never read.
**Fix:** Build `allowed_new` per page from `e["pages"]`.

### IN-02: Exit code in `all` mode contradicts the docstring

**File:** `tools/check-dwc-phase6.py:22, 970-972`
**Issue:** The docstring says exit 2 means missing input, but `all` returns 1 when an input is missing.
**Fix:** Return 2 whenever `missing` is set, or document the exception.

### IN-03: `fence_blocks` and `split_fences` disagree on nested fences

**File:** `tools/check-dwc-phase6.py:243`
**Issue:** `fence_blocks` closes a block on any bare ```` ``` ```` line, even inside a ```` ```` ```` fence. `split_fences` correctly requires the same or a longer marker. Solution bodies could be truncated, which fails closed but gives a misleading message.
**Fix:** Close the block only when `split_fences` reports the closing row; pass the close flag through `rows`.

### IN-04: The "new sub-page" text in Reason skips the target-existence check

**File:** `tools/check-dwc-phase6.py:691`
**Issue:** Any keep or covered row whose Reason contains "new sub-page" escapes the file-existence check, even after Phase 6 finishes. `cmd_kept` re-checks keep rows but not covered rows.
**Fix:** In full mode, drop the exemption once Phase 6 is complete.

### IN-05: Robustness gaps in `cmd_kept` and the summary parser

**File:** `tools/check-dwc-phase6.py:824, 796`
**Issue:** `json.loads` on `dwc-gap-image-map.json` has no `MissingInput` wrapping, so malformed JSON raises a traceback. A missing map is silently treated as empty. `tot[0][1]` raises `IndexError` if the Total row has only one cell.
**Fix:** Use `load_json_required` and guard `len(tot[0]) >= 5`.

### IN-06: The placeholder JavaScript comment would comment out the rest of the script

**File:** `docs/docs/dwc/10-embedding-components/index.md:52`
**Issue:** `js$ + "/// and further js code to execute...."` is concatenated with no newline. Any code a reader appends after it on the same `js$` is commented out.
**Fix:** Use `/* further JavaScript */` or a `rem` line outside the string.

### IN-07: Stale comment and an icon tag that differs from the sample

**File:** `docs/docs/dwc/07-icon-pools/index.md:175, 114-140`
**Issue:** The comment says "bootstrap icons" for the Ionicons buttons. The snippets use `<dwc-icon>`, while `DownloadButton.bbj`, which the prose quotes, and the exercise solution use `<bbj-icon>`.
**Fix:** Change the comment to "ionicons" and use the same tag as the sample.

### IN-08: New prose duplicates existing paragraphs

**File:** `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md:84/96`; `docs/docs/dwc/09-browser-constraints/index.md:42/52`
**Issue:** "use the external CSS file in production" appears twice, as does "the browser has no direct access to printers".
**Fix:** Merge each pair into one paragraph.

### IN-09: Wording leftovers

**File:** `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md:318` ("In BUI, on the left": the images are no longer side by side); `docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx:10` ("already uses flow control", should be "flow layout"); `docs/docs/dwc/09-browser-constraints/index.md:70` ("Plugin Manager" while 02-upgrading-grids uses "Plug-In Manager"); `docs/docs/dwc/10-embedding-components/index.md:61,78` ("Charts.js" next to the new "Chart.js").
**Fix:** Correct each wording.

---

_Reviewed: 2026-10-04T10:50:03Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
