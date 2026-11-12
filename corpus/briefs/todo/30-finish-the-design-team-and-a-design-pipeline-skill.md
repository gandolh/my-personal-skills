# Task 30: Finish the design team, and a design-pipeline skill

## Context

v0.45.0 added four draft agents, `design-director`, `design-sketcher`,
`design-judge` and `design-critic`, during the estate redesign board
(brief 28). They were written before any app had gone through the whole
pipeline. The todo
[finish-the-design-team-agents](../../todos/finish-the-design-team-agents.md)
asked for the pilot's lessons to be folded in once it was done.

The pilot is done. The brief-board app (the-board) went director → three
sketches → two reversed judges → full build → critic → two fix rounds, and is
on the owner's redesign board with the runner-up's sketch beside it. Atrium
followed with two directions and was judged. The estate build kept its
working prompts, the judges' results, the critic's file with the controller's
rulings over it, the pair maker and the board layout tool beside its other
build notes. What they changed:

- **Two directions by default** (the owner, 2026-11-12, after the pilot):
  A "evolve today", and B the boldest structural answer that keeps today's
  strengths. Three only when the owner asks. The judges then get three
  contestants (today, A, B): every unordered pair at desktop light and phone
  dark, today's side alternating, the second judge in reversed order.
- **The judges agreed.** The-board: 24 of 24 verdicts agreed across the
  reversal (B 6, C 4, A 2, today 0); one judge failed today on G3 (a
  clipped "Blocked by: Wai…" badge). Atrium: 12 of 12 (B 4, A 2, today 0);
  today failed G1 in every pair (a header that shares the page fill).
- **The full build traded away density.** The critic found one lane above
  the fold at 1280 where today showed three. Its fixes then proposed an
  ellipsis and a line clamp, and hiding the reasons on the phone: the very
  things the judges had marked today down for, and the reason B won on the
  phone. The controller overruled those.
- **The sketcher's renders are the judges' inputs.** The pair maker reads
  the desktop light and phone dark viewport shots and crops each pair to
  the shorter height.
- **The measured cost.** The-board, three directions: director 165k,
  sketches 3 × ~100k, judges 2 × ~81k, the build with two fix rounds ~308k,
  critic 127k, about 1.06M tokens. Atrium, two directions: director 178k,
  sketches ~100k and ~93k, judges ~71k each.

## Files you OWN

- `agents/design-director.md`, `agents/design-sketcher.md`,
  `agents/design-judge.md`, `agents/design-critic.md`.
- `skills/design-pipeline/` (new): `SKILL.md`, its references, and
  `scripts/pairs.mjs` with its test.
- `README.md`, `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- The workflow agents (`brief-builder`, `screen-capturer`, `brief-auditor`,
  `owner-steps`) and `hooks/agent-guard.mjs`.
- The estate build's working files: read them, never write them.

## What to do

1. **Fold the pilot into the four agents** and drop "DRAFT" from their
   descriptions.
   - Director: two directions by default, A evolve today and B the boldest
     structural answer; three only on the owner's ask.
   - Sketcher: it renders the exact pair inputs (desktop light 1280×800 and
     phone dark 390×844 viewport shots), and today's shots are cropped to the
     same height; no annotations.
   - Judge: hard gates G1 and G3 first (G3 adds "no ellipsis on content"),
     then the weighted rubric. A win counts only when both reversed runs
     agree; on a split the controller decides and records why. Keep the
     calibration case and add the pilot's evidence.
   - Critic: measure what fits in the first desktop and the first phone
     viewport against today. Its fixes may not bring back what lost the
     judging or remove what won it, and the controller's rulings override
     the critic where they clash.
2. **A skill that runs the pipeline**, `skills/design-pipeline/`: the order
   and the hand-offs (director → 2 sketchers → pairs → 2 reversed judges →
   tally → the winner's full build → critic → controller rulings → fix
   rounds → controller look → publish the winner with the runner-up's
   sketch), the slot cost, the calibration case, the measured cost per app,
   and when to use three directions.
3. **The pair maker as a script** under the skill, in node with no
   dependency (the library has no image package): every unordered pair at
   both viewports, today's side alternating, the second judge reversed,
   each pair cropped to the shorter height, and a key file. A test builds
   its PNGs at run time.
4. **Release** 0.47.0: both plugin files, the README's version line and its
   agent and skill tables, a `docs/history.md` paragraph on what changed from
   the drafts.

## Acceptance

- `node --test skills/design-pipeline/scripts/pairs.test.mjs` passes. It
  checks the pair plan for two and three directions, the reversal, the
  alternation of today's side, the crop against decoded pixels for every PNG
  filter type, and the refusals (an interlaced image, unequal widths, a
  missing input).
- The script run on atrium's real inputs (into a scratch folder) gives the
  same key as the estate's atrium judging.
- No agent description says DRAFT. No agent or skill text names a machine
  path, a username or the domain.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass, and the
  version is 0.47.0 in every place.
