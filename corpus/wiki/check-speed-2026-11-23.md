---
summary: Why the estate's checks (typecheck, lint, format, conventions, unit tests) feel slow during builds and what to make selective or cached, measured 2026-11-23 from 145 builder transcripts and step timings in almanac and imbatranim-apps, with what each tool's cache or selective mode misses, a ranked list of changes and candidate briefs (none filed).
updated: 2026-11-23
---

# Check speed, 2026-11-23

The owner asked for research on selective test runs or caching, because tests, lint and
validation seem to eat much of the time when something gets built. This page measures where
the time goes, checks what each tool can safely skip, and ranks the changes. Nothing was
changed in any repo.

## Short answer

- Checks take about 16% of builders' active time. The median builder spent 15% of its time
  in checks, a quarter of builders 29% or more, the slowest tenth over half.
- The full `npm run check` is two thirds of that. Cutting repeated full runs is cheap but
  small: about 1.6 h over two weeks, a quarter of the full-check time, and two thirds of it
  sits in ten builders.
- Inside one gate, ESLint is about half the time, and three rules take 80% of ESLint's rule
  time. typescript-eslint says not to use `--cache` with typed rules, so the biggest step
  can't simply be cached. Moving the typed rules to oxlint's type-aware mode is the largest
  lever on every run, and it is a migration.
- Do now: the Prettier and depcruise caches, and a builder rhythm for the tail. Spike:
  oxlint for the typed rules, then TypeScript 7 for `tsc`.

## Where the time goes in builds

Every builder subagent transcript since 2026-11-10 (brief-builder, or a general agent
described as Build, Fix or Finish). Each shell call is timed from the call to its result.
Text inside heredocs and quotes doesn't count, so a commit message naming `npm run check`
isn't a run. Active time counts at most ten minutes of any gap, which drops waits and
resumes; first-to-last wall time was 107 h.

| Measure | Value |
|---|---|
| Builder transcripts | 145, 61.2 h of active time |
| Tool time | 31.4 h, 51% of active |
| Static checks and unit tests | 9.6 h, 15.7% of active. Per builder: median 15%, p75 29%, p90 52% |
| Full `check` | 293 runs, 6.4 h. None in 46 builders, one in 25, two in 33, six or more in 8 |
| Playwright and screenshot checks | 5.7 h |
| `check:fast` | 11 runs, 4 min |

Left out: 2.7 h of edit scripts that end in a Prettier call, which mix editing with
formatting.

What the full runs looked like:

- About a third ended in a failure by their output, a third passed, and a third printed too
  little to tell. The gate chains its steps with `&&`, so a lint failure hides what the
  tests would have said, and the next run finds it.
- 25 to 62 of them ran with no code change since the previous full run (two ways of
  detecting edits). Builders re-ran to read a different part of the output, re-ran after a
  `timeout` shorter than the gate killed it, and re-ran after a commit.
- A passing full check took a median 39 s in almanac, 72 s in Shelfmark, 83 s in
  imbatranim-apps, 89 s in wzd_auth, 115 s in imbatranimOS and 128 s in Postern, next to up
  to four other builders.
- Builders have no reason to run `check:fast`. The builder agent counts a check as passed
  only when it ran in full after the last change, and many briefs ask for a green gate on
  every commit. The plugin also registers its end-of-turn hook for `Stop` only, and Claude
  Code fires `SubagentStop` when a subagent ends, so a builder never gets that check. In
  main sessions the hook is cheap: 588 runs, 0.27 h, median 0.1 s.

## Where the time goes inside one check

Each step timed alone: twice in almanac (243 linted files), once in imbatranim-apps (470).
The machine sat at a load of 20 to 27 on 16 cores, partly from a stray headless browser
holding about nine cores, so the seconds run two to three times high. Read the proportions.

| Step | almanac | almanac, second cached run | imbatranim-apps |
|---|---|---|---|
| typecheck, `tsc -b` and web | 8-15 s | already incremental | 64 s |
| `eslint .` | 92-99 s | 2.9 s with `--cache`, no change | 145 s |
| `prettier --check .` | 8.5 s | 2.0 s with `--cache` | 22 s |
| knip | 3.6 s | 1.3 s with `--cache` | 5.7 s |
| depcruise | 2.7 s | 1.3 s with `--cache` | 6.7 s |
| base-ui and structure checkers | 0.9 s | | |
| `vitest run` | 30-49 s | | 65 s |

One almanac Vitest run failed under this load and passed on the rerun, so at least one test
there depends on timing.

ESLint's profile (`TIMING`) puts three rules at about 80% of rule time in both repos:

| Rule | almanac | imbatranim-apps |
|---|---|---|
| `@typescript-eslint/no-misused-promises` | 40% | 40% |
| `react-hooks/static-components` | 22% | 28% |
| `@typescript-eslint/no-floating-promises` | 17.5% | 15% |

