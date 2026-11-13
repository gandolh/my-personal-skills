# Log

## [2026-11-06] done | Brief 01 - the corpus skills learn blocked briefs and todos

`corpus-flow` gained §2b and the four-folder rules, and `plan-split-dispatch`,
`orchestrate`, `improve` and `grill-me` follow it (v0.34.0). This repo's own
corpus was bootstrapped in the same run. Verified by the acceptance grep, this
repo's lint and a scratch-corpus lint with passing and failing cases. See
[the brief](briefs/done/01-the-corpus-skills-learn-blocked-briefs-and-todos.md).

## [2026-11-09] todo | Briefs 02-27: Base UI, Tailwind, code structure, a house style, and ideas from thirteen skill repos

The owner asked whether to build a shared component library over Base UI.
The verdict was no: share conventions, not components. Then the owner asked
for briefs, with research only and nothing built before the grilling on
2026-11-10. The briefs:

- 02 and 03: two skills, Base UI with Tailwind, and the Fastify and React
  structure.
- 04: the version bump to 1.9.0.
- 05-14: a whole-app Tailwind migration per plain-CSS app.
- 15 and 16: the rollout and enforcement.
- 17-26: one brief per reviewed skill repo (superpowers, mattpocock, ecc,
  andrej-karpathy-skills, opencode, orca, claude-mem, taste-skill,
  cloudflare security-audit, t3code).
- 27: the measured house style and a two-layer quality harness (`npm run
  check`, and Claude Code hooks).

Shelfmark, Newspapper, public-resource-map and presentation-sites each got
one brief in their own corpus. Sources were read in scratch clones, pinned
by commit. Two spikes back briefs 02 and 03. Questions for the grilling are
in [open-questions.md](wiki/open-questions.md).

## [2026-11-10] resume | Repo-local briefs: 10 repos written, 12 to go, Phase B not started

The cloud session paused on the owner's request after usage limits.

- **Briefs.** Repo-local briefs (house style, Base UI conventions, Tailwind,
  server structure, bumps) are in Almanac (the reference), Satchel,
  the-board, Newspapper, wicket, Shelfmark, Postern, lantern and ward-auth,
  with a partial set in mini-projects. Each is on its repo's one draft PR.
- **New questions.** Their cross-repo questions are Q47-62 on
  [open-questions-from-the-repo-briefs.md](wiki/open-questions-from-the-repo-briefs.md).
- **The hand-off** is [resume-2026-11-10.md](resume-2026-11-10.md): the
  remaining repos, the method, the repo notes, and the prompt for the next
  session.

## [2026-11-10] grill | The corpus follows the owner's answers

After the grilling of 2026-11-10 (Q1-62 answered):

- **Trackers.** Briefs 04 (Base UI bumps), 15 (harness, conventions,
  Tailwind per repo, the migration order) and 16 (the server brief per repo)
  became trackers of the repo-local briefs.
- **Superseded.** Briefs 05-14 moved to `briefs/superseded/`, each replaced by
  its repo's own Tailwind brief.
