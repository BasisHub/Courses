---
phase: quick-261006-e3h
plan: 01
subsystem: samples
tags: [zips, sample-sync, solution-fences, bbj-syntax]
status: complete
requirements: [DWC-03, CONV-06, EXER-04]
key-files:
  modified:
    - docs/static/files/dwc/*.zip (6 folder ZIPs + dwc-samples.zip)
    - docs/static/files/intro-bbj/exercises.zip
    - docs/static/files/intro-bbj/intro-bbj-samples.zip
    - 7 exercise MDX pages (fence bodies only)
    - 3 files under .planning/phases/06.1-*/drafts/intro-bbj/exercises
    - tools/data/dwc-samples-syntax.md
    - tools/data/intro-bbj-syntax.md
metrics:
  tasks: 3
  commits: 3
actuals:
  tokens: 60000
  tasks: 3
  commits: 3
---

# Quick 261006-e3h: Re-sync download ZIPs, solution fences and drafts with docs/examples

Rebuilt the 9 stale sample ZIPs with `tools/sync-samples.py`, re-synced 8 inline "Possible solution" fences on 7 exercise pages and 3 staged 06.1 drafts with `docs/examples`, and recorded the 2026-10-06 syntax re-check in both `tools/data` logs. CI's `sync-samples.py --check` is green again.

## Commits

| Task | Hash | Subject |
|------|------|---------|
| 1 | 89c745d | fix(quick-261006-e3h): regenerate sample ZIPs from updated examples |
| 2 | 17c1ff4 | docs(quick-261006-e3h): sync inline solutions and 06.1 drafts with updated examples |
| 3 | a052c48 | docs(quick-261006-e3h): record BBj syntax re-check of updated samples |

Nothing was pushed.

## Live scope

`git diff --name-only 9342f97 HEAD -- docs/examples` listed 20 `.bbj` files (18 under `docs/examples/dwc`, 2 under `docs/examples/intro-bbj/exercises/oo-tic-tac-toe`), the same as at planning time. The list is below, in the first column of the syntax table.

## Syntax results

Task 1's syntax gate was satisfied by the orchestrator, because the BBj MCP tools were not loadable in the executor session (ToolSearch disabled). The orchestrator ran `bbj_check_syntax` on all 20 files and saved per-file sha256 prefixes. Before the rebuild I recomputed `sha256sum | cut -c1-16` for all 20 files. All 20 matched, so no file changed after the check. No `.bbj` source was edited in this task.

Checker: hosted `bbj_check_syntax`, stock BBj 26.03. Footer identity line: bbj-docs · hosted · docs 2026-09-21 · fd516a9d. Every file returned "No errors found" with 0 diagnostics.

| File | sha256 prefix | Result |
|------|---------------|--------|
| dwc/01_GUI2BUI2DWC/DWC2.bbj | 4c876faafe807590 | pass |
| dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj | e9f11837c3a68ddd | pass |
| dwc/02_CSSStylesAndCustomProperties/SetStyle.bbj | 3e769e1df093b32e | pass (was fail at 2026-10-03) |
| dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj | 651ce7b499349e9b | pass |
| dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj | a8c73b6a51e89e20 | pass |
| dwc/04_ExtendedAttributes/LabelAttributes.bbj | 1a718d4c2c3624e4 | pass |
| dwc/04_ExtendedAttributes/TreeSearch.bbj | d111be401f31a6a4 | pass |
| dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj | 7b2ae3bab88fda1a | pass |
| dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj | 701a29aafc3f29f8 | pass |
| dwc/05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj | 8800e0a28138180b | pass |
| dwc/06_IconPools/DownloadButton.bbj | 2813970b33a9fd93 | pass |
| dwc/06_IconPools/Exercise-IconPools.bbj | 4dc4defa9db4b05e | pass |
| dwc/06_IconPools/Exercise-IconPoolsComplete.bbj | 56da4de5077b92ec | pass |
| dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj | 8773df940505f460 | pass |
| dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj | 3031fc882891f05f | pass |
| dwc/07_ControlValiation/builtInValidation.bbj | b9ba1f8334e29370 | pass |
| dwc/07_ControlValiation/formValidation.bbj | 8d58f639fc27dadf | pass |
| dwc/07_ControlValiation/javaScriptValidation-Required.bbj | 6130e37b5d745410 | pass |
| intro-bbj/exercises/oo-tic-tac-toe/GameWindow.bbj | e58cdf5c7a2ccf24 | pass |
| intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj | 57b636bb4616a5c8 | pass |

