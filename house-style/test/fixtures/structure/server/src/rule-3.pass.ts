import type { Config } from "./config.js";

// process.env and NODE_ENV in a comment or a string don't count: "process.env.NODE_ENV".
export const describePort = (config: Config): string => `port ${config.port}, from process.env.PORT`;
