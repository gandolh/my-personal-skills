---
title: Spike oxlint for the five typed rules
created: 2026-11-24
status: promoted
tags: [house-style, spike]
---

# Spike oxlint for the five typed rules

Promoted 2026-11-25 to [brief 50](../briefs/todo/50-spike-oxlint-for-the-typed-lint-rules.md).

From [check-speed-2026-11-23.md](../wiki/check-speed-2026-11-23.md), recommendation 3. ESLint is about half of every
gate. In an almanac clone on 2026-11-23: typed ESLint 46 s, against 18 s for ESLint without types plus 3-5 s for
`oxlint --type-aware` on the five typed rules, with the same findings on a probe file. Without types ESLint's
`--cache` becomes usable (caveats: import-x resolution, better-tailwindcss reading the stylesheet). Adopting it
changes house-style, so it is the owner's call after a one-repo spike that compares findings on the same commit.
