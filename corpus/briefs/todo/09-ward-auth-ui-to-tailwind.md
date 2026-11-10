# Task 09: ward-auth's UI to Tailwind

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**ward-auth** (`ui/`), as surveyed on 2026-11-09:

- **3 CSS files, 1,530 lines**: `tokens.css` (193; 43 custom properties),
  `ward.css` (440: the public pages, meaning login, register, verify and
  account) and `pages/console/console.css` (897).
- 3 `@media` blocks, light only.
- **Base UI 1.9.0**, only in `pages/console/`: an AlertDialog and
  Collapsibles.

ward-auth's decision "The console's widgets are Base UI; the public pages
import none" is half kept. Since 2026-10-27 the console is a lazy chunk, so
the sign-in pages download none of Base UI. That must stay true. The
Tailwind half, "styled by `console.css`", is revisited.

Tailwind emits one stylesheet for every class in use, so the public pages
would download the console's utilities as well. Measure that:

- the sign-in page's CSS, gzipped, before and after;
- the console's JS chunk boundary, which must not move.

If the public CSS grows by more than about 5 kB gzipped, the default
remedy is a second entry stylesheet for the console, imported by the lazy
chunk. That is two `index.css` files, so record the exception in the
checker config (brief 15) and in the outcome note.

**Depends on:** brief 02.

## Files you OWN

In ward-auth:

- `ui/src/**/*.css`;
- `ui/src/styles/index.css` (new);
- the `className`s in `ui/src/**/*.tsx`;
- `ui/src/lib/cn.ts`;
- `ui/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `api/`, including the server-rendered OIDC pages in
  `api/src/oidc/layout.ts`.
- `shared-library/`.
- The console's focus rule after a write (the `data-wc-focus` key).

## What to do

1. Follow the method. Take the screenshots of:
   - login, register, verify and account;
   - the console's panels, with the AlertDialog open and a Collapsible open;

   each at 1280 and 390 px. Record the sign-in page's CSS and JS sizes.
2. Move the tokens into `@theme`.
3. Migrate `ward.css`, then `console.css`.
4. Measure again, and apply the second-entry remedy only if the numbers call
   for it.
5. Run the checker.

## Acceptance

- `ui/src` has one `.css` file, or two with the recorded exception, and the
  checker passes.
- ward-auth's `lint`, tests and UI build pass.
- The sign-in pages still load no Base UI JavaScript, as the built chunk map
  shows.
- The before and after CSS sizes are in the outcome note.
- The decision revisit and the `log.md` entry are done.
