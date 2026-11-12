# Tailwind with Base UI

The stylesheet, the token names, the state attributes as variants, `cn()`,
and one wrapper written start to finish. Every other reference imports the
files on this page: `src/lib/cn.ts`, `src/components/ui/Button.tsx`,
`src/components/ui/icons.tsx` and `src/styles/index.css`.

Checked against `@base-ui/react` 1.9.0, `tailwindcss` 4.3.5 and
`tailwind-merge` 3.6.0 on 2026-11-11: every TypeScript block here compiles
with `tsc --noEmit` under the house flags, and the stylesheet builds with the
Tailwind CLI.

Imports in these examples carry no suffix, as Vite's `bundler` resolution
allows. A repo that writes `.ts` and `.tsx` suffixes (ro-housing) adds them.

## The one stylesheet

Rule 5. It sits at `src/styles/index.css` in each web root, or where
`conventions.json`'s `stylesheet` says (`styles.css` in ro-housing).

```css
/* src/styles/index.css */
/* The app's one stylesheet (base-ui rule 5). The layer order comes first:
   the first @layer statement fixes the order for the whole page. */
@layer theme, base, vendor, legacy, components, utilities;
/* `legacy` is there only while old stylesheets remain; drop it from the order
   when the last one goes (the todo app, Wicket). */

@import "tailwindcss";
/* Third-party CSS goes in the vendor layer, above Tailwind's reset and below
   the app's own rules:
   @import "leaflet/dist/leaflet.css" layer(vendor); */

/* Tailwind scans every file it can see for class names; the vendored
   house-style copy isn't the app's. The path is from this file to the repo root. */
@source not "../../../vendor";

/* dark: follows the theme switch (rule 14), never the system alone. */
@custom-variant dark {
  &:where([data-theme="dark"], [data-theme="dark"] *) {
    @slot;
  }
  @media (prefers-color-scheme: dark) {
    &:where([data-theme="system"], [data-theme="system"] *) {
      @slot;
    }
  }
}

@theme {
  /* Colours name a role, never a value (rule 6). light-dark() holds both
     themes; color-scheme on <html> picks one. */
  --color-surface: light-dark(#f7f7f5, #15171a);
  --color-raised: light-dark(#ffffff, #1e2125);
  --color-hover: light-dark(#ececea, #2a2e33);
  --color-ink: light-dark(#18191b, #e9eaec);
  --color-ink-muted: light-dark(#5a5f66, #a7adb5);
  --color-line: light-dark(#d6d8db, #363b42);
  --color-accent: light-dark(#1f5fbf, #86b3ff);
  --color-accent-hover: light-dark(#184c99, #a3c5ff);
  --color-on-accent: light-dark(#ffffff, #0c1a33);
  --color-danger: light-dark(#b3261e, #ff8f85);
  --color-danger-hover: light-dark(#8f1e18, #ffaba3);
  --color-on-danger: light-dark(#ffffff, #3a0b07);
  --color-scrim: rgb(0 0 0 / 0.45);

  /* A named type scale (Q62), each size with its line height. */
  --text-meta: 0.75rem;
  --text-meta--line-height: 1rem;
  --text-body: 0.875rem;
  --text-body--line-height: 1.25rem;
  --text-title: 1rem;
  --text-title--line-height: 1.5rem;

  --radius-control: 0.375rem;
  --radius-popup: 0.5rem;
  --radius-dialog: 0.75rem;

  --shadow-popup: 0 4px 16px rgb(0 0 0 / 0.14);
  --shadow-dialog: 0 16px 48px rgb(0 0 0 / 0.24);

  /* The z scale (rule 8). A popup opens from inside a dialog, so it sits
     above one; a toast and a tooltip sit above both. */
  --z-index-sticky: 10;
  --z-index-overlay: 40;
  --z-index-dialog: 50;
  --z-index-popup: 60;
  --z-index-toast: 70;
  --z-index-tooltip: 80;

  /* Keyframes the app uses by name (rule 7). */
  --animate-fade-in: fade-in 150ms ease-out;
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
}

@layer base {
  /* Light on a first visit; the switch sets data-theme (rule 14). */
  :root {
    color-scheme: light;
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
  }
  :root[data-theme="system"] {
    color-scheme: light dark;
  }

  /* The app's base size lives on body; html keeps the reader's own (Q44). */
  body {
    background-color: var(--color-surface);
    color: var(--color-ink);
    font-size: var(--text-body);
    line-height: var(--text-body--line-height);
  }
}
```

