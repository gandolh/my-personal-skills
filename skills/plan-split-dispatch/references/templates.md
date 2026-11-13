# Templates for the steps

Moved out of `SKILL.md` verbatim so its first 5,000 tokens hold the rules.

## Step 1: the chunk block

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

## Step 3: the plan shape

```
## Plan

**Goal:** <one sentence>

**Chunks:**
1. [senior] Chunk 1: <name> — <one-line goal> — <why senior>
2. [junior] Chunk 2: <name> — <one-line goal> — <why junior>
3. [senior] Chunk 3: <name> ...

**Parallel-safe groups:** {1, 2} can run in parallel; 3 depends on 1.

**Estimated dispatches:** N senior (opus), M junior (sonnet), K trivial (haiku){, + review (sonnet finders)}.
<!-- If N dominates, re-check the reference-pattern rule — pattern-copies should be junior. -->

Proceed? (yes / re-classify / re-scope)
```

## Step 4: the dispatch prompt

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
- **Handoff for dependents** (backlog/wave mode): the exact signatures, paths, and
  data shapes this chunk/brief produced that downstream work must consume. This is
  the connective tissue — the controller pastes it into dependent prompts.

Do not commit, push, or open a PR. The controller handles integration.
```

For **junior** dispatches, prepend one line:

```
This is a junior-scoped chunk. If the work turns out to touch anything in the
senior list (security/auth, migrations, concurrency, cross-module contracts,
public API surface, open design questions), STOP and report BLOCKED — do not
stretch your scope.
```

## Step 8: the delivery

```
## Done

**Chunks:** N senior + M junior, all DONE
**Files changed:** <count / list>
**Review verdict:** ship | fix-required | needs-discussion | skipped (small run)
**Fix rounds:** <n> (escalated: yes/no)
**Accepted, not fixed:** <minor findings logged but left>
**Suggested next:** <commit / open a PR / run the repo's PR skill>
```

## The ruling ledger: example

```
## Rulings
- [chunk 3] split from chunk 2 — shared store, cannot run in parallel
- [chunk 5] re-dispatched on opus — sonnet missed the async boundary twice
- [finding 11] rejected — by-design, corpus/wiki/decisions.md "no .js suffixes"
- [wave 2] gate failed on build, not tests — dist/ was stale, not a code bug
```
