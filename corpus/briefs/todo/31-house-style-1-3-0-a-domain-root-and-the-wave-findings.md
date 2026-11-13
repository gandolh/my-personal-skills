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
