# Switch and checkbox

A switch is a setting that takes effect at once (dark previews, email
alerts on). A checkbox is a choice a form or a list collects and applies
later (agree to terms, pick rows). Both render a `<span>` with a hidden
`<input>` beside it, so an enclosing `<label>` names them and makes the
whole row clickable.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Switch.tsx
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface SwitchProps extends Omit<ComponentProps<typeof BaseSwitch.Root>, "className" | "children"> {
  label: ReactNode;
  className?: string;
}

/** An on/off setting that applies at once. The whole row is the click target. */
export function Switch({ label, className, ...props }: SwitchProps) {
  return (
    <label className={cn("flex items-center justify-between gap-3 text-body text-ink", className)}>
      {label}
      <BaseSwitch.Root
        {...props}
        className={cn(
          "flex h-5 w-9 shrink-0 items-center rounded-full bg-line p-0.5 outline-none motion-safe:transition-colors",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "data-checked:bg-accent data-disabled:opacity-50",
        )}
      >
        <BaseSwitch.Thumb className="size-4 rounded-full bg-raised shadow-popup motion-safe:transition-transform data-checked:translate-x-4" />
      </BaseSwitch.Root>
    </label>
  );
}
```

```tsx
// src/components/ui/Checkbox.tsx
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CheckIcon } from "./icons";

export interface CheckboxProps extends Omit<ComponentProps<typeof BaseCheckbox.Root>, "className" | "children"> {
  label: ReactNode;
  className?: string;
}

/** A tick box with its label. `indeterminate` draws a dash, for a "select all" over a partial selection. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 text-body text-ink", className)}>
      <BaseCheckbox.Root
        {...props}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-control border border-line bg-raised text-on-accent outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "data-checked:border-accent data-checked:bg-accent data-indeterminate:border-accent data-indeterminate:bg-accent",
          "data-disabled:opacity-50",
        )}
      >
        <BaseCheckbox.Indicator className="group flex items-center justify-center">
          <CheckIcon className="size-3 group-data-indeterminate:hidden" />
          <span className="hidden h-0.5 w-2 bg-on-accent group-data-indeterminate:block" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label}
    </label>
  );
}
```

In feature code, a setting that saves on change:

```tsx
// src/features/settings/EmailAlerts.tsx
import { useState } from "react";
import { Switch } from "../../components/ui/Switch";
import { notify } from "../../components/ui/toast";

export function EmailAlerts({ initial, save }: { initial: boolean; save: (on: boolean) => Promise<void> }) {
  const [on, setOn] = useState(initial);
  return (
    <Switch
      label="Email me when a book I wished for is found"
      checked={on}
      onCheckedChange={(next) => {
        setOn(next);
        void save(next).catch(() => {
          setOn(!next);
          notify({ title: "The setting wasn't saved", type: "error" });
        });
      }}
    />
  );
}
```

## Adapt to the app

- The switch's track and thumb sizes (36 by 20 px) and the box's 16 px are
  a middle density; the thumb travels the track's inner width less its own
  (here 32 less 16 px, `translate-x-4`).
- A checked state uses the app's accent; an app whose accent is pale on its
  surface (imbatranimOS's Apricot) keeps a border on the checked box.

## Notes

- **A checkbox drawn as a track is a Switch.** comercial-website's three
  filter and "free" toggles apply at once and were checkboxes styled as
  switches; a drawn `Checkbox` there would be announced wrong. Real boxes
  (negotiable, the terms, bundle rows) stay `Checkbox`.
- **An empty box and an unchecked track need 3:1** against the surface in
  both themes. imbatranimOS's kit `Checkbox` is faint in Classic dark and
  comercial-website's unchecked track was about 1.2:1 in light, kept only
  for Q19's parity; the redesign raises both.
- **The value the server takes.** `onCheckedChange` gives a boolean. A
  native checkbox in a form sends `"on"` (or its `value`), and some handlers
  were written for `0 | 1` (the todo app's `PATCH` takes `0 | 1 | boolean`).
  When a wrapper replaces a native control, send what the handler already
  accepts, and don't tighten its schema in the same change.
- **In a form,** put the control in `Field.Root` with a `name`
  ([field.md](field.md)), or give the root a `name`, so its hidden input is
  sent with the form.
- **`aria-label` wins over the label** in 1.9.0 (a fix in this release): an
  icon-only switch with an `aria-label` and a visible `<label>` is named by
  the `aria-label`.
- **Indeterminate is a third state.** The box then carries
  `data-indeterminate` and neither `data-checked` nor `data-unchecked`, so
  the root styles both filled states. The indicator mounts only when checked
  or indeterminate, and its children tell the two apart with
  `group-data-indeterminate:`.
- **A group of checkboxes** that share one value is `CheckboxGroup`
  (`@base-ui/react/checkbox-group`), with a "select all" parent checkbox.
- **Tests:** `getByRole("switch", { name: … })` and
  `getByRole("checkbox", { name: … })` (rule 17).
