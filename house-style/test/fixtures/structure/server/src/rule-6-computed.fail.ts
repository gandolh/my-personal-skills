import type { FastifyInstance } from "fastify";

const routes = { me: { path: "/api/me" } };
const SOCKET_PATH = "/ws/convert";
const PREFIX = "/api";
declare function handler(): Promise<string>;

// A route whose path isn't a literal still declares its schemas.
export function register(app: FastifyInstance): void {
  app.get(routes.me.path, handler);
  app.get(SOCKET_PATH, { websocket: true }, handler);
  app.post(`${PREFIX}/items`, handler);
}
