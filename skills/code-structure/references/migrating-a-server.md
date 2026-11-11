# Migrating a server

The order every server brief follows. The library's brief 16 tracks the
briefs, smallest server first, and lists the facts each one uses. The order
is chosen so that every step leaves the server working: typecheck, tests,
lint and build green, and the server starting in dev, from `dist/`, and with
the command its container's `CMD` runs. One commit per step, and in step 4
one per feature.

`check-structure --warn-only` counted the gaps on 2026-11-11: Almanac 36,
atrium 136, wicket 21 (the per-rule counts are on the library's
`corpus/wiki/house-style-part-2.md`). Each step below removes a known part
of that count.

## Before step 1

- **The harness is in.** The repo's house-style brief added
  `check:conventions`: knip, `depcruise`, and `check-structure --warn-only`.
  Any dependency-cruiser rule it couldn't pass is lowered to `warn` in the
  repo's `.dependency-cruiser.cjs`, with a dated comment. This migration
  doesn't add dependency-cruiser; it raises those rules again in step 5.
- **The versions are in.** Fastify 5.12.x (SocialEvents moves from 5.8.5
  first) and zod 4.2 or later (atrium, comercial-website's `backend` and
  public-resource-map move from zod 3 first, each in its own commit).
- **A `pretest` exists.** A fresh clone fails `npm test` without a build in
  Satchel, the-board, Shelfmark and lantern. Add it first, so every later
  step's tests run from clean.
- **The JSON is captured.** On a seeded database, save the reply of every
  route the web calls: method, path, status and body. Step 4 compares
  against it.

## 1. `config.ts`, and the `server.ts` / `app.ts` split

- **`config.ts`** becomes the only reader of `process.env`: one zod parse
  into a typed `Config`, `.env` loaded by an explicit path from the file's
  own location, a `ConfigError` naming every bad variable
  ([server-skeleton.md](server-skeleton.md)). Copied `REPO_ROOT` constants
  and env loaders elsewhere go. A `NODE_ENV` check becomes a setting named
  for what it switches.
- **Config read at import time may stay** where a `loadConfig(env)` factory
  would be a large change (atrium's import-time constants and the test setup
  that depends on them). The reads still happen in `config.ts`.
- **`app.ts`** exports `buildApp(config, options)` and never listens. Routes
  that live inside `app.ts` today (wicket, ro-housing) stay there until
  step 3; only the split happens here.
- **`server.ts`**, renamed from `index.ts`, reads the settings, builds the
  app with the logger, `trustProxy` and the repo's timeouts, wires
  `close-with-grace` and listens. The rename changes, in the same commit,
  the Dockerfile's `CMD` (`node server/dist/server.js`), the package's
  `main`, `start` and `dev` scripts, and any doc that names the entry (Q1).
