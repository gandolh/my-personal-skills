# Task 36: the four unused Vercel skills, prune or keep

## Context

The stocktake of 2026-11-13 (finding F1) found four vendored Vercel skills
with no recorded call in 403 session transcripts: `vercel-composition-patterns`,
`vercel-react-best-practices`, `vercel-react-native-skills` and
`vercel-react-view-transitions`. A second look on 2026-11-17 found no call
either, and nothing in the library points at them.

`claude plugin details personal-skills` (2026-11-17) puts their always-on
cost at about 620 tokens together (120, 130, 120 and 250), paid in every
session of every repo. After brief 35 that is close to a tenth of the
plugin's about 6,600.

They are vendored and pinned, so the stocktake left the call to the owner.
The other two Vercel wrappers, `web-design-guidelines` and
`writing-guidelines`, are used and stay.

The 620 is the tool's estimate. It does not model the `disable-model-invocation`
key: it still charges the taste presets, which carry it, about 100 tokens each,
while a session's skill list on 2026-11-17 left those five skills out entirely.
So the key is a real middle way, and the taste presets are the precedent for
putting it on a vendored skill.

## The pick

- **Prune (recommended).** Remove the four folders, their `ATTRIBUTION.md`
  rows, README rows and the "Vercel suite" clause of the plugin description.
  Saves about 620 tokens a session. They can be vendored again from upstream
  at any time.
- **Name-only.** Add `disable-model-invocation: true` to the four, as the taste
  presets have. They leave the session's skill list and load only when called by
  name. Nothing is deleted. `check-skills` notes the key is Claude Code only.
- **Keep.** Close this brief as superseded with one line, so the next
  stocktake does not raise F1 again.
- **Prune some.** Name which.

## Files you OWN (once unblocked)

- `skills/vercel-composition-patterns/`, `skills/vercel-react-best-practices/`,
  `skills/vercel-react-native-skills/`, `skills/vercel-react-view-transitions/`.
- `ATTRIBUTION.md`, `README.md`, both plugin files, `docs/history.md`,
  `corpus/`.

## Acceptance (for a prune)

- The folders are gone and `node scripts/check-skills.mjs` counts four fewer
  skills with 0 failing.
- No file in the repo names a removed skill, apart from `docs/history.md` and
  the done briefs.
- `claude plugin details personal-skills` shows the always-on cost down by
  about 620 tokens.
- The version is bumped in both plugin files, the README and
  `docs/history.md`.
