# Task 12: the-board's web app to Tailwind

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**the-board** (`web/`), as surveyed on 2026-11-09:

- **One stylesheet, `src/styles.css`: 909 lines**, 32 custom properties,
  4 `@media` blocks.
- **Dark mode through `prefers-color-scheme: dark`.**
- **Base UI 1.9.0**: a Dialog and a Collapsible, in `DetailPanel.tsx`
  and one other file.
- It is in the family with wicket and lantern. Reuse the token names brief
  11 recorded.

This revisits the-board's decision "Base UI for the UI's widgets, styled by
our own CSS", which rejected shadcn "which would bring Tailwind into a board
that has none". The Base UI half stays.

**Depends on:** briefs 02 and 11 (for the token names).

## Files you OWN

In the-board:

- `web/src/styles.css` (it becomes `web/src/styles/index.css`);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `server/`, including its sync.

## What to do

1. Follow the method. Take the screenshots of the board and the detail
   panel, open and closed, in light and dark, at 1280 and 390 px.
2. Use the family's token names, and add only what the-board alone needs
   (its status colours: `--backlog`, `--blocked`, and the rest).
3. Migrate, then run the checker.

## Acceptance

- One `.css` file, and the checker passes.
- the-board's `typecheck`, `test`, `lint` and `build` pass.
- The screenshots match.
- The decision revisit and the `log.md` entry are done.
