# SEO Memory — CoreMark (coremark.study)

---

## Baseline (set 2026-07-14 — do not edit this section)

GSC window: 2026-06-14 to 2026-07-11 (last 28d). Prior 28d (2026-05-17 to 2026-06-13) returned
zero rows — site had no recorded clicks/impressions before this window, consistent with a
newly-indexed site still ramping up.

- clicks_28d: 6
- impressions_28d: 36
- avg_ctr: 16.67%
- avg_position: 8.39
- top_queries (only 3 distinct queries surfaced by GSC at this volume; most impressions are
  too sparse per-query to be broken out — expect this to fill in as volume grows):
  - "math booster" — 0 clicks, 1 impression, position 36
  - "maths booster" — 0 clicks, 3 impressions, position 19.7
  - "maths boosters" — 0 clicks, 1 impression, position 45
- top_pages_by_clicks:
  - / — 4 clicks, 26 impressions, CTR 15.4%, position 1.19
  - /math — 1 click, 12 impressions, CTR 8.3%, position 19.5
  - /science — 1 click, 10 impressions, CTR 10%, position 10.9
  - /computing — 0 clicks, 11 impressions, CTR 0%, position 4.64

Note: sample size is extremely thin (single-digit clicks). Treat cycle-1 and cycle-2 decisions
as directional, not statistically confident. Revisit statistical rigor once clicks_28d > ~50.

---

## Scoreboard

| Run date | Cycle | Experiments shipped | Wins | Losses | Inconclusive | Clicks 28d | Δ vs baseline | Kill-switch? |
|----------|-------|---------------------|------|--------|--------------|------------|---------------|--------------|
| 2026-07-14 | 1 | 2 (canonical/sitemap fix; computing.html CTR) | 0 | 0 | 0 | 6 | baseline | OK |
| 2026-07-20 | out-of-band | 2 (EXP-3 math title/FAQ; EXP-4 science title/FAQ) | 0 | 0 | 0 | — | — | OK |
| 2026-08-03 | out-of-band ("Run 5") | 3 (EXP-KA-CURRICULUM, EXP-SME-TABLE, EXP-SCI-NAMED) + placeholder-text cleanup, mobile nav, /topics, /for-parents | 0 | 0 | 0 | — | — | OK |
| 2026-08-05 | out-of-band ("Run 6") | 0 registered (2 new blog posts, homepage GEO block, FAQPage→inline microdata migration sitewide) | — | — | — | — | — | OK |
| 2026-08-10/11/13 | out-of-band (unlogged in this file until now) | 0 registered (major GSC audit: 173 dead links removed, 143 dupe .html links fixed, 25 truncated meta descriptions rewritten, retired 0.0–6.0 scoring scale corrected on 16 pages, new baseline set — see SEO-BASELINE-2026-08-10.md; 1 new blog post) | — | — | — | 26 (3mo) | new baseline, re-measure 2026-08-24 | OK |
| 2026-08-15 | 2 (formal loop counter) | 2 (EXP-CKPT-MARKING, EXP-CKPT-SCORE) | 1 (EXP-1) | 0 | 4 (EXP-2, EXP-3, EXP-4, EXP-KA-CURRICULUM — all superseded by later out-of-band rewrites before a clean read) | 27 | ramping (see note) | OK |

---

## Lessons Learned

*(dated bullets added after each cycle — this is the compounding asset)*

- 2026-07-14 — Cloudflare Pages serves clean (extensionless) URLs by default and 308-redirects
  every `.html` request to its extensionless form. But every canonical tag, og:url tag, and
  sitemap.xml entry sitewide declared the `.html` version. Google's own URL Inspection had
  already silently overridden the declared canonical on indexed pages (picked the extensionless
  URL instead) — a live signal conflict. Lesson: when a static-hosting platform does automatic
  clean-URL redirects, canonical/sitemap/social-meta URLs must be generated in the same
  extensionless form from day one, or Google will just override them anyway and waste a
  redirect hop per crawl. Check this on any future CoreMark property before first index.
- 2026-07-14 — Site is too new/low-volume (6 clicks/28d) for query-level striking-distance or
  CTR experiments to be evidence-based yet. Chose to spend cycle 1 on a structural fix
  (canonical/sitemap alignment) plus one directional CTR test on a page with impressions but
  zero clicks (computing.html, position 4.6, 0/11 CTR) rather than force 4 experiments out of
  noise. Lesson: don't pad a cycle with speculative experiments just to hit the playbook's
  suggested count — attribution discipline matters more than experiment count when data is thin.
