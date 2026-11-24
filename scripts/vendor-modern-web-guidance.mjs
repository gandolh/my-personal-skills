#!/usr/bin/env node
// vendor-modern-web-guidance.mjs - copies the 20 guides the web-platform skill
// keeps from a clone of GoogleChrome/modern-web-guidance at a pinned commit.
//
//   node scripts/vendor-modern-web-guidance.mjs <clone> <sha> [--out <dir>]
//
// <sha> is the full commit the clone's HEAD must be at. The copy goes to
// skills/web-platform/references/mwg/ unless --out names another folder called
// mwg. Each guide gets a first-line comment naming its upstream path, the
// commit and the licence. Two kinds of line change: a pointer that ran
// upstream's command-line tool becomes a link on the guide's id (relative when
// the guide is vendored, else its GitHub URL at <sha>), and a polyfill import
// from esm.sh names the npm package. Any other file under the output folder is
// deleted, so a dropped guide shows in the diff.
//
// Nothing is written unless every check passes. Exit 0 written; 1 a guide is
// missing, a pointer names no guide, or a copied line still runs a package
// runner or loads from a CDN (file and line listed); 2 a usage error or the
// clone is not at <sha>. Zero dependencies. It reads the clone (files and
// `git rev-parse HEAD`) and runs nothing from it.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPSTREAM = 'GoogleChrome/modern-web-guidance';
export const GUIDES_DIR = 'skills/modern-web-guidance/guides';

// The 20 kept guides, by upstream path under GUIDES_DIR. Brief 44 says why each is here.
export const GUIDES = [
  'performance/performance.md',
  'performance/improve-next-page-load-performance.md',
  'performance/break-up-long-tasks.md',
  'performance/identify-inp-causes.md',
  'performance/defer-rendering-heavy-content.md',
  'security/security.md',
  'security/sanitize-untrusted-html.md',
  'security/trusted-types.md',
  'security/validate-origins.md',
  'forms/ime-safe-enter-submit.md',
  'forms/autofill-sign-in-form.md',
  'forms/autofill-sign-up-form.md',
  'js/coordinate-global-events.md',
  'js/capture-location-agnostic-data.md',
  'js/calculate-event-differentials.md',
  'accessibility/respect-os-text-scale.md',
  'ui-behaviors/same-document-transitions.md',
  'ui-behaviors/cross-document-transitions.md',
  'ui-behaviors/search-hidden-content.md',
  'ui-atoms/responsive-table.md',
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUT = join(root, 'skills', 'web-platform', 'references', 'mwg');

const POINTER = /`([a-z0-9-]+)` \(via `npx -y modern-web-guidance@latest retrieve "\1"`\)/g;
const ESM_IMPORT = /import\((['"])https:\/\/esm\.sh\/((?:@[a-z0-9._-]+\/)?[a-z0-9._-]+(?:\/[a-z0-9._-]+)*)\1\)/g;

// What a copied line must not hold after the rewrites. The header is checked too.
export const FLAGGED = [
  [/npx/, 'npx'],
  [/@latest/, '@latest'],
  [/unpkg\.com/, 'unpkg.com'],
  [/esm\.sh/, 'esm.sh'],
  [/cdn\.jsdelivr\.net/, 'cdn.jsdelivr.net'],
  [/\(via `|\bretrieve\s+["'`]/, 'a guide pointer of another shape'],
];

export function header(path, sha) {
  return (
    `<!-- Copied from ${UPSTREAM}, ${GUIDES_DIR}/${path}, at commit ${sha}, under CC BY 4.0. ` +
    'Changed from upstream, where the file had them: each pointer that ran the upstream command-line tool is a link on ' +
    'the guide id, and each polyfill import from a CDN names the npm package. -->'
  );
}

// Every guide in the clone, keyed by id (the file name without .md).
function guideIndex(guidesRoot) {
  const index = new Map();
  for (const category of readdirSync(guidesRoot, { withFileTypes: true })) {
    if (!category.isDirectory()) continue;
    for (const file of readdirSync(join(guidesRoot, category.name))) {
      if (!file.endsWith('.md')) continue;
      const id = file.slice(0, -3);
      index.set(id, [...(index.get(id) ?? []), `${category.name}/${file}`]);
    }
  }
  return index;
}

// Rewrites one guide. Returns the new text, the counts, and problems found while rewriting.
export function transform(text, path, sha, index) {
  const problems = [];
  let local = 0;
  let remote = 0;
  let imports = 0;
  let body = text.replace(POINTER, (whole, id) => {
    const found = index.get(id) ?? [];
    if (found.length !== 1) {
      problems.push(`a pointer to "${id}", which ${found.length ? 'more than one guide' : 'no guide'} in the clone matches`);
      return whole;
    }
    const target = found[0];
    if (GUIDES.includes(target)) {
      local++;
      return `[\`${id}\`](${posix.relative(posix.dirname(path), target)})`;
    }
    remote++;
    return `[\`${id}\`](https://github.com/${UPSTREAM}/blob/${sha}/${GUIDES_DIR}/${target})`;
  });
  body = body.replace(ESM_IMPORT, (_, quote, pkg) => {
    imports++;
    return `import(${quote}${pkg}${quote})`;
  });
  return { text: `${header(path, sha)}\n${body}`, local, remote, imports, problems };
}

export function flaggedLines(text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const [re, what] of FLAGGED) if (re.test(line)) hits.push({ line: i + 1, what, text: line.trim().slice(0, 120) });
  });
  return hits;
}

function filesUnder(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? filesUnder(join(dir, e.name)) : [join(dir, e.name)],
  );
}

