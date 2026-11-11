# The server skeleton

A whole server in the target shape, small enough to read in one sitting: the
entry, the app, the settings, the error plugin, one feature (books) with its
schemas in `shared/`, and the feature's `inject()` tests. Copy the files a
repo lacks, rename the feature, and keep the shape.

Written fresh against the estate's servers (Almanac's `FeatureContext`,
error handler and test app; wicket's shared schemas) and the research in
[research.md](research.md). Checked on 2026-11-11 against `fastify` 5.12.8,
`@fastify/type-provider-zod` 1.0.3, `zod` 4.6.7, `fastify-plugin` 6.0.1,
`close-with-grace` 2.5.0, `@fastify/rate-limit` 11.2.2 and `vitest` 4.1.12:
every block below compiles with TypeScript 6.0.3 under the house flags
(`strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`,
`erasableSyntaxOnly`, `NodeNext`), the tests pass, and `check-structure` and
the dependency-cruiser preset report nothing on the tree.

```text
shared/src/books.ts, errors.ts, index.ts    the contract
server/src/server.ts                        the process
server/src/config.ts, config.test.ts       the settings
server/src/app.ts                           buildApp and the FeatureContext
server/src/db/open.ts                       open and migrate
server/src/lib/api-error.ts                 the one error class
server/src/plugins/errors.ts                the error and 404 handlers
server/src/features/books/                  store.ts, routes.ts, index.ts, routes.test.ts
server/src/testing/buildTestApp.ts          the app for one test
```

## The contract, in `shared/`

The web's forms and the server's routes import the same schemas, so the two
can't drift. Names follow the house: a `…Schema` constant and a PascalCase
type beside it.

```ts
// shared/src/books.ts
import { z } from "zod";

/**
 * A book as the API sends it. A response schema, so it holds no `.transform()`:
 * the zod type provider encodes replies with it, and a transform can't run backwards.
 */
export const bookSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  author: z.string(),
  addedAt: z.iso.datetime(),
});
export type Book = z.infer<typeof bookSchema>;

/** `GET /api/books`. A list goes in an object, so a field can join it later without breaking clients. */
export const bookListSchema = z.object({ books: z.array(bookSchema) });
export type BookList = z.infer<typeof bookListSchema>;

/** `POST /api/books`: what the add form sends. The form validates with it too. */
export const bookInputSchema = z.object({
  title: z.string().trim().min(1, "Give the book a title.").max(200),
  author: z.string().trim().min(1, "Give the book an author.").max(200),
});
export type BookInput = z.infer<typeof bookInputSchema>;
```

```ts
// shared/src/errors.ts
import { z } from "zod";

/** One thing wrong with a request: where (`body/title`) and what. */
export const issueSchema = z.object({ path: z.string(), message: z.string() });
export type Issue = z.infer<typeof issueSchema>;

/**
 * Every error the API sends. `error` is a code the client can switch on,
 * `message` is for people, and a 400 from a schema lists its `issues`.
 */
export const errorBodySchema = z.object({
  error: z.string(),
  message: z.string(),
  issues: z.array(issueSchema).optional(),
});
export type ErrorBody = z.infer<typeof errorBodySchema>;
```

```ts
// shared/src/index.ts
export * from "./books.js";
export * from "./errors.js";
```

