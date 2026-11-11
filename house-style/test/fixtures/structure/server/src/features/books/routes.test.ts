// Tests are excepted from rules 1, 3 and 6: a real socket, the environment and a parse are fine here.
import { BookInput } from "../../../../shared/src/books.js";
import { buildApp } from "../../app.js";

export async function realSocket(): Promise<string> {
  const app = await buildApp({ host: "127.0.0.1", port: 0, log: process.env.NODE_ENV === "debug" });
  app.post("/echo", async (request) => BookInput.parse(request.body));
  return app.listen({ port: 0 });
}
