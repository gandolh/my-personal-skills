# Proving a migration changes nothing: the reply capture

[migrating-a-server.md](migrating-a-server.md) says to capture every reply
before step 1 and compare after each step. All 17 server moves did, and each
caught something a green test run didn't. This page is the method and what a
capture tends to show. For fixtures that are static data,
[zod-type-provider.md](zod-type-provider.md)'s `compareReplies` does the same
job in a test.

## The method

- **A scratch script, not a test.** It builds the app (from `dist/` when the
  step is a build step) over a seeded or in-memory database, with a fixed
  clock, fixed file mtimes and every setting pinned, and drives it with
  `inject()`. It saves each reply as status, the headers that matter, and
  body. Two runs of the same tree must compare byte for byte, or the
  differences are noise: normalise generated ids and expiries (wicket), and
  seed `crypto.randomBytes` through `syncBuiltinESMExports` where the app
  makes tokens (ward-auth).
- **What to call.** Every route, as each kind of caller (signed out, a user, an
  admin, a friend, a non-member, a token); every refusal; malformed JSON, an
  empty body, a wrong content type and a body over the limit on every body
  route; every error status the client reads. 34 replies in the smallest
  server (mini-projects), 927 in the largest (comercial-website).
- **Capture first, then after every step,** and compare each capture with the
  one before it and with the first. A step that should change nothing and
  changes a reply is a bug in the step.
- **Move the files in a commit of their own.** A commit that is only `git
  mv` and import paths needs no new capture, and a reviewer can read it as
  such. The sign-in code is moved the same way (step 3 of the migration).
- **Clean `dist/` before any grep or start check.** `tsc --build` leaves the
  old files after a delete or a move, and a stale file answers a check that
  should fail (3D-sandbox).
- **Prove a schema is live.** An unchanged capture doesn't show that a
  response schema runs. Remove one field from it, watch the compare change,
  put it back.
- **Keep the capture's result in the repo's `log.md`:** the counts, each
  difference with its cause, and each dropped field with its verdict.

## What changes, and why that is fine

These showed up in nearly every repo. Each is a known effect of the
structure, so a difference outside this list is a bug.

| Difference | Cause | Action |
|---|---|---|
| A request with no body reads "expected object, received null", not "received undefined" | Fastify hands a body schema `null` for a missing body | Accept. A route that must work with no body takes `.nullish()` and reads `req.body?.x` |
| A bad body or query is a 400 (or 422) where it was a 404, 403 or 401 | Validation runs before `preHandler` (Q52) | Accept for a 404. For an auth-like refusal, move the guard to `preValidation`, or `onRequest` to refuse before anything else, to keep the status (public-resource-map, SocialEvents, atrium, ward-auth) |
| Fastify's own 4xx (bad JSON, a 415, a 413) and the unknown-route body change | The one error handler writes the repo's body; before, they were 500s or Fastify's default shape | Accept, and list them in the log |
| Keys appear in the schema's order | zod encodes in the schema's key order | Harmless for JSON; for identical bytes, list the keys in the order the handler builds them |
| A field disappears from a reply | The response schema doesn't name it | A leak stays dropped and is noted; a field the client reads is added to the schema |
| Error text changes | zod 4's wording, or the fixed 500 message (rule 8) | Check the client first: where it shows `message ?? error`, say so under Deviations |

- **Stored data that fails its response schema is a 500 for the whole
  list.** One value outside an enum, or a time that isn't ISO, fails every
  reply that holds it (Shelfmark's 3,000-book list), while `/health` stays
  green. Before the deploy, check the real data against the schemas:
  Shelfmark ships `server/scripts/check-stored-replies.ts`, and
  public-resource-map's note runs one `select distinct` per enum column.
  That is an owner step, written into the brief's outcome.
- **A route the capture can't reach** (a path that needs a live upstream, a
  stream) is checked by hand on the real server, and named in the log.
