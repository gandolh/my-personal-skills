# Task 26: Model evals for the library's prompts (from pingdotgg/t3code)

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed for ideas.
**pingdotgg/t3code** was read at `077fd622` (2026-11-09, MIT, T3 Tools). It
is an "agent harness control surface": a local server and desktop or mobile
app that drives Claude Code, Codex, Cursor, opencode and others on your
machine. The app is not for this estate, since the owner already drives
cloud sessions from the Claude app. Two engineering practices in the repo
are:

- **knip** for unused files, exports and dependencies. It went into brief 03
  the same day (decision 8).
- **`evals/`.** In its words: "An eval runs a real model against T3 Code's
  real text or code and scores what the model does. Use one where a unit
  test cannot help: model output changes from run to run, and a small copy
  change can move it." Every eval has the same shape:
  - `run.ts`;
  - a README that says what it measures, how to run it, how to add a case,
    and what a run costs;
  - graders that are unit-tested;
  - output in a gitignored `runs/`.

  CI never runs evals, because they cost money; it only tests the graders.
  One of them, `pr-content`, checks that generated PR text describes the
  diff even when project instructions try to redirect it: a prompt-injection
  eval.

This library is almost entirely text that models read, and nothing measures
whether it works:

- whether `orchestrate` triggers on a build request;
- whether `corpus-flow` numbers a brief right;
- whether a description change made a skill stop loading.

superpowers tests its skills with pressure scenarios (`writing-skills`,
brief 17). ECC's `skill-comply` reports compliance rates, and brief 19
writes scenario files in that shape. This brief builds the harness that
runs them.

### The runner exists (checked 2026-11-09, Claude Code 2.1.319)

`claude plugin eval [target]` runs eval cases against a plugin and scores
them. A case is either `evals/<case>/prompt.md` (frontmatter `max_turns`,
`allowed_tools`) with `graders/*.md` (frontmatter `type: llm`, `weight`),
or a `case.yaml`.

- **Baseline.** It runs a no-plugin baseline arm by default
  (`--ablation with-without`) and reports the score delta. Graders marked
  with-only, including **`tool_used: Skill`**, are reported as "did the
  plugin fire" indicators. That is exactly the triggering eval.
- **Runs and cost.** Each case runs 3 times by default (`--runs`). The
  judge model is Haiku (`--judge-model`). `--max-cost-usd` sets a hard
  ceiling, and `--threshold` sets the exit-1 bar. MCP servers are mocked
  (`--mocks record`), and scaffold scripts run only with `--scaffold`.
- **Report.** It writes an HTML report, published to claude.ai by default
  (`--no-publish` keeps it local), and results go to `evals/results/`.
- **Authoring.** `claude plugin eval init` writes a suite through an
  interview. `init --bare <name>` writes a blank case, tried in scratch on
  2026-11-09: it created `evals/demo/prompt.md` and
  `evals/demo/graders/criteria.md`.

Each case is a full Claude run on the owner's own credential, so a suite
costs real usage.

## Owner decisions (defaults)

1. **The runner.** Default: `claude plugin eval`, as above. No custom
   harness. t3code's shape survives as the convention for each case's
   README: what it measures, how to add a case, and the cost of one full
   run. Results stay in `evals/results/` (gitignored), and a dated summary
   goes to `corpus/wiki/evals.md`.
2. **What to eval first.** Default: three evals.
   - **triggering:** does the right skill load for each prompt in brief
     19's scenario files?
   - **brief numbering:** does `corpus-flow` pick the next number across
     the four folders, including when an old brief was deleted? This is the
     rule that "never restarts".
   - **injection:** with a planted instruction in a repo's README, does
     `improve` still only report? This is modelled on t3code's
     `pr-content`.
3. **When to run.** Default: by hand, before a minor version bump that
   touches a front-door skill's description or rules. Never in CI, which
   this repo forbids anyway.

## Files you OWN

- `evals/` (new):
  - a README;
  - one folder per eval, with its cases, grader and grader tests;
  - a shared runner;
  - a gitignored `evals/runs/`.
- `.gitignore`, `corpus/CLAUDE.md` (a "Skill changes" line saying when evals
  run), `docs/history.md`, both plugin files, `ATTRIBUTION.md` (Influences),
  `corpus/`.

## Files you must NOT touch

- Skill bodies. A failing eval becomes a brief.

## What to do

1. Find out what `claude plugin eval` offers today, and record that on a
   wiki page `corpus/wiki/evals.md`, including whether it can grade on which
   skill loaded. Choose the runner (decision 1).
2. Build the three evals. Each has:
   - cases as data files;
   - a grader that reads the transcript or tool calls and returns pass or
     fail with a reason, with `node --test` tests on recorded transcripts;
   - a README with the cost of one full run.
3. Run each once. Record the pass rate per case in `corpus/wiki/evals.md`,
   with the date and the plugin version.
4. Credit t3code's eval shape and superpowers' and ECC's ideas in
   `ATTRIBUTION.md`, and bump the minor version.

## Acceptance

- `node --test evals/` passes: graders only, no model calls.
- One recorded run of each eval with its pass rates is in
  `corpus/wiki/evals.md`.
- `corpus/CLAUDE.md` says when evals run.
- `bash corpus/lint.sh` passes, and the version is bumped.
