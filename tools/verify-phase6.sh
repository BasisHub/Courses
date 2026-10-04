#!/usr/bin/env bash
# Phase 6 acceptance suite (exercises and DWC gap audit).
# Usage: bash tools/verify-phase6.sh [--no-build]
# Prints one "PASS|FAIL|SKIP  [section] name" line per check; exits 1 if any check failed.
# Sections: build exercises pointers solutions indexes audit kept screenshots regression commits.
# Point-in-time gate: asserts the Phase 6 end state (11 DWC exercise pages, 6 solutions, 2 indexes, gap audit, kept material, 2022 markers).
# LIVE-01 (Phase 7): the sidebar diff against the old DWC-Course site must treat the new DWC Exercises page and the 11 exercise sub-pages as intended additions.
# Writes only docs/build and a temp build log (removed on exit).
set -u
cd "$(dirname "$0")/.." || exit 1

FAILS=0
SEC=""
BUILD=1
LOG=""
B=docs/build
CFG=docs/docusaurus.config.js
P6=tools/check-dwc-phase6.py

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
    *) echo "Unknown flag: $a (use --no-build)" >&2; exit 2 ;;
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

SEC=exercises
check "11 DWC exercise pages" python3 $P6 exercises
if [ -d docs/node_modules/@mdx-js/mdx ] && [ -f tools/check-mdx.mjs ]; then
  mdx_files=()
  while IFS= read -r f; do mdx_files+=("$f"); done < <(find docs/docs/dwc -name '9*-exercise-*.mdx' | LC_ALL=C sort)
  mdx_files+=(docs/docs/dwc/exercises.mdx docs/docs/intro-bbj/exercises.mdx)
  check "exercise pages and indexes compile as MDX" node tools/check-mdx.mjs "${mdx_files[@]}"
else skip "MDX compiler missing (run: cd docs && npm ci)"; fi
targets=$(grep -rhoE 'pathname:///files/dwc/[^)" ]+' docs/docs/dwc | sed 's|pathname:///files/dwc/||' | sort -u)
n=0; bad=0
for t in $targets; do
  n=$((n + 1))
  [ -f "docs/static/files/dwc/$t" ] || { bad=1; echo "  missing docs/static/files/dwc/$t"; }
  if [ -d "$B" ]; then [ -f "$B/files/dwc/$t" ] || { bad=1; echo "  missing $B/files/dwc/$t"; }; fi
done
if [ "$n" -ge 11 ] && [ "$bad" -eq 0 ]; then pass "download targets exist ($n)"; else fail "download targets exist ($n found)"; fi

SEC=pointers
check "exercise pointers in chapters" python3 $P6 pointers
check "anchors" python3 tools/check-dwc-anchors.py

SEC=solutions
check "inline solutions match examples" python3 $P6 solutions

SEC=indexes
check "exercise indexes" python3 $P6 indexes
check "routes and sidebar order" python3 tools/check-dwc-routes.py
check "intro-bbj structure" python3 tools/check-intro-bbj.py structure --build docs/build

SEC=audit
check "gap audit" python3 $P6 audit

SEC=kept
check "kept material" python3 $P6 kept
[ ! -e tools/data/dwc-unused-img ] && pass "dwc-unused-img gone" || fail "dwc-unused-img gone"
check "samples in sync" python3 tools/sync-samples.py --check
total=$(find docs/examples/dwc -name '*.bbj' | wc -l | tr -d ' ')
[ "$total" -eq 44 ] && pass "44 .bbj under docs/examples/dwc" || fail "44 .bbj under docs/examples/dwc ($total found)"
[ "$(git ls-files import | wc -l | tr -d ' ')" = "0" ] && pass "no tracked import/ path" || fail "no tracked import/ path"

SEC=screenshots
check "2022 screenshot markers" python3 $P6 screenshots

SEC=regression
if [ -x tools/.bin/vale ]; then
  check "Vale error level on dwc and intro-bbj" tools/.bin/vale --minAlertLevel=error docs/docs/dwc docs/docs/intro-bbj
else skip "tools/.bin/vale missing (run: bash tools/install-lint-tools.sh)"; fi
if grep -rIEq 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs; then
  fail "LIVE-01 grep over docs/docs is empty"; grep -rIEn 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs | head -5
else pass "LIVE-01 grep over docs/docs is empty"; fi
check "intro-bbj content" python3 tools/check-intro-bbj.py content
check "intro-bbj edits" python3 tools/check-intro-bbj.py edits
check "intro-bbj samples" python3 tools/check-intro-bbj.py samples
check "intro-bbj syntax" python3 tools/check-intro-bbj.py syntax
SRC="${DWC_SOURCE_REPO:-$PWD/../bbj-dwc-tutorial}"
export DWC_SOURCE_REPO="$SRC"
C1_SUBJECT='feat(04-03): relocate DWC-Course book from BasisHub/DWC-Course@965da6d'
C1=$(git log --format='%H %s' --fixed-strings --grep="$C1_SUBJECT" \
  | awk -v s="$C1_SUBJECT" '{ h = $1; sub(/^[^ ]+ /, ""); if ($0 == s) { print h; exit } }')
if [ ! -d "$SRC" ] || ! git -C "$SRC" rev-parse --verify -q '965da6d^{commit}' >/dev/null 2>&1; then
  skip "source clone not found at $SRC (set DWC_SOURCE_REPO)"
elif [ -z "$C1" ]; then
  skip "commit 1 not found in history (squashed or shallow clone)"
else
  check "text unchanged in commit 1, image map" python3 tools/check-dwc-relocation.py --rev "$C1"
fi

SEC=commits
check "D-18 commit series order" python3 $P6 commits

if [ "$FAILS" -gt 0 ]; then echo "Phase 6: $FAILS failure(s)"; exit 1; fi
echo "Phase 6: all checks passed"; exit 0
