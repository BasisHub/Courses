#!/usr/bin/env bash
# Phase 5 acceptance suite (Introduction to BBj conversion).
# Usage: bash tools/verify-phase5.sh [--no-build]
# Prints one "PASS|FAIL|SKIP  [section] name" line per check; exits 1 if any check failed.
# Sections: build structure content samples commits edits syntax.
# Point-in-time gate: asserts the exact Phase 5 end state (book shape, embeds, images, samples).
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

SEC=structure
check "book structure and order" python3 tools/check-intro-bbj.py structure --build docs/build

SEC=content
check "content leftovers, fences, videos, images" python3 tools/check-intro-bbj.py content
if [ -d docs/node_modules/@mdx-js/mdx ]; then
  if [ -f tools/check-mdx.mjs ]; then
    mdx_files=()
    while IFS= read -r f; do mdx_files+=("$f"); done < <(find docs/docs/intro-bbj -name '*.mdx' | LC_ALL=C sort)
    if [ "${#mdx_files[@]}" -gt 0 ]; then
      check "every intro-bbj page compiles as MDX" node tools/check-mdx.mjs "${mdx_files[@]}"
    else fail "every intro-bbj page compiles as MDX (no .mdx files)"; fi
  else skip "tools/check-mdx.mjs missing (created by plan 05-01)"; fi
else skip "docs/node_modules/@mdx-js/mdx missing (run: cd docs && npm ci)"; fi

SEC=samples
check "samples, LICENSE, ZIPs, download links" python3 tools/check-intro-bbj.py samples

SEC=commits
check "converter and generated docs commits (CONV-07)" python3 tools/check-intro-bbj.py commits

SEC=edits
check "hand edits, link map, Vale errors" python3 tools/check-intro-bbj.py edits

SEC=syntax
check "BBj syntax report" python3 tools/check-intro-bbj.py syntax

if [ "$FAILS" -gt 0 ]; then echo "Phase 5: $FAILS failure(s)"; exit 1; fi
echo "Phase 5: all checks passed"; exit 0
