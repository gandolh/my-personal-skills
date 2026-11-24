// vendor-modern-web-guidance.test.mjs - runs the copy script on a fixture clone.
//
//   node --test scripts/vendor-modern-web-guidance.test.mjs
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { FLAGGED, GUIDES, GUIDES_DIR, UPSTREAM } from './vendor-modern-web-guidance.mjs';

const script = join(dirname(fileURLToPath(import.meta.url)), 'vendor-modern-web-guidance.mjs');
const scratch = mkdtempSync(join(tmpdir(), 'vendor-mwg-test-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const git = (cwd, ...args) =>
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', '-c', 'commit.gpgsign=false', ...args], {
    cwd,
    encoding: 'utf8',
  });

const pointer = (id) => `\`${id}\` (via \`npx -y modern-web-guidance@latest retrieve "${id}"\`)`;

/** A git repo shaped like upstream: the 20 kept guides as stubs, one guide that isn't kept, then `overrides`. */
function clone(overrides = {}) {
  const dir = mkdtempSync(join(scratch, 'clone-'));
  const files = Object.fromEntries(GUIDES.map((p) => [p, `# ${p}\n\nPlain text.\n`]));
  files['performance/schedule-tasks-by-priority.md'] = '# Not kept\n';
  Object.assign(files, overrides);
  for (const [path, text] of Object.entries(files)) {
    const file = join(dir, GUIDES_DIR, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'guides');
  return { dir, sha: git(dir, 'rev-parse', 'HEAD').stdout.trim() };
}

const outDir = () => join(mkdtempSync(join(scratch, 'out-')), 'mwg');
const run = (dir, sha, out) => spawnSync(process.execPath, [script, dir, sha, '--out', out], { encoding: 'utf8' });
const read = (out, path) => readFileSync(join(out, path), 'utf8');

describe('vendor-modern-web-guidance', () => {
  it('rewrites both pointer kinds and the import, adds the header and removes other files', () => {
    const { dir, sha } = clone({
      'performance/break-up-long-tasks.md': [
        '# Break Up Long Tasks',
        '',
        `See ${pointer('schedule-tasks-by-priority')}.`,
        `Or ${pointer('search-hidden-content')}.`,
        '',
      ].join('\n'),
      'js/coordinate-global-events.md': "# T\n\n    const module = await import('https://esm.sh/temporal-polyfill');\n",
    });
    const out = outDir();
    mkdirSync(join(out, 'dropped'), { recursive: true });
    writeFileSync(join(out, 'dropped', 'old-guide.md'), 'gone upstream\n');

    const r = run(dir, sha, out);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /wrote 20 guides .* 2 pointers \(1 to vendored guides, 1 to GitHub\), 1 imports rewritten, 1 other file\(s\) removed/);

    const tasks = read(out, 'performance/break-up-long-tasks.md');
    assert.ok(tasks.includes('Or [`search-hidden-content`](../ui-behaviors/search-hidden-content.md).'), tasks);
    assert.ok(
      tasks.includes(
        `See [\`schedule-tasks-by-priority\`](https://github.com/${UPSTREAM}/blob/${sha}/${GUIDES_DIR}/performance/schedule-tasks-by-priority.md).`,
      ),
      tasks,
    );
    assert.ok(read(out, 'js/coordinate-global-events.md').includes("await import('temporal-polyfill');"));

    for (const path of GUIDES) {
      const text = read(out, path);
      const first = text.split('\n')[0];
      assert.ok(first.startsWith('<!-- ') && first.endsWith(' -->'), `${path}: ${first}`);
      assert.ok(first.includes(`${GUIDES_DIR}/${path}`) && first.includes(sha) && first.includes('CC BY 4.0'), first);
      for (const [re] of FLAGGED) assert.ok(!re.test(text), `${path} still matches ${re}`);
    }
    assert.ok(!existsSync(join(out, 'dropped')), 'the stale file and its empty folder are removed');

    const before = GUIDES.map((p) => read(out, p));
    assert.equal(run(dir, sha, out).status, 0);
    assert.deepEqual(GUIDES.map((p) => read(out, p)), before, 'a second run writes the same bytes');
  });

  it('exits 1 on a leftover npx line, names the file and line, and writes nothing', () => {
    const { dir, sha } = clone({ 'forms/ime-safe-enter-submit.md': '# T\n\nRun `npx some-tool init` first.\n' });
    const out = outDir();
    const r = run(dir, sha, out);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /forms\/ime-safe-enter-submit\.md:4: npx:/);
    assert.ok(!existsSync(out), 'nothing is written');
  });

  it('exits 1 on a pointer of another shape and on a pointer to no guide', () => {
    const { dir, sha } = clone({
      'ui-atoms/responsive-table.md': '# T\n\nSee `x` (via `modern-web-guidance retrieve "x"`).\n',
      'security/security.md': `# T\n\nSee ${pointer('no-such-guide')}.\n`,
    });
    const r = run(dir, sha, outDir());
    assert.equal(r.status, 1);
    assert.match(r.stderr, /ui-atoms\/responsive-table\.md:4: a guide pointer of another shape/);
    assert.match(r.stderr, /security\/security\.md: a pointer to "no-such-guide", which no guide in the clone matches/);
  });

  it('exits 1 when a kept guide is gone upstream', () => {
    const { dir, sha } = clone();
    rmSync(join(dir, GUIDES_DIR, 'ui-atoms', 'responsive-table.md'));
    const r = run(dir, sha, outDir());
    assert.equal(r.status, 1);
    assert.match(r.stderr, /ui-atoms\/responsive-table\.md: not in the clone/);
  });

  it('exits 2 when the clone is not at the sha, or the output folder is not named mwg', () => {
    const { dir, sha } = clone();
    const out = outDir();
    const wrong = run(dir, '0'.repeat(40), out);
    assert.equal(wrong.status, 2);
    assert.match(wrong.stderr, /the clone is at [0-9a-f]{40}, not 0{40}/);
    assert.ok(!existsSync(out));
    assert.equal(run(dir, sha, join(scratch, 'elsewhere')).status, 2);
  });
});
