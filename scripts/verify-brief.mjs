#!/usr/bin/env node
// verify-brief.mjs - the mechanical half of a brief's verify gate, for the
// controller to run on a builder's commits before it reads them.
//
//   node scripts/verify-brief.mjs <repo> <base> [options]
//
//   --gate "<cmd>"       the check gate, repeatable; replaces the one read
//                        from package.json (check, else typecheck then test)
//   --untouched <glob>   no changed path may match it, repeatable
//   --flaky <file>       the known-flaky list (default: .flaky-tests in the
//                        repo); one test file per line, optionally
//                        "<file> :: <command that runs it alone>"
//   --no-audit           skip npm audit (it needs the network)
//   --log <dir>          where each check's full output goes
//
// VERIFY_BRIEF_DENY holds extra words the diff must not add, comma
// separated: a domain, a GitHub name. The current username is always one.
//
// Checks run one at a time, never in parallel, to keep the machine light.
// One line per check: its exit code (or "skip"), its name, a short note.
// Exits 1 when any check fails, 2 on a usage error. Zero dependencies.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { basename, join, resolve } from "node:path";

const USAGE =
  'usage: node scripts/verify-brief.mjs <repo> <base> [--gate "<cmd>"]... [--untouched <glob>]... [--flaky <file>] [--no-audit] [--log <dir>]';

function parseArgs(argv) {
  const opts = { gates: [], untouched: [], flaky: null, audit: true, log: null, positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === "--gate") opts.gates.push(value());
    else if (a === "--untouched") opts.untouched.push(value());
    else if (a === "--flaky") opts.flaky = value();
    else if (a === "--log") opts.log = value();
    else if (a === "--no-audit") opts.audit = false;
    else if (a === "-h" || a === "--help") throw new Error("help");
    else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
    else opts.positional.push(a);
  }
  if (opts.positional.length !== 2) throw new Error("needs <repo> and <base>");
  return opts;
}

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");

/** A glob as a RegExp over a repo-relative path: **, * and ? as in git. */
export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*" && glob[i + 1] === "*") {
      i++;
      if (glob[i + 1] === "/") {
        i++;
        re += "(?:.*/)?";
      } else re += ".*";
    } else if (c === "*") re += "[^/]*";
    else if (c === "?") re += "[^/]";
    else re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  if (glob.endsWith("/")) re += ".*";
  return new RegExp(`^${re}$`);
}

