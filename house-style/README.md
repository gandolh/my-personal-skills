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
| `.dependency-cruiser.cjs` | No cycles, no unresolvable imports, a feature used through its index only, no Fastify in `lib/` |
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

- It copies into the git work tree it runs in (outside git, the nearest folder
  up with a `package.json`), wherever in the repo it starts.
- `<ref>` is a tag or a commit. The sync reads the `house-style/` folder at
  that commit from git objects, never the checkout's working tree, so the copy
  is exactly what the commit holds, whatever is checked out or uncommitted.
- It replaces the copy wholesale (a file the commit dropped disappears), writes
  the header, and reads every file back by its git hash.
- When `<ref>`'s own `bin/sync.mjs` differs from the one running, it hands over
  to that one, so each version writes its own copy and header.
- `--check` writes nothing. It exits 1 and lists each difference when the copy
  is not the commit byte for byte, and 0 when it is.
- It also lists, without changing anything or the exit code, every pin in the
  repo (the root `package.json` and each workspace) that differs from the
  table below.
- Plain Node (22.6 or later) and git; no dependencies.

The first time, the copy doesn't exist yet: run the library checkout's
`house-style/bin/sync.mjs <ref>` once from inside the repo, then add the npm
script. It refuses to run with the library checkout itself as the repo.

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
- `repo-root` defaults to the working directory.

| Checker | Rule | What it reports |
|---|---|---|
| `check-base-ui` | 1 | `@base-ui/react` not pinned exactly to `--version` (default 1.9.0), in each `package.json` from a web root up to the repo root |
| | 2 | An import from the `@base-ui/react` root instead of a part's subpath |
| | 3 | A Base UI import outside the `ui` folders (tests excepted) |
| | 5 | A stylesheet other than the one, a CSS module, and the one without `@import "tailwindcss"` |
| | 6 | An arbitrary colour in a class name: `bg-[#…]`, `text-[rgb(…)]`, `border-[hsl(…)]`, … |
| | 9 | A `<X.Trigger>` whose first child is a component (not one of X's own parts, such as `<Select.Value>`) and has no `render`, or whose `render` wraps its content in a `span` or `div` (a warning) |
| | 10 | A `<Select.Root>` without `items` (a warning) |
| | 11 | `window.confirm`, `alert` or `prompt`, or the bare call |
| `check-structure` | 1 | `listen(` in a server root outside `server.ts` (tests excepted) |
| | 2 | A server root whose `app.ts` exports no `buildApp`, or that has no `app.ts` |
| | 3 | `process.env` outside `config.ts`, and any `NODE_ENV`, in server and shared roots (tests excepted) |
| | 6 | Request input parsed by hand (`schema.parse(request.body)`, a helper given `req.query`), and a route registered with no `schema` (a heuristic) |
| | 11 | A file over 400 lines, in any root (a warning) |

The other rules of the two skills are for review, except `code-structure`'s 5
and 7 (a feature used through its index, no Fastify in `lib/`), which are the
dependency-cruiser preset's, and unused files and dependencies, which are knip's.
Rules 9 and 10 see the parts by their own names, `<X.Trigger>` and
`<Select.Root>` (under whatever name the file imports Select by). A wrapper
that re-exports a part under a new name (`export const DialogTrigger =
Dialog.Trigger`) hides its call sites from them, so review covers those. A
test is `*.test.*`, `*.spec.*`, or a file under a `test`, `tests`,
`__tests__`, `testing` or `e2e` folder. Comments, strings and regexes are
masked before the source rules look, so a rule's text in a comment isn't a
finding.

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
| `exceptions` | none | Findings the repo accepts: `check` (`base-ui`, `structure`, or `house-style` for a lint rule's record), `rule` (its number in that skill), `path` (a file or folder; `*` and `**`), an optional `match` (text the finding's line or message contains, to accept one finding of several in a file), and a `reason` |

- An exception without a `reason`, an unknown key, a rule number past the
  check's last, or a path outside the repo is an error: the checker exits 2 and
  names the file and line.
- An exception may record a case no checker reports, such as an inline style
  that holds data or a test helper's name, so one that covers no finding is
  fine. One whose `path` names nothing in the repo is a warning.
- A repo without the file gets a message and the default roots that exist.
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
   // prettier.config.js
   export { default } from "./vendor/house-style/prettier.config.js";
   ```

   ```js
   // knip.config.js: knip has no `extends`, so the repo spreads the preset.
   import preset from "./vendor/house-style/knip.json" with { type: "json" };

   export default { ...preset, entry: ["scripts/*.ts"] };
   ```

   ```js
   // .dependency-cruiser.cjs
   module.exports = { extends: "./vendor/house-style/.dependency-cruiser.cjs" };
   ```

   ```jsonc
   // tsconfig.base.json
   { "extends": "./vendor/house-style/tsconfig.base.json", "compilerOptions": { "types": ["node"] } }
   ```

3. `.prettierignore` lists `*.md` and `vendor/`. The ESLint config and the
   knip preset ignore `vendor/` already.
4. A Tailwind repo adds `@source not` for `vendor/` to its stylesheet:
   Tailwind 4 scans every committed file for class names.

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
| `server` | none | Node folders; no rule is scoped to them in 1.0.0 |
| `scripts` | `["scripts"]` | Folders of scripts, where `console` and `process.env` are allowed |
| `tests` | `**/*.test.*`, `**/*.spec.*` | Test files: the vitest rules, `!` as a warning, and `process.env` allowed |
| `defaultExports` | none | Where a framework or a runtime contract reads `default`, beyond `*.config.*` |
| `console` | none | CLI entry files, where `console` is allowed. They read the environment through `config.ts`, like the rest of the app |
| `tailwind` | none | `{ css, order }`: the CSS entry, and whether the class order is enforced yet |
| `vitest` | `true` | `false` for a repo whose tests run on `node:test` |
| `typed` | `projectService` | `{ allowDefaultProject }`, or `{ project: true }` where `project` measures faster |
| `untyped` | none | TypeScript files no tsconfig covers, linted without types |
| `ignores` | vendor, dist, coverage | More folders ESLint skips |

An unknown option is an error, so a typo can't switch a rule off. Rules of the
repo's own go after the house config in its array. ESLint replaces a rule's
options rather than merging them, so a repo that sets its own
`no-restricted-syntax` spreads the exported `restrictedSyntax` first. A repo
that starts a rule as a warning (`n/no-process-env` before its server moves
every read into `config.ts`) sets it in its own block, with a dated comment
naming the brief that turns it back.

JavaScript files and `*.config.*` files are linted without type information,
and see Node's globals.

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
