# Migrating an app from plain CSS to Tailwind

The one method every app's Tailwind brief follows. The whole app moves, not
only its Base UI parts: the owner chose "whole apps to Tailwind" on
2026-11-09. The order across the estate (Q20) is the todo app, wicket,
the-board, lantern, Satchel, ward-auth, Almanac, Shelfmark, Postern, then
Newspapper.

A repo that writes its Base UI wrappers before this brief uses plain classes
and state through `[data-*]` selectors in its one stylesheet, because `cn()`
and the tokens don't exist yet; this migration converts them.

Checked against `tailwindcss` 4.3.5 and `@tailwindcss/vite` 4.3.5 on
2026-11-11.

## The method

### 1. Screenshots before

Before touching anything, take Playwright screenshots of every screen at
1280 and 390 px wide, in light and in dark if the app has both. The
`ui-test-plans` skill has the bring-up (server, fixtures, sign-in). Keep
them out of git, in the scratch folder the brief names.

### 2. Tailwind in, every old stylesheet in `legacy`

- Add `tailwindcss` and `@tailwindcss/vite`, pinned exactly, and the plugin
  in `vite.config.ts`.
- Create `src/styles/index.css` ([tailwind.md](tailwind.md) has the full
  file). Its first line fixes the layer order:

  ```css
  @layer theme, base, vendor, legacy, components, utilities;
  @import "tailwindcss";
  @import "../list/list.css" layer(legacy);
  @import "../shell/shell.css" layer(legacy);
  ```

- Every existing stylesheet moves into it as an `@import … layer(legacy)`,
  and `main.tsx` imports `./styles/index.css` alone in place of the old CSS
  imports. Third-party CSS (Leaflet, FullCalendar) goes in `layer(vendor)`.
- Why: CSS outside a layer beats every layered rule, so a half-moved file
  would silently override the utilities that replace it. In `legacy`, below
  `utilities`, a leftover rule always loses, and any state in between is
  safe to commit (Postern's method, adopted for the estate).
- **Preflight.** Tailwind's reset removes browser defaults the old CSS may
  have leaned on: heading sizes and margins, list bullets, button
  backgrounds, `img` as an inline element. Take the screenshots again right
  after this step; whatever changed is preflight's doing. Put back what
  matters in `@layer base`, with a comment.
- Build, run the tests, commit. Check the built CSS for what the app relies
  on: a `light-dark(` token survives, `bg-<token>/50` compiles, and the `sm`
  breakpoint is the width the app expects.
- `.prettierignore` lists the stylesheets still in `legacy`, so a format run
  doesn't churn files that are about to be deleted.

### 3. Tokens into `@theme`, values kept

- Map the app's custom properties into `@theme`, each value exactly as it
  was. Rename to a role name only where the old name was a raw colour
  (`--blue-600` becomes `--color-accent`); otherwise keep the app's names
  until its redesign (Q61).
- Colours go in `--color-*`, sizes in `--text-*` with their line heights,
  radii in `--radius-*`, shadows in `--shadow-*`, the z values in
  `--z-index-*` (rule 8's scale; imbatranimOS had 15 literal `z-[N]` and a
  Select popup under a Dialog), keyframes in `--animate-*`.
- **The root font size** goes back to the browser's default and the app's
  size moves onto `body` (Q44): a pixel size on `html` overrides the
  reader's own setting and skews every `rem` utility. Where the app's size
  isn't 16 px, set `--spacing` so every spacing utility keeps its pixel
  value (13 px: `0.203125rem`, which is 0.25rem times 13/16), and turn the
  named text sizes into same-pixel `--text-*` entries.
- Extend `cn()`'s tailwind-merge with the new size, radius, shadow and z
  names ([tailwind.md](tailwind.md)), or it drops classes it reads as
  conflicting.
- Add the theme switch if the app lacks one ([theme.md](theme.md), rule 14).

### 4. One stylesheet at a time

- Move one file's rules to utilities on the JSX, delete the file once it is
  empty along with its `@import … layer(legacy)` line, build, and commit.
- **Move each component whole, in one commit.** An inline `style` beats
  every layer, so a component can't mix old inline styles and new
  utilities. Inline `style` stays only for computed geometry (rule 5).
- **What can't become a utility** stays in `@layer base` or
  `@layer components`, each with a comment saying why: element defaults,
  third-party DOM (FullCalendar's cells), print rules. Keep these few.
- **Unlayered CSS in a dependency still wins.** An icon font's own
  `.material-symbols-outlined { font-size: 24px }` beats every `text-*`
  (31 inline `fontSize` in comercial-website exist because of it); import
  it into `vendor` so a utility can win.
- **Material Symbols ligatures are read aloud.** An icon-only button
  announces `keyboard_arrow_up`: the glyph gets `aria-hidden`, the button
  an `aria-label`.
- **Hover-only controls vanish on touch**, because Tailwind 4's `hover:`
  applies only under `(hover: hover)`. Reveal them with
  `group-focus-within:` and `[@media(hover:none)]:` too.
- Colours become tokens as they move. `check-base-ui` reports an arbitrary
  colour as rule 6 wherever it appears in code.

### 5. Screenshots after

Take the same screenshots again and compare them pair by pair. The bar is
**close enough** (Q19): no visible change to layout or colour. Drift of a
few pixels in spacing or rounding needn't be fixed or listed. Anything more
is fixed, or listed in the brief's outcome note with the reason.

### 6. The design notes and the decisions

- Update the app's `DESIGN.md`, if it has one, to name the Tailwind tokens.
- Revisit any corpus decision that rejected Tailwind, with a `log.md`
  entry: Satchel's "Base UI for interactive controls, styled by our own
  CSS" and Almanac's "Base UI under the dialogs, popovers, menus and
  drawer" are the two known.
- Turn on house-style's class-order rule (`tailwind.order` in the ESLint
  options) once no legacy stylesheet is left.

### 7. Done when

`check-base-ui` passes without `--warn-only`, along with the app's
typecheck, tests and build. Drop the flag from `check:conventions` in the
same commit.

## Exceptions a migration may record

Each goes in `conventions.json` with its reason, so the checker stays quiet
and a reviewer can see why:

- A third-party stylesheet only one lazy route loads (FullCalendar in
  Almanac, Q42): a rule 5 exception for that small file.
- A second stylesheet for public pages once the app's CSS passes about
  5 kB gzipped (ward-auth's sign-in pages, Q21): rule 5.
- An inline `style` that holds data (a progress width, a colour the user
  picked): rule 5, recorded for review.
