---
phase: 02-repo-hygiene-ci
reviewed: 2026-10-03T00:00:00Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - tools/install-lint-tools.sh
  - tools/verify-phase2.sh
  - .github/workflows/deploy.yml
  - .github/workflows/test-build.yml
  - .github/workflows/reviewdog.yml
  - tools/data/ruleset-main.json
  - .vale.ini
  - .gitignore
  - .editorconfig
  - .github/.styles/BASIS/AIArtifacts.yml
  - .github/.styles/BASIS/AIDisclaimer.yml
  - .github/.styles/BASIS/AIVocab.yml
  - .github/.styles/BASIS/BeDirect.yml
  - .github/.styles/BASIS/Capitalization.yml
  - .github/.styles/BASIS/EmDashes.yml
  - .github/.styles/BASIS/Hedging.yml
  - .github/.styles/BASIS/Parallelism.yml
  - .github/.styles/BASIS/Puffery.yml
  - .github/.styles/BASIS/Simplify.yml
  - .github/.styles/BASIS/SmartQuotes.yml
  - .github/.styles/BASIS/Weasel.yml
  - .github/.styles/config/vocabularies/BASIS/accept.txt
  - .github/.styles/config/vocabularies/BASIS/reject.txt
findings:
  critical: 0
  warning: 10
  info: 10
  total: 20
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-10-03
**Depth:** standard
**Files Reviewed:** 22 (12 Vale rule files are counted as one group in the narrative)
**Status:** issues_found

## Summary

I reviewed the files statically. Running shell scripts was not allowed in this session. The workflows handle the main security points correctly. Every workflow sets `permissions` at the top level. `pages: write` and `id-token: write` appear only on the deploy job. No workflow uses `pull_request_target`. The third-party `errata-ai/vale-action` is pinned to a commit SHA. Concurrency is set where it matters for deploys.

I found no BLOCKER-level defect. The weak points are these:

- **Installer integrity:** the "checksum-verified" installer downloads its checksum file from the same release as the binary. It catches download corruption but not a tampered release.
- **Ruleset:** the admin bypass is set to `always`, so admins can also force-push to `main` and delete it.
- **Vale vocabulary:** `reject.txt` very likely has no effect (see WR-03).
- **Vale rules copied from webforJ:** several error-level and warning-level rules will produce false positives in a BBj programming course, or are wrong as regexes.
- **Verify script:** some checks in `tools/verify-phase2.sh` can pass no matter what happens, so "ALL CHECKS PASSED" proves less than it seems.

## Warnings

### WR-01: The installer's checksum file comes from the same place as the binary, so it does not prove the binary is genuine

**File:** `tools/install-lint-tools.sh:37-45`
**Issue:** `install_tool` downloads the archive and `*_checksums.txt` from the same GitHub release URL, then compares one against the other. This only catches a corrupted download. If an attacker replaces release assets (compromised maintainer account, or a mutable release), they replace both files, and the check passes. The header comment and CONTRIBUTING describe the tools as "pinned, checksum-verified", which promises more than this gives. The version tag is pinned, but the content is not.
**Fix:** Hard-code the expected SHA-256 for each supported platform in the script, and treat the downloaded checksums file as a second check at most:
```bash
declare -A VALE_SHA=( [macOS_arm64]=<sha> [macOS_64-bit]=<sha> [Linux_64-bit]=<sha> [Linux_arm64]=<sha> )
declare -A AL_SHA=(   [darwin_arm64]=<sha> [darwin_amd64]=<sha> [linux_amd64]=<sha> [linux_arm64]=<sha> )
# pass "${VALE_SHA[$VALE_ASSET]}" into install_tool and compare $actual against it
```
(The `declare -A` arrays need bash 4. macOS ships bash 3.2, so use a `case` statement instead. Alternatively, verify the artifact attestations with `gh attestation verify` where upstream publishes them.)

### WR-02: The admin bypass (`bypass_mode: always`) also switches off force-push and deletion protection on `main`

**File:** `tools/data/ruleset-main.json:11-17, 39-40`
**Issue:** RepositoryRole 5 (Admin) with `bypass_mode: "always"` is exempt from every rule in the set, including `non_fast_forward` and `deletion`, not only from the PR and status-check rules. One admin mistake (`git push --force origin main`, or deleting the branch) rewrites or removes the deployed history with nothing to stop it. Pushes to `main` also trigger `deploy.yml`, so an unreviewed direct push goes live without the Vale gate ever running (see WR-07).
**Fix:** Use `"bypass_mode": "pull_request"`. Admins can still merge a PR without the checks, but direct pushes, force-pushes and deletions stay blocked. Alternatively, move `non_fast_forward` and `deletion` into a second ruleset with no bypass actors.