- **The error body** is the default for a repo that has none. A repo with
  its own (Almanac's `{ error: { code, message } }`) keeps it, and its error
  plugin writes that shape instead (Q43).
- **`.trim()` on input** is not a transform in zod 4, and input schemas may
  transform anyway: the provider only decodes requests. Response schemas are
  the ones that must not ([zod-type-provider.md](zod-type-provider.md)).

## The process: `server.ts`

```ts
// server/src/server.ts
import closeWithGrace from "close-with-grace";
import { buildApp } from "./app.js";
import { loadConfig, readEnvFile } from "./config.js";

// The process: settings, the app, shutdown, listen. Nothing else in the server listens.
const envFile = readEnvFile();
const config = loadConfig();

const app = await buildApp(config, {
  server: {
    logger: { level: config.logLevel },
    trustProxy: config.trustedProxies,
    // A socket silent this long mid-request is cut. A long poll must answer sooner, or raise it.
    connectionTimeout: 30_000,
    // The whole request, body included, must arrive within this. A large upload raises it.
    requestTimeout: 60_000,
    // Longer than the proxy keeps an idle upstream connection (Caddy: 2 minutes), so the
    // proxy never sends a request down a socket the server has just closed.
    keepAliveTimeout: 125_000,
  },
});
app.log.info(envFile === undefined ? "no .env: settings from the environment" : `settings from ${envFile}`);

// SIGINT, SIGTERM, an uncaught error: stop taking requests, finish the ones in flight, run
// every onClose hook (the database closes there), and exit. After 10 s it exits anyway.
closeWithGrace({ delay: 10_000, logger: app.log }, async ({ signal, err }) => {
  if (err) app.log.error({ err }, "closing after an uncaught error");
  else app.log.info(`closing on ${signal ?? "request"}`);
  await app.close();
});

await app.listen({ host: config.host, port: config.port });
```

- **Only this file listens** (rule 1). It is also the one file in the server
  allowed to print, through `houseStyle()`'s `console` option, though it
  logs through `app.log` here.
- **The timeouts are the repo's.** `connectionTimeout` cuts a socket that
  stays silent mid-request, so a long poll must answer sooner or the value
  goes up (wicket's 25 s poll, lantern's 26 s record route, ward-auth's slow
  SMTP). `requestTimeout` bounds the whole request; a repo with large uploads
  raises it or sets 0 (comercial-website's 500 MB multipart). Fastify's
  defaults are no limit for both.
- **`keepAliveTimeout`** outlives the proxy's idle upstream connections,
  which Caddy keeps for 2 minutes by default. Fastify's default is 72 s.
- **The host** is `127.0.0.1` on a host and `0.0.0.0` in a container, where
  the proxy reaches the server over the container network. It comes from
  `HOST`.
- **Pretty logs** need `pino-pretty`: a repo that wants them on a terminal
  sets `transport: { target: "pino-pretty" }` when `process.stdout.isTTY`,
  and JSON lines everywhere else.
- **A failed config parse** throws before the app exists, and Node prints
  the `ConfigError` naming each bad variable and exits 1.

## The settings: `config.ts`

```ts
// server/src/config.ts
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

/** The repo root. `src/` (dev) and `dist/` (built) sit at the same depth under `server/`, so this holds for both. */
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** The repo's `.env`, found from this file, never from the working directory. */
export const ENV_FILE = resolve(REPO_ROOT, ".env");

export const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/** The server's settings, parsed once at start. No other file reads the environment. */
export interface Config {
  /** `HOST`: 127.0.0.1 on a host; 0.0.0.0 in a container, where the proxy reaches the server over the network. */
  host: string;
  /** `PORT`. */
  port: number;
  /** `DATA_DIR`, absolute (a relative value is from the repo root): where the database lives. Required. */
  dataDir: string;
  /** `TRUSTED_PROXIES`, comma-separated addresses or CIDR ranges whose `X-Forwarded-For` Fastify believes. */
  trustedProxies: string[];
  /** `LOG_LEVEL`, `info` by default. */
  logLevel: LogLevel;
}

/** The environment can't run the server. The message names every variable at fault. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/** `KEY=` copied from an example file counts as unset, so the default applies rather than an empty string. */
function unset(value: unknown): unknown {
  return value === "" ? undefined : value;
}

/** A comma-separated list, trimmed, with empty items dropped. */
const list = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== ""),
);

const envSchema = z.object({
  HOST: z.preprocess(unset, z.string().default("127.0.0.1")),
  PORT: z.preprocess(unset, z.coerce.number<string>().int().min(1).max(65535).default(3000)),
  DATA_DIR: z.preprocess(unset, z.string({ error: "DATA_DIR is required: the folder that holds the database." })),
  // An empty list would trust nobody without saying so: at least one entry, loopback by default.
  TRUSTED_PROXIES: z.preprocess(unset, list.pipe(z.array(z.string()).min(1)).default(["loopback"])),
  LOG_LEVEL: z.preprocess(unset, z.enum(LOG_LEVELS).default("info")),
});

/**
 * Parses the settings, or throws `ConfigError` listing every bad variable
 * (`PORT=abc` and a missing `DATA_DIR` fail here, not at the first request).
 * Tests pass their own `env`.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) throw new ConfigError(z.prettifyError(parsed.error));
  const { HOST, PORT, DATA_DIR, TRUSTED_PROXIES, LOG_LEVEL } = parsed.data;
  return {
    host: HOST,
    port: PORT,
    dataDir: isAbsolute(DATA_DIR) ? DATA_DIR : resolve(REPO_ROOT, DATA_DIR),
    trustedProxies: TRUSTED_PROXIES,
    logLevel: LOG_LEVEL,
  };
}

/**
 * Reads the repo's `.env` into the environment when there is one, and returns
 * its path. A container has none: the deploy sets its environment. A variable
 * the environment already has keeps its value.
 */
export function readEnvFile(path: string = ENV_FILE): string | undefined {
  if (!existsSync(path)) return undefined;
  process.loadEnvFile(path);
  return path;
}
```

```ts
// server/src/config.test.ts
import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("fills the defaults, and treats an empty value as unset", () => {
    const config = loadConfig({ DATA_DIR: "/srv/data", PORT: "", TRUSTED_PROXIES: "" });
    expect(config).toEqual({
      host: "127.0.0.1",
      port: 3000,
      dataDir: "/srv/data",
      trustedProxies: ["loopback"],
      logLevel: "info",
    });
  });

  it("splits a list and resolves a relative data folder from the repo root", () => {
    const config = loadConfig({ DATA_DIR: "data", TRUSTED_PROXIES: "172.16.0.0/12, 10.0.0.0/8" });
    expect(config.trustedProxies).toEqual(["172.16.0.0/12", "10.0.0.0/8"]);
    expect(config.dataDir).toMatch(/\/data$/);
  });

  it("throws once, naming every bad variable", () => {
    expect(() => loadConfig({ PORT: "abc", TRUSTED_PROXIES: " , " })).toThrow(ConfigError);
    try {
      loadConfig({ PORT: "abc", TRUSTED_PROXIES: " , " });
    } catch (error) {
      expect(String(error)).toMatch(/PORT/);
      expect(String(error)).toMatch(/DATA_DIR is required/);
      expect(String(error)).toMatch(/TRUSTED_PROXIES/);
    }
  });
});
```

- **The only reader of `process.env`** (rule 3). A seed command or another
  CLI inside the app calls `loadConfig()` too, and a test passes its own
  `env` object instead of touching the process's.
- **Loud, not quiet.** The copied env loaders swallowed a missing `.env`, so
  a moved file silently ran on defaults (Shelfmark, lantern). Here the path
  comes from this file, the result is logged by `server.ts`, and anything
  that matters (`DATA_DIR`) has no default, so a lost `.env` fails the
  parse. `dotenv/config` reads `.env` from the working directory, which is
  why it isn't used.
- **zod catches what `Number()` and `split()` let through:** `PORT=abc` is
  an error rather than `NaN`, `PORT=` takes the default rather than 0, and a
  list that parses to nothing is an error rather than "trust nobody" (an
  empty CORS list silently turned CORS off). The message names each
  variable:

  ```text
  ConfigError: ✖ Invalid input: expected number, received NaN
    → at PORT
  ✖ DATA_DIR is required: the folder that holds the database.
    → at DATA_DIR
  ✖ Too small: expected array to have >=1 items
    → at TRUSTED_PROXIES
  ```
- **`TRUSTED_PROXIES`** feeds Fastify's `trustProxy`. `loopback` is right on
  a host behind Caddy. In a container it is the network the proxy connects
  from, or `request.ip` is the proxy for every client and they share one
  rate-limit bucket.
- **Read at import time is allowed.** A repo whose modules import a config
  constant (atrium) keeps that until a `loadConfig(env)` factory is a small
  change; `config.ts` stays the only reader either way.

## The app: `app.ts`

```ts
// server/src/app.ts
import rateLimit from "@fastify/rate-limit";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import Fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import type { Config } from "./config.js";
import { openDb } from "./db/open.js";
import { bookRoutes, createBookStore, type BookStore } from "./features/books/index.js";
import { errors } from "./plugins/errors.js";

/**
 * What the features are handed, built here once and passed to each as its
 * plugin options. Add a field when a feature needs it; a test replaces one
 * through `BuildAppOptions.context`, never through a decorator.
 */
export interface FeatureContext {
  config: Config;
  /** The clock. A test passes a fixed one. */
  now: () => Date;
  books: BookStore;
}

/** Fastify's options that belong to the process. server.ts sets them; a test leaves them out. */
export type ServerOptions = Pick<
  FastifyServerOptions,
  "logger" | "trustProxy" | "connectionTimeout" | "requestTimeout" | "keepAliveTimeout"
>;

export interface BuildAppOptions {
  server?: ServerOptions;
  /** Parts of the context to replace: a test's fake clock or upstream. */
  context?: Partial<Omit<FeatureContext, "config">>;
}

/**
 * The app, ready and not listening. It registers in a fixed order: external
 * plugins, then the app's own plugins, then the features. Closing it closes
 * the database.
 */
export async function buildApp(config: Config, options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify(options.server);
  // Zod checks every request and encodes every reply, in every plugin registered below.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const db = openDb(config.dataDir);
  app.addHook("onClose", async () => {
    db.close();
  });

  // 1. External plugins. Not global: only the 404 handler is limited here.
  await app.register(rateLimit, { global: false });

  // 2. The app's own plugins, fastify-plugin wrapped so they reach every feature.
  await app.register(errors);

  // 3. The features, each encapsulated: its hooks stay inside it.
  const context: FeatureContext = { config, now: () => new Date(), books: createBookStore(db), ...options.context };
  await app.register(bookRoutes, context);

  return app;
}
```

- **The order is the architecture** (rule 2): the compilers, external
  plugins, the app's own plugins, then each feature by name. A new feature
  adds a field to `FeatureContext` if it needs one, and one `register`.
- **`buildApp` never listens**, and the process's options come in from
  `server.ts`. A test calls it with none: no logger, no timeouts.
- **Fakes go in through `context`** (Q24, Q56): a test replaces the clock or
  an upstream client there, and no decorator exists to override.
- **A feature never imports `app.ts`.** Each feature's plugin names the part
  of the context it takes in its own options type (`BooksOptions` below),
  and TypeScript checks at the `register` call that the context has it. A
  feature that imports `type FeatureContext` from `app.ts` closes a cycle
  through its own index, and dependency-cruiser's `no-circular` counts
  type-only imports: that is Almanac's shape today.
- **The database** is opened here and closed by an `onClose` hook; it
  reaches the features inside their stores, not as a decorator.

## Open and migrate: `db/open.ts`

```ts
// server/src/db/open.ts
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

/** The connection the stores are built on. */
export type Db = DatabaseSync;

/** Each runs once, in order; `PRAGMA user_version` counts how many have. Append; never edit one that has shipped. */
const MIGRATIONS: readonly string[] = [
  `CREATE TABLE books (
     id INTEGER PRIMARY KEY,
     title TEXT NOT NULL,
     author TEXT NOT NULL,
     added_at TEXT NOT NULL,
     sort_key TEXT NOT NULL
   )`,
];

/** Opens `<dataDir>/app.db`, creating the folder, and runs the migrations it hasn't had. */
export function openDb(dataDir: string): Db {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, "app.db"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const done = Number(db.prepare("PRAGMA user_version").get()?.user_version ?? 0);
  for (const [index, sql] of MIGRATIONS.entries()) {
    if (index < done) continue;
    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${index + 1}`);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  return db;
}
```

`node:sqlite` stands in for the repo's own driver, so the skeleton runs with
no native dependency. A repo keeps its driver (better-sqlite3, Drizzle); the
shape stays: one function that opens, migrates and returns the handle the
stores are built on.

## The error class: `lib/api-error.ts`

```ts
// server/src/lib/api-error.ts
/** The status each error code answers with. A new code is one line here. */
export const ERROR_STATUS = {
  /** The request failed its route schema. */
  validation: 400,
  /** A 400 that Fastify raised itself: bad JSON, an empty body with a JSON content type. */
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  internal: 500,
} as const satisfies Record<string, number>;

