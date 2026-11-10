#!/usr/bin/env node
// format-saved-file.mjs - a PostToolUse hook on Edit|Write: format the file
// Claude just saved with the repo's own Prettier, so agents never
// hand-format and every diff is already in house style.
//
// It acts only when, walking up from the file to the repo root, it finds a
// Prettier config and an installed `node_modules/prettier`. It never
// installs or downloads Prettier, and never uses a config from outside the
// repo. Prettier runs from the config's folder, so that folder's
// `.prettierignore` applies (the house lists `*.md` and `vendor/house-style/`
// there) and an ignored file is left alone. `--ignore-unknown` skips file
// types Prettier can't parse.
//
// It always exits 0 and prints nothing. A file Prettier can't parse is left
// as it was, and the typecheck reports the real error.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { foldersUp, readEvent, readJson } from "./repo.mjs";

const CONFIG_FILES = [
  ".prettierrc",
  ".prettierrc.json",
  ".prettierrc.yaml",
  ".prettierrc.yml",
  ".prettierrc.json5",
  ".prettierrc.js",
  ".prettierrc.cjs",
  ".prettierrc.mjs",
  ".prettierrc.ts",
  ".prettierrc.cts",
  ".prettierrc.mts",
  ".prettierrc.toml",
  "prettier.config.js",
  "prettier.config.cjs",
  "prettier.config.mjs",
  "prettier.config.ts",
  "prettier.config.cts",
  "prettier.config.mts",
];
const RUN_TIMEOUT_MS = 20_000; // under the 30 s timeout in hooks.json

function hasConfig(dir) {
  if (CONFIG_FILES.some((name) => existsSync(join(dir, name)))) return true;
  const pkg = existsSync(join(dir, "package.json")) ? readJson(join(dir, "package.json")) : null;
  return Boolean(pkg && pkg.prettier !== undefined);
}

/** The closest installed Prettier: its CLI script and major version. */
function findPrettier(start) {
  for (const dir of foldersUp(start)) {
    const manifest = join(dir, "node_modules", "prettier", "package.json");
    if (!existsSync(manifest)) continue;
    const pkg = readJson(manifest);
    const bin = typeof pkg?.bin === "string" ? pkg.bin : pkg?.bin?.prettier;
    if (typeof bin !== "string") continue;
    const cli = resolve(dirname(manifest), bin);
    if (existsSync(cli)) return { cli, major: Number.parseInt(String(pkg.version), 10) || 3 };
  }
  return null;
}

try {
  const event = await readEvent();
  const file = event?.tool_input?.file_path;
  if (typeof file === "string" && existsSync(file)) {
    const start = dirname(resolve(file));
    let configDir = null;
    for (const dir of foldersUp(start)) {
      if (hasConfig(dir)) {
        configDir = dir;
        break;
      }
    }
    const prettier = configDir && findPrettier(start);
    if (prettier) {
      const quiet = prettier.major >= 3 ? ["--log-level", "silent"] : ["--loglevel", "silent"];
      spawnSync(process.execPath, [prettier.cli, "--write", "--ignore-unknown", ...quiet, resolve(file)], {
        cwd: configDir,
        stdio: "ignore",
        timeout: RUN_TIMEOUT_MS,
      });
    }
  }
} catch {
  // A formatter problem never fails the edit.
}
process.exit(0);
