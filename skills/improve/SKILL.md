---
name: improve
description: Survey a codebase as a senior advisor and produce a prioritized, vetted list of what is actually worth doing — then write the winners up as self-contained corpus briefs that plan-split-dispatch can execute. Read-only: it audits, vets, ranks and specs, it never implements. Use when the user says "audit this repo", "what should we work on", "what's wrong with this codebase", "find the tech debt", "where are the bugs", "review the whole project", "what should we do next", "/improve", or wants a roadmap rather than a change. Not for reviewing a single diff or PR.
when_to_use: The user wants to know what to do next in a non-trivial codebase, and wants that answer to be evidence-backed rather than vibes — a survey of correctness, security, performance, test coverage, debt and DX that ends in ranked, buildable briefs. Runs read-only and stops at the ranked list for the user to pick from. Not for a one-file question, not for diff/PR review (that is a review skill), and not a licence to start building.
---

# Improve — audit, vet, rank, then spec

The gap this fills: `plan-split-dispatch` executes briefs and `corpus-flow` stores
them, but something has to decide **what is worth building at all**. This is that
step. It is the senior-advisor seat — it reads widely, forms opinions, throws most
of them away, and hands back a short list you can actually act on.

**It is read-only.** It writes exactly one kind of file: briefs under
`corpus/briefs/todo/`, and only after you pick. It never edits source.

## When to use

- "What should we work on next?" in a repo with more surface than you can hold.
- Inheriting or returning to a codebase and needing an honest state-of-things.
- Before a planning cycle, to refill `corpus/briefs/todo/` with vetted work.
- After a burst of fast building, to find what got skipped.

## When NOT to use

- **Reviewing one diff or PR** — that is a review pass, not a survey.
- **A repo you already understand well** — you will spend more tokens confirming
  what you know than you get back. Just write the brief.
- **When the user already knows what they want built.** Go straight to
  `corpus-flow` §2 and write the brief.
- **As a prelude to building in the same breath.** The gate below is the point.

## Procedure

### Step 1 — Recon (controller, opus)

Build a cheap map before spending anything on depth. Read, in this order, stopping
as soon as you can state what the project *is*:

1. `corpus/wiki/index.md` → `overview.md`, `architecture.md`, `decisions.md`,
   `status.md` if a corpus exists. **This is the highest-value context in the repo**
   — it tells you what is deliberate, so you do not "find" a locked decision as a
   problem. Respect the retrieval budget (≤3 pages unless the trail demands more).
2. `README`, root config, workspace layout, the build/test/lint commands.
3. `corpus/briefs/todo/` and `log.md` — what is already known and already queued.
   **Anything already in `todo/` is not a finding.**

Then state the **scope contract** before auditing:

```
READ:  <dirs/globs that matter>
SKIP:  .git, node_modules, dist, build, generated, vendored, lockfiles
```

If a code graph exists (see `codegraph`), use it here to find the load-bearing
modules cheaply — audit effort should follow blast radius, not file count.

### Step 2 — Audit (parallel finders, sonnet by default)

Dispatch **focused finder subagents in parallel, scoped by lens** — not one
generalist pass, which reliably returns shallow, obvious findings. Each finder gets
the scope contract, the locked decisions, and **one** lens:

| Lens | Looks for |
|---|---|
| **correctness** | logic bugs, unhandled errors, race conditions, wrong operators, missing await |
| **security** | injection, authz gaps, secret handling, unsafe deserialization, SSRF |
| **performance** | N+1s, unbounded work, needless re-render/recompute, oversized payloads |
| **coverage** | untested branches on load-bearing logic, tests asserting implementation |
| **debt** | duplication, dead code, god modules, leaky abstractions, stale TODOs |
| **dependencies** | unmaintained/duplicated deps, known CVEs, version drift |
| **DX / docs** | broken setup path, missing scripts, stale docs, silent failure modes |

