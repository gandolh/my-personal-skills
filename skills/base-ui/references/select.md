# Select

A choice from a short list, in a popup. Rule 10: a select whose values
differ from their labels passes `items`, or the trigger shows the raw value.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

```tsx
// src/components/ui/Select.tsx
import { Select as BaseSelect } from "@base-ui/react/select";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CheckIcon, ChevronDownIcon } from "./icons";
import { panel, row } from "./looks";

export interface SelectItem<Value extends string> {
  value: Value;
  label: string;
}

export interface SelectProps<Value extends string> {
  label: ReactNode;
  /** Every choice, with the label the trigger shows for it (base-ui rule 10). */
  items: SelectItem<Value>[];
  value: Value | null;
  onValueChange: (value: Value) => void;
  placeholder?: string;
  /** For a form: the name the value is sent under. */
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function Select<Value extends string>({
  label,
  items,
  value,
  onValueChange,
  placeholder = "Choose…",
  name,
  disabled,
  className,
}: SelectProps<Value>) {
  return (
    <BaseSelect.Root
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onValueChange(next);
      }}
      name={name}
      disabled={disabled}
    >
      <div className={cn("flex flex-col gap-1", className)}>
        <BaseSelect.Label className="text-meta font-medium text-ink">{label}</BaseSelect.Label>
        <BaseSelect.Trigger
          className={cn(
            "flex h-9 min-w-40 items-center justify-between gap-2 rounded-control border border-line bg-raised px-2.5 text-body text-ink",
            "outline-none focus-visible:ring-2 focus-visible:ring-accent data-popup-open:border-accent data-disabled:opacity-50",
          )}
        >
          <BaseSelect.Value placeholder={placeholder} className="truncate data-placeholder:text-ink-muted" />
          <BaseSelect.Icon className="text-ink-muted">
            <ChevronDownIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} collisionPadding={8} className="z-popup outline-none">
          <BaseSelect.Popup className={cn(panel, "min-w-(--anchor-width)")}>
            <BaseSelect.List className="max-h-(--available-height) overflow-y-auto p-1">
              {items.map((item) => (
                <BaseSelect.Item key={item.value} value={item.value} className={cn(row, "grid grid-cols-[1rem_1fr]")}>
                  <BaseSelect.ItemIndicator className="col-start-1">
                    <CheckIcon />
                  </BaseSelect.ItemIndicator>
                  <BaseSelect.ItemText className="col-start-2">{item.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
```

In feature code, with values that aren't their labels:

```tsx
// src/features/books/SortBy.tsx
import { Select } from "../../components/ui/Select";

export type Sort = "added" | "title" | "author";

const SORTS: { value: Sort; label: string }[] = [
  { value: "added", label: "Recently added" },
  { value: "title", label: "Title, A to Z" },
  { value: "author", label: "Author" },
];

export function SortBy({ value, onChange }: { value: Sort; onChange: (sort: Sort) => void }) {
  return <Select label="Sort by" items={SORTS} value={value} onValueChange={onChange} />;
}
```

## Why `items`

`Select.Value` shows the raw `value` unless the root knows the labels. With
`value="added"`, the trigger reads "added", not "Recently added": every
select whose value is an id, a number or a key showed the wrong text in
imbatranimOS until its kit passed `items`. `items` takes the
`{ value, label }[]` above, a `Record<string, ReactNode>`, or groups. The
same list renders the options, so the two can't drift.

`check-base-ui` warns on rule 10 at every `<Select.Root>` (under whatever
name the file imports `Select` by) without `items`. A repo whose own wrapper
re-exports the root (`export const Select = BaseSelect.Root`) hides its call
sites from the check; that wrapper's callers are review's.

## Notes

- **The popup covers the trigger** by default (`alignItemWithTrigger`), so
  the chosen item sits over the value it replaces. It falls back to a
  dropdown below the trigger on touch and when there's no room; pass
  `alignItemWithTrigger={false}` to the positioner to always drop down.
  `data-side` reads `none` while it covers.
- **`Select.Label`** names the trigger; without a visible label, give the
  trigger an `aria-label`.
- **A long list is a Combobox** ([combobox.md](combobox.md)): Select only
  has typeahead, no filter.
- **A native `<select>` on phones** stays where an app's decisions keep it
  (Q16): the phone's own picker is the better control there. Such an app
  picks one at render time from `matchMedia("(width < 40rem)")`, the same
  edge as `max-sm:`, so only one control is ever in the form.
- **In a form,** `name` sends the value with the form, and `Field.Root`
  around it supplies the label and the error ([field.md](field.md)).
