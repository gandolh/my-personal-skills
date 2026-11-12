// verify-brief.test.mjs - runs verify-brief.mjs on scratch git repos.
//
//   node --test scripts/verify-brief.test.mjs
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { failingTestFiles, globToRegExp } from "./verify-brief.mjs";

const script = join(dirname(fileURLToPath(import.meta.url)), "verify-brief.mjs");
const scratch = mkdtempSync(join(tmpdir(), "verify-brief-test-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const git = (cwd, ...args) =>
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false", ...args], {
    cwd,
    encoding: "utf8",
  });

/** A repo with one base commit; `files` are committed on top of it. */
function repo(files = {}) {
  const dir = mkdtempSync(join(scratch, "repo-"));
  git(dir, "init", "-q", "-b", "main");
  writeFileSync(join(dir, "README.md"), "base\n");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "base");
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "work");
  return dir;
}

const verify = (dir, args = [], env = {}) => {
  const r = spawnSync(process.execPath, [script, dir, "HEAD~1", "--no-audit", "--log", join(dir, "..", `log-${Math.random()}`), ...args], {
    encoding: "utf8",
    env: { ...process.env, VERIFY_BRIEF_DENY: "", ...env },
  });
  return { code: r.status, out: r.stdout + r.stderr };
};
const lineOf = (out, name) => out.split("\n").find((l) => l.slice(6).startsWith(name)) ?? "";

describe("verify-brief", () => {
  it("passes a clean brief and prints one line per check", () => {
    const r = verify(repo({ "src/a.ts": "export const a = 1;\n" }), ["--gate", "true"]);
    assert.equal(r.code, 0, r.out);
    assert.match(lineOf(r.out, "gate"), /^\s+0\s/);
    assert.match(lineOf(r.out, "git status"), /clean/);
    assert.match(r.out, /^PASS/m);
    assert.ok(r.out.split("\n").length <= 16, r.out);
  });

  it("fails a failing gate and a missing gate is a skip", () => {
    assert.equal(verify(repo({ "a.txt": "x\n" }), ["--gate", "exit 3"]).code, 1);
    const r = verify(repo({ "a.txt": "x\n" }));
    assert.equal(r.code, 0, r.out);
    assert.match(lineOf(r.out, "gate"), /skip/);
  });

  it("reads the gate from package.json: check, else typecheck then test", () => {
    const pkg = (scripts) => JSON.stringify({ name: "x", private: true, scripts });
    const r = verify(repo({ "package.json": pkg({ typecheck: "node -e 0", test: "exit 4" }) }));
    assert.equal(r.code, 1);
    assert.match(lineOf(r.out, "typecheck"), /^\s+0\s/);
    assert.match(lineOf(r.out, "test"), /^\s+4\s/);
    const c = verify(repo({ "package.json": pkg({ check: "node -e 0", test: "exit 4" }) }));
    assert.equal(c.code, 0, c.out);
    assert.match(lineOf(c.out, "check"), /npm run check/);
  });

  it("fails a dirty tree", () => {
    const dir = repo({ "a.txt": "x\n" });
    writeFileSync(join(dir, "stray.txt"), "left behind\n");
    const r = verify(dir, ["--gate", "true"]);
    assert.equal(r.code, 1);
    assert.match(lineOf(r.out, "git status"), /stray\.txt/);
  });

  it("fails a tracked .env or node_modules, and passes .env.example", () => {
    assert.equal(verify(repo({ ".env.example": "PORT=\n" }), ["--gate", "true"]).code, 0);
    assert.match(lineOf(verify(repo({ "server/.env": "X=1\n" }), ["--gate", "true"]).out, "tracked"), /server\/\.env/);
    assert.equal(verify(repo({ "node_modules/x/index.js": "\n" }), ["--gate", "true"]).code, 1);
  });

  it("fails a machine path or a denied word the diff adds", () => {
    const home = verify(repo({ "doc.md": "see /home/someone/projects/x\n" }), ["--gate", "true"]);
    assert.equal(home.code, 1);
    assert.match(lineOf(home.out, "diff grep"), /doc\.md:1/);
    const word = verify(repo({ "doc.md": "line one\nhosted at example-estate.test\n" }), ["--gate", "true"], {
      VERIFY_BRIEF_DENY: "example-estate.test",
    });
    assert.match(lineOf(word.out, "diff grep"), /doc\.md:2 \(denied word\)/);
    assert.equal(verify(repo({ "doc.md": "process.env and import.meta.env\n" }), ["--gate", "true"]).code, 0);
  });

  it("fails a changed path an --untouched glob names", () => {
    const dir = repo({ "agents/design-critic.md": "x\n", "src/a.ts": "\n" });
    const r = verify(dir, ["--gate", "true", "--untouched", "agents/design-*.md"]);
    assert.equal(r.code, 1);
    assert.match(lineOf(r.out, "untouched"), /design-critic/);
    assert.equal(verify(dir, ["--gate", "true", "--untouched", "corpus/todos/**"]).code, 0);
  });

  it("re-runs a failing file on the flaky list alone", () => {
    const gate = `echo ' FAIL  src/slow.test.ts > renders'; exit 1`;
    const dir = repo({ ".flaky-tests": "# load-sensitive\nsrc/slow.test.ts :: true\n" });
    const r = verify(dir, ["--gate", gate]);
    assert.equal(r.code, 0, r.out);
    assert.match(lineOf(r.out, "gate"), /flaky, passed alone: src\/slow\.test\.ts/);
    const still = repo({ ".flaky-tests": "src/slow.test.ts :: exit 1\n" });
    assert.equal(verify(still, ["--gate", gate]).code, 1);
    const other = verify(dir, ["--gate", `echo ' FAIL  src/other.test.ts'; ${gate}`]);
    assert.equal(other.code, 1);
    assert.match(lineOf(other.out, "gate"), /failing: .*other\.test\.ts/);
  });

  it("refuses an unknown base", () => {
    const r = spawnSync(process.execPath, [script, repo(), "no-such-ref"], { encoding: "utf8" });
    assert.equal(r.status, 2);
  });
});

describe("helpers", () => {
  it("globToRegExp", () => {
    assert.ok(globToRegExp("agents/design-*.md").test("agents/design-judge.md"));
    assert.ok(!globToRegExp("agents/design-*.md").test("agents/sub/design-judge.md"));
    assert.ok(globToRegExp("corpus/**").test("corpus/todos/a.md"));
    assert.ok(globToRegExp("**/package.json").test("package.json"));
    assert.ok(globToRegExp("**/package.json").test("a/b/package.json"));
    assert.ok(globToRegExp("skills/").test("skills/x/SKILL.md"));
  });

  it("failingTestFiles reads vitest, jest and node --test output", () => {
    const out = [
      " FAIL  src/a.test.ts > suite > case",
      " ❯ web/src/b.test.tsx (3 tests | 1 failed)",
      "not ok 2 - hooks/hooks.test.mjs",
      "not ok 3 - does a thing",
      " ✓ src/ok.test.ts",
    ].join("\n");
    assert.deepEqual(failingTestFiles(out).sort(), ["hooks/hooks.test.mjs", "src/a.test.ts", "web/src/b.test.tsx"]);
  });
});
