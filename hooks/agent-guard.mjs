#!/usr/bin/env node
// agent-guard.mjs - the PreToolUse hook of the workflow agents. It turns the
// builders' hard rules into blocks a prompt can't talk its way past.
//
//   node agent-guard.mjs <mode>     (Claude Code sends the event on stdin)
//
// Modes:
//   builder      no git push, no --no-verify (or git commit -n), no pkill,
//                killall or pgrep -f, no docker builds, no .env file read or
//                written, and kill <pid> only for a process whose working
//                folder sits under a folder this agent worked in
//   capturer     the builder's rules, no git command that changes a
//                checkout, and the Write tool only inside a folder marked
//                with .screen-capturer-out that is outside any git checkout
//   audit        Bash is read only: an allowlist of commands, no redirect
//                into a file, and the read-only brief-board verbs
//   owner-steps  audit's rules, plus the read-only `node cli.ts` verbs
//
// A block exits 2 with the reason on stderr, which Claude Code shows the
// agent. Anything else exits 0. Self-contained (no sibling imports), so the
// installer copies this one file. Zero dependencies.
//
// The kill gate keeps, per agent, the folders it has worked in: the git
// checkout (or, outside one, the folder) of each `cd`, `git -C`, `--prefix`
// and `mkdir` target, and of each file it edits or writes. Broad folders
// (the home or temp folder, their direct children, a folder of checkouts)
// are never kept. The list lives in <temp>/agent-guard/<agent id>.roots, or
// under AGENT_GUARD_STATE when that is set.
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";

// ---------------------------------------------------------------- shell reader

/**
 * Splits a bash command into simple commands, nested ones included ($(...),
 * backticks, <(...)). Each is { words, dyn, redirects }: the words with
 * their quotes removed, which of them came from an expansion, and the
 * redirects with their targets. Heredoc bodies are skipped, never read as
 * commands.
 */
export function parseShell(src) {
  const out = [];
  lex(src, 0, null, out);
  return out;
}

