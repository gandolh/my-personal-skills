# Task 02: A base-ui skill, styled with Tailwind

## Context

On 2026-11-09 the owner asked whether to build a shared component library
for their web apps, all of which sit on Base UI (`@base-ui/react`). A survey
that day of the owner's public repos found 22 apps on Base UI: 83 source
files import it, about 12k lines, of which about 40 files are thin wrappers
of 15-90 lines each.

The verdict, which the owner accepted, was **no shared library**:

- each app has its own look on purpose (many carry a `DESIGN.md`);
- the apps were split between Tailwind and plain CSS;
- Base UI versions ran from 1.4.1 to 1.9.0;
- the one shared kit that exists (`@imbatranim/ui`, vendored from
  ImbatranimOS into imbatranim-apps with a `COMMIT` pin and a `kit:sync`
  script) shows what lockstep costs.

What does repeat across apps is behaviour and gotchas, not markup, and that
is what this skill captures.

The owner made three calls the same day:

1. A skill for working with Base UI in this library, with the conventions,
   rules and patterns, **enforced in every repo** (enforcement is brief 15).
2. **All repos on the latest stable Base UI**, which is 1.9.0, published
   2026-10-09 (brief 04).
3. **Base UI with Tailwind, in favour of plain CSS.** This is the whole app,
   not only the Base UI parts: the owner chose "whole apps to Tailwind" when
   asked (briefs 05-14). It reverses two app-level decisions that rejected
   Tailwind: Satchel's "Base UI for interactive controls, styled by our own
   CSS" and Almanac's "Base UI under the dialogs, popovers, menus and
   drawer". Each is revisited in that app's migration brief.

What the survey found repeated by hand, each found by its app on its own:

- **The Escape guard.** An Esc that a control inside a dialog already used
  (a list closing) must not close the dialog:
  `details.reason === "escape-key" && details.event.defaultPrevented`.
  Seven files.
- **Initial focus.** Focus the first `[data-autofocus]`, else the first
  field, else the footer's first button. Almanac, Shelfmark, Postern,
  the-board.
- **Confirm with a pending state.** An AlertDialog that cannot be dismissed
  while its action runs, with a "Working…" label: wicket's `ConfirmAction`,
  ward-auth, comercial-website.
- **Tooltip around a Button nests `<button>` in `<button>`.** The trigger
  needs `render`. Recorded in ImbatranimOS's `corpus/wiki/ui-conventions.md`
  as its rule 42.
- **Select shows the raw value** unless `Select.Root` gets an `items` map.
  Recorded on the same page.
- **No native `confirm` / `alert` / `prompt`.** The same page's rule 43.

The 1.4-1.9 changelog has two breaking changes:

- `OTPFieldPreview` became `OTPField`
  (`@base-ui/react/otp-field`).
- `sanitizeValue()` became `normalizeValue()`.

Brief 04 handles both.

### Verified on 2026-11-09 against `@base-ui/react@1.9.0`'s published types

The names the rules lean on exist as written:

- **Dialog's Root:** `onOpenChange`, `onOpenChangeComplete`, `modal`,
  `disablePointerDismissal`, `actionsRef`.
- **Dialog's Popup:**
  - `initialFocus` takes
    `boolean | RefObject | ((openType: InteractionType) => boolean | HTMLElement | null | void)`;
  - `finalFocus` takes `boolean | RefObject | …`.
- **Change reasons:** `escape-key`, `outside-press`, `close-press`,
  `trigger-press`, `focus-out`, `item-press`, `imperative-action`, `none`.
- **Select's** `items` takes `Record<string, ReactNode>` or an array of
  `{ value, label }`.
- **Positioner CSS variables:** `--transform-origin`, `--anchor-width`,
  `--anchor-height`, `--available-width`, `--available-height`,
  `--positioner-width`.
- **State attributes:** `data-open`, `data-closed`, `data-checked`,
  `data-unchecked`, `data-highlighted`, `data-disabled`, `data-pressed`,
  `data-popup-open`, `data-nested`, `data-instant`, `data-side`,
  `data-align`, `data-starting-style`, `data-ending-style`.

Tailwind v4 (4.3.5) reaches a bare data attribute as a variant
(`data-checked:`), and a CSS variable as `origin-(--transform-origin)`.

1.9.0 also ships components the survey found no app using yet:

- `drawer`: Almanac's phone drawer is a Dialog today;
- `combobox`, `autocomplete`;
- `menubar`, `navigation-menu`, `toolbar`;
- `number-field`, `otp-field`;
- `filter-dropdown`;
- `csp-provider`.

The references cover `drawer`, `combobox` and `toolbar`, the ones these
apps would reach for. Each reference names the version it was checked
against.

Claude Code's skill frontmatter (docs read 2026-11-09) has a `paths` field
that limits when a skill loads on its own. Give this skill
`paths: ["**/web/src/**", "**/ui/src/**", "**/src/components/**"]`, so it
loads in UI work and stays out of server work. `when_to_use` carries the
trigger phrases, and the description says what the skill is.

