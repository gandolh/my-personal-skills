# Toast

One toast module per app: a manager created once, a `notify()` any code can
call (a query's `onError` included), and a `ToastHost` rendered once near the
root. A third-party toast library (comercial-website's `sonner`) is a widget
Base UI replaces (rule 13), behind a wrapper with the same call shape.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/toast.tsx
import { Toast } from "@base-ui/react/toast";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CloseIcon } from "./icons";

/** The app's one manager, so code outside React can raise a toast. */
const manager = Toast.createToastManager();

export interface NotifyOptions {
  title: ReactNode;
  description?: ReactNode;
  type?: "info" | "success" | "error";
  /** Milliseconds before it closes; 0 keeps it until dismissed. An error defaults to 0. */
  timeout?: number;
  action?: { label: string; onClick: () => void };
}

/** Shows a toast and returns its id. An error stays until dismissed and is announced at once. */
export function notify({ title, description, type = "info", timeout, action }: NotifyOptions): string {
  return manager.add({
    title,
    description,
    type,
    timeout: timeout ?? (type === "error" ? 0 : 5000),
    priority: type === "error" ? "high" : "low",
    actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
  });
}

/** Closes one toast by id, or every toast. */
export function dismiss(id?: string): void {
  manager.close(id);
}

/** Wraps the app once: <ToastHost><App /></ToastHost>. */
export function ToastHost({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={manager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-4 z-toast flex w-[min(24rem,calc(100vw-2rem))] flex-col-reverse gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "rounded-popup border border-line bg-raised text-ink shadow-popup",
        "translate-x-(--toast-swipe-movement-x) translate-y-(--toast-swipe-movement-y)",
        "motion-safe:transition-[opacity,translate] motion-safe:duration-200 data-swiping:duration-0",
        "data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:hidden",
        "data-[type=error]:border-danger",
      )}
    >
      <Toast.Content className="flex items-start gap-3 p-3">
        <div className="min-w-0 flex-1">
          <Toast.Title className="text-body font-medium" />
          <Toast.Description className="text-meta text-ink-muted" />
        </div>
        <Toast.Action className="shrink-0 rounded-control px-2 py-1 text-body font-medium text-accent hover:bg-hover" />
        <Toast.Close
          aria-label="Dismiss"
          className="flex size-7 shrink-0 items-center justify-center rounded-control text-ink-muted hover:bg-hover"
        >
          <CloseIcon />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}
```

What it does:

- **Errors stay.** A toast that closes on its own can carry an error past
  someone who looked away, so an error waits for its Close (imbatranimOS's
  rule, kept). `priority: "high"` announces it at once.
- **`Toast.Title` and `Toast.Description` without children** render the
  toast object's own `title` and `description`. `Toast.Action` renders only
  when the toast has `actionProps`.
- **F6** moves keyboard focus into the toast region, from anywhere.
- **The stack is a plain column.** The package docs show a stacked deck
  driven by `--toast-index` and `--toast-offset-y`; an app that wants it
  copies that demo's variables onto `Toast.Root`.
- **`manager.promise(promise, { loading, success, error })`** shows one
  toast through an async call's life, where an app wants that.

## Leaving `sonner`

The same call shape over `notify()`, so a repo leaving sonner changes its
import lines and nothing else:

```ts
// src/components/ui/toastCompat.ts
import type { ReactNode } from "react";
import { notify, type NotifyOptions } from "./toast";

type Extra = Pick<NotifyOptions, "description" | "timeout" | "action">;

/** sonner's `toast()`, `toast.success()` and `toast.error()`, on Base UI's toast. */
export const toast = Object.assign((title: ReactNode, extra?: Extra) => notify({ title, ...extra }), {
  success: (title: ReactNode, extra?: Extra) => notify({ title, type: "success", ...extra }),
  error: (title: ReactNode, extra?: Extra) => notify({ title, type: "error", ...extra }),
});
```

## Adapt to the app

- Position: bottom right on a wide screen; on a phone the viewport's width
  rule already makes it full width less the gutters. An app with a bottom
  navigation bar lifts it with `bottom-20 sm:bottom-4`.
- A toast says what happened in a few words. A failure that blocks the
  screen's own work is an inline message instead, beside the thing that
  failed.
