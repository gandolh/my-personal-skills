---
name: corpus-flow
description: Run a project's knowledge and work as an LLM-maintained wiki ("corpus") at the repo root — a curated wiki/ synthesis layer plus a todos→briefs→done+log work lifecycle. The LLM owns synthesis; the human curates sources and asks questions. Use when the user says "add a todo", "promote to a brief", "work on <brief>", "mark this done + log it", "what does the wiki say about X", "ingest this finding", "lint the corpus", "/corpus-flow", or wants durable, wiki-style project knowledge + task tracking (not the ephemeral in-session TodoWrite list). Bootstraps ./corpus on first use.
---

# Corpus Flow — a project's knowledge + work as an LLM-maintained wiki

A **corpus** is a small **LLM-maintained wiki** living in `corpus/` at the repo
root. The governing split: **the human curates the sources and asks the
questions; the LLM curates the synthesis and tracks the work.** It is the
durable counterpart to `TodoWrite` (ephemeral, in-session only) and to chat
(which evaporates) — reusable findings get **folded back into the corpus**, not
left in conversation or personal memory.

## The three layers

```
corpus/
  CLAUDE.md         schema + conventions for THIS corpus (written on bootstrap)
  index.md          content catalog — what lives where; the front door
  log.md            chronological record of every meaningful change
  todos/            captured ideas/tasks as prose (pre-spec)
  briefs/           raw, immutable task specs
    todo/  done/  superseded/
  wiki/             LLM-curated synthesis pages — the actual knowledge base
    overview.md, architecture.md, decisions.md, status.md, open-questions.md, …
```

