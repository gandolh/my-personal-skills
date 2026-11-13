import type { FastifyInstance } from "fastify";

declare function parseRange(header: string | undefined, size: number): { start: number; end: number };
declare function validateRedirect(input: { uri: string }): boolean;

// Validated input handed on, a property at a time, to a helper of the route's own: not a hand parse.
export function routes(app: FastifyInstance): void {
  app.get("/files/:id", { schema: {} }, async (request) => parseRange(request.headers.range, 100));
  app.post("/apps", { schema: {} }, async (request) => validateRedirect({ uri: request.body.uri }));
}