- 2026-08-15 — Fresh GSC pull surfaced the single biggest CTR gap seen in this loop so far
  on a page (cambridge-checkpoint-marking-explained.html, 192 impressions/28d at position 5.0
  but 1.0% CTR) purely from a title/meta over-length bug: title 83 chars, meta description
  227 chars, both far past Google's SERP truncation limits. Lesson: add a length check to the
  writing-quality checklist enforcement, not just a static limit stated in the SOP — a page can
  ship with title/meta well past the stated 60/155 char limits without anyone catching it if no
  step actually counts characters. This run's verifier sub-agent caught it by literally counting
  chars in the diff; earlier cycles evidently did not.
- 2026-08-15 — Found a worse version of the same gap: cambridge-checkpoint-score-explained.html
  had its `<title>` and meta description correctly updated to describe the current Cambridge
  Checkpoint 0–50 scale (in commit a953317, 2026-08-10), but the page's H1, takeaway box,
  comparison table, strand section, and both FAQ blocks (inline HTML *and* a separate FAQPage
  JSON-LD block) still described the retired 0.0–6.0 scale in detail, using "4.5" as the running
  example throughout — a direct, page-internal self-contradiction, and a direct contradiction of
  Cambridge's own top-ranking pages for the exact query this page targets. Lesson: a "fix the
  scale everywhere" audit needs a completeness check (grep the old value across the *whole* repo
  after the fix, not just the specific paragraphs edited) — this bug survived one dedicated
  scale-correction commit that explicitly listed "16 pages fixed" and this page apparently
  wasn't fully covered by it, or the fix touched only the meta layer and missed the body.
- 2026-08-15 — This page also revealed that a FAQPage JSON-LD block, explicitly removed
  sitewide in favor of inline itemscope/itemprop microdata on 2026-08-05 (commit ea55af0,
  "Remove FAQPage JSON-LD from all 33 existing blog posts"), was back in this file by
  2026-08-10 (edited, not removed, by commit a953317) — meaning either the 8/5 removal missed
  this file, or something reintroduced it. This page currently has no inline FAQ microdata at
  all, only the (now-fixed) JSON-LD block. Filed as BL-032: audit all blog posts for FAQPage
  JSON-LD vs inline-microdata consistency, not just this one page.
- 2026-07-14 (post-cycle gap-fill) — Fixed 3 items the agent found but deferred:
  (1) Google Fonts render-blocking stylesheet replaced with preload/onload swap + noscript
  fallback on all 30 pages — LCP was poor (>4s) on home/math/computing due to this single tag.
  (2) free.html canonical + og:url aligned to extensionless URL (completing EXP-1 scope).
  (3) JSON-LD @id/mainEntityOfPage/BreadcrumbList URLs stripped of .html suffix across all 20
  blog posts and about.html — these were the last remaining .html signals after EXP-1.
  Committed to main as f1dfdd6. Not registered as experiments (technical cleanup, not content
  changes; no success metric to track beyond "no regression").

---

## AI-Filler Blocklist

Never use these words/phrases in any content:
- leverage, streamline, robust, delve, seamless, unlock, elevate, game-changer
- "in today's fast-paced world"
- "it's important to note"
- "furthermore", "moreover" (as paragraph openers)
- "comprehensive" (as generic filler)
- "ensure" when "make sure" reads naturally

*(Human may append to this list via the Human Feedback Log below)*

---

## Open Experiments

- **EXP-1 (2026-07-canonical-sitemap-fix)** — shipped 2026-07-14, review 2026-08-11.
  **SCORED WIN 2026-08-15.** Canonical/og:url tags confirmed still extensionless sitewide;
  sitemap.xml has zero `.html` entries. Reinforced (not undone) by the 2026-08-10 audit, which
  additionally fixed 143 internal `.html` links that were splitting indexing signal between
  `/blog/x` and `/blog/x.html`. No regression found. Closing out — no further tracking needed.
