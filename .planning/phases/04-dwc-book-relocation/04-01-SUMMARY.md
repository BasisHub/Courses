---
phase: 04-dwc-book-relocation
plan: 01
subsystem: tooling
tags: [snapshot, redirects, verification, dwc]
requires: []
provides:
  - tools/data/dwc-old-sitemap.xml
  - tools/data/dwc-old-routes.json
  - tools/check-dwc-routes.py
  - tools/check-dwc-anchors.py
affects: [04-03, 04-06, phase-08-redirects]
tech-stack:
  added: []
  patterns: [stdlib-only Python tools, PASS/FAIL line output]
key-files:
  created:
    - tools/snapshot-dwc-site.py
    - tools/data/dwc-old-sitemap.xml
    - tools/data/dwc-old-routes.json
    - tools/check-dwc-routes.py
    - tools/check-dwc-anchors.py
  modified: []
key-decisions:
  - "Snapshot committed first in the phase (D-15); one allowlisted anchor (/ ready-to-get-started, D-09)"
requirements-completed: [DWC-04, DWC-01]
duration: 15min
completed: 2026-10-03
---

# Phase 4 Plan 01: Snapshot and checkers Summary

Snapshot of the old DWC-Course site (28 locs, 27 content routes, 307 heading anchors, source BasisHub/DWC-Course@965da6d) plus stdlib route/sidebar-order and anchor checkers that fail correctly on the Phase 1 stub.

## Task Commits
1. Task 1 snapshot: 5a99edc
2. Task 2 checkers: 3d973ec

## Verification
- Snapshot output `locs=28 content=27 anchors=307`, sitemap byte-identical, JSON deterministic.
- On the stub build: routes checker exits 1 with 26 missing and 2 extra (first-chapter) routes; anchors checker exits 1; both exit 2 on a missing build.

## Deviations from Plan
None. Plan executed as written.

## Self-Check: PASSED
