# Task 05: Shelfmark's web app to Tailwind

> Superseded on 2026-11-10 by Shelfmark brief 07, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

On 2026-11-09 the owner decided that every app styles with Tailwind instead
of plain CSS, migrating whole apps and not only the Base UI parts (brief 02,
owner call 3). Briefs 05-14 do one app each, and they all follow the method
in `skills/base-ui/references/migrating-from-plain-css.md` (brief 02, step
4).

**Shelfmark** (`web/`), as surveyed on 2026-11-09:

- **13 CSS files, 5,474 lines.** The largest are `library/library.css`
  (1,602), `add/add.css` (1,128), `book/book.css` (631),
  `styles/components.css` (502) and `styles/shell.css` (436).
- **Tokens** in `styles/tokens.css`: 132 lines, 98 custom properties.
- 13 `@media` blocks and 14 `@keyframes`. Light only.
- **`DESIGN.md` at the repo root** is the design system as built, and every
  UI brief builds against it.
- **Base UI 1.9.0** under the menus, panels, the dialog, tabs, toggles and
  the collapsible. The four behaviours that needed explicit code are on
  Shelfmark's `corpus/wiki/overlays.md`.

This reverses Shelfmark's decision "Base UI under the menus, panels, dialog
and switches", which styles them with "Shelfmark's own CSS and DESIGN.md's
tokens" and rejected shadcn "which brings Tailwind". Record the revisit in
Shelfmark's `decisions.md` and `log.md`.

Shelfmark's brief 04, "Book recommendations", adds a page. Build whichever
lands second in the styling of the first.

**Depends on:** briefs 02 (the skill and checker) and 04 (already 1.9.0
here, so nothing to wait for).

## Files you OWN

In Shelfmark:

- `web/src/**/*.css` (deleted as they empty);
- `web/src/styles/index.css` (new);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts` (new);
- `web/package.json`, `web/vite.config.ts` and the lockfile;
- `DESIGN.md`;
- `corpus/wiki/design.md`, `decisions.md`, `status.md` and `log.md`.

## Files you must NOT touch

- `server/`, `shared/`, and the behaviour of any component (props, data,
  focus handling).
- The TanStack Table logic in `web/src/library/` beyond its class names.

## What to do

1. Follow the migration method. Take the screenshots first, of:
   - the Library in table and covers modes, with the bulk bar showing;
   - Add a book, through all three scan outcomes;
   - the book page, sign-in, import, stats, and the account menu;
   - each Base UI overlay open;

   each at 1280 and 390 px.
2. Move the 98 tokens into `@theme` with their exact values, under the names
   DESIGN.md uses.
3. Migrate in this order, building after each file:
   1. `base.css`
   2. `shell.css`
   3. `components.css`
   4. `account.css`, `auth.css`, `pwa.css`, `stats.css`
   5. `import.css`
   6. `book.css`
   7. `CameraScanner.css`
   8. `add.css`
   9. `library.css`

   The 14 keyframes become `--animate-*` theme entries.
4. Update DESIGN.md so it names Tailwind tokens and utilities.
5. Run `node scripts/check-base-ui.mjs web` from brief 02 (the copy brief 15
   installs, or the skill's own copy if 15 hasn't run yet).

## Acceptance

- `web/src` has one `.css` file, `styles/index.css`, and the checker passes.
- `npm run typecheck`, `npm test`, `npm run lint` and `npm run build` pass.
- The after-screenshots match the before set. The outcome note lists every
  difference with its reason.
- Shelfmark's decision is revisited in `decisions.md` with a dated entry,
  and `log.md` has the entry.
