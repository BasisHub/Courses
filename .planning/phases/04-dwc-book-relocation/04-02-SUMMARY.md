---
phase: 04-dwc-book-relocation
plan: 02
subsystem: samples
tags: [samples, zip, reproducible-build, ci, third-party-notices]
requires: []
provides:
  - docs/examples/dwc/ (plain sample source)
  - docs/static/files/dwc/*.zip (11 reproducible ZIPs)
  - tools/sync-samples.py
affects: [04-04, 04-05]
tech-stack:
  added: []
  patterns: [stdlib-only Python tool, fixed-date reproducible ZIPs, PR drift gate]
key-files:
  created:
    - tools/sync-samples.py
    - docs/examples/dwc/
    - docs/static/files/dwc/ (11 ZIPs)
    - LICENSES/PrismJS-MIT.txt
  modified:
    - .github/workflows/test-build.yml
    - THIRD_PARTY_NOTICES.md
key-decisions:
  - "ZIP layout: <folder>.zip holds <folder>/ with LICENSE, README.md and files; dwc-samples.zip holds dwc-samples/ with everything"
  - "No setup-python step in CI; ubuntu-latest ships python3 (actionlint passes)"
requirements-completed: []
duration: 15min
completed: 2026-10-03
---

# Phase 4 Plan 02: DWC samples and reproducible ZIPs Summary

DWC samples copied byte-for-byte from DWC-Course 965da6d into `docs/examples/dwc/`, with a generic `tools/sync-samples.py` that builds 11 reproducible ZIPs and a `--check` drift gate in the PR build.

## Tasks

1. Samples copied via `git archive` (10 folders, LICENSE, README.md, 44 `.bbj`, `07_ControlValiation` name kept, modes normalized to 644, no dotfiles or symlinks). `diff -r` against the archive is empty. PrismJS entry added to THIRD_PARTY_NOTICES.md and upstream licence saved to `LICENSES/PrismJS-MIT.txt`. Commit 6900fce.
2. `tools/sync-samples.py` (generate and `--check`), 11 ZIPs in `docs/static/files/dwc/`, CI step before `npm run build`. Second run prints `unchanged` for all 11; `--check` passes from the root and from `docs/`; a one-byte change to README.md makes it exit 1. actionlint passes. Commit c021bcb.

## Verification notes

- Secrets grep (T-04-08): no hits.
- PrismJS: the files are the PrismJS core build (MIT, Copyright (c) 2012 Lea Verou, licence text fetched verbatim from upstream master). No version string or header in the files, so the notice says the version is not stated. The CSS is adapted (`var(--bbj-font-family-mono)`, extra brace-level colors) and the JS includes a brace-level plugin, which may be a custom or third-party plugin; its own origin could not be determined from the file.

## Deviations from Plan

None. The upstream licence was fetched with curl instead of WebFetch (same source URL).

## Deferred / downstream

- DWC-03 stays Pending: download links land in 04-05, the syntax report in 04-04.
- Vale was not run on THIRD_PARTY_NOTICES.md (outside docs/docs).

## Known Stubs

None.

## Self-Check: PASSED
