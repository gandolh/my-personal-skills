# Task 50: spike oxlint for the typed lint rules

**Depends on:** none. It runs on a quiet machine only: no other builder, browser or heavy check running, `uptime`
load under 2 before each timed series, and never at the same time as brief 51.

**Builder:** opus, for new design whose acceptance has gaps: what house-style would ship for a typed-lint move, and
whether its findings match, are this spike's to work out.

## Context

From [check-speed-2026-11-23.md](../../wiki/check-speed-2026-11-23.md), recommendation 3, and
[the todo](../../todos/spike-oxlint-for-the-five-typed-rules.md) of 2026-11-24.

- ESLint is about half of every gate. Three rules take about 80% of its rule time in almanac and imbatranim-apps:
  `@typescript-eslint/no-misused-promises` (40%), `react-hooks/static-components` (22-28%) and
  `@typescript-eslint/no-floating-promises` (15-17.5%). The first typed rule pays for building the TypeScript
  program, so dropping one only moves that cost to the next.
- typescript-eslint says not to use `--cache` with typed rules, so today's biggest step can't be cached.
- oxlint's `--type-aware` mode covers the typed rules at 12-18x on full runs, with no result cache.
- An almanac clone on 2026-11-23: typed ESLint 46 s, against 18 s for ESLint without types plus 3-5 s for
  `oxlint --type-aware` on the typed rules. The same findings on one probe file, none at HEAD.

The typed rules are the ones in house-style's `house-style/typed` block
([`eslint.config.js`](../../../house-style/eslint.config.js)) that need type information:
`no-floating-promises` (with `allowForKnownSafeCalls` for `node:test`'s `describe`, `it` and `test`),
`no-misused-promises`, `await-thenable`, `switch-exhaustiveness-check` (with
`considerDefaultExhaustiveForUnions: true`) and `no-unnecessary-type-assertion`. The same block holds
`consistent-type-imports` and `no-import-type-side-effects`, which need no types and stay in ESLint. (The skill's
description says "six typed rules"; the count belongs to whichever brief adopts the change.)

What the clone run didn't settle, and this spike does: parity on real and seeded violations, the two rule options,
`eslint-disable` comments naming these rules, a heavier repo, ESLint's `--cache` caveats once types are gone
(import-x resolving imports, better-tailwindcss checking classes against the stylesheet), and the change house-style
would ship. Adopting it changes house-style, so it is the owner's call after this spike.

## Files you OWN

- `corpus/wiki/oxlint-spike.md` (new), and this brief's outcome.
- A scratch clone of game-engine outside every repo, deleted at the end.
- `corpus/` (index, log, status).

## Files you must NOT touch

- `house-style/`, `skills/` and every adopter repo, game-engine's own checkout included: the spike changes
  nothing that ships.

## What to do

1. **The clone.** Clone game-engine at its HEAD into a new, empty scratch folder; `npm ci`. Record its commit,
   ESLint and typescript-eslint versions, and the exact oxlint and tsgolint versions you install there.
2. **Two configurations, same commit.**
   - **A:** today's (`npm run lint`).
   - **B:** house-style's config with the typed rules off and type information off (no `projectService`), plus
     `oxlint --type-aware` with only the typed rules and their options, in an `.oxlintrc.json`.
3. **Parity.** Diff A's typed-rule findings against B's oxlint findings:
   - at HEAD;
   - on a seeded probe set: for each rule a case that must fire and one that must not, the two options exercised,
     and an `eslint-disable-next-line` naming each rule;
   - on up to five past commits, in game-engine or another adopter, whose diff fixed one of these rules'
     findings (search `git log` for the rule names and `void` additions); run both on each fix's parent.
   Record every difference, with its file and line.
4. **Timing,** on the quiet machine: A and B, cold and warm, three runs each, the median; B's ESLint with `--cache`
   warm, and with one file touched. Note the load before each series.
5. **The cache caveats.** With B's ESLint on `--cache`: rename an exported name another file imports, and remove a
   theme token a class uses from the stylesheet. Does the cached run miss a finding an uncached run reports? Record
   both answers.
6. **Write `corpus/wiki/oxlint-spike.md`** (the two frontmatter keys, under 200 body lines): what was compared, the
   parity table, the timings with the load, the caveats, the change house-style would ship (the typed block,
   an oxlint config in the vendored copy, the pins, the `lint` and `check:fast` scripts, the adoption step, what
   each adopter changes), and a recommendation: adopt, adopt with conditions, or not. Regenerate the catalog with
   `bash corpus/lint.sh --index`; don't edit the check-speed page, which is at its 200-line cap.
7. Delete the scratch clone.

## Acceptance

- The page has parity at HEAD, on the seeded set and on the past fixes; the timings with the load; both caveat
  results; and a recommendation.
- `git status` shows no change under `house-style/` or `skills/`, and game-engine's checkout is untouched.
- `bash corpus/lint.sh` passes.

## Owner steps

None. At the end move, ask with `--question`: adopt oxlint for the typed rules in house-style, as the page
recommends, or not?

## Owner decisions

- Settled 2026-11-24 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-24:
  - The spike runs on imbatranim-apps: its lint was the slowest measured (145 s, 470 files), and almanac's numbers
    from 2026-11-23 already stand for a light repo.
  - It runs in a scratch clone, so no adopter's tree changes.
  - Parity is checked three ways, because HEAD alone had no findings in the almanac run.

- Changed 2026-11-24 by the controller (the owner's "pick recommended" while away): the spike times a scratch clone of
  game-engine, not imbatranim-apps, because the owner has paused all imbatranimOS and imbatranim-apps work. game-engine
  is the heaviest gate outside the paused repos; record its baseline first, since the numbers above are
  imbatranim-apps' and almanac's.
