# Tabs, radio groups and toggle groups

Rule 16: which control a one-of-several choice gets. Three wrappers, and a
feature that uses each.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

## Which one

| The choice | Control | Arrow keys | Why |
|---|---|---|---|
| Switches what a list shows (All / Open / Done) | `RadioGroup` | move and choose | Nothing is saved; trying each option with the arrows is the point (Q41) |
| Switches between panels of content | `Tabs`, with `activateOnFocus` | move and choose | The same, for panels (Q41) |
| A setting kept on the device (theme, language) | `RadioGroup` | move and choose | Storing on the device costs nothing, so it behaves like a filter (Q57) |
| A picker that saves to the server on each choice | guarded `ToggleGroup` | move focus only | An arrow press must not write; Space, Enter or a click does (Q57) |

"Saves" means a write to the server. Four repo briefs made a device-only
picker a `ToggleGroup` (public-resource-map, ro-housing, sports-app,
Shelfmark); this table wins when they are built.

`Tabs.List`'s `activateOnFocus` defaults to `false` in 1.9.0: arrow keys move
focus and Enter or Space selects. The wrapper below turns it on; a tab set
whose panels are slow to render passes `activateOnFocus={false}`.

## RadioGroup

`Radio.Root` renders a `<span>` with a hidden `<input>` beside it, so an
enclosing `<label>` names each option. The group is named by
`aria-labelledby`.

```tsx
// src/components/ui/RadioGroup.tsx
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { useId, type ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface RadioOption<Value extends string> {
  value: Value;
  label: ReactNode;
}

export interface RadioGroupProps<Value extends string> {
  label: ReactNode;
  options: readonly RadioOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  /** `list` stacks radios with dots; `segmented` draws one row of buttons, for a filter. */
  look?: "list" | "segmented";
  className?: string;
}

/**
 * One choice from a few. Tab enters the group, and arrow keys move and choose
 * (base-ui rule 16): for a filter, and for a setting kept on the device.
 */
export function RadioGroup<Value extends string>({
  label,
  options,
  value,
  onValueChange,
  look = "list",
  className,
}: RadioGroupProps<Value>) {
  const labelId = useId();
  const segmented = look === "segmented";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div id={labelId} className={cn("text-meta font-medium text-ink-muted", segmented && "sr-only")}>
        {label}
      </div>
      <BaseRadioGroup<Value>
        aria-labelledby={labelId}
        value={value}
        onValueChange={onValueChange}
        className={
          segmented ? "inline-flex w-fit rounded-control border border-line bg-raised p-0.5" : "flex flex-col gap-2"
        }
      >
        {options.map((option) =>
          segmented ? (
            <Radio.Root
              key={option.value}
              value={option.value}
              className={cn(
                "rounded-control px-3 py-1 text-body text-ink-muted select-none",
                "outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "hover:not-data-checked:text-ink data-checked:bg-accent data-checked:text-on-accent",
              )}
            >
              {option.label}
            </Radio.Root>
          ) : (
            <label key={option.value} className="flex items-center gap-2 text-body text-ink">
              <Radio.Root
                value={option.value}
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-full border border-line bg-raised",
                  "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  "data-checked:border-accent data-checked:bg-accent",
                )}
              >
                <Radio.Indicator className="size-1.5 rounded-full bg-on-accent data-unchecked:hidden" />
              </Radio.Root>
              {option.label}
            </label>
          ),
        )}
      </BaseRadioGroup>
    </div>
  );
}
```

A filter, in feature code:

```tsx
// src/features/books/BookFilter.tsx
import { RadioGroup } from "../../components/ui/RadioGroup";

export type BookFilterValue = "all" | "reading" | "read";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
] as const;

/** Which books the list shows. Nothing is saved, so arrow keys may choose. */
export function BookFilter({ value, onChange }: { value: BookFilterValue; onChange: (value: BookFilterValue) => void }) {
  return <RadioGroup label="Show" look="segmented" options={FILTERS} value={value} onValueChange={onChange} />;
}
```

The theme switch is the other worked case: [theme.md](theme.md).

## Tabs

The selected tab carries `data-active` (not `data-selected`), and the
indicator part reads the active tab's box from CSS variables.

