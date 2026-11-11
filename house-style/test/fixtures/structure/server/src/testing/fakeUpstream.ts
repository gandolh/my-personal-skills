import { createServer } from "node:http";

// A test helper under testing/ is a test too: it may listen and read the environment.
export function fakeUpstream(): Promise<void> {
  const server = createServer((_request, response) => response.end(process.env.FAKE_BODY ?? "ok"));
  return new Promise((resolve) => server.listen(0, resolve));
}
