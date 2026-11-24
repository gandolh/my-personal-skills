# Task 47: house-style ships the one-pass check runner and the two cache flags

**Depends on:** none.

**Builder:** sonnet. The runner already works in 24 repos; this copies one of its two variants into house-style,
tests it, documents it and syncs game-engine, the one adopter that lacks it.

## Context

From [check-speed-2026-11-23.md](../../wiki/check-speed-2026-11-23.md), recommendations 1 and 4, and the todo of
2026-11-24 ([the todo](../../todos/house-style-carries-the-one-pass-check-runner.md)). On 2026-11-23 the owner asked
for every change that stays inside the apps, and 21 repos got the following; shelfmark,
literally-a-todo-app (in mini-projects) and churchix (in presentation-sites) have it too, 24 adopters in all
(checked 2026-11-24):

- **A gate runner.** `npm run check` became `node scripts/check.mjs typecheck lint format:check check:conventions test`.
  The runner runs every step even after one fails, prints one line per step with its time and result, then the last
  lines of each failure, and keeps the whole output in `node_modules/.cache/check/last.log`. Exit 0 when every step
  passed, 1 when one failed, 2 for an unknown or missing step name. Two variants exist:
  23 identical copies (22 at `scripts/check.mjs`, imbatranim-apps' at `tools/check.mjs`), and imbatranimOS's
  `scripts/check.mjs`, which also runs steps joined by `+` side by side and the groups one after another
  (`typecheck+lint+format:check+check:conventions test`). Each step runs in its own process group, so a timeout or
  Ctrl-C stops the whole step.
- **Prettier's cache, in its own place.** `format:check` is
  `prettier --check . --cache --cache-location node_modules/.cache/prettier-check/.prettier-cache` in all 24. Prettier's
  default cache dies on every save, because the plugin's formatter hook runs Prettier without `--cache`, which deletes
  it. Prettier's check in almanac fell from 8.5 s to 2.0 s. (The wiki's recommendation spelled the folder `prettier-gate/cache`;
  the repos' spelling is what runs.)
- **dependency-cruiser's cache.** `depcruise <roots> --cache node_modules/.cache/dependency-cruiser` in
  `check:conventions`. It invalidates when the files, arguments or filters change.

house-style still describes `check` as an `&&` chain and `format:check` as a bare `prettier --check .`:
[`skills/house-style/SKILL.md`](../../../skills/house-style/SKILL.md) (the scripts table) and
[`references/adoption.md`](../../../skills/house-style/references/adoption.md) (§3's line on `format:check`, §7's
JSON block). The next
adoption, or a sync note written from those, would undo what the repos have.

Left out: game-engine, on house-style 1.3.0 and still on the `&&` chain. (Shelfmark, mid-brief on 2026-11-23, got the
runner on 2026-11-24.) The todo also named trips and vps-deploy, but neither has a house-style gate: trips has no `check` script
and no `vendor/house-style/`, and vps-deploy's `check` is its deploy CLI's own `--check`. They stay out.

A house-style release follows brief 31's pattern
([31](../done/31-house-style-1-3-0-a-domain-root-and-the-wave-findings.md)): its own version in
`house-style/package.json` and the lockfile, a CHANGELOG section written as the upgrade note, an annotated tag
`house-style-v<version>` (message `house-style <version>`), then the plugin's own bump.

## Files you OWN

- `house-style/bin/check.mjs` (new), `house-style/test/check.test.mjs` (new) and any fixture it needs under
  `house-style/test/fixtures/`.
- `house-style/README.md` (the What-ships table and a short section on the runner), `house-style/CHANGELOG.md`,
  `house-style/package.json` and `house-style/package-lock.json` (the version lines, by hand).
- `skills/house-style/SKILL.md` and `skills/house-style/references/adoption.md`: every statement of the `check`,
  `format:check` and `check:conventions` scripts (the scripts table; adoption's §3 line on `format:check` and §7).
- In game-engine: `vendor/house-style/` (through the sync only), the `check`, `format:check` and
  `check:conventions` scripts in the root `package.json`, and the gate line in the root `CLAUDE.md`.
- `README.md` (the version line), `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- The 23 repos that already run a runner: each switches to the vendored one at its next house-style sync, by the
  CHANGELOG note. No sync to them here.
- `agent-sources/brief-builder.md`, plan-split-dispatch, corpus-flow and adoption.md §8 (the `CLAUDE.md` template):
  brief 48 owns the builder rhythm.
- `house-style/eslint.config.js`, `tsconfig.base.json`, `knip.json`, `.dependency-cruiser.cjs`: no rule changes in
  this version.
- trips and vps-deploy.

## What to do

1. **The runner.** Copy imbatranimOS's `scripts/check.mjs` into `house-style/bin/check.mjs`: it is the superset (one
   step after another by default, `+` to run steps side by side). Keep its log path, exit codes and signal handling.
   Change only the header comment, so it says how a repo calls it:
   `"check": "node vendor/house-style/bin/check.mjs typecheck lint format:check check:conventions test"`.
2. **Tests.** `house-style/test/check.test.mjs` with `node:test`, in a temporary folder holding a `package.json`
   whose scripts are `node -e` one-liners (no installs, no network). Assert: every step runs after one fails; the
   exit code is 1 and the failure's last lines are printed; the log holds one block per step; `a+b` runs both;
   an unknown step name exits 2 and runs nothing.
3. **The docs.**
   - `house-style/README.md`: a row for `bin/check.mjs` in the What-ships table, and a short section: the call
     above, what it prints, the log and that it is the place to read before running the gate again, and `+` as an
     option a repo uses only after timing it on a quiet machine (game-engine's suites flake when they overlap, and an
     almanac test failed under load on 2026-11-23).
   - `skills/house-style/SKILL.md`, the scripts table: `check` names the runner and its log; `format:check` gets
     the two cache flags and the reason in a few words (the formatter hook deletes Prettier's default cache);
     `check:conventions` gets depcruise's `--cache node_modules/.cache/dependency-cruiser`.
   - `adoption.md`: §3's `format:check` line gets the flags; §7's JSON block becomes the three scripts as the
     repos run them, with one line under it on each flag and on the runner.
   - `SKILL.md` runs past its 5,000-token cut today (5,890 tokens on invoke, the cut at line 151, after the scripts
     table). Add words to it only inside the table, and keep them few.
4. **Release.** house-style's next minor version (1.4.0 unless another release lands first). The CHANGELOG section
   is the upgrade note: sync; point `check` at `node vendor/house-style/bin/check.mjs` with the repo's own step list;
   delete the repo's own `scripts/check.mjs` (`tools/check.mjs` in imbatranim-apps); add the two cache flags where
   missing, keeping the repo's own globs and roots. No pin, rule or `houseStyle()` default changes, so no new
   findings. Bump the version lines, commit, and tag `house-style-v<version>` (annotated, as 1.3.0 was). Then the
   plugin's next minor version in both plugin files (both places in the marketplace file), the README's version
   line and a `docs/history.md` paragraph.
5. **Time today's gate in one repo.** In game-engine, if it is free (see step 6), on a quiet machine (no other
   builder, browser or heavy check; `uptime` load under 2), run today's `npm run check` once in full, before step 6
   changes it. Record the time and the load. If game-engine isn't free, time almanac instead: the old chain typed
   out by hand (`npm run typecheck && npm run lint && npx prettier --check . && npm run check:conventions && npm test`)
   once, and in step 7 its `npm run check`.
6. **Sync game-engine,** only if it is free: a clean tree, `git pull --ff-only` passes, and no ticket of that repo
   is In Progress (`brief-board list` from inside it). Then:
   `npm run house-style:sync -- house-style-v<version>`; set `check` to the vendored runner with the repo's current
   steps; add `--cache --cache-location node_modules/.cache/prettier-check/.prettier-cache` to `format:check` and
   `--cache node_modules/.cache/dependency-cruiser` to depcruise, keeping the repo's globs (game-engine checks
   `"**/*.{ts,tsx,js,mjs,cjs}"`) and roots; replace the gate bullet in `CLAUDE.md` with the wording almanac's
   `CLAUDE.md` uses (the log, one full run after the last change). game-engine's `npm run gates` stays as it is.
   One commit, in game-engine's message style. If it isn't free, skip it and say so in the outcome.
7. **Time the new gate** in the repo from step 5: `npm run check` twice (cold caches, then warm), each in full, same
   quiet machine. These three runs are the only timing in this brief.

## Acceptance

- `npm test` in `house-style/` passes, the new runner tests included.
- `node scripts/check-skills.mjs`, `node skills/stocktake/scripts/measure.mjs` (house-style still before its cut),
  `node --test scripts/*.test.mjs hooks/*.test.mjs` and `bash corpus/lint.sh` pass.
- `grep -rn '"check": "npm run' skills/house-style house-style/README.md` prints nothing, and no line there gives
  `format:check` as a bare `prettier --check .`.
- `node skills/stocktake/scripts/measure.mjs`: house-style's scripts table still ends before its cut line.
- `house-style/package.json`, the lockfile, the CHANGELOG heading and the tag agree on the version; the tag is
  annotated, points at the release commit and is not pushed. The plugin version matches in both plugin files, the
  README and `docs/history.md`.
- In game-engine, if synced: `npm run house-style:sync -- --check` exits 0, `npm run check` passes through
  `vendor/house-style/bin/check.mjs`, and `node_modules/.cache/check/last.log` exists after it.
- The outcome note gives the three gate times with the load and the repo they ran in, and says whether game-engine
  was synced.

## Owner steps

- Update the plugin to the new version.
- Push the library with its new `house-style-v<version>` tag, and game-engine if it was synced.

## Owner decisions

- Settled 2026-11-24 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-24:
  - house-style ships imbatranimOS's variant: it is a superset, and a repo that never writes `+` gets the 23 copies'
    behaviour.
  - The Prettier cache folder is the one the 24 repos already use, not the wiki's spelling.
  - trips and vps-deploy are out: neither has a house-style gate to switch.
  - The 23 repos with a runner switch at their next sync, by the CHANGELOG note, so no repo is touched twice for the
    same change.
  - The gate is timed once before and twice after (cold, warm), not as a series.
