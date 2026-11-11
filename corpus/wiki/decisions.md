---
summary: Locked calls for the skills library, each with the date, the alternative and the reason. Vendoring over first-party-only (2026-08), pinned upstreams with licenses kept, ideas adopted but not copied, a prune of unused skills, and blocked work in its own folders; Base UI conventions as a skill instead of a shared component library (2026-11-09); Hallmark as the estate's design skill, house-style as a library folder vendored into each repo, Prettier at one width of 120, and the house tsconfig flags (2026-11-10).
updated: 2026-11-11
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
