# EXP-VS-IGCSE — vs-igcse-direct-answer

- **Shipped:** 2026-09-14
- **Review date:** 2026-10-05
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** fcc4de2

## Hypothesis
This page absorbs the site's three largest single-query impression clusters, all at 0% CTR:
"igcse lower secondary" (100 impr/28d, pos 7.1), "cambridge international lower secondary"
(61 impr, pos 13.3), "cambridge lower secondary" (53 impr, pos 18.2). The query pattern reads
as a yes/no comparison question. A title/meta that poses and directly answers the question
should lift CTR versus the prior neutral-statement framing.

## Target
`/blog/cambridge-lower-secondary-vs-igcse.html` — 752 impressions, 3 clicks, 0.40% CTR,
position 7.1 (page-level 28d totals at time of shipping).

## Exact change
- Title: "Cambridge Lower Secondary vs IGCSE: What's Different" (52 chars) →
  "Cambridge Lower Secondary vs IGCSE: Are They the Same?" (54 chars)
- Meta: "Cambridge Lower Secondary and IGCSE are different programmes..." (159 chars, over
  limit) → "No, it's not IGCSE. Cambridge Lower Secondary (Stage 7-9) is the foundation that
  leads into IGCSE. Here is exactly how the two connect." (135 chars)
- og:title/twitter:title/JSON-LD headline updated to match; og:description/twitter:description
  updated to match; dateModified → 2026-09-14
- No change to H1, body copy, or the existing tldr-box (already states the direct answer).

Verified via fresh-context sub-agent before shipping (writing quality, SEO checklist,
overlap/safety checks — SHIP verdict, no blockers).

## Success metric
CTR increase on the three named queries and page-level CTR, at maintained/improved position,
using a ≥3-week-old post-change window.

## Review date
2026-10-05.
