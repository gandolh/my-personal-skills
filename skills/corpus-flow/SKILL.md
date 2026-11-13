---
name: corpus-flow
description: Run a project's knowledge and work as an LLM-maintained wiki ("corpus") at the repo root — a curated wiki/ synthesis layer plus a todos→briefs→done+log work lifecycle. The LLM owns synthesis; the human curates sources and asks questions. Use when the user says "add a todo", "promote to a brief", "work on <brief>", "mark this done + log it", "what does the wiki say about X", "ingest this finding", "park this until", "this is blocked on", "unblock", "what's blocked", "lint the corpus", "/corpus-flow", or wants durable, wiki-style project knowledge + task tracking (not the ephemeral in-session TodoWrite list). Bootstraps ./corpus on first use.
---

# Corpus Flow — a project's knowledge + work as an LLM-maintained wiki

A **corpus** is a small **LLM-maintained wiki** in `corpus/` at the repo root.
The governing split: **the human curates the sources and asks the questions;
the LLM curates the synthesis and tracks the work.** It is the durable
counterpart to `TodoWrite` (in-session only) and to chat (which evaporates):
reusable findings get **folded back into the corpus**, not left in conversation
or personal memory.

This file holds the rules that must survive compaction. The templates, the
commands and the long method sections are in `references/`, pointed to from each
numbered section below. The section numbers (§0 to §9) are cited by other skills
and stay stable.

## The layers

```
corpus/
  CLAUDE.md   schema + conventions for THIS corpus     index.md   generated catalog
  routing.md  which question goes to which layer       lint.sh    health check
  log.md      chronological record of every change     wiki/      LLM-curated synthesis
  todos/      captured ideas (prose), blocked/         briefs/    todo/ blocked/ done/ superseded/
  test-plans/ (optional, written by the ui-test-plans skill)
```

A todo is promoted to `briefs/todo/<NN>-<slug>.md`, built, then moved to
`briefs/done/` (same number, plus an outcome note), with a `log.md` entry and the
durable findings folded into `wiki/`. Work that waits on an outside condition
parks in a `blocked/` folder (§2b). Pick the section below by what the user
asked. If it is ambiguous, ask one question, then proceed.

## Conventions (load-bearing)

- **Numbers are stable.** Never renumber a brief when it moves between folders, and never restart the numbering (§2). Numbering counts four folders: `todo/`, `blocked/`, `done/`, `superseded/`.
- **Briefs are immutable once in `done/` or `superseded/`.** The LLM owns `wiki/`; `index.md` and `log.md` are navigation. Don't edit a `done/` brief, and don't let durable findings rot in chat.
- **Work that waits on something outside lives in a `blocked/` folder** (`briefs/blocked/` with a `**Blocked by:**` line under the H1, `todos/blocked/` with a `blocked-by:` key), moves back with `git mv`, and never starts until the owner unblocks it (§2b).
- **Every wiki page carries `summary:` + `updated:` frontmatter** (exactly those two keys), and `index.md` is generated from it (`bash corpus/lint.sh --index`). The summary is the retrieval signal: write it for an agent deciding whether to open the page, not as a title.
- **The retrieval budget is a rule, not advice.** Read `index.md`, then at most 2–3 wiki pages. Needing more means a page must split or a summary is vague: fix that. Never read `briefs/` or `todos/` wholesale: `status.md` holds each brief's state in one line.
- **Standard markdown links, relative to the file's own location**, not `[[wikilinks]]`.
- **Absolute dates** (`2026-06-15`), never "yesterday".
- **Other projects are named, never pathed.** Write `auth-service` or `auth-service/corpus/wiki/overview.md`, not `../auth-service/...`, and no machine paths (`/home/<user>/...`, `~/projects/...`) or account names. Where checkouts live belongs in the agent's memory, not the repo.
- **One concept per file.** Split a page that passes ~200 body lines or straddles two topics. `corpus/lint.sh` caps only wiki pages; a brief in `done/` can run longer, so leave room in the brief for its outcome note.
- **The corpus is the *why*; a code graph is the *what*.** Never answer a structural question ("who calls X", "what breaks if I change X") from the wiki, and never write a code graph's output into the wiki as fact (§0b).
- **Source-of-truth ordering** when pages or beliefs disagree: (1) the actual code; (2) a `done/` brief, if the wiki hasn't caught up; (3) `decisions.md`, for choices not formally revisited; (4) an external spec the project tracks, in its own domain. Verify any path, function or commit a page names before acting on it (§8): pages drift.
- **One commit per meaningful corpus change**, so `log.md` and git history agree. Never commit without the user asking.
- **`TodoWrite` is for the in-session task list; `corpus/` is durable.** Prefer the corpus over personal memory for project-specific, reusable knowledge.

