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
  regression in indexed page count or clicks. Status: OPEN, PR pending human merge.
- **EXP-2 (2026-07-computing-ctr-title)** — shipped 2026-07-14, review 2026-08-04 (3 weeks;
  CTR is fast-feedback per SOP §4.2). Metric: computing.html CTR ≥15% (up from 0% on 11
  impressions) without a position drop. Status: OPEN, PR pending human merge.

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
- [ ] Core Web Vitals — SKIPPED this cycle, no PageSpeed API key configured in this environment.
      Needs a Google Cloud API key with PageSpeed Insights API enabled before next run.
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
