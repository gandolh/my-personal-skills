# numbering

Measures whether `corpus-flow` numbers a promoted brief as the max across `todo/`,
`blocked/`, `done/` and `superseded/` plus one. Four layouts: numbers spread over
all four folders, a deleted brief leaving a gap, the max sitting only in
`superseded/`, and an empty `todo/`. Each case builds a scratch repo from its
`scaffold.sh`, so it needs `--scaffold`, which `run.mjs` passes. The scripts are
generated from `cases.json` and only create files in the scratch folder.

A case passes when exactly one new brief is written, at the expected number, and
the agent stops after promoting.

Run: `node evals/run.mjs numbering --go`. Cost: 4 cases x 3 runs, up to 12 turns each.
