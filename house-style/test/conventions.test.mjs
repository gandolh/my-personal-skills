/**
 * conventions.json, the file both checkers read: where it may sit, each way it can be
 * malformed (both checkers refuse it with exit 2 and say where), and the JSON Schema
 * shipped for editors, which must say what bin/conventions.mjs enforces.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { CHECKS, CONVENTIONS_SPOTS, EXCEPTION_KEYS, TOP_LEVEL_KEYS, validateConventions } from "../bin/conventions.mjs";
import { runChecker, writeTree } from "./checker.mjs";

const PACKAGE = join(import.meta.dirname, "..");
const schema = JSON.parse(readFileSync(join(PACKAGE, "conventions.schema.json"), "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "house-style-conventions-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

let count = 0;
/** A scratch repo with web/src and server/src, and these extra files. */
function repo(files) {
  const dir = join(scratch, `repo-${count++}`);
  writeTree(dir, {
    "web/src/main.tsx": "export {};\n",
    "server/src/app.ts": "export const buildApp = () => ({});\n",
    ...files,
  });
  return dir;
}

const exception = (fields) =>
  JSON.stringify({ exceptions: [{ check: "base-ui", rule: 3, path: "web/src", ...fields }] });

/** Each malformed file, and what the refusal must say. */
const MALFORMED = [
  { name: "not JSON", text: '{ "web": ["web/src"], }', says: /conventions\.json is not valid JSON/ },
  { name: "a list, not an object", text: '["web/src"]', says: /conventions\.json:1: the file holds one JSON object/ },
  {
    name: "an unknown key",
    text: '{ "roots": ["web/src"] }',
    says: /unknown key "roots" \(the keys are \$schema, web, server/,
  },
  { name: "a root that isn't a list", text: '{ "web": "web/src" }', says: /"web" is a list of folders/ },
  {
    name: "a root with **",
    text: '{ "web": ["**/src"] }',
    says: /web\[0\] "\*\*\/src" may use \* within a folder name, nothing else/,
  },
  { name: "a root outside the repo", text: '{ "server": ["../other/src"] }', says: /stays inside the repo/ },
  { name: "an absolute root", text: '{ "server": ["/srv/app/src"] }', says: /is a relative path with forward slashes/ },
  {
    name: "a root that matches nothing",
    text: '{ "web": ["apps/*/src"] }',
    says: /web root "apps\/\*\/src" matches no folder/,
  },
  {
    name: "a stylesheet with a wildcard",
    text: '{ "stylesheet": "styles/*.css" }',
    says: /"stylesheet" "styles\/\*\.css" is a plain path/,
  },
  {
    name: "an exception without a reason",
    text: exception({}),
    says: /conventions\.json:1: exceptions\[0\] has no reason/,
  },
  {
    name: "an exception with a blank reason",
    text: exception({ reason: "  " }),
    says: /exceptions\[0\] has no reason/,
  },
  {
    name: "an unknown check",
    text: exception({ check: "lint", reason: "x" }),
    says: /exceptions\[0\]\.check is one of "base-ui", "structure", "house-style"/,
  },
  {
    name: "a rule past the check's last",
    text: exception({ rule: 18, reason: "x" }),
    says: /exceptions\[0\]\.rule is a base-ui rule number, 1 to 17/,
  },
  {
    name: "a rule that isn't a number",
    text: exception({ rule: "3", reason: "x" }),
    says: /exceptions\[0\]\.rule is a base-ui rule number/,
  },
  {
    name: "an exception with an unknown key",
    text: exception({ reason: "x", why: "y" }),
    says: /exceptions\[0\] has an unknown key "why"/,
  },
  {
    name: "an exception without a path",
    text: exception({ path: undefined, reason: "x" }),
    says: /exceptions\[0\]\.path is a path from the repo root/,
  },
  { name: "a blank match", text: exception({ match: "", reason: "x" }), says: /exceptions\[0\]\.match is text/ },
  { name: "an env that isn't a list", text: '{ "env": "server/src/env.ts" }', says: /"env" is a list of files/ },
  {
    name: "an env outside the repo",
    text: '{ "env": ["../other/env.ts"] }',
    says: /env\[0\] .* stays inside the repo/,
  },
  {
    name: "an env with a brace glob",
    text: '{ "env": ["src/{a,b}/env.ts"] }',
    says: /env\[0\] .* may use \* and \*\*/,
  },
];

describe("a malformed conventions.json", () => {
  for (const { name, text, says } of MALFORMED) {
    it(`${name}: both checkers exit 2 and say what is wrong, even with --warn-only`, () => {
      const dir = repo({ "conventions.json": text });
      for (const checker of ["check-base-ui", "check-structure"]) {
        const run = runChecker(checker, ["--warn-only", dir]);
        assert.equal(run.status, 2, `${checker}: ${run.stdout}${run.stderr}`);
        assert.match(run.stderr, says, `${checker}: ${run.stderr}`);
        assert.ok(!/\n\s+at /.test(run.stderr), `${checker} prints a message, not a stack:\n${run.stderr}`);
      }
    });
  }

  it("gives each problem with an exception its line", () => {
    const text = `{
  "exceptions": [
    { "check": "base-ui", "rule": 3, "path": "web/src", "reason": "Fine." },
    { "check": "base-ui", "rule": 3, "path": "web/src" }
  ]
}
`;
    const run = runChecker("check-base-ui", [repo({ "scripts/conventions.json": text })]);
    assert.equal(run.status, 2);
    assert.match(run.stderr, /scripts\/conventions\.json:4: exceptions\[1\] has no reason/);
    assert.ok(!run.stderr.includes("exceptions[0]"), run.stderr);
  });

  it("takes each check's last rule number, the edge of the refusal above", () => {
    for (const [check, last] of Object.entries(CHECKS)) {
      const text = JSON.stringify({
        exceptions: [{ check, rule: last, path: "web/src", reason: "A review rule's record." }],
      });
      const run = runChecker("check-base-ui", [repo({ "conventions.json": text })]);
      assert.equal(run.status, 0, `${check} ${last}: ${run.stdout}${run.stderr}`);
    }
  });
});

describe("where conventions.json sits", () => {
  it(`is looked for at ${CONVENTIONS_SPOTS.join(", ")}`, () => {
    for (const spot of CONVENTIONS_SPOTS) {
      const run = runChecker("check-structure", [repo({ [spot]: '{ "web": [] }' })]);
      assert.equal(run.status, 0, run.stderr);
      assert.match(run.stdout, new RegExp(`web none; .*, from ${spot.replace(/[./]/g, "\\$&")}$`, "m"));
    }
  });

  it("is one file: two are an error", () => {
    const run = runChecker("check-base-ui", [repo({ "conventions.json": "{}", "scripts/conventions.json": "{}" })]);
    assert.equal(run.status, 2);
    assert.match(
      run.stderr,
      /more than one conventions\.json: conventions\.json and scripts\/conventions\.json\. Keep one\./,
    );
  });

  it("names paths from the repo root wherever it sits", () => {
    const run = runChecker("check-structure", [repo({ "tools/conventions.json": '{ "server": ["server/src"] }' })]);
    assert.match(run.stdout, /server server\/src; web web\/src \(default\)/);
  });
});

describe("conventions.schema.json", () => {
  it("names the keys bin/conventions.mjs reads, and no others", () => {
    assert.equal(schema.additionalProperties, false);
    assert.deepEqual(Object.keys(schema.properties), TOP_LEVEL_KEYS);
    const entry = schema.$defs.exception;
    assert.equal(entry.additionalProperties, false);
    assert.deepEqual(Object.keys(entry.properties), EXCEPTION_KEYS);
    assert.deepEqual(entry.required, ["check", "rule", "path", "reason"]);
  });

  it("has the checks and their last rule numbers", () => {
    const entry = schema.$defs.exception;
    assert.deepEqual(entry.properties.check.enum, Object.keys(CHECKS));
    const maxima = Object.fromEntries(
      entry.allOf.map((branch) => [branch.if.properties.check.const, branch.then.properties.rule.maximum]),
    );
    assert.deepEqual(maxima, CHECKS);
  });

  it("refuses with its patterns what the checkers refuse, and takes what they take", () => {
    const root = new RegExp(schema.$defs.roots.items.pattern);
    const path = new RegExp(schema.$defs.exception.properties.path.pattern);
    const stylesheet = new RegExp(schema.properties.stylesheet.pattern);
    for (const ok of ["web/src", "apps/*/src", "ui/app", "."]) assert.ok(root.test(ok), ok);
    for (const bad of ["**/src", "../x", "/srv", "C:/x", "a\\b", "src/[a]"]) assert.ok(!root.test(bad), bad);
    for (const ok of ["web/src/**", "server/src/app.ts", "**/components/ui"]) assert.ok(path.test(ok), ok);
    for (const bad of ["a/../b", "/x", "x?"]) assert.ok(!path.test(bad), bad);
    const env = new RegExp(schema.properties.env.items.pattern);
    for (const ok of ["shared/src/env.ts", "**/config.ts", "bots/*/src/env.ts"]) assert.ok(env.test(ok), ok);
    for (const bad of ["../x/env.ts", "/srv/env.ts", "src/{a,b}/env.ts"]) assert.ok(!env.test(bad), bad);
    assert.ok(stylesheet.test("styles/index.css"));
    assert.ok(!stylesheet.test("styles/*.css"));
    assert.ok(new RegExp(schema.$defs.exception.properties.reason.pattern).test("A reason."));
    assert.ok(!new RegExp(schema.$defs.exception.properties.reason.pattern).test("   "));
  });

  it("describes every fixture's conventions.json, which the checkers accept", () => {
    for (const fixture of ["base-ui", "structure"]) {
      const data = JSON.parse(readFileSync(join(import.meta.dirname, "fixtures", fixture, "conventions.json"), "utf8"));
      assert.deepEqual(validateConventions(data), [], fixture);
      assert.equal(data.$schema, "../../../conventions.schema.json");
    }
  });
});
