---
phase: 05-intro-bbj-conversion
plan: 05
subsystem: content
tags: [intro-bbj, hand-edits, vale, link-map]
requires:
  - phase: 05-04
    provides: generated intro-bbj book (C2)
provides:
  - tools/data/intro-bbj-link-map.json (6 dead URLs mapped)
  - commit C3 (hand edits) and C4 (Vale and typos)
affects: [05-06]
key-files:
  created: [tools/data/intro-bbj-link-map.json]
  modified: [docs/docs/intro-bbj/**]
key-decisions:
  - "D-27 Theme Editor link is us.bbx.kitchen/webapp/DWCThemer, review true"
  - "Unverifiable dwc.style bbj-button route falls back to parent #/dwc/ (404 on bbj-button.md)"
requirements-completed: []
duration: 25min
completed: 2026-10-04
---

# Phase 5 Plan 05: Hand edits and Vale clean-up Summary

Dead links mapped and replaced, Moodle wording and feedback page rewritten (C3), then Vale error level cleared to zero with typos fixed (C4).

## Commits
- C3 `55ae581`: docs(05-05): replace Moodle-isms, feedback page and dead links in intro-bbj
- C4 `cac3202`: fix(05-05): clear Vale errors and typos in intro-bbj (D-13)

## Link map evidence
- eclipseplug-ins -> https://basis.cloud/eclipseplug-ins/ (200)
- basis-next `#/dwc/` -> https://dwc.style/docs/#/dwc/ (dwc/README.md 200)
- `#/dwc/bbj-button?id=shadow-parts` -> https://dwc.style/docs/#/dwc/ (bbj-button.md 404, parent fallback, anchor dropped)
- `#/dwc/themes?id=enable-dark-theme` -> https://dwc.style/docs/#/theme-engine/themes?id=automatically-enable-dark-mode (dwc/themes.md 404; theme-engine/themes.md 200 with matching heading)
- `#/theme-engine/` -> https://dwc.style/docs/#/theme-engine/ (200)
- hot.bbx.kitchen DWCThemeEditor -> https://us.bbx.kitchen/webapp/DWCThemer (200), review true, provisional per D-27

## Edits
- contribute.mdx now points to GitHub issues; mentoring offer, mailing list and Google Doc removed.
- Files-Section/Save as sentences point to download links; September 2021 clause and chapter 28 placeholders removed; manager or mentor advice kept; exercise pages had no due date or grading text.
- Vale: 35 error findings fixed with minimal wording (quote punctuation, file names in inline code, "BBj does everything else" for the REST term hit, link text for MDN, one exclamation). Typos fixed. No vocabulary or rule change, no em dash, no code fence content or video titles touched.

## Verification
- `tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj`: exit 0
- `check-intro-bbj.py structure`, `content`, `edits` (572 checks): 0 failed
- `npm run build`: passed

## Denied commands (orchestrator or Stephan to run)
- `bash tools/verify-phase2.sh --local` (Task 3 gate: whole-tree Vale section must pass). The compound command that contained it was denied by the permission system; not retried.

## Deviations from Plan
- Small extra edit: lowercase "files section" in 04-oo-dialog.mdx reworded to "the download" (same D-15 intent).
- contribute.mdx dropped the "work in progress" phrase I first wrote, to satisfy the plan grep.

## Known Stubs
None.

## Self-Check: PASSED
