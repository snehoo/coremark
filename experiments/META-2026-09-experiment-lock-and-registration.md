# META-2026-09 — experiment-lock-and-registration

- **Meta-loop run:** cycle 3, 2026-09-14 (first meta-loop review — completed_cycles reached 3)
- **Status:** PROPOSED, awaiting human approval — NOT applied to the SOP yet

## Diagnosis (the loop, not the site)

Reviewed: Scoreboard, Tactic Scoreboard, Lessons Learned, Rolled-Back Changes, Human Feedback
Log, SOP-CHANGELOG.md (empty), BACKLOG.md.

**Finding 1 — out-of-band sessions keep overwriting open experiments before a clean read.**
Between 2026-07-20 and 2026-08-13, 4 registered experiments (EXP-2, EXP-3, EXP-4,
EXP-KA-CURRICULUM) were silently overwritten by later out-of-band edits to the same pages
before reaching their review date — already flagged as a process lesson on 2026-08-15 and
filed as BL-034. This meta-loop review confirms the pattern is real and recurring, not a
one-off: 4 of 9 tracked experiments in the affected window produced no usable signal.

**Finding 2 — out-of-band sessions also skip the bookkeeping, not just the content lock.**
New this cycle: a 2026-09-03 out-of-band session shipped 3 title/meta changes
(EXP-GRADING-2026, EXP-KA-TITLE-V2, EXP-HTML-REDIRECTS) and registered them in
run-state.json's `open_experiments`, but never created the corresponding `experiments/*.md`
files and never added a Human Feedback Log entry to SEO-MEMORY.md. This run (2026-09-14) had
to spend time backfilling all 3 experiment files from git history before it could proceed.
This is the same underlying gap as Finding 1 (out-of-band sessions not following the full
loop's bookkeeping discipline) but manifesting as missing records rather than overwritten
content — worth treating as one root cause, not two.

**Finding 3 — backlog has a standing content-gap blind spot.** 6+ backlog items tagged
"H impact" (BL-009 stage-specific pages, BL-010 glossary, BL-011 comparison page, BL-012/013
stage 7/9 listicles, BL-019 free-funnel expansion) have sat in `queued` status since
2026-07-20 — never pulled into a cycle's experiment plan across 3 formal cycles. Every cycle
so far (including this one) has picked CTR/title-meta fixes over net-new content, because
CTR fixes have cleaner, faster-reading evidence (a GSC impression/CTR number) than net-new
content ROI (no data exists yet for a page that doesn't exist). This is a legitimate
evidence-discipline choice each individual cycle, but compounding across cycles it means the
loop is structurally biased away from content-gap tactics regardless of the SOP's §4 menu
intending a mix. Not proposing a forced quota (that would violate "attribution discipline
over experiment count" — the cycle-1 lesson) — flagging as a slow-building imbalance worth
a human decision, not an automatic diff.

## Proposed SOP diffs (§4 / §7 process addition — NOT yet applied)

**Diff A — pre-edit experiment lock, mandatory for any session that edits a page's
title/meta/H1 outside the full loop's Phase 5.** Before editing title, meta description, or
H1 on any page, grep `run-state.json`'s `open_experiments` (or SEO-MEMORY.md's Open
Experiments section) for that page's filename. If an OPEN experiment targets that exact
page and its review date has not passed, do not overwrite the tested element — either wait,
or if there's a clear reason to proceed anyway (new evidence invalidates the original
hypothesis, as happened legitimately with "maths booster"), explicitly note in the commit
message which open experiment is being superseded and why, so the next full-loop run can
score it as INCONCLUSIVE-superseded with a real reason instead of discovering it cold.

**Diff B — same-session registration, mandatory for any session (in-loop or out-of-band)
that ships a title/meta/content change with a stated hypothesis and success metric.** The
`experiments/*.md` file and the `run-state.json` `open_experiments` entry must be created in
the same commit or session that ships the change — not deferred to "the next formal loop
run will register it." This is what actually failed on 2026-09-03: registration happened
(run-state.json was updated) but the experiment file did not, and neither did the
SEO-MEMORY.md log entry. Diff B should be read as: registration means BOTH the run-state.json
entry AND the experiments/*.md file, done together, every time.

## Expected effect

Diff A: reduces the rate of experiments lost to overwrite-before-read (target: 0 more
INCONCLUSIVE-superseded scorings caused by same-page collision, down from 4 in the tracked
history so far).

Diff B: eliminates the backfill tax the next full-loop run currently pays when an out-of-band
session skips file creation (this run spent real effort reconstructing 3 experiment files
from git log/diffs that should have existed already).

## Review date

Score at the next meta-loop review (cycle 6, per `meta_loop_due_at_cycle` in run-state.json)
by checking whether any experiment registered between now and then was lost to a same-page
overwrite (Diff A) or shipped without a same-session experiment file (Diff B).

## Human approval required

Per SOP: meta-loop diffs require explicit human approval before being applied to the SOP
file itself. This file and the report email are the proposal; SOP-CHANGELOG.md gets an entry
and SEO-LOOP-SOP-v3.md gets edited only after the human approves.
