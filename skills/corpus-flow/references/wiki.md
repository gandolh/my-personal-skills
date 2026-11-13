# The wiki, its frontmatter and the two-graph model

Moved out of `SKILL.md` so that file's first 5,000 tokens hold the rules that
must survive compaction. Read this when you create or reshape wiki pages. The
short rules are in `SKILL.md`.

## The three layers (full)

```
corpus/
  CLAUDE.md         schema + conventions for THIS corpus (written on bootstrap)
  index.md          content catalog — generated from each page's `summary:` frontmatter
  routing.md        which question goes to which layer (wiki / code graph / grep / tests)
  lint.sh           health check: frontmatter, link resolution, page size, stale paths
  log.md            chronological record of every meaningful change
  todos/            captured ideas/tasks as prose (pre-spec)
    blocked/        todos that wait on an outside condition
  briefs/           raw, immutable task specs
    todo/  blocked/  done/  superseded/
  wiki/             LLM-curated synthesis pages — the actual knowledge base
    overview.md, architecture.md, decisions.md, status.md, open-questions.md, …
  test-plans/       (optional) plain-text browser test plans + latest RESULTS
    index.md  TP-NN-<slug>.md …  RESULTS.md
```

`test-plans/` is an **optional adjacent layer** — present only in projects with a
UI worth walking in a real browser. It holds plain-text, human-or-agent-runnable
plans (one `TP-NN-<slug>.md` per area, an `index.md` catalog, a `RESULTS.md`
snapshot of the latest run); the actual browser bring-up/fixtures live outside
the corpus (e.g. a gitignored `playwright/` hub). It is **authored by the
[`ui-test-plans`](../../ui-test-plans/SKILL.md) skill**, not this one — corpus-flow
just gives it a home so runs feed findings back as todos/briefs and a `log.md`
line. Skip it entirely for backend/CLI/library projects.

