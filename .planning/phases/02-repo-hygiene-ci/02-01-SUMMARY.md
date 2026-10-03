---
phase: 02-repo-hygiene-ci
plan: 01
subsystem: tooling
tags: [vale, actionlint, prose-lint, verification]
requires: []
provides:
  - tools/install-lint-tools.sh (pinned, checksum-verified vale 3.24.0 and actionlint 1.7.12)
  - tools/verify-phase2.sh (sections tools, ci, vale, docs, headers, seed, hygiene, deploy, gates)
  - .vale.ini plus .github/.styles/{Google,BASIS,config/vocabularies/BASIS}
affects: [02-02, 02-03, 02-04, 02-06]
key-files:
  created:
    - tools/install-lint-tools.sh
    - tools/verify-phase2.sh
    - .vale.ini
    - .github/.styles/Google/
    - .github/.styles/BASIS/
    - .github/.styles/config/vocabularies/BASIS/accept.txt
    - .github/.styles/config/vocabularies/BASIS/reject.txt
  modified:
    - .gitignore
metrics:
  tasks: 2
  completed: 2026-10-03
---

# Phase 2 Plan 01: Verification harness and Vale setup Summary

Pinned lint-tool installer, a nine-section `tools/verify-phase2.sh`, and a Vale config that lints `docs/docs/**/*.{md,mdx}` only, with the Google package, the webforJ rules renamed to `BASIS`, and a BBj vocabulary.

## Status: files written and committed, NOT executed

The sandbox denied every `bash <script>` invocation (`bash tools/install-lint-tools.sh`, `bash -n ...`). Plain `chmod`, `cp`, `mkdir` and `git` commands worked. As a result nothing in this plan was run:

- Vale 3.24.0 and actionlint 1.7.12 were never downloaded (the installer script is unexecuted, including its checksum logic).
- `vale docs/docs` was never run, so "exit 0 on the stubs" is unconfirmed.
- The `oaicite` probe check was never run.
- `tools/verify-phase2.sh` was never syntax-checked or run.

Run this to close the gap (from the main checkout after merge):

```bash
bash -n tools/install-lint-tools.sh && bash -n tools/verify-phase2.sh
bash tools/install-lint-tools.sh
tools/.bin/vale docs/docs
bash tools/verify-phase2.sh --local   # expect PASS for [tools], [vale], [hygiene] (hygiene needs branch main)
git status --porcelain docs/docs      # must be empty
```

Static checks that were possible (file contents, via Read/Edit): all 12 BASIS rules carry the webforJ-MIT header on line 1; `AIArtifacts.yml` is `level: error` and lists `oaicite`; vocabulary has BBj, BBjGridExWidget, SysGui, BUI, ARC, webforJ, DWC, BASIS, Docusaurus, Moodle; `.vale.ini` has exactly two sections (`[formats]`, docs glob).

## Task commits

1. Task 1 (installer, verify script, .gitignore): e82db6e
2. Task 2 (Vale config, Google, BASIS, vocabulary): f3f09cf

## Decisions and notes

- `Google.WordListCase` stays enabled (warns on "chapter"); warnings do not fail CI (D-11). Phase 7 decides the zero-findings policy.
- The `webforJ-MIT.txt` file inside webforJ's `.styles/webforJ/` folder was not copied; `LICENSES/webforJ-MIT.txt` already covers it (so BASIS has exactly 12 `.yml` files).
- The `[hygiene]` branch check reports FAIL on any branch other than `main` (it will fail inside a worktree agent branch; expected).
- Verify script `[ci]` checks FAIL until plan 02-04 adds the workflows and `tools/data/ruleset-main.json`; `[docs]`/`[seed]` fail until plans 02-02/02-03.

## Deviations from Plan

**[Rule 3 - Blocking] Could not execute scripts.** Sandbox permission denial on `bash <script>`; not worked around. Task verification commands were not run. Everything else followed the plan, except `sed`-based header insertion was replaced by per-file edits because multi-command shell lines were refused.

## Known Stubs

None.

## Self-Check: PARTIAL

Files and both commits exist (verified via git output). Runtime verification not performed, see Status.
