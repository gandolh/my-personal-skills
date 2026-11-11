# Recipes: what the house leaves to the repo's own block

`houseStyle()` takes no option for a rule that one repo needs differently.
Flat config already covers it: a block of the repo's own, after `houseStyle()`
in the array, wins over the house's for the files it names. Each recipe here
was run once on a scratch repo with the house config (house-style 1.2.0) and
reported what it says.

[adoption.md](adoption.md) says when each comes up.

## Per-folder changes

```js
// eslint.config.mjs
import tseslint from "typescript-eslint";
import { houseStyle } from "./vendor/house-style/eslint.config.js";

export default [
  ...houseStyle({ root: import.meta.dirname, web: "web/src", server: ["server/src", "backend/src"] }),

  // A client may log warnings and errors, and nothing else.
  {
    name: "app/client-console",
    files: ["web/src/**"],
    rules: { "no-console": ["error", { allow: ["warn", "error"] }] },
  },

  // One folder that still reads the environment itself (a dated comment says what removes this).
  { name: "app/legacy-env", files: ["server/src/legacy/**"], rules: { "n/no-process-env": "off" } },

  // The NestJS backend keeps typescript-eslint's whole type-checked set. `files` scopes each of its blocks.
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({ ...config, files: ["backend/src/**/*.ts"] })),
];
```

- `no-console` takes the same options in the repo's block: ESLint replaces a
  rule's options, it doesn't merge them. A call the allow list still flags
  (`console.info`) carries a one-line `eslint-disable-next-line` with the
  reason.
- `n/no-process-env` off for a folder is for a folder that still reads the
  environment; a block that turns it **on** again for a wider glob must list
  the env reader under `ignores` (see the `env` option in
  [adoption.md](adoption.md)).
- The checked run: `console.log` in the client is an error and `console.warn`
  and `console.error` pass; a `process.env` read under `server/src/legacy`
  passes and one elsewhere in `server/src` doesn't; `no-unsafe-assignment`
  fires in `backend/src` and not in `server/src`.

A repo may import `typescript-eslint` after `houseStyle()`, as above. Reading
`tseslint.configs.*` registers the repo's own folder as a candidate
`tsconfigRootDir`, and 1.1.0 then failed every `.mjs` with "multiple candidate
TSConfigRootDirs". From 1.2.0 `houseStyle()` returns a `house-style/tsconfig-root`
block that names the root, so the repo needs no block of its own for it.
A repo that picks blocks out of the returned array indexes by `name`, never by
position: the array is filtered (an empty block is dropped), so positions move.

## `eslint-plugin-react-refresh`

It isn't in the house, because every adopter would then install a plugin only
some of them use. A repo that had it keeps it in its own block, and its own
pin in `package.json`:

```js
import reactRefresh from "eslint-plugin-react-refresh";

// ...after houseStyle():
{ name: "app/react-refresh", files: ["web/src/**/*.{ts,tsx}"], ...reactRefresh.configs.vite },
```

Checked with eslint-plugin-react-refresh 0.5.3: a file that exports a component
and a function is an error under `react-refresh/only-export-components`.

## A Node app with no HTTP server

A gateway bot, or a protocol library, is a `shared` root in `conventions.json`,
where `check-structure`'s rules 3 and 11 apply. There is no `node` root kind.
Run the checker with `node vendor/house-style/bin/check-structure.mjs` from the
repo root (its argument is the repo root, never a source folder). The full
example is in [adoption.md](adoption.md), under "The checkers".

## Astro, a fourth repo shape

presentation-sites (four Astro sites, one root) is the model. The house ships no
Astro preset, because every adopter would install `eslint-plugin-astro`,
`prettier-plugin-astro` and the parser. A repo adds them itself and pins them
exactly like the rest.

**Prettier.** `prettier-plugin-astro` formats `.astro` files with its own parser:

```js
// prettier.config.mjs
import house from "./vendor/house-style/prettier.config.js";

export default {
  ...house,
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
```

**ESLint.** `houseStyle()` scopes its blocks to TypeScript and JavaScript files,
so the Astro block borrows two of them by name and applies them to `.astro` files:

```js
// eslint.config.mjs
import astro from "eslint-plugin-astro";
import { houseStyle } from "./vendor/house-style/eslint.config.js";

const root = import.meta.dirname;

const house = houseStyle({
  root,
  web: ["sites/a/src", "sites/b/src"],
  // An .astro file's <script> blocks reach ESLint as virtual files no tsconfig holds.
  untyped: ["**/*.astro/*.ts"],
  ignores: ["**/.astro/**"],
});

// The house shapes and its six typed rules, which the Astro block below applies to .astro files too.
const block = (name) => house.find((config) => config.name === name);
const shapes = block("house-style/base");
const typed = block("house-style/typed");

export default [
  ...house,
  // The parser and rules for .astro files and the <script> blocks inside them.
  ...astro.configs["flat/recommended"],
  {
    // astro-eslint-parser has no projectService, so typed lint finds each site's tsconfig.json through
    // `project: true`.
    name: "app/astro",
    files: ["**/*.astro"],
    plugins: shapes.plugins,
    languageOptions: { parserOptions: { project: true } },
    rules: { ...shapes.rules, ...typed.rules },
  },
];
```

- `project: true` costs a TypeScript program per site: presentation-sites'
  typed lint of the whole repo took about 50 s when first measured and 27.9 s
  warm, for four sites. `.ts` and `.tsx` files keep `projectService`.