export type ErrorCode = keyof typeof ERROR_STATUS;

/**
 * The server's one error class. Throw it from a handler or a hook to answer
 * `ERROR_STATUS[code]` with this message; the error plugin writes the body.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}
```

One class (Q56) in `lib/`, because it imports nothing from Fastify: a
feature, a plugin and a pure helper can all throw it. A new code is one line
in `ERROR_STATUS`.

## The error and 404 handlers: `plugins/errors.ts`

```ts
// server/src/plugins/errors.ts
import type { ErrorBody, Issue } from "@app/shared";
import { hasZodFastifySchemaValidationErrors, ResponseSerializationError } from "@fastify/type-provider-zod";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { ApiError, ERROR_STATUS, type ErrorCode } from "../lib/api-error.js";

function errorBody(error: ErrorCode, message: string, issues?: Issue[]): ErrorBody {
  return issues === undefined ? { error, message } : { error, message, issues };
}

/** The code for a 4xx that Fastify or a plugin raised. */
function clientErrorCode(status: number): ErrorCode {
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  return "bad_request";
}

/** The status a thrown value carries, if it carries one (Fastify's own errors and its plugins' do). */
function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

/**
 * The one error handler, and the 404 handler. Wrapped in fastify-plugin, so
 * they are set on the root and every feature inherits them.
 *
 * - `ApiError` answers its code's status with its message.
 * - A request that fails its route schema answers 400 with every issue.
 * - A 4xx that Fastify or a plugin raised (bad JSON, a body too large, a rate
 *   limit) keeps its status and its message, which were written for clients.
 * - Anything else is a 500 with a fixed message, logged with the request.
 *   A thrown message never reaches the client.
 */