```tsx
// src/components/ui/Tabs.tsx
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type WithClass<P> = Omit<P, "className"> & { className?: string };

export const Tabs = BaseTabs.Root;

/** The row of tabs. Arrow keys choose (activateOnFocus); a slow panel passes activateOnFocus={false}. */
export function TabsList({ className, children, ...props }: WithClass<ComponentProps<typeof BaseTabs.List>>) {
  return (
    <BaseTabs.List activateOnFocus {...props} className={cn("relative flex gap-1 border-b border-line", className)}>
      {children}
      <BaseTabs.Indicator className="absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-accent motion-safe:transition-[translate,width] motion-safe:duration-200" />
    </BaseTabs.List>
  );
}

export function Tab({ className, ...props }: WithClass<ComponentProps<typeof BaseTabs.Tab>>) {
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        "h-10 px-3 text-body text-ink-muted select-none outline-none",
        "hover:text-ink focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset",
        "data-active:text-ink data-disabled:opacity-50",
        className,
      )}
    />
  );
}

export function TabPanel({ className, ...props }: WithClass<ComponentProps<typeof BaseTabs.Panel>>) {
  return <BaseTabs.Panel {...props} className={cn("pt-4 outline-none", className)} />;
}
```

`Tabs` is re-exported as it is: the root renders a plain `<div>` with no
look of its own.

## The guarded ToggleGroup

`ToggleGroup`'s value is a `string[]`, even with one choice. Pressing the
pressed item again would empty it; the guard drops that change, so one item
always stays pressed. Arrow keys move focus between items without pressing
them, so they never write.

```tsx
// src/components/ui/ToggleGroup.tsx
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface ToggleOption<Value extends string> {
  value: Value;
  label: ReactNode;
}

export interface ToggleGroupProps<Value extends string> {
  label: string;
  options: readonly ToggleOption<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A picker that saves to the server on each choice (base-ui rule 16). Arrow
 * keys only move focus; Space, Enter or a click chooses. One item always
 * stays pressed.
 */
export function ToggleGroup<Value extends string>({
  label,
  options,
  value,
  onValueChange,
  disabled,
  className,
}: ToggleGroupProps<Value>) {
  return (
    <BaseToggleGroup
      aria-label={label}
      value={[value]}
      disabled={disabled}
      onValueChange={(next) => {
        // The guard: an empty group (the pressed item pressed again) or the same value is not a choice.
        const chosen = options.find((option) => option.value === next[0]);
        if (chosen && chosen.value !== value) onValueChange(chosen.value);
      }}
      className={cn("inline-flex rounded-control border border-line bg-raised p-0.5", className)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className={cn(
            "rounded-control px-3 py-1 text-body text-ink-muted select-none",
            "outline-none focus-visible:ring-2 focus-visible:ring-accent",
            "hover:not-data-pressed:text-ink data-pressed:bg-accent data-pressed:text-on-accent data-disabled:opacity-50",
          )}
        >
          {option.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}
```

A status saved on each choice. The pick shows at once; a failed write puts
the old one back and says so.

```tsx
// src/features/books/ReadingStatus.tsx
import { useState } from "react";
import { notify } from "../../components/ui/toast";
import { ToggleGroup } from "../../components/ui/ToggleGroup";

type Status = "wishlist" | "reading" | "read";

const STATUSES = [
  { value: "wishlist", label: "Wishlist" },
  { value: "reading", label: "Reading" },
  { value: "read", label: "Read" },
] as const;

export function ReadingStatus({
  initial,
  save,
}: {
  initial: Status;
  save: (status: Status) => Promise<void>;
}) {
  const [status, setStatus] = useState<Status>(initial);
  const choose = (next: Status) => {
    const before = status;
    setStatus(next);
    void save(next).catch(() => {
      setStatus(before);
      notify({ title: "The status wasn't saved", type: "error" });
    });
  };
  return <ToggleGroup label="Reading status" options={STATUSES} value={status} onValueChange={choose} />;
}
```

## Adapt to the app

- The segmented look and the toggle group share one shape on purpose: the
  user sees the same control, and the code says whether it saves.
- A toggle group inside a toolbar uses `Toolbar.Button render={<Toggle />}`
  for each item, so the toolbar's arrow keys reach it ([toolbar.md](toolbar.md)).
- Tests select a radio or a tab by role and name (`getByRole("radio", { name:
  "Read" })`), never by class or test id (rule 17).
