---
phase: 05-intro-bbj-conversion
plan: 01
subsystem: tooling
tags: [python, venv, mdx, converter]
requires:
  - phase: 01
    provides: pinned docs toolchain with @mdx-js/mdx
provides:
  - local .venv with pinned converter packages
  - tools/check-mdx.mjs MDX compile check
affects: [05-intro-bbj-conversion]
tech-stack:
  added: [beautifulsoup4 4.15.0, lxml 6.1.3, markdownify 1.2.3, six 1.17.0 (local venv only)]
  patterns: [MDX compile check resolves @mdx-js/mdx from docs/ via createRequire]
key-files:
  created: [tools/check-mdx.mjs]
  modified: []
key-decisions:
  - "Front matter is blanked rather than removed so error line numbers match the file"
requirements-completed: [CONV-01]
duration: 5min
completed: 2026-10-04
---

# Phase 5 Plan 01: Converter prerequisites Summary

Gitignored `.venv` with the four pinned converter packages, plus `tools/check-mdx.mjs`, an MDX compile check built on the docs workspace's own `@mdx-js/mdx`.

## Package legitimacy approval

The orchestrator presented the four pins to Stephan on 2026-10-04 with PyPI metadata (beautifulsoup4 4.15.0 by Leonard Richardson; lxml 6.1.3, github.com/lxml/lxml; markdownify 1.2.3, github.com/matthewwithanm/python-markdownify; six 1.17.0, github.com/benjaminp/six). Stephan's reply, verbatim: "Approved". No pip install ran before the reply.

## Tasks

1. Task 1: legitimacy gate, approved (see above). No commit.
2. Task 2: venv and MDX check. Commit bd46665 (`tools/check-mdx.mjs`).

## Verification

- `.venv/bin/pip freeze` shows the four exact pins (plus floating soupsieve 2.10, typing_extensions 4.16.0).
- Exit 0 on `docs/docs/dwc/00-overview.mdx` and `docs/docs/authoring/components.mdx`.
- Unescaped `<temporary chapter - this will soon change>` gives a `FAIL` line and exit 1.
- Escaped `\<temporary chapter\> \{x\} $01101083$` gives exit 0.
- No arguments gives exit 2.
- `.venv` untracked; `tools/requirements.txt` unchanged.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

tools/check-mdx.mjs exists; commit bd46665 exists.
