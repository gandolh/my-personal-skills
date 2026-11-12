---
title: house-style findings from the server wave
created: 2026-11-12
status: open
tags: [house-style]
---

# house-style findings from the server wave

The 17 server moves (brief 16) ran `check-structure` and dependency-cruiser
from house-style 1.2.0 and found the gaps below. None is fixed here: this
todo is the input for a house-style release brief (1.3.0), which changes
`house-style/` and re-syncs the adopters. The skill side of each finding is
already in `code-structure`, so a release only has to match it.

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

## Sources

Each repo's done server brief outcome note, in its own corpus (for example
ward-auth 06, atrium 04, satchel 04, newspapper 11, sports-app 04), and the
findings of the controller's build ledger. The matching changes to the skill
are in v0.43.0.
