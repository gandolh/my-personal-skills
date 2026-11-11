// hooks.test.mjs - runs each hook script the way Claude Code does: a JSON
// event on stdin, in scratch folders under the system temp folder.
//
//   node --test hooks/hooks.test.mjs
//
// The formatter tests need an installed Prettier to copy into the scratch
// repo. They look in house-style/node_modules/prettier, or in the folder
// PRETTIER_PACKAGE_DIR names, and are skipped when neither exists.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sessionDir } from "./session-state.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const scratch = mkdtempSync(join(tmpdir(), "house-style-hooks-test-"));
const sessions = [];
after(() => {
  rmSync(scratch, { recursive: true, force: true });
  for (const id of sessions) rmSync(sessionDir(id), { recursive: true, force: true });
});

function hook(script, event) {
  const r = spawnSync(process.execPath, [join(here, script)], { input: JSON.stringify(event), encoding: "utf8" });
  return { code: r.status, stdout: r.stdout, stderr: r.stderr };
}

function newSession() {
  const id = randomUUID();
  sessions.push(id);
  return id;
}

/** A scratch git repo with a package.json and optional extra files. */
function repo(scripts, files = {}) {
  const dir = mkdtempSync(join(scratch, "repo-"));
  mkdirSync(join(dir, ".git"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, scripts }));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
}

const stop = (cwd, session, active = false) =>
  hook("stop-check.mjs", { session_id: session, cwd, hook_event_name: "Stop", stop_hook_active: active });
const saved = (session, file) =>
  hook("note-saved-file.mjs", {
    session_id: session,
    hook_event_name: "PostToolUse",
    tool_name: "Edit",
    tool_input: { file_path: file },
  });

// A check:fast that prints the text of fail.txt and fails while it exists.
const FAILING = { "check:fast": "node check.mjs" };
const CHECK = `import { existsSync, readFileSync } from "node:fs";
if (existsSync("fail.txt")) { console.log(readFileSync("fail.txt", "utf8")); process.exit(1); }`;

