# Confirm

Rule 11 says no `window.confirm`, `alert` or `prompt`. This page is what to
use instead: a button that asks first and runs its action with a pending
state, a `useConfirm()` hook that asks a question and returns the answer,
and the inline "Delete? Yes / No" that Satchel and Shelfmark keep.

Written from wicket's `ConfirmAction.tsx` (the pending state) and
imbatranimOS's `useConfirm` (the promise). Checked against `@base-ui/react`
1.9.0 and `tailwindcss` 4.3.5 on 2026-11-11.

## Which one

| The case | Use |
|---|---|
| A button whose action is destructive or slow (delete, revoke, send) | `ConfirmAction` |
| Code that must ask before it goes on (discard a draft, overwrite a file) | `useConfirm()` |
| A row's delete where the question fits in place | an inline Yes / No (Q58) |

A dialog that only says something ("Saved") is a toast
([toast.md](toast.md)), never an alert.

## The wrapper

```tsx
// src/components/ui/Confirm.tsx
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useCallback, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "./Button";

/** The alert's panel: centred at every width, small, title then text then actions. */
function AlertPanel({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions: ReactNode }) {
  return (
    <AlertDialog.Portal>
      <AlertDialog.Backdrop className="fixed inset-0 z-overlay bg-scrim motion-safe:transition-opacity motion-safe:duration-150 data-starting-style:opacity-0 data-ending-style:opacity-0" />
      <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-dialog w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-dialog bg-raised p-5 text-ink shadow-dialog outline-none motion-safe:transition-[opacity,scale] motion-safe:duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0">
        <AlertDialog.Title className="text-title font-semibold">{title}</AlertDialog.Title>
        {description && (
          <AlertDialog.Description render={<div />} className="mt-1 text-body text-ink-muted">
            {description}
          </AlertDialog.Description>
        )}
        <div className="mt-5 flex justify-end gap-2">{actions}</div>
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  );
}

export interface ConfirmActionProps {
  /** The button that asks, such as "Delete". */
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  /** The action. The dialog can't be dismissed while it runs, and closes when it succeeds. */
  run: () => Promise<void>;
}

/**
 * A button that asks first. Cancel comes first, so it has focus; the action
 * runs once and shows "Working…"; a failure keeps the dialog open and says so.
 */
export function ConfirmAction({ label, title, description, confirmLabel, danger = false, run }: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const runAction = () => {
    if (pending) return;
    setPending(true);
    setFailed(false);
    run().then(
      () => {
        setPending(false);
        setOpen(false);
      },
      () => {
        setPending(false);
        setFailed(true);
      },
    );
  };

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setFailed(false);
        setOpen(next);
      }}
    >
      <AlertDialog.Trigger render={<Button variant={danger ? "danger" : "default"} />}>{label}</AlertDialog.Trigger>
      <AlertPanel
        title={title}
        description={
          <>
            {description}
            {failed && (
              <p role="alert" className="mt-2 text-danger">
                That didn't work. Try again.
              </p>
            )}
          </>
        }
        actions={
          <>
            <AlertDialog.Close render={<Button />} disabled={pending}>
              Cancel
            </AlertDialog.Close>
            <Button variant={danger ? "danger" : "primary"} disabled={pending} onClick={runAction}>
              {pending ? "Working…" : confirmLabel}
            </Button>
          </>
        }
      />
    </AlertDialog.Root>
  );
}

export interface ConfirmRequest {
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

/**
 * Asks a yes-or-no question and resolves with the answer. Render
 * `confirmDialog` once in the component, then `if (await confirm({ … }))`.
 * Esc, Cancel and a second question all answer no.
 */
export function useConfirm(): {
  confirm: (request: ConfirmRequest) => Promise<boolean>;
  confirmDialog: ReactElement;
} {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const [open, setOpen] = useState(false);
  const answer = useRef<(yes: boolean) => void>(() => undefined);

  const confirm = useCallback(
    (next: ConfirmRequest) =>
      new Promise<boolean>((resolve) => {
        answer.current(false);
        answer.current = resolve;
        setRequest(next);
        setOpen(true);
      }),
    [],
  );

  const settle = (yes: boolean) => {
    answer.current(yes);
    answer.current = () => undefined;
    setOpen(false);
  };

  const confirmDialog = (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
      onOpenChangeComplete={(next) => {
        if (!next) setRequest(null);
      }}
    >
      <AlertPanel
        title={request?.title}
        description={request?.description}
        actions={
          <>
            <AlertDialog.Close render={<Button />}>Cancel</AlertDialog.Close>
            <Button variant={request?.danger ? "danger" : "primary"} onClick={() => settle(true)}>
              {request?.confirmLabel ?? "Confirm"}
            </Button>
          </>
        }
      />
    </AlertDialog.Root>
  );

  return { confirm, confirmDialog };
}
```

In feature code:

```tsx
// src/features/notes/NoteActions.tsx
import { Button } from "../../components/ui/Button";
import { ConfirmAction, useConfirm } from "../../components/ui/Confirm";

export function NoteActions({
  title,
  remove,
  hasDraft,
  discardDraft,
}: {
  title: string;
  remove: () => Promise<void>;
  hasDraft: boolean;
  discardDraft: () => void;
}) {
  const { confirm, confirmDialog } = useConfirm();

  const discard = async () => {
    if (!hasDraft || (await confirm({ title: "Discard the draft?", confirmLabel: "Discard", danger: true }))) {
      discardDraft();
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => void discard()}>Discard draft</Button>
      <ConfirmAction
        label="Delete"
        title={`Delete "${title}"?`}
        description="The note and its history go for good."
        confirmLabel="Delete"
        danger
        run={remove}
      />
      {confirmDialog}
    </div>
  );
}
```

## Adapt to the app

- The labels ("Cancel", "Working…", "That didn't work. Try again.") are
  the app's voice; keep a pending label on the action and Cancel first.
- `danger` maps to the app's destructive button variant (imbatranimOS's
  `variant="destructive"`).

## Notes

- **An alert dialog doesn't close on an outside press**, by design; Esc and
  Cancel close it. While `ConfirmAction` runs, neither does: `onOpenChange`
  returns early, and Cancel is disabled.
- **The page reports success.** The dialog closes when `run` resolves; the
  caller's own state (a row gone, a toast) says it worked.
- **Description as a `<div>`.** `AlertDialog.Description` renders a `<p>`;
  `render={<div />}` lets it hold a paragraph of its own.
- **`check-base-ui` and the name `confirm`.** Rule 11 skips a `confirm` the
  file binds itself, as the `const { confirm } = useConfirm()` above, so the
  hook's call sites aren't findings.

## Inline Yes / No

Satchel and Shelfmark ask "Delete? Yes / No" in place, and keep it (Q58):
the rule is no native dialogs, not "always an AlertDialog". The inline form
replaces the row's Delete button with the question and two buttons, moves
focus to No, answers No on Esc, and puts focus back on Delete when it
closes. It suits an undoable or low-stakes delete inside a list; anything
that destroys more than the row asks with `ConfirmAction`.
