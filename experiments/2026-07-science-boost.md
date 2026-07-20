# EXP-4: Science Page On-Page Boost (title + FAQ + internal links)

**Type:** On-page SEO (title, meta, FAQ, internal links)
**Ship date:** 2026-07-20
**Review date:** 2026-08-14 (4 weeks)
**Status:** OPEN — feature branch `seo/exp3-exp4-maths-science-boost`, pending PR merge.
Blog post links merged to main (e77707c), live in production.

---

## Hypothesis

GSC shows `/science` ranking at position 10.3 — just outside page 1 on most results.
The page title used "Science Boosters" without the "Cambridge Lower Secondary" qualifier.
Same three-gap pattern as EXP-3 but applied to science:

1. **Title mismatch** — "Science Boosters" doesn't signal Cambridge curriculum context.
2. **Thin FAQ** — no FAQ block; missed PAA opportunity.
3. **Weak internal links** — science blog posts linked `/science.html` via CTA buttons only.

## Exact changes

**science.html (feature branch):**
- Title: `Science Boosters — CoreMark Cambridge Lower Secondary`
  → `Cambridge Lower Secondary Science Boosters | CoreMark`
- Meta description: rewritten to front-load "Cambridge Lower Secondary science boosters"
  with Stage 7–9, Biology/Chemistry/Physics, and price signal.
- og:title, twitter:title, og:description, twitter:description: all aligned.
- JSON-LD FAQ: added 3 new questions + answers.
- HTML FAQ section: added 3 matching visible items:
  - "What is a Cambridge Lower Secondary science booster?"
  - "How does a science booster help with Cambridge Checkpoint preparation?"
  - "What science topics are covered across Stage 7, 8 and 9?"
- dateModified updated to 2026-07-17 (reflects genuine content change).

**Blog posts (main, commit e77707c):**
- `how-to-revise-science-definitions-so-they-stick.html`: added `<a class="inline-link"
  href="/science">science booster</a>` in CTA paragraph; CTA href `/science.html` → `/science`
- `cambridge-checkpoint-science-help-non-expert-parent.html`: added `<a class="inline-link"
  href="/science">science booster</a>` in CTA paragraph; CTA href `/science.html` → `/science`

## Target pages/keywords

- **Primary:** `/science` — "science booster", "cambridge lower secondary science booster",
  "cambridge checkpoint science"
- **Secondary:** PAA results from FAQ additions

## Success metric

- Primary: `/science` position move from 10.3 into top 10 (page 1) by 2026-08-14.
- Secondary: impressions on "science booster" queries increase.
- Guardrail: no drop in current /science CTR (10%) or clicks (1/28d).

## Ship mechanism

Feature branch `seo/exp3-exp4-maths-science-boost` — PR required for science.html.
Blog post changes shipped directly to main.

## Outcome (fill at review date 2026-08-14)

WIN / LOSS / INCONCLUSIVE — reason:
Lesson for SEO-MEMORY.md:
