---
summary: Estate-wide facts found while writing the repo-local brief sets on 2026-11-10 (mini-projects, atrium, comercial-website, public-resource-map, sports-app, ro-housing, 3D-sandbox and later sets): lint, tsconfig, Tailwind layering, Fastify and zod traps, each with its repo and evidence. Read before revising briefs 02, 03, 16 or 27.
updated: 2026-11-10
---

# Facts from the repo briefs of 2026-11-10

These are estate-wide facts the repo-local brief sets of 2026-11-10 found,
added to the Round 8 facts on
[open-questions-from-the-repo-briefs.md](open-questions-from-the-repo-briefs.md).
No decision is needed. Each one lands in the skills library's brief 02, 03,
16 or 27 when those are revised.

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

From sports-app, ro-housing and 3D-sandbox:

- **Rule 3 can pass for nothing.** When the whole UI tree is a `ui/` folder
  (sports-app's `client/src/ui/`), "Base UI only under `ui/`" checks nothing.
  The checker tests for `components/ui/`.
- **A TypeBox contract.** sports-app's `shared/api.ts` is TypeBox, not zod;
  the server brief keeps it. The zod rule needs a "or the repo's existing
  schema library" clause.
- **A repo can gitignore `.claude`** (ro-housing), which would leave
  `.claude/rules/` untracked.
- **Node's type stripping needs `.ts` import suffixes.** The house's `.js`
  suffixes don't resolve against `.ts` files without a build. ro-housing's
  `.ts` suffixes are the form that runs.
- **Two npm projects with no root `package.json`** (ro-housing's `api/` and
  `web/`) give the `Stop` hook no `check:fast` to find. They get a
  scripts-only root.
- **TypeScript 6.0.3 stops auto-including `@types/*`.** A package needs
  `"types": ["node"]` (3D-sandbox's `packages/geometry`).
- **`@vitest/eslint-plugin` 1.6.28 wants TypeScript 6** as an optional peer,
  so `npm` refuses on 5.x until the TypeScript bump.
- **Leaving Biome loses `organizeImports`.** `simple-import-sort` would
  reorder 105 files in 3D-sandbox. Biome's `useButtonType`,
  `noDangerouslySetInnerHtml` and `noAutofocus` carry over as
  `no-restricted-syntax` selectors and `jsx-a11y`.
- **`consistent-type-imports`** needs `disallowTypeAnnotations: false` for
  `typeof import("./X")` lazy-chunk types.
- **A default export can be a runtime contract** (3D-sandbox's scene modules
  read `mod.default`), so `no-default-export` takes a glob exception.
- **React compiler rules** in `react-hooks` 7.1.1 fire on "mirror state into
  a ref during render" (18 times in 3D-sandbox). The house has no rule for
  that pattern yet.
- **`logger: false` turns `app.log.error` into a no-op**, so a server that
  says it logs 500s may log nothing.
- **Config that fails silently:** an empty list variable gives `[]` (CORS
  silently off), and `PORT=abc` gives `NaN`. `config.ts` parses with zod.
- **Proving a response schema changes nothing:** serialise every fixture
  through the zod type provider and compare bytes with `JSON.stringify`
  (byte-identical for 3D-sandbox's three scenes).
- **Biome's width is the least-churn width** for a Biome repo (110 in
  3D-sandbox: 36 lines, against 783 at 120). The estate width stays 120.