## ZIP rebuild

`python3 tools/sync-samples.py` printed 9 `wrote`, 9 `unchanged`, no `removed`. The manifest compare (CRC and size per entry, plus SHA-256 per ZIP, run with `python3 -I`) passed:

- The ZIP set is unchanged, and every ZIP has the same entry names in the same order.
- Every changed entry maps to a path in the live scope. Every scope path changed in both its folder ZIP and its book's aggregate ZIP.
- Every ZIP with no changed entry is byte-identical to before.
- `git status --porcelain docs/static/files` listed exactly the 9 rewritten ZIPs.

Rebuilt (9): dwc/01_GUI2BUI2DWC, 02_CSSStylesAndCustomProperties, 04_ExtendedAttributes, 05_CssLayouts, 06_IconPools, 07_ControlValiation, dwc-samples; intro-bbj/exercises, intro-bbj-samples.

Unchanged (9): dwc/03B_ArcFiles, 03C_Grid2GridEx, 08_BrowserConstraints, 09_EmbeddingOtherComponents, 10_AdvancedResponsive; intro-bbj/better-hello-world, dwc-lesson-result, dwc-lesson-start, oo-samples.

## Fence pairs re-synced

Only the lines between the opening and closing fence changed. A guard confirmed that the text outside the replaced bodies equals `git show HEAD:<page>`. After the change, `check-dwc-phase6.py solutions` reports 592 checks and 0 failed.

- dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx: DWC2.bbj
- dwc/05-dwc-controls/90-exercise-search-bbjtree.mdx: Exercise-SearchBBjTreeComplete.bbj
- dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx: Exercise-ConvertToCssLayoutComplete-Grid.bbj
- dwc/06-flow-layouts/91-exercise-css-flexbox.mdx: Exercise-ConvertToCssFlexboxComplete.bbj
- dwc/07-icon-pools/90-exercise-icon-static-text.mdx: Exercise-IconPoolsComplete.bbj
- dwc/08-control-validation/90-exercise-email-validation.mdx: Exercise-BuiltInValidationComplete.bbj
- intro-bbj/02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx: GameWindow.bbj and PlayTicTacToe.bbj

## Drafts refreshed

Copied byte for byte from `docs/examples` into `.planning/phases/06.1-exercise-solutions-and-restored-screenshots/drafts/intro-bbj/exercises/`:

- `oo-tic-tac-toe/GameWindow.bbj` and `oo-tic-tac-toe/PlayTicTacToe.bbj` (upstream range).
- `ResponsiveLoginDialog.bbj`: pre-existing drift from commit 27afffd, which already broke the verify-phase6.1 drafts check before this range. Fixed in passing. Not one of the 20 re-checked files; it was checked in earlier phases and copied unedited.

## Vale

Before and after finding sets on the 7 pages are identical, and error level reports 0. Code fences are not linted, so the fence edits add nothing. The 7 pre-existing non-error findings sit in untouched prose and are left as a follow-up candidate:

- 90-exercise-gui-to-bui-to-dwc.mdx:14: Google.Acronyms, spell out 'BDT'
- 90-exercise-search-bbjtree.mdx:12 and 90-exercise-css-grid-layout.mdx:12: Google.WordListCase 'chapter'
- 90-exercise-css-grid-layout.mdx:16: Google.Contractions 'that is'
- 90-exercise-email-validation.mdx lines 3, 16 and 18: Google.WordListCase 'Email' (the one in line 3 is the page title, which the exercise gate checks)

