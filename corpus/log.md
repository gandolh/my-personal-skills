# Log

## [2026-11-06] done | Brief 01 - the corpus skills learn blocked briefs and todos

`corpus-flow` gained §2b and the four-folder rules, and `plan-split-dispatch`,
`orchestrate`, `improve` and `grill-me` follow it (v0.34.0). This repo's own
corpus was bootstrapped in the same run. Verified by the acceptance grep, this
repo's lint and a scratch-corpus lint with passing and failing cases. See
[the brief](briefs/done/01-the-corpus-skills-learn-blocked-briefs-and-todos.md).

## [2026-11-09] todo | Briefs 02-27: Base UI, Tailwind, code structure, a house style, and ideas from thirteen skill repos

The owner asked whether to build a shared component library over Base UI.
The verdict was no: share conventions, not components. Then the owner asked
for briefs, with research only and nothing built before the grilling on
2026-11-10. The briefs:

- 02 and 03: two skills, Base UI with Tailwind, and the Fastify and React
  structure.
- 04: the version bump to 1.9.0.
- 05-14: a whole-app Tailwind migration per plain-CSS app.
- 15 and 16: the rollout and enforcement.
- 17-26: one brief per reviewed skill repo (superpowers, mattpocock, ecc,
  andrej-karpathy-skills, opencode, orca, claude-mem, taste-skill,
  cloudflare security-audit, t3code).
- 27: the measured house style and a two-layer quality harness (`npm run
  check`, and Claude Code hooks).

Shelfmark, Newspapper, public-resource-map and presentation-sites each got
one brief in their own corpus. Sources were read in scratch clones, pinned
by commit. Two spikes back briefs 02 and 03. Questions for the grilling are
in [open-questions.md](wiki/open-questions.md).

## [2026-11-10] resume | Repo-local briefs: 10 repos written, 12 to go, Phase B not started

The cloud session paused on the owner's request after usage limits.

- **Briefs.** Repo-local briefs (house style, Base UI conventions, Tailwind,
  server structure, bumps) are in Almanac (the reference), Satchel,
  the-board, Newspapper, wicket, Shelfmark, Postern, lantern and ward-auth,
  with a partial set in mini-projects. Each is on its repo's one draft PR.
- **New questions.** Their cross-repo questions are Q47-62 on
  [open-questions-from-the-repo-briefs.md](wiki/open-questions-from-the-repo-briefs.md).
- **The hand-off** is [resume-2026-11-10.md](resume-2026-11-10.md): the
  remaining repos, the method, the repo notes, and the prompt for the next
  session.

## [2026-11-10] grill | The corpus follows the owner's answers

After the grilling of 2026-11-10 (Q1-62 answered):

- **Trackers.** Briefs 04 (Base UI bumps), 15 (harness, conventions,
  Tailwind per repo, the migration order) and 16 (the server brief per repo)
  became trackers of the repo-local briefs.
- **Superseded.** Briefs 05-14 moved to `briefs/superseded/`, each replaced by
  its repo's own Tailwind brief.
- **Blocked.** Brief 22 moved to `briefs/blocked/` (no second vendor's CLI).
- **Revised.** 02, 03 and 27 gained the answers and the facts as dated
  decisions. 17 became "finish on main", 24 "Vendor Hallmark, and adopt
  taste-skill 2.5's ideas". 19, 25 and 26 took Q30, Q34 and Q35.
- **New.** Brief 28, *The estate redesign board*.
- **Wiki.** `open-questions.md` and the Round 8 page now point at the two
  grilling pages.

