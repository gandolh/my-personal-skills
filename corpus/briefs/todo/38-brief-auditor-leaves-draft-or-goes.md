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
DRAFT sentence until the trial's verdict. The user-level copy of the agent
keeps its old model until the owner re-runs `scripts/install-agents.mjs`, so
pass `model: opus` on every trial dispatch.

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

One row per brief: the repo and brief, lines confirmed unmet, lines wrong,
missed by the auditor, tokens.

| # | Repo and brief | Confirmed unmet | Wrong | Missed by the auditor | Tokens |
|---|---|---|---|---|---|
| 1 | imbatranimOS 89 (VP8 video regions; 2026-11-19, opus, 23 tool calls, 6 min) | 1 the controller had missed: "looks no worse" fails, VP8 colours shift (the controller sampled the shots: green 0,181,2 against 0,215,0 lossless). 2 more the controller had already ruled as deviations (no memory cap, H.264 offline only; the Android walk left to the owner). Review-only: no fallback when the decoder keeps failing, and no test for the connect URL. Both were missed by the controller and both went into the fix round. | 0. Marking the research numbers "unverifiable" was strict but fair: no raw logs back the offline CPU figures. | Nothing. The controller's own pass (diff read, full check, host tests) found no defect. | 119,203 |
| 2 | imbatranim-apps 16 (Slides' keys by job; 2026-11-19, opus, 27 tool calls, 4 min) | 1 the controller had missed: no test fails on the old handler for the new "controls that take the keys" rule. Review-only, 2 more the controller missed: Home and End still skip with a shape selected, even from a toolbar button (against the owner's rule); and the brief contradicted itself on Space ("Space only presses" against "the slide keeps every key"), an owner check. Both fixes went into a controller follow-up. | 0. It also corrected the builder's own report: the 360 shot was taken after the fix, not before. | Nothing. The controller's pass (full check, two shots, the key diff) found no defect of its own. | 58,245 |
| 3 | imbatranimOS 90 (Image Viewer by date, built in three parts; 2026-11-19, opus, 32 tool calls, 5.5 min) | 1 the controller had missed: after a photo opens from the grid while the dates are still read, the next and previous steps change order once the dates land, though the code's comment says they never do (a fresh test fails on the old code). Review-only, also missed: the outcome note's "a test each" for part 3's fixes holds for 2 of 3, and one of the 2 asserts class names; the year-in-heading rule had no test; the midnight test proved local days only off UTC; the grid says "No images" when the folder listing fails. Controller follow-up 20f248b (the order kept as the grid showed it, the year test, the class test dropped for the 390 shots, the test zone pinned) and a todo for the empty state. | 0 wrong. One finding (a spinner outside `motion-safe:`) is the base-ui skill's rule but against this repo's practice (21 spinners, none guarded): left, not in the brief's scope. It also marked the 2025 day groups unverifiable, fairly: no shot scrolls to them. | Nothing. The controller's pass (full check, three shots read, the walk-fix diff) found no defect of its own. | 116,475 |
| 4 | comercial-website 20 (wrong password tries limited; 2026-11-19, opus, 11 tool calls, 3 min) | 1 the controller had missed, and had read past: the limit is checked before the password hash's await and counted after it, so a parallel burst gets far more than 10 or 20 guesses (the controller had read the route order and called it right). Its 'unverifiable' on the trusted proxies turned out real when the controller looked: the piataro stack never set `TRUSTED_PROXIES`, so every visitor shared the gateway's address and anyone's 10 wrong tries would have locked the owner out (fixed in vps-deploy 9de250c before any deploy). Also: two tests that can't fail as written. Fix commit dispatched. | 0 wrong. | Nothing. | 49,256 |

