# Phase 2: Repo Hygiene & CI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-03
**Phase:** 02-repo-hygiene-ci
**Areas discussed:** Repo creation & visibility, CLAUDE.md shape, Vale scope & strictness, Merge gates & workflow

---

## Repo creation & visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Claude via gh, with confirm | gh repo create, remote, push, Pages source via API after OK | ✓ |
| Stephan creates it manually | Human checkpoint, then Claude pushes | |
| Someone else at BASIS | Phase blocks until an org admin creates it | |

| Option | Description | Selected |
|--------|-------------|----------|
| Public now, stub live | Free Pages; unannounced until Phase 7 | ✓ |
| Private repo, public Pages | Needs paid org plan | |
| Private, no deploy until Phase 7 | Breaks success criterion 1 | |

| Option | Description | Selected |
|--------|-------------|----------|
| Everything incl. .planning/ | Push 54 commits as they are | ✓ |
| Keep .planning/ local | Gitignore and rewrite history | |
| Squash to one initial commit | Fresh history | |

| Option | Description | Selected |
|--------|-------------|----------|
| Commit it at repo root | References resolve | |
| Move into .planning/ | Commit as planning material | ✓ |
| Keep it untracked | Local only | |

**Notes:** References to migration-seed.md must be updated after the move.

---

## CLAUDE.md shape

| Option | Description | Selected |
|--------|-------------|----------|
| Seed §7 rules + slim GSD block | Maintenance doc, short GSD section, research moves out | ✓ |
| Seed §7 only, GSD elsewhere | GSD content moved to .planning/.claude | |
| Keep both in full | ~300+ lines | |

Corrections selected (multi): Self-hosted fonts/dwc-ui.css, import/ never committed, Pinning & Node policy, Throwing gates & verify scripts (all four).

| Option | Description | Selected |
|--------|-------------|----------|
| Claude + human maintainers | Imperative rules, readable as checklist | ✓ |
| Claude only | Terse, tool-focused | |

---

## Vale scope & strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Book content only | docs/docs/**/*.{md,mdx} | ✓ |
| Content + public repo docs | Also README, CONTRIBUTING, ROADMAP | |
| Every Markdown file | Includes .planning/ | |

| Option | Description | Selected |
|--------|-------------|----------|
| Whole changed files | filter_mode: file | ✓ |
| Only added lines | reviewdog default | |
| Entire content tree | nofilter | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep AI rules | Catch AI tells in Claude-drafted content | ✓ |
| Drop them | As seed suggests | |
| Keep, warning level only | Report, don't fail | |

| Option | Description | Selected |
|--------|-------------|----------|
| Errors only | Warnings/suggestions are comments only | ✓ |
| Warnings and errors | Stricter | |

---

## Merge gates & workflow

| Option | Description | Selected |
|--------|-------------|----------|
| PRs required, admin bypass | Ruleset with required checks, Stephan can push | ✓ |
| Strict PR-only | No bypass | |
| Direct pushes, checks advisory | No protection | |

| Option | Description | Selected |
|--------|-------------|----------|
| Throwaway PR, then close | Real proof, confirm step | ✓ |
| Local dry run only | Weaker proof | |
| Stephan does it by hand | Human UAT | |

| Option | Description | Selected |
|--------|-------------|----------|
| BASIS staff + outside fixes | Plus typo-fix path for readers | |
| BASIS staff only | Internal author guide | ✓ |
| Minimal pointer | Short file | |

| Option | Description | Selected |
|--------|-------------|----------|
| Seed's three files | deploy, test-build, reviewdog | ✓ |
| deploy.yml does both + reviewdog | DWC-Course style | |

---

## Claude's Discretion

Doc wording, .editorconfig contents, deploy.yml triggers/concurrency, vale-action SHA pin and Vale version, runner label, live-URL verification method, repo description/topics.

## Deferred Ideas

None.
