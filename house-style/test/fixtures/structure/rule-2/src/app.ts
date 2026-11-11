import Fastify, { type FastifyInstance } from "fastify";

// Named createApp, and a buildApp that isn't exported: the entry can't find it.
function buildApp(): FastifyInstance {
  return Fastify();
}

export const createApp = buildApp;