const errorHandling: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof ApiError)
      return reply.code(ERROR_STATUS[error.code]).send(errorBody(error.code, error.message));

    if (hasZodFastifySchemaValidationErrors(error)) {
      const where = error.validationContext ?? "request";
      const issues = error.validation.map((issue) => ({
        path: `${where}${issue.instancePath}`,
        message: issue.message ?? "is not valid",
      }));
      return reply.code(400).send(errorBody("validation", "The request is not valid.", issues));
    }

    const status = statusOf(error);
    if (status !== undefined && status >= 400 && status < 500) {
      const message = error instanceof Error ? error.message : "The request is not valid.";
      return reply.code(status).send(errorBody(clientErrorCode(status), message));
    }

    if (error instanceof ResponseSerializationError) {
      // A handler sent what its response schema doesn't allow: a bug to fix, never the client's fault.
      request.log.error(
        { err: error, issues: error.cause.issues },
        `${error.method} ${error.url}: the reply doesn't match its schema`,
      );
    } else {
      request.log.error({ err: error }, "unhandled error");
    }
    return reply.code(500).send(errorBody("internal", "Something went wrong on the server."));
  });

  // Rate-limited: a scanner walking unknown paths gets 429s, not a free 404 per guess.
  app.setNotFoundHandler({ preHandler: app.rateLimit({ max: 60, timeWindow: "1 minute" }) }, (request, reply) =>
    reply.code(404).send(errorBody("not_found", `There is no route ${request.method} ${request.url}.`)),
  );
};

