/**
 * bin/check-base-ui.mjs against fixtures/base-ui: a small repo with four web roots,
 * where each rule the checker implements has a failing fixture, which must report
 * exactly that rule, and a passing one, which must report nothing. Then the flags,
 * the conventions.json keys the checker reads, and its exceptions, on scratch copies.
 */
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { checkCases, runChecker, summary, writeTree } from "./checker.mjs";

const ROOT = join(import.meta.dirname, "fixtures", "base-ui");
const scratch = mkdtempSync(join(tmpdir(), "house-style-base-ui-"));
after(() => rmSync(scratch, { recursive: true, force: true }));

/** A copy of the fixture repo to change, with its own conventions.json. */
function copy(name, conventions) {
  const dir = join(scratch, name);
  cpSync(ROOT, dir, { recursive: true });
  writeFileSync(join(dir, "conventions.json"), `${JSON.stringify(conventions, null, 2)}\n`);
  return dir;
}

const CASES = [
  {
    rule: 1,
    fail: [{ file: "loose-pin/package.json" }, { file: "other-pin/package.json" }],
    pass: ["app/package.json"],
  },
  {
    rule: 2,
    fail: [{ file: "app/src/components/ui/RootImport.fail.tsx" }],
    pass: ["app/src/components/ui/Dialog.tsx"],
  },
  {
    rule: 3,
    fail: [{ file: "app/src/rule-3.fail.tsx" }],
    pass: ["app/src/features/books/ui/BookMenu.tsx", "app/src/rule-3.pass.test.tsx"],
  },
  {
    rule: 5,
    fail: [
      { file: "app/src/Card.module.css" },
      { file: "app/src/legacy.css" },
      { file: "plain-css/src/styles/index.css" },
    ],
    pass: ["app/src/styles/index.css"],
  },
  { rule: 6, fail: [{ file: "app/src/rule-6.fail.tsx", count: 3 }], pass: ["app/src/rule-6.pass.tsx"] },
  {
    rule: 9,
    area: "a warning",
    fail: [{ file: "app/src/components/ui/rule-9.fail.tsx", count: 3, severity: "warning" }],
    pass: ["app/src/components/ui/rule-9.pass.tsx"],
  },
  {
    rule: 10,
    area: "a warning",
    fail: [{ file: "app/src/components/ui/rule-10.fail.tsx", severity: "warning" }],
    pass: ["app/src/components/ui/rule-10.pass.tsx"],
  },
  { rule: 11, fail: [{ file: "app/src/rule-11.fail.tsx", count: 3 }], pass: ["app/src/rule-11.pass.tsx"] },
];

/** Fixtures that support the others and must report nothing themselves. */
const SUPPORT = [
  "conventions.json",
  "app/src/components/ui/Button.tsx",
  "app/src/components/ui/useConfirm.ts",
  "loose-pin/src/main.ts",
  "other-pin/src/main.ts",
  "plain-css/src/main.ts",
];

