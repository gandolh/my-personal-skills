import Fastify, { type FastifyInstance } from "fastify";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify();
  await app.listen({ port: 3000 });
  return app;
}
