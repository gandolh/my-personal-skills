# Task 03: A code-structure skill for the Fastify + React apps

## Context

On 2026-11-09 the owner asked for a skill that sets one code structure for
their apps and is enforced in every repo, with Fastify best practices
researched first. Enforcement is brief 16 for the servers and brief 15 for
the shared checker wiring.

### The estate today (survey of 2026-11-09)

- **19 Fastify servers, all on Fastify 5** (5.12.7 in most; SocialEvents and
  a hackathon on 5.8.5).
- **The usual repo shape** is npm workspaces `shared/`, `server/` and
  `web/`. Shelfmark took it from Satchel, and Almanac took it from
  Shelfmark. `shared/` holds the zod schemas that the server and the web
  forms both use.
- **Two server layouts.** Most split by technical layer (`routes/`,
  `store/`, `db/`, `auth/`): Almanac, Shelfmark, Satchel, lantern,
  public-resource-map, newspapper. atrium (`modules/<name>/`) and
  comercial-website (`modules/*.ts` plus `repositories/`) split by feature.
  The smallest servers are flat files in `src/`: the-board, wicket, the mini
  todo app.
- **Dependencies are passed as plugin options.** Almanac's
  `FeatureContext`, an interface handed to every route plugin, means no
  decorators and no `declare module "fastify"`.
- **Validation is by hand.** 12 servers call
  `schema.parse(request.body)` inside handlers. Of the 17 servers that
  could be measured:
  - none uses a type provider;
  - only ward-auth has any route `schema:` (5 files);
  - none declares response schemas, so every reply goes through
    `JSON.stringify`, and a field added to a store row leaks to the client;
  - none uses `fastify-plugin`.
- **App and server are mostly split already** (`app.ts` plus
  `index.ts`/`server.ts`), and tests use `app.inject()` in 13 servers. The
  test runner is mixed: vitest in most, `node:test` in atrium.
- **Dev and production.** Dev runs on `tsx watch`; production builds with
  `tsc` to `dist/`. Imports carry `.js` suffixes, except ro-housing, which
  uses `.ts`.
- **No repo has CI.** This library's own rules forbid adding any.

### What the research found

Sources read on 2026-11-09:

- **Fastify's own docs** at the fastify repo's `docs/` (main at `0b076ca`,
  2026-11-07), covering Plugins-Guide, Encapsulation, Type-Providers,
  Testing and Recommendations. fastify.dev itself was blocked in that
  session's network.
- **The official reference app `fastify/demo`** (`895908e`, 2026-10-22,
  MIT).
- **Matteo Collina's `fastify-best-practices` skill** in `mcollina/skills`
  (`c75d70d`, 2026-10-18, MIT).
- **Community write-ups**, which agree with the above and add nothing.

What they say:

1. **Split the app from the server.** `app.ts` exports a factory or plugin
   that registers everything and never listens. `server.ts` builds it,
   listens and handles shutdown. Tests import only the app. (Testing guide,
   the demo, Collina.)
2. **Encapsulation is the architecture.** Every `register` makes a child
   scope. Cross-cutting infrastructure (db, auth, sensible defaults) is
   wrapped in `fastify-plugin` so it reaches siblings. Features stay
   encapsulated. Register order: external plugins, then app plugins, then
   routes. (Plugins guide, the demo's `plugins/external`, `plugins/app` and
   `routes/`.)
3. **A modular monolith, by feature.** The demo's `routes/README` says to
   group by domain, and that a growing file becomes a folder with an
   `index.ts`. Collina says routes by feature. Pure helpers go in `lib/` with
   no Fastify import.
