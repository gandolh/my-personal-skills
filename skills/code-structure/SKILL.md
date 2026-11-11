---
name: code-structure
description: The estate's code structure for its Fastify 5 servers and the React apps beside them, as 11 numbered rules, each with its reason, its source (Fastify's docs, the fastify/demo app, Matteo Collina's best-practices skill or the owner's call) and what enforces it (house-style's check-structure, its dependency-cruiser preset, or review). server.ts listens and app.ts builds; config.ts alone reads the environment; cross-cutting plugins wrapped in fastify-plugin; features/<name>/ folders used through their index; zod schemas on every route, a response schema included, through @fastify/type-provider-zod; thin handlers over store.ts; one error handler; inject() tests through buildTestApp. Copy-ready skeletons compiled and tested against Fastify 5.12.8, the provider 1.0.3 and zod 4.6.7, the web/src tree and its API client, and the order every server's migration follows.
when_to_use: Use when the user says "code structure", "project layout", "where does this go", "new feature folder", "structure the server", "Fastify app", "add a route", "add an endpoint", "restructure", "/code-structure", "why does check-structure flag this", or a repo's server brief says to follow the code-structure skill. Not for NestJS (imbatranimOS's backend), the web app's components (the base-ui skill), lint and formatting (house-style) or the deploy (bootstrap-vps-deploy).
---

# Code structure for the Fastify and React apps

The estate runs 19 Fastify 5 servers, most of them in a repo with npm
workspaces `shared/`, `server/` and `web/`. They grew from one another, so
they agree on a lot, but not on where code goes: most split the server by
layer (`routes/`, `store/`, `db/`), two by feature, and the smallest are
flat. None declared a response schema, so every reply went through
`JSON.stringify`, and a column added to a table reached the client. This
skill sets one structure, each rule with its reason and its source, checked
by a script wherever a script can see it.

It targets Fastify 5.12.x, `@fastify/type-provider-zod` 1.0.x and zod 4.2 or
later (the provider needs it). Fastify 6 is in alpha, and nothing here is
checked against it. imbatranimOS's backend is NestJS and stays out.

The research behind the rules, with its pinned sources, is
[references/research.md](references/research.md). The owner's four
decisions and the alternatives they beat are in the library's
[corpus/wiki/decisions.md](../../corpus/wiki/decisions.md); the calls of
2026-11-10 are on
[grilling-2026-11-10.md](../../corpus/wiki/grilling-2026-11-10.md) and
[grilling-2026-11-10-technical-calls.md](../../corpus/wiki/grilling-2026-11-10-technical-calls.md),
and their Q numbers appear below.

## The layout

```text
<repo>/
  package.json         npm workspaces: shared, server, web
  scripts/             scripts run by hand; they may print and read the environment
  shared/src/          zod schemas and types both sides import: the API contract
  server/src/
    server.ts          the entry: settings, buildApp, shutdown, listen; nothing else
    app.ts             buildApp(config): plugins, then features; never listens
    config.ts          the one parse of the environment (zod) into a typed Config
    plugins/           cross-cutting, fastify-plugin wrapped: errors, auth, security headers, static files
    features/<name>/   index.ts, routes.ts (an encapsulated plugin), store.ts (its SQL), service.ts?, *.test.ts
    db/                open and migrate; a store too big to split (Q54)
    lib/               pure helpers and the ApiError class; no Fastify import
    testing/           buildTestApp, fakes, fixtures
  web/src/
    main.tsx, App.tsx, router.ts
    components/ui/     Base UI wrappers (the base-ui skill)
    features/<name>/   one domain's pages, components, hooks and API calls, with an index.ts
    lib/               the API client, cn, pure helpers
    styles/index.css   the one stylesheet (the base-ui skill)
```

The roots are each repo's own, named in its `conventions.json` (atrium's
`apps/api/src`, `apps/web/src` and `packages/*/src`; public-resource-map's
`backend/src`), and every path above is read from inside a root. In the
skeletons, `@app/shared` stands for the repo's shared package under its own
scope (`@almanac/shared`, `@wicket/shared`).

## The rules

