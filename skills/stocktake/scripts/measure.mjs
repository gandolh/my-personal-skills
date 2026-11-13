#!/usr/bin/env node
// measure.mjs - the mechanical half of the stocktake rubric. One line per skill:
// description length, when_to_use length, the listing length Claude Code truncates
// (description plus when_to_use, 1,536), body lines, and the estimated tokens a
// skill costs when it is invoked and at the end of the first 5,000.
//
//   node measure.mjs [skills-dir] [--json] [--cpt 2.7]
//   node measure.mjs --upto <SKILL.md> "<text>" [--cpt 2.7]
//
// Tokens are estimated as characters divided by --cpt. The default 2.7 is the
// ratio `claude plugin details personal-skills` implied across the library on
// 2026-11-13 (2.6 to 3.1 per skill; the low end is used so the estimate errs
// high). Zero dependencies.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const len = (s) => [...s].length;

export function parseSkill(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { description: '', whenToUse: '', body: text, bodyStartLine: 1 };
  const key = (k) => {
    const hit = m[1].match(new RegExp(`^${k}:[ \\t]*(.*(?:\\n[ \\t]+.*)*)`, 'm'));
    if (!hit) return '';
    return hit[1].replace(/^[>|][-+]?[ \t]*\n?/, '').replace(/\n[ \t]+/g, ' ').replace(/^["']|["']$/g, '').trim();
  };
  const head = m[0].length - m[2].length;
  return { description: key('description'), whenToUse: key('when_to_use'), body: m[2], bodyStartLine: text.slice(0, head).split('\n').length };
}

export function tokens(chars, cpt = 2.7) { return Math.round(chars / cpt); }

// Estimated tokens from the top of the file to the end of the first line that holds `needle`.
export function tokensUpTo(text, needle, cpt = 2.7) {
  const at = text.indexOf(needle);
  if (at < 0) return null;
  const end = text.indexOf('\n', at);
  return tokens(len(text.slice(0, end < 0 ? text.length : end)), cpt);
}

export function measureAll(skillsDir, cpt = 2.7) {
  const rows = [];
  for (const name of readdirSync(skillsDir).sort()) {
    const file = join(skillsDir, name, 'SKILL.md');
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    const p = parseSkill(text);
    const total = len(text);
    rows.push({
      skill: name,
      description: len(p.description),
      whenToUse: len(p.whenToUse),
      listing: len(p.description) + len(p.whenToUse),
      lines: text.split('\n').length,
      invokeTokens: tokens(total, cpt),
      alwaysOnTokens: tokens(len(p.description) + len(p.whenToUse) + len(name), cpt),
      past5k: total > 5000 * cpt,
      line5k: total > 5000 * cpt ? text.slice(0, Math.floor(5000 * cpt)).split('\n').length : null,
    });
  }
  return rows;
}

function main(argv) {
  const flag = (f) => { const i = argv.indexOf(f); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
  const cpt = Number(flag('--cpt') ?? 2.7);
  const json = argv.includes('--json') && argv.splice(argv.indexOf('--json'), 1);
  if (argv[0] === '--upto') {
    const text = readFileSync(resolve(argv[1]), 'utf8');
    const t = tokensUpTo(text, argv[2], cpt);
    if (t === null) { console.error('text not found'); return 2; }
    console.log(`${t} estimated tokens up to the end of that line (limit 5000 after compaction)`);
    return t <= 5000 ? 0 : 1;
  }
  const dir = resolve(argv[0] ?? join(root));
  const rows = measureAll(dir, cpt);
  if (json) { console.log(JSON.stringify(rows, null, 2)); return 0; }
  console.log('skill'.padEnd(30) + 'desc'.padStart(6) + 'when'.padStart(6) + 'listing'.padStart(9) + 'lines'.padStart(7) + 'always-on'.padStart(11) + 'invoke'.padStart(8) + '  5k cut at line');
  for (const r of rows) {
    console.log(r.skill.padEnd(30) + String(r.description).padStart(6) + String(r.whenToUse).padStart(6) + String(r.listing).padStart(9) + String(r.lines).padStart(7) + String(r.alwaysOnTokens).padStart(11) + String(r.invokeTokens).padStart(8) + (r.past5k ? `  ${r.line5k}` : ''));
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
