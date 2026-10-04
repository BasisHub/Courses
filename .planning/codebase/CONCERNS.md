---
last_mapped_commit: a302c591e556408168f897dff732d78aa3210063
last_mapped_at: 2026-10-04
---
# Codebase Concerns

**Analysis Date:** 2026-10-04

## Tech Debt

**Outdated Screenshots (Primary Maintenance Task):**
- Issue: 59 images across DWC book carry `{/* TODO: screenshot outdated? */}` markers indicating they may depict 2022-era UI that no longer matches current state
- Files: Scattered across `docs/docs/dwc/` chapters (06-flow-layouts, 02-browser-developer-tools, 07-icon-pools, 05-dwc-controls, 08-control-validation, 01-gui-to-bui-to-dwc)
- Impact: Readers may be confused by stale UI screenshots; degrades learning experience. These markers are intentional—flagged during Phase 6 gap audit to be re-captured before full release but not blocking go-live
- Fix approach: Post-Phase 7, systematically re-capture each flagged screenshot against the current version of BBj/DWC, store in `docs/docs/dwc/<chapter>/img/`, update alt text, and remove markers. Commit as "docs: re-capture <N> screenshots" with image naming preserved
- Worklist: `grep -rn "TODO: screenshot outdated" docs/docs` generates the full list for re-capture priority

**Provisional Theme Editor Link:**
- Issue: Chapter 28 (introduction-to-bbj book) references `https://us.bbx.kitchen/webapp/DWCThemer` as a temporary link for the BBj Theme Editor tool
- File: `docs/docs/intro-bbj/<section>/index.mdx` (exact chapter TBD; documented in STATE.md as D-27)
- Impact: Link points to a non-permanent host and could change or become unavailable
- Fix approach: Once a permanent home for the DWCThemer is published, search for `us.bbx.kitchen` in the book and replace with the new URL. Update the link in one commit with the reference
- Priority: Medium; deferred until permanent URL is available

**Missing Exercise Solutions (Incomplete Feature):**
- Issue: Phase 06.1 task requires all 16 exercises (11 DWC, 5 intro-bbj) to have "Possible solution" blocks by end of phase. Currently only 6 have solutions found
- Files: `docs/docs/dwc/` chapters (exercises 01-11) and `docs/docs/intro-bbj/` sections (exercises 01-05)
- Impact: Readers lack reference implementations for 10 exercises; degrades learning outcomes
- Fix approach: Phase 06.1 must generate sample solutions for: DWC (theming, grid, embed, media queries, button transition) and intro-bbj (tic-tac-toe, computer player, login dialog, OO tic-tac-toe, responsive dialog). Each solution must pass `bbj_check_syntax`, live in both `docs/examples/<book>/` and matching ZIP under `docs/static/files/<book>/`, and match the inline fence byte-for-byte
- Current status: Phase 06.1 planned but not yet broken into executable plans

## Known Bugs

**MDX Comment Syntax in Content:**
- Symptoms: Build fails with "Unexpected character `!` before name" if HTML comments `<!-- -->` are used instead of MDX comments `{/* */}`
- Files: Any `.md` or `.mdx` file with outdated screenshot markers or comments
- Trigger: Phase 6 already uses correct `{/* TODO: screenshot outdated? */}` syntax; risk is if new contributors add `<!-- -->` comments
- Workaround: Always use `{/* ... */}` for comments in Markdown and MDX files, never `<!-- -->`

**Vale Configuration Does Not Flag .mdx by Default:**
- Symptoms: Vale may skip checking `.mdx` files if the configuration section glob only matches `*.{md,txt}`
- Files: `.vale.ini` glob pattern in root
- Current status: This was fixed in Phase 2; PITFALLS.md notes the risk. Verify that `.vale.ini` includes `[*.{md,mdx,txt}]` in the main section

**Google Fonts GDPR Risk:**
- Symptoms: Inter and JetBrains Mono are loaded dynamically from Google Fonts CDN, which may violate GDPR requirements for dynamic font loading in Germany (BasisHub is EU-based)
- Files: `docs/docusaurus.config.js` `headTags` section; loading from Google Fonts servers
- Current mitigation: Project uses `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` npm packages (self-hosted). CDN risk applies only if site ever reverts to `https://fonts.googleapis.com` links
- Recommendations: Confirm with legal owner whether fonts via npm packages (current approach) satisfy GDPR. Keep Google Fonts CDN out of this codebase

