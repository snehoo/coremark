#!/usr/bin/env python3
"""
inject_seo.py
Adds canonical, robots, theme-color, favicons, Open Graph, Twitter Card,
and JSON-LD structured data to CoreMark's index/math/science/computing pages.

Run once locally:
    python3 inject_seo.py

Reads from ./  (same folder as the four html files)
Writes back in place. Safe to re-run (it replaces the SEO block if already present,
marked by HTML comments, rather than duplicating it).
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent
SITE = "https://coremark.study"
ASSETS = "https://assets.coremark.study"

PAGES = {
    "index.html": {
        "url": f"{SITE}/",
        "title": "CoreMark — Topic Practice Boosters for Cambridge Lower Secondary",
        "description": "Topic-wise practice packs for Cambridge Lower Secondary Stage 7–9. Maths, Science and Computing. Cheat sheet, 20 questions, full solutions. Download and print.",
        "og_type": "website",
    },
    "math.html": {
        "url": f"{SITE}/math.html",
        "title": "Mathematics Boosters — CoreMark Cambridge Lower Secondary",
        "description": "Topic-wise Mathematics practice boosters for Cambridge Lower Secondary Stage 7, 8 and 9. Number, Algebra, Geometry and Statistics. Buy single topics or bundles.",
        "og_type": "website",
        "subject": "Mathematics",
        "booster_count": 39,
    },
    "science.html": {
        "url": f"{SITE}/science.html",
        "title": "Science Boosters — CoreMark Cambridge Lower Secondary",
        "description": "Topic-wise Science practice boosters for Cambridge Lower Secondary Stage 7, 8 and 9. Biology, Chemistry and Physics. Buy single topics or bundles.",
        "og_type": "website",
        "subject": "Science",
        "booster_count": 27,
    },
    "computing.html": {
        "url": f"{SITE}/computing.html",
        "title": "Computing Boosters — CoreMark Cambridge Lower Secondary",
        "description": "Topic-wise Computing practice boosters for Cambridge Lower Secondary Stage 7, 8 and 9. Programming, Data, Networks and Computer Systems. Buy single topics or bundles.",
        "og_type": "website",
        "subject": "Computing",
        "booster_count": 22,
    },
}

START_MARK = "<!-- SEO-BLOCK-START -->"
END_MARK = "<!-- SEO-BLOCK-END -->"


def org_jsonld():
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CoreMark",
        "url": SITE + "/",
        "logo": f"{ASSETS}/logo.jpg",
        "email": "info@coremark.study",
        "sameAs": ["https://instagram.com/coremark.study"],
        "description": "CoreMark produces original topic-wise practice booklets for the Cambridge Lower Secondary curriculum, Stage 7 to 9, covering Mathematics, Science and Computing. Not affiliated with or endorsed by Cambridge Assessment International Education.",
    }


def website_jsonld():
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "CoreMark",
        "url": SITE + "/",
    }


def breadcrumb_jsonld(page_name, page_url):
    items = [{"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"}]
    if page_name:
        items.append({"@type": "ListItem", "position": 2, "name": page_name, "item": page_url})
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items,
    }


def faq_jsonld():
    # Pulled verbatim from index.html's existing FAQ section — not invented.
    qa = [
        ("Is this an official Cambridge paper?",
         "No. CoreMark is not affiliated with or endorsed by Cambridge Assessment International Education. These are original practice papers written in the style of Cambridge Lower Secondary Checkpoint. They are not past papers and not official Cambridge material."),
        ("Which stage should my child use?",
         "Stage 7 is roughly Year 7 or Class 7, Stage 8 is Year 8 or Class 8, and Stage 9 is Year 9 or Class 9. If your child's school follows the Cambridge Lower Secondary programme, the stage will match their year group."),
        ("How do I get the PDF after buying?",
         "As soon as payment is confirmed you will receive an email with a download link. You can download the PDF immediately and print it at home on any A4 printer."),
        ("Can I print it more than once?",
         "Yes. Once you download the PDF you can print it as many times as you like for your own household."),
        ("What is the refund policy?",
         "We offer a 7-day money-back guarantee. If you are not satisfied with any purchase for any reason, email us within 7 days of purchase and we will refund you in full."),
    ]
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in qa
        ],
    }


def collection_jsonld(subject, count, url):
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": f"{subject} Boosters — CoreMark Cambridge Lower Secondary",
        "url": url,
        "about": f"Cambridge Lower Secondary {subject}, Stage 7 to 9",
        "hasPart": {
            "@type": "ItemList",
            "numberOfItems": count,
            "itemListElement": "Individual topic-wise PDF practice boosters",
        },
    }


def jsonld_script(data):
    import json
    return f'<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script>'


def build_seo_block(filename, cfg):
    url = cfg["url"]
    title = cfg["title"]
    desc = cfg["description"]
    parts = [START_MARK]

    parts.append(f'<link rel="canonical" href="{url}">')
    parts.append('<meta name="robots" content="index, follow">')
    parts.append('<meta name="theme-color" content="#2A1B3D">')

    # Favicon — single jpg, declared for the common rel types
    parts.append(f'<link rel="icon" type="image/jpeg" href="{SITE}/assets/favicon.jpg">')
    parts.append(f'<link rel="shortcut icon" type="image/jpeg" href="{SITE}/assets/favicon.jpg">')
    parts.append(f'<link rel="apple-touch-icon" href="{SITE}/assets/favicon.jpg">')

    # Open Graph
    parts.append(f'<meta property="og:type" content="{cfg["og_type"]}">')
    parts.append(f'<meta property="og:site_name" content="CoreMark">')
    parts.append(f'<meta property="og:title" content="{title}">')
    parts.append(f'<meta property="og:description" content="{desc}">')
    parts.append(f'<meta property="og:url" content="{url}">')
    parts.append(f'<meta property="og:image" content="{ASSETS}/logo.jpg">')
    parts.append('<meta property="og:locale" content="en_IN">')

    # Twitter Card
    parts.append('<meta name="twitter:card" content="summary">')
    parts.append(f'<meta name="twitter:title" content="{title}">')
    parts.append(f'<meta name="twitter:description" content="{desc}">')
    parts.append(f'<meta name="twitter:image" content="{ASSETS}/logo.jpg">')

    # JSON-LD — Organization + WebSite always; breadcrumb on every page;
    # FAQ only on index (it actually has the FAQ content); CollectionPage on subject pages.
    parts.append(jsonld_script(org_jsonld()))
    parts.append(jsonld_script(website_jsonld()))

    page_name = None if filename == "index.html" else cfg.get("subject", cfg["title"].split(" — ")[0])
    parts.append(jsonld_script(breadcrumb_jsonld(page_name, url)))

    if filename == "index.html":
        parts.append(jsonld_script(faq_jsonld()))
    else:
        parts.append(jsonld_script(collection_jsonld(cfg["subject"], cfg["booster_count"], url)))

    parts.append(END_MARK)
    return "\n".join(parts)


def inject(filename, cfg):
    path = ROOT / filename
    content = path.read_text(encoding="utf-8")

    # Remove any previously injected block (idempotent re-runs)
    content = re.sub(
        re.escape(START_MARK) + r".*?" + re.escape(END_MARK),
        "",
        content,
        flags=re.DOTALL,
    )

    block = build_seo_block(filename, cfg)

    # Insert right after the existing <title> tag (present on all four files)
    title_pattern = re.compile(r"(<title>.*?</title>\n)")
    if not title_pattern.search(content):
        raise RuntimeError(f"No <title> tag found in {filename} — cannot anchor insertion")

    content = title_pattern.sub(r"\1" + block + "\n", content, count=1)

    path.write_text(content, encoding="utf-8")
    print(f"  OK  {filename}  ({len(block)} chars added)")


def main():
    print("Injecting SEO block into 4 pages...\n")
    for filename, cfg in PAGES.items():
        inject(filename, cfg)
    print("\nDone. Re-run anytime — old SEO blocks are replaced, not duplicated.")


if __name__ == "__main__":
    main()
