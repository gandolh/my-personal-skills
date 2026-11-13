import type { FastifyInstance } from "fastify";

const routes = { me: { path: "/api/me", response: {} } };
const PATH = "/api/x";
declare function handler(): Promise<string>;
declare const cache: Map<string, string> & { get(key: string, fallback: string): string };
declare const store: { patch(id: string, change: object): void };
declare const covers: { put(id: string, bytes: Uint8Array): void };
declare const http: { get(url: string, options: object): Promise<unknown> };
declare const typed: FastifyInstance;

// Calls that aren't routes, and computed routes that declare their schemas.
export function register(app: FastifyInstance, key: string, id: string): void {
  cache.get(key, "none");
  store.patch(id, { title: "x" });
  covers.put(id, new Uint8Array());
  void http.get(key, { timeout: 5000 });
  app.get(routes.me.path, { schema: { response: { 200: routes.me.response } } }, handler);
  typed.get("/api/typed", { schema: {} }, handler);
  typed.get(PATH, { schema: {} }, handler);
}

// NestJS resolves a provider with app.get(Token): a class, never a path.
interface NestApp {
  get(token: unknown, options?: object): unknown;
}
declare class ConfigService<T, U> {
  value?: [T, U];
}
export function bootstrap(app: NestApp): void {
  app.get(ConfigService<object, true>, { strict: false });
  app.get(ConfigService, { strict: false });
}