What each part is for:

- **The layer order.** Tailwind puts its reset in `base` and its utilities
  in `utilities`; any CSS outside a layer beats both. So old stylesheets go
  in `legacy` while the migration runs ([migrating-from-plain-css.md](migrating-from-plain-css.md)),
  and third-party CSS goes in `vendor`. `vendor` sits *after* `base` on
  purpose. Measured in Chrome with 4.3.5 on 2026-11-11: with `vendor`
  declared first, Tailwind's reset beat a vendor rule's border, padding and
  margin and turned its `img` to `display: block`; after `base`, the vendor
  rule held. In both orders an override in `@layer components` won over the
  vendor rule, which is what the layer is for. Only `!important` vendor
  rules (Leaflet's tile `max-width`) survive either way.
- **A third-party stylesheet only one lazy route needs** (FullCalendar in
  Almanac, Q42) is the one second stylesheet: a small `.css` beside that
  route that holds only `@import "…" layer(vendor);`. The `@layer`
  statement above already placed `vendor`, so it lands in the right spot
  whenever it loads. `check-base-ui` reports it as rule 5; record it in
  `conventions.json` with the reason.
- **`@custom-variant dark`** keys `dark:` off `data-theme` on `<html>`.
  Most of the difference lives in the `light-dark()` tokens, so few classes
  need `dark:` at all. [theme.md](theme.md) has the switch.
- **`@layer base`** stays small: `color-scheme`, `body`, element defaults
  that no utility can reach.

## Token names

- **A name says the role.** `bg-surface`, `text-ink`, `border-line`,
  `bg-danger` (Q17, Q61). Never `bg-bg`, `text-gray-700` or `bg-[#…]`. The
  small-tools family (wicket, the-board, lantern) uses `surface`, `ink`,
  `accent`, `line` and `danger`; the other apps keep their names until
  their redesign.
- **Namespaces decide the utility.** `--color-*` makes `bg-*`, `text-*`,
  `border-*`; `--text-*` makes font sizes; `--radius-*` makes `rounded-*`;
  `--shadow-*` makes `shadow-*`; `--z-index-*` makes `z-*`; `--animate-*`
  makes `animate-*`. Checked in 4.3.5: `--z-index-dialog: 50` gives
  `z-dialog`, `--height-top` gives `h-top` and `min-h-top`, `--container-page`
  gives `max-w-page` and `--spacing-gutter` gives `p-gutter`. Two that
  don't: `--size-touch` makes `size-touch` only (no `h-touch`; write
  `h-(--size-touch)` or name it `--height-touch`), and `--z-nav` makes no
  utility at all. A closed scale (`--spacing: initial`) also drops `p-0` and
  `inset-0`: add `--spacing-0: 0px` ([conversion-traps.md](conversion-traps.md)).
- **The root font size.** `html` keeps the browser's size, because a pixel
  size there overrides the reader's font setting and shifts every `rem`
  utility. The app's size goes on `body`. An app whose old root size wasn't
  16 px sets `--spacing` so every spacing utility keeps its pixel value
  (13 px: `--spacing: 0.203125rem`, which is 0.25rem times 13/16), and its
  named text sizes become same-pixel `--text-*` entries (Q44).
- **`max-sm:` is the phone breakpoint** where the app's old edge is within a
  pixel or two of Tailwind's 640 px; that one-pixel edge is accepted (Q62).
  An edge that isn't (the-board's 600 and 1100 px, Satchel's 900 px,
  ward-auth's 60rem console) is a declared variant or `--breakpoint-*`, with
  a test that keeps it equal to any copy of the number in script.

## State attributes as variants

Base UI puts each part's state on the element as a `data-*` attribute.
Tailwind 4 reaches a bare attribute as a variant (`data-checked:`), a valued
one with brackets (`data-[side=top]:`), a parent's with `group-data-*:`, and
the absence with `not-data-*:`. `data-[checked]:` compiles to the same rule
as `data-checked:`; the house writes the short form.

