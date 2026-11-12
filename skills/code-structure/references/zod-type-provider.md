# The zod type provider

`@fastify/type-provider-zod` lets a route declare zod schemas for what it
takes and what it sends. Fastify then validates each request by decoding it
with zod, encodes each reply with zod, and types the handler from the same
schemas. This page is rule 6 in practice: the setup, the typing, what a
response schema may hold, how a failed request becomes the error body, and
the byte compare that proves a new response schema changes nothing.

Checked on 2026-11-11 against `fastify` 5.12.8, `@fastify/type-provider-zod`
1.0.3 and `zod` 4.6.7. Each behaviour in the tables was run, not read. The
additions of 2026-11-12 (from the 17 server moves) were re-run on `fastify`
5.12.7 and 5.12.8 and name their repo.

## Setup

- **Pin it and its peers.** The provider needs zod 4.2 or later, and lists
  `@fastify/swagger` and `openapi-types` as required peers, so npm installs
  them even in a server with no API docs: pin all three (the pins are in the
  SKILL). A repo on zod 3 (atrium, comercial-website's `backend`,
  public-resource-map) moves to zod 4 first.
- **One zod.** The provider can resolve a second copy (the-board). `npm ls
  zod` shows it; a root `overrides` entry for `zod` makes it one.
- **Both compilers on the root, before any plugin.** `buildApp` calls
  `setValidatorCompiler(validatorCompiler)` and
  `setSerializerCompiler(serializerCompiler)` first
  ([server-skeleton.md](server-skeleton.md)); every scope registered after
  inherits them.
