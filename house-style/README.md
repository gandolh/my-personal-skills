# house-style

The shared lint, format and type-check configs of the house repos: one ESLint
config, one Prettier config, one TypeScript base, and knip and
dependency-cruiser presets. Each repo holds a copy in `vendor/house-style/`,
refreshed by a sync script, so a rule changes here once and every repo moves
by syncing a newer tag.

It is a folder of the `my-personal-skills` repository, the way Ward's library
is a folder of the ward-auth repository. The `house-style` skill in the same
repository is the long guide to adopting it; this page is the short one.

## What ships

The copy holds what `files` in [package.json](package.json) lists, plus that
`package.json` (it carries the version and `"type": "module"`, so the configs
load as ES modules whatever the repo's own type is). Tests and fixtures stay
here.

| File | What it is |
|---|---|
| `eslint.config.js` | `houseStyle(options)`: the ESLint flat config, as a function of the repo's folders |
| `prettier.config.js` | Prettier's defaults (double quotes, semicolons) at width 120, with trailing commas |
| `tsconfig.base.json` | The compiler flags every package extends |
| `knip.json` | Unused files and dependencies are errors; unused exports and types are warnings |
| `.dependency-cruiser.cjs` | No cycles, no unresolvable imports, a feature used through its index only (from another feature or from `app.ts`), no `domain/` module importing a feature, no Fastify in `lib/` |
| `bin/check-base-ui.mjs` | The Base UI and Tailwind checker, rules numbered as the `base-ui` skill's |
| `bin/check-structure.mjs` | The code-structure checker, rules numbered as the `code-structure` skill's |
| `bin/conventions.mjs` | What the two checkers share: reading `conventions.json`, walking the roots, the report |
| `conventions.schema.json` | The JSON Schema of `conventions.json`, for editors |
| `bin/sync.mjs` | The sync, run as `npm run house-style:sync` |
| `CHANGELOG.md` | The upgrade notes |
| `LICENSE` | MIT |

In the copy, `README.md` is a generated header in place of this page.

## Names and paths

- **The checkout:** the sync finds the `my-personal-skills` checkout by name,
  in the folder `$PROJECTS_DIR` names (`bin/sync.mjs` has the default),
  directly or one group folder down. Two checkouts with that name are an error.
- **The copy:** `vendor/house-style/` in each repo. It is generated: ESLint,
  Prettier and knip ignore it, and nobody edits it by hand.
- **The header:** `vendor/house-style/README.md`, with the version, the source
  commit, and where the upgrade notes are.
- **The tags:** `house-style-v<version>`, such as `house-style-v1.0.0`.
- **The sync:** `npm run house-style:sync -- <ref> [--check]`, with the npm
  script `"house-style:sync": "node vendor/house-style/bin/sync.mjs"`.
- **The checkers:** `bin/check-base-ui.mjs` and `bin/check-structure.mjs`,
  run as `node vendor/house-style/bin/<name>.mjs` from `check:conventions`,
  with the repo's roots and exceptions in its `conventions.json`.

## The sync

```sh
npm run house-style:sync -- house-style-v1.0.0          # copy that tag
npm run house-style:sync -- house-style-v1.0.0 --check  # compare only
npm run house-style:sync -- --check                     # compare with the header's commit
```

- It copies into the folder of the nearest `package.json` at or above the
  working directory, without going above the git toplevel. For a repo whose
  `package.json` is at its root, that is the repo root, wherever in the repo
  the sync starts. For an app in a subfolder of a multi-project repo, running
  it from that folder takes the copy there, with no `GIT_CEILING_DIRECTORIES`
  wrapper. Outside git it is the nearest `package.json` at any height.
- `<ref>` is a tag or a commit. The sync reads the `house-style/` folder at
  that commit from git objects, never the checkout's working tree, so the copy
  is exactly what the commit holds, whatever is checked out or uncommitted.
- It replaces the copy wholesale (a file the commit dropped disappears), writes
  the header, and reads every file back by its git hash.
- When `<ref>`'s own `bin/sync.mjs` differs from the one running, it hands over
  to that one, so each version writes its own copy and header.
- `--check` writes nothing. It exits 1 and lists each difference when the copy
  is not the commit byte for byte, and 0 when it is.
- It also lists, without changing anything or the exit code, every pin that
  differs from the table below, in the target folder's `package.json`, each
  workspace, and (without workspaces) each first-level subfolder's
  `package.json`, so a project in a subfolder shows its pin drift too.
- What it can't see: a hand-kept base tsconfig (the Docker and Bundler cases
  below), so `--check` doesn't notice a base-flag change, and the CHANGELOG
  names every one. It reports a `^` range in a workspace's `package.json` but
  can't fix it, so the adopter edits that by hand. It reports a missing
  `save-exact=true` in `.npmrc` and doesn't write it.
