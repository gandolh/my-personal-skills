# Task 16: The Fastify servers adopt the code structure

## Context

The owner asked on 2026-11-09 for the code structure (brief 03's
`code-structure` skill) to be enforced through the repos. This brief brings
each Fastify server to it, one repo per session, following
`skills/code-structure/references/migrating-a-server.md`:

1. `config.ts` and the `server.ts` / `app.ts` split.
2. The error plugin.
3. `features/` folders.
4. Zod route schemas with response schemas, one feature at a time.
5. Drop `--warn-only`.

The survey of 2026-11-09 found:

- Fastify 5.12.7 almost everywhere.
- No route schemas outside ward-auth, no type provider, no
  `fastify-plugin`.
- Request input validated by hand with zod in 12 servers.
- `app.ts` plus `index.ts` as the usual split.

Most rows rename `index.ts` to `server.ts`, which moves the built entry from
`dist/index.js` to `dist/server.js`. Before renaming, find how vps-deploy
starts each service: `npm start`, or a file path in its pm2 config. If it
names the file, change it in the same session, or keep the old name and
record the exception in `scripts/conventions.json` (brief 15).

Owner decision on the order, default: smallest first, so the method is
proven before the big ones.

1. the mini todo app, imbatranim-apps, 3D-sandbox, the-board, wicket,
   lantern;
2. newspapper, SocialEvents, Satchel, Almanac, Shelfmark, ro-housing;
3. public-resource-map, atrium, comercial-website, ward-auth.

## The servers (2026-11-09)

The counts are what the survey measured:

- *hand-parse*: files that call `.parse(request.…)`;
- *env*: files that read `process.env`;
- *NODE_ENV*: files that check it;
- *inject*: test files that call `inject()`.

| Repo (package) | Entry today | Layout today | Hand-parse | env / NODE_ENV | Tests / inject | Notes |
|---|---|---|---|---|---|---|
| mini-projects (`literally-a-todo-app/backend`) | `server.ts`, no `app.ts` | flat (`routes.ts`, `db.ts`) | 0 | 0 / 0 | 0 / 0 | add `buildApp` and a first test |
| imbatranim-apps (`server`) | `app.ts` + `index.ts` | flat, websocket | 0 | 1 / 0 | 2 / 1 | the converter is not HTTP; it stays in `lib/` |
| 3D-sandbox (`apps/api`) | `app.ts` + `index.ts` + `server.ts` | `store/` | 0 | 1 / 0 | 2 / 1 | three entry files become two |
| the-board (`server`) | `app.ts` + `index.ts` | flat; `store.ts` 685 lines | 1 | 2 / 0 | 3 / 1 | split `store.ts` by feature |
| wicket (`server`) | `app.ts` + `index.ts` | flat; `app.ts` 404 lines | 0 | 2 / 0 | 7 / 2 | routes move out of `app.ts` |
| lantern (`server`) | `app.ts` + `index.ts` | `routes/`, `sources/`, `pool/`, `suggest/` | 1 | 4 / 0 | 15 / 8 | `suggest/` is pure, so it goes to `lib/` or stays a feature's service |
| newspapper (`api`) | `server.ts`, no `app.ts` | `routes/` (12), `lib/` | 0 | 5 / 0 | 9 / 6 | add `buildApp`; SSE and uploads |
| SocialEvents (`server`) | `app.ts` + `index.ts` | `routes/`, `services/`, `dal/` | 7 | 1 / 1 | 4 / 1 | Fastify 5.8.5; bump to 5.12.x first |
| Satchel (`server`) | `app.ts` + `index.ts` | `routes/`, `store.ts` 714, `live/`, `push/` | 4 | 4 / 1 | 12 / 8 | websocket hub stays a plugin |
| almanac (`server`) | `app.ts` + `index.ts` | `routes/`, `store/`, `recurrence/`, `push/`, `reminders/` | 6 | 3 / 0 | 23 / 11 | already has `FeatureContext`; `recurrence/` is pure |
| shelfmark (`server`) | `app.ts` + `index.ts` | `routes/`, `store/`, `lookup/`, `cip/` | 4 | 4 / 0 | 21 / 0 | its decisions say "nothing boots the app": no `inject` tests unless the owner revisits that |
| ro-housing (`api`) | `app.ts` + `server.ts` | flat plus `adapters/`, `details/`, `db/` | 0 | 6 / 0 | 20 / 5 | `.ts` import suffixes (the rest use `.js`); keep the repo's style |
| public-resource-map (`backend`) | `app.ts` + `index.ts` | `routes/`, `ingest/`, `lib/`, `db/` | 6 | 12 / 3 | 26 / 15 | drizzle; the most env readers |
| atrium (`apps/api`) | `app.ts` + `index.ts` | `modules/<name>/` (8) | 7 | 4 / 1 | 24 / 23 | rename `modules` to `features`; `latex-compile.service.ts` is 1,722 lines, so split it; `node:test` runner |
| comercial-website (`backend/app`, `backend/core`) | `create-server.ts` + `server.ts` | `modules/*.ts`, `repositories/` | 10 | 5 / 2 | 12 / 5 | kysely; `backend/core` is a shared plugin library, so it follows the `plugins/` rules; `invoices.ts` is 859 lines |
| ward-auth (`api`, `shared-library`) | `app.ts` + `index.ts` | `oidc/`, `auth/`, `grants/`, `db/`, `mail/` | 11 | 2 / 5 | 50 / 26 | the only server with route schemas (5 files); an OIDC provider, so keep `oidc-provider`'s mount as it is; `shared-library` is a Fastify plugin other apps vendor, so change its API only with a version bump |

