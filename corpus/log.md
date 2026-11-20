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

## [2026-11-13] done | Brief 20 - surgical changes in the chunk contract, with brief 17's review rule (v0.50.0)

Every dispatch prompt carries a Scope discipline block and hands back a "Noticed, not touched" list; the review gate checks scope and proportion, reports no style, runs reviewers read-only and classifies each review finding as correct, unclear, wrong or out of scope. Ideas from andrej-karpathy-skills (no license, nothing copied). See [the brief](briefs/done/20-surgical-changes-in-the-chunk-contract-from-karpathy.md).

## [2026-11-13] done | Brief 18 - the diagnose skill and the skill-writing rules (v0.51.0)

`diagnose` builds a red, deterministic, fast loop before any fix, tests one hypothesis at a time and keeps the loop as a regression test; `docs/writing-skills.md` gives 14 rules for agent-facing text, each with its check. Ideas from mattpocock/skills and obra/superpowers, no text copied. The owner-steps wizard was dropped: the `owner-steps` agent covers it. See [the brief](briefs/done/18-a-diagnose-skill-and-an-owner-steps-wizard-from-pocock.md).

## [2026-11-13] done | Brief 26 - model evals for the library's prompts (v0.52.0)

`evals/` holds three evals run by `claude plugin eval`: triggering (14 cases), numbering (4) and injection (2), with their graders and grader tests. Every run uses `--no-publish --max-cost-usd 5`. No model was called while building; the recorded runs are the owner's step, in [the evals page](wiki/evals.md). Shape from pingdotgg/t3code, no text copied. See [the brief](briefs/done/26-model-evals-for-the-librarys-prompts-from-t3code.md).

## [2026-11-13] done | Brief 31 - house-style 1.3.0, a domain/ root and the waves' findings (v0.53.0)

The owner's answer 2 of the backlog grill: `domain/<name>/` joins the code structure, and the dependency-cruiser preset takes ward-auth's `domain-not-to-features` and `app-through-feature-index`. `check-structure` stops reading `NODE_ENV` in a message, takes each root's top `config.ts` as the one env reader, reads computed route paths and no longer flags a helper given validated input; `check-base-ui` skips an icon child; `houseStyle()` gains `tailwind.ignore`. A read-only dry-run on the adopters says a re-sync fires wzd_auth's three OIDC interaction routes and imbatranim-apps' three `app.ts` imports. Tagged `house-style-v1.3.0` locally; the estate re-sync waits for imbatranimOS 89. See [the brief](briefs/done/31-house-style-1-3-0-a-domain-root-and-the-wave-findings.md).

## [2026-11-15] progress | Brief 25 - steps 1 and 2 done, the run follows (v0.54.0)

Cloudflare's `security-audit` is vendored verbatim from `skills/security-audit/` at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (2026-09-14, MIT) and matches upstream byte for byte (`diff -r`). Its two validators read one file and write nothing; their 65 tests pass (`node --test skills/security-audit/*.test.cjs`; Node 24 reads a bare folder as one file, so the glob replaces the brief's folder form). `LICENSE-cloudflare`, the `ATTRIBUTION.md` row and notes, the README row, the history entry and a routing line each in `improve` and `orchestrate` are in, and the plugin is at v0.54.0 with 33 skills. The skill's description covers "security audit" and "find vulnerabilities" (security audits, vulnerability research); "audit auth" fits by its security-audit wording, and a full audit runs only on an explicit audit request. Left: step 3, the run on ward-auth (a controller-driven fan-out), and step 4, its log line. The brief stays in `briefs/todo/`.

## [2026-11-17] done | Brief 32 - grill-me asks one explained question at a time (v0.55.0)

`grill-me` asks one frontier question per message, in dependency order, each with why it matters, the options and a recommendation; a bundle of defaults is a round too. Technical calls that a convention settles are decided, recorded and reported, not asked. From the owner's corrections of 2026-10-07 to 2026-11-09. The scenarios and the README row match. `check-skills`, `measure.mjs` (2,828 tokens on invoke, no cut) and `corpus/lint.sh` pass. Owner step: the paid evals before the plugin update. No board ticket. See [the brief](briefs/done/32-grill-me-asks-one-explained-question-at-a-time.md).

## [2026-11-17] done | Brief 33 - orchestrate keeps its gate under the cut, and three fixes (v0.56.0)

