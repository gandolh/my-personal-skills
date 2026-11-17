# Task 40: an opus dispatch names its reason, and the trivial tier goes

## Context

Two findings from a month of the owner's subagent runs (2026-10-19 to
2026-11-17, 624 runs), read against `plan-split-dispatch`'s routing rules.

**Opus builds with no listed risk.** 204 runs asked for opus. Sorted by
description and prompt opening against the senior list in step 2:

- 51 builds meet a listed criterion (sign-in, hostile input, a protocol
  bridge, grants, deploy and secrets, a first-of-its-kind contract).
- 33 builds meet none: an app shell, a list screen, a composer, a second and
  third copy of an install flow. They wrote 3.26M of opus's 14.3M output
  tokens. 24 of the 33 predate 2026-11-12; 9 came after.
- The rest are design roles, review, research and walks, which are not builds.

The count is an upper bound: the briefs themselves were not read, and some of
the 33 may be "new design whose acceptance has gaps". Where the controller
wrote a "why opus" line into the prompt file, the reason was a listed one every
time. The runs with no such line are where the 33 sit. Sonnet's record over
the same month: 3 BLOCKED hand-backs in the 155 that carry a status word.

**The trivial tier is a dead rule.** Step 2 defines a trivial tier on haiku.
No chunk was ever tagged trivial, in the controller's text or in any `Agent`
call, and step 4 names only opus and sonnet at dispatch. The work the tier
describes existed: 11 sonnet runs look like strict find-and-replace (renames,
version bumps, re-sync sweeps), about 0.12M output tokens in the month. Moving
them would save too little to pay for a third tier in a skill that sits near
its 5,000-token cut.

## Files you OWN

- `skills/plan-split-dispatch/SKILL.md` (steps 2 and 4, the configuration
  summary).
- `skills/plan-split-dispatch/references/templates.md`,
  `references/wave-mode-and-configuration.md`,
  `references/review-and-verify.md` (the fix agent's tier line).
- `skills/stocktake/references/scenarios/plan-split-dispatch.md`.
- `README.md` (the version line), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- `agents/owner-steps.md`: its haiku pin is an agent's model, not the tier.
- The senior list itself. This brief makes the list binding; it does not
  change it.

## What to do

1. Delete the trivial tier everywhere the skill, its references and its
   scenario name it. Two tiers remain.
2. An opus dispatch names the criterion from the senior list it meets, in the
   plan line and in the prompt. A chunk or brief that names none goes out on
   sonnet; escalate-on-block stays the safety valve.
3. Give the reason for both in the configuration reference, with the numbers
   above.

## Acceptance

- `grep -rn -i "haiku\|trivial" skills/plan-split-dispatch` prints only the
  "non-trivial" sentence in the review reference.
- Step 4 says what an opus dispatch must name and what happens without it.
- `node skills/stocktake/scripts/measure.mjs` shows no cut inside
  `plan-split-dispatch`, and fewer tokens on invoke than before (4,869).
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass; the version
  is bumped in both plugin files, the README and `docs/history.md`.
- Owner step, not the builder's: the paid evals for a front-door skill.

## Outcome (2026-11-17)

Built in v0.60.0 (c5dc4c3). Step 2 has two tiers, and step 4 says an opus dispatch names the step 2 criterion it meets and that one with none goes out on sonnet. The plan template asks for the criterion on a senior line and no longer counts trivial dispatches; the fix agent's tier line and the scenario follow. The configuration reference holds the reason and the numbers. `measure.mjs` gives 4,864 tokens on invoke and no cut (4,869 before). Checks: `check-skills` 0 failing, `corpus/lint.sh` clean, and the acceptance grep prints only the "non-trivial" sentence. Not done here: the paid evals, an owner step. The rule is text: whether opus builds without a listed reason stop shows in the next month's transcripts.
