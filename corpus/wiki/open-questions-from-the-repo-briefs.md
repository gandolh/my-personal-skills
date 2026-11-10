---
summary: The estate-wide questions and facts that the repo-local briefs of 2026-11-09/10 raised (Almanac, Satchel, the-board, Newspapper, wicket, Shelfmark, Postern, lantern, ward-auth), grouped by theme, for the owner's grilling. They add to open-questions.md (Q1-46). Each answer lands in the skills library's brief 02, 03 or 27, then in each repo's brief.
updated: 2026-11-10
---

# Questions from the repo briefs (Round 8)

These are cross-repo questions and facts. Each repo's own questions are in its
briefs, under "Owner decisions". The numbering continues from
[open-questions.md](open-questions.md).

## Facts to fold into the skills-library briefs (no decision needed)

- **The zod type provider.**
  - Its serializer throws on any `.transform()` in a response schema. This
    hits Almanac (`occurrenceSchema`) and Shelfmark (`savedViewSchema.state`).
  - It also resolves a second zod copy (the-board), so a root `overrides`
    entry dedupes it.
- **A declared status becomes a 500.** If a response schema declares a status
  the handler doesn't send itself (a guard's 401), that reply becomes a 500
  (wicket). Declare only the statuses each handler sends.
- **`connectionTimeout` cuts long responses:** wicket's 25 s long poll,
  lantern's 26 s record route, ward-auth's slow SMTP. Set it per repo.
- **The `.parse(request.` regex misses helper parsing:** wicket has 5 such
  sites and lantern 13. The structure checker needs a better test than
  grep.
- **Env loaders fail quietly.** Copied `REPO_ROOT` and env loaders swallow
  ENOENT, so a moved file silently drops `.env` (Shelfmark, lantern). The
  server brief centralises them in `config.ts`, which fails loudly.
- **`npm test` fails on a fresh clone** without a prior build in Satchel, the
  Board, Shelfmark and lantern. Every repo gets a `pretest`.
- **Newspapper's tsconfigs exclude its tests,** hiding 117 errors: an
  eleventh "green because nothing ran".
- **`erasableSyntaxOnly` costs parameter properties:** Satchel has 10 and
  wicket 3. Brief 27 said the house had none.