| Attribute | On | Variant |
|---|---|---|
| `data-open`, `data-closed` | backdrops, positioners, popups | `data-open:`, `data-closed:` |
| `data-starting-style`, `data-ending-style` | anything that animates in or out | `data-starting-style:opacity-0` |
| `data-popup-open` | triggers while their popup is open | `data-popup-open:bg-hover` |
| `data-pressed` | toggles; triggers while pressed | `data-pressed:bg-accent` |
| `data-checked`, `data-unchecked` | checkbox, switch, radio, menu checkbox and radio items | `data-checked:bg-accent` |
| `data-highlighted` | menu, select and combobox items under the pointer or keyboard | `data-highlighted:bg-hover` |
| `data-selected` | the chosen select item | `data-selected:font-medium` |
| `data-active` | the selected tab | `data-active:text-ink` |
| `data-disabled` | any disabled part | `data-disabled:opacity-50` |
| `data-placeholder` | `Select.Value` and its trigger with no value | `data-placeholder:text-ink-muted` |
| `data-side`, `data-align` | positioners, popups, arrows | `data-[side=top]:mb-1` |
| `data-nested`, `data-nested-dialog-open` | dialog popups | `data-nested-dialog-open:after:opacity-100` |
| `data-instant` | tooltip popups that skip the delay | `data-instant:transition-none` |
| `data-invalid`, `data-valid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused` | field parts and controls | `data-invalid:border-danger` |
| `data-swiping` | a drawer or toast mid-swipe | `data-swiping:duration-0` |
| `data-expanded`, `data-behind`, `data-limited` | toast roots and contents | `data-behind:opacity-0` |

Each part's full list is in its API reference, in the package's own docs:
`node_modules/@base-ui/react/docs/react/components/<name>.md`.

## Positioner variables

A positioner (menu, popover, select, combobox, tooltip) sets CSS variables
for its popup. Use them through Tailwind's variable shorthand:

| Variable | Use | Note |
|---|---|---|
| `--transform-origin` | `origin-(--transform-origin)` | the popup grows from its anchor |
| `--anchor-width` | `min-w-(--anchor-width)` | a select or combobox as wide as its trigger |
| `--anchor-height` | `h-(--anchor-height)` | |
| `--available-width` | `max-w-(--available-width)` | room left in the viewport |
| `--available-height` | `max-h-(--available-height)` | a long menu scrolls instead of overflowing |
| `--positioner-width` | `w-(--positioner-width)` | menus, popovers and tooltips set it; a select's or a combobox's positioner doesn't |

Other parts have their own: `--nested-dialogs` on a dialog popup,
`--drawer-swipe-movement-x` and `--drawer-swipe-progress` on a drawer,
`--toast-index` and `--toast-offset-y` on a toast, `--active-tab-left` and
`--active-tab-width` on a tab indicator.

## `cn()`

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, told the app's own @theme names. Without the `text` list it
 * reads `text-body` as a colour, so `cn("text-body", "text-ink")` drops the
 * size. Without the others it can't tell that two radii or two z values clash.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["meta", "body", "title"],
      radius: ["control", "popup", "dialog"],
      shadow: ["popup", "dialog"],
    },
    classGroups: {
      z: [{ z: ["sticky", "overlay", "dialog", "popup", "toast", "tooltip"] }],
    },
  },
});

/** Joins class names, and lets a later class win over an earlier one it conflicts with. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Measured with tailwind-merge 3.6.0: plain `twMerge("text-body text-ink")`
returns `text-ink`; the extended one keeps both. Keep the lists in step with
`@theme` when a token is added; a `container` name (`max-w-page`) and a
custom `@utility` group go in too.

A size also removes an earlier `leading-*` by default, because a Tailwind size
carries a line height. Where the app's sizes carry none (the todo app, the
board), add `override: { conflictingClassGroups: { "font-size": [] } }` so
`cn("leading-none", "text-tick")` keeps both; re-measured 2026-11-12: the
default drops `leading-none`, the override keeps it. An app that keeps old CSS
which relied on the default keeps the default and says so (imbatranimOS).

## A wrapper, start to finish

One file per primitive, under `components/ui/` (rule 3). It takes the
part's own props, adds the house look with `cn()`, and passes everything
else through, so a `render` prop elsewhere can hand it a ref and handlers
(React 19: `ref` is an ordinary prop, no `forwardRef`).

```tsx
// src/components/ui/Button.tsx
import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  default: "border border-line bg-raised text-ink hover:not-data-disabled:bg-hover",
  primary: "bg-accent text-on-accent hover:not-data-disabled:bg-accent-hover",
  danger: "bg-danger text-on-danger hover:not-data-disabled:bg-danger-hover",
  ghost: "text-ink hover:not-data-disabled:bg-hover",
} as const;

export interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, "className"> {
  variant?: keyof typeof VARIANTS;
  className?: string;
}

/**
 * The house button, on Base UI's Button. A button that is disabled while its
 * action runs, and must keep keyboard focus meanwhile, also sets
 * `focusableWhenDisabled` (off by default for a standalone Button).
 */
