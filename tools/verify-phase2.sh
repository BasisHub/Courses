#!/usr/bin/env bash
# Phase 2 acceptance suite.
# Usage: bash tools/verify-phase2.sh [--local] [--deploy] [--gates]   (no flag = all three)
# Prints one "PASS|FAIL|SKIP  [section] name" line per check; exits non-zero if any check failed.
# Sections: local = tools ci vale docs headers seed hygiene; deploy; gates.
# Writes only the Vale probe files, which are always removed.
set -u
cd "$(dirname "$0")/.." || exit 1

REPO=BasisHub/Courses
SITE=https://basishub.github.io/Courses
DEEP="$SITE/docs/dwc/first-chapter/sample-page"
PROBE=docs/docs/dwc/99-vale-probe.mdx
D08_PROBE=".vale-d08-probe-$$.md"   # repo root, next to CONTRIBUTING.md and CLAUDE.md
FAILS=0
SEC=""

pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}
has() { grep -q -- "$2" "$1" 2>/dev/null; }                          # has <file> <fixed-ish pattern>
hasf() { grep -qF -- "$2" "$1" 2>/dev/null; }                        # hasf <file> <fixed string>
live() { grep -v '^[[:space:]]*#' "$1" 2>/dev/null; }                # file without comment lines
has_live() { live "$1" | grep -qF -- "$2"; }                         # has_live <file> <fixed string>
code() { curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$1"; }

PROBE_OWNED=0; PROBE_DIR_MADE=0   # only remove what this script created
cleanup() {
  [ "$PROBE_OWNED" -eq 1 ] && rm -f "$PROBE" "$D08_PROBE"
  [ "$PROBE_DIR_MADE" -eq 1 ] && rmdir "$(dirname "$PROBE")" 2>/dev/null
  return 0
}
trap cleanup EXIT

MODE_LOCAL=0; MODE_DEPLOY=0; MODE_GATES=0
if [ $# -eq 0 ]; then MODE_LOCAL=1; MODE_DEPLOY=1; MODE_GATES=1; fi
for a in "$@"; do
  case "$a" in
    --local) MODE_LOCAL=1 ;;
    --deploy) MODE_DEPLOY=1 ;;
    --gates) MODE_GATES=1 ;;
    *) echo "Unknown flag: $a (use --local, --deploy, --gates)" >&2; exit 2 ;;
  esac
done

# Tool lookup: PATH if the version matches, else tools/.bin.
VALE=""; ACTIONLINT=""
if command -v vale >/dev/null 2>&1 && vale --version 2>/dev/null | grep -q '3\.24\.0'; then VALE=vale
elif [ -x tools/.bin/vale ]; then VALE=tools/.bin/vale; fi
if command -v actionlint >/dev/null 2>&1 && actionlint --version 2>/dev/null | head -1 | grep -q '1\.7\.12'; then ACTIONLINT=actionlint
elif [ -x tools/.bin/actionlint ]; then ACTIONLINT=tools/.bin/actionlint; fi

section_tools() {
  SEC=tools
  if [ -n "$VALE" ] && "$VALE" --version 2>/dev/null | grep -q '3\.24\.0'; then pass "vale 3.24.0"
  else fail "vale 3.24.0 (run bash tools/install-lint-tools.sh)"; fi
  if [ -n "$ACTIONLINT" ] && "$ACTIONLINT" --version 2>/dev/null | head -1 | grep -q '1\.7\.12'; then pass "actionlint 1.7.12"
  else fail "actionlint 1.7.12 (run bash tools/install-lint-tools.sh)"; fi
}

