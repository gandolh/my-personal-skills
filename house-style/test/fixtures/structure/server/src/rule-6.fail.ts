import type { FastifyInstance } from "fastify";
import { BookInput, BookQuery } from "../../shared/src/books.js";

declare function parseBody<T>(schema: { parse(value: unknown): T }, value: unknown): T;
declare function requireUser(): Promise<void>;

export function routes(app: FastifyInstance): void {
  app.get("/api/a", async () => "a");
  app.post("/api/b", { preHandler: requireUser }, async (request) => BookInput.parse(request.body));
  app.get("/api/c", { handler: async (req) => parseBody(BookQuery, req.query) });
  app.route({ method: "PUT", url: "/api/d", handler: async (request) => BookInput.safeParse(request.body) });
}
