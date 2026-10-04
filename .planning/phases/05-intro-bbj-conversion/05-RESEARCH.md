# Phase 5: Intro-BBj Conversion - Research

**Researched:** 2026-10-04
**Domain:** One-shot Moodle backup (HTML in XML) to Docusaurus MDX conversion, plus sample packaging
**Confidence:** HIGH on backup facts (unpacked and inspected this session), MEDIUM on dead-link successors

## Summary

The course-2 backup was unpacked and inspected in this session. It matches the CONTEXT.md "Backup facts" with two corrections the planner must handle (see Open Questions): the backup holds only **8 referenced images plus 1 orphan file** (not 9 displayed images), and **chapter 27 has an empty `<video>` with no source** (harmless, drop it). The content is plain, small HTML (about 262 `<p>`, 144 `<br>`, 109 style-only `<span>`). All chapters are under 3.2 KB. The hard part is code recovery, not volume: code lives in `<code>` wrappers that contain block-level `<p>` children, plus one unclosed `<code><p>..</p><code>` that makes a normal HTML parser swallow the rest of chapter 24.

Everything needed is already in the repo: pinned converter deps in `tools/requirements.txt`, the globally registered `YouTube` component, the `:::exercise` admonition, `tools/sync-samples.py` (generic per book, with a CI `--check`), the DWC book as a structural model, and `docs/examples/dwc/LICENSE` + `README.md` to mirror. The converter dependencies are **not installed** on this machine (`bs4` is missing, `lxml` 6.0.2 is present but pinned 6.1.3), so Wave 0 must create a venv. Local Node is v22.22.0 while `docs/.nvmrc` says 24.

**Primary recommendation:** Build the converter as a pipeline of (1) raw-string pre-fixes keyed by chapter id (unclosed `<code>`, video elements, empty `<video>`), (2) BeautifulSoup/lxml DOM cleanup, (3) a custom code-block pass that emits fences, (4) markdownify for prose, (5) MDX escaping with backslashes (not entities), and (6) a report that fails non-zero on any unresolved count. Keep every editorial decision (titles, slugs, image names/alt, video titles, code overrides, link rewrites) in `tools/data/` JSON maps so re-runs are byte-stable and commit 2 stays reproducible.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
(Verbatim summary of D-01 to D-25 in `05-CONTEXT.md`; the planner MUST read that file. Key locked points:)
- D-01: 3 "PLEASE READ FIRST" chapters are top-level pages after the Overview, `sidebar_position` 0.1/0.2/0.3 (like DWC `prerequisites.mdx`).
- D-02: Sections become folders `01-` to `04-`; category labels sentence case without the number.
- D-03: Each section folder gets `index.mdx` (short intro + `<DocCardList />`); `_category_.json` link `{type:'doc', id:'intro-bbj/<section-slug>/index'}`; section 1 uses `book_8` `<intro>` text.
- D-04: Exercise pages `9N-exercise-<slug>.mdx` inside `:::exercise`; required "Exercise: ...", optional "Bonus exercise: ..."; S1: 90 tic-tac-toe, 91 computer player; S2: 90 login dialog, 91 OO tic-tac-toe; S3: 90 responsive login dialog; S4: none; drop due dates/submission/grading.
- D-05/D-06: Sentence-case light-cleanup titles and a hand-picked slug map, both in the converter (or data file).
- D-07: `00-overview.mdx` = course summary prose, `<DocCardList />`, plain start link, short download list; keep front matter pattern.
- D-08: Phase 1 stubs replaced in the generated-docs commit.
- D-09/D-10: Code detection = heuristic + explicit override table; own paragraph = fence, inline `<code>` in running text stays backticks; every fence has a language; "unclassified code" reaches zero.
- D-11/D-12: Generated commit is verbatim converter output; then `bbj_check_syntax` on every snippet and every `.bbj`, record in `tools/data/intro-bbj-syntax.md`, fix only real errors in a separate commit; keep code as taught.
- D-13: Vale in this phase = error-level + obvious typos only; warnings/suggestions are Phase 7; reviewdog must pass.
- D-14: "Please Contribute!" becomes "Help improve this course" pointing to GitHub issues on `BasisHub/Courses`; drop mailing list and Google scratchpad.
- D-15/D-16: Minimal rewrite of Moodle/time-specific wording in a hand-edit commit.
- D-17: Converter rule `documentation.basis.com` to `documentation.basis.cloud`; MDN, css-tricks, Wikipedia, GeeksforGeeks, w3schools and the `17vgI1...` Google Doc stay; `localhost:8888` URLs stay as text/code.
- D-18: Dead links get a verified successor, recorded in `tools/data/intro-bbj-link-map.json`; applied in the hand-edit commit.
- D-19/D-20: Descriptive kebab-case image names + hand-written alt in `tools/data/intro-bbj-image-map.json`; real YouTube titles in `tools/data/intro-bbj-video-map.json`.
- D-21 to D-24: Sample folders under `docs/examples/intro-bbj/` (descriptive kebab-case), ZIPs from `tools/sync-samples.py`, `LICENSE` (confirm MIT with Stephan) + Claude-written `README.md`, download links in the using chapter and in the overview.
- D-25: One PR; commit order: converter, generated docs, hand edits, Vale errors/typos, BBj syntax report and fixes.

### Claude's Discretion
Exact slug/title maps, section index wording, overview prose (all Vale-clean, direct, second person, no em dashes); converter structure/CLI/report format/unpack location; whether heuristic + overrides live in code or `tools/data/`; `tools/verify-phase5.sh`; exact sample folder names within D-21's pattern.