- Plain Node (22.6 or later) and git; no dependencies.

The first time, the copy doesn't exist yet: run the library checkout's
`house-style/bin/sync.mjs <ref>` once from inside the repo (or the app folder),
then add the npm script. It refuses to run inside the library checkout itself.

A repo with two projects in subfolders (an `api/` and a `web/`) that wants one
copy keeps the copy and the tool pins in the folder that holds
`vendor/house-style/`, because the vendored ESLint config resolves its plugins
from where it sits. A project inside that folder with its own `package.json`
needs knip's `ignoreBinaries` (`eslint`, `prettier`, `knip`) for the tools that
come from the parent.

## The checkers

Two zero-dependency Node scripts check what a linter can't: where code lives and
what it imports. Each reads the repo's `conventions.json`, walks its roots, and
prints one line per finding, numbered as the skill that holds the rule numbers
it:

```
web/src/ConfirmAction.tsx:1 rule-3 error: imports @base-ui/react/alert-dialog outside a ui folder (**/components/ui, **/features/*/ui): use or add the wrapper there
```

```sh
node vendor/house-style/bin/check-base-ui.mjs [--warn-only] [--version 1.9.0] [repo-root]
node vendor/house-style/bin/check-structure.mjs [--warn-only] [repo-root]
```

- Exit 0 when no error is left, 1 when one is, and 2 when it can't check: a bad
  flag, or a malformed `conventions.json` (with `--warn-only` too).
- Warnings never fail the run. `--warn-only` shows every error as a warning, so
  a repo runs a checker from its harness brief on and drops the flag once its
  Base UI or server brief is done.
- `repo-root` defaults to the working directory. It is the repo's root, never a
  source folder: `check-structure.mjs jmap/src` treats `jmap/src` as the repo
  and checks nothing.
- A default root that doesn't exist is skipped (a root the file names that
  matches nothing is an error), so a repo with no server runs the checkers as
  they are. A Node app with no HTTP server (a gateway bot, a
  protocol library) lists its folders under `shared`, where rules 3 and 11
  apply (rules 1, 2 and 6 are for `server` roots). Postern, a webmail client
  with a protocol library and no server, adds `"shared": ["jmap/src"]` to its
  `conventions.json` and `&& node vendor/house-style/bin/check-structure.mjs`
  to `check:conventions`. There is no `node` root kind.

