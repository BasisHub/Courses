Synthetic notes for the report tests. Text before the first H2 heading is ignored.

## Static findings

- `DWC2.bbj` line 35 builds a button title from HTML with an embedded `dwc-icon`.
- Thirteen samples call `setPanelStyle("@element", ...)`; the call needs a runtime check.

### Sub-heading inside a note section

Plain text with a pipe | character stays as written.

## Draft issues

### Draft: component is not ready on DWC2

Title: `e.componentOnReady is not a function` on DWC2.

1. Open DWC2 in the DWC.
2. Read the browser console.

## Questions for Hyyan

1. Does the license model allow a second DWC session per program?
2. Is `@app-style` still supported on a window in BBj 26.03?

## Notes

The license-leak result on DWC2 came from a leftover session of the previous run.
