---
summary: Whether house-style should move its five typed lint rules from typescript-eslint to `oxlint --type-aware`, from brief 50's spike on a game-engine scratch clone (2026-11-25) - parity at HEAD, on a seeded probe set and on four past fixes (two assertion shapes oxlint misses), the timings with the load (lint 55 s to 16 s, 4.3 s with ESLint's cache), what ESLint's `--cache` misses once types are gone (an import rename - nothing; a removed Tailwind token - 7 findings, fixed by hashing the stylesheet into the config), the change house-style would ship (2.0.0), what each adopter changes, and the recommendation (adopt with conditions).
updated: 2026-11-25
---

# oxlint for the typed lint rules: the spike of 2026-11-25

Brief 50 asked whether house-style's five typed rules can leave ESLint for oxlint's type-aware mode, so that ESLint
builds no TypeScript program and its `--cache` becomes usable. The background is recommendation 3 of
[check-speed-2026-11-23.md](check-speed-2026-11-23.md). Nothing that ships changed. The work ran in scratch clones,
deleted at the end.

## Short answer

- **Parity is close, not exact.** The three promise rules and `switch-exhaustiveness-check` agreed on every finding,
  at HEAD, in the probe set and on four past fixes. oxlint misses two shapes of `no-unnecessary-type-assertion`. One
  is an assertion on the right of a property assignment, the other an assertion used as an element-access key. That
  came to 3 of 313 findings at the commit where game-engine fixed them.
- **It is fast.** game-engine's lint went from 55 s to 16 s uncached, and to 4.3 s with ESLint's cache warm. The typed
  rules cost 42 s inside ESLint and 2.8 s in oxlint.
- **The cache is safe except for Tailwind.** Without types, better-tailwindcss is the only ESLint rule left that reads
  another file. A cached run missed 7 findings after a theme token went. Hashing the stylesheet into the config fixes
  that.
- **Adopt with conditions**, as house-style 2.0.0. It's a major version because the `typed` and `untyped` options go
  and every adopter's lint scripts and pins change.

## What was compared

game-engine at `a0aefdb`, which carries house-style 1.4.0, cloned from the local checkout into an empty scratch
folder, then `npm ci`. It runs ESLint 10.9.1, typescript-eslint 8.72.2 and TypeScript 6.0.3. I installed
**oxlint 1.95.0**, released 2026-11-23, and **oxlint-tsgolint 7.0.2008**, released 2026-11-21. tsgolint is built on
typescript-go and versions itself after TypeScript 7: 7.0.2, patch 008. Its README calls type-aware linting stable
since 2026-07-22. Node was 22.23.5. game-engine asks for 24 or later, and npm only warned.

- **A** is today's `npm run lint`: `eslint . --max-warnings 3573` with the house config and `projectService`.
- **B** is the house config with the typed block's parser options and five rules removed, so it keeps
  `consistent-type-imports` and `no-import-type-side-effects`. Next to it, `oxlint` reads an `.oxlintrc.json` with
  the five rules and their two options, `allowForKnownSafeCalls` for `node:test`'s `describe`, `it` and `test`, and
  `considerDefaultExhaustiveForUnions: true`. That file sets `plugins: ["typescript"]`, turns the `correctness`
  category off and sets `options.typeAware: true`. Its ignore patterns repeat ESLint's ignores, the JS and
  `*.config.*` files and the `untyped` globs.
- I diffed the two file lists. Both lint the same 1,476 TypeScript files; ESLint lints 1,518 files in all.

## Parity

