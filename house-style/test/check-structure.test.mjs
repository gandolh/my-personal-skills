/**
 * bin/check-structure.mjs against fixtures/structure. Rules 1-3 key on file names
 * (server.ts, app.ts, config.ts), so each of those rules fails in a server root of
 * its own, and server/src is the clean root that holds the rest: a failing fixture
 * must report exactly its rule, a passing one nothing. Then the flags, a repo with no
 * conventions.json, and exceptions, on scratch copies.
 */
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { checkCases, runChecker, summary, writeTree } from "./checker.mjs";

const ROOT = join(import.meta.dirname, "fixtures", "structure");
const scratch = mkdtempSync(join(tmpdir(), "house-style-structure-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

const CASES = [
  {
    rule: 1,
    fail: [{ file: "rule-1/src/app.ts" }],
    pass: [
      "server/src/server.ts",
      "server/src/listen.pass.ts",
      "server/src/testing/fakeUpstream.ts",
      "rule-1/src/server.ts",
      "rule-2/src/server.ts",
      "rule-2-missing/src/server.ts",
    ],
  },
  {
    rule: 2,
    fail: [{ file: "rule-2/src/app.ts" }, { file: "rule-2-missing/src/app.ts" }],
    pass: ["server/src/app.ts", "rule-3/src/app.ts"],
  },
  {
    rule: 3,
    fail: [
      { file: "server/src/rule-3.fail.ts" },
      { file: "rule-3/src/config.ts" },
      { file: "shared/src/rule-3.fail.ts" },
      { file: "server/src/rule-3-strings.fail.ts", count: 2 },
      { file: "server/src/ward/config.ts" },
    ],
    pass: ["server/src/config.ts", "server/src/rule-3.pass.ts", "server/src/rule-3-strings.pass.ts", "web/src/App.tsx"],
  },
  {
    rule: 6,
    area: "a heuristic",
    fail: [
      { file: "server/src/rule-6.fail.ts", count: 7 },
      { file: "server/src/domain/oidc/mount.fail.ts" },
      { file: "server/src/rule-6-computed.fail.ts", count: 3 },
      { file: "server/src/rule-6-helpers.fail.ts", count: 4 },
    ],
    pass: [
      "server/src/features/books/routes.ts",
      "server/src/features/books/routes.test.ts",
      "server/src/domain/tokens/sign.ts",
      "server/src/rule-6-computed.pass.ts",
      "server/src/rule-6-helpers.pass.ts",
    ],
  },
  {
    rule: 11,
    area: "a warning",
    fail: [
      { file: "server/src/rule-11.fail.ts", severity: "warning" },
      { file: "web/src/rule-11.fail.tsx", severity: "warning" },
    ],
    pass: ["server/src/rule-11.pass.ts", "server/src/rule-11.pass.test.ts"],
  },
];

/** Fixtures that support the others and must report nothing themselves. */
const SUPPORT = ["conventions.json", "shared/src/books.ts"];

describe("check-structure, rule by rule", () => {
  const run = runChecker("check-structure", [ROOT]);

  it("exits 1, because errors are left", () => assert.equal(run.status, 1, run.stdout + run.stderr));
  it("says that rules 5 and 7 are dependency-cruiser's", () => {
    assert.match(
      run.stdout,
      /rules 5 and 7 .* are dependency-cruiser's, in vendor\/house-style\/\.dependency-cruiser\.cjs/,
    );
    assert.match(run.stdout, /app\.ts included; domain\/ never importing a feature;/);
  });
  it("finds every route that declares no schema, and each hand parse", () => {
    const routes = run.findings.filter((f) => f.file === "server/src/rule-6.fail.ts").map((f) => f.message);
    for (const route of ["GET /api/a", "POST /api/b", "GET /api/c", "PUT /api/d"]) {
      assert.ok(
        routes.some((m) => m.startsWith(`${route} declares no schema`)),
        `${route}:\n${routes.join("\n")}`,
      );
    }
    for (const parse of [
      "BookInput.parse(…request.body…)",
      "parseBody(…req.query…)",
      "BookInput.safeParse(…request.body…)",
    ]) {
      assert.ok(
        routes.some((m) => m.startsWith(parse)),
        `${parse}:\n${routes.join("\n")}`,
      );
    }
  });
  it("names a computed path by its expression", () => {
    const messages = run.findings.filter((f) => f.file === "server/src/rule-6-computed.fail.ts").map((f) => f.message);
    for (const route of ["GET routes.me.path", "GET SOCKET_PATH", "POST `${PREFIX}/items`"]) {
      assert.ok(
        messages.includes(`${route} declares no schema: give it its params, querystring, body and response schemas`),
        `${route}:\n${messages.join("\n")}`,
      );
    }
  });
  it("keeps its messages: the NODE_ENV one, and process.env outside config.ts", () => {
    const of = (file) => run.findings.filter((f) => f.file === file).map((f) => f.message);
    assert.deepEqual(of("server/src/rule-3-strings.fail.ts"), [
      "reads NODE_ENV: the app is configured by its own variables, never by NODE_ENV",
      "reads NODE_ENV: the app is configured by its own variables, never by NODE_ENV",
    ]);
    assert.deepEqual(of("server/src/rule-3.fail.ts"), [
      "reads process.env outside config.ts: take the setting from the parsed config",
    ]);
    assert.deepEqual(of("server/src/ward/config.ts"), [
      "reads process.env in a config file below the root: server/src/config.ts is the one reader, so take the setting from it",
    ]);
  });
  checkCases({ it, root: ROOT, findings: run.findings, cases: CASES, support: SUPPORT });
});

describe("check-structure's flags", () => {
  it("--warn-only shows the same findings as warnings, and exits 0", () => {
    const strict = runChecker("check-structure", [ROOT]);
    const warnOnly = runChecker("check-structure", ["--warn-only", ROOT]);
    assert.equal(warnOnly.status, 0, warnOnly.stdout);
    assert.deepEqual(
      warnOnly.findings.map(({ file, line, rule }) => `${file}:${line}:${rule}`),
      strict.findings.map(({ file, line, rule }) => `${file}:${line}:${rule}`),
    );
    assert.ok(warnOnly.findings.every((f) => f.severity === "warning"));
  });

  it("takes the repo root as its argument, or runs from the working directory", () => {
    const fromCwd = runChecker("check-structure", ["--warn-only"], { cwd: ROOT });
    assert.equal(fromCwd.findings.length, runChecker("check-structure", [ROOT]).findings.length);
  });

  it("has no --version, and exits 2 on it", () => {
    const run = runChecker("check-structure", ["--version", "1.0.0", ROOT]);
    assert.equal(run.status, 2);
    assert.match(run.stderr, /unknown flag --version/);
  });

  it("exits 2 on two roots", () => {
    const run = runChecker("check-structure", [ROOT, ROOT]);
    assert.equal(run.status, 2);
    assert.match(run.stderr, /one repo root at most/);
  });
});

describe("check-structure without a conventions.json", () => {
  it("says it found none, checks the default roots that exist, and doesn't crash", () => {
    const dir = join(scratch, "defaults");
    writeTree(dir, {
      "server/src/server.ts": 'import { buildApp } from "./app.js";\nawait (await buildApp()).listen({ port: 0 });\n',
      "server/src/app.ts": "export async function buildApp() {\n  return { listen: async (_o: object) => {} };\n}\n",
      "server/src/env.ts": "export const home = process.env.HOME;\n",
    });
    const run = runChecker("check-structure", ["--warn-only", dir]);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(
      run.stdout,
      /found no conventions\.json \(looked for conventions\.json, scripts\/conventions\.json, tools\/conventions\.json\)/,
    );
    assert.match(run.stdout, /server server\/src \(default\); web none \(default\); shared none \(default\)/);
    assert.deepEqual(
      run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`),
      ["server/src/env.ts:1 rule-3"],
    );
  });

  it("checks nothing, and says so, in a repo with none of the default roots", () => {
    const dir = join(scratch, "empty");
    writeTree(dir, { "README.md": "# empty\n" });
    const run = runChecker("check-structure", [dir]);
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /no root, so there is nothing to check/);
  });
});

describe("check-structure's env key", () => {
  // A repo with no server root, as a gateway bot is: rule 3 runs on its shared root.
  const files = {
    "shared/src/env.ts": "export const home = process.env.HOME;\nexport const mode = process.env.NODE_ENV;\n",
    "shared/src/other.ts": "export const user = process.env.USER;\n",
    "shared/src/config.ts": "export const path = process.env.PATH;\n",
  };
  const roots = { web: [], server: [], shared: ["shared/src"] };

  it("without it, config.ts is the one reader", () => {
    const dir = join(scratch, "env-default");
    writeTree(dir, { ...files, "conventions.json": JSON.stringify(roots) });
    const run = runChecker("check-structure", [dir]);
    assert.deepEqual(
      run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`),
      ["shared/src/env.ts:1 rule-3", "shared/src/env.ts:2 rule-3", "shared/src/other.ts:1 rule-3"],
      summary(run.findings),
    );
    assert.match(run.stdout, /other\.ts:1 rule-3 error: reads process\.env outside config\.ts: take the setting/);
  });

  it("names the readers instead of config.ts, and NODE_ENV stays a finding in them", () => {
    const dir = join(scratch, "env-named");
    writeTree(dir, { ...files, "conventions.json": JSON.stringify({ ...roots, env: ["shared/src/env.ts"] }) });
    const run = runChecker("check-structure", [dir]);
    assert.deepEqual(
      run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`),
      ["shared/src/config.ts:1 rule-3", "shared/src/env.ts:2 rule-3", "shared/src/other.ts:1 rule-3"],
      summary(run.findings),
    );
    assert.match(run.findings.find((f) => f.file === "shared/src/env.ts").message, /reads NODE_ENV/);
    assert.match(
      run.findings.find((f) => f.file === "shared/src/other.ts").message,
      /^reads process\.env outside the env reader \(shared\/src\/env\.ts\)/,
    );
  });

  it("takes globs, as ESLint's env option does", () => {
    const dir = join(scratch, "env-glob");
    writeTree(dir, {
      ...files,
      "conventions.json": JSON.stringify({ ...roots, env: ["**/env.ts", "shared/*/other.ts"] }),
    });
    const run = runChecker("check-structure", [dir]);
    assert.deepEqual(
      run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`),
      ["shared/src/config.ts:1 rule-3", "shared/src/env.ts:2 rule-3"],
      summary(run.findings),
    );
  });
});