- **Type each plugin, not the root.** Provider types don't propagate across
  plugins (Fastify's Type-Providers reference, "Scoped Type-Provider"), so a
  feature in its own file is typed `FastifyPluginAsyncZod<Options>`, where
  `Options` is what it takes from the context. The root needs no
  `withTypeProvider`: no route lives on it.

## A plugin in its own file, and statuses

The books routes in [server-skeleton.md](server-skeleton.md) are the
everyday case. This feature shows the rest: a query string with coercion
and a transform, an upstream's JSON passed through whole, two declared
statuses, and a schema that stays in the feature because the client never
imports it (Q55).

```ts
// server/src/features/lookup/routes.ts
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";

/** An upstream catalogue: its JSON record for an ISBN, or `undefined` when it has none. */
export type Lookup = (
  isbn: string,
  options: { fresh: boolean; signal: AbortSignal },
) => Promise<Record<string, unknown> | undefined>;

export interface LookupOptions {
  /** The upstream call. A test passes a fake. */
  lookup: Lookup;
}

// Only the server uses these schemas, so they live with the feature, not in shared/.

/**
 * `?isbn=978-0-441-17271-9&fresh=true`. A query string is all strings: the
 * transform is fine on input, which is only ever decoded, and `z.stringbool()`
 * reads "false" as false where `z.coerce.boolean()` would read it as true.
 */
const lookupQuery = z.object({
  isbn: z
    .string()
    .transform((value) => value.replaceAll("-", ""))
    .pipe(z.string().regex(/^\d{10}(\d{3})?$/, "An ISBN has 10 or 13 digits.")),
  fresh: z.stringbool().default(false),
});

/** The reply: an output schema, so no transform. The upstream's record passes through whole, as a loose object. */
const lookupResult = z.object({ isbn: z.string(), record: z.looseObject({}) });

/**
 * One route, two statuses, both declared because the handler sends both: 200
 * with the record, or 204 when no catalogue has it. A 401 from a guard or a 500
 * from the error handler is not declared: the handler never sends it.
 */
export const lookupRoutes: FastifyPluginAsyncZod<LookupOptions> = async (app, { lookup }) => {
  app.get(
    "/api/lookup",
    { schema: { querystring: lookupQuery, response: { 200: lookupResult, 204: z.null() } } },
    async (request, reply) => {
      const { isbn, fresh } = request.query;
      const record = await lookup(isbn, { fresh, signal: AbortSignal.timeout(5_000) });
      if (record !== undefined) return { isbn, record };
      reply.code(204);
      return null;
    },
  );
};
```

```ts
// server/src/features/lookup/index.ts
// The feature's public surface, as for books: app.ts registers the routes from here.
export { lookupRoutes, type Lookup, type LookupOptions } from "./routes.js";
```

A feature is tested alone the same way: a bare Fastify with the two
compilers, the plugin registered with fakes for its options.

```ts
// server/src/features/lookup/routes.test.ts
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import Fastify from "fastify";
import { expect, it } from "vitest";
import { lookupRoutes, type Lookup } from "./routes.js";

/** One feature alone, on a bare Fastify with the zod compilers, its upstream faked through its options. */
async function lookupApp(lookup: Lookup) {
  const app = Fastify();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(lookupRoutes, { lookup });
  return app;
}

it("passes the upstream record through whole, and answers 204 when there is none", async () => {
  const seen: { isbn: string; fresh: boolean }[] = [];
  const app = await lookupApp(async (isbn, { fresh }) => {
    seen.push({ isbn, fresh });
    return isbn === "9780441172719" ? { title: "Dune", pages: 412, covers: [1] } : undefined;
  });
  const found = await app.inject({ method: "GET", url: "/api/lookup?isbn=978-0-441-17271-9&fresh=false" });
  expect(found.statusCode).toBe(200);
  expect(found.json()).toEqual({ isbn: "9780441172719", record: { title: "Dune", pages: 412, covers: [1] } });
  expect((await app.inject({ method: "GET", url: "/api/lookup?isbn=0000000000" })).statusCode).toBe(204);
  expect((await app.inject({ method: "GET", url: "/api/lookup?isbn=12" })).statusCode).toBe(400);
  expect(seen).toEqual([
    { isbn: "9780441172719", fresh: false },
    { isbn: "0000000000", fresh: false },
  ]);
  await app.close();
});
```

- **Declare each status the handler sends itself, and no other.** A route
  that declares a 401 schema while a `preHandler` guard sends its own 401
  body answers 500 whenever the two differ (wicket). Left undeclared, the
  guard's reply goes out as it is. The same holds for the error handler's
  replies: an `ApiError`'s 404 needs no schema on the route.
- **204** is declared as `z.null()`; the handler sets the code and returns
  `null`, and the reply goes out with no body. `reply.code(204).send(null)`
  type-checks too; `.send()` with no argument doesn't.
- **A declared status encodes every reply on that status**, the error
  handler's and Fastify's own included (3D-sandbox, atrium, ward-auth). So
  a declared 4xx is generic: `{ error: string, message: string }`, or
  ward-auth's `{ statusCode?, error, message? }` where both Fastify's body and
  the repo's travel. Never a literal code. A declared 4xx that the error
  handler's body doesn't match answers 500 (measured: a bad-JSON 400 against a
  declared `{ error, message }`, with a handler that sent neither field). A
  declared 401, 403 or 400 also runs a guard's own reply through the
  serializer (lantern, the-board): check the guard's body fits, or declare
  nothing and let the guard's reply through.
- **Declare only what the handler sends.** `reply.code(n).send(body)`
  type-checks for every status the route declares, and for none it doesn't
  (measured: an undeclared 415 or 404 is a compile error on 5.12.7 and
  5.12.8; a declared 201, 409 or 400 passes, with a row variable that has
  extra fields). So a handler that must send an extra status declares it
  (Shelfmark's cover `PUT` declares its 415 as the generic body). The
  type can also force a status in for a branch that never runs
  (ward-auth's `GET /console/session` declares a 401).
- **A string or binary reply skips the serializer**, so a schema on it is
  dead: measured, a handler that sent a JSON string through a route whose
  schema wanted `{ x: number }` went out as it was (ward-auth's JWKS). Record
  it as a `conventions.json` exception rather than a schema nobody runs.
- **A literal in a response needs `as const`.** `z.literal(true)` with
  `return { ok: true }` is a compile error in an async handler (the object
  widens to `boolean`): write `ok: true as const` (3D-sandbox).

## What a response schema may hold

The provider encodes a reply with `z.encode`, so a response schema runs
backwards. Measured:

| In a response schema | What the client gets |
|---|---|
| `z.object({ … })` | the declared fields only: an extra field is dropped. This is the leak protection |
| `z.looseObject({})`, or `z.record(z.string(), z.unknown())` | the JSON whole: the shape for pass-through JSON (Q25) |
| `.strict()` or `z.strictObject(…)` | a 500 (`FST_ERR_RESPONSE_SERIALIZATION`) whenever the reply has an extra field |
| `.transform(…)` anywhere inside | a 500 on every reply: "Encountered unidirectional transform during encode" |
| `z.codec(input, output, { decode, encode })` | the encoded value: a codec runs both ways, so it may stay |
| `.trim()`, `.toLowerCase()` | applied again on the way out; harmless |
| `.default(…)` or `.catch(…)` | not applied: a reply that leaves the field out is a 500 (measured). Old stored rows are the usual cause: the mapper decodes a stored value through the input schema first (atrium's notes mapper, so a page with no template stays a 200) |
| key order | the schema's order, not the handler's: the same JSON, different bytes. List the keys in the order the handler builds them where bytes matter (3D-sandbox, satchel, Shelfmark's `bookSchema`) |

- **Split a schema that transforms.** Almanac's `occurrenceSchema` and
  Shelfmark's `savedViewSchema.state` transform their input, so each gets a
  separate output schema (or the transform moves into the handler or the
  store, or becomes a codec).
- **Strict on input, never on output.** wicket's request schemas are
  `.strict()` on purpose: an unknown field in a request is a 400. Reusing one
  as a response schema would turn its replies into 500s.
- **A strict document schema in `shared/` is safe on output** only when
  every reply holding it was just parsed by that same schema (3D-sandbox's
  scenes). Where a field can arrive from elsewhere, an extra field is a 500.
  satchel's Claude replies are `z.strictObject` in `shared/`; its builder
  left them and said so.
- **A response schema replaces hand-parsed replies.** atrium's controllers
  `schema.parse()` their own replies in at least 14 places; the declared
  schema does that job.

## Input: params, query strings, bodies and headers

- **Params, query strings and headers are strings.** Numbers take
  `z.coerce.number<string>()`, booleans `z.stringbool()` (`z.coerce.boolean()`
  reads "false" as `true`), and a missing value takes `.default(…)`.
- **Input may transform.** The provider only decodes requests, so `.trim()`,
  `.transform()` and `.pipe()` are fine there, and the handler gets the
  output type.
- **A header schema is checked, not written back whole.** 3D-sandbox's note
  that a plain `z.object` header schema strips every other header did not hold:
  on Fastify 5.12.7 and 5.12.8 a `z.object`, a `z.looseObject` and a schema
  with an optional key all left `host`, `user-agent` and the rest in
  `request.headers` (measured through a `preHandler`, the handler and
  `onSend`). Fastify assigns the validated value to a setter that merges it
  over the raw headers, so a validated header (a `z.coerce.number()`) replaces
  its string, and nothing is removed. A `z.strictObject` answers 400 when any
  other header is present. `z.looseObject` costs nothing and says what you
  mean, so keep it; params and query strings do take the schema's output
  whole (`?b=2` is gone from `request.query`).
- **A body schema turns a missing body into `null`.** The 400's message reads
  "expected object, received null". A route that must work with no body takes
  `.nullish()` and the handler reads `request.body?.x` (mini-projects).
- **An array element's messages** come from the element schema's own
  `error` (mini-projects).
- **Check the client's real payloads first.** A schema stricter than the old
  handler breaks the client: the mini todo app's `PATCH` accepts
  `0 | 1 | boolean`. Read what the web sends before writing the schema.
- **Hand parsing hides from grep.** `.parse(request.` finds none of the
  helper sites (wicket 5, lantern 13, public-resource-map's 14
  `safeParse(req.`), but `check-structure` 1.2.0 rule 6 reports a `parse`,
  `safeParse` or `validate` call handed `request.body`, `.query`, `.params` or
  `.headers`, through a helper too (wicket). It also reports `fn({ x:
  request.body.x })` on input the schema already validated, which is a false
  positive: an exception in `conventions.json`, with its reason.

## How a failed request becomes the error body

The validator turns each zod issue into one entry of Fastify's
`error.validation`, with `instancePath` (`/title`) and `message`, and
`error.validationContext` says which part failed. The error plugin
recognises it with `hasZodFastifySchemaValidationErrors(error)` and answers
400 with the issues. From the books tests:

```json
{
  "error": "validation",
  "message": "The request is not valid.",
  "issues": [
    { "path": "body/title", "message": "Give the book a title." },
    { "path": "body/author", "message": "Invalid input: expected string, received undefined" }
  ]
}
```

- **The handler never runs** for a request that fails its schema, so it
  never needs to check.
- **zod 4's messages differ from zod 3's.** A client that shows the first
  issue's message to people shows new text after the move; a schema's own
  messages (`"Give the book a title."`) stay as written.
- **Validation runs before a `preHandler`.** A `preHandler` guard sees only
  valid requests, so a signed-out client with a bad body gets 400, not 401.
  That is accepted (Q52; three Satchel routes). A guard in `onRequest` or
  `preValidation` refuses first (measured: 400, 401 and 403 for the same bad
  body behind a `preHandler`, `preValidation` and `onRequest` guard). Where
  the old status must stay, use one of those: public-resource-map's role
  guard, SocialEvents', ward-auth's console session and atrium's bot-only
  check each did, so a signed-out or wrong-role request with a bad body keeps
  its 401 or 403.
- **An empty path gives `instancePath` `/`**, so the issue's path reads
  `body/` for a missing body (lantern, mini-projects); the error plugin
  needs no special case.
- **Fastify's router answers some requests before any of this.** An id over
  100 characters (`maxParamLength`) is a 414 in Fastify's own shape, before
  the error handler or the params schema runs (wicket).
- **Bad JSON is Fastify's own 400**, before the schema:
  `{ "error": "bad_request", "message": "Body is not valid JSON but content-type is set to 'application/json'" }`.

## Streams and binary replies

A route that streams (Newspapper's 7 streams) or sends a file (lantern's
posters) declares no response schema at all: the reply isn't JSON, and a
schema there would be dead. It still declares its
`params` and `querystring`, and the exemption from rule 6 is recorded in
`conventions.json` with its reason (Q53), as the SKILL's example shows. A
route with no schema at all is a `check-structure` finding, so the entry
there carries a `match` for that route.

## The byte compare

A response schema must change nothing the client relies on. The proof is a
byte compare: serialise each reply the server sends today through the
provider, as Fastify will once the schema is on the route, and compare it
with `JSON.stringify`, as Fastify sends it now.

```ts
// server/src/testing/compareReplies.ts
import { isDeepStrictEqual } from "node:util";
import { serializerCompiler } from "@fastify/type-provider-zod";
import type { z } from "zod";

/** A reply the server sends today: its route, its status, the schema it will get, and a real body. */
export interface ReplyFixture {
  route: string;
  status: number;
  schema: z.ZodType;
  body: unknown;
}

/** How the reply through the schema differs from `JSON.stringify` of the same body. */
export interface ReplyDifference {
  route: string;
  status: number;
  /** `reordered`: the same JSON, keys in the schema's order. `dropped`: fields the schema strips. `failed`: the schema rejects the body (a 500). */
  verdict: "reordered" | "dropped" | "failed";
  /** The dropped fields' paths, or the encoding error. */
  detail: string[];
}

/** Paths in `before` that `after` lacks: `["sortKey", "books.0.sortKey"]`. */
function droppedPaths(before: unknown, after: unknown, prefix = ""): string[] {
  if (typeof before !== "object" || before === null || typeof after !== "object" || after === null) return [];
  const paths: string[] = [];
  for (const [key, value] of Object.entries(before)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (!(key in after)) paths.push(path);
    else paths.push(...droppedPaths(value, (after as Record<string, unknown>)[key], path));
  }
  return paths;
}

/**
 * Serialises every fixture through the zod type provider, as Fastify will once
 * the route has its response schema, and compares the bytes with
 * `JSON.stringify`, as Fastify sends them today. An empty result proves the
 * schema changes nothing. A dropped field is a leak (keep it dropped and say
 * so) or a field the schema is missing (add it).
 */
export function compareReplies(fixtures: readonly ReplyFixture[]): ReplyDifference[] {
  const differences: ReplyDifference[] = [];
  for (const { route, status, schema, body } of fixtures) {
    const serialize = serializerCompiler({ schema, method: "GET", url: route, httpStatus: String(status) });
    let encoded: string;
    try {
      encoded = serialize(body);
    } catch (error) {
      const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : String(error);
      differences.push({ route, status, verdict: "failed", detail: [cause] });
      continue;
    }
    const plain = JSON.stringify(body);
    if (encoded === plain) continue;
    const [before, after]: unknown[] = [JSON.parse(plain), JSON.parse(encoded)];
    if (isDeepStrictEqual(before, after)) differences.push({ route, status, verdict: "reordered", detail: [] });
    else differences.push({ route, status, verdict: "dropped", detail: droppedPaths(before, after) });
  }
  return differences;
}
```

```ts
// server/src/features/books/replies.test.ts
import { bookListSchema, bookSchema } from "@app/shared";
import { describe, expect, it } from "vitest";
import { compareReplies } from "../../testing/compareReplies.js";

// Bodies as the server sent them before the routes had response schemas (captured from the old routes).
const row = { id: 1, title: "Dune", author: "Frank Herbert", addedAt: "2026-11-11T09:00:00.000Z", sortKey: "dune" };

describe("the book replies through their response schemas", () => {
  it("change nothing but the internal sortKey", () => {
    expect(
      compareReplies([
        { route: "GET /api/books", status: 200, schema: bookListSchema, body: { books: [row] } },
        { route: "GET /api/books/:id", status: 200, schema: bookSchema, body: row },
      ]),
    ).toEqual([
      { route: "GET /api/books", status: 200, verdict: "dropped", detail: ["books.0.sortKey"] },
      { route: "GET /api/books/:id", status: 200, verdict: "dropped", detail: ["sortKey"] },
    ]);
  });
});
```

- **For a whole app, capture instead.** [reply-capture.md](reply-capture.md)
  drives the real app with `inject()` before and after every step and lists
  what differs on purpose.
- **The fixtures are real.** For routes with live data, capture the JSON of
  every route the web calls on a seeded database before the change; static
  data (3D-sandbox's three scenes) can be serialised directly, and came out
  byte-identical.
- **Each difference is a decision.** `reordered` is harmless: the schema
  lists keys in its own order. A `dropped` field is a leak, which stays
  dropped and is noted in the log, or a field the schema is missing, which
  gets added. `failed` is a schema the body doesn't satisfy, which would be
  a 500.
- **The compare stays as a test** where the fixtures are cheap to keep, so
  a later schema change shows up as a failing test rather than a client bug.
