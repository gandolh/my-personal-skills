---
summary: Whether house-style should move its repos' `tsc` to TypeScript 7, from brief 51's spike on a game-engine scratch clone (2026-11-25) - which gate tools load the TypeScript API (typescript-eslint, eslint-plugin-n, dependency-cruiser) and how they keep version 6, the package.json diff, diagnostics parity at HEAD and on a seeded probe set, the flags 7 removes, the timings with the load (typecheck 32.5 s to 7.2 s, whole gate 233 s to 213 s), the change house-style would ship, and the recommendation (adopt with conditions).
updated: 2026-11-25
---

# TypeScript 7 for `tsc`: the spike of 2026-11-25

Brief 51 asked whether house-style's repos can run `tsc` on TypeScript 7 (the Go port, released 2026-07-08) while every
tool that loads TypeScript's API stays on version 6. The background is recommendation 5 of
[check-speed-2026-11-23.md](check-speed-2026-11-23.md). Brief 50's [oxlint spike](oxlint-spike.md) measured the same
repo the same way, so the numbers compare. Nothing that ships changed. The work ran in a scratch clone, deleted at the
end.

## Short answer

- **It works, with one config fix.** `npm run check` passed on TypeScript 7's `tsc`: typecheck, lint, format,
  conventions and 10 test suites. The only break was `docs/tsconfig.json`, which inherits `baseUrl` from
  `@docusaurus/tsconfig`; TypeScript 7 removed that option.
- **Diagnostics match.** At HEAD both are clean. On 12 seeded probe files the two printed 38 errors with the same
  code, message and position, except one: an unused import is reported at another column.
- **It is fast.** The typecheck step went from 32.5 s to 7.2 s (4.5x); one package from 3.5 s to 0.5 s. The whole gate
  only fell from 233 s to 213 s, because the tests take 135 s and lint 48 s.
- **Adopt with conditions.** The cost is one extra dependency, a bin-link trap (below) and a changed exit code. The gain
  is large for the edit loop, small for the final gate.

## What was compared

game-engine at `a0aefdb` (house-style 1.4.0), cloned from the local checkout into an empty scratch folder, then
`npm ci`. It pins `typescript` 6.0.3, typescript-eslint 8.72.2, ESLint 10.9.1, turbo 2.10.5 and Vitest 4.1.12. I
installed **typescript 7.0.2**. Node was 22.23.5 and npm 10.9.9; the repo asks for Node 24 and npm 11.19.1, so the
npm behaviour below is untested on 11. The machine has 4 CPUs.

game-engine has 25 workspaces. Its typecheck is `turbo run typecheck`, which runs `tsc --noEmit` in each. None uses
`composite` or `tsc -b`, so there is no build info to delete: "cold" below means turbo's cache bypassed with
`--force`. The baseline gate on TypeScript 6 took 4 min 18 s (typecheck 32.9 s, lint 55.5 s, format 14.8 s,
conventions 5.6 s, tests 148.9 s).

## Who loads the API

`npm ls typescript` shows 6.0.3 under typescript-eslint and its `@typescript-eslint/*` packages, `ts-api-utils`,
eslint-plugin-n, `@vitest/eslint-plugin`, `valibot`, docusaurus's cosmiconfig and the root. To see who really loads it
I ran each tool with a Node resolve hook that logs every `typescript` resolution.

| Tool | Loads the API | Evidence | How it gets version 6 |
|---|---|---|---|
| typescript-eslint (parser, plugin, type-utils, project service), `ts-api-utils` | yes | 49 resolutions in one ESLint run | its `typescript` peer, `>=4.8.4 <6.1.0`, so it must stay on 6 |
| eslint-plugin-n (and eslint-plugin-es-x) | yes, lazily | 1 resolution each | optional peer `>=5` |
| `@vitest/eslint-plugin` | through `@typescript-eslint/utils` | counted above | optional peer `>=6` |
| dependency-cruiser | yes, to parse TypeScript | `try-import.mjs`, 5 resolutions | `tryImport("typescript")`, no peer range |
| knip | no | 0; it uses oxc-parser | none needed |
| Vitest, Vite (a build of the farm client) | no | 0 | none needed |
| Prettier, turbo, import-x, react-hooks, better-tailwindcss | no | 0 | none needed |
| Docusaurus (`npm run docs`, 6.5 s) | no | 0; cosmiconfig's peer is optional | none needed |
| `tsc` in each workspace | is the compiler | | the one to move to 7 |

So three packages need the real API, and all three just call `require("typescript")`.

## Two versions side by side

The brief's first idea, `typescript` 7 at the root and an `overrides` entry per API tool pointing at
`npm:@typescript/typescript6@6.0.2`, **does not install on npm 10.9.9**. A first `npm install` wrote an invalid tree
(`npm ls` reports 20 "invalid" edges, ELSPROBLEMS), and a fresh install failed with ERESOLVE. npm dedupes a peer
dependency to the root copy whatever the override says. Two more traps with the alias package: `@typescript/typescript6`
is 6.0.2, older than the 6.0.3 the repo pins, and it depends on `typescript@^6` as `@typescript/old`, whose `tsc` bin
takes over `node_modules/.bin/tsc`, so `tsc -v` printed 6.0.3 with TypeScript 7 installed.