section_ci() {
  SEC=ci
  local D=.github/workflows/deploy.yml T=.github/workflows/test-build.yml R=.github/workflows/reviewdog.yml f
  for f in "$D" "$T" "$R"; do check "exists $f" test -f "$f"; done
  if [ -n "$ACTIONLINT" ]; then check "actionlint workflows" "$ACTIONLINT" .github/workflows/*.yml
  else fail "actionlint workflows (no actionlint)"; fi
  for f in "$D" "$T" "$R"; do check "$f uses actions/checkout@v7" has_live "$f" "actions/checkout@v7"; done
  for f in "$D" "$T"; do check "$f uses actions/setup-node@v7" has_live "$f" "actions/setup-node@v7"; done
  check "deploy uses upload-pages-artifact@v5" has_live "$D" "actions/upload-pages-artifact@v5"
  check "deploy uses deploy-pages@v5" has_live "$D" "actions/deploy-pages@v5"
  check "reviewdog pins vale-action sha" has_live "$R" "errata-ai/vale-action@518a9136acc6e6668ce7c00d367051e0941e87ff"
  local old=0
  for f in "$D" "$T" "$R"; do
    if live "$f" | grep -Eq 'actions/[A-Za-z-]+@v[34]([^0-9]|$)'; then old=1; fi
  done
  if [ "$old" -eq 0 ]; then pass "no actions/*@v3 or @v4"; else fail "no actions/*@v3 or @v4"; fi
  for f in "$D" "$T"; do
    check "$f node-version-file" has_live "$f" "node-version-file: docs/.nvmrc"
    check "$f cache-dependency-path" has_live "$f" "cache-dependency-path: docs/package-lock.json"
  done
  check "deploy path: docs/build" has_live "$D" "path: docs/build"
  for f in "$T" "$R"; do
    if live "$f" | grep -Eq '^[[:space:]]*paths(-ignore)?:'; then fail "$f has no paths filter"; else pass "$f has no paths filter"; fi
  done
  check "test-build job name" has_live "$T" "name: Test build (no deploy)"
  check "reviewdog job name" has_live "$R" "name: runner / vale"
  check "reviewdog filter_mode: file" has_live "$R" "filter_mode: file"
  check "reviewdog fail_on_error: true" has_live "$R" "fail_on_error: true"
  check "reviewdog version: 3.24.0" has_live "$R" "version: 3.24.0"
  local perms=""
  for f in "$D" "$T" "$R"; do
    if live "$f" | grep -Eq 'pages: write|id-token: write'; then perms="$perms $f"; fi
  done
  if [ "$perms" = " $D" ]; then pass "pages/id-token write only in deploy.yml"; else fail "pages/id-token write only in deploy.yml (found:$perms)"; fi
  if live "$D" | grep -q 'pull_request'; then fail "deploy.yml has no pull_request trigger"; else pass "deploy.yml has no pull_request trigger"; fi
  check "ruleset-main.json exists" test -f tools/data/ruleset-main.json
  check "ruleset-main.json parses" python3 -m json.tool tools/data/ruleset-main.json
  check "ruleset has Test build context" hasf tools/data/ruleset-main.json "Test build (no deploy)"
  check "ruleset has vale context" hasf tools/data/ruleset-main.json "runner / vale"
}

section_vale() {
  SEC=vale
  check ".vale.ini docs glob" hasf .vale.ini "[docs/docs/**/*.{md,mdx}]"
  check ".vale.ini Vocab = BASIS" has .vale.ini "^Vocab = BASIS"
  check ".vale.ini mdx = md" has .vale.ini "^mdx = md"
  check "no webforJ style dir" test ! -e .github/.styles/webforJ
  check "no Blog style dir" test ! -e .github/.styles/Blog
  if [ -z "$VALE" ]; then fail "vale docs/docs (no vale)"; fail "probe oaicite (no vale)"; return; fi
  check "vale docs/docs exits 0" "$VALE" docs/docs
  if [ -e "$PROBE" ] || [ -e "$D08_PROBE" ]; then
    fail "vale probes ($PROBE or $D08_PROBE already exists; refusing to overwrite)"; return
  fi
  if [ ! -d "$(dirname "$PROBE")" ]; then mkdir -p "$(dirname "$PROBE")"; PROBE_DIR_MADE=1; fi
  PROBE_OWNED=1
  printf -- '---\ntitle: Vale probe\n---\n\n## Probe\n\nSee oaicite here.\n' > "$PROBE"
  local out rc
  out="$("$VALE" "$PROBE" 2>&1)"; rc=$?
  rm -f "$PROBE"
  if [ "$rc" -ne 0 ] && echo "$out" | grep -q 'BASIS.AIArtifacts'; then pass "probe oaicite fails with BASIS.AIArtifacts"
  else fail "probe oaicite fails with BASIS.AIArtifacts (rc=$rc)"; fi
  printf -- '---\ntitle: Vale probe\n---\n\n## Probe\n\nUse WebforJ with BBJ here.\n' > "$PROBE"
  out="$("$VALE" "$PROBE" 2>&1)"; rc=$?
  rm -f "$PROBE"
  if [ "$rc" -ne 0 ] && echo "$out" | grep -q 'Vale\.Avoid' && echo "$out" | grep -q 'Vale\.Terms'; then pass "probe vocab fails with Vale.Avoid and Vale.Terms"
  else fail "probe vocab fails with Vale.Avoid and Vale.Terms (rc=$rc)"; fi
  local f
  # D-08: CONTRIBUTING.md and CLAUDE.md are not linted. A clean run alone proves
  # nothing (the file may simply have no alerts), so lint a copy at the repo root
  # with an error-level violation appended: it must exit 0 with no BASIS alert.
  # Any exit code other than 0 (config error, crash, alerts) fails the check.
  for f in CONTRIBUTING.md CLAUDE.md; do
    if [ -f "$f" ]; then
      cp "$f" "$D08_PROBE"
      printf '\nSee oaicite here.\n' >> "$D08_PROBE"
      out="$("$VALE" "$D08_PROBE" 2>&1)"; rc=$?
      rm -f "$D08_PROBE"
      if [ "$rc" -eq 0 ] && ! echo "$out" | grep -q 'BASIS\.' && ! echo "$out" | grep -Eq '^ *[0-9]+:[0-9]+ '; then pass "$f not linted (D-08)"
      else fail "$f not linted (D-08) (rc=$rc)"; fi
    fi
  done
}