describe("check-base-ui, rule by rule", () => {
  const run = runChecker("check-base-ui", [ROOT]);

  it("exits 1, because errors are left", () => assert.equal(run.status, 1, run.stdout + run.stderr));
  it("prints each finding as file:line rule-N severity: message", () => {
    assert.ok(run.findings.length > 0);
    assert.match(run.stdout, /^check-base-ui: 13 errors, 4 warnings \(/m);
  });
  checkCases({ it, root: ROOT, findings: run.findings, cases: CASES, support: SUPPORT });
});

describe("check-base-ui's flags", () => {
  it("--warn-only shows the same findings as warnings, and exits 0", () => {
    const strict = runChecker("check-base-ui", [ROOT]);
    const warnOnly = runChecker("check-base-ui", ["--warn-only", ROOT]);
    assert.equal(warnOnly.status, 0, warnOnly.stdout);
    assert.deepEqual(
      warnOnly.findings.map(({ file, line, rule }) => `${file}:${line}:${rule}`),
      strict.findings.map(({ file, line, rule }) => `${file}:${line}:${rule}`),
    );
    assert.ok(warnOnly.findings.every((f) => f.severity === "warning"));
    assert.match(warnOnly.stdout, /13 of the warnings are errors, shown as warnings by --warn-only/);
  });

  it("--version sets the pin rule 1 wants", () => {
    const run = runChecker("check-base-ui", ["--version", "1.8.0", ROOT]);
    const pins = run.findings.filter((f) => f.rule === 1).map((f) => f.file);
    assert.deepEqual(pins, ["app/package.json", "loose-pin/package.json"], summary(run.findings));
  });

  it("runs from the repo root when no root is given", () => {
    const run = runChecker("check-base-ui", [], { cwd: ROOT });
    assert.equal(run.findings.length, 17, run.stdout);
  });

  it("exits 2 on an unknown flag or a version that isn't exact", () => {
    for (const args of [["--strict", ROOT], ["--version", "^1.9.0", ROOT], ["--version"]]) {
      const run = runChecker("check-base-ui", args);
      assert.equal(run.status, 2, `${args.join(" ")}: ${run.stdout}${run.stderr}`);
      assert.match(run.stderr, /usage: node vendor\/house-style\/bin\/check-base-ui\.mjs/);
    }
  });
});

describe("check-base-ui's conventions.json", () => {
  it("reads stylesheet and ui inside each web root", () => {
    const dir = copy("keys", { web: ["app/src"], stylesheet: "legacy.css", ui: ["components/ui"] });
    writeFileSync(join(dir, "app/src/legacy.css"), '@import "tailwindcss";\n');
    const run = runChecker("check-base-ui", [dir]);
    const got = run.findings.map((f) => `${f.file} rule-${f.rule}`);
    assert.ok(!got.includes("app/src/legacy.css rule-5"), "legacy.css is the one stylesheet now");
    assert.ok(got.includes("app/src/styles/index.css rule-5"), "and index.css is another");
    assert.ok(got.includes("app/src/features/books/ui/BookMenu.tsx rule-3"), "features/*/ui is not in ui any more");
  });

  it("drops a finding an exception covers, by path and by match, and counts it", () => {
    const dir = copy("exceptions", {
      web: ["app/src"],
      exceptions: [
        { check: "base-ui", rule: 3, path: "app/src/rule-3.fail.tsx", reason: "A fixture." },
        { check: "base-ui", rule: 6, path: "app/src/**", match: "bg-[#1a1a1a]", reason: "A fixture's swatch." },
        { check: "structure", rule: 1, path: "app/src/rule-11.fail.tsx", reason: "Another checker's: ignored here." },
      ],
    });
    const run = runChecker("check-base-ui", [dir]);
    const got = run.findings.map((f) => `${f.file}:${f.line} rule-${f.rule}`);
    assert.ok(!got.includes("app/src/rule-3.fail.tsx:1 rule-3"), summary(run.findings));
    assert.ok(!got.includes("app/src/rule-6.fail.tsx:3 rule-6"), "the match covers the one finding");
    assert.ok(got.includes("app/src/rule-6.fail.tsx:4 rule-6"), "and no other");
    assert.ok(got.includes("app/src/rule-11.fail.tsx:2 rule-11"), "a structure exception doesn't apply");
    assert.match(run.stdout, /; 2 excepted by conventions\.json$/m);
  });

  it("warns about an exception whose path names nothing, and not about one that records a case it can't see", () => {
    const dir = copy("stale", {
      web: ["app/src"],
      exceptions: [
        { check: "base-ui", rule: 3, path: "app/src/Gone.tsx", reason: "Moved away since." },
        { check: "base-ui", rule: 5, path: "app/src/rule-6.pass.tsx", reason: "The swatch is data: an inline style." },
      ],
    });
    const run = runChecker("check-base-ui", [dir]);
    const notes = run.findings.filter((f) => f.file === "conventions.json");
    assert.equal(notes.length, 1, summary(run.findings));
    assert.equal(notes[0].line, 6, "the line where the exception starts");
    assert.equal(notes[0].severity, "warning");
    assert.match(notes[0].message, /exceptions\[0\]\.path "app\/src\/Gone\.tsx" names nothing in the repo/);
  });

  it("checks nothing, and says so, with no web root", () => {
    const dir = join(scratch, "no-web");
    writeTree(dir, { "conventions.json": '{ "web": [] }\n', "server/src/index.ts": "export {};\n" });
    const run = runChecker("check-base-ui", [dir]);
    assert.equal(run.status, 0);
    assert.match(run.stdout, /no web root, so there is nothing to check/);
  });
});