| # | Rule | Why | Source | Enforced by |
|---|---|---|---|---|
| 1 | `server.ts` is the only file that calls `listen`. It reads the settings, builds the app with the process's options (the logger, `trustProxy`, and `connectionTimeout`, `requestTimeout` and `keepAliveTimeout` set for this repo), wires `close-with-grace`, and listens on the host the deploy needs (`0.0.0.0` in a container) | Tests and scripts build the app without opening a port, and one file owns the process | Fastify's Testing guide; the demo's `server.ts`; Collina | `check-structure` rule 1, tests excepted |
| 2 | `app.ts` exports `buildApp(config)`. It builds the `FeatureContext` and registers by name, in a fixed order: external plugins, then the app's `plugins/`, then the features. No `@fastify/autoload` | Fastify loads in registration order, so the order is the architecture; a feature registered by name is found with grep and keeps its option types | Fastify's Plugins guide; the demo's `plugins/external`, `plugins/app`, `routes/`; owner decision 3 | `check-structure` rule 2 (no `app.ts`, or no exported `buildApp`); the order is review |
| 3 | `config.ts` is the only file that reads `process.env`. It loads `.env` by an explicit path, parses once with zod into a typed `Config`, and throws naming every bad variable. Nothing reads `NODE_ENV`. A CLI inside the app (the entry, a seed command) reads its settings through `config.ts`; a script run by hand lives outside the roots, in `scripts/` | One place says what the app needs, and it fails at start rather than at the first request; `NODE_ENV` switches behaviour no setting names | Collina's anti-patterns; the demo's `server.ts`; the quiet env loaders the repo briefs found | `check-structure` rule 3 (server and shared roots, tests excepted); `n/no-process-env` (house-style rule 15) |
| 4 | A cross-cutting plugin (errors, auth, security headers, static files) lives in `plugins/`, wrapped in `fastify-plugin` so it reaches every feature. A feature isn't wrapped, so its hooks stay inside it. Dependencies travel as plugin options; a decorator holds only a request-scoped value (`request.user`) | Every `register` makes a child scope, and that encapsulation is Fastify's architecture; an option is typed and found with grep, a decorator is global | Fastify's Plugins guide and Encapsulation reference; the demo; owner decision 2 (Almanac's `FeatureContext`), Q24 | review |
| 5 | A server feature is a folder, `features/<name>/`, with an `index.ts` as its public surface. Code outside the folder, `app.ts` included, imports it through that index; another feature does only if it must. No import cycles, type-only imports included | A change to one domain stays in one folder, and its insides change without breaking callers | The demo's `routes` README; Collina; Pocock's `setup-ts-deep-modules` (owner decision 7) | dependency-cruiser `feature-through-index` and `no-circular`; `app.ts`'s own imports are review |
| 6 | Every route declares its schemas through `@fastify/type-provider-zod`: `params`, `querystring` and `body` as it takes them, and `response` for each status its handler sends. Zod from `shared/` when the client imports the schema, else from the feature folder (Q55), or the repo's existing schema library (sports-app's TypeBox, Q28). No handler parses request input. A response schema is transform-free and not strict; pass-through JSON is a loose object (Q25). Streams and binary replies are exempt, each with a `conventions.json` entry (Q53) | Validation, typed handlers and fast serialisation from one declaration, and a field the schema doesn't name never leaves the server | Fastify's Validation-and-Serialization and Type-Providers references; Collina; owner decision 4 | `check-structure` rule 6, a heuristic: a route with no `schema`, and request input handed to a `parse`, `safeParse` or `validate` call. A declared `response` is review |
| 7 | Handlers stay thin. SQL lives in the feature's `store.ts` (a factory returning an interface, house-style rule 20), logic two routes share in `service.ts`, pure code in `lib/`, which never imports Fastify. A store too big to split stays whole in `db/` (Q54) | A handler reads as input, call, reply; a store is faked with a plain object; pure code is tested without a server | The demo's data access through repositories; Collina | dependency-cruiser `lib-without-fastify`; the rest is review |
| 8 | Errors: throw `ApiError(code, message)`, the one error class (Q56). One handler, set at the root by a `fastify-plugin` plugin, answers in the repo's existing error body (`{ error, message, issues? }` where it has none): an `ApiError` with its code's status, a schema failure with 400 and its issues, a 4xx Fastify or a plugin raised with its status, anything else with 500, a fixed message, and the error logged with the request. The 404 handler answers the same body, rate-limited where `@fastify/rate-limit` is present | Fastify's default handler sends a thrown message verbatim at every status, a 500's included; the web parses one body | Fastify's Errors reference; the demo; Collina; Q43 | review |
| 9 | Each feature has `inject()` tests through `testing/buildTestApp.ts`: the whole app on a fresh temporary data folder, fakes passed in the context, closed after each test, with a schema-failure case. vitest, except atrium on `node:test` (Q27); Shelfmark tests handlers and plugins without `inject()` (Q26). Every server has a `pretest` that builds what its tests import | `inject()` runs the whole request path (hooks, validation, serialisation) with no socket | Fastify's Testing guide; the demo's test helper; Collina | review |
| 10 | Web: a feature is a folder, `web/src/features/<name>/`, holding one domain's pages, components, hooks and API calls, used through its `index.ts`. Base UI wrappers live in `components/ui/`, the API client and pure helpers in `lib/` | The client changes with its feature, as the server does | Rule 5 applied to the client; base-ui rule 3 | dependency-cruiser `feature-through-index` and `no-circular`, which match any `features/` path; `check-base-ui` for `ui/`; the rest is review |
| 11 | A file past about 400 lines is a warning: split it by sub-domain before adding to it | A file that long holds more than one idea, and the next change touches all of them | The demo's `routes` README (a growing file becomes a folder) | `check-structure` rule 11, a warning, in every root |

