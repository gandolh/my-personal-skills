# Dialog

Rule 12, as one wrapper: controlled, with the Escape guard, focus that lands
on the first field, three sizes, and the whole screen below `md`. Written
from Almanac's `Dialog.tsx`, which found the guard and the focus order.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Dialog.tsx
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useRef, type ReactElement, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "./Button";
import { CloseIcon } from "./icons";

const SIZES = { small: "md:w-100", medium: "md:w-140", large: "md:w-180" } as const;

const FOCUSABLE =
  "input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href]";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** The actions, Cancel first: <DialogClose /> then the main button. */
  footer?: ReactNode;
  /** The element that opens it, such as <Button>Rename</Button>. A controlled dialog can also open from code. */
  trigger?: ReactElement;
  /** The width from md up: 400, 560 or 720 px. Below md the dialog fills the screen. */
  size?: keyof typeof SIZES;
  /** For a dialog that holds a form: an outside tap must not throw away what was typed (Q58). */
  disablePointerDismissal?: boolean;
  className?: string;
}

/**
 * A modal dialog (base-ui rule 12). Focus stays inside, the page behind is
 * inert, and focus goes back where it was on close. Esc, the X and an outside
 * press close it, the last unless disablePointerDismissal is set. On open,
 * focus goes to the first [data-autofocus] inside, else the body's first
 * field or button, else the footer's first button: never the X.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  size = "medium",
  disablePointerDismissal,
  className,
}: DialogProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next, details) => {
        // The Escape guard: an Esc that a control inside already used (a list closing) isn't the dialog's.
        if (!next && details.reason === "escape-key" && details.event.defaultPrevented) return;
        onOpenChange(next);
      }}
      disablePointerDismissal={disablePointerDismissal}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-overlay bg-scrim motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <BaseDialog.Popup
          ref={popupRef}
          initialFocus={() =>
            popupRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
            bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
            popupRef.current?.querySelector<HTMLElement>("footer button:not(:disabled)") ??
            true
          }
          className={cn(
            "fixed inset-0 z-dialog flex flex-col bg-raised text-ink outline-none",
            "md:inset-auto md:top-1/2 md:left-1/2 md:max-h-[85dvh] md:-translate-x-1/2 md:-translate-y-1/2",
            "md:rounded-dialog md:shadow-dialog",
            "motion-safe:transition-[opacity,scale] motion-safe:duration-150",
            "data-starting-style:opacity-0 data-ending-style:opacity-0",
            "md:data-starting-style:scale-95 md:data-ending-style:scale-95",
            SIZES[size],
            className,
          )}
        >
          <header className="flex items-start gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0 flex-1">
              <BaseDialog.Title className="text-title font-semibold">{title}</BaseDialog.Title>
              {description && (
                <BaseDialog.Description className="mt-0.5 text-body text-ink-muted">{description}</BaseDialog.Description>
              )}
            </div>
            <BaseDialog.Close
              aria-label="Close"
              className="flex size-8 shrink-0 items-center justify-center rounded-control text-ink-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
            >
              <CloseIcon />
            </BaseDialog.Close>
          </header>
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto p-4">
            {children}
          </div>
          {footer && (
            <footer className="flex justify-end gap-2 border-t border-line px-4 py-3 max-sm:pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              {footer}
            </footer>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** A footer button that closes the dialog, Cancel by default. */
export function DialogClose({ children = "Cancel", ...props }: ButtonProps) {
  return <BaseDialog.Close render={<Button {...props} />}>{children}</BaseDialog.Close>;
}
```

## A form in a dialog

A form dialog sets `disablePointerDismissal`, so it closes only with Cancel,
the X or Esc (Q58). It refuses to close while the save runs, and the field
gets focus through `data-autofocus`.

```tsx
// src/features/books/RenameBook.tsx
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Dialog, DialogClose } from "../../components/ui/Dialog";
import { TextField } from "../../components/ui/TextField";
import { notify } from "../../components/ui/toast";