- **Unlayered legacy CSS beats Tailwind's utilities,** so a migration imports
  all old CSS into one `layer(legacy)` and empties it file by file
  (Postern's method, which the estate should adopt).

## Lint strictness

47. **Non-null `!`** is an error in source and a warning in tests. The
    counts: the-board 65, Shelfmark 123, Postern 536 (454 of them in tests),
    wicket 58 (51 in tests), Newspapper 187 in tests. Agree?
48. **`switch-exhaustiveness-check`** with `considerDefaultExhaustiveForUnions:
    true`? It takes Shelfmark from 7 findings to 0, and all 4 of wicket's are
    open unions.
49. **React components with default exports** (Newspapper has 46 files):
    allowed, or move to named exports?
50. **`noUncheckedIndexedAccess`** where it is off (Newspapper: 139 errors in
    source and about 270 in tests): adopt now, or defer?

## Formatter width (refines Q8)

51. **One estate width, or a width per repo?** The least-churn widths
    measured were:

    | Repo | Least churn | Detail |
    |---|---|---|
    | Almanac | 130 | about 1.3% |
    | wicket | 130 | 0.8% |
    | the-board | 150 | 7.3% at 130 |
    | Postern | 180 | at least 160 files change at any width |
    | Newspapper | 100 | its current width |

    Default: one width (120 or 130), with the reformat commit accepted as a
    one-off.

## Server structure

52. **Validation before authorisation.** Route schemas validate before the
    owner checks run, on three of Satchel's routes. Accept that?
53. **Streams and binary routes** (Newspapper has 7 streams, lantern has
    posters): exempt from response schemas, with a `conventions.json`
    entry?
54. **A big `store.ts`:** split it by feature, or keep it whole in `db/`?
    Satchel's has 24 methods and one transaction across 3 tables, and the
    Board's tickets and runs import each other's stores. Default: keep it
    whole.
55. **Where do zod schemas live** in a repo with no `shared/` (Newspapper):
    a new `shared/`, or in `api/`?
56. **The `ApiError` class, and decorators as a test seam:** keep or drop?
    Can a feature's CLI live beside the feature?

## Base UI and Tailwind

57. **An always-one-chosen filter:** `RadioGroup`, or a guarded
    `ToggleGroup`? This recurs in Almanac, Newspapper, lantern and wicket.
58. **Inline confirms** (Satchel, Shelfmark): move to `AlertDialog`? And do
    form dialogs get `disablePointerDismissal`?
59. **Where the wrappers live** in a repo with feature folders (Postern):
    still `components/ui/`?
60. **A DOM test environment** for Base UI behaviour (the-board, wicket), or
    only Playwright checks?
61. **The small-tools family's token names:** `bg-bg` and `text-text`, or
    `page` and `ink`? Does a family name promise a value, or only a role?
    Does the family use width 150?
62. **A named type scale** (Satchel uses 13 sizes), a `phone` custom variant
    for "≤640" breakpoints (Tailwind's `max-sm:` is `<640`), and
    `data-testid` for class-based test selectors (Postern has 60)?

## Facts from the 2026-11-10 sets (no decision needed)

From mini-projects (`literally-a-todo-app`):

- **A schema stricter than the handler breaks the client.** The todo `PATCH`
  accepts `completed` as `0 | 1 | boolean` and the frontend sends `0 | 1`, so
  a `z.boolean()` would refuse every tick. Route-schema steps check each
  client's real payloads first.
- **Inline styles are a second layering trap.** An inline `style` beats every
  layer, so one component can't mix old inline styles and new utilities. Move
  each component whole, one per commit.
- **`hover:` only applies under `(hover: hover)`** in Tailwind v4, so
  controls revealed on hover vanish on touch screens. Use
  `[@media(hover:none)]:` and `group-focus-within:` for them.
- **Material Symbols ligatures are read aloud.** An icon-only button
  announces `keyboard_arrow_up`. The glyph needs `aria-hidden` and the button
  an `aria-label`.

From atrium:

- **`node:test` and typed lint.** `no-floating-promises` fires on every
  `describe`/`it` (814 times in atrium) unless `allowForKnownSafeCalls` names
  them.
- **Q47 and Q50 interact.** With `noUncheckedIndexedAccess` off,
  `no-unnecessary-type-assertion` flags most `!` as unneeded (608 findings in
  atrium). Turning the flag on makes them needed again.
- **Workspace names differ.** atrium's workspaces are `apps/api`, `apps/web`
  and `packages/shared`, so the skills' path rules need a mapping, not fixed
  `server/ web/ shared/` paths.
- **Hand-parsed replies.** atrium's controllers `schema.parse()` their replies
  by hand in at least 14 places; response schemas replace them.
- **Import-time config.** Config read as import-time constants, with a test
  setup that depends on them, makes a `loadConfig(env)` factory a large
  change. The code-structure skill should allow import-time config.
- **Layered modules break the feature rule.** atrium's modules reach into
  each other in 24 places, with three cycles, so "reach another feature only
  through its `index.ts`" needs a cycle-breaking step or recorded exceptions.

From comercial-website:

- **A missing `strict`.** `frontend/tsconfig.app.json` has no `strict`, and
  adding it costs 0 errors. Every repo's harness brief checks for it.
- **An old TypeScript pin blocks the flags.** The backend is on TypeScript
  5.7.3, which predates `erasableSyntaxOnly` (5.8), so the TypeScript bump
  comes before the flag.
- **Fastify's own 4xx answer 500.** An error handler with no `statusCode`
  branch turns bad JSON or an oversized body into a 500. Other servers that
  copied the shape likely have the same bug.
- **A plugin library reads env.** `backend/core` reads 10 variables at module
  load. A shared library should take its config as plugin options.
- **zod 4's messages differ.** A handler that sends the first issue's message
  to users shows new text after the move to zod 4.
- **Upload routes and `requestTimeout`.** A request timeout cuts a large
  upload (500 MB multipart here), so upload routes keep it at 0 or raise it.
- **Unlayered CSS beats utilities even in a Tailwind repo.** An unlayered
  `.material-symbols-outlined { font-size: 24px }` beats every `text-*`
  utility, which is why 31 sites carry an inline `fontSize`.
- **A `render` function that wraps the caller's button** in a `span`
  (`Dropdown.tsx:37`, `Tooltip.tsx:15`) breaks rule 9, and the checker should
  catch it.
- **Third-party widget libraries** (`sonner` for toasts) count as widgets
  Base UI replaces, behind a wrapper with the same call shape (technical
  call, 2026-11-10).

From public-resource-map:

- **No error handler at all.** With no `setErrorHandler`, Fastify's default
  puts a thrown error's message in the reply, so the error rule fixes a leak.
- **`safeParse(req.…)` hides from the regex too.** 14 sites in 7 files, and
  the `.parse(request.` grep finds none of them.
- **`await-thenable` flags awaits on Drizzle's synchronous better-sqlite3
  calls** (58 here). Removing them changes nothing. Expect it in every Drizzle
  plus better-sqlite3 repo.
- **`vitest/valid-expect`** needs `maxArgs: 2` for `expect(x, "message")`.
- **`e2e/` and `playwright.config.ts` sit outside every tsconfig,** so typed
  lint fails to parse them until a tsconfig covers them.
- **`eslint-plugin-better-tailwindcss`:** only its unknown-class,
  deprecated-class and class-order rules are worth turning on (412
  logical-property and 194 line-wrapping findings were noise).
- **Prettier's ignore list** needs each repo's frozen fixtures, generated meta
  JSON and any stylesheet still in `layer(legacy)`.
- **An unlayered `:focus-visible`** with a `border-radius` overrides every
  `rounded-*` utility.