## Security Considerations

**Moodle Backup Archive in Import Directory:**
- Risk: Course 4 backup (`backup-moodle2-course-4-*.mbz`, 16.7 MB) may contain user data (roles, groups, grade history) if not exported with `-nu` (no-users) flag
- Files: `import/backup-moodle2-course-4-*.mbz` (gitignored, never committed)
- Current mitigation: Archive is in `.gitignore` and deleted after converter runs. File not committed or pushed
- Recommendations: Before converter runs on a new archive, verify export flags. If the archive is stored on a shared server, confirm it is not publicly accessible. Course 2 backup (243 KB) should also be checked for email addresses or names before any commit

**Secret Scanning:**
- Current status: Repository is public on GitHub. Secret scanning and push protection should be enabled in repo settings
- Recommendations: Ensure `Settings > Security > Secret scanning` is enabled to catch any accidental credential commits

**Dependency Trust:**
- Risk: Third-party Docusaurus plugins (`docusaurus-plugin-llms`, `docusaurus-plugin-zooming`, `@easyops-cn/docusaurus-search-local`) are maintained by external teams and could introduce vulnerabilities
- Current mitigation: All versions are pinned in `package-lock.json`. GitHub Dependabot can flag security updates
- Recommendations: Set up Dependabot alerts in repo settings; review security advisories quarterly

## Performance Bottlenecks

**Search Index Building:**
- Problem: `@easyops-cn/docusaurus-search-local` only generates its index during `npm run build` (production builds), not during `npm start` (development)
- Files: `docs/docusaurus.config.js` plugin configuration
- Current status: Expected behavior; documented in STACK.md
- Impact: Developers testing locally cannot verify search functionality without running full build. Users testing live site will see search working normally
- Improvement path: This is a known limitation of the plugin. No action needed; document in CONTRIBUTING.md that search requires `npm run serve` of a production build

**Sass Deprecation Warnings:**
- Problem: Dart Sass 1.105+ issues warnings for deprecated global built-ins (`darken()`, `map-get`) and `@import` statements. Build still passes but log is noisy
- Files: `docs/src/css/` SCSS files, particularly copied webforJ partials
- Current status: Warnings are noise, not failures; documented in STACK.md as expected
- Impact: CI logs are harder to read; may hide real errors
- Improvement path: During Phase 7 review or later, audit copied SCSS for deprecated Sass patterns and replace with modern `@use` and function equivalents. Not blocking

## Fragile Areas

**Sidebar Ordering and Numeric Prefixes:**
- Files: `docs/docs/<book>/` directory structure and front matter `sidebar_position` values
- Why fragile: Docusaurus strips numeric prefixes (`00-`, `01-`) from URLs, so two files `01-first.mdx` and `02-first.mdx` in the same folder collide. Sub-chapters with mixed numbering (`03a-`, `03b-`) may not strip consistently. Unnumbered overview pages sort last unless explicitly numbered with `00-overview`
- Safe modification: Always use two-digit prefixes with unique names per folder. Run the build after any file rename to catch collisions. Compare generated `sitemap.xml` against expected paths
- Test coverage: Phase 4 and Phase 5 verify sidebar order against Moodle source; Phase 8 acceptance gates check sidebar order matches expected outline

**Prism BBj Grammar Extension:**
- Files: `docs/src/prism/bbj-extend.js` or equivalent where custom BBj highlighting is registered
- Why fragile: The built-in `prismjs` grammar (1.30.0) is minimal—it lacks `$`/`!` variable tokens, labels, `#` field prefixes, and has an incomplete keyword list. Any custom extension must be registered *after* the built-in grammar is loaded, else it gets overwritten. If the custom file imports `prismjs` directly instead of using the `PrismObject` parameter, it creates a separate Prism instance and the grammar never highlights
- Safe modification: Use the swizzled `prism-include-languages.js` pattern. Custom registration must happen after `require('prismjs/components/prism-bbj')` completes. Test on both light and dark themes with a fixture page
- Test coverage: Phase 3 includes smoke tests for BBj highlighting and should preserve them as regression checks

