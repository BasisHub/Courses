# Phase 6: Exercises & DWC Gap Audit - Pattern Map

**Mapped:** 2026-10-04
**Files analyzed:** 14 groups (11 exercise pages, 4 pointer edits, 2 index pages, 2 overview edits, 3 tool scripts, 2 edited checkers, 3 data files, 1 pre-fill script)
**Analogs found:** 14 / 14 (one partial: the pre-fill script)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/docs/dwc/<ch>/90-exercise-*.mdx` and `91-exercise-*.mdx` (11) | content page | static content | `docs/docs/intro-bbj/03-web-development/90-exercise-responsive-login-dialog.mdx`, `01-getting-started/90-exercise-tic-tac-toe.mdx` | exact (no solution block) |
| `<details>` Possible solution block (6 pages: 61, 70, 72, 73, 75, 77) | content fragment | file-I/O (byte copy of example) | RESEARCH 4.1 probe shape; no committed analog | partial (research-verified) |
| ZIP link line in exercise text | content fragment | link | `docs/docs/dwc/samples.mdx` lines 13-23 | exact |
| Pointer edits in `08-control-validation/index.md:103`, `10-embedding-components/index.md:92`, `11-advanced-responsive/{index,01-media-queries,02-transitions}.md` | content edit | static content | same files (keep heading text and id) | exact |
| `docs/docs/dwc/exercises.mdx`, `docs/docs/intro-bbj/exercises.mdx` | content page (index) | static content | `docs/docs/dwc/resources.mdx`, `docs/docs/dwc/samples.mdx` | role-match |
| `docs/docs/dwc/00-overview.mdx`, `docs/docs/intro-bbj/00-overview.mdx` (one-line link) | content edit | static content | `00-overview.mdx` "Sample Code" sentence (DWC); "Start with" line (intro) | exact |
| `tools/check-dwc-phase6.py` | checker (subcommands) | batch / validation | `tools/check-intro-bbj.py` (Ctx, COMMANDS, main) plus `tools/check-dwc-anchors.py` (stdlib style) | exact |
| `tools/verify-phase6.sh` | verify wrapper | batch | `tools/verify-phase5.sh` (and `verify-phase4.sh` for samples/content greps) | exact |
| `tools/check-dwc-routes.py` (edit) | checker | validation | itself, lines 22-33 | exact |
| `tools/check-intro-bbj.py` (edit) | checker | validation | itself, lines 43-48 and 235 | exact |
| `tools/data/dwc-gap-audit.md` | data report | transform output | `tools/data/dwc-samples-syntax.md` (tables, header prose) | role-match |
| `tools/data/dwc-2022-screenshots.json` | data map | transform output | `tools/data/dwc-image-map.json` | role-match |
| `tools/data/dwc-gap-image-map.json` | data map | transform output | `tools/data/intro-bbj-image-map.json` (alt text, descriptive names) | exact |
| one-off audit pre-fill script (scratch, optional in `tools/`) | utility | batch / transform | `tools/moodle2docusaurus.py` (import read-only) | partial |

## Pattern Assignments

### DWC exercise pages (content page, static content)

**Analog:** `docs/docs/intro-bbj/03-web-development/90-exercise-responsive-login-dialog.mdx` (13 lines, whole file)

**Page shape** (lines 1-12; also `01-getting-started/90-exercise-tic-tac-toe.mdx`):
```mdx
---
title: "Exercise: Make your login dialog responsive"
description: "Make your login dialog responsive with CSS so that it works on phones, tablets and desktops."
---

:::exercise

In the prior lesson, you wrote a login dialog. ...