export const errors = fp(errorHandling, { name: "errors", dependencies: ["@fastify/rate-limit"] });
```

- **`fastify-plugin` sets them on the root** (rule 4). Without it, the
  handlers would apply only inside this plugin's own scope.
- **Fastify's own 4xx pass through** with their status. A handler without
  that branch turns bad JSON or an oversized body into a 500
  (comercial-website). With no handler at all, Fastify's default sends the
  thrown message, a 500's included (public-resource-map).
- **A reply that doesn't match its schema** is
  `ResponseSerializationError`: a 500, logged with the zod issues. Use
  `instanceof`; the provider's `isResponseSerializationError()` only checks
  for a `method` property.
- **Logging needs a logger.** `request.log.error` does nothing under
  `logger: false`, so a server that says it logs 500s must turn the logger on
  in `server.ts`.
- **Without `@fastify/rate-limit`,** drop the 404 handler's `preHandler` and
  the plugin's `dependencies`.

## The feature: `features/books/`

The store holds the SQL; the routes declare their schemas and stay thin;
the index is the feature's public surface.

```ts
// server/src/features/books/store.ts
import type { SQLOutputValue } from "node:sqlite";
import type { Db } from "../../db/open.js";

/** A stored book: what the API sends, and what it never does. */
export interface BookRow {
  id: number;
  title: string;
  author: string;
  addedAt: string;
  /** The title folded for sorting. Internal: the response schema drops it from every reply. */
  sortKey: string;
}