section_docs() {
  SEC=docs
  local f m
  for f in CLAUDE.md CONTRIBUTING.md .editorconfig THIRD_PARTY_NOTICES.md; do check "exists $f" test -f "$f"; done
  for m in "LICENSES/webforJ-MIT.txt" "errata-ai/Google" ".github/.styles/Google"; do
    check "THIRD_PARTY_NOTICES mentions $m" hasf THIRD_PARTY_NOTICES.md "$m"
  done
  for m in "# Claude Instructions" "## Before committing" "## Forbidden" ".planning/migration-seed.md"; do
    check "CLAUDE.md contains $m" hasf CLAUDE.md "$m"
  done
  for m in project stack conventions architecture skills workflow profile; do
    check "CLAUDE.md GSD:$m-start" hasf CLAUDE.md "<!-- GSD:$m-start"
    check "CLAUDE.md GSD:$m-end" hasf CLAUDE.md "<!-- GSD:$m-end"
  done
  check "CONTRIBUTING mentions install-lint-tools" hasf CONTRIBUTING.md "tools/install-lint-tools.sh"
  check "CONTRIBUTING mentions BASIS staff" hasf CONTRIBUTING.md "BASIS staff"
}

section_headers() {
  SEC=headers
  local list="" n f
  for n in _alerts _announcement _category _content _footer _navbar _pagination _prism _reset _sidebar-icons _sidebar _tables _toc _tutorial-content _utils; do
    list="$list docs/src/css/$n.scss"
  done
  list="$list docs/src/css/custom.scss docs/src/css/mixins/_content-block.scss docs/src/theme/prism-dwc-theme.js docs/static/js/dwc-theme-switcher.js docs/static/js/link-decorator.js .editorconfig .vale.ini"
  for f in .github/.styles/BASIS/*.yml; do list="$list $f"; done
  for f in $list; do
    if [ -f "$f" ] && head -3 "$f" | grep -q 'webforJ-MIT'; then pass "MIT header $f"; else fail "MIT header $f"; fi
  done
}

section_seed() {
  SEC=seed
  check "no root migration-seed.md" test ! -e migration-seed.md
  check ".planning/migration-seed.md exists" test -f .planning/migration-seed.md
  check ".planning/migration-seed.md tracked" git ls-files --error-unmatch .planning/migration-seed.md
  local f bad
  for f in CLAUDE.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/ROADMAP.md .planning/research/SUMMARY.md .planning/research/ARCHITECTURE.md .planning/research/FEATURES.md; do
    if [ ! -f "$f" ]; then fail "seed refs in $f (missing file)"; continue; fi
    bad="$(grep -E 'migration-seed\.md' "$f" | grep -vE '\.planning/migration-seed\.md' | head -1)"
    if [ -z "$bad" ]; then pass "seed refs in $f"; else fail "seed refs in $f"; fi
  done
}

section_hygiene() {
  SEC=hygiene
  if [ "$(git rev-parse --abbrev-ref HEAD)" = "main" ]; then pass "branch is main"; else fail "branch is main"; fi
  if [ -z "$(git ls-files import .claude)" ]; then pass "nothing tracked under import/ or .claude/"; else fail "nothing tracked under import/ or .claude/"; fi
  if git ls-files | grep -q '\.mbz$'; then fail "no tracked .mbz"; else pass "no tracked .mbz"; fi
  check "tools/.bin is gitignored" git check-ignore -q tools/.bin/vale
}

have_gh() { command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; }

section_deploy() {
  SEC=deploy
  if ! have_gh; then skip "section (gh not authenticated)"; return; fi
  # The URL loops below split on whitespace; disable globbing so a URL with *, ? or [
  # never expands to local file names. Restored at the end of the function.
  set -f
  local v bt concl html url urls css cssurls base img n
  v="$(gh repo view $REPO --json visibility -q .visibility 2>/dev/null)"
  if [ "$v" = "PUBLIC" ]; then pass "repo is PUBLIC"; else fail "repo is PUBLIC (got '$v')"; fi
  bt="$(gh api repos/$REPO/pages -q .build_type 2>/dev/null)"
  if [ "$bt" = "workflow" ]; then pass "Pages build_type workflow"; else fail "Pages build_type workflow (got '$bt')"; fi
  concl="$(gh run list -R $REPO -w deploy.yml -b main -L 1 --json conclusion -q '.[0].conclusion' 2>/dev/null)"
  if [ "$concl" = "success" ]; then pass "latest deploy.yml run on main succeeded"; else fail "latest deploy.yml run on main succeeded (got '$concl')"; fi
  if [ "$(code "$DEEP")" = "200" ]; then pass "deep URL 200"; else fail "deep URL 200"; fi
  html="$(curl -s --max-time 30 "$DEEP")"
  urls="$(echo "$html" | grep -oE '(href|src)="/Courses/[^"]*"' | sed -E 's/^(href|src)="//; s/"$//' | sort -u)"
  local bad=0 hascss=0 hasjs=0
  for url in $urls; do
    [ "$(code "https://basishub.github.io$url")" = "200" ] || { bad=1; echo "  not 200: $url"; }
    case "$url" in *.css*) hascss=1 ;; esac
    case "$url" in *.js*) hasjs=1 ;; esac
  done
  if [ -n "$urls" ] && [ "$bad" -eq 0 ]; then pass "all /Courses/ href/src return 200"; else fail "all /Courses/ href/src return 200"; fi
  if [ "$hascss" -eq 1 ] && [ "$hasjs" -eq 1 ]; then pass "page links at least one css and one js"; else fail "page links at least one css and one js"; fi
  local fontbad=0 woff=0 imgs="" imgbad=0
  for url in $urls; do
    case "$url" in
      *.css*)
        css="https://basishub.github.io$url"
        base="${css%/*}"
        for n in $(curl -s --max-time 30 "$css" | grep -oE 'url\(([^)]*)\)' | sed -E "s/^url\(//; s/\)$//; s/^['\"]//; s/['\"]$//" | grep -v '^data:' | sort -u); do
          case "$n" in
            http*) continue ;;
            /Courses/*) n="https://basishub.github.io$n" ;;
            /*) continue ;;
            *) n="$base/$n" ;;
          esac
          n="${n%%[?#]*}"
          [ "$(code "$n")" = "200" ] || { fontbad=1; echo "  not 200: $n"; }
          case "$n" in *.woff2) woff=1 ;; esac
          case "$n" in *.png|*.svg|*.jpg|*.jpeg|*.webp|*.ico|*.gif) imgs="$imgs $n" ;; esac
        done ;;
    esac
  done
  if [ "$fontbad" -eq 0 ]; then pass "css url() assets return 200"; else fail "css url() assets return 200"; fi
  if [ "$woff" -eq 1 ]; then pass "css references a .woff2 font"; else fail "css references a .woff2 font"; fi
  for url in $(echo "$html" | grep -oE '(href|src)="/Courses/[^"]*\.(png|svg|jpg|jpeg|webp|ico|gif)"' | sed -E 's/^(href|src)="//; s/"$//' | sort -u); do
    imgs="$imgs https://basishub.github.io$url"
  done
  if [ -z "${imgs// /}" ]; then skip "no image references on stub page"
  else
    for img in $imgs; do [ "$(code "$img")" = "200" ] || { imgbad=1; echo "  not 200: $img"; }; done
    if [ "$imgbad" -eq 0 ]; then pass "image references return 200"; else fail "image references return 200"; fi
  fi
  if [ "$(code "$SITE/sitemap.xml")" = "200" ]; then pass "sitemap.xml 200"; else fail "sitemap.xml 200"; fi
  if [ "$(code "$SITE/llms.txt")" = "200" ]; then pass "llms.txt 200"; else fail "llms.txt 200"; fi
  if echo "$html" | grep -qE 'fonts\.googleapis\.com|cdn\.webforj\.com'; then fail "no external font/CDN references"; else pass "no external font/CDN references"; fi
  set +f
}

section_gates() {
  SEC=gates
  if ! have_gh; then skip "section (gh not authenticated)"; return; fi
  local enf id rules prs num sha checks b
  enf="$(gh api repos/$REPO/rulesets -q '.[] | select(.enforcement=="active") | .id' 2>/dev/null | head -1)"
  if [ -n "$enf" ]; then pass "active ruleset exists"; else fail "active ruleset exists"; fi
  rules="$(gh api repos/$REPO/rules/branches/main 2>/dev/null)"
  if echo "$rules" | grep -q '"pull_request"'; then pass "main has pull_request rule"; else fail "main has pull_request rule"; fi
  if echo "$rules" | grep -q '"required_status_checks"' && echo "$rules" | grep -qF 'Test build (no deploy)' && echo "$rules" | grep -qF 'runner / vale'
  then pass "main requires both status checks"; else fail "main requires both status checks"; fi
  if [ -n "$enf" ]; then
    id="$(gh api repos/$REPO/rulesets/$enf -q '.bypass_actors[] | select(.actor_type=="RepositoryRole" and .actor_id==5 and .bypass_mode=="always") | .actor_id' 2>/dev/null | head -1)"
    if [ "$id" = "5" ]; then pass "admin bypass actor (RepositoryRole 5, always)"; else fail "admin bypass actor (RepositoryRole 5, always)"; fi
  else fail "admin bypass actor (no ruleset)"; fi
  for b in ci-probe/vale-error ci-probe/file-mode-head; do
    num="$(gh pr list -R $REPO --state closed --head "$b" --json number -q '.[0].number' 2>/dev/null)"
    sha="$(gh pr list -R $REPO --state closed --head "$b" --json headRefOid -q '.[0].headRefOid' 2>/dev/null)"
    if [ -z "$num" ] || [ -z "$sha" ]; then fail "closed probe PR for $b"; continue; fi
    pass "closed probe PR for $b"
    checks="$(gh api repos/$REPO/commits/$sha/check-runs -q '.check_runs[] | "\(.name)=\(.conclusion)"' 2>/dev/null)"
    if echo "$checks" | grep -qxF 'runner / vale=failure'; then pass "$b: runner / vale = failure"; else fail "$b: runner / vale = failure"; fi
    if [ "$b" = "ci-probe/vale-error" ]; then
      if echo "$checks" | grep -qxF 'Test build (no deploy)=success'; then pass "$b: Test build = success"; else fail "$b: Test build = success"; fi
    fi
  done
  if gh run list -R $REPO -w deploy.yml -L 1000 --json headBranch -q '.[].headBranch' 2>/dev/null | grep -q '^ci-probe/'; then fail "no deploy run from ci-probe/ branches"; else pass "no deploy run from ci-probe/ branches"; fi
  for b in ci-probe%2Fvale-error ci-probe%2Ffile-mode-base ci-probe%2Ffile-mode-head; do
    if gh api "repos/$REPO/branches/$b" >/dev/null 2>&1; then fail "probe branch deleted: $b"; else pass "probe branch deleted: $b"; fi
  done
}

[ "$MODE_LOCAL" -eq 1 ] && { section_tools; section_ci; section_vale; section_docs; section_headers; section_seed; section_hygiene; }
[ "$MODE_DEPLOY" -eq 1 ] && section_deploy
[ "$MODE_GATES" -eq 1 ] && section_gates

echo
if [ "$FAILS" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "$FAILS CHECK(S) FAILED"; fi
[ "$FAILS" -eq 0 ]
