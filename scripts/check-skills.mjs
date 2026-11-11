#!/usr/bin/env node
// check-skills.mjs - checks every skills/*/SKILL.md against the portable
// Agent Skills limits (name rules, description length, valid frontmatter).
//
//   node scripts/check-skills.mjs [skills-dir] [attribution-file]
//
// Zero dependencies. Exits 1 when a first-party skill breaks a rule. A
// vendored skill (named in the ATTRIBUTION.md table) that breaks a rule is
// only reported as a warning, since it is changed upstream.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = resolve(process.argv[2] ?? join(root, 'skills'));
const attribution = resolve(process.argv[3] ?? join(root, 'ATTRIBUTION.md'));

const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_NAME = 64;
const MAX_DESC = 1024;
const MAX_LISTING = 1536; // Claude Code: description + when_to_use
const PORTABLE_KEYS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);

const len = (s) => [...s].length;

// Names in the first column of the "Vendored, with upstream pins" table.
function vendoredNames() {
  if (!existsSync(attribution)) return new Set();
  const out = new Set();
  let inTable = false;
  for (const line of readFileSync(attribution, 'utf8').split('\n')) {
    if (/^##\s+Vendored/.test(line)) { inTable = true; continue; }
    if (inTable && /^#{1,3}\s/.test(line)) break;
    if (inTable && line.startsWith('|')) {
      const first = line.split('|')[1] ?? '';
      for (const m of first.matchAll(/`([a-z0-9-]+)`/g)) out.add(m[1]);
    }
  }
  return out;
}

// Reads the frontmatter block. Returns { keys: Map<key, string>, errors }.
// Handles the YAML subset skills use: plain, quoted and block scalars at the
// top level, with nested maps and lists kept as raw text.
function parseFrontmatter(text) {
  const errors = [];
  const keys = new Map();
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') return { keys, errors: ['no frontmatter: the file must start with ---'] };
  const end = lines.indexOf('---', 1);
  if (end < 0) return { keys, errors: ['frontmatter is not closed with ---'] };
  const fm = lines.slice(1, end);

  let i = 0;
  while (i < fm.length) {
    const line = fm[i];
    if (line.trim() === '' || line.trimStart().startsWith('#')) { i++; continue; }
    if (/^\s/.test(line)) { errors.push(`line ${i + 2}: unexpected indentation`); i++; continue; }
    const m = line.match(/^([A-Za-z0-9_-]+):(?:\s+(.*)|\s*)$/);
    if (!m) { errors.push(`line ${i + 2}: not a "key: value" line: ${line.slice(0, 60)}`); i++; continue; }
    const key = m[1];
    const rest = (m[2] ?? '').trimEnd();
    // Gather indented continuation lines (blank lines belong to the value).
    let j = i + 1;
    const cont = [];
    while (j < fm.length && (fm[j].trim() === '' || /^\s/.test(fm[j]))) { cont.push(fm[j]); j++; }
    while (cont.length && cont[cont.length - 1].trim() === '') cont.pop();
    const where = `line ${i + 2} (${key})`;

    if (keys.has(key)) errors.push(`${where}: duplicate key`);

    let value;
    if (/^[>|][+-]?\d*$/.test(rest)) {
      const body = cont.map((l) => l.trim());
      if (rest[0] === '|') value = body.join('\n');
      else value = body.reduce((acc, l, k) => (k === 0 ? l : acc + (l === '' || body[k - 1] === '' ? '\n' : ' ') + l), '').replace(/\n /g, '\n');
      if (rest[0] === '>') value = value.replace(/\n(?=.)/g, (x) => x); // blank lines stay as newlines
    } else if (rest === '') {
      // Nested map or list, or an empty value with a folded plain scalar below.
      const body = cont.map((l) => l.trim());
      const isNested = body.some((l) => /^- /.test(l) || /^[A-Za-z0-9_./-]+:(\s|$)/.test(l));
      value = isNested ? cont.join('\n') : body.join(' ');
      if (!isNested) {
        for (const l of body) if (/:\s/.test(l)) errors.push(`${where}: unquoted ": " in a plain value`);
      }
    } else if (rest[0] === '"') {
      const all = [rest, ...cont.map((l) => l.trim())].join(' ');
      const q = all.match(/^"((?:[^"\\]|\\.)*)"\s*(#.*)?$/);
      if (!q) { errors.push(`${where}: bad double-quoted string`); value = all; }
      else value = q[1].replace(/\\(["\\/]|n|t)/g, (_, c) => ({ n: '\n', t: '\t' }[c] ?? c));
    } else if (rest[0] === "'") {
      const all = [rest, ...cont.map((l) => l.trim())].join(' ');
      const q = all.match(/^'((?:[^']|'')*)'\s*(#.*)?$/);
      if (!q) { errors.push(`${where}: bad single-quoted string`); value = all; }
      else value = q[1].replace(/''/g, "'");
    } else if (rest[0] === '[' || rest[0] === '{') {
      value = [rest, ...cont.map((l) => l.trim())].join(' ');
    } else {
      if (/^[@`%*&!]/.test(rest)) errors.push(`${where}: a plain value cannot start with ${rest[0]}`);
      const all = [rest, ...cont.map((l) => l.trim())].join(' ');
      if (/:(\s|$)/.test(all)) errors.push(`${where}: unquoted ": " in a plain value, quote the value`);
      value = all.replace(/\s+#.*$/, '');
    }
    keys.set(key, value);
    i = j;
  }
  return { keys, errors };
}

const vendored = vendoredNames();
const dirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
  .map((d) => d.name).sort();

let failed = 0, warned = 0;
const lines = [];
for (const dir of dirs) {
  const isVendored = vendored.has(dir);
  const problems = [];
  const notes = [];
  const { keys, errors } = parseFrontmatter(readFileSync(join(skillsDir, dir, 'SKILL.md'), 'utf8'));
  problems.push(...errors);

  const name = keys.get('name');
  if (!name) problems.push('name is missing');
  else {
    if (len(name) > MAX_NAME) problems.push(`name is ${len(name)} characters, the limit is ${MAX_NAME}`);
    if (!NAME_RE.test(name)) problems.push(`name "${name}" does not match ${NAME_RE}`);
    if (name !== dir) problems.push(`name "${name}" does not match its directory "${dir}"`);
  }
  const desc = keys.get('description')?.trim();
  if (!desc) problems.push('description is missing or empty');
  else {
    if (len(desc) > MAX_DESC) problems.push(`description is ${len(desc)} characters, the limit is ${MAX_DESC}`);
    const listing = len(desc) + len((keys.get('when_to_use') ?? '').trim());
    if (listing > MAX_LISTING) problems.push(`description + when_to_use is ${listing} characters, Claude Code truncates at ${MAX_LISTING}`);
  }
  const extra = [...keys.keys()].filter((k) => !PORTABLE_KEYS.has(k));
  if (extra.length) notes.push(`Claude Code only keys (claude.ai uploads reject them): ${extra.join(', ')}`);

  const d = desc ? len(desc) : 0;
  if (problems.length) {
    if (isVendored) { warned++; lines.push(`WARN  ${dir} (vendored, not edited here)`); }
    else { failed++; lines.push(`FAIL  ${dir}`); }
    for (const p of problems) lines.push(`        ${p}`);
  } else {
    lines.push(`ok    ${dir} (description ${d})${isVendored ? ' [vendored]' : ''}`);
  }
  for (const n of notes) lines.push(`        note: ${n}`);
}

console.log(lines.join('\n'));
console.log(`\n${dirs.length} skills checked: ${failed} failing, ${warned} vendored warnings`);
process.exit(failed ? 1 : 0);