**Finders default to sonnet** — reading code and pattern-matching is junior work.
Reserve **opus for at most one finder** on the highest-risk lens for this repo
(usually correctness or security). Pick only the lenses that fit: a CLI with no
network surface does not need a security finder. **Five lenses is a normal audit;
more than seven means the scope is too wide — narrow `READ` instead.**

Each finding must come back as `{file, line, summary, failure_scenario}`. A finding
with no concrete failure scenario is an opinion, and gets dropped in Step 3.

### Step 3 — Vet (controller, opus) — the step that earns the skill

Most raw findings are wrong. Go through every one and **re-read the cited code
yourself** before believing it. Drop:

- Anything you cannot reproduce by reading the actual lines.
- **Anything `corpus/wiki/decisions.md` already settled** — that is by-design, not
  debt. Do not relitigate a locked decision; if you think it is now wrong, that is
  an `open-questions.md` entry, not a finding.
- Pre-existing patterns the codebase applies deliberately and consistently.
- Style nits a linter or formatter already owns.
- Anything already sitting in `corpus/briefs/todo/`.

State the drop count honestly in the report — "31 raw findings, 9 survived" is a
signal about the codebase *and* about the audit.

### Step 4 — Rank by leverage

Order by **(impact × confidence) ÷ cost**, not by severity label. A certain
one-line fix to a load-bearing path outranks a speculative architectural rewrite.
Group into:

- **Now** — real, cheap, or actively hurting.
- **Next** — real and worth doing, but needs a decision or a bigger slice.
- **Watch** — plausible, not yet worth acting on. Named, not spec'd.

### Step 5 — Present and STOP (mandatory gate)

Report the ranked list and **stop**. This skill produces *options to choose from*,
never a licence to build — the same gate `orchestrate` applies to research.

```
## Audit — <repo> (<date>)

**Scope:** <what was read>  ·  **Findings:** <N> raw → <M> vetted

### Now
1. <one line> — <file:line> — <why it matters, why cheap>
...
### Next
### Watch

**Recommend promoting:** #1, #3, #4
```

Do not write briefs, do not start building, do not "just fix the easy one while
we're here." Wait for the pick.

### Step 6 — Write the picked findings as briefs

For each finding the user promotes, write a brief via **`corpus-flow` §2** — same
numbering rule (max across `todo/`, `done/`, `superseded/`, plus 1) and the exact
same template, so `plan-split-dispatch` can consume it unchanged:

```markdown
# Task <NN> — <Title>

## Context
<The finding, the evidence (file:line), why it matters. Link the audit.>

## Files you OWN
## Files you must NOT touch
## What to do
## Acceptance
```

Two rules specific to audit-born briefs:

- **Carry the evidence into the brief.** The executor is a fresh agent on a cheaper
  model — `file:line` plus the failure scenario is what makes it self-contained.
- **One finding per brief.** Bundling "fix these six debt items" produces a brief
  nobody can mark done, and defeats the dependency ordering in wave mode.

Then hand off: `plan-split-dispatch` for a batch, or inline for a 1–2 file fix.

## Model routing

| Seat | Model | Why |
|---|---|---|
| Recon, vetting, ranking, brief-writing | **opus** | judgment — the expensive half is deciding what is *not* real |
| Finders (per lens) | **sonnet** | reading and pattern-matching is junior work |
| One highest-risk finder | **opus** | optional; correctness/security only |

## Failure modes

- **Believing the finders.** The single biggest one. Unvetted findings are noise
  with citations. Step 3 is not optional.
- **Auditing everything.** A survey with no `SKIP` list burns context on
  `node_modules` and generated code and returns worse findings.
- **Re-finding locked decisions.** If you did not read `decisions.md`, you will
  report deliberate choices as debt and lose the user's trust in the whole list.
- **Sliding into building.** The gate at Step 5 exists because an audit that
  auto-builds is just an unreviewed refactor.
- **Ranking by severity label.** "Critical" on a code path that runs twice a year
  is not the most valuable thing you found.