**Image Renaming and References:**
- Files: `docs/docs/dwc/` chapter images in `img/` folders; references in `docs/docs/dwc/` Markdown
- Why fragile: DWC-Course images were renamed from CamelCase to kebab-case (e.g., `Eclipse-RunBUIProgram.png` to `eclipse-run-bui-program.png`) during Phase 4. References must be updated in parallel. On case-insensitive macOS, `foo.PNG` and `foo.png` resolve to the same file; on case-sensitive Linux CI they differ. A missed reference fails only on CI
- Safe modification: Always rename images with `git mv` (preserves history), then update references by script from the mapping table. Before pushing, verify the PR build runs on `ubuntu-latest` (case-sensitive) to catch case-only renames
- Test coverage: Phase 4 committed a mapping table in `tools/data/`; use it to verify all references are rewritten

**Cross-Book Links:**
- Files: Any Markdown link between `docs/docs/intro-bbj/` and `docs/docs/dwc/` or vice versa
- Why fragile: Links must use relative paths (`../` to sibling book) or absolute paths from site root (`/Courses/docs/dwc/chapter`). A typo or a slug that changed during editing breaks only at build time, and the error points to the broken link, not the page containing it
- Safe modification: Use Docusaurus `<Link>` component or Markdown link syntax `[text](/Courses/docs/dwc/path)` with the full base URL. Run `npm run build` after every cross-book link to verify
- Test coverage: Build gates `onBrokenLinks: 'throw'` catch broken links

**Hook Configuration in Docusaurus Config:**
- Files: `docs/docusaurus.config.js` `markdown.hooks` and top-level `onBrokenLinks` settings
- Why fragile: The deprecated forms (`onBrokenMarkdownLinks: 'warn'` at top level) can silently downgrade error checking. In Docusaurus 3.9+, the correct form is `markdown.hooks.onBrokenMarkdownLinks: 'throw'` at the `markdown` level. A config copied from an older version might leave this at `warn`, allowing broken links to pass the build
- Safe modification: In Phase 1, set all four hooks explicitly: `onBrokenLinks: 'throw'`, `onBrokenAnchors: 'throw'`, `markdown.hooks.onBrokenMarkdownLinks: 'throw'`, `markdown.hooks.onBrokenMarkdownImages: 'throw'`. Prove each one with a deliberate failure test
- Test coverage: Phase 1 includes deliberate link/anchor/image failures to verify gates work

## Scaling Limits

**Build Time with Large Image Library:**
- Current capacity: ~59 flagged screenshots + ~100+ total images across two books; site contains ~40,000 words
- Limit: Docusaurus builds remain under 1 minute on a modern machine. If images or content double, builds may exceed 2-3 minutes
- Scaling path: Use `@docusaurus/faster` (Rspack-based builds) if builds exceed 3 minutes. Currently not worth the complexity risk

**Search Index Size:**
- Current capacity: ~40,000 words searchable with local search plugin
- Limit: The `@easyops-cn/docusaurus-search-local` plugin generates a JSON index that grows with content. At 100,000+ words, performance may degrade
- Scaling path: Switch to Algolia DocSearch (paid service, already configured and commented out in config) if content grows significantly. Algolia is not public-site-dependent; index can be pre-built

**Repository Size:**
- Current capacity: Site repo is small (~50 MB excluding `node_modules`); `import/` excluded from git
- Limit: If future phases include versioned docs or multiple language editions, repo size could grow. Git LFS would add complexity
- Scaling path: Keep `import/` and large converter outputs in `.gitignore`. If docs are versioned, store old versions as separate branches or separate repos with a redirect layer

## Dependencies at Risk

**Docusaurus 3.10.2 Exact Pins:**
- Risk: All `@docusaurus/*` packages must be at the same version (3.10.2). If one is updated without others, the build breaks with cryptic errors
- Current mitigation: Packages are pinned with exact versions in `package.json` (not carets)
- Recommendations: Do not use `npm update` on `@docusaurus` packages. If an update is needed, update all six packages in one commit. Use Dependabot (GitHub) or Renovate to group updates
- Packages to watch: `@docusaurus/core`, `@docusaurus/preset-classic`, `@docusaurus/theme-mermaid`, `@docusaurus/plugin-client-redirects`, `@docusaurus/module-type-aliases`, `@docusaurus/types`

**Prism React Renderer and PrismJS Mismatch:**
- Risk: `prism-react-renderer` (^2.4.1) depends on its own bundled PrismJS (1.29.0). The devDependency `prismjs` (1.30.0) is used for building custom grammars, but a mismatch could cause highlighting inconsistencies
- Current mitigation: Version ranges are compatible; both are recent. The built-in `prism-dwc-theme` uses the renderer's internal Prism
- Recommendations: If you update `prism-react-renderer`, check its Prism peer version. Keep `prismjs` in devDependencies pinned to the version the renderer bundles

