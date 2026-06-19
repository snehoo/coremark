#!/usr/bin/env python3
"""
inject_seo_legal.py
Adds meta description, canonical, robots, favicon, and OG tags to
legal/terms.html and legal/privacy.html.

Run from inside your website root (the folder containing the legal/ subfolder):
    python3 inject_seo_legal.py

Safe to re-run — replaces the existing SEO-BLOCK rather than duplicating it.
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://coremark.study"
ASSETS = "https://assets.coremark.study"

PAGES = {
    "legal/terms.html": {
        "url": f"{SITE}/legal/terms.html",
        "title": "Terms of Service — CoreMark",
        "description": "CoreMark's terms of service: digital PDF licence terms, 7-day money-back guarantee, payments, and intellectual property for Cambridge Lower Secondary practice boosters.",
        "breadcrumb_name": "Terms of Service",
    },
    "legal/privacy.html": {
        "url": f"{SITE}/legal/privacy.html",
        "title": "Privacy Policy — CoreMark",
        "description": "CoreMark's privacy policy: what data we collect, why, and how long we keep it. Covers email, payments via Razorpay, and third-party services we use.",
        "breadcrumb_name": "Privacy Policy",
    },
}

START_MARK = "<!-- SEO-BLOCK-START -->"
END_MARK = "<!-- SEO-BLOCK-END -->"


def jsonld_script(data):
    import json
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def breadcrumb_jsonld(name, url):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": name, "item": url},
        ],
    }


def build_block(cfg):
    url, title, desc = cfg["url"], cfg["title"], cfg["description"]
    parts = [START_MARK]
    parts.append(f'<meta name="description" content="{desc}">')
    parts.append(f'<link rel="canonical" href="{url}">')
    parts.append('<meta name="robots" content="index, follow">')
    parts.append('<meta name="theme-color" content="#2A1B3D">')
    parts.append(f'<link rel="icon" type="image/jpeg" href="{SITE}/assets/favicon.jpg">')
    parts.append(f'<link rel="shortcut icon" type="image/jpeg" href="{SITE}/assets/favicon.jpg">')
    parts.append(f'<link rel="apple-touch-icon" href="{SITE}/assets/favicon.jpg">')
    parts.append('<meta property="og:type" content="article">')
    parts.append('<meta property="og:site_name" content="CoreMark">')
    parts.append(f'<meta property="og:title" content="{title}">')
    parts.append(f'<meta property="og:description" content="{desc}">')
    parts.append(f'<meta property="og:url" content="{url}">')
    parts.append(f'<meta property="og:image" content="{ASSETS}/logo.jpg">')
    parts.append('<meta name="twitter:card" content="summary">')
    parts.append(jsonld_script(breadcrumb_jsonld(cfg["breadcrumb_name"], url)))
    parts.append(END_MARK)
    return "\n".join(parts)


def inject(relpath, cfg):
    path = ROOT / relpath
    if not path.exists():
        print(f"  SKIP {relpath} — file not found at {path}")
        return
    content = path.read_text(encoding="utf-8")

    content = re.sub(
        re.escape(START_MARK) + r".*?" + re.escape(END_MARK),
        "",
        content,
        flags=re.DOTALL,
    )

    block = build_block(cfg)
    title_pattern = re.compile(r"(<title>.*?</title>\n)")
    if not title_pattern.search(content):
        print(f"  SKIP {relpath} — no <title> tag found to anchor insertion")
        return

    content = title_pattern.sub(r"\1" + block + "\n", content, count=1)
    path.write_text(content, encoding="utf-8")
    print(f"  OK   {relpath}")


def main():
    print("Injecting SEO into legal pages...\n")
    for relpath, cfg in PAGES.items():
        inject(relpath, cfg)
    print("\nDone.")


if __name__ == "__main__":
    main()
