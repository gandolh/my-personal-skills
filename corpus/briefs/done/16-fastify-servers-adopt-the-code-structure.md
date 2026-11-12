# Task 16: The Fastify servers adopt the code structure (tracker)

This brief is a **tracker**. Each server's own brief, in its repo's corpus,
does the move, following `skills/code-structure/references/migrating-a-server.md`
(brief 03): `config.ts` and the `server.ts` / `app.ts` split, the error
plugin, `features/` folders, zod route schemas with response schemas one
feature at a time, then drop `--warn-only`. This page lists the briefs, the
order, and the server facts every one of them uses.

## Context

The survey of 2026-11-09 found Fastify 5.12.7 almost everywhere, no route
schemas outside ward-auth, no type provider, no `fastify-plugin`, and request
input validated by hand with zod in 12 servers. The type provider needs zod
4.2 or later (brief 03's spike).

Decided 2026-11-10:

- **Order** (technical call): smallest first, so the method is proven before
  the big ones.
  1. mini-projects, imbatranim-apps, 3D-sandbox, the-board, wicket, lantern;
  2. newspapper, SocialEvents, Satchel, Almanac, Shelfmark, ro-housing;
  3. public-resource-map, atrium, comercial-website, ward-auth.
- **The entry rename changes the Dockerfile (Q1).** pm2 is gone. Every
  service runs in a container built from the repo's `infrastructure/Dockerfile`,
  whose `CMD` names a file path (for example `node server/dist/index.js`).
  Renaming `index.ts` to `server.ts` must change that `CMD` in the same
  commit, and the repo owns the Dockerfile. The deploy runs no tests or lint,
  so the `Stop` hook and `npm run check` are the gate.
- **No PRs (Q4).** Each brief is built on `main` in the repo's main checkout.

## The servers

Briefs are in the repo's `corpus/briefs/todo/`.

| Repo (package) | Server brief | Notes |
|---|---|---|
| mini-projects (`literally-a-todo-app/backend`) | brief 05, *The server in the code structure* | no `app.ts` yet; add `buildApp` and a first test |
| imbatranim-apps (`server`) | brief 10, *The server in the code structure* | the converter is not HTTP; it stays in `lib/` |
| 3D-sandbox (`apps/api`) | brief 07, *The server in the code structure* | three entry files become two |
| the-board (`server`) | brief 19, *The server in the code structure* | `store.ts` stays whole in `db/` (Q54) |
| wicket (`server`) | brief 13, *The server in the code structure* | routes move out of `app.ts`; the long poll needs a timeout |
| lantern (`server`) | brief 18, *The server in the code structure* | `suggest/` is pure; the record route is slow |
| newspapper (`api`) | brief 11, *The API in the code structure* | streams are exempt from response schemas (Q53) |
| SocialEvents (`server`) | brief 17, *The server in the code structure* | Fastify 5.8.5, bump to 5.12.x first |
| Satchel (`server`) | brief 04, *The server in the code structure* | the websocket hub stays a plugin |
| almanac (`server`) | brief 04, *The server in the code structure* | already has `FeatureContext`; `recurrence/` is pure |
| shelfmark (`server`) | brief 08, *The server in the code structure* | tests handlers and plugins without `inject()` (Q26) |
| ro-housing (`api`) | brief 24, *The server in the code structure* | `.ts` import suffixes; routes live inside `app.ts` |
| public-resource-map (`backend`) | brief 05, *The server in the code structure* | zod 3 to 4 first; no error handler today |
| atrium (`apps/api`) | brief 04, *The server in the code structure* | zod 3 to 4 first; `modules/` to `features/`; stays on `node:test` (Q27) |
| comercial-website (`backend/app`, `backend/core`) | brief 13, *The server in the code structure* | zod 3 to 4 first; `backend/core` is a plugin library and takes config as options |
| ward-auth (`api`, `shared-library`) | brief 06, *The server in the code structure* | the only server with route schemas; keep `oidc-provider`'s mount; `shared-library` changes only with a version bump |
| sports-app (`server`) | brief 04, *The server in TypeScript and the code structure* | plain `.mjs` converted to TypeScript (Q28); **keeps TypeBox** for its `shared/api.ts` contract, so the zod rule reads "or the repo's existing schema library" |
| imbatranimOS | none | **NestJS**, not Fastify: carved out of the structure, of `erasableSyntaxOnly` and of the parameter-property ban (brief 27) |
| postern | none | no backend |

Out of scope: hackathons' ITFest backend (an archive) and dwh-finance (Q2).

## Server facts every server brief uses

Found writing the repo briefs on 2026-11-09 and 2026-11-10.

- **The zod provider's `.transform()` trap.** Its serializer throws on a
  `.transform()` in a response schema: Almanac's `occurrenceSchema` and
  Shelfmark's `savedViewSchema.state`. Split the input schema from the output
  schema.
- **A second zod copy.** The provider resolves a second zod copy (the-board),
  so a root `overrides` entry dedupes it.
- **A declared status becomes a 500.** A response schema that declares a
  status the handler doesn't send itself (a guard's 401) turns that reply into
  a 500 (wicket). Declare only the statuses each handler sends. With
  `preHandler` guards that reply with 401 or 403 themselves, the route declares
  only its success status (SocialEvents).
