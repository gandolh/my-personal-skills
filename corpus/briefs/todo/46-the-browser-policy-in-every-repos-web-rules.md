# Task 46: the browser policy in every repo's web rules

**Depends on:** [44](../done/44-a-web-platform-skill-vendored-from-modern-web-guidance.md): the line points at the
`web-platform` skill, which 44 creates.

## Context

The owner settled the estate's browser policy on 2026-11-23, in the grilling after the
[modern-web-guidance research](../../wiki/modern-web-guidance-2026-11-23.md): Chrome on Android decides what to
build; Safari on iPhone, Firefox and desktop Safari must keep working. Brief 44 writes it into the new
`web-platform` skill and into `wiki/decisions.md`.

A skill loads only when its description matches the task. A repo's `.claude/rules/web.md` loads every time an
agent touches that repo's web code (its `paths:` glob), which is why the base-ui rules are copied there
(`skills/base-ui/SKILL.md`, "The references"). The owner chose to put the browser policy there too, so every
builder sees it even when the skill doesn't trigger.

Sixteen repos have the file on 2026-11-23: SocialEvents, almanac, atrium, brief-board, comercial-website,
gazette, lantern, mini-projects, newspapper, postern, ro-housing, satchel, shelfmark (all under `apps/`),
3D-sandbox, imbatranimOS and wicket. house-style's description of the file (`skills/house-style/SKILL.md`, the
`.claude/rules/web.md` bullet, and the template in `references/adoption.md`) is what a new repo copies.

## Files you OWN

- The `.claude/rules/web.md` of each of the sixteen repos: one added bullet, nothing else.
- `skills/house-style/SKILL.md` (the `web.md` bullet) and `skills/house-style/references/adoption.md` (the
  `web.md` template).
- `README.md` (the version line), `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- Every other line of the sixteen files, and any other file in those repos.
- A repo with web code but no `.claude/rules/web.md` (trips, presentation-sites, the school theme): list them in
  the outcome; don't create the file.
- house-style's vendored copies in the repos (`vendor/house-style/`): they come from its next sync.

## What to do

1. **The line.** Add this bullet after the first bullet of each file's rules (keep each file's own wording around
   it):

   ```markdown
   - Browsers: Chrome on Android decides what to build; Safari on iPhone, Firefox and desktop Safari must keep
     working. Before you use a platform feature newer than Baseline Widely available, read the `web-platform`
     skill.
   ```

   Wrap it to the file's own line width. If a file is near house-style's 40-line guide, say so in the outcome
   rather than cutting other rules.
2. **Commit in each repo**: one commit per repo, in that repo's own message style, on `main`. No pushes. A repo
   whose working tree is dirty in `.claude/rules/web.md` is skipped and listed in the outcome.
3. **house-style.** Name the browser line in the `web.md` bullet of `skills/house-style/SKILL.md` and add it to
   the template in `references/adoption.md`, so a new repo gets it.
4. **Version.** A patch bump in both plugin files (both places in the marketplace file), the README version line
   and a paragraph in `docs/history.md`.

## Acceptance

- `grep -l "Chrome on Android decides what to build" <each of the sixteen files>` lists all sixteen (or the
  outcome names each one skipped and why).
- Each of the sixteen repos has exactly one new commit touching only `.claude/rules/web.md`.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` are clean here.
- The version is bumped in all four places.

## Owner decisions

- None. The owner chose the line and the place on 2026-11-23.
