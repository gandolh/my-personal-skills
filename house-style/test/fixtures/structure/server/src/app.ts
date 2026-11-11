import Fastify, { type FastifyInstance } from "fastify";
import type { Config } from "./config.js";
import { books } from "./features/books/routes.js";

export async function buildApp(config: Config): Promise<FastifyInstance> {
  const app = Fastify({ logger: config.log });
  await app.register(books, { config });
  return app;
}
