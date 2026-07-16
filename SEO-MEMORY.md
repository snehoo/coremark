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
  Metric: sitemap "indexed" count in GSC Page Indexing report should move off 0/24; no
  regression in indexed page count or clicks. Status: OPEN, merged to main via PR #2, live.
- **EXP-2 (2026-07-computing-ctr-title)** — shipped 2026-07-14, review 2026-08-04 (3 weeks;
  CTR is fast-feedback per SOP §4.2). Metric: computing.html CTR ≥15% (up from 0% on 11
  impressions) without a position drop. Status: OPEN, merged to main via PR #2, live.

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
| Canonical/URL fix (§3 audit) | 1 | 0 | 0 | 0 | — | pending (review 2026-08-11) |
| CTR fix — title/meta rewrite | 1 | 0 | 0 | 0 | — | pending (review 2026-08-04) |

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
