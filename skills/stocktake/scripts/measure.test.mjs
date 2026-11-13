import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseSkill, tokens, tokensUpTo } from './measure.mjs';

const CLI = fileURLToPath(new URL('./measure.mjs', import.meta.url));

test('parseSkill reads a one-line and a folded description and when_to_use', () => {
  const a = parseSkill('---\nname: a\ndescription: Does a thing.\nwhen_to_use: When asked.\n---\n# A\nbody\n');
  assert.equal(a.description, 'Does a thing.');
  assert.equal(a.whenToUse, 'When asked.');
  assert.equal(a.bodyStartLine, 6);
  const b = parseSkill('---\nname: b\ndescription: >\n  First half\n  second half.\n---\nbody\n');
  assert.equal(b.description, 'First half second half.');
});

test('tokens divides characters by the ratio; tokensUpTo stops at the end of the line', () => {
  assert.equal(tokens(2700, 2.7), 1000);
  const text = 'a'.repeat(269) + '\nRULE here\n' + 'b'.repeat(2700);
  assert.equal(tokensUpTo(text, 'RULE', 2.7), Math.round((269 + 1 + 9) / 2.7));
  assert.equal(tokensUpTo(text, 'missing'), null);
});

test('--upto exits 0 under 5,000 tokens and 1 over', () => {
  const dir = fileURLToPath(new URL('./fixtures/pinned/.mcp.json', import.meta.url));
  const ok = spawnSync(process.execPath, [CLI, '--upto', dir, 'codegraph'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.match(ok.stdout, /estimated tokens/);
});
