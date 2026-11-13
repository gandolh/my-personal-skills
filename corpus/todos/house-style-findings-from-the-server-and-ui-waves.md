---
title: house-style findings from the server and UI waves
created: 2026-11-12
status: promoted
tags: [house-style]
---

# house-style findings from the server and UI waves

The 17 server moves (brief 16) ran `check-structure` and dependency-cruiser
from house-style 1.2.0 and found the gaps below. The UI wave (the Base UI and
Tailwind briefs of brief 04's repos, 2026-11-11 and 2026-11-12) ran
`check-base-ui` and the `better-tailwindcss` rules from the same version and
added the last two sections. None is fixed here: this todo is the input for a
house-style release brief (1.3.0), which changes `house-style/` and re-syncs
the adopters. The skill side of each finding is already in `code-structure`
and `base-ui`, so a release only has to match it. Read against the 1.2.0
CHANGELOG on 2026-11-12: none of the UI findings was fixed there.

## check-structure

- **Rule 6 reports validated input.** `fn({ x: request.body.x })`, on a route
  whose schema already validated the body, is flagged as a hand parse
  (ward-auth 06, which excepted 11 sites by hand). Ideally a call that passes a
  property of `request.body` to a function that isn't `parse`, `safeParse` or
  `validate` is not a finding.
- **Rule 6 reports a parse only the handler can do.** A `Range` header read
  against the size of the file (atrium 04) can't move into a schema; it was
  excepted with its reason. A documented way to say "this one is handler-only"
  would save the exception.
- **Rule 6 sees only literal paths.** `app.get(routes.x.path, handler)` with
  no schema isn't flagged (satchel 04), and a WebSocket route whose path is a
  constant isn't either (imbatranim-apps 10, which recorded the exception
  anyway so a future literal path stays covered).
- **An exception's `match` is a substring of the finding's message,** and a
  generic message hides every later finding in the same file that contains
  it (newspapper 11, ward-auth 06: matching the source line worked). Say
  "substring" in the README, and consider matching the source line by
  default. The skill's example had the trap.
- **There is no co-location rule,** so atrium's exception for `apps/api/test`
  and satchel's rule 9 exception for `startTestApp` name a check that doesn't
  exist (atrium 04, satchel 04). Either add the rule (tests beside their
  feature) or drop the habit of recording them.
- **`NODE_ENV` is rejected even in `config.ts`,** and inside a string.
  SocialEvents 17, public-resource-map 05 and comercial-website 13 each
  record one exception for it, and atrium dropped its `IS_PRODUCTION`. A
  refusal message that names the variable is a finding too (public-resource-map
  05). Decide whether `config.ts` may read `NODE_ENV` by name, and mask
  strings.
- **The `env` glob `**/config.ts` lets a second `config.ts` read
  `process.env` unflagged** (newspapper 11: `api/src/ward/config.ts` read it
  twice and passed by its file name). The brief-board table's count of
  environment readers was off the same way (the-board 19: two readers
  counted, four reads in two files). Anchor the glob to the server root, or
  make `env` a list of paths.

## dependency-cruiser preset

- **ward-auth added two rules** (ward-auth 06): `domain-not-to-features` (a
  domain folder, such as tokens, grants or OIDC, never imports a feature) and
  `app-through-feature-index` (`app.ts` reaches a feature only through its
  index: the preset's `feature-through-index` doesn't cover `app.ts`).
- **sports-app added a third** (sports-app 04): a plugin never imports a
  feature, because the house preset passed the brief's deliberate probe.
- **`no-circular` per folder.** Shelfmark kept it a warning for `web/` only
  (`no-circular-web`) while the server and shared made it an error
  (Shelfmark 08). A documented override that scopes a rule to a folder saves
  each repo inventing the name.
- **Domain modules have no place in the tree.** The skill's layout has
  `features/`, `plugins/`, `db/` and `lib/`; ward-auth's domain code fits none
  of them. The rules above encode the direction, but the layout and the
  checker's roots don't name it (ward-auth 06). That is a library question
  for the owner before it becomes a rule.

## check-base-ui

- **`ui` and `stylesheet` name one folder and one file per web root.** A kit
  package whose components folder isn't `components/ui` took 18 rule-3
  exceptions and two rule-5 ones for its token sheets (imbatranimOS 87), a
  UI package and an app with different stylesheets fired rule 5 on the
  package's three token sheets (churchix 04), and ward-auth records two
  stylesheets as exceptions. Let `ui` and `stylesheet` take lists, or allow a
  root to be declared twice (the second for the package).
