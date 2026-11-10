# Task 22: A second model in the review gate (from stablyai/orca)

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed for ideas.
**stablyai/orca** was read at `1bf2276b` (2026-11-09, MIT, Lovecast Inc.).
It is a desktop app that runs Claude Code, Codex and other agents in
parallel, each in its own git worktree. Its `orchestration` skill lets one
agent dispatch workers of a *different* agent, with task DAGs, ask/reply,
decision gates and results returned. It says: "Have Codex review this and
report back" means an Orca worker of that agent.

The idea worth having, independent of Orca: **the reviewer should not be
the same model family as the author.** ECC's `ai-regression-testing` makes
the same point (the same model writing and reviewing code shares its blind
spots). `plan-split-dispatch` reviews Sonnet chunks with Opus. Both are
Claude, and both can miss the same class of mistake.

Orca itself fits this estate poorly. It is a desktop app. The owner works
largely in claude.ai cloud sessions and phones in. And a second vendor's
agent needs its own subscription or key. So this brief makes the review
gate able to use a second reviewer when one is available, and leaves how
to the setup.

## Owner decisions (defaults)

1. **Build it now, or park it?** Default: build only the hook point, a
   second-reviewer step that is off unless configured, and document Orca
   and a plain CLI (`codex exec`, `gemini -p`) as two ways to fill it.
   Alternative: park it as a todo until the owner has a second agent set up.
2. **When it runs.** Default: on chunks the plan marks "hard", and on any
   chunk touching auth, money or data deletion. Never on every chunk; cost.
3. **What it may do.** Default: report only. Its findings go through the
   same ruling ledger as the primary reviewer's, and it never edits.

## Files you OWN

- `skills/plan-split-dispatch/SKILL.md`: the review gate's optional second
  reviewer and the ledger's source column.
- `skills/plan-split-dispatch/references/second-reviewer.md` (new): setup
  for Orca, a CLI agent, or none.
- `corpus/routing.md`'s template in `orchestrate`: one optional
  `Second reviewer:` line.
- `ATTRIBUTION.md` (Influences), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- The primary review gate's rules. This adds a step; it changes none.

## What to do

1. **In the review gate:** if the project's `routing.md` names a second
   reviewer and the chunk qualifies (decision 2), send it:
   - the chunk's diff;
   - the brief's acceptance;
   - the primary review's findings.

   Its reply is parsed into the same finding format and ruled in the
   ledger, with its source named.
2. **The reference page:**
   - Orca: an `orchestration` worker of another agent, results back through
     Orca's ask/reply.
   - A CLI: one shell call with the diff on stdin, and the expected output
     format.
   - What to do when it is unavailable: skip it and log that it was
     skipped. Never block on it.
3. Credit Orca and ECC in `ATTRIBUTION.md` (ideas only), and bump the minor
   version.

## Acceptance

- With no `Second reviewer:` line, `plan-split-dispatch` behaves exactly as
  before. Check by reading the diff of the skill: the step is guarded.
- With a stub second reviewer configured (a script that prints one
  finding), a dry run puts that finding in the ruling ledger with its
  source.
- `bash corpus/lint.sh` passes, and the version is bumped.
