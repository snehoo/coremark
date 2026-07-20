# EXP-3: Maths Page On-Page Boost (title + FAQ + internal links)

**Type:** On-page SEO (title, meta, FAQ, internal links)
**Ship date:** 2026-07-20
**Review date:** 2026-08-14 (4 weeks; position signal needs time to settle)
**Status:** OPEN — feature branch `seo/exp3-exp4-maths-science-boost`, pending PR merge.
Blog post links merged to main (e77707c), live in production.

---

## Hypothesis

GSC shows `/math` ranking at position 19.5 with 12 impressions and 8.3% CTR on the query
"maths booster" (British spelling, 3 impressions), but the page title used "Mathematics" and
the meta description did not front-load the product name. Three alignment gaps identified:

1. **Title mismatch** — page said "Mathematics Boosters" but searchers use "maths booster" /
   "maths boosters". British spelling matters: "maths" ≠ "math" for UK/India Cambridge audience.
2. **Thin FAQ** — no FAQ block at all; FAQ helps capture PAA real estate and gives the page
   more topically-relevant content surface.
3. **Weak internal link signal** — blog posts linked to /math only via CTA buttons (low SEO
   value) with `.html` hrefs (redirect hop). No contextual prose links in article body.

## Exact changes

**math.html (feature branch):**
- Title: `Mathematics Boosters — CoreMark Cambridge Lower Secondary`
  → `Cambridge Lower Secondary Maths Boosters | CoreMark`
- Meta description: rewritten to front-load "Cambridge Lower Secondary maths boosters" with
  Stage 7–9, subject coverage, and price signal.
- og:title, twitter:title, og:description, twitter:description: all aligned.
- JSON-LD FAQ: added 3 new questions + answers.
- HTML FAQ section: added 3 matching visible items:
  - "What is a Cambridge Lower Secondary maths booster?"
  - "How does a maths booster help with Cambridge Checkpoint preparation?"
  - "What maths topics are covered across Stage 7, 8 and 9?"
- dateModified updated to 2026-07-17 (reflects genuine content change).

**Blog posts (main, commit e77707c):**
- `cambridge-maths-topics-that-cost-marks.html`: added `<a class="inline-link" href="/math">
  Cambridge Lower Secondary maths booster</a>` in CTA paragraph; CTA href `/math.html` → `/math`
- `child-falling-behind-cambridge-maths-what-works.html`: added `<a class="inline-link"
  href="/math">maths boosters</a>` in CTA paragraph; CTA href `/math.html` → `/math`

## Target pages/keywords

- **Primary:** `/math` — "maths booster", "maths boosters", "cambridge lower secondary maths booster"
- **Secondary:** any PAA results pulled by the FAQ

## Success metric

- Primary: `/math` position improves from 19.5 toward <15 by 2026-08-14.
- Secondary: impressions/clicks on "maths booster" or "maths boosters" queries show upward trend.
- Guardrail: no drop in current /math CTR (8.3%) or clicks (1/28d).

## Ship mechanism

Feature branch `seo/exp3-exp4-maths-science-boost` — PR required for math.html (protected
subject page per site.config.md). Blog post changes shipped directly to main.

## Outcome (fill at review date 2026-08-14)

WIN / LOSS / INCONCLUSIVE — reason:
Lesson for SEO-MEMORY.md:
