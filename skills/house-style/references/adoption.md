# Adopting the house-style harness

The steps of SKILL.md's "Adopting it", with the commands and the traps the
repo briefs of 2026-11-10 found. Each repo's own harness brief holds its
measured counts; read it first. Work on `main`, one commit per step, with the
typecheck, tests, lint and build green after each.

## 1. Measure

Measure on a scratch copy (`git clone --local`), never in the checkout.

- **Prettier churn** at 120: run `prettier --write` with the vendored config,
  then `git diff --shortstat`. Report the old lines changed and the files.
- **Rule counts:** `npx eslint -f json .` with the house config, counted per
  rule, split into source and tests.
- **tsc counts** for each new flag, one at a time. Delete every
  `*.tsbuildinfo` and `dist/` first: a stale build info hides the errors.
- **The threshold.** A rule with more than about 20 real findings, or mostly
  false ones, goes to the owner with its counts before it is turned on. Never
  loosen it quietly. The answers so far are on the library's
  [house-style.md](../../../corpus/wiki/house-style.md).

## 2. Vendor

- From the repo root: `npm run house-style:sync -- house-style-v1.1.0`. The
  script finds the `my-personal-skills` checkout by name (in the projects
  folder `$PROJECTS_DIR` names, directly or one group folder down) and copies
  its `house-style/` folder from git objects at that ref into the folder of
  the nearest `package.json` at or above where it runs (never above the git
  toplevel), replacing the copy wholesale and writing the header. An app in a
  subfolder of a multi-project repo runs it from its own folder and takes the
  copy there. The first time, `vendor/house-style/bin/sync.mjs` doesn't exist
  yet, so run the library checkout's `house-style/bin/sync.mjs
  house-style-v1.1.0` once from that folder.
- Add `"house-style:sync": "node vendor/house-style/bin/sync.mjs"`.
  `npm run house-style:sync -- --check` writes nothing and exits 1 when the
  copy no longer matches the commit in its header; `-- <ref> --check`
  compares with another ref. A usage error exits 2.
- Pin, exactly, the devDependencies the house-style README lists. Every sync
  and `--check` lists each pin that differs, in the target `package.json`, a
  workspace or (without workspaces) a first-level subfolder's `package.json`,
  without changing anything or the exit code. Repos without
  `save-exact=true` in `.npmrc` get it. At 1.1.0 the list (unchanged since
  1.0.0) is:

  | Package | Version |
  |---|---|
  | `@eslint/js` | `10.0.1` |
  | `@vitest/eslint-plugin` | `1.6.28` |
  | `dependency-cruiser` | `18.7.2` |
  | `eslint` | `10.9.1` |
  | `eslint-plugin-better-tailwindcss` | `4.10.0` |
  | `eslint-plugin-import-x` | `4.18.1` |
  | `eslint-plugin-n` | `18.5.0` |
  | `eslint-plugin-react-hooks` | `7.1.1` |
  | `knip` | `6.44.2` |
  | `prettier` | `3.9.10` |
  | `typescript` | `6.0.3` |
  | `typescript-eslint` | `8.72.2` |

  The ESLint config imports every plugin, so a repo without React or Tailwind
  pins them too, and dependency-cruiser, which `check:conventions` runs.
- **Node.** The tools want `^22.13.0 || ^24.0.0 || >=26.0.0`: ESLint 10 skips
  Node 23 and dependency-cruiser 18 skips 25. The sync alone runs on 22.6.
- **TypeScript first.** `erasableSyntaxOnly` needs TypeScript 5.8, and
  `@vitest/eslint-plugin` 1.6.28 wants TypeScript 6 as an optional peer, so
  npm refuses it on 5.x. Bump to the house's TypeScript before anything else.
  TypeScript 6 stops auto-including `@types/*`: a package that uses Node
  globals needs `"types": ["node"]`.
- **The Docker image.** The copy needs no git in the build. But a Dockerfile
  that copies only some files before `tsc` must also copy
  `vendor/house-style/tsconfig.base.json` once the repo's base extends it
  (one more `COPY` line), or keep the flags in the repo's own base. A repo
  keeps its own base file, not `extends`, in two cases: its Dockerfile copies
  only that file (extending the vendored one breaks the image build), or it
  can't take `noUncheckedIndexedAccess` yet, which the house base turns on.
- **Two projects in one repo** (an `api/` and a `web/`, one copy). The tool
  pins go in the `package.json` of the folder that holds
  `vendor/house-style/`, because the vendored ESLint config resolves its
  plugins from where it sits. A project inside that folder with its own
  `package.json` needs knip's `ignoreBinaries` (`eslint`, `prettier`, `knip`)
  for the tools that come from the parent. The sync scans subfolder
  `package.json` files for pin drift, so a stale pin there is listed too.
- A Docusaurus workspace stays out of the harness: it breaks the exact-pin
  rule (`^` ranges, `~` TypeScript) and has its own build.

## 3. Prettier

- `prettier.config.js` (or `.mjs` in a repo that isn't `"type": "module"`):

  ```js
  import config from "./vendor/house-style/prettier.config.js";
  export default config;
  ```

- `.prettierignore`: `*.md`, `vendor/house-style/` and other vendored copies,
  lockfiles, `dist/`, `coverage/`, generated files, frozen test fixtures,
  generated meta JSON, any stylesheet still in `layer(legacy)`, AssemblyScript
  sources (Prettier can't parse their decorators), sources a hash test checks
  against committed binaries, and Docusaurus workspaces. Anchor root folders
  (`/data/`, `/uploads/`, `/output/`): an unanchored `uploads/` also hides
  `src/uploads/`.
- Prettier may be undeclared, present only as a hoisted transitive dependency
  behind a `format` script. Declare it and pin it.
- `format` is `prettier --write .`, `format:check` is `prettier --check .`.
  Commit the config and the scripts alone.

## 4. The reformat

- `npm run format`, committed alone as `style: format with Prettier`. Run
  `format` until `format:check` passes: Prettier 3.9.10 sometimes needs a
  second pass on a file.
- Prettier churns code already in house style: it lowercases hex literals and
  drops trailing zeros (`0xA11CE0` to `0xa11ce0`, `0.40` to `0.4`), and
  rewraps hand-wrapped lines. Two thirds of game-engine's files change though
  it already used double quotes and semicolons.
- The outliers move to double quotes and semicolons in this same commit:
  Newspapper, ro-housing, sports-app, imbatranim-apps, just-a-bot, Churchix,
  the todo app and imbatranimOS's web packages.
- **Acceptance: the bundle compare.** Bundle every file with esbuild before
  and after the reformat and compare the output; Vite repos already have
  esbuild. CSS goes through esbuild's `css` loader and JSON is compared
  parsed. `git diff -w` is no substitute: rewrapped lines show up under it.
  List every difference with its reason (4 of 1,476 in game-engine: two
  generated glyph files, a docs component and a test). The expected one is JSX
  text that Prettier splits with `{" "}`, which renders the same.

  ```js
  // node minify-all.mjs <out-dir>, before and after; then diff -r the two
  import { transformSync } from "esbuild";
  import { execFileSync } from "node:child_process";
  import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
  import { dirname, join } from "node:path";
  const files = execFileSync("git", ["ls-files", "*.ts", "*.tsx", "*.js", "*.jsx", "*.mjs"], { encoding: "utf8" });
  for (const file of files.split("\n").filter(Boolean)) {
    const loader = /\.tsx$/.test(file) ? "tsx" : /\.ts$/.test(file) ? "ts" : "jsx";
    const out = join(process.argv[2], file);
    mkdirSync(dirname(out), { recursive: true });
    try { writeFileSync(out, transformSync(readFileSync(file, "utf8"), { loader, minify: true }).code); }
    catch (e) { writeFileSync(out, `unparseable: ${e.message}`); }
  }
  ```

- Put the commit's full hash in `.git-blame-ignore-revs`, in its own commit.
  `git config blame.ignoreRevsFile .git-blame-ignore-revs` is an owner step.

## 5. tsconfig

- The repo's base extends the copy: `"extends": "./vendor/house-style/tsconfig.base.json"`,
  and every package extends the repo's base. An orphan base nothing extends
  (imbatranimOS has one, beside four unrelated bases) is merged into one.
- **Parameter properties become declared fields**, assigned in the
  constructor, keeping `readonly` and `private` (Satchel 10, game-engine 168).
  Where key order can matter (`JSON.stringify`, `Object.keys`), the new
  fields follow the existing initialised ones, in parameter order.
- **Don't delete a call with a side effect.** An "unused"
  `const x = rng.next()` shifts every later random draw: keep the call as a
  bare statement.
- Node's type stripping and tsx need the real `.ts` suffix, so a repo whose
  relative imports carry `.ts` (sports-app, imbatranim-apps, just-a-bot,
  ro-housing) keeps them, with `allowImportingTsExtensions` and a comment
  saying why.
- A missing `strict` is added (comercial-website's frontend: 0 errors).
- Where `noUncheckedIndexedAccess` is off, it stays off with a dated comment
  saying what turns it on later and where its count is recorded. With it off,
  `no-unnecessary-type-assertion` flags every `!` on an indexed read (608 in
  atrium), and its autofix strips them, so the brief that turns the flag on
  would have to put them back. So the repo turns
  `@typescript-eslint/no-unnecessary-type-assertion` off in its own block,
  with a dated comment, until the flag lands.
- `exactOptionalPropertyTypes` is not added. Count it for the later brief.
- **NestJS carve-out.** imbatranimOS's backend needs parameter properties and
  `emitDecoratorMetadata`, so it turns `erasableSyntaxOnly` off and is exempt
  from the parameter-property rule.
- `e2e/` usually sits outside every tsconfig, so typed lint can't parse it:
  give it a tsconfig, or list it in `houseStyle()`'s `untyped`. Tool configs
  (`playwright.config.ts`, `vitest.config.ts`) and JavaScript files need
  nothing: the house config lints them without type information.

## 6. ESLint

```js
import { houseStyle } from "./vendor/house-style/eslint.config.js";

export default houseStyle({
  root: import.meta.dirname,
  web: "web/src",
  server: "server/src",
  scripts: ["scripts"],
  tests: ["**/*.test.ts", "**/*.test.tsx"],
  defaultExports: ["web/src/routes/**"],
  console: ["server/src/seed.ts"],
  env: ["server/src/config/env.ts"],
  assertFunctionNames: ["expect", "expectTypeOf", "expectError"],
  tailwind: { css: "web/src/index.css", order: false },
});
```

The import is the named `houseStyle`. The copy's default export is a config
that ignores everything: ESLint 10 loads the nearest `eslint.config.js` for
each file it lints, and for the copy's own files that is the vendored one, so
a function there would crash ESLint on them.

Every key is optional; a repo without `web` gets no React or Tailwind rules.
An unknown key is an error, so a typo can't switch a rule off. Folders are
paths from the repo root; the rest are globs.

| Option | Default | What it does |
|---|---|---|
| `root` | the working directory | The repo root, for typed lint and the Tailwind entry |
| `web` | none | React folders: the hooks rules, and the Tailwind rules when `tailwind` is set |
| `server` | none | Node folders; no rule is scoped to them yet |
| `scripts` | `["scripts"]` | Script folders, where `console` and `process.env` are allowed |
| `tests` | `**/*.test.*`, `**/*.spec.*` | The vitest rules, `!` as a warning, `process.env` allowed. The default reaches Playwright specs: pass `tests` without the e2e folder, or turn the vitest rules off for it in the repo's own block |
| `defaultExports` | none | Where a framework or a runtime contract reads `default`, beyond `*.config.*` and `*.d.ts` |
| `console` | none | App files allowed to print (a CLI entry, a module that logs before the logger exists); their env reads are still errors |
| `env` | `["**/config.ts"]` | Where `n/no-process-env` is off: the repo's env reader |
| `assertFunctionNames` | `["expect", "expectTypeOf"]` | What `vitest/expect-expect` counts as an assertion; a repo adds its helpers |
| `tailwind` | none | `{ css, order }`: the CSS entry, and the class order once the repo has migrated |
| `vitest` | `true` | `false` for a repo on `node:test` (atrium) |
| `typed` | `projectService` | `{ allowDefaultProject }`, or `{ project }` for a tsconfig `projectService` can't find |
| `untyped` | none | TypeScript globs no tsconfig covers, linted without types |
| `ignores` | vendor, dist, coverage | More folders ESLint skips |

