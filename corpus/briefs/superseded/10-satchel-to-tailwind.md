# Task 10: Satchel's web app to Tailwind

> Superseded on 2026-11-10 by Satchel brief 03, *The web app to Tailwind*. Kept for the method and measurements it records.

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**Satchel** (`web/`), as surveyed on 2026-11-09:

- **10 CSS files, 1,290 lines**: `styles/layout.css` (367),
  `thread/thread.css` (210), `styles/chats.css` (171), `people/people.css`
  (124), `auth/auth.css` (91), `styles/base.css` (78),
  `notifications.css` (75), `connect-claude.css` (71),
  `styles/tokens.css` (56; 38 custom properties) and
  `styles/settings.css` (47).
- **Dark mode through `prefers-color-scheme: dark`**, which is Tailwind's
  default `dark:` variant, so no custom variant is needed.
- Fonts from `@fontsource`: Familjen Grotesk, Instrument Sans, IBM Plex
  Mono.
- **Base UI 1.9.0**: Switch and Checkbox.
- It is also a PWA and an Android share target.

This revisits Satchel's decision "Base UI for interactive controls, styled
by our own CSS", which rejected shadcn "which would bring Tailwind". Its
other half, that new widgets start from Base UI, stays.

**Depends on:** brief 02.

## Files you OWN

In Satchel:

- `web/src/**/*.css`;
- `web/src/styles/index.css` (new);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `server/` and any shared package.
- The PWA manifest and service worker, and the share-target flow.

## What to do

1. Follow the method. Take the screenshots in light and dark, at 1280 and
   390 px, of:
   - chats and a thread;
   - people;
   - settings, with connect-Claude and notifications;
   - sign-in.
2. Move the tokens into `@theme`. Map the dark values under `dark:`, or into
   `@theme` with a `prefers-color-scheme` block in `@layer base` if the
   tokens switch rather than the utilities. Prefer switching the tokens:
   fewer class names.
3. Migrate:
   1. `base.css`
   2. `layout.css`
   3. `chats.css`
   4. `thread.css`
   5. then the rest
4. Run the checker.

## Acceptance

- `web/src` has one `.css` file, and the checker passes.
- Satchel's `typecheck`, `test`, `lint` and `build` pass.
- The light and dark screenshots match, with any differences listed.
- The decision revisit and the `log.md` entry are done.
