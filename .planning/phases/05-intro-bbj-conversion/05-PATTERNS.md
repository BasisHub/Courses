# Phase 5: Intro-BBj Conversion - Pattern Map

**Mapped:** 2026-10-04
**Files analyzed:** 17 (new or modified file groups)
**Analogs found:** 15 / 17

Note: CLAUDE.md says `tools/moodle2docusaurus.py` "exists". It does not (not in `tools/`). It is a new file. Do not look for a prior version.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `tools/moodle2docusaurus.py` | utility (one-shot converter) | batch / transform (file-I/O) | `tools/relocate-dwc.py` | role-match (same one-shot shape, different parsing) |
| `tools/data/intro-bbj-image-map.json` | config (data map) | transform | `tools/data/dwc-image-map.json` | exact shape, extended |
| `tools/data/intro-bbj-video-map.json` | config (data map) | transform | `tools/data/dwc-image-map.json` (JSON+indent=2 style) | partial |
| `tools/data/intro-bbj-link-map.json` | config (data map) | transform | `tools/data/dwc-old-routes.json` | partial |
| `tools/data/intro-bbj-syntax.md` | doc (report) | batch | `tools/data/dwc-samples-syntax.md` | exact |
| `tools/verify-phase5.sh` | test (acceptance script) | request-response (PASS/FAIL lines) | `tools/verify-phase4.sh` | exact |
| `tools/check-intro-bbj.py` / `tools/check-mdx.mjs` (optional) | test (checker) | batch | `tools/check-dwc-routes.py` | role-match |
| `tools/verify-phase1.sh` (edit lines 66-67 area) | test | request-response | itself | exact |
| `docs/docs/intro-bbj/00-overview.mdx` (replace) | page | static | `docs/docs/dwc/00-overview.mdx` | exact |
| `docs/docs/intro-bbj/structure.mdx`, `audience.mdx`, `contribute.mdx` | page (top-level) | static | `docs/docs/dwc/prerequisites.mdx` | exact |
| `docs/docs/intro-bbj/0N-<slug>/_category_.json` x4 | config | static | `docs/docs/dwc/01-gui-to-bui-to-dwc/_category_.json` | exact |
| `docs/docs/intro-bbj/0N-<slug>/index.mdx` x4 | page (section index) | static | `docs/docs/dwc/01-gui-to-bui-to-dwc/index.md` | role-match |
| `docs/docs/intro-bbj/0N-<slug>/NN-*.mdx` (28 chapters, generated) | page | static | `docs/docs/dwc/**` chapters; `docs/docs/authoring/components.mdx` for YouTube/code | role-match |
| `docs/docs/intro-bbj/0N-*/9N-exercise-*.mdx` x5 | page | static | `docs/docs/authoring/components.mdx` (`:::exercise`) + RESEARCH exercise page | partial |
| `docs/examples/intro-bbj/{LICENSE,README.md,<folders>}` | static assets | file-I/O | `docs/examples/dwc/` | exact |
| `docs/static/files/intro-bbj/*.zip` | generated | batch | `docs/static/files/dwc/` via `tools/sync-samples.py` | exact (generated, not hand-written) |
| Download-link pages (overview and chapters) | page content | static | `docs/docs/dwc/samples.mdx` | exact |

## Pattern Assignments

### `tools/moodle2docusaurus.py` (utility, batch/transform)

**Analog:** `tools/relocate-dwc.py` (337 lines). Copy the skeleton, not the logic.

**Header, constants, exit codes** (lines 1-39): docstring states purpose, re-run rule, usage, exit codes (0 ok, 1 failed count or unresolved, 2 missing input or already committed).
```python
#!/usr/bin/env python3
"""...Re-runnable only until commit 1 of Phase 4 exists; afterwards the Markdown is the
only source of truth and the script refuses to run unless --force is given.
...
Exit 0 on success, 1 on a failed count or unresolved link, 2 when the clone is missing
or the relocation commit is already in history.
"""
from __future__ import annotations
import io, json, os, pathlib, re, shutil, subprocess, sys, tarfile, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DST = ROOT / "docs" / "docs" / "dwc"
MAP_FILE = ROOT / "tools" / "data" / "dwc-image-map.json"
COMMIT1_SUBJECT = "feat(04-03): relocate DWC-Course book from BasisHub/DWC-Course@965da6d"
```
Adapt: `DST = docs/docs/intro-bbj`, `EXAMPLES = docs/examples/intro-bbj`, maps under `tools/data/intro-bbj-*`, a new COMMIT2 subject (the generated-docs commit).

