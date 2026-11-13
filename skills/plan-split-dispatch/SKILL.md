---
name: plan-split-dispatch
description: Repo-agnostic implementation orchestrator. The controller (opus) plans a coding task, splits it into independent chunks, classifies each as hard or easy, then dispatches hard chunks to a subagent on opus ("senior") and easy chunks to a subagent on sonnet ("junior") — each a fresh subagent with curated context. Routes cheap tokens to cheap work. Use when the user says "split this into chunks", "implement with subagents", "plan with opus and do the easy parts on sonnet", "route by difficulty", "/plan-split-dispatch", or asks to carry out a multi-step coding task that decomposes into several independent pieces. Also runs a backlog of pre-written briefs in dependency waves with a verify+checkpoint gate between waves — say "build all the briefs", "run the backlog in waves", "be the master orchestrator". NOT for one- or two-file changes — the orchestration tax outweighs the work; just edit those inline.
---

# Plan, Split, Dispatch — model-routed subagent implementation

You (the controller) stay in this session on **opus**. Your job is **not** to
write the code: it is to **plan, split, classify, dispatch, and integrate**.
Subagents do the edits. Dispatch **one fresh subagent per chunk**, and curate
exactly the context each needs: they never inherit your conversation history.
That is what makes the run cheap and failure-resistant.

Dispatch the library's **`brief-builder`** agent when it is installed, else the
built-in `general-purpose` agent with the run's common rules file, with an explicit
`model` per chunk either way. The workflow agents (`brief-builder`,
`screen-capturer`, `brief-auditor`, `owner-steps`) are installed at user level by
`scripts/install-agents.mjs`, because Claude Code ignores frontmatter hooks in
plugin agents. Dispatch the bare name (`brief-builder`), never the plugin copy
(`personal-skills:brief-builder`), which runs without its guard.

**Front door.** This is the generic implement target of `orchestrate`, which
passes the brief and the matched rows of the project's **READ / SKIP / SKILLS**
table from `corpus/routing.md`. Use them to fill each chunk's `Read` / `Skip` /
`Skills`. Invoked directly, read `corpus/routing.md` yourself if it exists.

Templates (the chunk block, the plan, the dispatch prompt, the delivery, the ledger)
are in [`references/templates.md`](references/templates.md). The finder fan-out and
the verify passes are in [`references/review-and-verify.md`](references/review-and-verify.md).
Wave mode in full, the configuration and the failure modes are in
[`references/wave-mode-and-configuration.md`](references/wave-mode-and-configuration.md).

## When to use, and when not to

- **Use** it for **≥3 independent chunks**, several of them mechanical, or for a
  backlog of pre-written briefs with dependencies (wave mode, below).
- **Do not** use it for a one- or two-chunk task or a single-file edit: do it
  inline. The plan, classify and context-curation overhead costs more than the work.
  This is the commonest misfire.
- One indivisible hard problem: inline on opus. Pure review: a review skill.
  Research only: the `Explore` agent.
- Undersizing backfires: a sonnet chunk that stalls, goes `BLOCKED` and is
  re-dispatched on opus costs more than opus once.

## The steps, in order

1. **Plan** (inline). A numbered list of self-contained chunks: Files, Goal,
   Acceptance, Read, Skip, Skills, Tests, Constraints, Depends on. Two chunks
   with no dependency and disjoint files are **parallel-safe**.
2. **Classify.** Tag each chunk:
   - **Senior (opus):** security, auth, access control, secrets, crypto; schema or
     data migrations and anything that mutates persisted state irreversibly;
     concurrency and transaction boundaries; cross-module contracts and public API
     surface; new design whose acceptance has gaps; refactors across module
     boundaries.
   - **Junior (sonnet):** a single-file edit with clear acceptance; a call, query
     or component that follows an existing pattern; tests for existing logic;
     copy and i18n; formatting, lint fixes, dead code; type propagation.
   - **Trivial (haiku):** find-and-replace against an explicit spec, with zero
     judgement.
   - **The reference-pattern rule, the biggest cost lever:** the chunk that
     FIRST establishes a pattern, contract or subsystem is senior; later chunks
     that copy that in-repo reference are junior, even when they look large. A
     healthy plan is mostly junior with a few senior chunks.
   - **When in doubt, senior, but only for genuine risk** (security, data,
     concurrency, novel design). A borderline pattern-copy starts as junior;
     escalate-on-block (step 5) is the safety valve.
