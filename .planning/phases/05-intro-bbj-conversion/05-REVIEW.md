---
phase: 05-intro-bbj-conversion
reviewed: 2026-10-04T08:08:22Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - tools/moodle2docusaurus.py
  - tools/check-intro-bbj.py
  - tools/check-mdx.mjs
  - tools/verify-phase5.sh
  - tools/verify-phase3.sh
findings:
  critical: 1
  warning: 6
  info: 9
  total: 16
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-10-04T08:08:22Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Narrative Findings (AI reviewer)

## Summary

I reviewed the one-shot Moodle converter, the Phase 5 checker, the MDX compile helper, the Phase 5 verify script and the Phase 3 verify change. I ran the converter into a scratch directory (all counts match, every unresolved counter is zero, MDX passes) and ran `check-intro-bbj.py all` (0 failures). I also probed edge cases directly.

The converter's security controls hold. Tar extraction rejects `..`, absolute paths and links, and uses `filter="data"`. Output paths stay inside the two allowed dirs. Hrefs pass a scheme allowlist, YouTube IDs must match the id regex, and content hashes are regex-checked before they become paths. I found no injection or traversal path.

The defects sit mostly in the verification layer. The main one: `verify-phase5.sh` prints PASS for checks the checker skipped. The checker also fails on macOS `.DS_Store` files, and some error paths crash or leave the tree half-written.

## Critical Issues

### CR-01: verify-phase5.sh reports PASS for checks that were skipped (CONV-07 reproducibility, Vale, built routes)

**File:** `tools/verify-phase5.sh:21-28`, `tools/check-intro-bbj.py:496-498, 510-512, 318-319, 576-577`
**Issue:** `check-intro-bbj.py` handles missing preconditions by printing `SKIP ...` and returning `c.done()`. With zero failed checks, that returns 0. Four cases do this:
- `commits` when the C1/C2 subjects are not in HEAD's history (after a squash merge or a reworded commit, for example).
- `commits` reproducibility when `.venv` or `import/*.mbz` is missing. `import/` is never committed, so this always skips in CI and on fresh clones.
- `edits` when `tools/.bin/vale` is missing.
- `structure` when `docs/build` is missing.

`verify-phase5.sh`'s `check()` prints only `PASS` on exit 0 and throws the output away, so the SKIP lines never show. The suite then prints "Phase 5: all checks passed", and the CONV-07 gate shows "PASS [commits] converter and generated docs commits (CONV-07)" even when it checked nothing. A gate that reports success for work it did not do is incorrect behavior.
**Fix:** Make a skip visible and distinguishable. For example, give skips their own exit code in the checker and map it in the shell:
```python
# check-intro-bbj.py
class Ctx:
    def __init__(self, name): ...; self.skipped = 0
    def skip(self, msg): self.skipped += 1; print(f"SKIP {msg}")
    def done(self):
        print(f"{self.name}: {self.checks} checks, {self.failed} failed, {self.skipped} skipped")
        return 1 if self.failed else (3 if self.skipped else 0)
```
```bash
# verify-phase5.sh check()
out=$("$@" </dev/null 2>&1); rc=$?
case $rc in
  0) pass "$name" ;;
  3) skip "$name"; printf '%s\n' "$out" | grep '^SKIP' | sed 's/^/    /' ;;
  *) fail "$name"; ... ;;
esac
```
Have `main()` merge the codes so that 1 wins over 3. If the commits check is meant to be mandatory, use `fail` when C1/C2 are absent, not a skip.

## Warnings

### WR-01: Checker fails on macOS `.DS_Store` and other untracked files

