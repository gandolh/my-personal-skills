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

v0.31.0 moved `corpus-docs-site` from Starlight to Docusaurus 3.10. The skill now scaffolds React components (hero, stat tiles, cards, archify diagram frame) and a sync script that discovers corpus pages instead of listing them, resolves links against the source page, and maps cross-repo links. It also ships `references/migrating-from-starlight.md`, a migration recipe verified by porting a deployed site and building ten real corpora, with the ten gotchas that run hit.

v0.31.1 corrected `corpus-docs-site` after fourteen real sites migrated with it. The sync no longer puts inline code in its banner title (in a `.md` page the heading read "note"), `build-diagrams.mjs` tolerates a missing `diagrams/`, the Compodoc gate runs apart from generation (with `--coverageTest` it writes no HTML), the deploy step names vps-deploy's `generator: "docusaurus"` instead of a nonexistent `assetDir`, and the migration guide gained six gotchas.

v0.34.0 added `blocked/` folders to the corpus workflow. A brief that waits on something outside the work lives in `corpus/briefs/blocked/` with a `**Blocked by:** <condition>` line under its title; a todo lives in `corpus/todos/blocked/` with a `blocked-by:` key. `corpus-flow` gained §2b (block and unblock) and a four-folder numbering rule, and its lint rules check the conditions and duplicate numbers. `plan-split-dispatch` keeps blocked briefs out of every wave, `orchestrate` lists them with their condition, `improve` treats them as already known, and `grill-me` hands "later, once X" to `corpus-flow`. This repo also got its own `corpus/`, so skill changes are now tracked as briefs.

v0.35.0 added `scripts/check-skills.mjs`, a zero-dependency check that every `skills/*/SKILL.md` has valid frontmatter, a `name` that matches its directory and the Agent Skills name rule, and a `description` of at most 1,024 characters (the limit other agents enforce). `corpus/lint.sh` runs it. Vendored skills are reported as warnings, never edited. It found one real fault: `improve` had an unquoted `: ` in its description, which is invalid YAML, now fixed. Counted with a YAML parser, `codegraph` and `design-md-library` were already under the limit; the roughly 1,035 and 1,105 in the brief were `description` plus `when_to_use` together.

v0.36.0 added `house-style` and the plugin's first hooks, the library half of brief 27. The skill writes the estate's TypeScript style as 25 numbered rules, each with its reason and the lint rule that enforces it (or "review"), and says how a repo adopts the harness: configs vendored from the library's `house-style/` folder by `npm run house-style:sync`, one reformat commit checked by an esbuild bundle compare, `npm run check` and `check:fast`, a short root `CLAUDE.md` and `.claude/rules/` files scoped by `paths:`. Its review checklist (prose comments, factories over classes, interfaces as contracts) is what `plan-split-dispatch`'s review gate now hands the conventions finder. `hooks/hooks.json` formats each saved file with the repo's own Prettier, and at `Stop` runs the repo's `check:fast` when the session saved code in that package, sending Claude back on a failure. It blocks again only while the failure changes, at most four times a turn, because Claude Code's own cap of eight resets on every tool call. The measurements behind the rules, collated from the repo briefs, are on `corpus/wiki/house-style.md`. The `house-style/` folder itself (its own version, 1.0.0, not yet tagged) holds the ESLint config as `houseStyle(options)`, the Prettier config, the tsconfig base, the knip and dependency-cruiser presets and the sync, with a failing and a passing fixture for each rule under its own `npm test`. It also ships the two convention checkers that briefs 02 and 03 specify, `bin/check-base-ui.mjs` and `bin/check-structure.mjs`, run by each repo's `check:conventions` with `--warn-only` until its Base UI or server brief is done. Both read the repo's source folders and accepted findings, each with its reason, from a `conventions.json` that a JSON Schema beside them describes.

v0.37.0 added `base-ui`, brief 02. It answers the owner's question of 2026-11-09, whether to build a shared component library over Base UI, with conventions instead of components: 17 numbered rules for React UI on `@base-ui/react` 1.9.0 styled with Tailwind 4, each with its reason and the `check-base-ui` rule that reports it or "review". Rules 1-13 are the brief's (exact pin, subpath imports, Base UI only under `ui/` folders, Tailwind on the parts, one stylesheet, role-named tokens, motion on the state attributes, portalled popups, `render` on triggers, `items` on selects, no native dialogs, the dialog rules, Base UI over hand-built widgets); 14-17 are the owner's calls of 2026-11-10 (a Light / Dark / System switch, light first; a swipeable `Drawer` for phone menus; a `RadioGroup` for a filter or a device-only setting and a guarded `ToggleGroup` for a picker that saves; jsdom tests only for wrappers with logic, selected by role). Its 16 references carry copy-ready Tailwind wrappers, written fresh from Almanac's dialog, wicket's confirm, ro-housing's wrappers and imbatranimOS's UI rules, and all 37 TypeScript blocks compile with `tsc --noEmit` against the 1.9.0 types under the house flags; the stylesheet builds with Tailwind 4.3.5. `migrating-from-plain-css.md` is the method every app's Tailwind brief follows. The checker was built earlier in house-style 1.0.0; this version lets `conventions.json` record exceptions for rules 14-17 and stops rule 9 warning on a trigger's own parts (`<Select.Value>` in `<Select.Trigger>`).

v0.38.0 added `code-structure`, brief 03: one code structure for the estate's 19 Fastify 5 servers and the React apps beside them, researched from Fastify's own docs, the fastify/demo reference app and Matteo Collina's `fastify-best-practices` skill (ideas taken, no text copied). It states 11 numbered rules, each with its reason, its source and what enforces it: `server.ts` alone listens and `app.ts` exports `buildApp(config)`; `config.ts` alone reads the environment; cross-cutting plugins are wrapped in `fastify-plugin` and dependencies travel as typed plugin options, never decorators; features live in `features/<name>/` and are used through their index; every route declares its zod schemas, a response schema included, through `@fastify/type-provider-zod`; handlers stay thin over `store.ts`; one error handler keeps each repo's error body; each feature has `inject()` tests through `buildTestApp`; the web side has the same feature folders; a file past 400 lines is a warning. Rules 1, 2, 3, 6 and 11 are house-style's `check-structure`, built earlier in house-style 1.0.0, and 5, 7 and 10 lean on its dependency-cruiser preset. The references hold a whole server skeleton and a web API client, whose 22 TypeScript blocks compile together with TypeScript 6.0.3 under the house flags against Fastify 5.12.8, the provider 1.0.3 and zod 4.6.7, pass their 12 `inject()` and unit tests, and lint clean under the house ESLint config; what a response schema may hold, each behaviour measured (a transform or a strict object answers 500, a loose object passes JSON through, a declared status the handler doesn't send answers 500); the byte compare that proves a response schema changes nothing; and `migrating-a-server.md`, the order every server brief follows, ending with `--warn-only` dropped and any lowered dependency-cruiser rule raised again.