| Run | A | B | Differences |
|---|---|---|---|
| HEAD `a0aefdb` | 0 | 0 | none |
| Probe set, house options: 41 cases, 19 must fire | 19 | 19 | none; 4 on the same line at another column |
| Probe set, both options flipped | 23 | 23 | none, the same 4 lines fire in both |
| Probe gap file, the two shapes below: 5 cases | 4 | 2 | 2 missed by B |
| `09eaa434`, fixed by `4431953b` | 319 | 316 | 3 missed by B |
| `4431953b`, fixed by `3d9b9c1c`, 313 assertions | 314 | 311 | the same 3 |
| `6c96013f`, fixed by `c48068b4`, a switch at `warn` | 1 | 1 | none, with the repo's override ported to oxlint |
| almanac `aa5ddb8` with `c5b902b`'s config | 14 | 14 | none: 1 floating promise, 13 assertions |

- **The probe set** is one file per rule in `games/farm/server/src`, which has Node's types. Each rule gets cases that
  must fire, cases that must not, and an `eslint-disable-next-line` naming it; one file adds an `eslint-disable-line`.
  Floating promises cover a bare call, `.then` without a handler, `Promise.resolve`, `readFile`, an array of promises,
  `void` and `.catch`. Under the option, `describe`, `it` and `test` from `node:test` stay quiet and `suite` fires.
  Misused promises cover async `forEach` and `setTimeout` callbacks, a spread, a ternary and `&&`. await-thenable
  covers `await 5`, a thenable, `for await` over an array and `Promise.all([1, p])`. The switch file has a missing
  member, a `default` beside a missing member, which is what the option decides, full coverage with and without
  `default`, and a number. Assertions cover `as string`, `!`, `<string>`, `as const`, `list[0]!` and
  `(n ?? 0) as number`.
- **The two oxlint misses** both belong to `no-unnecessary-type-assertion`, and the gap file reproduces both.
  `box.current = "square" as Shape` is unnecessary because of the receiver's type; oxlint does catch the same
  assertion inside an object literal. `record[s as SameShape]` asserts a key that already has that type. At
  `4431953b` they sat in `games/farm/sim-core/src/systems/act.test.ts:266` and
  `tools/run-sim/src/probes/probe-skill-diverge.ts:64` and `:77`. `3d9b9c1c` removed all three and the typecheck
  stayed green, so ESLint was right.
- **Columns** differ on some same-line findings. ESLint points at `await`, `for` or the arrow function, oxlint at the
  operand or the body. At `09eaa434`, 31 of 316 findings differed this way: 28 assertions, 2 await-thenable and 1
  misused promise. Compared by file and line, they agree.
- **Disable comments.** game-engine has one comment naming a typed rule, `no-unnecessary-type-assertion` at
  `engine/core/src/sim/message-bus.ts:63`. imbatranimOS, presentation-sites, almanac and Satchel have none. oxlint
  honours `eslint-disable` comments by default, so B reported nothing there. B's ESLint reports every such comment as
  an unused directive, though: one warning at HEAD, six in the probe set. The clean form is
  `// oxlint-disable-next-line typescript/<rule>`, with `respectEslintDisableDirectives: false` and
  `reportUnusedDisableDirectives: "warn"` in the root `.oxlintrc.json`. ESLint then ignores the comment, and oxlint
  warns once it goes stale, which I tested. With `respectEslintDisableDirectives` left on, the unused report flags all
  16 ESLint-only directives at HEAD.

## Timings

game-engine HEAD on 4 CPUs with nothing else running. Each value is the median wall time of three runs, npx start
included. Load is the 1-minute load average before the series, then the highest it reached before a run in that
series. Cold runs started with the page cache dropped and the tool caches deleted; warm runs came right after
another run.

| Step | Cold | Warm | Load, cold / warm |
|---|---|---|---|
| A: `eslint .`, typed | 53.9 s | 55.4 s | 0.52 to 1.37 / 0.95 to 1.60 |
| B: `eslint .` without types | 14.4 s | 13.4 s | 0.92 to 1.63 / 0.92 to 1.34 |
| B: `oxlint`, five rules | 3.2 s | 2.8 s | 0.98 to 1.14 / 0.90 to 1.15 |
| B: ESLint `--cache`, warm, no change | | 1.5 s | 0.89 |
| B: ESLint `--cache`, one file touched | | 1.5 s | 0.90 |
| **B total** | **17.5 s** | **16.3 s**, **4.3 s** cached | |

