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
- **The checkers** (not shipped yet): `bin/check-base-ui.mjs` and
  `bin/check-structure.mjs`, run as `node vendor/house-style/bin/<name>.mjs`,
  with their roots in a `conventions.json` at the repo root.

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
exactly that rule and a passing one that must report nothing. It also runs the
presets on scratch projects and the sync against a scratch checkout.
