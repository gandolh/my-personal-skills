# Combobox

A choice from a long list, filtered as you type: a city, a person, a book.
Use it where a Select would need scrolling. It only accepts an item from
the list; free text with suggestions is `Autocomplete`, a sibling component
with the same parts.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

The wrapper stores ids, as apps do. `Combobox.createItems` (new in this
line) derives each item's value and label from the app's own records, so
the list renders the record while `value` and `onValueChange` deal in ids,
and filtering matches the label.

```tsx
// src/components/ui/Combobox.tsx
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useId, useMemo, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon, CloseIcon } from "./icons";
import { panel, row } from "./looks";

export interface ComboboxOption {
  id: string;
  label: string;
}

export interface ComboboxProps {
  label: ReactNode;
  options: ComboboxOption[];
  /** The chosen option's id, or null for none. */
  value: string | null;
  onValueChange: (id: string | null) => void;
  placeholder?: string;
  /** What the list says when nothing matches. */
  empty?: ReactNode;
  className?: string;
}

export function Combobox({
  label,
  options,
  value,
  onValueChange,
  placeholder,
  empty = "No matches",
  className,
}: ComboboxProps) {
  const inputId = useId();
  const items = useMemo(
    () => BaseCombobox.createItems(options, { getValue: (option) => option.id, getLabel: (option) => option.label }),
    [options],
  );

  return (
    <BaseCombobox.Root items={items} value={value} onValueChange={onValueChange}>
      <div className={cn("flex flex-col gap-1", className)}>
        <label htmlFor={inputId} className="text-meta font-medium text-ink">
          {label}
        </label>
        <BaseCombobox.InputGroup className="flex h-9 items-center rounded-control border border-line bg-raised focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
          <BaseCombobox.Input
            id={inputId}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-body text-ink outline-none placeholder:text-ink-muted"
          />
          <BaseCombobox.Clear
            aria-label="Clear"
            className="flex size-7 items-center justify-center rounded-control text-ink-muted hover:bg-hover"
          >
            <CloseIcon />
          </BaseCombobox.Clear>
          <BaseCombobox.Trigger
            aria-label="Show all"
            className="flex size-7 items-center justify-center rounded-control text-ink-muted hover:bg-hover"
          >
            <BaseCombobox.Icon>
              <ChevronDownIcon />
            </BaseCombobox.Icon>
          </BaseCombobox.Trigger>
        </BaseCombobox.InputGroup>
      </div>
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner sideOffset={4} collisionPadding={8} className="z-popup outline-none">
          <BaseCombobox.Popup className={cn(panel, "w-(--anchor-width) max-w-(--available-width)")}>
            <BaseCombobox.Empty className="px-3 py-2 text-body text-ink-muted empty:hidden">{empty}</BaseCombobox.Empty>
            <BaseCombobox.List className="max-h-[min(22rem,var(--available-height))] overflow-y-auto p-1 data-empty:p-0">
              {(option: ComboboxOption) => (
                <BaseCombobox.Item key={option.id} value={option.id} className={cn(row, "grid grid-cols-[1rem_1fr]")}>
                  <BaseCombobox.ItemIndicator className="col-start-1">
                    <CheckIcon />
                  </BaseCombobox.ItemIndicator>
                  <span className="col-start-2">{option.label}</span>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
```

In feature code:

```tsx
// src/features/listings/CityPicker.tsx
import { Combobox, type ComboboxOption } from "../../components/ui/Combobox";

export function CityPicker({
  cities,
  value,
  onChange,
}: {
  cities: ComboboxOption[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return <Combobox label="City" placeholder="Type a city" options={cities} value={value} onValueChange={onChange} />;
}
```

## Notes

- **Label the input.** A `<label htmlFor>` names `Combobox.Input`, as here.
  `Combobox.Label` labels the trigger instead, for the pattern where the
  input sits inside the popup.
- **The icon sits in `Combobox.Icon`** inside the trigger. A bare icon
  component as the trigger's first child is rule 9's known false positive
  (the check can't tell an icon from a button); the part keeps the check
  quiet and marks the icon `aria-hidden`.
- **Memoize the collection.** `createItems` rebuilds the lookup; keep it in a
  `useMemo` on the options, or at module scope for static data.
- **Async results** (a server search): pass the current results as `items`
  and keep the chosen record among them, so its label stays known when it
  falls out of the results. The package docs' "Async search" demo has the
  full shape.
- **On a phone**, the list opens above the keyboard only if there's room;
  `collisionPadding` keeps it off the edges. Test at 390 px with the
  keyboard up.
