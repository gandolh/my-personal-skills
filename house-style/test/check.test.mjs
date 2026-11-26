/**
 * bin/check.mjs in a scratch folder whose package.json scripts are `node -e` one-liners: no installs, no network.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const RUNNER = join(import.meta.dirname, "..", "bin", "check.mjs");

/** A script that prints a line, optionally drops a marker file in the cwd, and exits with `code`. */
function script(line, { code = 0, marker, sleep = 0 } = {}) {
  const parts = [];
  if (sleep > 0) parts.push(`await new Promise((r) => setTimeout(r, ${sleep}))`);
  if (marker) parts.push(`require('fs').appendFileSync('${marker}', Date.now() + '\\n')`);
  parts.push(`console.log('${line}')`);
  parts.push(`process.exit(${code})`);
  return `node -e "(async () => { ${parts.join("; ")} })()"`;
}

describe("bin/check.mjs", () => {
  let dir;
  const LOG = () => join(dir, "node_modules", ".cache", "check", "last.log");
  const run = (...steps) => spawnSync(process.execPath, [RUNNER, ...steps], { cwd: dir, encoding: "utf8" });

  before(() => {
    dir = mkdtempSync(join(tmpdir(), "house-style-check-"));
    const scripts = {
      first: script("first output"),
      broken: script("broken output line", { code: 3 }),
      last: script("last output", { marker: "last.marker" }),
      slowa: script("slow a", { sleep: 700, marker: "a.marker" }),
      slowb: script("slow b", { sleep: 700, marker: "b.marker" }),
    };
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "scratch", private: true, scripts }));
  });

  after(() => rmSync(dir, { recursive: true, force: true }));

  it("runs every step after one fails, exits 1 and prints the failure's last lines", () => {
    const result = run("first", "broken", "last");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /ok {3}first \(/);
    assert.match(result.stdout, /FAIL broken \(/);
    assert.match(result.stdout, /ok {3}last \(/);
    assert.match(result.stdout, /--- broken failed with exit 3\. Its last lines:/);
    assert.match(result.stdout, /check failed: broken/);
    assert.ok(existsSync(join(dir, "last.marker")), "the step after the failing one ran");
  });

  it("keeps one block per step in the log", () => {
    run("first", "broken", "last");
    const log = readFileSync(LOG(), "utf8");
    for (const step of ["first", "broken", "last"]) {
      assert.equal(log.split(`===== npm run ${step}\n`).length - 1, 1, `one block for ${step}`);
    }
    assert.match(log, /first output/);
    assert.match(log, /broken output line/);
    assert.ok(log.indexOf("npm run first") < log.indexOf("npm run broken"));
    assert.ok(log.indexOf("npm run broken") < log.indexOf("npm run last"));
  });

  it("exits 0 when every step passes", () => {
    const result = run("first", "last");
    assert.equal(result.status, 0);
    assert.match(result.stdout, /check passed/);
  });

  it("runs the steps of `a+b` side by side and both finish", () => {
    for (const marker of ["a.marker", "b.marker"]) rmSync(join(dir, marker), { force: true });
    const result = run("slowa+slowb");
    assert.equal(result.status, 0);
    assert.match(result.stdout, /ok {3}slowa \(/);
    assert.match(result.stdout, /ok {3}slowb \(/);
    const [a, b] = ["a.marker", "b.marker"].map((m) => Number(readFileSync(join(dir, m), "utf8").trim()));
    assert.ok(Math.abs(a - b) < 400, `the two steps ended ${Math.abs(a - b)} ms apart, so they overlapped`);
    const log = readFileSync(LOG(), "utf8");
    assert.match(log, /===== npm run slowa\n/);
    assert.match(log, /===== npm run slowb\n/);
  });

  it("runs the groups one after another", () => {
    const result = run("first+broken", "last");
    assert.equal(result.status, 1);
    assert.match(result.stdout, /first \+ broken, then last/);
    assert.match(result.stdout, /ok {3}last \(/);
  });

  it("exits 2 and runs nothing for an unknown step name", () => {
    rmSync(join(dir, "last.marker"), { force: true });
    const result = run("first", "nope", "last");
    assert.equal(result.status, 2);
    assert.match(result.stderr, /no npm script named nope/);
    assert.ok(!existsSync(join(dir, "last.marker")), "no step ran");
    assert.doesNotMatch(result.stdout, /ok {3}first/);
  });

  it("exits 2 when no step is given", () => {
    const result = run();
    assert.equal(result.status, 2);
    assert.match(result.stderr, /none given/);
  });
});
