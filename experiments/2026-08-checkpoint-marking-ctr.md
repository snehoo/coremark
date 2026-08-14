# EXP-CKPT-MARKING — 2026-08-checkpoint-marking-ctr

- **Status**: OPEN
- **Attempt**: 1
- **Shipped**: 2026-08-15 (commit c4f0b0f)
- **Review date**: 2026-09-05 (3 weeks)
- **Target page**: /blog/cambridge-checkpoint-marking-explained.html
- **Tactic**: §4.2 CTR fix — title/meta length

## Hypothesis
Title tag was 83 chars and meta description was 227 chars — both well past Google's SERP
truncation limits (~60 / ~155). This page was ranking at position 5.0 with 192 impressions
(28d, 2026-07-18 to 2026-08-14) but only 1.0% CTR (2 clicks) — the biggest impression/CTR gap
in this cycle's GSC pull. Hypothesis: over-length title/meta cause Google to truncate mid-word
or discard the written meta description in favor of an auto-generated snippet, both of which
plausibly kill CTR at an otherwise-strong position.

## Exact change
- Title: "How Cambridge Checkpoint Papers Are Marked: Score, Percentage and Grading Explained"
  (83 chars) → "Cambridge Checkpoint Marking Explained: Scores & Bands" (54 chars)
- Meta description: 227 chars → 151 chars, same core claim (0-50 scale, not a percentage)
- Same edits mirrored in og:title/og:description, twitter:title/twitter:description, JSON-LD
  headline, BreadcrumbList name. H1 and body content untouched (already internally consistent
  — this page already correctly describes the retired pre-May-2023 0-6 scale as historical).

## Success metric
CTR on this page rises from 1.0% toward 3-5%+ at review, with position holding ≥ position 8
(no ranking regression from the title change moving off exact-match phrasing).

## Verification
Verified via fresh-context sub-agent (general-purpose, 2026-08-15). One issue flagged on the
sibling page in this same commit (see EXP-CKPT-SCORE), none on this page. SHIP recommendation
given after fix.
