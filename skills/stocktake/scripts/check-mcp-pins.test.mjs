import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkConfig, packagesOf, problemWith } from './check-mcp-pins.mjs';

const CLI = fileURLToPath(new URL('./check-mcp-pins.mjs', import.meta.url));
const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));
const run = (...args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

test('a pinned fixture passes', () => {
  const r = run(fixture('pinned'));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /OK\s+.*codegraph/);
  assert.doesNotMatch(r.stdout, /FAIL/);
});

test('@latest fails', () => {
  const r = run(fixture('latest'));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL .*codegraph: @latest/);
});

test('an unversioned npx or pnpm dlx package fails, each server reported', () => {
  const r = run(fixture('unversioned'));
  assert.equal(r.status, 1);
  assert.equal((r.stdout.match(/^FAIL/gm) ?? []).length, 3, r.stdout);
  assert.match(r.stdout, /no version \(some-server\)/);
  assert.match(r.stdout, /no version \(@scope\/other\)/);
});

test('a git reference with no commit fails; with a sha it passes', () => {
  const bad = run(fixture('git-no-commit'));
  assert.equal(bad.status, 1);
  assert.equal((bad.stdout.match(/^FAIL/gm) ?? []).length, 3, bad.stdout);
  const good = run(fixture('git-commit'));
  assert.equal(good.status, 0, good.stdout);
});

test('a range or a tag is not an exact version', () => {
  const r = run(fixture('range-and-tag'));
  assert.equal(r.status, 1);
  assert.equal((r.stdout.match(/^FAIL/gm) ?? []).length, 3, r.stdout);
});

test('a folder is searched for .cursor/mcp.json and .vscode/mcp.json too', () => {
  const r = run(fixture('vscode-and-cursor'));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /FAIL .*\.vscode\/mcp\.json: loose/);
  assert.match(r.stdout, /OK .*\.cursor\/mcp\.json: pinned/);
  assert.match(r.stdout, /OK .*\.vscode\/mcp\.json: pinned/);
});

test('servers that are not package runners are skipped, not failed', () => {
  const r = run(fixture('not-a-runner'));
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /SKIP .*local: node is not a package runner/);
  assert.match(r.stdout, /SKIP .*remote: remote server/);
});

test('an empty folder passes with a note; a named file that is not JSON exits 2', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-pins-'));
  try {
    const empty = run(dir);
    assert.equal(empty.status, 0);
    assert.match(empty.stdout, /nothing to check/);
    const file = join(dir, 'broken.json');
    writeFileSync(file, '{ not json');
    assert.equal(run(file).status, 2);
    assert.equal(run(join(dir, 'missing.json')).status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('problemWith and packagesOf on the edges', () => {
  assert.equal(problemWith('@colbymchenry/codegraph@1.4.2'), null);
  assert.equal(problemWith('server@1.0.0-rc.1'), null);
  assert.match(problemWith('server'), /no version/);
  assert.match(problemWith('@scope/server'), /no version/);
  assert.match(problemWith('server@latest'), /@latest/);
  assert.match(problemWith('server@1'), /not an exact version/);
  assert.deepEqual(packagesOf(['-y', 'a@1.0.0', 'serve']), ['a@1.0.0']);
  assert.deepEqual(packagesOf(['-p', 'a@1.0.0', 'bin']), ['a@1.0.0']);
  assert.deepEqual(packagesOf(['--package=a@1.0.0', 'bin']), ['a@1.0.0']);
  assert.deepEqual(packagesOf(['-y']), []);
});

test('checkConfig reads both the mcpServers and the servers key', () => {
  assert.equal(checkConfig({ servers: { x: { command: 'npx', args: ['x'] } } }).results[0].status, 'fail');
  assert.equal(checkConfig({ mcpServers: { x: { command: 'npx', args: ['x@1.2.3'] } } }).results[0].status, 'ok');
  assert.equal(checkConfig({}).results.length, 0);
});
