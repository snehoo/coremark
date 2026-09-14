# EXP-INDIA-RESOURCES — india-resources-ctr

- **Shipped:** 2026-09-14
- **Review date:** 2026-10-05
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** fcc4de2

## Hypothesis
0 clicks / 36 impressions / position 10.6 at time of shipping. Meta description was 173
chars (over the 155-char limit). Title also had drifted from the og/twitter/JSON-LD family
("for Indian Students" vs "for Indian Families: What Actually Works") and was near-identical
to a sibling page's title ("Best Cambridge Lower Secondary Practice Resources in India" —
flagged by the verifier sub-agent). A shorter, non-truncated, differentiated title/meta
should lift CTR from 0%.

## Target
`/blog/best-cambridge-lower-secondary-resources-india.html`

## Exact change
- Title: "Best Cambridge Lower Secondary Resources for Indian Students" (60 chars) →
  "Best Cambridge Lower Secondary Resources for Indian Families" (60 chars) — also resolves
  drift from og/twitter/JSON-LD and differentiates from the sibling "...Practice Resources
  in India" page.
- Meta: 173 chars → "The honest guide to Cambridge Lower Secondary resources in India: what
  works for Stage 7-9, what doesn't, and the best-value combination." (137 chars)
- og:title/twitter:title/JSON-LD headline unified to the new title (previously drifted from
  the `<title>` tag); og:description/twitter:description updated to match; dateModified →
  2026-09-14
- No change to H1 or body copy.

Verified via fresh-context sub-agent before shipping (writing quality, SEO checklist,
overlap/safety checks — SHIP verdict; near-duplicate-title flag against the sibling page
was addressed before shipping, not left unresolved).

## Success metric
Clicks > 0 at maintained/improved position, using a ≥3-week-old post-change window. Also
watch for cannibalization against `/blog/best-cambridge-lower-secondary-practice-resources-india`
given the title similarity — if that page's position/clicks drop while this one gains,
treat as a wash, not a clean win.

## Review date
2026-10-05.
