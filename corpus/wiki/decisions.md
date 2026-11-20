---
summary: Locked calls for the skills library, each with the date, the alternative and the reason. Vendoring over first-party-only (2026-08), pinned upstreams with licenses kept, ideas adopted but not copied, a prune of unused skills, and blocked work in its own folders; Base UI conventions as a skill instead of a shared component library (2026-11-09); Hallmark as the estate's design skill, and house-style's three calls of 2026-11-10 (on decisions-house-style.md); the code structure's four calls for the Fastify servers: `features/` folders, dependencies as typed plugin options, explicit registration, and zod route schemas through the official provider (2026-11-09); shared domain code in `domain/` under the features (2026-11-13). Also review runs on Opus (2026-11-17), with the advisor and effort answers of the same day, and pstack's no-comments vendored with its suite on the owner's ask (2026-11-20).
updated: 2026-11-20
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

## house-style's calls are on their own page
The three calls of 2026-11-10 for house-style (vendored into each repo, not
installed; Prettier at one width of 120; the tsconfig flags) are on
[decisions-house-style.md](decisions-house-style.md), split off on
2026-11-20 when this page passed 200 lines.

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

## Review runs on Opus
_2026-11-17_ (v0.59.0, brief 39, the owner's pick) - Every review finder in
`plan-split-dispatch` and the `brief-auditor` agent run on opus. Rejected:
the skill's rule until then, finders on sonnet with at most one opus finder
on the highest-risk lens. The owner's standing rule is that code review runs
on Opus, and a month of transcripts put the price of that rule at 148k output
tokens (the 17 review runs that had gone to sonnet). Two related answers of
the same day change no file: the advisor model in the owner's settings stays,
and effort follows the session, so a dispatch names a model and never an
effort level.

## Vendor pstack's no-comments, with the suite it needs
_2026-11-20_ (v0.66.0, the owner's ask) - `no-comments` is vendored with the
`comment-sicko` agent, `poteto-mode`, `why`, `architect` and pstack's Claude
Code adapter, all run only by name. Rejected: the research verdict of the same
morning ([skill-sources-2026-11-20.md](skill-sources-2026-11-20.md)), which
was not to add it, because Comment Sicko deletes the why-comments house-style
rule 24 asks for and because it needs half of pstack. The owner wants the pass
available anyway. house-style rule 24 is not revisited: the pass is a deliberate
choice on a scope someone names, not part of any review gate. The rest of pstack
(`poteto-agent`, `setup-pstack`, `arena`, the principle skills) stays out until
something here calls for it.