### WR-03: `reject.txt` very likely has no effect, because the built-in `Vale` style is not enabled

**File:** `.vale.ini:11`, `.github/.styles/config/vocabularies/BASIS/reject.txt:1`
**Issue:** `BasedOnStyles = Google, BASIS` does not include Vale's built-in `Vale` style. Entries in the vocabulary's reject list are enforced by `Vale.Avoid`, and the accept list's spelling and casing are enforced by `Vale.Terms` and `Vale.Spelling`. All of these are part of the `Vale` style. Without it, `WebforJ` in `reject.txt` is never flagged, and `accept.txt` only acts as an exception list for the other rules. It does not enforce the correct casing of `BBj`, `DWC` and similar terms (writing `BBJ` passes). This setup was copied from webforJ's `.vale.ini`, which has the same gap. I did not run a probe because shell execution was not allowed, so confirm by linting a file that contains `WebforJ`.
**Fix:**
```ini
BasedOnStyles = Vale, Google, BASIS
Vale.Spelling = NO   # optional: keep Terms/Avoid but skip the dictionary until vocab is complete
```
Then add a probe to `verify-phase2.sh` that checks `WebforJ` (or `BBJ`) raises `Vale.Avoid` or `Vale.Terms`.

### WR-04: Error-level `AIDisclaimer` tokens will block legitimate course text

**File:** `.github/.styles/BASIS/AIDisclaimer.yml:5, 12, 20`
**Issue:** The rule runs at `level: error`, and only errors fail `runner / vale`, which is a required check. Two tokens match ordinary prose. `'language model'` matches any chapter that discusses LLMs or AI features. `'let me know'` is a typical instructor phrase in course material converted from Moodle ("let me know if you get stuck"). Either one makes the required check fail and blocks the PR, with no workaround except inline `<!-- vale off -->`. `'as a large language model'` is redundant because `'language model'` already covers it. The comment on lines 7-10 still talks about "the webforj vocabulary".
**Fix:** Keep only the unambiguous chatbot phrases at error level, and move the broad ones to a separate warning-level rule:
```yaml
# AIDisclaimer.yml (error)
tokens:
  - 'as an? (?:AI|large) language model'
  - 'as of my last (?:knowledge )?(?:update|training)'
  - 'knowledge cut-?off'
  - 'my training data'
  - 'I cannot browse'
  - "I (?:don'?t|do not|cannot) have access to real-time"
  - "I(?:'m| am) unable to provide real-time"
```
Put `'let me know'` (and `'language model'` if wanted) in a warning-level rule. Update the comment so it refers to the BASIS vocabulary.

### WR-05: `AIVocab` flags "underscores", a common word in a programming course

**File:** `.github/.styles/BASIS/AIVocab.yml:12-13`
**Issue:** `underscor(?:es|ed|ing)` matches the plural noun "underscores", as in "variable names can contain underscores". That sentence is routine in BBj and DWC teaching material about identifiers, CSS classes and file names. Every such sentence gets a reviewdog comment. `underscore the` also matches "prefix the name with an underscore the way...". The rule cannot tell the verb from the noun.
**Fix:** Match only the verb in its usual filler contexts, or remove the entries:
```yaml
  - 'underscor(?:es|ed|ing) (?:the|its|their|how|why|that)\b(?! character)'
```
The simpler fix is to delete both `underscor*` tokens for this site.

### WR-06: The `Capitalization` lookbehind uses an accidental character range

**File:** `.github/.styles/BASIS/Capitalization.yml:9-11`
**Issue:** `[\#-/]` is a range from `#` (0x23) to `/` (0x2F), so it includes `#$%&'()*+,-./`. It was presumably meant to be the set `#`, `-`, `/`. As a result, `(webforj)`, `'webforj'`, `.webforj` and `"...,webforj"` are never flagged, while the lookahead `(?![-/])` uses a different set. The rule is also webforJ-specific and does nothing for BASIS terms (`BBj`, `DWC`, `BBjGridExWidget`), which are what this site actually needs.
**Fix:**
```yaml
swap:
  '(?<![#/-])webforj(?![-/])': webforJ
  '(?<![#/-])bbj(?![-/.])': BBj
```
Put `-` last in the class, or escape it as `\-`. Add BASIS product names here or through `Vale.Terms` (see WR-03).

### WR-07: `filter_mode: file` plus the admin bypass means Vale errors can reach `main` and never be reported

