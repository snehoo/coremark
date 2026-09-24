# EXP-CLUSTER-A-CONSOLIDATION — cluster-a-consolidation

- **Shipped:** 2026-09-24 (content: commit af3023f; redirects/sitemap: PR #6, awaiting merge)
- **Review date:** 2026-10-15 (~3 weeks after PR #6 merges, allowing settle time)
- **Attempt:** 1
- **Status:** OPEN
- **Source:** independently-produced audit files (coremark-study-seo-audit.md,
  coremark-study-consolidation-plan.md, cambridge-checkpoint-score-explained-DRAFT.md),
  human-approved for execution 2026-09-24

## Hypothesis

Four pages independently answered "what does my Cambridge Checkpoint score mean" with
near-identical facts, in the same template, targeting overlapping queries — a duplicate-
content/cannibalization pattern that likely caused Google to split ranking signal across
URLs instead of concentrating it on one. Consolidating onto a single canonical page should
hold or improve combined clicks/impressions versus what the separate URLs got individually,
since the signal (backlinks, click history, topical authority) concentrates rather than
splits.

## Correction to the source plan

The consolidation plan (written without GSC access, by its own admission) proposed
`cambridge-checkpoint-score-explained` as the canonical URL. Verified against actual 3-month
GSC traffic before executing (the plan's own stated precondition):

| Page | Clicks | Impressions | Position |
|---|---|---|---|
| grading-system | 87 | 4,105 | 4.34 |
| marking-explained | 14 | 1,149 | 5.56 |
| score-explained | 8 | 826 | 6.48 |

`grading-system.html` is the canonical page by an order of magnitude, not `score-explained`.
Executed with this correction.

## Exact change

- **Canonical:** `cambridge-checkpoint-grading-system.html`. Merged in genuinely distinct
  content from the other two: "How raw marks become the scaled score" (statistical
  moderation) and "How individual marks are awarded on papers" (M1/A1/B1/FT-ECF mark-scheme
  table) from `marking-explained`; an IGCSE-entry FAQ and an Education Endowment Foundation
  mastery-learning citation from `score-explained`. Sections renumbered 1–9.
- **Redirected (301, both clean + `.html` variants):** `cambridge-checkpoint-score-explained`
  and `cambridge-checkpoint-marking-explained` → `cambridge-checkpoint-grading-system`.
- **Deleted:** both source page files (content already merged).
- **Re-scoped, kept separate:** `how-to-improve-cambridge-checkpoint-score.html` — the audit
  correctly identified this as having a genuinely distinct, actionable angle. Trimmed its
  restated scale/band explanation to a link to the canonical page. Also fixed an unrelated,
  previously undiscovered bug found while re-scoping it: the retired 0.0–6.0 decimal scale
  was still used throughout its examples and FAQ, including the exact "4.0 = age-appropriate"
  unverified claim SEO-BASELINE-2026-08-10.md had already flagged as removed elsewhere on the
  site. Rewrote to the current 0–50/six-band system.
- **Internal links updated** on 7 other pages (vs-igcse, blog index, stages-explained,
  what-is-checkpoint, checkpoint-explained-parent-guide, for-parents, grading-system's own
  "read next" cards) to point directly at the canonical URL rather than relying on the
  redirect, per the consolidation plan's own mechanics section.
- **Sitemap:** removed both merged URLs (52 → 50 entries).

## Bonus fixes found during execution (unrelated to consolidation itself)

- Two leftover instances of the fabricated "four bands"/"boundaries reset each series"
  claim on `grading-system.html` that an earlier grep sweep (BL-043) missed: a key-facts
  bullet and a stat-card. Both fixed.
- The retired 0.0–6.0 scale bug on `how-to-improve-cambridge-checkpoint-score.html` (see
  above) — a fourth page with this class of bug, not previously known.

## Success metric

Combined clicks/impressions on the canonical URL (`grading-system`) should hold at or above
what the three URLs got independently (109 clicks / 6,080 impressions combined, 3mo), once
Google has fully reprocessed the redirects. A short-term dip immediately after the merge is
expected (standard redirect-consolidation behavior) and should not be treated as a loss —
judge only after the review date.

## Not executed this pass (flagged, not acted on)

Clusters B (past-papers pages), C ("what is Checkpoint" pages), D (India-resource roundups —
blocked by open EXP-INDIA-RESOURCES until 2026-10-05), and E (Save My Exams comparison pages
— blocked by the open BL-044 indexing watch on `save-my-exams-cambridge-lower-secondary`)
from the same audit. Logged as BL-046 through BL-049 for future cycles.

## Review date

2026-10-15.
