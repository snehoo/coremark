# EXP-BAND-TERMINOLOGY — band-terminology-fix

- **Shipped:** 2026-09-22
- **Review date:** 2026-10-13 (≥3 weeks out)
- **Attempt:** 1
- **Status:** OPEN
- **Commit:** 1713d3d

## Hypothesis
This is primarily a correctness fix, not a CTR test — but content accuracy has shown a
measurable effect before on this site (EXP-CKPT-SCORE, WIN). Replacing fabricated
terminology with Cambridge's actual official system should hold or improve position/CTR,
not hurt it, on the two pages carrying the fix. A regression would be a signal worth
investigating (e.g. if Google had indexed and started ranking for the fabricated band
names specifically — unlikely but checkable).

## Target
`/blog/cambridge-checkpoint-grading-system.html` (site's #1 highest-impression page) and
`/blog/cambridge-checkpoint-marking-explained.html`.

## Exact change
Replaced "four performance bands: Exceeding, Meeting, Approaching, Below the standard"
(not real Cambridge terminology, verified via WebSearch against Cambridge's own
help-center documentation) with the actual six-band system: Unclassified (0), Basic
(1–10), Aspiring (11–20), Good (21–30), High (31–40), Outstanding (41–50) — matching what
`cambridge-checkpoint-score-explained.html` already had correct.

Also removed a second fabrication found alongside it: both pages claimed Cambridge sets
band cut-scores "fresh after each exam series" via a "chief examiner and standardisation
panel." This is false for the current system — the six thresholds are fixed and published;
only the raw-marks-to-scaled-score statistical moderation varies by series (which is
itself accurate and was left in place).

Full scope: CSS classes/markup for the band visual elements (4→6 entries on both pages),
JSON-LD FAQPage entries, inline FAQ HTML, TOC links, tldr-text, key-facts bullets, section
headings, a results/comparison table (grading-system.html, 4→6 rows), a pull-quote, and
several worked examples that were internally inconsistent with the new band ranges (e.g.
"a score of 40 is Exceeding" corrected to reflect that 40 falls in High, not Outstanding).

One line on `cambridge-lower-secondary-vs-igcse.html` also updated ("four" → "six").

Human explicitly reviewed and approved this fix before it shipped (flagged as BL-043,
approved in the same conversation).

## Success metric
No negative movement in position/CTR on these two pages' existing high-volume queries
(cambridge checkpoint grading system 2026, cambridge checkpoint score range, checkpoint
score, cambridge checkpoint grading percentage, etc. — see EXP-GRADING-2026 and
EXP-GRADING-KEYWORDS for the query list already being tracked on grading-system.html).
This experiment is scored PASS if no regression, WIN if a positive movement coincides,
not scored as a LOSS/failure tactic if flat (correctness fixes aren't optional based on
CTR outcome).

## Review date
2026-10-13.