function lex(src, start, term, out) {
  let i = start;
  let cmd = { words: [], dyn: [], redirects: [] };
  let word = null;
  let dynamic = false;
  let pending = null;
  let depth = 0;
  const heredocs = [];

  const add = (s) => {
    word = (word ?? "") + s;
  };
  const endWord = () => {
    if (word === null) return;
    if (pending) {
      if (pending === "<<" || pending === "<<-") heredocs.push({ delim: word, strip: pending === "<<-" });
      cmd.redirects.push({ op: pending, target: word });
      pending = null;
    } else {
      cmd.words.push(word);
      cmd.dyn.push(dynamic);
    }
    word = null;
    dynamic = false;
  };
  const endCmd = () => {
    endWord();
    if (cmd.words.length || cmd.redirects.length) out.push(cmd);
    cmd = { words: [], dyn: [], redirects: [] };
  };
  const skipHeredocs = (k) => {
    for (const h of heredocs.splice(0)) {
      while (k < src.length) {
        const nl = src.indexOf("\n", k);
        const end = nl < 0 ? src.length : nl;
        const line = src.slice(k, end);
        k = end + 1;
        if ((h.strip ? line.replace(/^\t+/, "") : line) === h.delim) break;
      }
    }
    return Math.min(k, src.length);
  };
  const dollar = (k) => {
    const n = src[k + 1];
    dynamic = true;
    if (n === "(" && src[k + 2] === "(") {
      let d = 0;
      let j = k + 1;
      for (; j < src.length; j++) {
        if (src[j] === "(") d++;
        else if (src[j] === ")" && --d === 0) break;
      }
      add("$((...))");
      return j + 1;
    }
    if (n === "(") {
      const j = lex(src, k + 2, ")", out);
      add("$(...)");
      return j;
    }
    if (n === "{") {
      const j = src.indexOf("}", k);
      const end = j < 0 ? src.length : j + 1;
      add(src.slice(k, end));
      return end;
    }
    if (n === "'") {
      dynamic = false;
      const j = src.indexOf("'", k + 2);
      const end = j < 0 ? src.length : j;
      add(src.slice(k + 2, end));
      return end + 1;
    }
    const m = /^[A-Za-z_][A-Za-z0-9_]*|^[0-9?$!#*@-]/.exec(src.slice(k + 1));
    if (m) {
      add(`$${m[0]}`);
      return k + 1 + m[0].length;
    }
    dynamic = false;
    add("$");
    return k + 1;
  };
  const double = (k) => {
    if (word === null) word = "";
    while (k < src.length && src[k] !== '"') {
      const c = src[k];
      if (c === "\\" && '$`"\\\n'.includes(src[k + 1] ?? "")) {
        if (src[k + 1] !== "\n") add(src[k + 1]);
        k += 2;
      } else if (c === "$") k = dollar(k);
      else if (c === "`") {
        k = lex(src, k + 1, "`", out);
        add("$(...)");
        dynamic = true;
      } else {
        add(c);
        k++;
      }
    }
    return k + 1;
  };

  while (i < src.length) {
    const c = src[i];
    if (term === ")" && c === ")" && depth === 0) {
      endCmd();
      return i + 1;
    }
    if (term === "`" && c === "`") {
      endCmd();
      return i + 1;
    }
    if (c === "\\") {
      if (src[i + 1] !== "\n") add(src[i + 1] ?? "");
      i += 2;
    } else if (c === "'") {
      const j = src.indexOf("'", i + 1);
      const end = j < 0 ? src.length : j;
      add(src.slice(i + 1, end));
      i = end + 1;
    } else if (c === '"') i = double(i + 1);
    else if (c === "$") i = dollar(i);
    else if (c === "`") {
      i = lex(src, i + 1, "`", out);
      add("$(...)");
      dynamic = true;
    } else if (c === "#" && word === null) {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === " " || c === "\t") {
      endWord();
      i++;
    } else if (c === "\n") {
      endCmd();
      i = skipHeredocs(i + 1);
    } else if (c === "&" && src[i + 1] === ">") {
      endWord();
      pending = src[i + 2] === ">" ? "&>>" : "&>";
      i += pending.length;
    } else if (c === ";" || c === "|" || c === "&") {
      endCmd();
      i += src[i + 1] === c || (c === "|" && src[i + 1] === "&") || (c === ";" && src[i + 1] === "&") ? 2 : 1;
    } else if (c === "(" && word === null) {
      endCmd();
      depth++;
      i++;
    } else if (c === ")") {
      if (depth > 0) depth--;
      endCmd();
      i++;
    } else if ((c === "<" || c === ">") && src[i + 1] === "(") {
      endWord();
      i = lex(src, i + 2, ")", out);
    } else if (c === "<" || c === ">") {
      if (word !== null && /^\d+$/.test(word) && !dynamic) word = null;
      else endWord();
      const ahead = src.slice(i, i + 3);
      const op =
        ["<<<", "<<-", "<<", ">>", ">|", ">&", "<&", "<>"].find((o) => ahead.startsWith(o)) ?? c;
      pending = op;
      i += op.length;
    } else {
      add(c);
      i++;
    }
  }
  endCmd();
  return i;
}

// ------------------------------------------------------------ command shapes

const KEYWORDS = new Set(["!", "{", "}", "if", "then", "else", "elif", "fi", "do", "done", "while", "until", "esac", "coproc"]);
const SHELLS = new Set(["bash", "sh", "zsh", "dash", "ksh"]);
const ASSIGN = /^[A-Za-z_][A-Za-z0-9_]*=/;

/**
 * The commands a bash line runs, wrappers (sudo, env, timeout, nohup,
 * xargs ...) peeled off and `bash -c`, `sh -c` and `eval` strings read as
 * commands too. Each is { prog, argv, dyn, redirects, viaXargs }.
 */
export function commandsOf(src, seen = 0) {
  const result = [];
  for (const raw of parseShell(src)) {
    let argv = [...raw.words];
    let dyn = [...raw.dyn];
    let viaXargs = false;
    const shift = (n = 1) => {
      argv = argv.slice(n);
      dyn = dyn.slice(n);
    };
    for (let guard = 0; guard < 20 && argv.length; guard++) {
      const head = argv[0];
      const prog = basename(head);
      if (KEYWORDS.has(head) || head === "time") shift();
      else if (ASSIGN.test(head)) shift();
      else if (prog === "sudo") {
        shift();
        while (argv[0]?.startsWith("-")) shift(["-u", "-g", "-C", "-h", "-p", "-U"].includes(argv[0]) ? 2 : 1);
      } else if (prog === "env") {
        shift();
        while (argv.length && (argv[0].startsWith("-") || ASSIGN.test(argv[0]))) {
          if ((argv[0] === "-S" || argv[0] === "--split-string") && argv[1] && seen < 5) {
            result.push(...commandsOf(argv[1], seen + 1));
            shift(2);
          } else shift(["-u", "-C", "--unset", "--chdir"].includes(argv[0]) ? 2 : 1);
        }
      } else if (["nohup", "command", "builtin", "setsid", "exec"].includes(prog)) {
        shift();
        while (argv[0]?.startsWith("-")) shift(argv[0] === "-a" ? 2 : 1);
      } else if (prog === "nice" || prog === "ionice") {
        shift();
        while (argv[0]?.startsWith("-")) shift(["-n", "-c", "-p"].includes(argv[0]) ? 2 : 1);
      } else if (prog === "timeout") {
        shift();
        while (argv[0]?.startsWith("-")) shift(["-s", "-k", "--signal", "--kill-after"].includes(argv[0]) ? 2 : 1);
        shift();
      } else if (prog === "stdbuf") {
        shift();
        while (argv[0]?.startsWith("-")) shift();
      } else if (prog === "xargs") {
        viaXargs = true;
        shift();
        while (argv[0]?.startsWith("-")) shift(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a"].includes(argv[0]) ? 2 : 1);
      } else if (SHELLS.has(prog) && seen < 5) {
        const flag = argv.findIndex((a, k) => k > 0 && /^-[a-zA-Z]*c[a-zA-Z]*$/.test(a));
        if (flag > 0 && argv[flag + 1] !== undefined) result.push(...commandsOf(argv[flag + 1], seen + 1));
        break;
      } else if (prog === "eval" && seen < 5) {
        result.push(...commandsOf(argv.slice(1).join(" "), seen + 1));
        argv = [];
      } else break;
    }
    if (!argv.length && !raw.redirects.length) continue;
    result.push({ prog: argv.length ? basename(argv[0]) : "", argv, dyn, redirects: raw.redirects, viaXargs });
  }
  return result;
}

/** git's subcommand after its global options, and the words after it. */
export function gitSub(argv) {
  let k = 1;
  while (k < argv.length && argv[k].startsWith("-")) {
    const a = argv[k];
    k += ["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path", "--config-env"].includes(a) ? 2 : 1;
  }
  return { sub: argv[k] ?? "", rest: argv.slice(k + 1), globals: argv.slice(1, k) };
}

const ENV_BASE = /^\.env($|[.\-_*?[]|rc$)/;
const ENV_OK = /^\.env\.(example|sample|template)$/;

/** True when a word names a .env file (not .env.example, not process.env). */
export function isEnvPath(word) {
  if (typeof word !== "string" || !word) return false;
  const candidates = [word, ...word.split(/[=:,]/).slice(1)];
  return candidates.some((c) => {
    if (/\s/.test(c)) return false;
    const base = c.split("/").pop();
    return ENV_BASE.test(base) && !ENV_OK.test(base);
  });
}

// ------------------------------------------------------------------- rules

const NO_ENV = "never read, copy, print or edit a .env file; name a variable by its file and key instead";
const GIT_CHANGES_CHECKOUT = new Set([
  "commit", "push", "add", "rm", "mv", "checkout", "switch", "restore", "reset", "stash", "clean", "merge",
  "rebase", "cherry-pick", "revert", "am", "apply", "tag", "branch", "pull", "worktree", "update-index", "notes",
]);

function commitSkipsHooks(rest) {
  for (const a of rest) {
    if (a === "--") return false;
    if (a === "-n") return true;
    if (/^-[a-zA-Z]{2,}$/.test(a)) {
      for (const ch of a.slice(1)) {
        if ("mFCcSt".includes(ch)) break;
        if (ch === "n") return true;
      }
    }
  }
  return false;
}

function builderRule(c, ctx) {
  const { prog, argv } = c;
  if (argv.includes("--no-verify")) return "--no-verify skips the repo's hooks; fix what the hook reports instead";
  if (prog === "git") {
    const { sub, rest } = gitSub(argv);
    if (sub === "push") return "git push is the controller's job: commit locally and report the commits";
    if (sub === "commit" && commitSkipsHooks(rest)) return "git commit -n skips the repo's hooks; fix what the hook reports instead";
    if (ctx.mode === "capturer" && GIT_CHANGES_CHECKOUT.has(sub))
      return `git ${sub} changes a checkout; a capture leaves every repo exactly as it found it`;
  }
  if (prog === "pkill" || prog === "killall")
    return `${prog} matches other agents' processes too; stop only the PIDs you saved, with kill <pid>`;
  if (prog === "pgrep" && argv.slice(1).some((a) => a === "--full" || /^-[a-zA-Z]*f/.test(a)))
    return "pgrep -f matches the calling shell and other agents' commands; use the PID you saved when you started the process";
  if (prog === "fuser" && argv.slice(1).some((a) => /^-[a-zA-Z]*k/.test(a)))
    return "fuser -k kills by port or file, which can hit another agent's process; stop only the PIDs you saved";
  if (["docker", "docker-compose", "podman", "podman-compose"].includes(prog)) {
    if (argv.slice(1).some((a) => a === "build" || a === "buildx" || a === "--build" || a.startsWith("--build=")))
      return "no docker builds on this machine (local Docker fails with an I/O error, and builds load the machine)";
  }
  if (prog === "buildah") return "no container builds on this machine";
  if (prog === "kill") return killRule(c, ctx);
  return null;
}

function killRule(c, ctx) {
  const args = c.argv.slice(1);
  const targets = [];
  let signalSeen = false;
  let probe = false;
  let rest = false;
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (!rest) {
      if (a === "--") {
        rest = true;
        continue;
      }
      if (["-l", "-L", "--list", "--table"].includes(a)) return null;
      if (["-s", "-n", "--signal"].includes(a)) {
        if (args[k + 1] === "0") probe = true;
        signalSeen = true;
        k++;
        continue;
      }
      if (!signalSeen && /^-/.test(a)) {
        signalSeen = true;
        if (/^-(0|SIG0|-signal=0)$/.test(a)) probe = true;
        continue;
      }
    }
    targets.push({ text: a, dyn: c.dyn[k + 1] });
  }
  if (probe) return null;
  if (c.viaXargs) return "kill through xargs can't be checked; kill one literal PID you saved";
  for (const t of targets) {
    if (t.text.startsWith("%")) continue;
    if (t.dyn || !/^-?\d+$/.test(t.text))
      return `kill needs a literal PID it can check ("${t.text}" isn't one): read your saved PID first, then kill <pid>`;
    const pid = Math.abs(Number(t.text));
    if (pid <= 1) return "kill 0, 1 or -1 signals far more than your own process";
    const cwd = procCwd(pid);
    if (cwd === null) continue;
    if (cwd === "denied") return `process ${pid} belongs to someone else; leave it alone`;
    const roots = ctx.roots();
    if (!roots.some((r) => under(cwd, r)))
      return `process ${pid} runs in ${cwd}, outside every folder you have worked in this run (${roots.length ? roots.join(", ") : "none yet"}); it may be another agent's. Stop only the PIDs you started`;
  }
  return null;
}

function procCwd(pid) {
  try {
    return readlinkSync(`/proc/${pid}/cwd`);
  } catch (err) {
    return err?.code === "EACCES" || err?.code === "EPERM" ? "denied" : null;
  }
}

const real = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
};
const under = (p, root) => {
  const a = real(p);
  const b = real(root);
  return a === b || a.startsWith(b.endsWith(sep) ? b : b + sep);
};

// Read-only Bash, for the auditor and the owner-steps compiler.
const RO_PROGS = new Set([
  "cat", "head", "tail", "wc", "ls", "find", "grep", "egrep", "fgrep", "rg", "sed", "awk", "sort", "uniq", "cut",
  "tr", "diff", "cmp", "file", "stat", "jq", "readlink", "realpath", "basename", "dirname", "echo", "printf",
  "test", "[", "[[", "true", "false", "pwd", "du", "tree", "column", "nl", "comm", "od", "xxd", "md5sum",
  "sha1sum", "sha256sum", "date", "which", "type", "cd", "uname", "nproc", "free", "uptime", "ps", "ss", "read",
  "set", "shopt", "export", "local", "shift", "exit", "return", "break", "continue", ":", "for", "case", "select",
  "git", "npm", "brief-board", "node",
]);
const RO_GIT = new Set([
  "show", "diff", "log", "status", "ls-files", "ls-tree", "blame", "rev-parse", "rev-list", "grep", "cat-file",
  "describe", "shortlog", "merge-base", "name-rev", "show-ref", "for-each-ref", "whatchanged", "count-objects",
  "branch", "tag", "config", "remote", "stash", "worktree", "reflog", "--version", "help",
]);
const RO_BOARD = new Set(["show", "list", "guide", "needs", "questions", "runs", "blocked", "sprint", "help", "--help", "-h"]);
const RO_CLI = new Set(["versions", "status", "history", "--list", "--graph", "--check", "--help", "-h"]);
const WRITE_REDIRECT = new Set([">", ">>", ">|", "&>", "&>>", "<>"]);

function readOnlyRule(c, ctx) {
  for (const r of c.redirects)
    if (WRITE_REDIRECT.has(r.op) && r.target !== "/dev/null")
      return `read only: no redirect into a file (${r.op} ${r.target})`;
  const { prog, argv } = c;
  if (!prog) return null;
  if (!RO_PROGS.has(prog)) return `read only: "${prog}" is not on this agent's list of read-only commands`;
  const args = argv.slice(1);
  if (prog === "find" && args.some((a) => /^-(delete|exec|execdir|ok|okdir|fprint0?|fprintf|fls)$/.test(a)))
    return "read only: find may not delete or run commands";
  if (prog === "sed" && args.some((a) => a.startsWith("--in-place") || /^-[a-zA-Z]*i/.test(a)))
    return "read only: no sed -i";
  if (prog === "sort" && args.some((a) => a === "-o" || a.startsWith("--output")))
    return "read only: no sort -o";
  if (prog === "git") return gitReadOnly(argv);
  if (prog === "npm") {
    const verb = args.find((a) => !a.startsWith("-"));
    if (args.includes("--version") || args.includes("-v")) return null;
    if (!["ls", "list", "view", "info", "show", "outdated", "audit", "explain", "why", "help"].includes(verb))
      return `read only: npm ${verb ?? ""} isn't a read-only npm command`;
    if (verb === "audit" && args.includes("fix")) return "read only: no npm audit fix";
    return null;
  }
  if (prog === "brief-board") {
    let verb;
    for (let k = 0; k < args.length && verb === undefined; k++) {
      if (args[k] === "--author" || args[k] === "-m") k++;
      else if (!args[k].startsWith("-") || RO_BOARD.has(args[k])) verb = args[k];
    }
    if (!RO_BOARD.has(verb)) return `read only: brief-board ${verb ?? ""} changes the board; only show, list, guide, needs, questions, runs, blocked and sprint`;
    if (verb === "sprint" && args.includes("start")) return "read only: never brief-board sprint start";
    return null;
  }
  if (prog === "node") {
    if (args.length === 1 && (args[0] === "--version" || args[0] === "-v")) return null;
    if (ctx.mode !== "owner-steps") return "read only: no node scripts";
    if (basename(args[0] ?? "") !== "cli.ts") return "read only: node runs only vps-deploy's cli.ts, with a read-only verb";
    const verb = args[1];
    if (RO_CLI.has(verb)) return null;
    if ((verb === "lock" || verb === "maintenance") && args.length === 2) return null;
    return `read only: node cli.ts ${verb ?? ""} isn't a read-only verb (versions, status, history, --list, --graph, --check, lock, maintenance)`;
  }
  return null;
}

function gitReadOnly(argv) {
  const { sub, rest } = gitSub(argv);
  if (!RO_GIT.has(sub)) return `read only: git ${sub} isn't a read-only git command`;
  if (rest.some((a) => a.startsWith("--output"))) return "read only: no git --output";
  const positional = (valueFlags) => {
    const out = [];
    for (let k = 0; k < rest.length; k++) {
      if (valueFlags.includes(rest[k])) k++;
      else if (!rest[k].startsWith("-")) out.push(rest[k]);
    }
    return out;
  };
  if (sub === "branch" || sub === "tag") {
    const writes = ["-d", "-D", "--delete", "-m", "-M", "--move", "-c", "-C", "--copy", "-f", "--force", "-u", "--unset-upstream", "--edit-description", "-a", "-s", "--annotate", "--sign", "-F", "-t", "--track"];
    if (rest.some((a) => writes.includes(a) || a.startsWith("--set-upstream-to")))
      return `read only: git ${sub} may only list`;
    const listing = rest.includes("--list") || rest.includes("-l");
    if (!listing && positional(["--contains", "--no-contains", "--merged", "--no-merged", "--points-at", "--sort", "--format"]).length)
      return `read only: git ${sub} <name> creates one; add --list to list`;
  }
  if (sub === "config" && !rest.some((a) => ["--get", "--get-all", "--get-regexp", "--list", "-l"].includes(a)))
    return "read only: git config only with --get, --get-all, --get-regexp or --list";
  if (sub === "remote" && rest.length && !["-v", "--verbose", "show", "get-url"].includes(rest[0]))
    return "read only: git remote only lists";
  if (sub === "stash" && !["list", "show"].includes(rest[0])) return "read only: git stash list or show only";
  if (sub === "worktree" && rest[0] !== "list") return "read only: git worktree list only";
  if (sub === "reflog" && rest[0] && !rest[0].startsWith("-") && rest[0] !== "show") return "read only: git reflog show only";
  return null;
}

// ------------------------------------------------------- roots (kill gate)

function stateFile(event) {
  const dir = process.env.AGENT_GUARD_STATE || join(tmpdir(), "agent-guard");
  const key = String(event.agent_id || event.session_id || "main").replace(/[^\w.-]/g, "_");
  return join(dir, `${key}.roots`);
}

function gitTop(dir) {
  let d = resolve(dir);
  for (;;) {
    if (existsSync(join(d, ".git"))) return d;
    const parent = dirname(d);
    if (parent === d) return null;
    d = parent;
  }
}

function tooBroad(dir) {
  const d = real(dir);
  for (const wide of [homedir(), tmpdir()].map(real)) {
    if (d === wide || wide.startsWith(d.endsWith(sep) ? d : d + sep)) return true;
    if (dirname(d) === wide) return true;
  }
  try {
    return readdirSync(d, { withFileTypes: true }).some((e) => e.isDirectory() && existsSync(join(d, e.name, ".git")));
  } catch {
    return false;
  }
}

function rootFor(dir) {
  const top = gitTop(dir);
  if (top) return tooBroad(top) ? null : top;
  return tooBroad(dir) ? null : resolve(dir);
}

function rootsTouched(event, commands) {
  const found = [];
  let here = event.cwd || process.cwd();
  for (const c of commands) {
    const { prog, argv } = c;
    const args = argv.slice(1);
    if ((prog === "cd" || prog === "pushd") && !c.dyn[1]) {
      const target = args.find((a) => !a.startsWith("-"));
      here = resolve(here, target ?? homedir());
      found.push(here);
    }
    if (prog === "git") {
      for (let k = 1; k < argv.length - 1; k++) if (argv[k] === "-C") found.push(resolve(here, argv[k + 1]));
    }
    if (["npm", "pnpm", "yarn"].includes(prog)) {
      for (let k = 1; k < argv.length - 1; k++) if (argv[k] === "--prefix" || argv[k] === "-C") found.push(resolve(here, argv[k + 1]));
    }
    if (prog === "mkdir") for (const a of args) if (!a.startsWith("-")) found.push(resolve(here, a));
  }
  return found;
}

function remember(event, dirs) {
  const roots = [...new Set(dirs.map(rootFor).filter(Boolean))];
  if (!roots.length) return;
  const file = stateFile(event);
  try {
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, roots.map((r) => `${r}\n`).join(""));
  } catch {}
}

