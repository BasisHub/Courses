---
phase: 04-dwc-book-relocation
plan: 04
subsystem: samples
tags: [samples, bbj, syntax-check, mcp, baseline]
requires:
  - docs/examples/dwc/ (04-02)
provides:
  - tools/data/dwc-samples-syntax.md (D-20 baseline for Phase 7 QUAL-03)
affects: [07 QUAL-03]
tech-stack:
  added: []
  patterns: [incremental MCP checkpoint TSV, one bbj_check_syntax call per file]
key-files:
  created:
    - tools/data/dwc-samples-syntax.md
  modified: []
key-decisions:
  - "Checker: hosted bbj_check_syntax (stock BBj 26.03); no bbj-local check registered"
  - "Report notes that a pass means the file parses; the hosted check resolves no PREFIX, classpath or use targets"
requirements-completed: []
duration: 40min
completed: 2026-10-03
---

# Phase 4 Plan 04: DWC samples BBj syntax baseline Summary

All 44 DWC `.bbj` samples went through `bbj_check_syntax` once each: 43 pass and 1 fails (`02_CSSStylesAndCustomProperties/SetStyle.bbj`, line 13). The results are recorded per file in `tools/data/dwc-samples-syntax.md`, and no sample was changed.

## Tasks

1. Files 1 to 22 checked through the BBj Documentation MCP (hosted check, stock BBj 26.03). Each result was appended to the checkpoint TSV right after its call. 21 pass, 1 fail (SetStyle.bbj: "syntax error" at line 13, col 1). The Task 1 verify printed OK. No commit.
2. Files 23 to 44 checked the same way: all 22 pass, including the two large files DWCFlexbox.bbj (30 KB) and DWCFlexbox.BBj24.bbj (24 KB) and the three non-ASCII files in 07_ControlValiation. The Task 2 verify printed OK. No commit.
3. Report written from the checkpoint only. The checkpoint was deleted and never staged. Commit c2bcf7a.

## Results

Pass: 43. Fail: 1. Not checkable: 0. Total: 44.

- Fail: `docs/examples/dwc/02_CSSStylesAndCustomProperties/SetStyle.bbj`, line 13, col 1, "syntax error". Line 13 is `url! = bui!.getUrl().replaceAll("apps: webapp;`, which leaves a string literal and a call unclosed. QUAL-03 handles it in Phase 7.
- Note: `DWCFlexbox.BBj24.bbj` line 21 has `replaceAll("apps: webapp")`, which parses as a one-argument call and passes. The syntax check cannot catch it, but it is probably the same typo. Worth a look in QUAL-03.

MCP identity footer: bbj-docs · hosted · docs 2026-09-21 · fd516a9d

## Deviations from Plan

1. **[Rule 3 - Blocker workaround] `bbj://primer` was not read.** This session has no MCP resource-reader tool (ToolSearch for ReadMcpResourceTool found nothing), and `bbj_fetch_page` rejects the `bbj://primer` URI. The MCP itself answered every call (footer above). This plan only parses existing samples and writes no BBj code, so the check went ahead without the primer. Files modified: none.
2. **[Rule 1 - Bug] File 23 was first sent incomplete.** DWCFlexbox.bbj has 679 lines and no final newline. Reading it with `sed -n '1,678p'`-style ranges dropped the last line (`use java.util.Arrays`). I caught this while diffing file 24 against it, removed the checkpoint line, and checked the full file again (pass). Only the full-content result is recorded. Later chunked reads used `$` as the range end.

**Total deviations:** 2 (1 blocker workaround, 1 self-caught bug). **Impact:** none on the results; every recorded result comes from a call with the exact file content.

## Verification

- Task 1 and Task 2 automated verifies: OK.
- Task 3 automated verify: OK (44 rows, `Total: 44`, Phase 7 note, no em dash, checkpoint gone and never tracked, `git diff --quiet docs/examples/dwc` exits 0).

## Deferred / downstream

- DWC-03 stays Pending: download links land in 04-05.
- The CLAUDE.md rule "every .bbj under docs/examples/ passes bbj_check_syntax" holds only after QUAL-03 fixes SetStyle.bbj.

## Known Stubs

None.

## Self-Check: PASSED
