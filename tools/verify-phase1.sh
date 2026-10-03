#!/usr/bin/env bash
# Phase 1 acceptance suite. Usage: bash tools/verify-phase1.sh [--with-ci]
# Prints one PASS/FAIL/SKIP line per check; exits non-zero if any check failed.
# The build always prints a benign postcss-calc warning, so warnings are never asserted.
set -u
cd "$(dirname "$0")/.." || exit 1
ROOT="$(pwd)"
PORT=3111
BASE="http://localhost:$PORT"
BUILD="docs/build"
FAILS=0
SERVER_PID=""

pass() { echo "PASS  $1"; }
fail() { echo "FAIL  $1"; FAILS=$((FAILS + 1)); }
skip() { echo "SKIP  $1"; }
check() { # check <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass "$name"; else fail "$name"; fi
}

kill_tree() { # kill_tree <pid>: stop a process and all of its descendants
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill "$1" 2>/dev/null
  return 0
}

stop_server() {
  # npm spawns child processes (sh, node); stop only the tree we started,
  # never an unrelated process that happens to listen on $PORT.
  if [ -n "$SERVER_PID" ]; then
    kill_tree "$SERVER_PID"
    wait "$SERVER_PID" 2>/dev/null
    SERVER_PID=""
  fi
  return 0
}
trap stop_server EXIT

if [ "${1:-}" = "--with-ci" ]; then
  rm -rf docs/node_modules
  if (cd docs && npm ci >/dev/null 2>&1); then pass "npm ci from lockfile"; else fail "npm ci from lockfile"; fi
fi

# 1. Build
if (cd docs && npm run build >/dev/null 2>&1); then pass "build exits 0"; else fail "build exits 0"; fi

# 2. Static structure
INDEX="$BUILD/index.html"
# Only look at the landing cards (class book-card); the navbar links share the same hrefs.
order=$(grep -oE '<a [^>]*>' "$INDEX" 2>/dev/null | grep -E 'class="[^"]*book-card[^"]*"' \
  | grep -oE 'href="/Courses/docs/[a-z-]*/overview"' | head -2 | tr '\n' ' ')
if [ "$order" = 'href="/Courses/docs/intro-bbj/overview" href="/Courses/docs/dwc/overview" ' ]; then
  pass "landing: intro-bbj card before dwc card"
else
  fail "landing: intro-bbj card before dwc card (got: $order)"
fi
for b in intro-bbj dwc; do
  check "$b overview exists with sidebar" grep -q 'theme-doc-sidebar-container' "$BUILD/docs/$b/overview.html"
done
n=$(grep -o 'navbar-book' "$INDEX" 2>/dev/null | wc -l | tr -d ' ')
if [ "${n:-0}" -ge 2 ]; then pass "navbar has book items ($n)"; else fail "navbar has book items ($n)"; fi
check "dwc sidebar lists own chapter" grep -q '/Courses/docs/dwc/gui-to-bui-to-dwc' "$BUILD/docs/dwc/overview.html"
check "dwc sidebar omits intro-bbj chapter" bash -c "test -f '$BUILD/docs/dwc/overview.html' && ! grep -q '/Courses/docs/intro-bbj/getting-started' '$BUILD/docs/dwc/overview.html'"
check "intro-bbj sidebar lists own chapter" grep -q '/Courses/docs/intro-bbj/getting-started' "$BUILD/docs/intro-bbj/overview.html"
check "intro-bbj sidebar omits dwc chapter" bash -c "test -f '$BUILD/docs/intro-bbj/overview.html' && ! grep -q '/Courses/docs/dwc/gui-to-bui-to-dwc''$BUILD/docs/intro-bbj/overview.html'"

# 3. Served smoke
up=0
if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  # Another process owns the port; probing it would test the wrong server.
  fail "port $PORT already in use by another process"
else
  (cd docs && exec npm run serve -- --port "$PORT" --no-open >/dev/null 2>&1) &
  SERVER_PID=$!
  for _ in $(seq 1 30); do
    # Stop waiting if our server died (for example, it failed to bind).
    kill -0 "$SERVER_PID" 2>/dev/null || break
    if curl -fsS -o /dev/null "$BASE/Courses/" 2>/dev/null; then up=1; break; fi
    sleep 1
  done
fi
if [ "$up" -eq 1 ]; then
  pass "server up on port $PORT"
  for p in /Courses/ /Courses/docs/intro-bbj/overview /Courses/docs/dwc/overview \
           /Courses/docs/dwc/gui-to-bui-to-dwc/registering-launching /Courses/js/dwc-theme-switcher.js \
           /Courses/js/link-decorator.js /Courses/css/dwc-ui.css; do
    code=$(curl -fsS -o /dev/null -w '%{http_code}' "$BASE$p" 2>/dev/null)
    if [ "$code" = "200" ]; then pass "GET $p 200"; else fail "GET $p ($code)"; fi
  done
else
  fail "server up on port $PORT"
fi
c=$(grep -c '/Courses/js/dwc-theme-switcher.js' "$INDEX" 2>/dev/null)
if [ "${c:-0}" = "1" ]; then pass "theme switcher referenced once in index.html"; else fail "theme switcher referenced once in index.html ($c)"; fi

