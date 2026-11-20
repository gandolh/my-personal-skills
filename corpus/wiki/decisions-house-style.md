---
summary: Locked calls for the house-style harness, split from decisions.md on 2026-11-20 - house-style as a library folder vendored into each repo rather than an installed package, Prettier at one estate width of 120, and the house tsconfig's erasable flags without exactOptionalPropertyTypes (all 2026-11-10), each with the alternative and the reason.
updated: 2026-11-20
---

# Decisions: house-style

Split from [decisions.md](decisions.md) on 2026-11-20, unchanged. The same rules apply:
changing one needs an explicit revisit and a `log.md` entry.

## `house-style` is vendored, not installed
_2026-11-10_ - The shared tooling (Prettier, ESLint and tsconfig presets, the
checkers) is copied into each repo with a version header and refreshed by a
`house-style:sync` script that finds the checkout by name. Rejected: an exact
git dependency, and a GitHub tarball URL. npm locks GitHub dependencies as git
URLs, and the estate's Docker build stages run `npm ci` with no git or SSH, so
every image build would break. Vendoring is already how Ward's library and the
imbatranim kit travel between repos.

**It lives in this library** (the owner's call, 2026-11-10): the package is the
`house-style/` folder here, with its own version (`house-style/package.json`)
and tags `house-style-v<version>`, apart from the plugin's. The sync finds the
`my-personal-skills` checkout by name and copies that folder at a ref into each
repo's `vendor/house-style/`. Rejected: a separate `house-style` repo, brief
27's first default. The reasons: one repo and no new remote, the skill and the
configs it describes change in one commit, and Ward's `shared-library/` folder
is the precedent. The cost: the library is one lane for agents, so
house-style work and library briefs no longer run side by side.

## Prettier, at one estate width of 120
_2026-11-10_ (Q8, Q51) - Every TypeScript repo formats with Prettier at
`printWidth: 120`, `trailingComma: "all"` and Prettier's defaults otherwise
(double quotes, semicolons), in one reformat commit per repo listed in
`.git-blame-ignore-revs`. Markdown stays out. Rejected: each repo's own
least-churn width (90 in SocialEvents, 100 in Newspapper and ward-auth, 150 in
brief-board, 180 in Postern), which would make the estate's code wrap
differently from repo to repo; 130, which is lower churn in Almanac, Shelfmark
and Wicket but higher in atrium and public-resource-map; and Biome as the
formatter, which is faster and 3D-sandbox's today, but formats slightly
differently and would split the estate between two tools. The reason: 120 has
the least or nearly the least churn in most house repos, it is a common
convention, and a reformat at any width is a one-off. The numbers are on
[house-style.md](house-style.md).

## The house tsconfig takes the erasable flags, not `exactOptionalPropertyTypes`
_2026-11-10_ (Q11, Q50) - The shared base adds `verbatimModuleSyntax` and
`erasableSyntaxOnly` to the lineage's flags, so every file can run under Node's
type stripping. Parameter properties become declared fields (168 in
game-engine, 10 in Satchel). `exactOptionalPropertyTypes` waits for a later
brief per repo (0-158 errors), and so does `noUncheckedIndexedAccess` where it
is off (86-740). A repo that can't take a flag turns it off in its own
tsconfig with a dated comment; imbatranimOS's NestJS backend is exempt from
`erasableSyntaxOnly`. Rejected: keeping the lineage's flags only (the deploy
scaffold and imbatranim-apps' server already run on Node's type stripping),
and taking every strict flag at once (thousands of errors for no behaviour
gained).
