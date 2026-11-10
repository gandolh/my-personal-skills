---
summary: The house-style measurements for brief 27, collated from the 23 repo harness briefs of 2026-11-09 and 2026-11-10 (not re-measured) - Prettier churn per repo at width 120 and its least-churn width, the TypeScript flag error counts, and the calls made on the four rules whose counts looked wrong. Rule findings, timings, knip and the gaps are on house-style-part-2.md.
updated: 2026-11-11
---

# House style: the measurements

Brief 27 asked for the house style to be measured before its rules were
chosen. The repo briefs written on 2026-11-09 and 2026-11-10 already measured
it, each on a scratch copy of its repo, so this page collates their numbers
instead of measuring again (the owner's call, 2026-11-10). Each number is
from that repo's harness brief, where the files and commands are named.
"gap" means the brief didn't measure it.

Rule findings, timings, knip and the list of gaps are on
[house-style-part-2.md](house-style-part-2.md). The rules these numbers led
to are the `house-style` skill's; the decisions are on
[decisions.md](decisions.md).

**How to read the churn.** The briefs counted three ways: old lines changed
(the lines Prettier rewrites), added and removed lines (`+` / `-`, so a
rewrapped line counts twice), and `diff -r` lines (about twice the lines
touched, Postern). Rankings within a repo hold; across repos the numbers are
rough. Brief 27's first table (Wicket 2.5% at 120) and Wicket's own brief
(1.4%) differ for that reason. Toolchains were Prettier 3.8.1 to 3.9.10,
`trailingComma: "all"`, Prettier's defaults otherwise.

## Prettier churn at width 120

| Repo | Scope | At 120 | Least churn (of the widths measured) | What drives it |
|---|---|---|---|---|
| wicket | 52 files, 4,941 lines | 68 old lines (1.4%), 20 files, 288 new | 140: 32 (0.6%) | long lines |
| brief-board | 74 files, 9,366 lines | 1,088 (11.6%), 43 files | 150: 176 (1.9%) | written wide: 294 lines over 120 |
| comercial-website | frontend 219 files, backend 60 | frontend 1,586 (10.5%), 188 files; backend 1,821 (17.8%), 46 | frontend 100, backend 150, each within about 1 point of 120 | single quotes in 48 frontend files, missing commas |
| almanac | 164 files, 23,060 lines | 502 (2.2%), 93 files | 130: 333 (1.4%) | long lines |
| satchel | 113 files, 15,893 lines | 231 (1.5%), 49 files | 120 (125 changes fewer files) | long lines |
| atrium | 325 files, about 78,000 lines | +1,992 / -2,580, 185 files | 120: 4,572 lines in all | long lines |
| shelfmark | 235 files, 32,068 lines | 628 (2.0%), 140 files | 130: 391 (1.2%) | long lines |
| postern | 342 files | 10,398 diff lines (about 5,200 lines), 274 files | 180: 2,870 diff lines | written wide: 729 lines over 140; at least 160 files change at any width |
| lantern | 88 files, 6,524 lines | 201 (3.1%), 50 files | 160: 67 | written wide: 117 lines over 130 |
| newspapper | 275 files, 38,027 lines | 7,912, 234 files | 100: 6,768 (17.8%) | single quotes; formatted at 100 today |
| public-resource-map | 158 files, 16,889 lines | +1,040 / -964, 95 files | 120 | long lines |
| ro-housing | 120 files, 11,363 lines | 6,674 (+ and -), 112 files | 100: 6,560 | single quotes (361 imports) |
| sports-app | 126 files, 34,569 lines | 13,134 (38.0%), 117 files | flat: 150 is 13,102 | single quotes and no semicolons |
| SocialEvents | 71 files, 4,723 lines | 590 (12.5%), 44 files | 90: 159 (3.4%) | written near 80 columns (p95 76) |
| the todo app (mini-projects) | 15 + 3 files | frontend +198 / -194, backend +63 / -61 | 130 | single quotes; the backend has no semicolons |
| 3D-sandbox | 197 files | 783 (+ and -), 80 files | 110: 36 lines in 3 files, none in TypeScript | formatted by Biome at 110 today |
| game-engine | 1,480 files, 191,989 lines | +15,879 / -13,928, 970 files | 120 and 130 tie | number literals and rewrapping: two thirds of the files at any width |
| imbatranimOS | core 238, kit 42, add-ons 303, backend 233 files | core +15,249 / -16,226 (234 files); add-ons +15,502 / -16,881 (288); backend +9,395 / -13,876 (233) | width barely matters | single quotes and no semicolons (web), width 80 (backend) |
| imbatranim-apps | 376 files, 62,370 lines | +26,764 / -29,603, 355 files | 100 | single quotes and no semicolons; width alone at 120 is 221 files |
| ward-auth | 198 files, 53,625 lines | 2,312, 135 files | 100: 30 lines | formatted by Prettier at 100 today |
| just-a-bot | 133 files, 14,484 lines | +4,262 / -3,691, 131 files | the quote change is most of it | single quotes (402 imports) |
| presentation-sites | 274 files, 30,147 lines | about 3,790 (12.6%), 188 files | 120, barely | hand-formatted `.astro` |
| churchix | 42 files, 4,924 lines | about 1,190 (24%), 40 files | 100: about 1,170 | single quotes |

So 120 is the least churn in Satchel, atrium, public-resource-map and
presentation-sites, near the least in Almanac, Shelfmark and Wicket (130 is
1.4%, 1.2% and 0.8%), and a convention. The wide repos (brief-board, lantern,
Postern) would pay least at 150-180, the narrow ones (SocialEvents,
Newspapper, ward-auth) at 90-100. Where quotes or semicolons change, width
hardly matters. Markdown, which stays out (Q45), would have changed 93-714
lines per repo where it was measured.

## TypeScript flags

Errors when the flag is added. Parameter properties are nearly every
`erasableSyntaxOnly` error; "on" means the repo already has the flag.

| Repo | TypeScript | `erasableSyntaxOnly` | `verbatimModuleSyntax` | `exactOptionalPropertyTypes` (later) | `noUncheckedIndexedAccess` |
|---|---|---|---|---|---|
| wicket | 6.0.3 | 3 | 0 | gap | on |
| brief-board | 6.0.3 | 9 | 0 | gap | on |
| comercial-website | backend 5.7.3, bump to 6.0.3 | backend 9; frontend on | on | backend 0 | frontend +1 (and `strict` missing: 0 errors) |
| almanac | 6.0.3 | 1 | 0 (packages unchecked) | gap | on |
| satchel | 6.0.3 | 10 | 0 | gap | on |
| atrium | 5.9.3 | 6 (both flags, `apps/api`) | (with it) | web 39, api 10 (14 with tests), typeset 6 | **off**: web 107, api 17 (46), typeset 0 (47) |
| shelfmark | 6.0.3 | 2 | 0 | web 63 | on |
| postern | 6.0.x | 4 parameter properties (parser count, no tsc run) | on in 2 of 4 projects | gap | on |
| lantern | 6.0.3 | 5 | 0 | gap | on |
| newspapper | 6.0.3 | 2 | 0 | 27 | **off**: 139 in source; 49 test files untypechecked (117 errors) |
| public-resource-map | 5.9.3 | 3 | on | 38 | **off**: 94 |
| ro-housing | 6.0.3 | 6 | 0 | 20 | on |
| sports-app | 6.0.3 | on | on | on | on |
| SocialEvents | gap | 4 | on | 7 | on |
| the todo app | frontend 6.0.3, backend 5.9.3 (bump) | 0 | 0 | 0 | frontend 4 (taken now) |
| 3D-sandbox | 5.9.3, bump to 6.0.3 (1 error) | on | on | on | on |
| game-engine | 6.0.3 | **169** (168 parameter properties, 1 enum) | 2 | on | on; `noUnusedLocals` 75 |
| imbatranimOS | web 6.0.3, backend 5.9.3 | web on; NestJS backend exempt | web on | 158 | **off**: 664; backend `strict` 55 |
| imbatranim-apps | 6.0.3 | on | on | 72 | **off**: 740 |
| ward-auth | 6.0.3 | 5 | 0 | 24 | on |
| just-a-bot | root 5.7.3, bump to 6.0.3 | 19 | 26 | 8 | **off**: 160 |
| presentation-sites | 6.0.3 | 0 | on | gap | subcort 86, tractari 5 (later) |
| churchix | 6.0.3 | 0 | on | gap | 0 (taken now); the packages lack a tsconfig (9 errors) |

Brief 27 assumed the house had no parameter properties. It has a few in most
repos and 168 in game-engine, which is why decision 3 converts them to fields.

## Calls made 2026-11-10 (the owner may overrule)

Four rules had counts that suggested they were wrong for the house as first
set. The controller of brief 27 made these calls; the owner may overrule any
of them.

1. **`n/no-process-env` allows tests, tool configs and CLIs.** App code reads
   the environment only through `config.ts`; tests (ward-auth 214, Newspapper
   42, comercial-website 14), `*.config.*` tool configs and the `scripts` and
   `console` globs aren't app code. On a scratch Wicket the count drops from 6
   to 0, because Wicket's `console` globs name its server entry
   (`server/src/index.ts`) beside the seed CLI; a repo that wants its entry
   held to `config.ts` leaves it out of `console`.
2. **`vitest/no-conditional-expect` is off.** The house asserts on a thrown
   error inside its `catch` (game-engine 90, Newspapper 13 of 14, ward-auth 10,
   3D-sandbox 8, Wicket 2).
3. **game-engine keeps `@typescript-eslint/no-non-null-assertion` as a
   warning** in its own config, with a `--max-warnings` ceiling and a dated
   comment, until it pays them down: 596 in source, 3,072 in tests. Elsewhere
   the rule is an error in source as set (Q47): 0-170 there (atrium 170,
   3D-sandbox 97, Postern 82).
4. **`@typescript-eslint/no-unnecessary-type-assertion` is off, with a dated
   comment, in repos without `noUncheckedIndexedAccess`** (atrium 608,
   game-engine 313, Newspapper 111) until their flag brief. Most findings are
   `!` the deferred flag (Q50) makes necessary again, so fixing them now is
   churn that brief would revert. ward-auth turns the flag on first instead.
