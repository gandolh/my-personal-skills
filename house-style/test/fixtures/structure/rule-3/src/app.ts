import Fastify, { type FastifyInstance } from "fastify";

export const buildApp = (): FastifyInstance => Fastify();
