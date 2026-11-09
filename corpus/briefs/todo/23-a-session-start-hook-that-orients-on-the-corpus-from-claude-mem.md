# Task 23: A session-start hook that orients on the corpus (from thedotmack/claude-mem)

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed for ideas.
**thedotmack/claude-mem** was read at `ffab839` (2026-11-09, Apache-2.0).

It gives Claude Code memory across sessions:

- hooks send each tool call to a local worker;
- an observer agent turns the activity into short observations and a
  summary at the session's end;
- the next session starts with **a compact index of the observations that
  matter for this project, and fetches the full details only when it needs
  them**.

The store is SQLite plus Chroma, behind MCP search tools and a local
viewer.

The tool itself is the wrong fit here:

- It runs a local Bun worker, while the owner works largely in ephemeral
  claude.ai cloud containers.
- Its notes are automatic and unreviewed. This library's rule is the
  opposite: durable knowledge goes into the git-reviewed `corpus/`, not
  personal memory (the corpus-flow Conventions).

The mechanism is right, though. Today an agent learns about a repo's
corpus only if it reads `CLAUDE.md` and then chooses to open
`corpus/index.md`, and a `resume` checkpoint in `log.md` is found only if
someone looks. This plugin ships no hooks at all (`plugin.json` declares
skills, commands and agents).

## Owner decisions (defaults)

1. **What the hook injects.** Default, when `corpus/` exists in the working
   directory:
   - the `index.md` catalog block, which is already the generated
     one-line-per-page summary;
   - the latest `resume` entry from `log.md`, if it is newer than the last
     `done` entry;
   - the names of briefs in `briefs/todo/` and `briefs/blocked/`.

   A hard cap of about 2,000 characters keeps the retrieval budget. Nothing
   when there is no `corpus/`.
2. **Which events.** Default: `SessionStart`, including after `/clear` and
   compaction. Never on every prompt: superpowers' 7.0.2 notes measured
   prompt-cache rewrites from per-prompt injection.
3. **Language.** Default: a zero-dependency Node script. Node is in every
   environment here.

## Files you OWN

- `hooks/hooks.json` and `hooks/session-start.mjs` (new).
- `.claude-plugin/plugin.json`: the `hooks` entry.
- `skills/corpus-flow/SKILL.md`: a short note that the plugin's hook
  surfaces the index and the latest `resume`, so the retrieval budget still
  starts at `index.md`.
- `ATTRIBUTION.md` (Influences), `README.md`, `docs/history.md`, both plugin
  files, `corpus/`.

## Files you must NOT touch

- `corpus/lint.sh --index`, which stays the only writer of the catalog. The
  hook only reads it.

## What to do

1. Write `session-start.mjs`:
   - find `corpus/` at the git root or the working directory;
   - read the catalog block between `<!-- BEGIN CATALOG -->` and
     `<!-- END CATALOG -->`;
   - find the newest `## [date] resume` entry in `log.md` and compare it
     with the newest `done`;
   - list the brief file names;
   - print the hook's JSON with `additionalContext`, capped.

   Start no child processes. superpowers measured their cost on startup.
2. Register it in `hooks/hooks.json` for `SessionStart`. This is the
   schema in Claude Code's hooks docs, read 2026-11-09:
   - the plugin file is `hooks/hooks.json`, with an optional `description`
     and a `hooks` object keyed by event;
   - the command is `node "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.mjs"`;
   - SessionStart matchers are `startup`, `resume`, `clear`, `compact` and
     `fork`;
   - context goes in `{"hookSpecificOutput": {"hookEventName":
     "SessionStart", "additionalContext": "…"}}`, or plain stdout with exit
     0;
   - **`additionalContext` is capped at 10,000 characters**; beyond that,
     Claude gets only a path and a 2,000-character preview, so this brief's
     2,000 cap leaves room;
   - SessionStart can't block, and an exit 2 only shows stderr to the user.

   Brief 27's `Stop` and `PostToolUse` hooks go in the same file.
3. Test it with fixtures: no corpus (prints nothing), a corpus with no
   resume, a corpus with a stale resume (not injected), and an oversized
   catalog (capped).
4. Credit claude-mem's progressive-disclosure index in `ATTRIBUTION.md`
   (idea only), and bump the minor version.

## Acceptance

- `node --test hooks/` passes on the four fixtures.
- In a real session on a repo with a corpus (Shelfmark), the session starts
  with the catalog and the brief list in context. Check by asking the agent
  what the corpus holds without letting it read any file.
- In a repo without a corpus, nothing is injected.
- `bash corpus/lint.sh` passes, and the version is bumped.
