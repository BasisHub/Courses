---
phase: 04-dwc-book-relocation
reviewed: 2026-10-04T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - tools/sync-samples.py
  - tools/relocate-dwc.py
  - tools/check-dwc-relocation.py
  - tools/check-dwc-routes.py
  - tools/check-dwc-anchors.py
  - tools/snapshot-dwc-site.py
  - tools/verify-phase4.sh
  - tools/verify-phase1.sh
  - tools/verify-phase2.sh
  - tools/prove-gates.sh
  - .github/workflows/test-build.yml
  - docs/docs/dwc/00-overview.mdx
  - docs/docs/dwc/samples.mdx
  - docs/docs/dwc/prerequisites.mdx
  - docs/docs/dwc/resources.mdx
  - docs/docs/dwc/10-embedding-components/_category_.json
findings:
  critical: 1
  warning: 7
  info: 9
  total: 17
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-10-04
**Depth:** standard
**Files Reviewed:** 16 (verify-phase1.sh, verify-phase2.sh, prove-gates.sh: only lines changed since 5a99edc^)
**Status:** issues_found

## Summary

The relocation tooling is mostly careful. Tar members are screened for `..`, absolute paths and links. ZIP names go through `safe_arcname`. `sync-samples.py --check` compares a manifest (name, size, CRC, date, mode) rather than raw bytes, so a different zlib on ubuntu-latest does not cause false drift. CI portability of `--check` holds on Linux.

The real defects are in the gates. One edited check in `verify-phase1.sh` lost a space and now passes no matter what the page contains. The relocation checker accepts any rewrite of a link target. `sync-samples.py --check` never reads the compressed payload. The deploy path never runs the sample check. There is also no line-ending pin for the samples, so a Windows checkout produces ZIPs that CI rejects.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: "intro-bbj sidebar omits dwc chapter" always passes (missing space fuses pattern and filename)

**File:** `tools/verify-phase1.sh:67`
**Issue:** The Phase 4 edit replaced `first-chapter' '$BUILD...` with `gui-to-bui-to-dwc''$BUILD...`, which drops the space between the two quoted words. Inside `bash -c`, adjacent quoted strings join into one word. grep therefore receives a single pattern argument (`/Courses/docs/dwc/gui-to-bui-to-dwc/abs/path/.../overview.html`) and no file, so it reads stdin.
- Non-interactive runs (CI, agents, `</dev/null`, pipes): stdin is empty, `grep -q` exits 1, and `!` turns that into 0. The check PASSES even when the intro-bbj sidebar does link to the DWC chapter. It is a gate that cannot fail.
- Interactive terminal: grep waits on the TTY, so the suite appears to hang until the user presses Ctrl-D, and then it passes anyway.

This is why "the full verify suite passes" does not prove sidebar isolation.
**Fix:**
```bash
check "intro-bbj sidebar omits dwc chapter" bash -c "test -f '$BUILD/docs/intro-bbj/overview.html' && ! grep -q '/Courses/docs/dwc/gui-to-bui-to-dwc' '$BUILD/docs/intro-bbj/overview.html'"
```
To catch this class of bug, also redirect stdin in `check()`: `if "$@" </dev/null >/dev/null 2>&1`. A grep that is missing its file then fails fast instead of hanging. Also add a negative probe: inject the link into a copy of the page and assert that the check FAILs.

## Warnings

### WR-01: Relocation proof accepts any change of a link target (false pass in Check A)

**File:** `tools/check-dwc-relocation.py:113-114` (with `targets_ok` at 98-99)
**Issue:** `explains()` counts a changed line as allowed whenever the line is equal to the old line after every `](...)` target is blanked, and every new target starts with `./` or `#`. The checker never checks that the new target is the rewrite that `relocate-dwc.py` would produce. All of the following pass as a "pure relocation":
- `[Docs](https://documentation.basis.cloud/...)` changed to `[Docs](./samples.mdx)`, which replaces an external link with an internal one
- `[Hello](../hello-world)` changed to `[Hello](./03-wrong-page.md#x)`, a link to the wrong page
- `![alt](./img/a.png)` changed to `![alt](./img/b.png)`, an image swap on an already-converted line

The whole point of Check A (D-01: every hunk explained by one rule) is weakened.
**Fix:** Recompute the expected target with the same `route_of`/`relpath` logic as `relocate-dwc.py` (move it into a shared helper) and require an exact match. For example, build `routes = {route_of(n): n for _, n in pages}`. Then, for each old/new target pair in order, require `old` to be a resolvable internal route and `new == expected_rel(old, new_rel)`. Leave external, `#` and `./img/` targets unchanged.

### WR-02: `sync-samples.py --check` never verifies the compressed payload

