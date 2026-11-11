import Fastify from "fastify";

// The app is built and listened to in one file, so tests can't build it alone.
const app = Fastify();
await app.listen({ port: 3000 });