- A `tsconfigRootDir: root` in the Astro block (presentation-sites had one on
  1.1.0) is redundant from 1.2.0: the `house-style/tsconfig-root` block sets it.
- Checked: with this config the house rules fire in `.astro` frontmatter and in
  `<script>` blocks (`!`, a floating promise, `console.log`), and in `.ts` files.
- `vitest: false` when a site's tests run on `node:test`.
- A site's compiler flags stay in its own `tsconfig.json` over
  `astro/tsconfigs/strict`: add `erasableSyntaxOnly` and `noImplicitOverride`,
  and where `noUncheckedIndexedAccess` stays off (a dated comment says until
  when), turn `no-unnecessary-type-assertion` off for that site's files too.

**The typecheck is `astro check`**, one per site, as each site's `typecheck`
script. The root names the sites in its `typecheck` script
(`npm run typecheck -w <site> -w <site>`), not `--workspaces --if-present`,
which would also run a docs site's `tsc`.

**`check:fast`** lists the sites with a changed file, runs each one's own
typecheck, then ESLint on the changed files:

```js
// npm run check:fast: `astro check` for each site with a changed file, then ESLint on the changed files.
// Files changed against HEAD and untracked ones. Never tests.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).split("\n").filter(Boolean);
const changed = [
  ...new Set([
    ...git("diff", "--name-only", "--relative", "HEAD"),
    ...git("ls-files", "--others", "--exclude-standard"),
  ]),
];

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

// A deleted file still changes its site, so every changed path counts here. Each site's own `typecheck` script
// is `astro check`; the folder names the site, so the workspace name doesn't matter.
const sites = new Set(changed.map((file) => /^sites\/([^/]+)\//.exec(file)?.[1]).filter(Boolean));
for (const site of sites) run("npm", ["--prefix", `sites/${site}`, "run", "typecheck"]);

const linted = changed.filter((file) => /\.(astro|[cm]?[jt]sx?)$/.test(file) && existsSync(file));
if (linted.length > 0) run("npx", ["eslint", "--no-warn-ignored", ...linted]);
```

With one changed file in one site it ran that site's typecheck and nothing
else. With the ESLint leg run against the scratch Astro config it exited 0 on a
clean changed file and 1 on one with a `!`. presentation-sites measured
`check:fast` at 11 s with one `.astro` file changed. Its full `typecheck` takes 32 s, which is why `check:fast` doesn't
run it.

**The reformat's acceptance is a `dist/` compare.** `git diff -w` is no
substitute, and esbuild can't read `.astro` files, so build every site before
and after the reformat (in mock mode, if a site needs data) and compare the two
`dist/` folders: every JavaScript, CSS, font and image file byte-identical, and
every HTML page the same tags, attributes and text. Prettier rewraps HTML and
inline scripts, so compare those parsed:

```js
// node compare-dist.mjs <before-dist> <after-dist>: the build output of a site before and after the reformat.
// Every file but HTML must be byte-identical. An HTML page must hold the same tags, attributes and text, with
// whitespace collapsed and each inline script minified (Prettier rewraps both).
import { transformSync } from "esbuild";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "parse5";

const [before, after] = process.argv.slice(2);
const walk = (root, dir = root) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(root, path) : [relative(root, path)];
  });
const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

/** The page as a flat list: each tag with its sorted attributes, and each run of text with whitespace collapsed. */
function outline(html) {
  const out = [];
  const visit = (node) => {
    if (node.nodeName === "#text") {
      const inScript = node.parentNode?.nodeName === "script";
      const text = inScript ? minify(node.value) : node.value.replace(/\s+/g, " ").trim();
      if (text) out.push(text);
    } else if (node.tagName) {
      out.push(
        `<${node.tagName} ${node.attrs
          .map((a) => `${a.name}=${a.value}`)
          .sort()
          .join(" ")}>`,
      );
    }
    for (const child of node.childNodes ?? []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parse(html));
  return out;
}
const minify = (code) => {
  try {
    return transformSync(code, { minify: true }).code;
  } catch {
    return code;
  }
};

const a = new Set(walk(before));
const b = new Set(walk(after));
let differences = 0;
for (const file of new Set([...a, ...b])) {
  if (!a.has(file) || !b.has(file)) {
    console.log(`only in ${a.has(file) ? "before" : "after"}: ${file}`);
    differences++;
  } else if (file.endsWith(".html")) {
    const x = outline(readFileSync(join(before, file), "utf8"));
    const y = outline(readFileSync(join(after, file), "utf8"));
    if (JSON.stringify(x) !== JSON.stringify(y)) {
      console.log(`html differs: ${file}`);
      differences++;
    }
  } else if (hash(join(before, file)) !== hash(join(after, file))) {
    console.log(`differs: ${file}`);
    differences++;
  }
}
console.log(`${a.size} files before, ${b.size} after, ${differences} differences`);
process.exit(differences === 0 ? 0 : 1);
```

It exits 0 on a reformat that rewraps a heading and an inline script, and 1,
naming the file, on a changed page, a changed stylesheet, or an inline script
whose code changed behind a comment (all three checked). On
presentation-sites' five sites, the builds before and after the reformat held
the same 414 files with every script, stylesheet, font and image identical, and
20 HTML pages that differed only in whitespace (one `<h2>` gained a newline at
a block boundary, which renders nothing). Build the "before" twice and compare
those two first: a build that isn't reproducible would show differences that
aren't the reformat's.