The `routing.md` template and the generic intent table moved to `references/`, so `orchestrate` is about 4,800 tokens on invoke (6,858 before) with no cut. The Step 1 trivial edit is the one named exception to the approval gate. A `corpus/` without `routing.md` is no longer bootstrapped: the skill asks once. `Branching` and `Worktrees` lines in the template replace "branch first"; a file without them falls back to the repo's instruction file, then one question. `check-skills`, `measure.mjs` and `corpus/lint.sh` pass. Owner step: the paid evals before the plugin update. No board ticket. See [the brief](briefs/done/33-orchestrate-the-gate-under-the-cut-and-three-fixes.md).

## [2026-11-17] done | Brief 34 - plan-split-dispatch gets an agent cap, status lines and the branching setting (v0.57.0)

The controller counts the running agents before every dispatch and resume and keeps to the cap (3 unless the user set one), runs one committing agent per checkout, keeps heavy checks out unless allowed, sends a status line at every dispatch and hand-back, and keeps run notes in the repo. A worktree and "branch first" now follow `corpus/routing.md`'s `Worktrees` and `Branching` lines. One line per rule in SKILL.md, the detail in the configuration reference. `check-skills`, `measure.mjs` (no cut) and `corpus/lint.sh` pass. Owner step: the paid evals before the plugin update. No board ticket. See [the brief](briefs/done/34-plan-split-dispatch-an-agent-cap-status-lines-and-the-branching-setting.md).

## [2026-11-17] done | Brief 35 - shorter descriptions for the five largest listings (v0.58.0)

The listings of `code-structure` (1,343 to 654 characters), `design-pipeline` (1,308 to 835), `design-md-library` (1,172 to 791), `base-ui` (1,129 to 750) and `codegraph` (1,020 to 678) keep what the skill is, its trigger phrases and its "not for" line, and drop the restated body. `claude plugin details`: about 6,600 tokens always-on, from about 7,400. `check-skills` and `corpus/lint.sh` pass. No board ticket. See [the brief](briefs/done/35-shorter-descriptions-for-the-five-largest-listings.md).

## [2026-11-17] blocked | Briefs 36, 37 and 38 - three owner picks

