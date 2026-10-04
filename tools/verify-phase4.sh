#!/usr/bin/env bash
# Phase 4 acceptance suite (DWC book relocation).
# Usage: bash tools/verify-phase4.sh [--no-build]
# Prints one "PASS|FAIL|SKIP  [section] name" line per check; exits 1 if any check failed.
# Sections: build snapshot routes relocation samples content.
# Point-in-time gate: asserts the exact Phase 4 end state (routes, files, images).
# Later phases that add dwc pages or move parked images must update the checkers in the same change.
# Writes only docs/build and a temp build log (removed on exit).
set -u
cd "$(dirname "$0")/.." || exit 1

FAILS=0
SEC=""
BUILD=1
LOG=""
B=docs/build
CFG=docs/docusaurus.config.js

pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  [$SEC] $1"; }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
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

SEC=snapshot
[ "$(grep -o '<loc>' tools/data/dwc-old-sitemap.xml 2>/dev/null | wc -l | tr -d ' ')" -eq 28 ] \
  && pass "old sitemap has 28 locs" || fail "old sitemap has 28 locs"
if python3 -c "
import json,sys
d=json.load(open('tools/data/dwc-old-routes.json'))
r=[x for x in d['routes'] if x.get('content')]
n=sum(len(x['anchors']) for x in r)
sys.exit(0 if len(r)==27 and n==307 else 1)
" >/dev/null 2>&1; then pass "old routes: 27 routes, 307 anchors"; else fail "old routes: 27 routes, 307 anchors"; fi

SEC=routes
check "routes and sidebar order" python3 tools/check-dwc-routes.py
check "anchors" python3 tools/check-dwc-anchors.py

SEC=relocation
SRC="${DWC_SOURCE_REPO:-$PWD/../bbj-dwc-tutorial}"
export DWC_SOURCE_REPO="$SRC"
C1=$(git log --format=%H -1 --grep='relocate DWC-Course book from BasisHub/DWC-Course@965da6d')
if [ ! -d "$SRC" ] || ! git -C "$SRC" rev-parse --verify -q '965da6d^{commit}' >/dev/null 2>&1; then
  skip "source clone not found at $SRC (set DWC_SOURCE_REPO)"
elif [ -z "$C1" ]; then
  skip "commit 1 not found in history (squashed or shallow clone)"
else
  check "text unchanged in commit 1, image map" python3 tools/check-dwc-relocation.py --rev "$C1"
fi

SEC=samples
check "samples in sync" python3 tools/sync-samples.py --check
targets=$(grep -rhoE 'pathname:///files/dwc/[^)" ]+' docs/docs/dwc | sed 's|pathname:///files/dwc/||' | sort -u)
n=0; bad=0
for t in $targets; do
  n=$((n + 1))
  [ -f "docs/static/files/dwc/$t" ] || { bad=1; echo "  missing docs/static/files/dwc/$t"; }
  if [ -d "$B" ]; then [ -f "$B/files/dwc/$t" ] || { bad=1; echo "  missing $B/files/dwc/$t"; }; fi
done
if [ "$n" -ge 11 ] && [ "$bad" -eq 0 ]; then pass "download targets exist ($n)"; else fail "download targets exist ($n found)"; fi
grep -qF 'sync-samples.py --check' .github/workflows/test-build.yml 2>/dev/null \
  && pass "test-build.yml runs sync-samples check" || fail "test-build.yml runs sync-samples check"
grep -qF 'sync-samples.py --check' .github/workflows/deploy.yml 2>/dev/null \
  && pass "deploy.yml runs sync-samples check" || fail "deploy.yml runs sync-samples check"
grep -qF '05_CssLayouts/prism.min.js' THIRD_PARTY_NOTICES.md 2>/dev/null \
  && pass "THIRD_PARTY_NOTICES lists prism.min.js" || fail "THIRD_PARTY_NOTICES lists prism.min.js"
miss=0; total=0
while IFS= read -r f; do
  total=$((total + 1))
  grep -qF "\`$f\`" tools/data/dwc-samples-syntax.md 2>/dev/null || { miss=1; echo "  no syntax row for $f"; }
done < <(find docs/examples/dwc -name '*.bbj' | sort)
if [ "$total" -eq 44 ] && [ "$miss" -eq 0 ]; then pass "syntax report covers all 44 samples"; else fail "syntax report covers all 44 samples ($total found)"; fi

SEC=content
if grep -rIEq 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs; then
  fail "LIVE-01 grep over docs/docs is empty"; grep -rIEn 'PLUGINFILE|pluginfile\.php|\$@[A-Z]+|moodle\.basis-europe|DWC-Course/' docs/docs | head -5
else pass "LIVE-01 grep over docs/docs is empty"; fi
if grep -rIEq '<Image|IdealImage' docs/docs; then fail "no <Image or IdealImage in docs/docs"; else pass "no <Image or IdealImage in docs/docs"; fi
if [ -z "$(find docs/docs/dwc docs/examples/dwc -name '.*' ! -name . ! -name .. 2>/dev/null)" ]; then pass "no dotfiles in dwc"; else fail "no dotfiles in dwc"; fi
[ ! -e docs/docs/dwc/01-first-chapter ] && pass "stub chapter 01-first-chapter gone" || fail "stub chapter 01-first-chapter gone"
if grep -q first-chapter tools/prove-gates.sh tools/verify-phase1.sh tools/verify-phase2.sh; then fail "no first-chapter in gate scripts"; else pass "no first-chapter in gate scripts"; fi
check "Vale error level on docs/docs/dwc" tools/.bin/vale --minAlertLevel=error docs/docs/dwc

if [ "$FAILS" -gt 0 ]; then echo "Phase 4: $FAILS failure(s)"; exit 1; fi
echo "Phase 4: all checks passed"; exit 0
