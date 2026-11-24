---
title: Spike TypeScript 7 for tsc
created: 2026-11-24
status: promoted
tags: [house-style, spike]
---

# Spike TypeScript 7 for tsc

Promoted 2026-11-25 to [brief 51](../briefs/todo/51-spike-typescript-7-for-tsc.md).

From [check-speed-2026-11-23.md](../wiki/check-speed-2026-11-23.md), recommendation 5. In an almanac clone on
2026-11-23: cold `tsc -b` 12.5 s to 2.4 s, warm web typecheck 3.5 s to 0.6 s, one file touched 3.8 s to 1.0 s, with
typescript-eslint staying on TS 6 through the npm alias. Typecheck is 5% of almanac's gate and about 20% of the
heavier repos'. Adopting it changes house-style: the owner's call after a one-repo spike.
