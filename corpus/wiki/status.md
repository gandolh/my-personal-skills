---
summary: Snapshot of the skills library - on 2026-11-09 version 0.35.0 and the 26 briefs filed that day (02-27) with what each is for; after the grilling of 2026-11-10, the trackers, brief 27's library half at version 0.36.0 (the house-style skill and the plugin's hooks), brief 02's base-ui skill at version 0.37.0, brief 03's code-structure skill at version 0.38.0, house-style 1.0.0 at version 0.39.0, brief 24's Hallmark at version 0.40.0 (2026-11-11), the server wave's lessons folded into code-structure at version 0.43.0, and the UI wave's lessons folded into base-ui at version 0.44.0 with trackers 15 and 16 closed (2026-11-12), and the four history-driven releases of 2026-11-17 (briefs 32-35, v0.55.0 to v0.58.0) with three briefs waiting on the owner's pick (36-38). Then the model-routing review of the same day: review runs on Opus (brief 39, v0.59.0), with the follow-up briefs listed in the last section.
updated: 2026-11-17
---

# Status

As of 2026-11-09 the library is at v0.35.0, with 26 skills. Brief 01 is
done. Briefs 02-27 were filed on 2026-11-09 and are **specs only**: the
owner asked for research and briefs, with a grilling on 2026-11-10 before
anything is built. The questions for it are in
[open-questions.md](open-questions.md).

| Brief | What it is for | State |
|---|---|---|
| 01 The corpus skills learn blocked briefs and todos | | built, v0.34.0 |
| 02 A base-ui skill, styled with Tailwind | conventions, patterns, checker | built, v0.37.0 |
| 03 A code-structure skill for Fastify + React | layout, zod route schemas, boundaries | built, v0.38.0 |
| 04 Every repo on Base UI 1.9.0 | version bump across the estate | done 2026-11-12 (trips pinned last) |
| 05-14 Whole apps to Tailwind | Shelfmark, Almanac, Postern, Newspapper, ward-auth, Satchel, wicket, the-board, lantern, the mini todo app | superseded by each repo's Tailwind brief, all done |
| 15 Enforce the two skills in every repo | checkers, rules files, gates | done, 71 repo briefs in 23 repos |
| 16 Fastify servers adopt the structure | 16 servers, smallest first | done, 17 servers, v0.43.0 |
| 17 Review comments and finishing a branch | from obra/superpowers | superseded 2026-11-13 (rule folded into 20) |
| 18 A diagnose skill and the skill-writing rules | from mattpocock/skills | done, v0.51.0 (wizard dropped) |
| 19 A skills stocktake and MCP pin review | from affaan-m/ecc | done, v0.48.0 |
| 20 Surgical changes in the chunk contract | from andrej-karpathy-skills | done, v0.50.0 |
| 21 The Agent Skills format | from anomalyco/opencode | built, v0.35.0 |
| 22 A second model in the review gate | from stablyai/orca | todo |
| 23 A session-start hook on the corpus | from thedotmack/claude-mem | todo |
| 24 Vendor Hallmark, adopt taste-skill 2.5's ideas | nutlope/hallmark, leonxlnx/taste-skill 2.5.1 | built, v0.40.0 |
| 25 Cloudflare's security audit, on ward-auth first | cloudflare/security-audit-skill | todo |
| 26 Model evals for the library's prompts | pingdotgg/t3code, `claude plugin eval` | done, v0.52.0 (first paid run is an owner step) |
| 27 A house style and a quality harness | the measured style, lint, format, hooks | built, v0.39.0 |

Other repos got their own briefs on the same day:

- **Shelfmark 04:** book recommendations.
- **Newspapper 06:** a post as a video (heygen-com/hyperframes).
- **public-resource-map 01:** a source registry and map links that can be
  shared (bilawalsidhu/gods-eye-view).
- **presentation-sites 01:** Hallmark against taste-skill on one site
  (nutlope/hallmark).

