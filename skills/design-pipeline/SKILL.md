---
name: design-pipeline
description: Runs one app's redesign as a small design competition with the four design-team agents, in a fixed order with fixed hand-offs. design-director writes two directions (A evolve today, B the boldest structural answer that keeps today's strengths) and one content fixture; two design-sketchers draw the main screen; pairs.mjs makes anonymised pairs with today as a contestant; two design-judges compare them in reversed order, hard gates first; the controller tallies and rules; the winner is built in full with hallmark; design-critic reviews it against today; the controller rules over the critic; the builder fixes; the controller looks; the winner is published with the runner-up's sketch. Includes the pair maker and its test, the calibration case, the judging rules, the slot and token cost the pilot measured (about 1M tokens an app) and when to use three directions.
when_to_use: Use when the user says "run the design pipeline", "design competition", "let the judges pick", "pick the best direction", "sketch two directions and judge them", "act as a designer and pick the best", "/design-pipeline", or a redesign brief says to go through the design pipeline. Not for a small fix to an existing screen (impeccable or hallmark directly), and not for a page with no today to compare against (hallmark's new-build flow).
---

# The design pipeline

A redesign made by one agent in one pass tends to look generated, and the
gates a script can run (contrast, overflow, lint) can't tell a good design
from a flat one. The owner sent back the estate redesign board's first
proposal because it was one flat sheet with good type, while today's screen,
with its islands, "looked better". He asked for designs to be judged and
picked "as a designer would".

So the pipeline makes the design compete. A director writes two directions,
sketchers draw them, and two judges compare every pair blind, today's screen
included. Only the winner is built in full, then a critic reviews it against
today. The controller (the session that runs this skill) owns every hand-off
and every ruling. It was piloted on the-board (the brief-board app, three
directions) and atrium (two directions) on 2026-11-12. Both came through
with the judges unanimous and today losing every pair.

## The agents

| Agent | Model | Writes | Reads |
|---|---|---|---|
| `design-director` | opus | one directions file | the app (read only), today's shots, the registry |
| `design-sketcher` | sonnet | one sketch folder per direction | the directions file, today's shots |
| `design-judge` | opus, read only | one JSON line per pair, returned | only its folder of pairs |
| `design-critic` | opus | one findings file | the build's renders, today's shots, the judge result |

The full build is not one of these. It is a sonnet builder with the hallmark
skill and the project's own rules for redesign proposals, started from the
winning sketch.

## The order and the hand-offs

| # | Step | Who | Hands on |
|---|---|---|---|
| 1 | Directions | `design-director` | `directions/<app>.md`: today's strengths, the main screen, the content fixture, A and B, registry lines, questions for the owner |
| 2 | Sketches, one per direction | 2 × `design-sketcher` | `sketches/<app>/<L>/`: `sketch.html`, `light-1280.png` (1280×800), `dark-390.png` (390×844), the other renders, `tokens.md` |
| 3 | Pairs | the controller, `scripts/pairs.mjs` | `judge/<app>/{j1,j2}/pN-{A,B}.png` and `KEY.json` |
| 4 | Two judges | 2 × `design-judge`, j2 reversed | one JSON line per pair each, saved by the controller as `verdicts.md` in the judge's folder |
| 5 | Tally and rulings | the controller | `judge/<app>/RESULT.md`: the table, the wins, the winner, the runner-up, the rulings for the build |
| 6 | The winner's full build | a builder with hallmark | the key screens at five widths in both themes, the twins, the manifest |
| 7 | Critique | `design-critic` | `critiques/<app>.md` |
| 8 | Rulings over the critic | the controller | `critiques/<app>-controller.md` |
| 9 | Fix rounds | the same builder, resumed | the fixed screens; usually one or two rounds |
| 10 | The controller's look | the controller | a last side-by-side against today at the judged viewports |
| 11 | Publish | the controller | the winner, with the runner-up's sketch beside it and a note on how it placed |

What each step needs, what the controller checks before the next, and the
dispatch lines are in [references/hand-offs.md](references/hand-offs.md).
The judging (the pair plan, the gates, the tally, a split) is in
[references/judging.md](references/judging.md).

Rules the whole run keeps:

- **One content fixture.** Every sketch draws the fixture word for word, with
  the same rows and counts as today's shot, so the judges compare design and
  not data.
- **Today is a contestant and the floor.** The director lists today's
  strengths; every direction keeps them; the judges see today blind; the
  critic asks what today did better.
- **The judged inputs are fixed:** desktop light at 1280×800 and phone dark
  at 390×844, viewport shots, each pair cropped to the shorter height. What is
  in the first screen is what gets judged.
- **Rulings flow down.** The judge result's rulings override the directions
  file for the build. The controller's rulings over the critic override the
  critic. Neither may undo what won the judging.
- **Headless only, read only** outside each agent's own folder. No agent
  changes the app's repo; the redesign brief is built after the owner
  approves.

## Two directions, or three

**Two by default** (the owner, 2026-11-12, after the pilot): A "evolve
today", and B the boldest structural answer to the screen's job that still
keeps today's strengths. The judges then see three contestants (today, A, B):
3 pairs a viewport, 6 a judge, 12 verdicts.

**Three only when the owner asks**, for example when an app's structure is
itself in question and A and B can't cover the answers. Three directions add
a sketch (~100k tokens) and double the pairs: 6 a viewport, 12 a judge, 24
verdicts. On the-board the third direction (C) came second, and the winner
was still the boldest structural one.

## The calibration case

Shelfmark's Library: today's version, with a header card and the table on
its own surface, must beat a proposal with stronger type that put everything
on one flat sheet. The owner sent that proposal back. With structure (G1) a
hard gate, both reversed judges agreed with him. Re-run the case when you
change the judge's prompt. A judge that prefers the flat sheet is
miscalibrated. The images (today's Library at 1280 and the flat proposal's
two rounds) are not in this library; the estate keeps them with its
redesign run's notes, in the run's calibration folder.

## The cost

Measured on the pilot, in tokens:

| Step | the-board, 3 directions | atrium, 2 directions |
|---|---|---|
| Director | 165k | 178k |
| Sketches | 3 × ~100k | ~100k + ~93k |
| Judges | 2 × ~81k | ~71k each |
| Full build with two fix rounds | ~308k | |
| Critic | 127k | |
| **Total** | **about 1.06M** | |

Atrium's build and critique were still running when this was written. The
controller's estimate for an app with two directions is about 0.9M.

**Slots.** Each agent takes one of the session's parallel slots (the estate
runs at most three). Judges are light: they read a dozen images and write a
few lines, with no browser and no build, so both can run beside heavy work.
Sketchers, the build and the critic run headless Chrome; give them the slots
when the machine is quiet. Never skip the second judge to save a slot. The
reversal is the check.

## The pair maker

```
node scripts/pairs.mjs --today-desktop <today light 1280 png> --today-phone <today dark 390 png> \
  --sketches <sketches/<app>> --out <judge/<app>> [--letters AB]
```

It makes every unordered pair of today (T) and the directions, at 1280 light
and then at 390 dark. Today's side alternates from pair to pair, j2 gets
every pair reversed, and both images are cropped to the shorter height. It
writes `j1/`, `j2/` and `KEY.json`, which maps each A and B back to a
contestant. With `AB` the plan is p1 T v A, p2 B v T, p3 A v B, and p4 to p6
the same at 390. It has no dependency: the crop works on the PNG's own rows.
It refuses unequal widths (a render at the wrong scale), an interlaced PNG
and a missing input. Its test is `node --test scripts/pairs.test.mjs`.
