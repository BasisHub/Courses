---
phase: 02-repo-hygiene-ci
plan: 02
subsystem: repo-docs
tags: [claude-md, migration-seed, repo-hygiene]
requires: []
provides:
  - ".planning/migration-seed.md tracked, references repointed"
  - "CLAUDE.md maintenance instructions with slim GSD blocks"
affects: [CLAUDE.md, .planning]
key-files:
  created: [.planning/migration-seed.md]
  modified: [CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/research/SUMMARY.md, .planning/research/ARCHITECTURE.md, .planning/research/FEATURES.md]
decisions:
  - "Phase 1 and 2 phase artifacts left untouched as history"
metrics:
  tasks: 2
  completed: 2026-10-03
requirements: [REPO-03]
---

# Phase 2 Plan 02: Seed move and CLAUDE.md rewrite Summary

The migration seed now lives tracked at `.planning/migration-seed.md`, and `CLAUDE.md` opens with the seed section 7 maintenance rules (five D-06 corrections applied) above seven slim GSD marker blocks.

## Tasks

| Task | Commit | Notes |
|------|--------|-------|
| 1. Move seed, repoint references | 7bc3950 | six .planning files updated |
| 2. Rewrite CLAUDE.md | 8e26f3b | 108 lines, no em dashes |

## Secret scan

The credential grep returned 3 hits (lines 87, 265, 296). All are prose about Google Fonts, design tokens (`--dwc-*`) and a youtube-nocookie URL. No credentials.

## Deviations from Plan

None. The plan was executed as written. The profile block body is unchanged.

## Self-Check: PASSED

Verified: root `migration-seed.md` is gone, `.planning/migration-seed.md` is committed, all seven marker pairs are present, and every required string is in CLAUDE.md.
