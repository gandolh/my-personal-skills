/**
 * A repo that imports typescript-eslint for a typed block of its own, after the house config,
 * as fixtures/tsconfig-root does. typescript-eslint makes the folder of each eslint.config.*
 * that reads one of its configs a candidate tsconfigRootDir, and with two candidates (the
 * house copy's and the repo's) the parser refuses every file that has no root set. The
 * candidates are kept per process, so this runs in a test file of its own.
 */
import { ESLint } from "eslint";
import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOT = join(import.meta.dirname, "fixtures", "tsconfig-root");

describe("a repo that imports typescript-eslint itself", () => {
  it("lints its JavaScript files without asking for a tsconfigRootDir", async () => {
    const eslint = new ESLint({ cwd: ROOT, overrideConfigFile: join(ROOT, "eslint.config.mjs") });
    const [result] = await eslint.lintFiles(["tool.mjs"]);
    assert.deepEqual(
      result.messages.map((m) => m.message),
      [],
    );
  });
});
