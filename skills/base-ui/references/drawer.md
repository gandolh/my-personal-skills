# Drawer: the phone menu

Rule 15: a phone's navigation panel is Base UI's `Drawer`, closed by a
swipe, a tap outside, the X or Esc, and it always has a title (Q40,
2026-11-10). `Drawer` extends `Dialog` with gestures and snap points; a
panel that slides in without a swipe is just a positioned Dialog, which is
what the five Astro phone menus in presentation-sites are today, with an
`aria-label` and no title.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/NavDrawer.tsx
import { Drawer } from "@base-ui/react/drawer";
import type { ReactElement, ReactNode } from "react";
import { CloseIcon } from "./icons";

export interface NavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The heading inside the panel, such as "Menu"; it names the panel and its nav. */
  title: string;
  /** The menu button in the top bar, passed through `render`. */
  trigger: ReactElement;
  children: ReactNode;
}

/**
 * The phone's navigation panel, from the left edge. A swipe back to the
 * left, a tap outside, the X or Esc closes it; Android's back gesture too.
 * Controlled, so a link can close it as it navigates.
 */
export function NavDrawer({ open, onOpenChange, title, trigger, children }: NavDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <Drawer.Trigger render={trigger} />
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-overlay bg-scrim opacity-[calc(1-var(--drawer-swipe-progress))] motion-safe:transition-opacity motion-safe:duration-300 data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Drawer.Viewport className="fixed inset-0 z-dialog">
          <Drawer.Popup className="flex h-full w-[min(20rem,85vw)] flex-col bg-raised text-ink shadow-dialog outline-none [transform:translateX(var(--drawer-swipe-movement-x))] motion-safe:transition-transform motion-safe:duration-300 data-swiping:select-none data-starting-style:[transform:translateX(-100%)] data-ending-style:[transform:translateX(-100%)]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Drawer.Title className="text-title font-semibold">{title}</Drawer.Title>
              <Drawer.Close
                aria-label="Close the menu"
                className="flex size-9 items-center justify-center rounded-control text-ink-muted hover:bg-hover"
              >
                <CloseIcon />
              </Drawer.Close>
            </div>
            <Drawer.Content render={<nav aria-label={title} />} className="min-h-0 flex-1 overflow-y-auto p-2">
              {children}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

In the app's shell, shown only on a phone:

```tsx
// src/features/shell/PhoneNav.tsx
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { NavDrawer } from "../../components/ui/NavDrawer";

const LINKS = [
  { href: "/library", label: "Library" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/settings", label: "Settings" },
];

export function PhoneNav({ navigate }: { navigate: (href: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <NavDrawer
        open={open}
        onOpenChange={setOpen}
        title="Menu"
        trigger={
          <Button variant="ghost" aria-label="Open the menu">
            <span aria-hidden>☰</span>
          </Button>
        }
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  navigate(link.href);
                }}
                className="flex h-11 items-center rounded-control px-3 text-body hover:bg-hover"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </NavDrawer>
    </div>
  );
}
```

## Adapt to the app

- The panel's width (`min(20rem, 85vw)`) and side follow the app's top bar:
  a menu button on the right opens a drawer from the right
  (`swipeDirection="right"`, `translateX(100%)`).
- The link rows are the app's own navigation items; keep them at least
  44 px tall for a thumb.

## Notes

- **The swipe follows the finger.** `--drawer-swipe-movement-x` moves the
  panel while a swipe runs and `--drawer-swipe-progress` fades the backdrop;
  `data-swiping` turns the transition off meanwhile, so the panel doesn't
  lag. `swipeDirection` must match the side: `left` for a panel on the left,
  `down` (the default) for a bottom sheet.
- **Close reasons.** A Drawer's `onOpenChange` reasons add `swipe` and
  `close-watcher` to the Dialog's. `close-watcher` is Android's back gesture
  (Chromium on Android only); Esc on a keyboard stays `escape-key`. A drawer
  that holds a form treats `close-watcher` like Esc: the same guard, the same
  unsaved-changes question.
- **Inside the panel,** `data-base-ui-swipe-ignore` on an element (a
  horizontal carousel) keeps a drag there from closing the drawer. Its
  value `x` (or `y`) says the element only handles drags along that axis,
  so a drag along the other one still swipes the drawer.
- **A title, always.** `Drawer.Title` names the panel; the `nav` takes the
  same words as its `aria-label`.
- **Wide screens** keep their own navigation. `sm:hidden` here, or the
  app's own breakpoint; the drawer is the phone's menu, not a second one.
- **A mouse drag doesn't swipe a left drawer; touch does** (Postern). Its
  e2e dispatches touch events through the browser's protocol
  (`Input.dispatchTouchEvent`), not a mouse drag.
- **Initial focus lands on the popup, not the first link,** when
  `Drawer.Close` comes before the first control: the default is the popup
  itself (jsdom, mouse open, 1.9.0). Pass `initialFocus` (a ref or a function)
  to reach the first link or button. Find it by a `data-` attribute, never by
  a class the Tailwind move may delete (Postern's `NavDrawer` read
  `.nav-drawer-content`; the grep for `querySelector` found it).
- **A modal drawer makes the page behind it inert,** the menu button
  included, so "the menu button toggles it" becomes a press outside that
  closes the drawer (Postern). A drawer that carries state (a folded label
  tree, a scroll position) keeps it in a parent that outlives the popup.
- **A scroller inside the popup** that restores `scrollTop` at mount is
  clamped, because the popup has no height yet: restore it from a
  `ResizeObserver` for about 500 ms (Postern's `Drawer.Content`).
- **A content sheet over a map is a non-modal drawer with snap points**
  (public-resource-map's place sheet). `modal={false}` keeps the map
  pannable and its pins tappable at the peek; `snapToSequentialPoints` stops
  a fast swipe from the full height closing it outright. Snap points were
  0.46 and 0.82 there. It passed a Chromium spike with mouse and touch and
  has an e2e spec; the full-height snap is the old 82 percent.
- **A bottom sheet** (actions for a row on a phone) is the same component
  with `swipeDirection="down"`; the package docs' first demo is the shape.