Repo-specific rules go after the house config (Postern's
`no-restricted-imports` for its `jmap` boundary), and so does a rule a repo
starts as a warning, with a dated comment that says what turns it back (never
a brief number), for example `// A warning for now (2026-11-11): these files
still read the environment themselves. When the server takes its settings from
config.ts, this goes.`

Three options, three exemptions:

- `scripts` is for folders of scripts run by hand (docs capture helpers, say):
  they print and read the environment.
- `console` is for app files allowed to print: a CLI entry, or a module that
  logs before the logger exists. Their env reads are still errors.
- `env` moves the env exemption to the repo's reader: a repo whose reader is
  `config/env.ts` passes `env: ["server/src/config/env.ts"]` instead of
  writing its own block. `check-structure`'s rule 3 counts `process.env`
  reads even where ESLint lowers them, so a harness brief that lowers one
  states both.

Typed lint goes through `projectService`, the default, and the one that works
with a Vite solution `tsconfig.json` (`files: []` plus references):
`project: true` fails there. List tsconfigs under `typed.project` only when
tests sit in a tsconfig `projectService` can't find (`tsconfig.tests.json`);
Astro needs `project: true` too.

Traps the repo briefs hit:

- A repo's own `no-restricted-syntax` block **replaces** the house's for the
  files it matches (sports-app). Spread the copy's exported `restrictedSyntax`
  (the `TSEnumDeclaration` selector) into it first.
