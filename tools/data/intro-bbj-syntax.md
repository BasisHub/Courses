# Intro-BBj: BBj syntax check

Result of `bbj_check_syntax` for every `.bbj` sample under `docs/examples/intro-bbj/` and every `bbj` fence in `docs/docs/intro-bbj/`, recorded in Phase 5 (D-11).

Checker: BBj Documentation MCP `bbj_check_syntax`, hosted check, stock BBj 26.03 (no bbj-local check registered). Source build: bbj-docs · hosted · docs 2026-09-21 · fd516a9d. Checked 2026-10-04, one call per target with the content passed verbatim, after reading `bbj://primer`.

Pass: 30. Fail: 0. Not checkable: 0. Total: 30.

The hosted check parses the code with a stock BBj; it does not resolve PREFIX, classpath or `use` targets, so a pass means the code parses, not that it runs.

Two fences in `05-loops-and-if-statements.mdx` failed first because they used the pseudocode placeholders `dosomething` and `dosomethingelse`. They now use `PRINT` (verified with `bbj_lookup`: https://documentation.basis.cloud/BASISHelp/WebHelp/commands/print_verb.htm) and pass the re-check. No `.bbj` sample needed a change.

| File | Result | Detail |
|------|--------|--------|
| `docs/examples/intro-bbj/better-hello-world/BetterHelloWorld.bbj` | pass | - |
| `docs/examples/intro-bbj/dwc-lesson-result/Sample.bbj` | pass | - |
| `docs/examples/intro-bbj/dwc-lesson-start/Sample.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/Car.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/CarApplication.bbj` | pass | - |
| `docs/examples/intro-bbj/oo-samples/MyDialog.bbj` | pass | - |
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
| `docs/docs/intro-bbj/02-object-oriented-syntax/03-reference-classes.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/03-developing-for-the-web.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/04-window-layout-mode.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/05-css-layout-instructions.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/06-css-on-controls.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/06-css-on-controls.mdx#2` | pass | - |
| `docs/docs/intro-bbj/03-web-development/07-style-attributes.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/08-external-css-file.mdx#1` | pass | - |
| `docs/docs/intro-bbj/03-web-development/08-external-css-file.mdx#2` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/01-shadow-dom-parts.mdx#1` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/01-shadow-dom-parts.mdx#2` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/02-dark-theme.mdx#1` | pass | - |
| `docs/docs/intro-bbj/04-theming-and-styling/02-dark-theme.mdx#2` | pass | - |
