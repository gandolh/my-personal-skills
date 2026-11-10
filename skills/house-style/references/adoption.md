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

- From the repo root: `npm run house-style:sync -- house-style-v1.0.0`. The
  script finds the `my-personal-skills` checkout by name (in the projects
  folder `$PROJECTS_DIR` names, directly or one group folder down) and copies its `house-style/` folder from git objects at that ref. The
  first time, `vendor/house-style/bin/sync.mjs` doesn't exist yet, so run the
  library checkout's `house-style/bin/sync.mjs` once from the repo root.
- Add `"house-style:sync": "node vendor/house-style/bin/sync.mjs"`.
  `npm run house-style:sync -- --check` exits 1 when the copy no longer
  matches the commit in its header.
- Pin, exactly, the devDependencies the house-style README lists. Repos
  without `save-exact=true` in `.npmrc` get it.
- **TypeScript first.** `erasableSyntaxOnly` needs TypeScript 5.8, and
  `@vitest/eslint-plugin` 1.6.28 wants TypeScript 6 as an optional peer, so
  npm refuses it on 5.x. Bump to the house's TypeScript before anything else.
  TypeScript 6 stops auto-including `@types/*`: a package that uses Node
  globals needs `"types": ["node"]`.
- **The Docker image.** The copy needs no git in the build. But a Dockerfile
  that copies only some files before `tsc` must also copy
  `vendor/house-style/tsconfig.base.json` once the repo's base extends it
  (one more `COPY` line), or keep the flags in the repo's own base.
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
  against committed binaries, and Docusaurus workspaces.
- Prettier may be undeclared, present only as a hoisted transitive dependency
  behind a `format` script. Declare it and pin it.
- `format` is `prettier --write .`, `format:check` is `prettier --check .`.
  Commit the config and the scripts alone.

## 4. The reformat

- `npm run format`, committed alone as `style: format with Prettier`.
- Prettier churns code already in house style: it lowercases hex literals and
  drops trailing zeros (`0xA11CE0` to `0xa11ce0`, `0.40` to `0.4`), and
  rewraps hand-wrapped lines. Two thirds of game-engine's files change though
  it already used double quotes and semicolons.
- The outliers move to double quotes and semicolons in this same commit:
  Newspapper, ro-housing, sports-app, imbatranim-apps, just-a-bot, Churchix,
  the todo app and imbatranimOS's web packages.
- **Acceptance: the bundle compare.** Minify every source file with esbuild
  before and after the reformat and compare the output; Vite repos already
  have esbuild. List each file that differs with its reason (4 of 1,476 in
  game-engine: two generated glyph files, a docs component and a test).

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
  naming the later brief, which records its count. With it off,
  `no-unnecessary-type-assertion` flags most `!` (608 in atrium).
- `exactOptionalPropertyTypes` is not added. Count it for the later brief.
- **NestJS carve-out.** imbatranimOS's backend needs parameter properties and
  `emitDecoratorMetadata`, so it turns `erasableSyntaxOnly` off and is exempt
  from the parameter-property rule.
- `e2e/` and `playwright.config.ts` usually sit outside every tsconfig, so
  typed lint can't parse them: give them a tsconfig, or list them in
  `allowDefaultProject`.

## 6. ESLint

```js
import houseStyle from "./vendor/house-style/eslint.config.js";

export default houseStyle({
  web: "web/src",
  server: "server/src",
  scripts: ["scripts"],
  tests: ["**/*.test.ts", "**/*.test.tsx"],
  defaultExports: ["web/src/routes/**"],
  console: ["server/src/seed.ts"],
  tailwind: { css: "web/src/index.css", order: false },
});
```

Every key is optional; a repo without `web` gets no React or Tailwind rules.
Repo-specific rules go after the house config (Postern's
`no-restricted-imports` for its `jmap` boundary). Typed lint goes through
`projectService`; fall back to `project: true` only for Astro or where it
measures faster.

Traps the repo briefs hit:

- A repo's own `no-restricted-syntax` block **replaces** the house's for the
  files it matches (sports-app). Repeat the `TSEnumDeclaration` selector in it.
- `no-warning-comments` needs `location: "start"`, or the word "todo" in prose
  is a finding (17 in game-engine, where a todo is a spec; the Todo app's name
  in imbatranimOS).
- `vitest/valid-expect` needs `maxArgs: 2` for `expect(value, "why")`.
  Helpers that assert (`expectError`) go in `expect-expect`'s
  `assertFunctionNames`.
- `consistent-type-imports` needs `disallowTypeAnnotations: false` for
  `typeof import("./X")` lazy-chunk types.
- `no-floating-promises` names `node:test`'s `describe`, `it` and `test` in
  `allowForKnownSafeCalls` (814 findings in atrium otherwise).
- `switch-exhaustiveness-check` with `considerDefaultExhaustiveForUnions`
  clears switches on an open union with a deliberate `default` (Wicket 4,
  Satchel 4, Shelfmark 7).
- `await-thenable` flags awaits on Drizzle's synchronous better-sqlite3 calls
  (58 in public-resource-map). They are real: delete the `await`.
- `react-hooks` 7.1.1's compiler rules fire on "mirror state into a ref during
  render" (18 in 3D-sandbox). Fixing them changes behaviour: list them with a
  test first.
- `better-tailwindcss`: only unknown classes, deprecated classes and class
  order are on (412 logical-property and 194 line-wrapping findings were
  noise). Class order stays off until the repo's Tailwind migration.
- Leaving Biome (3D-sandbox) loses `organizeImports`: adding
  `simple-import-sort` would reorder 105 files, so it is a separate question.
  `useButtonType` and `noDangerouslySetInnerHtml` carry over as
  `no-restricted-syntax` selectors and `jsx-a11y`.
- Astro has no preset in 1.0.0: it needs `prettier-plugin-astro`,
  `eslint-plugin-astro`, `astro check`, and `project: true`
  (`astro-eslint-parser` has no `projectService`).

## 7. The gate

```json
"check": "npm run typecheck && npm run lint && npm run format:check && npm run check:conventions && npm test",
"check:fast": "tsc -b && node scripts/check-fast.mjs",
"check:conventions": "knip && node vendor/house-style/bin/check-base-ui.mjs --warn-only && node vendor/house-style/bin/check-structure.mjs --warn-only"
```

`scripts/check-fast.mjs` lints the files changed against `HEAD` and the
untracked ones, and nothing else:

```js
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
const files = [...new Set([...git("diff", "--name-only", "HEAD"), ...git("ls-files", "--others", "--exclude-standard")])]
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file) && existsSync(file));
if (files.length === 0) process.exit(0);
const run = spawnSync("npx", ["eslint", "--no-warn-ignored", ...files], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(run.status ?? 1);
```

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
  the todo app): add a scripts-only root `package.json`, so the Stop hook
  finds `check:fast`.
