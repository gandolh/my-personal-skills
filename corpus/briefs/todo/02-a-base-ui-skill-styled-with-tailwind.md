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

## Decisions of 2026-11-10

From the owner's grilling (see
[grilling-2026-11-10.md](../../wiki/grilling-2026-11-10.md) and
[grilling-2026-11-10-technical-calls.md](../../wiki/grilling-2026-11-10-technical-calls.md)).
These replace the defaults above wherever they differ, and the skill builds
them as rules.

- **The checker ships from house-style (2026-11-10, brief 27).** The checker is
  `bin/check-base-ui.mjs` in the library's `house-style/` folder, not a script
  under `skills/base-ui/`. Each repo runs its vendored copy,
  `node vendor/house-style/bin/check-base-ui.mjs [--warn-only]`, with its roots
  from `conventions.json`. A new checker is a minor version of house-style,
  and this brief bumps the plugin to the next minor version (brief 27 took
  0.36.0).

**Scope.** Briefs 05-14 are superseded: each app's Tailwind migration is now
a brief in that app's own corpus, and the skill's migration method
(`migrating-from-plain-css.md`) is what they follow. Brief 04 is a tracker of
the per-repo bumps. Work happens on `main`, with no PRs (Q4).

**Owner answers.**

- **Q19, visual parity: close enough.** The migration's acceptance is before
  and after screenshots at 1280 and 390 px showing no visible change to layout
  or colour. A few pixels of drift in spacing or rounding needn't be fixed or
  listed. Step 5 of the method says so.
