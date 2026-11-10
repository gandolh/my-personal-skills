# Task 13: lantern's web app to Tailwind, with Base UI

> Superseded on 2026-11-10 by lantern brief 17, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**lantern** (`web/`), as surveyed on 2026-11-09:

- **One stylesheet, `src/styles.css`: 933 lines**, 38 custom properties,
  4 `@media` blocks.
- **Dark mode through `prefers-color-scheme: dark`.**
- **`@base-ui/react` 1.9.0 is declared in `package.json`, but no file
  imports it.** Brief 02's rule 13 says interactive widgets start from Base
  UI.
- It is in the family with wicket and the-board. Reuse the token names
  brief 11 recorded.

Owner decision, default: this brief also moves lantern's hand-built
interactive widgets onto Base UI wrappers in `components/ui/`. Candidates
are any dialog, menu, popover, switch or tabs on the rating cards, a title's
page and the lists. That puts the dependency to use. The alternative is
Tailwind only, and dropping the unused dependency.

**Depends on:** briefs 02 and 11.

## Files you OWN

In lantern:

- `web/src/styles.css` (it becomes `web/src/styles/index.css`);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/components/ui/*` (new wrappers);
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `server/`, including the suggestion scoring.
- The swipe gestures on the rating cards, beyond their class names.

## What to do

1. Follow the method. Take the screenshots, in light and dark at 1280 and
   390 px, of:
   - the rating cards, mid-swipe;
   - search and a title's page;
   - the watchlist, the ratings and not interested;
   - suggestions;
   - sign-in.
2. List the hand-built widgets. Replace each with a Base UI wrapper that
   keeps its behaviour.
3. Use the family's tokens, then migrate.
4. Add a `decisions.md` entry, "Base UI for lantern's widgets, styled with
   Tailwind".
5. Run the checker.

## Acceptance

- One `.css` file. Base UI is imported only under `ui/`, and the checker
  passes.
- lantern's `typecheck`, `test`, `lint` and `build` pass.
- The screenshots match, and each replaced widget works with the keyboard
  and Esc.
- The decision and the `log.md` entry are written.
