#!/usr/bin/env node
// session-start.mjs - a SessionStart hook. In a repo with a corpus/ it puts a
// small orientation in Claude's context: the generated catalog from
// corpus/index.md, the latest `resume` checkpoint from log.md when it is newer
// than the last `done` entry, and the names of the briefs in briefs/todo/ and
// briefs/blocked/. It reads only files under corpus/, starts no child process,
// and prints nothing when there is no corpus. The whole text is capped at
// MAX_CHARS so the retrieval budget (read index.md first) still holds.
// Idea from claude-mem's progressive-disclosure index; see ATTRIBUTION.md.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { readEvent } from "./repo.mjs";

export const MAX_CHARS = 2000;

const read = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

/** corpus/ at the working directory, or at the nearest folder above it with a .git. */
export function findCorpus(cwd) {
  let dir = resolve(cwd);
  const start = dir;
  for (;;) {
    if (dir === start && existsSync(join(dir, "corpus"))) return join(dir, "corpus");
    if (existsSync(join(dir, ".git"))) return existsSync(join(dir, "corpus")) ? join(dir, "corpus") : null;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

const clip = (text, n) => (text.length <= n ? text : text.slice(0, Math.max(0, n - 1)).trimEnd() + "…");

export function catalog(corpus) {
  const m = read(join(corpus, "index.md")).match(/<!-- BEGIN CATALOG -->([\s\S]*?)<!-- END CATALOG -->/);
  if (!m) return "";
  // One short line per page: the link text and the first sentence of its summary.
  return m[1]
    .trim()
    .split("\n")
    .map((line) => {
      const l = line.match(/^- \[([^\]]*)\]\([^)]*\)\s*[-:\u2013\u2014]?\s*(.*)$/);
      if (!l) return line;
      const first = l[2].match(/^.*?[.;](?=\s|$)/)?.[0] ?? l[2];
      return `- ${l[1]}: ${clip(first, 110)}`;
    })
    .join("\n");
}

/** The newest resume entry, if it comes after the last done entry (the log is newest last). */
export function latestResume(corpus) {
  const log = read(join(corpus, "log.md"));
  const heads = [...log.matchAll(/^## \[[^\]]*\]\s*(\w+)/gm)];
  let resume = -1;
  let done = -1;
  heads.forEach((h, i) => {
    if (h[1].toLowerCase() === "resume") resume = i;
    if (h[1].toLowerCase() === "done") done = i;
  });
  if (resume < 0 || resume < done) return "";
  const end = resume + 1 < heads.length ? heads[resume + 1].index : log.length;
  return log.slice(heads[resume].index, end).trim();
}

export function briefNames(corpus, folder) {
  try {
    return readdirSync(join(corpus, "briefs", folder))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export function build(corpus, max = MAX_CHARS) {
  const parts = ["Corpus orientation (read corpus/index.md first; open pages and briefs only when needed):"];
  const resume = latestResume(corpus);
  if (resume) parts.push(clip(resume, 500));
  for (const folder of ["todo", "blocked"]) {
    const names = briefNames(corpus, folder);
    if (!names.length) continue;
    const shown = names.slice(0, 15).join(", ");
    parts.push(`Briefs in ${folder}/ (${names.length}): ${shown}${names.length > 15 ? ", …" : ""}`);
  }
  const rest = parts.map((p) => clip(p, max)).join("\n\n");
  const cat = catalog(corpus);
  const room = max - rest.length - "\n\nCatalog:\n".length;
  const text = cat && room > 80 ? `${rest}\n\nCatalog:\n${clip(cat, room)}` : rest;
  return clip(text, max);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("session-start.mjs")) {
  try {
    const event = await readEvent();
    const corpus = findCorpus(event?.cwd || process.cwd());
    if (corpus) {
      const text = build(corpus);
      process.stdout.write(
        JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text } }) + "\n",
      );
    }
  } catch {
    // Never fail a session start over orientation text.
  }
  process.exit(0);
}
