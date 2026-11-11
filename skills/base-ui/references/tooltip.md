# Tooltip

A short visual label for a control, on hover and keyboard focus. Two rules
meet here: the trigger renders the button through `render` (rule 9), and a
tooltip is never the only place a piece of information lives, because it
doesn't open on touch.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Tooltip.tsx
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";

export interface TooltipProps {
  /** The text, the same words as the control's aria-label. */
  label: ReactNode;
  /** The control, passed to the trigger's `render`: it must spread props and take a ref, as Button does. */
  children: ReactElement;
  side?: ComponentProps<typeof BaseTooltip.Positioner>["side"];
}

/** A label shown on hover and focus. Wrap the app once in <TooltipProvider> so neighbours open without a second delay. */
export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6} className="z-tooltip">
          <BaseTooltip.Popup className="origin-(--transform-origin) rounded-control bg-ink px-2 py-1 text-meta text-surface motion-safe:transition-[opacity,scale] motion-safe:duration-100 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:opacity-0 data-instant:transition-none">
            {label}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider delay={500}>{children}</BaseTooltip.Provider>;
}
```

An icon-only button with its tooltip. The `aria-label` names it for a
screen reader; the tooltip shows the same words to a mouse or keyboard user.

```tsx
// src/features/books/RemoveFromShelf.tsx
import { Button } from "../../components/ui/Button";
import { CloseIcon } from "../../components/ui/icons";
import { Tooltip } from "../../components/ui/Tooltip";

export function RemoveFromShelf({ onRemove }: { onRemove: () => void }) {
  return (
    <Tooltip label="Remove from the shelf">
      <Button variant="ghost" aria-label="Remove from the shelf" className="size-8 px-0" onClick={onRemove}>
        <CloseIcon />
      </Button>
    </Tooltip>
  );
}
```

## Why `render`

`Tooltip.Trigger` renders a `<button>` of its own. With a `Button` as its
child, the page gets `<button>` inside `<button>`: invalid HTML, a console
error, and an inner button that can swallow the click (imbatranimOS's rule
42 records five per file-list row). `render={<Button … />}`, or
`render={children}` as here, makes the Button *be* the trigger. The same
holds for every trigger: Dialog, AlertDialog, Popover, Menu, Select.

`check-base-ui` warns on rule 9 when a `<X.Trigger>`'s first child is a
component with no `render`, and when a `render` function wraps its content
in a `span` or `div` (comercial-website's `Dropdown` and `Tooltip` did):
that span becomes the trigger, and the caller's button nests inside it. An
icon child (`<Tooltip.Trigger><InfoIcon /></Tooltip.Trigger>`) is a false
positive the warning accepts. A wrapper that re-exports the part under its
own name (`export const TooltipTrigger = Tooltip.Trigger`) hides its call
sites from the check; review covers those.

## On touch

Base UI turns tooltips off on touch devices: there is no hover to open one,
and a long press belongs to the browser. So:

- **An icon-only control** carries an `aria-label` with the tooltip's words.
  On a phone, where the icon alone may not be clear, show a text label next
  to it under `max-sm:`, or use a labelled menu item instead.
- **Information someone needs** goes in the page, or in a Popover with
  `openOnHover` on its trigger ([popover.md](popover.md)), which opens on a
  tap.
- **A disabled control** can't show a tooltip saying why it's disabled to a
  touch user; say why in text beside it.
