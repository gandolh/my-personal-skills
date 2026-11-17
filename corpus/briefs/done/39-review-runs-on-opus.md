# Task 39: review runs on Opus

## Context

`plan-split-dispatch` says review finders default to sonnet, with at most one
opus finder on the highest-risk lens, and `brief-auditor` is pinned to sonnet.
The owner's rule is that code review runs on Opus. On 2026-11-17 the owner was
shown both and picked: **review runs on Opus.**

What the gate produced, measured on the owner's session transcripts from
2026-10-19 to 2026-11-17 (624 subagent runs):

- 23 review runs outside the security audit: 17 on sonnet, 6 on opus. The 17
  sonnet runs wrote 148k output tokens in the whole month, so the rule costs
  little either way.
- Finder runs appeared in 2 of the 5 sessions that invoked the skill.
- `brief-auditor` has 0 runs against 48 `brief-builder` runs since it arrived
  on 2026-11-12. Its trial is brief 38.

So the model is the small half. The gate also needs to leave a trace when it
runs and when it is skipped.

## Files you OWN

- `skills/plan-split-dispatch/SKILL.md` (step 7; it sits at about 4,840 of
  5,000 tokens on invoke, so the net change must not grow it past the cut).
- `skills/plan-split-dispatch/references/review-and-verify.md`,
  `references/templates.md`, `references/wave-mode-and-configuration.md`: the
  lines that name the finder's model.
- `agents/brief-auditor.md`: the `model` line only.
- `README.md` (the agent table and the version line), `docs/history.md`, both
  plugin files, `corpus/`.

## Files you must NOT touch

- The rest of `agents/brief-auditor.md`, the DRAFT sentence included: brief 38.
- The `effort` lines in any agent definition.
- The trivial tier and the fix agent's tier: brief 40.

## What to do

1. Every review finder runs on opus. Remove "default to sonnet" and "at most
   one opus finder" wherever they appear.
2. `brief-auditor` runs on opus.
3. Step 7 gets a completion line: the delivery names each review run and its
   verdict, or the reason the gate was skipped.
4. Record the owner's pick in `corpus/wiki/decisions.md`.

## Acceptance

- `grep -rn -i "finders default\|sonnet finders" skills/plan-split-dispatch`
  prints nothing.
- `agents/brief-auditor.md` says `model: opus`, and the README table agrees.
- `node skills/stocktake/scripts/measure.mjs` shows no cut inside
  `plan-split-dispatch`.
- `node scripts/check-skills.mjs`, `bash corpus/lint.sh` and
  `node --test scripts/install-agents.test.mjs` pass; the version is bumped in
  both plugin files, the README and `docs/history.md`.
- Owner steps, not the builder's: the paid evals for a front-door skill, the
  plugin update, and a re-run of `scripts/install-agents.mjs` so the user-level
  copy of `brief-auditor` takes the new model.

## Outcome (2026-11-17)

Built in v0.59.0 (b9467e1). Step 7 of `plan-split-dispatch` says every finder runs on opus and ends on a completion line; the review reference, the plan template and the configuration reference say the same, and the reference gives the owner's rule and the measured cost as the reason. `agents/brief-auditor.md` is `model: opus`, and the README table agrees. `measure.mjs` gives 4,869 tokens on invoke and no cut (4,841 before). Checks: `check-skills` 0 failing, `corpus/lint.sh` clean, the install-agents test 4 of 4. The pick is in `wiki/decisions.md`. Not done here: the paid evals, the plugin update and the re-run of `scripts/install-agents.mjs`, all owner steps. The completion line is text; whether the gate now runs shows in the next month's transcripts.
