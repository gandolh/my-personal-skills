# triggering

Measures whether the right skill loads for each of the 14 prompts in
`skills/stocktake/references/scenarios/`. Each case passes when a `Skill` call
names an accepted skill (a front door may route, so an implicit capture prompt
accepts `orchestrate` or `corpus-flow`). The `plan-split-dispatch` adversarial case
also requires no `Agent` call. The `grill-me` adversarial scenario is left out: it
needs a grilling session already running.

Read the pass rate per skill and per level. A skill that passes explicit and fails
implicit has a description problem.

Run: `node evals/run.mjs triggering --go`. Cost: 14 cases x 3 runs, 3 turns each,
no baseline arm. Add a case: see `../README.md`.