### Deferred Ideas (OUT OF SCOPE)
Modernizing 2021-era BBj patterns; Vale warnings/suggestions (Phase 7); refreshed Enterprise Manager screenshots; rewording CONV-06's file list (at phase transition).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONV-01 | Converter prints report with all-zero unresolved counts; every file compiles as MDX | Report design, MDX compile check via `@mdx-js/mdx` (verified present in `docs/node_modules`), pitfalls on escaping |
| CONV-02 | 28 chapter pages + overview in Moodle order | Verified chapter/pagenum/section tables below; order by `<pagenum>` |
| CONV-03 | Language-tagged fences, no entities/`<br>` | Code recovery pipeline, nested-`<code>` pitfall, NBSP handling |
| CONV-04 | 10 videos as `<YouTube>` | 10 unique IDs and live oEmbed titles verified |
| CONV-05 | 9 images with hand-written alt | (chapter id, filename) mapping; only 8 are referenced, see Open Question 1 |
| CONV-06 | Sample files downloadable, each in its own folder | File inventory, CRLF/LF pitfall, sync-samples constraints |
| CONV-07 | Converter and docs committed separately | Commit plan, reproducibility rule (relocate-dwc.py pattern) |
| EXER-01 | 5 assignments as `9N-exercise-*.mdx` | Assignment inventory and section placement verified |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Archive unpack, XML/HTML parse, MD emit | Build-time tooling (Python, `tools/`) | None | Throwaway converter, never runs in CI |
| Chapter/exercise rendering, sidebar, DocCardList | Static site generator (Docusaurus build) | None | Pure Markdown/MDX in `docs/docs/intro-bbj/` |
| YouTube embed | Browser (React facade `YouTube`) | CDN (youtube-nocookie) | Already built in Phase 3; pages only use the tag |
| Sample downloads | CDN/Static (`docs/static/files/intro-bbj/*.zip`) | Build tooling (`sync-samples.py`) | Generated, drift-checked by CI |
| Validation (links, anchors, images) | Docusaurus build (`onBroken*: 'throw'`) | `tools/verify-phase5.sh` | Build is the acceptance gate |
| Prose lint | Vale (local + reviewdog) | None | Error-level only in this phase |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| beautifulsoup4 | 4.15.0 | DOM cleanup of chapter HTML | Already pinned in `tools/requirements.txt` [VERIFIED: pip index, repo file] |
| lxml | 6.1.3 | HTML/XML parser backend | Pinned; local machine has 6.0.2, so use a venv [VERIFIED: pip index, `pip3 list`] |
| markdownify | 1.2.3 | HTML to Markdown for prose | Pinned; subclass `MarkdownConverter` for custom nodes [VERIFIED: pip index] |
| six | 1.17.0 | markdownify dependency (`six>=1.15,<2`) | Pinned [VERIFIED: pip index, repo file comment] |
| Python stdlib | 3.11.4 local | `tarfile`, `xml.etree.ElementTree`, `urllib`, `json`, `zipfile` | No extra deps; use `tarfile` `filter='data'` (available from 3.11.4) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@mdx-js/mdx` | present in `docs/node_modules` | "Compiles as MDX" check per file | A tiny `node` script run from `docs/`, called by the report and verify script [VERIFIED: ran `compile()` in this session; it rejects `<temporary chapter>` and accepts backslash-escaped text] |
| `tools/sync-samples.py` | repo | Reproducible ZIPs + `--check` | After `git add` of the examples (it only zips git-tracked files) [VERIFIED: read source] |
| Vale 3.24.0 | `tools/.bin/vale` | Prose gate | Run per changed file; `.vale.ini` MinAlertLevel=suggestion, so filter to errors [VERIFIED: ran `--version`] |
| BBj Documentation MCP | n/a | `bbj_check_syntax`, `bbj_lookup` | Commit 5 only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| markdownify | pandoc `html -t gfm` | Not pinned/installed; the seed allows it, but the repo pinned markdownify already |
| Backslash MDX escaping | `&lt;` / `&#123;` entities | Entities would trip the "no `&lt;` leftovers" acceptance grep; backslashes compile fine [VERIFIED: ran MDX compile] |

