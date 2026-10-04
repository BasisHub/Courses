---
phase: 04-dwc-book-relocation
fixed_at: 2026-10-04T00:00:00Z
review_path: .planning/phases/04-dwc-book-relocation/04-REVIEW.md
iteration: 1
findings_in_scope: 17
fixed: 17
skipped: 0
status: all_fixed
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-10-04
**Source review:** .planning/phases/04-dwc-book-relocation/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 17 (fix_scope: all)
- Fixed: 17
- Skipped: 0

## Fixed Issues

### CR-01: "intro-bbj sidebar omits dwc chapter" always passes

**Files modified:** `tools/verify-phase1.sh`, `tools/verify-phase2.sh`, `tools/verify-phase3.sh`
**Commit:** 7541675
**Applied fix:** The missing space was already fixed in ca18fe2, before this run. This commit adds the hardening the review asked for: `check()` now runs commands with `</dev/null`, so a grep that is missing its file fails fast instead of hanging or passing. verify-phase4 got the same change in IN-06. No negative probe was added to the suite. A manual run of the sidebar assertions against the new build passes.

### WR-01: Relocation proof accepts any change of a link target

**Files modified:** `tools/check-dwc-relocation.py`
**Commit:** a7fedfd
**Status:** fixed: requires human verification (logic change)
**Applied fix:** Added `route_of`, `expected_target` and a pairwise `targets_ok(old, new, new_rel, routes)`. A changed target passes only if it exactly matches the rewrite that relocate-dwc.py produces. External, `#`, `./img/` and whitespace targets must stay unchanged. The rule is reimplemented in the checker on purpose, so the proof does not depend on the script it checks. `--rev 542399a` still passes. All three false-pass examples from the review now return False.

### WR-02: `sync-samples.py --check` never verifies the compressed payload

**Files modified:** `tools/sync-samples.py`
**Commit:** 94983f5
**Applied fix:** Added `payload_error()`, which runs `testzip()` and catches BadZipFile, zlib.error and OSError. `--check` calls it after the manifests match. `compress_type` is now part of the manifest. Probe: a ZIP with one corrupted data byte has a manifest that matches, and the check now reports it as unreadable.

### WR-03: Deploy path never runs the samples drift check

**Files modified:** `.github/workflows/deploy.yml`, `tools/verify-phase4.sh`
**Commit:** cf77941
**Applied fix:** Added a `python3 ../tools/sync-samples.py --check` step to deploy.yml, before `npm run build`. verify-phase4 now checks that the step exists. Making test-build a required status check is a GitHub setting and was left alone.

### WR-04: No `.gitattributes`

**Files modified:** `.gitattributes` (new file)
**Commit:** 16d0b0a
**Applied fix:** Added `docs/examples/** text eol=lf` and marked zip/png/gif/jpg/ico as binary. All 51 tracked sample files are already LF or contain no line endings, so nothing was renormalized and `--check` still passes.

### WR-05: `relocate-dwc.py` has no guard against re-running

**Files modified:** `tools/relocate-dwc.py`
**Commit:** affcbc5
**Applied fix:** `check_not_committed()` runs before anything else. If `git log --fixed-strings` finds a commit whose subject exactly matches the relocation subject, the script exits 2. `--force` overrides the guard, and any other argument prints usage and exits 2. Tested: without `--force` the script stops at the guard.

### WR-06: Book argument is not validated

**Files modified:** `tools/sync-samples.py`
**Commit:** 6b03efc
**Applied fix:** `validate_book()` requires a book name to match `[a-z0-9][a-z0-9-]*` and to resolve directly under `docs/examples` and `docs/static/files`. It runs on explicit and auto-discovered books, and discovery now skips dot directories. Tested: `../..`, `.`, `..` and `Dwc` exit 2. `dwc` passes.

### WR-07: `--no-build` staleness check ignores sidebars and package files

**Files modified:** `tools/verify-phase4.sh`
**Commit:** aaea93d
**Applied fix:** Added `docs/sidebars.js docs/package.json docs/package-lock.json` to the `find` roots.

### IN-01: Generated ZIPs get file mode 0600

