---
name: house-style
description: The estate's house style for TypeScript repos, written as numbered rules with the reason for each and the lint rule (or review) that enforces it, plus how a repo adopts the quality harness that checks them - the configs vendored from the library's house-style folder (Prettier at 120 columns, one tsconfig base, a thin ESLint config with six typed rules), one reformat commit, npm run check and check:fast, and this plugin's Stop and formatter hooks. Use when the user says "code style", "lint rules", "formatting", "house style", "set up the harness", "add Prettier", "why does lint flag this", or a repo brief says to adopt the house-style harness.
---

# House style

The house style is how the estate's TypeScript is already written. It was
measured across 23 repos on 2026-11-09 and 2026-11-10 (the numbers are in the
library's [corpus/wiki/house-style.md](../../corpus/wiki/house-style.md)): strict
compilers, double quotes, semicolons, trailing commas, no enums, factories
over classes, comments that explain why. The harness makes that style
mechanical, so nobody hand-formats and nobody argues about it in review.

It has two layers:

- **The repo's own gate.** `npm run check` holds for a human, any agent and
  the deploy. `npm run check:fast` is its fast subset.
- **The Claude Code layer.** This plugin's hooks format each saved file and run
  `check:fast` before an agent can end its turn. `.claude/rules/web.md` and
  `server.md` carry the area rules, and a short root `CLAUDE.md` names the
  commands.

The configs live in the library's `house-style/` folder, with its own version
(`house-style/package.json`) and tags `house-style-v<version>`. Each repo holds
a generated copy at `vendor/house-style/`, refreshed by
`npm run house-style:sync -- <ref>`. Nobody edits the copy by hand.

## The rules

The base is `@eslint/js` and `typescript-eslint` recommended, untyped. The
compiler is the first gate, and the lint config adds only what a type checker
can't see: a rule that duplicates the compiler is worse than absent. Every
rule's entry in the shipped config carries its reason as a comment.

| # | Rule | Why | Enforced by |
|---|---|---|---|
| 1 | Every package extends one `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `isolatedModules`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, `NodeNext` | The compiler catches the most for the least config | `tsc`, from `vendor/house-style/tsconfig.base.json` |
| 2 | Only erasable TypeScript: no `enum` (a string-literal union or an `as const` object), no `namespace`, no parameter properties (declare the field) | Every file can run under Node's type stripping; unions narrow | `tsc` (`erasableSyntaxOnly`), `no-restricted-syntax` (`TSEnumDeclaration`) |
| 3 | Type-only imports say `type`; relative imports carry their real suffix | Erased imports must be visible to the reader and the bundler | `tsc` (`verbatimModuleSyntax`), `@typescript-eslint/consistent-type-imports` |
| 4 | Prettier at 120 columns, trailing commas everywhere, double quotes, semicolons. Markdown stays out | The house already writes this; a formatter makes it free | `prettier --check` (`format:check`), the formatter hook |
| 5 | `_`-prefixed names are deliberately unused; nothing else is | Says "unused on purpose" without a comment | `@typescript-eslint/no-unused-vars` |
| 6 | Every promise is awaited, returned or `void`ed, and no async function goes where a void callback is expected | A handler that forgets `await` returns before its write lands | `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises` |
| 7 | Await only what is awaitable | An `await` on a sync call (Drizzle on better-sqlite3) misleads the reader | `@typescript-eslint/await-thenable` |
| 8 | A `switch` over a union handles every member, or has a deliberate `default` | A new union member must not fall through silently | `@typescript-eslint/switch-exhaustiveness-check` |
| 9 | No type assertion the compiler already knows | A dead cast hides the next real type change | `@typescript-eslint/no-unnecessary-type-assertion` |
| 10 | No `any`: take `unknown` and narrow | `any` switches the compiler off for everything it touches | `@typescript-eslint/no-explicit-any` |
| 11 | No non-null `!` in source: narrow with a guard. Tests may use it | `!` is an unchecked claim; a guard is a checked one | `@typescript-eslint/no-non-null-assertion` (warning in tests) |
| 12 | No `@ts-ignore`; `@ts-expect-error` only, with its reason | A suppression must fail once the error is gone, and say why | `@typescript-eslint/ban-ts-comment` |
| 13 | No `TODO` or `FIXME` comments | Todos live in `corpus/todos/`, where someone reads them | `no-warning-comments` |
| 14 | No `console` outside scripts and CLIs | Services log through their logger | `no-console` |
| 15 | App code reads `process.env` only in `config.ts`. Tests, tool configs (`*.config.*`) and scripts aren't app code and may read it. A file allowed to print (a server entry, a seed CLI inside the app) still reads it through `config.ts` | One place says what the app needs and fails early | `n/no-process-env` (off in tests, `*.config.*` and `scripts`; on in the `console` globs) |
| 16 | Named exports. A default export only where a framework or a runtime contract needs one (configs, route modules, scenes read as `mod.default`) | Names survive renames and search; imports agree | `import-x/no-default-export` |
| 17 | React follows the rules of hooks and the compiler rules | Mirrored state and impure renders are bugs the type checker can't see | `react-hooks` `recommended` (on `web` only) |
| 18 | Tailwind classes exist in the theme and aren't deprecated; class order is consistent once a repo has migrated | A typo'd class renders nothing and fails nowhere else | `better-tailwindcss/no-unknown-classes`, `better-tailwindcss/no-deprecated-classes`, `better-tailwindcss/enforce-consistent-class-order` (with `tailwind.order`) |
| 19 | Tests: no committed `.only`, every test asserts, `expect(value, "why")` is fine, and so is an `expect` inside a `catch` | A focused or empty test passes for nothing | `@vitest/eslint-plugin` `recommended`, `vitest/valid-expect` (`maxArgs: 2`), without `vitest/no-conditional-expect` |
| 20 | Stores and services are factory functions returning a documented `interface`; classes only for `Error` subclasses | The interface is the contract, and a fake is a plain object | review |
| 21 | `interface` for object shapes, `type` for unions and mapped types | One way to say each thing | review |
| 22 | PascalCase component files; lowercase or kebab-case modules | A file name says what it holds | review |
| 23 | Tests sit beside their source as `*.test.ts`, on vitest (atrium: `test/` on `node:test`) | The test is found where the code is | review |
| 24 | Comments are prose that explains why, in full sentences; every exported member is documented; a decision carries its date; no commented-out code | The code says what; only the comment can say why | review |
| 25 | Exact pins: `.npmrc` with `save-exact=true` (and `engine-strict=true`) | An upgrade happens on purpose, and a too-old Node fails loudly | review |

Rules 20-25 have exceptions, so they stay out of lint and out of hooks.
[references/review-checklist.md](references/review-checklist.md) is the list a
reviewer works through; `plan-split-dispatch`'s review gate points its finders
at it. A reviewer skips anything rules 1-19 already enforce.

Escapes are rare and say why: `// eslint-disable-next-line <rule> -- <reason>`,
or `// @ts-expect-error <reason>`. A tsconfig flag a repo can't take yet is
turned off in its own tsconfig with a dated comment naming the brief that
turns it on (imbatranimOS's NestJS backend keeps parameter properties and
`emitDecoratorMetadata` this way).

## What an adopted repo has

- `vendor/house-style/`: the generated copy, with `README.md` as its header
  (version, source commit, and where the upgrade notes are). ESLint, Prettier
  and knip ignore it.
- Root configs that extend the copy: `prettier.config.js`, `tsconfig.base.json`,
  `eslint.config.js` (calling the copy's named export `houseStyle`, a function
  of the repo's folders), a `knip.config.js` that spreads the knip preset (knip
  has no `extends`), `.dependency-cruiser.cjs` extending its preset, and a
  `.prettierignore` listing `*.md` and `vendor/house-style/`. A Tailwind
  stylesheet has `@source not` for `vendor/`.
- `.git-blame-ignore-revs` with the one reformat commit.
- These scripts in the root `package.json`:

| Script | What it runs |
|---|---|
| `check` | `typecheck`, `lint`, `format:check`, `check:conventions`, `test`. Run before every hand-back |
| `check:fast` | `tsc -b` (incremental), then ESLint on the changed and untracked files, from a small Node script in `scripts/`. Never tests. Target 15 s, up to about 30 s |
| `format`, `format:check` | `prettier --write .`, `prettier --check .` |
| `check:conventions` | knip, then `node vendor/house-style/bin/check-base-ui.mjs` and `node vendor/house-style/bin/check-structure.mjs`, `--warn-only` until the repo's own Tailwind or server brief drops it. Roots come from `conventions.json` |
| `house-style:sync` | `node vendor/house-style/bin/sync.mjs` |
| `test:clean` | Only where the tests would read a production `.env`: the tests, in a copy without `.env*`. `check` calls it instead of `test` |

- A short root `CLAUDE.md` (under about 60 lines): what the repo is, "read
  `corpus/index.md` first", the commands, the places that mislead, the hard
  rules.
- `.claude/rules/web.md` and `.claude/rules/server.md`, each with a `paths:`
  glob (`web/src/**`, `server/src/**`), under about 40 lines, carrying the
  base-ui and code-structure rules where they apply. A `.gitignore` that
  ignores `.claude` or `.claude/*` gets a `!.claude/rules/` line.
- A repo with two npm projects and no root `package.json` gets a scripts-only
  root `package.json`, so the Stop hook finds `check:fast`.

## Adopting it

One commit per step, on `main`, each with typecheck, tests, lint and build
green. [references/adoption.md](references/adoption.md) has the commands and
the traps each step hit in the repo briefs.

1. **Measure.** Run the house configs on a scratch copy and record the counts.
   A rule with more than about 20 real findings, or mostly false ones, goes to
   the owner with its counts before it is turned on. Don't loosen it quietly.
2. **Vendor.** `npm run house-style:sync -- house-style-v1.0.0` copies the
   library's `house-style/` folder at that tag into `vendor/house-style/`
   (the first time, before the copy exists, run the library checkout's
   `house-style/bin/sync.mjs house-style-v1.0.0` from the repo root). Pin the
   devDependencies the house-style README lists; the sync reports any pin that
   differs.
3. **Prettier.** Add the config, `.prettierignore`, `format` and
   `format:check`, and commit that alone.
4. **The reformat.** `npm run format`, committed alone as
   `style: format with Prettier`. Its acceptance is the esbuild bundle compare:
   bundle every file before and after, and list and explain each difference.
   Then put the commit's full hash in `.git-blame-ignore-revs`, in its own
   commit. `git config blame.ignoreRevsFile .git-blame-ignore-revs` is an
   owner step.
5. **tsconfig.** Extend the vendored base and fix what the new flags find.
6. **ESLint.** Extend the vendored config with the repo's roots, then fix each
   finding or list it in the outcome note with its reason.
7. **The gate.** Add `check`, `check:fast`, `check:conventions`,
   `house-style:sync`, and `test:clean` or `pretest` where needed. Time
   `check:fast` warm with one changed file, and `check` in full.
8. **The Claude Code layer.** The root `CLAUDE.md`, the two rules files, the
   `.gitignore` line.

## The hooks

This plugin ships them in `hooks/hooks.json`; a repo opts in by having the
files they look for, and nothing is committed to `.claude/settings.json`.

- **After `Edit` or `Write`:** if the repo has a Prettier config and an
  installed Prettier, the saved file is formatted with that Prettier, from the
  config's folder, so `.prettierignore` applies. A formatter error never fails
  the edit.
- **At `Stop`:** the nearest `package.json` with a `check:fast` script, from
  the session's folder up to the repo root, is run, but only when this session
  saved a code file in that package since its last green run. On a failure the
  tail of the output goes back to Claude, which keeps working. It blocks again
  only while the failure changes, at most four times a turn; then the turn
  ends with a note to the user. It never runs a `check:fast` whose scripts run
  tests.

So `check:fast` must stay a typecheck and a lint: just-a-bot's tests read its
production `.env`. A repo with no `check:fast` and no Prettier config costs
nothing.
