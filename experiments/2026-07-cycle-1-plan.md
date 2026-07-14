# Cycle 1 Experiment Plan — CoreMark
**Cycle start:** 2026-07-14
**Review date:** 2026-08-11 (4 weeks)
**Status:** SUPERSEDED — GSC connected and baseline pulled 2026-07-14. Actual data showed only
6 clicks / 36 impressions in the last 28 days (site is newly indexed, prior-28d window had zero
rows) — too thin for the query-level EXP-1..4 candidates sketched below. Instead this cycle
shipped one technical fix and one CTR test, see `2026-07-canonical-sitemap-fix.md` and
`2026-07-computing-ctr-title.md`. This file is kept for the original candidate list and
attribution rules; revisit EXP-3 (/free.html) and EXP-4 (FAQ schema) framing below once traffic
volume supports query-level decisions — note FAQ schema turned out to already be present on all
20 blog posts (see SEO-MEMORY.md audit), so EXP-4 as written is moot.

---

## Pre-run Checklist

Before picking experiments, agent must:
1. Pull GSC data (last 28 days): overall clicks, impressions, CTR, avg position
2. Pull top 50 queries by impressions — identify striking-distance keywords (position 4–15)
3. Pull top 20 pages by clicks — identify CTR underperformers
4. Record all of the above as baseline in SEO-MEMORY.md

---

## Candidate Experiments (to be prioritised after GSC data)

### EXP-1: Striking-distance keyword page improvements
- **Hypothesis:** Blog posts ranking 4–15 on parent-intent queries can be pushed to top 3 by
  adding a direct answer in the first 150 words and improving title/meta for CTR.
- **Target pages:** TBD from GSC (identify which blog posts have most impressions at position 4–15)
- **Success metric:** Average position improvement of ≥1.5 for target pages within 4 weeks
- **Max pages to touch in one cycle:** 3 (attribution discipline)

### EXP-2: CTR optimisation on ranking pages
- **Hypothesis:** Pages in positions 1–5 with below-median CTR for that position can get +20%
  CTR uplift by rewriting title to include the parent's actual question (e.g. "Why does my child…"
  format, which is already working on several posts).
- **Target pages:** TBD from GSC (sort by position 1–5, filter CTR < benchmark)
- **Success metric:** CTR increase ≥15% within 3 weeks (measurable faster than position)

### EXP-3: /free.html page SEO optimisation
- **Hypothesis:** The free lead magnet page likely has no keyword optimisation; adding a clear
  title/meta targeting "free cambridge checkpoint maths booster" + FAQ schema could capture
  top-of-funnel organic traffic and drive lead volume.
- **Target page:** /free.html
- **Success metric:** Page appears in GSC impressions for "free cambridge checkpoint" terms
  within 4 weeks; click-through to email signup tracked in GA4

### EXP-4: FAQ schema on top blog posts
- **Hypothesis:** Blog posts with implicit Q&A structure (e.g. "Why does my child mix up
  photosynthesis…") would benefit from FAQPage JSON-LD to capture "People also ask" placement
  and AI Overview citations.
- **Target pages:** 3–5 posts with clear Q&A structure
- **Success metric:** Any PAA appearances; qualitative AI Overview citation check

---

## Attribution Rules for This Cycle

- Maximum 1 experiment per page — if a page is in EXP-1 it cannot also be in EXP-2
- Each experiment committed as its own git branch + PR
- Changes to math.html, science.html, computing.html require human PR review before merge
- Blog post changes can be merged directly to main after passing §6 checklists

---

## Outcome (to be filled at review date 2026-08-11)

- EXP-1: WIN / LOSS / INCONCLUSIVE — reason:
- EXP-2: WIN / LOSS / INCONCLUSIVE — reason:
- EXP-3: WIN / LOSS / INCONCLUSIVE — reason:
- EXP-4: WIN / LOSS / INCONCLUSIVE — reason:
- Lessons for SEO-MEMORY.md:
