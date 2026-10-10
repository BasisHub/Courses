# Sample test report: BBj 26.03 baseline

Generated 2026-10-10T17:50:05.354Z. BBj version REV 26.03. Chromium 156.0.8078.4, Playwright 1.64.0. DWC only, Chromium only (D-01, D-02). No sample was changed for this report (D-03) and nothing was posted to GitHub (D-04).

Screenshots, raw console text and per-test JSON stay in `tools/sample-test/results/` on the machine that ran the baseline; they are not committed because the console header shows the license serial number.

## Summary

| Measure | Count |
| --- | --- |
| Files under docs/examples | 63 |
| Runnable programs | 59 |
| Smoke pass | 41 |
| Smoke fail | 18 |
| Smoke blocked | 0 |
| Behaviour pass | 79 |
| Behaviour fail | 26 |
| Behaviour blocked | 0 |
| Files with syntax errors | 0 |
| Files with type-check findings | 4 |
| Type-check findings | 8 |
| Self-test controls as expected | 4 of 4 |
| Harness failures from baseline | none |

## Results per sample

| Sample | Kind | Compile | Type check | Run | Errors | Behaviour | Issues |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dwc/01_GUI2BUI2DWC/DWC1.bbj` | window | ok | 0 / 2 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/01_GUI2BUI2DWC/DWC2.bbj` | window | ok | 0 / 2 | pass |  | 4 pass, 0 fail, 0 blocked | [#4](https://github.com/BasisHub/Courses/issues/4) |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj` | window | ok | 0 / 4 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/Themes.bbj` | window | ok | 0 / 2 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/UserPreference.bbj` | window | ok | 0 / 2 | fail | `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration...` | 0 pass, 1 fail, 0 blocked |  |
| `dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj` | window | ok | 0 / 3 | fail | `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration...` | 0 pass, 1 fail, 0 blocked | [#3](https://github.com/BasisHub/Courses/issues/3) |
| `dwc/01_GUI2BUI2DWC/GUISample.bbj` | window | ok | 0 / 2 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/01_GUI2BUI2DWC/MessageBox.bbj` | dialog | ok | 0 / 0 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/02_CSSStylesAndCustomProperties/CSSCustomProperties.bbj` | window | ok | 0 / 27 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/02_CSSStylesAndCustomProperties/Exercise-ThemingSupportComplete.bbj` | window | ok | 0 / 5 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/02_CSSStylesAndCustomProperties/SetStyle.bbj` | window | ok | 0 / 4 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/03B_ArcFiles/ArcSample.bbj` | window | ok | 0 / 3 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/03B_ArcFiles/DWCArcSample.bbj` | window | ok | 0 / 3 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/03C_Grid2GridEx/DWCGridSample.bbj` | window | ok | 0 / 1 | pass |  | 1 pass, 1 fail, 0 blocked |  |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj` | print | ok | 0 / 1 | pass |  | none |  |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/2_DataRowFromTemplate.bbj` | print | ok | 0 / 1 | pass |  | none |  |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/3_ResultSetCreation.bbj` | print | ok | 0 / 0 | pass |  | none |  |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/4_BBjGridExWidget.bbj` | window | ok | 0 / 1 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/03C_Grid2GridEx/Exercise-BBjGridExWidgetComplete.bbj` | window | ok | 0 / 0 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/03C_Grid2GridEx/GUIGridSample.bbj` | window | ok | 0 / 4 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj` | starter | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 0 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 2 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/04_ExtendedAttributes/LabelAttributes.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 3 pass, 1 fail, 0 blocked | [#5](https://github.com/BasisHub/Courses/issues/5), [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/04_ExtendedAttributes/TreeSearch.bbj` | window | ok | 0 / 6 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` (+7 more) | 1 pass, 2 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj` | window | ok | 0 / 127 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/05_CssLayouts/DWCFlexbox.bbj` | window | ok | 0 / 172 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/05_CssLayouts/DWCGrid.bbj` | window | ok | 0 / 78 | fail | `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration...` | 2 pass, 0 fail, 0 blocked |  |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | starter | ok | 3 / 1 | fail | `e.componentOnReady is not a function` (+4 more) | 0 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | window | ok | 3 / 1 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 1 pass, 2 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/05_CssLayouts/Exercise-ConvertToCssLayout.bbj` | starter | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 0 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 0 pass, 3 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/06_IconPools/DownloadButton.bbj` | window | ok | 0 / 2 | fail | `0/8 icons rendered; missing feather:download, tabler:download, fa:fas-download, feather:download-cloud, tabler:cloud-download, fa:fas-cloud-download-alt, ion...` | 0 pass, 2 fail, 0 blocked | [#6](https://github.com/BasisHub/Courses/issues/6) |
| `dwc/06_IconPools/Exercise-IconPools.bbj` | starter | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked | [#6](https://github.com/BasisHub/Courses/issues/6) |
| `dwc/06_IconPools/Exercise-IconPoolsComplete.bbj` | window | ok | 0 / 0 | fail | `0/2 icons rendered; missing tabler:ball-tennis, fa:futbol` | 0 pass, 1 fail, 0 blocked | [#6](https://github.com/BasisHub/Courses/issues/6) |
| `dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj` | starter | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 0 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 1 pass, 2 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/07_ControlValiation/builtInValidation.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 2 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/07_ControlValiation/formValidation.bbj` | window | ok | 0 / 0 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 2 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/07_ControlValiation/javaScriptValidation-Required.bbj` | window | ok | 0 / 5 | fail | `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, pl...` | 2 pass, 1 fail, 0 blocked | [#7](https://github.com/BasisHub/Courses/issues/7) |
| `dwc/08_BrowserConstraints/BBjFileChooserUpload.bbj` | window | ok | 0 / 2 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/08_BrowserConstraints/DownloadingAFile.bbj` | window | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/08_BrowserConstraints/SysPrint.bbj` | dialog | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/09_EmbeddingOtherComponents/ChartJS.bbj` | window | ok | 0 / 1 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/09_EmbeddingOtherComponents/ChartJS_NoEventFromJS.bbj` | window | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `dwc/09_EmbeddingOtherComponents/EventMapSample.bbj` | window | ok | 0 / 6 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/09_EmbeddingOtherComponents/Exercise-EmbedComponentComplete.bbj` | window | ok | 0 / 0 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj` | window | ok | 0 / 1 | pass |  | 1 pass, 1 fail, 0 blocked |  |
| `dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj` | window | ok | 1 / 1 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj` | window | ok | 1 / 1 | pass |  | 1 pass, 1 fail, 0 blocked |  |
| `intro-bbj/better-hello-world/BetterHelloWorld.bbj` | window | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `intro-bbj/dwc-lesson-result/Sample.bbj` | window | ok | 0 / 2 | pass |  | 1 pass, 0 fail, 0 blocked |  |
| `intro-bbj/dwc-lesson-start/Sample.bbj` | window | ok | 0 / 2 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/LoginDialog.bbj` | window | ok | 0 / 0 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/ResponsiveLoginDialog.bbj` | window | ok | 0 / 2 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/TicTacToe.bbj` | window | ok | 0 / 1 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/TicTacToeComputer.bbj` | window | ok | 0 / 1 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/oo-tic-tac-toe/Board.bbj` | class | ok | 0 / 0 | via intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj |  | none |  |
| `intro-bbj/exercises/oo-tic-tac-toe/GameWindow.bbj` | class | ok | 0 / 2 | via intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj |  | none |  |
| `intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj` | window | ok | 0 / 0 | pass |  | 2 pass, 0 fail, 0 blocked |  |
| `intro-bbj/exercises/oo-tic-tac-toe/Player.bbj` | class | ok | 0 / 0 | via intro-bbj/exercises/oo-tic-tac-toe/PlayTicTacToe.bbj |  | none |  |
| `intro-bbj/oo-samples/Car.bbj` | class | ok | 0 / 0 | via intro-bbj/oo-samples/CarApplication.bbj |  | none |  |
| `intro-bbj/oo-samples/CarApplication.bbj` | print | ok | 0 / 0 | pass |  | none |  |
| `intro-bbj/oo-samples/MyDialog.bbj` | window | ok | 0 / 0 | pass |  | 1 pass, 0 fail, 0 blocked |  |

## Issues #3 to #7

### #3: Setting the css with @app-style on the window doesn't appear to have an impact in current BBj

- Issue: https://github.com/BasisHub/Courses/issues/3
- Sample: `dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj`, line 18
- Linked to: line 17 at 9342f97
- Behaviour tests:

| Test | Sample | Outcome | Evidence |
| --- | --- | --- | --- |
| CSS from Sample.css set with @app-style lays out the mypanel panel as a two-column inline grid | `dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj` | fail (assertion) | `failed: computed display of the mypanel element (Sample.css: inline-grid); Expected: "inline-grid"; Received: "block"; notes: DWC console: Starting from BBj ...` |

### #4: Is there a better way in modern DWC / BBj to do this?

- Issue: https://github.com/BasisHub/Courses/issues/4
- Sample: `dwc/01_GUI2BUI2DWC/DWC2.bbj`, line 35
- Linked to: line 35 at 6900fce (button title with an embedded dwc-icon)
- Behaviour tests:

| Test | Sample | Outcome | Evidence |
| --- | --- | --- | --- |
| the Say Hello button shows the speakerphone icon from its <html> title | `dwc/01_GUI2BUI2DWC/DWC2.bbj` | pass | `markup in the program: <html>Say Hello <dwc-icon name='speakerphone'></dwc-icon></html> (tabler pool by default) / DOM: <dwc-button> holds dwc-icon name=spea...` |

### #5: is --dwc-space overcome?

- Issue: https://github.com/BasisHub/Courses/issues/5
- Sample: `dwc/04_ExtendedAttributes/LabelAttributes.bbj`, line 34
- Linked to: line 34 at 6900fce (then var(--bbj-space); 777682c changed it to var(--dwc-space))
- Behaviour tests:

| Test | Sample | Outcome | Evidence |
| --- | --- | --- | --- |
| --dwc-space resolves on BBj 26.03 | `dwc/04_ExtendedAttributes/LabelAttributes.bbj` | pass | `--dwc-space=0.5rem / --bbj-space=(empty) / --dwc-space on the window panel: 0.5rem; scale 3xs=0.0625rem 2xs=0.125rem xs=0.25rem s=0.5rem m=1rem l=1.25rem xl=...` |

### #6: Icon Buttons in this sample appear to not work at all

- Issue: https://github.com/BasisHub/Courses/issues/6
- Sample: `dwc/06_IconPools/DownloadButton.bbj`, lines 30, 31, 32, 35, 36, 37
- Linked to: lines 27-28 at 777682c
- Behaviour tests:

| Test | Sample | Outcome | Evidence |
| --- | --- | --- | --- |
| every button icon renders (feather, tabler, Font Awesome and the ionicons custom pool) | `dwc/06_IconPools/DownloadButton.bbj` | fail (assertion) | `failed: every icon renders; Expected: 8; Received: 0; notes: rendered per pool: feather 0/2, tabler 0/2, fa 0/2, ionicons 0/2 (0 of 8) / page tags 8 x <bbj-i...` |
| the starter shows its static text and Exit button without icons (the reader adds them) | `dwc/06_IconPools/Exercise-IconPools.bbj` | pass | `static text: "I like the following sports:" / icons: 0 (the starter has no icons by design; the exercise asks the reader to add them)` |
| the static text shows the tennis ball and football icons | `dwc/06_IconPools/Exercise-IconPoolsComplete.bbj` | fail (assertion) | `failed: both icons render; Expected: 2; Received: 0; notes: static text: "I like the following sports: and , how about you?" / icons rendered per pool: table...` |

### #7: it appears to be a pattern throughout that this way of setting styles to a panel doesn't work with BBj 26

- Issue: https://github.com/BasisHub/Courses/issues/7
- Sample: `dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj`, line 38
- Linked to: line 38 at 777682c
- Behaviour tests:

| Test | Sample | Outcome | Evidence |
| --- | --- | --- | --- |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/04_ExtendedAttributes/LabelAttributes.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 7 differ: display block (want grid); justify-items normal...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/04_ExtendedAttributes/TreeSearch.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 8 differ: display block (want grid); justify-items normal...` |
| setPanelStyle("@element", json) applies box-sizing border-box to the window panel | `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | fail (assertion) | `failed: the panel shows every property of the JSON; notes: computed vs JSON, 1 differ: box-sizing content-box (want border-box) / inline style of the panel e...` |
| setPanelStyle("@element", json) applies display flex to the window panel | `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | fail (assertion) | `failed: the panel uses display: flex; Expected: "flex"; Received: "block"; notes: computed vs JSON, 5 differ: display block (want flex); flex-direction row (...` |
| setPanelStyle("@element", json) applies box-sizing border-box to the window panel | `dwc/05_CssLayouts/Exercise-ConvertToCssLayout.bbj` | fail (assertion) | `failed: the panel shows every property of the JSON; notes: computed vs JSON, 1 differ: box-sizing content-box (want border-box) / inline style of the panel e...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/07_ControlValiation/builtInValidation.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/07_ControlValiation/formValidation.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |
| setPanelStyle("@element", json) applies display grid to the window panel | `dwc/07_ControlValiation/javaScriptValidation-Required.bbj` | fail (assertion) | `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (...` |

## Findings per sample

### dwc/01_GUI2BUI2DWC/DWC_AppThemes/UserPreference.bbj

- Run: fail (start: window, 648 ms)
- Console errors: `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration guide: https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives`
- Icons: 0/4 rendered
- Undeclared follow-ups: 2
- Behaviour: `the app follows the OS light and dark setting` fail (assertion): `failed: page background with the OS in dark mode differs from light mode; Expected: not "oklch(0.96 0.004 268.858)"; notes: prefers-color-scheme dark in the page: false (OS light), true (OS dark) / OS light: data-app-theme=null, background oklch(0.96 0.004 268.858); OS dark: data-app-theme=null, background oklch(0.96 0.004 268.858) / DWC console: Starting from BBj v23.00, the attributes directives are no longer available (the message names BBjWebManager as the replacement)`
- Screenshots (local only): `results/screenshots/courses-dwc-01-dwc-appthemes-userpreference-light.png`, `results/screenshots/courses-dwc-01-dwc-appthemes-userpreference-dark.png`, `results/screenshots/courses-dwc-01-dwc-appthemes-userpreference--the-app-follows-the-os-light-and-dark-se.png`
- Pages: `docs/docs/dwc/02-browser-developer-tools/03-css-custom-properties.md`

### dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj

- Run: fail (start: window, 651 ms)
- Console errors: `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration guide: https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives`
- Icons: 0/4 rendered
- Undeclared follow-ups: 3
- Behaviour: `CSS from Sample.css set with @app-style lays out the mypanel panel as a two-column inline grid` (issue #3) fail (assertion): `failed: computed display of the mypanel element (Sample.css: inline-grid); Expected: "inline-grid"; Received: "block"; notes: DWC console: Starting from BBj v23.00, the attributes directives are no longer available (the message names BBjWebManager as the replacement) / style elements containing .mypanel: 0 of 9 / element with class mypanel: <dwc-window-content> (1); display=block, columns=none, gap=normal, padding=0px`
- Screenshots (local only): `results/screenshots/courses-dwc-01-dwc-externalcss-sample-light.png`, `results/screenshots/courses-dwc-01-dwc-externalcss-sample-dark.png`, `results/screenshots/courses-dwc-01-dwc-externalcss-sample--css-from-sample-css-set-with-app-style-l.png`
- Pages: `docs/docs/dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md`

### dwc/03C_Grid2GridEx/DWCGridSample.bbj

- Run: pass (start: window, 892 ms)
- Icons: 0/0 rendered
- Warnings:
  - `console-warning: AG Grid: enableRowGroup is only valid with AG Grid Enterprise Module @ag-grid-enterprise/row-grouping - your column definition should not have enableRowGroup`
  - `console-warning: AG Grid: rowGroup is only valid with AG Grid Enterprise Module @ag-grid-enterprise/row-grouping - your column definition should not have rowGroup`
  - `console-warning: AG Grid: enablePivot is only valid with AG Grid Enterprise Module @ag-grid-enterprise/row-grouping - your column definition should not have enablePivot`
  - `console-warning: AG Grid: enableValue is only valid with AG Grid Enterprise Module @ag-grid-enterprise/row-grouping - your column definition should not have enableValue`
- Undeclared follow-ups: 1
- Behaviour: `selecting a row names the CD, title and artist` fail (assertion): `failed: selection text (CD number, title and artist of the clicked row); Expected: "You selected 000001: 'Mississippi Blues' by John Hurt & The Ramblers"; Received: "You selected 000001: 'Mississippi Blues' by Mississippi Blues"; notes: clicked row 000001 / Mississippi Blues / John Hurt & The Ramblers; the program shows: You selected 000001: 'Mississippi Blues' by Mississippi Blues / the sentence repeats the title where the artist belongs (line 69 of the program reads the TITLE field twice)`
- Screenshots (local only): `results/screenshots/courses-dwc-03c-dwcgridsample-light.png`, `results/screenshots/courses-dwc-03c-dwcgridsample-dark.png`, `results/screenshots/courses-dwc-03c-dwcgridsample--selecting-a-row-names-the-cd-title-and-a.png`
- Pages: `docs/docs/dwc/04-upgrading-apps/02-upgrading-grids.md`

### dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj

- Run: fail (start: window, 1205 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 90/184 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); rows 0 (want 2); row-gap normal (want gap); padding-top 0px (want ... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 331px x 1608.5px in a parent of 331 x 1609 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-04-exercise-searchbbjtree-light.png`, `results/screenshots/courses-dwc-04-exercise-searchbbjtree-dark.png`, `results/screenshots/courses-dwc-04-exercise-searchbbjtree--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/05-dwc-controls/90-exercise-search-bbjtree.mdx`

### dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj

- Run: fail (start: window, 808 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 91/187 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); rows 0 (want 2); row-gap normal (want gap); padding-top 0px (want ... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 331px x 603.5px in a parent of 331 x 604 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-04-exercise-searchbbjtreecomplete-light.png`, `results/screenshots/courses-dwc-04-exercise-searchbbjtreecomplete-dark.png`, `results/screenshots/courses-dwc-04-exercise-searchbbjtreecomplete--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/05-dwc-controls/90-exercise-search-bbjtree.mdx`

### dwc/04_ExtendedAttributes/LabelAttributes.bbj

- Run: fail (start: window, 979 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/6 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 7 differ: display block (want grid); justify-items normal (want stretch); align-items normal (want stretch); box-sizing content-box (want border-box); columns 0 (want 1); row-gap ... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 564px x 61.7344px in a parent of 564 x 62 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-04-labelattributes-light.png`, `results/screenshots/courses-dwc-04-labelattributes-dark.png`, `results/screenshots/courses-dwc-04-labelattributes--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/05-dwc-controls/index.md`

### dwc/04_ExtendedAttributes/TreeSearch.bbj

- Run: fail (start: window, 980 ms)
- Console errors:
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
  - `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration guide: https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives`
- Icons: 34/73 rendered
- Undeclared follow-ups: 6
- Behaviour:
  - `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 8 differ: display block (want grid); justify-items normal (want stretch); align-items normal (want stretch); box-sizing content-box (want border-box); columns 0 (want 1); rows 0 (... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available; Starting from BBj v23.00, the attributes directives are no longer available / panel 956px x 435px in a parent of 956 x 435 (JSON sets width and height 100%)`
  - `the first tree paints its icons orange and the second paints them blue` fail (assertion): `failed: icon colour of the first tree (orange, #ffa726); Expected pattern: /^(#ffa726|rgb\(255,167,38\))$/; Received string:  ""; notes: --dwc-tree-icon-fill on tree 1: (empty); on tree 2: (empty) (the code sets #ffa726 and #64b5f6) / style elements with a .first-tree or .second-tree rule: 0 of 11 / DWC console: Starting from BBj v24.00, the style directives are no longer available; Starting from BBj v23.00, the attributes directives are no longer available`
- Screenshots (local only): `results/screenshots/courses-dwc-04-treesearch-light.png`, `results/screenshots/courses-dwc-04-treesearch-dark.png`, `results/screenshots/courses-dwc-04-treesearch--setpanelstyle-element-json-applies-displ.png`, `results/screenshots/courses-dwc-04-treesearch--the-first-tree-paints-its-icons-orange-a.png`
- Pages: `docs/docs/dwc/05-dwc-controls/index.md`

### dwc/05_CssLayouts/DWCGrid.bbj

- Run: fail (start: window, 679 ms)
- Console errors: `Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration guide: https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives`
- Icons: 0/16 rendered
- Undeclared follow-ups: 78
- Screenshots (local only): `results/screenshots/courses-dwc-05-dwcgrid-light.png`, `results/screenshots/courses-dwc-05-dwcgrid-dark.png`
- Pages: `docs/docs/dwc/06-flow-layouts/index.md`

### dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj

- Run: fail (start: window, 677 ms)
- Page errors:
  - `e.componentOnReady is not a function`
  - `e.setCursorPos is not a function`
  - `e.componentOnReady is not a function`
  - `e.setCursorPos is not a function`
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/2 rendered
- Warnings: `debug-log: 27 error lines in Debug.log.2026-10-10.0`
- Type check:
  - line 47, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")`
  - line 48, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myCompany! = window!.addEditBox("BASIS International Ltd.").setAttribute("label", "Company:")`
  - line 49, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myEmail! = window!.addEditBox("joeBlow@basis.com").setAttribute("label", "Email:")`
- Undeclared follow-ups: 1
- Behaviour: `setPanelStyle("@element", json) applies box-sizing border-box to the window panel` (issue #7) fail (assertion): `failed: the panel shows every property of the JSON; notes: computed vs JSON, 1 differ: box-sizing content-box (want border-box) / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 564px x 61.7344px in a parent of 564 x 62 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-05-exercise-converttocssflexbox-light.png`, `results/screenshots/courses-dwc-05-exercise-converttocssflexbox-dark.png`, `results/screenshots/courses-dwc-05-exercise-converttocssflexbox--setpanelstyle-element-json-applies-box-s.png`
- Pages: `docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx`

### dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj

- Run: fail (start: window, 696 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/6 rendered
- Type check:
  - line 36, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")`
  - line 37, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myCompany! = window!.addEditBox("BASIS International Ltd.").setAttribute("label", "Company:")`
  - line 38, error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox, statement `myEmail! = window!.addEditBox("joeBlow@basis.com").setAttribute("label", "Email:")`
- Undeclared follow-ups: 1
- Behaviour:
  - `setPanelStyle("@element", json) applies display flex to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: flex; Expected: "flex"; Received: "block"; notes: computed vs JSON, 5 differ: display block (want flex); flex-direction row (want column); box-sizing content-box (want border-box); row-gap normal (want gap); padding-top 0px (want padding) / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 564px x 61.7344px in a parent of 564 x 62 (JSON sets width and height 100%)`
  - `the window panel is a flexbox column with padding and a gap` fail (assertion): `failed: the panel uses display: flex; Expected: "flex"; Received: "block"; notes: panel: display block, flex-direction row, row-gap normal, padding-top 0px / lines 24 to 32 put display flex, flex-direction column, gap and padding in a JsonObject, applied with setPanelStyle("@element", ...) / field positions: Name:@1,34 Company:@189,34 Email:@377,34 / DWC console: Starting from BBj v24.00, the style directives are no longer available`
- Screenshots (local only): `results/screenshots/courses-dwc-05-exercise-converttocssflexboxcomplete-light.png`, `results/screenshots/courses-dwc-05-exercise-converttocssflexboxcomplete-dark.png`, `results/screenshots/courses-dwc-05-exercise-converttocssflexboxcomplete--setpanelstyle-element-json-applies-displ.png`, `results/screenshots/courses-dwc-05-exercise-converttocssflexboxcomplete--the-window-panel-is-a-flexbox-column-wit.png`
- Pages: `docs/docs/dwc/06-flow-layouts/91-exercise-css-flexbox.mdx`

### dwc/05_CssLayouts/Exercise-ConvertToCssLayout.bbj

- Run: fail (start: window, 682 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour: `setPanelStyle("@element", json) applies box-sizing border-box to the window panel` (issue #7) fail (assertion): `failed: the panel shows every property of the JSON; notes: computed vs JSON, 1 differ: box-sizing content-box (want border-box) / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 471px x 17.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-05-exercise-converttocsslayout-light.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayout-dark.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayout--setpanelstyle-element-json-applies-box-s.png`
- Pages: `docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx`

### dwc/05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj

- Run: fail (start: window, 693 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour:
  - `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
  - `the Submit button spans both columns of the grid` fail (assertion): `failed: the Submit button starts at the left edge of the first column; Expected: <= 3; Received:    658; notes: Submit: computed grid-column "1 / 3", x 658 to 771, y 90 / first label x 1; first edit box x 80 to 268; last edit box bottom 161 / Submit validation: empty names: "Invalid Input"; first and last name filled: "Form Submitted Successfully"`
  - `the window panel is a two-column CSS grid with padding, a gap and centered rows` fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: panel: display block, columns 0 (none), align-items normal / gap normal / normal, padding-top 0px / lines 21 to 30 put display grid, grid-template-columns "auto 1fr", align-items center, gap and padding in a JsonObject, applied with setPanelStyle("@element", ...) / first four labels: * First Name:@1,37 * Last Name:@268,37 Company:@534,37 Email:@784,37 / DWC console: Starting from BBj v24.00, the style directives are no longer available`
- Screenshots (local only): `results/screenshots/courses-dwc-05-exercise-converttocsslayoutcomplete-grid-light.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayoutcomplete-grid-dark.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayoutcomplete-grid--setpanelstyle-element-json-applies-displ.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayoutcomplete-grid--the-submit-button-spans-both-columns-of.png`, `results/screenshots/courses-dwc-05-exercise-converttocsslayoutcomplete-grid--the-window-panel-is-a-two-column-css-gri.png`
- Pages: `docs/docs/dwc/06-flow-layouts/90-exercise-css-grid-layout.mdx`, `docs/docs/dwc/11-advanced-responsive/90-exercise-media-queries.mdx`

### dwc/06_IconPools/DownloadButton.bbj

- Run: fail (start: window, 682 ms)
- Icons: 0/8 rendered; missing `feather:download`, `tabler:download`, `fa:fas-download`, `feather:download-cloud`, `tabler:cloud-download`, `fa:fas-cloud-download-alt`, `ionicons:cloud-download-outline`, `ionicons:cloud-download`
- Undeclared follow-ups: 2
- Behaviour:
  - `every button icon renders (feather, tabler, Font Awesome and the ionicons custom pool)` (issue #6) fail (assertion): `failed: every icon renders; Expected: 8; Received: 0; notes: rendered per pool: feather 0/2, tabler 0/2, fa 0/2, ionicons 0/2 (0 of 8) / page tags 8 x <bbj-icon>; defined in the browser: bbj-icon false, dwc-icon true / with <dwc-icon> instead of <bbj-icon> (browser only, sample unchanged): feather 2/2, tabler 2/2, fa 2/2, ionicons 2/2 / pools: window.BBj.IconsPools ionicons, window.Dwc.IconsPools none before the experiment / network of the unchanged sample: svg requests none, ionicons requests 0, failed 0 / network during the experiment: svg requests 6 x cdn.jsdelivr.net 200, 2 x cdnjs.cloudflare.com 200 / missing: feather:download, tabler:download, fa:fas-download, feather:download-cloud...`
  - `the styled variants take their size and color: expanse l and theme danger, inline width and color` fail (assertion): `failed: the styled icons are drawn with their size and color; notes: 5 problems: feather not drawn (box 0 x 19); tabler not drawn (box 0 x 19); fa not drawn (box 0 x 19); expanse l not larger than default (0 vs 0 px); theme danger does not color the feather icon (ok... / feather cloud: <bbj-icon> expanse l theme danger style "", box 0 x 19, color oklch(0.42 0.253545 263.526) / tabler cloud: <bbj-icon> expanse - theme - style "width: 0.5em; color: green", box 0 x 19, color rgb(0, 128, 0) / fa cloud: <bbj-icon> expanse - theme - style "width: 1em; color: var(--dwc-color-danger)", box 0 x 19, color oklch(0.49 0.216577 29.7575) / plain feather download: box 0 x 19; --dwc-color-danger resolves...`
- Screenshots (local only): `results/screenshots/courses-dwc-06-downloadbutton-light.png`, `results/screenshots/courses-dwc-06-downloadbutton-dark.png`, `results/screenshots/courses-dwc-06-downloadbutton--every-button-icon-renders-feather-tabler.png`, `results/screenshots/courses-dwc-06-downloadbutton--the-styled-variants-take-their-size-and.png`
- Pages: `docs/docs/dwc/07-icon-pools/index.md`, `docs/docs/dwc/07-icon-pools/90-exercise-icon-static-text.mdx`

### dwc/06_IconPools/Exercise-IconPoolsComplete.bbj

- Run: fail (start: window, 632 ms)
- Icons: 0/2 rendered; missing `tabler:ball-tennis`, `fa:futbol`
- Behaviour: `the static text shows the tennis ball and football icons` (issue #6) fail (assertion): `failed: both icons render; Expected: 2; Received: 0; notes: static text: "I like the following sports: and , how about you?" / icons rendered per pool: tabler 0/1, fa 0/1; in total 0 of 2 / missing: tabler:ball-tennis, fa:futbol / tags the page uses: 2 x <bbj-icon>; defined in the browser: bbj-icon false, dwc-icon true`
- Screenshots (local only): `results/screenshots/courses-dwc-06-exercise-iconpoolscomplete-light.png`, `results/screenshots/courses-dwc-06-exercise-iconpoolscomplete-dark.png`, `results/screenshots/courses-dwc-06-exercise-iconpoolscomplete--the-static-text-shows-the-tennis-ball-an.png`
- Pages: `docs/docs/dwc/07-icon-pools/90-exercise-icon-static-text.mdx`

### dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj

- Run: fail (start: window, 718 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-07-exercise-builtinvalidation-light.png`, `results/screenshots/courses-dwc-07-exercise-builtinvalidation-dark.png`, `results/screenshots/courses-dwc-07-exercise-builtinvalidation--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/08-control-validation/90-exercise-email-validation.mdx`

### dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj

- Run: fail (start: window, 707 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour:
  - `goal 2: the email pattern rejects malformed addresses, accepts a valid one, and Submit shows Congrats` fail (assertion): `failed: the Email pattern accepts exactly the valid addresses; notes: 4 differences: abc is valid, expected invalid; abc@ is valid, expected invalid; jane@example is valid, expected invalid; jane@@example.com is valid, expected invalid / browser console about the pattern attribute: is not a valid regular expression; compiled with flags v: Invalid character in character class / Submit with all fields valid: "Form Submitted Successfully": Congrats, you filled in the form successfully! / email states: abc valid, abc@ valid, jane@example valid, jane@@example.com valid, jane@example.com valid, jane.doe@sub.example.org valid`
  - `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-07-exercise-builtinvalidationcomplete-light.png`, `results/screenshots/courses-dwc-07-exercise-builtinvalidationcomplete-dark.png`, `results/screenshots/courses-dwc-07-exercise-builtinvalidationcomplete--goal-2-the-email-pattern-rejects-malform.png`, `results/screenshots/courses-dwc-07-exercise-builtinvalidationcomplete--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/08-control-validation/90-exercise-email-validation.mdx`

### dwc/07_ControlValiation/builtInValidation.bbj

- Run: fail (start: window, 633 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-07-builtinvalidation-light.png`, `results/screenshots/courses-dwc-07-builtinvalidation-dark.png`, `results/screenshots/courses-dwc-07-builtinvalidation--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/08-control-validation/index.md`

### dwc/07_ControlValiation/formValidation.bbj

- Run: fail (start: window, 703 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-07-formvalidation-light.png`, `results/screenshots/courses-dwc-07-formvalidation-dark.png`, `results/screenshots/courses-dwc-07-formvalidation--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/08-control-validation/index.md`

### dwc/07_ControlValiation/javaScriptValidation-Required.bbj

- Run: fail (start: window, 704 ms)
- Console errors: `Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm.`
- Icons: 0/16 rendered
- Undeclared follow-ups: 5
- Behaviour: `setPanelStyle("@element", json) applies display grid to the window panel` (issue #7) fail (assertion): `failed: the panel uses display: grid; Expected: "grid"; Received: "block"; notes: computed vs JSON, 6 differ: display block (want grid); align-items normal (want center); box-sizing content-box (want border-box); columns 0 (want 2); row-gap normal (want gap); padding-top 0px (wa... / inline style of the panel element: none / DWC console: Starting from BBj v24.00, the style directives are no longer available / panel 1278px x 127.5px in a parent of 1278 x 128 (JSON sets width and height 100%)`
- Screenshots (local only): `results/screenshots/courses-dwc-07-javascriptvalidation-required-light.png`, `results/screenshots/courses-dwc-07-javascriptvalidation-required-dark.png`, `results/screenshots/courses-dwc-07-javascriptvalidation-required--setpanelstyle-element-json-applies-displ.png`
- Pages: `docs/docs/dwc/08-control-validation/index.md`

### dwc/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj

- Run: pass (start: window, 626 ms)
- Icons: 0/0 rendered
- Undeclared follow-ups: 1
- Behaviour: `the two child windows sit in the Start and End areas, red above and green below the divider` fail (assertion): `failed: the top child window is inside sl-split-panel; Expected: true; Received: false; notes: splitter children: sl-icon[slot=handle]; shadow slots start:0 handle:1 end:0 (Start and End hold nothing) / top panel: slot start, in the splitter false, parent of its dwc-panel dwc-window-content, has id attribute false, button y 58 / bottom panel: slot end, in the splitter false, parent of its dwc-panel dwc-window-content, has id attribute false, button y 95 / divider y 306, splitter y 78 to 538 / cdn.jsdelivr.net: 135 requests, 135 answered ok`
- Screenshots (local only): `results/screenshots/courses-dwc-09-shoelacesplitter-light.png`, `results/screenshots/courses-dwc-09-shoelacesplitter-dark.png`, `results/screenshots/courses-dwc-09-shoelacesplitter--the-two-child-windows-sit-in-the-start-a.png`
- Pages: `docs/docs/dwc/10-embedding-components/index.md`

### dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj

- Run: pass (start: window, 632 ms)
- Icons: 0/0 rendered
- Type check: line 24, error: Ambiguous signatures <init>(byte[]) <init>(java.lang.String), statement `css! = new String(Files.readAllBytes(Paths.get(BBjAPI().getFileSystem().resolvePath("./Exercise-ButtonTransitionComplete.css"))))`
- Undeclared follow-ups: 1
- Screenshots (local only): `results/screenshots/courses-dwc-10-exercise-buttontransitioncomplete-light.png`, `results/screenshots/courses-dwc-10-exercise-buttontransitioncomplete-dark.png`
- Pages: `docs/docs/dwc/11-advanced-responsive/91-exercise-button-transition.mdx`

### dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj

- Run: pass (start: window, 662 ms)
- Icons: 0/16 rendered
- Type check: line 26, error: Ambiguous signatures <init>(byte[]) <init>(java.lang.String), statement `css! = new String(Files.readAllBytes(Paths.get(BBjAPI().getFileSystem().resolvePath("./Exercise-MediaQueriesComplete.css"))))`
- Undeclared follow-ups: 1
- Behaviour: `the font is smaller below 600 px` fail (assertion): `failed: rendered font sizes below 600 px (label 14px, edit box 14px) are smaller than at 1024 px (14px, 14px); Expected: true; Received: false; notes: label font 14px at 1024 and 14px at 500; edit box 14px and 14px; panel 14px and 14px / custom property --dwc-font-size on the panel: 0.875rem at 1024, 0.8125rem at 500 / experiment in the browser: with font-size: var(--dwc-font-size) set on the panel the label is 13px at 500`
- Screenshots (local only): `results/screenshots/courses-dwc-10-exercise-mediaqueriescomplete-light.png`, `results/screenshots/courses-dwc-10-exercise-mediaqueriescomplete-dark.png`, `results/screenshots/courses-dwc-10-exercise-mediaqueriescomplete--the-font-is-smaller-below-600-px.png`
- Pages: `docs/docs/dwc/11-advanced-responsive/90-exercise-media-queries.mdx`

## Type-check findings

| File | Line | Message | Statement |
| --- | --- | --- | --- |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | 47 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")` |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | 48 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myCompany! = window!.addEditBox("BASIS International Ltd.").setAttribute("label", "Company:")` |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | 49 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myEmail! = window!.addEditBox("joeBlow@basis.com").setAttribute("label", "Email:")` |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | 36 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")` |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | 37 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myCompany! = window!.addEditBox("BASIS International Ltd.").setAttribute("label", "Company:")` |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | 38 | `error: Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox` | `myEmail! = window!.addEditBox("joeBlow@basis.com").setAttribute("label", "Email:")` |
| `dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj` | 24 | `error: Ambiguous signatures <init>(byte[]) <init>(java.lang.String)` | `css! = new String(Files.readAllBytes(Paths.get(BBjAPI().getFileSystem().resolvePath("./Exercise-ButtonTransitionComplete.css"))))` |
| `dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj` | 26 | `error: Ambiguous signatures <init>(byte[]) <init>(java.lang.String)` | `css! = new String(Files.readAllBytes(Paths.get(BBjAPI().getFileSystem().resolvePath("./Exercise-MediaQueriesComplete.css"))))` |

| File | Undeclared follow-ups |
| --- | --- |
| `dwc/01_GUI2BUI2DWC/DWC1.bbj` | 2 |
| `dwc/01_GUI2BUI2DWC/DWC2.bbj` | 2 |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj` | 4 |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/Themes.bbj` | 2 |
| `dwc/01_GUI2BUI2DWC/DWC_AppThemes/UserPreference.bbj` | 2 |
| `dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj` | 3 |
| `dwc/01_GUI2BUI2DWC/GUISample.bbj` | 2 |
| `dwc/02_CSSStylesAndCustomProperties/CSSCustomProperties.bbj` | 27 |
| `dwc/02_CSSStylesAndCustomProperties/Exercise-ThemingSupportComplete.bbj` | 5 |
| `dwc/02_CSSStylesAndCustomProperties/SetStyle.bbj` | 4 |
| `dwc/03B_ArcFiles/ArcSample.bbj` | 3 |
| `dwc/03B_ArcFiles/DWCArcSample.bbj` | 3 |
| `dwc/03C_Grid2GridEx/DWCGridSample.bbj` | 1 |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj` | 1 |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/2_DataRowFromTemplate.bbj` | 1 |
| `dwc/03C_Grid2GridEx/DataRow_and_ResultSet/4_BBjGridExWidget.bbj` | 1 |
| `dwc/03C_Grid2GridEx/GUIGridSample.bbj` | 4 |
| `dwc/04_ExtendedAttributes/TreeSearch.bbj` | 6 |
| `dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj` | 127 |
| `dwc/05_CssLayouts/DWCFlexbox.bbj` | 172 |
| `dwc/05_CssLayouts/DWCGrid.bbj` | 78 |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | 1 |
| `dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | 1 |
| `dwc/06_IconPools/DownloadButton.bbj` | 2 |
| `dwc/07_ControlValiation/javaScriptValidation-Required.bbj` | 5 |
| `dwc/08_BrowserConstraints/BBjFileChooserUpload.bbj` | 2 |
| `dwc/09_EmbeddingOtherComponents/ChartJS.bbj` | 1 |
| `dwc/09_EmbeddingOtherComponents/EventMapSample.bbj` | 6 |
| `dwc/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj` | 1 |
| `dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj` | 1 |
| `dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj` | 1 |
| `intro-bbj/dwc-lesson-result/Sample.bbj` | 2 |
| `intro-bbj/dwc-lesson-start/Sample.bbj` | 2 |
| `intro-bbj/exercises/ResponsiveLoginDialog.bbj` | 2 |
| `intro-bbj/exercises/TicTacToe.bbj` | 1 |
| `intro-bbj/exercises/TicTacToeComputer.bbj` | 1 |
| `intro-bbj/exercises/oo-tic-tac-toe/GameWindow.bbj` | 2 |

## Static findings

These come from reading the code (D-01). Line numbers were checked against docs/examples on 2026-10-10. Where a finding also has runtime evidence, the sentence starts with "Run".

1. **One-argument `replaceAll` in the legacy copy.** `dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj` line 21 reads `url! = bui!.getUrl().replaceAll("apps: webapp")`. `String.replaceAll` takes two arguments. The line sits in the BUI branch, which a DWC run never reaches, so the baseline did not run it. The same block in the other 25 files uses the correct form `replaceAll("apps", "webapp")`.
2. **The BUI-to-DWC relaunch block.** 26 files start with `if info(3,6)="5" then ... getBuiManager() ... getUrl().replaceAll("apps", "webapp") ... urlAction ... setEndAction ... release`: the 25 files that `grep -rlE 'replaceAll\("apps", *"webapp"\)' docs/examples --include=*.bbj` lists, plus `DWCFlexbox.BBj24.bbj` with the broken form from finding 1. None is in chapter 01 or in `intro-bbj`. The block only works when a program is opened in BUI. In DWC the check is false and the block does nothing. This is a design question (Questions for Hyyan, 2): is there a better way to send BUI users to the DWC?
3. **Type check (BBj compiler, 63 files, 0 syntax errors).**
   - `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` lines 47 to 49 and `Exercise-ConvertToCssFlexboxComplete.bbj` lines 36 to 38 read `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")` (and the same for `myCompany!` and `myEmail!`). The compiler says "Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox", 6 findings in 2 files. Run: the programs start and the labels appear, because `setAttribute` still does its work. The three variables are null; a throwaway probe in plan 12 showed that calling a method on one of them stops the program with `!ERROR=252` ("Attempt to invoke method 'setText' on null object"). Nothing in these two files reads the variables again.
   - `dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj` line 24 and `Exercise-MediaQueriesComplete.bbj` line 26 read `css! = new String(Files.readAllBytes(Paths.get(...resolvePath(...))))`. The compiler cannot choose between `String(byte[])` and `String(String)` ("Ambiguous signatures"). Run: both programs load their CSS file, so there is no runtime effect. Four more files use the same statement with an undeclared `fs!` and count as follow-ups.
   - 481 follow-ups of the kind `<undeclared>` (and 1343 warnings) in 37 of the 63 files: most samples do not declare their variables. Four files carry more than 20 each (`DWCFlexbox.bbj` 172, `DWCFlexbox.BBj24.bbj` 127, `DWCGrid.bbj` 78, `CSSCustomProperties.bbj` 27).
4. **External runtime loads (CDN).** Network failures are reported apart from BBj failures; every CDN request was answered in the baseline, so none of the results depends on an outage.
   - Chart.js 3.5.1 from cdnjs: `ChartJS.bbj` line 32, `ChartJS_NoEventFromJS.bbj` line 27.
   - ionicons 6.0.2 from cdnjs: `DownloadButton.bbj` line 55 (the page `07-icon-pools/index.md` names 7.4.0).
   - Shoelace 2.0.0-beta.69 from jsDelivr: `ShoelaceSplitter.bbj` lines 35 and 36. Shoelace 2.20.1 from jsDelivr: `Exercise-EmbedComponentComplete.bbj` lines 25 and 26.
   - Google Fonts: `DWCFlexbox.bbj` lines 469 to 471 and `DWCFlexbox.BBj24.bbj` lines 396 to 398 (see finding 6: the fonts are never fetched).
   - The DWC itself fetches the SVG of every `dwc-icon` from jsDelivr, so any sample with an icon needs the network.
5. **`BBjFileSystem::resolvePath` resolves against the PREFIX** (06.1-HUMAN-UAT gap G-06.1-1). Seven programs read a file through it: `DWCThemer.bbj` line 18, `DWC_ExternalCSS/Sample.bbj` line 16, `Exercise-ThemingSupportComplete.bbj` lines 94 and 95, `DownloadingAFile.bbj` line 14, `Exercise-ButtonTransitionComplete.bbj` line 24, `Exercise-MediaQueriesComplete.bbj` line 26 and `ResponsiveLoginDialog.bbj` line 27. Run: all seven found their file, because the harness registers each program with its own path. That says nothing about a customer machine where the CSS file is not in the PREFIX (Questions for Hyyan, 6).
6. **`injectLinkUrl` gets whole `<link>` tags.** `DWCFlexbox.bbj` lines 469 to 471 and `DWCFlexbox.BBj24.bbj` lines 396 to 398 call `web!.injectLinkUrl("<link rel='preconnect' href='https://fonts.googleapis.com'>", 1)` and two more calls of that form. The documented first argument is a URL; the documented overloads are `injectLinkUrl(url)`, `(url, top)`, `(url, top, attributes)` with attributes such as `rel=stylesheet` (https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/BBjBuiManager_injectLinkUrl.htm). Run: each program makes 3 `<link>` elements with an empty `rel` and the whole tag text as `href`, and no request goes to fonts.googleapis.com or fonts.gstatic.com (31 and 29 requests seen).
7. **Issue mapping.** The earlier planning notes tied issue #4 to the relaunch block. Issue #4 actually links `DWC2.bbj` line 35, a button title that embeds a `dwc-icon`. The report covers #4 as the icon-in-title question (Questions for Hyyan, 1) and the relaunch block as finding 2 (Questions for Hyyan, 2).
8. **Further findings from reading the code.**
   - `dwc/03C_Grid2GridEx/DWCGridSample.bbj` line 69 reads the `TITLE` field twice: `... + "' by " + row!.getFieldAsString("TITLE")`. `GUIGridSample.bbj`, the program it upgrades, shows the artist.
   - `dwc/05_CssLayouts/DWCGrid.bbj` line 236 starts a new rule with `style$ =` where the lines above use `style$ = style$ +`. That drops the rule of lines 226 to 235. Line 232 inside the lost rule is invalid CSS: `gap: var(--dwc-space: 0.5em);`.
   - `DWCFlexbox.bbj` never injects Prism: lines 376, 377, 444 and 445 call `web!.injectStyle(DemoUtils.getFileBytes(dsk("")+dir("")+"prism.min.css",err=*NEXT), ...)`, and `err=*NEXT` hides why the call gives nothing (`prism.min.css` and `prism.min.js` sit next to the program). The cause is not known. `DemoUtils.getFileBytes` takes one string parameter.
   - `ShoelaceSplitter.bbj` lines 44 and 45 call `document.getElementById('...' + top!.getAttribute("id") + ...)`, but nothing sets an `id` on the two child windows (lines 17 and 21). The page tells you to call `setAttribute("id", ...)` first.
   - `Exercise-BuiltInValidationComplete.bbj` line 72 (and the tip that starts at line 78 of `Exercise-BuiltInValidation.bbj`) holds a long email pattern with a typographic apostrophe in the character class. Inside the class the characters `/`, `{`, `|` and `}` are not escaped.
   - `DWCThemer.bbj` lines 7 to 11 say the theme is applied through the `@app-style-bottom` directive, but line 19 uses `injectStyle`, which is why the sample works. The `@see` URL in that comment (`.../#/dwc/attributes-directives`) differs from the one DWC prints (`.../#/dwc/guide/attributes-directives`).
   - Page against file, `intro-bbj/dwc-lesson-start/Sample.bbj`: the page `03-developing-for-the-web.mdx` prints the labels `Vorname:` and `Name:` and the greeting `"Hello "` (lines 16, 18, 30); the downloadable file has `Firstname:` and `Lastname:` (lines 3 and 5) and `"Hallo "` (line 20).
   - `intro-bbj/dwc-lesson-result/Sample.bbj` only adds the class (`addPanelStyle("mypanel")`, line 12). The grid comes from `sample.css`, which the page `08-external-css-file.mdx` registers in Enterprise Manager. Run on its own, the panel is `display: block`.
   - `intro-bbj/exercises/responsive-login.css` line 32 sets `min-height: 100vh` below 600 px. Run: at 599 px and 500 px the card is 848 px tall in an 800 px viewport (the padding adds to the height), so the screen scrolls.

## Draft issues

Each draft groups samples by root cause. The patterns that passed (#4 and #5) get no draft; they are in Notes. Titles are suggestions; edit as you like.

### `setPanelStyle("@element", json)` and `setStyle("@element", json)` have no effect on BBj 26.03 (13 files)

**Affected samples**: every file that applies a `JsonObject` with `setPanelStyle("@element", json!.toString())`, plus two `setStyle("@element", ...)` calls.
- `dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj` line 56, `Exercise-SearchBBjTreeComplete.bbj` line 30, `LabelAttributes.bbj` line 40, `TreeSearch.bbj` lines 38, 51, 70, 78, 92 (and `setStyle` on the trees at lines 105 and 122)
- `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` line 43, `Exercise-ConvertToCssFlexboxComplete.bbj` line 32, `Exercise-ConvertToCssLayout.bbj` line 50, `Exercise-ConvertToCssLayoutComplete-Grid.bbj` line 30
- `dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj` line 38, `Exercise-BuiltInValidationComplete.bbj` line 29, `builtInValidation.bbj` line 52, `formValidation.bbj` line 32, `javaScriptValidation-Required.bbj` line 52

**Observed on BBj 26.03**: 13 of 13 behaviour tests are red and all 13 smoke tests fail with category `console-error`. In every file the window panel (`dwc-window-content`) computes `display: block`, `box-sizing: content-box`, `row-gap: normal`, `padding-top: 0px`, no grid tracks, and has no inline `style` attribute. DWC prints this once per file (`TreeSearch.bbj` seven times): "Starting from BBj v24.00, the style directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. For more information, please refer to the BBjWebManager documentation at https://documentation.basis.cloud/BASISHelp/WebHelp/bui/BBjBuiManager/bbjbuimanager.htm." The per-property form works on the same element: `DWC2.bbj` (`setPanelStyle("display", "inline-grid")` and siblings) leaves the inline style `display: inline-grid; grid-template-columns: 1fr 2fr; gap: 5px; padding: 15px;` on the panel and its oracle test is green; `DWC1.bbj` and `DWCGrid.bbj` use the same form and work. Visible consequences: `Exercise-ConvertToCssFlexboxComplete.bbj` lays its three fields side by side (x 1, 189, 377) instead of in a flexbox column; `Exercise-ConvertToCssLayoutComplete-Grid.bbj` shows the first four labels in one row and its Submit button is 113 px wide at x 658 although `grid-column` computes `1 / 3`, because the panel is not a grid; the five 07 validation forms flow in a row; `LabelAttributes.bbj` has no padding and gap.

**What the page says should happen**: `dwc/06-flow-layouts/91-exercise-css-flexbox.mdx` goal 1 ("Augment the `json!` variable to set the CSS `display` property of the window to `flex`") and `90-exercise-css-grid-layout.mdx` goal 1 ("change the CSS `display` to `grid`"); the `08-control-validation` and `05-dwc-controls` pages show the same `JsonObject` code.

**Related**: extends #7 (https://github.com/BasisHub/Courses/issues/7). The issue names `Exercise-BuiltInValidation.bbj` line 38 and says the pattern runs through the book; this draft adds the full list, the cause and the working alternative.

**Open question**: for Hyyan: what replaces `setPanelStyle("@element", json)` and `setStyle("@element", json)`: per-property `setPanelStyle(name, value)` calls, `BBjWebManager::injectStyle`, or a CSS class added with `addPanelStyle`? All three appear in samples that work on 26.03.

### The attributes directives `@app-style`, `@app-style-bottom` and `@app-theme-switcher` have no effect on BBj 26.03

**Affected samples**:
- `dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj` line 18: `wnd!.setAttribute("@app-style", css!)` (issue #3)
- `dwc/05_CssLayouts/DWCGrid.bbj` line 145: `window!.setAttribute("@app-style", css!)`
- `dwc/04_ExtendedAttributes/TreeSearch.bbj` line 125: `wnd!.setAttribute("@app-style-bottom", ...)`
- `dwc/01_GUI2BUI2DWC/DWC_AppThemes/UserPreference.bbj` line 26: `wnd!.setAttribute("@app-theme-switcher","dark=dark-pure light=light")`

**Observed on BBj 26.03**: all four log, once per file: "Starting from BBj v23.00, the attributes directives are no longer available. Instead, their equivalent can now be found in BBjWebManager. Check the migration guide: https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives". `Sample.bbj`: the program runs to the end and reads `Sample.css`, but 0 of 9 `<style>` elements hold `.mypanel`; the panel with class `mypanel` computes `display: block`, `grid-template-columns: none`, `gap: normal`, `padding: 0px` (the file says `inline-grid`, `1fr 1fr`, `5px`, `15px`); `addPanelStyle("mypanel")` itself works. `UserPreference.bbj`: with the OS emulated light and then dark (`prefers-color-scheme` is false, then true in the page) `data-app-theme` stays null and the background stays `oklch(0.96 0.004 268.858)`. `TreeSearch.bbj`: `--dwc-tree-icon-fill` is empty on both trees (the code sets `#ffa726` and `#64b5f6`) and 0 of 10 style elements hold a `.first-tree` or `.second-tree` rule; search and toggles work. `DWCGrid.bbj`: no visible effect, because its layouts arrive through `injectStyle` (lines 95 and 264); all nine layouts behave as the page says. For contrast, every sample that uses `BBjWebManager::injectStyle` passes (`DWCThemer.bbj`, `CSSCustomProperties.bbj`, `SetStyle.bbj`, `Exercise-ThemingSupportComplete.bbj`), and so does `Themes.bbj` with `setTheme("dark")`.

**What the page says should happen**: `dwc/01-gui-to-bui-to-dwc/03-gui-to-bui-to-dwc.md`, "Method 2: In an external CSS file": the class `mypanel` and a CSS file give the panel the two-column grid. `dwc/02-browser-developer-tools/03-css-custom-properties.md` lists `UserPreference.bbj` as "Follows the client's OS light/dark setting". `dwc/05-dwc-controls/index.md`, Example 1 step 5: the first tree paints its icons orange and the second blue.

**Related**: extends #3 (https://github.com/BasisHub/Courses/issues/3). The issue covers `@app-style` only; the same message and cause apply to the other two directives.

**Open question**: for Hyyan: how should a program attach an app-wide stylesheet, tree icon colours and the OS theme switch on 26.x? Is the basis-next attributes-directives migration guide that DWC prints the current reference? (`DWCThemer.bbj` links the same page without `guide/`.)

### `<bbj-icon>` is not a defined element on BBj 26.03, and `window.BBj.IconsPools` is not the registry DWC reads

**Affected samples**: `dwc/06_IconPools/DownloadButton.bbj` (eight `<bbj-icon>` tags, lines 30 to 32, 42 to 44, 60 and 61; the pool registration on `window.BBj.IconsPools` at line 56) and `dwc/06_IconPools/Exercise-IconPoolsComplete.bbj` (two `<bbj-icon>` tags, lines 30 and 31). The starter `Exercise-IconPools.bbj` has no icons by design and passes.

**Observed on BBj 26.03**: 0 of 8 icons render in `DownloadButton.bbj` (feather 0/2, tabler 0/2, Font Awesome 0/2, ionicons 0/2) and 0 of 2 in `Exercise-IconPoolsComplete.bbj` (tabler 0/1, fa 0/1; the text reads "I like the following sports: and , how about you?"). In the browser `customElements.get('dwc-icon')` is defined and `bbj-icon` is not; the eight elements are inert (box 0 x 19 px, no shadow root, no SVG). The unchanged sample makes 0 SVG requests, so no network problem is involved. The styled variants fail for the same reason: `expanse='l'` and `theme='danger'` change nothing, while the inline `style` values reach the empty elements. A browser-only experiment (a throwaway container in the page, sample file unchanged) wrote the same attributes on `<dwc-icon>` and got feather 2/2, tabler 2/2, Font Awesome 2/2 and ionicons 2/2 once the ionicons resolver was registered on `window.Dwc.IconsPools`; the sample registers it on `window.BBj.IconsPools`, which DWC does not read (`window.Dwc.IconsPools` did not exist in the unchanged page). Network during the experiment: 6 SVG requests to cdn.jsdelivr.net and 2 to cdnjs.cloudflare.com, all HTTP 200. The `DWC2.bbj` icon (`<dwc-icon name='speakerphone'>`) renders.

**What the page says should happen**: `dwc/07-icon-pools/index.md` writes `<dwc-icon pool='feather' name='download'></dwc-icon>` and registers custom pools with `(window.Dwc ??= {}).IconsPools ??= []`, and the exercise page `90-exercise-icon-static-text.mdx` expects the tennis ball and football icons in the static text.

**Related**: extends #6 (https://github.com/BasisHub/Courses/issues/6). This draft gives the cause: the tag name and the registry name.

**Open question**: for Hyyan: is `<dwc-icon>` with `window.Dwc.IconsPools` the official API on 26.x, and was `<bbj-icon>` with `window.BBj.IconsPools` ever supported?

### The email pattern in the Email validation exercise is invalid in Chromium

**Affected samples**: `dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj` line 72 (the solution), the tip in `Exercise-BuiltInValidation.bbj` (starts at line 78), and the page `dwc/08-control-validation/90-exercise-email-validation.mdx`, which shows the same pattern.

**Observed on BBj 26.03**: the browser console says the `pattern` attribute is not a valid regular expression (compiled with the `v` flag: "Invalid character in character class") and ignores it. `abc`, `abc@`, `jane@example` and `jane@@example.com` are all accepted as valid; a valid address submits and shows "Form Submitted Successfully" / "Congrats, you filled in the form successfully!". Goal 1 (the field is required) works. The zip pattern `(\d{5})(-\d{4})?` in the same files compiles and works.

**What the page says should happen**: goal 2 of the exercise page: "Add a pattern validation to the Email field using the provided regular expression."

**Related**: none; this is new. Likely cause: under the `v` flag the characters `/`, `{`, `|` and `}` inside a character class must be escaped.

**Open question**: for Hyyan: does DWC hand `pattern` to the browser unchanged, so the book should ship a `v`-safe expression? Which expression do you recommend?

### ShoelaceSplitter.bbj: the two child windows never reach the splitter

**Affected samples**: `dwc/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj` (child windows at lines 17 and 21, the `getElementById` calls at lines 44 and 45).

**Observed on BBj 26.03**: `sl-split-panel` renders (box 760 x 460 px, divider at y 306), but its only child is the handle icon and its Start and End slots hold 0 elements. The two child windows are `dwc-panel` elements with `slot="start"` and `slot="end"` that sit in `dwc-window-content`, outside the splitter, and neither has an `id` attribute; their buttons are at y 58 and 95. DWC swallows the script error: no page error, no console error and no failed request (jsDelivr: 135 requests, all answered). A browser-only probe that appended the two panels to the splitter by hand put them in the Start area (y 78) and the End area (y 310).

**What the page says should happen**: `dwc/10-embedding-components/index.md`, "Example for Slots: a Splitter Component from Shoelace": "The result is a splitter with two child windows, each hosting a full-size button", and "If you want to use `getAttribute("id")`, call `setAttribute("id", "your id here")` first."

**Related**: none.

**Open question**: for Hyyan: does `setAttribute("id", ...)` on a child window give the DWC panel an `id` on 26.03, or is there another supported way to get the element of a child window?

### Exercise-MediaQueriesComplete: `--dwc-font-size` changes below 600 px, the text does not get smaller

**Affected samples**: `dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj` and its `Exercise-MediaQueriesComplete.css` (line 28: `--dwc-font-size: var(--dwc-font-size-s);` inside `@media (width < 600px)`).

**Observed on BBj 26.03**: the layout part works (1024 and 600 px: two columns and the Company field; 599 and 500 px: one column, the field hidden). The font does not change: label, edit box and panel compute 14px at 1024 px and at 500 px, while `--dwc-font-size` on the panel is 0.875rem at 1024 and 0.8125rem at 500. A browser-only experiment with `font-size: var(--dwc-font-size)` on the panel made the label 13px at 500 px.

**What the page says should happen**: `dwc/11-advanced-responsive/90-exercise-media-queries.mdx`: below 600 px the form switches to one column, hides the optional Company field and "uses a smaller font" (the example changes `--dwc-font-size`).

**Related**: 06.1-HUMAN-UAT test 4 recorded this exercise as passing by hand; a 1 px change is hard to see, and here it does not apply at all.

**Open question**: for Hyyan: does the DWC apply `--dwc-font-size` to its controls, or does the CSS need `font-size: var(--dwc-font-size)` on the container?

### DWCGridSample.bbj names the song title where the artist belongs

**Affected samples**: `dwc/03C_Grid2GridEx/DWCGridSample.bbj` line 69.

**Observed on BBj 26.03**: after you click the first row (CD 000001, "Mississippi Blues", artist "John Hurt & The Ramblers") the program shows "You selected 000001: 'Mississippi Blues' by Mississippi Blues". Line 69 reads the `TITLE` field twice. `GUIGridSample.bbj`, the program this one upgrades, shows "by John Hurt & The Ramblers". The grid itself works (28 of 47 rows in the DOM, `aria-rowcount` 48).

**What the page says should happen**: no page text prints the sentence; `dwc/04-upgrading-apps/02-upgrading-grids.md` lists "Adapt event handling" and "Test thoroughly" as migration steps, and the program being upgraded names the artist.

**Related**: none. This looks like a plain typo (`ARTIST` instead of the second `TITLE`).

**Open question**: none for Hyyan.

### DWCGrid.bbj loses the .winSelectCSS and .winCSSPreview rules

**Affected samples**: `dwc/05_CssLayouts/DWCGrid.bbj` line 236 (and line 232 inside the lost rule).

**Observed on BBj 26.03**: line 236 reads `style$ =          ".winDemo {"` where the lines above use `style$ = style$ + ...`, so the rule of lines 226 to 235 is replaced. The behaviour test records that no style element holds the `.winSelectCSS` rule. A probe in plan 12 found the two list and preview windows as `display: block` instead of the flex columns the code describes. The demo still works and all nine layouts behave as the page says. Line 232 also has `gap: var(--dwc-space: 0.5em);`, which is invalid CSS.

**What the page says should happen**: the comment at line 225 of the program ("Define custom CSS styles for the windows. Note that we're using selectors that match the custom class that we added to each window.").

**Related**: none.

**Open question**: none for Hyyan.

### The exercise starters and solutions assign the void result of `setAttribute` to an edit box variable

**Affected samples**: `dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` lines 47 to 49 and `Exercise-ConvertToCssFlexboxComplete.bbj` lines 36 to 38: `myName! = window!.addEditBox("Joe Blow").setAttribute("label", "Name:")`.

**Observed on BBj 26.03**: the compiler reports 6 findings "Autocast will always fail on assignment from void to com.basis.bbj.proxies.sysgui.BBjEditBox". At runtime the window opens, no `!ERROR` appears and the three labels (Name:, Company:, Email:) and values show, because `setAttribute` still does its work. The variables are null; a probe that copied the statement stopped with `!ERROR=252 Attempt to invoke method 'setText' on null object` as soon as it used the variable. Nothing in these files uses the variables, so nothing breaks today.

**What the page says should happen**: `dwc/06-flow-layouts/91-exercise-css-flexbox.mdx`, goal 4: the program "chains the `BBjControl::setAttribute()` method to give each edit box a label in one line of code", with the same statement as the example.

**Related**: none.

**Open question**: for Hyyan: `setAttribute` returns void, so the variable cannot hold the control. Is the chain meant to be taught as a pattern, or should the book add the control to a variable first and call `setAttribute` on it?

### `DWCFlexbox.bbj` and `DWCFlexbox.BBj24.bbj` pass whole `<link>` tags to `injectLinkUrl`, and Prism never loads

**Affected samples**: `dwc/05_CssLayouts/DWCFlexbox.bbj` lines 469 to 471 (and 376, 377, 444, 445 for Prism) and `DWCFlexbox.BBj24.bbj` lines 396 to 398.

**Observed on BBj 26.03**: each program makes 3 `<link>` elements with an empty `rel` and the whole tag text as `href` (`<link rel='preconnect' href='https://fonts.googleapis.com'>` and two more); of 31 and 29 requests, none goes to fonts.googleapis.com or fonts.gstatic.com, so Inconsolata and Ubuntu Mono never load. Nothing visible depends on them (the CSS uses `--dwc-font-family-mono`). Separately, `DWCFlexbox.bbj` shows its code in the Layout Information dialog with 0 syntax-highlighting tokens and `window.Prism` undefined; the `injectStyle` and `injectScript` calls carry `err=*NEXT`, which hides why. Both flexbox tests are green (the options and the Show CSS dialog work as the page says).

**What the page says should happen**: the header comment of both programs says they use Prism.js "to add syntax highlighter to the BBj and CSS code samples"; the documented first argument of `injectLinkUrl` is a URL, not a tag.

**Related**: none.

**Open question**: for Hyyan: should training samples load Google Fonts at all, or drop the three calls? Is the Prism failure expected?

Ready for Eric to post. Nothing was posted to GitHub in this phase.

## Questions for Hyyan

1. **Issue #4 (icon in a button title).** `DWC2.bbj` line 35 builds the button text as `<html>Say Hello <dwc-icon name='speakerphone'></dwc-icon></html>`. On 26.03 this works: the icon is a light-DOM child of the `dwc-button`, 26 x 26 px, with its SVG drawn, and DWC adds `pool="tabler"`, `expanse="xs"` and `theme="default"` itself. Is there a better way in modern DWC, for example through the `prefix` or `suffix` slot of `dwc-button`? Does BBj expose one of them?
2. **The BUI-to-DWC relaunch block.** 26 samples start with `if info(3,6)="5" then ... getBuiManager() ... getUrl().replaceAll("apps", "webapp") ... urlAction ... setEndAction ... release`. What is the recommended way today to send BUI users to the DWC, if the block should stay at all? (The planning notes first tied issue #4 to this block; see Static findings, 7.)
3. **Issue #5 (`--dwc-space`).** On 26.03 `--dwc-space` resolves to `0.5rem`, the same as `--dwc-space-s`, and the old `--bbj-space` is empty. The whole `--dwc-space-*` scale resolves (3xs 0.0625rem up to 3xl 2rem). Is `--dwc-space` still the token to use, or should samples use the `--dwc-space-*` scale?
4. **Issue #7 (`setPanelStyle("@element", json)`).** Is it supported in BBj 26? The DWC says the style directives are gone since v24.00 and points at BBjWebManager. What replaces it: per-property `setPanelStyle(name, value)`, `injectStyle`, or CSS classes? Does `setStyle("@element", json)` on controls (`TreeSearch.bbj` lines 105 and 122) fall under the same rule?
5. **Issue #3 (`@app-style`).** What replaces `wnd!.setAttribute("@app-style", css!)` for app-wide CSS, and `@app-style-bottom` and `@app-theme-switcher`? The theme switch works with `BBjWebManager::setTheme("system")` per the page; is that the answer for `UserPreference.bbj`?
6. **`resolvePath` and the PREFIX.** `BBjFileSystem::resolvePath` resolves against the PREFIX. All seven samples that use it found their file in this baseline, but a customer install may not have the program folder in the PREFIX. How should a sample find a CSS file that sits next to the program?
7. **`<bbj-icon>` against `<dwc-icon>` (#6).** Two samples write `<bbj-icon>` and register custom pools on `window.BBj.IconsPools`; the page and DWC use `<dwc-icon>` and `window.Dwc.IconsPools`. Is the `dwc-` form with `window.Dwc.IconsPools` the official 26.x API, and was the `bbj-` form ever supported?
8. **`DWCFlexbox.BBj24.bbj`.** It is a legacy copy of `DWCFlexbox.bbj` (no CSS Preview window, a one-argument `replaceAll` on line 21 in the BUI branch). Keep it at all, or drop it?
9. **CDN and Google Fonts in training samples.** Samples load Chart.js and ionicons from cdnjs, Shoelace from jsDelivr, and (broken, see Static findings, 6) Google Fonts. Is that acceptable for a training book, or should the samples ship local files or drop the fonts? Is a course on a machine without internet access a case we must support?
10. **`injectLinkUrl` with whole tags.** `DWCFlexbox.bbj` and its copy pass `<link ...>` tags as the URL, so three useless `<link>` elements appear and nothing is fetched. Was a whole tag ever accepted as the first argument, or is `injectLinkUrl(url, top, "rel=stylesheet")` the only form?
11. **Declared variables.** The type check gives 481 `<undeclared>` follow-ups in 37 of 63 files, because the samples do not declare their variables. Should the training samples declare them (`declare auto ...`) or keep the short style?
12. **The attributes-directives migration guide.** DWC prints `https://basishub.github.io/basis-next/#/dwc/guide/attributes-directives`; `DWCThemer.bbj` links `https://basishub.github.io/basis-next/#/dwc/attributes-directives`. Is the `guide` page the current reference the book should link?
13. **Email pattern.** The pattern from the exercise is rejected by Chromium's `v` flag (characters such as `/`, `{`, `|` and `}` inside the class need escaping). Which expression do you recommend, and does DWC pass `pattern` to the browser unchanged?
14. **Child window ids.** `ShoelaceSplitter.bbj` needs the DOM element of a child window. The two DWC panels have no `id` attribute and the sample never calls `setAttribute("id", ...)`. Does that call work on a child window in 26.03, or is there another supported way?
15. **`setAttribute` and chaining.** `BBjControl::setAttribute` returns void, so `myName! = window!.addEditBox(...).setAttribute(...)` leaves `myName!` null. Is chaining meant to be a taught pattern?
16. **Media query font.** Does DWC apply `--dwc-font-size` to its controls, or does a rule such as `font-size: var(--dwc-font-size)` have to be in the CSS? (`Exercise-MediaQueriesComplete.css` sets only the property.)

## Harness notes

### Self-test controls

| Control | Expected | Observed | Reasons |
| --- | --- | --- | --- |
| known-good | pass | pass |  |
| known-broken | fail | fail | `bbj: !ERROR=252 No match for method jdk.proxy2.$Proxy165.noSuchMethod() at line 4: st!.noSuchMethod()` |
| known-print | pass | pass |  |
| known-missing-css | fail | fail | `network-local: 404 http://localhost:8888/courses-fixture-does-not-exist.css` |

### Results with harness issues

none

### Ignored noise patterns

none

### Baseline harness failures

none

### Notes

- **What one baseline runs.** Compile pass of all 63 files (about 2 minutes), unit and coverage tests, the self-test of the four control programs and the wrapper (15 tests, about 2 minutes), 59 smoke tests, 106 behaviour tests (105 write a result file; one only compares the issue #7 table with the manifest), the completeness check, the leftover check and the report. A full run took 30 to 55 minutes (run 1: 30 min 39 s; run 2: 28 min 25 s and run 3: 52 min 38 s up to the report step), within the 60 to 90 minutes the plan allowed. Smoke runs one program every 20 seconds; the Admin API calls of the test fixture take about 13 seconds of that.
- **Baseline history.** Run 1 had no harness failure and two red behaviour results that were not findings: the `DWC2.bbj` issue #4 test read the icon's SVG once, before DWC had fetched it from the CDN, while `iconReport` a moment later found the icon rendered; and the `EventMapSample.bbj` test clicked "click me" before the sample's `ON_PAGE_LOADED` callback had injected its function and listeners. Both are timing bugs in the tests. They passed on three and two reruns after the fix (commit `ae44d4f`) and are green in every later run. Run 2 passed every test stage and then failed at the report step, because Windows refused to rename the temporary report over the old file (`EPERM`); the report writer then retried the rename (commit `f81ddaa`). Run 3 (52 min 38 s up to the report step) gave exactly the same counts as run 2 and failed at the same step: a process kept the old report open without delete sharing, so even ten retries could not rename over it, while writing into the file worked. The report writer now falls back to writing the file in place (commit `4b4d846`). The final run (run 4) produced this report.
- **Flaky results seen earlier, not in the final baseline.** `SysPrint.bbj` failed smoke once in plan 09 (no window, console or dialog within 30 seconds) and has passed in every run since (dialog after 0.9 to 1.9 seconds). The browser error `e.componentOnReady is not a function` appears now and then, each time on a different sample and never twice on the same one: `DWC2.bbj` in the first spike, `CSSCustomProperties.bbj` in the plan 09 smoke run, and `Exercise-ConvertToCssFlexbox.bbj` in the final run 4 (there together with `e.setCursorPos is not a function`; that sample fails for its missing flexbox anyway). Runs 2 and 3 had no page error at all. It looks like a timing race inside the DWC client, not a fault of the samples; worth a question to the DWC team if it shows up in customer apps. The causes are not known.
- **Issues whose evidence passed.** Issue #4 (the speakerphone icon in the `<html>` title renders: `iconReport` total 5, rendered 1, missing 0, with 4 hidden icons that DWC owns) and issue #5 (`--dwc-space` resolves to `0.5rem`; the sample's missing spacing is issue #7, not the token) have no draft issue. Both stay as questions for Hyyan.
- **Reading the "Icons" column.** `rendered/total` counts DWC's own hidden icons (for example the chevrons of a collapsed element) in the total, so `0/16` on a program without icons of its own is not a finding. Only visible icons that do not draw count as missing.
- **Green results that still carry a remark.** `Exercise-ConvertToCssLayoutComplete-Grid.bbj` is red for the missing grid, not for its validation: Submit with empty names gives "Invalid Input", with first and last name filled "Form Submitted Successfully". `BBjFileChooserUpload.bbj` cannot be driven through "Select Files...": `dwc-upload` calls `window.showOpenFilePicker`, which Playwright's file chooser interception aborts, so the tests drop files on the control (that works, each upload shows its message box). `SysPrint.bbj` delivers its PDF to a second browser page (one request for `/printServlet/job<n>.pdf`, status 200), then shows "done!". `DownloadingAFile.bbj` offers `BBj.properties` as `BBj.properties.txt` (24806 bytes); the content is never read or stored. The BBjGridExWidget logs four AG Grid Enterprise warnings per run (`enableRowGroup`, `rowGroup`, `enablePivot`, `enableValue`); 12 `console-warning` entries in all, warnings only. In `TicTacToeComputer.bbj` the Random strategy lost one game in a run, so the test asserts a result, not a winner; MinMax did not lose in four deterministic games, which is a sample of games and no proof.
- **Harness limits.** The WebCUI console is read from the xterm terminal object that DWC keeps on `.dwc-console__xterm` (an undocumented internal; the console header holds the license serial number, which is why raw console text and screenshots stay local). `BBjHTMLView` content is part of the page, not an iframe. A test cannot tell a CDN outage from a BBj failure unless it watches the network, so the Chart.js and Shoelace tests turn a missing component with a failed CDN request into `blocked`; none was needed. Title mismatches would be warnings (none occurred), and the console is allowed on every app. Notes in a result are cut at 200 characters and the evidence at 700, so long DWC messages are quoted in these notes instead. Only 3 BBJ and 2 WEBCUI licenses exist, so a baseline cannot run while anyone else opens BBj sessions.
- **Screenshots.** Light and dark screenshots of every program and one per failing test are in `tools/sample-test/results/screenshots` on the machine that ran the baseline. They are not committed, and no screenshot baselines are stored yet; they become visual tests once you have looked at them and approved them.
- **Not covered.** Closing a window with its close button or the Escape key (06.1-HUMAN-UAT test 8 names it for the login dialog); BUI (D-01); other browsers (D-02); the `BBj24` BUI branch and the relaunch block.
