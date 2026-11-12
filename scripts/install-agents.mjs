#!/usr/bin/env node
// install-agents.mjs - copies the workflow agents and their guard hook into
// the user's Claude Code folder, where their frontmatter hooks run.
//
//   node scripts/install-agents.mjs [--dry-run] [--target <dir>] [--force]
//
// Claude Code ignores `hooks` in a plugin agent's frontmatter, so the plugin
// copies (personal-skills:brief-builder and the rest) run unguarded. This
// script writes user-level copies instead:
//
//   <target>/hooks/personal-skills/agent-guard.mjs   the guard, copied as is
//   <target>/agents/<name>.md                        each agent, its hook
//                                                    command naming the
//                                                    guard's absolute path
//
// <target> defaults to the .claude folder in the home folder. The guard
// sits outside agents/, because Claude Code reads that folder recursively.
// Re-running is safe: an unchanged file is left alone. A file this script
// didn't write is never replaced without --force. Zero dependencies.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WORKFLOW_AGENTS = ["brief-builder", "screen-capturer", "brief-auditor", "owner-steps"];
const PLACEHOLDER = "${CLAUDE_PLUGIN_ROOT}/hooks/agent-guard.mjs";
const STAMP = "# Installed by personal-skills scripts/install-agents.mjs. Edit the library's copy and re-run it.";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const opts = { dryRun: false, force: false, target: join(homedir(), ".claude") };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") opts.dryRun = true;
    else if (argv[i] === "--force") opts.force = true;
    else if (argv[i] === "--target" && argv[i + 1]) opts.target = resolve(argv[++i]);
    else throw new Error(`unknown argument ${argv[i]}`);
  }
  return opts;
}

/** The agent file as installed: the stamp after the opening ---, the guard's absolute path. */
export function installedText(source, guardPath) {
  if (!source.startsWith("---\n")) throw new Error("no frontmatter");
  if (!source.includes(PLACEHOLDER)) throw new Error(`no ${PLACEHOLDER} to rewrite`);
  // The path lands inside a double-quoted shell word in a single-quoted YAML string.
  if (/["'$`\\]/.test(guardPath)) throw new Error(`the guard's path can't hold quotes, $, backticks or backslashes: ${guardPath}`);
  return `---\n${STAMP}\n${source.slice(4).split(PLACEHOLDER).join(guardPath)}`;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`${err.message}\nusage: node scripts/install-agents.mjs [--dry-run] [--target <dir>] [--force]`);
    return 2;
  }
  const guardSrc = join(root, "hooks", "agent-guard.mjs");
  const guardDst = join(opts.target, "hooks", "personal-skills", "agent-guard.mjs");
  const plan = [];

  const guardText = readFileSync(guardSrc, "utf8");
  const guardNow = existsSync(guardDst) ? readFileSync(guardDst, "utf8") : null;
  plan.push({ action: guardNow === null ? "write" : guardNow === guardText ? "same" : "update", path: guardDst, copy: guardSrc });

  for (const name of WORKFLOW_AGENTS) {
    const dst = join(opts.target, "agents", `${name}.md`);
    const text = installedText(readFileSync(join(root, "agents", `${name}.md`), "utf8"), guardDst);
    const now = existsSync(dst) ? readFileSync(dst, "utf8") : null;
    let action = now === null ? "write" : now === text ? "same" : "update";
    if (action === "update" && !now.includes(STAMP) && !opts.force) action = "keep";
    plan.push({ action, path: dst, text });
  }

  for (const p of plan) {
    const note = p.action === "keep" ? "  (not written by this script; --force replaces it)" : "";
    console.log(`${opts.dryRun ? "dry-run " : ""}${p.action.padEnd(6)} ${p.path}${note}`);
    if (opts.dryRun || p.action === "same" || p.action === "keep") continue;
    mkdirSync(dirname(p.path), { recursive: true });
    if (p.copy) copyFileSync(p.copy, p.path);
    else writeFileSync(p.path, p.text);
  }
  const kept = plan.filter((p) => p.action === "keep").length;
  if (!opts.dryRun) console.log("New sessions pick the agents up; a running session doesn't.");
  return kept ? 1 : 0;
}

if (process.argv[1]?.endsWith("install-agents.mjs")) process.exit(main());
