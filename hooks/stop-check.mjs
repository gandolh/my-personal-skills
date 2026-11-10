#!/usr/bin/env node
// stop-check.mjs - the plugin's Stop hook: run the repo's `check:fast`
// before Claude ends a turn, and send Claude back to work when it fails.
//
// It reads the hook event on stdin and finds the nearest package.json with a
// `check:fast` script, from the event's `cwd` up to the repo root. It does
// nothing, silently, when:
//   - there is no such script (a repo opts in by defining it);
//   - this session saved no code file under that package since its last
//     green run (hooks/note-saved-file.mjs records saves), so a turn that
//     only read or answered costs nothing and never blocks on errors it
//     didn't make;
//   - the script, or a script it runs with `npm run`, names a test runner.
//     `check:fast` is a typecheck and a lint and nothing else, because a
//     repo's tests may read its production `.env` (just-a-bot's do). That
//     case exits 1, which Claude Code shows the user as a hook error without
//     blocking.
// A green run exits 0 and prints nothing. A red run prints the tail of the
// output to stderr and exits 2, which Claude Code hands to Claude as the
// reason to keep working.
//
// The loop guard. `stop_hook_active` is true when Claude is already
// continuing because a stop hook blocked. Claude Code's own cap (eight
// continuations in a row) resets every time Claude calls a tool, so a model
// that keeps editing without converging is never stopped by it. So, within
// one turn, this hook blocks again only while the failure changes, and at
// most MAX_BLOCKS times. The same failure twice means Claude made no
// progress: the hook lets the turn end and tells the user, through
// `systemMessage`, that check:fast is still red. A new turn
// (`stop_hook_active` false) starts the count again.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { foldersUp, readEvent, readJson } from "./repo.mjs";
import {
  clearSavedFilesUnder,
  clearStopState,
  hash,
  readStopState,
  savedFilesUnder,
  writeStopState,
} from "./session-state.mjs";

const MAX_BLOCKS = 4;
const RUN_TIMEOUT_MS = 240_000; // under the 300 s timeout in hooks.json
const TAIL_LINES = 60;
const TAIL_CHARS = 6000;

const TEST_RUNNER =
  /\b(?:vitest|jest|mocha|playwright)(?=\s|$|["'])|\bnode\s+(?:--\S+\s+)*--test\b|\b(?:npm|pnpm|yarn)\s+(?:run\s+)?(?:t|test)\b|\bturbo\s+(?:run\s+)?test\b/;
const NPM_RUN = /\bnpm\s+(?:run|run-script)\s+(?:-{1,2}\S+\s+)*([^\s&|;"']+)/g;

/** The first script in `name`'s `npm run` graph that names a test runner. */
function testingScript(scripts, name, seen = new Set()) {
  if (seen.has(name) || typeof scripts[name] !== "string") return null;
  seen.add(name);
  const body = scripts[name];
  if (TEST_RUNNER.test(body)) return name;
  for (const m of body.matchAll(NPM_RUN)) {
    const found = testingScript(scripts, m[1], seen);
    if (found) return found;
  }
  return null;
}

function findPackage(cwd) {
  for (const dir of foldersUp(cwd)) {
    const file = join(dir, "package.json");
    if (!existsSync(file)) continue;
    const pkg = readJson(file);
    if (pkg?.scripts && typeof pkg.scripts["check:fast"] === "string") return { dir, pkg };
  }
  return null;
}

function run(dir) {
  return new Promise((resolve) => {
    const out = [];
    const child = spawn("npm", ["run", "--silent", "check:fast"], {
      cwd: dir,
      env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    const timer = setTimeout(() => child.kill("SIGTERM"), RUN_TIMEOUT_MS);
    child.stdout.on("data", (b) => out.push(b));
    child.stderr.on("data", (b) => out.push(b));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ code: null, error, output: "" });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, output: Buffer.concat(out).toString("utf8") });
    });
  });
}

function tail(text) {
  const lines = text.replace(/\s+$/, "").split("\n").slice(-TAIL_LINES).join("\n");
  return lines.length > TAIL_CHARS ? "…" + lines.slice(-TAIL_CHARS) : lines;
}

// Timings change from run to run; they must not make a failure look new.
const fingerprint = (text) => hash(text.replace(/\d+(?:\.\d+)?\s?(?:ms|s)\b/g, "<t>"));

const event = await readEvent();
if (!event || typeof event.cwd !== "string") process.exit(0);
const found = findPackage(event.cwd);
if (!found) process.exit(0);

const { dir, pkg } = found;
const name = typeof pkg.name === "string" ? pkg.name : basename(dir);
const session = typeof event.session_id === "string" && event.session_id ? event.session_id : null;

if (session && savedFilesUnder(session, dir).length === 0) process.exit(0);

const testing = testingScript(pkg.scripts, "check:fast");
if (testing) {
  process.stderr.write(
    `house-style Stop hook: skipped ${name}'s check:fast, because "${testing}" runs tests. ` +
      `The hook never runs tests (a repo's tests may read its production .env). ` +
      `Make check:fast a typecheck and a lint only.\n`,
  );
  process.exit(1);
}

const result = await run(dir);

if (result.error || result.signal || result.code === null) {
  const why = result.error ? result.error.message : `it was stopped after ${RUN_TIMEOUT_MS / 1000} s`;
  process.stderr.write(`house-style Stop hook: check:fast in ${name} did not finish (${why}); not blocking.\n`);
  process.exit(1);
}

if (result.code === 0) {
  if (session) {
    clearSavedFilesUnder(session, dir);
    clearStopState(session, dir);
  }
  process.exit(0);
}

const report = tail(result.output);
const print = () => {
  process.stderr.write(
    `\`npm run check:fast\` failed in ${name} (${dir}), exit ${result.code}. ` +
      `It is the repo's fast gate: a typecheck, and ESLint on the changed files. ` +
      `Fix what it reports, or say why you can't, before you finish.\n\n${report}\n`,
  );
  process.exit(2);
};

if (!session) print();

const now = fingerprint(report);
const before = event.stop_hook_active === true ? readStopState(session, dir) : null;

if (before && (before.fingerprint === now || before.blocks >= MAX_BLOCKS)) {
  // No progress since the last block, or the cap: let the turn end.
  clearStopState(session, dir);
  clearSavedFilesUnder(session, dir);
  const why = before.fingerprint === now ? "with the same output as before" : `after ${before.blocks} tries`;
  process.stdout.write(
    JSON.stringify({
      systemMessage: `check:fast still fails in ${name} ${why}; the house-style Stop hook let the turn end. Run npm run check:fast there to see it.`,
    }) + "\n",
  );
  process.exit(0);
}

writeStopState(session, dir, { fingerprint: now, blocks: (before?.blocks ?? 0) + 1 });
print();
