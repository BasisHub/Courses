# Phase 4: DWC Book Relocation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-10-03
**Phase:** 04-dwc-book-relocation
**Areas discussed:** Overview page, Purity boundary, Images, Sample downloads

---

## Overview page

| Option | Description | Selected |
|--------|-------------|----------|
| Rebuild as Markdown | Hero/feature text as prose, ChapterCards as `<DocCardList />` | ✓ |
| Port the 3 components | Copy Hero/HomepageFeatures/ChapterCards, restyle with DWC tokens | |
| Minimal overview | Title, one paragraph, DocCardList | |

| Option | Description | Selected |
|--------|-------------|----------|
| Inside the relocation | Overview rebuild is the one allowed content change in the move commit | ✓ |
| Stub, then follow-up | Placeholder in the move commit, rebuild in a second commit | |

| Option | Description | Selected |
|--------|-------------|----------|
| Plain link line | "Start with [GUI to BUI to DWC](...)" | ✓ |
| Keep a button | Infima button link | |
| Drop it | DocCardList and pagination suffice | |

| Option | Description | Selected |
|--------|-------------|----------|
| Match intro-bbj | Same overview front matter as intro-bbj | ✓ |
| Keep hidden | Keep `hide_table_of_contents: true` | |

**User's choice:** Recommended options throughout.

---

## Purity boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Fix errors in Phase 4 | Pure move commit, then error-level Vale fixes in the same PR | ✓ |
| Admin-bypass merge | Merge with Vale red, all Vale work in Phase 7 | |
| Temporarily exclude dwc | Remove dwc from the Vale glob until Phase 7 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 4 follow-up commit | Drop duplicate H1, add description, fence languages | ✓ |
| Defer to Phase 7 | Leave pages exactly as is | |

| Option | Description | Selected |
|--------|-------------|----------|
| Same as old site | Overview, Prerequisites, Sample Code, Resources, chapters 01-12 | ✓ |
| Front and back | Samples and Resources as appendix after chapters | |

| Option | Description | Selected |
|--------|-------------|----------|
| Plain copy + source SHA | Copy from origin/main 965da6d, SHA in commit message | ✓ |
| Import history | git filter-repo + unrelated-history merge | |

| Option | Description | Selected |
|--------|-------------|----------|
| Point at downloads | Replace the `git clone DWC-Course` block with static/files links | ✓ |
| Point at Courses repo | Clone BasisHub/Courses instead | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sitemap + route/anchor list | Old sitemap.xml plus generated JSON of routes and heading ids | ✓ |
| Full build/ copy | Commit the 21 MB build | |
| Sitemap only | No anchors | |

| Option | Description | Selected |
|--------|-------------|----------|
| Allowed, keep old id | Pin old anchor with `{#old-id}`, script compares against snapshot | ✓ |
| Headings frozen | No heading changes in Phase 4 | |
| Allowed, record mapping | Change freely, record old to new anchors for Phase 8 | |

**User's choice:** Recommended options throughout.
**Notes:** The Vale question came up because the reviewdog check is required on `main` with `filter_mode: file`, so a PR touching all never-linted DWC pages would fail.

---

## Images

| Option | Description | Selected |
|--------|-------------|----------|
| Mechanical kebab | ARC_image_1.png to arc-image-1.png | ✓ |
| Descriptive names | Hand-picked names | |

| Option | Description | Selected |
|--------|-------------|----------|
| Drop, list in map | Not copied; verdict in map; Phase 6 pulls from archive | |
| Park them | Copy content screenshots to a holding folder for Phase 6 | ✓ |
| Drop silently | No record | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as-is | Verbatim alt text; improve in Phase 7 | ✓ |
| Improve now | Descriptive alt text in Phase 4 | |

| Option | Description | Selected |
|--------|-------------|----------|
| tools/data, delete after P6 | Committed holding folder, removed by the gap audit | ✓ |
| import/ (never committed) | Local only | |
| tools/data, keep | Kept indefinitely | |

**User's choice:** Park unused screenshots (not the recommended "drop, list in map"); otherwise recommended options.

---

## Sample downloads

| Option | Description | Selected |
|--------|-------------|----------|
| ZIP per folder + all | One ZIP per sample folder plus dwc-samples.zip | ✓ |
| Individual files | Mirror every file | |
| Both | Files plus ZIPs | |

| Option | Description | Selected |
|--------|-------------|----------|
| examples/ source, CI check | Generated, committed, reproducible ZIPs; `--check` in PR build | ✓ |
| Generate at build time | Prebuild step, gitignored output | |
| Manual script only | No enforcement | |

| Option | Description | Selected |
|--------|-------------|----------|
| Check now, fix in P7 | Report syntax results in tools/data, no edits | ✓ |
| Check and fix now | Fix failing samples in Phase 4 | |
| Leave to Phase 7 | No syntax work now | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep old names | 01_GUI2BUI2DWC etc., typo included; documented exception | ✓ |
| Kebab-case now | Rename folders and update references | |

**User's choice:** Recommended options throughout.

---

## Claude's Discretion

- Script language, file names and data formats for the sync, snapshot and image map.
- Mechanism for the top-level page order (prefixes or `sidebar_position`).
- Wording of the rebuilt overview and the page descriptions.
- Whether to add `tools/verify-phase4.sh`, and where the download links appear beyond `samples.md`.

## Deferred Ideas

- Alt text improvements, Vale warnings/suggestions, failing BBj samples: Phase 7.
- Parked screenshot verdicts: Phase 6.
- Kebab-case sample folder names: rejected for now.
