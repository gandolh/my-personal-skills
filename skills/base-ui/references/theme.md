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

## What the builds found

Every app moved to this switch on 2026-11-11 and 2026-11-12. Checked in a
scratch folder (`lightningcss`, jsdom, Tailwind 4.3.5) where it says so.

- **`color-scheme` is set from `data-theme` in the same stylesheet as the
  tokens.** For browsers older than Chrome 123 the build rewrites
  `light-dark()` into `--lightningcss-light` and `--lightningcss-dark`
  variables that the `color-scheme` rules in that sheet switch, and a
  `color-scheme` set from JS or another file doesn't switch them (mini-projects'
  dry run; re-run: the rewrite is there, `:root[data-theme="dark"]` flips the
  pair). It works inside a shadow's colour components too (Lantern).
- **A second form fits an app whose palette is already roles.**
  comercial-website (Material 3 roles) and SocialEvents (plain values) keep
  the light roles as they are and redefine them under
  `:root[data-theme="dark"]`. Then `data-theme` is only `light` or `dark`: the
  store resolves System with `matchMedia` (and listens to its `change`), and the
  boot script resolves it before the first paint. The cost is one more thing to
  keep equal: a test reads the script, the store and the stylesheet and checks
  they agree on the page colour. Where a role pairs in a way stock Material
  doesn't (`bg-primary` hovering to `bg-primary-container`, `on-primary` text
  on a container), the dark container is the lighter one.
- **`theme-color` follows the choice, or it doesn't, on purpose.** The store
  above never moves the meta tag. Lantern and comercial-website keep one
  `<meta name="theme-color">` set by the boot script and by the store (also on
  a System change) and test that `THEME_COLOR`, the script's colours and the
  stylesheet's page colour are equal. Postern and Shelfmark left
  the metas and the manifest colour alone, so the phone's bar follows the
  system, not the switch. Choose one and say which.
- **System stored on one device and nothing stored on another differ.** A
  device that chose System before the key existed has no stored value, so it
  shows light once (sports-app); say so in the outcome note.
- **A "set before first paint" observer watches `document`,** with
  `subtree: true`, not `<html>`: an init script runs before `<html>` exists
  (Postern's e2e).
- **The boot script** is inline in `index.html`, which the estate's
  Content-Security-Policy allows (it sets only `frame-ancestors` and
  `object-src`). Postern serves it as `theme-boot.js` under `script-src
  'self'` and lists it in the service worker's precache. A `script-src` added
  later needs the hash, or the script moved to a file (ward-auth's note).
- **Greps and tests that look for `prefers-color-scheme`** find the store's own
  `matchMedia` call and the `@custom-variant dark` system branch. An
  acceptance grep says where it expects them (wicket, comercial-website).
- **Tests of the stylesheet** read the source with `fs`, or import
  `index.css?inline` under vitest's `test.css.include`; `?raw` gives an empty
  string or the compiled file, and Tailwind drops roles no class uses
  (comercial-website, newspapper). [conversion-traps.md](conversion-traps.md)
  has the recipe.
- **A fourth button wraps.** atrium's header gained System beside Light, Dark
  and Sepia, and at 390 px the four no longer fit one row: the cost of the
  new choice, not a regression.
- **The switch inside a menu** is a dialog the menu opens
  ([menu.md](menu.md)); on a page with room (an account page) it is the
  `list` look, and in a 36 px footer the `segmented` look
  (mini-projects).
- **Contrast,** per theme: text 4.5:1 and a control 3:1, held by a test over
  the pairs (comercial-website's 18, Shelfmark's `tokens.test.ts`). The runs
  found ro-housing's light `accent` on `accent-soft` at 3.9:1 and
  SocialEvents' focus ring at about 1.7:1; both were raised, and SocialEvents
  keeps seven light pairs as recorded floors until its redesign.

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
