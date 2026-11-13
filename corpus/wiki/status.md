---
summary: Snapshot of the skills library - on 2026-11-09 version 0.35.0 and the 26 briefs filed that day (02-27) with what each is for; after the grilling of 2026-11-10, the trackers, brief 27's library half at version 0.36.0 (the house-style skill and the plugin's hooks), brief 02's base-ui skill at version 0.37.0, brief 03's code-structure skill at version 0.38.0, house-style 1.0.0 at version 0.39.0, brief 24's Hallmark at version 0.40.0 (2026-11-11), the server wave's lessons folded into code-structure at version 0.43.0, and the UI wave's lessons folded into base-ui at version 0.44.0 with trackers 15 and 16 closed (2026-11-12).
updated: 2026-11-13
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
| 26 Model evals for the library's prompts | pingdotgg/t3code, `claude plugin eval` | todo |
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

## 2026-11-10: grilled, trackers written

The owner's grilling of 2026-11-10 is done (Q1-62 answered; see
[grilling-2026-11-10.md](grilling-2026-11-10.md) and
[grilling-2026-11-10-technical-calls.md](grilling-2026-11-10-technical-calls.md)).
The corpus follows it, still specs only, nothing built:

- Briefs 04, 15 and 16 are **trackers** of each repo's own briefs.
- Briefs 05-14 are **superseded** by each repo's own Tailwind brief.
- Briefs 02, 03 and 27 carry the answers and the Round 8 and later facts as
  dated decisions. Brief 19 takes Q30, 25 takes Q34, 26 takes Q35.
- Brief 17 is now "finish on main" (Q31). Brief 24 is now "Vendor Hallmark,
  and adopt taste-skill 2.5's ideas" (Q39).
- Brief 22 is **blocked**: no second vendor's CLI is installed (Q32).
- Brief 28, *The estate redesign board*, is new and depends on 24.
- The work happens on `main` in each repo, with no PRs (Q4). Phase B builds
  the Base UI bumps first.

## 2026-11-10: brief 27's library half, v0.36.0

The library is at v0.36.0, with 27 skills. Brief 27 is in progress: the
`house-style` skill, the plugin's first hooks (`hooks/hooks.json`: the
formatter and the `Stop` check) and the measurements
([house-style.md](house-style.md)) are built. Its `house-style/` folder, the
tag `house-style-v1.0.0` and Wicket's proof run are left. Owner step: update
the plugin to 0.36.0 so the skill and hooks are live.

## 2026-11-11: brief 02, the base-ui skill, v0.37.0

The library is at v0.37.0, with 28 skills. Brief 02 is done: `base-ui`
states 17 numbered rules for React UI on Base UI 1.9.0 with Tailwind, each
with its `check-base-ui` rule or "review", and 16 references of wrappers to
copy, every TypeScript block compiled against the 1.9.0 types. House-style
1.0.0 (still untagged) takes exceptions for base-ui rules 1-17, and its rule
9 no longer warns on a trigger's own parts. Each app's Tailwind and Base UI
briefs now have the skill to follow, in the owner's Q20 order. Owner step:
update the plugin to 0.37.0.

## 2026-11-11: brief 03, the code-structure skill, v0.38.0

The library is at v0.38.0, with 29 skills. Brief 03 is done:
`code-structure` states 11 numbered rules for the Fastify servers and their
React apps, each with its source and its `check-structure` rule,
dependency-cruiser rule or "review", and five references: a server skeleton
and a web API client whose 23 TypeScript blocks compile and whose tests
pass against Fastify 5.12.8 and the zod type provider, the provider's
measured behaviour, the research, and `migrating-a-server.md`, the order
each repo's server brief follows (brief 16 tracks them; wicket's brief 13 is the
first to use it). The checker was already built in house-style 1.0.0 and was not
changed. Owner step: update the plugin to 0.38.0.

## 2026-11-11: brief 27, house-style 1.0.0, v0.39.0

The library is at v0.39.0, with 29 skills. Brief 27 is done: `house-style`
1.0.0 is released in its CHANGELOG (the controller tags `house-style-v1.0.0`
after the closeout commit), with the findings of wicket's proof run folded
into the package, the `house-style` skill and the `base-ui` skill. Owner
step: update the plugin to 0.39.0.

## 2026-11-11: brief 24, Hallmark, v0.40.0

The library is at v0.40.0, with 29 skills. Brief 24 is done. Hallmark is
vendored at `407fa68` without its two installers, and its Together AI comp
step sits behind a written guard. taste-skill 2.5's trade palettes and copy
layer are in `design-md-library`. The taste suite is opt-in at its old pin,
and `orchestrate` routes a redesign to Hallmark. Brief 28, the estate
redesign board, can start. Owner step: update the plugin to 0.40.0.

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