4. **Schema-first.** Declare `body`, `querystring`, `params` and `response`
   schemas on every route, which gives validation, fast serialization and
   response filtering. Type the handlers through a type provider. Provider
   types don't propagate across plugins, so a plugin in its own file is
   typed with the provider's plugin type. The official providers are TypeBox
   (`@fastify/type-provider-typebox` 6.3.0, the demo's choice), Zod
   (`@fastify/type-provider-zod` 1.0.3, now under the fastify org, zod
   ≥4.2) and json-schema-to-ts.
5. **Configuration** is environment variables only: parsed and validated
   once, no config files, no per-environment objects, and no `NODE_ENV`
   checks (Collina's "anti-patterns"; the demo's `server.ts` comment).
6. **Production.**
   - One error handler: no 5xx detail to clients, and the request logged
     with the error.
   - A rate-limited 404 handler.
   - `close-with-grace` for shutdown.
   - Explicit `connectionTimeout`, `requestTimeout` and `keepAliveTimeout`.
   - `trustProxy` behind the reverse proxy (Caddy here).
   - Listen on the host the deploy needs.
   - Pino logging, pretty only on a TTY.
7. **Data access** through repository functions built from the db handle.
   The demo makes them `fastify-plugin` decorators.
8. **Tests** with `inject()` against the built app, a helper that builds and
   closes it per test, and validation-failure tests.
9. **Autoload** (`@fastify/autoload` 6.5.1) is common, and the demo uses
   it, but it is optional. Some practitioners reject the file-system magic.

**A scratch spike on 2026-11-09 confirmed decision 4's design.** The
setup:

- fastify 5.12.8;
- `@fastify/type-provider-zod` 1.0.3;
- zod 4.6.7;
- typescript 6.0.3, `--strict --module nodenext`.

The results:

- A plugin in its own file typed as `FastifyPluginAsyncZod` gets a typed
  `request.body`, and it typechecks.
- A `response: { 201: Book }` schema **stripped an extra `secret` field**
  from the reply. This is the leak protection the estate lacks today.
- A bad body comes back through `hasZodFastifySchemaValidationErrors(err)`
  with `err.validation[].instancePath` and `.message`, ready to map to the
  house `{ error, issues }` body.
- The file ran unchanged under `node --experimental-strip-types`.

The runtime exports are:

- `validatorCompiler`, `serializerCompiler`, `createSerializerCompiler`;
- `hasZodFastifySchemaValidationErrors`, `isResponseSerializationError`,
  `ResponseSerializationError`, `InvalidSchemaError`;
- `jsonSchemaTransform` and `jsonSchemaTransformObject`, for
  `@fastify/swagger` if wanted.

**The provider needs zod ≥4.2.** On 2026-11-09, three servers still
resolved zod 3: atrium (3.25.76), comercial-website's `backend` (3.24.1)
and public-resource-map (3.25.76). Their rows in brief 16 start with a zod
4 move. Every other repo was on 4.3.6-4.6.7.

**Found while writing Almanac's repo briefs (2026-11-09):**

- **The provider's serializer throws on any zod `.transform()`** (reproduced on zod 4.5.4). Almanac's `occurrenceSchema` has one, so it would answer 500. Rule 6 becomes: response schemas are **transform-free output schemas**. A schema that transforms on input gets a separate output schema, or the transform moves into the handler or store.
- **Required peers.** The provider makes npm install `@fastify/swagger` and `openapi-types` as required peers. Pin both, and note them in each repo's dependency page.
- **The error body.** Almanac's is `{ error: { code, message } }`, and its web client parses that. The skill prescribes **one handler and the repo's existing body shape**, not a new estate-wide shape (rule 8).

Fastify 6 is in alpha (`6.0.0-alpha.6` on the `next` tag, latest 5.12.8).
The skill targets 5.x and says so.

### Owner decisions (defaults this brief builds)

1. **Group by feature.** Default: `server/src/features/<name>/`, with
   `routes.ts`, `store.ts` and optional `service.ts` and `*.test.ts`. This
   is the research consensus and the shape atrium and comercial-website
   already have. Rejected: the layer split most repos have, which spreads
   one change across `routes/`, `store/` and `db/`. The folder is named
   `features`, matching Almanac's `FeatureContext`, not `modules`.
2. **Dependencies as typed plugin options.** Default: keep the house
   `FeatureContext`, an object built in `app.ts` and passed to each feature
   plugin as its options. Decorators are used only for request-scoped values
   (`request.user`). Rejected: the demo's decorator-per-repository with
   `declare module "fastify"` merging. It is global, harder to grep, and
   every repo would have to change its habit.
3. **Explicit registration.** Default: `app.ts` imports and registers each
   plugin and feature by name. Rejected: `@fastify/autoload`, because a
   feature registered by its file's existence can't be found with grep and
   loses its option types.
4. **Zod route schemas through the official provider.** Default: every route
   declares `body`, `querystring`, `params` and `response` with the zod
   schemas from `shared/`, through `@fastify/type-provider-zod`, and no
   handler calls `.parse()` on request input. Rejected: TypeBox, the demo's
   choice and Collina's default. It would need a second schema next to the
   zod one that the web forms already use.
5. **Tests.** Default: each repo keeps its runner, and each feature gets
   `inject()` tests through a `testing/buildTestApp.ts`, where the repo's
   decisions allow it. Shelfmark's decisions say "nothing boots the app";
   that repo keeps its rule until the owner revisits it.
6. **Version.** Default: v0.36.0, after brief 02's v0.35.0.
7. **Import boundaries through dependency-cruiser.** Added 2026-11-09 from
   the review of mattpocock/skills (brief 18). Default: rules 5 and 7
   below (feature boundaries, and no Fastify in `lib/`) become
   dependency-cruiser rules, pinned in each repo's devDependencies with a
   `.dependency-cruiser.cjs` the skill ships. The hand-written checker keeps
   only what dependency-cruiser can't express. The design comes from Matt
   Pocock's `setup-ts-deep-modules` (MIT): a folder's root files are its
   entry points, anything in a subfolder is private, no cycles, and a
   proof that the rules bite. Take the ideas, copy no text. Rejected:
   regex import checks in `check-structure.mjs`, which miss re-exports and
   path aliases.
8. **Unused files, exports and dependencies through knip.** Added
   2026-11-09 from the review of pingdotgg/t3code (brief 26). Default:
   `knip` (pinned) runs in `check:conventions`. It reports
   `--include files,dependencies` strictly and `exports` as a warning, and
   the skill ships a starter `knip.json` for the shared/server/web
   workspaces. It would have caught lantern's unused `@base-ui/react`
   (brief 13). Rejected: nothing in its place, which is how dead
   dependencies pile up today.

## Decisions of 2026-11-10

From the owner's grilling; the technical calls are on
[grilling-2026-11-10-technical-calls.md](../../wiki/grilling-2026-11-10-technical-calls.md).
Work happens on `main` with no PRs (Q4). Brief 16 is now a tracker of each
repo's server brief.

- **Q23.** `features/<name>/` is the folder, confirmed.
- **Q24.** Typed plugin options with explicit registration, confirmed. No
  decorators as a test seam: tests pass dependencies as plugin options (Q56).
- **Q25.** A response schema on every route. Pass-through JSON uses a loose
  object. **Q53:** streams and binary routes (Newspapper's 7 streams,
  lantern's posters) are exempt, each with a `conventions.json` entry.
- **Q26.** Shelfmark's "nothing boots the app" decision stands: its server
  brief tests handlers and plugins without `inject()`.
- **Q27.** atrium stays on `node:test`, and every other repo uses vitest.
- **Q28.** sports-app's plain `.mjs` server is converted to TypeScript in its
  server brief. It **keeps TypeBox** for its `shared/api.ts`, so the zod rule
  reads "zod, or the repo's existing schema library".
- **Q43.** One error handler, keeping the repo's body shape. It passes
  Fastify's own 4xx through and never echoes a thrown message.
- **Q52.** Validation before authorisation is accepted (three Satchel
  routes). **Q54:** a big `store.ts` stays whole in `db/` (Satchel's has 24
  methods and one transaction over 3 tables; the-board's tickets and runs
  import each other's stores). **Q55:** a zod schema lives in `shared/` when
  the client imports it, otherwise in its feature folder. **Q56:** one
  `ApiError` class stays, and a feature's CLI may live beside it.
- **Checker roots.** The checkers and the skill's path rules read the repo's
  roots from `conventions.json` (atrium's `apps/api`, `apps/web` and
  `packages/shared`; public-resource-map's `backend/`), not fixed
  `server/ web/ shared/` paths.
- **Config read at import time is allowed.** A `loadConfig(env)` factory is
  required only where a repo can take it without a large change (atrium).
- **NestJS carve-out.** imbatranimOS's backend is NestJS and is out of the
  structure.
- **The entry rename** (`index.ts` to `server.ts`) changes the Dockerfile
  `CMD` in the same commit (Q1).
- **Layered modules and cycles.** "Reach another feature only through its
  `index.ts`" gets a cycle-breaking step or recorded exceptions (atrium: 24
  cross-reaches, three cycles).

## Facts found writing the repo briefs (2026-11-10)

Detail and evidence are in brief 16's "Server facts" section. The skill and
`migrating-a-server.md` carry each as a step or a trap:

- the zod provider throws on `.transform()` in a response schema, and resolves
  a second zod copy unless a root `overrides` dedupes it;
- a response schema's declared status that the handler doesn't send itself
  (a guard's 401) becomes a 500: declare only what each handler sends;
- set `connectionTimeout` and `requestTimeout` per repo (long polls, slow
  SMTP, large uploads);
- the `.parse(request.` grep misses helper parsing and `safeParse(req.`, so
  the structure checker needs a better test;
- env loaders fail quietly: `config.ts` loads `.env` by explicit path, fails
  loudly, and parses with zod (`PORT=abc`, an empty list variable);
- `npm test` fails on a fresh clone without a prior build, so every server has
  a `pretest`;
- Fastify's own 4xx answer 500 without a `statusCode` branch, and with no
  handler the default leaks the thrown message;
- `logger: false` makes `app.log.error` a no-op;
- a shared plugin library takes config as plugin options;
- `await-thenable` flags awaits on Drizzle's synchronous better-sqlite3 calls;
- zod 4's issue messages differ from zod 3's;
- the proof a response schema changes nothing is a byte compare: serialise
  every fixture through the zod type provider and compare with
  `JSON.stringify`.

## Files you OWN

- `skills/code-structure/SKILL.md` (new)
- `skills/code-structure/references/*.md` (new)
- `skills/code-structure/scripts/check-structure.mjs` (new), with its
  fixtures and test
- `README.md`, `docs/history.md`, both plugin files, this repo's `corpus/`
  (status, log, decisions)

## Files you must NOT touch

- Any other repo. Restructuring servers is brief 16.
- `skills/base-ui/`, which is brief 02. Link to it for the web `ui/` rules.
- `skills/bootstrap-vps-deploy/`. Link to it for the deploy side.

## What to do

1. **`SKILL.md`.** It triggers on:
   - "code structure", "project layout", "where does this go";
   - "new feature folder";
   - "structure the server", "Fastify app", "add a route", "add an
     endpoint";
   - "restructure", "/code-structure".

   It opens with the target tree:

   ```
   <repo>/
     package.json         npm workspaces: shared, server, web
     shared/src/          zod schemas and types: the API contract
     server/src/
       server.ts          entry: config → buildApp → listen; shutdown; nothing else
       app.ts             buildApp(config) → FastifyInstance; plugins, then features; never listens
       config.ts          the one env parse (zod), typed Config; the only reader of process.env
       plugins/           cross-cutting, fastify-plugin wrapped: db, auth, errors, security, static
       features/<name>/   routes.ts (an encapsulated plugin), store.ts (SQL), service.ts?, *.test.ts
       db/                open + migrations
       lib/               pure helpers, no fastify import
       testing/           buildTestApp, fakes, fixtures
     web/src/
       main.tsx, App.tsx, router.ts
       components/ui/     Base UI wrappers (see the base-ui skill)
       features/<name>/   pages, components, hooks and api calls for one domain
       lib/               cn, the api client, pure helpers
       styles/index.css   the one stylesheet (Tailwind)
   ```

   Then come the rules, numbered, each with its why, its source (the docs,
   the demo or Collina, cited by name) and its checker id:
   1. `server.ts` is the only file that calls `listen`. It builds the app,
      sets timeouts and `trustProxy`, and wires `close-with-grace`.
   2. `app.ts` exports `buildApp(config)` and registers in a fixed order:
      plugins (external, then app), then features.
   3. `config.ts` is the only file that reads `process.env`. It does not
      read `NODE_ENV`.
   4. Cross-cutting plugins are `fastify-plugin` wrapped. Features are not,
      so their hooks stay inside.
   5. A feature is a folder under `features/`. Another feature imports it
      only through its `index.ts`, if at all.
   6. Every route declares its schemas, `response` included, from
      `shared/`, through the zod type provider. No `.parse()` of request
      input in a handler.
   7. Handlers stay thin. SQL lives in `store.ts`, logic shared between
      routes in `service.ts`, and pure code in `lib/`, which never imports
      Fastify.
   8. Errors.
      - Throw `ApiError(code, message)`.
      - One handler maps errors to `{ error, message, issues? }`.
      - A 5xx never shows its message to the client.
      - The 404 handler is rate-limited where `@fastify/rate-limit` is
        present.
   9. Each feature has `inject()` tests through `buildTestApp`, where the
      repo's decisions allow.
   10. Web: one folder per feature, wrappers in `components/ui/`, and no
       feature importing another feature's internals.
   11. A file over about 400 lines is a warning. Split it by sub-domain
       before adding to it.

2. **`references/`**:
   - `research.md`: the findings above, with the pinned sources and the
     date.
   - `server-skeleton.md`: copyable `server.ts`, `app.ts`, `config.ts`,
     `plugins/errors.ts`, one feature with zod schemas and the provider,
     and `testing/buildTestApp.ts`. Check them against Fastify 5.12.x and
     `@fastify/type-provider-zod` 1.0.x types.
   - `zod-type-provider.md`: setup, typing a plugin in its own file, a
     response schema per status, and how a zod issue becomes the error
     body.
   - `web-skeleton.md`: the `web/src` tree and the api client.
   - `migrating-a-server.md`: the order brief 16 follows (step 4).

   Follow this library's rule on unvendored sources: take the ideas, copy
   no text. Credit the demo and Collina's skill in `research.md`.

3. **`scripts/check-structure.mjs`.** A zero-dependency Node ≥22 module:
   `node check-structure.mjs [repo-root]`. It finds `server/` and `web/` (or
   says it found neither) and prints `file:line rule-N message`. Checks:
   - rule 1: `listen(` anywhere but `server.ts`;
   - rule 2: no exported `buildApp` in `app.ts`;
   - rule 3: `process.env` outside `config.ts` (tests excepted), and any
     `NODE_ENV`;
   - rule 5: an import of `features/<a>/…` from `features/<b>/` other than
     its `index`;
   - rule 6: `.parse(request.` / `.safeParse(request.`, and a route
     registration with no `schema` (a heuristic);
   - rule 7: a `fastify` import under `lib/`;
   - rule 11: the file-size warning.

   Exit 1 on errors. Each of brief 16's per-repo rows starts with warnings
   only, through `--warn-only`. A repo drops the flag once it has migrated.
   Add fixtures and a `node --test` file.

   Rules 5 and 7 are enforced by the shipped `.dependency-cruiser.cjs`
   (decision 7), and unused files and dependencies by knip (decision 8).
   `check:conventions` runs all three. Prove each rule bites with a
   deliberate violation in the fixtures.

4. **`migrating-a-server.md`.** The order is chosen so that each step leaves
   the server working:
   1. `config.ts` and the `server.ts` / `app.ts` split.
   2. The error plugin.
   3. Move each `routes/x.ts` and `store/x.ts` into `features/x/`.
   4. Add the type provider, and convert one feature at a time to route
      schemas with response schemas. Each conversion is one commit with its
      tests green. Response schemas strip unknown fields, so first compare
      the old and new JSON for every route the web calls.
   5. Drop `--warn-only`.

5. **Wire it up.** Add the README row, the `docs/history.md` entry and the
   v0.36.0 bump. Update `corpus/wiki/status.md` and `log.md`. Add
   `decisions.md` entries for owner decisions 1-4 above, with their
   rejected alternatives.

## Acceptance

- The skill loads by its description, and every rule names its source and
  checker id.
- The skeletons compile with `tsc --noEmit` in a scratch workspace with
  `fastify@5.12.x`, `@fastify/type-provider-zod@1.0.x` and `zod@4.x`, and
  `buildTestApp` plus one `inject()` test passes there.
- `node --test skills/code-structure/scripts/` passes, with a failing and a
  passing fixture per rule.
- `depcruise` with the shipped config fails on the boundary fixture and
  passes on the clean one, and `knip` flags the fixture's unused
  dependency.
- Run with `--warn-only` against scratch copies of Almanac and atrium, the
  checker exits 0 and lists the gaps. Paste the counts into the outcome
  note, for brief 16's table.
- `bash corpus/lint.sh` passes, and the version reads 0.36.0.
