# Phase 6: Exercises & DWC Gap Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-04
**Phase:** 06-exercises-dwc-gap-audit
**Mode:** `--auto` (recommended option auto-selected for every question; no user prompts)
**Areas discussed:** DWC exercise pages, Possible solution blocks, Exercise index, Gap audit method, Applying kept material, 2022 screenshot markers, Commit series

---

## DWC exercise pages

| Option | Description | Selected |
|--------|-------------|----------|
| One page per Moodle assignment (11), in the mapped chapter, text from the assignment intro | Matches seed §3.4 step 4; the DWC inline exercises are only stubs | ✓ |
| Extract only the 4 DWC inline stubs | Stubs carry no exercise text; would miss 7 assignments | |
| Keep inline, no pages | Breaks the "both books follow one pattern" rule | |

[auto] Q: "What happens to the old chapter exercise headings?" → Selected: "Keep as short pointer sections (anchors survive)" (recommended; anchor check must stay green, Phase 8 preserves fragments)
[auto] Q: "Files the assignments mention but that ship nowhere?" → Selected: "Drop or rephrase the sentence; never link a missing file" (recommended; writing new samples is new content)

## Possible solution blocks

| Option | Description | Selected |
|--------|-------------|----------|
| `<details>` with inline solution source plus ZIP link; drift check against examples | Shows the solution without download; examples stay single source | ✓ |
| `<details>` with ZIP link only | No drift risk, but doesn't "show" the solution | |
| Add raw-loader and import the file | New dependency | |

[auto] Q: "Is DWC1/DWC2 a solution for assign_61?" → Selected: "Yes" (recommended; the chapter calls them the result of the exercises)

## Exercise index

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level `exercises.mdx` per book (sidebar 0.4), hand-written list, verify-script completeness check | Simple, Vale-checkable, findable | ✓ |
| Generated React component from sidebar data | More machinery for 16 entries | |
| Index at the end of each book | Harder to find; ordering against chapter folders is awkward | |

## Gap audit method

| Option | Description | Selected |
|--------|-------------|----------|
| One section per Moodle unit (30), item rows with verdict + reason, images by SHA-1 | Reviewable, hash makes "covered" objective | ✓ |
| One flat table for the whole course | Hard to review per chapter | |

[auto] Q: "Who decides verdicts?" → Selected: "Claude decides, Stephan reviews in the PR (audit is first commit)" (recommended; no checkpoint blocks the --auto chain)

## Applying kept material

| Option | Description | Selected |
|--------|-------------|----------|
| Into existing pages at named anchors; new sub-page only when no home exists; adapted prose, Vale error-clean | No slug renames, readable result | ✓ |
| Verbatim paste of Moodle text | Violates house style and Vale | |

[auto] Q: "Image names for kept screenshots?" → Selected: "Descriptive kebab-case + hand-written alt (P5 D-19 style)" (recommended)

## 2022 screenshot markers

| Option | Description | Selected |
|--------|-------------|----------|
| SHA-1 match to Moodle file with 2022 in its name; match list committed in tools/data | Seed criterion; works after import/ is deleted | ✓ |
| Match by Moodle `timecreated` year | Not the documented criterion | |

[auto] Q: "Marker placement?" → Selected: "Own line directly above each image reference" (recommended)

## Commit series

[auto] Q: "Order?" → Selected: "audit → exercise pages → kept material per chapter → 2022 markers → indexes → verify script" (recommended; markers after additions so new images are covered)

## Claude's Discretion

- Exercise slugs/titles, index wording, kept-prose wording
- Audit pre-fill script vs manual; audit table columns beyond the required ones
- `tools/verify-phase6.sh` contents

## Deferred Ideas

- Writing missing samples (MediaQueries, transitions) and solutions for 65/68/83
- Re-capturing 2022 screenshots
- Vale warnings/suggestions (Phase 7)
- Fixing SetStyle.bbj (Phase 7)
- DWCThemer link review (P5 D-27 todo)