describe("check-structure's exceptions", () => {
  it("drops the findings an exception covers: a stream route by its path, and a whole file", () => {
    const dir = join(scratch, "exceptions");
    cpSync(ROOT, dir, { recursive: true });
    const conventions = JSON.parse(readFileSync(join(ROOT, "conventions.json"), "utf8"));
    conventions.exceptions = [
      { check: "structure", rule: 6, path: "server/src/rule-6.fail.ts", match: "/api/a", reason: "Streams bytes." },
      { check: "structure", rule: 3, path: "rule-3/src/config.ts", reason: "A legal safeguard reads NODE_ENV." },
      { check: "base-ui", rule: 3, path: "server/src/rule-3.fail.ts", reason: "Another checker's: ignored here." },
    ];
    writeFileSync(join(dir, "conventions.json"), JSON.stringify(conventions, null, 2));
    const run = runChecker("check-structure", [dir]);
    const got = run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`);
    assert.ok(!got.includes("server/src/rule-6.fail.ts:8 rule-6"), summary(run.findings));
    assert.ok(got.includes("server/src/rule-6.fail.ts:9 rule-6"), "the match covers GET /api/a only");
    assert.ok(!got.includes("rule-3/src/config.ts:4 rule-3"));
    assert.ok(got.includes("server/src/rule-3.fail.ts:2 rule-3"), "a base-ui exception doesn't apply");
    assert.match(run.stdout, /; 2 excepted by conventions\.json$/m);
  });
});
