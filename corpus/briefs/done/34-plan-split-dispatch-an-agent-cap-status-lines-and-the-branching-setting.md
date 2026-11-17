# Task 34: plan-split-dispatch gets an agent cap, status lines and the branching setting

## Context

`plan-split-dispatch` decides what may run in parallel by one test: disjoint
files. It has no rule for how many agents run at once, what they may run, or
what the user hears meanwhile. The history shows the cost:

- **The cap.** The owner set or changed the number of agents about 25 times
  between 2026-10-28 and 2026-11-15, from 1 to 10, by the machine's load
  ("max 3 agents because 5 overloads the laptop", 2026-10-28). The controller
  went over the stated cap twice at 7. On 2026-10-22 a run with up to six
  agents was paused for its token cost, with the ask to go brief by brief.
- **Heavy checks.** "Skip any computation intensive tests" (2026-10-28):
  it was the full suites and timing runs, more than the agent count, that
  overloaded the machine.
- **One builder per repo.** "Up to 4 agents but one per project"
  (2026-11-06). The `brief-builder` commits on `main` and stops on a dirty
  tree, so two of them in one checkout block each other.
- **Silence.** "Is this still running?" or "are we waiting for something?"
  appears in four brief-run sessions (2026-10-20 to 2026-11-06). The skill
  asks only for "a few status lines" between chunks. Two of the four were
  clearly runs of this skill, so this is the weakest of the four.
- **Scratch notes.** A restart on 2026-10-22 wiped the session's scratch
  folder with the run ledger and the walk plans in it.

Separately, the skill offers `isolation: "worktree"` and says "branch first"
on a protected branch. The owner's own repos ban both (2026-11-06); other
repos the owner works in require both. Brief 33 gave `corpus/routing.md`
`Branching` and `Worktrees` lines; this skill should read them.

## Files you OWN

- `skills/plan-split-dispatch/SKILL.md` (it sits at about 4,700 of 5,000
  tokens: one line per rule here, the detail in the reference).
- `skills/plan-split-dispatch/references/wave-mode-and-configuration.md`.
- `skills/stocktake/references/scenarios/plan-split-dispatch.md`.
- `README.md` (the version line), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- `agents/brief-builder.md`: it already forbids branches and worktrees for
  its own runs.
- `orchestrate`: brief 33.

## What to do

1. **An agent cap, as a mechanism.** The user sets it; the default is 3.
   Count the running agents before every dispatch and every resume. A lower
   cap lets running agents finish and starts none. The cap goes in the ruling
   ledger. The default is a guess for one laptop and the text says so.
2. **One committing agent per checkout.** Parallel chunks inside one repo are
   for subagents that do not commit.
3. **Heavy checks stay out** unless the user allows them: a chunk runs
   typecheck, lint and the tests for what it changed.
4. **Status lines** at every dispatch and every hand-back, and a line for a
   wait with nothing to report.
5. **Run notes** a resume needs live in the repo, not in a session scratch
   folder.
6. **Branching and worktrees** follow `corpus/routing.md`. A worktree only
   where it says `Worktrees: yes`; "branch first" only where `Branching`
   names a branch per task.

## Acceptance

- `node skills/stocktake/scripts/measure.mjs` shows no cut inside
  `plan-split-dispatch`.
- SKILL.md names the cap, the count before dispatch and the status lines; the
  reference carries the detail and the reasons.
- No instruction offers a worktree or a new branch without `routing.md`
  allowing it.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass; the version
  is bumped in both plugin files, the README and `docs/history.md`.
- Owner step, not the builder's: the paid evals for a front-door skill.

## Outcome (2026-11-17)

Built in v0.57.0 (ffb37a5). SKILL.md names the cap in step 4, wave mode and the configuration summary, and the status line in step 6; `measure.mjs` gives 4808 tokens on invoke and no cut (4,681 before), after the intro on the workflow agents was shortened and one line that the reference already carries was dropped. The reference holds the cap's four rules, one committing agent per checkout, the light-checks default, status lines, run notes, and the `Worktrees` and `Branching` rules with their fallback. The scenario gained one compliance line. The default of 3 is a guess and is labelled as one. Checks: `check-skills` 0 failing, `corpus/lint.sh` clean. Not done here: the paid evals, an owner step, and a dry run of a real dispatch under a cap.
