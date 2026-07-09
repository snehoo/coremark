#!/usr/bin/env python3
"""
fix_meta_pixel.py — CoreMark Meta Pixel injection

1. Adds Meta Pixel base code to every HTML page missing it
2. Adds fbq('track','Purchase') event on delivery.html after showSuccess()

Run from the Website/ directory:
  python3 fix_meta_pixel.py
  python3 fix_meta_pixel.py --dry-run
"""

import os
import re
import sys
import glob

DRY_RUN = "--dry-run" in sys.argv
SITE_ROOT = os.path.dirname(os.path.abspath(__file__))
PIXEL_ID = "1921557135206596"

PIXEL_SENTINEL = "COREMARK-PIXEL-START"

PIXEL_SNIPPET = (
    f"<!-- COREMARK-PIXEL-START -->\n"
    f"<script>\n"
    f"!function(f,b,e,v,n,t,s)\n"
    f"{{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?\n"
    f"n.callMethod.apply(n,arguments):n.queue.push(arguments)}};\n"
    f"if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n"
    f"n.queue=[];t=b.createElement(e);t.async=!0;\n"
    f"t.src=v;s=b.getElementsByTagName(e)[0];\n"
    f"s.parentNode.insertBefore(t,s)}}(window,document,'script',\n"
    f"'https://connect.facebook.net/en_US/fbevents.js');\n"
    f"fbq('init', '{PIXEL_ID}');\n"
    f"fbq('track', 'PageView');\n"
    f"</script>\n"
    f'<noscript><img height="1" width="1" style="display:none"\n'
    f'src="https://www.facebook.com/tr?id={PIXEL_ID}&ev=PageView&noscript=1"/></noscript>\n'
    f"<!-- COREMARK-PIXEL-END -->\n"
)

# Purchase event — injected into delivery.html after showSuccess()
# Uses same priceMap as the GA4 fix
PURCHASE_EVENT_JS = """
    // ── Meta Pixel purchase event ─────────────────────────
    (function() {
      var priceMap = { single: 249, fivepack: 799, subject: 1299, stage: 1299 };
      var orderValue = priceMap[data.orderType] || 249;
      if (typeof fbq === 'function') {
        fbq('track', 'Purchase', {
          value:        orderValue,
          currency:     'INR',
          content_ids:  [data.orderType === 'single' ? (slug || data.orderType) : data.orderType],
          content_type: 'product',
          content_name: data.orderTitle || title,
          order_id:     data.orderId || orderId,
        });
      }
    })();
    // ── /Meta Pixel purchase event ────────────────────────"""

PURCHASE_SENTINEL = "Meta Pixel purchase event"

SKIP = {
    "coremark-admin.html",
    "index-old.html",
}


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

def write(path, content):
    if DRY_RUN:
        print(f"  [dry-run] would write {os.path.relpath(path, SITE_ROOT)}")
        return
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def has_pixel(content):
    return PIXEL_SENTINEL in content or "fbq('init'" in content

def inject_pixel(content, path):
    if has_pixel(content):
        return content, False
    # Insert just before </head>
    new = content.replace("</head>", PIXEL_SNIPPET + "</head>", 1)
    if new == content:
        print(f"  WARNING: no </head> in {os.path.relpath(path, SITE_ROOT)}")
        return content, False
    return new, True

def collect_html_files():
    files = []
    for pattern in ["*.html", "blog/*.html", "legal/*.html"]:
        for p in glob.glob(os.path.join(SITE_ROOT, pattern)):
            rel = os.path.relpath(p, SITE_ROOT)
            if rel not in SKIP:
                files.append(p)
    return sorted(set(files))


print("=" * 60)
print(f"CoreMark Meta Pixel fix {'(DRY RUN)' if DRY_RUN else ''}")
print(f"Pixel ID: {PIXEL_ID}")
print("=" * 60)

print("\n── Step 1: Add Pixel base code to all pages ──\n")
added, already = [], []
for path in collect_html_files():
    content = read(path)
    new_content, changed = inject_pixel(content, path)
    rel = os.path.relpath(path, SITE_ROOT)
    if changed:
        write(path, new_content)
        print(f"  ✓ added  → {rel}")
        added.append(rel)
    else:
        print(f"  · skip   → {rel} (already has Pixel)")
        already.append(rel)

print(f"\n  Summary: {len(added)} pages updated, {len(already)} already had Pixel.\n")

print("── Step 2: Add Purchase event to delivery.html ──\n")
delivery_path = os.path.join(SITE_ROOT, "delivery.html")
content = read(delivery_path)

if PURCHASE_SENTINEL in content:
    print("  · skip   → purchase event already present in delivery.html\n")
else:
    # Insert after the GA4 purchase event block (which follows showSuccess())
    # Match the closing sentinel of the GA4 block and append after it
    pattern = r'(// ── /GA4 purchase event ───────────────────────────────)'
    replacement = r'\1' + PURCHASE_EVENT_JS
    new_content, n = re.subn(pattern, replacement, content, count=1)
    if n == 0:
        # Fallback: insert after showSuccess(); directly
        pattern = r'([ \t]*showSuccess\(\);)'
        replacement = r'\1' + PURCHASE_EVENT_JS
        new_content, n = re.subn(pattern, replacement, content, count=1)
    if n == 0:
        print("  ERROR: could not find insertion point in delivery.html")
    else:
        write(delivery_path, new_content)
        print("  ✓ Meta Purchase event injected into delivery.html\n")

print("=" * 60)
if DRY_RUN:
    print("Dry run complete. Re-run without --dry-run to apply.")
else:
    print("Done. Commit and deploy to Cloudflare Pages.")
    print("\nVerify in Meta Events Manager:")
    print("  Test Events tab → open coremark.study → confirm PageView fires.")
    print("  Complete a test purchase → confirm Purchase event fires.")
print("=" * 60)