Three rows start with a **zod 3 → 4 move**, because the type provider
needs zod ≥4.2 (brief 03's spike):

- atrium (3.25.76);
- comercial-website's `backend` (3.24.1); its `frontend` is already 4.3.6;
- public-resource-map (3.25.76).

Use zod's v4 migration guide. The usual breaks are error customisation
(`message` becomes `error`), `.strict()` and `.passthrough()`, and
`z.string().email()` becoming `z.email()`. That step is its own commit,
with the shared schemas' tests green before the provider goes in.

Out of scope:

- sports-app's `server/`: plain `.mjs`, 1,636 lines, not TypeScript. It
  gets its own brief if the owner wants it converted.
- hackathons' ITFest backend: an archive.

**Depends on:** brief 03, and brief 15 for that repo (the checker is wired,
`--warn-only`).

## Files you OWN

In each repo's server package:

- `src/**`;
- its `package.json` (`start`, `dev`, and new dependencies:
  `@fastify/type-provider-zod`, `fastify-plugin`, `close-with-grace`);
- the lockfile;
- the `--warn-only` flag in `check:conventions`;
- the repo's `corpus/wiki/architecture.md`, `decisions.md` (an entry
  adopting the structure) and `log.md`.

## Files you must NOT touch

- `web/`, except where a response schema changes a field the web reads.
  That is a finding: fix the schema, not the web.
- `shared/` schemas, except to add response schemas that don't exist yet.
- The deploy, except the entry-file change above.

## What to do

For each repo, in its own session:

1. Run `node scripts/check-structure.mjs` strict, and record the counts.
2. Follow `migrating-a-server.md` step by step. After each step, the repo's
   `typecheck`, `test` and `build` pass, and the server starts and answers
   its health route.
3. For step 4, first capture the JSON of every route the web calls (with a
   seeded database), then compare it after. Any field the response schema
   drops is either a leak, which stays dropped and is noted, or a missing
   schema field, which gets added.
4. Drop `--warn-only`, then commit each step separately.
5. Update the repo's `architecture.md`, add the `decisions.md` entry and
   write `log.md`.

## Acceptance

- In every row, `check-structure.mjs` passes strict, or passes with
  exceptions recorded in `conventions.json`.
- The repo's `typecheck`, `test`, `lint` and `build` pass, and the server
  starts in dev and from `dist/`.
- No handler calls `.parse()` on request input, and every route has a
  `response` schema.
- The before/after JSON comparison is in each repo's `log.md` entry.
- This brief's outcome note has the table above with a "done" column and
  the strict counts before and after.
