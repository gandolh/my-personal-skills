# Task 28: The estate redesign board

**Depends on:** brief 24 (Hallmark is vendored), and each app's Tailwind and
Base UI briefs (a redesign is then mostly a new token set and layout).

## Context

On 2026-11-10 (Q39) the owner dropped the design bake-off. Hallmark
(`nutlope/hallmark`) redesigns every web UI, with taste-skill 2.5's ideas
adopted (brief 24). Every app and site with a web UI gets a **redesign brief**
in its own corpus, after its Tailwind and Base UI briefs. The two games
(3D-sandbox, game-engine) are left out, because their UI is the game.

The owner approves each app on **one board** before any code changes.

## The board

One artifact, published privately, with:

- a page per app;
- on each page, today's screenshots beside the proposed design, at 1280 and
  390 px;
- an approve, change or reject control per app, so the owner decides there;
- a tracker table of every repo's redesign brief and its state.

Screenshots are taken with the `ui-test-plans` method and kept out of git; the
artifact holds them. A proposal is a design, not code. No app's code changes
until the owner approves that app on the board.

## The redesign briefs to track

Each is named "<repo> brief NN, *A redesign with Hallmark on the estate
board*" unless noted.

| Repo | Brief |
|---|---|
| almanac | brief 05 |
| atrium | brief 05 |
| the-board | brief 20 |
| comercial-website | brief 14 |
| lantern | brief 19 |
| mini-projects | brief 06 |
| newspapper | brief 12 |
| postern | brief 04 |
| public-resource-map | brief 06 |
| ro-housing | brief 25 |
| Satchel | brief 05 |
| shelfmark | brief 09 |
| SocialEvents | brief 18 |
| sports-app | brief 05 |
| wicket | brief 14 |
| ward-auth | brief 07 (the console stays dark only; the sign-in pages get the theme switch) |
| imbatranimOS | brief 88 |
| imbatranim-apps | brief 11 |
| presentation-sites | briefs 05-08, one per site: *auto-service*, *saloon*, *subcort* and *tractari* redesigns |
| churchix (own corpus) | brief 05, *Parish template redesign with Hallmark on the estate board* |

Out of scope: 3D-sandbox and game-engine (the UI is the game), just-a-bot (no
web UI of its own).

## Rules the proposals follow

- **Q18.** Apps keep the Light / Dark / System switch. The client business
  sites and Churchix's parish sites keep the one look designed for each, with
  no switch.
- **Q17 and Q61.** Token names name a role, never a value. An app that keeps
  its own names until now may rename them in its redesign.
- **Hallmark's Floor** (contrast, focus, reduced motion, invented facts, a
  broken phone layout) is a gate: a proposal that fails it is not shown.
- Photographs are credited and openly licensed. No invented facts about a
  client business.

## What to do

1. Read brief 24's outcome (Hallmark vendored) and each repo's redesign brief.
2. Capture today's screenshots per app at 1280 and 390 px.
3. For each app, build the proposal through the repo's redesign brief, as
   design only (static comps), and add its page to the board.
4. Publish the board as one private artifact, with the tracker table on its
   first page.
5. The owner approves per app on the board. An approved app's redesign brief
   is then built in that repo; a rejected one is closed with a `log.md` note.

## Acceptance

- The board has a page for every row above with both viewports, and the
  tracker table.
- No app's code changed before its approval.
- Each approved app's redesign brief reaches that repo's `done/`, with
  before and after screenshots in its outcome note.
- `bash corpus/lint.sh` passes.
