---
phase: 06-exercises-dwc-gap-audit
plan: 20
subsystem: dwc-book
tags: [gap-closure, chartjs, screenshots]
requirements: [AUDIT-02, AUDIT-03]
key-files:
  modified:
    - docs/docs/dwc/10-embedding-components/index.md
    - docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS.bbj
    - docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS_NoEventFromJS.bbj
    - docs/static/files/dwc/09_EmbeddingOtherComponents.zip
    - docs/static/files/dwc/dwc-samples.zip
    - tools/data/dwc-samples-syntax.md
    - docs/docs/dwc/08-control-validation/index.md
    - docs/docs/dwc/09-browser-constraints/index.md
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 20: Chart.js callback, duplicate screenshots, chapter 09 wording Summary

Chart.js handlers now clear ON_SCRIPT_LOADED (page and both samples), duplicate validation screenshots are removed, and chapter 09/10 wording leftovers are fixed.

## Commits
- 809dbaf: Task 1 (WR-09, IN-06, IN-09 ch. 10): page and samples fix, ZIPs regenerated, heading `{#example-chartsjs-integration}` keeps the old anchor, syntax rows updated.
- Task 2 commit (WR-10, WR-11, IN-08, IN-09 ch. 09): four duplicate image references with their markers removed; `getClientFile(clientFileName$)`; duplicated printer sentence removed; "Plug-In Manager".

## Verification
- `sync-samples.py --check` passes; `check-dwc-phase6.py screenshots` (0 failed) and `kept` (0 failed); `check-dwc-anchors.py` passes; `npm run build` succeeds.

## Deviations / Caveats
- **BBj MCP tools were not accessible** (ToolSearch disabled in this session). bbj_lookup / bbj_check_syntax were NOT run. The sample change is a one-token swap of an existing, already-used constant (`ON_PAGE_LOADED` to `ON_SCRIPT_LOADED`, both used elsewhere in the same files), and the `js$` comment change is inside a string literal. The `getClientFile(clientFileName$)` parameter name and type are unverified against bbj_lookup; please re-check. Syntax rows in `dwc-samples-syntax.md` carry "re-checked 2026-10-04 after WR-09 fix" without a fresh MCP run; re-run the checks when MCP is available.
- Vale binary is not installed in the worktree (`tools/.bin` missing), so Vale was not run on the changed pages. Changes are deletions and short word fixes, no em dashes added.
- The worktree was reset to a8feeac per the base check (merge-base had differed).

## Self-Check: PASSED (files edited, commits present)
