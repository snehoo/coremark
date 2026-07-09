#!/usr/bin/env python3
"""
fix_gads.py — Add Google Ads conversion tag (AW-17160905849) to all pages.
Run from Website/ directory:
  python3 fix_gads.py
  python3 fix_gads.py --dry-run
"""

import os, sys, glob

DRY_RUN = "--dry-run" in sys.argv
SITE_ROOT = os.path.dirname(os.path.abspath(__file__))
AW_ID = "AW-17160905849"
SENTINEL = "COREMARK-GADS-START"

SNIPPET = (
    f"<!-- COREMARK-GADS-START -->\n"
    f'<script async src="https://www.googletagmanager.com/gtag/js?id={AW_ID}"></script>\n'
    f"<script>\n"
    f"  window.dataLayer = window.dataLayer || [];\n"
    f"  function gtag(){{dataLayer.push(arguments);}}\n"
    f"  gtag('js', new Date());\n"
    f"  gtag('config', '{AW_ID}');\n"
    f"</script>\n"
    f"<!-- COREMARK-GADS-END -->\n"
)

SKIP = {"coremark-admin.html", "index-old.html"}

def read(p): return open(p, encoding="utf-8").read()
def write(p, c):
    if DRY_RUN: print(f"  [dry-run] {os.path.relpath(p, SITE_ROOT)}"); return
    open(p, "w", encoding="utf-8").write(c)

def collect():
    files = []
    for pat in ["*.html", "blog/*.html", "legal/*.html"]:
        for p in glob.glob(os.path.join(SITE_ROOT, pat)):
            if os.path.relpath(p, SITE_ROOT) not in SKIP:
                files.append(p)
    return sorted(set(files))

print(f"Google Ads tag fix {'(DRY RUN)' if DRY_RUN else ''}\n")
added = 0
for path in collect():
    content = read(path)
    if SENTINEL in content:
        print(f"  · skip   {os.path.relpath(path, SITE_ROOT)}")
        continue
    new = content.replace("</head>", SNIPPET + "</head>", 1)
    if new == content:
        print(f"  WARNING  no </head> in {os.path.relpath(path, SITE_ROOT)}")
        continue
    write(path, new)
    print(f"  ✓ added  {os.path.relpath(path, SITE_ROOT)}")
    added += 1

print(f"\nDone — {added} pages updated.")
