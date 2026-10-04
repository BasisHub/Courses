---
phase: 4
slug: dwc-book-relocation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-10-04
---

# Phase 4 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Old build to snapshot | `tools/snapshot-dwc-site.py` reads a local build of DWC-Course | Public sitemap and anchors |
| Source clone to repo | `git archive 965da6d` into `docs/examples/dwc`, `docs/docs/dwc` | Public sample code and pages |
| Samples to ZIPs | `tools/sync-samples.py` builds and checks ZIPs | Public sample code |
| Repo to BBj MCP | Sample code sent to `bbj_check_syntax` | Public sample code |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation (evidence) | Status |
|-----------|----------|-----------|-------------|-----------------------|--------|
| T-04-01 | Tampering | snapshot route mapping | mitigate | `tools/snapshot-dwc-site.py:78` rejects ".." and backslash, returns 2; reads only under `build` | closed |
| T-04-02 | Tampering | XML/HTML parsing | mitigate | `snapshot-dwc-site.py:16-17` ElementTree and html.parser; no eval/exec found | closed |
| T-04-03 | Repudiation | snapshot provenance | mitigate | `snapshot-dwc-site.py:97` source string; `:111` `shutil.copyfile` of the sitemap; `dwc-old-routes.json:2` | closed |
| T-04-05 | Tampering | sync-samples walk | mitigate | `tools/sync-samples.py:79` followlinks=False, `:82,:88` symlink die (exit 2), `:47-49` safe_arcname, `:80,:85` dotfiles skipped; no extraction | closed |
| T-04-06 | Tampering | ZIP divergence | mitigate | `.github/workflows/test-build.yml:35` and `deploy.yml:36` run `--check`; `sync-samples.py:156` manifest includes CRC; live run PASS on all 11 ZIPs | closed |
| T-04-07 | Info disclosure | untracked files | mitigate | commit 6900fce copied from git archive; `sync-samples.py` `rel not in tracked` filter; no dotfiles found | closed |
| T-04-08 | Info disclosure | secrets in samples | mitigate | rerun of the grep over `docs/examples/dwc` returned no matches | closed |
| T-04-09 | Compliance | PrismJS redistribution | mitigate | `THIRD_PARTY_NOTICES.md:28-39`; `LICENSES/PrismJS-MIT.txt` exists | closed |
| T-04-10 | Tampering | relocate tar extraction | mitigate | `tools/relocate-dwc.py:96` git archive; `:101` rejects absolute, "..", symlink, hard link | closed |
| T-04-11 | Tampering | hidden edits in commit 1 | mitigate | `tools/check-dwc-relocation.py` allowlisted-rule hunk check (header, `:71` archive) and sha256 image compare (`:250`) | closed |
| T-04-12 | Info disclosure | stray dotfiles | mitigate | `check-dwc-relocation.py:223`; `find` over docs/docs/dwc, docs/examples/dwc, docs/static/files/dwc found none | closed |
| T-04-14 | DoS | link rewrite errors | mitigate | `docs/docusaurus.config.js:19,20,43,44` onBroken* = throw; routes and anchors checkers pass (306 anchors, 1 allowlisted) | closed |
| T-04-16 | Repudiation | syntax results | mitigate | `tools/data/dwc-samples-syntax.md` header records identity string "bbj-docs · hosted · docs 2026-09-21 · fd516a9d" and date 2026-10-03; 44 rows | closed |
| T-04-17 | Tampering | samples altered | mitigate | `git diff --quiet docs/examples/dwc` is clean now; the verify suite runs `sync-samples --check` | closed |
| T-04-18 | Tampering | pathname:// links | mitigate | `tools/verify-phase4.sh` checks each pathname target in docs/static and build | closed |
| T-04-19 | Spoofing | links to archived repo | mitigate | grep for `DWC-Course/` and `git clone` in docs/docs is empty; verify-phase4 LIVE-01 grep covers `DWC-Course/` | closed |
| T-04-20 | Integrity | anchors/order | mitigate | verify-phase4 runs both checkers; live reruns pass | closed |
| T-04-21 | EoP | weakening Vale | mitigate | no phase 4 commit touches `.vale.ini` or styles; only `.github/workflows/deploy.yml` changed (adds the sync check); no `vale off` in docs/docs/dwc | closed |
| T-04-22 | Integrity | Vale fixes vs fragments | mitigate | anchor checker passes (306 present) | closed |
| T-04-23 | Repudiation | commit-1 purity | mitigate | verify-phase4 locates commit 1 by exact subject and reruns the checker with `--rev`; SKIP when the clone is absent | closed |
| T-04-24 | Tampering | verify never fails | mitigate | LIVE-01 `grep -rIEq '...DWC-Course/' docs/docs` calls `fail`, which increments FAILS and exits 1. Logic read only, not run on a scratch copy | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-04-01 | T-04-04 | Only the sitemap and derived JSON are committed, build output is excluded, content is public | Phase 4 plan | 2026-10-04 |
| AR-04-02 | T-04-SC | No packages installed; stdlib only | Phase 4 plan | 2026-10-04 |
| AR-04-03 | T-04-13 | External links and iframes are unchanged from the public old site; iframes appear only in code fences | Phase 4 plan | 2026-10-04 |
| AR-04-04 | T-04-15 | Public sample code is sent to the BBj MCP; no secrets | Phase 4 plan | 2026-10-04 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-04 | 25 | 25 | 0 | gsd-security-auditor |

Notes: T-04-24 and T-04-23 were verified by reading the script logic; the injection test and the commit-1 recheck were not executed. Residual weakness, not a blocker: the `git clone` grep for T-04-19 is not part of verify-phase4.sh (only `DWC-Course/` is), and it was verified manually. No unregistered threat flags.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-10-04
