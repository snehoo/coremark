# GSC Baseline — 2026-08-10 (pre-change snapshot)

Changes shipped in commit `0dc5c4e`. Re-pull the same report on **2026-08-24**
(14 days) and compare against the numbers below. GSC data lags ~2 days, so the
first clean post-change week is roughly 2026-08-13 → 2026-08-20.

## Site totals — last 3 months (17 Jun – 8 Aug 2026)

| Metric | Baseline |
|---|---|
| Clicks | 26 |
| Impressions | 440 |
| Avg CTR | 5.9% |
| Avg position | 9.6 |

Note: all 21 named queries showed 0 clicks. The 26 clicks sit in GSC's
anonymised bucket (queries too rare to attribute).

## Pages — the ones we changed

| Page | Impr | Clicks | CTR | Pos | What changed |
|---|---|---|---|---|---|
| `/` | 60 | 14 | 23.3% | 3.3 | untouched (control) |
| `/blog/best-cambridge-checkpoint-science-resources` | 62 | 1 | 1.6% | 10.1 | title + desc |
| `/blog/save-my-exams-cambridge-lower-secondary` | 62 | 1 | 1.6% | 10.9 | title + desc |
| `/blog/does-khan-academy-cover-cambridge-lower-secondary` | 51 | 0 | 0% | 7.9 | title + desc |
| `/computing` | 36 | 2 | 5.6% | 10.1 | title + desc + H1 |
| `/blog/best-cambridge-checkpoint-stage-8-maths-resources` | 28 | 1 | 3.6% | 10.0 | title + desc |
| `/math` | 25 | 2 | 8% | 20.4 | title + desc + H1 |
| `/blog/cambridge-checkpoint-score-explained` | 24 | 0 | 0% | 6.9 | desc only (scale issue open) |
| `/blog/best-cambridge-lower-secondary-practice-resources-india` | 24 | 1 | 4.2% | 9.5 | title + desc |
| `/blog/cambridge-lower-secondary-maths-stage-8-practice` | 23 | 1 | 4.3% | 5.1 | title + desc |
| `/science` | 23 | 1 | 4.3% | 11.5 | title + desc + H1 |
| `/blog/cambridge-lower-secondary-stages-explained.html` | 17 | 0 | 0% | 10.1 | dupe URL — should consolidate |
| `/blog/cambridge-checkpoint-score-explained.html` | 13 | 0 | 0% | 6.1 | dupe URL — should consolidate |
| `/blog/cambridge-checkpoint-past-papers-where-to-find-them` | 12 | 0 | 0% | 11.8 | title + desc |
| `/blog/cambridge-checkpoint-past-papers-vs-topic-boosters` | 10 | 2 | 20% | 10.8 | untouched (control) |
| `/blog/cambridge-checkpoint-past-papers-alternatives` | 6 | 0 | 0% | 3.3 | untouched (control) |

## Queries — all 21

| Query | Impr | Pos |
|---|---|---|
| maths booster | 7 | 24.4 |
| khan academy cambridge curriculum | 6 | 8.0 |
| igcse lower secondary | 6 | 15.2 |
| math booster | 5 | 29.2 |
| checkpoint exam past papers | 2 | 9.5 |
| cambridge lower secondary checkpoint grading system | 2 | 11.0 |
| cambridge checkpoint past papers | 2 | 22.0 |
| 0860 | 1 | 1.0 |
| is 100 percent | 1 | 7.0 |
| for khan academy | 1 | 8.0 |
| give me more app | 1 | 8.0 |
| cambridge checkpoint score | 1 | 9.0 |
| cambridge checkpoint score range | 1 | 10.0 |
| science checkpoint | 1 | 15.0 |
| science booster | 1 | 20.0 |
| khan academy cambridge | 1 | 24.0 |
| cambridge lower secondary | 1 | 26.0 |
| year 7 entry cambridge | 1 | 34.0 |
| cambridge secondary science | 1 | 37.0 |
| maths boosters | 1 | 45.0 |
| yes | 1 | 2.0 |

## What to look for on 2026-08-24

1. **CTR on the 12 retitled pages.** This is the fastest-moving signal — meta
   description and title changes usually show within 1–2 weeks of recrawl.
   Target: the three pages at 0–1.6% CTR should reach 3–5% at unchanged position.
2. **Position on `/math` and `/science`.** Retitling away from "Boosters" toward
   "Cambridge Lower Secondary <Subject> (<code>)" should move these off the
   wrong-intent "maths booster" SERP. Expect position to look *worse* for
   "maths booster" and better for Cambridge-intent queries. That trade is
   intentional.
3. **Duplicate URL consolidation.** The two `.html` pages above should decay to
   zero impressions as the extensionless versions absorb them. If both are still
   showing at 14 days, add explicit redirects.
4. **Total indexed pages** (GSC → Pages). Removing 173 links to 404s should
   reduce "Crawled – not indexed" / "Not found (404)" counts.

## SERP intelligence (checked 2026-08-10, google.co.in)

- **"maths booster"** — owned by JEE/SSC coaching (Unacademy, Rakesh Yadav),
  CBSE textbook series (Srijan), YouTube channels, Play Store apps. No Cambridge
  intent whatsoever. **Do not chase this term.**
- **"cambridge checkpoint past papers"** — 100% free-download sites: Smart Edu
  Hub, Past Papers Academy, CIE Notes, PapaCambridge, Scribd. A paid product
  cannot win this head-on. Better angle: the withdrawn-papers gap, which
  `/blog/cambridge-checkpoint-past-papers-alternatives` already ranks 3.3 for.
- **"cambridge checkpoint score"** — Cambridge official ranks 1st and 5th, both
  stating the **0–50 scale**. Tutopiya (0.0–6.0) ranks 8th. Our result appears
  mid-page-1 with the snippet "A score of 4.5 places a student in the
  upper-middle band…" — which conflicts with the top results. See open issue.
- **People Also Ask worth targeting**: "What is a good score for Cambridge
  checkpoint?", "How can I prepare for Cambridge checkpoint?", "Where can I get
  Cambridge checkpoint past papers?"

## RESOLVED — outdated Checkpoint scoring scale (commit `a953317`)

Cambridge's own help centre states: *"From the May 2023 Cambridge Checkpoint
series, all Lower Secondary Checkpoint reports will show a score on a 0 to 50
scale (rather than a score on the legacy [0.0–6.0] scale)."*

Band table (`help.cambridgeinternational.org/hc/en-gb/articles/31495563008530`):

| Score /50 | Band |
|---|---|
| 0 | Unclassified |
| 1–10 | Basic |
| 11–20 | Aspiring |
| 21–30 | Good |
| 31–40 | High |
| 41–50 | Outstanding |

All 16 affected pages corrected. The "below 4.0 in a strand" sales hook is now
"a strand sitting in the Basic or Aspiring band" — no linear conversion was
attempted, because the two scales are Rasch-graded and not proportional.

Two unverifiable claims were also removed: that 4.0 is "considered
age-appropriate by CAIE", and a six-band scheme (Early/Developing/Building/
Secure/Strong/Advanced) attributed to Cambridge that is not their terminology.

**Still outstanding (not website):** the booster PDF parent guides and any
Google Ads copy referencing the 4.0 threshold.

This is also a ranking factor, not just an accuracy one — for "cambridge
checkpoint score" Cambridge's own pages rank 1st and 5th stating 0–50, and our
snippet said "A score of 4.5…". Contradicting the top-ranked authority on a
factual query is a plausible reason for 24 impressions at position 6.9 with
zero clicks. Watch this page specifically on 2026-08-24.