**Files modified:** `tools/sync-samples.py`
**Commit:** 84f98b2
**Applied fix:** `os.chmod(tmp, 0o644)` now runs before `os.replace`, and the temp file is deleted on any error. Tested by writing ZIPs to a scratch directory: the files get mode 0644 and no `.tmp` files are left. Note: the ZIPs in the main working tree are still `-rw-------` because sync skips unchanged files. `chmod 644 docs/static/files/dwc/*.zip` fixes them locally. Git only tracks the exec bit, so nothing needs committing.

### IN-02: Untracked or ignored files end up in the ZIPs

**Files modified:** `tools/sync-samples.py`
**Commit:** 753c226
**Applied fix:** Added `tracked_files()`, which runs `git ls-files -z`. `collect()` and the folder list only include tracked files. LICENSE and README.md must be tracked. The docstring tells you to `git add` new samples before you sync. Tested: an untracked `x.bbj~` no longer affects `--check`.

### IN-03: Docstring wrong about where `--rev` reads images

**Files modified:** `tools/check-dwc-relocation.py`
**Commit:** eec1a19
**Applied fix:** The docstring now says that `--rev` reads the pages, the image map and the images from the revision.

### IN-04: `git ls-tree` output split on whitespace

**Files modified:** `tools/check-dwc-relocation.py`
**Commit:** b38b096
**Applied fix:** Changed to `ls-tree -r -z --name-only` with a NUL split. Check B's file set still passes on 542399a.

### IN-05: Commit-1 lookup is an unanchored regex

**Files modified:** `tools/verify-phase4.sh`
**Commit:** 6ad357d
**Applied fix:** The lookup now runs `--fixed-strings --grep` on the full subject, and awk keeps only commits whose subject matches exactly. It resolves to 542399a.

### IN-06: `check()` hides all checker output in verify-phase4

**Files modified:** `tools/verify-phase4.sh`
**Commit:** 3666d69
**Applied fix:** `check()` now captures the checker output. On failure it prints the indented `FAIL` lines, or the last 20 lines if there are none. Commands run with stdin from `/dev/null`. The helper was tested in a standalone harness.

### IN-07: `snapshot-dwc-site.py` crashes on edge input and writes before validating

**Files modified:** `tools/snapshot-dwc-site.py`
**Commit:** e48c99c
**Applied fix:** The script now rejects a sitemap it cannot parse, an empty `<loc>` and a missing page HTML with exit 2 and a message. It writes the outputs only after the 28/27 check passes. Rerunning against the old build into a scratch directory gives output byte-identical to the committed snapshot. A run with missing pages writes nothing.

### IN-08: Anchor and route checkers pass on an empty snapshot

**Files modified:** `tools/check-dwc-anchors.py`, `tools/check-dwc-routes.py`
**Commit:** a6b2c90
**Applied fix:** Both checkers now confirm that the snapshot's listed content routes and anchors are non-zero and match `content_routes` and `anchor_count`. The anchor checker also fails when it checked nothing. Both still pass on the real snapshot and fail on an empty one.

### IN-09: `prerequisites.mdx` keeps a content H1

**Files modified:** `docs/docs/dwc/prerequisites.mdx`, `docs/docs/dwc/02-browser-developer-tools/index.md`, `docs/docs/dwc/04-upgrading-apps/index.md`, `docs/docs/dwc/06-flow-layouts/index.md`
**Commit:** 4e99109
**Applied fix:** Removed the four content H1s, so pages now take their heading from the front-matter `title`. The prerequisites "read first" note became a `:::info` admonition. The snapshot has no h1 anchors, and the anchor check still passes (306 present, 1 allowlisted). Vale on these files: 0 errors, and warnings dropped from 40 to 36. The relocation proof is unaffected because it reads commit 542399a. The visible chapter headings are now the shorter front-matter titles (for example "Flow Layouts and CSS for Responsive Design").

## Verification after fixes

- `cd docs && npm run build`: passes; the only warning is the known benign postcss-calc one.
- `check-dwc-routes.py`, `check-dwc-anchors.py`, `sync-samples.py --check` (11 PASS), `check-dwc-relocation.py --rev 542399a`: all pass.
- `tools/.bin/vale --minAlertLevel=error docs/docs`: 0 errors in 31 files.
- Hand-run phase-1 sidebar isolation assertions: pass.
- `bash tools/verify-phase1.sh`, `verify-phase2.sh --local`, `verify-phase3.sh`, `verify-phase4.sh`, `prove-gates.sh`: NOT run. The fixer session was denied permission to execute these scripts. Run them before committing this report.

---

_Fixed: 2026-10-04_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