- `no-warning-comments` needs `location: "start"`, or the word "todo" in prose
  is a finding (17 in game-engine, where a todo is a spec; the Todo app's name
  in imbatranimOS).
- `vitest/valid-expect` needs `maxArgs: 2` for `expect(value, "why")`.
  Helpers that assert (`expectError`, `expectUnauthorized`, `expectPoint`) go
  in the `assertFunctionNames` option, which keeps `expect` and `expectTypeOf`
  in its default.
- `vitest/no-disabled-tests` warns on `skipIf`-style guards, and that is
  expected. `vitest/valid-title` flags a variable title; a template literal
  clears it.
- `vitest/no-conditional-expect` is off: the house asserts on a thrown error
  inside its `catch` (game-engine 90, Newspapper 13 of 14, ward-auth 10).
- `n/no-process-env` is off in tests, tool configs (`*.config.*`), the
  `scripts` folders and the `env` files (`**/config.ts` by default). App code
  reads the environment only there, and that includes the `console` globs:
  they list files allowed to print (Wicket's `server/src/index.ts` logs before
  its logger exists), which says nothing about reading the environment.
- `consistent-type-imports` needs `disallowTypeAnnotations: false` for
  `typeof import("./X")` lazy-chunk types. Beside it,
  `no-import-type-side-effects` is on: with `verbatimModuleSyntax`,
  `import { type X } from "./a.js"` still emits `import {} from "./a.js"`.
  `eslint --fix` writes `import type { X }`.
