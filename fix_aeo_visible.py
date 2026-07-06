#!/usr/bin/env python3
"""
fix_aeo_visible.py — visible AEO content fixes for CoreMark blog pages.

Changes applied:
  1. "Updated [old date]" span → "Updated July 5, 2026"
  2. "Fact-checked and last updated [old date]" → July 5, 2026
  3. Author name in author box → wrapped in LinkedIn link

Run from the repo root:
    python3 fix_aeo_visible.py
"""

import glob
import os
import re

BLOG_DIR = os.path.join(os.path.dirname(__file__), "blog")
LINKEDIN_URL = "https://www.linkedin.com/in/snehalpateldev/"
NEW_DATE = "July 5, 2026"

# Matches visible date spans like "Updated June 18, 2026" or "Updated [Month DD, YYYY]"
UPDATED_SPAN_RE = re.compile(
    r'(<span>Updated )([^<]+)(</span>)'
)

# Matches sources-box footer line
FACTCHECKED_RE = re.compile(
    r'(Fact-checked and last updated )([^<]+?)( by Snehal Patel\.)'
)

# Matches the author name paragraph (not already wrapped in a link)
AUTHOR_NAME_RE = re.compile(
    r'(<p class="author-name">)(Snehal Patel)(</p>)'
)

AUTHOR_NAME_LINKED = (
    r'\g<1>'
    f'<a href="{LINKEDIN_URL}" target="_blank" rel="noopener" '
    r'style="color:inherit;text-decoration:none;">Snehal Patel</a>'
    r'\g<3>'
)


def fix_html(path: str):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    changes = []
    new_html = html

    # Fix 1: visible "Updated" span
    def replace_updated(m):
        old = m.group(2).strip()
        if old != NEW_DATE:
            changes.append(f"  ✅ Updated span: '{old}' → '{NEW_DATE}'")
            return m.group(1) + NEW_DATE + m.group(3)
        return m.group(0)

    new_html = UPDATED_SPAN_RE.sub(replace_updated, new_html)

    # Fix 2: Fact-checked footer line
    def replace_factchecked(m):
        old = m.group(2).strip()
        if old != NEW_DATE:
            changes.append(f"  ✅ Fact-checked date: '{old}' → '{NEW_DATE}'")
            return m.group(1) + NEW_DATE + m.group(3)
        return m.group(0)

    new_html = FACTCHECKED_RE.sub(replace_factchecked, new_html)

    # Fix 3: Author name → LinkedIn link (skip if already linked)
    if LINKEDIN_URL not in new_html or '<p class="author-name">Snehal Patel</p>' in new_html:
        result = AUTHOR_NAME_RE.sub(AUTHOR_NAME_LINKED, new_html)
        if result != new_html:
            changes.append(f"  ✅ Author name → LinkedIn link")
            new_html = result

    if new_html != html:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_html)

    return changes


def main():
    html_files = sorted(glob.glob(os.path.join(BLOG_DIR, "*.html")))
    skip = {"coremark-blog-template.html", "index.html"}
    html_files = [f for f in html_files if os.path.basename(f) not in skip]

    total_changed = 0
    for path in html_files:
        name = os.path.basename(path)
        changes = fix_html(path)
        if changes:
            print(f"\n📄 {name}")
            for c in changes:
                print(c)
            total_changed += 1
        else:
            print(f"  — {name}: no changes needed")

    print(f"\n{'='*60}")
    print(f"Done. {total_changed}/{len(html_files)} files updated.")


if __name__ == "__main__":
    main()
