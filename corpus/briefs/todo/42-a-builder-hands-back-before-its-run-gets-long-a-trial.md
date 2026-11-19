# Task 42: a builder hands back before its run gets long, a trial

## Context

A month of the owner's subagent runs (2026-10-19 to 2026-11-17, 624 runs)
shows that run length costs more than the choice of model.

- Every API call re-reads the whole conversation from the cache, so a run
  twice as long costs about four times as much to re-read.
- 180 runs made 100 or more API calls. They are 29% of the runs and 78% of
  all cache-read tokens (8.1 of 10.4 billion). The 49 runs with 200 or more
  calls carry 39% on their own.
- At API list prices, cache reads were the largest line of what the subagents
  spent on their own tokens, about 60%.
- A `brief-builder` run made a median 85 calls on sonnet (37 runs) and 164 on
  opus (11 runs), and peaked at a median 222k and 314k tokens of context.

The library already prefers small briefs. Nothing stops a builder whose
brief turned out long: `agents/brief-builder.md` says only "if your context
runs low, stop at a clean point".

A fresh builder is not free. It re-reads the prompt files, the brief and the
code it needs before its first edit. So the saving is smaller than the raw
numbers, and a hand-back placed badly costs more than it saves. That is why
this is a trial with no number in it yet.

## Open design call, settled by the trial's first step

How the builder knows it is time. A builder cannot read its own token use.
Three ways, cheapest first:

1. **The controller splits at the brief's steps before dispatch** ("build
   steps 1 to 3, commit, hand back"). Needs nothing from the builder.
2. **The builder hands back at a step boundary once it has made N tool
   calls**, counting them itself.
3. **A hook counts the calls** and tells the builder at the budget.

Start with 1. Move to 2 or 3 only if 1 cannot be placed well from the brief
alone.

## Files you OWN

- This brief, for the trial's notes.
- After the trial, and only if it pays: `agents/brief-builder.md` (the
  hand-off note's shape and a hand-back status that means "more to do"),
  `skills/plan-split-dispatch/references/wave-mode-and-configuration.md`,
  `README.md`, `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- `skills/plan-split-dispatch/SKILL.md` until the trial has a result: it sits
  near its 5,000-token cut.

## What to do

1. Pick the next three briefs, in any repo, whose builder is likely to pass
   100 calls: several steps, several packages, or an in-browser acceptance.
2. Build each in two or three parts split at its steps. Each part ends with a
   commit and a hand-off note: steps done, the next step, files touched, the
   state of each check, anything learned that the next part needs.
3. Record per brief, under "Trial results": the calls and cache-read tokens
   of each part, the calls a fresh part spent before its first edit, and any
   rework a part did because the note was thin.
4. Compare with one-run builds of the same kind from the month's transcripts.
5. Report to the owner with a recommendation: a budget and where it lives, or
   "not worth it".

## Acceptance

- Three rows under "Trial results", with the comparison and a recommendation.
- No budget number in any skill or agent file before the owner picks.
- If the owner picks a budget: the builder's hand-off note has a fixed shape,
  the controller's reference says when to split, and the version is bumped in
  both plugin files, the README and `docs/history.md`.

## Trial results

Split by the controller at the brief's steps (way 1). Calls are API calls, deduplicated by message id; "first edit" is the calls a fresh part made before its first file write.

| # | Repo and brief | Parts: calls / before first edit / cache read | Rework from a thin note | Notes |
|---|---|---|---|---|
| 1 | imbatranimOS 90 (Image Viewer by date; 2026-11-19, sonnet) | 1 logic: 17 / 7 / 0.9M. 2 view: 31 / 8 / 2.6M. 3 walk, shots, closeout: 112 / 18 / 10.2M | None | Parts 1 and 2 stayed small. Part 3 passed 100 calls: the in-container walk itself (seeding, the browser, ten shots) is most of it, and it found two view defects (a phone toolbar, focus after Enter) that the two earlier parts' unit tests could not. |
| 2 | wzd_auth, a shared-library change (2026-11-19, opus) | 1: 97 / 43 / 17.3M. 2: 108 / 41 / 19.9M | None | Each part still ran about 100 calls. The fresh part 2 spent 41 calls reading before its first edit, nearly what part 1 did, so the split bought a fresh context but no saving. |
