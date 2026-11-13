# Task 31: house-style 1.3.0, a domain/ root and the waves' findings

## Context

The todo
[house-style-findings-from-the-server-and-ui-waves](../../todos/house-style-findings-from-the-server-and-ui-waves.md)
lists what the 17 server moves (brief 16) and the UI wave found in
house-style 1.2.0: false positives and missed cases in `check-structure` and
`check-base-ui`, rules two repos added to their own dependency-cruiser
configs, and gaps in the docs. Its last dependency-cruiser item was a question
for the owner: ward-auth's domain code (tokens, grants, OIDC) fits none of the
layout's folders.

The owner answered it on 2026-11-13 (the backlog grill, answer 2, "go with
recommended"): the house code structure gains a `domain/` root beside
`features/`, `plugins/`, `db/` and `lib/`, ward-auth's two import rules
become house rules, and unused exports stay warnings. The estate re-sync to
1.3.0 is a separate step after imbatranimOS 89. This brief changes
`house-style/` and the skills and re-syncs no repo.

23 repos vendor house-style, so its messages are a contract: exceptions in
their `conventions.json` match message text (SocialEvents matches the whole
`NODE_ENV` sentence; satchel, sports-app and ward-auth match "(computed url)
declares no schema"). No existing message changes; a new finding gets a new
message.

## Files you OWN

- `house-style/`: `bin/`, `.dependency-cruiser.cjs`, `eslint.config.js`,
  `README.md`, `CHANGELOG.md`, `package.json`, `package-lock.json` (the
  version lines, by hand), `test/` and its fixtures.
- `skills/code-structure/` (`SKILL.md`, `references/server-skeleton.md`,
  `references/migrating-a-server.md`).
- `skills/base-ui/SKILL.md` (rule 9's enforcement cell only).
- `skills/house-style/references/adoption.md` and `recipes.md`.
- `README.md`'s version line, both plugin files, `docs/history.md`, `corpus/`.

## Files you must NOT touch

- Any other repo. Read ward-auth's and sports-app's configs; write nothing
  there. No `npm run house-style:sync` anywhere.
- The other skills, agents and hooks.

## What to do

1. **The `domain/` root** (owner, 2026-11-13).
   - The preset gains `domain-not-to-features` (`(^|/)domain/` to
     `(^|/)features/`) and `app-through-feature-index` (`app.ts` reaches a
     feature through its index only), both errors, both with
     `from.pathNot: "(^|/)features/"` so a feature's own `domain/` folder or
     `app.ts` is its own business. Only `domain/`: ward-auth's own rule also
     covers its `lib`, `db`, `plugins` and `testing`, but the skill lets
     `testing/` import a feature, and the owner named two rules.
   - A repo's same-name rule merges with the house one (dependency-cruiser's
     `extends`), so ward-auth keeps its wider `from` until it moves its
     modules under `domain/`. A test shows the merge.
   - `check-structure`'s banner and header name the new preset rules, and a
     fixture `server/src/domain/<name>/` module is checked like any server
     code. No "unknown top-level folder" finding: nobody decided one, and it
     would fire on ward-auth's six folders.
   - `code-structure` keeps 11 rules: `domain/` joins the layout and rule 7,
     and `app-through-feature-index` joins rule 5's "Enforced by". The
     skeleton's tree and a short `domain/` section say where it goes; the
     migration guide's domain bullet points at the house rules. Fix every
     line the release makes stale (rule 5's "review", "What review covers",
     the paragraph on ward-auth's and sports-app's rules).
2. **The findings that are defects,** each reproduced on 1.2.0 by a fixture
   first, then fixed:
   - `check-structure` rule 3: `NODE_ENV` inside a message string is a
     finding (strings aren't masked for it). A string whose whole content is
     `NODE_ENV` (`process.env["NODE_ENV"]`, `env("NODE_ENV")`) stays one.
   - Rule 3's default env reader is any `config.ts` at any depth, so a
     second `config.ts` reads `process.env` unflagged (newspapper 11).
     Anchor the default to the `config.*` at the top of each server or
     shared root; a nested one gets a new message. ESLint's `env` default
     stays as it is (check-structure is the stricter gate).
   - Rule 6 misses a route whose path isn't a literal
     (`app.get(routes.x.path, handler)`, a WebSocket route on a constant).
     Read a computed path on Fastify's usual receiver names only, with
     negative fixtures for `cache.get`, `store.patch`, `covers.put` and
     `http.get`, the commonest non-route calls in the estate.
   - Rule 6 flags a helper named `parse…` or `validate…` that is given a
     property of validated input (`parseRange(request.headers.range, size)`,
     atrium 04). Keep flagging `X.parse(…)`, `X.safeParse(…)`, a bare
     `parse`, `safeParse` or `validate`, and any helper given a whole
     `request.body`, `query`, `params` or `headers`.
   - `check-base-ui` rule 9 warns on an icon component as a trigger's first
     child (postern 02 and 03: lucide's `ChevronDown`). Skip a child imported
     from an icon package, or named `Icon` or `…Icon`.
   - ESLint: `houseStyle({ tailwind })` has no way to pass
     `better-tailwindcss/no-unknown-classes`' `ignore` (comercial-website
     wrote a second block). Add `tailwind.ignore`, a list of regex patterns.
3. **The findings that are docs:** `match` is a substring of the finding's
   source line or message (and the skill's example had the trap); scoping a
   preset rule to one folder (`no-circular` for `web/` only, with a test);
   `"stylesheet": "index.css"` for a repo that keeps `src/index.css`; a
   classic script in `web/public`; the vitest-with-Tailwind stylesheet test
   and Playwright recipes; `no-unknown-classes` in test files (it stays on: a
   fixture class is a real class).
4. **The rest goes to the outcome note as not done, with why:** the
   co-location rule and `NODE_ENV` in `config.ts` (the owner's, and the skill
   already says no to the second); matching the source line by default (it
   would silently un-except existing entries); per-root `ui` and
   `stylesheet` (a `conventions.json` format change); two-token `color-mix`
   (the skill says a blend is a token); a rule 7 motion warning (a new check);
   a per-rule count for rule 5 (the summary has one); Tailwind's unseen
   strings and a conflicting-class rule; knip's unused exports (the owner:
   warnings); the `prefers-color-scheme` greps (repo brief wording);
   sports-app's plugin rule (a third rule the owner's answer didn't name).
5. **Release 1.3.0:** the CHANGELOG section lists every change and what a repo
   does when it re-syncs (what may fire, what it can delete), `package.json`
   and the lockfile at 1.3.0, the plugin at 0.53.0 in both plugin files, the
   README line and `docs/history.md`. Tag the release commit
   `house-style-v1.3.0`, annotated with `house-style 1.3.0` as 1.2.0 was,
   locally; never push it.
6. **Dry-run, read-only,** against ward-auth and sports-app: the 1.3.0
   checkers beside the vendored 1.2.0 ones, and dependency-cruiser through a
   scratch config that extends the new preset and repeats each repo's own
   rules. Report what would fire.

## Acceptance

- `npm test` in `house-style/` passes, with a fixture that failed on 1.2.0
  for each defect fixed, and every new fixture registered in its case table.
- `node --test` on the repo's other `*.test.mjs` files (fixtures excluded),
  `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass.
- No existing checker message changed.
- `house-style/package.json` says 1.3.0; the plugin is 0.53.0 in every place;
  the tag `house-style-v1.3.0` points at the release commit and is not pushed.
- The outcome note lists the dry-run's findings and every finding not done.

## Outcome (2026-11-13, house-style 1.3.0, v0.53.0)

Built. Commits 5f214c0, a80bded, 8fe267d, 706de0e, 67dc016, 8620c67,
81324b8 and 24f5df3. The tag `house-style-v1.3.0` is annotated and points at
the release commit, 24f5df3. It is local only. It was made once on an
earlier release commit, then deleted and made again after two fixes, never
pushed.

- **`domain/`.** The preset gains `domain-not-to-features` and
  `app-through-feature-index`, both with `from.pathNot: "(^|/)features/"`.
  A test shows that a repo's same-name rule replaces the preset's `from` and
  `to`: ward-auth's own rules keep working as they are. A second test runs a
  rule scoped to one folder.
- **What check-structure knows of `domain/`.** Its banner names the new
  rules, and a `domain/` fixture is checked like any server code. There is
  no unknown-folder finding.
- **code-structure.** It keeps 11 rules: `domain/` is in the layout and in
  rule 7, and `app-through-feature-index` is in rule 5.
- **Defects fixed, each reproduced on 1.2.0 by a fixture first:**
  - rule 3 read `NODE_ENV` inside a message, quoted or not;
  - rule 3's default reader was any `config.ts`;
  - rule 6 missed computed paths;
  - rule 6 flagged a helper given a property of validated input;
  - rule 9 warned on an icon child;
  - `houseStyle()` had no way to pass `tailwind.ignore`.
- **Two more, found by the dry-run and the review:** NestJS's
  `app.get(ConfigService<Env, true>)` read as a route, and a quoted
  `'NODE_ENV'` inside a message read as `NODE_ENV`.
- **Docs:** `match` is a substring of the line or the message, and the
  skill's example had the trap. Four recipes in the house-style skill: a
  rule scoped to one folder, a script in `web/public`, a stylesheet test with
  Tailwind, and Playwright. `"stylesheet": "index.css"` is in the adoption
  reference. The decision is in `wiki/decisions.md`.
- **Dry-run, read-only.** The checkers ran on 21 adopters and the preset on
  20 of them, each with its own rules and options. A re-sync fires:
  - wzd_auth: `api/src/oidc/interaction.ts:115, 182, 197`, three GET routes
    on `` `${INTERACTION_INTERNAL_PREFIX}/…` `` with no schema;
  - imbatranim-apps: three `app-through-feature-index` errors from
    `server/src/app.ts`.

  It clears postern's two rule-9 warnings and imbatranimOS's
  `files.controller.ts:137` finding. atrium's `parseRange(` exception and
  part of comercial-website's `NODE_ENV` exception go unused. sports-app
  changes in nothing, and its `client/src/domain` passes. game-engine's
  preset run didn't start from a scratch config. ESLint was not dry-run:
  its one change is opt-in.
- **Not done, with why:**
  - A co-location rule for tests: a new rule is the owner's call.
  - `NODE_ENV` in `config.ts`: the skill's rule 3 already says no.
  - Matching the source line by default: it would silently un-except
    existing entries.
  - Per-root `ui` and `stylesheet`: a `conventions.json` format change.
  - A two-token `color-mix`: the skill says a blend is a token, and four
    exceptions are not a reason to loosen.
  - A rule 7 motion warning: a new check, with more than 60 warnings in
    imbatranimOS.
  - A per-rule count for rule 5: the summary already has one.
  - Tailwind classes in a bare `const` or a helper's arguments, and a
    conflicting-class rule: plugin reach, and a new rule.
  - Failing on knip's unused exports: the owner said they stay warnings.
  - A check naming where `prefers-color-scheme` may appear: it is wording
    in the repo briefs.
  - sports-app's plugin rule in the preset: the owner's answer named two
    rules. It is asked on the board.
- **Deviations:**
  - The skeleton got a prose `domain/` section, not a compiled block. Its
    claim that the checks report nothing rests on reading `app.ts`'s four
    imports, not a re-run.
  - base-ui changed beyond rule 9's cell: SKILL.md's rule 9 bullet and
    `tooltip.md` and `combobox.md` called the icon child a false positive.
  - The house-style skill's sync example now names v1.3.0.
  - `zod-type-provider.md` and `migrating-a-server.md` described 1.2.0's
    rule 6 as current.
  - The board refused the tag change from `tracker` to `harness` (exit 2,
    its server takes no tag changes yet).
- **Checks:**
  - house-style `npm test`: 259 of 259 pass.
  - The other 11 test files: 81 pass, and the 11 Hallmark capture tests
    skip without a browser.
  - `check-skills.mjs`, `corpus/lint.sh` and `prettier --check` exit 0.
  - `measure.mjs`: code-structure is 264 lines, cut at line 109, after its
    rule table.
- **Owner steps:**
  - Push main with the tag.
  - Update the plugin to 0.53.0.
  - After imbatranimOS 89, re-sync the estate with the CHANGELOG's 1.3.0
    steps.
