# Attribution

This plugin vendors third-party skills. Each retains its original license.

**Original to this plugin** (no third-party code): `orchestrate`, `corpus-flow`,
`corpus-docs-site`, `readme-docs`, `plan-split-dispatch`, `improve`, `grill-me`, `codegraph`,
`ui-test-plans`, `bootstrap-vps-deploy`, and `design-md-library` (the *skill*; its data is
vendored — see below).

The plugin's own code is **MIT** — see [LICENSE](LICENSE).

Several first-party skills adopt *ideas* from work that is **not** vendored here —
credited in [Influences](#influences) at the bottom.

## Vendored, with upstream pins

| Skill(s) | Upstream | License | Pinned at |
|---|---|---|---|
| `impeccable` (v4.1.1) + the 4 `impeccable-*` agents | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 | `56f4452` (2026-08-22) |
| `design-taste-frontend`, `minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design`, `redesign-existing-projects` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) · [tasteskill.dev](https://www.tasteskill.dev/) | MIT | `72e2995` (2026-08-22) |
| `unslop`, `thermo-nuclear-review` | [cursor/plugins](https://github.com/cursor/plugins) | MIT | `4612556` (2026-08-20) |
| `diagram-design` | [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | MIT | `648c2a5` (2026-08-22) |
| `design-md-library/references/design-md/` (74 `DESIGN.md` files) | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | MIT | `8147538` (2026-07-31) |
| `web-design-guidelines`, `writing-guidelines`, `vercel-composition-patterns`, `vercel-react-best-practices`, `vercel-react-native-skills`, `vercel-react-view-transitions` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT | `dd089a8` (2026-08-21) |

License texts: [LICENSE-taste-skill](LICENSE-taste-skill), [LICENSE-cursor](LICENSE-cursor),
[LICENSE-diagram-design](LICENSE-diagram-design), [LICENSE-awesome-design-md](LICENSE-awesome-design-md),
and `skills/impeccable/LICENSE` + `skills/impeccable/NOTICE.md` (Apache-2.0 requires both be retained).

### Notes per source

**impeccable** (Apache-2.0) — the design build engine, 23 sub-commands and a
deterministic anti-pattern detector. Vendored from the repo's own `plugin/` output, so
the skill, its `scripts/`, `reference/`, and its four agents match an upstream install.
It expects `npx impeccable` for some paths and a browser for live mode.

**taste-skill** (MIT) — vendored verbatim; directories are named for each skill's
**frontmatter `name`** rather than its upstream folder (`taste-skill/` → `design-taste-frontend/`,
`soft-skill/` → `high-end-visual-design/`, `brutalist-skill/` → `industrial-brutalist-ui/`,
`minimalist-skill/` → `minimalist-ui/`, `redesign-skill/` → `redesign-existing-projects/`),
because Claude Code resolves skills by directory. Contents are unmodified.

The upstream platform-specific skills (`gpt-tasteskill`, `stitch-skill`, `image-to-code-skill`,
`taste-skill-v1`), the image-generation skills (`imagegen-frontend-web`, `imagegen-frontend-mobile`,
`brandkit`) and `output-skill` were not vendored — they target other agents or capabilities
outside this plugin's scope.

Each style preset defers to **impeccable's Absolute bans** on any conflict.

**cursor/plugins** (MIT) — `unslop` is vendored **verbatim and deliberately unadapted**,
per its own instruction that it "must always apply". `thermo-nuclear-review` is an
extremely strict maintainability review (hard 1000-line file ceiling, bans ad-hoc
branching on shared paths); it is opinionated enough to fight an existing codebase, so
reach for it deliberately rather than as the default review.

**diagram-design** (MIT) — 39 editorial diagram types rendering to self-contained
HTML+SVG. PNG export needs Playwright + Chromium; some scripts need Python 3. It
*imports* Mermaid/draw.io but does not emit them.

**awesome-design-md** (MIT) — vendored complete: all 74 `DESIGN.md` files plus their
per-brand `README.md`, byte-identical to upstream. Each file is the upstream authors' *interpretation* of a public brand, not an
official design system; the brands are their owners' trademarks. See the skill's own
boundary section on reference-vs-imitation.

**vercel-labs/agent-skills** (MIT) — six of the nine skills vendored verbatim. Directories are
named for each skill's frontmatter `name` (`composition-patterns/` →
`vercel-composition-patterns/`, and likewise for the other three `react-*` skills), because
Claude Code resolves skills by directory.

*Licensing note:* the repo ships **no `LICENSE` file**; MIT is declared in its `README.md`
and in the frontmatter of five of the nine skills. Vendored on that basis — if you want the
stricter reading, the two guidelines skills are trivially replaceable, since each is a
~39-line shim that fetches its real rules at runtime.

Those two do not carry their rules: `web-design-guidelines` and `writing-guidelines` fetch
from [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) and
[writing-guidelines](https://github.com/vercel-labs/writing-guidelines) on every run, so they
stay current but need network access. The other four are self-contained.

Not vendored: `deploy-to-vercel`, `vercel-cli-with-tokens` and `vercel-optimize` target
Vercel's platform, which this plugin does not deploy to — `bootstrap-vps-deploy` (Caddy +
pm2 on a VPS) covers shipping here.

## Influences

Adopted as method into first-party skills, with no code copied:

- **[shadcn/improve](https://github.com/shadcn/improve)** — the audit → vet → rank →
  "plans written for a weaker executor" shape behind the `improve` skill.
- **[obra/superpowers](https://github.com/obra/superpowers)** — the mandatory review
  gate, bounded escalating fix loop, and ruling ledger in `plan-split-dispatch`; the
  "evidence before claims" iron law on its verify gate; and the approval gate in
  `orchestrate` that scales ceremony but never the gate itself.
- **[mattpocock/skills](https://github.com/mattpocock/skills)** — the frontier-round
  interview method and "find facts yourself, ask only for decisions" rule in `grill-me`,
  plus the glossary/ADR discipline (`domain-modeling`, `grill-with-docs`) now expressed
  as `corpus/wiki/glossary.md` and the three-part decision test in `corpus-flow`.

- **[samber/developer-relations-skills](https://github.com/samber/developer-relations-skills)**
  (`readme-optimization`, MIT), **noffle's *Art of README***,
  **[oil-oil/beautify-github-readme](https://github.com/oil-oil/beautify-github-readme)**,
  **[livlign/claude-skills](https://github.com/livlign/claude-skills)** (`repo-visuals`,
  `readme-doctor`), **[coder/xum](https://github.com/coder/xum)** (regenerable README
  screenshots), **[github/awesome-copilot](https://github.com/github/awesome-copilot)**
  (`ui-screenshots`) and **[softaworks/agent-toolkit](https://github.com/softaworks/agent-toolkit)**
  (`crafting-effective-readmes`) — the decision-funnel order, claim checks, honest status,
  badge discipline, value → proof → mechanism sequence and re-runnable captures behind
  `readme-docs`.

## History

Through **v0.23.0** this plugin vendored an earlier frontend design suite. **v0.24.0**
removed all vendored code to leave a first-party workflow library; **v0.25.0** pruned
three unused skills. **v0.27.0** deliberately re-introduced vendoring for the design,
diagram, review and writing layers above, and **v0.28.0** added the Vercel suite plus the
`corpus-flow` §9 domain-modeling layer. All removals remain recoverable from git history.
