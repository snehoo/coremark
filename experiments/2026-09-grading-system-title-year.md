# EXP-GRADING-2026 — grading-system-title-year

- **Shipped:** 2026-09-03
- **Review date:** 2026-10-03
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** 51c7c5b

## Hypothesis
The query "grading system 2026" shows 13.33% CTR at position 3.7 — a year-in-title signal
correlates with higher CTR. Applying it to the site's highest-impression page should lift
overall CTR there.

## Target
`/blog/cambridge-checkpoint-grading-system.html` — 1,464 impressions/28d, position 5.0,
2.39% CTR at time of shipping (pre-change baseline).

## Exact change
Title: "Cambridge Checkpoint Grading System: Scores & Bands" →
"Cambridge Checkpoint Grading System 2026: Scores & Bands" (57 chars).
og:title, twitter:title, JSON-LD headline, dateModified all updated to match (2026-09-03).

## Success metric
CTR increase on this page's GSC query set, holding position roughly constant. Directional
comparison: pre-change CTR (2.39%) vs post-change CTR at review date, using a ≥3-week-old
post-change window to avoid re-crawl/re-rank noise.

## Review date
2026-10-03 (not yet due as of this run, 2026-09-14).