**File:** `tools/check-intro-bbj.py:225-230, 399-402, 411, 436`
**Issue:** `structure`, `content` and `samples` scan the working tree with `rglob("*")` and `iterdir()`. They do not limit the scan to tracked files. `.DS_Store` is gitignored, but Finder creates it whenever someone browses a folder on the macOS dev box. Reproduced with a scratch copy:
```
FAIL .DS_Store: unexpected file
FAIL 03-web-development/img/.DS_Store: unexpected file
FAIL 03-web-development/img/.DS_Store: image not referenced by any page
```
The same happens in `docs/examples/intro-bbj` (unexpected file, plus the CR/newline checks run on binary data) and in `docs/static/files/intro-bbj`. In the other direction, an untracked stray file inside the book also counts as present, so the gate does not verify what is committed.
**Fix:** Skip dotfiles, or list only git-tracked files when `--root` is the repository:
```python
def tree_files(base):
    return {p.relative_to(base).as_posix() for p in base.rglob("*")
            if p.is_file() and not any(part.startswith(".") for part in p.relative_to(base).parts)}
```
Apply the same filter in the `img` loop at line 400 and the ZIP listing at line 436.

### WR-02: Converter deletes the book before validating, so a failure leaves the tree half-written

**File:** `tools/moodle2docusaurus.py:914` (with fail paths at 492, 839-862, and tracebacks in `Backup`/`convert`)
**Issue:** `out.clean()` runs `shutil.rmtree` on `docs/docs/intro-bbj` and `docs/examples/intro-bbj` before any page is converted. Many later steps call `fail()` (`sys.exit`) or can raise: the chapter 24 regex repair, `write_samples` resource and ZIP checks, `KeyError` on a malformed image-map entry, and `FileNotFoundError` when `node` is missing at line 1045. Any of these leaves the output partly deleted and partly regenerated. With `--force` into the repo (the documented override after C2), that wipes the hand edits from commits 3 to 5. git can recover them, but only if they were committed.
**Fix:** Write into a temp dir and swap it in only on success:
```python
staging = pathlib.Path(tempfile.mkdtemp(prefix="intro-bbj-out-"))
run(backup, Out(staging), args)            # all writes and checks here
# on success only:
for sub in ("docs/docs/intro-bbj", "docs/examples/intro-bbj"):
    dst = out_root / sub
    if dst.exists(): shutil.rmtree(dst)
    shutil.copytree(staging / sub, dst)
```
Have `run()` return the "bad" flag instead of calling `sys.exit` inside it, so the swap can depend on that flag.

### WR-03: The re-run guard depends on one exact commit subject being in HEAD's history

**File:** `tools/moodle2docusaurus.py:798-804, 885-886`
**Issue:** `check_not_committed()` refuses only if a commit whose subject is exactly `feat(05-04): generate intro-bbj book ...` is reachable from HEAD. A squash merge of the PR replaces that subject with the PR title. Checking out a branch that does not contain C2 has the same effect. Either way the guard silently disarms, and a plain `python tools/moodle2docusaurus.py` then deletes the hand-edited Markdown (WR-02). That is the exact situation the guard exists to prevent ("After that the Markdown is the source of truth"). `check-intro-bbj.py commits` keys on the same subjects and then SKIPs (CR-01).
**Fix:** Check the state of the tree instead of history. For example, refuse when `git ls-files docs/docs/intro-bbj` lists any `.mdx` (the Phase 1 stubs were `.md`). Or commit a sentinel such as `docs/docs/intro-bbj/.generated-by-moodle2docusaurus` and refuse when it is tracked:
```python
r = subprocess.run(["git", "-C", str(REPO), "ls-files", "docs/docs/intro-bbj/*.mdx"], capture_output=True, text=True)
if r.returncode != 0 or r.stdout.strip():
    fail("intro-bbj pages are tracked; the Markdown is the source of truth (use --force)", 2)
```

### WR-04: A failed `git archive` falls through to `safe_extract` and crashes