- `no-floating-promises` names `node:test`'s `describe`, `it` and `test` in
  `allowForKnownSafeCalls` (814 findings in atrium otherwise).
- `switch-exhaustiveness-check` with `considerDefaultExhaustiveForUnions`
  clears switches on an open union with a deliberate `default` (Wicket 4,
  Satchel 4, Shelfmark 7).
- `await-thenable` flags awaits on Drizzle's synchronous better-sqlite3 calls
  (58 in public-resource-map). They are real: delete the `await`.
- `react-hooks` 7.1.1's compiler rules fire on "mirror state into a ref during
  render" (18 in 3D-sandbox). Fixing them changes behaviour: list them with a
  test first. Its recommended set includes `refs`, `set-state-in-effect` and
  `immutability`, and lowering them means naming each.
- `better-tailwindcss`: only `no-unknown-classes`, `no-deprecated-classes`
  and, with `tailwind.order`, `enforce-consistent-class-order` are on (412
  logical-property and 194 line-wrapping findings were noise). Class order
  stays off until the repo's Tailwind migration.
- Tailwind 4 scans every committed file for class names, `vendor/` included:
  the stylesheet adds `@source not "<path to>/vendor";`.
- Leaving Biome (3D-sandbox) loses `organizeImports`: adding
  `simple-import-sort` would reorder 105 files, so it is a separate question.
  `noDangerouslySetInnerHtml` carries over as a `no-restricted-syntax`
  selector. `eslint-plugin-jsx-a11y` 6.10.2 doesn't support ESLint 10, so
  Biome's a11y rules can't carry over as plugin rules yet. Until it does, a
  repo spreads the exported `restrictedSyntax` and adds selectors for the two
  that mattered:

  ```js
  { selector: "JSXAttribute[name.name='autoFocus']", message: "Don't set autoFocus: it moves focus without the user asking." },
  {
    selector: "JSXOpeningElement[name.name='button']:not(:has(JSXAttribute[name.name='type']))",
    message: 'Give every <button> a type: "button", "submit" or "reset".',
  },
  ```
