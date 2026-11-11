# Toolbar

A row of controls that is one Tab stop: Tab enters it, arrow keys move
between its buttons, Tab leaves. An editor's formatting bar, a list's bulk
actions. A toolbar that holds Base UI popups is a composite, so it lives in
the feature's own `ui/` folder (rule 3) and composes the parts directly.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

## The pieces

```tsx
// src/components/ui/Toolbar.tsx
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

type WithClass<P> = Omit<P, "className"> & { className?: string };

/** The bar. Name it: <Toolbar aria-label="Formatting">. */
export function Toolbar({ className, ...props }: WithClass<ComponentProps<typeof BaseToolbar.Root>>) {
  return (
    <BaseToolbar.Root
      {...props}
      className={cn("flex items-center gap-0.5 border-b border-line bg-raised px-2 py-1", className)}
    />
  );
}

/** The bar's buttons share one look; an icon-only one carries an aria-label. */
export const toolbarButton = [
  "inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-control px-2 text-body text-ink select-none",
  "outline-none hover:not-data-disabled:bg-hover focus-visible:ring-2 focus-visible:ring-accent",
  "data-pressed:bg-hover data-popup-open:bg-hover data-disabled:opacity-50",
].join(" ");

export function ToolbarButton({ className, ...props }: WithClass<ComponentProps<typeof BaseToolbar.Button>>) {
  return <BaseToolbar.Button {...props} className={cn(toolbarButton, className)} />;
}

export function ToolbarSeparator() {
  return <BaseToolbar.Separator className="mx-1 h-5 w-px bg-line" />;
}

export const ToolbarGroup = BaseToolbar.Group;
```

## A composite: buttons, toggles, a menu and a tooltip

The order of `render` matters. A popup's trigger goes inside the toolbar
button (`Toolbar.Button render={<Menu.Trigger />}`), so the toolbar keeps the
arrow keys. A tooltip is the other way round: the toolbar button goes inside
the tooltip's trigger (`Tooltip.Trigger render={<Toolbar.Button />}`).

```tsx
// src/features/notes/ui/NoteToolbar.tsx
import { Menu } from "@base-ui/react/menu";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import { Tooltip } from "@base-ui/react/tooltip";
import { cn } from "../../../lib/cn";
import { panel, row } from "../../../components/ui/looks";
import { Toolbar as Bar, ToolbarButton, ToolbarSeparator, toolbarButton } from "../../../components/ui/Toolbar";

export type Mark = "bold" | "italic";

/** The note editor's bar: two marks, a menu, and an icon button with a tooltip. */
export function NoteToolbar({
  marks,
  onMarksChange,
  onInsert,
  onShare,
}: {
  marks: Mark[];
  onMarksChange: (marks: Mark[]) => void;
  onInsert: (what: "link" | "table") => void;
  onShare: () => void;
}) {
  return (
    <Bar aria-label="Formatting">
      <ToggleGroup
        multiple
        aria-label="Marks"
        value={marks}
        onValueChange={(next) => onMarksChange(next.filter((mark): mark is Mark => mark === "bold" || mark === "italic"))}
        className="flex gap-0.5"
      >
        <Toolbar.Button render={<Toggle />} value="bold" aria-label="Bold" className={cn(toolbarButton, "font-bold")}>
          B
        </Toolbar.Button>
        <Toolbar.Button render={<Toggle />} value="italic" aria-label="Italic" className={cn(toolbarButton, "italic")}>
          I
        </Toolbar.Button>
      </ToggleGroup>
      <ToolbarSeparator />
      <Menu.Root>
        <ToolbarButton render={<Menu.Trigger />}>Insert</ToolbarButton>
        <Menu.Portal>
          <Menu.Positioner sideOffset={4} className="z-popup">
            <Menu.Popup className={cn(panel, "min-w-36 p-1")}>
              <Menu.Item className={row} onClick={() => onInsert("link")}>
                Link
              </Menu.Item>
              <Menu.Item className={row} onClick={() => onInsert("table")}>
                Table
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <ToolbarSeparator />
      <Tooltip.Root>
        <Tooltip.Trigger render={<ToolbarButton aria-label="Share" onClick={onShare} />}>
          <span aria-hidden>↗</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={6} className="z-tooltip">
            <Tooltip.Popup className="rounded-control bg-ink px-2 py-1 text-meta text-surface">Share</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Bar>
  );
}
```

## Adapt to the app

- `toolbarButton` is the bar's one look; an app whose toolbar sits on the
  page background drops `bg-raised` from the bar.
- The glyphs (B, I, the arrow) stand in for the app's icon set.

## Notes

- **Disabled buttons stay focusable** (`focusableWhenDisabled` is on by
  default in a toolbar), so arrow keys don't skip them and a screen reader
  still finds them.
- **One input at most, and last.** Left and right arrows both move the
  caret in an input and move along the bar, so a search field goes at the
  end, as `Toolbar.Input`.
- **A toggle group inside a toolbar** passes `Toggle` through each
  `Toolbar.Button`'s `render`, as here, so one arrow-key ring covers the
  whole bar. A toggle group that saves to the server keeps the guard from
  [tabs-toggle-group.md](tabs-toggle-group.md).
- **Name the bar** with `aria-label`; a page with two toolbars needs two
  names.
