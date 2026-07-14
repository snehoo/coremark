# EXP-1: Canonical / og:url / Sitemap URL Alignment

**Type:** Technical (sitewide template + sitemap.xml)
**Ship date:** 2026-07-14
**Review date:** 2026-08-11 (4 weeks)
**Status:** OPEN — shipped to feature branch, PR pending human merge

---

## Hypothesis

Cloudflare Pages serves clean (extensionless) URLs by default and 308-redirects every `.html`
request to its extensionless form (confirmed via `curl -I` on `/math.html`, `/about.html`,
`/legal/privacy.html`, and all 20 blog posts — all redirect). Despite this, every page's
`<link rel="canonical">`, `<meta property="og:url">`, and every `sitemap.xml` `<loc>` entry
declared the `.html` version — a live signal conflict. GSC's URL Inspection API confirms Google
already silently overrode the declared canonical on indexed pages (e.g. `/math.html` declares
canonical `/math.html` but Google's `googleCanonical` field returns `/math`).

Aligning declared canonical/og:url/sitemap URLs with what Google already treats as canonical
should remove the signal conflict, reduce wasted redirect hops on crawl, and may help the
sitemap-level "indexed" counter (currently reporting 0/24 despite URL Inspection showing key
pages as individually indexed).

## Exact change

- `math.html`, `science.html`, `computing.html`, `about.html`, `legal/privacy.html`,
  `legal/terms.html`, and all 20 blog posts: stripped `.html` from `rel="canonical"` and
  `og:url` values.
- `sitemap.xml`: stripped `.html` from all 26 `<loc>` entries that had it.
- Deliberately NOT touched: JSON-LD `@id`, `mainEntityOfPage`, and `BreadcrumbList` item URLs
  (still reference `.html`). These resolve fine via redirect; scoped out to keep this change
  small and reversible. Candidate for a future cycle.
- Deliberately NOT touched: internal `<a href="...">` links across the site (nav, footer,
  in-content) — these consistently use `.html` site-wide by convention and still work via
  redirect. Changing every internal link is a much larger diff for a minor crawl-budget gain,
  not the actual signal-conflict bug.
- Verified all new extensionless target URLs return HTTP 200 before shipping (`/`, `/about`,
  `/math`, `/science`, `/computing`, `/legal/privacy`, `/legal/terms`,
  `/blog/child-cant-understand-algebra`).

## Target pages/keywords

Sitewide (indexing/crawl signal health), not tied to a specific keyword.

## Success metric

- Primary: GSC Page Indexing report shows the sitemap's indexed-URL count move off 0/24 with no
  drop in previously-indexed pages.
- Secondary: no decline in `clicks_28d` or `impressions_28d` vs baseline (6 clicks / 36
  impressions) attributable to this change; a canonical/redirect cleanup should never reduce
  visibility, so any drop here should be treated as a signal to roll back and investigate.

## Ship mechanism

Feature branch + PR (site.config.md requires PR review for changes to `index.html` /
`math.html` / `science.html` / `computing.html`; sitemap.xml is a sitewide file). NOT merged to
main by the agent — flagged for human approval.

## Outcome (fill at review date 2026-08-11)

WIN / LOSS / INCONCLUSIVE — reason:
Lesson for SEO-MEMORY.md:
