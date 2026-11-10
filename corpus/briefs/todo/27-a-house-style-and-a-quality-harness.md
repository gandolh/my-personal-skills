# Task 27: A house style, and a quality harness that enforces it

## Context

On 2026-11-09 the owner asked for a deeper look at each topic of the day
(code structure, styling conventions and the rest), and for rules or a
harness that keep the code to best practice **while keeping the coding
style the owner and their agents already share**. Briefs 02 (Base UI and
Tailwind) and 03 (code structure) set what to write. This brief sets how
it is written, and the one gate that checks all of it.

### The house style, as measured on 2026-11-09

The newer apps descend from one layout (Satchel → Shelfmark → Almanac,
with lantern, wicket, the-board and postern alongside) and write
TypeScript the same way:

- **The compiler is the first gate.** Each has a `tsconfig.base.json` with:
  - `strict`;
  - `noUncheckedIndexedAccess`;
  - `noImplicitOverride`;
  - `isolatedModules`;
  - `noUnusedLocals`;
  - `noFallthroughCasesInSwitch`;
  - `module` and `moduleResolution` set to `NodeNext`.

  Imports carry `.js` suffixes. 3D-sandbox and sports-app add
  `exactOptionalPropertyTypes`, `verbatimModuleSyntax` and
  `erasableSyntaxOnly`.
- **ESLint is deliberately thin.** It is `@eslint/js` recommended,
  `typescript-eslint` recommended (not type-checked), `react-hooks`
  recommended on `web/`, and `_`-prefixed names for "deliberately
  unused". Postern adds `no-restricted-imports` for its `jmap` boundary.
  ward-auth's config says why: "the compiler is the primary gate and this
  file only adds what a type checker cannot see. Rules duplicated from the
  compiler are worse than absent." atrium, 3D-sandbox (Biome),
  SocialEvents and public-resource-map have no ESLint config.
- **No formatter in the lineage, yet a consistent format:**
  - double quotes (house repos: 0-4 single-quoted imports each);
  - semicolons;
  - trailing commas;
  - lines whose 95th percentile is 97-107 characters.

  The outliers are Newspapper and ro-housing (single quotes, and Prettier
  in Newspapper), sports-app (single quotes, no semicolons) and
  imbatranim-apps (single quotes, Prettier).
- **Exact pins.** `.npmrc` has `save-exact=true` in 10 of 19 repos.
  3D-sandbox adds `engine-strict=true`, with the reason.
- **Code shapes:**
  - **Zero `enum`s** anywhere.
  - **Near-zero `any`, `!` and `@ts-ignore`:** 0-6 per repo, `@ts-ignore`
    never.
  - **No `TODO`/`FIXME` comments**, because todos live in `corpus/todos/`.
  - **Classes almost only for `Error` subclasses:** 69 of postern's 88, 12
    of Satchel's 14, all 9 of Shelfmark's.
  - **Stores and services are factory functions returning a documented
    interface**, as in Almanac's `createCalendarStore(db): CalendarStore`.
  - **Named exports**, with default exports only where a framework demands
    them (React Router routes, Astro, configs).
  - **`interface` for object shapes and `type` for unions.**
  - **PascalCase component files, and lowercase or kebab-case modules.**
- **Comments are prose that explains why.** Almanac has 848 JSDoc blocks
  and Shelfmark 1,250, on every exported interface member, written as full
  sentences, often with the date and reason of a decision.
- **Tests are co-located** `*.test.ts` files, on vitest. In 9 of 10 repos
  every test sits beside its source; atrium uses `test/` and `node:test`.

### Best practice the house lacks (research, 2026-11-09)

- **Type-aware lint rules catch bugs the compiler can't.** Unawaited
  promises are one: a Fastify handler that forgets `await` returns before
  its write lands. typescript-eslint 8.72.2 recommends `projectService`
  for typed linting. Its docs warn that typed rules cost lint time, and
  that `project` can still outrun `projectService`, so measure both. The
  rules worth their cost here:
  - `no-floating-promises`;
  - `no-misused-promises`;
  - `await-thenable`;
  - `switch-exhaustiveness-check`;
  - `no-unnecessary-type-assertion`;
  - `consistent-type-imports` (or `verbatimModuleSyntax`).

  They can be taken one at a time instead of the whole
  `recommendedTypeChecked`, which fits the house's thin-config rule.
- **`eslint-plugin-react-hooks` 7.1.1** (read from the published package):
  - Its `recommended` preset already includes the compiler rules, as
    errors: `set-state-in-effect`, `refs`, `purity`, `immutability`,
    `static-components`, `use-memo` and `preserve-manual-memoization`.
    ward-auth's explicit overrides of two of them are now redundant.
  - `unsupported-syntax` and `incompatible-library` are warnings.
  - The plugin warns that a clean run means "nothing found", not "nothing
    there".
- **Tailwind class hygiene without Prettier.**
  `eslint-plugin-better-tailwindcss` 4.10.0 (peer `tailwindcss` ^4.1.17,
  ESLint 7-10) reports:
  - unregistered classes;
  - conflicting and duplicate classes;
  - deprecated classes;
  - restricted classes;
  - a consistent class order.

  That suits a repo without Prettier. `prettier-plugin-tailwindcss` 0.8.1
  sorts classes only through Prettier.
- **A formatter encodes a style. It doesn't have to change one.** Prettier
  3.9.10 was run with `--trailing-comma all`, its defaults otherwise
  (double quotes, semicolons), on copies of the house repos:

  | Width | Almanac | Satchel | wicket |
  |---|---|---|---|
  | 100 | 4.9% | 3.3% | 4.6% |
  | 120 | 2.0% | 1.4% | 2.5% |
  | 130 | ~1.3% (340 lines, 70 files) | | |
  | 140 | ~1.4% | | |

  Most of the change is long lines wrapped. So one reformat commit per repo
  at about 120-130 columns makes the existing style mechanical, and agents
  stop hand-formatting. Biome 2.6.6 formats almost the same (community
  reports put it at 97% compatible with Prettier) and is faster. Its typed
  lint is narrower than typescript-eslint's, and 3D-sandbox already uses
  it.
- **Node's rules.** `eslint-plugin-n` 18.5.0 has `n/no-process-env`.
  Allowed only in `config.ts`, it replaces brief 03's regex check for rule
  3.
- **Tests.** `@vitest/eslint-plugin` 1.6.28 catches a committed `.only`
  and a test with no assertions.
- **Supply chain.** Exact pins and `npm ci` are the floor, and
  `engine-strict` makes a too-old Node fail loudly (3D-sandbox's `.npmrc`
  explains why). Brief 19's MCP pin check covers `.mcp.json`.

### What Anthropic's own guidance adds (read 2026-11-09)

Claude Code's best-practices page (code.claude.com/docs/en/best-practices)
splits every instruction into two kinds:

- **Non-deterministic:** the prompt, `CLAUDE.md`, a skill. "Claude decides,
  and there's no guarantee."
- **Deterministic:** a hook, a deny rule, a managed setting, which "Claude
  Code applies … every time, no matter what the model decided."

Its rules for a harness:

- **"Give Claude a check to run."** The most useful line in `CLAUDE.md` is
  the command that comes back pass or fail.