export function RenameBook({ title, rename }: { title: string; rename: (title: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next);
      }}
      title="Rename the book"
      trigger={<Button variant="ghost">Rename</Button>}
      size="small"
      disablePointerDismissal
      footer={
        <>
          <DialogClose disabled={pending} />
          <Button type="submit" form="rename-book" variant="primary" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <form
        id="rename-book"
        onSubmit={(event) => {
          event.preventDefault();
          const next = String(new FormData(event.currentTarget).get("title") ?? "").trim();
          setPending(true);
          void rename(next)
            .then(
              () => setOpen(false),
              () => notify({ title: "The book wasn't renamed", type: "error" }),
            )
            .finally(() => setPending(false));
        }}
      >
        <TextField name="title" label="Title" defaultValue={title} required data-autofocus />
      </form>
    </Dialog>
  );
}
```

## What the wrapper does, and why

- **Controlled.** `open` and `onOpenChange` live in the caller, so code can
  open it (from a menu item, after a fetch) and refuse to close it (while a
  save runs). An uncontrolled `Dialog.Root` refuses a close by calling
  `details.cancel()` in `onOpenChange` instead.
- **The Escape guard.** Base UI's Esc listener doesn't look at
  `defaultPrevented`, so an Esc that closed a list inside the dialog also
  closed the dialog (Almanac's time field). An inner control that uses Esc
  calls `event.preventDefault()` on its keydown, and the guard skips that
  close. Popups that are Base UI's own (a Menu, a Select) nest correctly
  without it: Esc closes the innermost.
- **Initial focus.** Base UI's default is the first tabbable element, which
  is the X in this layout. The function picks `[data-autofocus]`, then the
  body's first field or button, then the footer's first button. Returning
  `true` falls back to the default.
- **On a phone,** Base UI's default focuses the popup itself when a touch
  opened the dialog, so the keyboard stays down. The order above focuses a
  first text field on touch too, and the keyboard opens: right for a rename
  or a search, wrong for a dialog where typing is optional. The function
  gets the opening interaction (`openType === "touch"`); an app that wants
  the keyboard down there returns `true` for touch unless an element is
  marked `data-autofocus`.
- **A title on every dialog.** `Dialog.Title` names the dialog for a screen
  reader (`aria-labelledby`); a dialog with only an `aria-label` misses the
  visible heading.
- **The X has an `aria-label`**, as every icon-only control does.
- **Below `md`** the popup fills the screen and the footer clears the
  phone's home bar (`env(safe-area-inset-bottom)`).
- **Motion** runs only under `motion-safe:`. Base UI keeps the popup mounted
  until the transition ends, so the `data-ending-style` values are what it
  animates to on close.

## Adapt to the app

- The three widths (400, 560, 720 px) are Almanac's; an app with other
  dialog widths changes `SIZES`, not the call sites.
- An app whose phones should see a centred card instead of a full screen
  drops the `md:` prefixes from the position classes.
- The header's divider and the footer's bar follow the app's look; the
  Title, the labelled X and the focus function stay.

## Traps

- **A trigger made of a component uses `render`** (rule 9). The `trigger`
  prop does it here; a bare `<Dialog.Trigger><Button /></Dialog.Trigger>`
  nests a button in a button.
- **A native `<dialog>` opened with `showModal()`** sits in the top layer,
  above every z-index. A Base UI popup opened from inside one must portal
  into it (`Portal`'s `container`), or it renders underneath (Postern's
  composer).
- **Static rendering.** Portals render nothing under `renderToStaticMarkup`;
  a test that renders statically mocks `@base-ui/react/dialog` (Almanac has
  a stub for it).
- **jsdom.** A recipe for a wrapper's test is in [confirm.md](confirm.md)
  under Notes. While a modal is open, the page behind it is hidden from
  `getByRole`; pass `{ hidden: true }` to reach it.
- **A phone menu is a Drawer, not a positioned Dialog** (rule 15,
  [drawer.md](drawer.md)).