1. **briefs/** — raw, **immutable**. Each file is a task spec used to direct a
   slice of work (often by a subagent). Once in `done/` or `superseded/`, do
   **not** edit it. A brief in `blocked/` is not immutable yet: it waits on an
   outside condition (§2b). New work gets a new brief in `todo/`.
2. **wiki/** — the LLM **owns** this. Synthesis, entity pages, concept pages,
   current status. Edited freely as understanding evolves. This is where
   durable knowledge accrues.
3. **index.md + log.md + todos/** — navigation and capture aids. Updated on
   every meaningful change.

The work lifecycle moves a single piece of work left-to-right; the wiki layer
is the standing knowledge the work draws from and feeds back into:

```
todos/<slug>.md             capture an idea/task as prose
      │  (promote)
      ▼
briefs/todo/<NN>-<slug>.md   a numbered work spec, ready to build
      │  (grill → plan → implement)
      ▼
briefs/done/<NN>-<slug>.md   moved verbatim (number kept) + outcome note
      │
      ├─► blocked/           a todo or a brief waits on an outside condition,
      │                      and goes back with `git mv` when it clears (§2b)
      │
      ├─► log.md             one chronological entry per meaningful change
      └─► wiki/              fold durable findings into the synthesis pages
```

Pick the matching section below by what the user asked. If ambiguous, ask one
question to disambiguate, then proceed.

---

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

  **Record a decision only when all three hold** — otherwise the page fills with
  obvious choices and stops being read:

  1. **Hard to reverse** — changing your mind later has real cost.
  2. **Surprising without context** — a future reader will ask "why this way?"
  3. **A genuine trade-off** — there were real alternatives and one was picked.

  Format per entry: the call, the date, the alternatives rejected, and the reason.
  The reason is the load-bearing part — a decision with no *why* cannot be
  revisited intelligently, only obeyed or broken.
- **`status.md`** — a **dated snapshot** of current state: a terse one-liner per
  brief/area and a short "where things stand" paragraph. **Detail is pushed
  down**, not duplicated — the brief file owns the full spec, `log.md` owns the
  history. Re-stamp the date when you update it. It's the living dashboard, kept
  deliberately thin.
- **`open-questions.md`** — only the **genuinely unresolved**. The moment a
  question is answered or shipped, **delete it from here** — its history lives in
  `status.md` + `log.md`. This page must never accumulate resolved cruft, or it
  stops being trustworthy as "what's actually open."
- **`glossary.md`** — the project's **vocabulary**: one canonical definition per
  term the project uses in a specific way, each with the synonyms it displaces.
  This is the page that stops three people (and three agents) calling the same
  thing three names. Format and the multi-context variant: **§9**.

  Rules that keep it useful:

  - **Definitions only.** No implementation detail, no spec, no scratch notes. If
    an entry starts explaining *how* something works, that belongs on a concept
    page and the glossary should link to it.
  - **Only terms with a project-specific meaning.** "Cache" does not need an entry;
    "a *run*" does, if this project means something particular by it.
  - **Write it the moment a term is settled**, usually mid-`grill-me` — not in a
    batch later, when the precise wording that made it click is gone.
  - **Conflicts are findings.** If code or docs use a term against its definition,
    that is a real inconsistency: fix one side, don't quietly add a second sense.
    A term with two live meanings is two terms, and needs two names.

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

---

## Frontmatter + the retrieval budget

A corpus exists to make an agent **cheaper**, not just better-informed. A wiki you
must *read* to discover is irrelevant has already cost you the tokens. So every
wiki page opens with exactly two keys:

```markdown
---
summary: <one line — what question this page answers. The triage signal.>
updated: <YYYY-MM-DD>
---
```

`summary:` is the load-bearing one. It is written **for an agent deciding whether
to open the page**, not as a title. "Ranked optimization backlog, filtered against
what the code actually does, and what is explicitly not worth doing at this scale"
tells you whether to open it; "Performance notes" does not.

This is the atomic-note idea (Zettelkasten / A-Mem) applied to a repo wiki: one
concept per note, each carrying an LLM-written description, so retrieval lands in
a small budget instead of pulling whole documents.

**`index.md` is generated from those summaries** — one line per page,
`bash corpus/lint.sh --index`. Never hand-maintain the catalog, and never let
`index.md` duplicate a list that another page already owns (a brief catalog belongs
in `status.md`; `index.md` links to it).

**The budget, stated in `corpus/CLAUDE.md` so a fresh agent inherits it:**

1. Read `index.md`. Then read **at most 2–3 wiki pages**.
2. Needing more than three is a **signal**, not a licence to read more: a page is
   straddling topics and must split, or the summaries aren't sharp enough. Fix the
   cause.
3. Never read `briefs/` or `todos/` wholesale. `status.md` holds every brief's
   state in one line; open a brief only for the spec that directed specific work.
   Four brief folders and two todo folders exist (`blocked/` holds work that
   waits on an outside condition, §2b); to answer "what's blocked", list the
   `blocked/` folders and `grep -rh "Blocked by\|blocked-by" corpus/`.
4. Prefer the `summary:` line over opening the page. That is what it is for.

---

## The two-graph model — the corpus is the *why*, not the *what*

The corpus answers **why the code is the way it is**: decisions, intent, history.
It is authored, git-reviewed, and a source of truth.

It is the wrong tool for **what the code is**: "who calls X", "what breaks if I
change X", "where does feature Y live". Those belong to a **code graph** — a
generated, disposable symbol index (tree-sitter → SQLite, served over MCP). It is
regenerated from source, never hand-maintained, and **never a source of truth**.

Keeping them separate is what protects the budget above. An agent that greps and
reads twenty files to answer a structural question has blown its context before it
reaches the wiki; an agent that asks the wiki a structural question gets a stale
answer. Route each to its own layer (see the table in `routing.md`, §0).

**Never let the code graph's output be written into the wiki as fact.** The graph
is a lookup, not a finding.
