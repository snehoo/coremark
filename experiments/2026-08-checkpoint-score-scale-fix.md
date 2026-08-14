# EXP-CKPT-SCORE — 2026-08-checkpoint-score-scale-fix

- **Status**: OPEN
- **Attempt**: 1
- **Shipped**: 2026-08-15 (commit c4f0b0f)
- **Review date**: 2026-09-05 (3 weeks)
- **Target page**: /blog/cambridge-checkpoint-score-explained.html
- **Tactic**: §3 content accuracy (blocker-level per SOP writing-quality checklist) + §4.2 CTR fix

## Hypothesis
This page's `<title>` and meta description already said "0-50 Scale and Bands" (fixed in an
earlier commit, a953317, 2026-08-10), but the visible body — H1, takeaway box, "why not a
percentage" section, score-band comparison table, strand-feedback section, stat-strip,
warn-box, both FAQ items about the scale, and a separate FAQPage JSON-LD block — still
described Cambridge's retired 0.0-6.0 Checkpoint scale (pre-May-2023) as if current, using
"4.5" as the running example throughout. This is a direct, page-internal contradiction (title
says one scale, body says another) and directly contradicts Cambridge's own top-ranking pages
for "cambridge checkpoint score" — flagged as a plausible cause of the page's 0.9% CTR at
position 7.3 (112 impressions, 28d) in SEO-BASELINE-2026-08-10.md, and confirmed still broken
in this run's fresh read of the file. Also had a length problem: title 63 chars, meta 157
chars (both marginally over the 60/155 limits).

## Exact change
- Title/meta/og/twitter trimmed to 56/140 chars, same content.
- Every body reference to "0.0-6.0", "4.5", "5.0-6.0 / 4.0-4.9 / 3.0-3.9 / below 3.0" band
  table replaced with the correct 0-50 scale and its six official Cambridge bands (0
  Unclassified, 1-10 Basic, 11-20 Aspiring, 21-30 Good, 31-40 High, 41-50 Outstanding).
  Running example changed from "4.5" to "34" (High band) — matching the exact remap already
  used sitewide in a953317 ("4.5 -> 34 (High)"), for consistency with other pages.
  Comparison table expanded from 4 old-scale rows to the 6 official bands.
  Both the visible FAQ answers and the parallel FAQPage JSON-LD block were updated in sync.

## Success metric
1. No regression: zero remaining old-scale (0.0-6.0 / "4.5" as a score) references anywhere on
   the page (verified via grep at ship time — see verification note below).
2. CTR improvement from 0.9% toward 3%+ at review, position holding or improving (currently
   competing directly against Cambridge's own pages, which state 0-50 — removing the
   contradiction should help, not just CTR-format changes alone).

## Verification
Verified via fresh-context sub-agent (general-purpose, 2026-08-15) against the full diff and
live files. First pass: FAIL on one item — the page-2 subtitle still read "a single decimal
number per subject", a leftover artifact contradicting the new integer 0-50 scale stated in
the H1 directly above it. Fixed ("single decimal number" → "single number") and rechecked
(grep for "decimal" sitewide on both files — zero remaining hits). All other checklist items
(writing quality, SEO, safety) passed clean on first pass. Shipped after fix.

## Note for future cycles
This same page had its FAQPage JSON-LD block silently reintroduced with stale content between
2026-08-05 (commit ea55af0 removed FAQPage JSON-LD sitewide in favor of inline microdata) and
2026-08-10 (commit a953317 edited an FAQPage block that shouldn't have existed anymore per site
policy). This page currently has NO inline itemscope/itemprop FAQ microdata — it relies solely
on the (now-fixed) JSON-LD block. Migrating it to the inline pattern to match the rest of the
site is a separate, optional cleanup — not done here to keep this experiment's diff scoped to
the CTR/accuracy fix. Candidate backlog item (see BL-032).