**File:** `.github/workflows/reviewdog.yml:25-26`, `.github/workflows/deploy.yml:3-6`
**Issue:** reviewdog only reports alerts in files the PR changes. Nothing runs Vale over the whole tree. Pushes to `main` (which admins can make directly, see WR-02) run only `deploy.yml`, which has no Vale step. Any error-level alert that lands on `main` that way stays there unnoticed until someone edits that file, and then it blocks an unrelated PR.
**Fix:** Add a full-tree Vale job that runs on `push: branches: [main]` and `workflow_dispatch`. For example, add a job to `test-build.yml` that runs `vale docs/docs` with the pinned version. Do not add it as a required check, so it does not block PRs; use it as a backstop. Alternatively, keep WR-02's bypass narrowed to `pull_request`.

### WR-08: The verify script's "not linted (D-08)" check almost cannot fail

**File:** `tools/verify-phase2.sh:117-124`
**Issue:** The check passes in three cases:
- The first regex matches. Its first alternative needs `warnings?, and`, with a comma Vale does not print, so it never matches. The second alternative matches any clean run, including one where the file *was* linted.
- No line matches `^ *[0-9]+:[0-9]+ `. This includes the case where Vale crashed or printed a config error, which passes through the final `else`.

The check only fails when Vale lints the file and finds an alert. So it does not verify D-08 ("CONTRIBUTING.md and CLAUDE.md are not linted"). It verifies "these files currently have no alerts, or Vale failed".
**Fix:** Check that no style applies to the file, using Vale's config resolution:
```bash
out="$("$VALE" ls-config 2>/dev/null)"   # or: "$VALE" --output=JSON "$f"
# Better: run against a probe copy that contains 'oaicite' outside docs/docs and require rc==0 and no BASIS.AIArtifacts.
cp "$f" "$tmpf"; printf '\noaicite\n' >> "$tmpf"   # tmpf placed at repo root, not under docs/docs
if out="$("$VALE" "$tmpf" 2>&1)" && ! echo "$out" | grep -q 'BASIS\.'; then pass ...; else fail ...; fi
```
In any case, fail when Vale exits with a code other than 0 or 1.

### WR-09: `deploy.yml` can be dispatched from any branch, and the workflow has no ref guard

**File:** `.github/workflows/deploy.yml:6, 41-53`
**Issue:** `workflow_dispatch` lets anyone with write access pick any branch in the "Run workflow" dialog. The only thing stopping an unreviewed branch from being published is the `github-pages` environment's deployment-branch policy, which is repository settings state. It is not in the repo and is not checked by `verify-phase2.sh`. If someone loosens that policy, or a new environment is created, unreviewed content can go live.
**Fix:** Add a guard in the workflow:
```yaml
  deploy:
    if: github.ref == 'refs/heads/main'
```
Optionally, have `section_deploy` check `gh api repos/$REPO/environments/github-pages` for `deployment_branch_policy`.

### WR-10: The reviewdog checkout leaves the token in `.git/config` while third-party code runs

**File:** `.github/workflows/reviewdog.yml:16`
**Issue:** `deploy.yml` and `test-build.yml` set `persist-credentials: false`, but `reviewdog.yml` does not. This job has the broadest token of the three (`pull-requests: write`), and it is also the job that runs third-party code (vale-action, which downloads Vale and reviewdog binaries at runtime). The action already gets `GITHUB_TOKEN` through `env`, but persisting it in `.git/config` exposes it to every later step and process for no reason. Most often this is a hygiene issue rather than a direct exploit, but it is an inconsistency with the other two workflows.
**Fix:**
```yaml
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
```

## Info

### IN-01: The installer leaves its temporary directory behind on failure, and the version match is a loose regex

**File:** `tools/install-lint-tools.sh:29, 34-38`
**Issue:** With `set -e`, a failed `curl` exits before `rm -rf "$tmp"` runs, so `/tmp` fills with partial downloads. `grep -q "$version"` treats the dots as wildcards, and it also matches a version string that merely contains the target (for example `13.24.0`).
**Fix:** Add `trap 'rm -rf "$tmp"' RETURN` (or an `EXIT` trap) inside `install_tool`, and use `grep -qF -- "$version"`.

### IN-02: The actionlint fallback skips the version check

**File:** `tools/verify-phase2.sh:48-49, 55`
**Issue:** `tools/.bin/actionlint` is used without checking its version, and `section_tools` reports "actionlint available" for any version. Vale gets a version check.
**Fix:** Apply the same `1\.7\.12` check as for Vale, and fail with "run install-lint-tools.sh" when it does not match.

### IN-03: The deploy-from-probe-branch check only looks at the last 20 runs

