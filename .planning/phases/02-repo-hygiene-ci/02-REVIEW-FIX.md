---
phase: 02-repo-hygiene-ci
fixed_at: 2026-10-03T00:00:00Z
review_path: .planning/phases/02-repo-hygiene-ci/02-REVIEW.md
iteration: 1
findings_in_scope: 20
fixed: 18
skipped: 2
status: partial
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-10-03
**Source review:** .planning/phases/02-repo-hygiene-ci/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 20 (fix_scope: all)
- Fixed: 18
- Skipped: 2

**Verification limits:** In this session, the permission system denied every `bash <script>` and `bash -n` call. So `tools/verify-phase2.sh --local`, `tools/prove-gates.sh` and shell syntax checks were NOT run. These checks did run: `tools/.bin/vale docs/docs` (0 errors, 9 pre-existing warnings), `tools/.bin/actionlint .github/workflows/*.yml` (clean), and Vale probes for each rule change. Run `bash tools/verify-phase2.sh --local` and `bash tools/prove-gates.sh` before you rely on these commits.

## Fixed Issues

### WR-01: The installer's checksum file comes from the same place as the binary

**Files modified:** `tools/install-lint-tools.sh`
**Commit:** a983e70
**Applied fix:** Added `pinned_sha()`, a bash-3.2-compatible `case` table with the SHA-256 of the four supported archives for each tool. The values were copied from the upstream `*_checksums.txt` of Vale 3.24.0 and actionlint 1.7.12 on 2026-10-03 (trust on first use). The archive must match both the pinned hash and the release checksums file. An archive with no pinned hash aborts.

### WR-03: `reject.txt` very likely has no effect

**Files modified:** `.vale.ini`, `tools/verify-phase2.sh`
**Commit:** 5f9a291
**Applied fix:** `BasedOnStyles = Vale, Google, BASIS` with `Vale.Spelling = NO`. A probe confirmed that `WebforJ` now raises `Vale.Avoid` and `Vale.Terms`, and that `BBJ` and `dwc` raise `Vale.Terms` (error level). `docs/docs` stays at 0 errors. Added a "probe vocab fails with Vale.Avoid and Vale.Terms" check to `verify-phase2.sh`. Note: `Vale.Terms` is error level, so it will fail PRs on wrong casing of accept.txt terms in prose.

### WR-04: Error-level `AIDisclaimer` tokens will block legitimate course text

