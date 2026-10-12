# EXP-INDEX-INFOGAIN — index-infogain-pilot

- **Shipped:** 2026-10-12 · **Review:** 2026-11-09 · **Status:** OPEN

## Diagnosis
URL Inspection on all 54 sitemap URLs: 30 indexed, 23 "Crawled – currently not indexed" (17 blog posts, plus /free, /topics, /legal/privacy). The posts are 1,500–2,300 words, so length isn't the issue. Shared boilerplate (author box, CTA) also appears on indexed pages. What separates the two groups:
- **Template:** the 19 Jun 2026 batch shares one H2 skeleton. 9 posts have the identical section-3 heading "Where this trips students up by stage".
- **Information gain:** a median of 17.8 Cambridge-specific references (codes, stages, strands, Checkpoint, mark scheme) per 1k words for non-indexed posts, vs 35.4 for indexed ones.

## Treatment (6 posts)
| Post | Booster source |
|---|---|
| why-geometry-angle-problems-get-harder | S8 Maths G1 Angles & Constructions (Q15) |
| child-cant-understand-algebra | S8 Maths A1 Expressions, Formulae & Equations (Q19) |
| pseudocode-flowcharts-harder-than-they-look | S8 Computing CP1 Pseudocode & Selection (Q20) |
| why-child-freezes-on-networks-computer-systems | S8 Computing CN1 Networks (Q19) |
| databases-spreadsheets-modelling-overlooked-topics | S8 Computing CD1 Modelling & Databases (Q19) |
| why-chemical-reactions-rates-dont-make-sense | S9 Science C3 Rates of Reaction (Q18) |

Each post got a topic-specific section-3 H2 and a new "Checkpoint-style question, marked line by line" section: the booster question, a step-by-step answer with M1/A1 marks, the booster's ⚠ error flags, one parent tip, and a link to the subject page. It's labelled as CoreMark-written, not a past paper (same rule as the Tutor).

## Control (untreated, same batch)
percentages-ratio-word-problems-at-home, why-forces-energy-physics-calculations-trip-kids-up, child-mixes-up-photosynthesis-respiration-breathing, child-understands-logic-cant-write-python-code, why-child-keeps-getting-fractions-wrong, cambridge-maths-topics-that-cost-marks

## Success metric
At 2026-11-09, URL Inspection: ≥3/6 treated posts "Submitted and indexed" while the control stays flat → roll out to the remaining 11. If the control gets indexed at the same rate, the cause was elsewhere (sitewide crawl/quality); don't roll out.

## Not in this pilot
- best-cambridge-checkpoint-*-resources (4 roundups): different fix. They need an ownership disclosure and genuine hands-on comparisons, like the NovaKit compare-page issue.
- /free (233 words, ads LP), /legal/privacy: fine to leave unindexed.
- /topics (902-word hub): review separately.
- /blog "Redirect error": stale record from 3 Aug. The sitemap already lists /blog/.
