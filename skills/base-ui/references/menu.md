# Menu

A menu of actions behind a button: the wrapper, its items, a menu item that
opens a dialog, and the traps the estate's apps hit.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Menu.tsx
import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CheckIcon } from "./icons";
import { panel, row } from "./looks";

type WithClass<P> = Omit<P, "className"> & { className?: string };

export interface MenuProps {
  /** The element that opens it, such as <Button variant="ghost" aria-label="More actions">. */
  trigger: ReactElement;
  children: ReactNode;
  align?: ComponentProps<typeof BaseMenu.Positioner>["align"];
  /** false leaves the page scrollable and clickable while the menu is open. Base UI's default is true. */
  modal?: boolean;
  /** Where focus goes on close; see "An item that moves focus" below. */
  finalFocus?: ComponentProps<typeof BaseMenu.Popup>["finalFocus"];
}

/** A menu of actions. The trigger is passed through `render`, so a Button never nests in a button. */
export function Menu({ trigger, children, align = "start", modal, finalFocus }: MenuProps) {
  return (
    <BaseMenu.Root modal={modal}>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner align={align} sideOffset={4} collisionPadding={8} className="z-popup outline-none">
          <BaseMenu.Popup
            finalFocus={finalFocus}
            className={cn(panel, "max-h-(--available-height) min-w-44 overflow-y-auto p-1")}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function MenuItem({
  danger,
  className,
  ...props
}: WithClass<ComponentProps<typeof BaseMenu.Item>> & { danger?: boolean }) {
  return <BaseMenu.Item {...props} className={cn(row, danger && "text-danger", className)} />;
}

/** An item that stays open and toggles, with a tick when on. */
export function MenuCheckboxItem({
  children,
  className,
  ...props
}: WithClass<ComponentProps<typeof BaseMenu.CheckboxItem>>) {
  return (
    <BaseMenu.CheckboxItem {...props} className={cn(row, "grid grid-cols-[1rem_1fr]", className)}>
      <BaseMenu.CheckboxItemIndicator className="col-start-1">
        <CheckIcon />
      </BaseMenu.CheckboxItemIndicator>
      <span className="col-start-2">{children}</span>
    </BaseMenu.CheckboxItem>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className="mx-1 my-1 h-px bg-line" />;
}

export function MenuGroupLabel({ className, ...props }: WithClass<ComponentProps<typeof BaseMenu.GroupLabel>>) {
  return (
    <BaseMenu.GroupLabel {...props} className={cn("px-2.5 pt-2 pb-1 text-meta text-ink-muted", className)} />
  );
}

export const MenuGroup = BaseMenu.Group;
```

## In feature code

An item that opens a dialog sets the dialog's own state; the dialog is a
sibling of the menu, never inside it. A destructive item asks first.

```tsx
// src/features/books/BookMenu.tsx
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { useConfirm } from "../../components/ui/Confirm";
import { Dialog, DialogClose } from "../../components/ui/Dialog";
import { Menu, MenuItem, MenuSeparator } from "../../components/ui/Menu";

export function BookMenu({ title, remove }: { title: string; remove: () => Promise<void> }) {
  const [details, setDetails] = useState(false);
  const { confirm, confirmDialog } = useConfirm();

  const askToRemove = async () => {
    if (await confirm({ title: `Delete "${title}"?`, confirmLabel: "Delete", danger: true })) await remove();
  };

  return (
    <>
      <Menu
        align="end"
        trigger={
          <Button variant="ghost" aria-label="More actions">
            <span aria-hidden>⋯</span>
          </Button>
        }
      >
        <MenuItem onClick={() => setDetails(true)}>Details…</MenuItem>
        <MenuSeparator />
        <MenuItem danger onClick={() => void askToRemove()}>
          Delete
        </MenuItem>
      </Menu>
      <Dialog open={details} onOpenChange={setDetails} title={title} footer={<DialogClose>Close</DialogClose>}>
        <p className="text-body">Added in March, three readers.</p>
      </Dialog>
      {confirmDialog}
    </>
  );
}
```

## Adapt to the app

- `min-w-44` and the row padding follow the app's density; the panel and
  row looks come from `looks.ts` in [tailwind.md](tailwind.md).
- A menu with icons puts them at the row's start, `aria-hidden`, with the
  label as the item's text.

## Traps

- **`modal` defaults to `true`.** An open menu locks the page's scroll, and
  an outside click only closes it. A menu in a toolbar or a dense list where
  the next click should land passes `modal={false}`.
- **An item that moves focus.** Base UI moves focus back to the trigger
  after the item's `onClick` has run. When the item swaps the trigger out
  (Rename turning a title into an input), focus falls back to an old
  element and the new input blurs. Run that item from the popup's
  `finalFocus` instead: remember the choice in `onClick`, and in
  `finalFocus` focus the trigger, run it, and return `false` so Base UI
  moves nothing. Almanac hit this.
- **A right-click menu** is `ContextMenu` (`@base-ui/react/context-menu`),
  with the same parts; it opens at the pointer on right click or a long
  press. It repeats actions a visible menu button already offers, never
  holds the only copy.
- **Submenus** are `Menu.SubmenuRoot` and `Menu.SubmenuTrigger`; they open
  on hover and on the arrow key.
- **jsdom.** A menu opens a tick after the click; tests use `findByRole`. The
  recipe for a wrapper's test is in [confirm.md](confirm.md) under Notes.
