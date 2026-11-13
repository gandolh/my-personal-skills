# Migrating a server

The order every server brief follows. The library's brief 16 tracks the
briefs, smallest server first, and lists the facts each one uses. The order
is chosen so that every step leaves the server working: typecheck, tests,
lint and build green, and the server starting in dev, from `dist/`, and with
the command its container's `CMD` runs. One commit per step, and in step 4
one per feature.

`check-structure --warn-only` counted the gaps before each move: from 20
findings (wicket) to 116 (comercial-website), with rule 6 (routes with no
schema, hand parses) about two thirds or more of every count (the table of
all 17 is in the library's brief 16, in `corpus/briefs/done/`). Each step
below removes a known part of it, and 17 servers followed this order to
zero.

## Before step 1

- **The harness is in.** The repo's house-style brief added
  `check:conventions`: knip, `depcruise`, and `check-structure --warn-only`.
  Any dependency-cruiser rule it couldn't pass is lowered to `warn` in the
  repo's `.dependency-cruiser.cjs`, with a dated comment. This migration
  doesn't add dependency-cruiser; it raises those rules again in step 5.
- **The versions are in.** Fastify 5.12.x (SocialEvents moved from 5.8.5
  first) and zod **4.6.7**: 4.5.4 and earlier carry GHSA-mrhx-c7xc-m3w5, so a
  brief that says 4.5.4 or "no zod move" loses to the skill (Almanac,
  Shelfmark, atrium, ward-auth and most of the others bumped it; satchel
  stayed on 4.5.4 and asked the owner). atrium, comercial-website's
  `backend` and public-resource-map moved from zod 3 first, each in its own
  commit. `npm ls zod` shows one copy.
- **A zod bump in `shared/` reaches the web bundle,** so the deploy phase is
  `all`, not `server` (Almanac, Shelfmark, atrium), even though `web/` wasn't
  touched.
- **A `pretest` exists.** A fresh clone fails `npm test` without a build in
  Satchel, the-board, Shelfmark and lantern. Add it first, so every later
  step's tests run from clean.
- **The replies are captured.** Before any change, save the reply of every
  route, as each caller, with the error replies the client reads, through
  the real app on a seeded or in-memory database
  ([reply-capture.md](reply-capture.md)). Every step compares against it.
- **Clean `dist/` before a start or grep check.** `tsc --build` leaves the old
  files after a move or delete.

## 1. `config.ts`, and the `server.ts` / `app.ts` split

- **`config.ts`** becomes the only reader of `process.env`: one zod parse
  into a typed `Config`, `.env` loaded by an explicit path from the file's
  own location, a `ConfigError` naming every bad variable
  ([server-skeleton.md](server-skeleton.md)). Copied `REPO_ROOT` constants
  and env loaders elsewhere go. A `NODE_ENV` check becomes a setting named
  for what it switches.
- **Settings types live in `config.ts`,** and a path `buildApp` resolves
  keeps `:memory:` (wicket). A scratch run of the built server pins every
  setting, because `config.ts` still loads a `.env` for what is unset.
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
  `main`, `start`, `dev` and `exports`, and any doc that names the entry
  (Q1). Grep the whole repo for the old name: public-resource-map's
  Playwright config started `src/index.ts` and its ESLint `console` list named
  it, and a grep for `dist/index` found neither. A copy in another repo
  (imbatranim-apps' entry, named in imbatranimOS's catalog) is an owner
  step, written into the outcome.
- **Set the timeouts for the repo**: `connectionTimeout` above the longest
  silent wait (wicket's 25 s long poll, lantern's 26 s record route,
  ward-auth's slow SMTP), `requestTimeout` at 0 or raised where uploads are
  large (comercial-website's 500 MB multipart), and `keepAliveTimeout` above
  the proxy's. Measure the slow route first; the values and the shutdown
  that waits for a held response are on
  [shutdown-and-timeouts.md](shutdown-and-timeouts.md). An undeployed server
  may defer them, `trustProxy`, close-with-grace and a rate-limited 404, each
  with a decision entry.
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
- **Register it first,** and test it on a real route (newspapper's covered
  none of its routes).
- **Pass Fastify's own 4xx through.** A handler without a `statusCode`
  branch turns bad JSON or an oversized body into a 500 (comercial-website,
  and likely every copy of that shape).
- **`ApiError` is optional** where handlers send their own 4xx, and takes a
  `details` argument where a reply needs extra fields.
  [server-skeleton.md](server-skeleton.md) has both.
- **The fixed 500 message changes what a client shows** where it reads
  `message ?? error`: check, and list it under Deviations.
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
- **Sign-in code moves in two commits, read alone.** First `git mv` plus
  import paths only (Shelfmark's `accounts.ts` and `guard.ts` to
  `plugins/auth/`), then the registration out of `app.ts` into
  `plugins/auth/index.ts` under `fastify-plugin`, with an options type that
  carries what it needs (`fetch`, the trusted proxies) and the body
  unchanged. The vendored library stays untouched (Almanac, Shelfmark,
  ro-housing, comercial-website). Compare its replies byte for byte.
- **Domain modules** that aren't a feature (ward-auth's tokens, grants and
  OIDC code) move to `domain/<name>/`, with `git mv` and import paths only.
  Since house-style 1.3.0 the preset says the direction:
  `domain-not-to-features` (a domain module never imports a feature) and
  `app-through-feature-index` (`app.ts` through each feature's index). A repo
  whose domain folders still sit at the root keeps its own rule under the
  same name, which replaces the preset's `from` (ward-auth). sports-app's
  "a plugin never imports a feature" is a repo rule, not the preset's.
- **Break the `FeatureContext` cycle.** A route file that imports
  `type FeatureContext` from `app.ts` closes a cycle (`app.ts` → the
  feature's index → its routes → `app.ts`), and dependency-cruiser counts
  type-only imports. Each feature's plugin names what it takes in its own
  options type instead, and `app.ts` passes the whole context.
- **Cross-feature reaches go through the index, or go.** For each import of
  another feature's insides: import it from that feature's index; move the
  shared part down to `lib/` or `db/`; or merge two features that can't live
  apart. atrium has 24 such reaches and three cycles; moving the stores two
  features read down into `db/` (Q54: profiles, library, LaTeX) removed all
  three with no exception, and comercial-website did the same with four
  stores. A feature's index exports only what `app.ts` uses, and test helpers
  two features share go in `testing/`
  ([server-skeleton.md](server-skeleton.md)). One that must stay until later
  is recorded: the rule stays lowered with its dated comment, and lowered
  for the web app only, where the server's cycles are gone (Shelfmark).
- **Check:** `depcruise` reports no `feature-through-index`,
  `app-through-feature-index`, `domain-not-to-features`,
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
   other (a declared 401 that a guard answers differently is a 500, and a
   declared 4xx is generic, since it encodes every reply on that status). A
   guard that must keep its 401 or 403 before validation goes in
   `preValidation` or `onRequest`. zod from `shared/` when the client
   imports it, else in the feature folder (Q55).
3. **Split what transforms.** A response schema holds no `.transform()`
   (Almanac's `occurrenceSchema`, Shelfmark's `savedViewSchema.state`) and
   no `.strict()`; give it an output schema of its own.
4. **Delete the hand parsing**, request and reply both: every
   `schema.parse(request.body)`, every helper given `request.query`
   (a grep misses those: wicket 5, lantern 13, public-resource-map 14;
   `check-structure` 1.2.0 finds them), and atrium's `schema.parse()` of its
   own replies.
5. **Compare the replies** with the capture
   ([reply-capture.md](reply-capture.md)), or serialise static fixtures with
   `compareReplies` ([zod-type-provider.md](zod-type-provider.md)). A
   dropped field is a leak, kept dropped and noted in `log.md`, or a field
   the schema missed, added. A reorder is harmless. A failure is a 500 to
   fix before the commit. Remove one field from the schema once to see the
   compare change. Where stored data could fail a response schema, the owner
   checks the real data before the deploy.
6. **Test it**: the feature's `inject()` tests through `buildTestApp`,
   including a schema failure on the real in-memory database
   ([server-skeleton.md](server-skeleton.md)); Shelfmark's tests stay off
   `inject()` (Q26). Where the stores, the context and the schemas rewrite
   the same route files, one commit per feature is enough (the-board,
   lantern, SocialEvents).
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

- **Drop `--warn-only`** from `check-structure` in `check:conventions`, in
  the commit where it first reports 0 errors, not here, so strict guards
  every later step (the controller's ruling, 2026-11-11). A finding the repo
  keeps becomes a `conventions.json` exception with its reason. `match` is a
  substring test: match the finding's message exactly, or the exception hides
  every later finding in the same file that contains it (newspapper,
  ward-auth).
- **Raise every lowered dependency-cruiser rule** back to `error`: delete
  its override and its dated comment from `.dependency-cruiser.cjs`.
  `depcruise` exits 0.
- **Rewrite `.claude/rules/server.md`** to the rules as they now hold.
- **Write the log.** The repo's `log.md` entry carries the before-and-after
  reply comparison and every dropped field with its verdict, and the outcome
  lists `check-structure` before and after (errors, warnings, exceptions) for
  the library's table.

## Done when

- `check-structure` passes strict, or with exceptions in `conventions.json`.
- No handler parses request input, and every route has a `response` schema,
  except streams and binary routes with an entry.
- `typecheck`, `test`, `lint` and `build` pass, and the server starts in
  dev and from `dist/` on a real socket, and shuts down on SIGTERM with exit
  0 ([shutdown-and-timeouts.md](shutdown-and-timeouts.md)).
- **The owner checks after the deploy:** the container turns healthy on the
  new `CMD`, and `docker stop` ends at once. Local Docker can't build, so no
  builder ran the image.
