/**
 * The presets other than ESLint: the compiler flags, the Prettier settings, the knip
 * and dependency-cruiser presets on small scratch projects, and the pin list the
 * README shows against package.json.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import * as prettier from "prettier";
import ts from "typescript";
import prettierConfig from "../prettier.config.js";

const PACKAGE = join(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8"));
const scratch = mkdtempSync(join(tmpdir(), "house-style-presets-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

function writeTree(root, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
}

function bin(name) {
  return join(PACKAGE, "node_modules", ".bin", name);
}

describe("tsconfig.base.json", () => {
  const base = JSON.parse(readFileSync(join(PACKAGE, "tsconfig.base.json"), "utf8")).compilerOptions;

  it("sets the house flags", () => {
    for (const flag of [
      "strict",
      "noUncheckedIndexedAccess",
      "noImplicitOverride",
      "isolatedModules",
      "noUnusedLocals",
      "noFallthroughCasesInSwitch",
      "verbatimModuleSyntax",
      "erasableSyntaxOnly",
    ]) {
      assert.equal(base[flag], true, flag);
    }
    assert.equal(base.module, "NodeNext");
    assert.equal(base.moduleResolution, "NodeNext");
  });

  it("leaves exactOptionalPropertyTypes for a later count", () => {
    assert.equal(base.exactOptionalPropertyTypes, undefined);
  });

  it("is a config the pinned TypeScript accepts", () => {
    const file = join(import.meta.dirname, "fixtures", "repo", "tsconfig.json");
    const read = ts.readConfigFile(file, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, dirname(file));
    assert.deepEqual(
      parsed.errors.map((e) => ts.flattenDiagnosticMessageText(e.messageText, "\n")),
      [],
    );
    assert.equal(parsed.options.erasableSyntaxOnly, true);
  });

  it("rejects an enum and a parameter property, which type stripping cannot run", () => {
    const program = ts.createProgram({
      rootNames: ["/virtual/a.ts"],
      options: { ...ts.convertCompilerOptionsFromJson(base, PACKAGE).options, noEmit: true, types: [] },
      host: (() => {
        const host = ts.createCompilerHost({});
        const source = "export enum E { A }\nexport class C { constructor(private readonly x: number) {} }\n";
        const original = host.getSourceFile;
        host.getSourceFile = (name, version) =>
          name === "/virtual/a.ts" ? ts.createSourceFile(name, source, version) : original(name, version);
        host.fileExists = (name) => name === "/virtual/a.ts" || ts.sys.fileExists(name);
        return host;
      })(),
    });
    const codes = ts.getPreEmitDiagnostics(program).map((d) => d.code);
    assert.ok(codes.includes(1294), `expected the erasableSyntaxOnly error 1294, got ${codes.join(", ")}`);
  });
});

describe("prettier.config.js", () => {
  it("writes double quotes, semicolons and trailing commas", async () => {
    const out = await prettier.format("const a = {b: 'c', d: [1,2]}\n", { ...prettierConfig, parser: "typescript" });
    assert.equal(out, 'const a = { b: "c", d: [1, 2] };\n');
  });

  it("keeps a line of up to 120 columns, and wraps past it", async () => {
    // call(argument0, ..., argument8, <padding>); at exactly the given width.
    const call = (width) => {
      const head = `call(${Array.from({ length: 9 }, (_, i) => `argument${i}`).join(", ")}, `;
      return `${head}${"x".repeat(width - head.length - 2)});\n`;
    };
    const fits = call(120);
    assert.equal(await prettier.format(fits, { ...prettierConfig, parser: "typescript" }), fits);
    const wraps = await prettier.format(call(121), { ...prettierConfig, parser: "typescript" });
    assert.ok(wraps.split("\n").length > 2, "a 121-column call should wrap");
    assert.match(wraps, /x,\n\);\n$/, "the wrapped call should end its last argument with a comma");
  });
});

describe(".dependency-cruiser.cjs", () => {
  const root = join(scratch, "depcruise");
  writeTree(root, {
    "package.json": JSON.stringify({ name: "fixture", type: "module", dependencies: { fastify: "1.0.0" } }),
    "node_modules/fastify/package.json": JSON.stringify({ name: "fastify", version: "1.0.0", main: "index.js" }),
    "node_modules/fastify/index.js": "module.exports = {};\n",
    ".dependency-cruiser.cjs": `module.exports = { extends: ${JSON.stringify(join(PACKAGE, ".dependency-cruiser.cjs"))} };\n`,
    "src/features/a/index.ts": "export const a = 1;\n",
    "src/features/a/internal/x.ts": "export const x = 1;\n",
    "src/features/b/index.ts":
      'import { a } from "../a/index.js";\nimport { x } from "../a/internal/x.js";\nexport const b = a + x;\n',
    "src/c1.ts": 'import { c2 } from "./c2.js";\nexport const c1 = (): unknown => c2;\n',
    "src/c2.ts": 'import { c1 } from "./c1.js";\nexport const c2 = (): unknown => c1;\n',
    "src/lib/server.ts": 'import fastify from "fastify";\nexport const f = fastify;\n',
    "src/lib/pure.ts": 'import { a } from "../features/a/index.js";\nexport const p = a;\n',
    "src/virtual.ts": 'import routes from "virtual:routes";\nexport const r = routes;\n',
    "src/missing.ts": 'import { gone } from "./gone.js";\nexport const m = gone;\n',
    "vendor/house-style/cycle-a.js": 'import "./cycle-b.js";\n',
    "vendor/house-style/cycle-b.js": 'import "./cycle-a.js";\n',
  });

  it("reports cycles, unresolvable imports (but not a Vite `virtual:` module), a feature's insides and Fastify in lib/, and nothing else", () => {
    const run = spawnSync(process.execPath, [bin("depcruise"), "src", "vendor", "--output-type", "json"], {
      cwd: root,
      encoding: "utf8",
    });
    assert.ok(run.stdout, run.stderr);
    const found = JSON.parse(run.stdout)
      .summary.violations.map((v) => `${v.rule.name}: ${v.from} -> ${v.to}`)
      .sort();
    assert.deepEqual(found, [
      "feature-through-index: src/features/b/index.ts -> src/features/a/internal/x.ts",
      "lib-without-fastify: src/lib/server.ts -> node_modules/fastify/index.js",
      "no-circular: src/c1.ts -> src/c2.ts",
      "not-to-unresolvable: src/missing.ts -> ./gone.js",
    ]);
  });

  it("fails that tree with a non-zero exit", () => {
    const run = spawnSync(process.execPath, [bin("depcruise"), "src"], { cwd: root, encoding: "utf8" });
    assert.notEqual(run.status, 0, run.stdout);
  });

  it("passes a clean tree: a feature used through its index, its own insides, and lib/ without Fastify", () => {
    const clean = join(scratch, "depcruise-clean");
    writeTree(clean, {
      "package.json": JSON.stringify({ name: "fixture", type: "module" }),
      ".dependency-cruiser.cjs": `module.exports = { extends: ${JSON.stringify(join(PACKAGE, ".dependency-cruiser.cjs"))} };\n`,
      "src/features/a/index.ts": 'import { x } from "./internal/x.js";\nexport const a = x;\n',
      "src/features/a/internal/x.ts": "export const x = 1;\n",
      "src/features/b/index.ts":
        'import { a } from "../a/index.js";\nimport { pure } from "../../lib/pure.js";\nexport const b = a + pure;\n',
      "src/lib/pure.ts": "export const pure = 2;\n",
    });
    const run = spawnSync(process.execPath, [bin("depcruise"), "src"], { cwd: clean, encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /no dependency violations found/);
  });

  it("lets a repo lower one rule to a warning by its name, which then doesn't fail the run", () => {
    const staged = join(scratch, "depcruise-staged");
    writeTree(staged, {
      "package.json": JSON.stringify({ name: "fixture", type: "module" }),
      ".dependency-cruiser.cjs": `module.exports = {\n  extends: ${JSON.stringify(join(PACKAGE, ".dependency-cruiser.cjs"))},\n  forbidden: [{ name: "no-circular", severity: "warn" }],\n};\n`,
      "src/c1.ts": 'import { c2 } from "./c2.js";\nexport const c1 = (): unknown => c2;\n',
      "src/c2.ts": 'import { c1 } from "./c1.js";\nexport const c2 = (): unknown => c1;\n',
    });
    const run = spawnSync(process.execPath, [bin("depcruise"), "src"], { cwd: staged, encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
    assert.match(run.stdout, /warn no-circular/);
  });
});

describe(".dependency-cruiser.cjs, a rule given a pathNot by the repo", () => {
  it("merges by name, so the one exempt path stops being reported and the rest still fail", () => {
    const staged = join(scratch, "depcruise-pathnot");
    writeTree(staged, {
      "package.json": JSON.stringify({ name: "fixture", type: "module" }),
      ".dependency-cruiser.cjs": `module.exports = {\n  extends: ${JSON.stringify(join(PACKAGE, ".dependency-cruiser.cjs"))},\n  forbidden: [{ name: "no-circular", to: { circular: true, pathNot: "^src/legacy/" } }],\n};\n`,
      "src/legacy/l1.ts": 'import { l2 } from "./l2.js";\nexport const l1 = (): unknown => l2;\n',
      "src/legacy/l2.ts": 'import { l1 } from "./l1.js";\nexport const l2 = (): unknown => l1;\n',
      "src/c1.ts": 'import { c2 } from "./c2.js";\nexport const c1 = (): unknown => c2;\n',
      "src/c2.ts": 'import { c1 } from "./c1.js";\nexport const c2 = (): unknown => c1;\n',
    });
    const run = spawnSync(process.execPath, [bin("depcruise"), "src", "--output-type", "json"], {
      cwd: staged,
      encoding: "utf8",
    });
    const found = JSON.parse(run.stdout)
      .summary.violations.map((v) => `${v.rule.name}: ${v.from} -> ${v.to}`)
      .sort();
    assert.deepEqual(found, ["no-circular: src/c1.ts -> src/c2.ts"]);
  });
});

describe("knip.json", () => {
  const root = join(scratch, "knip");
  writeTree(root, {
    "package.json": JSON.stringify({
      name: "fixture",
      type: "module",
      private: true,
      dependencies: { "left-pad": "1.3.0" },
    }),
    "knip.config.js": `import preset from ${JSON.stringify(join(PACKAGE, "knip.json"))} with { type: "json" };\nexport default { ...preset, entry: ["src/index.ts"] };\n`,
    "src/index.ts": 'import { used } from "./a.js";\nexport const shown = used;\n',
    "src/a.ts": "export const used = 1;\nexport const unused = 2;\n",
    "vendor/house-style/orphan.js": "export const orphan = 1;\n",
  });
  spawnSync("git", ["init", "-q"], { cwd: root });

  it("loads from a repo's knip.config.js, fails on an unused dependency, and only warns on an unused export", () => {
    const run = spawnSync(process.execPath, [bin("knip"), "--reporter", "json"], { cwd: root, encoding: "utf8" });
    const issues = JSON.parse(run.stdout).issues;
    const of = (kind) => issues.flatMap((issue) => issue[kind].map((item) => `${issue.file}: ${item.name}`));
    assert.deepEqual(of("dependencies"), ["package.json: left-pad"]);
    assert.deepEqual(of("exports"), ["src/a.ts: unused"]);
    assert.deepEqual(of("files"), [], "the vendored copy is ignored");
    assert.equal(run.status, 1, "the unused dependency is an error");

    rmSync(join(root, "package.json"));
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture", type: "module", private: true }));
    const warnOnly = spawnSync(process.execPath, [bin("knip")], { cwd: root, encoding: "utf8" });
    assert.equal(warnOnly.status, 0, `an unused export alone is a warning:\n${warnOnly.stdout}`);
  });
});

describe("the pins", () => {
  it("lists in the README exactly the peerDependencies, at the versions installed for the tests", () => {
    const readme = readFileSync(join(PACKAGE, "README.md"), "utf8");
    const table = readme.slice(readme.indexOf("<!-- pins:start -->"), readme.indexOf("<!-- pins:end -->"));
    const rows = Object.fromEntries([...table.matchAll(/^\| `([^`]+)` \| `([^`]+)` \|/gm)].map((m) => [m[1], m[2]]));
    assert.deepEqual(rows, pkg.peerDependencies);
    for (const [name, version] of Object.entries(pkg.peerDependencies)) {
      assert.match(version, /^\d+\.\d+\.\d+$/, `${name} is pinned exactly`);
      assert.equal(pkg.devDependencies[name], version, `${name}: the tests run on the version repos pin`);
    }
  });

  it("ships no tests or fixtures", () => {
    assert.deepEqual(
      pkg.files.filter((entry) => /^test|fixture/.test(entry)),
      [],
    );
  });
});
