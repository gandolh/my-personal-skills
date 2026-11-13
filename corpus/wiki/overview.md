---
summary: What the my-personal-skills library holds (one front door, a corpus workflow, design and docs layers, vendored skills), how it ships, and what it leaves out.
updated: 2026-11-06
---

# Overview

my-personal-skills is the owner's Claude Code plugin marketplace. The plugin,
`personal-skills`, is a skill library that runs a project's work through one
front door, `/orchestrate`.

- **The core loop:** `orchestrate` routes a request. `corpus-flow` keeps each
  project's wiki and its todos, briefs and log. `plan-split-dispatch` builds
  briefs with models routed by difficulty. `grill-me` settles a design first,
  and `improve` audits a codebase and writes the picked findings as briefs.
- **Documentation and prose:** `readme-docs`, `corpus-docs-site`,
  `diagram-design`, `writing-guidelines`, `unslop`.
- **Design:** `impeccable`, the taste presets and `design-md-library`.
- **Code and delivery:** `codegraph`, `ui-test-plans`, `bootstrap-vps-deploy`,
  `thermo-nuclear-review`, `stocktake` (the library audit and the MCP pin check), and the Vercel React skills.

26 skills as of v0.33.0. The first-party ones are listed in
[ATTRIBUTION.md](../../ATTRIBUTION.md); the rest are vendored with a pinned
upstream and license. [README.md](../../README.md) is the public description
and [docs/history.md](../../docs/history.md) says how the library got here.

Skills ship by the owner's plugin update. The repo has no deploy, no CI and no
test suite beyond the corpus lint.