export function Button({ variant = "default", className, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-control px-3 text-body font-medium select-none",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "data-disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
    />
  );
}
```

The other references use three small icons. An app swaps them for its own
set; an icon font's glyph gets `aria-hidden`, because Material Symbols
ligatures are read aloud (`keyboard_arrow_up`).

```tsx
// src/components/ui/icons.tsx
import type { ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3.5 3.5 9 9m-9 0 9-9" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m3 8.5 3.5 3.5 6.5-8" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 6 4 4 4-4" />
    </Icon>
  );
}
```

## Adapting a wrapper to an app

Every reference ends with what to change for its own component; these hold
for all of them.

- **Swap the token names, keep the roles.** The examples use `surface`
  (the page), `raised` (popups, dialogs, inputs), `hover`, `ink`,
  `ink-muted`, `line`, `accent` with `on-accent`, `danger` with
  `on-danger`, and `scrim`. Map each to the app's own name for that role:
  Postern's `bg-surface-raised`, imbatranimOS's `bg-surface-container`.
- **Sizes follow the app's density.** `h-9`, `px-3`, `text-body` are a
  middle density; a compact app (imbatranimOS's toolbars) drops a step,
  and its radii come from its own `--radius-*`.
- **Leave the behaviour alone.** `render` on triggers, the guards, the
  focus functions, `items`, the portals and the z tokens are the rules;
  only class strings and icons are the app's.

## Shared looks

Menus, selects, comboboxes and popovers float the same way, and their rows
highlight the same way. The class strings live once:

```ts
// src/components/ui/looks.ts
/** Every floating panel: a menu, a select's list, a combobox's list, a popover. */
export const panel = [
  "origin-(--transform-origin) rounded-popup border border-line bg-raised text-ink shadow-popup outline-none",
  "motion-safe:transition-[opacity,scale] motion-safe:duration-100",
  "data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0",
].join(" ");

/** A row in a menu, select or combobox list. */
export const row = [
  "flex cursor-default items-center gap-2 rounded-control px-2.5 py-1.5 text-body outline-none select-none",
  "data-highlighted:bg-hover data-disabled:opacity-50",
].join(" ");
```

Tailwind finds these classes because it scans `.ts` files too; it reads
each quoted string whole, so the strings never build a class from pieces.

## Traps

- **`hover:` needs a mouse.** Tailwind 4 emits `hover:` inside
  `@media (hover: hover)`, so a control revealed only on hover never shows
  on a touch screen. Reveal it with `group-focus-within:` and
  `[@media(hover:none)]:opacity-100` as well.
- **Unlayered CSS beats every utility.** An unlayered
  `.material-symbols-outlined { font-size: 24px }` beats every `text-*`
  (comercial-website carries 31 inline `fontSize` because of it), and an
  unlayered `:focus-visible` with a `border-radius` beats every `rounded-*`.
  Keep everything in a layer.
- **An inline `style` beats every layer**, so one component can't mix old
  inline styles and new utilities. Rule 5 allows `style` only for computed
  geometry: a position, a measured size, a percentage from data.
- **A portalled popup leaves its wrapper.** Every popup renders under
  `<body>`, outside any element of the app. A token scoped to a wrapper
  (`[data-surface="console"]`) doesn't reach it, so theme attributes go on
  `<html>`, or the popup carries the attribute itself. Ward's console hit
  this.
- **A script that selects by class breaks when the class goes.** The hook is a
  `data-` attribute ([conversion-traps.md](conversion-traps.md)).
- **State order is not CSS order, `grid-cols-N` is `minmax(0, 1fr)`,
  `translate-*` is not `transform`:** the lookup of what differs from the CSS
  being converted is [conversion-traps.md](conversion-traps.md).
- **Class order and unknown classes** are house-style's rule 18
  (`better-tailwindcss`), not this skill's.
