---
phase: 06-exercises-dwc-gap-audit
plan: 03
subsystem: content-audit
tags: [audit, dwc, moodle, gap-audit]
requires: [06-01, 06-02]
provides:
  - audit fragments for 14 light units (0P, 0R, 3A, 3B1 to 3B4, 8A, 8B, 9A to 9C, 10A, 10B)
  - 15 kept BBj snippets awaiting bbj_check_syntax (06-09)
affects: [06-09, 06-10, 06-14, 06-15]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/audit/01-0P.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/02-0R.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/10-3A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/11-3B1.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/12-3B2.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/13-3B3.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/14-3B4.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/19-8A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/20-8B.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/21-9A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/22-9B.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/23-9C.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/24-10A.md
    - .planning/phases/06-exercises-dwc-gap-audit/audit/25-10B.md
metrics:
  tasks: 2
  files: 29
  completed: 2026-10-04
---

# Phase 6 Plan 03: Light-unit gap audit Summary

Verdict tables (keep, covered, drop) for 14 light Moodle units against the DWC pages, with 15 kept BBj snippets saved verbatim for the syntax check; `check-dwc-phase6.py audit --fragment` passes on all 14 fragments (1348 checks, 0 failed).

## Verdict counts per unit

| Unit | Module | keep | covered | drop |
|------|--------|------|---------|------|
| 0P | book_56 | 0 | 16 | 15 |
| 0R | page_57 | 0 | 18 | 4 |
| 3A | page_66 | 1 | 6 | 1 |
| 3B1 | book_67 ch 36 | 2 | 4 | 1 |
| 3B2 | book_67 ch 37 | 5 | 0 | 0 |
| 3B3 | book_67 ch 38 | 20 | 0 | 1 |
| 3B4 | book_67 ch 39 | 5 | 0 | 1 |
| 8A | page_78 | 4 | 1 | 3 |
| 8B | page_79 | 5 | 0 | 2 |
| 9A | page_80 | 14 | 0 | 3 |
| 9B | page_81 | 7 | 0 | 2 |
| 9C | page_82 | 8 | 0 | 1 |
| 10A | page_117 | 1 | 7 | 1 |
| 10B | page_120 | 1 | 4 | 2 |

## Kept BBj snippets (snippets/)

3B3-07, 3B3-11, 3B3-15, 3B3-19, 3B4-02, 8B-02, 9A-04, 9A-05, 9A-09, 9A-11, 9A-13, 9A-15, 9B-04, 9B-07, 9C-06.

Notes for 06-09 (saved verbatim, so source errors are still in them):
- 3B3-07 and 3B3-11: the second `getFieldAsString("LAST_NAME")` should read FIRST_NAME; 3B3-07 also has a malformed `DATE(...)` call.
- 9A-04: `<<body>` typo. 9A-05: broken line `js$ = js" + ...`. 9A-09: stray `</head>`.
- 9B-04 is a fragment of js$ lines, not a standalone program (likely needs wrapping).
- Extraction: `<pre>` text was HTML-unescaped, `<br>` turned into newlines, links flattened to their text; the drafts had lost line breaks in the 3B code blocks, so the snippets were re-extracted from the backup XML.

## Decisions

- Course navigation, old hosts (DWCTraining, basis-next, documentation.basis.com, Google Drive and Docs, elearning.basis.com) are drop; live documentation.basis.cloud, BBj-Plugins, basishub.github.io/components, MDN and Shoelace links are keep or covered.
- Images: 4 covered by hash (3A x2, 8A, 10A); 2 keep (9C, Shoelace split panel and the splitter result); 2 drop for personal data (8B PDF viewer with author e-mail addresses, 8B Jasper report with customer names and addresses); `iconInfoLogo.png` drop, not in backup.
- 9A to 9C and 8A/8B are mostly keep: the DWC pages show code that does not match the Moodle text (for example `web!.download`, `web!.injectUrl`, `addFileChooser()`). This plan does not verify those DWC fences; 06-14/06-15 and 06-09 should check them with `bbj_lookup` when applying the kept material.
- New headings named in Reasons: "Install the Plug-In", "Working with ResultSet and DataRow", "Set Up a Simple BBjGridExWidget" (02-upgrading-grids.md); "Using the BBjHTMLView to Embed Third-Party Components", "Example for Slots: a Splitter Component from Shoelace" (10-embedding-components/index.md). No new sub-pages. 10-embedding-components has no `img/` folder yet; the kept 9C screenshots need one.
- I did not call `bbj_check_syntax` or `bbj_lookup`; the plan hands that to 06-09 and the final `bbj_check_syntax:` Reason suffix is added there.

## Deviations from Plan

**1. [Rule 3 - Blocking] Worktree base reset.** The worktree started on an older commit than the required base; I ran the prescribed `git reset --hard 14283b3` (branch was already `worktree-agent-*`) before any work.

Otherwise: plan executed as written. Two over-long Excerpt cells (8A-03, 9A-07) were shortened after the checker flagged them.

## Known Stubs

None.

## Commits

- 399f323: docs(06-03): audit S0 and S3 units
- 7e3af37: docs(06-03): draft gap audit verdicts for S0, S3, S8 to S10

## Self-Check: PASSED

All 14 fragments and 15 snippet files exist and are committed; both commit hashes found in `git log`.