**Label/slug/top-level tables as module constants** (lines 41-62): dicts `LABELS`, `TOP = {"prerequisites": "0.1", ...}`, `OVERRIDES`. Put `LABELS`, `TOP = {"structure": "0.1", "audience": "0.2", "contribute": "0.3"}`, the title map and slug map (D-05/D-06) here or in `tools/data/`.

**fail() helper and source check** (lines 81-92):
```python
def fail(msg: str, code: int = 1) -> None:
    print(msg, file=sys.stderr)
    sys.exit(code)
```

**Safe tar extraction** (lines 95-112). Reject abs paths, `..`, symlinks, hardlinks. For the .mbz (gzip tar) prefer RESEARCH's `tf.extractall(dest, filter="data")` (Python >= 3.11.4) but this explicit loop is the repo idiom:
```python
parts = pathlib.PurePosixPath(m.name).parts
if m.name.startswith("/") or ".." in parts or m.issym() or m.islnk():
    fail(f"unsafe tar member rejected: {m.name}")
```

**Refuse-after-commit guard** (lines 138-150): `check_not_committed()` runs `git log --format=%H %s --fixed-strings --grep COMMIT_SUBJECT`, exact subject compare, `--force` override, exit 2.

**Clean the target before write, never touch hand-written files** (lines 162-175): remove generated folders (`[0-1][0-9]-*` dirs, top-level pages), `git rm -r -q --ignore-unmatch -f` the old stub (`01-getting-started`, `01-sample-page.md`, `index.md` in intro-bbj), recreate park dir if needed.

**Fence-aware line processing** (lines 68, 186-193): `FENCE_RE = re.compile(r"^\s*(```|~~~)")` and an `in_fence` toggle so link/image/escape rewrites never touch code. Use the same in the MDX-escape pass (escape `{ } <` only outside fences and inline code).

**Category file writer** (lines 276-289), copy verbatim with `intro-bbj`:
```python
cat.write_text(
    "{\n"
    f'  "label": {json.dumps(label)},\n'
    f'  "position": {pos},\n'
    f'  "link": {{"type": "doc", "id": "intro-bbj/{slug}/index"}}\n'
    "}\n", encoding="utf-8")
```

**Map file write, sorted, stable** (line 321-322): `entries.sort(key=...)`, `json.dumps(entries, indent=2, ensure_ascii=False) + "\n"`. Do this for the image map so re-runs are byte-stable.

**Count assertion at the end** (lines 324-331): print a counter line, compare `want` vs `got` dict, `fail("count mismatch...")`. Use want = 28 chapters, 5 assignments, 10 YouTube, 8 images (1 intentional drop, D-26), 4 resource groups, `unresolved: 0`, no `$@NULL@$`.

**Cleanup with try/finally** (lines 156-157, 332-333): `tmp = mkdtemp(...)`, `finally: shutil.rmtree(tmp, ignore_errors=True)`.

**New logic with no analog in relocate-dwc.py** (use RESEARCH "Code Examples" and "Pitfalls 1-8"): XML parse via `xml.etree.ElementTree`; order chapters by `<pagenum>`; raw-string pre-fixes keyed by chapter id (ch 24 unclosed `<code>`; videos via regex, ch 27 empty video dropped); BeautifulSoup/lxml cleanup; custom code-block pass + override table; markdownify subclass; backslash MDX escaping; `\xa0` to space; LF-normalize and one trailing newline for sample files; oEmbed only when `tools/data/intro-bbj-video-map.json` lacks an ID (re-runs offline); report with non-zero exit on any unresolved count. Add `.venv` note: deps pinned in `tools/requirements.txt`.

---

### `tools/verify-phase5.sh` (test, request-response lines)

**Analog:** `tools/verify-phase4.sh` (116 lines). Copy the harness verbatim, replace the sections.