**File:** `tools/check-intro-bbj.py:520-523`
**Issue:** When `git archive` fails, the code records a check failure and then still calls `safe_extract(a.stdout, ...)` on empty bytes. `tarfile.open(fileobj=BytesIO(b""), mode="r|")` raises `tarfile.ReadError: empty file` (verified). That gives an uncaught traceback, no `commits:` summary line, and leaves the temp dirs to the `finally`. The diff loop below it never runs.
**Fix:**
```python
if not c.check(a.returncode == 0, f"git archive of C2 failed: {a.stderr[-200:]!r}"):
    return c.done()
```

### WR-05: The syntax gate accepts any result except the literal "fail" and does not detect stale rows

**File:** `tools/check-intro-bbj.py:589-617`
**Issue:** The only per-row rule is `res != "fail"`, so `fail (fixed)`, `skipped`, `n/a`, `todo` or an empty cell all pass. Rows are keyed by `file#N` (fence ordinal) and carry no fingerprint of the code that was checked. If someone edits a `bbj` fence or a `.bbj` sample after the report is written, its `pass` row stays valid. The gate then certifies code that `bbj_check_syntax` never saw. That weakens the CLAUDE.md rule "Every `.bbj` under `docs/examples/` passes `bbj_check_syntax`". Reordering fences also silently re-maps results onto different code.
**Fix:** Allow only `{"pass", "not checkable"}`. Add a hash column, for example the first 12 hex digits of SHA-256 over the fence body or file bytes, and compare it with the current content:
```python
c.check(res in ("pass", "not checkable"), f"{path}: result {res!r} not allowed")
c.check(cells[3] == sha12(current_code(path)), f"{path}: code changed since the syntax check")
```

### WR-06: YouTube contract check misses embeds whose attributes come in another order

**File:** `tools/check-intro-bbj.py:112, 357-371`
**Issue:** `YT_RE` matches only `<YouTube id="..." title=...`. A hand-edited `<YouTube title="..." id="..." />`, an id that is not 11 characters, or a missing `title` never matches. Such an embed is invisible to the "exactly 10 ids, one per page, non-empty title" contract, so an extra, duplicate or title-less embed passes the gate. The Phase 3 contract makes `title` required.
**Fix:** Count every component occurrence and require that each one parses:
```python
tags = re.findall(r"<YouTube\b[^>]*/>", t, re.S)
c.check(len(tags) == len(list(YT_RE.finditer(t))), f"{rel}: <YouTube> tag not in id-then-title form")
```
Better still, parse `id` and `title` independently of their order.

## Info

### IN-01: Video titles and image alt text go into the MDX unescaped (fails closed)

**File:** `tools/moodle2docusaurus.py:593-594, 613, 619`
**Issue:** The video title (from the map or from oEmbed) and the image alt text are spliced in after `mdx_escape`. A title that contains both `"` and `'` produces `title='He said "hi" it's'`, and an alt text with `{` breaks the image. I verified both: `check-mdx.mjs` rejects them, so the converter exits 1 and does not ship bad output. The only way out is a code change, though, and the editorial maps cannot express such values.
**Fix:** Emit `title={JSON}` (for example `title={json.dumps(title)}`), which `YT_RE` already accepts. Reject `{}<>` in alt text at line 613, as `[]\n` already are.

### IN-02: `yaml_scalar` leaves YAML keywords and numbers unquoted

**File:** `tools/moodle2docusaurus.py:766-769`
**Issue:** `yaml_scalar("null")`, `("true")` and `("1.5")` return the bare value, which YAML parses as null, a boolean or a number. The current titles are safe, but the helper is not general.
**Fix:** Quote with `json.dumps` when `s.lower() in {"null","true","false","yes","no","~"}` or when `s` matches a numeric pattern. Or always use `json.dumps`.

### IN-03: A fence produced inside a list item loses its indentation

**File:** `tools/moodle2docusaurus.py:557-559, 760`
**Issue:** The fence placeholder is substituted after markdownify. For a `<code>` with `<br>` inside an `<li>`, the fence body lines come out unindented, which breaks the list. Probe output: `'- Step one\n\n  ```\na=1\nb=2\n```\n- two'`. Without a language it is caught as unclassified. With an override language it would ship a malformed list that still compiles. The current backup does not have this shape.
**Fix:** In `TOKEN.sub`, re-indent the raw text to the indentation of the token's line.

