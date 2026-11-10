# Task 14: The mini todo app to Tailwind

> Superseded on 2026-11-10 by mini-projects brief 04, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**mini-projects' `literally-a-todo-app`** (`frontend/`), as surveyed on
2026-11-09:

- **2 CSS files, 239 lines**: `src/index.css` (55) and `src/App.css` (184),
  with one `@font-face`, 6 `@media` blocks and no custom properties.
- **Base UI `^1.4.1`, resolved 1.4.1**: button, checkbox and separator
  wrappers in `components/shared/`. Brief 04 pins it to 1.9.0.
- The app has its own `CLAUDE.md` and `skills-lock.json` inside
  mini-projects.

It is the smallest migration, and a good dry run of the method before the
large apps.

**Depends on:** briefs 02 and 04.

## Files you OWN

In mini-projects:

- `literally-a-todo-app/frontend/src/*.css` (they become
  `src/styles/index.css`);
- the `className`s in its `src/**/*.tsx`;
- the move of `components/shared/` to `components/ui/` (brief 02, rule 3);
- its `src/lib/cn.ts`;
- its `package.json`, the Vite config and the lockfile.

## Files you must NOT touch

- `literally-a-todo-app/backend/`, and the other mini-projects.

## What to do

1. Follow the method. Take the screenshots of the app's one screen, at 1280
   and 390 px.
2. There are no tokens to carry, so define a small `@theme` from the colours
   `App.css` uses.
3. Migrate, move the wrappers to `components/ui/`, and run the checker.

## Acceptance

- One `.css` file, wrappers under `components/ui/`, and the checker passes.
- The frontend's `lint` and `build` pass.
- The screenshots match.