- **EXP-2 (2026-07-computing-ctr-title)** — shipped 2026-07-14, review 2026-08-04.
  **SCORED INCONCLUSIVE (superseded) 2026-08-15.** computing.html's title was rewritten again
  on 2026-08-03 (BL-026) and again on 2026-08-10 (GSC audit), both times replacing the
  originally-tested treatment before a clean read was possible. Current title targets the bare
  syllabus code "0860" (computing.html now ranks #1 for that query) — a different, later
  hypothesis, not formally re-registered as its own experiment. Not retrying EXP-2's specific
  title text; if computing.html's CTR needs another look, open a fresh experiment against the
  page's *current* title.
- **EXP-3 (2026-07-maths-boost)** — shipped 2026-07-20, review 2026-08-14.
  **SCORED INCONCLUSIVE (superseded) 2026-08-15.** The tested hypothesis (retitle /math to
  match "maths booster") was itself invalidated by later SERP research: "maths booster" was
  found to be JEE/SSC-coaching intent with zero Cambridge relevance (see
  SEO-BASELINE-2026-08-10.md SERP intelligence). /math was deliberately retitled away from
  "Boosters" on 2026-08-10 toward "Cambridge Lower Secondary Maths (0862)" — the opposite
  direction from EXP-3's hypothesis, and the right call. **Do not chase "maths booster" again.**
- **EXP-4 (2026-07-science-boost)** — shipped 2026-07-20, review 2026-08-14.
  **SCORED INCONCLUSIVE (superseded) 2026-08-15.** Same pattern as EXP-3 — /science retitled
  again 2026-08-10 toward "Cambridge Lower Secondary Science (0893)", moving off "Boosters".
- **EXP-ADS-002 (2026-07-phrase-match-trim)** — review 2026-07-30.
  Phrase match keyword trimming in Google Ads CoreMark campaign. See ads-backlog.md.
- **EXP-KA-CURRICULUM (2026-08-03)** — shipped 2026-08-03, review 2026-08-17.
  **SCORED INCONCLUSIVE (superseded) 2026-08-15, ahead of its own review date.** GSC showed
  "khan academy cambridge curriculum" at position 4.5 but 0 clicks; title/H1 were fixed to
  include "curriculum". That title was overwritten again on 2026-08-11 (commit 13e1b7e) with
  a completely different title ("Does Khan Academy Cover Cambridge Lower Secondary? What It
  Gets Right and What It Misses") that no longer contains "curriculum" at all — the treatment
  no longer exists on the live page, 6 days after shipping and before its own review date.
  Scoring early rather than waiting for a review date whose premise is already gone. See
  process lesson below.
- **EXP-SME-TABLE (2026-08-03)** — shipped 2026-08-03, review 2026-08-17 (not yet due).
  save-my-exams-cambridge-lower-secondary.html comparison table + H2 rename. Title/meta were
  also touched by the 2026-08-10 audit (unrelated fix: meta descriptions site-wide were being
  cut mid-sentence at ~155 chars). The specific comparison-table content change appears intact.
  Score carefully at 2026-08-17 — separate the audit's CTR contribution from this experiment's.
- **EXP-SCI-NAMED (2026-08-03)** — shipped 2026-08-03, review 2026-08-17 (not yet due).
  Same caveat as EXP-SME-TABLE — title/meta touched again 2026-08-10, comparison-table content
  appears intact. Score carefully at 2026-08-17.
- **EXP-CKPT-MARKING (2026-08-15)** — shipped 2026-08-15, review 2026-09-05. Title/meta length
  fix on cambridge-checkpoint-marking-explained.html (83→54 char title, 227→151 char meta —
  both were well past SERP truncation limits at 192 impressions / 1.0% CTR / position 5.0).
  See experiments/2026-08-checkpoint-marking-ctr.md.
- **EXP-CKPT-SCORE (2026-08-15)** — shipped 2026-08-15, review 2026-09-05. Title/meta length
  fix + retired-scale content-accuracy rewrite on cambridge-checkpoint-score-explained.html
  (page's own title said "0-50 Scale" while its H1/FAQ/comparison-table still described the
  retired 0.0–6.0 scale using "4.5" as the running example — direct self-contradiction).
  See experiments/2026-08-checkpoint-score-scale-fix.md.

### Process lesson driving the EXP-2/3/4/KA-CURRICULUM scoring above

Between 2026-07-20 and 2026-08-13, at least 4 registered open experiments (EXP-2, EXP-3,
EXP-4, EXP-KA-CURRICULUM) had their specific tested treatment silently overwritten by later,
independently-reasoned out-of-band edits to the same pages — before any of them reached a
clean read. None of this was malicious or wrong on the merits (the later edits were generally
*better*, e.g. dropping "maths booster" after discovering it's the wrong search intent), but
it means 4 of this cycle's 9 tracked experiments produced no usable signal at all. This is a
bookkeeping/coordination gap, not a content problem: **whoever starts a session that touches
title/meta/H1 on a page should grep SEO-MEMORY.md's Open Experiments section for that page
first**, and either wait for the existing experiment's review date or explicitly close it out
before overwriting. Flagging for the next meta-loop review (due at completed_cycles=3) as a
candidate SOP addition: a pre-edit check step, or a lighter-weight "experiment lock" convention.

---

## Rolled-Back Changes & Reasons

*(none yet)*

---

## Technical Audit Status (as of 2026-07-14, first full run)

- [x] robots.txt present — crawling allowed including GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- [x] sitemap.xml present and linked in robots.txt
- [x] llms.txt present and well-formed
- [x] All 20 blog posts have JSON-LD schema (BlogPosting, FAQPage, BreadcrumbList)
- [x] Homepage and subject pages have Organization JSON-LD
- [x] Meta titles and descriptions present on all blog posts
- [x] Checkout, admin, delivery pages correctly disallowed in robots.txt
- [x] GSC sitemap submission — confirmed submitted, 0 warnings/0 errors. GSC's "indexed" counter
      reads 0/24 for the sitemap specifically, but URL Inspection shows homepage/math/science/
      computing are each individually "Submitted and indexed" — the sitemap indexed-count metric
      appears to lag or count differently; not treating as a live indexing crisis, but flagging
      to re-check in cycle 2 since the canonical mismatch (see below) may have been contributing.
      A second stray "sitemap" entry (`https://coremark.study/`, itself not a sitemap file) shows
      1 error in GSC — likely a leftover manual submission; low priority, note for cycle 2 cleanup.
- [x] Core Web Vitals — PageSpeed Insights API key configured 2026-07-14 (key stored in
      `.env.local`, gitignored, not in this file). Mobile performance pulled for the 4 pages
      with click data:
      - `/` — score 69, LCP 7.3s, CLS 0.068, TBT 100ms
      - `/math` — score 58, LCP 7.1s, CLS 0.211 (needs-improvement territory), TBT 170ms
      - `/science` — score 86, LCP 2.9s (only page in "good" LCP territory), CLS 0.015, TBT 210ms
      - `/computing` — score 64, LCP 6.9s, CLS 0.015, TBT 310ms
      Finding: LCP is "poor" (>4s, Google's threshold) on 3 of 4 pages — home, math, computing.
      `/science` is a clear outlier for the better; worth diffing what it's doing differently.
      Diagnosis on homepage: ~2,020ms of render-blocking-request savings available (almost
      certainly the synchronous Google Fonts `<link rel="stylesheet">` in `<head>` — no
      `media="print"` swap trick or preload used) plus ~258 KiB unused JavaScript. Per SOP §3,
      CWV is a tiebreaker not a ranking pillar — not fixing ad hoc outside the loop's cadence.
      Flagged as a strong candidate technical experiment for the 2026-08-14 cycle (fixing
      render-blocking fonts is a well-scoped, low-risk, "obvious offender" fix per the SOP).
      UPDATE 2026-07-17 (v3 test ride re-PSI): Font fix (f1dfdd6) confirmed working —
      /math LCP 7.1s→1.5s (score 58→86), /computing LCP 6.9s→2.9s (score 64→81), both now
      "good". Homepage still LCP 6.8s (score 62), render-blocking=no savings — different cause
      (likely large hero). BL-001 in BACKLOG.md updated; homepage LCP queued for cycle 2.
- [x] Internal linking audit — coarse check only (link-tag count per blog post, 36-37 each,
      includes nav/footer). No orphan pages found. Not a precise contextual-in-content-link count;
      revisit with a real crawler if a specific post looks under-linked.
- [x] Canonical tags — AUDITED, FOUND AND FIXED sitewide mismatch: every page's `<link
      rel="canonical">`, `<meta property="og:url">`, and sitemap.xml `<loc>` declared the `.html`
      URL, but Cloudflare Pages serves clean (extensionless) URLs and 308-redirects every `.html`
      request. Google's URL Inspection had already overridden the declared canonical on indexed
      pages. Fixed in EXP-1 (see Open Experiments) — canonical/og:url/sitemap now use the
      extensionless form Google already prefers. JSON-LD `@id`/`mainEntityOfPage`/BreadcrumbList
      URLs still use `.html` — intentionally left alone this cycle to keep the diff small and
      low-risk (they resolve fine via redirect); candidate for a future cycle if it matters.
- [x] Blog posts in sitemap — all 20 blog posts confirmed present in sitemap.xml
- [x] FAQ schema on blog posts — all 20 posts already have FAQPage JSON-LD. No gap found.

---

## Tactic Scoreboard

*(feeds §10 meta-loop — updated after every scored experiment)*

| Playbook tactic | Times run | Wins | Losses | Inconclusive | Avg Δclicks | Verdict |
|-----------------|-----------|------|--------|--------------|-------------|---------|
| Canonical/URL fix (§3 audit) | 1 | 1 | 0 | 0 | — | WIN — technical fix held, reinforced by later dupe-URL cleanup |
| CTR fix — title/meta rewrite | 6 (EXP-2/3/4/KA-CURRICULUM/SME-TABLE/SCI-NAMED) | 0 | 0 | 4 (superseded before read; 2 pending 2026-08-17) | — | high overwrite risk when multiple sessions touch the same pages — see process lesson under Open Experiments. Not enough clean reads yet to judge the tactic itself. |
| CTR fix — title/meta length limit | 2 (EXP-CKPT-MARKING/SCORE, 2026-08-15) | 0 | 0 | 0 | — | pending (review 2026-09-05) |
| Content accuracy fix (retired scale, self-contradiction) | 1 (EXP-CKPT-SCORE) | 0 | 0 | 0 | — | pending (review 2026-09-05) — new tactic, first run |

---

## Exhausted Hypotheses

*(never retry without new external evidence; archived after 2 LOSS or INCONCLUSIVE refinements)*

*(none yet)*

---

## Human Feedback Log

*(agent appends here after each report; human can annotate)*

2026-07-14 — Site config and memory file initialised. GSC API connection pending (see §1 of SOP).
2026-07-14 — Cycle 1 run complete. GSC connected via service account (webmasters v3 API — note:
searchconsole.googleapis.com/v1 does NOT serve searchAnalytics.query, use
www.googleapis.com/webmasters/v3 instead). Baseline recorded. Found and fixed sitewide
canonical/og:url/sitemap.xml mismatch (see EXP-1). Shipped a CTR title/meta test on
computing.html (EXP-2). Both changes are on a feature branch awaiting PR + human merge per
site.config.md write-access rules (github.com/snehoo/coremark, PR review required). Kill-switch:
OK (no prior period to compare against — traffic is ramping from zero, not dropping). No
PageSpeed API key configured — Core Web Vitals check skipped, needs setup before it can run.
2026-07-14 — PR #2 approved and merged to main by human same day. EXP-1 and EXP-2 now live in
production.
2026-07-14 — PageSpeed Insights API key configured (GCP project `coremark-seo`, free tier).
First CWV pull done same day: LCP poor (>4s) on home/math/computing, science.html is the outlier
in good shape (2.9s). Render-blocking Google Fonts stylesheet flagged as likely cause — a
candidate technical experiment for cycle 2 (2026-08-14), not fixed ad hoc.
2026-07-14 — Gmail SMTP configured (app password in `.env.local`, send script
`send_seo_report.py`). Test email confirmed delivered. Future cycle reports (§9 of SOP) now
send by email instead of chat-only; scheduled task SKILL.md updated with the exact invocation.
2026-07-15 — Upgraded to SEO-LOOP-SOP-v2. New additions wired in: run-state.json created
(cycle 1 complete, phases 0–9 done), SOP-CHANGELOG.md created (empty — meta-loop first fires
at cycle 3), Tactic Scoreboard and Exhausted Hypotheses sections added to this file, SKILL.md
updated to incorporate v2 procedures (verifier sub-agent, resumable state, bounded attempts,
meta-loop check). SOP reference path updated to
/Users/snehoomac/snehoo/AI/MD-other/seo-loop-sops 2/SEO-LOOP-SOP-v2.md.
2026-08-05 — Run 6 (SOP v3). Three content prompts executed: (1) New blog post /blog/cambridge-checkpoint-past-papers-alternatives — 5-row comparison table, 5-question FAQ inline microdata, ~980 words, targeting "Cambridge checkpoint past papers alternatives". (2) New blog post /blog/cambridge-lower-secondary-maths-stage-8-practice — 4-strand syllabus guide, named CoreMark boosters (M·N2, M·A2, M·G1, M·S1), 4-question FAQ inline microdata, ~970 words, targeting "Cambridge lower secondary maths stage 8 practice". (3) Homepage updated: "What is CoreMark?" section replaced with GEO-optimised Block 1 (3-paragraph definition, coremark.study as library of PDF booster packs); Block 2 (6-question FAQPage inline microdata) added after Block 1; existing FAQ section (8 items) updated with inline microdata; FAQPage JSON-LD removed from head (replaced by inline pattern throughout); Organization schema description updated to VERSION A definition + added foundingDate 2025 + areaServed India/International; WebSite schema description added + dateModified updated to 2026-08-05. Both new blog posts added to sitemap.xml. FAQPage JSON-LD also removed from blog post 1 (cambridge-checkpoint-past-papers-alternatives.html) per inline-only rule. All three new pages use BlogPosting + BreadcrumbList JSON-LD in head; FAQ sections use itemscope/itemprop only.

2026-08-15 — Run 2 (formal loop counter; see run-state.json reconciliation_note for the full
out-of-band history this entry is closing the gap on). GSC 28d window: 2026-07-18 to
2026-08-14 vs prior 2026-06-20 to 2026-07-17. Clicks 27 vs 8 (up, ramping — no kill-switch
concern; only a drop triggers it). Impressions 970 vs 39 (large jump, consistent with the
2026-08-10 audit's new content + fixed indexing going live and being recrawled). Site-wide CTR
looks like it dropped (2.8% vs 20.5%) but this is a base-rate artifact of impressions growing
9x faster than clicks while new pages/queries are still accumulating position — not treated as
a real signal. Found run-state.json badly out of sync with actual history (see reconciliation
above) and reconciled it. Scored 7 open experiments: 1 WIN (EXP-1), 4 INCONCLUSIVE-superseded
(EXP-2, EXP-3, EXP-4, EXP-KA-CURRICULUM — all overwritten by later out-of-band edits before a
clean read), 2 left OPEN pending their 2026-08-17 review (EXP-SME-TABLE, EXP-SCI-NAMED).
Biggest finding: two blog posts (cambridge-checkpoint-marking-explained.html,
cambridge-checkpoint-score-explained.html) had title/meta well past SERP length limits, and
the second also had a page-wide self-contradiction (title said "0-50 scale", entire body still
described the retired 0.0-6.0 scale). Shipped fixes for both as EXP-CKPT-MARKING and
EXP-CKPT-SCORE, verified via fresh-context sub-agent (caught one leftover "decimal number"
phrase, fixed and rechecked before shipping), committed and pushed directly to main per SOP §7
(blog/ changes). PageSpeed Insights API returned 429 (quota exhausted) — CWV delta audit
skipped this cycle, no other technical/indexing issues found (sitemap coverage complete,
robots.txt clean, canonicals still consistent). Did not attempt to score the 2026-08-10 GSC
audit itself — that has its own dedicated baseline (SEO-BASELINE-2026-08-10.md) with an
explicit 2026-08-24 re-measure date; scoring it early would cross into a known-noisy window
(GSC lag ~2 days, first clean post-change week is 2026-08-13→2026-08-20). Meta-loop not due
this cycle (due at completed_cycles=3, currently at 2).

2026-08-03 — Run 5 (SOP v3). GSC 28d window: 2026-07-06 to 2026-08-02 vs prior 2026-06-08
to 2026-07-05. Notable findings: (1) "khan academy cambridge curriculum" ranking pos 4.5 with
0 clicks — title mismatch ("Maths" not "curriculum") → fixed title/H1. (2) save-my-exams
and science-resources both at pos 12.5 with 26–28 impressions and 0 clicks — added named
comparison tables to both. (3) Placeholder text ("Placeholder image — swap for licensed photo")
was live in 31 blog posts — removed across all. (4) Mobile hamburger nav added to all 40 pages
(all blog posts + main pages) in two commits. (5) /topics.html (88 topics, ItemList JSON-LD)
and /for-parents.html (parent guide, FAQPage schema) created and submitted to sitemap.
(6) Homepage checkpoint explainer section removed. (7) Title/H1/meta rewrites on math.html,
science.html, computing.html, does-khan-academy post, save-my-exams post, science-resources post.
3 new experiments registered: EXP-KA-CURRICULUM, EXP-SME-TABLE, EXP-SCI-NAMED.
Review date for all three: 2026-08-17.
