// repo.mjs - finding things above a path, without leaving the repo.
//
// Both hooks walk up from a folder (the session's cwd, or a saved file's
// folder) and stop at the first folder that holds `.git`, so a stray
// package.json or Prettier config above the repo is never used. Outside any
// git checkout they walk to the filesystem root. Zero dependencies.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Yields `start` and each folder above it, ending at the repo root. */
export function* foldersUp(start) {
  let dir = start;
  for (;;) {
    yield dir;
    if (existsSync(join(dir, ".git"))) return;
    const parent = dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}

export function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/** Reads the hook event from stdin. Returns null when it isn't JSON. */
export async function readEvent() {
  let text = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) text += chunk;
  try {
    const event = JSON.parse(text);
    return event && typeof event === "object" ? event : null;
  } catch {
    return null;
  }
}
