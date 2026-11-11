---
name: base-ui
description: The estate's conventions for React UI built on Base UI (@base-ui/react, pinned at 1.9.0) and styled with Tailwind 4, as 17 numbered rules, each with its reason and what enforces it (the house-style check-base-ui script, or review). Copy-ready Tailwind wrappers, compiled against the 1.9.0 types, for dialogs (the Escape guard, initial focus), confirms with a pending state, menus, popovers, tooltips, selects with items, comboboxes, switches and checkboxes, tabs, radio and toggle groups, toasts, fields and forms, the phone navigation drawer and toolbars, plus the Light / Dark / System theme switch, the one stylesheet and its token names, and the method for moving a whole app from plain CSS to Tailwind.
when_to_use: Use when the user says "base-ui", "Base UI", "@base-ui/react", "add a dialog", "a dialog / menu / popover / tooltip / select in a React app", "style a Base UI component", "check the UI conventions", "why does check-base-ui flag this", "move this app to Tailwind", "add a dark mode switch", or a repo brief says to follow the base-ui skill. Not for the visual direction of a redesign (the design skills) or for server code.
paths: ["**/*.tsx", "**/web/src/**", "**/ui/src/**", "**/src/components/**"]
---

# Base UI with Tailwind

Every web app in the estate builds its interactive parts on Base UI
(`@base-ui/react`), pinned at 1.9.0, and styles the whole app with
Tailwind 4. There is no shared component library: each app keeps its own
look on purpose (many carry a `DESIGN.md`), and the one shared kit that
exists, imbatranimOS's, shows what lockstep costs. What repeats from app to
app is behaviour and its traps: an Esc that closes the wrong layer, a
button nested in a button, a select showing a raw id, a native `confirm()`.
This skill writes those down once, as numbered rules and as wrappers each
app copies and restyles with its own tokens.

The verdict and the alternatives it beat are in the library's
[corpus/wiki/decisions.md](../../corpus/wiki/decisions.md) ("Base UI
conventions as a skill, not a shared library"). The owner's calls of
2026-11-10 that shaped the rules are on
[grilling-2026-11-10.md](../../corpus/wiki/grilling-2026-11-10.md) and
[grilling-2026-11-10-technical-calls.md](../../corpus/wiki/grilling-2026-11-10-technical-calls.md);
their Q numbers appear below.

## How the rules are checked

The checker ships in the library's `house-style/` folder and reaches each
repo with the rest of house-style, by `npm run house-style:sync`. Nobody
copies it by hand.

```sh
node vendor/house-style/bin/check-base-ui.mjs [--warn-only] [--version 1.9.0] [repo-root]
```

- `check:conventions` runs it, with `--warn-only` from the repo's harness
  brief until its own Base UI brief is done.
- What it counts: errors are rules 1, 2, 3, 5, 6 (arbitrary colours only) and
  11; warnings are 9 and 10. Rules 4 and 7, inline `style` under 5, and
  radius, shadow and z literals under 6 are review only. A repo brief's
  "record the counts for rules 4-7" means counts found in review, not checker
  output.
- Each finding is one line, `file:line rule-N error|warning: message`. Exit
  0 when no error is left, 1 when one is, 2 when it can't check (a bad flag,
  a malformed `conventions.json`). Warnings never fail the run.
- The repo's `conventions.json` (root, `scripts/` or `tools/`) names the web
  roots as source folders (`web/src`, `apps/*/src`, `ui/app`). Inside each
  root, `ui` lists where Base UI may be imported (default `**/components/ui`
  and `**/features/*/ui`), and `stylesheet` names the one stylesheet
  (default `styles/index.css`).
- A finding the repo accepts is an exception there: the check, the rule
  number, the path, an optional `match`, and a `reason`. An exception
  without a reason is an error. An exception may also record a review-only
  rule's case (Ward's dark-only console under rule 14), so a reviewer finds
  it.
- Tests (`*.test.*`, `*.spec.*`, files under `test`, `tests`, `__tests__`,
  `testing` or `e2e`) are exempt from rules 3, 6, 9, 10 and 11.

The house-style package README has the full format.

## The rules

