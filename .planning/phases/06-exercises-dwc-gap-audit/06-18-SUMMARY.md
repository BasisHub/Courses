---
phase: 06-exercises-dwc-gap-audit
plan: 18
subsystem: dwc-exercises
tags: [gap-closure, exercises, dwc]
requirements: [EXER-02]
key-files:
  modified:
    - docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx
    - docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx
    - docs/docs/dwc/01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx
    - tools/data/dwc-exercise-link-map.json
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 6 Plan 18: DWC exercise text fixes Summary

Grid and Flexbox exercises now name the `json!` JsonObject their starters contain, Flexbox goal 4 shows the chained `setAttribute` call, and exercise 01 keeps the `$00100083$` flags and links the real BBjButton page.

## Commits

- b22bdbf: fix(06-18): name the json! JsonObject in the grid and Flexbox exercises (CR-01, WR-01, IN-09)
- 0903f17: fix(06-18): correct window flags and Button link in exercise 01 (WR-02, WR-03)
- A follow-up commit adjusts one wording to clear a Vale warning ("chapter") in exercise 01.

## Deviations from Plan

- **MCP not available.** The bbj-docs MCP tools (bbj_lookup, bbj_check_syntax, primer) could not be reached in this subagent session (ToolSearch disabled). The plan's BBj API confirmations (setAttribute returns the control, setPanelStyle "@element", addWindow flags overload) and the syntax check of the chained line were NOT run through MCP. The snippet is character-identical to line 47 of the existing starter `Exercise-ConvertToCssFlexbox.bbj`, which was already checked in earlier plans. The orchestrator should re-run those checks.
- **Worktree base reset.** The worktree started at 16dc498; reset to the required base a8feeac before work, per the startup check.
- **Build not run.** `docs/node_modules` is absent in the worktree, so `npm run build` was not run. `python3 tools/check-dwc-phase6.py exercises` (430 checks, 0 failed) and `solutions` (0 failed, built-HTML checks skipped) pass.

## Verification

- No `css!` or "CSS string" remains on the grid and Flexbox pages; no em dashes.
- Link map entry for BBjButton updated; `https://dwc.style/docs/dwc/BBjButton.md` returned 200 on 2026-10-04; JSON parses.
- Vale (main checkout binary): 0 errors, 0 warnings on the three pages (one pre-existing BDT suggestion).

## Self-Check: PASSED