What works is the reverse: **keep `typescript` 6.0.3 for the tools and install TypeScript 7 under another name.**

```diff
   "devDependencies": {
     ...
     "prettier": "3.9.10",
+    "ts7": "npm:typescript@7.0.2",
     "turbo": "2.10.5",
     "typescript": "6.0.3",
```

```diff
--- a/docs/tsconfig.json
-  "compilerOptions": { "baseUrl": ".", "ignoreDeprecations": "6.0", "strict": true },
+  "compilerOptions": { "baseUrl": null, "ignoreDeprecations": "6.0", "strict": true },
```

- **The bin-link trap.** Both packages declare a `tsc` bin and npm links one. After `npm ci`, `node_modules/.bin/tsc`
  is TypeScript 7 (`Version 7.0.2`) and `require("typescript").version` is 6.0.3. It is the alphabetical order of the
  dependency names that decides: an alias named `ts7` sorts before `typescript` and wins; `typescript7` sorted after it
  and lost, leaving `tsc` on 6. That is an npm implementation detail, so adoption must not rely on it silently (see
  the change below).
- **No script edits.** The 25 workspaces keep `tsc --noEmit`. The lockfile changes by 571 lines, mostly native
  `@typescript/typescript-<platform>` packages (npm 10 also reformatted older entries).
- **The break.** `docs` failed with `TS5102: Option 'baseUrl' has been removed`, reported at its own tsconfig but
  inherited from `@docusaurus/tsconfig`. Setting `baseUrl` to `null` in the child fixes it on 6 and 7 alike, and
  `paths` (`@site/*`) still resolves. Replacing it with `paths: {"*": ["./*"]}`, as the message suggests, did not help.
- **Gate result.** With that fix `npm run check` passed on both versions. Lint, knip, dependency-cruiser, the Docusaurus
  build and Vite all ran against the API on 6.0.3 with no change.

## Diagnostics parity

- **HEAD.** All 25 workspaces plus the root and 27 tsconfig files give no errors on 6 or on 7. The two `tsconfig.base`
  files, run as projects on their own, give the same output on both.
- **Probe set.** 12 files under game-engine's `tsconfig.base.json` (`strict`, `exactOptionalPropertyTypes`,
  `noUncheckedIndexedAccess`, `noUnusedLocals`, `noImplicitOverride`, `erasableSyntaxOnly`, `verbatimModuleSyntax`).
  The seven the brief names all fired: a missing property (TS2741), a wrong argument type (TS2345), an implicit `any`
  (TS7006), a possibly-null access (TS18047, and TS2531 for `getElementById`), a switch that misses a union member
  (TS2366 and TS2322 against `never`), a failed `satisfies` (TS2322, TS2353) and an unused `@ts-expect-error`
  (TS2578). Others covered an exact optional, an unchecked index, an unused local, a fallthrough, a missing `override`,
  an enum, a namespace, a parameter property, an unknown catch variable, a deep instantiation (TS2589), a template
  literal and unresolved modules.
- **38 errors on each.** Same code, message and position, in the same order, with one exception: for
  `import { type Farmer2 } from "./x"`, an import that is unused and also missing, TypeScript 6 reports TS6133 at the
  start of the statement (1,1) and TypeScript 7 at the name (1,15), and the order of the two lines differs. The
  message text is the same.
- **Exit code.** With errors, TypeScript 6 exits 2 and TypeScript 7 exits 1. The gate only tests for non-zero, so it
- **Exit code.** With errors, TypeScript 6 exits 2 and 7 exits 1; the gate only tests for non-zero.
## The base flags

Both tsconfig bases (house-style's and game-engine's) and all 27 project tsconfigs give the same result on 6 and 7,
apart from the docs `baseUrl` above. Neither base sets a flag that 7 removes. A probe of 36 options on top of
game-engine's base shows what 7 changes. TypeScript 6 already reports these as TS5101 or TS5107 errors unless
`ignoreDeprecations: "6.0"`; TypeScript 7 reports them as removed even with it:

- **Removed in 7:** `baseUrl`, `target: ES5`, `moduleResolution: node10` and `classic`, `module: amd`, `umd` and
  `system`, `downlevelIteration`, `outFile`, `esModuleInterop: false`, `allowSyntheticDefaultImports: false`,
  `alwaysStrict: false`.
- **Gone since 6, now "unknown option" (TS5023) instead of "removed" (TS5102):** `importsNotUsedAsValues`,
  `preserveValueImports`, `charset`, `keyofStringsOnly`, `noImplicitUseStrict`, `suppressExcessPropertyErrors`,
  `noStrictGenericChecks`, `out`. `target: ES3` now lists the valid targets (`es6` to `esnext`).

house-style's base (`NodeNext`, `ES2023`, `erasableSyntaxOnly`) needs no change. An adopter that still sets one of
the first group has to drop it first; on 6 it is already a deprecation error without `ignoreDeprecations`.

## Timings

