# Task 51: spike TypeScript 7 for tsc

**Depends on:** none. It runs on a quiet machine only: no other builder, browser or heavy check running, `uptime`
load under 2 before each timed series, and never at the same time as brief 50.

**Builder:** sonnet. An install, a wiring of two TypeScript versions, a parity diff and timings, in a scratch clone.

## Context

From [check-speed-2026-11-23.md](../../wiki/check-speed-2026-11-23.md), recommendation 5, and
[the todo](../../todos/spike-typescript-7-for-tsc.md) of 2026-11-24.

- TypeScript 7 (the Go port) was released 2026-07-08: 8-12x on full builds, no published incremental numbers, and
  no JavaScript API. Tools that load TypeScript's API stay on TypeScript 6; typescript-eslint does so through the
  `@typescript/typescript6` npm alias.
- An almanac clone on 2026-11-23: cold `tsc -b` 12.5 s to 2.4 s, warm web typecheck 3.5 s to 0.6 s, one file touched
  3.8 s to 1.0 s, with typescript-eslint on TypeScript 6 through the alias.
- Typecheck is 5% of almanac's gate and about 20% of the heavier repos' (64 s in imbatranim-apps).
- house-style pins `typescript` 6.0.3 as a peer and ships `tsconfig.base.json`
  ([`house-style/package.json`](../../../house-style/package.json)). vps-deploy, outside house-style, already
  type-checks with `typescript` 7.

What the clone run didn't settle, and this spike does: which tools in a house-style repo load TypeScript's API and
how each gets version 6; whether every step of `npm run check` still passes; diagnostics parity on real errors;
which `tsconfig.base.json` flags TypeScript 7 rejects; and the heavier repo. Adopting it changes house-style, so it
is the owner's call after this spike.

## Files you OWN

- `corpus/wiki/typescript-7-spike.md` (new), and this brief's outcome.
- A scratch clone of imbatranim-apps outside every repo, deleted at the end.
- `corpus/` (index, log, status).

## Files you must NOT touch

- `house-style/`, `skills/` and every adopter repo, imbatranim-apps' own checkout included.

## What to do

1. **The clone.** Clone imbatranim-apps at its HEAD into a new, empty scratch folder; `npm ci`; run `npm run check`
   once on TypeScript 6 as the baseline. Record the commit and the versions.
2. **Who loads the API.** `npm ls typescript`, then read which of the gate's tools import `typescript` at run time
   (typescript-eslint, dependency-cruiser, knip, Vitest and Vite, and any other the list shows). Table: tool, whether
   it loads the API, how it would get version 6.
3. **Two versions side by side.** `tsc` from TypeScript 7; version 6 for every tool in step 2's table that needs it
   (an npm alias or `overrides`). Record the exact `package.json` diff. Run `npm run check`: every step must pass;
   record each break and its fix.
4. **Diagnostics parity.** Compare `tsc` 6 and `tsc` 7 output at HEAD (both should be clean) and on a seeded probe
   set: a missing property, a wrong argument type, an implicit `any`, a possibly-null access, a switch that misses a
   union member, a failed `satisfies`, an unused `@ts-expect-error`. Record every difference.
5. **The base flags.** Run TypeScript 7 against `tsconfig.base.json` and the clone's own tsconfigs; list each flag it
   rejects or warns about.
6. **Timing,** on the quiet machine: cold `tsc -b` (build info deleted), warm, and one file touched, on version 6 and
   on version 7, three runs each, the median; then the whole `npm run check` once on each. Note the load before each
   series.
7. **Write `corpus/wiki/typescript-7-spike.md`** (the two frontmatter keys, under 200 body lines): step 2's table,
   the setup diff, parity, the flags, the timings with the load, the change house-style would ship (the peer pin,
   the alias, the CHANGELOG note, the typecheck in `check:fast`, the adoption step), and a recommendation: adopt,
   adopt with conditions, or not. Regenerate the catalog with `bash corpus/lint.sh --index`; don't edit the
   check-speed page, which is at its 200-line cap.
8. Delete the scratch clone.

## Acceptance

- The page has the tool table, the setup diff, parity at HEAD and on the seeded set, the flag list, the timings with
  the load, and a recommendation.
- `npm run check` passed in the clone with TypeScript 7's `tsc`, or the page says which step could not and why.
- `git status` shows no change under `house-style/` or `skills/`, and imbatranim-apps' checkout is untouched.
- `bash corpus/lint.sh` passes.

## Owner steps

None. At the end move, ask with `--question`: move house-style's `tsc` to TypeScript 7, as the page recommends, or
not?

## Owner decisions

- Settled 2026-11-24 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-24:
  - The spike runs on imbatranim-apps, where typecheck is about a fifth of the gate; almanac's 2026-11-23 numbers
    stand for a light repo.
  - It runs in a scratch clone, so no adopter's tree changes.
  - It and brief 50 never run together, so neither's timings carry the other's load.
