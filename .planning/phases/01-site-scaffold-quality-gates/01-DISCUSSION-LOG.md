# Phase 1: Site Scaffold & Quality Gates - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-03
**Phase:** 01-site-scaffold-quality-gates
**Areas discussed:** Landing page, Books & navbar, Vendored DWC assets, Theme & chrome defaults

---

## Landing page

| Option | Description | Selected |
|--------|-------------|----------|
| Short intro block | Heading + one-liner, then cards | ✓ |
| Full hero | Big banner, tagline, CTA | |
| Cards only | Grid with page title | |

| Card content (multi) | Selected |
|---|---|
| Title + blurb + icon | ✓ |
| Audience / level tag | |
| Chapter count | |
| Prerequisite link | |

| Book order | Selected |
|---|---|
| Intro BBj first | ✓ |
| DWC first | |

| Card layout | Selected |
|---|---|
| Responsive grid (webforJ `_category.scss`) | ✓ |
| Stacked list | |

| Copy | Selected |
|---|---|
| Claude drafts, Stephan reviews | ✓ |
| Stephan supplies text | |

---

## Books & navbar

| Slugs | Selected |
|---|---|
| intro-bbj + dwc | ✓ |
| Change them | |

| Navbar labels | Selected |
|---|---|
| Short: "BBj Basics" / "DWC" | ✓ |
| Full titles | |
| Books dropdown | |

| Stub pages | Selected |
|---|---|
| Overview + one sample chapter | ✓ |
| Overview only | |

| Icons | Selected |
|---|---|
| Claude picks, Stephan reviews | ✓ |
| Stephan names them | |

| Navbar extras (multi) | Selected |
|---|---|
| GitHub link now | |
| Search slot placeholder | |
| Theme toggle only | ✓ |

---

## Vendored DWC assets

Finding presented: only `https://cdn.webforj.com/next/dwc-ui.css` is served; versioned paths return 403, no npm package, file is ~91 KB with no `url()`/`@import`.

| dwc-ui.css | Selected |
|---|---|
| Snapshot + refresh script | |
| Snapshot only | |

**User's choice:** "keep it simple" (free text), interpreted as a snapshot with a provenance comment and no refresh script.

| Fonts | Selected |
|---|---|
| @fontsource npm packages | ✓ |
| Committed woff2 files | |

---

## Theme & chrome defaults

| Color mode | Selected |
|---|---|
| Follow system | ✓ |
| Light default | |
| Dark default | |

| Announcement bar | Selected |
|---|---|
| Off, keep the mechanism | ✓ |
| On with a message | |

| Interim logo | Selected |
|---|---|
| Text-only title | ✓ |
| Reuse DWC-Course logo | |

| Edit link | Selected |
|---|---|
| Yes, set editUrl now | ✓ |
| No edit link | |

---

## Claude's Discretion

- Tabler icon per book, intro/blurb wording, gate-proof mechanics, print stylesheet details, stub chapter titles.

## Deferred Ideas

- Books dropdown at 3+ books; announcement bar message around go-live; dwc-ui.css refresh script.
