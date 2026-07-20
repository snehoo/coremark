# SEO Backlog — CoreMark (coremark.study)

Self-feeding work queue. Every discovered opportunity lives here before it becomes an experiment.
The loop pulls from the top of this table by impact/effort; discovery and execution are separate.

Row format: `id | tactic (§4) | target page/keyword | evidence | est. impact | est. effort | status | date added`

Impact: H = likely 2x+ clicks on target page; M = marginal lift, meaningful over cycles; L = hygiene/indirect
Effort: H = multi-file, complex; M = moderate; L = quick, single file
Status: queued / active / done / exhausted

---

## Queued

| ID | Tactic | Target page / keyword | Evidence | Impact | Effort | Status | Added |
|----|--------|-----------------------|----------|--------|--------|--------|-------|
| BL-001 | §3 perf — homepage LCP | / (LCP only) | Re-PSI on 2026-07-17: homepage LCP = 6.8s (still "poor"), score=62, render-blocking=**no savings**. Font fix (f1dfdd6) already applied and confirmed working on /math (7.1s→1.5s) and /computing (6.9s→2.9s). Homepage bottleneck is something else — 80KB page weight, likely large hero image or heavy inline JS. Investigate: check hero img `loading` attr, check TBT=330ms (unused JS?), compare to lighter pages. | H | M | queued | 2026-07-17 |
| BL-002 | §4.1 striking distance | /math / "maths booster" | /math: position 19.5, 12 impressions, 8.3% CTR, 1 click. **Active as EXP-3** — title rewritten to match "maths booster" (British spelling), 3 FAQ items added, contextual prose links from 2 blog posts. Review 2026-08-14. | H | M | active | 2026-07-14 |
| BL-003 | §4.1 striking distance | /science / "science booster" | /science: position 10.3, 10 impressions, 10% CTR, 1 click. **Active as EXP-4** — title rewritten to match "science booster", 3 FAQ items added, contextual prose links from 2 blog posts. Review 2026-08-14. | M | M | active | 2026-07-14 |
| BL-004 | §4.4 content gap | /free.html / "free cambridge checkpoint maths" | No click data yet but /free.html is the top-of-funnel lead magnet. Not yet appearing in GSC queries — may not be indexed or may need a title/meta pass. Verify indexation and check title for keyword match. Low effort to diagnose. | M | L | queued | 2026-07-14 |
| BL-005 | §3 structured data | blog/ — JSON-LD @id + BreadcrumbList URLs | Cycle 1 gap-fill (commit f1dfdd6) stripped .html from JSON-LD on all 20 blog posts. Verify in GSC Rich Results Test that no schema errors appeared post-fix. Quick check, not a full experiment — move to done if no errors found. | L | L | queued | 2026-07-14 |
| BL-006 | §3 perf | /math — CLS 0.211 | Re-PSI 2026-07-17: /math CLS still = 0.211 (needs-improvement, threshold <0.1). LCP now excellent (1.5s) so CLS is the remaining /math metric to fix. Likely late-loading element causing layout shift — could be the hero image without explicit dimensions, or a font FOUT. Investigate /math hero section for missing width/height attrs. | M | M | queued | 2026-07-17 |
| BL-007 | §4.6 GEO / AI-search | homepage + subject pages | No AI Overview citations detected yet (qualitative only — not crawled). Site has llms.txt and AI crawlers allowed. Once traffic grows, add direct-answer blocks ("What is Cambridge Lower Secondary?", "How do I prepare for Cambridge Checkpoint?") near page tops to be quotable. Defer until cycle 3+ — premature at current traffic level. | M | M | queued | 2026-07-14 |
| BL-008 | §4.4 content gap | blog/ — new post | No blog post targeting "cambridge checkpoint stage 7 maths" or "cambridge lower secondary stage 7 revision". DataForSEO not yet configured — validate volume manually via GSC query data once impressions grow. Draft only; human must approve publishing per §9 (first 3 cycles). | M | H | queued | 2026-07-14 |
| BL-009 | §4.4 programmatic — use-case pages | /math/stage-7, /math/stage-8, /math/stage-9 (and science, computing equivalents — 9 pages total) | Article by @denohawari (2026-07-20): programmatic use-case pattern "[product] for [audience]" — stage-specific pages target long-tail queries like "cambridge maths stage 7 revision", "cambridge checkpoint stage 8 science" with near-zero competition. CoreMark product is already structured by stage — these pages are templatable. Each page needs ≥1 unique data point (topic list, pricing, stage-specific scope) to avoid AI-engine penalty. Internal-link to topic purchase pages. Manual build (9 pages), no CMS needed at this volume. | H | M | queued | 2026-07-20 |
| BL-010 | §4.4 glossary / topical authority | /glossary/ or blog/ — "what is cambridge checkpoint?", "what is cambridge lower secondary?" | Glossary pattern: parents search these definitional queries before they know the product exists. Standalone pages with direct-answer blocks feed AI citation (ChatGPT/Perplexity/Claude pull from top-10 Google results — 76% of AI Overview citations come from top-10 organic per @denohawari 2026-07-20). 2–3 pages, low effort, builds topical authority. Link glossary pages into /math, /science, /computing. | M | L | queued | 2026-07-20 |
| BL-011 | §4.4 comparison page | /blog/ or /compare/ — "maths tutor vs revision packs for cambridge checkpoint" | Comparison pattern: highest purchase intent. Positions CoreMark ₹249 booster as the structured alternative to ₹500–1,000/hr tutoring. Targets decision-stage parents who are already shopping. Include "who this is for" section (AI engines extract that line directly per @denohawari 2026-07-20). One page, human must approve draft per §9. | M | L | queued | 2026-07-20 |
| BL-012 | §4.4 listicle — Stage 7 resources | /blog/best-cambridge-checkpoint-stage-7-maths-resources | Same template as existing Stage 8 listicle (BL already done). Targets "cambridge checkpoint stage 7 resources", "cambridge lower secondary stage 7 maths revision". Near-zero incremental effort — swap stage number, update topic references. High impression potential at this stage of growth. | H | L | queued | 2026-07-20 |
| BL-013 | §4.4 listicle — Stage 9 resources | /blog/best-cambridge-checkpoint-stage-9-maths-resources | Same pattern as BL-012 but Stage 9. Targets parents of students heading into final stage / Checkpoint year. Slightly higher commercial intent (exam imminent). | H | L | queued | 2026-07-20 |
| BL-014 | §4.4 listicle — Science resources | /blog/best-cambridge-checkpoint-science-resources | No science or computing listicle exists. "Best Cambridge Checkpoint science resources" is a natural parent query. Lists past papers, CIE official resources, and CoreMark science boosters. Follows same template. | M | L | queued | 2026-07-20 |
| BL-015 | §4.4 listicle — Computing resources | /blog/best-cambridge-checkpoint-computing-resources | Same as BL-014 but Computing. Thinner competition in this niche. | M | L | queued | 2026-07-20 |
| BL-016 | §4.4 competitor piggyback | /blog/cambridge-checkpoint-past-papers-where-to-find-them | Highest-traffic query in the space. Parents search "cambridge checkpoint past papers free download" constantly. Post: where to find them on Cambridge's site + how to use them effectively + "past papers tell you what; boosters teach you how" → CTA to /free (free booster) then to /math/science. Directly feeds /free funnel. | H | L | queued | 2026-07-20 |
| BL-017 | §4.4 competitor piggyback | /blog/does-khan-academy-cover-cambridge-lower-secondary | Parents of Cambridge students regularly try Khan Academy and find it misaligned with the Cambridge Lower Secondary curriculum. Post: what KA covers vs what Cambridge 0845/0893/0860 actually tests + CoreMark as the curriculum-specific alternative. Zero CoreMark mentions needed in title — pure comparison. | H | L | queued | 2026-07-20 |
| BL-018 | §4.4 competitor piggyback | /blog/save-my-exams-cambridge-lower-secondary | "Save My Exams" is the dominant UK revision site but covers GCSE/A-Level, not Cambridge Lower Secondary. Same gap-analysis play as BL-017. Parents search this and land on the wrong content. | M | L | queued | 2026-07-20 |
| BL-019 | §4.3 free funnel expansion | /free/stage-7-fractions, /free/stage-7-biology, /free/stage-9-number | /free.html currently one resource: Stage 8 Algebra. Each additional free resource page = new entry point, new ranking opportunity ("free cambridge lower secondary fractions worksheet" etc.), more /free → purchase funnel traffic. Hub page at /free listing all resources. Each new page is a template swap. | H | M | queued | 2026-07-20 |
| BL-020 | §4.1 cross-link network | all 20 existing blog posts | No cross-links between related posts. Maths posts should link to each other (algebra↔fractions↔percentages↔geometry). Science posts same. Stage 8 listicle (most authoritative) should link to all maths topic posts. Currently all PageRank leaks to footer/nav rather than distributing to peer content. 3 contextual links per post × 20 posts = 60 new internal edges. | M | M | queued | 2026-07-20 |

