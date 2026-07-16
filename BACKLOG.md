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
| BL-002 | §4.1 striking distance | /math / "cambridge lower secondary maths" | /math: position 19.5, 12 impressions, 8.3% CTR, 1 click. Strong commercial intent keyword. Once indexed properly (EXP-1 effect), likely to move into top-15. Candidate for on-page depth + H1/intro rewrite to match "cambridge lower secondary maths" intent more directly. Wait until EXP-1 scored before touching /math. | H | M | queued | 2026-07-14 |
| BL-003 | §4.1 striking distance | /science / "cambridge lower secondary science" | /science: position 10.9, 10 impressions, 10% CTR, 1 click. Just outside top-10. Similar prescription to BL-002: on-page depth, intent-matching intro, internal links from blog posts. Wait until EXP-1 scored. | M | M | queued | 2026-07-14 |
| BL-004 | §4.4 content gap | /free.html / "free cambridge checkpoint maths" | No click data yet but /free.html is the top-of-funnel lead magnet. Not yet appearing in GSC queries — may not be indexed or may need a title/meta pass. Verify indexation and check title for keyword match. Low effort to diagnose. | M | L | queued | 2026-07-14 |
| BL-005 | §3 structured data | blog/ — JSON-LD @id + BreadcrumbList URLs | Cycle 1 gap-fill (commit f1dfdd6) stripped .html from JSON-LD on all 20 blog posts. Verify in GSC Rich Results Test that no schema errors appeared post-fix. Quick check, not a full experiment — move to done if no errors found. | L | L | queued | 2026-07-14 |
| BL-006 | §3 perf | /math — CLS 0.211 | Re-PSI 2026-07-17: /math CLS still = 0.211 (needs-improvement, threshold <0.1). LCP now excellent (1.5s) so CLS is the remaining /math metric to fix. Likely late-loading element causing layout shift — could be the hero image without explicit dimensions, or a font FOUT. Investigate /math hero section for missing width/height attrs. | M | M | queued | 2026-07-17 |
| BL-007 | §4.6 GEO / AI-search | homepage + subject pages | No AI Overview citations detected yet (qualitative only — not crawled). Site has llms.txt and AI crawlers allowed. Once traffic grows, add direct-answer blocks ("What is Cambridge Lower Secondary?", "How do I prepare for Cambridge Checkpoint?") near page tops to be quotable. Defer until cycle 3+ — premature at current traffic level. | M | M | queued | 2026-07-14 |
| BL-008 | §4.4 content gap | blog/ — new post | No blog post targeting "cambridge checkpoint stage 7 maths" or "cambridge lower secondary stage 7 revision". DataForSEO not yet configured — validate volume manually via GSC query data once impressions grow. Draft only; human must approve publishing per §9 (first 3 cycles). | M | H | queued | 2026-07-14 |

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
