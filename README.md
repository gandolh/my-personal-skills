# personal-skills

A repo-agnostic **workflow-and-design** skill library for [Claude Code](https://claude.com/claude-code),
built around one front door.

`/orchestrate` is the entry point. It ensures the repo has a `corpus/` workspace, reads
`corpus/routing.md` to learn how this project routes work, classifies your request, proposes
a plan, and hands off — capture to `corpus-flow`, build to `plan-split-dispatch`, questions
to the wiki. It routes; it never does the work itself.

## Install

This repository is a Claude Code plugin marketplace. Install it directly from GitHub:

```
/plugin marketplace add gandolh/my-personal-skills
/plugin install personal-skills@personal-skills-marketplace
```

Then restart Claude Code (or reload) so the command and skills are picked up.

To update later:

```
/plugin marketplace update personal-skills-marketplace
```

## What's inside

### The front door

- **`/orchestrate`** — work-intake router. Bootstraps `corpus/` if missing, reads
  `corpus/routing.md`, classifies intent, presents a Route Plan, hands off after approval.

### The core loop

- **`corpus-flow`** — an LLM-maintained project wiki (including a `glossary.md` and a
  `decisions.md` with a three-part test for what earns an entry, plus a domain-modeling
  layer — §9 — covering entry formats, multi-context glossary maps, and the discipline of
  challenging terms against the code) plus a todos→briefs→done+log
  work lifecycle. The LLM owns synthesis; you curate sources and ask questions.
- **`plan-split-dispatch`** — implementation orchestrator. Opus plans a task, splits it into
  independent chunks and verifies the result; Sonnet executes chunks by default (including
  medium-hard ones), Opus takes only the novel or risky ones. Routes cheap tokens to cheap work.
- **`grill-me`** — interview-style stress-testing of a plan, worked in dependency-ordered
  rounds rather than one question at a time. Finds facts itself instead of asking, and records
  settled terms and decisions into the corpus as it goes.
- **`improve`** — the senior-advisor seat: survey a codebase, vet every finding against the source
  and the corpus's locked decisions, rank by leverage, and write the ones you promote up as
  self-contained briefs. Read-only, and it stops at the ranked list for you to pick from.

### Documentation

- **`corpus-docs-site`** — scaffold a light-themed Starlight docs site over a corpus-flow
  project: the *narrative* (architecture, decisions, status, roadmap) rendered from the
  `corpus/` wiki, and the *API reference* generated from the TypeScript (Compodoc for a
  NestJS backend, TypeDoc for a package barrel), wired as one monorepo task so both stay current.

### Code understanding

- **`codegraph`** — understand and safely change unfamiliar code: lead with a code knowledge
  graph to scope (impact, blast radius, callers), verify with grep+read where correctness
  matters. Pairs with `corpus-flow`'s per-repo code-graph layer.

### Design & build

- **`impeccable`** — the design build engine: 23 sub-commands, a deterministic anti-pattern
  detector, live browser iteration. (Apache-2.0)
- **`design-taste-frontend`** — flagship anti-slop frontend skill, with the
  **`minimalist-ui`**, **`industrial-brutalist-ui`** and **`high-end-visual-design`** presets
  and **`redesign-existing-projects`**. Each defers to impeccable's bans on conflict. (MIT)
- **`design-md-library`** — 74 real-brand `DESIGN.md` references (Stripe, Linear, Vercel,
  Apple, Ferrari, Nintendo-2001…) plus the method for adapting one into your own tokens
  without shipping someone else's trade dress.
- **`web-design-guidelines`** — static UI review against Vercel's Web Interface Guidelines,
  fetched fresh each run so the rules never go stale here. (MIT)
- **`vercel-react-best-practices`**, **`vercel-composition-patterns`**,
  **`vercel-react-view-transitions`**, **`vercel-react-native-skills`** — Vercel Engineering's
  React/Next.js performance, component-API and animation guidance. (MIT)

### Docs & prose

- **`diagram-design`** — 39 editorial diagram types as self-contained HTML+SVG. Pairs with
  `corpus-docs-site` for architecture and lifecycle diagrams. (MIT)
- **`writing-guidelines`** — docs/prose review against Vercel's Writing Guidelines. (MIT)
- **`unslop`** — cut AI tells from writing and put voice back in. Vendored verbatim. (MIT)

### Review

- **`thermo-nuclear-review`** — an extremely strict maintainability review: hard 1000-line
  file ceiling, no ad-hoc branching on shared paths, structural regressions ranked above
  nits. Opinionated enough to fight an existing codebase — reach for it deliberately. (MIT)

### Shipping

- **`ui-test-plans`** — plain-text UI test plans paired with a Playwright run-hub, screenshots
  kept out of git.
- **`bootstrap-vps-deploy`** — a zero-dependency static-client + pm2-service deploy behind Caddy.

## Why this shape

Grilled, immutable briefs and a curated wiki for **quality**; model-routed dispatch and scoped
context for **token efficiency**; one front door for **UX**.

## Licensing & attribution

This plugin's own code is **MIT** — see [LICENSE](LICENSE). It also vendors third-party
skills, each retaining its original license (MIT / Apache-2.0), and pins the upstream commit
each was taken from. Several first-party skills also adopt
*methods* from work that is not vendored. See [ATTRIBUTION.md](ATTRIBUTION.md) for the full
breakdown.

## History

Through v0.23.0 this plugin also vendored a frontend design-and-ship suite (`impeccable`,
`ui-ux-pro-max`, the taste-skill style presets, and a set of designer-skills audit primitives),
along with the `/the-one-move`, `/improve-platform`, and `/ui-check` commands that drove them.
v0.24.0 removed all of it to leave a focused, first-party workflow library. Those skills are
still available from their upstream sources, and the removal is recoverable from git history.

v0.25.0 pruned three more skills that a month of transcripts showed were never used:
`web-research` and `init-personal-repo` (superseded in practice — `/orchestrate` bootstraps
`corpus/` on its own, and research runs inline through the gate above), and
`performance-analysis` (its Chrome DevTools MCP dependency was never configured, so it never
ran). Also recoverable from git history.

v0.26.0 added `improve` and hardened `plan-split-dispatch`, adopting ideas from
[shadcn/improve](https://github.com/shadcn/improve) (audit → plans written for a weaker
executor) and [obra/superpowers](https://github.com/obra/superpowers) (a mandatory review
gate, a bounded escalating fix loop, and a ruling ledger that survives compaction). Both were
written fresh against this suite's own conventions rather than vendored, so the library stays
first-party.

v0.27.0 deliberately reversed the first-party-only rule and re-introduced vendoring, adding a
full design layer (`impeccable` v4.1.1, the taste suite, `design-md-library`), a docs/prose
layer (`diagram-design`, `writing-guidelines`, `unslop`) and `thermo-nuclear-review`. It also
folded three more influences into the first-party skills: frontier-round interviewing and the
glossary/ADR discipline from [mattpocock/skills](https://github.com/mattpocock/skills), and the
"evidence before claims" verify law plus the never-scaling approval gate from
[obra/superpowers](https://github.com/obra/superpowers). 8 skills → 21.

v0.28.0 vendored six of the [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
skills, deepened the corpus into a full domain-modeling layer (`corpus-flow` §9 — glossary
entry format with displaced synonyms, decision format and qualifying categories, multi-context
glossary maps, and the active challenge/sharpen/scenario/cross-reference discipline), routed a
`domain` intent through `orchestrate`, and added an MIT `LICENSE` for the plugin's own code.
21 skills → 25 (the two guideline wrappers were replaced by their upstream originals; the three
Vercel-platform deploy skills were left out in favour of `bootstrap-vps-deploy`).
