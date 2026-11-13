# Wave mode, configuration and failure modes, in full

Moved out of `SKILL.md` verbatim.

## Why it pays off, and when it does not

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

## Backlog / wave mode

Use this when the unit of work is a **set of pre-written briefs** with dependencies
between them (e.g. `corpus/briefs/todo/*`), not chunks of one fresh task. The briefs
already are the chunks; your job is to order, dispatch, verify, and integrate them.

**Only `corpus/briefs/todo/` is the backlog.** A brief in `corpus/briefs/blocked/` waits on
an outside condition (its `**Blocked by:**` line) and is in no wave. A brief that depends on
a blocked brief goes in no wave either: report it with that condition. Never move a file out
of `blocked/` without the owner (`corpus-flow` §2b).

1. **Build the dependency DAG.** Read each brief's *depends-on*, *Files you OWN*, and
   *Files you must NOT touch*. An edge = brief B consumes a file or contract brief A
   owns. (If briefs don't declare ownership, infer it — and prefer adding it.)
2. **Group into waves.** A wave = every brief whose dependencies are all already done.
   Two briefs are **parallel-safe in the same wave iff their OWN sets are disjoint** —
   this, not worktrees, is the cheap parallelism lever (see Configuration → Parallel
   dispatch). Dispatch a wave as multiple `Agent` calls in **one** message.
3. **Carry contracts forward.** Harvest each completed brief's **Handoff for dependents**
   and paste the relevant pieces into the prompts of briefs that depend on it. Dependent
   briefs are only as accurate as the contracts you thread in — don't make them re-derive
   an interface a prior brief already pinned down.
4. **Verify gate + checkpoint between waves.** After each wave, run the **Verify gate**.
   Then, if the user asked for per-brief / per-wave commits, commit each completed brief
   separately on the current branch (never a protected branch without asking). Only then
   dispatch the next wave. Present a one-line wave plan up front so the user sees the
   shape (`01 → 02‖08 → 03 → 04‖06 → 05 → 07`).
5. **Standing authorization.** If the user pre-authorized the whole build ("build all the
   briefs", "be the master orchestrator", "just go"), present the wave plan **once** and
   execute through it — don't re-gate every wave. Reserve the Step-3 confirm gate for
   genuinely ambiguous scope. Closeout (move briefs to done, log, fold findings —
   including any deviations/discovered-gaps the agents reported — into the wiki) is the
   controller's, via `corpus-flow` §4.

6. **Pause & checkpoint on demand (quota / session boundary).** If the user says they are
   near a quota/usage limit or asks to pause, **stop at the next wave boundary** (never
   mid-wave with subagents in flight) and write a durable resume point to the corpus before
   ending: which waves/briefs are **done** (with their Handoff-for-dependents contracts),
   which are **in-flight or next**, the current branch + last commit, and any open decisions.
   Put it at `corpus/log.md` (or a `corpus/resume-<date>.md` brief) so a **fresh session can
   pick up cold** without re-deriving state. When the run leaves deploys for the owner,
   dispatch `owner-steps` (read only) for the deploy list (one ordered checklist per
   stack, each phase checked against the paths its tickets changed), and put its list
   in the resume point. Do the same at the end of a session. Confirm what was written and stop — do not start
   another wave. This is a first-class action, not a failure mode.

Each brief is dispatched with the Step-4 template and must return a **Handoff for
dependents** section.

## Configuration

- **Default model routing**: trivial = haiku, junior = Sonnet, senior = opus,
  controller = opus. **Bias to the cheapest tier that can do the chunk** — opus is the
  exception (novel/risky/security/data), not the default. Current-generation Sonnet is a
  strong *executor* — reliable on well-specified, well-gated chunks **including medium-hard
  ones** (not just mechanical copies), so **bias borderline chunks → junior** rather than
  reflexively senioring them. Review finders default to Sonnet (Step 7). **Keep opus in the
  controller/verify seat — do NOT promote Sonnet to it**: the controller's value is planning
  the grounded briefs the executors succeed *inside*, plus being a *stronger second opinion*
  at verify time and making the expensive-if-wrong calls (design/contract decisions,
  real-bug-vs-stale-test adjudication). Hard objective gates (tests, determinism/
  byte-identity checks) are the net that makes routing risky chunks down safe. Keep the
  controller's own turns lean (don't echo subagent diffs) so the one unavoidable opus seat
  stays cheap. Override per-chunk when the user asks ("do all of these on sonnet to save
  cost" / "promote chunk 3 to opus").
- **Parallel dispatch**: only within a parallel-safe group, and only for chunks
  that edit disjoint files. Never run two implementers against the same file in
  parallel.
- **File lanes** (preferred over worktree when feasible): when two parallel chunks
  would *otherwise* both touch a shared hub file (a central `main.ts`, a barrel, a
  router), split the work so each owns a disjoint set of files and state the lane
  **explicitly in each chunk prompt** ("you may edit ONLY X/Y; chunk N owns Z — do not
  touch it; if you can't avoid Z, report BLOCKED"). This keeps them genuinely
  disjoint → safe to run in one message, no worktree/merge overhead. Each chunk's
  transient typecheck errors from the other's half-done hub edits are expected; verify
  the *combined* gates after both land. Reach for worktree only when the edits can't be
  cleanly laned apart.
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
