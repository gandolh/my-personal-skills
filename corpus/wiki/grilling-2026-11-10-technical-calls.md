---
summary: The technical calls made by convention for open questions Q1-62 on 2026-11-10 (formatter, lint, tsconfig, Base UI, Tailwind tokens, server structure, library order), each with its reason, for the owner to overrule. Read with grilling-2026-11-10.md before revising a brief.
updated: 2026-11-10
---

# The grilling of 2026-11-10: technical calls

Decided by convention on 2026-11-10. The owner may overrule any of them. The
owner's own answers are on [grilling-2026-11-10.md](grilling-2026-11-10.md).

The owner's standing rule since 2026-11-09: technical calls are the agent's,
decided by convention and reported after. Taste goes to the owner. These are
the defaults kept, or changed (marked **changed**), for every question not
answered above.

- **Q1** Leave the deploy alone. It runs no tests or lint today. The `Stop`
  hook and `npm run check` are the gate. **Q2** dwh-finance stays out of
  scope: a finished university project.
- **Q5** Shared tooling, no shared UI.
- **Q6 changed:** `house-style` is **vendored**, not a git dependency. Each repo
  holds a copy with a version header, refreshed by a `house-style:sync` script
  that finds the checkout by name, the way Ward's library and the imbatranim
  kit are shared today. A git dependency would need git (or SSH) inside every
  Docker build, because npm locks GitHub dependencies as git URLs.
- **Q7** The Claude Code layer lives in the plugin: `Stop` runs `check:fast`,
  `PostToolUse` formats the saved file.
- **Q8 and Q51** Prettier, one estate width: **120**. It had the least churn
  in atrium and public-resource-map, close to the least in Almanac and wicket,
  and is a common convention. The small-tools family uses it too (Q61).
- **Q9** The outliers move to double quotes and semicolons in their one
  reformat commit.
- **Q10** `check:fast` is a typecheck plus ESLint on the changed files, built
  incrementally (`tsc -b`). Target 15 s. Up to about 30 s is accepted where
  `tsc` alone is slower.
- **Q11** `verbatimModuleSyntax` and `erasableSyntaxOnly` now (parameter
  properties become fields), `exactOptionalPropertyTypes` after a count. A
  TypeScript older than 5.8 is bumped first. A missing `strict` is added.
- **Q12** The six typed rules. `no-floating-promises` names `node:test`'s
  `describe`/`it`/`test` in `allowForKnownSafeCalls`.
- **Q13** The house shapes as errors. `console` is allowed in scripts and
  CLIs. A default export is allowed where a framework needs one (config
  files, route modules).
- **Q14** Comments as prose, checked by the review gate.
- **Q47** `!` is an error in source and a warning in tests. **Q48**
  `considerDefaultExhaustiveForUnions: true`. **Q49** Components use named
  exports; Newspapper's 46 move in its reformat step. **Q50**
  `noUncheckedIndexedAccess` is deferred: a later brief per repo where it is
  off, with its count.
- **Q15** Base UI is imported only under `ui/` folders; atrium's and
  Postern's feature files move behind wrappers. **Q59** Wrappers stay in
  `components/ui/` in feature-folder repos; comercial-website's
  folder-per-wrapper layout stays.
- **Q16** Native text, date and time inputs, and a native `<select>` on
  phones, stay native.
- **Q17 and Q61** Token names name a role, never a value: the small-tools
  family (wicket, the-board, lantern) converges on `surface`, `ink`, `accent`,
  `line` and `danger` (`bg-surface`, `text-ink`; no `bg-bg`). Other apps keep
  their names until their redesign.
- **Q20** Migration order as proposed: the todo app first, then wicket,
  the-board, lantern, Satchel, ward-auth, Almanac, Shelfmark, Postern,
  Newspapper.
- **Q21** A second stylesheet for ward-auth's public pages past about 5 kB
  gzipped. **Q22** lantern adopts Base UI.
- **Q41 and Q57** A filter that switches what a list shows uses `RadioGroup`
  (or `Tabs` when it switches panels): arrow keys may choose. A picker that
  **saves** on each choice uses a guarded `ToggleGroup`, so arrow keys move
  focus without saving, and one item always stays pressed.
  Clarified the same day: "saves" means a write to the server. A picker
  that only stores a choice on the device (the theme, the language) is a
  `RadioGroup`. Repo briefs that made a device-only picker a `ToggleGroup`
  (public-resource-map, ro-housing, sports-app, Shelfmark) follow this rule
  when the base-ui skill (brief 02) is built.
- **Q42** FullCalendar's CSS loads with the calendar only.
- **Q44 changed:** the root font size goes back to the browser's default and
  the app's size moves onto `body`. A pixel size on `html` overrides the
  reader's own font setting, and it skews every `rem` utility.
- **Q45** Markdown stays out of Prettier. **Q46** A short root `CLAUDE.md`
  with the commands in every repo.
- **Q60** jsdom tests only for wrappers that hold logic. Flows stay in
  Playwright.
- **Q62** A named type scale in `@theme`. No `phone` variant: Tailwind's
  `max-sm:` is used and the one-pixel edge is accepted. Tests select by role,
  and `data-testid` only where no role fits.
- **Q23** `features/<name>/`. **Q24** Typed plugin options, explicit
  registration. **Q25** A response schema on every route. Pass-through JSON
  uses a loose object. **Q53** Streams and binary routes are exempt, each with
  a `conventions.json` entry.
- **Q26** Shelfmark's "nothing boots the app" decision stands. Its server
  brief tests handlers and plugins without `inject()`.
- **Q27** atrium stays on `node:test`, vitest everywhere else. **Q28**
  sports-app's server gets converted to TypeScript in its server brief.
- **Q43** One error handler, keeping the repo's body shape. It must pass
  Fastify's own 4xx through and never echo a thrown message to the client.
- **Q52** Validation before authorisation is accepted. **Q54** A big
  `store.ts` stays whole in `db/`. **Q55** A zod schema lives in `shared/`
  when the client imports it, otherwise in its feature folder. **Q56** One
  `ApiError` class stays. No decorators as a test seam: tests pass
  dependencies as plugin options. A feature's CLI may live beside it.
- The checkers and the skills' path rules read the repo's roots from
  `conventions.json` (atrium's `apps/*`, public-resource-map's `backend/` and
  `ui/app/`), and config read at import time is allowed.
- **Q29** Release order as proposed, with 22 parked. **Q30** Yes: the
  load-bearing rules of `corpus-flow` and `plan-split-dispatch` move into
  their first 5k tokens.
- **Q31 changed:** brief 17's "ship-a-branch" becomes "finish on main", to
  match the owner's main-only flow: verify, commit, push, and never merge or
  approve a PR. **Q33 changed by Q39:** Hallmark is vendored as the design
  skill. The taste suite stays opt-in at its current pin, and
  `redesign-existing-projects` retires, since Hallmark redesigns and audits by
  path.