**Vale Action Stale Repository:**
- Risk: `errata-ai/vale-action` is maintained but not actively developed (last push 2026-08-03). If Vale CLI breaks, the GitHub action may lag
- Current mitigation: Action is pinned to commit SHA (best practice); Vale CLI version can be pinned separately via `version:` input
- Recommendations: Monitor Vale releases quarterly. If the action stops working, switch to running Vale directly in a workflow step (`vale --version && vale docs/docs`)

**Google Fonts via CDN (if reverted):**
- Risk: `dwc-ui.css` is loaded from `https://cdn.webforj.com/next/dwc-ui.css` (moving target). A webforJ release could change site appearance overnight
- Current mitigation: Project uses `@fontsource-variable` npm packages for Inter and JetBrains Mono (self-hosted). The only CDN dependency is the DWC token file
- Recommendations: Request a version-pinned URL from webforJ (e.g., `https://cdn.webforj.com/dwc-ui.3.0.0.css`). If unavailable, vendor the CSS into the repo
- Fallback: DWC tokens are CSS variables; worst case, inline a pinned copy in `static/css/`

## Missing Critical Features

**Versioned Redirects for Old DWC-Course URLs:**
- Problem: Phase 8 (Redirects & Archive) requires a meta-refresh redirect build for the old `BasisHub/DWC-Course` repo. This has not been started
- Blocks: Cannot archive the old repo or announce the migration until redirects are live
- Worklist: Phase 8 requires a new redirect-only Docusaurus build that maps old URLs to new ones. The route map must be cut from the live `Courses` sitemap after go-live (Phase 7 must complete first)
- Current status: Blocked on Phase 7 completion

**Algolia DocSearch Configuration (Commented Out):**
- Problem: Local search works from day one, but Algolia provides better experience and no index-build delay. Config is present but commented
- Blocks: Cannot apply Algolia until the site is public and indexed
- Worklist: After go-live and initial crawl (2-4 weeks), enable Algolia in `docs/docusaurus.config.js` and replace the local search navbar item
- Current status: Deferred by design (Phase 3 decision); not a blocker

## Test Coverage Gaps

**No Automated Exercise Solution Validation:**
- What's not tested: Exercise solution files in `docs/examples/<book>/` are committed but have no automated check for:
  - Fence in Markdown matches file byte-for-byte (detects copy/paste drift)
  - BBj syntax passes `bbj_check_syntax` (detects API mistakes)
  - Solution uses only documented APIs (needs manual review with MCP)
- Files: All exercise pages `docs/docs/<book>/9N-exercise-*.mdx`; solutions in `docs/examples/<book>/`
- Risk: Stale or incorrect solutions mislead learners. A copy/paste error in a solution goes unnoticed until a reader reports it
- Priority: High for Phase 6.1 and Phase 7. Phase 06.1 task requires solutions to pass `bbj_check_syntax`; Phase 7 must include a final check
- Mitigation: Add a `tools/check-solutions.py` script that compares inline fences to files and runs the BBj MCP check. Include it in the build gate

**No Automated Sitemap Comparison:**
- What's not tested: After any file rename or deletion, the generated `sitemap.xml` should be compared against expected paths
- Files: `docs/build/sitemap.xml` (generated); no committed expected sitemap for comparison
- Risk: Silent URL changes break old links and external references. The redirect map (Phase 8) depends on accurate URL knowledge
- Priority: Medium; needed by Phase 8
- Mitigation: Phase 4 snapshotted the old DWC-Course routes in `tools/data/`; Phase 7 acceptance gates should diff the new sitemap against those old routes to confirm the mapping

**No Accessibility Audit:**
- What's not tested: Exercise admonitions, YouTube embeds, and code blocks have no accessibility review (contrast, keyboard focus, screen reader labels)
- Files: `docs/src/components/ExerciseAdmonition.js` (or similar); YouTube facade in `src/theme/`; code highlighting
- Risk: Readers using assistive technologies may have degraded experience
- Priority: Low for launch; medium for post-launch review
- Mitigation: Phase 7 hand review should include a pass with browser DevTools accessibility inspector and keyboard-only navigation

---

*Concerns audit: 2026-10-04*
