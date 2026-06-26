---
name: plan-split-dispatch
description: Repo-agnostic implementation orchestrator. The controller (opus) plans a coding task, splits it into independent chunks, classifies each as hard or easy, then dispatches hard chunks to a subagent on opus ("senior") and easy chunks to a subagent on sonnet ("junior") — each a fresh subagent with curated context. Routes cheap tokens to cheap work. Use when the user says "split this into chunks", "implement with subagents", "plan with opus and do the easy parts on sonnet", "route by difficulty", "/plan-split-dispatch", or asks to carry out a multi-step coding task that decomposes into several independent pieces. NOT for one- or two-file changes — the orchestration tax outweighs the work; just edit those inline.
---

# Plan, Split, Dispatch — model-routed subagent implementation

You (the controller) stay in this session on **opus**. Your job is **not** to
write the code — it is to **plan, split, classify, dispatch, and integrate**.
Subagents do the actual edits. This routes expensive (opus) reasoning to the
hard chunks and cheap (sonnet) execution to the mechanical ones, and keeps your
own context lean so coordination doesn't degrade over a long run.

**Core principle:** one **fresh subagent per chunk**. The controller curates
exactly the context each subagent needs — they never inherit your conversation
history. This is what makes it token-efficient *and* failure-resistant: no
context pollution, and the full transcript isn't reprocessed every turn.

This is the portable, repo-agnostic cousin of project-specific implement
skills. It needs **no custom agents** — it dispatches the built-in
`general-purpose` agent with an explicit `model` override per chunk.

**Front door.** This skill is the generic implement target of the `orchestrate`
router, which runs on top of `corpus-flow`. When `orchestrate` hands off, it
passes the brief being built plus the matched rows of the project's
**READ / SKIP / SKILLS** table (from `corpus/routing.md`). Use them to fill each
chunk's `Read` / `Skip` / `Skills` fields so subagents read the right slice and
skip the rest. Invoked directly with no router, read `corpus/routing.md` yourself
if it exists; otherwise infer per-chunk context as usual.

## When to use

- The task genuinely decomposes into **≥3 independent chunks**, and several are
  mechanical (follow-a-pattern, tests-for-existing-logic, type/string
  propagation, formatting).
- The user invokes `/plan-split-dispatch`, or asks to "split this up", "do the
  easy parts on sonnet", "route by difficulty", or "implement with subagents".

## When NOT to use

- **One- or two-chunk tasks, or any single-file edit** → just do it inline. The
  plan + classify + per-chunk context-curation overhead costs more than the
  work. This is the most common misfire — guard against it.
- The whole task is one indivisible hard problem (can't be split without
  threading state between chunks) → do it inline on opus.
- Pure review (no edits) → use a review skill/command.
- Research-only ("explore X") → use the `Explore` agent directly.

## Token efficiency — when it actually pays off

This skill is a **router that puts cheap tokens on cheap work**, not a universal
saver. Be honest about the trade-off:

- **Wins** when ≥3 independent chunks exist and several are mechanical: sonnet on
  the easy chunks is far cheaper than opus, and the controller's context stays
  small (the conversation isn't reprocessed every turn; each subagent gets only
  curated context).
- **Loses** on small tasks: planning + classification + context curation is real
  overhead that dominates 1–2 chunk work.
- **Backfires** if you undersize: sonnet stalls on a hard chunk → `BLOCKED` →
  re-dispatch on opus = *more* tokens than just using opus once. Hence the
  **when in doubt → senior** rule below.

## Procedure

### Step 1 — Plan (controller, opus)

Plan inline. Produce a numbered chunk list. Each chunk must be **self-contained**
— a subagent dispatched against it should not need to read the other chunks to
understand what to do. Each chunk has:

```
### Chunk N: <short name>
- **Files**: create/modify paths (exact)
- **Goal**: one sentence
- **Acceptance**: one or two bullets — what "done" means
- **Read**: the files/docs this chunk needs (from the profile's READ column, or what you'd grep anyway)
- **Skip**: areas this chunk must not touch (the profile's SKIP column) — advisory; the senior list below still overrides
- **Skills**: skill(s) the subagent should load for this chunk, or `none` (from the profile's SKILLS column)
- **Tests**: which test file(s) and what they must assert (if applicable)
- **Constraints**: patterns to follow
- **Depends on**: Chunk M (if any) — controller serializes these
```

If two chunks have no dependency and edit disjoint files, mark them
**parallel-safe**.

### Step 2 — Classify (controller, opus)

Tag each chunk `[senior]` (opus) or `[junior]` (sonnet) with this **generic**
rule:

**Senior (opus)** — anything where being wrong is expensive or the path isn't
obvious:
- Security / auth / access control / secrets / crypto.
- Schema or data migrations, anything that mutates persisted state irreversibly.
- Concurrency, race conditions, transaction boundaries, locking.
- Cross-module / cross-package contracts, public API surface, anything other
  code depends on.
- New design where acceptance criteria have gaps the agent must close.
- Refactors that move code across module boundaries.

**Junior (sonnet)** — mechanical work with an explicit target and an existing
pattern to copy:
- Single-file edit with clear acceptance.
- A new call/query/component that follows an established pattern in the repo.
- Tests for already-implemented logic.
- i18n / copy / string additions.
- Formatting, lint fixes, dead-code removal.
- Type propagation (add a field to an interface and thread it through).

**When in doubt → senior.** Cheap to oversize; expensive to undersize (a stalled
junior costs a re-dispatch on opus anyway).

### Step 3 — Confirm with user (MANDATORY)