function removeEmptyDirs(dir, keep) {
  for (const e of readdirSync(dir, { withFileTypes: true })) if (e.isDirectory()) removeEmptyDirs(join(dir, e.name), false);
  if (!keep && readdirSync(dir).length === 0) rmdirSync(dir);
}

export function main(argv) {
  const args = [...argv];
  let out = DEFAULT_OUT;
  const at = args.indexOf('--out');
  if (at >= 0) {
    if (!args[at + 1]) return usage('--out needs a folder');
    out = resolve(args[at + 1]);
    args.splice(at, 2);
  }
  const [cloneArg, sha] = args;
  if (args.length !== 2) return usage('expected <clone> <sha>');
  if (!/^[0-9a-f]{40}$/.test(sha)) return usage('<sha> must be the full 40-character commit');
  if (basename(out) !== 'mwg') return usage('the output folder must be named mwg, so a wrong --out deletes nothing');
  const clone = resolve(cloneArg);
  const head = spawnSync('git', ['-C', clone, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (head.status !== 0) return usage(`${clone} is not a git checkout: ${head.stderr.trim()}`);
  if (head.stdout.trim() !== sha) return usage(`the clone is at ${head.stdout.trim()}, not ${sha}; check out ${sha} first`);
  const guidesRoot = join(clone, GUIDES_DIR);
  if (!existsSync(guidesRoot)) return usage(`${guidesRoot} does not exist`);

  const index = guideIndex(guidesRoot);
  const problems = [];
  const copies = [];
  const totals = { local: 0, remote: 0, imports: 0 };
  for (const path of GUIDES) {
    const shown = relative(process.cwd(), join(out, path)) || join(out, path);
    const source = join(guidesRoot, path);
    if (!existsSync(source)) {
      problems.push(`${GUIDES_DIR}/${path}: not in the clone (renamed or dropped upstream)`);
      continue;
    }
    const result = transform(readFileSync(source, 'utf8'), path, sha, index);
    for (const p of result.problems) problems.push(`${shown}: ${p}`);
    for (const hit of flaggedLines(result.text)) problems.push(`${shown}:${hit.line}: ${hit.what}: ${hit.text}`);
    totals.local += result.local;
    totals.remote += result.remote;
    totals.imports += result.imports;
    copies.push({ path, text: result.text });
  }
  if (problems.length) {
    console.error(`vendor-modern-web-guidance: ${problems.length} problem(s), nothing written:`);
    for (const p of problems) console.error(`  ${p}`);
    return 1;
  }

  for (const { path, text } of copies) {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), text);
  }
  const keep = new Set(GUIDES.map((p) => join(out, p)));
  const stale = filesUnder(out).filter((f) => !keep.has(f));
  for (const f of stale) rmSync(f);
  removeEmptyDirs(out, true);

  console.log(
    `wrote ${copies.length} guides to ${relative(process.cwd(), out) || out} at ${sha.slice(0, 7)}: ` +
      `${totals.local + totals.remote} pointers (${totals.local} to vendored guides, ${totals.remote} to GitHub), ` +
      `${totals.imports} imports rewritten, ${stale.length} other file(s) removed`,
  );
  return 0;
}

function usage(message) {
  console.error(`vendor-modern-web-guidance: ${message}`);
  console.error('usage: node scripts/vendor-modern-web-guidance.mjs <clone> <sha> [--out <folder named mwg>]');
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