**Harness** (lines 9-50):
```bash
set -u
cd "$(dirname "$0")/.." || exit 1
FAILS=0; SEC=""; BUILD=1; LOG=""; B=docs/build; CFG=docs/docusaurus.config.js
pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { # check <name> <command...>; on failure prints FAIL lines or last 20
  local name="$1" out detail; shift
  if out=$("$@" </dev/null 2>&1); then pass "$name"; return; fi
  fail "$name"
  detail=$(printf '%s\n' "$out" | grep 'FAIL' | head -20)
  [ -n "$detail" ] || detail=$(printf '%s\n' "$out" | tail -20)
  [ -z "$detail" ] || printf '%s\n' "$detail" | sed 's/^/    /'
}
trap cleanup EXIT
for a in "$@"; do case "$a" in --no-build) BUILD=0 ;; *) echo "Unknown flag: $a (use --no-build)" >&2; exit 2 ;; esac; done
```
Build / stale-build block: lines 40-50. Final lines: `if [ "$FAILS" -gt 0 ]; then echo "Phase 5: $FAILS failure(s)"; exit 1; fi; echo "Phase 5: all checks passed"; exit 0`.

**Samples section** (lines 82-95): reuse with `intro-bbj`:
```bash
check "samples in sync" python3 tools/sync-samples.py --check intro-bbj
targets=$(grep -rhoE 'pathname:///files/intro-bbj/[^)" ]+' docs/docs/intro-bbj | sed 's|pathname:///files/intro-bbj/||' | sort -u)
... [ -f "docs/static/files/intro-bbj/$t" ] ... [ -f "$B/files/intro-bbj/$t" ]
```
**Syntax-report coverage** (lines 98-103): loop `find docs/examples/intro-bbj -name '*.bbj'` and `grep -qF "\`$f\`" tools/data/intro-bbj-syntax.md`.

**Content grep + Vale** (lines 106-113):
```bash
grep -rIEq 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe' docs/docs/intro-bbj
check "Vale error level on docs/docs/intro-bbj" tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj
```
Extend with RESEARCH's validation table: `&nbsp;|&lt;|&gt;|&amp;|<br` absent; no `<iframe|<video`; `<YouTube id="` unique count = 10; image refs `!\[[^]]+\]\(\./img/` count = 8 (D-26); 5 files `*/9?-exercise-*.mdx`, each containing `:::exercise`; 3 titled `Exercise:`, 2 `Bonus exercise:`; every opening fence has a language; 28 chapter pages. Also assert converter-commit separation (CONV-07): `git log --format=%s`.

---

### `tools/verify-phase1.sh` (edit)

**Analog:** itself, lines 66-67 (and 63-65). Stub assertions that break when the stubs go:
```bash
check "dwc sidebar omits intro-bbj chapter" bash -c "test -f '$BUILD/docs/dwc/overview.html' && ! grep -q '/Courses/docs/intro-bbj/getting-started' '$BUILD/docs/dwc/overview.html'"
check "intro-bbj sidebar lists own chapter" grep -q '/Courses/docs/intro-bbj/getting-started' "$BUILD/docs/intro-bbj/overview.html"
```
The first-section route survives if the folder `01-getting-started` is reused (its doc id is `intro-bbj/getting-started/index`), but `index.mdx` replaces `index.md`; confirm the slug the planner chooses. If the slug changes, update both lines to a real new route. Phase 4 precedent: `verify-phase4.sh` line 111-112 asserts no `first-chapter` in gate scripts. Also re-run verify-phase3 search proof (generic, not stub-bound per RESEARCH Pitfall 9).

---

### `tools/data/intro-bbj-image-map.json`

**Analog:** `tools/data/dwc-image-map.json` (array, 2-space indent, sorted by `old`):
```json
{ "old": "static/img/ARC_image_1.png",
  "new": "docs/docs/dwc/04-upgrading-apps/img/arc-image-1.png",
  "verdict": "moved",
  "page": "docs/docs/dwc/04-upgrading-apps/01-arc-files.md" }
```
Adapt: key by `(chapterId, original filename)` since all are `image.png`; add `"alt"` (hand-written) and keep `verdict` ("moved" x8, "dropped" x1 for ch 24 `image.png`, D-26). Converter reads name+alt from this file; it must exist before commit 2 is generated.