- **Timeouts per repo.** `connectionTimeout` cuts long responses: wicket's
  25 s long poll, lantern's 26 s record route, ward-auth's slow SMTP. Set it
  per repo. `requestTimeout` cuts large uploads (comercial-website's 500 MB
  multipart), so upload routes keep it at 0 or raise it.
- **Helper parsing the grep misses.** `.parse(request.` finds none of the
  helper sites: wicket 5, lantern 13, public-resource-map's 14 `safeParse(req.`
  in 7 files. The structure checker needs a better test than grep, and a
  schema stricter than the handler breaks the client (the mini todo `PATCH`
  accepts `0 | 1 | boolean`), so each route step checks the client's real
  payloads first.
- **Quiet env loaders.** Copied `REPO_ROOT` and env loaders swallow `ENOENT`,
  so a moved file silently drops `.env` (Shelfmark, lantern). `config.ts`
  centralises them and fails loudly. It parses with zod: an empty list
  variable gives `[]` (CORS silently off) and `PORT=abc` gives `NaN`.
  `dotenv/config` reads `.env` from the working directory, so `config.ts` loads
  it by an explicit path. A shared plugin library takes its config as plugin
  options.
- **`npm test` on a fresh clone.** It fails without a prior build in Satchel,
  the-board, Shelfmark and lantern. Every server gets a `pretest`.
- **Fastify's own 4xx answer 500.** An error handler with no `statusCode`
  branch turns bad JSON or an oversized body into a 500 (comercial-website,
  and likely every copy of that shape). The one handler passes Fastify's 4xx
  through and never echoes a thrown message to the client (Q43). With no
  handler at all (public-resource-map), Fastify's default puts the thrown
  message in the reply.
- **`logger: false`.** It turns `app.log.error` into a no-op, so a server that
  says it logs 500s may log nothing.
- **Import-time config is allowed** (atrium). A `loadConfig(env)` factory over
  import-time constants plus a test setup that depends on them is a large
  change; the checkers read the repo's roots from `conventions.json`.
- **Layered modules and cycles.** atrium's modules reach into each other in 24
  places with three cycles, so "reach another feature only through its
  `index.ts`" needs a cycle-breaking step or recorded exceptions.
- **Validation before authorisation** is accepted (Q52); Satchel has three
  such routes.
- **Hand-parsed replies.** atrium's controllers `schema.parse()` replies by
  hand in at least 14 places; response schemas replace them.
- **zod 4's messages differ.** A handler that sends the first issue's message
  to users shows new text after the move.
- **`await-thenable` on Drizzle's synchronous better-sqlite3 calls** (58 in
  public-resource-map). Removing the awaits changes nothing.