The first typed rule that asks for types pays for building the TypeScript program, so
`no-misused-promises` carries that cost; dropping it would move the cost to the next typed
rule. `react-hooks/static-components` comes with react-hooks 7's recommended set (house rule
17) and needs no types. The cost is its compiler analysis.

Selective runs in almanac: ESLint on one changed file took 7-10 s against 92 s for the repo,
which is what `check:fast` does. `vitest related` on a leaf web component picked one test
file and took 6.8 s. On a core server file it picked 16 of 74 and took 27-33 s, against
35 s for everything: most server files reach the heavy app tests, and imports dominate
(121 s of imports summed across workers, 195 s of tests).

## What each tool can skip, and what it misses

Checked against the installed versions (TypeScript 6.0.3, ESLint 10.9.1, typescript-eslint
8.72.2, Prettier 3.9.10, knip 6.44.2, dependency-cruiser 18.7.2, Vitest 4.1.12, turbo 2.10.5,
Playwright 1.63) by a research pass over current docs on 2026-11-23. Links are at the end.

| Tool | What it misses | Verdict |
|---|---|---|
| ESLint `--cache` | No cross-file tracking. typescript-eslint: "it will only work reliably for untyped rules", "We don't recommend using `--cache`". A function that turns async leaves an unchanged caller with a floating promise the cache passes | Not while typed rules run in ESLint |
| ESLint `--concurrency` | Each thread builds its own TypeScript program; eslint-p reports slowdowns with typed rules | No |
| Prettier `--cache` | Keyed on Prettier's version, the options and the content; the house config has no plugins. A run without `--cache` deletes the default cache, and the formatter hook runs one on every save (tested) | Yes, with its own location |
| knip `--cache` | Stale after config or alias changes and when a missing file appears. Saved 2 s here | No |
| depcruise `--cache` | Invalidates when the files, arguments or filters change | Yes, 1-2 s |
| Vitest `related`, `--changed` | Static imports only. Misses dynamic imports, files read with `fs`, and `shared/dist` rebuilt from a `shared/src` change | Inner loop, leaf files |
| Vitest `experimental.fsModuleCache` | Off in 4.x, on by default in Vitest 5. Not keyed on plugin options | Spike: almanac's suite is import-bound |
| turbo task cache | Anything outside the hash. game-engine's audit-01 on 2026-09-13 found eight broken packages replayed as cached green until `^` dependencies went in | Only with complete inputs |
| TypeScript 7 `tsc` | Released 2026-07-08, 8-12x on full builds, no published incremental numbers. No API, so typescript-eslint stays on TS 6 via `@typescript/typescript6` | Spike |
| oxlint `--type-aware` | Covers all five typed rules, 12-18x on full runs. No result cache. JS plugins are alpha and get no types. better-tailwindcss under oxlint: not found | Spike, typed rules only |
| Playwright `--only-changed` | Specs drive the app over HTTP and import no app code, so an app change selects almost nothing. Playwright says to run the full suite after | No |

## Recommendations, ranked

1. **Sound caches.** `prettier --check . --cache --cache-location node_modules/.cache/prettier-gate/cache`
   and `depcruise --cache`. Without its own location Prettier's cache dies on every save.
   Prettier's check fell from 8.5 s to 2.0 s in almanac, half an hour to an hour over 293
   gates, with no wrong answers.
2. **A builder rhythm for the tail.** Inner loop after each step: `npm run check:fast` and
   the test file beside each changed source; `vitest related` only for leaf files. The full
   `npm run check` runs once after the last code change. After a failure, fix, re-run the
   failing step alone, then the gate once more. Send the output to a log once and grep it.
   No `timeout` below the repo's gate time. This changes the brief-builder agent's evidence
   rule, the build instructions and the per-commit green gate in briefs, at some cost in
   bisectability: a middle commit can fail a step only the full gate runs, such as knip.
   Allowing one full run per builder, two after a failure, and charging 20 s of
   `check:fast` per dropped run, it saves 1.6 h over the two weeks, 2.5% of active time.
3. **Spike oxlint `--type-aware` for the five typed rules** in one repo, with ESLint keeping
   the untyped plugin rules. ESLint is about half of every gate and of every lint run, so
   this is the largest lever per run. Without types ESLint's `--cache` becomes usable, with
   two cross-file caveats: import-x resolving imports, and better-tailwindcss checking
   classes against the stylesheet. Compare findings on the same commit before adopting.
