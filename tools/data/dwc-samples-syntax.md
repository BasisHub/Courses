# DWC samples: BBj syntax check

Baseline of `bbj_check_syntax` results for every `.bbj` sample under `docs/examples/dwc/`, recorded for Phase 7 QUAL-03 (D-20).

Checker: BBj Documentation MCP `bbj_check_syntax`, hosted check, stock BBj 26.03 (no bbj-local check registered). Source build: bbj-docs · hosted · docs 2026-09-21 · fd516a9d. Checked 2026-10-03, one call per file with the file content passed verbatim.

Pass: 48. Fail: 1. Not checkable: 0. Total: 49.

Failing samples are not edited in Phase 4. Phase 7 QUAL-03 fixes them ("fix the sample, not the check"). The CLAUDE.md rule "every .bbj under docs/examples/ passes bbj_check_syntax" therefore holds only from Phase 7.

The hosted check parses the code with a stock BBj; it does not resolve PREFIX, classpath or `use` targets, so a pass means the file parses, not that it runs.

Phase 6.1 added five exercise solutions, checked at plan 06.1-07 after reading bbj://primer; the raw results are in .planning/phases/06.1-exercise-solutions-and-restored-screenshots/06.1-bbj-syntax-raw.tsv.

| File | Result | Detail |
|------|--------|--------|
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC_AppThemes/Themes.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC_AppThemes/UserPreference.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC_ExternalCSS/Sample.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC1.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC2.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/GUISample.bbj` | pass | - |
| `docs/examples/dwc/01_GUI2BUI2DWC/MessageBox.bbj` | pass | - |
| `docs/examples/dwc/02_CSSStylesAndCustomProperties/CSSCustomProperties.bbj` | pass | - |
| `docs/examples/dwc/02_CSSStylesAndCustomProperties/Exercise-ThemingSupportComplete.bbj` | pass | - |
| `docs/examples/dwc/02_CSSStylesAndCustomProperties/SetStyle.bbj` | fail | line 13, col 1: syntax error (SyntaxError); 1 error |
| `docs/examples/dwc/03B_ArcFiles/ArcSample.bbj` | pass | - |
| `docs/examples/dwc/03B_ArcFiles/DWCArcSample.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/DataRow_and_ResultSet/1_DataRowFromCode.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/DataRow_and_ResultSet/2_DataRowFromTemplate.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/DataRow_and_ResultSet/3_ResultSetCreation.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/DataRow_and_ResultSet/4_BBjGridExWidget.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/DWCGridSample.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/GUIGridSample.bbj` | pass | - |
| `docs/examples/dwc/03C_Grid2GridEx/Exercise-BBjGridExWidgetComplete.bbj` | pass | - |
| `docs/examples/dwc/04_ExtendedAttributes/Exercise-SearchBBjTree.bbj` | pass | - |
| `docs/examples/dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj` | pass | - |
| `docs/examples/dwc/04_ExtendedAttributes/LabelAttributes.bbj` | pass | - |
| `docs/examples/dwc/04_ExtendedAttributes/TreeSearch.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/DWCFlexbox.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/DWCFlexbox.BBj24.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/DWCGrid.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/Exercise-ConvertToCssFlexbox.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/Exercise-ConvertToCssFlexboxComplete.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/Exercise-ConvertToCssLayout.bbj` | pass | - |
| `docs/examples/dwc/05_CssLayouts/Exercise-ConvertToCssLayoutComplete-Grid.bbj` | pass | - |
| `docs/examples/dwc/06_IconPools/DownloadButton.bbj` | pass | - |
| `docs/examples/dwc/06_IconPools/Exercise-IconPools.bbj` | pass | - |
| `docs/examples/dwc/06_IconPools/Exercise-IconPoolsComplete.bbj` | pass | - |
| `docs/examples/dwc/07_ControlValiation/builtInValidation.bbj` | pass | - |
| `docs/examples/dwc/07_ControlValiation/Exercise-BuiltInValidation.bbj` | pass | - |
| `docs/examples/dwc/07_ControlValiation/Exercise-BuiltInValidationComplete.bbj` | pass | - |
| `docs/examples/dwc/07_ControlValiation/formValidation.bbj` | pass | - |
| `docs/examples/dwc/07_ControlValiation/javaScriptValidation-Required.bbj` | pass | - |
| `docs/examples/dwc/08_BrowserConstraints/BBjFileChooserUpload.bbj` | pass | - |
| `docs/examples/dwc/08_BrowserConstraints/DownloadingAFile.bbj` | pass | - |
| `docs/examples/dwc/08_BrowserConstraints/SysPrint.bbj` | pass | - |
| `docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS_NoEventFromJS.bbj` | pass | re-checked 2026-10-04 after WR-09 fix |
| `docs/examples/dwc/09_EmbeddingOtherComponents/ChartJS.bbj` | pass | re-checked 2026-10-04 after WR-09 fix |
| `docs/examples/dwc/09_EmbeddingOtherComponents/Exercise-EmbedComponentComplete.bbj` | pass | - |
| `docs/examples/dwc/09_EmbeddingOtherComponents/EventMapSample.bbj` | pass | - |
| `docs/examples/dwc/09_EmbeddingOtherComponents/ShoelaceSplitter.bbj` | pass | - |
| `docs/examples/dwc/10_AdvancedResponsive/Exercise-ButtonTransitionComplete.bbj` | pass | - |
| `docs/examples/dwc/10_AdvancedResponsive/Exercise-MediaQueriesComplete.bbj` | pass | - |

Line 13 of `SetStyle.bbj` reads `url! = bui!.getUrl().replaceAll("apps: webapp;` (string literal and call left unclosed).
