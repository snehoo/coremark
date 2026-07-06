#!/usr/bin/env python3
"""
fix_aeo_schema.py — invisible AEO schema fixes for CoreMark blog pages.

Fixes applied (all in <head>, no visible content changes):
  1. Deduplicate "dateModified" key — keep the first (newer) value
  2. Change @type "Article" → "BlogPosting"
  3. Add "@id" to Article/BlogPosting schema (from canonical URL)
  4. Replace inline publisher object → {"@id": "https://coremark.study/#organization"}
  5. Add sameAs to author Person schema (LinkedIn)
  6. Sync article:modified_time OG meta tag with dateModified value

Run from the repo root:
    python3 fix_aeo_schema.py

Safe to re-run (idempotent).
"""

import glob
import json
import os
import re
import sys
from copy import deepcopy

AUTHOR_LINKEDIN = "https://www.linkedin.com/in/snehalpateldev/"
ORG_ID = "https://coremark.study/#organization"
BLOG_DIR = os.path.join(os.path.dirname(__file__), "blog")

def extract_canonical(html: str):
    m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', html)
    return m.group(1) if m else None

def fix_json_ld(raw: str, canonical: str):
    """Parse and fix a JSON-LD block. Returns (fixed_json_str, list_of_changes)."""
    changes = []

    # Deduplicate keys by parsing line-by-line before json.loads, which silently
    # takes the LAST value for duplicate keys in CPython (undefined behaviour in spec).
    # We want the FIRST value instead (the newer date inserted by the template).
    seen = {}
    ordered_pairs = []

    def object_pairs_hook(pairs):
        result = {}
        for k, v in pairs:
            if k not in result:
                result[k] = v
        return result

    try:
        data = json.loads(raw, object_pairs_hook=object_pairs_hook)
    except json.JSONDecodeError as e:
        return raw, [f"  ⚠️  JSON parse error — skipped: {e}"]

    schema_type = data.get("@type", "")

    # Fix 1: Article → BlogPosting
    if schema_type == "Article":
        data["@type"] = "BlogPosting"
        changes.append("  ✅ @type: Article → BlogPosting")

    if schema_type in ("Article", "BlogPosting"):
        # Fix 2: Add @id if missing
        if "@id" not in data and canonical:
            slug = canonical.rstrip("/").split("/")[-1]
            data["@id"] = canonical.rstrip("/") + "/#article"
            changes.append(f"  ✅ Added @id: {data['@id']}")

        # Fix 3: Publisher → @id reference
        publisher = data.get("publisher", {})
        if isinstance(publisher, dict) and publisher.get("@type") == "Organization":
            data["publisher"] = {"@id": ORG_ID}
            changes.append(f"  ✅ Publisher → @id reference ({ORG_ID})")

        # Fix 4: Add sameAs to author Person
        author = data.get("author", {})
        if isinstance(author, dict) and author.get("@type") == "Person":
            if "sameAs" not in author:
                author["sameAs"] = [AUTHOR_LINKEDIN]
                data["author"] = author
                changes.append(f"  ✅ Author sameAs added: {AUTHOR_LINKEDIN}")
            elif AUTHOR_LINKEDIN not in author["sameAs"]:
                author["sameAs"].append(AUTHOR_LINKEDIN)
                data["author"] = author
                changes.append(f"  ✅ Author sameAs updated: added LinkedIn")

    return json.dumps(data, indent=2, ensure_ascii=False), changes

def fix_html(path: str):
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    all_changes = []
    canonical = extract_canonical(html)

    # --- Fix JSON-LD blocks ---
    ld_pattern = re.compile(
        r'(<script\s+type="application/ld\+json">)(.*?)(</script>)',
        re.DOTALL
    )

    def replace_ld(m):
        open_tag, raw_json, close_tag = m.group(1), m.group(2), m.group(3)
        fixed_json, changes = fix_json_ld(raw_json, canonical)
        if changes:
            all_changes.extend(changes)
        return open_tag + "\n" + fixed_json + "\n" + close_tag

    new_html = ld_pattern.sub(replace_ld, html)

    # --- Fix 5: Sync article:modified_time OG tag ---
    # Extract dateModified from fixed HTML's first BlogPosting/Article block
    date_modified = None
    for raw_json in ld_pattern.findall(new_html):
        # findall returns tuples of groups; raw_json is group(2)
        pass

    # Re-search after replacements
    modified_from_schema = None
    for m in ld_pattern.finditer(new_html):
        raw = m.group(2)
        try:
            data = json.loads(raw, object_pairs_hook=lambda pairs: {k: v for k, v in pairs})
            if data.get("@type") in ("Article", "BlogPosting") and "dateModified" in data:
                modified_from_schema = data["dateModified"]
                break
        except Exception:
            continue

    if modified_from_schema:
        og_pattern = re.compile(
            r'(<meta\s+property="article:modified_time"\s+content=")([^"]+)(")'
        )
        og_m = og_pattern.search(new_html)
        if og_m and og_m.group(2) != modified_from_schema:
            old_val = og_m.group(2)
            new_html = og_pattern.sub(
                r'\g<1>' + modified_from_schema + r'\g<3>',
                new_html,
                count=1
            )
            all_changes.append(
                f"  ✅ article:modified_time: {old_val} → {modified_from_schema}"
            )

    if new_html != html:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_html)

    return all_changes

def main():
    html_files = sorted(glob.glob(os.path.join(BLOG_DIR, "*.html")))
    # Exclude template and index
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
