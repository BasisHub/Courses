---
phase: 05-intro-bbj-conversion
plan: 03
subsystem: tooling
tags: [moodle, converter, mdx, beautifulsoup, markdownify, intro-bbj]
requires:
  - phase: 05-01
    provides: tools/check-mdx.mjs, .venv with pinned converter deps
  - phase: 05-02
    provides: tools/check-intro-bbj.py contract checker
provides:
  - tools/moodle2docusaurus.py one-shot converter with zero-unresolved report
  - tools/data/intro-bbj-image-map.json (8 moved with hand-written alt, 1 dropped)
  - tools/data/intro-bbj-video-map.json (10 oEmbed titles)
affects: [05-04 generated-docs commit]
tech-stack:
  added: []
  patterns: [placeholder tokens for raw MDX, editorial maps in tools/data, C2 history guard]
key-files:
  created:
    - tools/moodle2docusaurus.py
    - tools/data/intro-bbj-image-map.json
    - tools/data/intro-bbj-video-map.json
  modified: []
key-decisions:
  - "Raw fences, YouTube tags and images go through ZZRAWnZZ placeholder tokens substituted after markdownify and MDX escaping, so escaping never touches them"
  - "Plain-paragraph code that the heuristic flags but is prose is confirmed through a kind=prose override (ch 24 'For the time being')"
  - "Block code groups: trailing double line break inside a code paragraph is kept as one blank line"
requirements-completed: []
duration: 40min
completed: 2026-10-04
---

# Phase 5 Plan 03: Moodle course-2 converter Summary

**One-shot converter turns the course-2 .mbz into 38 MDX pages, 8 images, 10 YouTube embeds and 7 sample files with an all-zero report, deterministic across offline runs.**

## Accomplishments
- `tools/moodle2docusaurus.py`: safe tar unpack (member rejection plus `filter="data"`, only needed members), chapters ordered by pagenum, DOM cleanup, code recovery (heuristic plus override table, repair of ch 24 unclosed `<code>`), link pass (.com to .cloud, localhost as inline code, scheme allow-list), MDX escaping, front matter, section indexes, `_category_.json`, overview, exercises, sample extraction with LF normalization, LICENSE and README, output-path helper, C2 history guard, report and MDX compile via `tools/check-mdx.mjs`.
- Scratch run report: `chapters=28 top_pages=3 section_pages=25 exercises=5 index_pages=4 youtube=10 videos_skipped=1 images=8 images_dropped=1 resources=4 sample_files=7` and `unresolved_files=0 unresolved_tokens=0 unresolved_links=0 unclassified_code=0 mdx_failed=0`, exit 0.
- Image map written after viewing all 9 screenshots; video map fetched once from YouTube oEmbed (titles kept verbatim, double space collapsed).
- `diff -r` of two offline runs is empty. `check-intro-bbj.py content --root <scratch>` passes (0 failed); `samples` fails only on the ZIP checks, which are created by sync-samples in plan 05-04.

## Task Commits
1. Tasks 1 to 3 (single converter file plus maps, committed together as C1 per plan): a9a0491 `feat(05-03): add Moodle course-2 converter and intro-bbj maps`. The plan defines one commit (C1) for all three tasks; no path under docs/ is in it.

## Deviations from Plan
None in scope. Notes:
- The oEmbed fetch failed with a certificate error under the system Python, so it ran with `SSL_CERT_FILE=/etc/ssl/cert.pem` set in the environment (verification stays on; no code change).
- The structure checker still reports build-route failures against scratch trees because `docs/build` is stale or absent; this is expected until 05-04.

## Known Stubs
None.

## Issues Encountered
None blocking. No tool call was denied.

## Self-Check: PASSED
Files exist: tools/moodle2docusaurus.py, tools/data/intro-bbj-image-map.json, tools/data/intro-bbj-video-map.json. Commit a9a0491 found.