### Found while writing Almanac's repo briefs (2026-11-09)

- **Unlayered vendor CSS beats every layered rule**, `@layer components` included. A vendor stylesheet (FullCalendar's, Leaflet's) is imported into a low layer, `@import "…" layer(vendor);`, declared before Tailwind's layers. Then an app override in `@layer components` wins.
- **A root `font-size` other than 16 px** shifts Tailwind's rem-based scale (Almanac's is 15 px). The migration method either sets `--spacing` to match or moves the size onto `body` (a grilling question).
- **Custom theme size and colour names need `extendTailwindMerge`** in `cn()`, or tailwind-merge drops classes it doesn't recognise as conflicting.

## Files you OWN

- `skills/base-ui/SKILL.md` (new)
- `skills/base-ui/references/*.md` (new)
- `skills/base-ui/scripts/check-base-ui.mjs` (new) and its fixtures and test
  under `skills/base-ui/scripts/`
- `README.md` (the skills table), `docs/history.md`,
  `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` (version)
- This repo's `corpus/` (status, log, decisions)

## Files you must NOT touch

- Any other repo. Rolling the skill out is brief 15. Bumping versions is
  brief 04. Migrating apps to Tailwind is briefs 05-14.
- `skills/vercel-composition-patterns/` and the other vendored skills: link
  to them, don't edit them.

## What to do

1. **`SKILL.md`.** A description that triggers on "base-ui", "Base UI",
   "@base-ui/react", "dialog / menu / popover / tooltip / select in a React
   app", "style a Base UI component", "add a dialog", "check the UI
   conventions". The body lists the rules below. Each rule gives the rule,
   one line of why, and the checker id that enforces it (or "review" when no
   script can). Keep the body under about 300 lines and push the detail into
   `references/`.

2. **The rules.** They are numbered, and the checker reports by number.

   1. **Pin exactly.** `"@base-ui/react": "1.9.0"`, never `^` or `~`. The
      estate moves together; a later bump is a new brief like 04.
   2. **Import from subpaths.** `@base-ui/react/dialog`, never the
      `@base-ui/react` root.
   3. **One wrapper per primitive, in `ui/`.** It lives at
      `src/components/ui/<Name>.tsx`, or in a feature's own `ui/` folder for
      a composite only that feature uses. Base UI is imported only from
      files under a `ui/` directory. Feature code imports the wrapper.
   4. **Style with Tailwind on the parts.** Use the `className` of each
      part, with Base UI's state attributes as variants: `data-[checked]:`,
      `data-[highlighted]:`, `data-[disabled]:`, `data-[open]:`,
      `data-starting-style:`, `data-ending-style:`, `data-[side=top]:`.
      The positioner's CSS variables are used through arbitrary values:
      `origin-(--transform-origin)`, `w-(--anchor-width)`,
      `max-h-(--available-height)`. Merge class names with `cn()`
      (clsx + tailwind-merge) from `src/lib/cn.ts`. Never use a CSS class
      selector aimed at a Base UI part, and never query Base UI's internal
      DOM.
   5. **One stylesheet.** `src/styles/index.css` holds:
      - `@import "tailwindcss"`;
      - the `@theme` tokens;
      - `@custom-variant dark` when the app has a dark mode;
      - `@font-face` and font package imports;
      - third-party CSS imports, such as FullCalendar's;
      - a small `@layer base`.

      No other `.css`, no `*.module.css`, no inline `style={}` except for
      computed geometry.
   6. **Semantic tokens only.** Colours, radii, shadows and z-indexes come
      from `@theme` (`bg-surface`, `text-ink`, `z-overlay`). No arbitrary
      colours (`bg-[#…]`, `text-[rgb(…)]`) in class names.
   7. **Motion through the state attributes.** Use transitions keyed on
      `data-starting-style` / `data-ending-style`, wrapped in
      `motion-safe:`, and keyframes as `--animate-*` in `@theme`.
   8. **Floating parts are portalled.** Every popup goes through its
      `Portal`, and z-indexes come from the token scale.
   9. **Triggers that wrap a component use `render`.**
      `<Tooltip.Trigger render={<Button … />} />`, never a `Button` as a
      child. The same goes for Popover, Menu and Dialog triggers.
   10. **Select with values that differ from their labels passes `items`.**
   11. **No native dialogs.** No `window.confirm`, `alert` or `prompt`; use
       the confirm pattern.
   12. **Dialogs.**
       - Controlled `open` and `onOpenChange`, with the Escape guard.
       - `initialFocus` in the order above.
       - `disablePointerDismissal` on a form people type into.
       - A `Title` on every dialog.
       - An `aria-label` on every icon-only control.
   13. **Prefer Base UI over hand-built widgets.** A menu, dialog, popover,
       switch, checkbox, tabs, toast or slider starts from Base UI. Native
       stays for text, date and time inputs, and for a `<select>` where an
       app's decisions keep it native on phones.