Rules 1, 2, 3, 6 and 11 are `check-structure`'s, 5, 7 and 10 lean on
dependency-cruiser, and 4, 8 and 9 are review's. The skeletons in the
references meet all eleven: the checker and dependency-cruiser report
nothing on them.

## How the rules are checked

`check-structure` ships in the library's `house-style/` folder and reaches
each repo with the rest of house-style, by `npm run house-style:sync`.

```sh
node vendor/house-style/bin/check-structure.mjs [--warn-only] [repo-root]
```

- `check:conventions` runs knip, `depcruise` on the source folders, then the
  two checkers. `check-structure` keeps `--warn-only` from the repo's
  harness brief until its server brief.
- Each finding is one line, `file:line rule-N error|warning: message`.
  Exit 0 when no error is left, 1 when one is, 2 when it can't check (a bad
  flag, a malformed `conventions.json`). It prints a line saying rules 5 and
  7 are dependency-cruiser's.
- Rules 1, 2 and 6 look at server roots, rule 3 at server and shared roots,
  rule 11 at every root. A server root with no `app.ts` is a rule 2 finding.
- Tests (`*.test.*`, `*.spec.*`, files under `test`, `tests`, `__tests__`,
  `testing` or `e2e`) are exempt from rules 1, 3 and 6. Comments and strings
  are masked first.
- Rule 6 reads `app.get(path, handler)`, `app.get(path, options, handler)`,
  `app.get(path, { schema, handler })` and `app.route({ url, … })` with a
  literal path. An options object that spreads (`...shared`) counts as
  having a schema.
- A finding the repo accepts is an exception in `conventions.json`, with the
  check, the rule, the path, an optional `match` and a required `reason`:

  ```json
  {
    "check": "structure",
    "rule": 6,
    "path": "server/src/features/covers/routes.ts",
    "match": "/api/covers/:id",
    "reason": "Streams the image file: binary replies have no response schema (Q53)."
  }
  ```

The house dependency-cruiser preset forbids cycles (`no-circular`),
unresolvable imports, a feature reached past its index
(`feature-through-index`) and Fastify under `lib/` (`lib-without-fastify`).
It counts type-only imports. It runs in every repo from the harness brief
on; a rule the repo can't pass yet is lowered to a warning by name in its
own `.dependency-cruiser.cjs`, with a dated comment that says what removes
it (never a brief number), and the server brief raises it again:

```js
module.exports = {
  extends: "./vendor/house-style/.dependency-cruiser.cjs",
  forbidden: [
    // 2026-11-12: a warning until each feature names its own options type instead of importing app.ts.
    { name: "no-circular", severity: "warn" },
  ],
};
```