Output the plan + classification in this shape and **wait**:

```
## Plan

**Goal:** <one sentence>

**Chunks:**
1. [senior] Chunk 1: <name> — <one-line goal> — <why senior>
2. [junior] Chunk 2: <name> — <one-line goal> — <why junior>
3. [senior] Chunk 3: <name> ...

**Parallel-safe groups:** {1, 2} can run in parallel; 3 depends on 1.

**Estimated dispatches:** N senior (opus), M junior (sonnet){, + 1 review}.

Proceed? (yes / re-classify / re-scope)
```

Do not dispatch until the user replies. `re-classify` → swap the named tags and
re-confirm. `re-scope` → fold in changes and re-emit.

### Step 4 — Dispatch (per chunk)

Process chunks in dependency order; send a parallel-safe group as multiple
`Agent` calls **in one message**. Use `subagent_type: general-purpose` with an
explicit model:

- **Senior** → `model: opus`
- **Junior** → `model: sonnet`

Dispatch prompt template (fill in from the chunk + curated context — the
subagent has none of your history):

```
You are implementing Chunk <N>: <name>.

## Task
<paste the chunk block verbatim — files, goal, acceptance, read, skip, skills, tests, constraints>

## Context
Working directory: <abs path>
Branch: <current branch>
Skills to load: <the chunk's Skills, or "none">
<2–3 lines of any repo conventions that bear on this chunk — naming, layering,
"no comments", reuse-existing-components, etc.>
Skip (do not touch): <the chunk's Skip>. This is advisory scoping, NOT a licence —
if a Skip area turns out to be load-bearing for the task, report BLOCKED rather
than working around it.

## Pre-existing state
<the files this chunk touches + one line each, so the subagent doesn't grep around>

## What I need back
- **Status**: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Files changed (paths)
- Tests added/modified and pass/fail
- Concerns (if DONE_WITH_CONCERNS)
- Blocker (if BLOCKED — be specific)
- Missing info (if NEEDS_CONTEXT — name exactly what)

Do not commit, push, or open a PR. The controller handles integration.
```

For **junior** dispatches, prepend one line:

```
This is a junior-scoped chunk. If the work turns out to touch anything in the
senior list (security/auth, migrations, concurrency, cross-module contracts,
public API surface, open design questions), STOP and report BLOCKED — do not
stretch your scope.
```

### Step 5 — Handle status

- **DONE** → mark complete, proceed.
- **DONE_WITH_CONCERNS** → if it affects correctness, fix before proceeding
  (re-dispatch with the fix); if observation only, note and continue.
- **NEEDS_CONTEXT** → supply the missing info, re-dispatch the same chunk.
- **BLOCKED** → triage:
  1. Context gap → provide it, re-dispatch.
  2. Junior over their head → re-dispatch the chunk as **senior** (opus). This is
     the rule working, not a failure.
  3. Plan is wrong → escalate to user, revise, re-confirm.
  4. Two attempts failed → escalate; do not loop a third time.

**Never** silently re-dispatch the same chunk with the same prompt — something
must change between attempts.

### Step 6 — Continuous execution + output discipline

After Step 3 approval, **execute the whole plan** without checking in between
chunks. Valid stops: an unresolvable `BLOCKED`, genuinely blocking ambiguity, or
all chunks done.

You coordinate; subagents produce the heavy text. Keep your between-chunk
messages to a few status lines ("Chunk 3 dispatched (senior)…", "Chunk 3 DONE,
2 files, 14/14 tests"). Do **not** echo a subagent's full diff or re-narrate the
plan each turn — one giant turn risks the output-token cap and can lose the run.
Save detail for the final summary.

### Step 7 — Optional review

If the run was non-trivial (or the user asks), run a generic code-review over the
cumulative diff (`git diff <base>...HEAD`) — either a review skill/command the
repo provides, or a fresh `general-purpose` agent on opus prompted to review the
diff for correctness, security, and convention violations. Pass it the chunk
list for scope. Fix flagged blockers with the appropriate subagent (senior for
security/data/concurrency; junior for naming/style), re-review once, then stop.
Skip review on small runs — say so explicitly rather than silently dropping it.

### Step 8 — Deliver

```
## Done

**Chunks:** N senior + M junior, all DONE
**Files changed:** <count / list>
**Review verdict:** ship | fix-required | needs-discussion | skipped (small run)
**Suggested next:** <commit / open a PR / run the repo's PR skill>
```

Do not commit, push, or open a PR yourself unless the user asked — hand off
cleanly.

## Configuration

- **Default model routing**: junior = sonnet, senior = opus, controller = opus.
  Override per-chunk only when the user asks ("do all of these on sonnet to save
  cost" / "promote chunk 3 to opus").
- **Parallel dispatch**: only within a parallel-safe group, and only for chunks
  that edit disjoint files. Never run two implementers against the same file in
  parallel.
- **Worktree**: if chunks mutate files in parallel and could conflict, dispatch
  with `isolation: "worktree"`. On a protected branch (main/dev), refuse and ask
  the user to branch first.
- **Max retry per chunk**: 2. After two failures, escalate.

## Failure modes

- **Invoked on a 1–2 chunk task** → the orchestration tax loses tokens. Decline
  and edit inline instead; this skill is for ≥3 independent chunks.
- **Junior BLOCKED on a senior-only area** → re-classify, re-dispatch as senior.
  Signal, not failure.
- **Senior BLOCKED on a design call** → escalate to user; don't invent the design.
- **Two parallel juniors edit the same file** → controller bug; sequence them or
  use worktree isolation.
