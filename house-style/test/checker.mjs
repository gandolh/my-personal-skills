/**
 * Runs a convention checker the way a repo does, as its own process, and reads its
 * report back as findings. Shared by the checkers' tests; not a test itself.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

const BIN = join(import.meta.dirname, "..", "bin");
const FINDING = /^(\S+):(\d+) rule-(\d+) (error|warning): (.*)$/;

/** Runs bin/<name>.mjs with `args` from `cwd`, and parses each finding line. */
export function runChecker(name, args, { cwd = process.cwd() } = {}) {
  const run = spawnSync(process.execPath, [join(BIN, `${name}.mjs`), ...args], { cwd, encoding: "utf8" });
  const findings = [];
  for (const line of run.stdout.split("\n")) {
    const match = FINDING.exec(line);
    if (match) {
      findings.push({
        file: match[1],
        line: Number(match[2]),
        rule: Number(match[3]),
        severity: match[4],
        message: match[5],
      });
    }
  }
  return { status: run.status, stdout: run.stdout, stderr: run.stderr, findings };
}

/** The findings as one readable line each, for assertion messages. */
export function summary(findings) {
  return findings.map((f) => `${f.file}:${f.line} rule-${f.rule} ${f.severity}: ${f.message}`).join("\n");
}

/** Every file under `root`, as root-relative paths with forward slashes, sorted. */
export function treeFiles(root, dir = root) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...treeFiles(root, full));
    else out.push(relative(root, full).split(sep).join("/"));
  }
  return out.sort();
}

/** Writes `files` ({ path: text }) under `root`. */
export function writeTree(root, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
}

/**
 * Asserts the CASES of a fixture tree against one run's findings: each failing file
 * reports exactly its rule (at the severity and count given), each passing file
 * reports nothing, and every file in the tree belongs to a case.
 */
export function checkCases({ it, root, findings, cases, support }) {
  const byFile = new Map();
  for (const f of findings) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f]);

  for (const c of cases) {
    for (const { file, count = 1, severity = "error" } of c.fail) {
      it(`rule ${c.rule}${c.area ? ` (${c.area})` : ""}: ${file} reports exactly this rule`, () => {
        const got = byFile.get(file) ?? [];
        assert.ok(got.length > 0, `${file} should report rule ${c.rule}, and reports nothing`);
        assert.deepEqual([...new Set(got.map((f) => f.rule))], [c.rule], `${file}:\n${summary(got)}`);
        assert.equal(got.length, count, `${file}: expected ${count} findings:\n${summary(got)}`);
        for (const f of got) assert.equal(f.severity, severity, `${file}: rule ${c.rule} is ${severity}`);
      });
    }
    for (const file of c.pass) {
      it(`rule ${c.rule}${c.area ? ` (${c.area})` : ""}: ${file} passes`, () => {
        assert.deepEqual(
          byFile.get(file) ?? [],
          [],
          `${file} should report nothing:\n${summary(byFile.get(file) ?? [])}`,
        );
      });
    }
  }

  it("every fixture file belongs to a case", () => {
    const named = new Set([...support, ...cases.flatMap((c) => [...c.fail.map((f) => f.file), ...c.pass])]);
    const strays = treeFiles(root).filter((file) => !named.has(file));
    assert.deepEqual(strays, [], "a fixture no case names would hide whatever it reports");
    const unexpected = findings.filter((f) => !named.has(f.file));
    assert.deepEqual(unexpected, [], `findings outside the cases:\n${summary(unexpected)}`);
  });
}
