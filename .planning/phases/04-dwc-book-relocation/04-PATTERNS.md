# Phase 4: DWC Book Relocation - Pattern Map

**Mapped:** 2026-10-03
**Files analyzed:** 22 file groups (new or modified)
**Analogs found:** 17 / 22 (the five without an analog are the Python tools; the repo has none, see "No Analog Found")

Note: CLAUDE.md mentions `tools/moodle2docusaurus.py`, but it is NOT in the repo (`git ls-files tools` shows only shell, one Node script, `requirements.txt`, `data/`). The only scripting analogs are `tools/*.sh` (bash) and `tools/test-bbj-grammar.js` (Node). All Python tools in this phase are new style; use the conventions below.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `docs/docs/dwc/00-overview.mdx` (replace) | page (overview) | static content | `docs/docs/intro-bbj/00-overview.mdx` + old stub itself | exact (front matter) |
| `docs/docs/dwc/NN-<slug>/_category_.json` x12 | config | static | `docs/docs/dwc/01-first-chapter/_category_.json` (stub, removed) | exact |
| `docs/docs/dwc/{prerequisites,samples,resources}.md` | page | static content | old source pages + stub front matter | role-match |
| `docs/docs/dwc/NN-<slug>/**/*.md` (23 pages) + `img/*` (48) | page / asset | static content, file-I/O copy | none in repo (copied from `git archive 965da6d`) | no analog (source is the pattern) |
| `docs/docs/dwc/01-first-chapter/` (delete via `git rm -r`) | removal | n/a | n/a | n/a |
| `docs/examples/dwc/**` (10 folders, LICENSE, README.md) | sample source | file-I/O copy | none (`docs/examples/` does not exist) | no analog |
| `docs/static/files/dwc/*.zip` (11) | generated asset | batch | none | no analog |
| `tools/sync-samples.py` | utility (generator + `--check`) | batch / file-I/O | `tools/test-bbj-grammar.js` (header, path resolution) + `tools/verify-phase3.sh` (exit semantics) | partial |
| `tools/snapshot-dwc-site.py` | utility | batch / transform | `tools/test-bbj-grammar.js` | partial |
| `tools/relocate-dwc.py` | utility (one-shot) | batch / transform | `tools/prove-gates.sh` (idempotent, trap cleanup) | partial |
| `tools/check-dwc-{relocation,routes,anchors}.py` | utility (checker) | transform | `tools/verify-phase3.sh` (PASS/FAIL, nonzero exit) | partial |
| `tools/verify-phase4.sh` | test (acceptance suite) | request-response (build + grep) | `tools/verify-phase3.sh` | exact |
| `tools/prove-gates.sh` (modify line 26) | test | build probe | itself | exact |
| `tools/verify-phase1.sh` (modify lines 64, 67, 87, 139-142) | test | build/serve | itself | exact |
| `tools/verify-phase2.sh` (modify lines 12, 215-216) | test | live check | itself | exact |
| `.github/workflows/test-build.yml` (add step) | config (CI) | request-response | itself | exact |
| `THIRD_PARTY_NOTICES.md` (add prism entry) | config / docs | static | itself (webforJ and Google sections) | exact |
| `tools/data/dwc-old-sitemap.xml`, `dwc-old-routes.json` | data | snapshot | `tools/data/ruleset-main.json` (committed machine data) | role-match |
| `tools/data/dwc-image-map.json` (+ `.md`) | data | map | `tools/data/bbj-token-verification.md` (human record) | role-match |
| `tools/data/dwc-samples-syntax.md` | data (report) | record | `tools/data/bbj-token-verification.md` | exact |
| `tools/data/dwc-unused-img/` | asset park | file copy | none | no analog |
| `docs/src/data/books.js`, `docs/sidebars.js` | config | static | themselves | exact (no change expected) |

## Pattern Assignments

### `docs/docs/dwc/00-overview.mdx` (page, static)

