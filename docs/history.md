# History

How the library got to its current shape. The [README](../README.md) lists what is in it today; [ATTRIBUTION.md](../ATTRIBUTION.md) says where each vendored skill came from.


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

v0.30.0 added `readme-docs`: one standard for a project's README and `docs/` folder (a short landing-page README, a docs folder for everything it links to, and screenshots, GIFs or diagrams captured without personal data). It adopts ideas from samber's `readme-optimization`, noffle's *Art of README*, `beautify-github-readme`, `repo-visuals` and coder/xum's regenerable screenshots; no text was copied. 25 skills → 26.
