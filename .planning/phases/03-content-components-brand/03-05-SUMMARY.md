---
phase: 03-content-components-brand
plan: 05
subsystem: site-config
tags: [search, zoom, admonition, llms, navbar, footer, favicon]
requires: ["03-01", "03-04"]
provides:
  - local search (Cmd+K), image zoom, exercise admonition keyword, llms exclusion, brand chrome
affects: [03-06]
tech-stack:
  added: ["@easyops-cn/docusaurus-search-local@0.55.3", "docusaurus-plugin-zooming@1.2.0"]
  patterns: [single owner of docusaurus.config.js for the phase]
key-files:
  modified:
    - docs/package.json
    - docs/package-lock.json
    - docs/docusaurus.config.js
    - docs/src/css/_navbar.scss
key-decisions:
  - "Algolia block kept as comments with YOUR_* placeholders only"
  - "Footer uses literal copyright sign and a links/html single line"
requirements-completed: [COMP-01, COMP-05, COMP-06, SITE-05]
metrics:
  duration: 15min
  completed: 2026-10-03
---

# Phase 3 Plan 05: Search, zoom, exercise keyword and brand chrome Summary

Local search, image zoom, the `exercise` admonition keyword, the llms fixture exclusion and the BASIS navbar/footer/favicon/social chrome, all in one config owner.

## Commits

- f4e4655 chore(03-05): add the two packages (package.json + lockfile)
- ae28b6d feat(03-05): config and navbar stylesheet changes

## Lockfile diff

589 insertions, 0 deletions (package.json +2, package-lock.json +587). No existing entry changed, so no @docusaurus/* drift; all stay exactly 3.10.2. `rm -rf node_modules && npm ci` succeeded afterwards.

## postcss-calc baseline

The warning (`postcss-calc ... Lexical error ... c * 3`) already appears in the baseline build before any change and still appears after. It is pre-existing and not caused by this plan.

## Verification

Build succeeds (Node 22 locally). build/search-index.json is written. `authoring` appears 0 times in llms.txt and llms-full.txt. Built index.html contains basis-logo.svg, header-github-link, favicon-32.png, the og:image social-cover URL, a single "All rights reserved." line with the current year, the "BASIS Courses" title and at least 2 navbar-book items. The invert filter on the navbar logo is removed from _navbar.scss, MIT header updated.

## Deviations from Plan

None. Task 1 and Task 2 config edits were applied together and committed as package files first, config files second.

## Needs user action

The permission system denied running `tools/prove-gates.sh` and `tools/verify-phase1.sh` from this agent. Please run `! bash tools/prove-gates.sh` and `! bash tools/verify-phase1.sh`. Also check visually on `npm run serve`: white wordmark with light swoosh in both themes, and Cmd+K opens search.

## Known Stubs

None.

## Self-Check: PASSED

Commits f4e4655 and ae28b6d exist; modified files present.