Where things stand: the research is in the briefs, each with its sources
and dates. The measurements are in brief 27 (style, Prettier churn) and
brief 19 (the plugin's token cost: about 5,322 tokens always-on). The
spikes (Base UI 1.9.0 types; Fastify with the zod provider) are recorded
in briefs 02 and 03.

Owner steps: the grilling on 2026-11-10, then review the PRs. Nothing is
deployed.

## 2026-11-10 and 2026-11-11

The six entries of these two days (the grilling and the trackers, and the
releases v0.36.0 to v0.40.0) are in
[status-2026-11-10-and-11.md](status-2026-11-10-and-11.md).

## 2026-11-12: brief 16 done, the server wave folded into code-structure, v0.43.0

The library is at v0.43.0, with 29 skills. Brief 16, the tracker for the 17
Fastify servers, is done: every server moved to the structure, and the
brief's outcome note holds the table of before and after. `code-structure`
now carries what the moves found: two new references
(`shutdown-and-timeouts.md`, `reply-capture.md`), corrections where the
builds disproved the skill, and an answer to 3D-sandbox's headers claim,
which did not hold on Fastify 5.12.7 or 5.12.8. The house-style findings are
one todo for a release brief. Owner step: update the plugin to 0.43.0.

## 2026-11-12: the UI wave folded into base-ui, brief 15 done, v0.44.0

The library is at v0.44.0, with 29 skills. Every web repo's Base UI and
Tailwind brief is done, and `base-ui` took what they found: rule 16 as the
builds settled it, a new `conversion-traps.md` reference, the dry run's
steps in `migrating-from-plain-css.md`, and lessons in the theme, toast,
drawer, dialog, confirm, select, switch, menu and tabs pages, each with its
source repo. Where a claim is about Base UI it was re-run on 1.9.0 in a
scratch folder. Brief 15, the tracker for the harness, Base UI, Tailwind and
server briefs of 23 repos, is done: its outcome note has the table, and two
flags (Shelfmark's `--warn-only` on `check-structure`, and imbatranimOS not
running it). Brief 04 stays open: every table row is pinned at 1.9.0, but
websites/trips, which the table missed, declares `^1.6.0` and resolves 1.8.0.
The UI wave's house-style findings joined the server wave's todo. Owner step:
update the plugin to 0.44.0.

## 2026-11-12: brief 29, workflow agents and verify-brief, v0.46.0

The library is at v0.46.0, with 29 skills and 12 agents. Brief 29 is done:
`verify-brief.mjs`, the `agent-guard` hook, and the `brief-builder`,
`screen-capturer`, `brief-auditor` (draft) and `owner-steps` agents, which
`plan-split-dispatch` now uses. Owner steps: run
`node scripts/install-agents.mjs`, smoke-test a bare `brief-builder` in a new
session, and update the plugin to 0.46.0.

## 2026-11-12: brief 30, the design team and design-pipeline, v0.47.0

The library is at v0.47.0, with 30 skills and 12 agents. Brief 30 is done:
the four design agents left draft with the redesign pilot's lessons, and the
new `design-pipeline` skill runs them in order, director to publish, with a
tested pair maker. Owner step: update the plugin to 0.47.0. Open: re-run the
judge's calibration case after the G3 wording change.

## 2026-11-13: brief 19, the stocktake skill and the 5,000-token cut, v0.48.0

The library is at v0.48.0, with 31 skills and 12 agents. Brief 19 is done:
the new `stocktake` skill audits the library (quick and full modes, a six-item
rubric, `measure.mjs`), `check-mcp-pins.mjs` fails on unpinned MCP package
references, and the five front-door skills have scenario files for brief 26.
Q30 is done: `corpus-flow` and `plan-split-dispatch` keep their rules inside
their first 5,000 tokens. The first stocktake,
[stocktake-2026-11-13.md](stocktake-2026-11-13.md), has 13 ranked findings
for the owner to pick from: the always-on cost is about 6.9k tokens, and no
description is over the limit. Owner step: update the plugin to 0.48.0.

## 2026-11-13: brief 26, model evals, v0.52.0

The library is at v0.52.0, with 32 skills. Brief 26 is done: `evals/` holds three
evals (triggering, numbering, injection) run by `claude plugin eval`, their case
data, graders and grader tests. No model was called while building it. Owner step:
run each eval once and fill the results table in [evals.md](evals.md).

## 2026-11-13: brief 31, house-style 1.3.0, v0.53.0

The library is at v0.53.0, with 32 skills. Brief 31 is done: house-style 1.3.0
adds the `domain/` root and two preset rules, and fixes the waves' checker
defects. Its CHANGELOG says what a re-sync fires and what each repo can delete.
The tag `house-style-v1.3.0` is local. Owner steps: push main with the tag,
update the plugin to 0.53.0, and re-sync the estate after imbatranimOS 89. Open
on the board: whether the preset takes sports-app's plugin rule.

## 2026-11-17: briefs 32-35 from the session history, v0.58.0

The library is at v0.58.0, with 33 skills. Four briefs came from reading the
session history against the stocktake of 2026-11-13: `grill-me` asks one
explained question at a time (32), `orchestrate` holds its gate under the
5,000-token cut (33, closing F5, F8 and F9), `plan-split-dispatch` has an agent
cap and status lines and reads `routing.md`'s `Branching` and `Worktrees` (34),
and the five largest listings are shorter (35, closing F2). Always-on is about
6,600 tokens. Blocked on the owner's pick: 36 (the unused Vercel skills, F1), 37
(the workflow agents listed twice) and 38 (`brief-auditor` still a draft). Owner
steps: the paid evals for the three front-door skills, the plugin update, the
push. Still open from the stocktake: F3, F4, F6, F7 and F11 to F13.

## 2026-11-17: the model-routing review, from v0.59.0

A month of the owner's subagent runs (2026-10-19 to 2026-11-17, 624 runs) was
read against the library's routing rules, and the owner answered three
questions: review runs on Opus, the advisor model stays, effort follows the
session ([decisions.md](decisions.md)). What follows from it:

| Brief | What it is for | State |
|---|---|---|
| 39 Review runs on Opus | every finder and `brief-auditor` on opus, a completion line on step 7 | built, v0.59.0 |
| 40 An opus dispatch names its reason, and the trivial tier goes | the senior list is binding, two tiers | built, v0.60.0 |
| 41 The design pipeline dispatches its agents by type | no definition pasted into `general-purpose` | built, v0.61.0 |
| 38 brief-auditor leaves draft, or goes | the owner picked the five-brief trial, on opus | todo, trial not run |
| 42 A builder hands back before its run gets long | a trial on three long briefs, no budget number yet | todo |
| 43 Builders edit files through the shell | cause found (the model batches in the shell; one line does not change it), a recommendation waits for the owner's pick | todo, findings in the brief |

Owner steps: the paid evals for `plan-split-dispatch`, the plugin update to
0.61.0, a re-run of `scripts/install-agents.mjs`, the push. One question is on
ticket 41: whether five `effort: high` lines in the library's agent
definitions stay, now that effort follows the session. Briefs 38 and 42 need
real builds, so they run inside the next brief run of any repo.
