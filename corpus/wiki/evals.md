---
summary: What `claude plugin eval` offers, the three evals the library has (triggering, numbering, injection), the exact commands to run them, and a table for the dated pass rates the owner records after each run.
updated: 2026-11-13
---

# Model evals

The library is text that models read. The evals in [evals/README.md](../../evals/README.md)
run a real model against it and score what it does. Brief 26 built them.

## What `claude plugin eval` offers

Read from `claude plugin eval --help` and `init --help` on Claude Code 2.1.319, plus the
case schema the binary validates against.

- It runs cases under `evals/` (a `case.yaml`, or `prompt.md` with `graders/*.md`) against
  a plugin, three runs per case by default, and writes an HTML report and
  `evals/results/<timestamp>/aggregate-result.json`.
- **Grading on which skill loaded: yes.** A `tool_used` grader names a tool and an
  optional `input_match`, with `min` and `max` counts, so `tool: Skill` plus
  `input_match: corpus-flow` passes when that skill was called. Other graders:
  `tool_order`, `file_exists`, `regex` over the last message, `llm` (judge model Haiku)
  and `baseline`.
- A no-plugin baseline arm runs by default (`--ablation with-without`). Under it, the
  `tool_used: Skill` graders are reported as "did the plugin fire" and not scored. The
  library's evals pass `--ablation none` and score them directly.
- `--max-cost-usd` is a hard ceiling (exit 2 when hit). `--no-publish` keeps the report
  local. `--scaffold` runs a case's `scaffold_script`; it is off by default.
- `init --bare <name> --eval-dir evals` writes a blank case.

**Runner choice.** `claude plugin eval`, with no custom harness (decision 1 of the brief).
The library's own graders in `evals/lib/` score recorded transcripts and are what
`node --test "evals/**/*.test.mjs"` checks, with no model call.

## The evals

| Eval | Cases | Command |
|---|---|---|
| triggering | 14 | `node evals/run.mjs triggering --go` |
| numbering | 4 | `node evals/run.mjs numbering --go` |
| injection | 2 | `node evals/run.mjs injection --go` |

Each prints, and with `--go` runs, `claude plugin eval . --case '<eval>-*' --ablation none --no-publish --max-cost-usd 5 --output-dir evals/runs/<date>-<eval>` (plus `--scaffold` for the last two).
A run that hits the cap is recorded as incomplete, not as a pass.

## Results

No run has been recorded. The brief's builder was told not to make paid model calls, so the
first run of each eval is an owner step. Fill one row per eval and case after each run, with
the plugin version and the date.

| Date | Plugin version | Eval | Case | Pass rate (of 3 runs) | Incomplete (cap hit)? |
|---|---|---|---|---|---|
| | | | | | |

## Unchecked until the first run

The cases were written against the schema in the binary and the runner was not started, so
check these on the first run and fix the generated files through `evals/build-cases.mjs`:

- `scaffold_script: scaffold.sh` resolves relative to the case folder and runs in the
  scratch folder the agent works in.
- `input_match` is a regular expression (the numbering case uses a lookahead).
- A `Skill` call's input holds the skill name, so the substring match fires.
- `evals/lib/transcript.mjs` reads the stream-json shape; check it against a run's `--json` output.
