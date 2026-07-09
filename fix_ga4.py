#!/usr/bin/env python3
"""
fix_ga4.py — CoreMark GA4 instrumentation fix

1. Adds GA4 snippet to every HTML page that's missing it
2. Adds GA4 purchase event to delivery.html after showSuccess()

Run from the Website/ directory:
  python3 fix_ga4.py
  python3 fix_ga4.py --dry-run   # preview only, no writes
"""

import os
import re
import sys
import glob

DRY_RUN = "--dry-run" in sys.argv
SITE_ROOT = os.path.dirname(os.path.abspath(__file__))
GA_ID = "G-B8K210VPRV"

# ── Sentinel so we can detect existing injection ──────────────────────────────
GA_SENTINEL = "COREMARK-GA-START"

# ── The GA4 snippet (matches what's already on checkout/delivery) ─────────────
GA_SNIPPET = f"""<!-- COREMARK-GA-START -->
<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('{{}}'.replace('{{}}','config'), '{GA_ID}');
</script>
<!-- COREMARK-GA-END -->
"""

# Build the snippet properly (avoid f-string nesting issues)
GA_SNIPPET = (
    f"<!-- COREMARK-GA-START -->\n"
    f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>\n'
    f"<script>\n"
    f"  window.dataLayer = window.dataLayer || [];\n"
    f"  function gtag(){{dataLayer.push(arguments);}}\n"
    f"  gtag('js', new Date());\n"
    f"  gtag('config', '{GA_ID}');\n"
    f"</script>\n"
    f"<!-- COREMARK-GA-END -->\n"
)

# ── GA4 purchase event (injected into delivery.html) ─────────────────────────
# Inserted right after the `showSuccess();` call.
# Uses orderType→price map since the API doesn't return amount.
PURCHASE_EVENT_JS = """
    // ── GA4 purchase event ────────────────────────────────
    (function() {
      var priceMap = { single: 249, fivepack: 799, subject: 1299, stage: 1299 };
      var orderValue = priceMap[data.orderType] || 249;
      if (typeof gtag === 'function') {
        gtag('event', 'purchase', {
          transaction_id: data.orderId || orderId,
          value:          orderValue,
          currency:       'INR',
          items: [{
            item_id:   data.orderType === 'single' ? (slug || data.orderType) : data.orderType,
            item_name: data.orderTitle || title,
            price:     orderValue,
            quantity:  1,
          }],
        });
      }
    })();
    // ── /GA4 purchase event ───────────────────────────────"""

PURCHASE_SENTINEL = "GA4 purchase event"


# ── Helpers ───────────────────────────────────────────────────────────────────

def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()

def write(path, content):
    if DRY_RUN:
        print(f"  [dry-run] would write {os.path.relpath(path, SITE_ROOT)}")
        return
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def has_ga(content):
    return GA_SENTINEL in content or f"gtag.js?id={GA_ID}" in content

def inject_ga(content, path):
    """Insert GA snippet just before </head>."""
    if has_ga(content):
        return content, False
    new = content.replace("</head>", GA_SNIPPET + "</head>", 1)
    if new == content:
        print(f"  WARNING: no </head> found in {os.path.relpath(path, SITE_ROOT)}")
        return content, False
    return new, True


# ── Step 1: add GA4 to pages that are missing it ─────────────────────────────

# Pages to skip (already have it or are not public pages)
SKIP = {
    "checkout.html",
    "delivery.html",       # handled separately below
    "coremark-admin.html",
    "index-old.html",
    "blog/index.html",
    "fix_aeo_visible.py",
}

def collect_html_files():
    files = []
    for pattern in ["*.html", "blog/*.html", "about.html", "legal/*.html"]:
        for p in glob.glob(os.path.join(SITE_ROOT, pattern)):
            rel = os.path.relpath(p, SITE_ROOT)
            if rel not in SKIP:
                files.append(p)
    return sorted(set(files))

print("=" * 60)
print(f"CoreMark GA4 fix {'(DRY RUN)' if DRY_RUN else ''}")
print("=" * 60)

print("\n── Step 1: Add GA4 snippet to pages missing it ──\n")
added = []
already = []
for path in collect_html_files():
    content = read(path)
    new_content, changed = inject_ga(content, path)
    rel = os.path.relpath(path, SITE_ROOT)
    if changed:
        write(path, new_content)
        print(f"  ✓ added  → {rel}")
        added.append(rel)
    else:
        print(f"  · skip   → {rel} (already has GA4)")
        already.append(rel)

print(f"\n  Summary: {len(added)} pages updated, {len(already)} already had GA4.\n")


# ── Step 2: add purchase event to delivery.html ───────────────────────────────

print("── Step 2: Add purchase event to delivery.html ──\n")

delivery_path = os.path.join(SITE_ROOT, "delivery.html")
content = read(delivery_path)

if PURCHASE_SENTINEL in content:
    print("  · skip   → purchase event already present in delivery.html\n")
else:
    # Insert PURCHASE_EVENT_JS after the `showSuccess();` line
    # The line looks like:    showSuccess();
    # We match it and append our block directly after.
    pattern = r'([ \t]*showSuccess\(\);)'
    replacement = r'\1' + PURCHASE_EVENT_JS
    new_content, n = re.subn(pattern, replacement, content, count=1)
    if n == 0:
        print("  ERROR: could not find 'showSuccess();' in delivery.html — manual fix needed.")
    else:
        write(delivery_path, new_content)
        print("  ✓ purchase event injected after showSuccess() in delivery.html\n")


# ── Done ──────────────────────────────────────────────────────────────────────

print("=" * 60)
if DRY_RUN:
    print("Dry run complete. Re-run without --dry-run to apply changes.")
else:
    print("Done. Deploy to Cloudflare Pages to go live.")
    print("\nVerify in GA4:")
    print("  Realtime → Events: visit index.html and confirm 'page_view' fires.")
    print("  Realtime → Events: complete a test purchase and confirm 'purchase' fires.")
print("=" * 60)