**Installation (Wave 0):**
```bash
python3 -m venv .venv && . .venv/bin/activate   # .venv/ is gitignored
pip install -r tools/requirements.txt
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| beautifulsoup4 | PyPI | many yrs | very high | launchpad/bs4 | unavailable | Approved: pinned in repo since Phase 1; version confirmed on PyPI [ASSUMED for slopcheck purposes] |
| lxml | PyPI | many yrs | very high | github.com/lxml/lxml | unavailable | Approved: pre-existing pin |
| markdownify | PyPI | years | high | github.com/matthewwithanm/python-markdownify | unavailable | Approved: pre-existing pin |
| six | PyPI | many yrs | very high | github.com/benjaminp/six | unavailable | Approved: pre-existing pin |

slopcheck could not be installed (`pip install slopcheck` produced no `slopcheck` command), so legitimacy rests on the four packages being project decisions already recorded in `tools/requirements.txt` and confirmed on PyPI via `pip index versions`. No new packages are recommended. Packages removed: none. Flagged suspicious: none.

## Architecture Patterns

### System Architecture Diagram

```
import/backup-...course-2....mbz  (gitignored, local)
        |  tarfile (filter='data', reject abs/.. paths)
        v
  unpack dir (outside repo or import/unpacked/intro)
        |
        +--> course/course.xml ---------------------> overview prose (summary)
        +--> sections/section_N/section.xml --------> section order, sequence (module ids)
        +--> activities/book_X/book.xml ------------> chapters (sort by <pagenum>)
        |        content (escaped HTML in XML) --ET unescape once--> HTML string
        |            |
        |            v  (1) raw-string fixes keyed by chapter id (unclosed <code>, video, empty video)
        |            v  (2) BeautifulSoup/lxml: drop style spans, empty h*/p/br, NBSP, h-level normalize
        |            v  (3) code pass: <code>/<p> blocks + override table -> fenced blocks, lang heuristic
        |            v  (4) markdownify prose; <youtube> -> <YouTube id title/>; images -> ./img/x.png + alt
        |            v  (5) link pass: .com->.cloud, link map; MDX escape ({ } <) with backslashes
        |            v  (6) front matter (title map, description <=160), file write (LF, one trailing \n)
        +--> activities/assign_N/assign.xml --------> 9N-exercise-*.mdx in :::exercise
        +--> activities/resource_N + files.xml + files/<hh>/<hash> --> docs/examples/intro-bbj/<folder>/ (LF-normalized)
        v
 docs/docs/intro-bbj/  +  docs/examples/intro-bbj/  +  tools/data/intro-bbj-*.json
        |  git add examples; python3 tools/sync-samples.py intro-bbj
        v
 docs/static/files/intro-bbj/*.zip
        |  report: zero counters; node MDX compile of every .mdx; npm run build; vale; verify-phase5.sh
```

### Recommended Project Structure
```
docs/docs/intro-bbj/
├── 00-overview.mdx                 # sidebar_position 0, explicit DocCardList items (as DWC)
├── structure.mdx / audience.mdx / contribute.mdx   # sidebar_position 0.1, 0.2, 0.3
├── 01-<slug>/{_category_.json,index.mdx,01-..mdx,...,90-exercise-*.mdx,91-exercise-*.mdx,img/}
├── 02-.../  03-.../  04-.../
docs/examples/intro-bbj/{LICENSE,README.md,better-hello-world/,oo-samples/,dwc-lesson-start/,dwc-lesson-result/}
tools/moodle2docusaurus.py
tools/data/intro-bbj-{title-map?,image-map.json,video-map.json,link-map.json,syntax.md}
tools/verify-phase5.sh   (+ optional tools/check-intro-bbj.py)
```

### Backup inventory (verified 2026-10-04) [VERIFIED: unpacked .mbz]

Chapters by `pagenum` (chapter id in parentheses; `yt`=video, `img`=image refs, `code`=has `<code>`):

| Section (book module) | Order and chapter |
|---|---|
| Top-level (book_10) | 1 Structure of this Material (9); 2 Who can use this course (10); 3 Please Contribute! (11) |
| S1 (book_8) | 1 Setup Java, BBj and Eclipse (2, yt); 2 A first "Hello World" (3, yt, code); 3 Basics about Syntax and Variables (4, yt, code); 4 A Better Version of "Hello World" (5, yt); 5 Loops and IF-Statements (6, yt, code); 6 Types of Input Fields (7); 7 Next Sample: A multiplying Calculator (8, code); 8 ...some more hints: (12) |
| S2 (book_12) | 1 What is Object Oriented Programming? (17); 2 A first Class in BBj (13, yt); 3 Reference Classes from Other Programs (14, yt, code); 4 An Object Oriented Dialog (15, yt, img); 5 Additional Documentation and Random Useful Hints (16) |
| S3 (book_16) | 1 Introduction (25, yt); 2 Basics (18, img x2); 3 Developing for the Web (19, img, code); 4 Change the Layout Mode for a Window (20, img, code); 5 Add CSS Layout Instructions (21, img, code); 6 Adding CSS to BBj Controls (22, code); 7 Setting Style Attributes on Controls (23, img, code); 8 Adding an external CSS file (24, img, code) |
| S4 (book_20) | 1 Styling Parts in the Shadow Dom (26, yt, code); 2 Switching your BBj App to Dark Theme (27, code, empty `<video>`); 3 Use the DWC Theme Editor to create your own Theme (28); 4 Reference Manual on Theming (29) |

Section sequences (module ids): S1 `8,11,6,7` = book_8, resource_11, assign_6, assign_7. S2 `12,13,14,15` = book_12, resource_13, assign_14, assign_15. S3 `16,17,18,19` = book_16, resource_17, resource_18, assign_19. S4 `20`. S0 `9,10` (forum_9 hidden: skip; module 10 = book_10).

Videos (10 unique, live titles via YouTube oEmbed, HTTP 200 for all) [VERIFIED: curl oEmbed]:

| Chapter id | ID | oEmbed title (raw) |
|---|---|---|
| 2 | Ovk8kznQfGs | BBx Clues 1:  Setup Java, BBj and Eclipse |
| 3 | fF9LaVXJGuA | BBx Clues 2: A first "Hello World" |
| 4 | DRjpwGLKzQA | BBx Clues 3: Variables |
| 5 | oG1Q5wVf3u4 | BBx Clues 4: A better version of "Hello World" |
| 6 | jxSfPOuj_nk | BBx Clues 5: Loops and IF Statements |
| 13 | Yyilg_zJ4wc | BBx Clues 6: A Primer on BBj's Object Oriented Syntax |
| 14 | aN518WzvIOQ | BBx Clues 7: Reference BBj Classes from Other Programs |
| 15 | z3g51m9Mc_0 | BBx Clues 8: An Object-Oriented Dialog Class in BBj |
| 25 | a33nWuuyX7o | BBx Clues 9: Develop for the Web with BBj's DWC (first steps) |
| 26 | 9HQBN-PVHWs | BBx Clues 10: Styling Parts of the Shadow DOM with CSS |

Clean titles by collapsing the double space in "1:  Setup" and keeping the "BBx Clues N:" prefix (matches what readers see on YouTube; "Hello World" quotes are fine in a JSX string attribute if escaped, prefer `title="BBx Clues 2: A first Hello World"` or use `{'...'}`). Vale may dislike the capitalised "A Primer", so normalise to sentence case in the map. IDs contain `_` and `-`; the `YouTube` component accepts `[A-Za-z0-9_-]{11}`.

Images (9 files, `mod_book`/`chapter`, keyed by itemid = chapter id) [VERIFIED: files.xml + chapter HTML]:

| Chapter | Files | Referenced in HTML |
|---|---|---|
| 15 | image.png | yes |
| 18 | image.png, image (1).png | yes, yes |
| 19, 20, 21, 23 | image.png each | yes |
| 24 | image.png, image (1).png | **only `image%20%281%29.png` (the annotated one) is referenced; `image.png` is an unannotated orphan** |

HTML references are URL-encoded (`@@PLUGINFILE@@/image%20%281%29.png`). Decode before lookup. Chapter 24's two files show the same Enterprise Manager "Web App Only" panel; the referenced one has a red arrow and box on the `CSS:` field and `+` button. All `alt` are empty with `role="presentation"` and must be replaced.

Resources (files in `files/<hash[:2]>/<contenthash>`; map names via `files.xml`) [VERIFIED]:

| Resource | Moodle name | File | Notes |
|---|---|---|---|
| resource_11 | BetterHelloWorld.bbj | 463 bytes | CRLF, no final newline |
| resource_13 | Samples from the Videos | `BBj OO Samples.zip` = Car.bbj, CarApplication.bbj, MyDialog.bbj | intro text lists the 3 files "as shown in the three videos" |
| resource_17 | Sample.bbj (prep file for this lesson) | 753 bytes, CRLF | start file; matches ch 19 program except German labels ("Vorname") |
| resource_18 | Sample.bbj and sample.css | `samples.zip` = Sample.bbj (1344), sample.css (82) | result of ch 24 |

Assignments (5) [VERIFIED]: assign_6 "Write a Tic-Tac-Toe game"; assign_7 "Optional Bonus Task: Add computer player logic to your Tic Tac Toe." ; assign_14 "Task Assignment: Login Dialog"; assign_15 "Optional Bonus Task: Make your Tic Tac Toe Object-Oriented"; assign_19 "Make your Login Dialog responsive". The `intro` HTML is the only content. Assign_19 contains a `documentation.basis.com/.../bbjchildwindow.htm` link (on `.cloud` it returns 200) and a `<em>` aside; assign_6 links to Wikipedia.

### Pattern 1: Compile-clean MDX from HTML
**What:** After markdownify, escape `{`, `}` and `<` + letter in prose with a backslash; never touch fences or inline code.
**Verified:** `a \<temporary chapter\> b \{x\} $01101083$ ok` compiles; unescaped `<temporary chapter>` fails with "Expected a closing tag". BBj hex literals like `$00010000$` and `$01101083$` are plain text in MDX (no math plugin in the config, grep of `docusaurus.config.js` found no remark-math).

### Pattern 2: Maps in `tools/data/`, converter as pure function of (backup, maps)
Title map, slug map, image map (`{chapterId, file} -> {name, alt}`), video map (`id -> title`), link map (`old -> new|null`), code-override table (`chapterId + text anchor -> language`). A re-run with no network and no edits must reproduce commit 2 byte for byte. Mirror `tools/relocate-dwc.py`: it refuses to run after the output commit exists unless `--force`, and writes its own map file. Also mirror its exit codes (0 ok, 1 failed count, 2 missing input).

### Pattern 3: Category and index pages (copy DWC)
`_category_.json`: `{"label": "...", "position": N, "link": {"type": "doc", "id": "intro-bbj/<slug>/index"}}` where the id drops the numeric prefix [VERIFIED: `docs/docs/dwc/01-gui-to-bui-to-dwc/_category_.json`]. Section `index.mdx` uses front matter `title`, `description`; `<DocCardList />` without items auto-lists the category. The overview is not a category, so DWC passes explicit `items=[{type:'link', label, href, description}]`; do the same with hrefs `/docs/intro-bbj/<section-slug>`.

### Pattern 4: Download links
`[Name](pathname:///files/intro-bbj/<zip>)`, as in `docs/docs/dwc/samples.mdx` [VERIFIED]. Do not use `/files/...` raw (link checker). The overview lists all four plus `intro-bbj-samples.zip`.

### Anti-Patterns to Avoid
- **Parsing the malformed ch 24 `<code>` with lxml as-is:** the unclosed inner `<code>` nests the rest of the chapter inside a code block. Repair the raw string first (override keyed by chapter id 24).
- **Letting markdownify handle `<code>` blocks:** it will emit inline backticks around multi-line content. Intercept block-level `<code>` before markdownify.
- **Using `str.strip()` and forgetting U+00A0:** Moodle indents code with `&nbsp; &nbsp; ` which become `\xa0`. Convert `\xa0` to space (4-space indent per `&nbsp; &nbsp; `) before writing fences.
- **Deriving image names from the filename:** every name is `image.png`; always key by (chapter id, decoded filename).
- **Editing the converter after commit 2 to fix content:** fixes belong in the Markdown (CONTEXT, PROJECT.md).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP creation | custom zipfile code | `tools/sync-samples.py intro-bbj` | Deterministic bytes, CI `--check`, only git-tracked files |
| MDX validity check | regex heuristics | `@mdx-js/mdx` `compile()` via `node` | Same grammar as the build |
| YouTube embed markup | iframe HTML | `<YouTube id="..." title="..." />` | Component enforces id/title (throws otherwise) |
| Exercise styling | custom div | `:::exercise Title` | Registered admonition from Phase 3 |
| HTML to MD of prose | own tag walker | markdownify subclass | Lists, links, emphasis, headings handled |
| Tar safety | manual path join | `tarfile.extractall(filter='data')` | Blocks traversal and absolute paths |
| Checking BBj code | eyeballing | `bbj_check_syntax` via MCP | CLAUDE.md rule |

**Key insight:** The only truly custom logic is code-block recovery and the editorial maps. Everything else exists.

## Common Pitfalls

### Pitfall 1: Unclosed `<code>` in chapter 24 swallows the page
**What goes wrong:** `<code><p>::BBUtils.bbj::...</p><code>` (second tag opens, not closes) puts the remaining prose and the empty `<h1>` inside code.
**How to avoid:** Raw-string fix keyed by chapter id before parsing; add a unit assertion that ch 24 yields exactly the prose paragraphs after the `applyCss` fence.
**Warning signs:** Fence that ends the file; "What this does is basically re-register..." inside a fence.

### Pitfall 2: Block `<p>` children inside `<code>`, `<br>` and empty `<p>` lines
**What goes wrong:** Naive text extraction yields doubled blank lines or loses line breaks (ch 3, 19, 26, 27, 8).
**How to avoid:** For a block `<code>`: each child `<p>` is a line group, `<br>` is `\n`, an empty `<p>` (or only `<br>`) is one blank line; collapse 3+ newlines to 2; strip trailing blanks; replace `\xa0` with space. Ch 8 is one `<p>` per line plus spans; ch 27 mixes spans and `<br>`.

### Pitfall 3: Unmarked code in plain `<p>` (override table)
**What goes wrong:** The CSS rule `.mypanel{...}` and `wnd!.addPanelStyle("mypanel")` in ch 24 are ordinary paragraphs; those two cases plus any BBj one-liner paragraphs elsewhere will be prose.
**How to avoid:** Override table (chapter id + text anchor to language). Run the converter once with a "list suspicious paragraphs" mode (paragraphs matching the seed 6.1.4 heuristic that are not in `<code>`) so the table is complete; the report's "unclassified code" must count zero. Known language classes: ch 24 `.mypanel{...}` css; `addPanelStyle` bbj; `::part(control)` css (ch 26); ch 3 `A=MSGBOX("Hello World")` bbj. Inline `<code>` runs like `CLASS - CLASSEND, METHOD - METHODEND` in ch 4 stay inline.

### Pitfall 4: Videos
**What goes wrong:** `<video controls><source src="https://youtu.be/ID">https://youtu.be/ID</video>` parses unpredictably (void `source`, URL text inside video); one `<video>` (ch 27) has no source at all.
**How to avoid:** Regex-replace each whole `<video...>...</video>` before DOM parsing: extract the ID with `youtu\.be/([A-Za-z0-9_-]{11})`; emit a placeholder paragraph; drop sourceless videos and report them as "skipped (empty video, ch 27)". Surrounding `&nbsp;` and `<br>` in that `<p>` should vanish. Final count must be exactly 10.

### Pitfall 5: MDX and `$@NULL@$`, entities, `<`
**What goes wrong:** `&lt;temporary chapter ...&gt;` and `&lt;will be added during the session&gt;` (both in ch 28) become raw `<...>` after HTML unescape and break MDX; `$@NULL@$` tokens appear in section names (65 occurrences) and `completiongradeitemnumber` fields.
**How to avoid:** Backslash-escape (see Pattern 1) so commit 2 compiles; remove the `$@NULL@$`-bearing fields from any output path (only the S0 section name is relevant; use a fixed label). The hand-edit commit then rewrites ch 28 (D-15) and must also handle the second placeholder "`<will be added during the session>`", which CONTEXT did not mention.

### Pitfall 6: Heading levels
**What goes wrong:** Chapters use `<h3>`, `<h4>`, `<h5>` (7), an empty `<h1 id="title"><br></h1>` (ch 24), and headings that hold only `<br>`/spans.
**How to avoid:** Drop empty headings; strip spans; then rank the distinct heading levels present in a chapter and map them to H2, H3, H4 in order (ch 3: h4 to H2; ch 4: h3 to H2, h5 to H3). No H1 in content (D-07 of Phase 4 pattern).

### Pitfall 7: CRLF and trailing newline in samples
**What goes wrong:** Moodle files are CRLF. `.gitattributes` forces `docs/examples/** text eol=lf`, and `sync-samples --check` compares CRCs of working-tree bytes; CRLF in the working tree would zip differently from a CI checkout.
**How to avoid:** Normalise to LF when extracting; ensure one final newline (BetterHelloWorld.bbj ends with `release` and no newline; Sample.bbj ends `return`). Do this in the converter so commit 2 stays reproducible, and run `git add` before `sync-samples.py`.

### Pitfall 8: Markdown typography escapes by markdownify
**What goes wrong:** markdownify escapes `_` and `*` in prose (for example `BBjInputN` is fine, but `getAvailableControlID`, `ed_vorname!` in prose, `x*y`) and may leave `\_`. Acceptable but check rendering and Vale. `$...$` hex strings in prose (`$00010000$`) must pass unescaped.
**How to avoid:** Review a sample of output; pass `escape_underscores`-style options explicitly; assert via MDX compile and a grep for `\\_` count in the report.

### Pitfall 9: Verify scripts that assume the stubs
**What goes wrong:** `tools/verify-phase1.sh` lines 66-67 assert `/Courses/docs/intro-bbj/getting-started` appears in the intro-bbj sidebar and not in dwc. Replacing the stub folder breaks it. [VERIFIED: grep]
**How to avoid:** Update those two checks in the generated-docs commit (point to a real section route such as the first section slug). The DWC "omits intro-bbj chapter" check should name a real new route. verify-phase3 search check reads the search index generically (not stub-bound), but re-run it. verify-phase4 is a point-in-time gate on dwc and should stay green.

### Pitfall 10: Unreferenced orphan image
See Open Question 1; the report must list files present in `files.xml` but never referenced so the count is explicit rather than silently 8.

### Pitfall 11: Local tool versions
`bs4` not installed; `lxml` 6.0.2 locally vs 6.1.3 pinned; Node 22.22.0 vs `.nvmrc` 24. Use a venv for Python. For the MDX compile script and `npm run build`, Node 22 may print engine warnings; use `nvm use` if 24 is available before the gate runs.

## Code Examples

### Unpack safely
```python
# Source: Python 3.11.4+ tarfile docs (extraction filters)
import tarfile
with tarfile.open(mbz, "r:gz") as tf:
    tf.extractall(dest, filter="data")   # rejects abs paths, .., links outside dest
```

### Extract video IDs before any DOM parsing
```python
import re
VIDEO = re.compile(r"<video\b[^>]*>(.*?)</video>", re.S)
YT = re.compile(r"youtu\.be/([A-Za-z0-9_-]{11})")
def sub_video(html, chapter_id, report):
    def repl(m):
        ids = YT.findall(m.group(0))
        if not ids:
            report.skipped_videos.append(chapter_id); return ""
        return f'<p data-youtube="{ids[0]}"></p>'
    return VIDEO.sub(repl, html)
```

### Block code from a `<code>` with `<p>` children
```python
def code_text(code_tag):
    lines = []
    for el in code_tag.find_all(["p"], recursive=False) or [code_tag]:
        for br in el.find_all("br"): br.replace_with("\n")
        t = el.get_text().replace("\xa0", " ").rstrip()
        lines.append(t)
    text = "\n".join(lines)
    return re.sub(r"\n{3,}", "\n\n", text).strip("\n")
```

### Language heuristic (seed 6.1.4, as adapted)
```python
BBJ_START = ("rem ", "declare ", "print ", "use ", "method ", "class ", "wait", "goto ", "gosub ",
             "process_events", "return", "release", "bye")
def lang(text):
    t = text.lstrip().lower()
    if re.search(r"[.#\w-]+\s*(::part\([^)]*\))?\s*\{", text) and ":" in text and ";" in text: return "css"
    if t.startswith("<"): return "html"
    if any(k in t for k in ("function", "const ", "=>", "document.")): return "javascript"
    if t.startswith(BBJ_START) or "!" in text or "$" in text or "::" in text: return "bbj"
    return None   # counts as unclassified unless an override table entry exists
```

### MDX compile check of one file
```js
// Run from docs/ so @mdx-js/mdx resolves. Source: @mdx-js/mdx compile(); verified in this session.
import {compile} from '@mdx-js/mdx'; import fs from 'node:fs';
for (const f of process.argv.slice(2)) {
  try { await compile(fs.readFileSync(f, 'utf8'), {format: 'mdx'}); }
  catch (e) { console.error('FAIL', f, e.message); process.exitCode = 1; }
}
```
Note: plain `compile` does not know Docusaurus admonition syntax (`:::exercise`), which is just text to it, and front matter must be stripped or `remark-frontmatter` added; strip the `---` block before compiling, or rely on `npm run build` as the authoritative compile.

### Exercise page
```mdx
---
title: "Exercise: Write a Tic-Tac-Toe game"
description: Build a two-player Tic-Tac-Toe game with mouse input and win detection.
---

:::exercise
...converted assignment text...
:::
```
`:::exercise Title` overrides the default box title (see `docs/docs/authoring/components.mdx`) [VERIFIED].

## Proposed maps (for the planner; Claude's discretion per CONTEXT)

Top-level: `structure.mdx` (0.1, "Structure of this material"), `audience.mdx` (0.2, "Who can use this course"), `contribute.mdx` (0.3, "Help improve this course").

| Folder (label) | Pages (slug = file name sans prefix) |
|---|---|
| `01-getting-started` ("Set up your environment and get started") | 01-setup, 02-first-hello-world, 03-syntax-and-variables, 04-better-hello-world, 05-loops-and-if-statements, 06-input-field-types, 07-multiplying-calculator, 08-more-hints, 90-exercise-tic-tac-toe, 91-exercise-computer-player |
| `02-object-oriented-syntax` ("Object-oriented syntax in BBj") | 01-what-is-oop, 02-first-class, 03-reference-classes, 04-oo-dialog, 05-more-hints-and-docs, 90-exercise-login-dialog, 91-exercise-oo-tic-tac-toe |
| `03-web-development` ("Web development with BBj's DWC") | 01-introduction, 02-basics, 03-developing-for-the-web, 04-window-layout-mode, 05-css-layout-instructions, 06-css-on-controls, 07-style-attributes, 08-external-css-file, 90-exercise-responsive-login-dialog |
| `04-theming-and-styling` ("Theming and styling the BBj web components") | 01-shadow-dom-parts, 02-dark-theme, 03-theme-editor, 04-theming-reference |

Folder names should avoid `01-getting-started` colliding visually with the old stub route only if a stale `docs/build` is used; the stub is deleted in the same commit, so reuse is fine. Download placement (D-24): better-hello-world ZIP in "A better Hello World" (ch 5); OO samples ZIP in "An object-oriented dialog" (ch 15, the last of the 3 OO video chapters 13, 14, 15); `dwc-lesson-start` at the start of "Developing for the web" (ch 19, first DWC chapter with code; ch 18 "Basics" has none); `dwc-lesson-result` at the end of "Adding an external CSS file" (ch 24).

## Dead-link successors (D-18) [researched this session]

| Old URL | Finding | Suggested action |
|---|---|---|
| `https://www.basis.com/eclipseplug-ins` | `https://basis.cloud/eclipseplug-ins/` returns 200 (also reached from `www.basis.cloud/eclipseplug-ins`) [VERIFIED: curl] | Replace with `https://basis.cloud/eclipseplug-ins/` |
| `https://basishub.github.io/basis-next/#/dwc/` (and `...bbj-button?id=shadow-parts`, `...themes?id=enable-dark-theme`) | BASIS's own DWC Overview page links component docs to `https://dwc.style/docs/#/dwc/` and the theme engine to `https://dwc.style/docs/#/theme-engine/?id=bbj-theme-engine` [CITED: documentation.basis.cloud/BASISHelp/WebHelp/dwc/DWC_Overview.htm]. `dwc.style/docs/` returns 200 but is a Docsify SPA with hash routes, so a fragment cannot be verified by curl | Map `basis-next/#/dwc/...` to `https://dwc.style/docs/#/dwc/...` and `#/theme-engine/` to `https://dwc.style/docs/#/theme-engine/`; MEDIUM confidence, spot-check the hash routes in a browser (`dwc/bbj-button`, `themes`) before committing, else link the parent `#/dwc/` or unlink |
| `https://hot.bbx.kitchen/webapp/DWCThemeEditor` | No successor found: the DWC Overview page does not mention a Theme Editor [CITED: same page]. A search hit "bdeditor.dev Theme Editor" is unrelated/unverified | Unlink and keep text; record "unlinked". Ask Stephan whether the Theme Editor now ships in BBj |
| `basishub.github.io/basis-next/#/theme-engine/` | see row 2 | same |

Related currency note [CITED: web search summarizing basis.cloud/eclipseplug-ins]: from BBj 26.00 the Eclipse IDE and BDT plug-ins are superseded by the standalone "BDT Studio". Chapter 1 ("Setup Java, BBj and Eclipse") and the video describe Eclipse. D-12 defers modernization, but flag this to Stephan; do not rewrite in this phase. Also `localhost:8888/bbjem/em` stays as code text.

Other external `documentation.basis.com` links (20 paths) get the D-17 domain rule; CONTEXT recorded they return 200. Two additional spot checks passed this session (`bbjchildwindow.htm` on `.cloud`: 200).

## Runtime State Inventory
Not a rename/refactor phase. Omitted. One note: the previously published stub URLs (`/docs/intro-bbj/getting-started`, `.../01-sample-page`) will disappear; they hold no real content, and `books.js` points to `/docs/intro-bbj/overview`, which stays.

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `documentation.basis.com` | `documentation.basis.cloud` | D-17 rule |
| Eclipse + BDT plug-ins (BBj < 26) | BDT Studio (BBj 26.00+) [CITED: web search of basis.cloud] | Chapter 1 content is dated; defer |
| `--bbj-*` CSS vars, `bbj-` component names | `--dwc-*`, `dwc-` (BBj 24.00) [CITED: basis.cloud KB via search] | Ch 26 `::part(control)` and "BBjButton shadow parts" prose may be dated; defer, verify in Phase 7 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `dwc.style/docs/#/dwc/...` hash routes mirror the old `basis-next/#/dwc/...` routes | Dead-link successors | Broken external links (not checked by the build); mitigated by a browser spot check |
| A2 | `ctx7`/slopcheck were not used; package legitimacy rests on repo pins | Package Legitimacy | Low |
| A3 | BDT Studio supersedes Eclipse at BBj 26.00 (from a search summary, not read on the page) | State of the Art | Only a flag for Stephan |
| A4 | Parent-folder slugs/labels proposed here are acceptable (Claude's discretion) | Proposed maps | Low, editable |
| A5 | The ZIP-bundled `Sample.bbj` (1344 bytes, English/German mix) is the "result" and the standalone (753 bytes) the "start" | Backup inventory | Wrong download placement if reversed; both names come from the Moodle resource titles, which support it |

## Open Questions

1. **Nine images, but only eight are displayed.**
   - Known: `files.xml` lists 9 `mod_book` image files; chapter HTML references 8. The ninth is ch 24's unannotated `image.png` (same screenshot as the referenced annotated one, without the red box/arrow).
   - Unclear: Roadmap criterion 3 and CONV-05 say "all 9 images appear".
   - Recommendation: Decide at the plan checkpoint. Cheapest: converter copies/maps all 9 (hand alt for each), but renders only the 8 referenced; park the orphan in `docs/docs/intro-bbj/03-web-development/img/` unreferenced is pointless, so instead park it in `tools/data/` like `dwc-unused-img/`, and reword CONV-05/criterion to "all 8 displayed images (9th is an unreferenced duplicate)". Alternative: show the unannotated image before the annotated one in ch 24 (a second `<figure>`), which makes "9 appear" true. verify-phase5 must assert whichever number is chosen.

2. **Is there a Theme Editor shipped with BBj now?**
   - Known: no successor URL found; DWC Overview does not mention it.
   - Recommendation: unlink and keep text in commit 3; ask Stephan; ch 28 is otherwise a stub and may need a short factual sentence or removal later (Phase 7).

3. **LICENSE for `docs/examples/intro-bbj/`** (D-23): reuse DWC MIT (`Copyright (c) 2022 BASIS International`) and confirm with Stephan. The year in the DWC file is 2022; the samples are from 2021. Confirm year too.

4. **Video titles keep the "BBx Clues N:" prefix?** Recommended yes (matches YouTube). Confirm during plan review.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 | converter | yes | 3.11.4 | none needed |
| bs4 / markdownify | converter | no (lxml 6.0.2 only) | none | `python3 -m venv .venv && pip install -r tools/requirements.txt` (PyPI reachable: `pip index` worked) |
| Node | MDX check, build | yes (v22.22.0; `.nvmrc` says 24) | 22.22.0 | `nvm use` 24 if installed |
| `@mdx-js/mdx` | MDX compile check | yes in `docs/node_modules` | n/a | `cd docs && npm ci` |
| Vale | prose gate | yes `tools/.bin/vale` | 3.24.0 | `bash tools/install-lint-tools.sh` |
| Network (YouTube oEmbed) | video map, one time | yes | HTTP 200 for all 10 | Titles already captured above |
| BBj Documentation MCP | commit 5 | session tool | n/a | none; required by CLAUDE.md |
| the `.mbz` | converter input | yes, `import/` (gitignored) | 2026-10-03 backup | n/a |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Bash verify scripts + Python checker + `npm run build` + Vale (no unit framework in repo for tools) |
| Config file | none; pattern in `tools/verify-phase4.sh` (PASS/FAIL/SKIP lines, `--no-build`) |
| Quick run command | `bash tools/verify-phase5.sh --no-build` |
| Full suite command | `bash tools/verify-phase5.sh && bash tools/verify-phase1.sh && bash tools/verify-phase3.sh && bash tools/verify-phase4.sh && bash tools/prove-gates.sh` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CONV-01 | Report all zeros, exit 0 | smoke | `python3 tools/moodle2docusaurus.py --src <unpacked> --book intro-bbj --check` (or run, assert exit 0 and `unresolved: 0` lines) | Wave 0 |
| CONV-01 | Every `.mdx` compiles | script | `cd docs && node ../tools/check-mdx.mjs $(find docs/intro-bbj -name '*.mdx')` or `npm run build` | Wave 0 |
| CONV-02 | 28 chapters + overview + 4 index + 5 exercise pages in order | script | count `find docs/docs/intro-bbj -name '*.mdx'` = 1+28+4+5 = 38 (3 top-level + 20 section chapters... assert with a title-order list from the converter's map); check `sidebar_position`/numeric prefixes | Wave 0 |
| CONV-02 | Built sidebar order | build | `npm run build` then grep `docs/build/docs/intro-bbj/overview/index.html` for route order | Wave 0 |
| CONV-03 | No leftovers | grep | `! grep -rEn 'PLUGINFILE|pluginfile.php|moodle\.basis-europe|\$@|&nbsp;|&lt;|&gt;|&amp;|<br' docs/docs/intro-bbj` | Wave 0 |
| CONV-03 | Every fence has a language | script | awk over fences: opening ``` must carry a tag (reuse pattern from earlier verify scripts) | Wave 0 |
| CONV-04 | 10 YouTube embeds, unique ids | grep | `grep -rho '<YouTube id="[^"]*"' docs/docs/intro-bbj | sort -u | wc -l` = 10; no raw `<iframe`, no `<video` | Wave 0 |
| CONV-05 | N images with non-empty alt, files exist | script | grep `!\[[^]]+\]\(\./img/` count (N = 8 or 9 per Open Question 1); `docs/build` already throws on missing images | Wave 0 |
| CONV-06 | Four folders, files present, ZIPs in sync | script | `test -f docs/examples/intro-bbj/{better-hello-world/BetterHelloWorld.bbj,oo-samples/Car.bbj,...}`; `python3 tools/sync-samples.py --check intro-bbj`; files are LF | Wave 0 |
| CONV-07 | Commit separation | git | `git log --format=%s -n 8` shows converter commit before docs commit, no `docs/docs/intro-bbj` in converter commit | manual-ish script |
| EXER-01 | 5 exercise pages with admonition, correct titles | grep | `ls docs/docs/intro-bbj/*/9?-exercise-*.mdx | wc -l` = 5; each contains `:::exercise`; titles start `Exercise:` (3) or `Bonus exercise:` (2) | Wave 0 |
| D-11 | BBj syntax | MCP (manual per call) | `bbj_check_syntax` per snippet and `.bbj`; results in `tools/data/intro-bbj-syntax.md` | manual |
| D-13 | Vale errors | lint | `tools/.bin/vale --minAlertLevel=error docs/docs/intro-bbj` | tool present |

Manual-only: alt-text quality, image naming after viewing, hand-picked video titles, dead-link hash-route spot checks (the SPA fragments), the syntax-check calls (MCP not scriptable).

### Sampling Rate
- Per task commit: `bash tools/verify-phase5.sh --no-build` and `vale` on touched files
- Per wave merge: full suite above, with a fresh `npm run build`
- Phase gate: full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `.venv` + `pip install -r tools/requirements.txt`
- [ ] `tools/verify-phase5.sh` (and optionally `tools/check-mdx.mjs`, `tools/check-intro-bbj.py`)
- [ ] Update `tools/verify-phase1.sh` lines 66-67 (stub `getting-started` route) in the generated-docs commit
- [ ] Converter self-test: run twice and `diff -r` to prove determinism (no network on the second run)

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2/V3/V4 Auth, session, access | no | Static site, no accounts (CLAUDE.md forbids LMS features) |
| V5 Input Validation | yes | Treat the .mbz as untrusted: `tarfile` `filter='data'`; validate kebab-case slugs and that every output path resolves inside the target dirs; regex-validate YouTube IDs (`^[A-Za-z0-9_-]{11}$`); oEmbed fetched only from `www.youtube.com` over HTTPS |
| V6 Cryptography | no | none |
| V12 Files | yes | Only copy files named in `files.xml`; drop anything else; no executable bits (`sync-samples` sets 0644) |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via archive names or `@@PLUGINFILE@@` names | Tampering | Safe extract filter; resolve and assert prefix |
| `javascript:` or odd-scheme hrefs from Moodle HTML | Tampering/XSS | Allow only `http(s)`, relative; report any other scheme |
| Raw HTML passthrough into MDX (script/iframe) | XSS | Strip unknown tags in the DOM pass; MDX compile + no `<iframe`/`<script` grep |
| XML entity expansion in backup XML | DoS | Backup is first-party; if desired use `defusedxml`, but that would add a package, so just cap file sizes and accept the risk |
| Leaking personal data (Moodle user data) | Info disclosure | Read only `course/`, `sections/`, `activities/book_*|assign_*|resource_*`, `files.xml`, `files/`; never write `users.xml`-like data (not present; `roles.xml` etc. ignored) |

## Project Constraints (from CLAUDE.md)
- BBj code: read `bbj://primer`, `bbj_lookup` every verb/function/class, `bbj_check_syntax` every snippet before it goes into a page or `docs/examples/` (here: commit 5 per D-11, with the verbatim commit 2 as an explicit exception from CONTEXT).
- Vale on changed Markdown, no em dashes, second person, direct; Google + BASIS styles.
- Files and folders kebab-case ASCII with `01-` prefixes; exercises `90-` and up; front matter `title` + `description`; content headings start at H2; every fence has a language; images in section `img/` referenced `./img/name.png` with alt; videos only `<YouTube id title />`; MDX comments `{/* */}`.
- Samples in `docs/static/files/<book>/` and `docs/examples/<book>/` kept in sync (here via sync-samples).
- `import/` never committed; audit/map outputs in `tools/data/`; never reference `moodle.basis-europe.eu`; no LMS features; no copying webforJ-specific components.
- `@docusaurus/*` exact-pinned 3.10.2, Node 24; use `npm ci`.
- Before committing: `cd docs && npm run build`, Vale, `tools/prove-gates.sh` (after config changes), verify-phase1/2(--local)/3 stay green.
- GSD enforcement: file edits go through the GSD workflow.