**File:** `tools/verify-phase2.sh:262`
**Issue:** `gh run list` returns 20 runs by default. Once more than 20 deploys have happened, a probe-branch deploy would no longer be visible, and the check would pass falsely.
**Fix:** Add `-L 500` or filter with `--branch`, or query `gh api "repos/$REPO/actions/workflows/deploy.yml/runs?branch=ci-probe/..."`.

### IN-04: The verify script loops over unquoted URL lists, which allows glob expansion

**File:** `tools/verify-phase2.sh:195, 203, 208, 224, 229`
**Issue:** `for url in $urls` splits on whitespace and expands globs. A URL containing `*`, `?` or `[` (query strings are common on asset URLs) could expand to matching local file names.
**Fix:** Use `set -f` around these loops, or `while IFS= read -r url; do ...; done <<< "$urls"`.

### IN-05: The Vale probe can overwrite a real file and leaves an empty directory behind

**File:** `tools/verify-phase2.sh:13, 109-113`
**Issue:** `PROBE=docs/docs/dwc/99-vale-probe.mdx` is overwritten and deleted without checking whether it already exists. `mkdir -p docs/docs/dwc` is never undone.
**Fix:** Abort if `$PROBE` exists beforehand. Use a name that cannot clash with content, for example `docs/docs/.vale-probe-$$.mdx` (check that the glob still matches it).

### IN-06: First-party actions are pinned to mutable major tags, and jobs have no timeouts

**File:** `.github/workflows/deploy.yml:23,27,37,53`, `.github/workflows/test-build.yml:22,26`, `.github/workflows/reviewdog.yml:16`
**Issue:** `actions/*@v7` and `@v5` are moving tags, while vale-action is SHA-pinned. The inconsistency is acceptable for GitHub-owned actions but worth recording. No job sets `timeout-minutes`, so a hung build runs for up to 6 hours.
**Fix:** Optionally SHA-pin with a version comment, and let Dependabot (`github-actions` ecosystem) keep the pins updated. Add `timeout-minutes: 15` to each job.

### IN-07: `Packages = Google` is unpinned and conflicts with the vendored copy

**File:** `.vale.ini:5`, `.github/workflows/reviewdog.yml:27`
**Issue:** CI uses `sync: "false"` and the vendored `.github/.styles/Google`, but a local `vale sync` replaces that copy with the latest Google release, without warning. Local results then differ from CI, and `git status` shows unexpected changes.
**Fix:** Remove the `Packages` line, since the style is vendored, or pin it to a release zip URL.

### IN-08: The `EmDashes` rule allows one em dash, but CONTRIBUTING says to use none

**File:** `.github/.styles/BASIS/EmDashes.yml:5-7`
**Issue:** `max: 1` per document at warning level allows one em dash, while CONTRIBUTING says "Do not use em dashes". The message is ungrammatical ("on this article"), and the rule overlaps with `Google.EmDash`.
**Fix:** Use an `existence` rule with token `'—'` and the message "Do not use em dashes; rewrite the sentence."

### IN-09: The raw regexes in `BeDirect` have no word boundaries

**File:** `.github/.styles/BASIS/BeDirect.yml:13-16`
**Issue:** Vale does not add `\b` to `raw` rules. As a result, `ensur…` matches inside "censured the", and `(?:e|ed|es|ing)?` after `crucial for` is meaningless. The trailing `|` concatenation is fragile: one missing `|` silently merges two alternatives.
**Fix:** Wrap the expression: `\b(?:(?:enhanc|ensur|optimiz)(?:e|ed|es|ing)|crucial for) (?:the user |the |user )?\w+(?: and \w+)?\b|...`.

### IN-10: Gaps in `.gitignore` and `.editorconfig` for the upcoming converter work

**File:** `.gitignore:1-11`, `.editorconfig:6-20`
**Issue:** The repo gets a Python converter in a later phase, but:
- `.gitignore` does not cover `.venv/`, `venv/`, `.env`, `npm-debug.log*` or `*.mbz` outside `/import/`. The verify script checks that no `.mbz` is tracked, but nothing stops one being added.
- `.editorconfig` forces 2-space indentation on `*.py`, which contradicts PEP 8 (4 spaces).
- `insert_final_newline = false` for Markdown and MDX produces files without a trailing newline, which makes diffs noisy.
**Fix:** Add `*.mbz`, `.venv/`, `.env` and `npm-debug.log*` to `.gitignore`. Add `[*.py] indent_size = 4` to `.editorconfig`. Consider `insert_final_newline = true` for `*.md` and `*.mdx`.

---

_Reviewed: 2026-10-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