### `tools/data/intro-bbj-video-map.json`, `intro-bbj-link-map.json`

No close analog; reuse the formatting rule (`indent=2`, `ensure_ascii=False`, trailing newline, sorted keys). Video map: `{ "<id>": "<title>" }` with "BBx Clues N:" prefix, double spaces collapsed (D-28). Link map: array of `{old, new|null, review?}`; D-27 entry `"review": true` for `https://us.bbx.kitchen/webapp/DWCThemer`. Seed entries in RESEARCH "Dead-link successors".

### `tools/data/intro-bbj-syntax.md`

**Analog:** `tools/data/dwc-samples-syntax.md`. Copy structure: title, checker/build line, counts line ("Pass: N. Fail: N. Not checkable: N. Total: N."), explanatory note, then table:
```markdown
| File | Result | Detail |
|------|--------|--------|
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC1.bbj` | pass | - |
```
Intro-bbj difference (D-11): Fixes happen in this phase, so also add rows for page snippets (e.g. `docs/docs/intro-bbj/.../NN-x.mdx#N`) and record before/after. Row paths must be wrapped in backticks, because verify scripts grep for `` `path` ``.

---

### `docs/docs/intro-bbj/0N-*/_category_.json`

**Analog:** `docs/docs/dwc/01-gui-to-bui-to-dwc/_category_.json`
```json
{
  "label": "GUI to BUI to DWC",
  "position": 1,
  "link": {"type": "doc", "id": "dwc/gui-to-bui-to-dwc/index"}
}
```
Intro-bbj ids drop the numeric prefix, e.g. `intro-bbj/getting-started/index`. Existing stub file uses label "Getting started"; it gets the D-02 label "Set up your environment and get started".

### Section `index.mdx` (x4)

**Analog:** `docs/docs/dwc/01-gui-to-bui-to-dwc/index.md` front matter and shape:
```markdown
---
title: "GUI to BUI to DWC"
description: Learn how BBj GUI apps move to the Browser User Interface and the Dynamic Web Client.
---

Intro sentence(s)...
```
Add `<DocCardList />` without items (auto-lists the category; globally registered, no import). Description under 160 chars. No H1.

### `docs/docs/intro-bbj/00-overview.mdx`

**Analog:** `docs/docs/dwc/00-overview.mdx`. Front matter keeps the existing intro-bbj stub pattern (`title`, `sidebar_label: Overview`, `sidebar_position: 0`, `description`). The overview is not a category, so pass explicit items (as DWC, lines 21-35):
```mdx
<DocCardList items={[
  {type: 'link', label: '...', href: '/docs/dwc/gui-to-bui-to-dwc', description: '...'},
]} />
```
Intro-bbj hrefs: `/docs/intro-bbj/<section-slug>`. Add the plain start link in DWC style: `Start with [GUI to BUI to DWC](./01-gui-to-bui-to-dwc/index.md).` and a downloads list in the style below.

### Top-level pages (`structure.mdx`, `audience.mdx`, `contribute.mdx`)

**Analog:** `docs/docs/dwc/prerequisites.mdx` front matter:
```yaml
---
sidebar_position: 0.1
title: Prerequisites
description: Check what you need before the course, including free HTML and CSS courses.
---
```
Use 0.1 / 0.2 / 0.3 (D-01). The converter writes `sidebar_position` itself (as relocate-dwc.py lines 261-268 does for TOP pages).

### Download links (overview and chapters, D-24)

**Analog:** `docs/docs/dwc/samples.mdx`:
```markdown
- [All samples (`dwc-samples.zip`)](pathname:///files/dwc/dwc-samples.zip)
- [01_GUI2BUI2DWC.zip](pathname:///files/dwc/01_GUI2BUI2DWC.zip)
```
Use `pathname:///files/intro-bbj/<zip>`; never raw `/files/...` (link checker). ZIP names follow `<folder>.zip` and `intro-bbj-samples.zip`.

### YouTube, exercise, code, images in generated chapters