- **Proving a response schema changes nothing: the byte compare.** Serialise
  every fixture through the zod type provider and compare the bytes with
  `JSON.stringify` (byte-identical for 3D-sandbox's three scenes). For routes
  with live data, capture the JSON of every route the web calls on a seeded
  database before and after. Any field the schema drops is either a leak,
  which stays dropped and is noted, or a missing schema field, which gets
  added.

## Files you own (per repo)

The server package's `src/**`, its `package.json`, the lockfile, the
`--warn-only` flag in `check:conventions`, the Dockerfile `CMD` where the
entry is renamed, and the repo's `architecture.md`, `decisions.md` and
`log.md`. Not `web/`, except where a response schema changes a field the web
reads (fix the schema, not the web).

## Acceptance (for this tracker)

- Every row's brief is in its repo's `done/`.
- In every row, `check-structure.mjs` passes strict, or with exceptions in
  `conventions.json`.
- The repo's `typecheck`, `test`, `lint` and `build` pass, and the server
  starts in dev and from `dist/` (and from its container's `CMD`).
- No handler calls `.parse()` on request input, and every route has a
  `response` schema, except streams and binary routes with an entry.
- The before and after JSON comparison is in each repo's `log.md` entry.

## Outcome (2026-11-12)

All 17 server rows are built, one brief each, in the order above, on `main` in each repo (the outcome notes of those
briefs are the source of every cell). Every `check-structure` count is errors / warnings; "n/r" means the builder
did not record the count before the move. Replies are the captured replies compared before and after.

| Repo, done brief | check-structure before → after (exceptions) | Replies compared | Left |
|---|---|---|---|
| mini-projects 05 | 6 / 0 → 0 / 0 (none) | 34; 8 differ: the brief's 5 rows, no-body text, Fastify's bad-JSON body, unknown-method 404 | none; undeployed, the frontend wasn't run against it |
| imbatranim-apps 10 | n/r → strict (the WebSocket route, recorded) | `GET /health` byte for byte | OS catalog re-pinned at imbatranimOS ac69342 (e479048, command `server.ts`); todo: kill the converter child on close |
| 3D-sandbox 07 | n/r → 0 / 4 rule 11 (none) | 45; 5 changed on purpose (bad JSON and 1.1 MB body 500 → 400/413, unknown-route body), a no-body PUT reads "null" | none; undeployed |
| the-board 19 (brief-board) | 41 / 3 → 0 / 2 (1: `GET /` redirect) | 100; 94 identical, 4 key order, 2 text | Caddy `keepalive` check in vps-deploy |
| wicket 13 | 20 / 1 → 0 / 0 (1: `GET /`) | 108; all identical but one no-body message | an id over 100 characters answers 414 in Fastify's own shape (not fixed); image size |
| lantern 18 | 39 / 0 → 0 / 0 (2: poster route, `GET /`) | 69; identical but list key order, a no-body PUT, an unknown list with an unknown query key (400, was 404) | in-container CLI run |
| newspapper 11 | 50 / 3 → 0 / 3 (7 exempt routes) | 172; 152 of 171 identical, 19 deliberate (listed in its log) | owner questions on `store.ts` with `core` and the context |
| SocialEvents 17 | 0 / 66 → 0 / 0 (5: `NODE_ENV` in `config.ts`) | 116; 100 identical, 16 intended (Fastify's 4xx, unknown route, no-body, validation first) | none recorded |
| satchel 04 | 21 / 3 → 0 / 3 (1: live route) | 169; every step compared; no-body text, no field dropped | zod moved to 4.6.7 by the controller (satchel 2b41253, GHSA-mrhx-c7xc-m3w5), one copy |
| almanac 04 | 31 / 4 → 0 / 4 (none) | 70; 64 identical, 6 no-body text; two validation-first reorders not captured | timeouts and `trustProxy` question |
| shelfmark 08 | 36 / 9 → 0 / 9 (1: backup stream) | 114; 92 identical, 10 key order, 12 differ (9 no-body, 3 validation first) | todo: a lookup in flight holds the shutdown; stored-data check before the deploy |
| ro-housing 24 | 0 / 31 → 0 / 2 (none) | 132; 122 identical, 10 on purpose (validation first, 500 → 400, Fastify's 400 text) | todo: a refresh in flight holds the shutdown |
| public-resource-map 05 | 58 / 5 → 0 / 5 (1: `NODE_ENV`) | 249; 203 identical, 46 differ (34 messages, 4 staged-event leaks dropped, Fastify's 4xx) | stored-enum check before the deploy; `request.ip` check |
| atrium 04 | 94 / 43 → 0 / 43 (2: multipart, Range) | 257; none dropped, 12 key order, 2 validation first | a 50 MB upload and a Calibre run untested |
| comercial-website 13 | 116 / 5 → 0 / 5 (10) | 927; every success body identical; 92 status changes on invalid input (401/403 → 422) | todo: replies that say too much (email, phone, `s3_key`, avatar URL) |
| ward-auth 06 (wzd_auth) | 74 / 22 → 0 / 22 (16, 11 of them hand parses) | 282; byte-identical in every step, none dropped | one sign-in from another app after the deploy |
| sports-app 04 | n/r → 0 / 0 (2: `GET /api/state`, the 402-line store) | 36; identical but `Keep-Alive` 72 → 125 | image build and the `server` deploy |

**Against the tracker's Acceptance.**
- **Every brief is in its repo's `done/`,** and each repo's `check-structure` passes strict, with exceptions only
  where `conventions.json` records a reason. Four outcome notes say `--warn-only` went in the commit that first
  reported 0 (3D-sandbox, wicket, satchel, newspapper).
- **Not met, and an owner check after the deploys:** the server starting from its container's `CMD`. Local Docker
  can't build, so no builder ran an image. Each ran the built `server.js` on a real socket instead (health 200, a
  signed-out 401, SIGTERM exit 0). After each deploy: the container turns healthy, and `docker stop` ends at once.
- **Not met in two rows:** "no handler calls `.parse()` on request input": ward-auth keeps 11 hand-parsed sites
  and lantern one, each an exception with its reason (the sign-in library's and the poster route's bodies).
  atrium has two excepted routes (multipart, Range) and newspapper seven exempt ones; the grep otherwise prints
  nothing.
- **The before-and-after counts** are missing for sports-app, 3D-sandbox and imbatranim-apps. The reply comparison is in each
  repo's log or outcome note.
- **Two shutdown todos** (shelfmark, ro-housing) and comercial-website's "replies that say too much" stay open in
  their repos.
