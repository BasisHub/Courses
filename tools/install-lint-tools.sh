#!/usr/bin/env bash
# Installs pinned, checksum-verified Vale and actionlint into tools/.bin (gitignored).
# The expected SHA-256 of each archive is hard-coded in pinned_sha() (copied from the
# upstream *_checksums.txt when the version was pinned). The release's own checksums
# file is only a second check, so a replaced release asset does not pass.
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

# Pinned SHA-256 per archive. Update these together with the versions above.
pinned_sha() { # pinned_sha <archive>
  case "$1" in
    vale_3.24.0_macOS_arm64.tar.gz)        echo 87b513f26499f6657c15cf7175ba5b058a7c1ff2bb2d4e07265db2dd43451e44 ;;
    vale_3.24.0_macOS_64-bit.tar.gz)       echo eeb39e86f1daac27cc2a77fef3af1824d50559bdc22329fb25fb921c80c79472 ;;
    vale_3.24.0_Linux_64-bit.tar.gz)       echo 867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214 ;;
    vale_3.24.0_Linux_arm64.tar.gz)        echo 104cbd349279e50c4cb40adb70adf345d93cc4a3a0191f9e68bdccb97086b582 ;;
    actionlint_1.7.12_darwin_arm64.tar.gz) echo aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f ;;
    actionlint_1.7.12_darwin_amd64.tar.gz) echo 5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644 ;;
    actionlint_1.7.12_linux_amd64.tar.gz)  echo 8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8 ;;
    actionlint_1.7.12_linux_arm64.tar.gz)  echo 325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6 ;;
    *) echo "" ;;
  esac
}

sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

# One work directory for all downloads, removed on every exit (also when set -e aborts).
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

has_version() { # has_version <binary> <version>: exact version token, not a substring
  local re
  re="$(printf '%s' "$2" | sed 's/\./\\./g')"
  "$1" --version 2>/dev/null | head -1 | grep -Eq "(^|[^0-9.])${re}([^0-9.]|\$)"
}

install_tool() { # install_tool <tool> <version> <repo> <tag> <archive> <checksums-file>
  local tool="$1" version="$2" repo="$3" tag="$4" archive="$5" checksums="$6"
  if [ -x "$BIN/$tool" ] && has_version "$BIN/$tool" "$version"; then
    echo "$tool $version already installed"
    return 0
  fi
  local tmp base pinned expected actual
  pinned="$(pinned_sha "$archive")"
  if [ -z "$pinned" ]; then
    echo "No pinned SHA-256 for $archive; add it to pinned_sha() first." >&2
    exit 1
  fi
  tmp="$WORK/$tool"
  mkdir -p "$tmp"
  base="https://github.com/$repo/releases/download/$tag"
  echo "Downloading $archive"
  curl -fsSL -o "$tmp/$archive" "$base/$archive"
  curl -fsSL -o "$tmp/$checksums" "$base/$checksums"
  expected="$(awk -v f="$archive" '$2 == f {print $1}' "$tmp/$checksums")"
  actual="$(sha256 "$tmp/$archive")"
  if [ "$pinned" != "$actual" ] || [ "$expected" != "$actual" ]; then
    echo "Checksum mismatch for $archive (pinned '$pinned', release file '$expected', got '$actual'); aborting." >&2
    exit 1
  fi
  tar -xzf "$tmp/$archive" -C "$tmp" "$tool"
  mv "$tmp/$tool" "$BIN/$tool"
  chmod +x "$BIN/$tool"
  echo "Installed $tool $version (sha256 verified)"
}

install_tool vale "$VALE_VERSION" errata-ai/vale "v$VALE_VERSION" \
  "vale_${VALE_VERSION}_${VALE_ASSET}.tar.gz" "vale_${VALE_VERSION}_checksums.txt"
install_tool actionlint "$ACTIONLINT_VERSION" rhysd/actionlint "v$ACTIONLINT_VERSION" \
  "actionlint_${ACTIONLINT_VERSION}_${AL_ASSET}.tar.gz" "actionlint_${ACTIONLINT_VERSION}_checksums.txt"

echo "vale:       $("$BIN/vale" --version)"
echo "actionlint: $("$BIN/actionlint" --version | head -1)"