3. **`references/`**, one page per pattern, each with a Tailwind wrapper
   ready to copy and a note on what to adapt to the app's tokens:
   - `dialog.md`: the Escape guard, initial focus, sizes, full screen below
     `md`.
   - `confirm.md`: AlertDialog with a pending state, plus a
     `useConfirm()` hook.
   - `menu.md` and `popover.md`.
   - `tooltip.md`: `render`, and a touch fallback.
   - `select.md`: `items`.
   - `switch-checkbox.md`.
   - `tabs-toggle-group.md`.
   - `toast.md`.
   - `field.md`: Field, Input and validation messages.
   - `tailwind.md`: the attribute-to-variant table, positioner variables,
     `cn()`, `@theme` naming, dark mode.
   - `migrating-from-plain-css.md`: the method briefs 05-14 follow (step
     4).

   Write each example fresh against the owner's code. The best sources are
   Almanac's `Dialog.tsx`, wicket's `ConfirmAction.tsx`, ro-housing's
   `components/ui/` and ImbatranimOS's `ui-conventions.md`. Check every API
   name against the 1.9.0 type definitions (`node_modules/@base-ui/react`),
   not memory.

4. **`migrating-from-plain-css.md`**, the one method every migration brief
   points at:
   1. Before touching anything, take Playwright screenshots of every screen
      at 1280 and 390 px wide, in light and dark if the app has both (see
      `ui-test-plans` for the bring-up). Keep them out of git.
   2. Add `tailwindcss` and `@tailwindcss/vite` (pinned), the Vite plugin,
      and `src/styles/index.css`.
   3. Map the app's existing custom properties into `@theme` and keep each
      value exactly. Rename to semantic token names only where the old name
      was a raw colour.
   4. Migrate one CSS file at a time. Move its rules to utilities on the
      JSX, delete the file once it is empty, and build after each file.
      Selectors that can't become utilities stay in `@layer base` or
      `@layer components`, with a comment saying why: element defaults,
      third-party DOM such as FullCalendar's, and print. Keep these few.
   5. Take the same screenshots again and compare them. Differences are
      fixed or listed in the brief's outcome note, with the reason.
   6. Update the app's `DESIGN.md` (if any) to name Tailwind tokens, and
      revisit any corpus decision that rejected Tailwind, with a `log.md`
      entry.
   7. Done when `check-base-ui.mjs` passes, along with the app's typecheck,
      tests and build.

5. **`scripts/check-base-ui.mjs`.** A zero-dependency Node ≥22 ES module:
   `node check-base-ui.mjs [--version 1.9.0] [web-root]`. It reads
   `package.json` and walks `src/`. Each finding is printed as
   `file:line rule-N message`, and the script exits 1 on any error. Checks:
   - rule 1: an exact pin equal to `--version`;
   - rule 2: an import from the root;
   - rule 3: a `@base-ui/react` import outside a `ui/` directory;
   - rule 5: any `.css` other than `src/styles/index.css`, any
     `*.module.css`, and an `index.css` without `@import "tailwindcss"`;
   - rule 6: `-[#` / `-[rgb` / `-[hsl` inside a `className` string;
   - rule 9: a `<X.Trigger>` whose first child is a capitalised JSX element
     and that has no `render` prop (a warning);
   - rule 10: `Select.Root` without `items` (a warning);
   - rule 11: `window.confirm|alert|prompt` or a bare `confirm(`.

   The header carries the skill's version and says the file is copied into
   repos as `scripts/check-base-ui.mjs`. Add fixtures, one passing and one
   failing per rule, and a `node --test` file. Warnings don't fail the run.

6. **Wire it up.** Add a row to the README skills table and a
   `docs/history.md` entry, bump the version to v0.35.0 in both plugin
   files, and update `corpus/wiki/status.md` and `log.md`. Add a
   `decisions.md` entry, "Base UI conventions as a skill, not a shared
   library", recording the verdict above, the rejected alternatives (a
   styled library on Base UI, one from scratch, leaving each app alone) and
   the reason.

## Acceptance

- `skills/base-ui/SKILL.md` exists with valid frontmatter, and the skill
  loads by its description.
- Every API in the references matches `@base-ui/react@1.9.0`'s types. Check
  by installing 1.9.0 in a scratch dir and compiling each example with
  `tsc --noEmit`.
- `node --test skills/base-ui/scripts/` passes. Every rule's failing
  fixture is reported, and every passing fixture is clean.
- Run against a scratch copy of ro-housing's `web/` (Tailwind already), the
  checker reports only real findings. Record the count in the outcome note.
- `bash corpus/lint.sh` passes, and the version reads 0.35.0 in both plugin
  files.
