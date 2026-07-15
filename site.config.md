# Site Config — CoreMark

- site_url: https://coremark.study
- gsc_property: sc-domain:coremark.study
- gsc_credentials: /Users/snehoomac/snehoo/AI/CoreMark/Website/coremark-seo-72766c6507c9.json
- site_repo: /Users/snehoomac/snehoo/AI/CoreMark/Website/
- blog_location: /Users/snehoomac/snehoo/AI/CoreMark/Website/blog/ (static HTML; deploy via Cloudflare Pages on push to main)
- deploy_method: git push to main → Cloudflare Pages auto-deploys
- cadence: monthly (every 4 weeks; bump to every 2 weeks once we have 3+ months of data)
- kill_switch: organic clicks drop >20% vs prior 28-day period for 2 consecutive cycles → stop all changes and alert human
- budget_note: alert human if a single run appears to exceed ~$10 in token cost

## Business Context

CoreMark sells downloadable PDF practice boosters for the Cambridge Lower Secondary curriculum
(Stage 7, 8, 9 — Maths, Science, Computing). Target customer: parents of students aged 11–14 at
international schools, primarily India and South Asia.

Conversion hierarchy:
1. Purchase — ₹249 single booster / ₹799 5-pack / ₹1,299 subject bundle / ₹1,299 stage bundle
2. Lead — free booster email signup at /free.html (feeds Brevo nurture → purchase)

Full funnel:
- Top: organic / ad → /free.html → email capture → 5-email nurture → purchase
- Bottom: organic / paid search → index.html or subject pages → direct purchase

CoreMark differentiator: only Cambridge Lower Secondary resource built for parents (not students),
includes parent/tutor guide, one-time price, instant PDF download, no subscription.

## Target Keywords (seed list)

- cambridge lower secondary maths (primary)
- cambridge checkpoint maths
- cambridge checkpoint past papers
- cambridge checkpoint preparation
- cambridge lower secondary science
- cambridge lower secondary computing
- cambridge checkpoint stage 7 / stage 8 / stage 9
- igcse lower secondary (crossover intent)
- cambridge checkpoint practice papers
- cambridge lower secondary revision
- cambridge lower secondary algebra / fractions / geometry / percentages
- cambridge checkpoint biology / chemistry / physics
- checkpoint exam preparation india

## Key Pages

| Page | URL | Primary Keyword |
|------|-----|-----------------|
| Homepage | / | cambridge lower secondary practice boosters |
| Maths subject | /math.html | cambridge lower secondary maths |
| Science subject | /science.html | cambridge lower secondary science |
| Computing subject | /computing.html | cambridge lower secondary computing |
| Free lead magnet | /free.html | free cambridge checkpoint maths booster |
| Blog index | /blog/ | cambridge lower secondary revision tips |

## Competitors

- hodder.co.uk / hoddereducation.com — textbook publisher; ranks for official Cambridge terms
- paperpluto.com — past papers aggregator
- khanacademy.org — free tutoring (hard to displace; avoid head-on competition)
- doubtnut.com, magnet brains — free India-focused tutoring
- ck12.org, superprof.com, learnpick.in — tutoring platforms

## Conversion Values (for ROI framing in reports)

- Single booster purchase: ₹249 (~$3)
- Lead (email signup): ~₹50 indirect value (estimated from nurture conversion rate)
- LTV if parent buys across subjects/stages: ₹800–₹2,500+

## Notification

- Email: snehalp@gmail.com — send run summary after every cycle
- Include: experiments shipped, wins/losses scored, kill-switch status, next review date
- Send mechanism: configured 2026-07-14 via Gmail SMTP + app password. Script at
  `send_seo_report.py` in this directory; credentials in `.env.local` (gitignored). See the
  scheduled task's SKILL.md §9 for exact invocation.

## Data Access

- GSC: sc-domain:coremark.study — connect via Google Search Console API or mcp-gsc MCP server.
  Note: searchAnalytics.query lives under `www.googleapis.com/webmasters/v3`, NOT
  `searchconsole.googleapis.com/v1` (that host only serves urlInspection).
- PageSpeed Insights: configured 2026-07-14, GCP project `coremark-seo` (same project as GSC).
  Key stored in `.env.local` (gitignored) as `PAGESPEED_API_KEY`, restricted to PageSpeed
  Insights API only. Free tier, no billing required.
- DataForSEO: not configured (skip competitor SERP data for now; revisit after cycle 2)
- Write access: git repo at github.com/snehoo/coremark; commit changes to feature branch, open PR for human review before merge to main
- Email: configured 2026-07-14 via Gmail SMTP + app password. Script at `send_seo_report.py`; credentials in `.env.local` (gitignored). Brevo tracks lead signups as a secondary signal but isn't API-connected to the agent.
