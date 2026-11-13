# Step detail for §1 to §4: the templates and commands

Moved out of `SKILL.md` verbatim. The numbered rules for each step stay in
`SKILL.md`; the file templates, the block and unblock commands, the grill and
the log entry format live here.

## 1 — Add a todo (capture)

For a durable task/idea/follow-up the user wants to keep. Prose, **not** a
formal spec yet.

1. Get the todo text. If the user gave a bare "add a todo" with no content, ask
   what it is — one question, then proceed.
2. Derive a kebab-case slug from the gist (e.g. "fix the scalloped shore mask" →
   `fix-scalloped-shore-mask`). Filename: `corpus/todos/<slug>.md` — do NOT
   date-prefix the name; the date lives in the `created:` frontmatter below.
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
   is **stable for the life of the file**. Find the current max across all four
   folders, `corpus/briefs/{todo,blocked,done,superseded}/`, and add 1:

   ```bash
   ls corpus/briefs/todo corpus/briefs/blocked corpus/briefs/done \
      corpus/briefs/superseded 2>/dev/null \
     | grep -oE '^[0-9]+' | sort -n | tail -1
   ```

   Use 2-digit padding (`07`, `42`) unless existing briefs use more.

   **Numbering never restarts.** New briefs continue the repo's current
   numbering, even after old briefs are folded into the wiki and deleted. A
   tracker that keys tickets by project and number (brief-board does) would
   otherwise match a new brief 01 to an old ticket 01. An empty brief tree
   starts at 01.
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

## 2b — Block and unblock (park work that waits on something outside)

Some work can't go ahead until something outside it happens: a stronger
machine, a home media machine, a date, another team's release. Parked in
`todos/` or `briefs/todo/` it looks like open work, and `plan-split-dispatch`
puts a waiting brief in a wave. Give it its own folder instead.

Triggers: "park this until", "this is blocked on", "unblock", "what's blocked".

**This is not brief-board's Blocked status.** That status is for a step the
owner agrees to take before the next session. A `blocked/` folder is for an
outside condition with no date in sight. The two terms stay apart: **Blocked**
(the board's status) and **Blocked by** (the condition here).

**Block a brief:**

```bash
git mv corpus/briefs/todo/<NN>-<slug>.md corpus/briefs/blocked/<NN>-<slug>.md
```

It keeps its number. Right under its H1, add one line:

```markdown
**Blocked by:** <condition>
```

**Block a todo:**

```bash
git mv corpus/todos/<slug>.md corpus/todos/blocked/<slug>.md
```

Add a `blocked-by: <condition>` key to its frontmatter.

**Word the condition** as one short line that someone can check, worded so that
items waiting on the same thing match: "a stronger machine", "the home media
machine", "2026-11-18". Reuse a condition already in the repo when it fits:

```bash
grep -rh "Blocked by\|blocked-by" corpus/
```

**Unblock** when the owner says so, or when an agent checks a date that has
passed. `git mv` the file back (to `briefs/todo/`, or to `todos/`) and delete
its condition line. Never unblock on a guess.

**Afterwards:**

- Fix links to the moved file. `lint.sh` reports them (§7).
- Append a `log.md` entry, kind `blocked` or `unblocked`, with the condition.
- A todo that was marked `status: promoted` keeps pointing at its brief; fix
  the link if the brief moved.

**A blocked brief isn't immutable yet.** Edit it freely while it waits. It can
go straight to `superseded/` if the work is dropped. It reaches `done/` only by
way of `todo/`.

---

## 3 — Work a brief: grill → plan → implement

When the user says "work on brief NN" / "let's build this". Three phases, **in
order**. Do not write implementation code before the plan is acknowledged.

If the brief is in `briefs/blocked/`, say what it waits on (its `Blocked by:`
line) and don't start it. Moving it out is the owner's call (§2b).

### 3a — Grill the design (inline, or via the `grill-me` skill)

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

Build per the plan. **If the brief decomposes into ≥3 independent chunks (several
mechanical), dispatch it via `plan-split-dispatch`** — it splits the work,
classifies each chunk hard/easy, and runs hard→opus / easy→sonnet as fresh
subagents with curated context (cheap tokens on cheap work, lean controller).
Pass the brief + the project's READ/SKIP/SKILLS rows from `corpus/routing.md`.
For a 1–2 chunk or single-indivisible brief, implement inline — the dispatch tax
isn't worth it.

Either way: honor the brief's "Files you OWN / must NOT touch". Verify against the
brief's **Acceptance** — run the project's typecheck/tests/build as applicable;
report results faithfully (failing tests get said so, with output).

---

## 4 — Complete a brief + log it + fold into the wiki

When the work is done and verified.

1. **Move the brief, keep its number.** The move to `done/` is from `todo/`
   only; a blocked brief goes through `todo/` first (§2b).

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

   Other entry kinds: `todo` (brief filed), `blocked`, `unblocked`,
   `maintenance`, `incident`, `decision`, `ingest`, `lint`, `resume`.

   A **`resume`** entry is the checkpoint written when a long run is paused (e.g.
   the user hits a quota/usage limit and asks to stop for a fresh session). It
   captures enough for a **cold start next session**: what is done (with the
   contracts dependents need), what is in-flight or next, the branch + last
   commit, and any open decisions. `plan-split-dispatch` wave-mode writes one at a
   wave boundary; keep it at the bottom of `log.md` (or a dedicated
   `corpus/resume-<YYYY-MM-DD>.md` when the state is large) so the next session
   reads it first.
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
