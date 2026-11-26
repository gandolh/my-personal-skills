---
title: house-style carries the one-pass check runner and the two cache flags
created: 2026-11-24
status: promoted
tags: [house-style, harness]
---

# house-style carries the one-pass check runner and the two cache flags

Promoted 2026-11-24 to [brief 47](../briefs/done/47-house-style-ships-the-one-pass-check-runner.md).

From [check-speed-2026-11-23.md](../wiki/check-speed-2026-11-23.md), recommendations 1 and 4. On 2026-11-23 the
21 app repos got a `scripts/check.mjs` runner (every step runs even after one fails, one line per step, the log kept
in `node_modules/.cache/check/last.log`), Prettier's check with its own cache location, and `depcruise --cache`. The
house-style package still describes `npm run check` as an `&&` chain, so the next adoption brief or sync note could
undo it. Move the runner into house-style's `bin/`, document it in the skill and `adoption.md`, and sync it to the
repos that were left out (game-engine, trips, vps-deploy) when they are free. Timed against today's gate in one repo.
