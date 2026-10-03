#!/usr/bin/env bash
# Installs pinned, checksum-verified Vale and actionlint into tools/.bin (gitignored).
# Usage: bash tools/install-lint-tools.sh
set -euo pipefail
cd "$(dirname "$0")/.."

VALE_VERSION=3.24.0
ACTIONLINT_VERSION=1.7.12
BIN=tools/.bin
mkdir -p "$BIN"

OS="$(uname -s)"
ARCH="$(uname -m)"
case "$OS/$ARCH" in
  Darwin/arm64)  VALE_ASSET="macOS_arm64";    AL_ASSET="darwin_arm64" ;;
  Darwin/x86_64) VALE_ASSET="macOS_64-bit";   AL_ASSET="darwin_amd64" ;;
  Linux/x86_64)  VALE_ASSET="Linux_64-bit";   AL_ASSET="linux_amd64" ;;
  Linux/aarch64|Linux/arm64) VALE_ASSET="Linux_arm64"; AL_ASSET="linux_arm64" ;;
  *) echo "Unsupported platform: $OS/$ARCH" >&2; exit 1 ;;
esac

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

install_tool() { # install_tool <tool> <version> <repo> <tag> <archive> <checksums-file>
  local tool="$1" version="$2" repo="$3" tag="$4" archive="$5" checksums="$6"
  if [ -x "$BIN/$tool" ] && "$BIN/$tool" --version 2>/dev/null | grep -q "$version"; then
    echo "$tool $version already installed"
    return 0
  fi
  local tmp base expected actual
  tmp="$(mktemp -d)"
  base="https://github.com/$repo/releases/download/$tag"
  echo "Downloading $archive"
  curl -fsSL -o "$tmp/$archive" "$base/$archive"
  curl -fsSL -o "$tmp/$checksums" "$base/$checksums"
  expected="$(awk -v f="$archive" '$2 == f {print $1}' "$tmp/$checksums")"
  actual="$(sha256 "$tmp/$archive")"
  if [ -z "$expected" ] || [ "$expected" != "$actual" ]; then
    echo "Checksum mismatch for $archive (expected '$expected', got '$actual'); aborting." >&2
    rm -rf "$tmp"
    exit 1
  fi
  tar -xzf "$tmp/$archive" -C "$tmp" "$tool"
  mv "$tmp/$tool" "$BIN/$tool"
  chmod +x "$BIN/$tool"
  rm -rf "$tmp"
  echo "Installed $tool $version (sha256 verified)"
}

install_tool vale "$VALE_VERSION" errata-ai/vale "v$VALE_VERSION" \
  "vale_${VALE_VERSION}_${VALE_ASSET}.tar.gz" "vale_${VALE_VERSION}_checksums.txt"
install_tool actionlint "$ACTIONLINT_VERSION" rhysd/actionlint "v$ACTIONLINT_VERSION" \
  "actionlint_${ACTIONLINT_VERSION}_${AL_ASSET}.tar.gz" "actionlint_${ACTIONLINT_VERSION}_checksums.txt"

echo "vale:       $("$BIN/vale" --version)"
echo "actionlint: $("$BIN/actionlint" --version | head -1)"