- Astro has no preset: it needs `prettier-plugin-astro`,
  `eslint-plugin-astro`, `astro check`, and `project: true`
  (`astro-eslint-parser` has no `projectService`).

## 7. The gate

```json
"check": "npm run typecheck && npm run lint && npm run format:check && npm run check:conventions && npm test",
"check:fast": "npm run typecheck && node scripts/check-fast.mjs",
"check:conventions": "knip && depcruise server/src web/src shared/src && node vendor/house-style/bin/check-base-ui.mjs --warn-only && node vendor/house-style/bin/check-structure.mjs --warn-only"
```

`check:conventions` runs four tools, each failing on its own errors: knip,
dependency-cruiser on the repo's source folders, and the two checkers that ship
in house-style. A repo without a web app or a server still runs both
checkers; they say there is nothing to check.

- **knip** has no `extends`, so `knip.config.js` spreads the preset and adds
  the repo's entries:

  ```js
  import preset from "./vendor/house-style/knip.json" with { type: "json" };

  export default { ...preset, entry: ["scripts/*.{js,mjs,ts}"] };
  ```

  In a repo with npm workspaces, the repo's own entries go under
  `workspaces: { ".": { entry: ["scripts/*.{js,mjs,ts}"] } }`: a top-level
  `entry` gives knip 6.44.2 a configuration hint there. A package folder that
  isn't a workspace (a docs site with its own lockfile) goes in `ignore`. The
  preset can't carry the `scripts/` entry itself (knip drops a preset's
  top-level `entry` once `workspaces` is set), so every repo lists it, or
  `scripts/check-fast.mjs` is reported as unused.

  In a root without `"type": "module"`, knip reads `knip.config.js`, not
  `.mjs`, while the ESLint and Prettier configs can be `.mjs`. Per-workspace
  `ignoreDependencies` covers a dependency declared before it is used, or one
  a group build resolves from its own folder. After a knip cleanup, run `tsc`:
  `noUnusedLocals` catches the types knip's removals left unused.

  The preset ignores `vendor/`, fails on unused files and dependencies, and
  warns on unused exports and types. knip follows the root ESLint config into
  the copy, so the plugins count as used.