describe("Stop hook", () => {
  it("does nothing without a package.json or a check:fast script", () => {
    const bare = mkdtempSync(join(scratch, "bare-"));
    mkdirSync(join(bare, ".git"));
    assert.deepEqual(stop(bare, newSession()), { code: 0, stdout: "", stderr: "" });
    const plain = repo({ test: "node -e 1" });
    const s = newSession();
    saved(s, join(plain, "a.ts"));
    assert.deepEqual(stop(plain, s), { code: 0, stdout: "", stderr: "" });
  });

  it("does nothing when the session saved no code file in the package", () => {
    const dir = repo(FAILING, { "check.mjs": CHECK, "fail.txt": "src/a.ts(1,1): error TS1" });
    const s = newSession();
    saved(s, join(dir, "README.md"));
    saved(s, join(scratch, "elsewhere.ts"));
    assert.deepEqual(stop(dir, s), { code: 0, stdout: "", stderr: "" });
  });

  it("is silent on a green run, and exits 2 with the tail on a red one", () => {
    const dir = repo(FAILING, { "check.mjs": CHECK });
    const s = newSession();
    saved(s, join(dir, "src", "a.ts"));
    assert.deepEqual(stop(dir, s), { code: 0, stdout: "", stderr: "" });
    // A green run forgets the saves, so the next stop has nothing to check.
    writeFileSync(join(dir, "fail.txt"), "src/a.ts(3,7): error TS2322: nope");
    assert.equal(stop(dir, s).code, 0);
    saved(s, join(dir, "src", "a.ts"));
    const red = stop(dir, s);
    assert.equal(red.code, 2);
    assert.match(red.stderr, /check:fast` failed in scratch/);
    assert.match(red.stderr, /error TS2322: nope/);
  });

  it("finds the root script from a workspace folder, and stays inside the repo", () => {
    const dir = repo(FAILING, { "check.mjs": CHECK, "fail.txt": "boom", "server/package.json": "{}" });
    const s = newSession();
    saved(s, join(dir, "server", "src", "app.ts"));
    assert.equal(stop(join(dir, "server"), s).code, 2);
    const inner = join(dir, "nested");
    mkdirSync(join(inner, ".git"), { recursive: true });
    const t = newSession();
    saved(t, join(inner, "x.ts"));
    assert.equal(stop(inner, t).code, 0);
  });

  it("finds check:fast from the saved file's folder when the session opened at a root without one", () => {
    const dir = repo({}, {
      "app/package.json": JSON.stringify({ name: "app", scripts: FAILING }),
      "app/check.mjs": CHECK,
      "app/fail.txt": "app/src/a.ts(1,1): error TS9",
      "other/package.json": "{}",
    });
    const s = newSession();
    saved(s, join(dir, "app", "src", "a.ts"));
    const red = stop(dir, s);
    assert.equal(red.code, 2);
    assert.match(red.stderr, /failed in app/);
    assert.match(red.stderr, /error TS9/);
    // A save in a folder with no check:fast leads nowhere, and the root has none either.
    const t = newSession();
    saved(t, join(dir, "other", "b.ts"));
    assert.deepEqual(stop(dir, t), { code: 0, stdout: "", stderr: "" });
  });

  it("runs each distinct package once, for every app the session saved in", () => {
    const app = (name, failing) => ({
      [`${name}/package.json`]: JSON.stringify({ name, scripts: FAILING }),
      [`${name}/check.mjs`]: `import { appendFileSync } from "node:fs";\nappendFileSync("../runs.txt", "${name}\\n");\nif (${failing}) { console.log("red in ${name}"); process.exit(1); }`,
    });
    const dir = repo({}, { ...app("one", false), ...app("two", true) });
    const s = newSession();
    saved(s, join(dir, "one", "a.ts"));
    saved(s, join(dir, "one", "b.ts"));
    saved(s, join(dir, "two", "c.ts"));
    const red = stop(dir, s);
    assert.equal(red.code, 2);
    assert.match(red.stderr, /red in two/);
    assert.ok(!/red in one/.test(red.stderr));
    assert.deepEqual(readFileSync(join(dir, "runs.txt"), "utf8").split("\n").filter(Boolean).sort(), ["one", "two"]);
  });

  it("lets the turn end when the same failure comes back", () => {
    const dir = repo(FAILING, { "check.mjs": CHECK, "fail.txt": "error TS1 in 1.2s" });
    const s = newSession();
    saved(s, join(dir, "a.ts"));
    assert.equal(stop(dir, s).code, 2);
    writeFileSync(join(dir, "fail.txt"), "error TS1 in 3.4s"); // only the timing changed
    const again = stop(dir, s, true);
    assert.equal(again.code, 0);
    assert.match(JSON.parse(again.stdout).systemMessage, /still fails in scratch with the same output/);
  });

  it("blocks while the failure changes, at most four times a turn", () => {
    const dir = repo(FAILING, { "check.mjs": CHECK });
    const s = newSession();
    saved(s, join(dir, "a.ts"));
    const codes = [];
    for (let i = 1; i <= 5; i++) {
      writeFileSync(join(dir, "fail.txt"), `error number ${"x".repeat(i)}`);
      codes.push(stop(dir, s, i > 1).code);
    }
    assert.deepEqual(codes, [2, 2, 2, 2, 0]);
    // A new turn starts the count again.
    saved(s, join(dir, "a.ts"));
    assert.equal(stop(dir, s, false).code, 2);
  });

  it("never runs a check:fast that runs tests", () => {
    const ran = (dir) => existsSync(join(dir, "ran.txt"));
    const marker = 'node -e "require(\'fs\').writeFileSync(\'ran.txt\',\'\')"';
    for (const scripts of [
      { "check:fast": `${marker} && vitest run` },
      { "check:fast": `${marker} && npm run lint`, lint: "eslint . && npm test", test: "node --test" },
      { "check:fast": `${marker} && npm run test:clean`, "test:clean": "node scripts/test-clean.mjs" },
    ]) {
      const dir = repo(scripts);
      const s = newSession();
      saved(s, join(dir, "a.ts"));
      const r = stop(dir, s);
      assert.equal(r.code, 1, JSON.stringify(scripts));
      assert.match(r.stderr, /never runs tests/);
      assert.equal(ran(dir), false);
    }
    // A config file named after a runner is not a test run.
    const dir = repo({ "check:fast": "node -e 1 vitest.config.ts" });
    const s = newSession();
    saved(s, join(dir, "a.ts"));
    assert.equal(stop(dir, s).code, 0);
  });
});

const prettierSource = [process.env.PRETTIER_PACKAGE_DIR, join(here, "..", "house-style", "node_modules", "prettier")]
  .filter(Boolean)
  .find((dir) => existsSync(join(dir, "package.json")));

describe("PostToolUse formatter", () => {
  const BAD = "const   x = {a:1,b:'two'}\nexport   function f( ){return x}\n";
  const edit = (file) =>
    hook("format-saved-file.mjs", {
      session_id: newSession(),
      hook_event_name: "PostToolUse",
      tool_name: "Write",
      tool_input: { file_path: file },
    });

  it("leaves the file alone without a Prettier config", () => {
    const dir = repo({}, { "src/a.ts": BAD });
    if (prettierSource) cpSync(prettierSource, join(dir, "node_modules", "prettier"), { recursive: true });
    assert.deepEqual(edit(join(dir, "src", "a.ts")), { code: 0, stdout: "", stderr: "" });
    assert.equal(readFileSync(join(dir, "src", "a.ts"), "utf8"), BAD);
    assert.equal(edit(join(dir, "src", "missing.ts")).code, 0);
  });

  it("formats with the repo's Prettier, and skips ignored files", { skip: !prettierSource && "no Prettier to copy" }, () => {
    const config = 'export default { printWidth: 120, trailingComma: "all" };\n';
    const files = { "prettier.config.js": config, ".prettierignore": "*.md\nvendor/\n", "src/a.ts": BAD, "vendor/b.ts": BAD };
    const dir = repo({}, files);
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "scratch", type: "module" }));
    cpSync(prettierSource, join(dir, "node_modules", "prettier"), { recursive: true });
    assert.deepEqual(edit(join(dir, "src", "a.ts")), { code: 0, stdout: "", stderr: "" });
    assert.equal(
      readFileSync(join(dir, "src", "a.ts"), "utf8"),
      'const x = { a: 1, b: "two" };\nexport function f() {\n  return x;\n}\n',
    );
    assert.equal(edit(join(dir, "vendor", "b.ts")).code, 0);
    assert.equal(readFileSync(join(dir, "vendor", "b.ts"), "utf8"), BAD);
  });
});

describe("PostToolUse note", () => {
  it("notes code files and nothing else", () => {
    const s = newSession();
    assert.deepEqual(saved(s, "/x/repo/src/a.tsx"), { code: 0, stdout: "", stderr: "" });
    saved(s, "/x/repo/docs/a.md");
    saved(s, "/x/repo/node_modules/p/index.js");
    assert.equal(hook("note-saved-file.mjs", { hook_event_name: "PostToolUse" }).code, 0);
    assert.equal(readdirSync(sessionDir(s)).length, 1);
  });
});
