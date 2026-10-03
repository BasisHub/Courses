#!/usr/bin/env bash
# Phase 3 acceptance suite (components, brand, search).
# Usage: bash tools/verify-phase3.sh [--no-build]
# Prints one "PASS|FAIL  [section] name" line per check; exits 1 if any check failed.
# Sections: grammar comp01 comp02 comp03 comp04 comp05 comp06 unlisted site05 hosts headers.
# Writes only docs/build and a temp build log (removed on exit).
set -u
cd "$(dirname "$0")/.." || exit 1

FAILS=0
SEC=""
BUILD=1
LOG=""
H=docs/build/docs/authoring/components.html
B=docs/build
CFG=docs/docusaurus.config.js

pass() { echo "PASS  [$SEC] $1"; }
fail() { echo "FAIL  [$SEC] $1"; FAILS=$((FAILS + 1)); }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}
has() { grep -q -- "$2" "$1" 2>/dev/null; }
hasf() { grep -qF -- "$2" "$1" 2>/dev/null; }
count_is() { # count_is <file> <fixed> <op> <n>
  local c; c=$(grep -oF -- "$2" "$1" 2>/dev/null | wc -l | tr -d ' ')
  case "$3" in eq) [ "$c" -eq "$4" ];; ge) [ "$c" -ge "$4" ];; esac
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
elif [ -d "$B" ]; then pass "using existing build (--no-build)"
else fail "no docs/build; run without --no-build"; fi

js_has() { grep -rlF -- "$1" "$B"/assets/js 2>/dev/null | head -1 | grep -q .; }

SEC=grammar
check "bbj grammar test" node tools/test-bbj-grammar.js
check "35 BBj classes" node -e 'process.exit(require("./docs/src/prism/bbj-classes.json").classes.length===35?0:1)'
if [ -f tools/data/bbj-token-verification.md ]; then pass "token verification record"; else fail "token verification record"; fi

SEC=comp01
if [ "$BUILD" -eq 1 ]; then
  if grep -q "No admonition component found" "$LOG" 2>/dev/null; then fail "no unknown admonition warning"; else pass "no unknown admonition warning"; fi
else
  echo "SKIP  [$SEC] no unknown admonition warning (needs the build log; run without --no-build)"
fi
has "$H" 'alert--exercise' && pass "alert--exercise rendered" || fail "alert--exercise rendered"
# The fixture's only "Try it yourself" comes from the default title; the
# second box carries a custom title.
count_is "$H" 'Try it yourself' ge 1 && pass "default title Try it yourself" || fail "default title Try it yourself"
hasf "$H" 'Change the title' && pass "custom exercise title" || fail "custom exercise title"
hasf "$CFG" "keywords: ['exercise']" && pass "exercise keyword in config" || fail "exercise keyword in config"

SEC=comp02
hasf "$H" 'youtube-facade' && pass "facade rendered" || fail "facade rendered"
bad=$(grep -rlE '<iframe|ytimg|youtube\.com/embed' "$B" --include='*.html' 2>/dev/null || true)
if [ -z "$bad" ]; then pass "no iframe/ytimg/youtube.com/embed in built HTML"; else fail "iframe/ytimg/embed in: $bad"; fi
hasf docs/src/components/YouTube/index.js 'youtube-nocookie.com/embed' && pass "nocookie embed in component" || fail "nocookie embed in component"
if grep -rq 'import YouTube' docs/docs; then fail "no import YouTube in docs"; else pass "no import YouTube in docs"; fi

SEC=comp03
for t in mnemonic label field class-name variable; do
  hasf "$H" "token $t" && pass "token $t" || fail "token $t"
done

SEC=comp04
count_is "$H" 'expandable-code--collapsed' eq 2 && pass "exactly 2 collapsed blocks" || fail "exactly 2 collapsed blocks"
# Docusaurus renders the copy button client-side only (BrowserOnly), so the
# static HTML cannot show it. Check the rendered blocks instead, and use
# "all lines are in the DOM" as the proxy for "copy copies everything".
count_is "$H" 'class="prism-code' ge 4 && pass "at least 4 rendered code blocks" || fail "at least 4 rendered code blocks"
hasf "$H" 'line41' && pass "collapsed block keeps all lines in DOM" || fail "collapsed block keeps all lines in DOM"