4. **A one-pass gate report.** A runner in house-style's `bin/` runs every step even after
   one fails, prints one line per step with its time and result, then each failure's tail,
   and keeps the whole output in a log. Every failure shows in one run, which cuts the
   failure-driven reruns. Steps run one after another by default: the builder agent asks
   for one check at a time, game-engine's suites flake when they overlap, and an almanac
   test failed under load here. Running steps together is an option to measure on a quiet
   machine.
5. **Spike TypeScript 7 for `tsc`** in one repo, with typescript-eslint on TS 6 through
   the npm alias. Typecheck is 5% of almanac's gate and about 20% of imbatranim-apps'.
6. **Check imbatranimOS's turbo hash.** This is about correctness, not speed. Each add-on's
   `typecheck` and `test` hash only the add-on's own files with no `^` dependency, yet the
   add-ons import `@imbatranim/core` and `@imbatranim/ui` from source. A `ui` change that
   breaks an add-on could replay a cached green, the shape game-engine fixed in audit-01.
   Not proven; the test is game-engine's: a deliberate break, then the cached run against
   `--force`.
7. **Keep stray browsers off the machine.** The headless browser above had held about nine
   cores for six and a half hours, slowing every check in every session. A capture run
   closes its browser when it ends.

What stays full: the typed lint, `tsc`, the whole Vitest suite once per brief, and the e2e
and screenshot checks once before and once after a brief (the rhythm agreed on 2026-11-23).
Not recommended: ESLint `--cache` or `--concurrency` while typed rules run in ESLint,
knip's cache, Playwright `--only-changed`, and moving to Vitest 5 for its module cache
alone, since it also makes `clearMocks` default to true.

## Candidate briefs

Small, one repo each, filed as todos on 2026-11-24 (6 was fixed the day before): house-style, the two cache flags and the one-pass report,
synced to one repo and timed against today's gate (1, 4); library, the builder rhythm in
`agent-sources/brief-builder.md` and the build instructions (2); one repo, the oxlint spike
(3); one repo, the TypeScript 7 spike (5); imbatranimOS, the add-on turbo hash check (6).

## Applied the same day

The owner asked for every change that stays inside the apps. In 21 repos (shelfmark was mid-brief in another
session; game-engine, trips and vps-deploy were left out) `npm run check` now runs a runner beside `check-fast.mjs`
that keeps going after a failure and keeps its log, `format:check` and depcruise cache (1, 4), and `CLAUDE.md`
says to read the log and run the gate once. imbatranimOS's add-on hash was a real stale green, fixed with
`^typecheck` (6). The spikes ran in an almanac clone. Lint: typed ESLint 46 s, against 18 s for ESLint without
types plus 3-5 s for oxlint on the five rules, the same five findings on a probe file and none at HEAD. TypeScript
7: cold `tsc -b` 12.5 s to 2.4 s, warm web typecheck 3.5 s to 0.6 s, one file touched 3.8 s to 1.0 s. Both stay
spikes: adopting either changes house-style, which the owner kept out.

## Method and caveats

- Transcript times are the wall time between a call and its result, with other builders
  running. They compare within this page; they aren't benchmarks.
- A full check counts as failed or passed by markers in its output. About a third had neither.
- Subagent transcripts record no hook summaries, so the `SubagentStop` point rests on the
  plugin's hooks file, not on the 588-to-0 count.
- The step timings ran at a load of 20 to 27. Read them as ratios.
- The tool facts come from a research pass on 2026-11-23. The typescript-eslint quote and
  the TypeScript 7 release facts were re-read at the source. Newer releases exist (ESLint
  10.15, Vitest 5.1, typescript-eslint 8.74, turbo 2.11).

## Sources

- ESLint: [command line](https://eslint.org/docs/latest/use/command-line-interface), [multithread linting](https://eslint.org/blog/2025/08/multithread-linting), [RFC 129](https://github.com/eslint/rfcs/pull/129), [eslint-p](https://github.com/origin-1/eslint-p).
- typescript-eslint: [FAQ on `--cache`](https://typescript-eslint.io/troubleshooting/faqs/eslint), [tsgo backend PR](https://github.com/typescript-eslint/typescript-eslint/pull/12803).
- TypeScript 7: [7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [typescript-go](https://github.com/microsoft/typescript-go).
- oxc: [type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html), [tsgolint](https://github.com/oxc-project/tsgolint), [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).
- Vitest: [v4 CLI](https://v4.vitest.dev/guide/cli), [forceRerunTriggers](https://vitest.dev/config/forcereruntriggers), [experimental options](https://v4.vitest.dev/config/experimental).
- [Prettier CLI](https://prettier.io/docs/cli), [knip CLI](https://knip.dev/reference/cli), [dependency-cruiser CLI](https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md), [turbo caching](https://turborepo.dev/docs/crafting-your-repository/caching), Playwright [release notes](https://playwright.dev/docs/release-notes) and [CI guide](https://playwright.dev/docs/ci).
