# The theme switch

Rule 14: every app offers Light, Dark and System, shows light on a first
visit, and keeps the choice on the device (Q18, 2026-11-10). This page is
the mechanism, copied from Postern: `data-theme` on `<html>`, `color-scheme`
picking each `light-dark()` token, and `dark:` keyed off the attribute.

Checked against `@base-ui/react` 1.9.0 and `tailwindcss` 4.3.5 on
2026-11-11.

## How it fits together

1. **`<html data-theme="light|dark|system">`** holds the choice. A boot
   script in `index.html` sets it before the first paint, so a dark choice
   never flashes light.
2. **`color-scheme`** follows the attribute (the `@layer base` block in
   [tailwind.md](tailwind.md)): `light` by default, `dark` for dark,
   `light dark` for system, which then tracks the operating system live.
3. **Colour tokens are `light-dark(<light>, <dark>)`**, so most of the
   app changes with no class at all.
4. **`dark:`** is for what a token can't carry (an image swap, a shadow
   turned off). `@custom-variant dark` keys it off `data-theme`, and off the
   system setting only when the choice is System. Never write
   `@media (prefers-color-scheme: dark)` in a component.
5. **The switch** is a `RadioGroup`, because the choice is stored on the
   device, not saved to the server (rule 16).

The attribute must sit on `<html>`: popups are portalled under `<body>`,
outside every element of the app, and a theme scoped to an inner wrapper
doesn't reach them.

## The boot script

In `index.html`'s `<head>`, before the stylesheet:

```html
<script>
  // The saved theme before the first paint; light on a first visit.
  try {
    var theme = localStorage.getItem("theme");
    document.documentElement.dataset.theme = theme === "dark" || theme === "system" ? theme : "light";
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
</script>
```

An app whose Content Security Policy forbids inline scripts serves this as a
small file from its own origin, or allows its hash. Two
`<meta name="theme-color">` tags (one per `media` scheme) colour the
phone's browser bar by the system setting, not the switch; an app that
wants the bar to follow the switch rewrites the tag in `setTheme`.

## The store

```ts
// src/lib/theme.ts
import { useSyncExternalStore } from "react";

/** The theme the user picked. `system` follows the operating system, live. */
export type Theme = "light" | "dark" | "system";

const KEY = "theme";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function saved(): Theme {
  try {
    const value = localStorage.getItem(KEY);
    return isTheme(value) ? value : "light";
  } catch {
    return "light";
  }
}

let current: Theme = typeof window === "undefined" ? "light" : saved();
const listeners = new Set<() => void>();

/** The theme in force. */
export function getTheme(): Theme {
  return current;
}

/** Applies a theme to <html>, keeps it on this device, and tells every subscriber. */
export function setTheme(theme: Theme): void {
  current = theme;
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Storage is blocked (a private window): the choice lasts until the tab closes.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The theme the user picked, re-rendering when it changes. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "light");
}
```

Code that must know the theme in force (a canvas, a map style, an iframe)
resolves System with `matchMedia("(prefers-color-scheme: dark)")` and
listens to its `change` event.

## The switch

```tsx
// src/features/settings/ThemeSwitch.tsx
import { RadioGroup } from "../../components/ui/RadioGroup";
import { setTheme, useTheme } from "../../lib/theme";

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

/** Light, Dark or System, kept on this device. A RadioGroup: nothing goes to the server (rule 16). */
export function ThemeSwitch() {
  return <RadioGroup label="Theme" options={THEMES} value={useTheme()} onValueChange={setTheme} />;
}
```

The `RadioGroup` wrapper is in [tabs-toggle-group.md](tabs-toggle-group.md).

## Where the rule bends

Each is a `conventions.json` exception for rule 14, with its reason, so a
reviewer finds it:

- **atrium** keeps its per-profile sync and its sepia theme: the choice is
  kept where atrium keeps its other settings.
- **3D-sandbox's Solstice** keeps its dark default (the convention for 3D
  editors) and gets the switch.
- **Ward's console** stays dark only, so it always reads as the admin side;
  its sign-in pages get the switch.
- **The client sites** (presentation-sites' auto-service, saloon, subcort
  and tractari) and **Churchix's parish sites** keep the one look designed
  for each, with no switch.

## Adapt to the app

- The storage key (`theme`) is the app's; an app with other display
  settings keeps them together, as Postern does.
- The labels read Light, Dark and System everywhere, so the estate's apps
  agree.

## Tests

- Light and Dark pin the root's computed `color-scheme`; System follows a
  live change of `prefers-color-scheme`.
- A first visit with the system in dark mode shows light.
- A stored choice survives a reload with no flash (Playwright: the first
  screenshot after load already has the stored theme).
