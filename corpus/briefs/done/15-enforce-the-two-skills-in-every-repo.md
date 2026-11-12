# Task 15: Enforce the two skills in every repo (tracker)

This brief is a **tracker**. Each repo carries its own set of briefs in its
own corpus, written on 2026-11-10 from the owner's grilling. This page lists
them, the order to build them in, and the answers every one of them carries.
It no longer plans to copy the checkers into each repo by hand.

## Context

On 2026-11-09 the owner asked for the Base UI conventions (brief 02) and the
code structure (brief 03) to be **enforced through the repositories**, not
only written down. No repo has CI, and this library's rules forbid adding
GitHub Actions, so the gates are each repo's `npm run check` (brief 27), the
`Stop` hook in the plugin, and agents reading `.claude/rules/`.

Decided 2026-11-10:

- **Tooling ships from brief 27.** `house-style` is vendored into each repo
  with a version header and refreshed by `house-style:sync` (Q6). The two
  checkers come with it and read the repo's roots from `conventions.json`.
- **Wiring the vendored copy (2026-11-10, brief 27).** house-style is the
  library's `house-style/` folder (the owner's call), and a repo takes it with
  `npm run house-style:sync -- house-style-v<version>`, which copies that
  folder at the tag into `vendor/house-style/`. Nothing is copied by hand.
  Each repo's `check:conventions` runs
  `node vendor/house-style/bin/check-base-ui.mjs` and
  `node vendor/house-style/bin/check-structure.mjs`, `--warn-only` where the
  next bullet says, and its configs extend the vendored ones. The `house-style`
  skill's adoption reference has the steps. A repo moves to a newer checker by
  syncing a newer tag, a minor version of house-style.
- **The deploy is left alone** (Q1). Every service runs in a container built
  from the repo's `infrastructure/Dockerfile` with `npm ci` and `tsc -b`, and
  no tests or lint. The gate is the `Stop` hook plus `npm run check`.
- **No PRs** (Q4). The owner works on `main`; each repo's briefs are built on
  `main` in its main checkout, committed and pushed there.
