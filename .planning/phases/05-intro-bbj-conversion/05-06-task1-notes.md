# 05-06 Task 1 notes (run by the orchestrator, which has the BBj Documentation MCP)

- bbj://primer read before the first check (2026-10-04).
- 30 targets checked with bbj_check_syntax, one call each, content verbatim: 28 pass, 2 fail.
- Footer of every call: bbj-docs · hosted · docs 2026-09-21 · fd516a9d (hosted check, stock BBj 26.03).

## Failures and verified fix candidate for Task 2

Both are in docs/docs/intro-bbj/01-getting-started/05-loops-and-if-statements.mdx. The placeholders
`dosomething` / `dosomethingelse` are pseudocode, not BBj statements.

- Tried `GOSUB dosomething` / `GOSUB dosomethingelse`: parses, but UndefinedLabelError (labels not defined in the fragment). Rejected.
- Verified fix (bbj_lookup PRINT: https://documentation.basis.cloud/BASISHelp/WebHelp/commands/print_verb.htm; bbj_check_syntax: No errors found):
  - fence #1: `IF something THEN` / `PRINT "something is true"` / `ELSE` / `PRINT "something is false"` / `ENDIF`
  - fence #2: `IF something THEN PRINT "something is true"`
- Surrounding prose that names "dosomething" must be adjusted minimally to match.