---

## Active

*(items pulled into the current cycle's experiment plan)*

| ID | Tactic | Target page / keyword | Evidence | Impact | Effort | Status | Added |
|----|--------|-----------------------|----------|--------|--------|--------|-------|
| BL-EXP1 | §3 indexing — canonical/sitemap fix | all pages + sitemap.xml | Cloudflare Pages 308-redirects .html → extensionless; all canonicals/og:url/sitemap declared .html. Google already overriding declared canonical. | H | H | active | 2026-07-14 |
| BL-EXP2 | §4.2 CTR fix — title/meta rewrite | /computing | Position 4.64, 11 impressions, 0% CTR. Title did not front-load primary keyword. | H | L | active | 2026-07-14 |

---

## Done

*(experiments completed and scored, or hygiene items confirmed fixed)*

| ID | Tactic | Target | Outcome | Done date |
|----|--------|--------|---------|-----------|
| BL-font | §3 perf — render-blocking fonts | /math, /computing | Font fix (preload/onload swap, noscript fallback) applied in commit f1dfdd6. Re-PSI 2026-07-17 confirmed: /math LCP 7.1s→1.5s (score 58→86), /computing LCP 6.9s→2.9s (score 64→81). Both now in "good" range. Homepage still needs separate investigation (BL-001). | 2026-07-14 |

---

## Exhausted

*(hypotheses that failed 2+ refinements — never retry without new external evidence)*

*(none yet)*