/** The books table. Every query on it lives here; a route never writes SQL. */
export interface BookStore {
  /** Every book, by title. */
  list(): BookRow[];
  get(id: number): BookRow | undefined;
  add(input: { title: string; author: string }, addedAt: Date): BookRow;
  /** Whether there was such a book to remove. */
  remove(id: number): boolean;
}

const COLUMNS = "id, title, author, added_at AS addedAt, sort_key AS sortKey";

function toRow(row: Record<string, SQLOutputValue>): BookRow {
  return {
    id: Number(row.id),
    title: String(row.title),
    author: String(row.author),
    addedAt: String(row.addedAt),
    sortKey: String(row.sortKey),
  };
}

export function createBookStore(db: Db): BookStore {
  const list = db.prepare(`SELECT ${COLUMNS} FROM books ORDER BY sort_key, id`);
  const get = db.prepare(`SELECT ${COLUMNS} FROM books WHERE id = ?`);
  const insert = db.prepare(
    `INSERT INTO books (title, author, added_at, sort_key) VALUES (?, ?, ?, ?) RETURNING ${COLUMNS}`,
  );
  const remove = db.prepare("DELETE FROM books WHERE id = ?");

  return {
    list: () => list.all().map(toRow),
    get(id) {
      const row = get.get(id);
      return row === undefined ? undefined : toRow(row);
    },
    add({ title, author }, addedAt) {
      const row = insert.get(title, author, addedAt.toISOString(), title.toLocaleLowerCase("en"));
      if (row === undefined) throw new Error("INSERT … RETURNING gave no row");
      return toRow(row);
    },
    remove: (id) => Number(remove.run(id).changes) > 0,
  };
}
```

```ts
// server/src/features/books/routes.ts
import { bookInputSchema, bookListSchema, bookSchema } from "@app/shared";
import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { z } from "zod";
import { ApiError } from "../../lib/api-error.js";
import type { BookStore } from "./store.js";

/**
 * What this feature takes from the context. app.ts passes its whole
 * `FeatureContext`; this type says which part is used, and keeps the feature
 * from importing app.ts (a type import back would be a cycle).
 */
export interface BooksOptions {
  books: BookStore;
  now: () => Date;
}