- **Rule 6 rejects a two-colour `color-mix(` in a class** (Shelfmark 07:
  `hover:bg-[color-mix(…)]`; sports-app 03 excepted four). A named derived
  token fixed Shelfmark's, but a brief that says "keep two-colour mixes
  explicit" can't hold under the strict gate. Either allow a mix of two
  tokens (`var(--color-…)` on both sides) or say in the skill that a blend is a
  token (the skill's `conversion-traps.md` now says it).
- **Rule 7 (motion) is reported by nobody.** imbatranimOS counted 63
  `transition`, `animate-` and `data-starting-style` uses and none under
  `motion-safe:`; imbatranim-apps 20 and none. A warning on a `transition-*`
  or `animate-*` class without `motion-safe:` would make rule 7 visible.
- **Rule 9's icon-child false positive** is reported again (Postern 02 and 03:
  an icon in `Menu.Trigger` and `Popover.Trigger`, two warnings that stay).
  Skip a child that is an `svg` or an icon-font element.
- **Rule 5 counts every component stylesheet beside a wrapper** (Postern 02,
  22 findings), which is right until the Tailwind move and noisy meanwhile;
  `--warn-only` held it. No change needed unless a count per rule would help.
- **The root must hold the file at `styles/index.css`** for rule 5 to read 0
  (Wicket 12, the vendored copy); a repo that keeps `src/index.css` sets
  `"stylesheet": "index.css"` (comercial-website 12), a line the harness
  brief's template doesn't carry.

## The Tailwind lint and the UI harness

- **`better-tailwindcss/no-unknown-classes` is stricter than the repos
  expect.** It is an error in test files too, so a fixture `className="x"`
  must be a real class (Postern 03); it flags a class that is a hook only
  (`list-grid`, Postern 03) and a class defined only in `@layer components`
  for foreign markup (Newspapper 10); it flags any string used as a map key
  inside a `className` or `cn()` call (Newspapper 10); and it needs an
  `ignore` for an icon font's class and for dead plugin classes such as
  `animate-in` (comercial-website 12). The `houseStyle({ tailwind })` option
  has no pass-through for rule options, so comercial-website wrote a second
  config block that overrides it. Add `tailwind: { ignore: [...] }` and decide
  on test files.
- **The rule doesn't see everything.** It lints JSX attributes and `cn()` and
  `clsx()` calls, not a string in a bare `const` (Wicket 12, `gate.ts`), and
  not a class name passed as an argument to a helper such as
  `buttonClass(…, "x")` (Shelfmark 07: dead classes passed that way were
  missed). There is no conflicting-class rule in the house three (Shelfmark
  07).
- **ESLint lints `web/public/*.js`.** A classic script there, such as a theme
  boot script, needs `/* global document, localStorage */` and `catch {` with
  no unused binding (Postern 03). Say so in the adoption reference, or give
  `web/public` a script block with the browser globals.
- **knip prints but doesn't fail on unused exports.** Postern 03: 117 unused
  exports and 24 types, exit 0, because the preset downgrades them; imbatranimOS
  87: 159. `check:conventions` can't catch dead exports, which is a choice to
  confirm rather than a bug.
- **Acceptance greps for `prefers-color-scheme`** collide with the theme
  store's own `matchMedia` call and the `@custom-variant dark` branch
  (comercial-website 12, Wicket 12). That is a wording problem in the repo
  briefs, recorded in the base-ui skill's `theme.md`, but a check that names
  the allowed places would settle it.
- **A stylesheet test needs the Tailwind plugin and `css.include` in the
  vitest config at the root of a workspace repo,** and knip then wants
  `@tailwindcss/vite` in the root `devDependencies` (Wicket 12, Lantern 17).
  The adoption reference could carry that as a recipe beside the Playwright
  one (below).
- **Playwright in a repo without it** (Wicket 12) took a pinned
  `@playwright/test`, a config with the browser path from the environment,
  `playwright: ["web/e2e/**"]` in the house options, the e2e folder in the web
  tsconfig, `types: ["node"]` and `test-results/` in `.prettierignore` and
  `.gitignore`. House-style 1.2.0 has the `playwright` option; the recipe is
  in no reference.

## Sources

Each repo's done server brief outcome note, in its own corpus (for example
ward-auth 06, atrium 04, satchel 04, newspapper 11, sports-app 04), the "For
house-style" parts of the UI builders' findings (Postern 02 and 03, Shelfmark
07, imbatranimOS 87, comercial-website 12, Wicket 12, Newspapper 10) and the
findings of the controller's build ledger. The matching changes to
`code-structure` are in v0.43.0 and to `base-ui` in v0.44.0.

Promoted to [brief 31](../briefs/done/31-house-style-1-3-0-a-domain-root-and-the-wave-findings.md) on 2026-11-13.