1. **briefs/** — raw, **immutable**. Each file is a task spec used to direct a
   slice of work (often by a subagent). Once in `done/` or `superseded/`, do
   **not** edit it. New work gets a new brief in `todo/`.
2. **wiki/** — the LLM **owns** this. Synthesis, entity pages, concept pages,
   current status. Edited freely as understanding evolves. This is where
   durable knowledge accrues.
3. **index.md + log.md + todos/** — navigation and capture aids. Updated on
   every meaningful change.

The work lifecycle moves a single piece of work left-to-right; the wiki layer
is the standing knowledge the work draws from and feeds back into:

```
todos/<date>-<slug>.md      capture an idea/task as prose
      │  (promote)
      ▼
briefs/todo/<NN>-<slug>.md   a numbered work spec, ready to build
      │  (grill → plan → implement)
      ▼
briefs/done/<NN>-<slug>.md   moved verbatim (number kept) + outcome note
      │
      ├─► log.md             one chronological entry per meaningful change
      └─► wiki/              fold durable findings into the synthesis pages
```

Pick the matching section below by what the user asked. If ambiguous, ask one
question to disambiguate, then proceed.

---

## The wiki — what it is and what pages live in it

The wiki is **not** a freeform dump of notes. It is a small set of curated pages,
each with **one job and its own curation discipline**. The point is that a reader
(human or a fresh agent) opens `index.md`, sees the catalog, and lands on the one
page that answers their question — without spelunking the code or the brief
archive. Knowledge that doesn't fit one of the standing pages gets its **own
concept page**, not a paragraph wedged into an unrelated one.

A typical wiki has a **spine** of standing pages plus **entity/concept pages**
that grow as the project does.

### The spine (most projects want these)

- **`overview.md`** — what this project *is*, in a paragraph: the pitch, the
  lineage, the cast/major components, and what lives where at the top level.
  The orientation page. Short and stable.
- **`architecture.md`** — the structural map: workspaces/packages, layers and
  their dependency direction, the data-flow / main loop, the big boundaries.
  "How is it put together." Updated when structure shifts, not on every change.
- **`decisions.md`** — **locked** tech/design choices, listed so future briefs and
  reviews **don't relitigate them**. Each is a settled call ("npm workspaces, not
  pnpm"; "pinned versions"; "no `.js` import suffixes"). Changing one requires an
  **explicit revisit + a `log.md` note** — you don't quietly flip a decision.
  This page *wins* over `status.md` for choices not formally revisited.
- **`status.md`** — a **dated snapshot** of current state: a terse one-liner per
  brief/area and a short "where things stand" paragraph. **Detail is pushed
  down**, not duplicated — the brief file owns the full spec, `log.md` owns the
  history. Re-stamp the date when you update it. It's the living dashboard, kept
  deliberately thin.
- **`open-questions.md`** — only the **genuinely unresolved**. The moment a
  question is answered or shipped, **delete it from here** — its history lives in
  `status.md` + `log.md`. This page must never accumulate resolved cruft, or it
  stops being trustworthy as "what's actually open."

### Entity / concept pages (grow with the project)

One page per meaningful concept, subsystem, or entity — e.g. `economy.md`,
`world-generation.md`, `animation.md`, `performance.md`, `system-ordering.md`.
Each is the **single home** for its topic: the synthesis of how that thing works,
the decisions specific to it, the open threads, and links into the code. Rules:

- **One concept per file.** When a page passes ~200 lines or starts straddling
  two topics, **split it** and cross-link.
- **Born from ingest.** When a finding is named repeatedly but has no page (§6),
  create one and link it from `index.md`. A concept mentioned across three pages
  but owned by none is a lint finding (§7).
- **Code refs are relative and verifiable.** They drift — §8 before quoting.

### What makes it a wiki (not a notes folder)

- **Synthesis over transcript.** A page states the *current understanding*, not a
  log of how you got there. The chronology is `log.md`'s job.
- **The LLM curates, freely.** Rewrite a page as understanding improves; don't
  append-only. Stale phrasing is a bug to fix, not history to preserve.
- **Every page is reachable** from `index.md` (the catalog). Orphans get linted.
- **Pages can drift from code** — they're a view, not the truth. Source-of-truth
  ordering (Conventions) and §8 verification keep them honest.

---

## 0 — Bootstrap (first use in a project)

`corpus/` always lives at the **repo root** (`./corpus`). Before any operation,
ensure the skeleton exists:

```bash
mkdir -p corpus/todos corpus/briefs/todo corpus/briefs/done \
         corpus/briefs/superseded corpus/wiki
```

If they're missing, create:

- **`corpus/CLAUDE.md`** — the schema/conventions for this corpus. Adapt the
  **Conventions** and **Workflows** sections at the bottom of this skill into a
  concise per-project version (so a fresh agent opening the repo learns the
  rules without this skill loaded). Note the source-of-truth ordering and tell
  agents to read `index.md` first.
- **`corpus/index.md`** — the content catalog (what lives where), starting with
  links to CLAUDE.md, log.md, and the wiki pages. This is the front door.
- **`corpus/log.md`** — a `# Log` heading and nothing else yet.
- **The wiki spine** — at minimum seed `corpus/wiki/status.md` (the living
  dashboard). Also seed `overview.md`, `architecture.md`, `decisions.md`, and
  `open-questions.md` when you have enough to say — even a stub paragraph each is
  better than a missing page, because it gives ingest (§6) a home to grow into.
  See the wiki section above for what each page is for. Don't fabricate content
  to fill them; a one-line "TODO: …" stub is fine.

Keep index.md and log.md minimal — they are navigation aids, not content.
Tell the user you bootstrapped the corpus; don't make it a ceremony. Do **not**
commit anything in this skill unless the user explicitly asks — the user
controls when corpus changes land in git.

---

## 1 — Add a todo (capture)

For a durable task/idea/follow-up the user wants to keep. Prose, **not** a
formal spec yet.

1. Get the todo text. If the user gave a bare "add a todo" with no content, ask
   what it is — one question, then proceed.
2. Derive a kebab-case slug from the gist (e.g. "fix the scalloped shore mask" →
   `fix-scalloped-shore-mask`). Filename: `corpus/todos/<YYYY-MM-DD>-<slug>.md`
   using today's date from the environment context (never shell out to `date`).
   On a name clash, append `-2`, `-3`, ….
3. Write the file:

   ```markdown
   ---
   title: <one-line title>
   created: <YYYY-MM-DD>
   status: open
   tags: [<optional>]
   ---

   # <title>

   <The task in the user's framing — what needs doing and why.>

   ## Context

   <Motivation, related files, constraints. Relative markdown links to code or
   corpus pages where relevant. Omit the whole section if there's nothing.>

   ## Acceptance

   <What "done" looks like, if the user stated it. Omit if unclear.>
   ```

   Fill only sections you have real content for; drop the empty ones. Stay
   faithful to the user's wording — don't invent scope or acceptance criteria.
4. Confirm: report the clickable relative path + a one-line summary. One todo
   per file (multiple todos → one `Write` each).

---

## 2 — Promote a todo to a brief

When the user is ready to actually build a todo (or files a brief directly).

1. **Pick the next number.** Briefs are numbered with a zero-padded prefix that
   is **stable for the life of the file**. Find the current max across
   `corpus/briefs/{todo,done,superseded}/` and add 1:

   ```bash
   ls corpus/briefs/todo corpus/briefs/done corpus/briefs/superseded 2>/dev/null \
     | grep -oE '^[0-9]+' | sort -n | tail -1
   ```

   Use 2-digit padding (`07`, `42`) unless existing briefs use more.
2. **Write `corpus/briefs/todo/<NN>-<slug>.md`** as a self-contained work spec a
   fresh agent could execute without other context:

   ```markdown
   # Task <NN> — <Title>

   ## Context
   <Why this exists, the problem, links to the source todo and relevant code.>

   ## Files you OWN
   <Paths this work creates/edits. Be specific — this is the contract.>

   ## Files you must NOT touch
   <Anything adjacent that another change owns, integration points, generated
   files. Omit if nothing applies.>

   ## What to do
   <The plan, concrete enough to act on. Numbered steps if multi-part.>

   ## Acceptance
   <Observable "done" — tests pass, behavior X, typecheck clean, etc.>
   ```

3. If promoting from a todo, mark the source todo `status: promoted` (add a line
   linking the brief) or delete it — ask which the user prefers if unclear;
   default to marking it promoted so the trail survives.
4. Confirm the brief path. Don't start building yet unless the user said to.

---

## 3 — Work a brief: grill → plan → implement

When the user says "work on brief NN" / "let's build this". Three phases, **in
order**. Do not write implementation code before the plan is acknowledged.

### 3a — Grill the design (inline)

Interrogate the brief until the design is unambiguous. Ask the user pointed
questions — one tight batch, not a stream — covering whichever of these actually
have open branches:

- **Scope boundary.** What's explicitly in vs. out? What's the smallest version
  that counts as done?
- **Unknowns.** Any value, path, format, or behavior the brief leaves implicit?
- **Collisions.** What existing code/data does this touch or risk breaking?
  (Verify by reading the code — don't guess.)
- **Failure modes.** What's the expensive-to-be-wrong part, and how do we know
  it's right?
- **Invariants.** Does this project have load-bearing constraints (seeded RNG,
  enforced palette, layering rules, pinned deps)? Check `corpus/CLAUDE.md` and
  the repo's conventions; confirm the brief respects them.

If the brief or codebase already answers a branch, resolve it yourself and say
so — don't ask the user what you can read. Stop grilling when no branch with a
material consequence is still open.

> If the richer standalone `grill-me` skill is available and the design is large
> or contentious, you may run that instead of this inline pass — but this inline
> grill is the default and keeps the skill self-contained.

### 3b — Plan

Write the implementation plan back to the user (and, if it changes the spec,
fold the resolved decisions into the brief file so it stays the source of
truth). Get an acknowledgement before building. Use EnterPlanMode/ExitPlanMode
if the harness supports it.

### 3c — Implement

Build per the plan. Honor the brief's "Files you OWN / must NOT touch". Verify
against the brief's **Acceptance** — run the project's typecheck/tests/build as
applicable; report results faithfully (failing tests get said so, with output).

---

## 4 — Complete a brief + log it + fold into the wiki

When the work is done and verified.

1. **Move the brief, keep its number:**

   ```bash
   git mv corpus/briefs/todo/<NN>-<slug>.md corpus/briefs/done/<NN>-<slug>.md \
     2>/dev/null || mv corpus/briefs/todo/<NN>-<slug>.md corpus/briefs/done/<NN>-<slug>.md
   ```

   A brief in `done/` is **immutable** — don't edit it later. Append a short
   outcome note at the bottom only at move time (what actually shipped vs. the
   spec, anything deferred). If later work *undoes* a done brief, move it to
   `superseded/` with a one-line top note explaining why — never rewrite history.
2. **Append a `log.md` entry** at the bottom (chronological, newest last):

   ```markdown
   ## [<YYYY-MM-DD>] done | Brief <NN> — <one-line what-shipped>

   <2–5 lines: what landed, key files/decisions, what was deferred, how it was
   verified. Link the brief and any wiki page. Absolute dates only.>
   ```

   Other entry kinds: `todo` (brief filed), `maintenance`, `incident`,
   `decision`, `ingest`, `lint`.
3. **Fold durable findings into `wiki/`** (this is the step that makes it a
   wiki, not a task tracker). If the work changed how the system behaves or
   revealed something reusable, update the affected synthesis page(s) —
   `status.md` always, plus the relevant entity/concept page, `decisions.md` if
   a choice was locked, `open-questions.md` if a question opened or closed. See
   §6 (Ingest). A finding that lives only in the brief or the log will be missed
   by the next reader; the wiki is where standing knowledge belongs.
4. **Update navigation** if a new wiki page was added: cross-link it from
   `index.md`.
5. Confirm: report the moved path, the log entry, and which wiki pages changed.
   Commit only if asked.

---

## 5 — Query the wiki (answer a question against the corpus)

When the user asks "what does the corpus/wiki say about X" / "how does Y work
here".

1. **Read `index.md` first** to find the relevant pages.
2. Drill into the **wiki pages**, not the codebase — unless the wiki points you
   at specific code, or you need to verify a claim (see §8).
3. If the answer is non-trivial **and reusable**, file it back as a new or
   updated wiki page rather than letting it disappear into chat. Then answer.
4. Honor the **source-of-truth ordering** (see Conventions) when pages disagree.

---

## 6 — Ingest a finding (new source / new knowledge)

When the user shares a result, a decision, an exploration outcome, or a brief
lands — anything that should become standing knowledge. Triggers: "ingest
this", "remember that we decided…", "fold this into the wiki", or naturally at
the end of §4.

1. If it's a spec, drop the raw artifact in `briefs/`. Otherwise summarize the
   finding inline.
2. **Update the affected wiki pages** — `status.md`, the relevant entity/concept
   page, `open-questions.md`. Edit freely; the wiki is the LLM's to curate.
3. If the concept is **named but has no page yet**, create one (one concept per
   file) and cross-link it from `index.md`.
4. **Append a `log.md` entry**: `## [<YYYY-MM-DD>] ingest | <short title>`.
5. Keep `decisions.md` for locked tech/design choices; don't relitigate a
   decision recorded there without flagging it explicitly.

---

## 7 — Lint the corpus (periodic health check)

When the user says "lint the corpus" / "is the wiki stale". Sweep for:

- **Contradictions** between pages (e.g. `decisions.md` vs `status.md`).
- **Stale claims** — verify by reading the actual code or running the relevant
  command before trusting (see §8).
- **Orphan pages** — no inbound link from `index.md` or another wiki page.
- **Named-but-pageless concepts** — mentioned repeatedly, no page of their own.
- **Drifted briefs** — a `done/` brief whose work has since been undone or
  replaced → move to `superseded/` with a one-line note.
- **Over-long pages** — past ~200 lines or straddling two topics → split.

Report findings as a short list; fix the cheap ones inline, surface the rest for
the user to decide. Append a `## [<YYYY-MM-DD>] lint | …` entry to `log.md`
noting what was swept and changed.

---

## 8 — Verify before quoting the wiki

A wiki page that names a specific file, function, or commit may have **drifted**.
The wiki reflects what was true when written — it is not authoritative over the
code. Before acting on a wiki claim:

- Names a **path** → check it exists.
- Names a **function / flag** → grep for it.
- Names a **commit** → `git log --oneline | grep <hash>`.

If a claim is stale, fix the page (it's the LLM's to curate) and note it in
`log.md`. Never recommend an action based on an unverified wiki claim about
specific code.

---

## Conventions (load-bearing)

- **Numbers are stable.** Never renumber a brief when it moves between dirs.
- **Standard markdown links, relative to the file's own location** — not Obsidian
  `[[wikilinks]]`. Repos render in VSCode/GitHub, where standard links are
  clickable. (Code refs from `wiki/` are `../../src/...`; from
  `briefs/<area>/<state>/` they're one level deeper.)
- **Absolute dates** (`2026-06-15`), never "yesterday".
- **One concept per file.** Split a page that grows past ~200 lines or straddles
  two topics.
- **Source-of-truth ordering** when pages or beliefs disagree:
  1. The **actual code** wins over any wiki claim.
  2. A brief in **`done/`** wins over `wiki/` if the wiki hasn't caught up.
  3. **`decisions.md`** wins over `status.md` for tech choices not formally
     revisited.
  4. An **external spec** (e.g. an upstream README the project tracks) wins for
     design disagreements in its domain.
  Verify any path/function/commit a page names before acting on it — pages drift.
- **The LLM owns `wiki/`; briefs are immutable; index/log are navigation.**
  Don't edit a `done/` brief; don't let durable findings rot in chat.
- **One commit per meaningful corpus change** (when committing) so `log.md` and
  git history agree. Never commit without the user asking.
- **`TodoWrite` is for the in-session task list; `corpus/` is durable.** Don't
  conflate them. Likewise prefer the corpus over personal memory for
  project-specific, reusable knowledge.
