#!/usr/bin/env bash
# Phase 6.1 acceptance suite (exercise solutions and restored screenshots).
# Usage: bash tools/verify-phase6.1.sh [--no-build] [--with-older]
# Prints one "PASS|FAIL|SKIP  [section] name" line per check; exits 1 if any check failed.
# Sections: build solutions indexes audit intro samples regression older (older only with --with-older).
# Point-in-time gate: asserts the Phase 6.1 end state (16 solutions, pointer lines, restored 8B-05 and 8B-07).
# The checker always runs over all 16 pages; this wrapper never narrows it to a page subset.
# --with-older also runs verify-phase1 to verify-phase6 (phase 2 with --local, 3 to 6 with --no-build).
# The wrapper is red until plan 10 by design: the ten new solution pages land in plans 08 and 09.
# Executor sandboxes may refuse `bash tools/*.sh`; in that case the orchestrator runs this wrapper.
# Writes only docs/build and a temp build log (removed on exit).
set -u
cd "$(dirname "$0")/.." || exit 1

FAILS=0
SEC=""
BUILD=1
OLDER=0
LOG=""
B=docs/build
CFG=docs/docusaurus.config.js
P6=tools/check-dwc-phase6.py
PH=.planning/phases/06.1-exercise-solutions-and-restored-screenshots
MAIN="$(cd "$(git rev-parse --git-common-dir)/.." && pwd)"

pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { # check <name> <command...>; on failure prints the checker's FAIL lines (or its last 20 lines)
  local name="$1" out detail; shift
  if out=$("$@" </dev/null 2>&1); then pass "$name"; return; fi
  fail "$name"
  detail=$(printf '%s\n' "$out" | grep 'FAIL' | head -20)
  [ -n "$detail" ] || detail=$(printf '%s\n' "$out" | tail -20)
  [ -z "$detail" ] || printf '%s\n' "$detail" | sed 's/^/    /'
}
cleanup() { [ -n "$LOG" ] && rm -f "$LOG"; return 0; }
trap cleanup EXIT

for a in "$@"; do
  case "$a" in
    --no-build) BUILD=0 ;;
    --with-older) OLDER=1 ;;
    *) echo "Unknown flag: $a (use --no-build, --with-older)" >&2; exit 2 ;;
  esac
done

LOG=$(mktemp)
SEC=build
if [ "$BUILD" -eq 1 ]; then
  if (cd docs && npm run build) >"$LOG" 2>&1; then pass "npm run build"
  else fail "npm run build"; tail -20 "$LOG"; fi
elif [ -d "$B" ]; then
  pass "using existing build (--no-build)"
  stale=$(find docs/docs docs/src docs/static "$CFG" docs/sidebars.js docs/package.json docs/package-lock.json -newer "$B/index.html" -type f -print 2>/dev/null | head -1)
  if [ -z "$stale" ] && [ -f "$B/index.html" ]; then pass "existing build is newer than its sources"
  else fail "existing build is stale (newer source: ${stale:-no index.html}); run without --no-build"; fi
else fail "no docs/build; run without --no-build"; fi

SEC=solutions
check "11 DWC exercise pages" python3 $P6 exercises
check "16 inline solutions match examples and ZIPs" python3 $P6 solutions

SEC=indexes
check "exercise indexes" python3 $P6 indexes
check "routes and sidebar order" python3 tools/check-dwc-routes.py
check "anchors" python3 tools/check-dwc-anchors.py

SEC=audit
check "gap audit" python3 $P6 audit
check "kept material" python3 $P6 kept
check "2022 screenshot markers" python3 $P6 screenshots

SEC=intro
check "intro-bbj structure" python3 tools/check-intro-bbj.py structure --build docs/build
check "intro-bbj content" python3 tools/check-intro-bbj.py content
check "intro-bbj edits" python3 tools/check-intro-bbj.py edits
check "intro-bbj samples" python3 tools/check-intro-bbj.py samples
check "intro-bbj syntax" python3 tools/check-intro-bbj.py syntax

SEC=samples
check "samples in sync" python3 tools/sync-samples.py --check
miss=0; total=0
while IFS= read -r f; do
  total=$((total + 1))
  grep -qF "\`$f\`" tools/data/dwc-samples-syntax.md 2>/dev/null || { miss=1; echo "  no syntax row for $f"; }
done < <(find docs/examples/dwc -name '*.bbj' | LC_ALL=C sort)
rows=$(grep -c '^| `docs/examples/dwc/' tools/data/dwc-samples-syntax.md 2>/dev/null || true)
claimed=$(sed -n 's/.*Total: \([0-9][0-9]*\)\..*/\1/p' tools/data/dwc-samples-syntax.md 2>/dev/null | head -1)
if [ "$total" -ge 44 ] && [ "$miss" -eq 0 ]; then pass "every DWC sample has a syntax row ($total samples)"
else fail "every DWC sample has a syntax row ($total samples, at least 44 needed)"; fi
if [ -n "$claimed" ] && [ "$claimed" = "$rows" ]; then pass "dwc-samples-syntax.md Total ($claimed) equals its row count"
else fail "dwc-samples-syntax.md Total (${claimed:-none}) differs from its row count ($rows)"; fi

