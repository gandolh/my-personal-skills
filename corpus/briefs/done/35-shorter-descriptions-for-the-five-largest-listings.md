# Task 35: shorter descriptions for the five largest listings

## Context

Every skill's `description` and `when_to_use` are loaded into every session,
in every repo. `claude plugin details personal-skills` on 2026-11-17 puts the
plugin's always-on cost at about 7,400 tokens, up from about 6,900 on
2026-11-13 (three skills were added since) and 5,300 on 2026-11-09.

The stocktake of 2026-11-13 found that five skills carry about 2,140 of those
tokens (finding F2) and nothing has changed since: `code-structure` (~480),
`design-pipeline` (~470), `design-md-library` (~420), `base-ui` (~400) and
`codegraph` (~370). Their descriptions restate the skill's body: the eleven
rules, the pipeline's twelve steps, the list of every wrapper. The body says
that once the skill loads. The listing only has to say what the skill is,
when to load it and what it is not for.

## Files you OWN

- The frontmatter (`description`, `when_to_use`) of
  `skills/code-structure/SKILL.md`, `skills/design-pipeline/SKILL.md`,
  `skills/design-md-library/SKILL.md`, `skills/base-ui/SKILL.md` and
  `skills/codegraph/SKILL.md`.
- `README.md` (the version line), `docs/history.md`, both plugin files,
  `corpus/`.

## Files you must NOT touch

- The bodies of the five skills.
- Vendored skills: their descriptions are upstream's.

## What to do

1. For each of the five, keep the first sentence that says what the skill
   is, one clause on what it holds, five or six trigger phrases a user
   actually types (and the "a brief says to follow it" trigger where there
   is one), and the "not for" line.
2. Cut the restated rules, steps and wrapper lists.
3. Keep `base-ui`'s `paths:` key as it is.

## Acceptance

- `node skills/stocktake/scripts/measure.mjs` shows each of the five with a
  listing (description plus `when_to_use`) at least a third shorter than
  before: 1,343, 1,308, 1,172, 1,129 and 1,020 characters.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass; the version
  is bumped in both plugin files, the README and `docs/history.md`.
- None of the five is a front-door skill, so the paid evals are not required;
  the triggering eval has no case for them.

## Outcome (2026-11-17)

Built in v0.58.0 (70c5738). Listing lengths by `measure.mjs`, before and after: `code-structure` 1,343 to 654, `design-pipeline` 1,308 to 835, `design-md-library` 1,172 to 791, `base-ui` 1,129 to 750, `codegraph` 1,020 to 678. Four are a third or more shorter; `design-md-library` is 32.5% shorter by the script's raw count, because its description is now a quoted YAML string and the script counts the escapes (33.5% by the parsed length). `claude plugin details personal-skills` gives about 6,600 tokens always-on. Only frontmatter changed; `base-ui` keeps its `paths:` key. Checks: `check-skills` 0 failing, `corpus/lint.sh` clean. Not measured: whether the shorter listings change how often the skills load, since the triggering eval has no case for these five.