- Filling the cache took 14.3 s, one run at load 1.06. A has no cache, so its cold and warm runs are the same within
  noise.
- One changed file, three runs each at load 0.66 to 1.06: A on `message-bus.ts` took 2.4 s. B's ESLint on it took
  1.1 s, oxlint on it 0.5 s, and oxlint on the whole repo 2.8 s.
- Single runs at the past commits: A took 47 s at `09eaa434`. In almanac, A took 15.7 s and oxlint 1.3 s.
- `ps` showed A's ESLint at about 3.5 GB resident during one run. I didn't measure B's memory.

## ESLint's cache once types are gone

B's ESLint ran with `--cache --cache-location` and the default metadata strategy. Each test filled the cache, made
one change, then compared a cached run with an uncached one.

1. **Rename an export another file imports.** `replenishNeed` in `engine/core/src/agent/needs.ts` became
   `refillNeed`; `agent/index.ts` and `needs.test.ts` import it. The cached and uncached runs gave the same findings,
   so nothing was missed, and neither reports the broken import. No ESLint rule left in the house config reads
   another file. import-x runs only `no-default-export`, which resolves nothing, and `consistent-type-imports` judges
   usage inside the importer. `tsc` reports both importers with TS2305, as it does today.
2. **Remove a theme token a class uses.** game-engine has no Tailwind, so this ran in an almanac clone at `8369357`,
   with `--color-ground` deleted from `web/src/styles/index.css`. The uncached run reported 7 findings in four files:
   4 `no-unknown-classes` for `bg-ground` and `max-md:bg-ground`, and 3 `enforce-consistent-class-order`. The cached
   run reported none, so **it misses them**. I tested a fix: the tailwind block's `settings` carry the stylesheet's
   SHA-256. ESLint keys each cached result on the file's config, so the next cached run re-linted the web files in
   6.3 s and reported all 7. The run after it took 1.3 s and still showed them. The fix hashes only the entry file;
   a repo whose tokens live in an imported local stylesheet hashes that one too.
3. **The reason to move, run the other way round.** With A on `--cache`, I made `decayNeed` async. The cached A run
   reported nothing. The uncached A run and B's oxlint both reported the three floating calls in
   `needs-decay-system.ts` and `needs.test.ts`. oxlint keeps no result cache and lints the whole repo in 2.8 s, so B
   stays sound across files.

## The change house-style would ship, 2.0.0

- **`eslint.config.js`.** `house-style/typed` keeps `consistent-type-imports` and `no-import-type-side-effects` and
  drops its parser options and the five rules. The `house-style/tsconfig-root` and `house-style/untyped` blocks go.
  `typed` and `untyped` leave `houseStyle()`, which throws on an unknown option, hence the major version. The
  tailwind block adds the stylesheet hash to its `settings`.
- **`oxlintrc.json` in the copy**, added to `files`. It holds `plugins: ["typescript"]`,
  `categories: { correctness: "off" }`, the five rules with their options, and an override that turns them off in
  `**/*.{js,jsx,mjs,cjs}` and `**/*.config.*`. Through `extends`, the override's globs resolve from the repo root;
  I tested that.
- **Each repo's root `.oxlintrc.json`** has `extends: ["./vendor/house-style/oxlintrc.json"]`. Its `options` hold
  `typeAware`, `respectEslintDisableDirectives: false` and `reportUnusedDisableDirectives: "warn"`, because oxlint
  reads those only from the root config. Its `ignorePatterns` hold vendor, dist and coverage, the repo's ESLint
  `ignores` and its old `untyped` globs. oxlint roots the patterns of an extended file at that file's folder, so they
  can't live in the copy. A file outside every tsconfig that isn't ignored still gets linted, with default compiler
  options.
