---
phase: 06-exercises-dwc-gap-audit
plan: 02
subsystem: audit-tooling
tags: [moodle, audit, prefill, sha1]
requires: []
provides:
  - prefill script with units, exercises and screenshots subcommands
  - snippets/EX73-01.bbj for the 06-09 BBj check
  - local drafts under import/work (25 units, 11 assignments, images.tsv)
affects: [06-03, 06-04, 06-05, 06-06, 06-07, 06-08, 06-11, 06-16]
key-files:
  created:
    - .planning/phases/06-exercises-dwc-gap-audit/prefill/dwc_gap_prefill.py
    - .planning/phases/06-exercises-dwc-gap-audit/snippets/EX73-01.bbj
decisions:
  - Image names from absolute pluginfile.php URLs are reduced to the basename before lookup; external hosts resolve as unresolved
  - Images and links inside bold-only sub-heading paragraphs are kept as items (0P image was lost otherwise)
metrics:
  tasks: 2
  completed: 2026-10-04
---

# Phase 6 Plan 02: Gap audit pre-fill Summary

Throwaway pre-fill script (units, exercises, screenshots) that reads the unpacked course-4 backup, imports `tools/moodle2docusaurus.py` read-only, and writes local drafts so the fragment plans judge items instead of parsing Moodle XML.

## Commits

- d91388d: docs(06-02): add gap audit pre-fill script and assign 73 snippet

## Results

Run with `/Users/beff/_workspace/BBjCourses/.venv/bin/python`. Outputs: 25 unit drafts plus `images.tsv` in `import/work/dwc-gap-drafts/`, 11 drafts in `import/work/dwc-exercise-drafts/`, preview JSON `import/work/dwc-2022-screenshots.preview.json` with exactly 30 entries (each with a 2022 Moodle name and 40-hex SHA-1). `import/work` is git-ignored; nothing under import/ is tracked.

Per-unit counts (items, pre, images covered/parked/new/unresolved):

| Unit | Items | pre | cov/park/new/unres |
|------|-------|-----|--------------------|
| 0P | 31 | 0 | 0/0/0/1 |
| 0R | 22 | 0 | 0/0/0/0 |
| 1A | 20 | 0 | 2/0/7/1 |
| 1B | 30 | 2 | 0/0/9/0 |
| 1C | 79 | 8 | 0/0/15/0 |
| 2A | 27 | 8 | 0/0/0/0 |
| 2B | 41 | 2 | 6/4/5/0 |
| 2C | 95 | 18 | 0/0/18/0 |
| 2D | 27 | 5 | 0/0/7/0 |
| 3A | 8 | 0 | 2/0/0/0 |
| 3B1 | 7 | 0 | 0 |
| 3B2 | 5 | 0 | 0 |
| 3B3 | 21 | 4 | 0 |
| 3B4 | 6 | 1 | 0 |
| 4A | 23 | 0 | 7/2/0/0 |
| 5A | 44 | 4 | 9/6/0/0 |
| 6A | 41 | 7 | 7/0/1/0 |
| 7A | 64 | 13 | 13/0/0/0 |
| 8A | 8 | 0 | 1/0/0/0 |
| 8B | 7 | 1 | 0/0/2/0 |
| 9A | 17 | 7 | 0 |
| 9B | 9 | 2 | 0 |
| 9C | 9 | 1 | 0/0/2/0 |
| 10A | 9 | 1 | 1/0/0/0 |
| 10B | 7 | 2 | 0 |

Reconciliation with RESEARCH section 1: all `<pre>` and image totals match (1C 8/15, 2C 18/18, 5A 4/15, 7A 13/13, 2B 15 images, 6A 8, 4A 9); parked total is 12 (2B 4, 4A 2, 5A 6). The two unresolved references are the external `iconInfoLogo.png` (0P, public.basis.com) and an external googleusercontent image in 1A, both not in the backup (RESEARCH 5.2). Assign `<pre>` counts: 73, 122, 123 have one each; the others none. `snippets/EX73-01.bbj` holds the verbatim assign 73 line (keeps its four leading spaces from `code_text`).

## Deviations from Plan

**1. [Rule 1 - Bug] Absolute pluginfile URLs not resolved.** First run showed 1A and 2B images as unresolved because sources are full `.../pluginfile.php/...` URLs. Fix: reduce to the URL basename before lookup. Same file.

**2. [Rule 1 - Bug] Images inside bold-only paragraphs dropped.** The 0P image disappeared when the walker treated its paragraph as a sub-heading. Fix: keep images and links inside headings as items.

**3. Worktree base.** The worktree started at an older commit than 156ce09; reset to 156ce09 as the startup check prescribes before any work.

## Known Stubs

None.

## Self-Check: PASSED

Script, snippet and commit d91388d exist; `tools/moodle2docusaurus.py` is unchanged.
