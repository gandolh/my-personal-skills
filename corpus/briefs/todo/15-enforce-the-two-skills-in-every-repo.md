# Task 15: Enforce the base-ui and code-structure skills in every repo

## Context

On 2026-11-09 the owner asked for the Base UI conventions (brief 02) and the
code structure (brief 03) to be **enforced through the repositories**, not
only written down.

No repo in the estate has CI, and this library's own rules forbid adding
GitHub Actions. The gates that do exist are each repo's `npm run lint`, run
by hand and by agents before a hand-back, and the deploy. Shelfmark's
status, for example, deploys with `node cli.ts shelfmark deploy` from the
owner's vps-deploy project. So enforcement means three things:

1. **The checkers live in the repo**, copied from the skills as
   `scripts/check-base-ui.mjs` and `scripts/check-structure.mjs`. Each
   header names the skill version it came from.
2. **`npm run lint` runs them.** A `check:conventions` script runs both, and
   `lint` chains it after the repo's own linter:
   `"lint": "eslint . && npm run check:conventions"`. 3D-sandbox uses Biome,
   so chain it there the same way. ImbatranimOS uses Turbo, so add the check
   as a root task.
3. **Agents read the rules, and the harness enforces them.** Claude Code's
   docs (2026-11-09) say `CLAUDE.md` is advisory and should stay under
   about 200 lines. So instead of a long "Conventions" section:
   - `CLAUDE.md` gets the commands (`npm run check`, `npm run check:fast`,
     how to run one test);
   - `.claude/rules/web.md` (`paths: ["web/src/**"]`) and
     `.claude/rules/server.md` (`paths: ["server/src/**"]`) carry the
     few rules from briefs 02 and 03 an agent must hold while editing
     there, with a pointer to each skill;
   - the plugin's `Stop` hook (brief 27, decision 0) runs `check:fast`
     before an agent may finish. That is the deterministic part.

   Brief 27 supersedes this brief's copy-the-checkers plan if its decision
   1 (a shared `house-style` package) is taken. Re-read 27 before starting.

Owner decisions, with defaults:

- **The deploy.** Default: if vps-deploy's per-project deploy already runs a
  project's tests or lint before building, it also runs `npm run lint`.
  Check vps-deploy's code, then add it there under that project's own brief.
  The alternative is to leave the deploy alone.
- **A repo that isn't migrated yet.** Default: it runs `check-base-ui.mjs`
  with `--warn-only` until its Tailwind brief (05-14) is done, and
  `check-structure.mjs` with `--warn-only` until its server row in brief 16
  is done. The flag comes off in the brief that fixes the repo. A repo
  already on Tailwind runs `check-base-ui` strict from the start: atrium,
  ro-housing, comercial-website, public-resource-map, 3D-sandbox,
  sports-app, presentation-sites, ImbatranimOS and imbatranim-apps.
- **Exceptions.** Default: a repo-local `scripts/conventions.json` lists
  allowed exceptions, each with a reason. An example is ward-auth's second
  entry stylesheet, if brief 09 needs one. Both checkers read the file and
  print the exceptions they honour.

The repos in scope are every repo with a `web/` app on Base UI (brief 04's
table) or a Fastify server (brief 16's table). For a repo with only one of
the two, wire only that checker. hackathons and game-engine are out: they
are archives or have no web UI.

**Depends on:** briefs 02 and 03 (the checkers exist) and 04 (pins at
1.9.0, so rule 1 passes).

## Files you OWN

In each repo:

- `scripts/check-base-ui.mjs`, `scripts/check-structure.mjs` and
  `scripts/conventions.json`;
- the `lint` and `check:conventions` scripts in the root `package.json`;
- the "Conventions" section in `CLAUDE.md` and `corpus/CLAUDE.md`;
- a `corpus/log.md` entry.

## Files you must NOT touch

- Source files. Fixing what a strict checker reports in a Tailwind repo is
  that repo's own follow-up brief (file one there for anything over about
  an hour), or a one-line fix if it is trivial.
- The repo's existing ESLint config. The one exception is adding
  `no-restricted-imports` for the `@base-ui/react` root, where the repo uses
  ESLint.

## What to do

One repo per session, in this order:

1. the Tailwind repos, strict;
2. the plain-CSS repos, warn-only;
3. the servers.

In each repo:

1. Copy the two checkers from the skills at their current version.
2. Run each strict. Record the counts in the repo's `log.md` entry and this
   brief's outcome note.
3. Pick strict or `--warn-only` per the decisions above. Write
   `conventions.json` for any exception, with its reason.
4. Add the scripts and the `CLAUDE.md` sections.
5. `npm run lint` must pass: strict findings fixed or excepted, warnings
   allowed.
6. Commit with `chore: enforce base-ui and code-structure conventions`.

Then, separately, check vps-deploy for the deploy decision.

## Acceptance

- Every repo in scope has both scripts (or the one that applies), a
  `check:conventions` script, a `lint` that runs it, and the `CLAUDE.md`
  section.
- `npm run lint` passes in each.
- The outcome note has a table per repo: strict or warn-only for each
  checker, the counts, and the exceptions.
- The vps-deploy decision is recorded, either way.
