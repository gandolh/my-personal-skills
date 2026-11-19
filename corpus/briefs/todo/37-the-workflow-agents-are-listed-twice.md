# Task 37: the workflow agents are listed twice

## Context

Claude Code ignores `hooks` in a plugin agent's frontmatter, so
`scripts/install-agents.mjs` writes user-level copies of the four workflow
agents (`brief-builder`, `screen-capturer`, `brief-auditor`, `owner-steps`)
with their guard hook. The plugin still registers its own copies from
`agents/`.

The result, seen on 2026-11-17 in a session of an unrelated repo: each of the
four appears twice in the agent list, once bare and once as
`personal-skills:<name>`. Two costs:

- **Tokens.** The four descriptions are about 2,100 characters together,
  roughly 800 tokens, loaded a second time in every session of every repo.
  `claude plugin details` prints `Agents (0)` for the plugin, so this is missing
  from its always-on figure.
- **A wrong pick.** The plugin copy runs without its guard.
  `plan-split-dispatch` has to say "never the plugin copy", which is a rule
  only because the copy exists.

## The pick

- **Move the sources out of `agents/` (recommended).** Keep the four files in
  a folder the plugin does not register (for example `agent-sources/`), and
  have `install-agents.mjs` read from there. The plugin lists eight agents
  instead of twelve, and the unguarded copies no longer exist. A machine that
  has not run the install script has no workflow agents, which is the safe
  failure.
- **Keep both.** Close this brief as superseded with one line.

## Files you OWN (once unblocked)

- `agents/brief-builder.md`, `agents/screen-capturer.md`,
  `agents/brief-auditor.md`, `agents/owner-steps.md` (moved, not edited).
- `scripts/install-agents.mjs` and `scripts/install-agents.test.mjs`.
- The lines in `skills/plan-split-dispatch/SKILL.md`, `README.md` and
  `docs/` that name the plugin copy or the `agents/` path.
- Both plugin files, `docs/history.md`, `corpus/`.

## Acceptance (for the move)

- `node --test scripts/install-agents.test.mjs` passes, and a dry run lists
  the four agents from the new folder.
- A new session lists each workflow agent once.
- No text tells the controller to avoid a plugin copy that no longer exists.
- The version is bumped in both plugin files, the README and
  `docs/history.md`.
