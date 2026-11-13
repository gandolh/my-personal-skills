#!/usr/bin/env node
// check-mcp-pins.mjs - a static review of MCP configuration for mutable package
// references. It reads the files and runs nothing: no server is started and no
// package is resolved.
//
//   node check-mcp-pins.mjs [file-or-folder ...]
//
// With no argument it checks .mcp.json, .cursor/mcp.json and .vscode/mcp.json in
// the current folder. A folder argument is searched for the same three files.
// Zero dependencies. Exit 0 when every package reference is pinned, 1 when one
// is not, 2 when a file is missing or is not JSON.
//
// A server fails when its command is a package runner (npx, bunx, pnpm dlx,
// pnpx, yarn dlx, npm exec) and its package is
//   - named with no version,
//   - pinned to @latest, a tag (@next) or a range (^1.2.3, 1.x), or
//   - a git URL or a github shorthand with no commit sha after the #.
// Servers started some other way (node, python, a remote url) are not package
// runners and are listed as skipped.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_FILES = ['.mcp.json', '.cursor/mcp.json', '.vscode/mcp.json'];
const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const SHA = /^[0-9a-f]{7,40}$/i;
const GIT_URL = /^(?:git\+|git:\/\/|ssh:\/\/|https?:\/\/.+\.git\b|github:|gitlab:|bitbucket:|gist:)/;
const SHORTHAND = /^[\w.-]+\/[\w.-]+(?:#.*)?$/;

// Flags of the runners that take a value. Everything else starting with - is a bare flag.
const VALUE_FLAGS = new Set(['-c', '--call', '--registry', '--cache', '--prefix', '--userconfig', '-w', '--workspace']);
const PACKAGE_FLAGS = new Set(['-p', '--package']);

// The runner a command is, and the arguments that follow its own subcommand.
function runnerOf(command, args) {
  const name = String(command).split(/[\\/]/).pop().replace(/\.(cmd|exe|ps1)$/i, '');
  if (name === 'npx' || name === 'bunx' || name === 'pnpx') return { runner: name, rest: args };
  if (name === 'pnpm' && args[0] === 'dlx') return { runner: 'pnpm dlx', rest: args.slice(1) };
  if (name === 'yarn' && args[0] === 'dlx') return { runner: 'yarn dlx', rest: args.slice(1) };
  if (name === 'npm' && (args[0] === 'exec' || args[0] === 'x')) return { runner: 'npm exec', rest: args.slice(1) };
  if (name === 'bun' && args[0] === 'x') return { runner: 'bun x', rest: args.slice(1) };
  return null;
}

// The package specs a runner will fetch: the values of -p/--package, or else the
// first argument that is not a flag.
export function packagesOf(rest) {
  const named = [];
  let firstPositional = null;
  for (let i = 0; i < rest.length; i++) {
    const a = String(rest[i]);
    if (a === '--') { if (firstPositional === null && rest[i + 1] !== undefined) firstPositional = String(rest[i + 1]); break; }
    if (PACKAGE_FLAGS.has(a)) { if (rest[i + 1] !== undefined) named.push(String(rest[++i])); continue; }
    const eq = a.match(/^(--package)=(.*)$/);
    if (eq) { named.push(eq[2]); continue; }
    if (VALUE_FLAGS.has(a)) { i++; continue; }
    if (a.startsWith('-')) continue;
    if (firstPositional === null) firstPositional = a;
    break;
  }
  return named.length ? named : firstPositional === null ? [] : [firstPositional];
}

// Why a package spec is mutable, or null when it is pinned.
export function problemWith(spec) {
  if (GIT_URL.test(spec) || (SHORTHAND.test(spec) && !spec.startsWith('@'))) {
    const hash = spec.includes('#') ? spec.slice(spec.indexOf('#') + 1) : '';
    const ref = hash.replace(/^(?:commit[-:=]?|sha[-:=]?)/i, '');
    return SHA.test(ref) ? null : `git reference with no commit (${spec}); end it with #<commit sha>`;
  }
  // name, name@version, @scope/name, @scope/name@version
  const at = spec.lastIndexOf('@');
  if (at <= 0) return `no version (${spec}); pin it as ${spec}@<exact version>`;
  const version = spec.slice(at + 1);
  if (version === 'latest') return `@latest (${spec}); pin an exact version`;
  if (!EXACT.test(version)) return `"${version}" is a tag or a range, not an exact version (${spec})`;
  return null;
}

// Every server in a parsed config: {name, command, args}.
function serversOf(json) {
  const block = json?.mcpServers ?? json?.servers ?? {};
  return Object.entries(block).map(([name, s]) => ({ name, command: s?.command, args: Array.isArray(s?.args) ? s.args : [], url: s?.url }));
}

// Returns {file, results:[{server, status:'ok'|'fail'|'skip', detail}]}.
export function checkConfig(json, file = '.mcp.json') {
  const results = [];
  for (const s of serversOf(json)) {
    if (!s.command) { results.push({ server: s.name, status: 'skip', detail: s.url ? 'remote server, nothing to pin here' : 'no command' }); continue; }
    const r = runnerOf(s.command, s.args);
    if (!r) { results.push({ server: s.name, status: 'skip', detail: `${s.command} is not a package runner` }); continue; }
    const pkgs = packagesOf(r.rest);
    if (!pkgs.length) { results.push({ server: s.name, status: 'fail', detail: `${r.runner} with no package` }); continue; }
    const bad = pkgs.map(problemWith).filter(Boolean);
    results.push(bad.length ? { server: s.name, status: 'fail', detail: bad.join('; ') } : { server: s.name, status: 'ok', detail: `${r.runner} ${pkgs.join(' ')}` });
  }
  return { file, results };
}

function targetsFor(argv) {
  if (!argv.length) argv = ['.'];
  const files = [];
  for (const a of argv) {
    const p = resolve(a);
    if (existsSync(p) && statSync(p).isDirectory()) {
      for (const f of CONFIG_FILES) if (existsSync(join(p, f))) files.push(join(p, f));
    } else files.push(p);
  }
  return files;
}

const rel = (f) => relative(process.cwd(), f) || f;

function main(argv) {
  const files = targetsFor(argv);
  if (!files.length) { console.log('no MCP configuration found (.mcp.json, .cursor/mcp.json, .vscode/mcp.json): nothing to check'); return 0; }
  let failed = 0;
  for (const file of files) {
    let json;
    try { json = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error(`${file}: cannot read as JSON (${e.code ?? e.message})`); return 2; }
    const { results } = checkConfig(json, file);
    if (!results.length) console.log(`OK    ${rel(file)}: no servers`);
    for (const r of results) {
      if (r.status === 'fail') failed++;
      console.log(`${r.status.toUpperCase().padEnd(5)} ${rel(file)}: ${r.server}: ${r.detail}`);
    }
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