game-engine on 4 CPUs, nothing else running; the page cache was dropped before the first series and before each full
gate. Each value is the median of three runs. Load is the 1-minute average before the series; later runs of a series
start at a higher figure because the run before them used all CPUs.

| Step | TypeScript 6.0.3 | TypeScript 7.0.2 | Load before |
|---|---|---|---|
| `turbo run typecheck --force`, 25 tasks | 32.5 s | 7.2 s | 0.61 / 0.97 |
| turbo, cache hit | 0.3 s | 0.3 s | 0.93 / 0.93 |
| turbo, leaf file touched (`tools/run-sim`) | 3.2 s | 0.9 s | 0.93 / 0.92 |
| turbo, `engine/core/src/index.ts` touched | 31.6 s | 6.6 s | 0.93 / 0.92 |
| `tsc --noEmit` in `@farm/sim-core` (36.5k lines) | 3.5 s | 0.5 s | 0.96 / 0.95 |
| `tsc --noEmit` in `@engine/core` (26.9k lines) | 2.7 s | 0.4 s | 0.89 / 0.95 |
| `tsc --noEmit` in `@citadel/client` (23.8k lines) | 3.3 s | 0.5 s | 0.90 / 0.95 |
| `tsc --noEmit` over every workspace, one after another | 51.8 s | 8.7 s | 0.92 / 0.95 |
| `@farm/sim-core` `--incremental`, build info deleted | 3.5 s | 0.6 s | 0.97 / 0.92 |
| `@farm/sim-core` `--incremental`, warm | 1.3 s | 0.3 s | 0.96 / 0.92 |
| `@farm/sim-core` `--incremental`, one file touched | 1.3 s | 0.3 s | 0.96 / 0.99 |

- A change in the root package re-runs every dependent, so it costs a cold run; a leaf costs one package. The repo has
  no build info, so the three `--incremental` rows are an extra.
- Whole `npm run check`, once on each, every cache deleted first (turbo, Prettier, dependency-cruiser):

| Step | TypeScript 6.0.3 | TypeScript 7.0.2 |
|---|---|---|
| typecheck | 30.6 s | 6.9 s |
| lint | 47.7 s | 50.2 s |
| format:check | 13.7 s | 13.8 s |
| check:conventions | 5.5 s | 5.4 s |
| test | 135.0 s | 136.8 s |
| **Total, wall** | **232.6 s** | **213.3 s** |
| Load before / after | 0.92 / 2.79 | 0.99 / 3.55 |

The gate saves about 19 s, 8%. Lint differs by the run's noise, since typescript-eslint stays on 6. Brief 50's oxlint
change would take lint down by the same amount again, so the two compound: typecheck 7 s, lint 16 s, tests 136 s.

## The change house-style would ship

- **The pin.** `peerDependencies` and the README's pins table gain `ts7` at `npm:typescript@7.0.2` next to `typescript`
  6.0.3, which stays for the API tools. The skill's line "typescript-eslint supports TypeScript below 6.1" gets a
  sentence on why two versions are installed.
- **The bin trap, made safe.** Add a check to `check-structure` (or the `check` runner) that runs `tsc -v` and fails
  unless the major is 7, with a message naming the alias. Without it, a rename of the alias or an npm change silently
  puts `tsc` back on 6 and the gate stays green and slow.
- **`tsconfig.base.json`** needs no change. `adoption.md` gets a step to drop the removed flags (the list above) and a
  note on the `@docusaurus/tsconfig` `baseUrl`.
- **`check:fast`.** Its typecheck step becomes affordable on every edit: 0.9 s for a leaf package and 6.6 s for a
  change to the root package, against 3.2 s and 31.6 s. No wiring change; the step already calls `tsc`.
- **CHANGELOG** upgrade note (a minor version, since a peer is added and nothing existing is removed): install the
  alias, check `tsc -v`, remove deprecated flags, expect exit code 1 for errors.
- **Adoption step per repo.** Add the alias, run the gate once, fix the removed flags, and compare the typecheck output
  at HEAD. A repo whose build emits with `tsc` (game-engine's `engine/core` and `engine/ui` pack `dist/` through
  `tsconfig.build.json`) re-checks the emitted `.d.ts` first; this spike ran only `--noEmit`.

## Recommendation

**Adopt, with conditions.** Typecheck falls to a fifth, and the diagnostics match on every case tried. The condition
list:

- Install the alias as `ts7`, not as `typescript`, and add the `tsc -v` check so the bin link can't drift.
- Re-run this spike's two checks (HEAD clean, the probe set) on npm 11, which this container didn't have.
- Check each repo's tsconfigs for the removed flags and any tooling that reads `tsc`'s exit code or parses its output.
- Repos that emit declarations with `tsc` test that separately.

The saving is mostly on the edit loop and `check:fast`; the full gate is dominated by tests and lint (together 84%).

## Method and caveats

- Resolution tracing used a `module.registerHooks` hook (`NODE_OPTIONS=--import`) that logs each `typescript` request;
  a tool that loads it only on a path my runs didn't reach would not show.
- game-engine's own checkout is untouched, nothing under `house-style/` or `skills/` changed, and the scratch folders
  are deleted.