# 4. Self-hosted assets
# Only the D-10 provenance comment on line 1 of css/dwc-ui.css may name the CDN host.
if grep -rnE 'fonts\.googleapis|fonts\.gstatic|cdn\.webforj' "$BUILD" 2>/dev/null | grep -vE '^[^:]*/css/dwc-ui\.css:1:/\* Snapshot of ' | grep -q .; then
  fail "no external font/CDN hosts in build"
else
  pass "no external font/CDN hosts in build"
fi
bad=$(grep -oE '<link [^>]*>' "$INDEX" | grep 'href=' | grep -vE 'href="/Courses/|rel="(canonical|alternate)"' || true)
if [ -z "$bad" ]; then pass "all <link> hrefs local or canonical/alternate"; else fail "non-local <link> hrefs: $bad"; fi
ls "$BUILD"/assets/fonts/inter-latin-wght-normal-*.woff2 >/dev/null 2>&1 && pass "Inter font emitted" || fail "Inter font emitted"
ls "$BUILD"/assets/fonts/jetbrains-mono-latin-wght-normal-*.woff2 >/dev/null 2>&1 && pass "JetBrains Mono font emitted" || fail "JetBrains Mono font emitted"
css=$(ls "$BUILD"/assets/css/styles.*.css 2>/dev/null | head -1)
if [ -n "$css" ] && grep -q 'url(/Courses/assets/fonts/' "$css" && grep -q 'Inter Variable' "$css"; then
  pass "CSS references self-hosted fonts"
else
  fail "CSS references self-hosted fonts"
fi

# 5. Sitemap and llms
S="$BUILD/sitemap.xml"
U="https://basishub.github.io/Courses"
if grep -q "<loc>$U/</loc>" "$S" 2>/dev/null && grep -q "$U/docs/intro-bbj/" "$S" && grep -q "$U/docs/dwc/" "$S"; then
  pass "sitemap.xml lists root and both books"
else
  fail "sitemap.xml lists root and both books"
fi
if grep -q "$U/docs/intro-bbj/" "$BUILD/llms.txt" 2>/dev/null && grep -q "$U/docs/dwc/" "$BUILD/llms.txt"; then
  pass "llms.txt lists both books"
else
  fail "llms.txt lists both books"
fi
check "llms-full.txt non-empty" test -s "$BUILD/llms-full.txt"

# 6. Print
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PDFTOTEXT="$(command -v pdftotext || echo /opt/homebrew/bin/pdftotext)"
if [ -x "$CHROME" ] && [ -x "$PDFTOTEXT" ] && [ "$up" -eq 1 ]; then
  # mktemp -d with explicit X's works on BSD and GNU; remove the whole dir afterwards.
  pdfdir="$(mktemp -d "${TMPDIR:-/tmp}/verify-phase1.XXXXXX")"
  pdf="$pdfdir/out.pdf"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$pdf" \
    "$BASE/Courses/docs/dwc/gui-to-bui-to-dwc/registering-launching" >/dev/null 2>&1
  txt=$("$PDFTOTEXT" "$pdf" - 2>/dev/null)
  if grep -q 'Registering Apps for the Web' <<<"$txt" && ! grep -qE 'BBj Basics|On this page|Edit this page' <<<"$txt"; then
    pass "print output has content and no chrome"
  else
    fail "print output has content and no chrome"
  fi
  rm -rf "$pdfdir"
else
  skip "print check (Chrome/pdftotext not found or server down)"
fi

# 7. Import hygiene
check "import/*.mbz is git-ignored" git check-ignore -q import/anything.mbz
if [ -z "$(git ls-files import)" ]; then pass "no tracked files under import/"; else fail "no tracked files under import/"; fi

# 8. Pins
if (cd docs && node -e '
  const p=require("./package.json");
  const all={...p.dependencies,...p.devDependencies};
  const d=Object.entries(all).filter(([k])=>k.startsWith("@docusaurus/"));
  process.exit(d.length===6&&d.every(([,v])=>v==="3.10.2")?0:1);
'); then pass "six @docusaurus/* packages pinned to 3.10.2"; else fail "six @docusaurus/* packages pinned to 3.10.2"; fi
check "lockfile and requirements tracked" git ls-files --error-unmatch docs/package-lock.json tools/requirements.txt
if [ "$(grep -cE '^(beautifulsoup4|lxml|markdownify)==' tools/requirements.txt 2>/dev/null)" = "3" ]; then
  pass "tools/requirements.txt pins 3 converter libs"
else
  fail "tools/requirements.txt pins 3 converter libs"
fi

# 9. Gates (rebuilds, so stop the server first)
stop_server
if bash tools/prove-gates.sh; then pass "prove-gates.sh (SITE-06)"; else fail "prove-gates.sh (SITE-06)"; fi

echo
if [ "$FAILS" -eq 0 ]; then echo "ALL CHECKS PASSED"; else echo "$FAILS CHECK(S) FAILED"; fi
[ "$FAILS" -eq 0 ]
