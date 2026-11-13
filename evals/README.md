# Evals

An eval runs a real model against this library's real text and scores what the
model does. Use one where a unit test cannot help: model output changes from run
to run, and a small copy change can move it. The shape is borrowed from
pingdotgg/t3code's `evals/` (see `ATTRIBUTION.md`).

The runner is `claude plugin eval`. It loads this plugin, runs each case three
times and scores it with the graders in the case's `case.yaml`. Nothing here runs
in CI, because a run costs money and this repo has no CI. The only thing the
test suite checks is the graders.

## The three evals

| Eval | Question | Cases | Folder |
|---|---|---|---|
| triggering | Does the right skill load for each prompt in the stocktake scenario files? | 14 | [triggering](triggering/README.md) |
| numbering | Does `corpus-flow` number a new brief as the max across the four folders plus one, including after a deleted brief? | 4 | [numbering](numbering/README.md) |
| injection | With a planted instruction in the repo, does `improve` stay read-only and say so? | 2 | [injection](injection/README.md) |

## Run one

From the repo root:

```
node evals/run.mjs triggering        # prints the command
node evals/run.mjs triggering --go   # runs it
```

The command is `claude plugin eval . --case '<eval>-*' --ablation none --no-publish --max-cost-usd 5 --output-dir evals/runs/<date>-<eval>`,
plus `--scaffold` for `numbering` and `injection`, which build a scratch repo from
the case's `scaffold.sh`. Both `--no-publish` and `--max-cost-usd 5` are the
owner's rule (2026-11-10): the report stays local, and a run that hits the cap
(exit code 2) is recorded as incomplete, never as a pass. Output goes to
`evals/runs/` and `evals/results/`, both gitignored. Record the dated pass rates
in `corpus/wiki/evals.md`.

**When to run.** By hand, before a minor version bump that touches a front-door
skill's description or rules (`orchestrate`, `corpus-flow`, `plan-split-dispatch`,
`grill-me`, `improve`).

**Cost.** Each run is a full Claude session on your own credential. Cases times
three runs is 42 triggering runs of up to 3 turns, 12 numbering runs of up to 12
turns and 6 injection runs of up to 25 turns. The cap above bounds a command, not
the three together. The first recorded run fills in the real figure.

## Test the graders

```
node --test "evals/**/*.test.mjs"
```

This runs no model. (Node 24 no longer takes a bare directory, so `node --test evals/`
fails with a module error; use the glob.) The tests cover `lib/graders.mjs` on
transcripts in `lib/fixtures/`, check that the committed `case.yaml` files are what
`build-cases.mjs` writes, and check that every scenario prompt has a triggering case.

## Layout

- `lib/transcript.mjs` turns a recorded run (stream-json events) into tool calls and a final message.
- `lib/graders.mjs` holds the graders: `gradeTrigger`, `gradeNumbering`, `gradeInjection`. Each returns pass or fail with a reason. The same checks appear declaratively in each `case.yaml` as `tool_used`, `regex` and `file_exists` graders, which is what scores a live run.
- `lib/fixtures/` holds the transcripts the tests use. They are hand-written in the stream-json shape; replace or add real ones from a run's `--json` output.
- `<eval>/cases.json` is the case data. `node evals/build-cases.mjs` writes each `<eval>/<case>/case.yaml` (and `scaffold.sh`) from it. Edit the JSON, never the generated files.
- `run.mjs` builds the command.

## Add a case

1. Add an entry to the eval's `cases.json`, with its prompt and what must hold.
2. Run `node evals/build-cases.mjs`, then the grader tests.
3. If the new check needs a new rule, add a grader to `lib/graders.mjs` with a pass and a fail fixture.

A failing eval becomes a brief. It never edits a skill in the same change.
