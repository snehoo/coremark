#!/usr/bin/env python3
# add_gtag.py
# Run from your website root:
#   python3 add_gtag.py
# Adds Google Analytics tag immediately after <head> in all HTML files.
# Safe to run multiple times — skips files that already have the tag.

import os, glob

GTAG = """<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-B8K210VPRV"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-B8K210VPRV');
</script>"""

# Find all HTML files recursively (root + legal/)
html_files = glob.glob('**/*.html', recursive=True)

added = []
skipped = []

for path in sorted(html_files):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has this tag
    if 'G-B8K210VPRV' in content:
        skipped.append(path)
        continue

    # Insert immediately after <head>
    if '<head>' not in content:
        skipped.append(path + ' (no <head> tag)')
        continue

    content = content.replace('<head>', '<head>\n' + GTAG, 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    added.append(path)

print(f'\n✓ Added Google tag to {len(added)} files:')
for f in added:
    print(f'  {f}')

if skipped:
    print(f'\n— Skipped {len(skipped)} files:')
    for f in skipped:
        print(f'  {f}')