- **Pins.** `oxlint` 1.95.0 and `oxlint-tsgolint` 7.0.2008 go into `peerDependencies` and the README's pins table.
  The two move together, since oxlint asks for `oxlint-tsgolint >=7.0.2008`. They add about 40 MB of native binaries,
  and tsgolint's is statically linked. typescript-eslint stays for the parser and the recommended set. knip flagged
  neither package.
- **Scripts.** `lint` becomes `eslint . --cache --cache-location node_modules/.cache/eslint/`, keeping a repo's
  `--max-warnings`. A new `lint:typed` runs `oxlint`. `check` runs `lint` and `lint:typed` as separate steps, so one
  failure doesn't hide the other. `check:fast` runs ESLint with the same cache on the changed files, then `oxlint` on
  the whole repo, because a floating promise turns up in the unchanged callers of a changed function.
- **Docs.** The skill's "six typed rules" line, `adoption.md`'s options table, `projectService` paragraph and Astro
  recipe, the README, and a CHANGELOG upgrade note.

## What each adopter changes

1. Sync 2.0.0 and pin the two packages.
2. Write `.oxlintrc.json`, and drop `typed` and `untyped` from the `houseStyle()` call.
3. Move any override of the five rules from `eslint.config.js` to `.oxlintrc.json` `overrides`. game-engine had one
   until `c48068b4`, and the ported override gave the same `warn`.
4. Rewrite each `eslint-disable` that names one of the five rules as `oxlint-disable … typescript/<rule>`.
   game-engine has 1; the four other local repos have none.
5. **A test tsconfig that no `tsconfig.json` references**, the `typed.project` case, is invisible to tsgolint. Its
   files get default options, and a test under `strict: false` lost its finding. Referencing it from a solution
   `tsconfig.json` fixed that.
6. **Astro.** presentation-sites has 168 `.astro` files. oxlint parses them but runs no type-aware rule in the
   frontmatter or the `<script>` blocks; a floating promise there went unreported. That repo either keeps a typed
   ESLint block for `.astro`, with its program cost and no cache for those files, or accepts the gap.
7. tsgolint type-checks with TypeScript 7 whatever the repo pins. A repo on another major, such as imbatranimOS's
   backend on 5.9, re-runs this parity before switching. Brief 51 measures TypeScript 7 itself.

## Recommendation

**Adopt, with conditions.** On the heaviest gate outside the paused repos, lint drops from about 55 s to 16 s, and to
4 s on a warm cache. The three promise rules and the switch rule matched everywhere. Cross-file soundness improves:
a cached typed ESLint run misses a floating promise, while oxlint lints everything on every run.

- Accept the two `no-unnecessary-type-assertion` gaps. They are false negatives on the least important of the five
  rules, about 1% at game-engine's big fix, and keeping that one rule in ESLint would bring back the whole program
  cost.
- Hash the Tailwind stylesheet into the config, as tested, before any Tailwind repo turns `--cache` on.
- Settle Astro per repo (step 6), and reference stray test tsconfigs (step 5).
- The adoption brief re-runs the HEAD and probe-set parity in each repo before it switches, because tsgolint checks
  with TypeScript 7.

## Method and caveats

- The local checkouts are shallow, so the past fixes came from history fetched from GitHub into the scratch clone. I
  searched commit messages for the rule names and diffs for `void` additions. game-engine gave three fixes, none of
  them a floating promise, so I added almanac's `c5b902b`.
- Each past run used that commit's own config and lockfile, with `npm ci` at the parent, on the same ESLint and
  typescript-eslint versions as HEAD. B used that commit's ignores, plus the repo's switch override at `6c96013f` and
  `4431953b`.
- I compared findings by file, line and rule. Given only a severity, ESLint's `--rule` keeps a rule's options, so the
  flipped run passed explicit ones.
