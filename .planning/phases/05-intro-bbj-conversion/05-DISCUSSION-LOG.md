# Phase 5: Intro-BBj Conversion - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 05-intro-bbj-conversion
**Areas discussed:** Book shape & exercises, Code recovery & BBj checks, Prose/links/Moodle-isms, Images/videos/downloads

Pre-discussion scout: Claude unpacked the course-2 backup into the session scratchpad. It found 5 assignments (not 6), no `<pre>` blocks, videos as `<video><source>`, and 9 images all named `image.png`. A curl check showed `documentation.basis.com` is dead, and all 20 of its paths resolve on `documentation.basis.cloud`. The `basis-next`, `hot.bbx.kitchen` and `basis.com/eclipseplug-ins` links return 404.

---

## Book shape & exercises

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level pages | READ FIRST chapters after Overview, sidebar_position 0.1–0.3 | ✓ |
| Merge into overview | 25 chapter pages; count changes | |
| Own first section | Shifts folder numbers | |

| Option | Description | Selected |
|--------|-------------|----------|
| Drop number, sentence case | Matches DWC labels | ✓ |
| Keep number, sentence case | | |
| Verbatim Moodle names | | |

| Option | Description | Selected |
|--------|-------------|----------|
| index.mdx per section | Intro + DocCardList, like DWC | ✓ |
| generated-index | | |
| No link | | |

| Option | Description | Selected |
|--------|-------------|----------|
| "Bonus exercise: ..." | Optional status visible in sidebar | ✓ |
| Plain "Exercise: ..." | | |
| Moodle names verbatim | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Sentence case, light cleanup (titles) | Title map in converter | ✓ |
| Verbatim | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Short hand-picked slug map | | ✓ |
| Mechanical from title | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Summary + cards + start link (overview) | Mirrors DWC overview | ✓ |
| Summary only | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Replace stubs in generated commit | | ✓ |
| Remove in separate prep commit | | |

---

## Code recovery & BBj checks

| Option | Description | Selected |
|--------|-------------|----------|
| Heuristic + override table | Honest zero unclassified count | ✓ |
| `<code>` only, rest by hand | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Own paragraph = fence | | ✓ |
| Multi-line only = fence | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Check + fix here | Verbatim generated commit, then report + fix commit | ✓ |
| Check + report only | Like P4 D-20 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as taught | Fix only errors | ✓ |
| Update where deprecated | | |

---

## Prose, links & Moodle-isms

| Option | Description | Selected |
|--------|-------------|----------|
| Errors + typos | Like P4 D-05 | ✓ |
| Errors + warnings | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite as feedback page | GitHub issues on BasisHub/Courses | ✓ |
| Keep verbatim | | |
| Drop the page | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Replace with verified successor | Link map in tools/data/ | ✓ |
| Unlink, keep text | | |
| Keep as is | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal rewrite | Hand-edit commit after generated one | ✓ |
| Verbatim now, fix in Phase 7 | | |

---

## Images, videos & downloads

| Option | Description | Selected |
|--------|-------------|----------|
| Descriptive, hand-picked names | Map with alt text in tools/data/ | ✓ |
| Chapter slug + index | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Real YouTube titles (oEmbed) | Stored in a map | ✓ |
| Derived from chapter | | |

| Option | Description | Selected |
|--------|-------------|----------|
| Kebab-case, descriptive folders | | ✓ |
| Moodle-derived | | |

| Option | Description | Selected |
|--------|-------------|----------|
| sync-samples ZIPs | Per folder + all-in-one | ✓ |
| ZIPs + raw .bbj files | | |
| Original Moodle files | | |

| Option | Description | Selected |
|--------|-------------|----------|
| In the chapter that uses it | Plus a list on the overview | ✓ |
| Seed rule: end of preceding chapter | | |
| Separate samples page | | |

---

## Claude's Discretion

- Slug and title maps, section index and overview wording
- Converter structure, CLI, report format
- Where the language heuristic and override table live
- Whether to add `tools/verify-phase5.sh`
- Exact sample folder names within the kebab-case pattern
- LICENSE for intro-bbj samples (reuse DWC MIT; confirm with Stephan at plan checkpoint)

## Deferred Ideas

- Modernize 2021-era BBj patterns in intro-bbj
- Vale warnings and suggestions: Phase 7
- Refreshed Enterprise Manager screenshots
- Reword CONV-06's file list at phase transition
