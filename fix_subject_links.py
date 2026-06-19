#!/usr/bin/env python3
"""
fix_subject_links.py
---------------------
CoreMark's site serves math.html, science.html and computing.html directly
from the root (no /subjects/ folder exists). Some generated blog pages
reference them as /subjects/math.html, /subjects/science.html and
/subjects/computing.html — this script finds and corrects every instance,
including anchored links like /subjects/math.html#stage8.

Usage:
    python3 fix_subject_links.py /path/to/website
    python3 fix_subject_links.py .                  # run from inside the repo

Safe to re-run — if there's nothing to fix, it just reports 0 changes.
"""

import argparse
import sys
from pathlib import Path

REPLACEMENTS = [
    ("/subjects/math.html", "/math.html"),
    ("/subjects/science.html", "/science.html"),
    ("/subjects/computing.html", "/computing.html"),
    # Also catch relative (non-leading-slash) variants, just in case
    ("subjects/math.html", "math.html"),
    ("subjects/science.html", "science.html"),
    ("subjects/computing.html", "computing.html"),
]

def fix_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    original = text
    count = 0
    for old, new in REPLACEMENTS:
        n = text.count(old)
        if n:
            text = text.replace(old, new)
            count += n
    if text != original:
        path.write_text(text, encoding="utf-8")
    return count

def main():
    parser = argparse.ArgumentParser(description="Fix /subjects/ path references in HTML files.")
    parser.add_argument("target", help="Directory to scan recursively for .html files")
    parser.add_argument("--ext", default=".html", help="File extension to target (default: .html)")
    args = parser.parse_args()

    target_dir = Path(args.target)
    if not target_dir.exists():
        print(f"Target directory not found: {target_dir}")
        sys.exit(1)

    html_files = sorted(target_dir.rglob(f"*{args.ext}"))
    if not html_files:
        print(f"No {args.ext} files found under {target_dir}")
        sys.exit(0)

    total_changes = 0
    files_changed = 0
    print(f"Scanning {len(html_files)} file(s)...\n")
    for f in html_files:
        n = fix_file(f)
        if n:
            files_changed += 1
            total_changes += n
            print(f"  {f.relative_to(target_dir)} -> fixed {n} reference(s)")

    print(f"\nDone. {files_changed} file(s) updated, {total_changes} reference(s) fixed.")
    if total_changes == 0:
        print("Nothing to fix — all subject links already point to the correct root paths.")

if __name__ == "__main__":
    main()
