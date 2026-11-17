# Task 32: grill-me asks one explained question at a time

## Context

`grill-me` tells the interviewer to put the whole frontier in one numbered
round, and lists "asking one question at a time" as a failure mode. The owner
has corrected that three times:

- **2026-10-07**, in another project: a round of four terse questions was sent
  back with "unslop and explain each question before asking".
- **2026-10-16**, in a calendar app's grill: a round of eleven numbered
  questions, then a second round of three. The owner answered none of it and
  wrote "unslop the questions and ask me one by one. Explain them and try to
  keep them short."
- **2026-10-26**, in another project: five defaults bundled as one "accept
  these?" question were sent back the same way. A bundle of defaults is still
  a round.

On 2026-11-09 the owner added a second rule: "go with recommended, ask only if
it's something about taste." Technical calls (formats, naming, layout,
mechanism) are the interviewer's to decide by convention, record and report.

The skill is the most called first-party skill after `unslop` (37 calls in the
stocktake of 2026-11-13), so every session pays for the wrong default. Each
correction so far lives only in a session's memory.

## Files you OWN

- `skills/grill-me/SKILL.md`: the description, the section on rounds, the
  facts section, the failure modes.
- `skills/stocktake/references/scenarios/grill-me.md`: the contract line and
  the compliance lines that ask for a round.
- `README.md` (the `grill-me` row and the version line), `docs/history.md`,
  both plugin files, `corpus/`.

## Files you must NOT touch

- Other skills. `orchestrate` and `corpus-flow` point at `grill-me` by name
  and say nothing about rounds.
- `evals/`: the two triggering cases test loading, not the round.

## What to do

1. Replace "Work the tree in rounds" with one question per message, in
   dependency order. Keep the tree and the frontier: the interviewer still
   computes the order, the user sees one question. No "mode" switch.
2. Give the question a fixed shape: a short title with how many are left, why
   it matters in a sentence or two, the options with their cost, a
   recommendation. Say that a bundle of defaults is a round too.
3. In the facts section, add the third kind of question: a technical call
   that a convention or the codebase answers is decided, recorded and
   reported in one line, not asked. Taste, scope and anything hard to reverse
   that no convention settles stay with the user.
4. Flip the failure mode: asking a round is the failure, and so is asking a
   technical call.
5. Update the scenarios and the README row to match. Bump the version.

## Acceptance

- `skills/grill-me/SKILL.md` has no instruction to ask more than one question
  in a message, and its failure modes name the round.
- The scenarios' compliance lines ask for one explained question with a
  recommendation, and "Fails" names a numbered round.
- `node scripts/check-skills.mjs`, `node skills/stocktake/scripts/measure.mjs`
  (no 5,000-token cut inside the skill) and `bash corpus/lint.sh` pass.
- The version is bumped in both plugin files, the README and
  `docs/history.md`.
- Owner step, not the builder's: the paid evals for a front-door skill
  (`corpus/CLAUDE.md`, "Skill changes").

## Outcome (2026-11-17)

Built in v0.55.0 (606f378). `skills/grill-me/SKILL.md` asks one frontier question per message in a fixed shape (title and count, why it matters, options with their cost, a recommendation), with four numbered rules, and decides technical calls itself. The failure modes name the round and the asked technical call. The scenarios and the README row follow. Checks: `check-skills` 0 failing, `measure.mjs` 2,828 tokens on invoke with no cut, `corpus/lint.sh` clean. Not done here: the paid evals for a front-door skill, which are the owner's step before the plugin update.
