# Task 06: Almanac's web app to Tailwind

> Superseded on 2026-11-10 by Almanac brief 03, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**Almanac** (`web/`), as surveyed on 2026-11-09:

- **14 CSS files, 3,412 lines.** The largest are `styles/components.css`
  (632), `styles/shell.css` (507), `event/editor.css` (410),
  `calendars/calendars.css` (290) and `search/search.css` (268).
- **Tokens** in `styles/tokens.css`: 179 lines, 159 custom properties.
- 20 `@media` blocks and 7 `@keyframes`. Almanac's decisions say "light
  only", but one stylesheet has a dark-mode or theme selector. Find out
  whether it is used before mapping it.
- **FullCalendar v7's CSS**, imported from the package
  (`@fullcalendar/react/skeleton.css` and the `monarch` theme). It stays a
  third-party import. Almanac's overrides of FullCalendar's DOM can't become
  utilities, so they move to `@layer components` with a comment.
- No `DESIGN.md`.

This revisits Almanac's decision "Base UI under the dialogs, popovers, menus
and drawer", which rejected shadcn "which brings Tailwind, which Almanac
doesn't use". The calendar-library decision also names Tailwind as one
reason to reject ilamy-calendar. That choice stands on its other reason (one
maintainer), so note that and leave it alone.

**Depends on:** brief 02.

## Files you OWN

In Almanac:

- `web/src/**/*.css`;
- `web/src/styles/index.css` (new);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`, and `overlays.md`
  where it names CSS files.

## Files you must NOT touch

- `server/`, `shared/`, and FullCalendar's configuration and event handling.
- Component behaviour, including the Escape guard and initial focus in
  `components/Dialog.tsx`.

## What to do

1. Follow the method. Take the screenshots in day, week, month and year
   views, plus:
   - the event editor and details;
   - search;
   - the calendars list and colour picker;
   - account, time zone and notifications;
   - sign-in;
   - the phone drawer;

   each at 1280 and 390 px.
2. Move the 159 tokens into `@theme` with their exact values.
3. Migrate in this order:
   1. `base.css`
   2. `shell.css`
   3. `components.css`
   4. `account.css`, `time-zone.css`, `auth.css`, `notifications.css`
   5. `calendars.css`
   6. `search.css`
   7. `details.css`, `editor.css`
   8. `year.css`
   9. `calendar.css` (the FullCalendar overrides) last
4. Run the checker.

## Acceptance

- `web/src` has one `.css` file, and the FullCalendar imports are in it. The
  checker passes.
- Almanac's `typecheck`, `test`, `lint` and `build` pass.
- The screenshots match, with any differences listed.
- The decision revisit is in `decisions.md`, and `log.md` has the entry.