**Analog:** `docs/docs/authoring/components.mdx` (fixture):
```mdx
:::exercise
Read the next section and write down what each line does.
:::

:::exercise Change the title
...
:::

<YouTube id="9HQBN-PVHWs" title="BBj training video" />
```
Fences: ```` ```bbj ````, `css`, etc. Images: `![alt](./img/name.png)` in the section's `img/`. Exercise page front matter per RESEARCH (title "Exercise: ..." or "Bonus exercise: ...", description). Use `:::exercise` with a title argument only if the body needs one.

---

### `docs/examples/intro-bbj/` and ZIPs

**Analog:** `docs/examples/dwc/` (`LICENSE`, `README.md`, one folder per sample). `tools/sync-samples.py` requirements (docstring lines 1-24): `LICENSE` and `README.md` at the book root, only git-tracked files are zipped (`git add` before running), `python3 tools/sync-samples.py intro-bbj` writes `<folder>.zip` and `intro-bbj-samples.zip` to `docs/static/files/intro-bbj/`; `--check` guards drift (already in `test-build.yml` and `deploy.yml`). Book name validated as kebab-case.

**LICENSE:** copy `docs/examples/dwc/LICENSE` ("MIT License / Copyright (c) 2022 BASIS International") but set the line to `Copyright (c) 2021 BASIS International Ltd.` (D-29).
**README.md:** DWC one is a two-line stub (`# DWCTraining` / one sentence); write a short README listing the four folders and what each shows. Mind the Vale prose rules.
**Files:** LF endings, one final newline (`.gitattributes` forces `docs/examples/** text eol=lf`). Folders: `better-hello-world/BetterHelloWorld.bbj`, `oo-samples/{Car,CarApplication,MyDialog}.bbj`, `dwc-lesson-start/Sample.bbj`, `dwc-lesson-result/{Sample.bbj,sample.css}`.

---

## Shared Patterns

### Verbatim generation then hand edits (CONV-07, D-25)
**Source:** `tools/relocate-dwc.py` lines 10-12, 138-150 (refuses to run once the output commit exists) and `tools/verify-phase4.sh` lines 70-80 (exact-subject lookup of commit 1, then a checker run against that rev). Apply to the converter and to a verify check that proves commit 2 equals converter output.

### Fence awareness
**Source:** `tools/relocate-dwc.py` lines 68, 186-193. Apply to every text-rewriting pass: escaping, link rewrite (`documentation.basis.com` to `.cloud`), entity cleanup.

### PASS/FAIL/SKIP reporting
**Source:** `tools/verify-phase4.sh` lines 19-29. Apply to `verify-phase5.sh` and any checker script it calls (checker prints lines containing `FAIL`).

### Content-leftover grep
**Source:** `tools/verify-phase4.sh` lines 106-108. Apply to docs/docs/intro-bbj.

### Vale gate
**Source:** `tools/verify-phase4.sh` line 113: `tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj` (D-13, errors plus typos only).

### Downloads and sample sync
**Source:** `tools/sync-samples.py`, `docs/docs/dwc/samples.mdx` (see above).

### Front matter
All pages: `title` and `description` (at most 160 characters), no content H1, headings start at H2, MDX comments `{/* */}`, no em dashes.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| HTML to MDX parsing, code recovery, markdownify subclass (inside `tools/moodle2docusaurus.py`) | transform | batch | No HTML parsing tool in repo; use RESEARCH Pitfalls 1-8 and Code Examples |
| `tools/check-mdx.mjs` (optional MDX compile check) | test | batch | `tools/test-bbj-grammar.js` is the only Node script in `tools/`; use RESEARCH's `@mdx-js/mdx` snippet, run from `docs/` |
| Exercise page layout | page | static | No real exercise pages yet; only the fixture in `components.mdx` and RESEARCH's exercise snippet |
| Video and link maps | config | transform | New data shapes; follow the JSON formatting conventions above |

## Metadata

**Analog search scope:** `tools/`, `tools/data/`, `docs/docs/dwc/`, `docs/docs/intro-bbj/`, `docs/docs/authoring/`, `docs/examples/dwc/`
**Files scanned:** about 20 read or grepped
**Pattern extraction date:** 2026-10-04