| # | Rule | Why | Enforced by |
|---|---|---|---|
| 1 | Pin exactly: `"@base-ui/react": "1.9.0"`, never `^` or `~` | The estate moves together; a later bump is a brief of its own, like the library's brief 04 | `check-base-ui` rule 1, in every `package.json` from a web root up to the repo root |
| 2 | Import a part's subpath, `@base-ui/react/dialog`, never the package root | One module per part keeps the dev server and tests small, and a grep for a part finds every use | rule 2 |
| 3 | Base UI is imported only under a `ui/` folder: one wrapper per primitive at `components/ui/<Name>.tsx`, or a composite only one feature uses in `features/<name>/ui/` (Q15, Q59). Feature code imports the wrapper | The look and the behaviour rules live in one file per primitive, and a Base UI change touches one folder | rule 3, against the `ui` globs; tests exempt |
| 4 | Style each part with Tailwind on its `className`: state through `data-*` variants (`data-checked:`, `data-[side=top]:`), positioner variables through `origin-(--transform-origin)` and the like, merged with `cn()` from `src/lib/cn.ts`. No CSS selector aimed at a part, no query into Base UI's DOM | The state is on the element; Base UI's inner markup is not an API and changes in minor releases | review |
| 5 | One stylesheet, `src/styles/index.css`: `@import "tailwindcss"`, the `@theme` tokens, `@custom-variant dark`, fonts, third-party CSS in `layer(vendor)`, a small `@layer base`. No other `.css`, no CSS modules, no inline `style` except computed geometry | Cascade layers decide what wins only when every rule sits in one ordered stack | rule 5: other stylesheets, CSS modules, and the one without `@import "tailwindcss"`. Inline `style` is review |
| 6 | Colours, radii, shadows and z-indexes come from `@theme` tokens named for a role (`bg-surface`, `text-ink`, `rounded-control`, `z-popup`; Q17, Q61). No arbitrary colour | A token restyles the app at once, and dark mode is a token's second value | rule 6: an arbitrary colour anywhere in code (`bg-[#…]`, `rgb(`, `hsl(`, `oklch(`, `color-mix(`, in `cn()` and cva too). Radius, shadow and z literals are review |
| 7 | Motion keys on `data-starting-style` and `data-ending-style`, under `motion-safe:`; keyframes are `--animate-*` in `@theme` | Base UI keeps a popup mounted until its transition ends, and reduced motion is honoured in one place | review |
| 8 | Every popup goes through its `Portal`, and its z-index comes from the token scale | A popup inside `overflow` or a transform gets clipped; literal z values put a Select under a Dialog in imbatranimOS | review |
| 9 | A trigger that wraps a component uses `render`: `<Tooltip.Trigger render={<Button … />} />`, for every trigger. A `render` function returns the element itself, not a span around it | A trigger is a `<button>`; a Button inside it nests a button in a button, invalid and click-swallowing | rule 9, a warning. It can't see a part re-exported under a new name, and an icon child is a false positive |
| 10 | A Select whose values differ from their labels passes `items` to `Select.Root` | Without them the trigger shows the raw value | rule 10, a warning on every `Select.Root` without `items`. Blind to a re-exported root |
| 11 | No `window.confirm`, `alert` or `prompt`. Ask with `ConfirmAction`, `useConfirm()` or an inline Yes / No (Q58) | A native dialog blocks every script on the page, can't be styled, and some browsers suppress it | rule 11: bare, `window.`, `globalThis.` and `self.` calls; a name the file binds itself is skipped |
| 12 | Dialogs: controlled `open` and `onOpenChange` with the Escape guard; initial focus on `[data-autofocus]`, else the first field, else the footer's first button; `disablePointerDismissal` on a dialog that holds a form (Q58); a `Title` on every dialog; an `aria-label` on every icon-only control | Each was found by hand in three or more apps | review |
| 13 | Prefer Base UI over a hand-built or third-party widget: a menu, dialog, popover, select, switch, checkbox, tabs, toast or slider starts from Base UI (`sonner` moves behind a wrapper with its call shape). Native stays for text, date and time inputs, and for a `<select>` on phones where an app decided so (Q16) | One accessible behaviour per widget, one look per app | review |
| 14 | Every app has a Light / Dark / System choice; a first visit shows light; the choice is kept on the device; `dark:` keys off `data-theme` on `<html>` through `@custom-variant`, never `prefers-color-scheme` alone (Q18) | The owner's call: a switch everywhere, light first. The attribute lets the choice override the system | review; the apps that bend it record a `conventions.json` exception |
| 15 | A phone navigation panel is a `Drawer`, closed by a swipe, a tap outside, the X or Esc, and it has a `Drawer.Title` (Q40) | A swipe is how a phone closes a side panel; the title names it for a screen reader | review |
| 16 | A filter, or a setting kept on the device, is a `RadioGroup` (`Tabs` with `activateOnFocus` when it switches panels). A picker that saves to the server on each choice is a guarded `ToggleGroup` (Q41, Q57) | Arrow keys may try out a filter; they must never write | review |
| 17 | jsdom tests only for wrappers that hold logic; flows in Playwright. Tests select by role and name, with `data-testid` only where no role fits (Q60, Q62) | A test of a thin wrapper tests Base UI; a role query tests what a user and a screen reader get | review |

`check-base-ui` reports rules 1, 2, 3, 5, 6 and 11 as errors and 9 and 10
as warnings. The rest, and the parts of 5 and 6 the script can't see, are
review's.

## What review covers

A reviewer works through these, skipping what the checker already reports:

