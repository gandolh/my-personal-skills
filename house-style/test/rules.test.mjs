/**
 * Each rule of the house config against a failing fixture, which must report exactly
 * that rule, and a passing fixture, which must report nothing. The fixtures are a small
 * repo under fixtures/repo with its own tsconfig, so the typed rules run for real.
 */
import { ESLint } from "eslint";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { before, describe, it } from "node:test";
import { houseStyle } from "../eslint.config.js";

const ROOT = join(import.meta.dirname, "fixtures", "repo");
const OPTIONS = {
  root: ROOT,
  web: "web/src",
  server: "server/src",
  console: ["server/src/cli.ts", "server/src/cli-env.fail.ts"],
  defaultExports: ["web/src/routes/**"],
  tailwind: { css: "web/src/index.css" },
};

/** One row per rule: the fixture that breaks it, the ones that keep to it, and the severity expected. */
const CASES = [
  {
    rule: "no-debugger",
    area: "@eslint/js recommended",
    fail: "server/src/base/eslint-recommended.fail.ts",
    pass: ["server/src/base/eslint-recommended.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-empty-object-type",
    area: "typescript-eslint recommended",
    fail: "server/src/base/typescript-eslint-recommended.fail.ts",
    pass: ["server/src/base/typescript-eslint-recommended.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-unused-vars",
    fail: "server/src/base/no-unused-vars.fail.ts",
    pass: ["server/src/base/no-unused-vars.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-floating-promises",
    fail: "server/src/typed/no-floating-promises.fail.ts",
    pass: ["server/src/typed/no-floating-promises.pass.ts", "server/src/typed/node-test-calls.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-misused-promises",
    fail: "server/src/typed/no-misused-promises.fail.ts",
    pass: ["server/src/typed/no-misused-promises.pass.ts"],
  },
  {
    rule: "@typescript-eslint/await-thenable",
    fail: "server/src/typed/await-thenable.fail.ts",
    pass: ["server/src/typed/await-thenable.pass.ts"],
  },
  {
    rule: "@typescript-eslint/switch-exhaustiveness-check",
    fail: "server/src/typed/switch-exhaustiveness-check.fail.ts",
    pass: ["server/src/typed/switch-exhaustiveness-check.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-unnecessary-type-assertion",
    fail: "server/src/typed/no-unnecessary-type-assertion.fail.ts",
    pass: ["server/src/typed/no-unnecessary-type-assertion.pass.ts"],
  },
  {
    rule: "@typescript-eslint/consistent-type-imports",
    fail: "server/src/typed/consistent-type-imports.fail.ts",
    pass: ["server/src/typed/consistent-type-imports.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-import-type-side-effects",
    area: "an all-inline type import still leaves an import behind",
    fail: "server/src/typed/no-import-type-side-effects.fail.ts",
    pass: ["server/src/typed/no-import-type-side-effects.pass.ts", "server/src/typed/mixed-import.pass.ts"],
  },
  {
    rule: "react-hooks/rules-of-hooks",
    area: "react-hooks recommended, on web only",
    fail: "web/src/react/hooks.fail.tsx",
    pass: ["web/src/react/hooks.pass.tsx", "server/src/scope/hooks-outside-web.pass.ts"],
  },
  {
    rule: "better-tailwindcss/no-unknown-classes",
    fail: "web/src/tailwind/no-unknown-classes.fail.tsx",
    pass: ["web/src/tailwind/no-unknown-classes.pass.tsx"],
  },
  {
    rule: "better-tailwindcss/no-deprecated-classes",
    fail: "web/src/tailwind/no-deprecated-classes.fail.tsx",
    pass: ["web/src/tailwind/no-deprecated-classes.pass.tsx"],
  },
  {
    rule: "n/no-process-env",
    fail: "server/src/node/env-reader.fail.ts",
    pass: [
      "server/src/node/config.ts",
      "server/src/tests/env-in-tests.pass.test.ts",
      "web/vite.config.ts",
      "scripts/env-script.ts",
    ],
  },
  {
    rule: "n/no-process-env",
    area: "on in config/env.ts until the repo names it",
    fail: "server/src/config/env.ts",
    pass: [],
  },
  { rule: "n/no-process-env", area: "still on in the console globs", fail: "server/src/cli-env.fail.ts", pass: [] },
  {
    rule: "vitest/expect-expect",
    area: "@vitest/eslint-plugin recommended",
    fail: "server/src/tests/expect-expect.fail.test.ts",
    pass: ["server/src/tests/labelled.pass.test.ts"],
  },
  {
    rule: "vitest/expect-expect",
    area: "a helper is no assertion until the repo names it",
    fail: "server/src/tests/expect-helper.fail.test.ts",
    pass: [],
  },
  {
    rule: "vitest/no-focused-tests",
    area: "@vitest/eslint-plugin recommended",
    fail: "server/src/tests/focused.fail.test.ts",
    pass: ["server/src/tests/labelled.pass.test.ts"],
  },
  {
    rule: "vitest/valid-expect",
    area: "maxArgs 2",
    fail: "server/src/tests/valid-expect.fail.test.ts",
    pass: ["server/src/tests/labelled.pass.test.ts"],
  },
  {
    rule: "vitest/no-conditional-expect",
    area: "off: the house asserts inside a catch",
    fail: null,
    pass: ["server/src/tests/conditional-expect.pass.test.ts"],
  },
  {
    rule: "no-restricted-syntax",
    area: "enum",
    fail: "server/src/shapes/enum.fail.ts",
    pass: ["server/src/shapes/enum.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-explicit-any",
    fail: "server/src/shapes/explicit-any.fail.ts",
    pass: ["server/src/shapes/explicit-any.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-non-null-assertion",
    area: "error in source",
    fail: "server/src/shapes/non-null.fail.ts",
    pass: ["server/src/shapes/non-null.pass.ts"],
  },
  {
    rule: "@typescript-eslint/no-non-null-assertion",
    area: "warning in tests",
    severity: 1,
    fail: "server/src/shapes/non-null-in-tests.test.ts",
    pass: [],
  },
  {
    rule: "@typescript-eslint/ban-ts-comment",
    fail: "server/src/shapes/ts-comment.fail.ts",
    count: 2,
    pass: ["server/src/shapes/ts-comment.pass.ts"],
  },
  {
    rule: "no-warning-comments",
    fail: "server/src/shapes/warning-comments.fail.ts",
    count: 2,
    pass: ["server/src/shapes/warning-comments.pass.ts"],
  },
  {
    rule: "no-console",
    fail: "server/src/shapes/console.fail.ts",
    pass: ["server/src/cli.ts", "scripts/report.ts", "scripts/tool.mjs"],
  },
  {
    rule: "no-undef",
    area: ".cjs files see CommonJS globals, other names stay undefined",
    fail: "scripts/undefined-global.fail.cjs",
    pass: ["scripts/commonjs.pass.cjs"],
  },
  {
    rule: "import-x/no-default-export",
    fail: "server/src/shapes/default-export.fail.ts",
    pass: ["vite.config.ts", "web/src/routes/home.tsx"],
  },
  {
    rule: "import-x/no-default-export",
    area: "off in .d.ts files, where an ambient module has no other form",
    fail: null,
    pass: ["server/src/ambient.d.ts"],
  },
];

/** The class order is linted only once a repo turns it on, so it has its own run. */
const ORDER_CASE = {
  rule: "better-tailwindcss/enforce-consistent-class-order",
  fail: "web/src/tailwind/class-order.fail.tsx",
  pass: ["web/src/tailwind/class-order.pass.tsx"],
};

/** Fixtures that support the others and must lint clean themselves. */
const SUPPORT = ["server/src/typed/work.ts"];

function fixtureFiles(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...fixtureFiles(full));
    else if (/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(name)) out.push(relative(ROOT, full).split(sep).join("/"));
  }
  return out.sort();
}

async function lintAll(options) {
  const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: true, overrideConfig: houseStyle(options) });
  const results = await eslint.lintFiles(["."]);
  return new Map(results.map((result) => [relative(ROOT, result.filePath).split(sep).join("/"), result.messages]));
}

function summary(messages) {
  return messages.map((m) => `${m.ruleId ?? "fatal"}@${m.line}: ${m.message}`).join("\n");
}

function assertFails(results, { rule, fail, severity = 2, count }) {
  const messages = results.get(fail);
  assert.ok(messages, `${fail} was not linted`);
  assert.ok(messages.length > 0, `${fail} should report ${rule}, and reports nothing`);
  assert.deepEqual(
    [...new Set(messages.map((m) => m.ruleId))],
    [rule],
    `${fail} should report only ${rule}:\n${summary(messages)}`,
  );
  for (const m of messages) assert.equal(m.severity, severity, `${fail}: ${rule} should have severity ${severity}`);
  if (count !== undefined) assert.equal(messages.length, count, `${fail}: expected ${count} findings`);
}

function assertPasses(results, file) {
  const messages = results.get(file);
  assert.ok(messages, `${file} was not linted`);
  assert.deepEqual(messages, [], `${file} should lint clean:\n${summary(messages)}`);
}

describe("the house rules", () => {
  let results;
  before(async () => {
    results = await lintAll(OPTIONS);
  });

  for (const c of CASES) {
    const label = c.area ? `${c.rule} (${c.area})` : c.rule;
    if (c.fail) it(`${label}: the failing fixture reports exactly this rule`, () => assertFails(results, c));
    for (const file of c.pass) it(`${label}: ${file} passes`, () => assertPasses(results, file));
  }

  it("without tailwind.order, the class order is not linted", () => {
    assertPasses(results, ORDER_CASE.fail);
    assertPasses(results, ORDER_CASE.pass[0]);
  });

  it("the support fixtures lint clean", () => {
    for (const file of SUPPORT) assertPasses(results, file);
  });

  it("every fixture file belongs to a case", () => {
    const named = new Set([...SUPPORT, ...[...CASES, ORDER_CASE].flatMap((c) => [c.fail, ...c.pass]).filter(Boolean)]);
    const strays = fixtureFiles().filter((file) => !named.has(file));
    assert.deepEqual(strays, [], "a fixture no case names would hide whatever it reports");
    assert.deepEqual(
      [...results.keys()].sort(),
      fixtureFiles(),
      "ESLint linted a different set of files than the fixtures",
    );
  });
});

describe("the class order, once a repo turns it on", () => {
  let results;
  before(async () => {
    results = await lintAll({ ...OPTIONS, tailwind: { ...OPTIONS.tailwind, order: true } });
  });

  it(`${ORDER_CASE.rule}: the failing fixture reports exactly this rule`, () => assertFails(results, ORDER_CASE));
  it(`${ORDER_CASE.rule}: ${ORDER_CASE.pass[0]} passes`, () => assertPasses(results, ORDER_CASE.pass[0]));
});

describe("the env and assertFunctionNames options", () => {
  let results;
  before(async () => {
    results = await lintAll({
      ...OPTIONS,
      env: ["server/src/config/env.ts"],
      assertFunctionNames: ["expect", "expectTypeOf", "expectEven"],
    });
  });

  it("env moves the process.env exemption to the repo's reader", () => {
    assertPasses(results, "server/src/config/env.ts");
    assertFails(results, { rule: "n/no-process-env", fail: "server/src/node/config.ts" });
  });

  it("env leaves tests, scripts and tool configs exempt", () => {
    for (const file of ["server/src/tests/env-in-tests.pass.test.ts", "scripts/env-script.ts", "web/vite.config.ts"]) {
      assertPasses(results, file);
    }
  });

  it("assertFunctionNames makes a named helper count as an assertion", () => {
    assertPasses(results, "server/src/tests/expect-helper.fail.test.ts");
    assertFails(results, { rule: "vitest/expect-expect", fail: "server/src/tests/expect-expect.fail.test.ts" });
  });
});

describe("the options", () => {
  it("rejects an unknown option, so a typo cannot switch a rule off", () => {
    assert.throws(() => houseStyle({ test: ["**/*.test.ts"] }), /unknown option "test"/);
  });

  it("gives a repo without web no React or Tailwind rules", () => {
    const names = houseStyle({ tailwind: { css: "x.css" } }).map((config) => config.name);
    assert.ok(!names.includes("house-style/react"));
    assert.ok(!names.includes("house-style/tailwind"));
  });

  it("leaves the vitest rules out for a node:test repo", () => {
    const names = houseStyle({ vitest: false }).map((config) => config.name);
    assert.ok(!names.includes("house-style/vitest"));
  });

  it("switches typed linting to project when asked", () => {
    const typed = houseStyle({ typed: { project: true } }).find((config) => config.name === "house-style/typed");
    assert.equal(typed.languageOptions.parserOptions.project, true);
    assert.equal(typed.languageOptions.parserOptions.projectService, undefined);
  });
});
