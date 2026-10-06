# Intro-BBj: BBj syntax check

Result of `bbj_check_syntax` for every `.bbj` sample under `docs/examples/intro-bbj/` and every `bbj` fence in `docs/docs/intro-bbj/`, recorded in Phase 5 (D-11).

Checker: BBj Documentation MCP `bbj_check_syntax`, hosted check, stock BBj 26.03 (no bbj-local check registered). Source build: bbj-docs · hosted · docs 2026-09-21 · fd516a9d. Checked 2026-10-04, one call per target with the content passed verbatim, after reading `bbj://primer`.

Pass: 46. Fail: 0. Not checkable: 0. Total: 46.

The hosted check parses the code with a stock BBj; it does not resolve PREFIX, classpath or `use` targets, so a pass means the code parses, not that it runs.

Two fences in `05-loops-and-if-statements.mdx` failed first because they used the pseudocode placeholders `dosomething` and `dosomethingelse`. They now use `PRINT` (verified with `bbj_lookup`: https://documentation.basis.cloud/BASISHelp/WebHelp/commands/print_verb.htm) and pass the re-check. No `.bbj` sample needed a change.

Phase 6.1 added the exercise solutions under `docs/examples/intro-bbj/exercises/`. They were checked at plan 06.1-07 after reading `bbj://primer`, with the results in `06.1-bbj-syntax-raw.tsv`; one call per file covers its byte-identical page fence.

On 2026-10-06 `exercises/oo-tic-tac-toe/GameWindow.bbj` and `PlayTicTacToe.bbj` were re-checked with the hosted `bbj_check_syntax` (stock BBj 26.03) after the upstream edits in 9342f97..777e375, and both passed with 0 diagnostics. Checker footer: bbj-docs · hosted · docs 2026-09-21 · fd516a9d.

| File | Result | Detail |
|------|--------|--------|
| `docs/examples/intro-bbj/better-hello-world/BetterHelloWorld.bbj` | pass | - |
| `docs/examples/intro-bbj/dwc-lesson-result/Sample.bbj` | pass | - |
| `docs/examples/intro-bbj/dwc-lesson-start/Sample.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/Car.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/CarApplication.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/MyDialog.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/TicTacToe.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/TicTacToeComputer.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/LoginDialog.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/ResponsiveLoginDialog.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/oo-tic-tac-toe/Board.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/oo-tic-tac-toe/Player.bbj` | pass | - |
| `docs/examples/intro-bbj/exercises/oo-tic-tac-toe/GameWindow.bbj` | pass | re-checked 2026-10-06 after 9342f97..777e375 sample edits |
| `docs/examples/intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj` | pass | re-checked 2026-10-06 after 9342f97..777e375 sample edits |
| `docs/docs/intro-bbj/01-getting-started/02-first-hello-world.mdx#1` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#1` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#2` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#3` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#4` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#5` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#6` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/03-syntax-and-variables.mdx#7` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/05-loops-and-if-statements.mdx#1` | pass | Fixed in C5 (placeholder pseudocode replaced with PRINT; verified by bbj_check_syntax). Before: line 2 col 1 SyntaxError: syntax error; line 4 col 1 SyntaxError: syntax error. After: No errors found |
| `docs/docs/intro-bbj/01-getting-started/05-loops-and-if-statements.mdx#2` | pass | Fixed in C5 (placeholder pseudocode replaced with PRINT; verified by bbj_check_syntax). Before: line 1 col 1 SyntaxError: syntax error. After: No errors found |
| `docs/docs/intro-bbj/01-getting-started/07-multiplying-calculator.mdx#1` | pass | - |
| `docs/docs/intro-bbj/01-getting-started/90-exercise-tic-tac-toe.mdx#1` | pass | byte-identical to docs/examples/intro-bbj/exercises/TicTacToe.bbj |
| `docs/docs/intro-bbj/01-getting-started/91-exercise-computer-player.mdx#1` | pass | byte-identical to docs/examples/intro-bbj/exercises/TicTacToeComputer.bbj |
| `docs/docs/intro-bbj/02-object-oriented-syntax/03-reference-classes.mdx#1` | pass | - |
| `docs/docs/intro-bbj/02-object-oriented-syntax/90-exercise-login-dialog.mdx#1` | pass | byte-identical to docs/examples/intro-bbj/exercises/LoginDialog.bbj |
| `docs/docs/intro-bbj/02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx#1` | pass | byte-identical to docs/examples/intro-bbj/exercises/oo-tic-tac-toe/Board.bbj |
| `docs/docs/intro-bbj/02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx#2` | pass | byte-identical to docs/examples/intro-bbj/exercises/oo-tic-tac-toe/Player.bbj |
| `docs/docs/intro-bbj/02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx#3` | pass | byte-identical to docs/examples/intro-bbj/exercises/oo-tic-tac-toe/GameWindow.bbj, re-checked 2026-10-06 |
| `docs/docs/intro-bbj/02-object-oriented-syntax/91-exercise-oo-tic-tac-toe.mdx#4` | pass | byte-identical to docs/examples/intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj, re-checked 2026-10-06 |
| `docs/docs/intro-bbj/03-web-development/03-developing-for-the-web.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/04-window-layout-mode.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/05-css-layout-instructions.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/06-css-on-controls.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/06-css-on-controls.mdx#2` | pass | - |
| `docs/docs/intro-bbj/03-web-development/07-style-attributes.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/08-external-css-file.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/08-external-css-file.mdx#2` | pass | - |
| `docs/docs/intro-bbj/03-web-development/90-exercise-responsive-login-dialog.mdx#1` | pass | byte-identical to docs/examples/intro-bbj/exercises/ResponsiveLoginDialog.bbj |
| `docs/docs/intro-bbj/04-theming-and-styling/01-shadow-dom-parts.mdx#1` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/01-shadow-dom-parts.mdx#2` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/02-dark-theme.mdx#1` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/02-dark-theme.mdx#2` | pass | - |
