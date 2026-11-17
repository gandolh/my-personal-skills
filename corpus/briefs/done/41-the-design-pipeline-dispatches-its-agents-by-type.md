# Task 41: the design pipeline dispatches its agents by type

## Context

`design-pipeline` names its four agents (`design-director`,
`design-sketcher`, `design-judge`, `design-critic`) and never says how to
dispatch them. A month of the owner's subagent runs (2026-10-19 to
2026-11-17, 624 runs) shows what happened instead:

- The four definitions landed on 2026-11-12. After that, 110 director,
  sketcher, judge and critic runs went out as `general-purpose` with the
  prompt pasted in. None ran as its typed agent.
- The same session dispatched `brief-builder` by type 39 times, so the
  session could dispatch typed agents. Why the design roles were pasted is
  not known. One guess: `brief-builder` is installed at user level, the
  design agents come only from the plugin, and the session started two days
  before the plugin had them.

What a pasted run loses:

- **The tool list.** `design-judge` has Read and Glob only. The pasted judges
  ran shell commands, and some wrote files.
- **A smaller start.** A `general-purpose` run started at a median 42k tokens
  of context, and a typed agent with a short tool list (`brief-builder`) at
  26k. Every later call re-reads that start.
- **One text.** A pasted prompt is a copy that drifts from the definition.

Effort is not part of this brief. The owner set on 2026-11-17 that effort
follows the session. A typed run takes its definition's `effort` line, and
whether the five lines in the library's own definitions stay is an open
question for the owner.

## Files you OWN

- `skills/design-pipeline/SKILL.md` ("The agents").
- `README.md` (the version line), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- `agents/design-*.md`, their `effort` lines included.
- `skills/design-pipeline/references/`: the hand-offs and the judging are
  right as they are.

## What to do

1. Under the agents table, say how each is dispatched: by its agent type, with
   the model in the table, never as `general-purpose` with a definition pasted
   in.
2. Say what to do when the session's agent list lacks them: tell the user
   before falling back.

## Acceptance

- "The agents" names the four agent types as the plugin registers them and
  forbids the pasted form.
- `node skills/stocktake/scripts/measure.mjs` shows no cut inside
  `design-pipeline`.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass; the version
  is bumped in both plugin files, the README and `docs/history.md`.

## Outcome (2026-11-17)

Built in v0.61.0 (14cbddb). "The agents" in `design-pipeline` names the four agent types as the plugin registers them, says to dispatch each by type with the model in the table, forbids pasting a definition into a `general-purpose` agent with the two costs of doing so, and says to tell the user before falling back when the agent list lacks them. `measure.mjs` gives 3,128 tokens on invoke and no cut (2,952 before). Checks: `check-skills` 0 failing, `corpus/lint.sh` clean. Open, on the board as a question: whether the five `effort: high` lines in the library's own agent definitions stay, now that effort follows the session.
