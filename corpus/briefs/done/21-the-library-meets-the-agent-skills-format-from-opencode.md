# Task 21: The library meets the Agent Skills format (from anomalyco/opencode)

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed for ideas.
**anomalyco/opencode**, the open-source coding agent, was read at `d4d8567`
(2026-11-09, MIT).

Its `packages/web/src/content/docs/skills.mdx` documents how it loads
`SKILL.md` files:

- **Where it looks:** `.opencode/skills/`, `.claude/skills/` and
  `.agents/skills/`, in the project and in the home directory.
- **What it validates:**
  - `name` is 1-64 characters matching `^[a-z0-9]+(-[a-z0-9]+)*$`, and it
    must **match the directory name**;
  - `description` is **1-1024 characters**;
  - only `name`, `description`, `license`, `compatibility` and `metadata`
    are read, and unknown keys are ignored.

The same limits appear across the agents that read `SKILL.md` (Codex,
Gemini CLI, Copilot, opencode; see mattpocock/skills' install notes). So
they are the portable floor.

Checked against this library on 2026-11-09:

- Every skill's `name` matches its directory. This library already renamed
  vendored directories to their frontmatter names for Claude Code
  (`ATTRIBUTION.md`).
- **Two descriptions are over 1024 characters:** `codegraph` (about 1,035)
  and `design-md-library` (about 1,105). The count is approximate, since
  multi-line YAML was folded by a quick script. Recount with a real YAML
  parser.
- Some descriptions in vendored skills may be over too. Check them, but fix
  only this library's own: a vendored skill is changed upstream or by an
  explicit decision.

**Claude Code's own limits differ.** Read in its skills docs on
2026-11-09:

- `description` plus `when_to_use` is truncated at 1,536 characters in the
  skill listing.
- Claude Code ignores unknown frontmatter keys.
- **Outside Claude Code (claude.ai uploads, the Skills API), only `name`,
  `description`, `license`, `compatibility`, `metadata` and
  `allowed-tools` are allowed, and other keys are a hard error.**

So `disable-model-invocation` (which brief 24 sets on the taste classics)
or `paths` (brief 02) would stop a skill from uploading to claude.ai. The
check reports those keys as "Claude Code only".

The fix for a long description is the `when_to_use` field. Move the
trigger phrases there and keep `description` to what the skill does. That
keeps both formats happy, within 1,024 characters for the description, and
loses no triggers in Claude Code.

The owner's interest is that the library keeps working if they run another
agent. The repo is also public, and this costs little.

## Files you OWN

- `scripts/check-skills.mjs` (new): a zero-dependency check of every
  `skills/*/SKILL.md`.
- The `description:` of `skills/codegraph/SKILL.md` and
  `skills/design-md-library/SKILL.md`.
- `corpus/lint.sh`: call the new check.
- `README.md` (a line under installation on other agents), `docs/history.md`,
  both plugin files, `corpus/`.

## Files you must NOT touch

- Vendored skills' frontmatter, which would break byte-for-byte vendoring.
  Report them instead.
- The skill bodies.

## What to do

1. **`check-skills.mjs`.** It parses the frontmatter of every
   `skills/*/SKILL.md` (a small YAML subset is enough: block scalars,
   quoted strings) and fails when:
   - the name doesn't match the regex or the directory;
   - the description is missing or over 1024 characters;
   - the YAML is invalid. taste-skill's 2.1.0 shipped an unquoted `: ` that
     broke loading in Claude Code (its changelog, 2.1.4).

   Vendored skills, read from `ATTRIBUTION.md`'s table, are reported as
   warnings.
2. Shorten the two descriptions to under 1024 characters, and keep every
   trigger phrase. Move the long tail of triggers into the body's "When to
   use" section.
3. Call the check from `corpus/lint.sh`, so the existing gate covers it.
4. Add a README note on installing in opencode and others: copy or link
   `skills/` into `~/.agents/skills/`. Note that slash commands and the
   plugin's agents are Claude Code only.
5. Bump the patch version.

## Acceptance

- `node scripts/check-skills.mjs` exits 0 on the repo, lists any vendored
  warnings, and exits 1 on a fixture with an over-long description and on
  one whose name doesn't match its directory.
- Both descriptions are at most 1024 characters, measured by the check.
- `bash corpus/lint.sh` runs the check and passes.