:::
```
Rules to copy: front matter has only `title` ("Exercise: " prefix, sentence case) and `description` (at most 160 chars); no `sidebar_position`, no H1; the whole body inside `:::exercise` ... `:::`; no "Bonus exercise" in DWC (none is optional). The 90/91 numeric prefix orders sub-pages after `01..0N`. Slugs drop prefixes: `01-gui-to-bui-to-dwc/90-exercise-gui-to-bui-to-dwc.mdx` routes to `/docs/dwc/gui-to-bui-to-dwc/exercise-gui-to-bui-to-dwc`.

**Download link form** (`docs/docs/dwc/samples.mdx` lines 13-14):
```mdx
- [All samples (`dwc-samples.zip`)](pathname:///files/dwc/dwc-samples.zip)
- [01_GUI2BUI2DWC.zip](pathname:///files/dwc/01_GUI2BUI2DWC.zip)
```
Use `pathname:///files/dwc/<name>.zip` only for the 11 existing ZIP names listed in RESEARCH 4.4. There is no ZIP for `10_AdvancedResponsive`: link none for 122/123. Links to other pages are relative file paths (`./90-exercise-x.mdx`), checked by `onBrokenMarkdownLinks: throw`.

**Possible solution block** (6 pages, after the closing `:::`; shape from RESEARCH 4.1, probe-verified):
````mdx
<details>
<summary>Possible solution</summary>

One sentence naming `Exercise-SearchBBjTree.bbj` and `Exercise-SearchBBjTreeComplete.bbj`, and a [ZIP link](pathname:///files/dwc/04_ExtendedAttributes.zip).

```bbj title="Exercise-SearchBBjTreeComplete.bbj"
...byte copy of docs/examples/dwc/04_ExtendedAttributes/Exercise-SearchBBjTreeComplete.bbj...
```

</details>
````
Pitfalls: blank line after `</summary>` and before `</details>`; no indentation of the fence; closing fence on its own line (five source files lack a final newline); generate fences by script and compare with `rstrip("\n")`. Over 40 lines collapses automatically through the swizzled `docs/src/theme/CodeBlock/index.js` (no component import). Exercise 61 shows `DWC1.bbj` then `DWC2.bbj` in one block. Do not fence 65, 68, 83, 122, 123. Starter `Exercise-*.bbj` files are linked via the ZIP, never inlined.

**Fences in exercise text:** every fence has a language tag (`bbj`, `css`, etc.). The three `<pre>` cases (73 one-liner `bbj`, 122 `@media` skeleton `css`, 123 `transition:` skeleton `css`) become fences by hand; the `bbj` one needs `bbj_check_syntax` (orchestrator step, D-05). Write "third-party" not "3rd party" (Google.Ordinal error). No em dashes, no `!` exclamations ("Good luck!" in 122/123), no `DWCTraining/` paths, no `github.com/BasisHub/DWCTraining`, no `basishub.github.io/basis-next`.

---

### Pointer edits to old exercise headings (content edit)

**Analog:** the stub sections themselves. Keep heading text and id, replace only the "Run `DWCTraining/...`" sentence.

`docs/docs/dwc/10-embedding-components/index.md` lines 92-94 (explicit id pattern to preserve):
```md
## Exercise: Embed a Third-Party Component {#exercise-embed-a-3rd-party-component}

Run the examples in `DWCTraining/09_EmbeddingComponents/` to see various third-party integrations.
```
becomes one sentence such as `Work through [Exercise: Embed a third-party component](./90-exercise-embed-component.mdx).`

`08-control-validation/index.md` line 103 `## Exercise: Adding Validation to an Email Field`: same, and the screenshots below it (`validation-6/7`, `regex101`, `validation-8`, `validation-demo3`, `validation-9`) stay in place.

`11-advanced-responsive/index.md` lines 60-63 (`## Exercises` list) becomes links:
```md
## Exercises

- **Exercise: Media Queries** - Create layouts that adapt to screen size
- **Exercise: Transition on Button** - Add hover effects to buttons
```
Wrap the bold titles as relative links to both new pages. The same applies to the headings `## Exercise: Media Queries` (`01-media-queries.md:107`, id `exercise-media-queries`) and `## Exercise: Transition on Button` (`02-transitions.md:133`, id `exercise-transition-on-button`). `tools/check-dwc-anchors.py` (306 anchors) must stay green.

---

### `docs/docs/dwc/exercises.mdx` and `docs/docs/intro-bbj/exercises.mdx` (index page)

**Analog:** `docs/docs/dwc/resources.mdx` (front matter plus bold-link list) and `samples.mdx`.

**Front matter and list style** (`resources.mdx` lines 1-11):
```mdx
---
sidebar_position: 0.3
title: Useful Resource Links
description: Find links to the BASIS help, DWC documentation, and CSS and Developer Tools references.
---

...
## Course Files

- **[Sample Code](./samples.mdx)** - BBj source files and supporting assets for hands-on exercises, available as downloads
```
New pages use `sidebar_position: 0.4`, `title: Exercises`, a `description` of at most 160 chars, content headings from H2 grouped by chapter or section, each entry `- **[Exercise: ...](./<ch-folder>/90-exercise-x.mdx)** - one-line summary`, plus `(solution included)` on exactly the six D-06 pages (61, 70, 72, 73, 75, 77). The intro index has no solutions and no images, only fence languages in `{bbj, java, css, html, javascript, bash, json}` (check-intro-bbj content rules). Intro exercises to list (from `check-intro-bbj.py` `EXERCISES`, lines 66-72): 01 tic-tac-toe and computer-player ("Bonus exercise: "), 02 login-dialog and oo-tic-tac-toe ("Bonus"), 03 responsive-login-dialog.

### Overview one-liners

DWC `00-overview.mdx` line 12 already links `[Sample Code](./samples.mdx)` in prose; add a sentence linking `./exercises.mdx` the same way. Intro `00-overview.mdx` line 11 (`Start with [...](./01-getting-started/index.mdx).`): add the link as prose OUTSIDE the `<DocCardList items=...>` block (check-intro-bbj validates the block hrefs, RESEARCH Section 8).

---

### `tools/check-dwc-phase6.py` (checker, validation)

**Analog:** `tools/check-intro-bbj.py` (subcommand dispatch and `Ctx`) with `tools/check-dwc-anchors.py` for stdlib/exit-code style. Must run under system `python3` (stdlib only: `hashlib`, `json`, `re`, `pathlib`, `subprocess`).

**Ctx and check counter** (`check-intro-bbj.py` lines 133-143):
```python
class Ctx:
    def __init__(self, name: str) -> None:
        self.name = name
        self.checks = 0
        self.failed = 0

    def check(self, ok: bool, msg: str) -> bool:
        self.checks += 1
        if not ok:
            self.failed += 1
            print(f"FAIL {msg}")
        return ok

    def done(self) -> int:
        print(f"{self.name}: {self.checks} checks, {self.failed} failed")
        return 1 if self.failed else 0
```

**Front matter and fence helpers to copy or import** (`check-intro-bbj.py` lines 144-195: `read_text`, `load_json`, `front_matter`, `split_fences`, `book_mdx`), constants `FENCE_LANGS`, `FENCE_RE`, `IMG_RE`, `EM_DASH`, `PROSE_BANS` (lines 107-118). Note `KEBAB_PNG` (png only) must be widened to `png|gif|svg` for DWC images.

**Subcommand dispatch** (lines 625-646):
```python
COMMANDS = [("structure", cmd_structure), ("content", cmd_content), ...]

def main(argv: list) -> int:
    ap = argparse.ArgumentParser(description="...")
    ap.add_argument("command", choices=[n for n, _ in COMMANDS] + ["all"])
    ap.add_argument("--build", default="docs/build")
    ap.add_argument("--root", default=str(REPO))
    ...
    for _n, fn in todo:
        rc |= fn(root, build)
    return 1 if rc else 0
```
Subcommands per RESEARCH: `exercises pointers indexes solutions audit kept screenshots commits`. Specifics: drift compare is `fence.rstrip("\n") == file.rstrip("\n")`; marker check matches `![...](./img/NAME)` references (not line numbers), accepts `.gif`/`.svg`, requires the previous line to be exactly `{/* TODO: screenshot outdated? */}`; the audit check counts module ids (22), not a literal 30; commits check follows `find_commit`/`commit_paths` (lines 457-470) and SKIPs if squashed.

**Failure-line convention for the shell wrapper:** the wrapper greps `FAIL`, so print `FAIL <msg>` lines.

---

### `tools/verify-phase6.sh` (verify wrapper, batch)

**Analog:** `tools/verify-phase5.sh` (79 lines). Copy lines 1-37 verbatim (header comment, `set -u`, `pass/fail/skip/check` helpers, `--no-build` flag parsing, `cleanup` trap), then the build block (lines 39-49) and MDX compile loop (56-64). Header comment must say "Point-in-time gate" and note that LIVE-01's sidebar diff must treat the new DWC "Exercises" page as an intended addition.

**Helpers** (lines 18-28):
```bash
pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { # check <name> <command...>; on failure prints the checker's FAIL lines (or its last 20 lines)
  local name="$1" out detail; shift
  if out=$("$@" </dev/null 2>&1); then pass "$name"; return; fi
  fail "$name"
  ...
}
```

**Section pattern** (lines 51-52, 75-79):
```bash
SEC=structure
check "book structure and order" python3 tools/check-intro-bbj.py structure --build docs/build
...
if [ "$FAILS" -gt 0 ]; then echo "Phase 5: $FAILS failure(s)"; exit 1; fi
echo "Phase 5: all checks passed"; exit 0
```
Sections for phase 6: build, exercises, solutions, indexes, audit, kept, screenshots, regression. Add from `verify-phase4.sh`: the download-target loop (lines 84-91, `grep -rhoE 'pathname:///files/dwc/[^)" ]+'` then check `docs/static/files/dwc/` and `$B/files/dwc/`), and the LIVE-01 grep (lines 105-107). Add `test ! -e tools/data/dwc-unused-img`, `git ls-files import | wc -l` equals 0, MDX compile of `find docs/docs/dwc -name '9*-exercise-*.mdx'`, Vale `check "Vale error level on docs/docs/dwc" tools/.bin/vale --minAlertLevel=error docs/docs/dwc docs/docs/intro-bbj`, plus `check-dwc-routes.py`, `check-dwc-anchors.py`, `sync-samples.py --check`. Executors cannot run `bash tools/*.sh`; the user runs it with `!`.

---

### `tools/check-dwc-routes.py` (edit)

**Analog:** itself. Constants that pin the end state (lines 22-33):
```python
TOP_ORDER = [
    "overview", "prerequisites", "samples", "resources", "gui-to-bui-to-dwc",
    ...
]
SUB_ORDER = {
    "gui-to-bui-to-dwc": ["registering-launching", "hello-world", "gui-to-bui-to-dwc"],
    ...
    "advanced-responsive": ["media-queries", "transitions"],
}
```
Edits: insert `"exercises"` after `"resources"` in `TOP_ORDER`; append the exercise slugs to `SUB_ORDER["gui-to-bui-to-dwc"]` and `["advanced-responsive"]` (and add entries for the single-page chapters that gain sub-pages if desired, e.g. `"flow-layouts": ["css-grid-layout", "css-flexbox"]`; the slug is the file name minus the `9N-` prefix, so confirm the `exercise-` prefix stays in the slug). Route allowlist: after line 84 (`expected.add(SITE + "/overview")`) add the 12 new routes (11 exercises plus `/exercises`) so the "extra route" loop (lines 92-93) passes, while keeping the "snapshot content routes" assertion (lines 79-82) unchanged.

### `tools/check-intro-bbj.py` (edit)

**Analog:** itself. Lines 43-48:
```python
TOP_PAGES = {  # file -> sidebar_position
    "00-overview.mdx": 0,
    "structure.mdx": 0.1,
    "audience.mdx": 0.2,
    "contribute.mdx": 0.3,
}
```
Add `"exercises.mdx": 0.4,`. Line 235 `... == 38, "expected set has 38 .mdx files (contract)"` becomes 39 (both number and message). Do not edit `tools/moodle2docusaurus.py` (the `commits` subcommand regenerates from it). Also update the point-in-time header comments in `verify-phase4.sh` and `verify-phase5.sh`.

---

### `tools/data/dwc-gap-audit.md` (data report)

**Analog:** `tools/data/dwc-samples-syntax.md`. Copy its shape: H1, a short provenance paragraph (checker/source/date, counts line "Pass: 43. Fail: 1 ..."), then pipe tables with backtick-quoted file names:
```md
# DWC samples: BBj syntax check
...
Pass: 43. Fail: 1. Not checkable: 0. Total: 44.
...
| File | Result | Detail |
|------|--------|--------|
| `docs/examples/dwc/01_GUI2BUI2DWC/DWC_AppThemes/DWCThemer.bbj` | pass | - |
```
Apply as: summary table at top (units by verdict counts: keep/covered/drop), then one H2 per Moodle module in course order (header: Moodle name, module id, target DWC page(s)), each with a table `| Type | Excerpt / file | Verdict | Target page#anchor | Reason |`. Images identified by Moodle file name plus full 40-hex SHA-1; 12 parked-image rows (RESEARCH 2.4 table: 5A x6, 2B x4, 4A x2); 3B split by its 4 chapters; no `import/` paths, no em dashes. BBj snippet check results recorded as `dwc-samples-syntax.md`-style rows with the fix noted (D-14).

### `tools/data/dwc-2022-screenshots.json` and `tools/data/dwc-gap-image-map.json` (data maps)

**Analogs:** `tools/data/dwc-image-map.json` (flat list of `old/new/verdict/page`) and `tools/data/intro-bbj-image-map.json` (descriptive kebab names plus hand-written alt):
```json
{
  "chapter": 15,
  "file": "image.png",
  "name": "oo-input-dialog.png",
  "alt": "A small window titled Your Input with one text field showing the word input and an Ok button.",
  "verdict": "moved",
  "page": "docs/docs/intro-bbj/02-object-oriented-syntax/04-oo-dialog.mdx"
}
```
`dwc-gap-image-map.json` entries: Moodle file name, SHA-1, new path under `docs/docs/dwc/<chapter>/img/`, alt, page (name regex `^[a-z0-9]+(-[a-z0-9]+)*\.(png|gif|svg)$`). Leave `dwc-image-map.json` untouched (66/27/307 contracts). `dwc-2022-screenshots.json`: sorted list of `{dwc_path, moodle_name, sha1}` (30 chapter images today, plus kept 2022-named images; generated last, after kept material). Expected 30 rows listed in RESEARCH 2.3.

### One-off audit pre-fill script (utility, batch)

**Analog:** `tools/moodle2docusaurus.py` imported read-only (needs `.venv/bin/python`; `main()` is behind `if __name__ == "__main__"`, line 1064). Proven usage (RESEARCH 5.1):
```python
import sys; sys.path.insert(0, "tools"); import moodle2docusaurus as m
rep = m.Report()
ctx = m.Ctx("a73", rep, {}, {}, None, {}, False)
md = m.convert(assign_intro_html, "a73", ctx)
```
Reusable: `convert` (line 744), `code_text` (442), `lang_of` (416), `looks_like_code` (429), `mdx_escape` (707), `tidy` (726), `front_matter` (772), `xml_text` (322). Not reusable: `Backup` (ignores `page_*`), `media_pass`, `code_pass`, `CODE_OVERRIDES`; write own loader for `activities/page_N/page.xml` and an image resolver (same context, then section area, strip `?time=`, URL-decode; hash from `files.xml` `contenthash`). Use `hashlib`, `xml.etree`; do not commit it unless it avoids `import/` at import time.

---

## Shared Patterns

### MDX comment marker (2022 screenshots)
**Source:** RESEARCH 4.2 (probe-verified); Vale ignores it via `TokenIgnores`.
**Apply to:** the 30+ image lines in `docs/docs/dwc/{01,05,06,07,08}-*/`.
```md
{/* TODO: screenshot outdated? */}
![Tree Search Demo](./img/tree-search.png)
```
Own line directly above the image line (between caption and image is fine). `.md` pages parse as MDX, so no rename needed. Always `{/* */}`, never `<!-- -->`.

### Link and image forms
**Source:** `samples.mdx`, `intro-bbj-image-map.json`.
**Apply to:** all new and edited pages: `pathname:///files/dwc/<zip>` for downloads; `./file.mdx` relative links between pages; `![alt](./img/kebab-name.png)` with non-empty alt; every fence tagged.

### Vale error gate and prose rules
**Source:** `.vale.ini`, RESEARCH Pitfall 8, `verify-phase4.sh` line 114.
**Apply to:** every touched `.md`/`.mdx`: `tools/.bin/vale --minAlertLevel=error docs/docs/dwc docs/docs/intro-bbj` returns 0 errors; no em dashes (grep U+2014); code-format file names and CSS values; no Moodle leftovers (`PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/`, `verify-phase4.sh` lines 105-107).

### Heading ids and anchors
**Source:** `tools/check-dwc-anchors.py` (reads `docs/build/docs/dwc/<name>.html`, ids in `<h1-6>` inside `<article>`).
**Apply to:** pointer edits and kept material: never rename an existing heading; if Vale forces a change, pin the old id with `{#old-id}`; avoid repeated heading text on one page.

### Check-script conventions
**Source:** `check-dwc-routes.py` / `check-dwc-anchors.py`: `ROOT = pathlib.Path(__file__).resolve().parent.parent`, `from __future__ import annotations`, `PASS  ...`/`FAIL  ...` lines, exit 0 pass / 1 fail / 2 missing input, stdlib only.
**Apply to:** `check-dwc-phase6.py`.

### Samples and ZIPs
**Source:** `tools/sync-samples.py` docstring (lines 1-26): `docs/examples/dwc/` is the only hand-edited copy; `git add` a new sample before `python3 tools/sync-samples.py dwc`; `--check` must pass. Avoid new `.bbj` files (`verify-phase4.sh` line 98 requires exactly 44 with syntax rows).
**Apply to:** kept attachments and any solution fence generation.

### BBj verification
**Source:** CLAUDE.md "Tool calling" and RESEARCH Section 10. Orchestrator reads `bbj://primer` and runs `bbj_lookup`/`bbj_check_syntax` on each new `bbj` snippet (assign 73 one-liner, kept `<pre>` blocks tagged bbj, any email-regex hint); executors apply fixes and record results.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `<details>` Possible solution block | content fragment | file copy | No committed page has one yet (intro-bbj exercises have no solutions); use the probe-verified shape in RESEARCH 4.1 |
| Marker line `{/* TODO: screenshot outdated? */}` | content marker | n/a | No existing use; use RESEARCH 4.2 |
| Hash-based audit pre-fill | utility | batch | `moodle2docusaurus.py` has image maps by name only; hashing against `files.xml` `contenthash` is new (stdlib `hashlib`) |

## Metadata

**Analog search scope:** `docs/docs/intro-bbj`, `docs/docs/dwc` (top-level pages, chapters 08, 10, 11), `tools/*.py`, `tools/*.sh`, `tools/data/*`
**Files scanned:** about 20 read or grepped
**Pattern extraction date:** 2026-10-04