3. **Confirm with the user (MANDATORY).** Show the plan: goal, tagged chunks with
   one line on why each tier, parallel-safe groups, estimated dispatches. Wait for
   `yes`, `re-classify` or `re-scope`. Dispatch nothing before the reply.
4. **Dispatch**, per chunk, in dependency order. Send a parallel-safe group as
   multiple `Agent` calls **in one message**. `model: opus` for senior, `sonnet` for
   junior. Fill the prompt template from the chunk and curated context. Every
   dispatch asks for a Status (DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT),
   files changed, tests, concerns or blocker, and a **Handoff for dependents** (the
   exact signatures, paths and data shapes downstream work consumes) and a
   **Noticed, not touched** list. Every prompt carries the **Scope discipline**
   block from the templates: each changed line traces to the chunk. Subagents do
   not commit, push or open a PR. A junior prompt carries a line telling it to
   STOP with BLOCKED rather than stretch into a senior area. `Skip` is advisory
   scoping, not a licence: if a Skip area is load-bearing, report BLOCKED. A
   `brief-builder` is for brief-backed runs; for a fresh chunked task its body
   leaves commits and board moves to you, and step 8's "don't commit unless
   asked" still holds.
5. **Handle status.** DONE: proceed. DONE_WITH_CONCERNS: fix first if it affects
   correctness, else note it. NEEDS_CONTEXT: supply it and re-dispatch. BLOCKED:
   a context gap, provide it; a junior out of depth, re-dispatch as **senior**
   (the rule working, not a failure); a wrong plan, escalate to the user; **two
   failed attempts, escalate, never a third loop**. **Never** re-dispatch with the
   same prompt: something must change between attempts.
6. **Run straight through.** After step 3, execute the whole plan without checking
   in between chunks. Valid stops: an unresolvable BLOCKED, a genuinely blocking
   ambiguity, all chunks done, and in wave mode each wave boundary. Between chunks
   send a few status lines; never echo a subagent's diff or re-narrate the plan.
