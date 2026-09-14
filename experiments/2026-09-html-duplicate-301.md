# EXP-HTML-REDIRECTS — html-duplicate-301

- **Shipped:** 2026-09-03
- **Review date:** 2026-10-03
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** 51c7c5b

## Hypothesis
Two blog posts were independently indexed under both their `.html` URL and clean (extensionless)
URL, splitting link/ranking equity between two URLs for the same content. A 301 from the `.html`
form to the clean form should consolidate signal onto the canonical URL and lift combined
clicks/impressions on the clean URL.

## Target
- `/blog/cambridge-checkpoint-score-explained.html` — indexed with 40 impressions on the `.html` URL
- `/blog/cambridge-lower-secondary-stages-explained.html` — indexed with 35 impressions on the `.html` URL

## Exact change
`_redirects`: added 301 rules from each `.html` URL to its clean-URL equivalent.

## Success metric
Combined (clean + `.html`) impressions/clicks on each page trend upward or hold, and the
`.html` variant drops out of GSC's indexed-URL list in favor of the clean URL, using a
≥3-week-old post-change window.

## Review date
2026-10-03 (not yet due as of this run, 2026-09-14).