- **Q18, dark mode: a switch everywhere, light by default.** A new rule: every
  app has a Light / Dark / System choice, a first visit shows light, and the
  choice is kept on the device (atrium keeps its per-profile sync and sepia
  theme). `dark:` keys off a `data-theme` attribute through `@custom-variant`
  (Postern's method), never `prefers-color-scheme`. Exceptions: 3D-sandbox's
  Solstice keeps its dark default and gets the switch; Ward's console stays
  dark only while its sign-in pages get the switch; the client sites and
  Churchix's parish sites have no switch.
- **Q40, phone menus: the swipeable `Drawer`.** A new rule: a phone navigation
  panel uses 1.9.0's `Drawer`, closed by a swipe, a tap outside, the X or Esc.
  It always carries a title (a `Dialog.Title` or the Drawer's equivalent); the
  five Astro phone menus in presentation-sites are Dialogs with only an
  `aria-label` today.
- **Q58.** Inline "Delete? Yes / No" confirms stay inline (Satchel,
  Shelfmark); the rule is no native dialogs, not "always `AlertDialog`". A
  dialog that holds a form sets `disablePointerDismissal`, and closes with
  Cancel, the X or Esc.

**Technical calls.**

- **Q15.** Base UI is imported only under `ui/` folders; atrium's and
  Postern's feature files move behind wrappers. **Q59:** in feature-folder
  repos the wrappers stay in `components/ui/`; comercial-website's
  folder-per-wrapper layout stays.
- **Q16.** Native text, date and time inputs, and a native `<select>` on
  phones, stay native.
- **Q41 and Q57.** A filter that switches what a list shows uses `RadioGroup`
  (or `Tabs` when it switches panels), so arrow keys may choose. A picker that
  **saves** on each choice uses a guarded `ToggleGroup`: arrow keys move focus
  without saving, and one item always stays pressed. "Saves" means a write
  to the server: a picker that only stores a choice on the device (the
  theme, the language) is a `RadioGroup`. Four repo briefs made a
  device-only picker a `ToggleGroup` (public-resource-map, ro-housing,
  sports-app, Shelfmark); the skill's rule wins when they are built.
- **Q42.** FullCalendar's CSS loads with the calendar only.
- **Q44.** The root font size goes back to the browser's default and the app's
  size moves onto `body`, because a pixel size on `html` overrides the
  reader's font setting and skews every `rem` utility. Where an app's size
  isn't 16 px, `--spacing` is set to keep every spacing utility at its pixel
  value (imbatranimOS: `0.203125rem`), and named text sizes become same-pixel
  scale entries.
- **Q60.** jsdom tests only for wrappers that hold logic; flows stay in
  Playwright. **Q62:** a named type scale in `@theme`; no `phone` variant
  (Tailwind's `max-sm:` is used and the one-pixel edge accepted); tests select
  by role, and `data-testid` only where no role fits.
- **Q17 and Q61.** Token names name a role, never a value. The small-tools
  family (wicket, the-board, lantern) uses `surface`, `ink`, `accent`, `line`
  and `danger` (`bg-surface`, `text-ink`, no `bg-bg`). Other apps keep their
  names until their redesign.
- **Q21.** ward-auth's public pages get a second stylesheet once they pass
  about 5 kB gzipped. **Q22:** lantern adopts Base UI.

## Facts found writing the repo briefs (2026-11-10)

- **Unlayered CSS beats utilities, even in a Tailwind repo.** An unlayered
  `.material-symbols-outlined { font-size: 24px }` beats every `text-*`
  utility (31 inline `fontSize` sites in comercial-website), and an unlayered
  `:focus-visible` with a `border-radius` overrides every `rounded-*`. A
  migration imports all old CSS into one `layer(legacy)` and empties it file
  by file (Postern's method, adopted for the estate). Vendor CSS (Leaflet,
  FullCalendar) goes in `layer(vendor)`, declared first.
- **Inline styles are a second layering trap.** An inline `style` beats every
  layer, so a component can't mix old inline styles and new utilities. Move
  each component whole, one per commit.
- **`hover:` applies only under `(hover: hover)`** in Tailwind v4, so controls
  revealed on hover vanish on touch screens. Use `[@media(hover:none)]:` and
  `group-focus-within:`.
- **Material Symbols ligatures are read aloud.** An icon-only button announces
  `keyboard_arrow_up`: the glyph gets `aria-hidden` and the button an
  `aria-label`.
- **Rule 3 can pass for nothing.** When the whole UI tree is a `ui/` folder
  (sports-app's `client/src/ui/`), "Base UI only under `ui/`" checks nothing.
  The checker tests for `components/ui/`.
- **The `render` wrapper and rule 9.** A `render` function that wraps the
  caller's button in a `span` (comercial-website's `Dropdown.tsx` and
  `Tooltip.tsx`) breaks rule 9. The checker catches it.
- **Third-party widgets.** A library such as `sonner` for toasts counts as a
  widget Base UI replaces, behind a wrapper with the same call shape.
- **A z-index scale.** imbatranimOS has 15 literal `z-[N]` from 900 to 10001,
  with a Select popup under a Dialog. Rule 8's token scale fixes a real bug.
- **Checker roots.** The checker reads the repo's roots from
  `conventions.json` (atrium's `apps/*`, public-resource-map's `ui/app/`),
  not fixed `web/` paths.
- **`better-tailwindcss`.** Only its unknown-class, deprecated-class and
  class-order rules are worth turning on (412 logical-property and 194
  line-wrapping findings were noise).
- **tailwind-merge** drops custom theme size and colour names it doesn't know,
  so `cn()` uses `extendTailwindMerge`.
- **A schema stricter than the handler** breaks the client (the todo `PATCH`),
  which matters when a wrapper replaces a native control that sent `0 | 1`.

## Files you OWN

- `skills/base-ui/SKILL.md` (new)
- `skills/base-ui/references/*.md` (new)
- `house-style/bin/check-base-ui.mjs` (new) in the library's `house-style/`
  folder, with its fixtures and tests under `house-style/` and a
  `house-style/CHANGELOG.md` entry (changed 2026-11-10, brief 27: it was
  `skills/base-ui/scripts/`)
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

5. **`house-style/bin/check-base-ui.mjs`** (moved from `scripts/` on
   2026-11-10, brief 27). A zero-dependency Node ≥22 ES module, run in a repo
   as `node vendor/house-style/bin/check-base-ui.mjs [--warn-only] [--version 1.9.0]`.
   It reads the web roots from the repo's `conventions.json`, then each
   root's `package.json`, and walks its `src/`. Each finding is printed as
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

   It ships with house-style and reaches repos through `house-style:sync`,
   never by hand. Add fixtures, one passing and one failing per rule, and a
   `node --test` file under `house-style/`. Warnings don't fail the run, and
   `--warn-only` turns errors into warnings.

   **Built 2026-11-11, inside brief 27's run (agent `house-style-h2`): don't
   redo this step.** `house-style/bin/check-base-ui.mjs` with its fixtures and
   tests, `conventions.json` and its schema are in house-style 1.0.0 (the
   package README has the format). The ro-housing acceptance line below was
   run then: 0 findings. This brief's skill names the checker's rule ids.

6. **Wire it up.** Add a row to the README skills table and a
   `docs/history.md` entry, bump the version to the next minor version
   (2026-11-10: 0.35.0 and 0.36.0 are taken) in both plugin files, and update `corpus/wiki/status.md` and `log.md`. Add a
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
- House-style's `npm test` passes, with `check-base-ui`'s tests in it. Every
  rule's failing fixture is reported, and every passing fixture is clean.
- Run against a scratch copy of ro-housing's `web/` (Tailwind already), the
  checker reports only real findings. Record the count in the outcome note.
- `bash corpus/lint.sh` passes, and both plugin files read the next minor
  version.
