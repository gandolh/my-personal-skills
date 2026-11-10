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


## [2026-11-10] done | Brief 21 - the library meets the Agent Skills format

Added `scripts/check-skills.mjs` and called it from `corpus/lint.sh` (v0.35.0).
It found one invalid description (`improve`, an unquoted `: `), now fixed. The
two long descriptions in the brief were already under 1,024 characters. See
[the brief](briefs/done/21-the-library-meets-the-agent-skills-format-from-opencode.md).

## [2026-11-10] progress | Brief 27, the library half: the house-style skill and the hooks (v0.36.0)

- **Skill.** `skills/house-style/` writes the house style as 25 numbered rules,
  each with its rule id or "review", and the adoption order; its references
  hold the adoption traps and the review checklist, which
  `plan-split-dispatch`'s review gate now hands the conventions finder.
- **Hooks.** `hooks/hooks.json` formats each saved file with the repo's own
  Prettier and runs `check:fast` at `Stop` when the session saved code in that
  package, blocking again only while the failure changes, at most four times
  a turn.
- **Wiki.** The measurements are collated from the 23 repo harness briefs on
  [house-style.md](wiki/house-style.md) and
  [house-style-part-2.md](wiki/house-style-part-2.md), with four counts for
  the owner. [decisions.md](wiki/decisions.md) records house-style as a
  library folder (the owner's call), the width of 120 and the tsconfig flags.
- **Briefs.** 02, 03 and 15 now ship their checkers as house-style's
  `bin/check-base-ui.mjs` and `bin/check-structure.mjs`, run from each repo's
  `vendor/house-style/`, at the next minor version.
- **Left:** the `house-style/` folder, its tag and Wicket's proof run. The
  brief stays in `todo/`. See
  [the brief](briefs/todo/27-a-house-style-and-a-quality-harness.md).

