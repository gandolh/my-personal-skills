# Conversion traps

Where Tailwind 4 differs from the CSS being converted, and the tools and tests
that caught it. The estate's apps moved to Tailwind on 2026-11-11 and
2026-11-12, in Q20's order (the todo app, wicket, the-board, lantern,
Satchel, ward-auth, Almanac, Shelfmark, Postern, Newspapper); the apps
already on it took the Base UI briefs. Each trap names the repo that hit it. Read this beside
[migrating-from-plain-css.md](migrating-from-plain-css.md), which is the order
of work; this page is the lookup.

Checked on `tailwindcss` 4.3.5 on 2026-11-12: every compiled claim below was
built in a scratch folder with `compile()` from `tailwindcss`, and the
`light-dark()` one with `lightningcss`.

## What Preflight removes

Beyond heading sizes, list bullets and button backgrounds, each of these came
up as a visible difference after step 2:

- **Paragraph margins, `dl` and `dd` margins, list padding** (Lantern,
  Postern, Shelfmark's book page). Put back in `@layer base` only what the
  page relied on; a component with a class beats a global.
- **Link colour and underline** (Lantern, Postern): restore both, or give each
  link the class.
- **`::placeholder`** becomes 50 percent of the text colour (Lantern).
- **A checkbox's and radio's browser margin** (`3px 3px 3px 4px`). Restoring
  it in `@layer base` shifted every label row of Postern's menus, so decide
  per control.
- **An `img` is no longer inline.** The composer's editor body needed
  `display: inline` back (Postern).
- **`[hidden]` is already `display: none !important`,** so a `[hidden]` rule
  goes (Postern).
- **Heading sizes with no entry in the type scale.** Wicket's plain `h2`
  (21 px, a 0.83em margin) matched nothing in the named scale and needed
  `--text-page-title`. The scale audit of the old CSS covers browser-default
  sizes (`h1` to `h3`, `small`), not only declared ones. The way to tell a
  reliance from drift is the screenshot pair after step 2: whatever moved is
  Preflight's.
- **An app that imports Tailwind without Preflight** (Newspapper's reader)
  gets `border-dashed` on all four sides, so the other three take the default
  3 px width. Write `border-t [border-top-style:dashed]`.

## Utilities that aren't what the old CSS said

- **`grid-cols-N` is `repeat(N, minmax(0, 1fr))`,** not `repeat(N, 1fr)`; it
  changes widths when content is wider than its share (Lantern's picker). Use
  `grid-cols-[repeat(N,1fr)]` where the old rule said `1fr`.
- **`hover:` applies only under `(hover: hover)`.** A tap no longer leaves a
  hover tint behind (the-board, Almanac and Shelfmark each listed it), and a hover-only control needs `group-focus-within:` and
  `[@media(hover:none)]:` to show on touch (the todo app's row actions).
- **State order is not the old file's order.** Tailwind emits `hover:` first,
  then `focus:`, then `aria-*:`, then `data-*:`, so `data-unread:bg-row`
  beats `hover:bg-row-hover` where the old CSS put hover last. Write
  `hover:data-unread:bg-row-hover`, and `aria-selected:bg-row-selected!` where
  the old rule won over everything (Postern).
- **A container variant beats `max-sm:` at equal specificity,** since
  `@container` sorts after media. Where the phone rule used to win, write the
  container rule as `min-sm:@max-[46rem]/list:…` so it never reaches a phone
  (Postern).
- **`translate-*` and `scale-*` use the `translate` and `scale` properties,**
  not `transform`. `transition-[transform]` doesn't cover them, so a transition
  uses `[transform:…]` (Shelfmark), and an element a script moves with an inline
  `transform` needs its start position as `[transform:translate3d(…)]`
  (Newspapper).
- **A closed spacing scale (`--spacing: initial`) drops `inset-0`, `p-0` and
  `m-0`.** Add `--spacing-0: 0px` (Newspapper: the modal backdrop, crop marks
  and a tissue corner vanished; the pixel compare found it). Likewise
  `--tracking-*: initial` drops `tracking-normal` (use
  `[letter-spacing:normal]`); weights survive a cleared `--font-*`.
- **`--height-*` makes `h-*` and `min-h-*`; `--size-*` makes only `size-*`.**
  `h-touch` from `--size-touch` generates nothing (Almanac found it from a
  missing 36 px toggle on a phone): write `h-(--size-touch)`, or name the
  token `--height-touch`. `--z-nav` makes no utility either; the namespace is
  `--z-index-*` (comercial-website's briefs wrote `--z-nav`).
- **A bare opacity modifier is a mix with `transparent`,** not with the
  surface: `bg-ok/12` is `color-mix(in srgb, #080 12%, transparent)`. A wash
  that mixed two tokens is its own named token (`--color-ok-wash`; Wicket).
  `color-mix(` stays out of class strings (rule 6), so a derived colour is a
  variable beside the palette in `@layer base` and the class reads it:
  `bg-(color:--label-chip-bg)`, `fill-[var(--label-fill,transparent)]`
  (Postern). A modifier such as `hover:bg-on-inverse/12` compiles to
  `color-mix` by itself and passes. A mask's data URL is a variable too
  (`--mask-mark`, used as `before:[mask:var(--mask-mark)_center/contain_no-repeat]`).
- **`light-dark()` takes colours only.** A shadow with a dark variant puts
  `light-dark()` inside its colour components (Wicket, Lantern). Both
  survive the build when `color-scheme` is set from `data-theme` in the same
  sheet ([theme.md](theme.md)).
- **`[font:inherit]` plus `font-semibold` is order-dependent;** the shorthand
  resets the weight. Preflight already makes buttons and inputs
  `font: inherit`, so drop the shorthand (Postern).
- **Breakpoints that aren't Tailwind's.** `max-sm:` is 640 px; the-board's
  600 and 1100 px, ward-auth's 60rem console and Satchel's 900 px are not
  within a few pixels. Declare the edge (`@custom-variant phone`,
  `--breakpoint-console`) and, where JavaScript reads the same number, a test
  that keeps the two equal (Satchel's `WIDE_QUERY`). Within a pixel,
  `max-sm:` is right (ward-auth's `max-console:` is one pixel off its old edge,
  accepted under Q62).

## Class names that code depends on

- **A class used by script breaks silently when the class goes.** Grep
  `querySelector`, `closest` and `matches` in non-test code for every class
  you convert, and move the hook to a `data-` attribute. Postern's
  `NavDrawer` read `.nav-drawer-content` for its `initialFocus`; Shelfmark
  moved four behaviour hooks (`data-chip-remove` and three more). A class kept
  only as a marker (ward-auth's `.wc-main`, which `focus-after-write.ts`
  finds by `.wc-main h1`) is a recorded decision, not an accident.
- **Marker classes with no rule** (`has-selection`, `sheet-peek`, `map-fallback`
  in public-resource-map) are not Tailwind's; the unknown-class lint ignores
  them by name.
- **`in-data-[x=y]:` replaces a named `group`** for "an ancestor has this
  attribute" (`.shell[data-nav=rail] .x`): one variant on the child, no class
  on the ancestor. `has-checked:` and `has-focus-visible:` replace
  `:has(.input:checked)`, and `group/name` with `group-hover/name:` replaces
  `.a:hover .b`. Stacked variants read left to right as outer to inner:
  `aria-expanded:[&_.icon]:rotate-90` is `.x[aria-expanded] .icon`; compiled
  and checked in both scratch runs.
- **A descendant-selector rule becomes a small component,** not an `[&_td]:`
  variant on every parent (Wicket's `Table` and `Facts` replaced
  `.table th` and `.facts dd`), except a one-off such as
  `[&_tbody_tr:last-child_td]:border-b-0`.
- **Shared classes move first.** `.button`, `.muted`, a base card used across
  areas: a class converted last loses to the classes already converted,
  because the codemod appends it last (Postern: `chip`'s `text-sm` landed
  over `list-chip`'s `text-xs`). Grep each class's uses before deleting it
  (Lantern). Convert shared classes first, or put their utilities before the
  existing ones. A component that carries a repeated look is a Base UI
  `Button` wrapper with a `looks.ts` beside it.

## `cn()` and tailwind-merge

- **A later `text-*` removes an earlier `leading-*`** by default, because a
  Tailwind size sets a line height. An app whose sizes carry no line height
  overrides it (`override.conflictingClassGroups: { "font-size": [] }`; the
  todo app's, the-board's), or `cn("leading-none", "text-tick")` loses the
  `leading-none`. Measured: the default drops it, the override keeps both.
  An app that holds pixel parity with old CSS that depended on the default
  keeps the default (imbatranimOS: 14 classes carry both), and says so.
- **Every new token name goes into `cn()`'s lists,** a `container` name
  (`max-w-page`, or `md:max-w-none` doesn't replace it; Shelfmark) and a
  custom `@utility` group (`extendTailwindMerge<"wdth">`; Newspapper)
  included.
- **A `cn()` around something that isn't a class list** (a `join(" ")` of
  text) is a bug a regex pass can introduce (Shelfmark).
- **A shared kit that sets `--spacing` and `--text-*` in `@theme static`**
  hands them to every consumer (imbatranimOS's kit): say so in the Q44 recipe.
  `@theme static` also keeps every variable a `legacy` sheet, a raw-CSS
  reader or a lazy route's sheet reads; without `static` Tailwind emits only
  the variables a utility uses (verified).
- **tailwind-merge costs about 9 kB of JS, gzipped** (comercial-website,
  Postern, the todo app). Log CSS and JS sizes before and after.

## Tests that survive the move

- **Specs select by role and name, never by class or inline style.** Rewrite
  the ones that don't before converting (Postern had 60 class selectors; the
  todo app's drag spec used `.todo-row`). Where a page's own `<section
  aria-labelledby>` matches `getByRole("region")`, filter it with
  `.filter({ hasNot: page.getByRole("region") })`, and scope attachments under
  `getByRole("article")` where `getByRole("listitem")` also matches the
  message's outer `<li>` (Postern).
- **Run the specs under the dev server `playwright.config` starts,** not a
  `vite preview` left on the same port: one todo-app spec passed only against
  the build.
- **A stylesheet test** has three recipes. (1) Import `./index.css?inline` with
  `test.css.include: [/\.css\?inline$/]` and the Tailwind plugin in the vitest
  config (the todo app, Lantern). (2) Build with `compile()` from `tailwindcss`
  (Almanac). (3) Read the source with `fs` and type the tests under
  `tsconfig.node.json` so Node types don't leak into the app
  (comercial-website, where `?raw` gave an empty file and Tailwind drops
  unused roles). Never point a `?raw` at a package CSS subpath:
  dependency-cruiser can't resolve the query against the `exports` map. Assert
  with a boundary regex, `\.name(?![\w-])`, never `toContain(".text-sm")`,
  which also matches `.text-small`. A workspace repo whose vitest config is at
  the root needs the plugin and `css.include` there, and `@tailwindcss/vite`
  as a root devDependency or knip reports it unlisted (Wicket, Lantern).
- **A repo with no Playwright** that gains one (Wicket): `@playwright/test`
  pinned, `web/playwright.config.ts` taking the browser path from an
  environment variable, `playwright: ["web/e2e/**"]` in the house ESLint
  options, `e2e` and the config in the web tsconfig, `types: ["node"]` for
  `process.env`, and `test-results/` in `.prettierignore` and `.gitignore`.
  A scratch script stands in where adding it isn't in the brief (Almanac,
  the-board, Satchel, Lantern, ward-auth): say so in the outcome note.

## Screenshots that settle parity

- **Two throwaway clones,** `before` at the brief's first commit and `after`
  at HEAD, one script, a pinned clock, seeded data. Compare with
  `pixelmatch` (threshold 0.1, or a channel difference over 24 where it
  isn't installed). **Run the same code twice first:** two identical runs at
  0 px is the control (the-board, Lantern), and it separates drift from a
  clock, a shuffled deck or a toast timer (Lantern seeds the random card).
- **Pause the clock before `goto`.** `page.clock.pauseAt(T + 1000)` after
  navigation throws "Cannot fast-forward to the past" on a loaded machine
  (Wicket).
- **A mocked API** (`page.route`, Wicket and the todo app) is deterministic,
  runs one server, and writes nothing to a database. Where the app needs a
  sign-in, a seeded local account and made-up users, never a copied `.env`.
- **Explain every pair that differs.** The recurring, intended ones: the new
  Theme row, a tap's missing hover, a few pixels under a heading, a fourth
  switch button wrapping at 390 px, a toast that now sits under the header.
  What the compare found that no one had listed: Satchel's sending and failed
  bubbles that lost their look, Lantern's grid widths, Almanac's phone
  toggles and Newspapper's missing insets.

## better-tailwindcss

The house config's three rules (unknown classes, deprecated classes, class
order) lint class strings in JSX attributes and inside `cn()` and `clsx()`
calls, not a string in a bare `const` (Wicket's `gate.ts`). A shared class
string sits in a component, a `cn()` call or a `looks.ts` export.
`no-unknown-classes` is an error in test files too (a fixture
`className="x"` must be real), flags a class that is only a hook
(`list-grid`) and a string used as a map key inside a `className` or `cn()`
call (Newspapper moved both into constants outside the call), and needs an
`ignore` for an icon font's class and for a dead plugin class such as
`animate-in` (comercial-website: both were dead classes). Run `eslint --fix`
after a codemod: the order rule's autofix sorted 101 strings correctly
(Postern).