/** The words and machine paths the diff must not add. */
export function denyPatterns(env = process.env, user = safeUser()) {
  const pats = [
    { name: "home path", re: /\/home\/[a-z_][\w.-]*\//i },
    { name: "home path", re: /\/Users\/[A-Za-z][\w.-]*\//i },
    { name: "home path", re: /[A-Za-z]:\\Users\\/i },
    { name: "WSL mount", re: /\/mnt\/[a-z]\//i },
    { name: "projects path", re: /~\/projects\b/ },
  ];
  const words = (env.VERIFY_BRIEF_DENY ?? "").split(",").map((w) => w.trim()).filter(Boolean);
  if (user && user.length >= 3 && !["root", "node", "user", "runner"].includes(user)) words.push(user);
  for (const w of words) {
    pats.push({ name: "denied word", re: new RegExp(`(^|[^A-Za-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^A-Za-z0-9])`, "i") });
  }
  return pats;
}

function safeUser() {
  try {
    return userInfo().username;
  } catch {
    return "";
  }
}

/** Test files a failing vitest, jest or node --test run names. */
export function failingTestFiles(output) {
  const files = new Set();
  const text = stripAnsi(output);
  const ext = String.raw`[\w./@-]+\.(?:test|spec)\.[cm]?[jt]sx?|[\w./@-]+\.test\.mjs|[\w./@-]+-spec\.[cm]?[jt]sx?`;
  for (const m of text.matchAll(new RegExp(String.raw`(?:^|\n)\s*(?:FAIL|×|✗|❯)\s+(${ext})`, "g"))) files.add(m[1]);
  for (const m of text.matchAll(new RegExp(String.raw`(?:^|\n)\s*not ok \d+ - (${ext})`, "g"))) files.add(m[1]);
  return [...files];
}

export function readFlakyList(file) {
  if (!file || !existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [path, command] = l.split(/\s+::\s+/);
      return { path: path.trim(), command: command?.trim() || null };
    });
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message === "help" ? USAGE : `${err.message}\n${USAGE}`);
    return 2;
  }
  const repo = resolve(opts.positional[0]);
  const base = opts.positional[1];
  const logDir = opts.log ? resolve(opts.log) : mkdtempSync(join(tmpdir(), `verify-brief-${basename(repo)}-`));
  mkdirSync(logDir, { recursive: true });

  const run = (name, cmd) => {
    const r = spawnSync("bash", ["-c", cmd], {
      cwd: repo,
      encoding: "utf8",
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, FORCE_COLOR: "0", CI: process.env.CI ?? "1" },
    });
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    writeFileSync(join(logDir, `${name.replace(/[^\w.-]+/g, "_")}.log`), `$ ${cmd}\n${out}`);
    return { code: r.status ?? 1, out };
  };
  const git = (args) => {
    const r = spawnSync("git", args, { cwd: repo, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
    return { code: r.status ?? 1, out: r.stdout ?? "", err: r.stderr ?? "" };
  };

  if (!existsSync(repo) || git(["rev-parse", "--git-dir"]).code !== 0) {
    console.error(`not a git checkout: ${repo}`);
    return 2;
  }
  if (git(["rev-parse", "--verify", "--quiet", `${base}^{commit}`]).code !== 0) {
    console.error(`unknown base: ${base}`);
    return 2;
  }

  let failed = false;
  const line = (status, name, note = "") => {
    if (status !== 0 && status !== "skip") failed = true;
    console.log(`${String(status).padStart(4)}  ${name.padEnd(14)} ${note}`.trimEnd());
  };

  const pkgFile = join(repo, "package.json");
  const pkg = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile, "utf8")) : null;
  const scripts = pkg?.scripts ?? {};
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  const flaky = readFlakyList(opts.flaky ? resolve(opts.flaky) : join(repo, ".flaky-tests"));
  const head = git(["rev-parse", "--short", "HEAD"]).out.trim();
  console.log(`verify-brief ${basename(repo)} ${base}..${head}`);

  // 1. The check gate.
  const gates = opts.gates.length
    ? opts.gates.map((cmd, i) => [`gate${opts.gates.length > 1 ? i + 1 : ""}`, cmd])
    : scripts.check
      ? [["check", "npm run check"]]
      : [
          ...(scripts.typecheck ? [["typecheck", "npm run typecheck"]] : []),
          ...(scripts.test ? [["test", "npm test"]] : []),
        ];
  if (!gates.length) line("skip", "gate", "no check, typecheck or test script; pass --gate");
  for (const [name, cmd] of gates) {
    const r = run(name, cmd);
    if (r.code === 0) {
      line(0, name, cmd);
      continue;
    }
    const failing = failingTestFiles(r.out);
    const listed = (f) => flaky.find((x) => f === x.path || f.endsWith(`/${x.path}`) || x.path.endsWith(`/${f}`));
    if (failing.length && failing.every(listed)) {
      const results = failing.map((f) => {
        const entry = listed(f);
        const alone =
          entry.command ??
          (deps.vitest ? `npx vitest run ${entry.path}` : deps.jest ? `npx jest ${entry.path}` : `node --test ${entry.path}`);
        return { f: entry.path, code: run(`${name}-flaky-${basename(entry.path)}`, alone).code };
      });
      const bad = results.filter((x) => x.code !== 0);
      if (!bad.length) line(0, name, `${cmd} (exit ${r.code}; flaky, passed alone: ${results.map((x) => x.f).join(", ")})`);
      else line(r.code, name, `${cmd} (flaky re-run failed: ${bad.map((x) => x.f).join(", ")})`);
    } else {
      const named = failing.length ? `; failing: ${failing.slice(0, 3).join(", ")}${failing.length > 3 ? ", ..." : ""}` : "";
      line(r.code, name, `${cmd}${named}`);
    }
  }

  // 2. The house-style sync and the formatter.
  if (scripts["house-style:sync"]) {
    const r = run("sync", "npm run house-style:sync -- --check");
    line(r.code, "sync --check", "npm run house-style:sync -- --check");
  } else line("skip", "sync --check", "no house-style:sync script");
  if (scripts["format:check"]) {
    const r = run("format", "npm run format:check");
    line(r.code, "format:check", "npm run format:check");
  } else line("skip", "format:check", "no format:check script");

  // 3. The tree.
  const status = git(["status", "--porcelain"]).out.split("\n").filter(Boolean);
  line(status.length ? 1 : 0, "git status", status.length ? `${status.length} changed or untracked: ${status.slice(0, 3).map((s) => s.slice(3)).join(", ")}` : "clean");
  const tracked = git(["ls-files"]).out.split("\n").filter(Boolean);
  const envName = /^\.env($|[.\-_]|rc$)/;
  const envOk = /^\.env\.(example|sample|template)$/;
  const bad = tracked.filter((f) => /(^|\/)node_modules\//.test(f) || (envName.test(basename(f)) && !envOk.test(basename(f))));
  line(bad.length ? 1 : 0, "tracked", bad.length ? `node_modules or .env tracked: ${bad.slice(0, 3).join(", ")}` : "no node_modules or .env tracked");

  // 4. What the diff adds.
  const pats = denyPatterns();
  const hits = [];
  let file = "";
  let lineNo = 0;
  for (const l of git(["diff", "-U0", "--no-color", "--no-ext-diff", `${base}..HEAD`]).out.split("\n")) {
    if (l.startsWith("+++ ")) file = l.replace(/^\+\+\+ (b\/)?/, "");
    else if (l.startsWith("@@")) lineNo = Number(/\+(\d+)/.exec(l)?.[1] ?? 0);
    else if (l.startsWith("+")) {
      const hit = pats.find((p) => p.re.test(l.slice(1)));
      if (hit) hits.push(`${file}:${lineNo} (${hit.name})`);
      lineNo++;
    }
  }
  line(hits.length ? 1 : 0, "diff grep", hits.length ? `${hits.length} added line(s): ${hits.slice(0, 3).join(", ")}` : "no machine path, username or denied word added");

  // 5. Paths that must stay untouched.
  if (opts.untouched.length) {
    const changed = git(["diff", "--name-only", `${base}..HEAD`]).out.split("\n").filter(Boolean);
    const res = opts.untouched.map(globToRegExp);
    const touched = changed.filter((f) => res.some((re) => re.test(f)));
    line(touched.length ? 1 : 0, "untouched", touched.length ? `touched: ${touched.slice(0, 3).join(", ")}` : `${opts.untouched.join(" ")} untouched`);
  } else line("skip", "untouched", "no --untouched globs");

  // 6. npm audit, high and above.
  if (!opts.audit) line("skip", "npm audit", "--no-audit");
  else if (!existsSync(join(repo, "package-lock.json"))) line("skip", "npm audit", "no package-lock.json");
  else {
    const r = run("audit", "npm audit --omit=dev --json");
    let counts = null;
    try {
      counts = JSON.parse(r.out.slice(r.out.indexOf("{"))).metadata?.vulnerabilities ?? null;
    } catch {}
    if (!counts) line("skip", "npm audit", `no report (exit ${r.code}; offline?)`);
    else {
      const n = (counts.high ?? 0) + (counts.critical ?? 0);
      line(n ? 1 : 0, "npm audit", `${n} high or critical (--omit=dev)`);
    }
  }

  console.log(`${failed ? "FAIL" : "PASS"}  logs: ${logDir}`);
  return failed ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("verify-brief.mjs")) process.exit(main());
