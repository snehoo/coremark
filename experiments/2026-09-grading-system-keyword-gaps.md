# EXP-GRADING-KEYWORDS — grading-system-keyword-gaps

- **Shipped:** 2026-09-22
- **Review date:** 2026-10-13 (≥3 weeks out)
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** c211de1

## Hypothesis
A striking-distance pass on the 3-month Performance-on-Search export found 4 query phrases
ranking well on this page (position 3.2–7.8, 14–27 impressions each) that never appeared
verbatim in the page body — only as synonyms or not at all. Adding the exact phrases should
lift rankings/CTR for those specific queries without touching the page's primary title/meta
(kept separate from the already-open EXP-GRADING-2026 title experiment).

## Target
`/blog/cambridge-checkpoint-grading-system.html` — the site's highest-impression page (363
impressions/3mo across just these 4 target queries alone).

## Exact change
- Added a second sentence to the section-1 intro paragraph containing "grading scale" and
  the full "Cambridge Lower Secondary Checkpoint grading system" longtail phrase.
- Added a new FAQ entry ("Are Cambridge Checkpoint results called grades or scores?") to
  both the inline HTML FAQ and the FAQPage JSON-LD (now 5 entries, was 4), naturally using
  "checkpoint grades" and "checkpoint scores" (plural) — genuinely useful content (the page
  is not the same as Cambridge's grade system, existing "myth-busting" content is in the
  same spirit).
- No change to title, meta, H1, or any other page.
- `dateModified` / `article:modified_time` bumped to 2026-09-22.

## Target queries (3-month GSC data at time of shipping)
| Query | Impressions | Position |
|---|---|---|
| cambridge checkpoint grading scale | 16 | 7.75 |
| checkpoint scores | 15 | 4.13 |
| cambridge checkpoint grades | 14 | 6.14 |
| cambridge lower secondary checkpoint grading system | 7 | 4.86 |

## Success metric
Position holds or improves, and/or clicks appear (all 4 queries currently show 0 clicks)
for these specific queries, using a ≥3-week-old post-change window.

## Note — does not overlap EXP-GRADING-2026
EXP-GRADING-2026 (open, review 2026-10-03) tests the title only ("Grading System 2026").
This experiment touches body content only, on the same page, deliberately kept separate so
the two treatments can be read independently.

## Review date
2026-10-13.
