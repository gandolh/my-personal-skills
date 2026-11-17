# Task 38: brief-auditor leaves draft, or goes

**Blocked by:** the owner's verdict on the brief-auditor trial (keep, drop, or run the trial first).

## Context

`agents/brief-auditor.md` has said this since 2026-11-12: "DRAFT (2026-11-12,
a trial on 5 briefs, then kept or dropped)". The log and the wiki record the
agent's arrival (brief 29) and no result of the trial. On 2026-11-17 the
description still opens with DRAFT, in every session's agent list.

Whether the trial ran is the owner's knowledge: the estate build of
2026-11-10 to 2026-11-15 may have used the agent, and its notes are not in
this repo.

## The pick

- **Keep.** Drop the DRAFT sentence from the description, and record in
  `docs/history.md` what the trial showed.
- **Drop.** Remove the agent, its name from `scripts/install-agents.mjs` and
  its test, and the lines in `plan-split-dispatch` that mention it.
- **Run the trial first.** On the next five built briefs, dispatch the
  auditor after the builder and record per brief: acceptance lines it marked
  unmet that the controller confirmed, lines it got wrong, and its token
  cost. Then pick.

## Files you OWN (once unblocked)

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