## The numbered steps (rules here, templates in `references/workflow-steps.md`)

**§1 Add a todo.** Prose, not a spec. File `corpus/todos/<slug>.md` (kebab-case slug, no date prefix; `-2`, `-3` on a clash) with `title`, `created`, `status: open` frontmatter. Fill only the sections you have content for and stay faithful to the user's wording: don't invent scope or acceptance. A bare "add a todo" gets one question. Report the path.

**§2 Promote a todo to a brief.** Number = max across `briefs/{todo,blocked,done,superseded}/` plus one, two digits; numbering never restarts (a tracker keyed by project and number would match a new 01 to an old ticket). Write `corpus/briefs/todo/<NN>-<slug>.md` as a self-contained spec: Context, Files you OWN, Files you must NOT touch, What to do, Acceptance. Mark the source todo `status: promoted` with a link (or delete it if the user prefers). Don't start building unless told.

**§2b Block and unblock.** Triggers: "park this until", "this is blocked on", "unblock", "what's blocked". `git mv` the brief to `briefs/blocked/` and put `**Blocked by:** <condition>` under its H1, or the todo to `todos/blocked/` with a `blocked-by:` key. Word the condition as one short line someone can check, and reuse one already in the repo (`grep -rh "Blocked by\|blocked-by" corpus/`). Unblock only when the owner says so, or an agent checks a date that has passed; `git mv` back and delete the condition line. Append a `log.md` entry (`blocked` / `unblocked`). A blocked brief reaches `done/` only by way of `todo/`, and is not the board's Blocked status.

**§3 Work a brief: grill, plan, implement, in order.** No implementation code before the plan is acknowledged. A brief in `blocked/` is not started: say what it waits on. *Grill* the design in one tight batch of questions on the open branches (scope boundary, unknowns, collisions, failure modes, invariants) and resolve from the code what you can read yourself. *Plan*: write it back and fold resolved decisions into the brief. *Implement* inline, or through `plan-split-dispatch` when the brief has ≥3 independent chunks (pass the brief and the READ/SKIP/SKILLS rows of `corpus/routing.md`). Honor the brief's OWN / must-NOT-touch lists, verify against its Acceptance, and report failures faithfully.

**§4 Complete a brief, log it, fold it into the wiki.** (1) `git mv` it from `todo/` to `done/`, same number, and append a short outcome note at move time (what shipped against the spec, what was deferred). Never edit it after. Work later undone moves to `superseded/` with a one-line top note. (2) Append to `log.md`, newest last: `## [<YYYY-MM-DD>] done | Brief <NN> — <what shipped>` plus 2–5 lines. Other kinds: `todo`, `blocked`, `unblocked`, `maintenance`, `incident`, `decision`, `ingest`, `lint`, `resume`. A `resume` entry is the cold-start checkpoint for a paused run. (3) Fold durable findings into `wiki/`: `status.md` always, plus the concept page, `decisions.md` and `open-questions.md` as they apply. (4) Cross-link a new page from `index.md`. (5) Report the moved path, the log entry and the wiki pages changed. Commit only if asked.

## Wiki pages, frontmatter, bootstrap, query, lint, domain modeling

- **The wiki** (spine pages, entity pages, the three-part decision test, the two-graph model): [`references/wiki.md`](references/wiki.md). Standing pages are `overview`, `architecture`, `decisions`, `status`, `open-questions` and `glossary`. Record a decision only when it is hard to reverse, surprising without context and a real trade-off, with the date, the rejected alternatives and the reason.
- **§0 Bootstrap** a missing `corpus/` (CLAUDE.md, index, log, routing, lint.sh, the spine) and **§0b the code-graph layer**: [`references/bootstrap.md`](references/bootstrap.md). Make no commit during bootstrap unless asked. Commit the MCP registration pinned as `@colbymchenry/codegraph@<pin>`, and check the pin with `node ${CLAUDE_PLUGIN_ROOT}/skills/stocktake/scripts/check-mcp-pins.mjs`.
- **§5 Query, §6 Ingest, §7 Lint, §8 Verify before quoting**: [`references/query-ingest-lint.md`](references/query-ingest-lint.md). Run `bash corpus/lint.sh` first, then sweep by hand for what it can't see. Check a named path, function or commit before you act on a page's claim.
- **§9 Domain modeling** (glossary entries with the synonyms they displace, multi-context maps, the `decisions.md` format and what qualifies): [`references/domain-modeling.md`](references/domain-modeling.md). Challenge a term used against its definition, and write the glossary entry the moment a term is settled.