- **dependency-cruiser** runs from the harness on. The preset forbids cycles,
  unresolvable imports, a feature reached past its `index`, and Fastify in
  `lib/`. `.js` suffixes on `.ts` files resolve without help; a repo whose
  tsconfig has `paths` aliases also names it, with
  `options: { tsConfig: { fileName: "tsconfig.json" } }`:

  ```js
  module.exports = { extends: "./vendor/house-style/.dependency-cruiser.cjs" };
  ```

  A rule that fails before the repo's server brief is lowered to a warning by
  its name, with a dated comment that says what raises it again (never a brief
  number), the way ESLint's `n/no-process-env` is: `forbidden: [{ name:
  "no-circular", severity: "warn" }]`. Warnings don't fail the run. A repo's
  own `forbidden` entry with the same `name` merges with the preset's rule, so
  it can also give the rule a `pathNot`: `forbidden: [{ name: "no-circular",
  to: { circular: true, pathNot: "^src/legacy/" } }]`. The preset lets
  `not-to-unresolvable` pass `virtual:` ids (Vite virtual modules), so a repo
  needs no override for them. `check-structure`'s rule 3 counts `process.env`
  reads even where ESLint lowers `n/no-process-env`, so a harness brief states
  both.
  A route file that imports a type from `app.ts` (`import type {
  FeatureContext } from "../app.js"`, Almanac's shape today) is a `no-circular`
  error under the preset. The fix belongs to the repo's server brief, which
  gives each feature its own options type (the code-structure skill's
  `references/migrating-a-server.md`, step 3). Until that brief, the harness
  brief lowers `no-circular` to `warn` by name in the repo's
  `.dependency-cruiser.cjs`, with a dated comment saying what removes it.
- **The checkers** read the repo's roots from `conventions.json`. The repo
  briefs put it in `scripts/` (the root and `tools/` work too, one of the
  three), and its paths are from the repo root wherever it sits. A repo's first
  one names its source folders and nothing else; exceptions come with the
  briefs that decide them, each with its reason:

  ```json
  {
    "$schema": "../vendor/house-style/conventions.schema.json",
    "web": ["web/src"],
    "server": ["server/src"],
    "shared": ["shared/src"]
  }
  ```

  Roots are source folders, as in `eslint.config.js`: `apps/web/src`, not
  `apps/web`. A root may use `*` within a folder name (`apps/*/src`), and `[]`
  means none. A web root's stylesheet is `styles/index.css` unless
  `"stylesheet"` names the one it keeps (`"styles.css"`), and Base UI may be
  imported under `**/components/ui` and `**/features/*/ui` unless `"ui"` says
  otherwise. The house-style README has the format, the exceptions and the
  rules each checker reports.
- **`--warn-only`** stays on a checker until the repo brief that fixes its
  findings drops it: `check-base-ui`'s with the repo's Base UI or Tailwind
  brief, `check-structure`'s with its server brief. A checker that already
  reports nothing runs strict from the start (ro-housing's `check-base-ui`,
  with its `"stylesheet": "styles.css"`). A
  malformed `conventions.json` fails the run even with `--warn-only`.

`scripts/check-fast.mjs` lints the files changed against `HEAD` and the
untracked ones, and nothing else. `git diff --name-only --relative HEAD` makes
a project in a subfolder see its own paths, and `git ls-files --others
--exclude-standard` is already relative:

```js
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
const files = [...new Set([...git("diff", "--name-only", "--relative", "HEAD"), ...git("ls-files", "--others", "--exclude-standard")])]
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file) && existsSync(file));
if (files.length === 0) process.exit(0);
const run = spawnSync("npx", ["eslint", "--no-warn-ignored", ...files], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(run.status ?? 1);
```

- After a sync the changed files include `vendor/house-style/`. ESLint skips
  them, because the house config ignores `vendor/` and the copy's own
  `eslint.config.js` ignores everything, and `--no-warn-ignored` keeps that
  quiet. So the script needs no filter of its own.
- `tsc -b` is incremental. A web project typechecked with `tsc -p web --noEmit`
  gets `incremental` and a `tsBuildInfoFile` under `node_modules/.tmp/`.
- `check:fast` never runs tests; the Stop hook refuses one that does.
- **`--workspaces --if-present` can check nothing.** just-a-bot's root
  `typecheck` checked only its docs site, because the bot's workspaces had no
  `typecheck` script. Every workspace gets the script.
- **`pretest`.** Where tests import a built sibling (`shared/dist`), a fresh
  clone fails the suite: brief-board, lantern, Satchel, Shelfmark,
  SocialEvents and comercial-website did. Add `"pretest": "tsc -b shared"`.
- **`test:clean`.** just-a-bot's tests import an env loader that reads the
  checkout's `.env`, which holds production values. Such a repo runs its tests
  in a temporary copy without `.env*`, and `check` calls `test:clean`, never
  `npm test`.
- A gate that passes with integration tests skipped (Postern without its mail
  server) says so in the root `CLAUDE.md`.
- Record `check:fast` warm with one changed file, and `check` in full.

## 8. The Claude Code layer

- **Root `CLAUDE.md`**, under about 60 lines: one line on what the repo is;
  "read `corpus/index.md` first"; the commands (`npm run check` before every
  hand-back, `npm run check:fast`, one test file, dev); the places that
  mislead (ports, where `.env` lives, a two-run typecheck, a separate docs
  package); the hard rules that apply outside the corpus, moved out of
  `corpus/CLAUDE.md`.
- **`.claude/rules/web.md` and `server.md`**, under about 40 lines each:

  ```markdown
  ---
  paths:
    - "web/src/**"
  ---
  ```

  They carry the base-ui and code-structure rules where they apply. Briefs
  that change an area rewrite its lines.
- A `.gitignore` with `.claude` or `.claude/*` (ro-housing, game-engine,
  Churchix) needs `!.claude/rules/`, or the rules stay untracked.
- Two npm projects and no root `package.json` (ro-housing's `api/` and `web/`,
  the todo app in a multi-project repo): each project keeps its own
  `check:fast`. The Stop hook finds it from the folders of the files the
  session saved, so no scripts-only root `package.json` is needed for it.
