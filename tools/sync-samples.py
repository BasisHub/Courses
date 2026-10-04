#!/usr/bin/env python3
"""Build reproducible sample ZIPs for the books.

Usage: python3 tools/sync-samples.py [--check] [book ...]

docs/examples/<book>/ is the only hand-edited copy of the samples. The ZIPs in
docs/static/files/<book>/ are generated from it:

  <folder>.zip         one top-level "<folder>/" with LICENSE, README.md and
                       the files of that sample folder
  <book>-samples.zip   one top-level "<book>-samples/" with LICENSE, README.md
                       and all sample folders

Entries are sorted, dated 1980-01-01 and carry mode 0644, so the same source
always yields the same bytes. Without --check the ZIPs are (re)written and
stale ZIPs are removed. With --check nothing is written; the exit code is 1
when a committed ZIP differs from the source.

Exit codes: 0 ok, 1 drift (--check), 2 usage or source errors.
"""
from __future__ import annotations

import io
import os
import re
import sys
import tempfile
import zipfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES = ROOT / "docs" / "examples"
STATIC = ROOT / "docs" / "static" / "files"
DATE = (1980, 1, 1, 0, 0, 0)
BOOK_FILES = ("LICENSE", "README.md")


def die(msg: str) -> None:
    print("error: " + msg, file=sys.stderr)
    sys.exit(2)


def safe_arcname(name: str) -> str:
    parts = name.split("/")
    if name.startswith("/") or ".." in parts or "" in parts:
        die("unsafe archive name: " + name)
    return name


def validate_book(book: str) -> None:
    """Book names are kebab-case slugs that stay inside docs/examples and docs/static/files."""
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", book):
        die("invalid book name: " + repr(book))
    for base in (EXAMPLES, STATIC):
        if (base / book).resolve().parent != base.resolve():
            die("book path escapes " + str(base.relative_to(ROOT)) + ": " + book)


def collect(folder: Path) -> dict[str, bytes]:
    """Map POSIX relative path -> bytes for every file below folder."""
    files: dict[str, bytes] = {}
    for dirpath, dirnames, filenames in os.walk(folder, followlinks=False):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for d in dirnames:
            if os.path.islink(os.path.join(dirpath, d)):
                die("symlink not allowed: " + os.path.join(dirpath, d))
        for f in sorted(filenames):
            if f.startswith("."):
                continue
            full = os.path.join(dirpath, f)
            if os.path.islink(full):
                die("symlink not allowed: " + full)
            rel = Path(full).relative_to(folder).as_posix()
            files[safe_arcname(rel)] = Path(full).read_bytes()
    return files


def build_zip(entries: dict[str, bytes]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for arc in sorted(entries):
            info = zipfile.ZipInfo(safe_arcname(arc), date_time=DATE)
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            zf.writestr(
                info,
                entries[arc],
                compress_type=zipfile.ZIP_DEFLATED,
                compresslevel=9,
            )
    return buf.getvalue()


def expected_zips(book: str) -> dict[str, bytes]:
    src = EXAMPLES / book
    if not src.is_dir():
        die("no such book folder: " + str(src))
    top = {}
    for name in BOOK_FILES:
        p = src / name
        if not p.is_file():
            die("missing " + name + " in " + str(src))
        top[name] = p.read_bytes()
    folders = sorted(
        d.name for d in src.iterdir() if d.is_dir() and not d.name.startswith(".")
    )
    for d in src.iterdir():
        if d.is_symlink():
            die("symlink not allowed: " + str(d))
    result: dict[str, bytes] = {}
    all_entries: dict[str, bytes] = {}
    prefix = book + "-samples"
    for name, data in top.items():
        all_entries[prefix + "/" + name] = data
    for folder in folders:
        files = collect(src / folder)
        entries = {folder + "/" + n: d for n, d in top.items()}
        for rel, data in files.items():
            entries[folder + "/" + rel] = data
            all_entries[prefix + "/" + folder + "/" + rel] = data
        result[folder + ".zip"] = build_zip(entries)
    result[prefix + ".zip"] = build_zip(all_entries)
    return result


def manifest(data: bytes | Path) -> list[tuple]:
    src = io.BytesIO(data) if isinstance(data, bytes) else data
    with zipfile.ZipFile(src) as zf:
        return [
            (i.filename, i.file_size, i.CRC, i.date_time, i.external_attr, i.compress_type)
            for i in zf.infolist()
        ]


def payload_error(target: Path) -> str | None:
    """Decompress every entry and verify its CRC; return a reason on failure."""
    try:
        with zipfile.ZipFile(target) as zf:
            bad = zf.testzip()
    except (zipfile.BadZipFile, zlib.error, OSError, EOFError, ValueError) as e:  # truncated or malformed data
        return "unreadable payload (" + str(e) + ")"
    return None if bad is None else "corrupt entry " + bad


def sync(book: str) -> None:
    out = STATIC / book
    out.mkdir(parents=True, exist_ok=True)
    want = expected_zips(book)
    for name, data in want.items():
        target = out / name
        if target.is_file() and target.read_bytes() == data:
            print("unchanged " + str(target.relative_to(ROOT)))
            continue
        fd, tmp = tempfile.mkstemp(dir=out, suffix=".tmp")
        try:
            with os.fdopen(fd, "wb") as fh:
                fh.write(data)
            os.chmod(tmp, 0o644)  # mkstemp creates 0600; served files must be world-readable
            os.replace(tmp, target)
        except BaseException:
            try:
                os.unlink(tmp)
            except FileNotFoundError:
                pass
            raise
        print("wrote " + str(target.relative_to(ROOT)))
    for stale in sorted(out.glob("*.zip")):
        if stale.name not in want:
            stale.unlink()
            print("removed " + str(stale.relative_to(ROOT)))


def check(book: str) -> bool:
    out = STATIC / book
    want = expected_zips(book)
    ok = True
    for name, data in want.items():
        target = out / name
        label = str(target.relative_to(ROOT))
        if not target.is_file():
            print("FAIL  " + label + ": missing")
            ok = False
            continue
        have_m, want_m = manifest(target), manifest(data)
        if have_m != want_m:
            reason = "entry count %d != %d" % (len(have_m), len(want_m))
            for h, w in zip(have_m, want_m):
                if h != w:
                    reason = "first difference: %s vs %s" % (h[0], w[0])
                    break
            print("FAIL  " + label + ": " + reason)
            ok = False
            continue
        err = payload_error(target)
        if err is not None:
            print("FAIL  " + label + ": " + err)
            ok = False
            continue
        print("PASS  " + label)
        if target.read_bytes() != data:
            print("INFO  " + label + ": bytes differ, manifest equal")
    if out.is_dir():
        for extra in sorted(out.glob("*.zip")):
            if extra.name not in want:
                print("FAIL  " + str(extra.relative_to(ROOT)) + ": unexpected ZIP")
                ok = False
    return ok


def main(argv: list[str]) -> int:
    args = list(argv)
    do_check = "--check" in args
    args = [a for a in args if a != "--check"]
    if any(a.startswith("-") for a in args):
        print(__doc__)
        return 2
    books = args or sorted(
        d.name for d in EXAMPLES.iterdir() if d.is_dir() and not d.name.startswith(".")
    )
    for book in books:
        validate_book(book)
    ok = True
    for book in books:
        if do_check:
            ok = check(book) and ok
        else:
            sync(book)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