**File:** `tools/sync-samples.py:116-122, 156-168`
**Issue:** `manifest()` reads only central-directory metadata (`filename, file_size, CRC, date_time, external_attr`). It never decompresses anything. A committed ZIP with a truncated or corrupted data stream, or with local headers that disagree with the central directory, still has a matching manifest. The check reports PASS plus an `INFO bytes differ` line. CI then ships an archive that users cannot extract. The manifest approach is right for zlib portability, but it needs a payload check alongside it.
**Fix:** When the manifests are equal, decompress and compare:
```python
with zipfile.ZipFile(target) as zf:
    bad = zf.testzip()  # verifies every CRC against the decompressed data
    if bad is not None:
        print("FAIL  " + label + ": corrupt entry " + bad); ok = False; continue
```
Also consider adding `compress_type` to the manifest tuple, so that a STORED archive does not pass as equivalent.

### WR-03: Deploy path never runs the samples drift check

**File:** `.github/workflows/test-build.yml:35`; `.github/workflows/deploy.yml` (no matching step)
**Issue:** `sync-samples.py --check` runs only in `test-build.yml`, which is triggered only by `pull_request`/`workflow_dispatch`. `deploy.yml` builds and publishes on every push to `main` and has no check. A direct push to main, or a PR merged before the check finished or with checks not required, deploys ZIPs that are out of sync with `docs/examples/`. That breaks the "keep both in sync" rule in CLAUDE.md without any signal.
**Fix:** Add `- run: python3 ../tools/sync-samples.py --check` before `npm run build` in `deploy.yml`'s build job. Optionally, also make the test-build job a required status check on `main`.

### WR-04: No `.gitattributes`, so sample line endings depend on the contributor's git config

**File:** repository root (missing `.gitattributes`); affects `tools/sync-samples.py:64` and CI step `test-build.yml:35`
**Issue:** The ZIPs embed raw working-tree bytes, and their CRCs are what `--check` compares. All 49 text samples are stored LF (`git ls-files --eol`). On a Windows clone with `core.autocrlf=true`, the files are checked out as CRLF. Running `sync-samples.py` there rewrites every ZIP with CRLF content, and CI on ubuntu then fails all 11 archives with "first difference". Running `--check` locally on that machine fails as well. The tool is reproducible only on LF checkouts.
**Fix:** Add a root `.gitattributes`:
```
docs/examples/** text eol=lf
*.zip binary
*.png binary
```
Alternatively, normalize CRLF to LF in `collect()` for known text extensions. The `.gitattributes` route is cleaner.

### WR-05: `relocate-dwc.py` has no guard against re-running after commit 1

**File:** `tools/relocate-dwc.py:143-156`
**Issue:** The docstring says the script is "Re-runnable only until commit 1 of Phase 4 exists". Nothing enforces that. A later run `rmtree`s every `docs/docs/dwc/[0-1][0-9]-*` directory, deletes `prerequisites/samples/resources.mdx`, wipes `tools/data/dwc-unused-img/`, and rewrites everything from 965da6d. That silently destroys the D-05 Vale fixes and every later edit to the book. Git only saves uncommitted work if it was committed.
**Fix:** Refuse to run once the relocation commit is in history, or when the target tree has changes:
```python
if subprocess.run(["git", "-C", str(ROOT), "log", "-1", "--format=%H",
                   "--grep=^feat(04-03): relocate DWC-Course"], capture_output=True, text=True).stdout.strip() \
   and "--force" not in sys.argv:
    fail("relocation already committed; the Markdown is now the source of truth (use --force to override)", 2)
```

### WR-06: Book argument is not validated (path traversal plus `unlink` of `*.zip`)

**File:** `tools/sync-samples.py:84-87, 125-142, 184`
**Issue:** `book` is taken unchanged from argv and joined to `EXAMPLES` and `STATIC`. Running `python3 tools/sync-samples.py ../..` resolves the source to the repo root, which has a `LICENSE` and a `README.md`, so it passes the BOOK_FILES check. It then zips every top-level repo directory (including `docs/` with `node_modules`) and writes into `docs/static/files/../..` = `docs/`. Finally it deletes every `*.zip` in that directory that is not in `want`. Even a typo such as `.` or `..` points the write-and-delete logic at the wrong directory.
**Fix:**
```python
import re
for b in books:
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", b) or not (EXAMPLES / b).resolve().is_relative_to(EXAMPLES.resolve()):
        die("invalid book name: " + b)
```
Also apply this to auto-discovered books, which currently include any dot directory under `docs/examples/`.

### WR-07: `--no-build` staleness check ignores `docs/sidebars.js` and package files