- **Set the timeouts for the repo**: `connectionTimeout` above the longest
  silent wait (wicket's 25 s long poll, lantern's 26 s record route,
  ward-auth's slow SMTP), and `requestTimeout` at 0 or raised where uploads
  are large (comercial-website's 500 MB multipart).
- **CLIs and scripts.** A CLI inside the app (a seed command) reads its
  settings through `config.ts` and goes in `houseStyle()`'s `console`
  option, which lets it print. A script run by hand moves out of the source
  roots, into `scripts/`, which may print and read the environment.
- **Check:** `check-structure` reports no rule 1, 2 or 3 finding, still with
  `--warn-only`.

## 2. The error plugin

- **`plugins/errors.ts`**, wrapped in `fastify-plugin`, holds the one error
  handler and the 404 handler, in the repo's existing body shape (Q43). The
  one `ApiError` class stays where it is if the repo has one (Q56), or goes
  in `lib/`.
- **Pass Fastify's own 4xx through.** A handler without a `statusCode`
  branch turns bad JSON or an oversized body into a 500 (comercial-website,
  and likely every copy of that shape).
- **Never echo a thrown message.** With no handler at all
  (public-resource-map), Fastify's default sends the thrown message, a
  500's included.
- **Turn the logger on** in `server.ts`: under `logger: false`,
  `app.log.error` does nothing, and a server that says it logs its 500s
  logs none.
- **Rate-limit the 404 handler** where `@fastify/rate-limit` is installed;
  otherwise leave it plain.
- **Tests:** a thrown error answers 500 with the fixed message, bad JSON
  stays 400, and an unknown route gets the repo's 404 body.

## 3. Feature folders

- **Move each `routes/x.ts` and `store/x.ts` into `features/x/`** with
  `git mv`, as `routes.ts` and `store.ts`, and add the folder's `index.ts`.
  `app.ts` imports each feature through its index. Behaviour doesn't
  change, so the tests don't either.
- **A store too big to split stays whole in `db/`** (Q54): Satchel's has 24
  methods and one transaction over 3 tables, and the-board's tickets and runs
  import each other's stores.
- **Pure modules go to `lib/`**, which never imports Fastify: Almanac's
  `recurrence/`, lantern's `suggest/`, imbatranim-apps' converter.
- **A feature's CLI may live beside it** (Q56).
- **Break the `FeatureContext` cycle.** A route file that imports
  `type FeatureContext` from `app.ts` closes a cycle (`app.ts` → the
  feature's index → its routes → `app.ts`), and dependency-cruiser counts
  type-only imports. Each feature's plugin names what it takes in its own
  options type instead, and `app.ts` passes the whole context.
- **Cross-feature reaches go through the index, or go.** For each import of
  another feature's insides: import it from that feature's index; move the
  shared part down to `lib/` or `db/`; or merge two features that can't live
  apart. atrium has 24 such reaches and three cycles. One that must stay
  until later is recorded: the rule stays lowered with its dated comment.
- **Check:** `depcruise` reports no `feature-through-index`,
  `lib-without-fastify` or `no-circular` error.

## 4. The type provider, one feature at a time

First one commit: the provider, its peers and the pins, and the two
compilers in `buildApp` ([zod-type-provider.md](zod-type-provider.md)).
Nothing changes yet, because no route has a schema.

Then one commit per feature, each with its tests green:

1. **Read the client's real payloads** for the feature's routes. A schema
   stricter than the old handler breaks the client (the mini todo app's
   `PATCH` takes `0 | 1 | boolean`).
2. **Declare the schemas**: `params`, `querystring` and `body` as the route
   takes them; `response` for each status the handler sends itself, and no
   other (a declared 401 that a guard answers differently is a 500). zod from
   `shared/` when the client imports it, else in the feature folder (Q55).
3. **Split what transforms.** A response schema holds no `.transform()`
   (Almanac's `occurrenceSchema`, Shelfmark's `savedViewSchema.state`) and
   no `.strict()`; give it an output schema of its own.
4. **Delete the hand parsing**, request and reply both: every
   `schema.parse(request.body)`, every helper given `request.query` (the
   grep misses those: wicket 5, lantern 13, public-resource-map 14), and
   atrium's `schema.parse()` of its own replies.
5. **Compare the bytes** of every captured reply with
   `compareReplies` ([zod-type-provider.md](zod-type-provider.md)). A
   dropped field is a leak, kept dropped and noted in `log.md`, or a field
   the schema missed, added. A reorder is harmless. A failure is a 500 to
   fix before the commit.
6. **Test it**: the feature's `inject()` tests through `buildTestApp`,
   including a schema failure (Shelfmark's tests stay off `inject()`, Q26).
7. **Mind the messages.** zod 4's issue text differs from zod 3's; a client
   that shows the first issue's message shows new words.

- **Streams and binary routes** (Newspapper's 7 streams, lantern's posters)
  declare their inputs and no response schema; each gets a
  `conventions.json` exception with its reason (Q53).
- **Validation runs before a `preHandler` guard** (Q52): a signed-out client
  with a bad body now gets 400 rather than 401. That is accepted.
- **sports-app keeps TypeBox** for its `shared/api.ts` (Q28), through
  `@fastify/type-provider-typebox`; the rest of this step reads the same.

## 5. Strict

- **Drop `--warn-only`** from `check-structure` in `check:conventions`. A
  finding the repo keeps becomes a `conventions.json` exception with its
  reason.
- **Raise every lowered dependency-cruiser rule** back to `error`: delete
  its override and its dated comment from `.dependency-cruiser.cjs`.
  `depcruise` exits 0.
- **Rewrite `.claude/rules/server.md`** to the rules as they now hold.
- **Write the log.** The repo's `log.md` entry carries the before-and-after
  JSON comparison and every dropped field with its verdict.

## Done when

- `check-structure` passes strict, or with exceptions in `conventions.json`.
- No handler parses request input, and every route has a `response` schema,
  except streams and binary routes with an entry.
- `typecheck`, `test`, `lint` and `build` pass, and the server starts in
  dev, from `dist/`, and with its container's `CMD` command.
