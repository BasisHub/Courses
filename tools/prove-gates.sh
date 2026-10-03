#!/usr/bin/env bash
# Proves that each broken-link gate fails the build with its own message (SITE-06),
# then that a clean control build passes. Probe file is always removed.
set -u
cd "$(dirname "$0")/../docs" || exit 1

PROBE="docs/dwc/99-gate-probe.md"
trap 'rm -f "$PROBE"' EXIT
FAILS=0

probe() {
  local name="$1" body="$2" expected="$3" out code
  printf -- '---\ntitle: Gate probe\n---\n\n## Probe\n\n%s\n' "$body" > "$PROBE"
  out=$(npm run build 2>&1)
  code=$?
  rm -f "$PROBE"
  if [ "$code" -ne 0 ] && grep -qi -- "$expected" <<<"$out"; then
    echo "PASS  $name (exit $code)"
  else
    echo "FAIL  $name (exit $code, expected message: $expected)"
    FAILS=$((FAILS + 1))
  fi
}

probe "broken link fails build" '[x](/docs/does-not-exist)' 'found broken links'
probe "broken anchor fails build" '[x](./01-gui-to-bui-to-dwc/01-registering-launching.md#no-such-anchor)' 'found broken anchors'
probe "broken Markdown link fails build" '[x](./no-such-file.md)' 'onBrokenMarkdownLinks'
probe "broken Markdown image fails build" '![x](./img/no-such-image.png)' 'onBrokenMarkdownImages'

if npm run build >/dev/null 2>&1; then
  echo "PASS  control build is clean"
else
  echo "FAIL  control build is clean"
  FAILS=$((FAILS + 1))
fi

[ "$FAILS" -eq 0 ]