Filed in `briefs/blocked/`, each waiting on the owner: 36, prune or keep the four Vercel skills with no recorded call (about 620 tokens a session, the stocktake's F1); 37, stop the plugin registering the four workflow agents, which a session lists twice (about 800 tokens, and an unguarded copy); 38, `brief-auditor` leaves draft, goes, or gets its trial. Each brief gives the options and a recommendation. Nothing is built.

## [2026-11-17] fix | corpus-flow's grill and plan-split-dispatch's wave rule match the day's releases (v0.58.1)

Found on a read-back of briefs 32 and 34. `corpus-flow` §3 and §3a asked for one batch of questions and now ask one explained question per message. `plan-split-dispatch` states when a wave runs at once (across repos, or with subagents that do not commit) and when briefs of one repo run in turn (the `brief-builder` commits). Briefs 36 and 37, still blocked, had two facts corrected: `disable-model-invocation` does take a skill out of a session's list, so brief 36 offers a name-only pick, and `claude plugin details` prints `Agents (0)`. The done briefs are unchanged.

## [2026-11-17] decision | Review runs on Opus, the advisor stays, effort follows the session

The owner was shown a month of subagent runs (2026-10-19 to 2026-11-17, 624 runs) and answered three questions. Review runs on Opus: this replaces `plan-split-dispatch`'s "finders default to sonnet, at most one opus finder" and `brief-auditor`'s sonnet pin (brief 39). The advisor model set in the owner's settings stays as it is, inside subagents too. Effort is set by the session, so no dispatch names an effort level. The first is recorded in [decisions.md](wiki/decisions.md); the other two change no file here.

## [2026-11-17] done | Brief 39 - review runs on Opus (v0.59.0)

Every review finder and `brief-auditor` run on opus, and step 7 is done when the delivery names each review run and its verdict, or why the gate was skipped. `check-skills`, `measure.mjs` (4,869 tokens on invoke, no cut), `corpus/lint.sh` and the install-agents test pass. Owner steps: the paid evals, the plugin update, a re-run of `scripts/install-agents.mjs`. On the board as my-personal-skills-39. See [the brief](briefs/done/39-review-runs-on-opus.md).

## [2026-11-17] maintenance | status.md split at the page cap

`wiki/status.md` reached 200 body lines. Its six entries of 2026-11-10 and 2026-11-11 moved verbatim to [status-2026-11-10-and-11.md](wiki/status-2026-11-10-and-11.md), with a pointer left behind.

## [2026-11-17] done | Brief 40 - an opus dispatch names its reason, and the trivial tier goes (v0.60.0)

`plan-split-dispatch` has two tiers. An opus dispatch names the senior criterion it meets; with none it goes out on sonnet. From a month of runs: 33 of 84 opus builds met no listed criterion (3.26M output tokens, an upper bound), and nothing was ever classed trivial. `check-skills`, `measure.mjs` (4,864 tokens on invoke, no cut) and `corpus/lint.sh` pass. Owner step: the paid evals before the plugin update. On the board as my-personal-skills-40. See [the brief](briefs/done/40-an-opus-dispatch-names-its-reason-and-the-trivial-tier-goes.md).

## [2026-11-17] done | Brief 41 - the design pipeline dispatches its agents by type (v0.61.0)

`design-pipeline` says to dispatch the director, sketcher, judge and critic by agent type, never as `general-purpose` with the definition pasted in: 110 runs went out pasted in a month, without the definitions' tool lists. `check-skills`, `measure.mjs` (3,128 tokens on invoke, no cut) and `corpus/lint.sh` pass. One question for the owner is on the ticket: whether five `effort: high` lines stay. On the board as my-personal-skills-41. See [the brief](briefs/done/41-the-design-pipeline-dispatches-its-agents-by-type.md).

## [2026-11-17] unblocked | Brief 38 - the owner picked "run the trial first, on Opus"

`brief-auditor` keeps its DRAFT sentence and gets its five-brief trial, on opus (brief 39 set the model). The transcripts show the trial never ran: 48 `brief-builder` runs since 2026-11-12 and no `brief-auditor` run. The brief is back in `briefs/todo/` with a "Trial results" section to fill.

## [2026-11-17] todo | Briefs 42 and 43 - two findings that need runs before a rule

Filed, not built. 42: a trial of splitting a long brief into parts with a hand-off note, because the 29% of subagent runs with 100 or more API calls carried 78% of the month's cache-read tokens; no budget number enters a skill before the trial. 43: builders write repo files through the shell (sonnet: 3 Edit and 66 Write calls against 16,357 shell calls), which skips the plugin's format hook; the brief finds the cause before any rule is written. Its two steps ran the same day: the transcripts, then one toy brief built twice on sonnet, once with a line telling the builder to use Edit and Write. Both builds used the shell for every read and write, in six API calls each, so the cause is the model's way of working and a one-line rule does not move it. The brief now holds a recommendation (no rule for the builder) for the owner's pick. On the board as my-personal-skills-42 and -43.

## [2026-11-17] fix | The opus-reason rule covers first dispatches only (v0.61.1)

Found on a read-back of brief 40. Step 4's new sentence would also have sent an escalated chunk, a fix agent and a review finder to sonnet, since none of them meets a step 2 criterion. It now says "a first dispatch on opus", and the configuration reference names the three exceptions. Brief 43's findings were corrected the same way: its cost claims are marked as inferences, because neither test run used Edit. Brief 38 tells the controller to pass `model: opus` on each trial dispatch until the install script is re-run. The done briefs are unchanged.

## [2026-11-19] done | Brief 25 - Cloudflare's security audit, vendored and run on ward-auth

The skill shipped in v0.54.0 on 2026-11-15. Its first run, source-only on ward-auth's `api/` and `shared-library/`, finished on 2026-11-17 with nine `needs_validation` records and none confirmed or rejected. The owner chose to fix first and keep no report, because ward-auth's repo is public, so nothing about a lead is in any repo; the fixes land there with plain commit messages. Step 4's numbers: 25 dispatches, about 3.8M tokens (2.8M of them recorded), about 4 h 15 min of wall time over three sessions against the 1 h accepted. The next targets are the owner's call, at about 4M tokens and half a day each. See [the brief](briefs/done/25-vendor-cloudflare-security-audit-and-run-it-on-ward-auth.md).

## [2026-11-19] unblocked | Brief 36 - the owner picked "prune"

The four unused Vercel skills go: `vercel-composition-patterns`, `vercel-react-best-practices`, `vercel-react-native-skills` and `vercel-react-view-transitions`. `web-design-guidelines` and `writing-guidelines` stay. The brief is back in `briefs/todo/`.

## [2026-11-19] done | Brief 36 - the four unused Vercel skills pruned (v0.62.0)

The owner picked prune. `vercel-composition-patterns`, `vercel-react-best-practices`, `vercel-react-native-skills` and `vercel-react-view-transitions` are removed, with their `ATTRIBUTION.md` and README rows and the "Vercel suite" clauses of the plugin descriptions. About 620 tokens a session once the plugin updates. 29 skills; `check-skills` and `corpus/lint.sh` pass.

## [2026-11-19] unblocked | Brief 37 - the owner picked "move the sources out of agents/"

The four workflow agents move to a folder the plugin does not register, and `scripts/install-agents.mjs` reads them from there. The brief is back in `briefs/todo/`.

## [2026-11-19] done | Brief 37 - the workflow agents' sources moved out of agents/ (v0.63.0)

The four workflow agents' sources moved to `agent-sources/`, which the plugin does not register, so each shows once in the agent list (about 800 tokens a session saved) and the unguarded plugin copies no longer exist. `install-agents.mjs` and its test follow; `plan-split-dispatch` dropped its "never the plugin copy" clause. The install-agents test, `check-skills` and `corpus/lint.sh` pass.

## [2026-11-19] done | Brief 43 - builders' shell writes: no rule, on the owner's pick

The cause is the model's own way of working in this agent: whole files written in one or two shell commands. The owner took recommendation 1, no rule for the builder. No skill, agent or hook file changed and the version stays at v0.63.0.

## [2026-11-19] done | Brief 28 - the estate redesign board

All 23 redesigns on the board were approved on 2026-11-13 and built: 20 wait for the owner's deploys, 3 are done. The brief moves to `done/`; no skill changed and the version stays at v0.63.0.

## [2026-11-19] done | Brief 38 - brief-auditor kept after its trial (v0.64.0)

Five built briefs in four repos; the auditor found a defect the controller had missed in each and marked nothing wrong, at about 88k tokens a run. The owner picked keep, after every builder. The DRAFT sentence goes; the controller's own pass checks a closeout by its files.

## [2026-11-19] done | Brief 42 - long briefs split at their steps (v0.65.0)

Three trial rows and a comparison with the day's one-run builds: a run's cost per call doubles past about 100 calls, and the split parts stayed at 40k to 91k cached tokens a call with no rework from their notes. The owner adopted the controller's split at the brief's steps; the rule is in wave mode step 3b and the builder's "A part of a brief".

## [2026-11-20] research | Four skill sources: anidoodle, pstack's no-comments and statechart, Google's EGM

The owner asked whether four outside sources belong in the library. Read at pinned commits, nothing installed: anidoodle not now (no page in the estate asks for drawn art), no-comments no (it deletes what house-style rule 24 asks for, and needs half of pstack), statechart worth vendoring from cursor/plugins after a trial (refused this session: no JRE download), EGM not installed but three ideas worth writing fresh. Nothing filed; the owner's three questions are at the end of [the page](wiki/skill-sources-2026-11-20.md).

## [2026-11-20] answers | The four skill sources: anidoodle kept for later, statechart and EGM dropped

The owner's answers to the morning's research. anidoodle stays out of the library with its own page for a future project, [anidoodle.md](wiki/anidoodle.md), which also answers whether it could serve game-engine's animation engine: not at run time, possibly as an offline drafter of pixel frames, with two ideas to borrow. statechart is dropped; a flow view for brief-board was researched in brief-board's own wiki instead. The three EGM ideas are dropped and none is filed.

## [2026-11-20] done | no-comments vendored with its suite (v0.66.0)

On the owner's ask, pstack's `no-comments` with the `comment-sicko` agent, `poteto-mode`, `why`, `architect` and the Claude Code adapter (`docs/harness/claude-code.md`, its agent names moved to the `personal-skills:` prefix), from cursor/plugins' Claude Code tree at `aaeb0ea`. All run only by name; poteto-mode's `scripts/` stay out, and its PR-landing and worktree-cleanup playbooks don't run here. The decision is on [decisions.md](wiki/decisions.md); house-style rule 24 is unchanged. `decisions.md` passed 200 lines, so its three house-style calls moved, unchanged, to [decisions-house-style.md](wiki/decisions-house-style.md). `check-skills` (33 skills), the script tests (16) and `corpus/lint.sh` pass.