- **Enforce what has no exceptions with a hook.** A `Stop` hook that exits
  2 sends Claude back to work with stderr as the reason. It is capped at
  eight blocks in a row (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`). A
  `PostToolUse` hook on `Edit|Write` can run the formatter on the file just
  saved.
- **Keep preferences out of hooks.** "Prefer named exports" is its own
  example of a rule that stays in `CLAUDE.md`, because it has exceptions.
- **Keep `CLAUDE.md` short**, under about 200 lines. It holds the commands,
  the misleading places, and the decisions not in the code.
- **Scope rules to an area** in `.claude/rules/<name>.md` with a `paths:`
  glob, loaded only when Claude reads or edits a matching file.
- **Put procedures in skills.**
- **Ask a reviewer to "skip style".** "A reviewer that's asked to find
  problems will always find *something*."
- **`/doctor prompt-audit`** (Claude Code ≥2.1.283) flags instructions
  written for older models, references to missing files, and
  contradictions.

Boris Cherny's published tips (his 2026 thread, as compiled by others)
agree:

- verification ranks first;
- plan first, and have a second Claude review the plan;
- add to the shared `CLAUDE.md` every time Claude gets something wrong;
- automate each per-PR routine as a command or a subagent (a code
  simplifier, a verify-app agent).

So the harness has **two layers**:

- **The repo's own gate:** `npm run check`. It holds for a human, any agent
  and the deploy.
- **The Claude Code layer**, which makes an agent hit that gate before it
  can finish:
  - a `Stop` hook running a fast subset;
  - a `PostToolUse` formatter;
  - `.claude/rules/web.md` and `server.md`, scoped by `paths:` to
    `web/src/**` and `server/src/**`, which carry briefs 02 and 03's rules
    where they apply;
  - a short `CLAUDE.md`.

## Owner decisions (defaults)

0. **Where the Claude Code layer lives.** Default: **in this plugin**, as
   `hooks/hooks.json` (with brief 23's `SessionStart`):
   - **`Stop`:** if the repo's `package.json` has a `check:fast` script,
     run it. On a failure, print its tail to stderr and exit 2. Without the
     script, do nothing. Each repo opts in by defining `check:fast`, which
     is typecheck plus ESLint on the changed files, so a stop costs seconds,
     not the full suite.
   - **`PostToolUse` on `Edit|Write`:** if the repo has a Prettier config,
     format the saved file.

   A repo's own `.claude/settings.json` can still add or override hooks.
   Alternative: commit the hooks in each repo's `.claude/settings.json`,
   which is visible per repo but means twenty copies.
1. **One shared package, or files copied into each repo?** Default: **one
   small public repo, `house-style`**, depended on from each repo as an
   exact git dependency (`"house-style": "github:gandolh/house-style#v1.0.0"`).
   It holds:
   - the ESLint flat config;
   - the `tsconfig.base.json` to extend;
   - the Prettier config;
   - the knip and dependency-cruiser presets;
   - the `check-base-ui.mjs` and `check-structure.mjs` checkers from briefs
     02 and 03, as its bin scripts.

   A rule changes in one place, and each repo moves by bumping the tag, as
   with Base UI in brief 04. This doesn't contradict the morning's "no
   shared component library": that verdict was about UI, which should
   differ per app. Tooling should be the same everywhere.

   Alternative: the skill ships the files and each repo keeps a copy with a
   version header, as brief 15 first planned.

   **Caveat found 2026-11-09 (Almanac):** a `github:` git dependency breaks
   a Docker build stage with no `git` installed, and Almanac's deps stage
   has none. So the package either:
   - publishes to a registry (public npm, or GitHub Packages, which needs a
     token in the build);
   - goes in as a packed tarball committed per repo; or
   - needs `git` added to each Dockerfile.

   This is part of the grilling's Q6.
2. **Formatter.** Default: **Prettier, at the width with the least churn**
   across the lineage repos. Re-measure 110, 120 and 130 on every house repo
   and pick one width for all. The other settings are double quotes,
   semicolons and `trailingComma: "all"`, which is what the code already
   does. Each repo gets one reformat commit, listed in
   `.git-blame-ignore-revs`. The outliers (Newspapper, ro-housing,
   sports-app, imbatranim-apps) move to the house quotes and semicolons in
   the same commit. Alternative: Biome as formatter only.
3. **tsconfig.**
   - Default: the lineage's flags, plus `verbatimModuleSyntax` and
     `erasableSyntaxOnly`. The house already writes
     `import { type X }`, and has no enums, namespaces or parameter
     properties, so both should cost almost nothing.
   - `erasableSyntaxOnly` also keeps every file runnable under Node's type
     stripping, which the deploy scaffold uses.
   - `exactOptionalPropertyTypes` is **not** added now: measure its error
     count per repo first and decide in a later brief.
4. **Lint additions**, each with its reason in a comment, in the house's
   own voice:
   - **typed:** the six rules above, through `projectService` (or `project`
     if it measures faster);
   - **React:** `react-hooks` `recommended`;
   - **Tailwind:** `better-tailwindcss`'s correctness rules as errors, and
     its class order as an error once a repo has migrated (briefs 05-14);
   - **Node:** `n/no-process-env` outside `config.ts`;
   - **tests:** `@vitest/eslint-plugin` recommended;
   - **house shapes:**
     - `no-restricted-syntax` for `enum`;
     - `@typescript-eslint/no-explicit-any` and `no-non-null-assertion` as
       errors;
     - `ban-ts-comment` allowing only `@ts-expect-error` with a
       description;
     - `no-warning-comments` for `TODO`/`FIXME`, pointing at the corpus;
     - `no-console` outside `scripts/` and CLIs;
     - `import-x/no-default-export` except where a framework needs one.
5. **Not linted, reviewed.** The prose-comment style goes into the skill as
   a review checklist that `plan-split-dispatch`'s review gate reads. It
   covers:
   - why, not what;
   - full sentences;
   - every exported member documented;
   - a date on a decision;
   - no commented-out code.

   Factories over classes, and interfaces as contracts, go in the same
   list. `eslint-plugin-jsdoc` was weighed and rejected for now, because
   its `require-jsdoc` would flag gaps the review gate already catches
   better.
6. **One command.** Default: `npm run check`, which runs typecheck, ESLint,
   `prettier --check`, knip, dependency-cruiser, both convention checkers
   and the tests. `lint` stays the fast subset. Agents run `check` before
   every hand-back (`CLAUDE.md`), and the deploy runs it where vps-deploy
   runs checks (brief 15).

## Decisions of 2026-11-10

From the owner's grilling; each is a decision, not a default. The reasons are
on [grilling-2026-11-10-technical-calls.md](../../wiki/grilling-2026-11-10-technical-calls.md).
Work happens on `main` with no PRs (Q4).

- **Q6 changed: `house-style` is vendored**, not a git dependency (this
  replaces decision 1's default and its caveat). Each repo holds a copy with a
  version header, refreshed by a `house-style:sync` script that finds the
  checkout by name, the way Ward's library and the imbatranim kit are shared.
  A git dependency would need git or SSH inside every Docker build, because
  npm locks GitHub dependencies as git URLs.
- **House-style is a folder of this library, not its own repo** (the owner's
  call, 2026-11-10). The package is `house-style/` here, the way Ward's
  library is ward-auth's `shared-library/` folder. Its version is its own
  (`house-style/package.json`, 1.0.0), apart from the plugin's, and its tags
  are `house-style-v<version>`. `npm run house-style:sync -- <ref>` finds the
  `my-personal-skills` checkout by name and copies the folder at `<ref>` (a
  tag or a commit) into the repo's `vendor/house-style/`. Wherever this brief
  says "the `house-style` repo", read "the library's `house-style/` folder".
  Recorded in [decisions.md](../../wiki/decisions.md).
- **Q7.** The Claude Code layer lives in the plugin: `Stop` runs `check:fast`
  and `PostToolUse` formats the saved file (decision 0 confirmed).
- **Q8 and Q51: one estate width, 120.** Measured least churn at atrium and
  public-resource-map, near-least at Almanac and wicket (130 is 1.3% and 0.8%
  there), and a common convention; the small-tools family uses it (Q61). Other
  least-churn widths: the-board 150 (7.3% at 130), Postern 180 (at least 160
  files change at any width), Newspapper 100. Code written near 80 columns
  pays most (SocialEvents' p95 line is 76 characters: 175 lines change at 80,
  590 at 120, 835 at 150). Biome's own least-churn width is 110 in 3D-sandbox
  (36 lines against 783 at 120), but the estate width stays 120. The reformat
  is a one-off commit per repo, listed in `.git-blame-ignore-revs`.
- **Q9.** The outliers (Newspapper, ro-housing, sports-app, imbatranim-apps)
  move to double quotes and semicolons in their one reformat commit.
- **Q10.** `check:fast` is a typecheck plus ESLint on the changed files, built
  incrementally (`tsc -b`). Target 15 s; up to about 30 s is accepted where
  `tsc` alone is slower. Timing evidence: `astro check` takes 8-15 s per site,
  so it runs only in sites with changed files; `astro-eslint-parser` has no
  `projectService`, so typed lint falls back to `project: true` (50 s for the
  four sites); typed lint adds its own cost on every repo.
- **Q11.** `verbatimModuleSyntax` and `erasableSyntaxOnly` now (parameter
  properties become fields: Satchel 10, wicket 3), `exactOptionalPropertyTypes`
  after a count. A TypeScript older than 5.8 is bumped first
  (comercial-website's backend is on 5.7.3). A missing `strict` is added
  (comercial-website's `frontend/tsconfig.app.json`: 0 errors).
- **Q12.** The six typed rules. `no-floating-promises` names `node:test`'s
  `describe`, `it` and `test` in `allowForKnownSafeCalls` (814 findings in
  atrium otherwise).
- **Q13.** The house shapes as errors. `console` is allowed in scripts and
  CLIs. A default export is allowed where a framework needs one (config files,
  route modules) and where it is a runtime contract (3D-sandbox's scene
  modules read `mod.default`), through a glob exception.
- **Q14.** Comments are prose, checked by the review gate, not linted.
- **Q47.** `!` is an error in source and a warning in tests. **Q48:**
  `switch-exhaustiveness-check` with `considerDefaultExhaustiveForUnions:
  true`. **Q49:** components use named exports; Newspapper's 46 move in its
  reformat step. **Q50:** `noUncheckedIndexedAccess` is deferred to a later
  brief per repo, with its count; note it interacts with Q47, since with the
  flag off `no-unnecessary-type-assertion` flags most `!` (608 in atrium).
- **Q45.** Markdown stays out of Prettier. **Q46:** a short root `CLAUDE.md`
  with the commands in every repo.

**Rule details found writing the repo briefs:**

- `no-warning-comments` takes `location: "start"` (or a case-sensitive
  `TODO:`), or the word "Todo" in prose is a finding (18 times in
  game-engine, where "todo" names a spec).
- `vitest/valid-expect` takes `maxArgs: 2` for `expect(x, "message")`.
- `consistent-type-imports` takes `disallowTypeAnnotations: false` for
  `typeof import("./X")` lazy-chunk types.
- TypeScript 6 stops auto-including `@types/*`: a package needs
  `"types": ["node"]` (3D-sandbox's `packages/geometry`).
- `@vitest/eslint-plugin` 1.6.28 wants TypeScript 6 as an optional peer, so
  `npm` refuses on 5.x until the TypeScript bump.
- `e2e/` and `playwright.config.ts` sit outside every tsconfig, so typed lint
  can't parse them until one covers them.
- A stale `*.tsbuildinfo` hides flag measurements: delete it and `dist` before
  measuring a tsconfig flag.
- Parameter properties cost more than brief 27's "the house has none" claim.
- An orphan tsconfig base (imbatranimOS has a full house base nothing
  extends, and four unrelated bases): the harness makes one base and points
  every package at it.
- `.gitignore` with `.claude` (ro-housing) or `.claude/*` needs a
  `!.claude/rules/` line, or the rules stay untracked.
- A repo with two npm projects and no root `package.json` (ro-housing's
  `api/` and `web/`) gets a **scripts-only root `package.json`**, so the
  `Stop` hook finds `check:fast`.
- Node's type stripping needs `.ts` import suffixes, so the house's `.js`
  suffixes don't run against `.ts` files without a build.
- **`--workspaces --if-present` can check nothing.** just-a-bot's root
  `typecheck` checked only the docs site because the bot's workspaces had no
  `typecheck` script. The harness checks that every workspace has the script.
- A Docusaurus workspace breaks the exact-pin rule (`~6.0.2` TypeScript, 16
  `^` ranges) even where the main code pins exactly.
- Prettier can be undeclared, present only as a hoisted transitive dependency
  with a `format` script relying on it.
- **Prettier churns code already in house style.** It normalises number
  literals (`0xA11CE0` to `0xa11ce0`, `0.40` to `0.4`) and rewraps: 66% of
  game-engine's files change though it already uses double quotes and
  semicolons.
- **`.prettierignore` needs:** frozen fixtures, generated meta JSON, any
  stylesheet still in `layer(legacy)`, AssemblyScript sources (decorators
  don't parse), generated files, and sources a hash test checks against
  committed binaries.
- **The program-neutral reformat check.** Bundle each file with esbuild
  before and after the reformat and compare the output. 4 of 1,476
  game-engine files differ, each explainable. Every repo's reformat commit
  uses it as acceptance.
- **Determinism hazards** (game-engine): turning parameter properties into
  fields can change key order (`JSON.stringify`, `Object.keys`), so the new
  fields follow the existing ones in parameter order; deleting an "unused"
  `const x = rng.next()` shifts every later draw, so the call stays as a bare
  statement.
- **Tests that read production env.** Two just-a-bot tests import an env
  loader that reads the checkout's `.env`, which holds production values. A
  `Stop` hook or `check` that runs `npm test` there would read production
  secrets, so such a repo runs its tests in a copy without `.env*`
  (`test:clean`), and the harness says so.
- **Biome migration** (3D-sandbox). Leaving Biome loses `organizeImports`:
  `simple-import-sort` would reorder 105 files. Biome's `useButtonType`,
  `noDangerouslySetInnerHtml` and `noAutofocus` carry over as
  `no-restricted-syntax` selectors and `jsx-a11y`.
- **React compiler rules** in `react-hooks` 7.1.1 fire on "mirror state into
  a ref during render" (18 times in 3D-sandbox); the house has no rule for
  that yet.
- **`await-thenable`** flags awaits on Drizzle's synchronous better-sqlite3
  calls (58 in public-resource-map).
- **Astro** needs its own preset: `prettier-plugin-astro`,
  `eslint-plugin-astro` and `astro check`.
- **NestJS carve-out.** imbatranimOS's backend needs constructor parameter
  properties and `emitDecoratorMetadata`, so it is exempt from
  `erasableSyntaxOnly` and the parameter-property ban.
- **`eslint-plugin-better-tailwindcss`:** only its unknown-class,
  deprecated-class and class-order rules are on.
- **Checker roots** come from `conventions.json`, including a root that
  has `components/ui/` rather than `ui/` (rule 3 of brief 02 would otherwise
  pass for nothing).


## Files you OWN

- **The library's `house-style/` folder** (decision 1; a new repo until the
  owner's call of 2026-11-10). It holds:
  - `eslint.config.js`, exported as a function taking the repo's paths
    (`{ web: "web/src", server: "server/src", scripts: [...] }`);
  - `tsconfig.base.json`;
  - `prettier.config.js`;
  - `knip.json` and `.dependency-cruiser.cjs` presets;
  - `bin/` (the two checkers);
  - `CHANGELOG.md` and a README;
  - tests that run each rule against a passing and a failing fixture.
- **In this library:**
  - `skills/house-style/SKILL.md` (new): the style above as numbered rules,
    each with its why and its enforcing rule id, or "review";
  - its `references/review-checklist.md`;
  - one line in `plan-split-dispatch`'s review gate pointing at the
    checklist;
  - `README.md`, `docs/history.md`, both plugin files and `corpus/`
    (decisions for 1-4).
- **Briefs 02, 03 and 15**, still in `todo/`: their checkers ship from
  `house-style`, and brief 15 wires the package instead of copying files.
  Edit them when this brief is promoted, not before.

## Files you must NOT touch

- Any app repo. Adopting the harness is brief 15's per-repo run, with one
  reformat commit and one config commit per repo.
- The vendored skills.

## What to do

1. **Measure before choosing** (a day at most). On scratch copies of every
   lineage repo and the four outliers:
   - Prettier churn at 110, 120 and 130;
   - the error counts of each proposed typed rule, and lint time with
     `projectService` against `project`;
   - `tsc` error counts with `verbatimModuleSyntax`, with
     `erasableSyntaxOnly`, and with `exactOptionalPropertyTypes`;
   - `better-tailwindcss` findings on the four Tailwind repos.

   Write the numbers to `corpus/wiki/house-style.md`. Bring the owner any
   rule whose count suggests it is wrong for the house, rather than
   loosening it silently.
2. Build `house-style` with fixtures and tests, tag `house-style-v1.0.0`
   (2026-11-10: the tag names the folder, since it lives in this library), and
   keep `house-style/CHANGELOG.md`. A rule change is a minor version; turning a warning into
   an error is a minor version with a note.
3. Write the `house-style` skill: the measured style above, the rules, the
   review checklist, and how a repo adopts the harness:
   1. add the dependency;
   2. extend the configs;
   3. add the reformat commit and `.git-blame-ignore-revs`;
   4. add `npm run check`;
   5. add the `CLAUDE.md` line.
4. Run the adoption on one house repo first (wicket, the smallest) in its
   own session as the proof. Record the before and after `check` counts.
   Fix what the harness found, or file it.
5. Bump this library's minor version, and record decisions 1-4 in
   `decisions.md`.

## Acceptance

- `corpus/wiki/house-style.md` has the measurements: churn, rule counts,
  timings and `tsc` counts.
- `house-style` at `house-style-v1.0.0`:
  - each rule has a failing fixture that fails and a passing fixture that
    passes, under its own `npm test`;
  - `npx eslint` with its config on wicket reproduces the house's current
    clean state, plus only the new rules' findings.
- wicket runs `npm run check` green on the harness, with one reformat
  commit and its `.git-blame-ignore-revs` entry.
- The skill loads on "code style", "lint rules", "formatting", "house
  style", "set up the harness". The review gate links its checklist.
- `bash corpus/lint.sh` passes, and the version is bumped.

## Progress

- **2026-11-10, the library half (agent `house-style-27`).** Done: the
  `house-style` skill with 25 numbered rules (each with its rule id or
  "review"), `references/adoption.md` and `references/review-checklist.md`;
  the plugin's `hooks/hooks.json` (the formatter, the save note and the `Stop`
  check, with `node --test hooks/hooks.test.mjs`); the review-gate line in
  `plan-split-dispatch`; the measurements, collated from the repo briefs
  rather than re-measured, on [house-style.md](../../wiki/house-style.md)
  and [house-style-part-2.md](../../wiki/house-style-part-2.md), with four
  counts for the owner; decisions 1-3 in
  [decisions.md](../../wiki/decisions.md) (decision 4, the lint additions, is
  per rule and reversible with a minor version, so it isn't one); briefs 02,
  03 and 15 point at `house-style/bin/` and the next minor version; v0.36.0.
- **Left:** the `house-style/` folder itself (built in a separate checkout
  and moved in by the controller), step 2's tag `house-style-v1.0.0`, and
  step 4, Wicket's proof run (Wicket's brief 10). The owner updates the
  plugin to 0.36.0 to make the skill and hooks live.