**Files modified:** `.github/.styles/BASIS/AIDisclaimer.yml`, `.github/.styles/BASIS/AIDisclaimerSoft.yml` (new)
**Commit:** 874d6b8
**Applied fix:** The error rule keeps only unambiguous chatbot phrases (`as an? (?:large )?language model`, plus the rest of the reviewer's list). `language model` and `let me know` moved to a new warning-level `AIDisclaimerSoft.yml`, which carries the webforJ MIT header and is covered by the `BASIS/` directory entry in THIRD_PARTY_NOTICES. The comment now refers to the BASIS vocabulary. A probe showed that Vale masks the accepted term `AI`, so "as an AI language model" now only warns (through `language model`) and no longer errors. The comment documents this trade-off. D-10 is respected: the rule is kept, only narrowed.

### WR-05: `AIVocab` flags "underscores"

**Files modified:** `.github/.styles/BASIS/AIVocab.yml`
**Commit:** 7f4b407
**Applied fix:** Removed both `underscor*` tokens, with a comment explaining why. A probe confirmed that "underscores" passes and "delve" still warns.

### WR-06: The `Capitalization` lookbehind uses an accidental character range

**Files modified:** `.github/.styles/BASIS/Capitalization.yml`
**Commit:** a4c483a
**Applied fix:** `[\#-/]` became `[#/-]` in all three swaps. A probe confirmed that `(webforj)` is now flagged and that `#webforj` and `x-webforj` are not. The BBj swap was not added: after WR-03, `Vale.Terms` enforces BASIS term casing at error level, so a warning-level duplicate adds nothing.

### WR-08: The verify script's "not linted (D-08)" check almost cannot fail

**Files modified:** `tools/verify-phase2.sh`
**Commit:** 796e47f
**Applied fix:** For each of CONTRIBUTING.md and CLAUDE.md, the script copies the file to a probe at the repo root (`.vale-d08-probe-$$.md`) and appends `oaicite`. The check passes only if Vale exits 0 with no `BASIS.` alert and no alert lines. Any other exit code fails. The probe is removed right away and by the EXIT trap. Tested manually: the probe returns "0 files", rc 0.

### WR-09: `deploy.yml` can be dispatched from any branch

**Files modified:** `.github/workflows/deploy.yml`
**Commit:** 7ec1d21
**Applied fix:** Added `if: github.ref == 'refs/heads/main'` to the deploy job. actionlint is clean.

### WR-10: The reviewdog checkout leaves the token in `.git/config`

**Files modified:** `.github/workflows/reviewdog.yml`
**Commit:** 016d8cd
**Applied fix:** Added `persist-credentials: false` to the checkout step. vale-action receives `GITHUB_TOKEN` through `env` and the repo is public. Still, confirm on the next PR that `runner / vale` posts review comments as before.

### IN-01: The installer leaves its temporary directory behind on failure; loose version match

**Files modified:** `tools/install-lint-tools.sh`
**Commit:** 73927ff
**Applied fix:** One script-level `WORK` dir with `trap 'rm -rf "$WORK"' EXIT` (fires on `set -e` aborts too; a function `RETURN` trap would not). The new `has_version()` matches the exact version token on the first line of `--version`. Tested: it matches `vale version 3.24.0` and `1.7.12`, and rejects `13.24.0`.

### IN-02: The actionlint fallback skips the version check

**Files modified:** `tools/verify-phase2.sh`
**Commit:** 928623b
**Applied fix:** `section_tools` now requires `1\.7\.12` from `actionlint --version`, and the check is renamed "actionlint 1.7.12".

### IN-03: The deploy-from-probe-branch check only looks at the last 20 runs

**Files modified:** `tools/verify-phase2.sh`
**Commit:** e345a01
**Applied fix:** Added `-L 1000` to the `gh run list` call.

### IN-04: The verify script loops over unquoted URL lists

**Files modified:** `tools/verify-phase2.sh`
**Commit:** 00c72f6
**Applied fix:** `set -f` after the gh check in `section_deploy`, and `set +f` at the end of the function. Parameter-expansion and `case` patterns are unaffected.

### IN-05: The Vale probe can overwrite a real file and leaves an empty directory

**Files modified:** `tools/verify-phase2.sh`
**Commit:** fa95ed8
**Applied fix:** The script refuses to run the probes (one FAIL) if `$PROBE` or `$D08_PROBE` already exists. Cleanup only removes probe files the script created (`PROBE_OWNED`), and only removes the probe directory if the script created it (`PROBE_DIR_MADE`). The probe name was kept, because whether a dotfile name matches the `.vale.ini` glob was not verified.

### IN-06: First-party actions on mutable major tags; no job timeouts

**Files modified:** `.github/workflows/deploy.yml`, `.github/workflows/test-build.yml`, `.github/workflows/reviewdog.yml`
**Commit:** f689d5d
**Applied fix:** Added `timeout-minutes: 15` to all four jobs. SHA-pinning the `actions/*` steps was not done: the reviewer marked it optional, the research decision specifies these version tags, and `verify-phase2.sh` checks for the literal `actions/checkout@v7` strings.

### IN-07: `Packages = Google` is unpinned and conflicts with the vendored copy

**Files modified:** `.vale.ini`
**Commit:** 55a6049
**Applied fix:** Removed the `Packages` line and added a comment. Vale still loads the vendored Google style (`docs/docs` result unchanged).

### IN-08: The `EmDashes` rule allows one em dash

**Files modified:** `.github/.styles/BASIS/EmDashes.yml`
**Commit:** 7b96abc
**Applied fix:** Changed it to an `existence` rule (warning level, `nonword: true`) with token `—` and the message "Do not use em dashes; rewrite the sentence." The header now says "Adapted from". A probe confirmed that every em dash is flagged.

### IN-09: The raw regexes in `BeDirect` have no word boundaries

**Files modified:** `.github/.styles/BASIS/BeDirect.yml`
**Commit:** 62176e7
**Applied fix:** Each alternative now has `\b...\b` and non-capturing groups, and the continuation items start with `|` (the meaningless suffix after `crucial for` is removed). A probe confirmed that "censured the" no longer matches, and that ensures/crucial for/improve performance/user experience/optimizing still do.

### IN-10: Gaps in `.gitignore` and `.editorconfig`

**Files modified:** `.gitignore`, `.editorconfig`
**Commit:** bd380f3
**Applied fix:** `.gitignore` now ignores `.venv/`, `venv/`, `.env`, `npm-debug.log*` and `*.mbz` (no tracked file is affected). `.editorconfig` adds `[*.py] indent_size = 4` and sets `insert_final_newline = true` for `*.md` and `*.mdx`. The header now says "Adapted from" (MIT line kept within the first 3 lines).

## Skipped Issues

### WR-02: The admin bypass (`bypass_mode: always`) also switches off force-push and deletion protection

**File:** `tools/data/ruleset-main.json:11-17, 39-40`
**Reason:** This conflicts with recorded decision D-12 (02-CONTEXT.md): admin bypass exists "so Stephan (and GSD planning commits) can still push directly". `bypass_mode: "pull_request"` would block those direct pushes. `section_gates` in `verify-phase2.sh` also asserts `bypass_mode=="always"`, and the live ruleset is GitHub state that this JSON does not apply. The decision-compatible option is a second ruleset with no bypass actors that holds only `non_fast_forward` and `deletion`. It needs an outward-facing `gh api` change under a confirm checkpoint, so it is left for Stephan to decide.
**Original issue:** RepositoryRole 5 with `bypass_mode: "always"` is exempt from every rule, including `non_fast_forward` and `deletion`.

### WR-07: `filter_mode: file` plus the admin bypass means Vale errors can reach `main` unreported

**File:** `.github/workflows/reviewdog.yml:25-26`, `.github/workflows/deploy.yml:3-6`
**Reason:** This conflicts with recorded decisions D-09 ("The full-tree zero-findings run stays a Phase 7 gate") and D-15 (three seed workflow files; test-build runs on PRs). A full-tree Vale job on push to `main` changes that scope, so the project owner should make the call. Partial mitigation from this run: WR-03 makes casing errors visible locally through `tools/.bin/vale docs/docs`.
**Original issue:** reviewdog only reports alerts in changed files, and pushes to `main` run no Vale, so errors that land on `main` directly stay unnoticed until an unrelated PR touches the file.

---

_Fixed: 2026-10-03_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
