# The web skeleton

The `web/src` side of the structure: one folder per feature, the Base UI
wrappers where the base-ui skill puts them, and one API client that parses
every answer with the shared schemas. The components themselves are the
base-ui skill's; this page is where files go and how a feature talks to the
server.

Written fresh from Almanac's and Shelfmark's `api.ts` and the server
skeleton's error body. Checked on 2026-11-11: the blocks below compile with
TypeScript 6.0.3 under the house flags with `moduleResolution: "bundler"`
and the DOM library, as a Vite app's tsconfig has them.

## The tree

```text
web/src/
  main.tsx               mounts <App />, imports styles/index.css; nothing else
  App.tsx                the shell: layout, the theme switch, the router's outlet
  router.ts              routes to pages; each page comes from a feature's index
  components/
    ui/                  Base UI wrappers, one per primitive (base-ui rule 3)
    Layout.tsx           components more than one feature uses
  features/
    books/
      index.ts           the feature's public surface
      api.ts             its calls to the server, one function per route
      BooksPage.tsx      a page the router shows
      BookForm.tsx       a component only this feature uses
      useBooks.ts        a hook only this feature uses
      ui/                a composite only this feature uses (base-ui rule 3)
  lib/
    api.ts               the API client
    cn.ts                class names (base-ui's tailwind.md)
  styles/index.css       the one stylesheet (base-ui rule 5)
```

- **A feature is a domain, not a page.** It holds the pages, components,
  hooks and calls of one thing the app does (books, the account), the same
  names as the server's `features/` where both exist.
- **The index is the door** (rule 10). The router and any other feature
  import from `features/books/index.ts`, never from the files beside it;
  dependency-cruiser's `feature-through-index` reports a reach past it, on
  the web as on the server.
- **Shared parts climb out.** A component two features use moves to
  `components/`, a pure helper to `lib/`. Neither imports a feature.
- **The router stays the app's own.** Almanac, Shelfmark and Satchel route
  with the History API and no library; atrium uses TanStack Router. The
  skill doesn't choose; it asks that pages come from feature indexes.

## The API client

```ts
// web/src/lib/api.ts
import { errorBodySchema, type Issue } from "@app/shared";

/**
 * The API client: `fetch`, JSON in and out, and the shared schemas checking
 * every answer, so the page can't drift from the server. Every failure is one
 * `ApiError`: the server's code and message, or the client's own `network`
 * (no answer, status 0) and `bad_response` (an answer the schema rejects).
 */
export class ApiError extends Error {
  /** The HTTP status; 0 when no answer came. */
  readonly status: number;
  readonly code: string;
  /** A 400's field problems, for the form to show beside each field. */
  readonly issues: Issue[];

  constructor(status: number, code: string, message: string, issues: Issue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

/** The part of a zod schema the client uses. */
export interface ResponseSchema<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Sent as JSON. */
  body?: unknown;
  signal?: AbortSignal;
}

async function send(path: string, { method = "GET", body, signal }: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (body !== undefined) headers["content-type"] = "application/json";
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      ...(body !== undefined && { body: JSON.stringify(body) }),
      ...(signal && { signal }),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0, "network", "The server can't be reached.");
  }
  if (response.ok) return response;
  const parsed = errorBodySchema.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success) throw new ApiError(response.status, "bad_response", `The server answered ${response.status}.`);
  throw new ApiError(response.status, parsed.data.error, parsed.data.message, parsed.data.issues);
}

/** A call whose answer the page reads: resolves to the parsed body. */
export async function apiJson<T>(path: string, schema: ResponseSchema<T>, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);
  const parsed = schema.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success)
    throw new ApiError(response.status, "bad_response", "The server's answer isn't what this page expects.");
  return parsed.data;
}

/** A call whose answer the page doesn't read: a 204, or a write it doesn't need back. */
export async function apiNoContent(path: string, options: RequestOptions): Promise<void> {
  await send(path, options);
}
```

- **Every answer is parsed.** A call names the shared schema of its answer;
  a reply that doesn't match is an `ApiError` with `bad_response`, never a
  half-typed object deep in a component.
- **One error type.** The server's `{ error, message, issues }` becomes
  `ApiError(status, code, message, issues)`; a form shows `issues` beside
  its fields by their `path` (`body/title`). A repo with its own error body
  parses that shape here instead.
- **No base URL here.** The paths are the server's (`/api/books`), and the
  dev proxy and Caddy map them; a repo served under a prefix keeps its
  `base.ts` and prepends it in `send`.

## A feature's calls

```ts
// web/src/features/books/api.ts
import { bookListSchema, bookSchema, type Book, type BookInput } from "@app/shared";
import { apiJson, apiNoContent } from "../../lib/api";

/** The books feature's calls: one function per route it uses, typed by the shared schemas. */
export async function listBooks(signal?: AbortSignal): Promise<Book[]> {
  const { books } = await apiJson("/api/books", bookListSchema, signal ? { signal } : {});
  return books;
}

export function addBook(input: BookInput): Promise<Book> {
  return apiJson("/api/books", bookSchema, { method: "POST", body: input });
}

export function removeBook(id: number): Promise<void> {
  return apiNoContent(`/api/books/${id}`, { method: "DELETE" });
}
```

```ts
// web/src/features/books/index.ts
// The feature's public surface. The router imports its pages from here, and another feature
// that needs a book imports from here too, never from the files beside it.
export { addBook, listBooks, removeBook } from "./api";
```

- **One function per route**, typed by the shared schemas: a component calls
  `listBooks()` and never builds a URL.
- **The index exports what others use.** Once the feature has pages, the
  router's `BooksPage` comes from here too.

## What to adapt

- The router, the shell and the data hooks stay the repo's own; this page
  sets where they live.
- A repo with a `signed_out` flow (Almanac's 401 listener) keeps it in
  `lib/api.ts`.
- The class names and wrappers come from the base-ui skill and the repo's
  tokens.
