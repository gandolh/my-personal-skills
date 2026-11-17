# Task 38: brief-auditor leaves draft, or goes

## Context

`agents/brief-auditor.md` has said this since 2026-11-12: "DRAFT (2026-11-12,
a trial on 5 briefs, then kept or dropped)". The log and the wiki record the
agent's arrival (brief 29) and no result of the trial. On 2026-11-17 the
description still opens with DRAFT, in every session's agent list.

The trial has not run. The owner's session transcripts from 2026-10-19 to
2026-11-17 hold 48 `brief-builder` runs since the agent arrived and no
`brief-auditor` run.

**Picked by the owner, 2026-11-17: run the trial first, on Opus.** Brief 39
set the agent's model to opus, since review runs on Opus. The agent keeps its
DRAFT sentence until the trial's verdict.

What the trial will cost, as a rough guide: the nine per-brief review runs in
those transcripts wrote between 3k and 26k output tokens each (eight on sonnet,
one on opus).

## The pick

- **Keep.** Drop the DRAFT sentence from the description, and record in
  `docs/history.md` what the trial showed.
- **Drop.** Remove the agent, its name from `scripts/install-agents.mjs` and
  its test, and the lines in `plan-split-dispatch` that mention it.
- **Run the trial first (picked).** On the next five built briefs, in any
  repo, dispatch the auditor after the builder and before the controller's
  own pass. Record per brief, in this file under "Trial results": the
  acceptance lines it marked unmet that the controller confirmed, the lines it
  got wrong, what the controller's pass found that it missed, and its token
  cost. Then the owner picks keep or drop.

## Files you OWN

- `agents/brief-auditor.md`, `scripts/install-agents.mjs` and its test (for a
  drop), the lines that name the agent in `skills/plan-split-dispatch/` and
  `README.md`.
- Both plugin files, `docs/history.md`, `corpus/`.

## Acceptance

- The description no longer says DRAFT, or the agent is gone and nothing
  names it outside `docs/history.md` and the done briefs.
- The verdict and its reason are in `docs/history.md`.
- The version is bumped in both plugin files, the README and
  `docs/history.md`.
- Before either: five rows under "Trial results", and the owner's verdict.

## Trial results

None yet. One row per brief: the repo and brief, lines confirmed unmet, lines
wrong, missed by the auditor, tokens.