| Checker | Rule | What it reports |
|---|---|---|
| `check-base-ui` | 1 | `@base-ui/react` not pinned exactly to `--version` (default 1.9.0), in each `package.json` from a web root up to the repo root |
| | 2 | An import from the `@base-ui/react` root instead of a part's subpath |
| | 3 | A Base UI import outside the `ui` folders (tests excepted) |
| | 5 | A stylesheet other than the one, a CSS module, and the one without `@import "tailwindcss"`. When the repo's one stylesheet is somewhere other than `styles/index.css`, the message names the `"stylesheet"` key in `conventions.json` as the way to declare it |
| | 6 | An arbitrary colour in a class name: `bg-[#…]`, `text-[rgb(…)]`, `border-[hsl(…)]`, … |
| | 9 | A `<X.Trigger>` whose first child is a component (not one of X's own parts, such as `<Select.Value>`, and not an icon: a name imported from `lucide-react`, `react-icons`, `@phosphor-icons/react`, `@heroicons/react`, `@tabler/icons-react` or `@radix-ui/react-icons`, or one named `Icon` or `…Icon`) and has no `render`, or whose `render` wraps its content in a `span` or `div` (a warning) |
| | 10 | A `<Select.Root>` without `items` (a warning) |
| | 11 | `window.confirm`, `alert` or `prompt`, or the bare call |
| `check-structure` | 1 | `listen(` in a server root outside `server.ts` (tests excepted) |
| | 2 | A server root whose `app.ts` exports no `buildApp`, or that has no `app.ts` |
| | 3 | `process.env` outside the env reader (the `config.ts` at the top of each server or shared root, or the files `"env"` names in `conventions.json`), and any read of `NODE_ENV` (the name in code, or a string that is the name alone, `process.env["NODE_ENV"]`), in server and shared roots (tests excepted). A `config.ts` further down gets its own message |
| | 6 | Request input parsed by hand: any request input given to a `parse`, `safeParse` or `validate` (a schema's own, `X.parse(request.body.x)`, or a bare one), or a whole `request.body`, `query`, `params` or `headers` given to another `parse…` or `validate…` helper. A property of validated input handed to a helper (`parseRange(request.headers.range, size)`) is not one. And a route registered with no `schema`, its path a literal or computed (`app.get(routes.x.path, handler)`, read on `app`, `fastify`, `instance`, `server`, `scope`, `router` or a name the file registers a literal route on; a quoted string that isn't a path, and a class or token such as NestJS's `app.get(ConfigService)`, are no route). A heuristic |
| | 11 | A file over 400 lines, in any root, test files excepted (a warning) |

The other rules of the two skills are for review, except `code-structure`'s 5
and 7 (a feature used through its index, `app.ts` included; a `domain/` module
never importing a feature; no Fastify in `lib/`), which are the
dependency-cruiser preset's, and unused files and dependencies, which are knip's.
Rules 9 and 10 see the parts by their own names, `<X.Trigger>` and
`<Select.Root>` (under whatever name the file imports Select by). A wrapper
that re-exports a part under a new name (`export const DialogTrigger =
Dialog.Trigger`) hides its call sites from them, so review covers those. A
test is `*.test.*`, `*.spec.*`, jest's `*-spec.*` (NestJS's `app.e2e-spec.ts`),
or a file under a `test`, `tests`, `__tests__`, `testing` or `e2e` folder.
Comments, strings and regexes are masked before the source rules look, so a
rule's text in a comment or a message isn't a finding. Rule 3 reads one kind
of string: one that is `NODE_ENV` and nothing else, a key or a helper's
argument.

## conventions.json

One small file says where a repo's code is and which findings it accepts. It
sits at the repo root, or in `scripts/` or `tools/` (two of them are an error),
and its paths are from the repo root wherever it sits.

```json
{
  "$schema": "./vendor/house-style/conventions.schema.json",
  "web": ["web/src"],
  "server": ["server/src"],
  "shared": ["shared/src"],
  "exceptions": [
    {
      "check": "structure",
      "rule": 6,
      "path": "server/src/app.ts",
      "match": "\"/\"",
      "reason": "GET / redirects to the web app and has no body to describe."
    }
  ]
}
```

| Key | Default | What it is |
|---|---|---|
| `web`, `server`, `shared` | `web/src`, `server/src`, `shared/src`, where they exist | Source folders, as in `eslint.config.js` (`web/src`, not `web`). `*` matches within a folder name (`apps/*/src`); a root that matches nothing is an error. `[]` means none |
| `ui` | `["**/components/ui", "**/features/*/ui"]` | Inside each web root, where Base UI may be imported. `*` and `**` |
| `stylesheet` | `styles/index.css` | Inside each web root, the one stylesheet (`styles.css` in a repo that keeps that name) |
| `env` | the `config.{ts,js,mts,cts,mjs,cjs}` at the top of each server and shared root | Globs from the repo root of the files `check-structure`'s rule 3 lets read `process.env`. It replaces the default, as ESLint's `env` option does, and `NODE_ENV` stays a finding everywhere. Only `*` and `**` are globs (no braces, `?` or `[]`), and a plain path also covers what is under it, so an ESLint `env` list doesn't always copy over verbatim. Keep the two lists the same |
| `exceptions` | none | Findings the repo accepts: `check` (`base-ui`, `structure`, or `house-style` for a lint rule's record), `rule` (its number in that skill), `path` (a file or folder; `*` and `**`), an optional `match` (to accept one finding of several in a file: a substring of the finding's source line or of its message, so write the whole message or a part of the line no other finding shares; `GET /` matches every GET route's message), and a `reason` |

- An exception without a `reason`, an unknown key, a rule number past the
  check's last, or a path outside the repo is an error: the checker exits 2 and
  names the file and line.
- An exception may record a case no checker reports, such as an inline style
  that holds data or a test helper's name, so one that covers no finding is
  fine. One whose `path` names nothing in the repo is a warning.
- A repo without the file gets a message and the default roots that exist.
- With `env` set, rule 3's message reads "outside the env reader (<globs>)",
  so an exception whose `match` says "outside config.ts" stops matching.
  Both checkers exit 2 on a malformed `env`.
- No checker reads a tsconfig's `module` setting, so a choice such as
  `module: bundler` has no rule number to except. Write it in the repo's
  decisions page, not in `conventions.json`. (A `check: "house-style"`
  exception for it is valid, but nothing reads it back.)
- [conventions.schema.json](conventions.schema.json) describes the same format
  for editors; a test keeps it in step with `bin/conventions.mjs`.

## Adopting it

1. Sync a tag, as above, and pin the devDependencies below.
2. Point each config at the copy:

   ```js
   // eslint.config.js
   import { houseStyle } from "./vendor/house-style/eslint.config.js";

   export default houseStyle({
     root: import.meta.dirname,
     web: "web/src",
     server: "server/src",
     console: ["server/src/seed.ts"],
     tailwind: { css: "web/src/index.css" },
   });
   ```

   ```js
   // prettier.config.mjs (`.js` in a root with "type": "module")
   export { default } from "./vendor/house-style/prettier.config.js";
   ```

   In a root without `"type": "module"`, a `prettier.config.js` with this
   export warns `MODULE_TYPELESS_PACKAGE_JSON` on every run, so it is `.mjs`
   there. The formatter hook walks up from the saved file to the nearest
   Prettier config, which may be the root's, and runs Prettier from that
   folder.

   ```js
   // knip.config.js: knip has no `extends`, so the repo spreads the preset.
   import preset from "./vendor/house-style/knip.json" with { type: "json" };

   export default { ...preset, entry: ["scripts/*.{js,mjs,ts}"] };
   ```

   In a repo with npm workspaces, the repo's own entries go under
   `workspaces: { ".": { entry: [...] } }`: a top-level `entry` gives knip
   6.44.2 a configuration hint there. A package folder that isn't a workspace
   (a docs site with its own lockfile) goes in `ignore`.

   The preset sets no `entry` of its own: knip drops a preset's top-level
   `entry` as soon as the repo sets `workspaces`, and a repo that sets its own
   `entry` replaces it anyway. So the repo lists `scripts/*.{js,mjs,ts}` itself
   (as above), or `scripts/check-fast.mjs` is reported as an unused file.
   In a root without `"type": "module"`, knip reads `knip.config.js` and
   ignores `.cjs` and `.mjs` (ESLint and Prettier configs can be `.mjs` there).
   The `.js` file may be either form; the CommonJS one, checked with knip
   6.44.2, is:

   ```js
   // knip.config.js, in a root without "type": "module"
   const preset = require("./vendor/house-style/knip.json");

   module.exports = { ...preset, entry: ["scripts/*.{js,mjs,ts}"] };
   ```

   A package folder that isn't a workspace, and a Docusaurus workspace the
   harness leaves out, go in `ignoreWorkspaces` (`ignoreWorkspaces:
   ["sites/*/docs-site"]`). A project below the root whose scripts call
   `eslint`, `prettier` or `knip` needs `ignoreBinaries` for the ones it
   calls (with no such script knip says to remove them), and its own knip
   config spreads the preset so `**/vendor/**` stays in `ignore`. A
   dependency declared before anything uses it, or one a group build resolves
   from its own folder, goes in that workspace's `ignoreDependencies`.
   After a knip cleanup, run `tsc`: `noUnusedLocals` catches the types knip's
   removals left unused.

   ```js
   // .dependency-cruiser.cjs
   module.exports = { extends: "./vendor/house-style/.dependency-cruiser.cjs" };
   ```

   ```jsonc
   // tsconfig.base.json
   { "extends": "./vendor/house-style/tsconfig.base.json", "compilerOptions": { "types": ["node"] } }
   ```

   A repo keeps its own base file instead of extending the vendored one in
   three cases: its Dockerfile copies only that file (extending the vendored
   file breaks the image build), it can't take `noUncheckedIndexedAccess` yet,
   which the house base turns on, or it is a Bundler or extensionless repo
   (the house base is `NodeNext`, which wants real suffixes on relative
   imports). `sync --check` can't see drift in such a file, so the CHANGELOG
   names every flag change in the base. See the `house-style` skill's
   [adoption reference](../skills/house-style/references/adoption.md).

3. `.prettierignore` lists `*.md` and `vendor/`, and `.claude/settings.local.json`
   (Prettier honours the repo's `.gitignore` but not a global excludes file
   such as `core.excludesFile`, so a file ignored only there still gets
   checked). The ESLint config and the knip preset ignore `vendor/` already. Anchor root folders (`/data/`,
   `/uploads/`, `/output/`): an unanchored `uploads/` also hides
   `src/uploads/`.
4. A Tailwind repo adds `@source not` for `vendor/` to its stylesheet:
   Tailwind 4 scans every committed file for class names.

Two orders matter. The knip preset's config goes in before the first
measurement, or the count is of unconfigured knip. The dependency-cruiser
preset and `check:conventions` land in one commit, because knip reports
`dependency-cruiser` as an unused devDependency until a script runs it.

The import is the named `houseStyle`. The file's default export is a config
that ignores everything, because ESLint 10 loads the nearest config for each
file it lints, and for the copy's own files that is this one.

### `houseStyle()` options

Every key is optional. Folders are paths from the repo root; the rest are
globs from the repo root.

| Option | Default | What it does |
|---|---|---|
| `root` | the working directory | The repo root, for typed linting and the Tailwind entry |
| `web` | none | React folders: the hooks rules, and the Tailwind rules when `tailwind` is set |
| `server` | none | Node folders; no rule is scoped to them yet |
| `scripts` | `["scripts"]` | Folders of scripts run by hand (docs capture helpers, say): they print and read the environment. Folder paths, or folder globs (`games/*/scripts`), not file globs: each becomes `<folder>/**` |
| `tests` | `**/*.test.{ts,tsx,mts,cts,js,jsx,mjs,cjs}`, and the same for `.spec` | The files the vitest rules apply to. Write the globs with extensions (`**/*.test.{ts,tsx}`): `**/*.test.*` also matches `tsconfig.test.json`, which ESLint then parses as JavaScript. The test relaxations (below) reach these and more |
| `playwright` | `[]` | Globs of Playwright specs (`["web/e2e/**"]`): they get the test relaxations, and the vitest block ignores them. A repo that doesn't pass it sees no change |
| `defaultExports` | none | Where a framework or a runtime contract reads `default`, beyond `*.config.*` and `*.d.ts` (an ambient `declare module` has no other form) |
| `console` | none | App files allowed to print: a CLI entry, or a module that logs before the logger exists. Their `process.env` reads are still errors |
| `env` | `["**/config.ts"]` | Where `n/no-process-env` is off: the repo's env reader. A repo whose reader is `config/env.ts` passes `["server/src/config/env.ts"]` instead of writing its own block. A CLI entry that hands its environment to child commands goes here too. Tests, scripts and `*.config.*` stay exempt. Mirror the list in `conventions.json`'s `env` key |
| `assertFunctionNames` | `["expect", "expectTypeOf"]` | The names `vitest/expect-expect` counts as assertions. A repo adds its helpers (`expectError`, `expectPoint`) |
| `tailwind` | none | `{ css, order, ignore }`: the CSS entry, whether the class order is enforced yet, and `ignore`, regex patterns of classes `no-unknown-classes` lets through (a hook-only class such as `^list-grid$`, an icon font's `^ti(-|$)`, a dead plugin's `^animate-in$`), in place of a second block of the repo's own. The rule stays an error in test files: a fixture's class is a real one (`mt-2`). It reads a class in a JSX attribute or in a `cn()` or `clsx()` call, keys of an object there included, so a lookup map written inside the call (`cn({ sm: "h-8" }[size])`) is read as class names: declare the map above the call |
| `vitest` | `true` | `false` for a repo whose tests run on `node:test` |
| `typed` | `projectService` | `{ allowDefaultProject }`. `projectService` is the one that works with a Vite solution `tsconfig.json` (`files: []` plus references); `project: true` fails there. List tsconfigs under `typed.project` only when tests sit in a tsconfig `projectService` can't find: a `tsconfig.test.json` (or `tsconfig.tests.json`) beside a `tsconfig.json` that excludes the tests. Then list both, the main one too |
| `untyped` | none | TypeScript files no tsconfig covers, linted without types |
| `ignores` | vendor, dist, coverage | More folders ESLint skips |

**Two widths of a test file.** The test relaxations (`house-style/tests`: `!`
is a warning, `n/no-process-env` and `no-console` are off) reach everything the
checkers count as a test or a test helper: `*.test.*`, `*.spec.*`, jest's
`*-spec.*`, and every file under a `test`, `tests`, `__tests__`, `testing` or
`e2e` folder, plus the `tests` and `playwright` options. The vitest block
applies to `tests` alone, minus `playwright`: a helper in a test folder isn't a
test file, and a Playwright spec isn't a vitest file. A test keeps the two
definitions in step. A repo whose jest specs sit in `apps/backend/test/` needs
no `tests` entry for the relaxations, and an entry would also put the vitest
rules on those specs.

An empty `files` list drops its block: `scripts: []` leaves out the scripts
block, `tests: []` the vitest block, and the console block stays only when
`console` names files.

An unknown option is an error, so a typo can't switch a rule off. Rules of the
repo's own go after the house config in its array. ESLint replaces a rule's
options rather than merging them, so a repo that sets its own
`no-restricted-syntax` spreads the exported `restrictedSyntax` first. A repo
that starts a rule as a warning (`n/no-process-env` before its server moves
every read into `config.ts`) sets it in its own block, with a dated comment
that says what turns it back, never a brief number: `// A warning for now
(2026-11-11): these files still read the environment themselves. When the
server takes its settings from config.ts, this goes.`

`console`, `scripts` and `env` are three different exemptions. `scripts` is for
folders of scripts run by hand: they print and read the environment. `console`
is for app files allowed to print, such as a CLI entry or a module that logs
before the logger exists: their env reads are still errors. `env` moves the
env exemption to the repo's reader. `check-structure`'s rule 3 counts
`process.env` reads even where ESLint lowers them, so a harness brief that
lowers one states both.

Notes that come with the rules:

- `vitest/no-disabled-tests` warns on `skipIf`-style guards, and that is
  expected.
- `vitest/valid-title` flags a variable title; a template literal clears it.
- `vitest/no-standalone-expect` counts `beforeAll`, `beforeEach`, `afterAll`
  and `afterEach` as test blocks, so an `expect` in a hook is fine, and so is
  one in a plain function or an arrow helper. An `expect` in a class method is
  still flagged: write an assertion helper as a plain function. After syncing
  1.2.0, delete every `vitest/no-standalone-expect` disable comment ESLint
  reports as unused.
- `valid-expect` and `no-unnecessary-type-assertion` have autofixes that
  break code; run `tsc` after any `eslint --fix` (the
  [adoption reference](../skills/house-style/references/adoption.md) lists how).
- A `/* global */` comment in an `.mjs` file hits `no-redeclare`: the house
  gives `.mjs` files Node's globals, so delete the comment.
- `res.json() as T`, where `json` is generic (Fastify's `inject()` response),
  is flagged by `no-unnecessary-type-assertion` ("The type arguments for this
  generic call may be inferred from the assertion"). It has no autofix: write
  `res.json<T>()`.
- ESLint 10's recommended set adds `no-useless-assignment` (a value no later
  statement reads: drop the initial value, `let n: number;`, when every branch
  assigns) and `preserve-caught-error` (an error thrown inside a `catch` takes
  the caught one as its cause: `new Error("bad json", { cause: error })`).
- `react-hooks` 7.1.1's recommended set includes `refs`,
  `set-state-in-effect` and `immutability`. Lowering them means naming each.
- `@typescript-eslint/no-import-type-side-effects` is on beside
  `consistent-type-imports`: with `verbatimModuleSyntax`,
  `import { type X } from "./a.js"` still emits `import {} from "./a.js"`.
  `eslint --fix` turns it into `import type`.
- `eslint-plugin-jsx-a11y` 6.10.2 does not support ESLint 10, so no a11y rules
  ship. A repo that needs two of them writes `no-restricted-syntax` selectors
  (spread `restrictedSyntax` first):

  ```js
  { selector: "JSXAttribute[name.name='autoFocus']", message: "Don't set autoFocus: it moves focus without the user asking." },
  {
    selector: "JSXOpeningElement[name.name='button']:not(:has(JSXAttribute[name.name='type']))",
    message: 'Give every <button> a type: "button", "submit" or "reset".',
  },
  ```

- A repo's own `forbidden` entry in `.dependency-cruiser.cjs` with the same
  `name` merges with the preset's rule. That is how a rule is lowered to
  `warn` (`{ name: "no-circular", severity: "warn" }`) or given an exempt path
  (`{ name: "no-circular", to: { circular: true, pathNot: "^src/legacy/" } }`).
  The repo's `from` and `to` replace the preset's whole: ward-auth's own
  `domain-not-to-features`, which names its root-level domain folders, keeps
  working beside 1.3.0's. To scope a rule to one folder (`no-circular` a
  warning in `web/` only), narrow the preset's rule with `from.pathNot` and
  add a second rule under a name of the repo's own; the house-style skill's
  [recipes](../skills/house-style/references/recipes.md) have it.
- `app-through-feature-index` and `domain-not-to-features` (1.3.0) read the
  root's `app.ts` and `domain/`: a feature's own `app.ts` or `domain/`
  folder is its insides, and neither rule reads it.
  `not-to-unresolvable` allows `virtual:` module ids (Vite virtual modules)
  Astro's `astro:` modules and React Router's generated `./+types/<route>`
  imports.
- A repo's own `options.exclude` **replaces** the preset's
  `(^|/)(vendor|dist|coverage)/`, so a repo that adds a pattern repeats that
  one. In a repo with several projects, `options.tsConfig` points at the
  project with the path aliases. `lib-without-fastify` counts a type-only
  `import type` from Fastify on purpose: a type is still a coupling. 18.7.2
  pins `semver` 7.8.6 and `acorn` 8.19.0 exactly, and npm can hoist those over
  an app's runtime copies: read the lockfile diff after the install.

Per-folder changes (`no-console` allowing `warn` and `error` in a client,
`n/no-process-env` off in one folder, `recommendedTypeChecked` for a NestJS
folder), `eslint-plugin-react-refresh` and an Astro repo's whole setup go in
the repo's own blocks after `houseStyle()`: the `house-style` skill's
[recipes](../skills/house-style/references/recipes.md) give each one, run once.

JavaScript files and `*.config.*` files are linted without type information,
and see Node's globals; `.cjs` files see CommonJS's too (`module`, `require`).

## The devDependencies a repo pins

Exact versions, the same in every repo (`save-exact=true` in its `.npmrc`).
They are `peerDependencies` in [package.json](package.json), which the sync
reads; the tests run on the same versions.

<!-- pins:start -->
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
<!-- pins:end -->

- `@vitest/eslint-plugin` 1.6.28 wants TypeScript 6 as an optional peer, so
  npm refuses it next to TypeScript 5.x: bump TypeScript first.
- `typescript-eslint` 8.72.2 supports TypeScript below 6.1.
- The pins cost an image where a Docker image keeps devDependencies: just-a-bot's
  `node_modules` went from 87 to 197 MB. Install with `npm ci --omit=dev` in
  the image's runtime stage.
- The ESLint config imports every plugin, so a repo without React or Tailwind
  pins them too. `eslint-plugin-better-tailwindcss` brings `tailwindcss` as a
  peer; a Tailwind repo pins its own version.
- `engines` in [package.json](package.json) is where every pinned tool runs:
  ESLint 10 and its packages want `^22.13.0 || >=24`, and dependency-cruiser 18
  wants `^22 || ^24 || >=26`, so Node 22.13 or later on 22, 24, or 26 and
  later. The sync alone runs on any Node from 22.6.

## How a rule changes

house-style's version is its own, apart from the plugin's.

- A new rule, a rule removed, or a changed option is a **minor** version.
- A warning that becomes an error is a minor version **with a note** in
  [CHANGELOG.md](CHANGELOG.md) naming what each repo fixes first.
- A change to `houseStyle()`'s options that breaks a repo's config, or to the
  copy's layout, is a **major** version.
- A fix that changes no finding is a patch.

To release: move the `Unreleased` section of the changelog under the new
version, set `version` in `package.json`, commit, and tag the commit
`house-style-v<version>`. Each repo then syncs the tag in its own commit.

## Working on it

```sh
npm ci
npm test
```

`npm test` lints a small fixture repo (`test/fixtures/repo`, with its own
tsconfig for the typed rules): each rule has a failing fixture that must report
exactly that rule and a passing one that must report nothing. The checkers get
the same, on `test/fixtures/base-ui` and `test/fixtures/structure`, plus every
way `conventions.json` can be malformed. It also runs the presets on scratch
projects (dependency-cruiser fails a boundary tree and passes a clean one) and
the sync against a scratch checkout.
