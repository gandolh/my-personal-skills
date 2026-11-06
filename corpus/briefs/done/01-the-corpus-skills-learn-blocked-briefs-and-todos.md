# Task 01: The corpus skills learn blocked briefs and todos

## Context

On 2026-11-06 the owner asked for a separate category for briefs and todos
that can't go ahead until something outside the work happens, and for the
personal skills to take the new structure into account. The case that
prompted it was four vps-deploy todos that wait on hardware: SonarQube and
Bitwarden wait for a stronger machine, and Sonarr and qBittorrent wait for a
home machine that holds the media library. brief-board's brief 13 waits on a
date ("Not before 2026-11-18"), written as a bold line under its title,
because no folder says so. Today a waiting todo looks like any open todo, and
a waiting brief sits in `briefs/todo/`, where `plan-split-dispatch` puts it
in a wave.

brief-board's brief 14, "A blocked brief or todo waits in Backlog", is the
board's half: sync reads the new folders and shows each item in Backlog with
a "Blocked by" badge. This brief is the skills' half. Both briefs use one
convention and must keep it the same:

- A brief that waits lives in `corpus/briefs/blocked/<NN>-<slug>.md`. It
  keeps its number, and numbering counts all four folders (`todo/`,
  `blocked/`, `done/`, `superseded/`). Right under its H1 is a line
  `**Blocked by:** <condition>`.
- A todo that waits lives in `corpus/todos/blocked/<slug>.md`, with a
  `blocked-by: <condition>` key in its frontmatter.
- The condition is one short line that someone can check, worded so items
  waiting on the same thing match: "a stronger machine", "the home media
  machine", "2026-11-18". Reuse a condition already in the repo when it
  fits.
- To unblock, the file goes back with `git mv` (to `briefs/todo/`, or to
  `todos/`) and its line is removed. The owner says when, or an agent checks
  a date.
- This is separate from brief-board's Blocked status, which is for a step
  the owner agrees to take before the next session. A `blocked/` folder is
  for an outside condition with no date in sight. brief-board's glossary
  keeps the two terms apart: **Blocked** (the status) and **Blocked by**
  (the condition).

This repo had no corpus until this brief, which is its first file.

## Owner decisions

The owner asked for this on 2026-11-06. Each call below gives the default
this brief builds:

1. **A corpus for this repo.** Default: step 1 bootstraps the rest of
   `corpus/` with corpus-flow §0, so skill work is tracked like every other
   repo's. The next sync gives my-personal-skills its own lane on the
   board. The alternative: no corpus here. The brief is deleted once it's
   built, and the change is recorded only in `docs/history.md`, as skill
   changes have been until now.
2. **The corpora that already exist.** About 26 repos copy the folder
   layout and the numbering rule into their own `corpus/CLAUDE.md`, and
   their `lint.sh` files don't update when the skill does. Default: each
   repo adopts the convention the first time something there is blocked.
   Its `corpus/CLAUDE.md` (layout, numbering, a block-and-unblock line) and
   its `lint.sh` learn the folders then. vps-deploy goes first, right after
   this brief:
   - Its four todos that wait on hardware move to `todos/blocked/`. The
     SonarQube and Bitwarden todos get "a stronger machine"; the Sonarr and
     qBittorrent todos get "the home media machine".
   - Their `later` tag goes, because the folder now says that.
   The alternative is one sweep across every corpus now, the way the
   2026-11-01 briefs reset ran.
3. **Does `wiki/status.md` list blocked items?** Default: no. The folders
   and `brief-board blocked` are the list. The alternative is a "Waiting"
   section in each repo's status.md, grouped by condition.
4. **Version.** Default: a minor bump to v0.34.0.

## What to do

1. **Bootstrap** this repo's corpus with corpus-flow §0 (decision 1): the
   skeleton, `CLAUDE.md` (with the brief-board section other repos carry),
   `index.md`, `routing.md`, `log.md`, `lint.sh` and a short wiki spine.
   - `overview.md`: what the library holds, taken from README.md.
   - `status.md`.
   - `decisions.md`: seed it with the vendoring calls from
     `docs/history.md`.
2. **corpus-flow** (`skills/corpus-flow/SKILL.md`):
   - **Description:** triggers for "park this until", "this is blocked on",
     "unblock", "what's blocked".
   - **The three layers:** the layout tree gains `todos/blocked/` and
     `briefs/blocked/`, and the lifecycle diagram gains the blocked branch
     out of `todos/` and `briefs/todo/`, and back.
   - **§0 bootstrap:** the `mkdir` gets `briefs/blocked` and
     `todos/blocked`.
   - **§2 numbering:** the max across the four folders, including the `ls`
     line.
   - **A new section: block and unblock.**
     - When to use a `blocked/` folder rather than the board's Blocked
       status.
     - The `git mv` and the condition line, for a brief and for a todo.
     - Wording the condition, and reusing one already in the repo
       (`grep -rh "Blocked by\|blocked-by" corpus/`).
     - Fixing links to the moved file, which lint reports.
     - A `log.md` entry (new kinds `blocked`, `unblocked`).
     - A blocked brief isn't immutable yet, and it can go straight to
       `superseded/`. It reaches `done/` only by way of `todo/`.
   - **§3:** an agent asked to work on a brief in `blocked/` says what it
     waits on and doesn't start it.
   - **§4:** the move to `done/` is from `todo/` only.
   - **§7 lint and the `lint.sh` it writes:**
     - Every file in a `blocked/` folder has its condition.
     - No file outside `blocked/` has one.
     - No brief number appears twice across the four folders.
     - Links to blocked files are checked like any other.
   - **The retrieval rule and the Conventions and Workflows sections** that
     each repo's `corpus/CLAUDE.md` is written from: four folders, and the
     block-and-unblock rule in one or two lines.