7. **Review gate (mandatory for any multi-file run).** Review the cumulative diff.
   For a substantial build dispatch 2–3 focused finders in parallel, scoped by
   area or risk, each returning `{file, line, summary, failure_scenario}`. Finders
   default to sonnet; at most one opus finder, on the highest-risk lens.
   The gate also checks **scope** (a file outside the chunk's declared files is
   a finding unless the hand-back justifies it) and **proportion** (a diff much
   larger than the plan's estimate gets a second look). Reviewers report gaps
   against the brief and correctness, never style, and run read-only (`Read, Grep,
   Glob`, Bash for the checks). Each review comment is classified correct,
   unclear, wrong or out of scope; the rules are in `references/review-and-verify.md`.
   File each "Noticed, not touched" item as a corpus todo, not a fix.
   Consolidate and dedup yourself, then dispatch **one fix agent whose tier follows
   the fix**, re-verify, and stop. For a brief-backed run the gate is
   `brief-auditor` on each brief, plus `/security-review` on briefs that touch auth,
   tokens, cookies or personal data. Skip only a 1–2 file, one-chunk run, and
   say so. **The fix loop is bounded and escalates:** rounds 1–3 the fix tier
   follows the fix, with the gates re-verified after each; rounds 4–5 escalate one
   tier above the original implementer; **past round 5, stop** and report
   `needs-discussion`: the chunk was mis-specified. Only **Critical** and
   **Important** findings gate the run; log the rest as known-and-accepted, and
   make no unrequested "while I was in there" fix.
8. **Deliver** with the shape in the templates: chunks, files, review verdict, fix
   rounds, accepted-not-fixed, suggested next, and the ruling ledger. Do not
   commit, push or open a PR unless the user asked.

## The verify gate: the iron law

A subagent's "tests pass" is **not** sufficient. Verify from the controller, against
the integrated tree, between waves and before final delivery.

> **No completion claim without fresh verification evidence.** If you have not run
> the command *in this turn*, you cannot say it passes: not "should pass", not
> "passed earlier", not "the agent said it passes". Name the command that proves it,
> run it in full, read the exit code and the failure count, then claim it, **with**
> the evidence. A green claim on stale evidence is the most expensive thing in a
> long run, because every later wave is built on it.

For a brief-backed run, the gate per brief result is three passes, in order:
`verify-brief` (`node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-brief.mjs <repo> <base>`),
then `brief-auditor`, then your own pass over the risky diffs. For a chunked run:
typecheck the workspace, build every package dependents consume, run the touched
packages' tests, and check the new files are **tracked, not ignored** (`git status
--porcelain`, and `git check-ignore` empty for a new source directory). Do not
proceed past a failure: re-dispatch the owning chunk with the specific error before
the next wave. The passes in full: `references/review-and-verify.md`.

## The ruling ledger (survives compaction)

A long run outlives its context, and the *decisions* are lost first. **Append one
line to a running ledger every time you decide something a future controller would
otherwise have to guess at**: why a chunk was split, why a finding was rejected, why
a chunk was re-dispatched, why a gate failed. Keep it in the working notes, and
**restate it in the step 8 delivery**. For a brief-backed run, fold the durable
rulings into `log.md` at closeout via `corpus-flow` §4. Rulings are decisions, not
narration: do not log "started chunk 4." An example is in the templates.

## Backlog / wave mode (a set of pre-written briefs)

The briefs already are the chunks: order, dispatch, verify and integrate them.

- **Only `corpus/briefs/todo/` is the backlog.** A brief in `blocked/` is in no
  wave, and neither is one that depends on it: report it with its condition. Never
  move a file out of `blocked/` without the owner (`corpus-flow` §2b).
- **Build the DAG** from each brief's depends-on, *Files you OWN* and *Files you must
  NOT touch*. A **wave** is every brief whose dependencies are all done. Two briefs
  are parallel-safe in one wave **iff their OWN sets are disjoint**; dispatch a
  wave as multiple `Agent` calls in one message.
- **Carry contracts forward:** paste each finished brief's Handoff for dependents
  into the prompts of the briefs that depend on it.
- **Verify gate and checkpoint between waves**, then commit each brief separately if
  asked (never to a protected branch without asking). Show a one-line wave plan up
  front (`01 → 02‖08 → 03 → 04‖06 → 05 → 07`).
- **Standing authorization:** if the user pre-authorized the build ("build all the
  briefs", "just go"), present the wave plan once and run through it. Closeout (done,
  log, fold findings and deviations into the wiki) is the controller's, via
  `corpus-flow` §4.
- **Pause and checkpoint on demand.** On a quota or session limit, stop at the next
  **wave boundary** (never mid-wave) and write a resume point to `corpus/log.md`:
  briefs done with their contracts, in-flight or next, branch and last commit, open
  decisions. When deploys are left for the owner, dispatch `owner-steps` for the
  list and put it in the resume point. Then stop; this is a first-class action.

## Configuration, at a glance

Routing: trivial haiku, junior sonnet, senior opus, controller opus; bias to the
cheapest tier that can do the chunk. Parallel dispatch only over disjoint files, with
file lanes before a worktree. At most two retries per chunk. The full text and the
failure modes are in
[`references/wave-mode-and-configuration.md`](references/wave-mode-and-configuration.md).
