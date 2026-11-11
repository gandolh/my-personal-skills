# Research

What the code-structure rules rest on: the sources read on 2026-11-09, what
they agree on, the spike that tested the design, the facts the estate's
repo briefs found, and what this skill's build measured on 2026-11-11. The
sources are credited here and in the library's `ATTRIBUTION.md`; their ideas
were taken and written fresh, and no text was copied.

## The sources

Read on 2026-11-09:

| Source | Pin | License | What it is |
|---|---|---|---|
| Fastify's own docs, the [fastify repo's `docs/`](https://github.com/fastify/fastify/tree/main/docs): the Plugins guide, the Encapsulation and Type-Providers references, the Testing guide and Recommendations | `main` at `0b076ca`, 2026-11-07 | MIT | The framework's own guidance. fastify.dev was unreachable from that session, so the repo was read instead |
| The official reference app, [fastify/demo](https://github.com/fastify/demo) | `895908e`, 2026-10-22 | MIT | A whole app: `server.ts` and `app.ts`, `plugins/external`, `plugins/app`, `routes/`, repositories as plugins, a test helper |
| Matteo Collina's `fastify-best-practices` skill, in [mcollina/skills](https://github.com/mcollina/skills) | `c75d70d`, 2026-10-18 | MIT | A Fastify lead maintainer's rules for agents, with a list of anti-patterns |
| Matt Pocock's `setup-ts-deep-modules`, in [mattpocock/skills](https://github.com/mattpocock/skills) | reviewed 2026-11-09 (library brief 18) | MIT | A folder's root files are its entry points, the rest is private, no cycles, and a proof that the rules bite: the design of the dependency-cruiser preset |
| Community write-ups | 2026-11-09 | | They agree with the above and add nothing |

Rechecked on 2026-11-11 for this build: the docs as shipped in the `fastify`
5.12.8 package, which the rules cite by name (the app and server split in
the Testing guide; "Scoped Type-Provider"; the Validation-and-Serialization
reference on output schemas raising throughput and preventing accidental
disclosure; the Errors reference on what the default handler sends; the
timeout defaults in the Server reference), and Caddy's `reverse_proxy` page
(its upstream `keepalive` defaults to 2 minutes).

## What they agree on

1. **Split the app from the server.** One module builds the app and never
   listens; the entry builds it, listens and shuts down. Tests import only
   the app. (The Testing guide, the demo, Collina.) Rule 1, rule 2.
2. **Encapsulation is the architecture.** Each `register` makes a child
   scope; cross-cutting infrastructure is wrapped in `fastify-plugin` so it
   reaches its siblings, and features stay encapsulated. Register external
   plugins, then the app's, then routes. (The Plugins guide; the demo's
   folders.) Rules 2 and 4.
3. **Group by feature.** The demo's routes README groups by domain and turns
   a growing file into a folder with an index; Collina organises routes by
   feature. Pure helpers sit apart with no Fastify import. Rules 5, 7, 10
   and 11.
4. **Schemas first.** Declare `body`, `querystring`, `params` and `response`
   on every route: validation, fast serialisation, and a reply filtered to
   its schema. Type handlers through a type provider. Provider types don't
   cross plugin boundaries, so a plugin in its own file is typed with the
   provider's plugin type. The official providers are TypeBox
   (`@fastify/type-provider-typebox` 6.3.0, the demo's), zod
   (`@fastify/type-provider-zod` 1.0.3, now in the fastify organisation,
   zod 4.2 or later) and json-schema-to-ts. Rule 6.
5. **Configuration is the environment.** Parse and validate it once; no
   config files, no per-environment objects, no `NODE_ENV` branches
   (Collina's anti-patterns; a comment in the demo's `server.ts`). Rule 3.
6. **Production.** One error handler that hides 5xx detail and logs the
   request with the error; a rate-limited 404; `close-with-grace` for
   shutdown; explicit `connectionTimeout`, `requestTimeout` and
   `keepAliveTimeout`; `trustProxy` behind the reverse proxy; listening on
   the host the deploy needs; pino, pretty only on a terminal. Rules 1 and 8.
7. **Data access through repository functions** built from the database
   handle; the demo makes them `fastify-plugin` decorators. Rule 7.
8. **Tests with `inject()`** against the built app, through a helper that
   builds and closes it per test, with validation failures among them.
   (The Testing guide, the demo, Collina.) Rule 9.
9. **Autoload** (`@fastify/autoload` 6.5.1) is common, and the demo uses
   it, but it is optional, and some practitioners reject loading by file
   name.

## What the skill took, and what it turned down

The owner's decisions of 2026-11-09, confirmed in the grilling of
2026-11-10, chose between the sources and the estate's habits. Each is in
the library's `corpus/wiki/decisions.md` with its reason.

- **Taken as the sources say:** the app and server split, encapsulation and
  `fastify-plugin`, feature folders, schemas on every route through a type
  provider, the environment as the only configuration, the production
  list, `inject()` tests.
- **Folders named `features/`, not `modules/`** (decision 1, Q23), matching
  Almanac's `FeatureContext`. The layer split most repos have was turned
  down: one change spreads over `routes/`, `store/` and `db/`.
- **Dependencies as typed plugin options, not decorators** (decision 2,
  Q24). The demo's decorator per repository, merged into
  `declare module "fastify"`, is global and hard to grep, and every repo
  would change its habit. A decorator holds only a request-scoped value.
- **Explicit registration, no autoload** (decision 3). A feature loaded
  because its file exists can't be found with grep and loses its option
  types.
- **zod through the official provider, not TypeBox** (decision 4). TypeBox
  is the demo's and Collina's default, but the estate's web forms already
  validate with zod schemas from `shared/`; TypeBox would mean a second
  schema beside each. sports-app keeps TypeBox for its existing contract
  (Q28).
- **Boundaries through dependency-cruiser, unused code through knip**
  (decisions 7 and 8), rather than regex import checks, which miss
  re-exports and aliases.

## The spike of 2026-11-09

fastify 5.12.8, `@fastify/type-provider-zod` 1.0.3, zod 4.6.7 and TypeScript
6.0.3 (`--strict --module nodenext`):

- a plugin in its own file typed `FastifyPluginAsyncZod` got a typed
  `request.body`, and type-checked;
- a `response: { 201: Book }` schema stripped an extra `secret` field from
  the reply, the leak protection the estate lacked;
- a bad body reached the error handler through
  `hasZodFastifySchemaValidationErrors(err)`, with `err.validation[]`
  carrying `instancePath` and `message`;
- the file ran unchanged under Node's type stripping.

## Facts the repo briefs found (2026-11-09 and 2026-11-10)

Each is a step or a trap in [migrating-a-server.md](migrating-a-server.md)
or [zod-type-provider.md](zod-type-provider.md); the evidence is in the
library's brief 16.

- The provider's serializer throws on any `.transform()` in a response
  schema (Almanac's `occurrenceSchema`, Shelfmark's `savedViewSchema.state`).
- It makes npm install `@fastify/swagger` and `openapi-types` as required
  peers, and it can resolve a second zod copy (the-board).
- A declared status the handler doesn't send itself, such as a guard's 401,
  becomes a 500 (wicket).
- Long polls, slow SMTP and large uploads need their own
  `connectionTimeout` and `requestTimeout`.
- `.parse(request.` misses helper parsing and `safeParse(req.`.
- Env loaders swallow a missing `.env`; `PORT=abc` gives `NaN`; an empty list
  variable silently turns CORS off.
- `npm test` fails on a fresh clone without a build in four servers.
- An error handler without a `statusCode` branch turns Fastify's own 4xx
  into 500s; with no handler, the default sends the thrown message.
- `logger: false` makes `app.log.error` a no-op.
- A shared plugin library (comercial-website's `backend/core`) takes its
  config as plugin options.
- zod 4's issue messages differ from zod 3's.
- The proof a response schema changes nothing is a byte compare
  (byte-identical for 3D-sandbox's three scenes).
- Almanac's error body is `{ error: { code, message } }`, so the skill keeps
  each repo's body rather than setting an estate-wide one.

## Measured for this build (2026-11-11)

On the versions in the SKILL's pins:

- A `.strict()` response schema answers 500 on a reply with an extra field;
  `z.looseObject({})` and `z.record(z.string(), z.unknown())` pass it
  through; a `z.codec` encodes; a `.transform()` answers 500 with
  "Encountered unidirectional transform during encode".
- A route declaring a 401 schema whose `preHandler` guard sends a different
  401 body answers 500; undeclared, the guard's body goes out as sent.
- A `preHandler` guard runs after validation (a bad body is a 400 even when
  signed out); an `onRequest` guard refuses first.
- A 204 declared `z.null()`, with the handler returning `null`, sends no
  body.
- Fastify's default error handler sent a thrown 500's message to the client.
- `trustProxy: ["loopback"]` believes `X-Forwarded-For` from a loopback
  peer.
- `@fastify/rate-limit` 11.2.2's 429 reaches the app's error handler as a
  4xx with its own message.
- A feature importing `type FeatureContext` from `app.ts` is a
  `no-circular` error under the house dependency-cruiser preset, which
  counts type-only imports; lowered to `warn` by name in the repo's
  config, it passes.
- `feature-through-index` reports a reach into another feature's files
  under `web/src/features/` as well as the server's.
