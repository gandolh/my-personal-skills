# Task 18: A diagnose skill and a skill-writing guide (from mattpocock/skills)

> Cut down 2026-11-13 (owner, backlog grill answer 1): the `owner-steps` wizard is dropped, because the `owner-steps` agent (`agents/owner-steps.md`, brief 29) already turns a corpus's "Next (owner)" list into the owner's checklist. Kept: the `diagnose` skill and `docs/writing-skills.md`. Steps 2 and the owner-steps file, the corpus-flow pointer and the owner-steps acceptance line below are void.

## Context

On 2026-11-09 the owner asked for popular skill repos to be reviewed for
ideas. **mattpocock/skills** was read at `4ae2317` (2026-10-31, MIT, Matt
Pocock).

This library already took `grill-me`'s round method and the
glossary/decision discipline from it (`ATTRIBUTION.md`). A third idea,
dependency-cruiser for import boundaries (`setup-ts-deep-modules`), went
into brief 03 the same day.

What is left that this library lacks:

- **`diagnosing-bugs`** (138 lines). Its core claim is that the feedback
  loop is the skill.
  - Phase 1 builds a tight, deterministic pass/fail signal that goes red on
    this bug. It lists ten ways to build one, in order: failing test, curl
    script, CLI with a fixture, headless browser, replaying a captured
    trace, a throwaway harness, a fuzz loop, a bisection harness, a
    differential run, and a human-in-the-loop script.
  - It says what to do when no loop can be built: stop, list what was
    tried, ask for access or an artifact.
  - It redacts secrets in everything it shows.
  - Only after the loop exist hypotheses, instrumentation and the fix.

  superpowers' `systematic-debugging` (283 lines, brief 17) says the same
  things: root cause before any fix, one hypothesis at a time. This library
  has no debugging skill at all. Its only debugging guidance is the
  "bounded escalating fix loop" in `plan-split-dispatch`, which covers a
  failing chunk, not a bug report.
- **`wizard`.** It generates an interactive bash script that walks a human
  through steps only they can take: provisioning, credentials, a
  third-party dashboard. Every corpus here ends its status page with
  "Next (owner)" steps in prose: Shelfmark's deploy and phone checks,
  vps-deploy's hardware. A wizard makes those steps runnable and
  checkable.
- **`writing-for-agents`.** Rules for writing skills and `CLAUDE.md` files:
  - context pointers;
  - the two loads (what the agent must hold versus look up);
  - information hierarchy;
  - steps with completion criteria;
  - when to split a file;
  - leading words;
  - pruning.

  This library is a repo of agent-facing text, and it has no such rule set
  of its own. `writing-guidelines` (Vercel) is for human-facing docs.

Weighed and left out:

- `tdd`, `prototype`, `retro`: thin, or covered by `plan-split-dispatch`'s
  verify gate.
- `to-tickets`, `triage`, `wayfinder`: they assume an issue tracker, and
  this estate tracks work in `corpus/briefs`.
- `handoff`: corpus-flow's `resume` log entry already does it.
- `git-guardrails-claude-code`: cloud sessions already gate pushes.
- Everything in `misc/` and `in-progress/`: the author's own bar marks
  these frozen or unfinished.

## Files you OWN

- `skills/diagnose/SKILL.md` (new) and
  `skills/diagnose/scripts/hitl-loop.template.sh` (new, written fresh).
- `skills/owner-steps/SKILL.md` (new; the wizard).
- `skills/corpus-flow/SKILL.md`: one pointer from the status page's "Next
  (owner)" convention to `owner-steps`.
- `docs/writing-skills.md` (new): this library's rules for agent-facing
  text, linked from `corpus/CLAUDE.md`'s Writing section.
- `ATTRIBUTION.md`, `README.md`, `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- `grill-me`, `improve`, and the vendored skills.

## What to do

1. **`diagnose`.**
   - Phase 1 is the loop. Use the ten ways, adapted to this estate:
     vitest or `node:test`; `curl` against `tsx watch`; Playwright from
     `ui-test-plans`; `git bisect run`.
   - The "no loop, stop and ask" rule, and redaction.
   - Phase 2: one hypothesis at a time, each with a prediction the loop can
     check.
   - Phase 3: the fix, plus the loop kept as a regression test where the
     repo's test decisions allow it. Shelfmark's "nothing boots the app" is
     one such decision.
   - The finding goes into the corpus: a `log.md` `incident` entry, and the
     wiki page for the area.

   Credit Pocock and superpowers, and copy no text.
2. **`owner-steps`.** From a corpus's "Next (owner)" list, or from a brief's
   owner steps, it generates `scripts/owner-steps.sh`:
   - one stage per step;
   - each stage says what to do and where, and waits for Enter;
   - then it runs a check where one exists, such as `curl` for a deploy or
     `git log` for a push, and records the outcome.

   The skill writes the script, runs `bash -n` on it, and hands it over. It
   never runs the human's steps itself.
3. **`docs/writing-skills.md`.** This library's own rules:
   - a description written for the agent deciding whether to load;
   - the body under about 300 lines, with detail in `references/`;
   - numbered rules each tied to a check;
   - completion criteria per step;
   - no machine paths and no other repos' paths;
   - plain English (the corpus `CLAUDE.md` already says this).

   It takes Pocock's headings as a checklist, and is written fresh.
4. Credit both upstreams in `ATTRIBUTION.md`, add the README rows and the
   history entry, and bump the minor version.

## Acceptance

- `diagnose` loads on "debug this", "diagnose", "it's broken", "this test
  fails sometimes". A dry run on a seeded bug in a scratch repo, such as an
  off-by-one in a date helper, builds a red loop before proposing any fix.
- `owner-steps`, run on Shelfmark's status page as it stood on 2026-11-04
  (copied to scratch), produces a script that passes `bash -n` and has one
  stage per owner step.
- `docs/writing-skills.md` exists and is linked from `corpus/CLAUDE.md`.
- `bash corpus/lint.sh` passes, and the version is bumped.

## Outcome (2026-11-13)

Built in v0.51.0 (9c4f2a0), cut down: `skills/diagnose/` (loop first, ten ways, stop-and-ask, redaction, one hypothesis at a time, the loop kept as a regression test, an `incident` entry) and `docs/writing-skills.md` (14 numbered rules, each with its check). The `owner-steps` wizard was dropped on 2026-11-13. Not done: the seeded-bug dry run, which needs a live session.
