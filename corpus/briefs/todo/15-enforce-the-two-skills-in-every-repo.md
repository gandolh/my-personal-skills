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
