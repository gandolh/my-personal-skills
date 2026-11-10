# Task 07: Postern's web app to Tailwind

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**Postern** (`web/`), as surveyed on 2026-11-09:

- **19 CSS files, 5,736 lines**, the most in the estate. The largest are
  `composer/composer.css` (886), `shell/shell.css` (878),
  `conversation/conversation.css` (665), `list/list.css` (545),
  `theme/base.css` (364), `mobile/mobile.css` (359) and `labels/labels.css`
  (358).
- **Tokens** in `theme/tokens.css`: 172 lines, 95 custom properties.
- **Light and dark through `[data-theme="light"]` and
  `[data-theme="dark"]`**, so the dark variant is
  `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`.
- Fonts from `@fontsource-variable/atkinson-hyperlegible-next` and
  `@fontsource/atkinson-hyperlegible-mono`.
- 11 `@media` blocks and 5 `@keyframes`. `mobile.css` is a whole phone
  layout. Fold it into responsive variants on the same elements rather than
  keeping a second stylesheet.

This revisits Postern's decision "Base UI under the overlays; the composer
window stays native". The Tailwind half is revisited; the composer staying
native is not.

**Depends on:** brief 02.

## Files you OWN

In Postern:

- `web/src/**/*.css`;
- `web/src/styles/index.css` (new; `theme/` goes);
- the `className`s in `web/src/**/*.tsx`;
- `web/src/lib/cn.ts`;
- `web/package.json`, the Vite config and the lockfile;
- `corpus/wiki/decisions.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `server/` and any shared package.
- The composer window's native behaviour.
- The rendering of mail bodies. If the conversation view styles sanitized
  HTML from messages, those selectors are third-party DOM and stay in
  `@layer components`.

## What to do

1. Follow the method. Take the screenshots in light and dark, at 1280 and
   390 px, of:
   - the list, the conversation, the composer;
   - search, labels, filters, contacts and settings;
   - the keys, invites, snooze and scheduled-send panels;
   - sign-in;
   - every overlay open.
2. Map the tokens and both themes into `@theme` plus the dark variant.
3. Migrate:
   1. `base.css`
   2. `shell.css`, `modal.css`
   3. `list.css`
   4. `conversation.css`
   5. `composer.css`
   6. the feature files
   7. `mobile.css` last, as responsive variants
4. Run the checker.

## Acceptance

- `web/src` has one `.css` file, and the checker passes.
- Postern's `typecheck`, `test`, `lint` and `build` pass.
- The light and dark screenshots match, with any differences listed.
- The decision revisit and the `log.md` entry are done.
