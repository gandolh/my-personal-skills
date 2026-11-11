---
summary: Part 2 of the house-style measurements (brief 27), collated from the repo harness briefs - each repo's lint findings for the typed rules and the house shapes, the timings of tsc, ESLint (projectService against project), Prettier and the tests, the knip results, what no brief measured, and the two convention checkers' counts per rule on ro-housing, Almanac, atrium and wicket (2026-11-11, for brief 16's table).
updated: 2026-11-11
---

# House style: findings, timings and gaps

Part 1, with the churn, the TypeScript flags and the calls on four rules, is
[house-style.md](house-style.md). As there, each number comes from that
repo's harness brief, and "gap" means it wasn't measured.

## Lint findings

Findings with the house settings (`considerDefaultExhaustiveForUnions`,
`allowForKnownSafeCalls` for `node:test`, `maxArgs: 2`), with the count
without them in brackets where a brief gave it. `!` is source / tests.

| Repo | floating promises | misused promises | await-thenable | switch | unnecessary assertion | type imports | `!` | console | process.env | vitest | other |
|---|---|---|---|---|---|---|---|---|---|---|---|
| wicket | 0 | 1 | 0 | 0 (4) | 0 | 0 | 7 / 51 | 3, CLIs | 4 | 2 | |
| brief-board | 0 | 1 | 0 | 0 (4) | 0 | 0 | 30 / 35 | 9 | 7 | 4 | |
| comercial-website | frontend 30 | frontend 49 | 0 | 0 | 13 / 8 (frontend / backend) | 0 / 2 | frontend 8; backend 58 / 20 | 4 / 21 | backend 21 + 14 in tests | gap | `any` 5 / 65; frontend lint red today (9 errors) |
| almanac | gap | gap | gap | gap | gap | gap | 0 / 9 | 0 outside CLIs | 4 | gap | typed rules need `node_modules` |
| satchel | 2 | 0 | 0 | 0 (4) | 9, tests | 0 | 3 / 10 | 1 | 6 | 12 (30) | |
| atrium | 9 (823) | 20 | 0 | 1 | **608** | 0 | 170 / 315 | 11 | 6 | `node:test` | |
| shelfmark | 1 | 2 | 0 | 0 (7) | 9 | 0 | 43 / 80 | 1 | 5 | 6 (9) | |
| postern | gap | gap | gap | gap | gap | gap | 82 / 454 | 4 | no server | gap | typed rules need `node_modules` |
| lantern | 0 | 0 | 0 | 1 | 3 | 0 | 17 / 12 | 13, CLIs | 6 | gap | |
| newspapper | 2 | 16 | 0 | 1 | **111** (25 source) | 1 | 15 / 187 | 9 | 18 + 42 in tests | 14 (36) | 61 default exports (46 components, 12 routes) |
| public-resource-map | 5 | 8 | **70**, real (sync Drizzle) | 0 | 17 | 2 | 28 / 11 | 22 (20 in CLIs) | 19 | 0 (12) | `any` 4, react-hooks 4 |
| ro-housing | 0 | 8 | 0 | 0 | 3 | 2 | 9 / 24 | 3 | 13 | 3 | react-hooks 9 |
| sports-app | 0 | 0 | 0 | 0 | 14 (12 in tests) | 0 | 0 / 59 | 2 | 2 | gap | server not linted (plain `.mjs`) |
| SocialEvents | 4 | 5 | 0 | 0 | 2 | 0 | 5 / 3 | 2 | 1 | 0 | class order 14, other Tailwind rules 0 |
| the todo app | 0 | 0 | 0 | 0 | 2 | 0 | 1 / 0 | 0 | 0 | no tests | react-hooks 2 |
| 3D-sandbox | 0 | 0 | 0 | 0 | 40 (36 in tests) | 2, false | 97 / 544 | 23 | 8 | 10 (22-26) | react-hooks 18, jsx-a11y 7 |
| game-engine | 0 | 1 | 2 | 3, maybe real | **313** (115 source) | 70 (54 `import()` types) | **596 / 3,072** | 320 (278 in tools) | gap | 160 | `no-warning-comments` 18, all prose |
| imbatranimOS | web 21 | web 16 | 0 | 1 | 30 | 5 / 44 (web / backend) | web 56 / 175; backend 37 / 113 | 29 / 5 | gap | gap | ~135 backend parameter properties |
| imbatranim-apps | 3 | 1 | 1 | 0 | 62 | 10 | 58 / 251 | 7 | 2 | gap | |
| ward-auth | 0 | 0 | 1, test | 0 (3) | 4 / 16 | 0 / 71 | 32 (+9 harness) / 351 | 5 / 3 | 3 + 214 in tests | 14 (72) | |
| just-a-bot | 0 | 3 | 1 | 0 | 27 | 45 | 63 / 19 | 4 | gap | `node:test` | |
| presentation-sites | 1 (71) | 0 | 0 | 0 | 5 | 1 | 12 (6 in tests) | 2 | gap | no vitest | `no-undef` 15, false (Node globals) |
| churchix | 0 | 2 | 0 | 0 | 1 | 0 | 11 | 0 | gap | no tests | `no-undef` 5, false |

House shapes found by grep, everywhere: zero `enum` except one each in
game-engine and imbatranimOS's backend; zero `@ts-ignore`; `any` only in
comercial-website (70), imbatranimOS (16), game-engine (5, in tests) and
public-resource-map (4); zero
real `TODO` or `FIXME` (sports-app has one word in prose, presentation-sites
eight in its bots package). Classes are mostly `Error` subclasses (Satchel 13
of 16, brief-board 7 of 10), except game-engine: 199 classes and none of them
an `Error`.

## Timings

Seconds, warm unless marked. "check:fast" is the brief's estimate from its
parts; no brief measured it end to end.

| Repo | tsc | ESLint today | typed: projectService / project | one typed file | `prettier --check` | tests | check:fast |
|---|---|---|---|---|---|---|---|
| wicket | 0.4-0.5 + web 4.5-4.9 | 2.4-2.7 | 7.3-10.1 / 7.3-9.1 | 1.9-3.0 | 1.2-1.3 | 2.6-4.1 | about 8 |
| brief-board | 0.3 + web 4.0 | 4.4 | 11.7-13.7 / 10.8-13.0 | 3.0 / 3.7 | 4.3 cold | 4.7-7.9 | about 8 |
| comercial-website | gap | gap | frontend about 15, backend about 11 (cold) | gap | gap | gap | gap |
| satchel | 3.1 | 7.9 | 15.9 / 15.0 | 3.1 | 0.5 (one file) | 14-23 | about 7 |
| atrium | web 9, api 3.8, shared 2.3 | none today | gap / 27 cold | gap | gap | gap | gap |
| shelfmark | 6.0 + web 4.3 | 12.2 | 24.2 / 19.5 | 5.4-7.6 | gap | 5.5 | about 11 |
| lantern | gap | gap | 7 / gap | gap | gap | 6 | gap |
| newspapper | 8.0 | 13.6 | 20.4 / 15.8 (49 test files unparsed) | 3.2 / 3.8 | 3.4 | about 11 | about 11 |
| public-resource-map | 16-27 | none today | 19.5 / 29.5 | 6.8 | gap | gap | 25-35 |
| ro-housing | gap | gap | api 6.5, web 7.7, the same both ways | gap | gap | api 3.3, web 8-13 | gap |
| sports-app | gap | gap | 51.5 cold / gap | gap | gap | server 6 | gap |
| SocialEvents | 0.63 (5.1 cold) | none today | 22.5 / gap | 10.0 | gap | 4.2 | about 11 |
| the todo app | gap | 1.7 | frontend 2.3 | gap | gap | no tests | gap |
| 3D-sandbox | about 5 | Biome 0.2 | 32 / 27 | 3.9 | gap | gap | about 9 |
| game-engine | gap | none today | 59, 4.1 GB peak / gap | gap | gap | gap | gap, 30 accepted |
| imbatranimOS | about 69, serial cold | core 11 | web 43, backend 15 / gap | gap | gap | gap | gap, 30 accepted |
| imbatranim-apps | 16 (18.6 cold) | 17 | 24-31 / 27 | gap | gap | gap | 20-30 |
| ward-auth | 8.8 cold | gap | 17.5 cold / gap | 3.8 | gap | not run | about 12 |
| just-a-bot | gap | none today | 8 / gap | gap | gap | never run (production `.env`) | gap |
| presentation-sites | `astro check` 43 for four sites | none today | 50, `project: true` | gap | 5.6 | gap | gap |
| churchix | `astro check` 14.5 | none today | 22 | gap | gap | no tests | gap |

Almanac and Postern have no timings: their briefs measured without
`node_modules`. `projectService` and `project` were a draw in Wicket,
brief-board, Satchel, ro-housing and imbatranim-apps; `project` was faster in
Shelfmark, Newspapper and 3D-sandbox (the first two parsed fewer files that
way), `projectService` in public-resource-map. Typed lint
is the cost: it takes ESLint from 2-17 s to 7-59 s.

## knip

| Repo | Unused files | Unused dependencies | Unused exports |
|---|---|---|---|
| wicket | 0 | 0 | 20 and 3 types |
| brief-board | 0 | 0 | 21 |
| satchel | 1 (needs an entry) | `jose`, `ws` | 23 and 4 types |
| shelfmark | 12 (6 entries knip doesn't know, 6 vendored) | 0 | 73 outside `vendor/` |
| lantern | 0 | `@base-ui/react` (brief 16 uses it) | 33 and 12 types |
| newspapper | 7 (6 vendored) | 4 in the docs package, `tsx` | 69 (47 vendored) |
| ro-housing | gap | 0 | api 10, web 7 |
| SocialEvents | gap | `zod` | 5 and 1 type |
| the todo app | gap | 0 | 1 duplicate |

knip wasn't run in the other 14 repos. It needs `vendor/` ignored and the
repo's script entries listed, or vendored copies and CLI scripts show up as
unused files.

## What no brief measured

- `check` and `check:fast` end to end, anywhere. Every number above is an
  estimate from parts; each repo's brief records the real ones.
- `better-tailwindcss`, except SocialEvents. ro-housing's scratch copy
  couldn't find Tailwind; the rest wait for their Tailwind briefs.
- knip in 14 repos, `@vitest/eslint-plugin` in 7 (5 more have no vitest),
  `projectService` against `project` in 14 (in the two Astro repos only
  `project` works), `exactOptionalPropertyTypes` in 8.
- A commit for the measurement, except ward-auth (`d92ea13`, ESLint at
  `5234256`). The rest are dated 2026-11-10, Almanac and Postern 2026-11-09.
- A Docker build after the change, anywhere.

## The convention checkers on four repos (2026-11-11)

Measured, not collated: house-style's `check-base-ui` and `check-structure`
on scratch copies (no `node_modules`, `.env*`, `data/` or `*.db`), each with a
`conventions.json` written in the copy. Each count, zeros included, was
checked against a plain grep or `find` of the same thing.

`check-base-ui`:

| Repo | Roots | Findings | Exit |
|---|---|---|---|
| ro-housing (strict) | `web/src`, `"stylesheet": "styles.css"` | 0 | 0 |
| wicket (`--warn-only`) | `web/src` | rule 3: 1 (`ConfirmAction.tsx`), rule 5: 1 (`styles.css`) | 0 (strict: 1) |
| atrium (`--warn-only`) | `apps/web/src`, `"stylesheet": "styles/globals.css"` | rule 3: 7, rule 9: 1 | 0 |

- ro-housing has nothing to spot-check: its 7 Base UI imports are all in
  `components/ui/`, its pin is exact, and it has no native dialog or arbitrary
  colour. Without the `stylesheet` key it reports 1, rule 5 on `styles.css`.
- Rules 9 and 10 can't see through ro-housing's wrappers, which re-export the
  parts (`DialogTrigger`, and `Select` for `Select.Root`). By hand: both
  `<DialogTrigger>` uses pass `render`, and the 5 `<Select>` uses pass no
  `items` but show their labels through a `SelectValueLabel` lookup, which
  meets rule 10's purpose but not its letter.
- atrium's rule 3 findings are the 7 feature files its brief 03 moves behind
  wrappers. Its rule 9 finding is false: `CoverCard.tsx`'s `Menu.Trigger`
  holds a `DotsGlyph` icon, and the heuristic can't tell an icon from a button.
  Rule 9 is a warning for that reason.

`check-structure --warn-only`, for brief 16's table:

| Repo | Roots (server; web; shared) | 1 | 2 | 3 | 6 (no schema + by hand) | 11 | All | Exit |
|---|---|---|---|---|---|---|---|---|
| Almanac | `server/src`; `web/src`; `shared/src` | 1 | 0 | 4 | 26 (16 + 10) | 5 | 36 | 0 |
| atrium | `apps/api/src`; `apps/web/src`; `packages/*/src` | 1 | 0 | 6 | 87 (62 + 25) | 42 | 136 | 0 |
| wicket | `server/src`; `web/src`; `shared/src` | 1 | 0 | 4 | 15 (10 + 5) | 1 | 21 | 0 |

- **Rule 1** is each entry file, `index.ts`, calling `listen`: the rename to
  `server.ts` is each server brief's.
- **Rule 3:** `loadConfig(process.env)` in `index.ts` and the seed CLI's three
  reads in Almanac and wicket; in atrium, `NODE_ENV` and a proxy read in
  `index.ts:97-98`, `calibre.service.ts:19` (spreads the environment into a
  child process's) and `scripts/seed-user.ts` ×3.
- **Rule 6** equals the grep of route registrations with a literal path and
  of `.parse(request.` and `.safeParse(request.`. atrium's 11 stream and binary
  routes and wicket's `GET /` redirect are among them, as exceptions to come.
- **Rule 11:** atrium's 42 are 17 in `packages/`, 16 in `apps/web`, 9 in
  `apps/api`; Almanac's 5 include 2 tests; wicket's one is `app.ts` at 404
  lines, before the reformat.
- **dependency-cruiser** with the house preset on wicket's checkout (read
  only): no violation in 55 modules.

## Version 1.1.0 (2026-11-11)

Eight repos adopted 1.0.0 on 2026-11-11: wicket, the todo app in
mini-projects, 3D-sandbox, imbatranim-apps, Lantern, SocialEvents, Satchel and
Newspapper. 1.1.0 folds their findings in: the `env` and `assertFunctionNames`
options, `no-import-type-side-effects`, the sync's target, the Stop hook's
lookup, and the documentation notes. The upgrade steps are in
`house-style/CHANGELOG.md`.

## Version 1.2.0 (2026-11-11)

23 repos adopted 1.1.0, among them the eight above and atrium, Almanac,
brief-board, comercial-website, game-engine, imbatranimOS, just-a-bot,
ro-housing, Postern, public-resource-map, presentation-sites, Shelfmark,
sports-app and wzd_auth. 1.2.0 folds their findings in: the two widths
of a test file, `playwright`, `conventions.json`'s `env`, hooks in
`no-standalone-expect`, `+types`, a global `tsconfigRootDir`, and about 30
notes in the README and adoption reference, plus a recipes reference
(per-folder blocks, `react-refresh`, Astro). Findings declined as options are
listed in the CHANGELOG's 1.2.0 section.
