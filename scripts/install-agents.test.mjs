// install-agents.test.mjs - runs install-agents.mjs against scratch targets,
// never the real user folder.
//
//   node --test scripts/install-agents.test.mjs
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { WORKFLOW_AGENTS } from "./install-agents.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "install-agents.mjs");
const scratch = mkdtempSync(join(tmpdir(), "install-agents-test-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const install = (...args) => {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
};

describe("install-agents", () => {
  it("writes nothing on --dry-run", () => {
    const target = mkdtempSync(join(scratch, "dry-"));
    const r = install("--dry-run", "--target", target);
    assert.equal(r.code, 0, r.out);
    assert.equal(r.out.match(/^dry-run write/gm).length, WORKFLOW_AGENTS.length + 1);
    assert.deepEqual(readdirSync(target), []);
  });

  it("installs the agents with the guard's absolute path, and a second run changes nothing", () => {
    const target = mkdtempSync(join(scratch, "real-"));
    assert.equal(install("--target", target).code, 0);
    const guard = join(target, "hooks", "personal-skills", "agent-guard.mjs");
    assert.equal(readFileSync(guard, "utf8"), readFileSync(join(here, "..", "hooks", "agent-guard.mjs"), "utf8"));
    const first = {};
    for (const name of WORKFLOW_AGENTS) {
      const text = readFileSync(join(target, "agents", `${name}.md`), "utf8");
      first[name] = text;
      assert.ok(text.startsWith("---\n# Installed by personal-skills"), name);
      assert.ok(!text.includes("CLAUDE_PLUGIN_ROOT"), name);
      assert.ok(text.includes(`args: [${JSON.stringify(guard)}, `), name);
      assert.match(text, new RegExp(`^name: ${name}$`, "m"));
    }
    const again = install("--target", target);
    assert.equal(again.code, 0);
    assert.equal(again.out.match(/^same /gm).length, WORKFLOW_AGENTS.length + 1);
    for (const name of WORKFLOW_AGENTS) assert.equal(readFileSync(join(target, "agents", `${name}.md`), "utf8"), first[name]);
  });

  it("the installed guard blocks a push from the installed path", () => {
    const target = mkdtempSync(join(scratch, "e2e-"));
    install("--target", target);
    const text = readFileSync(join(target, "agents", "brief-builder.md"), "utf8");
    const [guard, mode] = JSON.parse(/args: (\[.*\])/.exec(text)[1]);
    const run = (command) =>
      spawnSync(process.execPath, [guard, mode], {
        input: JSON.stringify({ agent_id: "t", cwd: scratch, tool_name: "Bash", tool_input: { command } }),
        encoding: "utf8",
        env: { ...process.env, AGENT_GUARD_STATE: join(scratch, "state") },
      }).status;
    assert.equal(run("git push"), 2);
    assert.equal(run("git status"), 0);
  });

  it("keeps an agent file it didn't write unless --force", () => {
    const target = mkdtempSync(join(scratch, "foreign-"));
    mkdirSync(join(target, "agents"));
    writeFileSync(join(target, "agents", "owner-steps.md"), "---\nname: owner-steps\n---\nmine\n");
    const r = install("--target", target);
    assert.equal(r.code, 1);
    assert.match(r.out, /keep .*owner-steps\.md/);
    assert.equal(readFileSync(join(target, "agents", "owner-steps.md"), "utf8"), "---\nname: owner-steps\n---\nmine\n");
    assert.ok(existsSync(join(target, "agents", "brief-builder.md")));
    assert.equal(install("--target", target, "--force").code, 0);
    assert.match(readFileSync(join(target, "agents", "owner-steps.md"), "utf8"), /# Installed by/);
  });
});
