# Task 11: wicket's web app to Tailwind

> Superseded on 2026-11-10 by wicket brief 12, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**wicket** (`web/`), as surveyed on 2026-11-09:

- **One stylesheet, `src/styles.css`: 544 lines**, 25 custom properties,
  2 `@media` blocks.
- **Dark mode through `prefers-color-scheme: dark`.**
- **Base UI 1.9.0**: one AlertDialog, in `ConfirmAction.tsx`, which is the
  model for brief 02's confirm pattern.

wicket, the-board (brief 12) and lantern (brief 13) are one family of small
internal tools. On 2026-11-09 their stylesheets shared 100-160 identical
lines: the system font stack, `--banner-bg` / `--banner-text`, and the
button and dialog classes. Use the same `@theme` token names in all three,
so a later shared token file stays possible. This brief goes first and sets
the names, and briefs 12 and 13 reuse them.

**Depends on:** brief 02.

## Files you OWN

In wicket:

- `web/src/styles.css` (it becomes `web/src/styles/index.css`);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/status.md`, `log.md`.

## Files you must NOT touch

- `server/`.
- `ConfirmAction`'s pending logic.

## What to do

1. Follow the method. Take the screenshots of every screen, in light and
   dark, at 1280 and 390 px.
2. Name the family's tokens. Record the list in wicket's `log.md` entry, and
   in a comment at the top of the `@theme` block, for briefs 12 and 13.
3. Migrate, then run the checker.

## Acceptance

- One `.css` file, and the checker passes.
- wicket's `typecheck`, `test`, `lint` and `build` pass.
- The screenshots match.
- The family's token names are written down where briefs 12 and 13 can copy
  them.