function recalled(event) {
  try {
    return [...new Set(readFileSync(stateFile(event), "utf8").split("\n").filter(Boolean))];
  } catch {
    return [];
  }
}

// ------------------------------------------------------- the capturer's fence

export const CAPTURE_MARKER = ".screen-capturer-out";

function captureWriteRule(file, cwd) {
  const target = resolve(cwd || process.cwd(), file);
  let marked = null;
  let d = dirname(target);
  for (;;) {
    if (existsSync(join(d, ".git"))) return `the capturer writes nothing inside a git checkout (${d})`;
    if (!marked && existsSync(join(d, CAPTURE_MARKER))) marked = d;
    const parent = dirname(d);
    if (parent === d) break;
    d = parent;
  }
  if (!marked)
    return `write only inside the output or scratch folder the caller named; it is marked with a ${CAPTURE_MARKER} file (${target} isn't)`;
  return null;
}

// --------------------------------------------------------------------- main

const MODES = new Set(["builder", "capturer", "audit", "owner-steps"]);

/** The reason to block this event, or null to let it run. */
export function decide(mode, event) {
  if (!MODES.has(mode)) return null;
  const tool = event.tool_name;
  const input = event.tool_input ?? {};
  const writer = mode === "builder" || mode === "capturer";

  if (["Read", "Edit", "Write", "MultiEdit", "NotebookEdit", "Grep"].includes(tool)) {
    for (const p of [input.file_path, input.notebook_path, input.path, input.glob]) if (isEnvPath(p)) return NO_ENV;
  }
  if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
    const file = input.file_path ?? input.notebook_path;
    if (!writer) return "read only: this agent edits nothing";
    if (mode === "capturer" && file) {
      const why = captureWriteRule(file, event.cwd);
      if (why) return why;
    }
    if (file) remember(event, [dirname(resolve(event.cwd || process.cwd(), file))]);
    return null;
  }
  if (tool !== "Bash") return null;

  const command = String(input.command ?? "");
  let commands;
  try {
    commands = commandsOf(command);
  } catch {
    return writer ? null : "read only: the command couldn't be read; split it into simpler commands";
  }
  for (const c of commands) {
    if (c.argv.some(isEnvPath) || c.redirects.some((r) => !["<<", "<<-", "<<<"].includes(r.op) && isEnvPath(r.target)))
      return NO_ENV;
  }
  if (writer) remember(event, rootsTouched(event, commands));
  const ctx = { mode, roots: () => recalled(event) };
  for (const c of commands) {
    const why = writer ? builderRule(c, ctx) : readOnlyRule(c, ctx);
    if (why) return why;
  }
  return null;
}

async function main() {
  const mode = process.argv[2];
  let text = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) text += chunk;
  let event;
  try {
    event = JSON.parse(text);
  } catch {
    return 0;
  }
  if (!event || typeof event !== "object") return 0;
  const why = decide(mode, event);
  if (!why) return 0;
  process.stderr.write(`agent-guard (${mode}): blocked. ${why}.\n`);
  return 2;
}

if (process.argv[1] && basename(process.argv[1]) === "agent-guard.mjs") process.exitCode = await main();