/** A path parameter arrives as a string: coerce it, and a bad id is the schema's 400. */
const bookParams = z.object({ id: z.coerce.number<string>().int().positive() });

const noSuchBook = () => new ApiError("not_found", "There is no such book.");

/** The book routes. Each declares its schemas; the handlers get typed, validated input and never parse it. */
export const bookRoutes: FastifyPluginAsyncZod<BooksOptions> = async (app, { books, now }) => {
  app.get("/api/books", { schema: { response: { 200: bookListSchema } } }, () => ({ books: books.list() }));

  app.get("/api/books/:id", { schema: { params: bookParams, response: { 200: bookSchema } } }, (request) => {
    const book = books.get(request.params.id);
    if (book === undefined) throw noSuchBook();
    return book;
  });

  app.post("/api/books", { schema: { body: bookInputSchema, response: { 201: bookSchema } } }, (request, reply) => {
    reply.code(201);
    return books.add(request.body, now());
  });

  app.delete("/api/books/:id", { schema: { params: bookParams, response: { 204: z.null() } } }, (request, reply) => {
    if (!books.remove(request.params.id)) throw noSuchBook();
    reply.code(204);
    return null;
  });
};
```

```ts
// server/src/features/books/index.ts
// The feature's public surface: app.ts, and any other feature, import from here only.
export { bookRoutes, type BooksOptions } from "./routes.js";
export { createBookStore, type BookRow, type BookStore } from "./store.js";
```

- **The store returns more than the API sends.** `sortKey` is internal: the
  response schema drops it from every reply, and the test below proves it.
  Before response schemas, a field like it reached every client.
- **The handlers never parse.** `request.params.id` is already a number and
  `request.body` a trimmed `BookInput`; a bad one never reaches the handler.
- **A 404 is thrown, not declared.** The routes declare only the statuses
  their handlers send themselves (200, 201, 204). The error handler's 404
  has no schema on the route, so Fastify serialises it as it is; a declared
  404 schema it didn't match would turn it into a 500.
- **`reply.code(201)`, then `return` the body.** The provider types a
  handler's return value from the route's response schemas, and returning
  `reply.code(204).send(…)` doesn't type-check.

## The test app and the tests

```ts
// server/src/testing/buildTestApp.ts
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { buildApp, type BuildAppOptions } from "../app.js";
import { loadConfig } from "../config.js";

/**
 * The whole app for one test, on a fresh temporary `DATA_DIR`, never
 * listening. Fakes go in as context. Close it after the test: that closes
 * the database and deletes the folder.
 *
 *     const app = await buildTestApp({ now: () => new Date("2026-11-11T09:00:00Z") });
 *     const res = await app.inject({ method: "GET", url: "/api/books" });
 *     await app.close();
 */
export async function buildTestApp(context: BuildAppOptions["context"] = {}): Promise<FastifyInstance> {
  const dataDir = await mkdtemp(join(tmpdir(), "server-test-"));
  const app = await buildApp(loadConfig({ DATA_DIR: dataDir }), { context });
  app.addHook("onClose", async () => {
    await rm(dataDir, { recursive: true, force: true });
  });
  return app;
}
```

```ts
// server/src/features/books/routes.test.ts
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildTestApp } from "../../testing/buildTestApp.js";

const NOW = new Date("2026-11-11T09:00:00.000Z");