knip, with house-style's preset, reports unused files and dependencies as
errors and unused exports as warnings. The house-style package README has
the `conventions.json` format and every checker's rules.

## What review covers

A reviewer works through these, skipping what the tools report:

- **Rule 1.** The timeouts suit the repo: a long poll under
  `connectionTimeout` (wicket's 25 s, lantern's 26 s record route, ward-auth's
  slow SMTP), an upload under `requestTimeout` (comercial-website's 500 MB).
  `TRUSTED_PROXIES` names the proxy's network in a container, or every
  client shares one rate-limit bucket.
- **Rule 2.** The order in `buildApp`, and every feature registered by name.
- **Rule 4.** `fastify-plugin` on each cross-cutting plugin and on none of
  the features; no `decorate` for a dependency; no `declare module
  "fastify"` except for a request-scoped value.
- **Rule 5.** `app.ts` imports each feature through its index.
- **Rule 6.** A `response` schema for every status the handler sends itself
  and for no other: a declared status the handler doesn't send (a guard's
  401) answers 500 when the guard's body doesn't match it. No `.transform()`
  and no `.strict()` in a response schema. Each stream or binary route has
  its `conventions.json` entry.
- **Rules 7 and 8.** No SQL in a handler; no thrown message in a 5xx reply;
  Fastify's own 4xx keep their status.
- **Rule 9.** A test per feature through `buildTestApp`, a schema-failure
  case, and a `pretest`.
- **Rule 10.** A page belongs to the feature that owns its route; a
  component two features use moves to `components/` rather than living in
  one of them.

## The pins

Exact versions, the same in every server (`save-exact=true`):

| Package | Version | Note |
|---|---|---|
| `fastify` | `5.12.8` | SocialEvents moves from 5.8.5 first |
| `@fastify/type-provider-zod` | `1.0.3` | needs zod 4.2 or later |
| `@fastify/swagger`, `openapi-types` | `9.9.3`, `12.1.3` | the provider's required peers: npm installs them, so pin them, and name them in the repo's dependency notes |
| `zod` | `4.6.7` | atrium, comercial-website's `backend` and public-resource-map move from zod 3 first |
| `fastify-plugin` | `6.0.1` | |
| `close-with-grace` | `2.5.0` | |
| `@fastify/rate-limit` | `11.2.2` | where a repo limits; without it the 404 handler drops its `preHandler` |
| `vitest` | `4.1.12` | atrium stays on `node:test` |

Checked on 2026-11-11: the skeletons type-check with TypeScript 6.0.3 under
the house flags and their tests pass on these versions.

## The references

- [server-skeleton.md](references/server-skeleton.md): `server.ts`,
  `app.ts`, `config.ts`, the error plugin, one feature (routes, store,
  index) with its zod schemas in `shared/`, `testing/buildTestApp.ts` and
  the feature's `inject()` tests. Copy it, then rename.
- [zod-type-provider.md](references/zod-type-provider.md): the setup, a
  plugin typed in its own file, a response schema per status, what a
  response schema may hold, how a zod issue becomes the error body, the
  traps, and the byte compare that proves a response schema changes
  nothing.
- [web-skeleton.md](references/web-skeleton.md): the `web/src` tree, the
  API client and a feature's calls.
- [migrating-a-server.md](references/migrating-a-server.md): the order every
  server brief follows, one working step at a time.
- [research.md](references/research.md): what the sources say, pinned and
  dated, and what the skill took from each.

Every TypeScript block in the references is a whole module whose first line
is its path; all of them compile together under the house flags, and their
tests pass.

## In a repo

Each server gets a brief of its own, in the order the library's brief 16
tracks (smallest first), and follows
[migrating-a-server.md](references/migrating-a-server.md): `config.ts` and
the `server.ts` / `app.ts` split, the error plugin, the `features/` folders,
the type provider one feature at a time, then strict checks. Renaming
`index.ts` to `server.ts` changes the Dockerfile's `CMD` in the same commit
(Q1). The web side moves with the repo's Base UI and Tailwind briefs, which
follow the base-ui skill.

The repo's `.claude/rules/server.md` carries a short copy of the rules that
apply to it, scoped to its server root, so they load even where this skill
doesn't. The house-style skill describes that file.
