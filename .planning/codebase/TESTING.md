---
last_mapped_commit: a302c591e556408168f897dff732d78aa3210063
last_mapped_at: 2026-10-04
---
# Testing Patterns

**Analysis Date:** 2026-10-04

## Test Framework & Verification

**Build System:**
- Docusaurus build: `npm run build` (located in `docs/` directory)
- Config: `docs/docusaurus.config.js`
- Enforces broken link/anchor detection at build time

**Run Commands:**

```bash
cd docs && npm run build          # Build and fail on broken links/anchors
cd docs && npm run start          # Local dev server (port 3000)
bash tools/prove-gates.sh         # Verify broken-link detection gates work
bash tools/verify-phase1.sh       # Landing page structure, links, routing
bash tools/verify-phase1.sh --with-ci  # Phase 1 + npm ci from lockfile
bash tools/verify-phase2.sh --local    # Phase 2 checks (local artifacts)
bash tools/verify-phase3.sh       # Phase 3 checks (content consistency)
python3 tools/sync-samples.py --check  # Verify docs/examples and docs/static in sync
```

## Linting & Style Enforcement

**Framework:**
- Vale 3.24.0 (installed via `tools/install-lint-tools.sh`)
- Config: `.vale.ini`

**Installation:**

```bash
bash tools/install-lint-tools.sh  # Downloads and verifies Vale + actionlint with SHA-256
```

**Run Linting:**

```bash
tools/.bin/vale docs/docs         # Check all documentation
```

**Vale Configuration:**
- StylesPath: `.github/.styles` (vendored, not synced)
- Vocab: BASIS (custom vocabulary)
- Formats: mdx treated as md
- MinAlertLevel: suggestion (warnings and suggestions appear as review comments; errors fail)
- Coverage: `docs/docs/**/*.{md,mdx}`

**Custom Vale Rules (BASIS style):**
Located in `.github/.styles/BASIS/`:
- `AIDisclaimer.yml` / `AIDisclaimerSoft.yml` / `AIVocab.yml` — AI artifact handling
- `BeDirect.yml` — flagged hedging language
- `Capitalization.yml` — proper capitalization rules
- `EmDashes.yml` — forbids em dashes (— use hyphens instead)
- `Hedging.yml` — identifies uncertainty language
- `Parallelism.yml` — checks list consistency
- `Puffery.yml` — flags exaggeration
- `Simplify.yml` — suggests clearer phrasing
- `SmartQuotes.yml` — enforces straight quotes
- `Weasel.yml` — flags imprecise words

**Google Style Overrides (in .vale.ini):**
- Semicolons: NO (allow no-semicolon style)
- Passive: NO
- Will: NO
- Parens: NO
- Latin: NO

## CI/CD Testing

**GitHub Actions Workflows:**

**test-build.yml** (runs on: pull_request, workflow_dispatch):
- Name: "Test build (no deploy)"
- Timeout: 15 minutes
- Steps:
  1. Checkout repository
  2. Setup Node 24 (from `.nvmrc`)
  3. Cache npm dependencies
  4. Run `npm ci` (exact dependencies from lockfile)
  5. Run `python3 tools/sync-samples.py --check` (verify sample sync)
  6. Run `npm run build` (build fails on broken links/anchors)
- Exit: non-zero if any step fails

**reviewdog.yml** (runs on: pull_request):
- Name: "runner / vale"
- Uses: errata-ai/vale-action (v3.0.0)
- Configuration:
  - Vale version: 3.24.0
  - Files: docs/docs
  - Reporter: github-pr-review (posts findings as inline PR comments)
  - Filter mode: file
  - Fail on error: true (only error-level alerts fail)
- Note: Warnings and suggestions appear as review comments; only errors block merge

**deploy.yml** (runs on: push to main, workflow_dispatch):
- Builds with `npm run build`
- Verifies sample sync with `python3 tools/sync-samples.py --check`
- Deploys to GitHub Pages via `upload-pages-artifact` and `deploy-pages`
- Only deploys when `github.ref == 'refs/heads/main'`

## Verification Gates

**prove-gates.sh:**
Tests that broken-link detection works correctly. Probes:
- Broken link: `[x](/docs/does-not-exist)` → expects "found broken links"
- Broken anchor: `[x](./01-gui-to-bui-to-dwc/01-registering-launching.md#no-such-anchor)` → expects "found broken anchors"
- Broken Markdown link: `[x](./no-such-file.md)` → expects "onBrokenMarkdownLinks"
- Broken Markdown image: `![x](./img/no-such-image.png)` → expects "onBrokenMarkdownImages"
- Control build passes clean

Exit: non-zero if any gate fails.

**verify-phase1.sh:**
Comprehensive landing page and routing checks:
- Build exits 0
- Landing page structure (book cards in order)
- Index page links resolve
- Book overviews exist and link
- Section indices exist
- Sidebar structure
- Example links

Run: `bash tools/verify-phase1.sh` or `bash tools/verify-phase1.sh --with-ci` (includes fresh npm ci)

**verify-phase2.sh:**
Checks content migrations and asset locations:
- File presence and naming conventions
- Front matter (title, description)
- Exercise admonition format
- Image references and alt text
- YouTube embeds with title and id
- Code fence language declarations
- Syntax records for BBj samples

Run: `bash tools/verify-phase2.sh --local` (uses local built artifacts)

**verify-phase3.sh:**
Content consistency and completeness:
- No Moodle markup leftovers
- HTML entity handling
- Raw HTML outside code fences
- Cross-references between exercises and solutions
- Vale linting results
- Sample file verification