3. **plan-split-dispatch** (`skills/plan-split-dispatch/SKILL.md`, wave
   mode):
   - Only `briefs/todo/` is the backlog.
   - A brief that depends on a brief in `blocked/` goes in no wave. Report
     it with the condition.
   - Never move a file out of `blocked/` without the owner.
4. **orchestrate** (`skills/orchestrate/SKILL.md` and
   `commands/orchestrate.md`):
   - The "Always" fan-out lists open briefs in `todo/`, plus each brief and
     todo in `blocked/` with its condition.
   - Block and unblock requests route to corpus-flow.
   - Check the `routing.md` template for the brief folders.
5. **improve** (`skills/improve/SKILL.md`):
   - The numbering rule counts four folders.
   - A finding already in `briefs/blocked/` or `todos/blocked/` counts as
     already known.
   - A picked finding that waits on an outside condition is written
     straight to `briefs/blocked/` with its line.
6. **grill-me** (`skills/grill-me/SKILL.md`): an answer like "later, once X"
   is handed to corpus-flow as a blocked todo or brief, with X as the
   condition.
7. **README.md**, `docs/history.md` (one paragraph for v0.34.0), and the
   version in `.claude-plugin/plugin.json` and `marketplace.json`.

## Files you OWN

- `corpus/` (new)
- `skills/corpus-flow/SKILL.md`, `skills/plan-split-dispatch/SKILL.md`,
  `skills/orchestrate/SKILL.md`, `commands/orchestrate.md`,
  `skills/improve/SKILL.md`, `skills/grill-me/SKILL.md`
- `README.md`, `docs/history.md`, `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`

## Files you must NOT touch

- `skills/corpus-docs-site/`. Its link rewrite treats a link into
  `briefs/blocked/` like any other link into `briefs/`. A file moving
  between folders breaks links the same way a move to `done/` does today,
  and each repo's lint finds them.
- `skills/design-md-library/SKILL.md`. It points new work at `briefs/todo/`,
  which is still right.
- Other skills, and other repos' corpora. vps-deploy's move under decision 2
  is a follow-up there, not part of this brief.

## Acceptance

- This finds no three-folder numbering rule left:

  ```bash
  grep -rn -e 'todo,done,superseded' -e 'todo/`, `done/`, `superseded/' skills commands
  ```
- The convention in corpus-flow matches the Context above, folder names and
  line formats word for word. It's the same one brief-board's brief 14
  parses.
- This repo's `bash corpus/lint.sh` passes, and so does a lint built from
  the updated template, run against a scratch corpus. The scratch corpus
  has a blocked brief with its line, a blocked todo with its key, one of
  each missing it (fails), and a duplicate number across `todo/` and
  `blocked/` (fails).
- Commit locally on main, one commit per the repo's style
  (`feat(corpus-flow): blocked briefs and todos -> v0.34.0`). The owner
  pushes.

## Outcome

Built 2026-11-06 as v0.34.0, with every owner decision at its default: this
repo got its own corpus, existing corpora adopt the folders when something
there is first blocked (vps-deploy goes first), `status.md` doesn't list
blocked items, minor version bump.

- `corpus-flow` has the folders in its layout, lifecycle, bootstrap `mkdir`
  and four-folder numbering, a new §2b (block and unblock), the §3 and §4
  rules, the §7 lint rules and the Conventions line. The skill has no
  separate Workflows section, so the rule went into the retrieval budget and
  Conventions, which the per-repo `CLAUDE.md` is written from.
- `plan-split-dispatch`, `orchestrate` (skill, command, routing template),
  `improve` and `grill-me` are updated as the brief lists.
- Checks: the acceptance grep finds nothing; `bash corpus/lint.sh` is clean;
  a lint of the same shape run on a scratch corpus passed with a blocked brief
  and todo that carried their condition, and failed on a brief and a todo
  without it, a condition outside `blocked/`, and a duplicate number across
  `todo/` and `blocked/`.
- Deferred: vps-deploy's move of its four hardware todos (a follow-up there).
- Decided on my own: `lint.sh` reads only the first 12 lines of a brief for
  the `Blocked by:` line, so prose that quotes the format isn't mistaken for
  one.