## Sources

### Primary (HIGH confidence)
- The unpacked backup (`import/backup-moodle2-course-2-...mbz`): `book_*/book.xml`, `assign_*/assign.xml`, `resource_*/resource.xml`, `files.xml`, `sections/*/section.xml`, `course/course.xml`; the extracted images viewed directly.
- Repo files: `tools/sync-samples.py`, `tools/requirements.txt`, `tools/relocate-dwc.py`, `tools/verify-phase4.sh`, `docs/docs/dwc/**`, `docs/src/components/YouTube/index.js`, `docs/docs/authoring/components.mdx`, `.vale.ini`, `.gitattributes`, `.gitignore`, `.planning/migration-seed.md` 5, 6.
- Local runs: `@mdx-js/mdx` compile tests, `pip index versions`, `vale --version`, curl checks of oEmbed and target URLs.

### Secondary (MEDIUM confidence)
- https://documentation.basis.cloud/BASISHelp/WebHelp/dwc/DWC_Overview.htm (links to `dwc.style/docs/#/dwc/` and `#/theme-engine/`)
- https://basis.cloud/eclipseplug-ins/ (200; BDT Studio note via search summary)
- https://docs.webforj.com/docs/styling/overview (shadow parts and dark mode described; webforJ-specific, not a drop-in successor for BBj component pages)

### Tertiary (LOW confidence)
- Search result for BBj 24.00 `--bbj-*` to `--dwc-*` rename (basis.cloud knowledge base).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (pins in repo, versions confirmed)
- Backup structure/pitfalls: HIGH (inspected directly)
- Architecture and validation plan: HIGH
- Dead-link successors: MEDIUM (hash routes unverifiable by curl; Theme Editor unresolved)
- Content currency (Eclipse vs BDT Studio, `bbj-`/`dwc-` names): LOW to MEDIUM, deferred by decision

**Research date:** 2026-10-04
**Valid until:** 2026-11-04 (the backup is frozen; external URLs may move)
