---
phase: 03-content-components-brand
plan: 01
subsystem: brand-assets
tags: [brand, svg, favicon, social-cover]
requires: []
provides:
  - docs/static/img/basis-logo.svg
  - docs/static/img/favicon.svg
  - docs/static/img/favicon-32.png
  - docs/static/img/social-cover.svg
  - docs/static/img/social-cover.png
affects: [03-05]
tech-stack:
  added: []
  patterns: [rsvg-convert generated PNGs from SVG sources]
key-files:
  created:
    - docs/static/img/basis-logo.svg
    - docs/static/img/favicon.svg
    - docs/static/img/favicon-32.png
    - docs/static/img/social-cover.svg
    - docs/static/img/social-cover.png
  modified: []
key-decisions:
  - "Favicon glyph: the 'B' path of the BASIS wordmark (first .st1 path), white on #26446B rounded square"
requirements-completed: [SITE-05]
metrics:
  duration: 10min
  completed: 2026-10-03
---

# Phase 3 Plan 01: Brand assets Summary

Recolored BASIS navbar lockup (white wordmark, light swoosh kept), a logo-derived "B" favicon and a 1200x630 social cover, all generated from Stephan's supplied vector.

## Tasks

| Task | Commit | Notes |
|------|--------|-------|
| 1 Logo and favicon | 4de8297 | basis-logo.svg: only .st1 fill changed to #FFFFFF; 20 shapes preserved, viewBox unchanged, Illustrator comment and enable-background removed, role/aria-label added |
| 2 Social cover | dba14ba | #1A2F4A background, inlined lockup at about 560 px, "Courses" 96 px, tagline #BCC9D2, system font stack; PNG 52 KB |

## Favicon glyph choice

The "B" was isolated cleanly as one path (first .st1 path), so the swoosh fallback was not needed. It is scaled 1.0 and centered on the 32x32 square.

## Review previews (not committed, for Stephan, D-05)

- /private/tmp/claude-501/-Users-beff--workspace-BBjCourses/fba9fc3c-9d92-4ed9-8c06-fd1139850aa2/scratchpad/favicon-16.png
- /private/tmp/claude-501/-Users-beff--workspace-BBjCourses/fba9fc3c-9d92-4ed9-8c06-fd1139850aa2/scratchpad/favicon-180.png
- Committed 32 px: docs/static/img/favicon-32.png
- Social cover for D-06 review: docs/static/img/social-cover.png

## Deviations from Plan

- Minor: the verify step `rsvg-convert basis-logo.svg -o /dev/null` fails because /dev/null is not a regular file; render success was confirmed by rendering to a real file instead. Not a content issue.

## Known Stubs

None.

## Self-Check: PASSED

All five files exist; commits 4de8297 and dba14ba exist.