**Analog:** `docs/docs/intro-bbj/00-overview.mdx` (the repo's overview pattern; D-11).

**Front matter to copy** (lines 1-6 of analog):
```yaml
---
title: Introduction to BBj Development
sidebar_label: Overview
sidebar_position: 0
description: You already write software in another language. Learn to set up BBj and build GUI and browser applications with it.
---
```
For DWC keep the existing stub values (`title: BBj DWC Training`, `sidebar_label: Overview`, `sidebar_position: 0`, `description: Build modern browser applications with the Dynamic Web Client, from first concepts to deployment.`). The stub description is identical to the `books.js` `dwc.description`; keep them in sync.

**Body rules:** content starts at H2 (the analog starts with `## Overview`); relative file link form `[sample page](./01-getting-started/01-sample-page.md)` becomes `[GUI to BUI to DWC](./01-gui-to-bui-to-dwc/index.md)` (D-10). `<DocCardList />` is global (no import); the explicit-`items` form with `{type:'link', label, href:'/docs/dwc/<slug>', description}` is the one used in `docs/docs/authoring/components.mdx` (RESEARCH Pitfall 2 recommends explicit 12 items; open question 1).

---

### `docs/docs/dwc/NN-<slug>/_category_.json` x12 (config)

**Analog:** `docs/docs/dwc/01-first-chapter/_category_.json` (full file):
```json
{
  "label": "First chapter",
  "position": 1,
  "link": {"type": "doc", "id": "dwc/first-chapter/index"}
}
```
Copy per chapter: `label` = old chapter title (list in RESEARCH "Chapter category labels"), `position` = folder number, `id` = `dwc/<slug-without-NN->/index`. Single-line `link` object and two-space indent, trailing newline.

---

### Top-level pages `prerequisites.md`, `samples.md`, `resources.md` (page)

**Analog:** old source pages, plus front matter pattern from the stub. Commit 1 sets only ordering metadata (RESEARCH Pattern 1, proven):
```yaml
---
sidebar_position: 0.1   # samples 0.2, resources 0.3
title: Prerequisites
---
```
Fractional positions are valid and yield Overview, Prerequisites, Sample Code, Resources, then chapters 01-12. Do not copy old positions (`samples: 3`, `resources: 3` collide). Download links use `pathname:///files/dwc/<name>.zip` (not `/files/...`, which Docusaurus rewrites to a hashed asset URL).

---

### `tools/verify-phase4.sh` (test, acceptance suite)

**Analog:** `tools/verify-phase3.sh` (exact). Copy its skeleton.

**Header, strict-mode and helper pattern** (verify-phase3.sh lines 1-31):
```bash
#!/usr/bin/env bash
# Phase 3 acceptance suite (components, brand, search).
# Usage: bash tools/verify-phase3.sh [--no-build]
# Prints one "PASS|FAIL  [section] name" line per check; exits 1 if any check failed.
set -u
cd "$(dirname "$0")/.." || exit 1

FAILS=0
SEC=""
BUILD=1
LOG=""
B=docs/build

pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}
has() { grep -q -- "$2" "$1" 2>/dev/null; }
hasf() { grep -qF -- "$2" "$1" 2>/dev/null; }
cleanup() { [ -n "$LOG" ] && rm -f "$LOG"; return 0; }
trap cleanup EXIT
```

**Flags and build/stale handling** (lines 33-50): `--no-build` flag loop with `exit 2` on unknown flag; `LOG=$(mktemp)`; `(cd docs && npm run build) >"$LOG" 2>&1`; with `--no-build`, assert build newer than sources via `find docs/docs docs/src docs/static "$CFG" -newer "$B/index.html"`. Note: Phase 4 changes `docs/docs` and `docs/static`, so a stale build fails verify-phase3 too; rebuild first.

**Section style and python-inline pattern** (lines 102-113): sections are `SEC=name`; Python invoked via `python3 - $IDX <<'PY' ... PY` inside `if ...; then pass; else fail; fi`. For Phase 4 call the standalone checkers instead: `check "routes" python3 tools/check-dwc-routes.py`, `check "anchors" python3 tools/check-dwc-anchors.py`, `check "samples in sync" python3 tools/sync-samples.py --check`.

**Negative grep over built tree and sources** (lines 74-77, 137):
```bash
bad=$(grep -rlE '<iframe|ytimg|youtube\.com/embed' "$B" --include='*.html' 2>/dev/null || true)
if [ -z "$bad" ]; then pass "..."; else fail "...: $bad"; fi
if grep -rq 'import YouTube' docs/docs; then fail "no import YouTube in docs"; else pass "no import YouTube in docs"; fi
```
Use this for: no `@theme/IdealImage`, `<Image`, `DWC-Course/`, `moodle` in `docs/docs`; no dotfiles under `docs/docs/dwc` and `docs/examples/dwc`.

**Footer** (lines 149-150):
```bash
if [ "$FAILS" -gt 0 ]; then echo "Phase 3: $FAILS failure(s)"; exit 1; fi
echo "Phase 3: all checks passed"; exit 0
```
Also: shellcheck-clean (`# shellcheck disable=SC2086` comment style at line 106); sitemap check pattern `"$B/sitemap.xml"` exists at lines 117-121. Shell scripts are run by the user with `!`.

---

### `tools/prove-gates.sh` (modify)

**Analog:** itself. Only line 26 changes (RESEARCH Pitfall 4):
```bash
probe "broken anchor fails build" '[x](./01-first-chapter/01-sample-page.md#no-such-anchor)' 'found broken anchors'
```
becomes `./01-gui-to-bui-to-dwc/01-registering-launching.md#no-such-anchor`. The probe writes `docs/dwc/99-gate-probe.md` (relative to `docs/`) and is removed by `trap`; keep as is. Relative path from `docs/docs/dwc/99-gate-probe.md` to the chapter works because the probe sits in `docs/docs/dwc/`.

### `tools/verify-phase1.sh` (modify)

Exact lines to repoint (verified grep): 64, 67, 87, 139 (`first-chapter` to `gui-to-bui-to-dwc`, page `sample-page` to `registering-launching`), and print test text at line ~142 (`grep -q 'First steps'`, pick a phrase from the first H2 of `registering-launching`; keep the `! grep -qE 'BBj Basics|On this page|Edit this page'` no-chrome assertion). Line 67 is a negative check (`! grep -q '/Courses/docs/dwc/first-chapter'` in the intro-bbj overview); after the change it asserts intro-bbj does not list `gui-to-bui-to-dwc`.

### `tools/verify-phase2.sh` (modify)

Line 12: `DEEP="$SITE/docs/dwc/first-chapter/sample-page"` becomes `.../docs/dwc/gui-to-bui-to-dwc/registering-launching`; check the second reference at about lines 215-216. It only passes after deploy; say so in the summary. Probe file naming convention there: `PROBE=docs/docs/dwc/99-vale-probe.mdx` (still valid).

---

### `.github/workflows/test-build.yml` (modify)

**Analog:** itself (lines 19-35). All steps run with `working-directory: docs` (job `defaults.run`). Add the check before the build so drift fails fast:
```yaml
      - run: npm ci

      - run: python3 ../tools/sync-samples.py --check

      - run: npm run build
```
Conventions: actions are version-tagged (`actions/checkout@v7`, `actions/setup-node@v7`), `permissions: contents: read`, `persist-credentials: false`. If `setup-python` is added (RESEARCH A2) follow the same style. The script must resolve paths from `__file__`, not the CWD (CWD is `docs/` here). Run `actionlint` (`tools/.bin/actionlint`) after editing.

---

### `tools/sync-samples.py`, `tools/snapshot-dwc-site.py`, `tools/relocate-dwc.py`, `tools/check-dwc-*.py` (utilities)

**No Python analog in repo.** Closest style references:

`tools/test-bbj-grammar.js` lines 1-7, 9-11: top-of-file comment with purpose and run command, path resolved from the script's own location:
```js
// Smoke test for docs/src/prism/bbj-extend.js against the pre-verified snippet
// (tools/data/bbj-token-verification.md). Run: node tools/test-bbj-grammar.js
const docsDir = path.join(__dirname, '..', 'docs');
```
Python equivalent: header comment with usage line, `ROOT = pathlib.Path(__file__).resolve().parent.parent`, never rely on CWD. `tools/requirements.txt` documents pinned Python deps for the moodle converter; Phase 4 tools use stdlib only, so no change to it.

`tools/verify-phase3.sh`: exit semantics (0 pass, 1 findings, 2 usage error), one line per finding, summary line at the end. Mirror in checkers and `--check`: print readable diffs, exit 1.

`tools/prove-gates.sh` lines 7-8: cleanup via `trap` for temp files; Python equivalent is write to temp file then `os.replace` (atomic) in sync-samples.

Specification for each script is in RESEARCH ("Samples sync design", "Snapshot design", "Route and anchor verification"): fixed `ZipInfo` date `(1980,1,1,0,0,0)`, `create_system=3`, `external_attr=0o100644<<16`, sorted POSIX arcnames, `writestr(..., compress_type=ZIP_DEFLATED, compresslevel=9)`, logical-manifest `--check`, reject `..`/absolute/symlink, skip dotfiles. Relocation script reads from `git -C ../bbj-dwc-tutorial archive 965da6d`, never the working tree.

---

### `THIRD_PARTY_NOTICES.md` (modify)

**Analog:** the existing sections of the same file. Entry shape (lines 5-10 and 30-35):
```markdown
## <Name>

- Source: `<upstream>`
- Licence: MIT, Copyright (c) <year> <holder>
- Licence text: [LICENSES/<file>](LICENSES/<file>)
```
and the directory-coverage style used for Google ("covered by directory because ... carry no header"). Add a short `## PrismJS (vendored in a sample)` section listing `docs/examples/dwc/05_CssLayouts/prism.min.css` and `prism.min.js` (and that the ZIPs in `docs/static/files/dwc/` contain them). Licence/version is ASSUMED (RESEARCH A1); verify before writing. Do not add the sample `LICENSE` (BASIS-owned). Keep no em dashes. Existing sections also record fetch dates ("fetched 2026-10-03"), mirror that if applicable.

---

### `tools/data/*` (data records)

- `tools/data/bbj-token-verification.md` is the pattern for `dwc-samples-syntax.md`: H1 title, one-line purpose, source/tool line with date ("Source build: bbj-docs ... Checked 2026-10-03."), then H2 per item with evidence. For D-20 list each of the 44 `.bbj` with result and tool build/date; record "not checkable" rather than skipping.
- `tools/data/ruleset-main.json` is the committed machine-readable analog for `dwc-old-routes.json` and `dwc-image-map.json` (JSON, two-space indent, trailing newline). Shapes: see RESEARCH Snapshot design (`source`, `base`, `routes[{route, content, anchors[{tag,id}]}]`) and image-map array `{old, new, verdict: moved|parked|not-moved, page|null}`.
- Naming: `tools/data/dwc-*` kebab-case; folders `dwc-unused-img/` with mechanical kebab names (override `Hello_BBj_DWC_Grid.png` to `hello-bbj-dwc-grid.png`, `Hello_DWC_4A.png` to `hello-dwc-4a.png`).

---

### `docs/docs/dwc/NN-*/` pages and `img/` (relocation transforms)

No in-repo analog; the transform rules are the pattern (RESEARCH "Images", "Pattern 2"):
```text
<Image img={require('@site/static/img/NAME')} alt="ALT" />   ->  ![ALT](./img/kebab-name)
![ALT](/img/NAME.gif)                                         ->  ![ALT](./img/kebab-name.gif)
import Image from '@theme/IdealImage';                       ->  (delete line; no double blank)
[x](/gui-to-bui-to-dwc/hello-world)                           ->  [x](./02-hello-world.md)
[Chapter](slug/)  (samples.md)                                ->  [Chapter](./NN-slug/index.md)
```
Kebab rule: `([A-Z]+)([A-Z][a-z])` to `\1-\2`, then `([a-z0-9])([A-Z])` to `\1-\2`, then `[_ ]+` to `-`, lowercase. Only the 9 chapters with referenced images get an `img/` folder. Existing convention reference: CLAUDE.md "Screenshots live in the section's `img/` folder, referenced as `./img/name.png`", alt text required.

## Shared Patterns

### Verify-script output contract
**Source:** `tools/verify-phase3.sh` lines 18-23 (`pass`/`fail`/`check`) and 149-150 (footer).
**Apply to:** `tools/verify-phase4.sh`, and the console output of all new Python checkers (one `PASS|FAIL  name` line each, nonzero exit on any fail).

### Build is the link/anchor/image gate
**Source:** `tools/prove-gates.sh` lines 25-28 prove that `onBroken*: throw` fires for links, anchors, Markdown links and Markdown images.
**Apply to:** every relocated page. Do not add custom link checkers; run `cd docs && npm run build`. `pathname://` links bypass the gate, so verify-phase4 must assert each target exists in `docs/static/files/dwc/` and `docs/build/files/dwc/`.

### Stale-build guard
**Source:** `tools/verify-phase3.sh` lines 45-50 (`find ... -newer "$B/index.html"`).
**Apply to:** verify-phase4 `--no-build` mode; also rebuild before running verify-phase3 after this phase.

### Front matter
**Source:** `docs/docs/intro-bbj/00-overview.mdx` lines 1-6; CLAUDE.md "Front matter has `title` and `description`. Content headings start at H2."
**Apply to:** all 27 pages (description added in commit 2, at most 160 characters, Vale-clean, no em dashes, second person, direct).

### `_category_.json` with explicit doc link
**Source:** `docs/docs/dwc/01-first-chapter/_category_.json`.
**Apply to:** all 12 chapter folders; chapter 1 must build both `/gui-to-bui-to-dwc` (index.md) and `/gui-to-bui-to-dwc/gui-to-bui-to-dwc` (03 page).

### Sidebar and registry need no change
**Source:** `docs/sidebars.js` (one `{type: 'autogenerated', dirName: b.id}` per book) and `docs/src/data/books.js` (`dwc.to = '/docs/dwc/overview'`, still resolves from `00-overview.mdx`).
**Apply to:** verify only; no edits expected.

### Vale
**Source:** CLAUDE.md "Before committing"; `tools/.bin/vale --minAlertLevel=error docs/docs/dwc`. Inline code is skipped by Vale (wrap file names such as `GUISample.bbj`, `.arc`, `dwc.style` in backticks); `{#id}` is ignored (`BlockIgnores`). Pin any changed heading with `{#old-id}` (D-06).
**Apply to:** commit 3, after commit 2 re-run (front matter and descriptions are linted too).

### MIT header rule
**Source:** `THIRD_PARTY_NOTICES.md`, CLAUDE.md. New tools are original BASIS code: no header needed. Vendored `prism.min.*` get a notice entry, not a header (minified, byte-for-byte copy).

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `tools/sync-samples.py`, `snapshot-dwc-site.py`, `relocate-dwc.py`, `check-dwc-*.py` | utility | batch / transform | No Python script exists in `tools/` (moodle2docusaurus.py is referenced in CLAUDE.md but absent). Use RESEARCH specs plus the shell/Node style above. |
| `docs/examples/dwc/**` | sample source | file copy | `docs/examples/` does not exist; copy byte-for-byte from `git archive 965da6d samples` (D-19 keeps folder names, including `07_ControlValiation`). |
| `docs/static/files/dwc/*.zip` | generated asset | batch | No generated committed assets yet; produced only by `tools/sync-samples.py`. |
| Relocated chapter pages and images | page / asset | file copy | Content comes from `../bbj-dwc-tutorial` at `965da6d`; transforms in "relocation transforms" above. |
| `tools/data/dwc-unused-img/` | asset park | file copy | New concept; mechanical kebab names, deleted by Phase 6. |

## Metadata

**Analog search scope:** `tools/` (all files), `.github/workflows/`, `docs/docs/{dwc,intro-bbj}`, `docs/sidebars.js`, `docs/src/data/books.js`, `THIRD_PARTY_NOTICES.md`, `tools/data/`.
**Files scanned:** about 20 (read: verify-phase3.sh, prove-gates.sh, test-build.yml, parts of verify-phase1/2.sh and test-bbj-grammar.js, overview stubs, `_category_.json`, sidebars.js, books.js, notices, requirements.txt, token-verification record).
**Pattern extraction date:** 2026-10-03
