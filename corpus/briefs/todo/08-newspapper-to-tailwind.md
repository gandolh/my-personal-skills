# Task 08: Newspapper's UI to Tailwind

## Context

The owner's call of 2026-11-09 is whole apps to Tailwind (brief 02, call 3).
The method is `skills/base-ui/references/migrating-from-plain-css.md`.

**Newspapper** (`ui/`), as surveyed on 2026-11-09:

- **The only CSS Modules app**: 42 `*.module.css` files plus
  `styles/global.css` (352), 4,367 lines in all. The largest are
  `components/ui/Marks.module.css` (340), `editor/SourcePane.module.css`
  (304), `reader/Rail.module.css` (207) and `Sidebar.module.css` (203).
- **Tokens:** 56 custom properties.
- **12 `@font-face` rules.** These are the newspaper's type, and they stay
  in the one stylesheet.
- 10 `@media` blocks, no keyframes, light only.
- **Vite 6.4.5.** Check `@tailwindcss/vite`'s peer range for Vite 6 before
  installing.
- **The design system** is `DESIGN.md` plus `corpus/wiki/design.md`, which
  holds the token block.
- **Base UI 1.5.0** (button, dialog, input, select, switch, toast) until
  brief 04 bumps it.

No Newspapper decision rejects Tailwind, so nothing is revisited.

There is one trap. The editor's preview (`editor/preview/SlideCanvas`,
`TNodeView`, `PreviewPane`) may have to look exactly like what the server
renders. If those styles mirror the render's CSS, they are part of the
output, not the app chrome. Find out first. If they are, keep them as one
named `@layer components` block shared with the render, and say so in the
outcome note.

**Depends on:** briefs 02 and 04 (Newspapper's 1.5.0 → 1.9.0 goes first, so
a visual change isn't blamed on the wrong brief).

## Files you OWN

In Newspapper:

- `ui/src/**/*.module.css` and `ui/src/styles/global.css` (they become
  `ui/src/styles/index.css`);
- the `className`s and `styles.x` uses in `ui/src/**/*.tsx`;
- `ui/src/lib/cn.ts`;
- `ui/package.json`, the Vite config and the lockfile;
- `DESIGN.md`, `corpus/wiki/design.md`, `status.md`, `log.md`.

## Files you must NOT touch

- `api/`.
- The server-side render's own CSS, if any.
- The reader's keyboard handling.

## What to do

1. Follow the method. Take the screenshots of:
   - login;
   - the reader (rail, item list, reading pane, clippings, sources);
   - posts;
   - the editor (source, inspector, palette, preview, image picker);
   - settings, the kitchen sink island, and each toast and modal;

   each at 1280 and 390 px.
2. Move the tokens and the 12 `@font-face` rules into `index.css`.
3. Migrate:
   1. `components/ui/*`, the primitives, first
   2. then `auth`, `Sidebar`, `layouts`
   3. `reader/*`
   4. `posts`
   5. `settings`
   6. `editor/*` last, with the preview trap settled first
4. Run the checker.

## Acceptance

- `ui/src` has no `*.module.css` and one `index.css`, and the checker passes.
- Newspapper's `lint` and the UI's typecheck and build pass.
- The screenshots match, and the editor preview still matches a server
  render of the same post.
- `DESIGN.md` names the Tailwind tokens, and `log.md` has the entry.
