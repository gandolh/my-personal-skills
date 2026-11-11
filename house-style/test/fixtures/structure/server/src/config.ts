export interface Config {
  host: string;
  port: number;
  log: boolean;
}

// The one reader of the environment.
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return { host: env.HOST ?? "127.0.0.1", port: Number(env.PORT ?? "3000"), log: env.LOG === "1" };
}
