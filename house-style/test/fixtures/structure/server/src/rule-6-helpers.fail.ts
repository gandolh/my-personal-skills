import type { FastifyInstance } from "fastify";
import { BookInput } from "../../shared/src/books.js";

declare function parseRange(headers: object, size: number): { start: number; end: number };
declare function validate(value: unknown): boolean;
declare function safeParse(value: unknown): boolean;

// A schema's own parse on a property, a bare parse, and a helper given the whole input are hand parses.
export function routes(app: FastifyInstance): void {
  app.get("/a", { schema: {} }, async (request) => parseRange(request.headers, 100));
  app.post("/b", { schema: {} }, async (request) => BookInput.parse(request.body.title));
  app.get("/c", { schema: {} }, async (request) => validate(request.query.token));
  app.get("/d", { schema: {} }, async (request) => safeParse(request.params.id));
}
