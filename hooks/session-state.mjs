// session-state.mjs - the little state the house-style hooks share.
//
// The PostToolUse hook notes each code file a session saves, and the Stop
// hook runs `check:fast` only for a package that holds one of those files.
// So a turn that only answered a question costs nothing, and never blocks
// on errors it didn't make. The Stop hook also keeps its per-turn loop
// guard here.
//
// State lives in the system temp folder, one folder per session, and is
// lost on a reboot, which only means the next stop runs the check again.
// Zero dependencies.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";

// The extensions a typecheck or a lint run can see. A saved Markdown file
// doesn't arm the Stop hook, so editing docs in a red repo isn't blocked.
const CODE_FILE = /\.(?:[cm]?[jt]sx?|astro|vue|svelte|json)$/i;

const user = () => (typeof process.getuid === "function" ? String(process.getuid()) : "user");
const safe = (id) => String(id).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 100);
const hash = (text) => createHash("sha1").update(text).digest("hex").slice(0, 16);

export function sessionDir(sessionId) {
  return join(tmpdir(), `claude-house-style-${user()}`, safe(sessionId));
}

export function isCodeFile(file) {
  return CODE_FILE.test(file) && !file.split(/[\\/]/).includes("node_modules");
}

/** Records that this session saved `file`. Safe to call from parallel hooks. */
export function noteSavedFile(sessionId, file) {
  const dir = sessionDir(sessionId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `saved-${hash(file)}`), file);
}

/** The saved files that sit under `root`. */
export function savedFilesUnder(sessionId, root) {
  const dir = sessionDir(sessionId);
  if (!existsSync(dir)) return [];
  const prefix = root.endsWith(sep) ? root : root + sep;
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.startsWith("saved-")) continue;
    try {
      const file = readFileSync(join(dir, name), "utf8");
      if (file.startsWith(prefix)) out.push({ name, file });
    } catch {
      // A note another hook is writing right now; the next stop reads it.
    }
  }
  return out;
}

/** Forgets the saved files under `root`, after a green run. */
export function clearSavedFilesUnder(sessionId, root) {
  const dir = sessionDir(sessionId);
  for (const { name } of savedFilesUnder(sessionId, root)) rmSync(join(dir, name), { force: true });
}

function stopStatePath(sessionId, root) {
  return join(sessionDir(sessionId), `stop-${hash(root)}.json`);
}

export function readStopState(sessionId, root) {
  try {
    return JSON.parse(readFileSync(stopStatePath(sessionId, root), "utf8"));
  } catch {
    return null;
  }
}

export function writeStopState(sessionId, root, state) {
  const file = stopStatePath(sessionId, root);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(state));
}

export function clearStopState(sessionId, root) {
  rmSync(stopStatePath(sessionId, root), { force: true });
}

export { hash };
