# Task 33: orchestrate keeps its gate under the cut, and three fixes

## Context

The stocktake of 2026-11-13 left three findings on `orchestrate` with no
brief, and a fourth gap showed up since:

- **F5, the gate sits past the 5,000-token cut.** After auto-compaction a
  skill keeps its first 5,000 tokens. The `routing.md` template (about 1.7k
  tokens, needed only on a bootstrap) pushes Step 5 (the Route Plan gate),
  Step 6 (the hand-off) and the Principles past that point.
- **F8, the skill contradicts itself on a trivial edit.** Step 1 says a 1-2
  file, non-sensitive change is made inline with the diff shown. Step 3 says
  nothing is written until the user agrees "on every path above, including
  the ones that look too small to bother with".
- **F9, "branch first".** The Principles tell the router to branch before
  committing. The owner's own repos work on `main` with no branches
  (2026-11-06), and brief 17, where this was to be fixed, was superseded.
  Other repos the owner works in require a branch per task. One sentence
  cannot be right for both.
- **The bootstrap has no guard for a corpus it did not create.** Step 0
  bootstraps whenever `corpus/routing.md` is absent. A repo can hold a
  `corpus/` with another layout and no `routing.md`; there the skill would
  write its skeleton into somebody else's workspace.

The owner's calls this brief follows: small fixes are made without asking
("Write todos, small fixes and corpus notes ... don't ask first",
2026-11-12), so F8 resolves in favour of the trivial-edit path.

## Files you OWN

- `skills/orchestrate/SKILL.md`.
- `skills/orchestrate/references/routing-template.md` (new).
- `README.md` (the version line), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- `plan-split-dispatch`: reading the new `Branching` and `Worktrees` lines is
  brief 34.
- `corpus-flow`'s bootstrap reference and the eval scaffolds, which write
  their own `routing.md`. A file without the new lines stays valid.

## What to do

1. **F5 first.** Move the `routing.md` template to
   `references/routing-template.md` and point at it from Step 0. Do this
   before adding text, so the additions land above the cut.
2. **F8.** Make the Step 1 trivial edit the one named exception to the
   approval gate: made inline, diff shown, nothing committed. Every routed
   task still waits for `go`.
3. **The bootstrap guard.** In Step 0, a `corpus/` that exists without
   `routing.md` is not bootstrapped. Say what was found and ask once.
4. **F9.** Add `Branching` and `Worktrees` lines to the template. The commit
   principle reads `Branching` instead of saying "branch first". When the
   line is absent: read the repo's instruction file for a branch rule, else
   ask once and write the answer into `routing.md`.

## Acceptance

- `node skills/stocktake/scripts/measure.mjs` shows `orchestrate` with the
  cut at or after the start of the Principles, or with no cut.
- The text has one rule for a trivial edit, stated the same way in Step 1,
  Step 3 and the Principles.
- No "branch first" in the skill.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass; the version
  is bumped in both plugin files, the README and `docs/history.md`.
- Owner step, not the builder's: the paid evals for a front-door skill.

## Outcome (2026-11-17)

Built in v0.56.0 (d9cb2bb). The `routing.md` template is in `references/routing-template.md` and the generic intent table in `references/intent-spine.md`; `measure.mjs` gives 4,801 tokens on invoke (6,858 before) and no cut, so Step 5, Step 6 and the Principles are all held. Moving the template alone left the cut inside Step 5, which is why the intent table moved too and the description and two principles were tightened. The trivial edit has one rule in Step 1, Step 3 and the Principles. Step 0 asks once where a `corpus/` exists without `routing.md`. `Branching` and `Worktrees` are template lines, with a fallback for files that lack them. Checks: `check-skills` 0 failing, `corpus/lint.sh` clean, the node tests under `evals/lib`, `scripts`, `hooks` and the stocktake scripts pass. Not done here: the paid evals, an owner step. `plan-split-dispatch` reads the two new lines in brief 34.
