---
phase: 06-exercises-dwc-gap-audit
plan: 09
subsystem: content-verification
tags: [bbj, syntax-check, mcp]
requires: [06-03, 06-04, 06-05, 06-06, 06-07, 06-08]
provides: [06-bbj-targets.tsv, 06-bbj-syntax-raw.tsv, snippets/*.fixed.bbj]
affects: [06-10, 06-11, 06-12, 06-13, 06-14, 06-15]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/06-bbj-targets.tsv
    - .planning/phases/06-exercises-dwc-gap-audit/06-bbj-syntax-raw.tsv
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/3B3-07.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/3B3-11.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/9A-04.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/9A-05.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/9A-09.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/9C-06.fixed.bbj
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/EX73-01.fixed.bbj
decisions:
  - "Logic errors that parse (duplicated LAST_NAME, broken HTML inside string literals, void method used as a value) count as real errors under D-14 and get a .fixed.bbj copy"
metrics:
  completed: 2026-10-04
---

# Phase 6 Plan 09: BBj check of kept and exercise snippets Summary

The orchestrator session read `bbj://primer` and ran `bbj_lookup` and `bbj_check_syntax` on all 37 BBj snippets the phase will put on pages. 30 pass as written, 7 needed a fix, and every fix passes the check.

Primer and every call came from the `bbj-docs` server (hosted, stock BBj 26.03). Footer of the last call: `bbj-docs · hosted · docs 2026-09-21 · fd516a9d`.

## Results

| Result | Count |
|--------|-------|
| pass | 30 |
| fixed | 7 |
| pass (wrapped) | 0 |
| not checkable | 0 |

## Fixed snippets

| Id | Problem | Fix |
|----|---------|-----|
| 3B3-07 | Second `getFieldAsString("LAST_NAME")` prints the last name twice (parses) | Second call reads `FIRST_NAME` |
| 3B3-11 | Same duplicate as 3B3-07 (parses) | Second call reads `FIRST_NAME` |
| 9A-04 | HTML typo `<html><<body>` in a string (parses) | `<html><body>` |
| 9A-05 | Syntax error line 15: `js$ = js" + ...` | `js$ = js$ + ...` |
| 9A-09 | Stray `</head>` in the HTML string (parses) | `<head></head>` |
| 9C-06 | Syntax error lines 1 to 3: one statement over three lines without continuation | `:` continuation prefix on lines 2 and 3 |
| EX73-01 | `setAttribute` returns nothing (doc: Return Value None), so `myName!` would not hold the edit box | Two statements: create the edit box, then call `setAttribute` |

## Notes for later plans

- 3B3-07: the "malformed `DATE(...)` call" reported by 06-03 is valid; it is a continuation line with a mask expression.
- 6A-34 uses `BBjWebManager::injectScript`, a documented method (BBj 22.03+), so the Moodle form is valid and stays.
- 7A-41/7A-45: the client-validation methods belong to the `ClientValidation` interface (BBj 22.10+), not a `BBjEditBox` method page.
- 8B-02: `OPEN (lp,mode="PDF")"LP"` parses, but the docs do not document a literal `MODE="PDF"` option (BUI and DWC write SYSPRINT output to PDF anyway). 06-15 should phrase the text around this or drop the mode.
- `DataRow`, `ResultSet`, `SqlQueryBC` and `BBjGridExWidget` come from the BBj components library and plug-in, which the BBj docs do not index; their calls parse but cannot be looked up.
- Kept-material plans use the `.fixed.bbj` copy where one exists and note the fix in the audit row (D-14).

## Deviations from Plan

None. Task 2 ran inline in the orchestrator session, as the plan intends. A first attempt was blocked because the claude.ai BBj Documentation connector disconnected after an account switch; the user added the `bbj-docs` MCP server, and all results come from it.

## Self-Check: PASSED