describe("the book routes", () => {
  let app: FastifyInstance;
  beforeEach(async () => {
    app = await buildTestApp({ now: () => NOW });
  });
  afterEach(async () => {
    await app.close();
  });

  it("adds a book, and the reply holds only the schema's fields", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/books",
      payload: { title: " Dune ", author: "Frank Herbert" },
    });
    expect(res.statusCode).toBe(201);
    // No `sortKey`: the store returns it, the response schema drops it.
    expect(res.json()).toEqual({ id: 1, title: "Dune", author: "Frank Herbert", addedAt: NOW.toISOString() });
  });

  it("lists the books by title", async () => {
    await app.inject({
      method: "POST",
      url: "/api/books",
      payload: { title: "Neuromancer", author: "William Gibson" },
    });
    await app.inject({ method: "POST", url: "/api/books", payload: { title: "dune", author: "Frank Herbert" } });
    const res = await app.inject({ method: "GET", url: "/api/books" });
    expect(res.statusCode).toBe(200);
    expect(res.json<{ books: { title: string }[] }>().books.map((book) => book.title)).toEqual(["dune", "Neuromancer"]);
  });

  it("answers a bad body with 400 and every issue, before the handler runs", async () => {
    const res = await app.inject({ method: "POST", url: "/api/books", payload: { title: "" } });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({
      error: "validation",
      issues: [{ path: "body/title" }, { path: "body/author" }],
    });
  });

  it("answers a bad id with 400 and a missing book with 404, in the one error body", async () => {
    expect((await app.inject({ method: "GET", url: "/api/books/abc" })).statusCode).toBe(400);
    const res = await app.inject({ method: "GET", url: "/api/books/7" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ error: "not_found", message: "There is no such book." });
  });

  it("keeps Fastify's own 400 for a body that isn't JSON", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/books",
      headers: { "content-type": "application/json" },
      payload: "{",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json()).toMatchObject({ error: "bad_request" });
  });

  it("deletes a book, then has nothing to delete", async () => {
    await app.inject({ method: "POST", url: "/api/books", payload: { title: "Dune", author: "Frank Herbert" } });
    const res = await app.inject({ method: "DELETE", url: "/api/books/1" });
    expect(res.statusCode).toBe(204);
    expect(res.body).toBe("");
    expect((await app.inject({ method: "DELETE", url: "/api/books/1" })).statusCode).toBe(404);
  });

  it("answers an unknown route with the house 404, and a scanner with 429", async () => {
    const res = await app.inject({ method: "GET", url: "/api/nothing" });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ error: "not_found" });
    for (let i = 1; i < 60; i++) await app.inject({ method: "GET", url: `/api/nothing-${i}` });
    const limited = await app.inject({ method: "GET", url: "/api/nothing-else" });
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ error: "rate_limited" });
  });
});
```

- **One app per test**, closed after it: no state leaks between tests, and
  the temporary folder goes with the app.
- **A schema-failure case per feature** (rule 9) proves the route has its
  schema and the error body carries the issues.
- **Shelfmark** keeps its "nothing boots the app" decision (Q26) and tests
  handlers and plugins without `inject()`; atrium writes the same tests on
  `node:test` (Q27).

## The package

What the server's `package.json` needs, beside the house-style
devDependencies:

```json
{
  "type": "module",
  "main": "./dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -b",
    "start": "node dist/server.js",
    "pretest": "tsc -b ../shared"
  },
  "dependencies": {
    "@fastify/rate-limit": "11.2.2",
    "@fastify/swagger": "9.9.3",
    "@fastify/type-provider-zod": "1.0.3",
    "close-with-grace": "2.5.0",
    "fastify": "5.12.8",
    "fastify-plugin": "6.0.1",
    "openapi-types": "12.1.3",
    "zod": "4.6.7"
  }
}
```

- **`pretest`** builds what the tests import from other workspaces: a fresh
  clone has no `shared/dist` (Satchel, the-board, Shelfmark and lantern
  failed `npm test` without a build). Where the tests run from the root, the
  root's `pretest` does it.
- **One zod.** The provider can resolve a second copy of zod (the-board).
  `npm ls zod` shows it; a root `overrides` entry pins the one version.
- **The Dockerfile's `CMD`** names `server/dist/server.js` once the entry is
  renamed, in the same commit (Q1).

## What to adapt

- The feature's name, table and schemas; the error codes the repo uses.
- The error body, to the repo's existing shape (Q43).
- The timeouts, to the repo's slowest legitimate request.
- The database module, to the repo's driver.
- The context: one field per dependency more than one feature uses, plus the
  fakes tests need (a clock, an upstream client).
