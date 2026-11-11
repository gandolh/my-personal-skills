# Popover

A small panel anchored to a button: a filter form, a share box, a word of
explanation. Unlike a tooltip it opens on a tap, so touch and screen reader
users reach it, and it may hold controls.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Popover.tsx
import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { panel } from "./looks";

export interface PopoverProps {
  /** The element that opens it, passed through `render`. */
  trigger: ReactElement;
  /** The panel's heading; it also names the panel for a screen reader. */
  title?: ReactNode;
  children: ReactNode;
  side?: ComponentProps<typeof BasePopover.Positioner>["side"];
  align?: ComponentProps<typeof BasePopover.Positioner>["align"];
  /** Also open on hover, after a delay: for an info button, the touch-safe tooltip. */
  openOnHover?: boolean;
  className?: string;
}

export function Popover({
  trigger,
  title,
  children,
  side = "bottom",
  align = "center",
  openOnHover,
  className,
}: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger render={trigger} openOnHover={openOnHover} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={6} collisionPadding={8} className="z-popup">
          <BasePopover.Popup
            className={cn(panel, "max-h-(--available-height) w-72 max-w-(--available-width) overflow-y-auto p-3", className)}
          >
            {title && <BasePopover.Title className="mb-1 text-body font-semibold">{title}</BasePopover.Title>}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/** A button inside the panel that closes it, such as Done. */
export function PopoverClose({ className, ...props }: Omit<ComponentProps<typeof BasePopover.Close>, "className"> & { className?: string }) {
  return <BasePopover.Close {...props} className={cn("text-body font-medium text-accent", className)} />;
}
```

An info button: a tap opens it on a phone, a hover on a desktop, and the
text is in the page for a screen reader once open.

```tsx
// src/features/billing/VatInfo.tsx
import { Button } from "../../components/ui/Button";
import { Popover } from "../../components/ui/Popover";

export function VatInfo() {
  return (
    <Popover
      openOnHover
      title="Why VAT shows twice"
      trigger={
        <Button variant="ghost" aria-label="Why VAT shows twice" className="size-7 px-0">
          <span aria-hidden>?</span>
        </Button>
      }
    >
      <p className="text-body text-ink-muted">The first line is this month's; the second settles last month's change.</p>
    </Popover>
  );
}
```

## Notes

- **Not modal by default.** `modal` is `false` in 1.9.0: focus can leave
  and the page keeps scrolling. A popover holding a form that must keep
  focus sets `modal` on the root, and then the focus trap works only when a
  `Popover.Close` sits inside the popup, as Shelfmark found; give it a
  visible Done. `modal="trap-focus"` traps focus without locking the page,
  and wants the same Close so a touch screen reader can get out.
- **A popover with a title** gets `aria-labelledby` from `Popover.Title`;
  without one, give the popup an `aria-label`.
- **`PreviewCard` is mouse-only.** It isn't reachable by keyboard or a
  screen reader, which is why Postern's sender card stayed hand-built. A
  hover card with actions is a Popover with `openOnHover`.
- **Placement fallback.** With no room on either side, Base UI moves a side
  popover to the other axis rather than centring it. Test a side popover
  near the viewport's edge.
