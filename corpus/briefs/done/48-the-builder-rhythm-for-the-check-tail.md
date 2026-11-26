# Task 48: the builder rhythm for the check tail

**Depends on:** [47](../done/47-house-style-ships-the-one-pass-check-runner.md): the rhythm points at the gate runner's log,
which 47 documents in house-style, and both briefs edit `skills/house-style/SKILL.md` and `adoption.md`.

**Builder:** sonnet. Prose in one agent file and four references.

## Context

From [check-speed-2026-11-23.md](../../wiki/check-speed-2026-11-23.md), recommendation 2, and
[the todo](../../todos/the-builder-rhythm-for-the-check-tail.md) of 2026-11-24. In 145 builder transcripts
(2026-11-10 to 2026-11-23):

- Checks took 15.7% of builders' active time; the full `npm run check` was two thirds of that: 293 runs, 6.4 h.
- 25 to 62 of those runs came with no code change since the previous full run. Builders re-ran to read another part
  of the output, re-ran after a `timeout` shorter than the gate killed it, and re-ran after a commit.
- `check:fast` ran 11 times in all. Builders have no reason to run it: `agent-sources/brief-builder.md` says "A
  check passed only if you ran it in full after your last change", and many briefs ask for a green gate on every
  commit (the estate redesign briefs say "After each commit run `npm run check`").

The rhythm the page recommends: after each step, `npm run check:fast` and the test file beside each changed source;
the full gate once, after the last code change; after a failure, fix, re-run the failing step alone, then the gate
once more; read the gate's log instead of running it again. Allowing one full run per builder (two after a
failure), it saves about 1.6 h over two weeks, 2.5% of active time. The cost is bisectability: a middle commit can
fail a step only the full gate runs (knip, dependency-cruiser, the whole test suite).

The 24 repos with the gate runner already say this in their own `CLAUDE.md` (almanac's: "While you
work, `npm run check:fast` and any test file you touched are enough; run the full gate once, after your last
change"). The library's own texts don't yet: the builder agent, plan-split-dispatch's light-checks rule, corpus-flow's
brief template and house-style's `CLAUDE.md` template.

Not in this brief: the plugin's end-of-turn hook is registered for `Stop` only, so a subagent never gets it. Under
this rhythm the builder runs `check:fast` itself, so the hook stays as it is.

"The build instructions" in the todo are the estate run's common build file, which lives in the controller's run
notes, outside this repo. Updating it is an owner step below.

## Files you OWN

- `agent-sources/brief-builder.md`: "How you work" (the rhythm) and "Honest reports" (the evidence rule).
- `skills/plan-split-dispatch/references/wave-mode-and-configuration.md`: the "Heavy checks stay out by default"
  bullet.
- `skills/corpus-flow/references/workflow-steps.md`: §2, the Acceptance line of the brief template.
- `skills/house-style/SKILL.md`: the `check` row's "Run before every hand-back".
- `skills/house-style/references/adoption.md`: §8, the root `CLAUDE.md` commands line.
- `README.md` (the version line), `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- `skills/plan-split-dispatch/SKILL.md` (4,856 tokens on invoke, near the 5,000-token cut) and
  `skills/corpus-flow/SKILL.md`: the rhythm belongs in their references.
- `hooks/`: no `SubagentStop` registration.
- `house-style/` (the folder): brief 47's.
- Any other repo's briefs or `CLAUDE.md`.

## What to do

1. **`agent-sources/brief-builder.md`.** Add the rhythm to "How you work", in a few bullets:
   - After each step: `npm run check:fast` where the repo has it, and the test file beside each source file you
     changed (the repo's one-test-file command from its `CLAUDE.md`).
   - The full `npm run check` once, after your last code change and before the end move. A later commit that
     changes only `corpus/` markdown doesn't call for another run.
   - After a failure: fix it, re-run the failing step alone (`npm run <step>`), then the full gate once more.
   - Where the gate keeps a log (`node_modules/.cache/check/last.log`), read it instead of running the gate again;
     send any other long output to a file once and grep it.
   - Never wrap the gate in a `timeout` shorter than it takes.
   - A brief that asks for a check after every commit means `check:fast` and the touched tests, unless it says why
     each commit needs the full gate.
   In "Honest reports", keep the rule that a passed check is one run in full after the last change, and say it is
   about the closing gate, not each step.
2. **plan-split-dispatch's reference.** In the "Heavy checks stay out by default" bullet, one or two sentences: a
   builder runs `check:fast` and the touched tests per step and the full gate once at the end. The controller's
   verify gate is unchanged.
3. **corpus-flow's brief template** (`workflow-steps.md` §2): under Acceptance, one sentence: ask for the full gate
   once, at the end; per-commit checks are the fast check and the touched tests, unless the brief says why a commit
   needs more.
4. **house-style.** The `check` row in `SKILL.md`: run once, after the last code change, before the hand-back.
   `adoption.md` §8's commands line: the same, plus "read the gate's log rather than running it again", in the
   wording the adopters' `CLAUDE.md` files use. `SKILL.md` runs past its cut today (the cut at line 151, after the
   scripts table), so the row's words stay few.
5. **Release.** The plugin's next minor version in both plugin files, the README's version line, a
   `docs/history.md` paragraph.

## Acceptance

- `grep -n 'check:fast' agent-sources/brief-builder.md` and `grep -n 'last.log' agent-sources/brief-builder.md`
  each print the new lines.
- `node skills/stocktake/scripts/measure.mjs`: the token counts of `plan-split-dispatch` and `corpus-flow` on invoke
  are unchanged (their `SKILL.md` files are untouched), and house-style's scripts table still ends before its cut
  line.
- `node scripts/check-skills.mjs`, `node --test scripts/*.test.mjs` and `bash corpus/lint.sh` pass.
- The version matches in both plugin files, the README and `docs/history.md`.

## Owner steps

- Update the plugin, then re-run `node scripts/install-agents.mjs`, so the user-level `brief-builder` gets the
  rhythm.
- The paid evals for `plan-split-dispatch` and `corpus-flow` (front-door skills), by hand, recorded in
  `wiki/evals.md`.
- At the next estate run, the controller copies the rhythm into the run's common build file.

## Owner decisions

- Settled 2026-11-24 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-24:
  - The bisectability cost is accepted: a knip or dependency-cruiser failure is cheap to place, and the full gate
    runs before every hand-back.
  - No `SubagentStop` hook: the rhythm makes the builder run `check:fast` itself.
  - The rhythm lives in the references and the builder agent, not in the front-door `SKILL.md` files.

## Outcome (2026-11-25, v0.70.0)

- `agent-sources/brief-builder.md` has five bullets in "How you work" (the per-step `check:fast` and touched tests, the
  full gate once after the last code change, the failing step alone after a failure, `last.log` before a re-run, no
  short `timeout`, and what a per-commit check means), and "Honest reports" says the passed-check rule is about the
  closing gate.
- The "Heavy checks stay out by default" bullet in plan-split-dispatch's reference, the Acceptance line of corpus-flow's
  brief template, the `check` row of house-style's `SKILL.md` and `adoption.md` §8 carry the same rhythm.
- `measure.mjs`: plan-split-dispatch 4,856 and corpus-flow 3,663 tokens on invoke, unchanged. house-style's table still
  ends at its cut (line 146), 5,988 tokens against 5,984 before.
- `check-skills`, the script tests and `corpus/lint.sh` pass.
- Owner steps stand as written: update the plugin and re-run `scripts/install-agents.mjs`, run the paid evals for the two
  front-door skills by hand, and copy the rhythm into the estate run's common build file.