SEC=comp05
hasf "$H" 'tabs__item' && pass "tabs" || fail "tabs"
hasf "$H" 'DWC overview' && pass "doc card list" || fail "doc card list"
hasf "$H" 'table-container' && pass "table container" || fail "table container"
if js_has 'flowchart LR' || has "$H" 'docusaurus-mermaid-container\|class="[^"]*mermaid'; then pass "mermaid shipped"; else fail "mermaid shipped"; fi
js_has 'zooming' && pass "zooming in JS chunk" || fail "zooming in JS chunk"
hasf "$CFG" 'docusaurus-plugin-zooming' && pass "zoom plugin in config" || fail "zoom plugin in config"

SEC=comp06
IDX=$(ls "$B"/search-index*.json 2>/dev/null)
if [ -n "$IDX" ]; then pass "search index exists"; else fail "search index exists"; fi
if [ -n "$IDX" ] && python3 - $IDX <<'PY'
import sys
t="".join(open(f,encoding="utf-8").read() for f in sys.argv[1:])
sys.exit(0 if "being prepared" in t and "Components fixture" not in t and "authoring/components" not in t else 1)
PY
then pass "index finds stub text, omits fixture"; else fail "index finds stub text, omits fixture"; fi
if grep -qE '^[[:space:]]*//[[:space:]]*algolia' "$CFG" && ! grep -qE '^[[:space:]]*algolia[[:space:]]*:' "$CFG"; then pass "algolia only commented"; else fail "algolia only commented"; fi

SEC=unlisted
hasf "$H" 'noindex' && pass "fixture has noindex" || fail "fixture has noindex"
for f in "$B/sitemap.xml" "$B/llms.txt" "$B/llms-full.txt"; do
  if [ ! -f "$f" ]; then fail "missing $f"
  elif grep -q authoring "$f"; then fail "authoring absent from $f"
  else pass "authoring absent from $f"; fi
done

SEC=site05
I=$B/index.html
for p in 'img/basis-logo.svg' 'header-github-link' 'github.com/BasisHub/Courses' 'favicon.svg' 'favicon-32.png'; do
  hasf "$I" "$p" && pass "index has $p" || fail "index has $p"
done
if grep -qE 'og:image"[^>]*/Courses/img/social-cover\.png' "$I" || grep -qE 'content="[^"]*/Courses/img/social-cover\.png"[^>]*og:image' "$I"; then pass "og:image social cover"; else fail "og:image social cover"; fi
count_is "$I" 'All rights reserved.' eq 1 && pass "copyright once" || fail "copyright once"
hasf "$I" "$(date +%Y)" && pass "current year" || fail "current year"
file docs/static/img/favicon-32.png 2>/dev/null | grep -q '32 x 32' && pass "favicon 32x32" || fail "favicon 32x32"
file docs/static/img/social-cover.png 2>/dev/null | grep -q '1200 x 630' && pass "social cover 1200x630" || fail "social cover 1200x630"
if has docs/static/img/basis-logo.svg 'BCC9D2' && ! has docs/static/img/basis-logo.svg '26446B'; then pass "logo colors"; else fail "logo colors"; fi

SEC=hosts
if ! find "$B" -name '*.html' 2>/dev/null | grep -q .; then fail "built HTML present for host checks"
elif grep -rlE 'fonts\.googleapis|fonts\.gstatic|cdn\.webforj' "$B" --include='*.html' 2>/dev/null | grep -q .; then fail "no Google Fonts or CDN host"; else pass "no Google Fonts or CDN host"; fi
bad=$(grep -oE '<link [^>]*>' "$I" | grep 'href=' | grep -vE 'href="/Courses/|rel="(canonical|alternate)"' || true)
if [ -z "$bad" ]; then pass "link hrefs local or canonical/alternate"; else fail "non-local link hrefs: $bad"; fi

SEC=headers
for f in docs/src/theme/MDXComponents.js docs/src/components/DocsTools/ExpandableCode/index.js docs/src/components/DocsTools/TableWrapper/index.js docs/src/css/_alerts.scss docs/src/css/_navbar.scss; do
  head -3 "$f" 2>/dev/null | grep -q 'webforJ-MIT' && pass "MIT header $f" || fail "MIT header $f"
done

if [ "$FAILS" -gt 0 ]; then echo "Phase 3: $FAILS failure(s)"; exit 1; fi
echo "Phase 3: all checks passed"; exit 0
