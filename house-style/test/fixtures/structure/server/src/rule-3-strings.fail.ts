declare function env(name: string): string | undefined;

// A string that is the name and nothing else is a read: by key, or through a helper.
export const mode = process.env["NODE_ENV"];
export const same = env("NODE_ENV");