# drafts staged under the phase directory are installed byte for byte, and each has a raw syntax row
if [ -d "$PH/drafts" ]; then
  nd=0; bad=0
  while IFS= read -r d; do
    nd=$((nd + 1))
    rel="${d#"$PH"/drafts/}"            # <book>/<path>
    if ! cmp -s "$d" "docs/examples/$rel"; then bad=1; echo "  draft differs from or is missing in docs/examples/$rel"; fi
  done < <(find "$PH/drafts/dwc" "$PH/drafts/intro-bbj" -type f 2>/dev/null | LC_ALL=C sort)
  if [ "$nd" -gt 0 ] && [ "$bad" -eq 0 ]; then pass "all $nd drafts are byte-identical to docs/examples"
  else fail "drafts are byte-identical to docs/examples ($nd drafts found)"; fi
  raw="$PH/06.1-bbj-syntax-raw.tsv"
  if [ -f "$raw" ]; then
    nr=0; badr=0
    while IFS= read -r d; do
      case "$d" in *.bbj|*.css) ;; *) continue ;; esac
      nr=$((nr + 1))
      id="${d#"$PH"/drafts/}"
      res=$(awk -F'\t' -v id="$id" '$1 == id { print $2; exit }' "$raw")
      case "$res" in pass|fixed) ;; *) badr=1; echo "  no pass or fixed row for $id in 06.1-bbj-syntax-raw.tsv" ;; esac
    done < <(find "$PH/drafts/dwc" "$PH/drafts/intro-bbj" -type f 2>/dev/null | LC_ALL=C sort)
    if [ "$nr" -gt 0 ] && [ "$badr" -eq 0 ]; then pass "06.1-bbj-syntax-raw.tsv covers all $nr draft .bbj and .css files"
    else fail "06.1-bbj-syntax-raw.tsv covers all draft .bbj and .css files ($nr found)"; fi
  else fail "06.1-bbj-syntax-raw.tsv exists"; fi
else
  fail "drafts directory $PH/drafts exists"
fi

# Shoelace is pinned to a full version everywhere; the embed solution uses the 2.20.1 CDN path
floating=$(grep -rhoE '@shoelace-style/shoelace[^/ "'"'"']*' docs/examples 2>/dev/null \
  | grep -vE '^@shoelace-style/shoelace@[0-9]+\.[0-9]+\.[0-9]+([-+][A-Za-z0-9.]+)?$' | sort -u)
if [ -z "$floating" ]; then pass "no floating Shoelace version under docs/examples"
else fail "no floating Shoelace version under docs/examples"; printf '%s\n' "$floating" | sed 's/^/    /'; fi
embed=docs/examples/dwc/09_EmbeddingOtherComponents/Exercise-EmbedComponentComplete.bbj
if [ -f "$embed" ] && grep -qF '@shoelace-style/shoelace@2.20.1/cdn/' "$embed"; then pass "embed solution pins @shoelace-style/shoelace@2.20.1/cdn/"
else fail "embed solution pins @shoelace-style/shoelace@2.20.1/cdn/"; fi

SEC=regression
VALE=tools/.bin/vale
[ -x "$VALE" ] || VALE="$MAIN/tools/.bin/vale"
if [ -x "$VALE" ]; then
  check "Vale error level on dwc and intro-bbj" "$VALE" --minAlertLevel=error docs/docs/dwc docs/docs/intro-bbj
else skip "Vale missing (run: bash tools/install-lint-tools.sh)"; fi
if [ -d docs/node_modules/@mdx-js/mdx ] && [ -f tools/check-mdx.mjs ]; then
  mdx_files=()
  while IFS= read -r f; do mdx_files+=("$f"); done < <(find docs/docs/dwc docs/docs/intro-bbj -name '9*-exercise-*.mdx' | LC_ALL=C sort)
  mdx_files+=(docs/docs/dwc/exercises.mdx docs/docs/intro-bbj/exercises.mdx docs/docs/dwc/samples.mdx docs/docs/intro-bbj/00-overview.mdx)
  check "exercise pages, indexes, samples and overview compile as MDX (${#mdx_files[@]} files)" node tools/check-mdx.mjs "${mdx_files[@]}"
else skip "MDX compiler missing (run: cd docs && npm ci)"; fi
if grep -rIEq 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs; then
  fail "LIVE-01 grep over docs/docs is empty"; grep -rIEn 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs | head -5
else pass "LIVE-01 grep over docs/docs is empty"; fi
[ "$(git ls-files import | wc -l | tr -d ' ')" = "0" ] && pass "no tracked import/ path" || fail "no tracked import/ path"

if [ "$OLDER" -eq 1 ]; then
  SEC=older
  check "verify-phase1.sh" bash tools/verify-phase1.sh
  check "verify-phase2.sh --local" bash tools/verify-phase2.sh --local
  check "verify-phase3.sh --no-build" bash tools/verify-phase3.sh --no-build
  check "verify-phase4.sh --no-build" bash tools/verify-phase4.sh --no-build
  check "verify-phase5.sh --no-build" bash tools/verify-phase5.sh --no-build
  check "verify-phase6.sh --no-build" bash tools/verify-phase6.sh --no-build
fi

if [ "$FAILS" -gt 0 ]; then echo "Phase 6.1: $FAILS failure(s)"; exit 1; fi
echo "Phase 6.1: all checks passed"; exit 0
