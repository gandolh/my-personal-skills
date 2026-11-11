import type { FastifyPluginAsync } from "fastify";
import { Book, BookInput, BookList } from "../../../../shared/src/books.js";

// Every route declares its schemas, in each of Fastify's three shapes.
export const books: FastifyPluginAsync = async (app) => {
  app.get("/api/books", { schema: { response: { 200: BookList } } }, async () => []);
  app.post("/api/books", {
    schema: { body: BookInput, response: { 201: Book } },
    handler: async (request, reply) => reply.code(201).send(request.body),
  });
  app.route({
    method: "DELETE",
    url: "/api/books/:id",
    schema: { response: { 204: {} } },
    handler: async (_request, reply) => reply.code(204).send(),
  });
  // Not request input: JSON.parse, parseInt, and a Map's get.
  const cache = new Map<string, string>();
  const size = parseInt(cache.get("/api/books") ?? "0", 10);
  const stored: unknown = JSON.parse(cache.get("/api/books/last") ?? "null");
  app.log.debug({ size, stored }, "books ready");
};