- **Blocked.** Brief 22 moved to `briefs/blocked/` (no second vendor's CLI).
- **Revised.** 02, 03 and 27 gained the answers and the facts as dated
  decisions. 17 became "finish on main", 24 "Vendor Hallmark, and adopt
  taste-skill 2.5's ideas". 19, 25 and 26 took Q30, Q34 and Q35.
- **New.** Brief 28, *The estate redesign board*.
- **Wiki.** `open-questions.md` and the Round 8 page now point at the two
  grilling pages.


## [2026-11-10] done | Brief 21 - the library meets the Agent Skills format

Added `scripts/check-skills.mjs` and called it from `corpus/lint.sh` (v0.35.0).
It found one invalid description (`improve`, an unquoted `: `), now fixed. The
two long descriptions in the brief were already under 1,024 characters. See
[the brief](briefs/done/21-the-library-meets-the-agent-skills-format-from-opencode.md).

## [2026-11-10] progress | Brief 27, the library half: the house-style skill and the hooks (v0.36.0)

- **Skill.** `skills/house-style/` writes the house style as 25 numbered rules,
  each with its rule id or "review", and the adoption order; its references
  hold the adoption traps and the review checklist, which
  `plan-split-dispatch`'s review gate now hands the conventions finder.
- **Hooks.** `hooks/hooks.json` formats each saved file with the repo's own
  Prettier and runs `check:fast` at `Stop` when the session saved code in that
  package, blocking again only while the failure changes, at most four times
  a turn.
- **Wiki.** The measurements are collated from the 23 repo harness briefs on
  [house-style.md](wiki/house-style.md) and
  [house-style-part-2.md](wiki/house-style-part-2.md), with four counts for
  the owner. [decisions.md](wiki/decisions.md) records house-style as a
  library folder (the owner's call), the width of 120 and the tsconfig flags.
- **Briefs.** 02, 03 and 15 now ship their checkers as house-style's
  `bin/check-base-ui.mjs` and `bin/check-structure.mjs`, run from each repo's
  `vendor/house-style/`, at the next minor version.
- **Left:** the `house-style/` folder, its tag and Wicket's proof run. The
  brief stays in `todo/`. See
  [the brief](briefs/done/27-a-house-style-and-a-quality-harness.md).

## [2026-11-11] progress | Brief 27, the house-style package

- **Package.** `house-style/` holds the configs, the presets and the sync,
  1.0.0 unreleased, built in a scratch repository and moved in. Its `npm test`
  runs each rule against a failing and a passing fixture, the presets on
  scratch projects, and the sync against a scratch checkout.
- **Proof on a scratch Wicket.** `--check` exits 1 before the copy and 0
  after; the lint keeps Wicket's clean state and adds only the new rules'
  findings, as its brief 10 counted.
- **Calls.** Four rules changed scope on the counts, recorded on
  [house-style.md](wiki/house-style.md) for the owner to overrule.
- **Skill.** SKILL.md and the adoption reference now match the package: the
  named `houseStyle` import, the real Tailwind rule id, the env rule's scope,
  the options, the pins, and the knip, dependency-cruiser and Tailwind lines.
- **Left:** the tag `house-style-v1.0.0` and Wicket's proof run. See
  [the brief](briefs/done/27-a-house-style-and-a-quality-harness.md).

## [2026-11-11] progress | Brief 27, the convention checkers

- **Checkers.** `house-style/bin/check-base-ui.mjs` and
  `bin/check-structure.mjs` are built, the checker steps of briefs 02 and 03,
  in house-style 1.0.0 (unreleased). Both read a repo's roots and accepted
  findings from `conventions.json` (root, `scripts/` or `tools/`), which a
  shipped JSON Schema describes; an exception without a reason is an error.
  `npm test` runs a failing and a passing fixture per rule, every malformed
  `conventions.json`, `--warn-only`, and dependency-cruiser on a boundary tree
  and a clean one.
- **Real repos.** ro-housing's `check-base-ui`: 0. `check-structure
  --warn-only`: Almanac 36, atrium 136, wicket 21, each exiting 0. The counts
  per rule are on [house-style-part-2.md](wiki/house-style-part-2.md).
- **Skill.** The adoption reference's `check:conventions` is knip,
  dependency-cruiser and both checkers, `--warn-only` until the repo's Base UI
  or server brief.
- **Left:** the tag `house-style-v1.0.0` and Wicket's proof run. See
  [the brief](briefs/done/27-a-house-style-and-a-quality-harness.md).

## [2026-11-11] done | Brief 02 - a base-ui skill, styled with Tailwind

`skills/base-ui/` (v0.37.0): 17 numbered rules for React UI on Base UI 1.9.0
with Tailwind 4, each with its `check-base-ui` rule or review, and 16
references whose 37 TypeScript blocks compile against the 1.9.0 types.
`decisions.md` records "Base UI conventions as a skill, not a shared
library". House-style's checker takes exceptions for rules 1-17 and stops
rule 9 warning on a trigger's own parts; ro-housing still reports 0. The
vendor layer sits after `base`, measured. See
[the brief](briefs/done/02-a-base-ui-skill-styled-with-tailwind.md).

## [2026-11-11] done | Brief 03 - a code-structure skill for the Fastify and React apps

`skills/code-structure/` (v0.38.0): 11 numbered rules for the Fastify
servers and their React apps, each with its source and its
`check-structure` rule, dependency-cruiser rule or review, and five
references whose 23 TypeScript blocks compile and whose 12 tests pass
against fastify 5.12.8, the zod type provider 1.0.3 and zod 4.6.7.
`decisions.md` records the four structure decisions with their rejected
alternatives. The checker was not changed; its Almanac, atrium and wicket
counts stand. A feature that type-imports `FeatureContext` from `app.ts` is
a dependency-cruiser cycle, so features name their own options type. See
[the brief](briefs/done/03-a-code-structure-skill-for-fastify-and-react-apps.md).

## [2026-11-11] done | Brief 27 - a house style and a quality harness

`house-style/` 1.0.0 (CHANGELOG released, tag `house-style-v1.0.0` by the
controller) and the `house-style` skill with its two checkers, proven on
wicket's brief 10 (pushed 2026-11-11; `npm run check` in about 18-20 s,
`check:fast` in about 5-6 s). The proof run's findings are folded in: `.cjs`
globals, where scripts go, knip workspaces, the Docker caveat, `check:fast`,
the bundle compare, comments without brief numbers, `no-circular`, and five
`base-ui` changes. Plugin v0.39.0. See
[the brief](briefs/done/27-a-house-style-and-a-quality-harness.md).

## [2026-11-11] done | Brief 24 - vendor Hallmark, and adopt taste-skill 2.5's ideas

`skills/hallmark/` (v0.40.0) is Nutlope/hallmark at `407fa68`: 185 files
copied verbatim, with `install-hook.mjs` and `install.mjs` left out for
safety and `imagegen.mjs` behind a written guard (Together AI). taste-skill
2.5's palettes dealt by trade and its copy layer are written fresh in
`design-md-library`. The four taste skills run only when called by name, the
redesign preset retired, and `orchestrate` routes a redesign to
`/hallmark redesign|audit <path>` and the estate redesign board (brief 28).
`decisions.md` revisits "Vendor third-party skills, with pins". See
[the brief](briefs/done/24-vendor-hallmark-and-adopt-taste-skill-ideas.md).

## [2026-11-11] done | house-style 1.1.0, from the eight adopting repos

house-style 1.1.0 and plugin v0.41.0 fold in the findings of the eight repos
that adopted 1.0.0 (wicket, mini-projects' todo app, 3D-sandbox,
imbatranim-apps, Lantern, SocialEvents, Satchel, Newspapper): the sync's
target is the nearest `package.json`; the `env` and `assertFunctionNames`
options; `no-import-type-side-effects`; `*.d.ts` default exports; `virtual:`
imports; rule 11 skips tests; rule 5 names the `"stylesheet"` key; the Stop
hook finds `check:fast` from the saved files; and 14 documentation notes. The
knip preset can't carry a `scripts/` entry, so the README says so. No board
ticket. The owner tags `house-style-v1.1.0`.

## [2026-11-11] done | house-style 1.2.0, from the 23 adopting repos

house-style 1.2.0 and plugin v0.42.0 fold in the findings of the 23 repos that
adopted 1.1.0. Code (two builders' first half): `scripts: []` no longer
crashes; the test relaxations and the vitest block are two widths of one idea
of a test file; `no-console` is off in tests; the `playwright` option;
`vitest/no-standalone-expect` counts hooks as test blocks; dependency-cruiser
allows React Router's `+types`; `conventions.json` gained `env`; and an early
block sets `tsconfigRootDir`. Two findings needed no code (check-structure with
no server root, `module: bundler`). Docs: the README, the adoption reference
and the skill carry 30 notes from the repos' outcomes, and
`skills/house-style/references/recipes.md` is new (per-folder blocks,
`react-refresh`, an Astro setup whose snippets were each run once). The
CHANGELOG lists, per repo, the blocks and exceptions the sync retires and the
`no-standalone-expect` directives to delete. No board ticket. The controller canaries
the candidate on three adopters, then tags `house-style-v1.2.0`. A
todo asks corpus-flow to leave room in a brief for its outcome note.

## [2026-11-12] done | brief 16, the server wave folded into code-structure, v0.43.0

Brief 16, the tracker for the 17 Fastify servers, is done: every server row is
built and its brief is in its repo's `done/`. The brief's outcome note holds
one table (check-structure before and after, the reply comparison, what is
left) and says what the tracker's Acceptance did not get: the container `CMD`
start, which no builder could run because local Docker can't build, is an
owner check after the deploys. `code-structure` took the wave's lessons,
each where a reader looks for it: two new references
(`shutdown-and-timeouts.md`, `reply-capture.md`), the skeleton's `ApiError`
`details` and `too_large` (compiled and tested again), the error plugin
registered first, the migration order (zod 4.6.7, deploy phase `all`, the
whole-repo grep for the old entry name, `--warn-only` dropped at the first
0), and the zod provider page. Re-measured on Fastify 5.12.7 and 5.12.8:
a plain `z.object` headers schema does not strip other headers (the value is
merged over the raw headers), so 3D-sandbox's note is withdrawn; a long poll
cancelled in `onClose` still held the close after 3 s, in `preClose` it took
10 ms; `reply.code(n).send(body)` fails only for a status the route doesn't
declare. The house-style findings are one todo for a release brief. Version
0.43.0.

## [2026-11-12] done | brief 15, the UI wave folded into base-ui, v0.44.0

Brief 15, the tracker for the harness, Base UI, Tailwind and server briefs of
23 repos, is done: all 71 repo briefs are in their repo's `done/`. Its outcome
note holds one table (the brief and its done commit per column, and what
`check-base-ui` and `check-structure` read today, strict, with the findings
each repo excepts) and says what the Acceptance did not get: Shelfmark still
passes `--warn-only` to `check-structure` though it reads 0 errors,
imbatranimOS does not run `check-structure` (NestJS; a read-only run finds 52
errors), and five root `CLAUDE.md` files are well past short. `base-ui`
took the UI wave's lessons (version 0.44.0): rule 16's three cases, a new
`conversion-traps.md`, and the pages each lesson belongs on. Claims about
Base UI were re-run on 1.9.0: a controlled `RadioGroup` takes `value={null}`,
`RadioGroup` has no Home or End and `ToggleGroup` no Up or Down, a toast
raised before the provider mounts is lost, a high-priority toast root is
`aria-hidden` until focused, the Esc that closes a dialog is stopped at the
document. The skill was corrected where the builds disproved it (`--height-*`
does make `h-*`; `--size-*` and `--z-nav` don't make `h-*` and `z-*`;
`max-sm:` isn't the answer for every old breakpoint). Brief 04 stays in
`todo/` with a progress note: every row is pinned, but websites/trips
declares `^1.6.0` (lockfile 1.8.0) and is in no table. The UI wave's
house-style findings are in one todo, renamed to cover both waves.

## [2026-11-12] done | brief 04 closed: trips pinned Base UI 1.9.0 (its brief 04), the last repo; every manifest in the estate now reads 1.9.0

## [2026-11-12] done | Brief 29 - workflow agents and the verify script (v0.46.0)

A research pass over the brief runs of 2026-11-10 to 2026-11-12 found two
needs: the controller's repeated checks belonged in a script, and the
builders' written rules belonged in hooks. `scripts/verify-brief.mjs` runs a
repo's gate, sync, format, tree, diff-grep, untouched and audit checks one at
a time. `hooks/agent-guard.mjs` enforces the rules for four new agents:
`brief-builder`, `screen-capturer`, `brief-auditor` (a draft, trialled on 5
briefs) and `owner-steps`. Plugin agents' hooks are ignored, so
`scripts/install-agents.mjs` writes user-level copies. `plan-split-dispatch`
uses them. See [the brief](briefs/done/29-workflow-agents-and-the-verify-script.md).

## [2026-11-12] done | Brief 30 - the design team leaves draft, and the design-pipeline skill (v0.47.0)

The pilot (the-board with three directions, atrium judged with two) is
folded into the four design agents: two directions by default, the judged
viewports, G3 failing an ellipsis, and a critic that counts the first screen
against today and yields to the controller's rulings. `design-pipeline`
runs the order and the hand-offs, with `scripts/pairs.mjs`, a node port of
the pilot's pair maker that matched the atrium judging pixel for pixel. See
[the brief](briefs/done/30-finish-the-design-team-and-a-design-pipeline-skill.md).

## [2026-11-13] done | Brief 19 - the stocktake skill, the MCP pin check and the 5,000-token cut (v0.48.0)

`stocktake` audits the library (quick and full modes, a six-item rubric,
`scripts/measure.mjs`) and `scripts/check-mcp-pins.mjs` fails on an unpinned
`npx`, `@latest` or a git URL with no commit. Scenario files for the five
front-door skills are in `skills/stocktake/references/scenarios/`. Q30: the
load-bearing rules of `corpus-flow` (about 3.5k tokens now) and
`plan-split-dispatch` (about 4.4k) sit inside their first 5,000 tokens, the
rest in `references/`. The first stocktake page has 13 findings and finds no
description over the limit. The todo about leaving room for a brief's outcome
note is folded in and marked done. Verified with the repo's 18 test files, the
skill checker and `corpus/lint.sh`. See
[the brief](briefs/done/19-a-skills-stocktake-and-mcp-pin-review-from-ecc.md).


## [2026-11-13] done | Brief 23 - a SessionStart hook that orients on the corpus (v0.49.0)

`hooks/session-start.mjs` injects the corpus catalog (short lines), a `resume` checkpoint newer than the last `done`, and the open brief names, at most 2,000 characters, and nothing without a `corpus/`. Credit to claude-mem's progressive-disclosure index (idea only). Six fixture tests, the skill checker and `corpus/lint.sh` pass. The live check in a real session is an owner step. See [the brief](briefs/done/23-a-session-start-hook-that-orients-on-the-corpus-from-claude-mem.md).

## [2026-11-13] superseded | Brief 17 - review comments and finishing on main

Superseded by the owner (backlog grill, answer 1): the `brief-builder` agent already verifies, commits on main and closes out, and there are no PRs. Its one surviving rule, classifying each review finding as correct, unclear, wrong or out of scope, moves into brief 20.
