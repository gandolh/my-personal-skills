# Task 20: Surgical changes in plan-split-dispatch's chunk contract (from andrej-karpathy-skills)

## Context

On 2026-11-09 the owner asked for popular skill repos to be reviewed for
ideas. **multica-ai/andrej-karpathy-skills** was read at `2c60614`
(2026-04-20). It is one `CLAUDE.md` and one skill derived from Andrej
Karpathy's post on LLM coding pitfalls. Models assume silently, overbuild,
and change code they don't understand as a side effect. It answers with
four principles:

1. **Think before coding.** State assumptions, present interpretations,
   push back, stop when confused.
2. **Simplicity first.** Nothing beyond the ask, no single-use
   abstractions, no unrequested configurability, "if 200 lines could be 50,
   rewrite it".
3. **Surgical changes.** Touch only what you must, match the existing
   style, mention unrelated dead code but don't delete it, remove only the
   orphans your change made. The test: every changed line traces to the
   request.
4. **Goal-driven execution.** Success criteria first, loop until verified.

**The repo ships no license file**, so nothing can be vendored or quoted.
Ideas only, credited, under this library's "Adopt ideas, copy no text"
decision.

What this library already has:

- Principles 1 and 4 are in `grill-me` and `plan-split-dispatch`'s verify
  gate.
- Principles 2 and 3 are partly in briefs ("Files you OWN / must NOT
  touch").

Neither is in the instructions a dispatched subagent receives, or in what
the review gate checks. A junior chunk on Sonnet gets the brief's file
list but no rule against tidying the neighbourhood. The same day's briefs
16 and 05-14 will dispatch large refactors across many repos, which is
where drive-by edits hurt most.

## Files you OWN

- `skills/plan-split-dispatch/SKILL.md`: the chunk prompt template and the
  review gate's checklist.
- `ATTRIBUTION.md` (Influences), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- Other skills. If `grill-me` needs the "stop when confused" line, that is a
  separate change.

## What to do

1. **The chunk prompt template** gains a short "Scope discipline" block:
   - every changed line traces to the chunk's goal;
   - match the file's existing style;
   - don't refactor, reformat or delete code outside the chunk; list it in
     the hand-back under "Noticed, not touched";
   - remove only the imports, variables and functions this chunk orphaned;
   - no new abstraction for a single use, no options nobody asked for;
   - if the chunk can't be done as specified, stop and report. Don't widen
     it.
2. **The review gate** gains two checks:
   - **(a) Scope:** the diff against the chunk's declared files, with any
     file outside them a finding unless the hand-back justifies it.
   - **(b) Proportion:** a diff much larger than the plan's estimate is
     flagged for a second look.
   Also **(c) "skip style"**, from Claude Code's best-practices page
   (2026-11-09): the reviewer reports gaps against the brief and
   correctness problems, not style. Style is the formatter's and the
   linter's job (brief 27). "A reviewer that's asked to find problems will
   always find *something*. If you fix every finding, you end up with extra
   abstraction layers and tests for cases that can't happen." Make the
   review subagent read-only through its tool list (`Read, Grep, Glob`, and
   Bash for the checks) rather than by instruction.
3. The hand-back format gains the "Noticed, not touched" list. The
   controller files those items as corpus todos, not as fixes.
4. **Review findings (folded in from superseded brief 17, 2026-11-13).**
   The review gate classifies each review finding as correct, unclear,
   wrong or out of scope. A correct one is verified against the code before
   any change; an unclear one gets one question; a wrong one gets the
   evidence; an out-of-scope one becomes a corpus todo, and the reply says so.
5. Credit the Karpathy-derived principles in `ATTRIBUTION.md` (Influences,
   no text copied, and say why: no license), and bump the patch or minor
   version.

> Update 2026-11-13: the "skip style" check (c) already landed in
> `references/review-and-verify.md` (finders skip style the linter owns) and
> in `agents/brief-auditor.md`, and `agents/brief-builder.md` already forbids
> tidying. What remains: the chunk-template block, the "Noticed, not
> touched" list, checks (a) and (b), the finder tool list, and step 4's rule.

## Acceptance

- The chunk template and the review gate contain the new blocks, and the
  skill stays under its current length plus about 30 lines.
- The review gate text carries the four-way classification of review
  findings and what each one gets (verify, one question, evidence, a corpus
  todo).
- A dry run on a scratch repo, with a chunk whose target file has unrelated
  dead code next to it: the hand-back lists the dead code under "Noticed,
  not touched", and the diff doesn't touch it.
- `bash corpus/lint.sh` passes, and the version is bumped.

## Outcome (2026-11-13)

Built in v0.50.0 (b5c8f3a). The chunk template gained a Scope discipline block and the hand-back a "Noticed, not touched" list (`references/templates.md`); the review gate gained the scope and proportion checks, the read-only reviewer rule and the four-way review-finding classification (`references/review-and-verify.md`), with short pointers in `SKILL.md` (4,681 tokens, inside the first 5,000). "Skip style" had already landed. Not done: the scratch-repo dry run, which needs a live dispatch.
