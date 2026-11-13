---
summary: Locked calls for the skills library, each with the date, the alternative and the reason. Vendoring over first-party-only (2026-08), pinned upstreams with licenses kept, ideas adopted but not copied, a prune of unused skills, and blocked work in its own folders; Base UI conventions as a skill instead of a shared component library (2026-11-09); Hallmark as the estate's design skill, house-style as a library folder vendored into each repo, Prettier at one width of 120, and the house tsconfig flags (2026-11-10); the code structure's four calls for the Fastify servers: `features/` folders, dependencies as typed plugin options, explicit registration, and zod route schemas through the official provider (2026-11-09); shared domain code in `domain/` under the features (2026-11-13).
updated: 2026-11-13
---

# Decisions

## Vendor third-party skills, with pins
_2026-08-22_ (v0.27.0) - The library vendors upstream skills (impeccable, the
taste suite, the Vercel skills, diagram-design, unslop) instead of staying
first-party only. Each keeps its license, and ATTRIBUTION.md records the
upstream and the pinned commit. Rejected: first-party only, the rule from
v0.24.0 to v0.26.0. It left the owner without a design layer, and the upstream
work was good enough to carry whole. The reason to pin is that an upstream
change then arrives only when someone updates the pin on purpose.

**Revisited 2026-11-11** (v0.40.0, brief 24), for Hallmark and the taste
suite. Hallmark (Nutlope/hallmark, `407fa68`, MIT) is vendored as its skill
folder, verbatim, except `scripts/install-hook.mjs` and `scripts/install.mjs`.
Both write outside the project being designed (Claude Code's settings, a second
copy of the skill), so they are left out for safety, and ATTRIBUTION.md names
them. Its `imagegen.mjs` stays behind a written guard: it sends a description
of the page to Together AI when `TOGETHER_API_KEY` is set, so the key stays
unset and the script runs only when the owner asks. The taste suite stays at
`72e2995` and is not re-pinned. Its four presets gained one frontmatter line,
`disable-model-invocation: true`, so they run only when called by name, and
`redesign-existing-projects` retired. Rejected: re-pinning the classics from
taste-skill-classics (the brief's first default), vendoring taste-skill 2.5.1
(40 MB, and the owner chose Hallmark), and vendoring Hallmark with its
installers. The rule now reads: vendor verbatim and pinned, leave out any
upstream file that writes outside the project it works on, and record each
exclusion or local line in ATTRIBUTION.md.

## Adopt ideas, copy no text, when a source is not vendored
_2026-08-20_ (v0.26.0, v0.30.0) - `improve`, the review gate in
`plan-split-dispatch` and `readme-docs` took ideas from shadcn/improve,
obra/superpowers and others, written fresh against this suite's conventions.
Rejected: vendoring them. Their shape (audit then plan, a fixed review gate)
fit, but their wording did not match the corpus vocabulary.

## Prune skills the transcripts show are unused
_2026-08_ (v0.24.0, v0.25.0) - The frontend ship suite, `web-research`,
`init-personal-repo` and `performance-analysis` were removed once a month of
transcripts showed they never ran or had been superseded. They stay in git
history. Rejected: keeping them "in case". Unused skills still cost
description tokens at every session start.

## Blocked work lives in `blocked/` folders
_2026-11-06_ (v0.34.0) - A brief or todo that waits on an outside condition
goes to `briefs/blocked/` or `todos/blocked/` with a condition line, instead of
sitting in `todo/` with a tag. Rejected: a `later` tag or a bold line under the
title (nothing reads it, and `plan-split-dispatch` puts the brief in a wave).
Existing corpora adopt the folders the first time something there is blocked,
not in one sweep.

## Base UI conventions as a skill, not a shared library
_2026-11-09_ (v0.37.0, brief 02) - The estate's apps on Base UI share
conventions, not components. The `base-ui` skill holds the numbered rules
and wrappers to copy, each app keeps its own wrappers in its `ui/` folders,
and house-style's `check-base-ui` reports what a script can see. Rejected:
a styled component library on Base UI shared by every app, a library
written from scratch, and leaving each app alone. The reason: each app has
its own look on purpose (many carry a `DESIGN.md`), the 22 apps were split
between Tailwind and plain CSS and spread over Base UI 1.4.1 to 1.9.0, and
the one shared kit (`@imbatranim/ui`, vendored into imbatranim-apps with a
`COMMIT` pin and a `kit:sync` script) shows what lockstep costs. What
repeated was behaviour and its traps (the Escape guard, initial focus, the
pending confirm, `render` on triggers, `items` on selects, no native
dialogs), each found by hand in several apps; a written rule and a checker
carry those without tying anyone's markup together, where leaving the apps
alone meant finding each trap again, one app at a time. The owner accepted
the verdict on 2026-11-09, with Tailwind for whole apps and every repo on
Base UI 1.9.0.

## Hallmark is the design skill, with taste-skill's ideas
_2026-11-10_ - The owner's grilling (Q39) chose nutlope/hallmark (`407fa68`,
MIT) to redesign every web UI in the estate, vendored with its pin. From
leonxlnx/taste-skill 2.5 the library adopts ideas, not text: palettes and type
dealt by trade, and its copy layer. Every proposal goes on one board, and the
owner approves each app there before code changes. Rejected: taste-skill 2.5
as the design skill (the owner's first answer, corrected the same day), and a
bake-off on one page. The reason: Hallmark's tiered lint makes the floor of a
redesign mechanical (contrast, focus, reduced motion, invented facts, the
phone layout), and its pages are built from each business's job.

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

## Server code grouped in `features/<name>/` folders
_2026-11-09_ (v0.38.0, brief 03; Q23) - Each server groups its code by
domain: `features/<name>/` holds the feature's `routes.ts`, `store.ts`, an
optional `service.ts`, its tests, and the `index.ts` its callers import
through. The folder is named `features`, after Almanac's `FeatureContext`.
Rejected: the split by technical layer most servers have (`routes/`,
`store/`, `db/`), which spreads one change over three folders, and
`modules/`, atrium's name. The reason: the research agrees on grouping by
domain (the Fastify demo's routes README, Collina), and atrium and
comercial-website already did. A store too big to split stays whole in
`db/` (Q54).

## Dependencies as typed plugin options, not decorators
_2026-11-09_ (v0.38.0, brief 03; Q24, Q56) - `app.ts` builds one
`FeatureContext` and passes it to each feature's plugin as its options. A
decorator holds only a request-scoped value (`request.user`), and tests
pass fakes in the context. Rejected: the demo's decorator per repository,
merged into `declare module "fastify"`: global, harder to grep, and a new
habit in every repo. Found building it: a feature that imports
`type FeatureContext` from `app.ts` closes an import cycle the house
dependency-cruiser preset reports, so each feature names the part it takes
in its own options type.

## Explicit registration, no autoload
_2026-11-09_ (v0.38.0, brief 03; Q24) - `app.ts` imports and registers each
plugin and feature by name, in a fixed order: external plugins, the app's
plugins, the features. Rejected: `@fastify/autoload`, the demo's choice. A
feature registered because its file exists can't be found with grep, and
loses its option types.

## Zod route schemas through the official type provider
_2026-11-09_ (v0.38.0, brief 03; Q25, Q28, Q53) - Every route declares its
`params`, `querystring` and `body`, and a `response` schema for each status
its handler sends, as zod schemas (from `shared/` when the client imports
them) through `@fastify/type-provider-zod`. No handler parses request
input. Rejected: TypeBox, the demo's and Collina's default, which would put
a second schema beside each zod schema the web forms already use; and the
hand parsing in 12 servers, which serialised every reply with
`JSON.stringify`, so a field added to a row reached the client. Streams and
binary replies are exempt with a `conventions.json` entry, and sports-app
keeps TypeBox for its existing contract.

## Shared domain code in `domain/<name>/`, under the features
_2026-11-13_ (v0.53.0, house-style 1.3.0, brief 31; the backlog grill's
answer 2) - Code several features share that isn't pure (ward-auth's tokens,
grants and OIDC provider) lives in `domain/<name>/`, beside `features/`,
`plugins/`, `db/` and `lib/`. The features import it; it never imports a
feature. ward-auth's two import rules became the preset's:
`domain-not-to-features` and `app-through-feature-index`. Unused exports
stay knip warnings. Rejected: leaving domain folders at the root of the
server, where no layout rule names them, and putting them in `lib/`, which
is for pure code. Two scope calls in the build: the preset's
`domain-not-to-features` reads only `domain/` (ward-auth's own rule also
lists its `lib/`, `db/`, `plugins/` and `testing/`, but the skill lets
`testing/` import a feature), and sports-app's "a plugin never imports a
feature" stayed a repo rule, because the owner's answer named two rules.