### IN-04: Latent limits in images and resources outside chapters

**File:** `tools/moodle2docusaurus.py:604-606, 1007-1027, 937`
**Issue:** `images_out` keys use the context key, which is a string for `assign6`, `resource11`, `intro1` and `course`. `image_map` and `chapter_images()` use int chapter ids from `mod_book`, so an image in an exercise or intro can never resolve. `resource_md[chapter]` also silently overwrites when two resources target the same chapter.
**Fix:** Assert at start-up that no non-chapter HTML contains `<img`, and that the RESOURCES chapter values are unique.

### IN-05: Dead code and unused parameters

**File:** `tools/moodle2docusaurus.py:633, 772-776, 470, 847`
**Issue:**
- `href.rstrip("/ ") if href.endswith(" ") else href` can never take the first branch, because `href` was `.strip()`ed at line 625.
- `front_matter(extra=...)` is never passed.
- `Ctx.backup` is never read.
- `import io` sits inside a loop.
- In `link_pass`, the localhost branch replaces the anchor with its URL and drops the link text. The only real case has text equal to the URL, so nothing is lost today.

**Fix:** Remove the dead branch, the unused parameter and the unused attribute. Hoist the import. Keep the anchor text: `code.string = href` plus the text if they differ.

### IN-06: Exit-code contract and runtime prerequisites are not enforced

**File:** `tools/moodle2docusaurus.py:18-19, 319, 341-384, 1045`
**Issue:** The docstring promises exit code 2 for missing input. A missing `course/course.xml`, `files.xml`, a non-numeric `itemid` or a missing `node` raises a traceback instead, which exits 1, the code for "unresolved items". `tarfile.extractall(filter=...)` needs Python 3.11.4 or 3.12+, and the venv is exactly 3.11.4. Nothing checks this, and an older interpreter fails with a `TypeError`.
**Fix:** Wrap `Backup(tmp)` and the node call in `try/except (OSError, ValueError, ET.ParseError)` and call `fail(..., 2)`. Add `if not hasattr(tarfile, "data_filter"): fail("Python >= 3.11.4 required", 2)`.

### IN-07: `cmd_edits` crashes on a link-map entry without `old`

**File:** `tools/check-intro-bbj.py:552-553`
**Issue:** `sorted(olds)` raises `TypeError` when any `old` is `None`. That happens before the per-entry check at line 556 can report the problem.
**Fix:** `olds = [e.get("old") or "" for e in lm]`.

### IN-08: check-mdx.mjs is weaker than the Docusaurus build

**File:** `tools/check-mdx.mjs:48`
**Issue:** It compiles with bare `@mdx-js/mdx`, without remark-gfm, remark-directive (admonitions) or the Docusaurus plugins, and it does not validate front matter YAML. Pages that pass here can still fail `npm run build`. Because the full build runs too, this is a limit of the converter's own pre-check, not a gap in the gate.
**Fix:** Document the limit in the header comment, or add `remarkPlugins: [remarkGfm, remarkDirective]` resolved from `docs/`.

### IN-09: The Phase 3 search check now depends on Phase 5 prose

**File:** `tools/verify-phase3.sh:111`
**Issue:** The Phase 3 search-index gate now depends on the literal `Tic-Tac-Toe`, which today appears only in intro-bbj. A Phase 7 Vale or style edit to "tic-tac-toe" would turn the Phase 3 gate red for an unrelated reason. The check also does not prove that the hit comes from an intro-bbj route.
**Fix:** Match a stable intro-bbj marker, such as the overview title "Introduction to BBj Development" together with an `intro-bbj` route in the index, or match case-insensitively.

---

_Reviewed: 2026-10-04T08:08:22Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
