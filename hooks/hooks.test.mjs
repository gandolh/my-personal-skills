// hooks.test.mjs - runs each hook script the way Claude Code does: a JSON
// event on stdin, in scratch folders under the system temp folder.
//
//   node --test hooks/hooks.test.mjs
//
// The agent-guard tests start a few idle node processes to point kill at,
// and stop them when the file ends.
//
// The formatter tests need an installed Prettier to copy into the scratch
// repo. They look in house-style/node_modules/prettier, or in the folder
// PRETTIER_PACKAGE_DIR names, and are skipped when neither exists.
import { strict as assert } from "node:assert";
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { CAPTURE_MARKER, decide } from "./agent-guard.mjs";
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

// ------------------------------------------------------------- agent guard

describe("agent guard", () => {
  const state = mkdtempSync(join(scratch, "guard-state-"));
  process.env.AGENT_GUARD_STATE = state;
  const children = [];
  after(() => {
    for (const c of children) c.kill();
  });
  /** An idle process whose working folder is `cwd`, to point kill at. */
  const idle = (cwd) => {
    const c = spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)"], { cwd, stdio: "ignore" });
    children.push(c);
    return c.pid;
  };
  const gitRepo = () => {
    const dir = mkdtempSync(join(scratch, "checkout-"));
    mkdirSync(join(dir, ".git"));
    return dir;
  };
  let n = 0;
  const bash = (mode, command, agent = `agent-${++n}`) =>
    decide(mode, { agent_id: agent, cwd: scratch, tool_name: "Bash", tool_input: { command } });
  const tool = (mode, tool_name, tool_input, agent = `agent-${++n}`) =>
    decide(mode, { agent_id: agent, cwd: scratch, tool_name, tool_input });
  const blocks = (mode, commands) => {
    for (const c of commands) assert.ok(bash(mode, c), `should block in ${mode}: ${c}`);
  };
  const passes = (mode, commands) => {
    for (const c of commands) assert.equal(bash(mode, c), null, `should pass in ${mode}: ${c}`);
  };

  it("blocks a push however it is written", () => {
    blocks("builder", [
      "git push",
      "git push origin main",
      "git -C /tmp/x push",
      "git -c core.pager=cat push --force",
      "cd /tmp/x && git push",
      "git status; git push",
      `"git" 'push'`,
      `bash -c "git push"`,
      "sh -lc 'cd x; git push origin HEAD'",
      "eval git push",
      "env FOO=1 git push",
      "timeout 60 git push",
      "echo $(git push)",
      "echo `git push`",
      "sudo -u someone git push",
    ]);
  });

  it("blocks skipped hooks, pkill, pgrep -f and docker builds", () => {
    blocks("builder", [
      "git commit --no-verify -m x",
      "git commit -n -m x",
      "git commit -anm x",
      "npm run lint -- --no-verify",
      "pkill -f vite",
      "sudo pkill node",
      "killall node",
      "pgrep -f vite",
      "pgrep -af 'node server'",
      "fuser -k 5173/tcp",
      "docker build -t x .",
      "docker buildx build .",
      "docker compose build",
      "docker compose up -d --build",
      "docker-compose build web",
    ]);
  });

  it("blocks .env reads and writes in Bash and in the file tools", () => {
    blocks("builder", [
      "cat .env",
      "cat server/.env.local",
      "cat .env*",
      "source .env",
      ". ./.env",
      "cp .env /tmp/copy",
      "grep KEY < .env",
      "node --env-file=.env server.js",
      "echo X=1 >> .env",
      "less .envrc",
    ]);
    assert.ok(tool("builder", "Read", { file_path: "/srv/app/.env" }));
    assert.ok(tool("builder", "Read", { file_path: "/srv/app/.env.production" }));
    assert.ok(tool("builder", "Edit", { file_path: "/srv/app/.env.local", old_string: "a", new_string: "b" }));
    assert.ok(tool("builder", "Grep", { pattern: "KEY", path: "/srv/app/.env" }));
    assert.equal(tool("builder", "Read", { file_path: "/srv/app/.env.example" }), null);
    assert.equal(tool("audit", "Read", { file_path: "/srv/app/src/env.ts" }), null);
  });

  it("lets commit messages, tsc --build and process.env through", () => {
    passes("builder", [
      `git commit -m "never git push, pkill or read .env; the controller pushes"`,
      "git commit -am 'fix: read .env.local names from config.ts'",
      "git commit -F - <<'EOF'\nfix: don't git push from a builder\n\n.env stays out, pkill too (it's the rule)\nEOF",
      `git commit -m "$(cat <<'EOF'\nfeat: guard (don't push, it's the controller's)\n\nCo-Authored-By: someone\nEOF\n)"`,
      "npx tsc --build",
      "npm run build",
      `node -e "console.log(process.env.PORT)"`,
      "grep -rn import.meta.env src",
      "cat .env.example",
      "pgrep vite",
      "docker ps",
      "git status && git log --oneline -3",
      `echo "git push" > notes.txt`,
      "git -C /tmp/x status",
    ]);
  });

  it("lets kill reach only processes under folders the agent worked in", () => {
    const mine = gitRepo();
    const theirs = gitRepo();
    const mineId = idle(join(mine));
    const theirsId = idle(theirs);
    assert.equal(bash("builder", `cd ${mine} && kill ${mineId}`, "kill-a"), null);
    assert.equal(bash("builder", `kill -TERM ${mineId}`, "kill-a"), null);
    assert.match(bash("builder", `kill ${theirsId}`, "kill-a"), /outside every folder/);
    assert.match(bash("builder", `kill -9 ${theirsId}`, "kill-b"), /none yet/);
    assert.equal(bash("builder", `git -C ${theirs} log -1; kill ${theirsId}`, "kill-b"), null);
    assert.equal(bash("builder", `kill -0 ${theirsId}`, "kill-c"), null);
    assert.equal(bash("builder", "kill %1", "kill-c"), null);
    assert.equal(bash("builder", "kill 999999999", "kill-c"), null);
    assert.match(bash("builder", "kill $PID", "kill-a"), /literal PID/);
    assert.match(bash("builder", "kill $(cat server.pid)", "kill-a"), /literal PID/);
    assert.match(bash("builder", "cat server.pid | xargs kill", "kill-a"), /xargs/);
    assert.match(bash("builder", "kill -9 -1", "kill-a"), /far more/);
  });

  it("counts a scratch folder the agent made or wrote in, but never a broad one", () => {
    const parent = mkdtempSync(join(scratch, "scratch-"));
    const made = join(parent, "run-1");
    mkdirSync(made);
    const madeId = idle(made);
    assert.ok(bash("builder", `kill ${madeId}`, "kill-d"));
    tool("builder", "Write", { file_path: join(made, "notes.md"), content: "x" }, "kill-d");
    assert.equal(bash("builder", `kill ${madeId}`, "kill-d"), null);
    assert.equal(bash("builder", `mkdir -p ${made} && kill ${madeId}`, "kill-e"), null);
    const scratchId = idle(scratch);
    assert.ok(bash("builder", `cd ${scratch} && kill ${scratchId}`, "kill-f"), "a folder of checkouts is too broad");
    const homeId = idle(homedir());
    assert.ok(bash("builder", `cd ~ && cd ${homedir()} && kill ${homeId}`, "kill-f"), "home is too broad");
  });

  it("fences the capturer's writes and keeps its checkouts untouched", () => {
    const out = mkdtempSync(join(scratch, "shots-"));
    writeFileSync(join(out, CAPTURE_MARKER), "");
    assert.equal(tool("capturer", "Write", { file_path: join(out, "app", "shots.md"), content: "x" }), null);
    assert.match(tool("capturer", "Write", { file_path: join(scratch, "stray.md"), content: "x" }), /marked/);
    const repo = gitRepo();
    writeFileSync(join(repo, CAPTURE_MARKER), "");
    assert.match(tool("capturer", "Write", { file_path: join(repo, "shots", "a.md"), content: "x" }), /git checkout/);
    blocks("capturer", ["git commit -m x", "git push", "git stash", "git -C /tmp/x checkout main", "git add -A", "cat .env"]);
    passes("capturer", ["git status --porcelain", "git log -1", "node cap.mjs almanac http://127.0.0.1:4601"]);
  });

  it("keeps the auditor's Bash read only", () => {
    passes("audit", [
      "git show HEAD --stat",
      "git diff abc123..HEAD -- src | head -50",
      "cd /tmp/x && git log --oneline -5",
      "grep -rn toast src 2>/dev/null",
      "rg -n RadioGroup web/src > /dev/null 2>&1",
      "for f in a.md b.md; do wc -l $f; done",
      "git branch --list",
      "git branch --show-current",
      "brief-board show 29",
      "brief-board list --author library-workflow-agents",
      "find . -name '*.test.ts' | sort",
      "sed -n 1,40p corpus/briefs/todo/29-x.md",
      "npm ls zod",
    ]);
    blocks("audit", [
      "git commit -m x",
      "git checkout main",
      "git reset --hard HEAD~1",
      "git stash",
      "git branch new-name",
      "git push",
      "echo x > file",
      "cat a >> b",
      "git diff | tee out.patch",
      "sed -i s/a/b/ f",
      "find . -name x -delete",
      "rm -rf dist",
      "npm install",
      "npm run check",
      "bash -c 'touch x'",
      "brief-board start 29",
      "brief-board move 29 done -m x",
      "brief-board sprint start",
      "node cli.ts versions",
      "python3 -c 'open(\"x\",\"w\")'",
    ]);
    assert.ok(tool("audit", "Edit", { file_path: join(scratch, "a.md"), old_string: "a", new_string: "b" }));
  });

  it("lets owner-steps read the board and the deploy CLI's read-only verbs", () => {
    passes("owner-steps", [
      "node cli.ts versions",
      "cd /tmp/deploy && node cli.ts status shelfmark",
      "node cli.ts --list",
      "node cli.ts history ward -n 10",
      "node cli.ts lock",
      "brief-board needs",
      "brief-board list",
    ]);
    blocks("owner-steps", [
      "node cli.ts shelfmark deploy",
      "node cli.ts all server",
      "node cli.ts lock hold -m x",
      "node cli.ts rollback trips",
      "node cli.ts exec atrium -- ls",
      "node other.mjs",
      "brief-board move 29 done",
    ]);
  });

  it("speaks the hook protocol: exit 2 with the reason on stderr", () => {
    const run = (mode, event) => {
      const r = spawnSync(process.execPath, [join(here, "agent-guard.mjs"), mode], {
        input: typeof event === "string" ? event : JSON.stringify(event),
        encoding: "utf8",
        env: { ...process.env, AGENT_GUARD_STATE: state },
      });
      return { code: r.status, stderr: r.stderr };
    };
    const push = { agent_id: "p", cwd: scratch, tool_name: "Bash", tool_input: { command: "git push" } };
    const blocked = run("builder", push);
    assert.equal(blocked.code, 2);
    assert.match(blocked.stderr, /agent-guard \(builder\): blocked\. git push/);
    assert.equal(run("builder", { ...push, tool_input: { command: "git status" } }).code, 0);
    assert.equal(run("no-such-mode", push).code, 0);
    assert.equal(run("builder", "not json").code, 0);
  });
});