The two `tools/data` files are not linted by the Vale config (0 files). I checked them for em dashes by hand and found none.

## Syntax logs

- `tools/data/dwc-samples-syntax.md`: the 18 in-scope rows are pass with a 2026-10-06 re-check detail. SetStyle.bbj is now pass ("re-checked 2026-10-06 after e5d4cf6 fix"). Counts: Pass 49, Fail 0, Total 49, equal to the 49 `docs/examples/dwc/` rows. The closing paragraph on the broken line 13 is replaced by one sentence saying e5d4cf6 fixed it. I added one dated sentence with the footer identity line.
- `tools/data/intro-bbj-syntax.md`: the GameWindow.bbj and PlayTicTacToe.bbj rows carry the re-check detail. Rows `91-exercise-oo-tic-tac-toe.mdx#3` and `#4` keep "byte-identical to ..." and add "re-checked 2026-10-06". I confirmed by counting bbj fences that #3 is GameWindow.bbj and #4 is PlayTicTacToe.bbj. Counts are unchanged (Pass 46, Fail 0, Total 46), and I added one dated sentence with the footer line.

## Gate results

| Gate | Result |
|------|--------|
| `python3 tools/sync-samples.py --check` | pass, 18 PASS lines, rc 0 |
| `python3 tools/check-dwc-phase6.py solutions` | pass, 592 checks, 0 failed |
| `python3 tools/check-intro-bbj.py samples` | pass, 66 checks, 0 failed |
| `python3 tools/check-intro-bbj.py syntax` | pass, 50 checks, 0 failed |
| `cd docs && npm run build` | pass, rc 0 |
| `bash tools/verify-phase1.sh` | pass (ALL CHECKS PASSED; SKIP print check, Chrome/pdftotext not found) |
| `bash tools/verify-phase2.sh --local` | pass (ALL CHECKS PASSED) |
| `bash tools/verify-phase3.sh` | 2 failures, environmental, see below |
| `bash tools/verify-phase4.sh --no-build` | pass (SKIP relocation, ../bbj-dwc-tutorial clone missing) |
| `bash tools/verify-phase5.sh --no-build` | pass |
| `bash tools/verify-phase6.sh --no-build` | pass (SKIP regression, ../bbj-dwc-tutorial clone missing) |
| `bash tools/verify-phase6.1.sh --no-build` | pass |

## Deviations from Plan

**1. [Orchestrator override] Syntax gate run by the orchestrator, not the executor**
- The BBj MCP tools could not be loaded in the executor session. I stopped at the precondition and reported a checkpoint. The orchestrator replied "mcp-available" and supplied `bbj_check_syntax` results for all 20 files.
- I verified the per-file sha256 prefixes before rebuilding. The results are recorded in `tools/data` with the checker footer. No executor-side `bbj_check_syntax` call was made.

**2. [Out of scope, no fix] verify-phase3.sh reports 2 failures**
- `FAIL [site05] favicon 32x32` and `FAIL [site05] social cover 1200x630`.
- Cause: the script uses `file docs/static/img/... | grep '32 x 32'`, and `file(1)` is not installed in this sandbox. The images themselves are correct: favicon-32.png is 32x32 and social-cover.png is 1200x630, read from the PNG headers. No commit since ff04411 touched `docs/static/img`, so the result at ff04411 is the same.
- Left as is. The orchestrator should run verify-phase3.sh where `file` is available, or accept the failure as environmental.

**3. [Scope note] Plan expected 24 failed solutions checks at HEAD**
- Task 1 had already cleared the 16 ZIP-entry checks, so only the 8 fence pairs remained, as the plan anticipated.

Otherwise the plan ran as written. No `.bbj` source, checker or `tools/sync-samples.py` was modified.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- Commits 89c745d, 17c1ff4 and a052c48 exist on local main, and none was pushed.
- The 9 rebuilt ZIPs, 7 pages, 3 drafts and 2 logs are in those commits. Only untracked path left: `.planning/quick/`.