- **Rule 4.** Class names on the parts, never a stylesheet selector such as
  `.dialog__title` or `[data-highlighted] .label`; no `querySelector` into
  a Base UI part.
- **Rule 5.** Inline `style` holds only computed geometry or data.
- **Rule 6.** No literal radius, shadow or z value (`rounded-[6px]`,
  `z-[999]`) where a token exists; token names say a role.
- **Rules 7 and 8.** Transitions under `motion-safe:`; every popup portalled
  and on the z scale.
- **Rules 9 and 10 through aliases.** A repo's own `DialogTrigger` or
  `Select` re-export hides its call sites from the checker. Look at each
  caller.
- **Rule 12.** Each dialog: controlled, guarded, focus lands on the field,
  a title, a labelled X, and a form dialog that ignores outside presses.
- **Rules 13 to 17.** A hand-built widget, a missing theme switch, a phone
  menu that isn't a Drawer, an arrow key that saves, a test selected by
  class.

## The references

Each page has a wrapper ready to copy, written fresh against the owner's
code, compiled with `tsc --noEmit` against 1.9.0, and a note on what to
adapt to the app's tokens. The class names use the small-tools family's
token names (`surface`, `raised`, `ink`, `line`, `accent`, `danger`);
substitute the app's own.

- [tailwind.md](references/tailwind.md): the one stylesheet in full, the
  layer order, token naming, the attribute-to-variant table, the positioner
  variables, `cn()` with `extendTailwindMerge`, `Button` and the shared
  looks. Read it first: every other page imports from it.
- [theme.md](references/theme.md): rule 14, the Light / Dark / System
  switch, the boot script and the store.
- [dialog.md](references/dialog.md): rule 12 as a wrapper: the Escape
  guard, initial focus, three sizes, full screen below `md`, a form dialog.
- [confirm.md](references/confirm.md): `ConfirmAction` with a pending state,
  `useConfirm()`, and when an inline Yes / No is right.
- [menu.md](references/menu.md): the menu and its items, opening a dialog
  from an item, `modal`, and an item that moves focus.
- [popover.md](references/popover.md): the popover, and an info button that
  works on touch.
- [tooltip.md](references/tooltip.md): `render`, the provider, and what
  replaces a tooltip on touch.
- [select.md](references/select.md): `items`, the label, and native selects
  on phones.
- [combobox.md](references/combobox.md): a filtered long list that stores
  ids, with `Combobox.createItems`.
- [switch-checkbox.md](references/switch-checkbox.md): both, with labels,
  the indeterminate state, and the value the server takes.
- [tabs-toggle-group.md](references/tabs-toggle-group.md): rule 16:
  `RadioGroup`, `Tabs` and the guarded `ToggleGroup`, and which is which.
- [toast.md](references/toast.md): one manager, `notify()`, the host, and
  leaving `sonner`.
- [field.md](references/field.md): `Field`, a text field, validation, and a
  form that shows the server's errors.
- [drawer.md](references/drawer.md): rule 15, the phone navigation drawer.
- [toolbar.md](references/toolbar.md): a toolbar with toggles, a menu and a
  tooltip, and the order of `render`.
- [migrating-from-plain-css.md](references/migrating-from-plain-css.md):
  the method every app's Tailwind brief follows.

The package ships its own docs, one Markdown file per component with the
full API tables, at `node_modules/@base-ui/react/docs/react/`. Check a prop
or an attribute there, never from memory.

## In a repo

A repo meets this skill through two briefs of its own, in the owner's order
(Q20):

- **Before its Tailwind brief**, a repo not yet on Tailwind writes the
  wrappers with plain classes and state through `[data-*]` selectors in its
  one stylesheet: `cn()` and the tokens don't exist yet. Its Tailwind brief
  then converts them.
- **Its Tailwind brief** follows
  [migrating-from-plain-css.md](references/migrating-from-plain-css.md)
  step by step. A repo already on Tailwind (ro-housing) skips to the token
  and stylesheet checks.
- **Its Base UI brief** moves every Base UI import under `ui/` (rule 3),
  replaces hand-built widgets and native dialogs (rules 11, 13), audits each
  dialog against rule 12, adds the theme switch and the phone drawer (14,
  15), sorts its choice controls (16), and drops `--warn-only` from
  `check:conventions` when `check-base-ui` passes.

The repo's `.claude/rules/web.md` carries a short copy of the rules that
apply to it, scoped to its web roots, so they load even where this skill
doesn't. The house-style skill describes that file.

## Upgrading Base UI

A new Base UI version is its own brief: read the release notes in
`node_modules/@base-ui/react/docs/react/overview/releases/`, bump every
repo together, and raise `check-base-ui`'s default `--version` in a
house-style minor version. 1.4 to 1.9 had two breaking renames:
`OTPFieldPreview` became `OTPField`, and `sanitizeValue()` became
`normalizeValue()`.