**File:** `tools/verify-phase4.sh:43`
**Issue:** The freshness probe looks only at `docs/docs docs/src docs/static docusaurus.config.js`. `docs/sidebars.js` drives the sidebar order that `check-dwc-routes.py` asserts, and `package.json`/`package-lock.json` decide the Docusaurus version. Neither is included. After a sidebar edit, `--no-build` reports "existing build is newer than its sources" and then checks the routes and order of an old build. That is a false pass for the routes section.
**Fix:** Add `docs/sidebars.js docs/package.json docs/package-lock.json` to the `find` roots.

## Info

### IN-01: Generated ZIPs get file mode 0600 locally

**File:** `tools/sync-samples.py:134-137`
**Issue:** `tempfile.mkstemp` creates the file with mode 0600, and `os.replace` keeps that mode. The working tree now holds `-rw-------` ZIPs, which the build copies as-is. Git still records 100644, so CI is not affected. A local static server running as another user would return 403. On a write error, the temp file is also leaked.
**Fix:** Call `os.chmod(tmp, 0o644)` before `os.replace`, and unlink `tmp` in a `try/except`.

### IN-02: Untracked or ignored files end up in the ZIPs

**File:** `tools/sync-samples.py:52-65`
**Issue:** `collect()` walks the working tree and skips only dotfiles. Editor backups (`*.bbj~`, `*.bak`), `Thumbs.db` and gitignored artifacts are packed and can be committed. CI then fails with an entry-count mismatch, which is a confusing local/CI divergence.
**Fix:** Build the file list from `git ls-files -z docs/examples/<book>` instead of `os.walk`.

### IN-03: Docstring wrong about where `--rev` reads images

**File:** `tools/check-dwc-relocation.py:10-11` vs `208-212`
**Issue:** The docstring says images are always read from the working tree. With `--rev`, the code reads them from the revision through `git show`, which is the better behavior.
**Fix:** Correct the docstring.

### IN-04: `git ls-tree` output split on whitespace and subject to quotePath

**File:** `tools/check-dwc-relocation.py:92-93`
**Issue:** `out.split()` breaks paths that contain spaces. git also quotes non-ASCII paths unless `-z` is used. In both cases Check B reports spurious extra or missing files.
**Fix:** Use `git ls-tree -r -z --name-only` and `split("\0")`.

### IN-05: Commit-1 lookup is an unanchored regex and takes the newest match

**File:** `tools/verify-phase4.sh:66`
**Issue:** `--grep` treats the text as a regex (`.` matches any character) and matches anywhere in the message. A later "Revert ..." or a docs commit that quotes the subject would become `C1`, and the relocation check would then run against the wrong commit.
**Fix:** Use `--grep='^feat(04-03): relocate DWC-Course book' -F`-style anchoring (or `--fixed-strings` on the full subject), or pin the SHA in `tools/data/`.

### IN-06: `check()` hides all checker output in verify-phase4

**File:** `tools/verify-phase4.sh:22-25, 60-61, 72, 76`
**Issue:** When `check-dwc-routes.py`, `check-dwc-anchors.py`, `check-dwc-relocation.py` or `sync-samples.py --check` fail, all you see is `FAIL [routes] anchors`. The detailed FAIL lines are sent to `/dev/null`.
**Fix:** Capture the output and print the `FAIL` lines (or `tail -20`) when the check fails, as the build step already does.

### IN-07: `snapshot-dwc-site.py` crashes on edge input and writes before validating

**File:** `tools/snapshot-dwc-site.py:61-63, 77-79, 93-97`
**Issue:** `e.text.strip()` raises on an empty `<loc>`. A missing page HTML raises an uncaught `FileNotFoundError`. The sitemap copy and `dwc-old-routes.json` are written before the 28/27 count assertion, so a failed run still overwrites the committed snapshot.
**Fix:** Guard `e.text`, check `page.is_file()`, and write the outputs only after the count check passes.

### IN-08: Anchor and route checkers pass on an empty snapshot

**File:** `tools/check-dwc-anchors.py:76-81`, `tools/check-dwc-routes.py:79-91`
**Issue:** With zero snapshot routes or anchors, both checkers print PASS (`0 old anchors present`). verify-phase4 asserts 27/307 separately, but run on their own the checkers can pass vacuously.
**Fix:** Fail when `checked == 0`, or assert the snapshot's `content_routes`/`anchor_count` fields.

### IN-09: `prerequisites.mdx` keeps a content H1 that conflicts with front matter

**File:** `docs/docs/dwc/prerequisites.mdx:7`
**Issue:** `# Prerequisites - READ FIRST.` breaks the project rule "Content headings start at H2". The rendered page heading also differs from the front-matter `title: Prerequisites`. The old snapshot records no h1 anchor for `/prerequisites`, so removing the line does not break any redirect anchor.
**Fix:** Delete the H1, or move the "read first" note into an admonition. Three relocated chapter `index.md` files (02, 04, 06) have the same pattern and should be handled in the same pass.

---

_Reviewed: 2026-10-04_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