## Code Verification (BBj)

**BBj Syntax Checking:**
- Tool: `bbj_check_syntax` (BBj Documentation MCP)
- When: Before committing any BBj snippet to `docs/examples/`
- Scope: Every `.bbj` file in `docs/examples/`
- Record findings in `tools/data/intro-bbj-syntax.md` and `tools/data/dwc-samples-syntax.md`

**BBj Grammar Testing:**
- Script: `tools/test-bbj-grammar.js`
- Smoke test for Prism BBj highlighting against pre-verified snippets
- Verifies token types: variable, string, mnemonic, label, field, class-name, comment, keyword
- Run: `node tools/test-bbj-grammar.js`

**BBj API Verification:**
- Tool: `bbj_lookup` (BBj Documentation MCP)
- Verify every verb, function, BBjAPI class and method before code goes in
- Record keywords in `tools/data/bbj-token-verification.md`
- Never guess an API name

## Sample Synchronization

**sync-samples.py:**
Keeps `docs/examples/<book>/` in sync with downloadable ZIPs in `docs/static/files/<book>/`

Usage:

```bash
python3 tools/sync-samples.py --check    # Verify sync (runs on every CI build)
python3 tools/sync-samples.py            # Update sync (manual)
```

Checked by: CI workflows (test-build.yml, deploy.yml), phase verification scripts.

## Custom Checks (Python Scripts)

**check-intro-bbj.py:**
Post-migration validation for Introduction to BBj book.

Subcommands:
- `structure` — file set, front matter, categories, overviews, exercises, routes
- `content` — Moodle leftovers, entities, raw HTML, fence languages, YouTube embeds, image links
- `samples` — `docs/examples/intro-bbj` structure, LICENSE, ZIPs, download links
- `commits` — converter and generated-docs commits, order, reproducibility
- `edits` — hand-edit outcomes, link map, Vale errors
- `syntax` — BBj samples against `tools/data/intro-bbj-syntax.md`
- `all` — run all subcommands

Options:
- `--build docs/build` — path to built artifacts
- `--root DIR` — repository to check (default: current)

Exit: 0 pass, 1 any FAIL, 2 missing input.

**check-dwc-phase6.py:**
Verification for DWC book phase 6 (final checks).

## Build Configuration Validation

**Docusaurus Config Enforcement:**
Configured in `docs/docusaurus.config.js`:

```javascript
onBrokenLinks: 'throw',         // Fail on broken links
onBrokenAnchors: 'throw',       // Fail on broken anchors
markdown: {
  mermaid: true,
  hooks: {
    onBrokenMarkdownLinks: 'throw',    // Fail on broken Markdown links
    onBrokenMarkdownImages: 'throw',   // Fail on broken images
  },
}
```

Admonitions registered:

```javascript
admonitions: {keywords: ['exercise']},  // Custom :::exercise admonitions
```

## Test Coverage & Quality Gates

**Pre-commit Checks (per CLAUDE.md):**
- ✓ `cd docs && npm run build` passes (broken links, anchors, Markdown links and images throw)
- ✓ `tools/.bin/vale docs/docs` shows no errors on touched files
- ✓ `bash tools/prove-gates.sh` passes (after config changes)
- ✓ `bash tools/verify-phase1.sh` passes
- ✓ `bash tools/verify-phase2.sh --local` passes
- ✓ `bash tools/verify-phase3.sh` passes
- ✓ Every `.bbj` under `docs/examples/` passes `bbj_check_syntax`

**Forbidden:**
- Committing with Vale findings
- Committing with build failures
- Unverified BBj API names or syntax

## Test Data & Fixtures

**Link Maps:**
- `tools/data/intro-bbj-link-map.json` — maps old Moodle URLs to new routes
- `tools/data/dwc-exercise-link-map.json` — exercise routing
- `tools/data/dwc-old-routes.json` — DWC course legacy routes

**Image Registries:**
- `tools/data/intro-bbj-image-map.json` — intro-bbj images and alt text
- `tools/data/dwc-image-map.json` — DWC images
- `tools/data/dwc-gap-image-map.json` — gap phase images

**Syntax Records:**
- `tools/data/intro-bbj-syntax.md` — BBj samples indexed by topic
- `tools/data/dwc-samples-syntax.md` — DWC BBj samples
- `tools/data/bbj-token-verification.md` — verified keywords, functions, classes

**Audit Data:**
- `tools/data/dwc-gap-audit.md` — gap phase findings
- `tools/data/dwc-2022-screenshots.json` — DWC 2022 archive metadata
- `tools/data/intro-bbj-video-map.json` — YouTube video references

## Automated Validation Tools

**Installation Script:**

```bash
bash tools/install-lint-tools.sh
```

- Downloads and SHA-256 verifies Vale 3.24.0 and actionlint 1.7.12
- Pinned checksums prevent tampering
- Installs to `tools/.bin/` (gitignored)

**Actionlint:**
- Validates GitHub Actions workflow syntax (`.github/workflows/*.yml`)
- Used implicitly by CI to detect workflow errors
- Not explicitly run in this project (reviewdog/Vale is the main gate)

## Design Pattern: Test Each Phase Separately

The verification suite is organized by phase:
- **Phase 1:** Landing page, routing, basic structure
- **Phase 2:** Content migrations, assets, front matter
- **Phase 3:** Consistency, no Moodle leftovers, comprehensive validation
- **Phases 4-6:** Book-specific final checks

Each phase has a `verify-phaseN.sh` script that can run independently.

---

*Testing analysis: 2026-10-04*