- **Repos with `--warn-only`.** A repo not yet migrated runs a checker with
  `--warn-only` until its own Tailwind or server brief removes the flag. A
  checker that already reports nothing when the repo adopts it runs strict
  from the start (ro-housing's `check-base-ui`). *(Changed 2026-11-11 by the
  controller: this used to say every repo already on Tailwind runs strict, but
  atrium is on Tailwind and has 7 rule-3 findings, so it stays `--warn-only`
  until its own brief. Matches the skill's `references/adoption.md`.)*
- **dependency-cruiser is in `check:conventions` from day one** (2026-11-11,
  the controller's call): a rule a repo can't pass yet is lowered to `warn`
  by name in its `.dependency-cruiser.cjs`, with a dated comment saying what removes it
  (never a brief number; changed 2026-11-11, the estate's corpus rules keep
  them out of code comments). The server brief turns it back on. Repo briefs that stage dependency-cruiser
  with the server brief (wicket 13, atrium 02) keep only the rule-lowering
  part of that staging.

## The migration order (Q20, decided 2026-11-10)

1. the mini todo app (`literally-a-todo-app`), as the proof;
2. wicket, 3. the-board, 4. lantern, 5. Satchel, 6. ward-auth, 7. Almanac,
8. Shelfmark, 9. Postern, 10. Newspapper.

The repos already on Tailwind (atrium, comercial-website, public-resource-map,
ro-housing, sports-app, SocialEvents, 3D-sandbox, ImbatranimOS,
imbatranim-apps, presentation-sites, churchix) follow the same rhythm, each
with its bump first (brief 04). In every repo the order is: **bump (04), harness,
Base UI by the conventions, Tailwind, server, redesign** (brief 28).

## Each repo's briefs

Briefs are in the repo's `corpus/briefs/todo/`. "-" means the repo has no
such brief, because it does not apply.

| Repo | Harness | Base UI by the conventions | Tailwind | Server |
|---|---|---|---|---|
| mini-projects | brief 02, *The todo app house-style harness* | brief 03, *Base UI by the conventions* | brief 04, *The web app to Tailwind* | brief 05, *The server in the code structure* |
| wicket | brief 10, *The house-style harness* | brief 11, *Base UI by the conventions* | brief 12, *The web app to Tailwind* | brief 13, *The server in the code structure* |
| the-board | brief 16, *The house style and the quality harness* | brief 17, *Base UI by the conventions* | brief 18, *The web app to Tailwind* | brief 19, *The server in the code structure* |
| lantern | brief 15, *The house-style harness* | brief 16, *Base UI by the conventions* | brief 17, *The web app to Tailwind* | brief 18, *The server in the code structure* |
| Satchel | brief 01, *The house-style harness* | brief 02, *Base UI by the conventions* | brief 03, *The web app to Tailwind* | brief 04, *The server in the code structure* |
| ward-auth | brief 03, *The house-style harness* | brief 04, *Base UI by the conventions* | brief 05, *The UI to Tailwind* | brief 06, *The server in the code structure* |
| almanac | brief 01, *The house-style harness* | brief 02, *Base UI by the conventions* | brief 03, *The web app to Tailwind* | brief 04, *The server in the code structure* |
| shelfmark | brief 05, *The house-style harness* | brief 06, *Base UI by the conventions* | brief 07, *The web app to Tailwind* | brief 08, *The server in the code structure* |
| postern | brief 01, *The house-style harness* | brief 02, *Base UI by the conventions* | brief 03, *The web app to Tailwind* | - (no backend) |
| newspapper | brief 08, *The house-style harness* | brief 09, *Base UI by the conventions* | brief 10, *The UI to Tailwind* | brief 11, *The API in the code structure* |
| atrium | brief 02, *The house-style harness* | brief 03, *Base UI by the conventions* | - (already Tailwind) | brief 04, *The server in the code structure* |
| comercial-website | brief 11, *The house-style harness* | brief 12, *Base UI by the conventions* | - | brief 13, *The server in the code structure* |
| public-resource-map | brief 03, *The house-style harness* | brief 04, *Base UI by the conventions* | - | brief 05, *The server in the code structure* |
| ro-housing | brief 22, *The house-style harness* | brief 23, *Base UI by the conventions* | - | brief 24, *The server in the code structure* |
| sports-app | brief 02, *The house-style harness* | brief 03, *Base UI by the conventions* | - | brief 04, *The server in TypeScript and the code structure* |
| SocialEvents | brief 15, *The house-style harness* | brief 16, *Base UI adopted by the conventions* | - | brief 17, *The server in the code structure* |
| 3D-sandbox | brief 05, *The house-style harness* | brief 06, *Base UI by the conventions* | - | brief 07, *The server in the code structure* |
| imbatranimOS | brief 86, *The house-style harness* | brief 87, *Base UI by the conventions* | - | - (NestJS: no Fastify brief) |
| imbatranim-apps | brief 08, *The house-style harness* | brief 09, *Base UI by the conventions* | - | brief 10, *The server in the code structure* |
| presentation-sites | brief 03, *The house style and the quality harness* | brief 04, *Base UI by the conventions with the theme switch* | - | - (no server) |
| churchix (own corpus) | brief 03, *The house style and the quality harness* | brief 04, *Base UI by the conventions with the theme switch* | - | - |
| game-engine | brief 03, *The house-style harness* | - | - | - |
| just-a-bot | brief 18, *The house-style harness* | - | - | - |

Out of scope: hackathons (an archive), and the private repos (Q2).

## The owner's answers every repo brief carries (2026-11-10)

- **Q18, dark mode.** Every app gets a Light / Dark / System switch, light by
  default on a first visit, kept on the device (atrium keeps its per-profile
  sync and sepia theme). Tailwind's `dark:` keys off `data-theme` through
  `@custom-variant`, not `prefers-color-scheme`. The exceptions:
  - **3D-sandbox's Solstice** keeps its Darkroom dark default and gets the
    switch;
  - **Ward's console** keeps its one dark surface; the sign-in pages get the
    switch;
  - **the client sites** (presentation-sites' auto-service, saloon, subcort,
    tractari) and **Churchix's parish sites** keep the one look designed for
    each, with no switch.
- **Q19, visual parity.** A Tailwind migration is done when before and after
  screenshots at 1280 and 390 px show no visible change to layout or colour.
  A few pixels of drift in spacing or rounding needn't be fixed or listed.
- **Q40, the phone menu.** Phone navigation panels move to Base UI 1.9.0's
  swipeable `Drawer`, closed by a swipe, a tap outside, the X or Esc.
- **Q58.** Inline "Delete? Yes / No" confirms stay inline (Satchel,
  Shelfmark); no move to `AlertDialog`. A dialog that holds a form sets
  `disablePointerDismissal`.
- **Q44, the root font size.** It goes back to the browser's default and the
  app's size moves onto `body`. ImbatranimOS has no exception: its 13 px moves
  to `body` with `--spacing: 0.203125rem` (imbatranimOS brief 87).

The technical calls behind the rest are on
[grilling-2026-11-10-technical-calls.md](../../wiki/grilling-2026-11-10-technical-calls.md);
the owner's answers are on
[grilling-2026-11-10.md](../../wiki/grilling-2026-11-10.md).

## Acceptance (for this tracker)

- Every row's briefs are in their repo's `done/`.
- Each repo's `npm run check` passes with both checkers strict, or with
  exceptions recorded in `conventions.json`, each with a reason.
- Each repo has a short root `CLAUDE.md` with the commands (Q46) and
  `.claude/rules/` files for web and server.
- The outcome note has a table per repo: strict or `--warn-only` for each
  checker, and the counts.


## Outcome (2026-11-12)

Every row's briefs are in their repo's `done/`: 23 repos, 71 briefs (harness,
Base UI, Tailwind, server; "-" where the row has none). Each cell is the brief
number and the short hash of the commit that put it in `done/`. The two
checker columns are errors / warnings from running both `vendor/house-style`
checkers on 2026-11-12 in each repo's main checkout, strict (no
`--warn-only`), read-only, with the count of findings the repo's
`conventions.json` excepts. Each repo's `check:conventions` script was read:
it runs `check-base-ui` strict everywhere, and `check-structure` strict
everywhere except Shelfmark and imbatranimOS (below).

| Repo | Harness | Base UI | Tailwind | Server | check-base-ui | check-structure |
|---|---|---|---|---|---|---|
| mini-projects | 2 `56d70df` | 3 `de9855b` | 4 `91dc520` | 5 `b16b9df` | 0/0 | 0/0w |
| wicket | 10 `9d83747` | 11 `a996ab6` | 12 `5695a34` | 13 `25ca7e5` | 0/0 | 0/0w; 1 excepted |
| the-board | 16 `e7ecb3c` | 17 `d60d1cd` | 18 `23707a3` | 19 `89c7ca4` | 0/0 | 0/2w; 1 excepted |
| lantern | 15 `fbb510b` | 16 `3f5c6ed` | 17 `8f96885` | 18 `1a6f34b` | 0/0 | 0/0w; 2 excepted |
| satchel | 1 `c63caa9` | 2 `99529ac` | 3 `4c7e7c6` | 4 `5350a4d` | 0/0 | 0/3w; 1 excepted |
| ward-auth | 3 `1c1e2ba` | 4 `beedb69` | 5 `0b9da2c` | 6 `32e030e` | 0/0; 2 excepted | 0/22w; 16 excepted |
| almanac | 1 `de5c43c` | 2 `f7fd95d` | 3 `b6c7f0d` | 4 `9c0a9d5` | 0/0; 1 excepted | 0/4w |
| shelfmark | 5 `5d028a9` | 6 `54dc01c` | 7 `51b1d9d` | 8 `17a84b0` | 0/0 | 0/9w; 1 excepted **`--warn-only`** |
| postern | 1 `af8807c` | 2 `8bc8121` | 3 `0abe50a` | - | 0/2w | 0/18w |
| newspapper | 8 `29f9db6` | 9 `a0e4155` | 10 `890a4f6` | 11 `8cbce81` | 0/0 | 0/4w |
| atrium | 2 `cc2d366` | 3 `cd5d397` | - | 4 `12aacb6` | 0/0 | 0/43w; 2 excepted |
| comercial-website | 11 `52c7ed1` | 12 `9c360e9` | - | 13 `19a3d97` | 0/0 | 0/5w; 3 excepted |
| public-resource-map | 3 `d0e533e` | 4 `501cdc5` | - | 5 `31c21ad` | 0/0 | 0/5w; 2 excepted |
| ro-housing | 22 `a6233c3` | 23 `b83979a` | - | 24 `d336f1c` | 0/0 | 0/2w |
| sports-app | 2 `a47431b` | 3 `21a3555` | - | 4 `41234fc` | 0/0; 6 excepted | 0/7w; 2 excepted |
| SocialEvents | 15 `85c6329` | 16 `429be02` | - | 17 `b890bc2` | 0/0 | 0/0w; 5 excepted |
| 3D-sandbox | 5 `c4c0ede` | 6 `eb9fbd9` | - | 7 `b6faa05` | 0/0 | 0/4w |
| imbatranimOS | 86 `ae76af5` | 87 `a8cdb21` | - | - | 0/0; 20 excepted | notwired (NestJS, no brief) |
| imbatranim-apps | 8 `e21bdaa` | 9 `b08c6d9` | - | 10 `e479048` | 0/0 | 0/28w |
| presentation-sites | 3 `73da32b` | 4 `3650c6d` | - | - | 0/0 | 0/1w |
| churchix | 3 `8c3485a` | 4 `e5469be` | - | - | 0/0; 3 excepted | 0/1w |
| game-engine | 3 `6c96013f` | - | - | - | 0/0 | 0/0w |
| just-a-bot | 18 `6238281` | - | - | - | 0/0 | 0/0w |

Every warning left in `check-structure` is rule 11 (file length), and
Postern's two `check-base-ui` warnings are rule 9's icon-child false positive
(a recorded checker gap, not an exception). Repos with no server row (Postern,
imbatranimOS, presentation-sites, churchix, game-engine, just-a-bot) run
`check-structure` on their Node folders or, for imbatranimOS, not at all.

**Against the tracker's Acceptance.**

- **Met: every row's briefs are in `done/`,** and every repo's `check-base-ui`
  exits 0 strict with 0 errors and 0 warnings (Postern's two warnings
  aside), with 32 findings excepted across 5 repos (imbatranimOS 20, sports-app 6,
  churchix 3, ward-auth 2, almanac 1), each with a reason in
  `conventions.json`.
- **Met, with two flags: `check-structure` strict.** It exits 0 in the 22 rows that run it.
  **Shelfmark's `check:conventions` still passes `--warn-only` to it**
  although the checker reads 0 errors: the flag can go. **imbatranimOS does not
  run `check-structure`:** its backend is NestJS (no Fastify brief), the brief
  never wired it, and a read-only run finds 52 errors (rule 3 x45, rule 1 x4,
  rule 6 x2, rule 2 x1) that are not a regression. It is a question for the
  owner whether the checker should cover a NestJS backend or the repo records
  that it doesn't.
- **Met: each repo has a short root `CLAUDE.md` and `.claude/rules/` files**
  for its parts (web and server, or the parts it has: Postern's `jmap.md`,
  presentation-sites' `sites.md`, churchix's `churchix.md`, game-engine's
  `client.md` and `engine.md`, just-a-bot's `bot.md`). Root files run from 31 to 199 lines; the five longest are
  Newspapper 199, game-engine 160, comercial-website 138, churchix 94 and
  mini-projects 82. Q46 asked for a short one, and whether 200 lines is short
  is the owner's call.
- **Not run by this closeout: `npm run check` in each repo.** The evidence is
  each builder's outcome note (every repo's note says it exits 0) and the
  controller's verification before each push; this pass ran only the two
  checkers.
- **Not met, and not a row: websites/trips.** It declares `@base-ui/react`
  (`^1.6.0`, lockfile 1.8.0) and uses it in `src/ui/Modal.tsx`, but it is in
  no tracker's table: no pin brief, no harness (no vendored `house-style`), no
  conventions brief. Brief 04 stays open for it (see its progress note).
  Brief 15 treats it as outside the table, whose rows name only the repos
  that have a plan.

**Open after this tracker, none a row of it.**

- The Hallmark redesign brief in each repo (brief 28) is the next brief of
  each row.
- wzd_auth's todo "the OIDC pages follow the theme" rides with its
  redesign brief 07.
- The two owner steps the server wave left: the container `CMD` check after
  each deploy, and the deploys themselves.
