# EXP-2: computing.html Title/Meta Rewrite for CTR

**Type:** CTR fix (single page)
**Ship date:** 2026-07-14
**Review date:** 2026-08-04 (3 weeks — CTR is fast-feedback per SOP §4.2, minimum age before
judging any experiment)
**Status:** OPEN — shipped to feature branch, PR pending human merge

---

## Hypothesis

`/computing` ranks at position 4.64 with 11 impressions in the last 28 days but 0 clicks (0%
CTR) — the only page in the current GSC pull with meaningful impressions and zero clicks. The
old title, "Computing Boosters — CoreMark Cambridge Lower Secondary," led with the generic
brand term "Boosters" rather than the actual search phrase, and the meta description was
generic ("Buy single topics or bundles") rather than concrete about price or format. The page's
own H1 already reads "Cambridge Lower Secondary Computing Boosters" — the title tag was
inconsistent with the page's own strongest on-page signal.

Front-loading the primary keyword phrase (matching the H1 and the target keyword "cambridge
lower secondary computing" from site.config.md) and adding a concrete, credible detail (instant
PDF, starting price ₹249, which matches site.config.md's verified pricing) should improve CTR
at this position without needing a ranking change.

## Exact change

`computing.html`:
- `<title>`: "Computing Boosters — CoreMark Cambridge Lower Secondary" (56 chars) →
  "Cambridge Lower Secondary Computing Boosters | CoreMark" (55 chars)
- `<meta name="description">`, `og:description`, `twitter:description`: "Topic-wise Computing
  practice boosters for Cambridge Lower Secondary Stage 7, 8 and 9. Programming, Data, Networks
  and Computer Systems. Buy single topics or bundles." → "Topic-wise Computing practice
  boosters for Cambridge Lower Secondary Stage 7-9: Programming, Data, Networks, Computer
  Systems. Instant PDF, from ₹249." (150 chars)
- `og:title`, `twitter:title`: matched to new title
- CollectionPage JSON-LD `name` field: updated to match new title (kept in sync; did not touch
  the JSON-LD `url` field, which is part of the separate canonical-URL scope in EXP-1)

Only 1 page touched this cycle (attribution discipline — max 1 experiment per page; this page
is not part of EXP-1's URL-alignment change scope beyond the already-shared canonical/og:url
fix, which is a distinct signal from title/CTR copy).

## Target page/keyword

`/computing.html` — primary keyword "cambridge lower secondary computing"

## Success metric

CTR ≥15% on `/computing` within 3 weeks (up from 0% on the baseline 11 impressions), without a
position drop below ~5. Given the small impression volume, also sanity-check the underlying
click/impression counts directly rather than trusting a percentage computed from single-digit
numbers.

## Ship mechanism

Feature branch + PR (`computing.html` requires human PR review per site.config.md). NOT merged
to main by the agent.

## Outcome (fill at review date 2026-08-04)

WIN / LOSS / INCONCLUSIVE — reason:
Lesson for SEO-MEMORY.md:
