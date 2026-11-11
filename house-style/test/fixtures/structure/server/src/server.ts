import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

// The entry: config, then the app, then listen. Only this file listens.
const config = loadConfig();
const app = await buildApp(config);
await app.listen({ host: config.host, port: config.port });
