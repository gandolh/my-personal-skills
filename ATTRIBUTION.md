# Attribution

This plugin vendors third-party skills. Each retains its original license.

**Original to this plugin** (no third-party code): `orchestrate`, `corpus-flow`,
`corpus-docs-site`, `readme-docs`, `plan-split-dispatch`, `improve`, `grill-me`, `codegraph`,
`ui-test-plans`, `bootstrap-vps-deploy`, `design-md-library` (the *skill*; its data is
vendored — see below), and `web-platform` (the *skill* and its browser policy; its 20 guides
are vendored — see below).

The plugin's own code is **MIT** — see [LICENSE](LICENSE).

How to vendor a source and how to take a new pin: [docs/vendoring.md](docs/vendoring.md).

Several first-party skills adopt *ideas* from work that is **not** vendored here —
credited in [Influences](#influences) at the bottom.

## Vendored, with upstream pins

| Skill(s) | Upstream | License | Pinned at |
|---|---|---|---|
| `hallmark` (v2.0.0) | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | MIT | `407fa68` (2026-11-05) |
| `impeccable` (v4.1.1) + the 4 `impeccable-*` agents | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 | `56f4452` (2026-08-22) |
| `design-taste-frontend`, `minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) · [tasteskill.dev](https://www.tasteskill.dev/) | MIT | `72e2995` (2026-08-22), held; superseded upstream |
| `unslop`, `thermo-nuclear-review` | [cursor/plugins](https://github.com/cursor/plugins) | MIT | `4612556` (2026-08-20) |
| `no-comments`, `poteto-mode`, `why`, `architect` + the `comment-sicko` agent | [cursor/plugins `pstack/`](https://github.com/cursor/plugins/tree/main/pstack), from its Claude Code tree `harness/pstack/claude-code/` | MIT | `aaeb0ea` (2026-11-19, pstack 0.15.46) |
| `security-audit` | [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | MIT | `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8` (2026-09-14) |
| `diagram-design` | [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | MIT | `648c2a5` (2026-08-22) |
| `design-md-library/references/design-md/` (74 `DESIGN.md` files) | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | MIT | `8147538` (2026-07-31) |
| `web-platform/references/mwg/` (20 guides) | [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) | CC BY 4.0 | `2b4aa13` (2026-11-23, v1.0.2) |
| `web-design-guidelines`, `writing-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT | `dd089a8` (2026-08-21) |
| `web-design-guidelines`' fetch | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) `command.md` | MIT | `434b7f9` (2026-11-24) |
| `writing-guidelines`' fetch | [vercel-labs/writing-guidelines](https://github.com/vercel-labs/writing-guidelines) `command.md` | MIT | `83e2316` (2026-11-24) |

License texts: [LICENSE-hallmark](LICENSE-hallmark) (also kept as `skills/hallmark/LICENSE`), [LICENSE-taste-skill](LICENSE-taste-skill), [LICENSE-cursor](LICENSE-cursor),
[LICENSE-diagram-design](LICENSE-diagram-design), [LICENSE-cloudflare](LICENSE-cloudflare), [LICENSE-awesome-design-md](LICENSE-awesome-design-md),
[LICENSE-modern-web-guidance](LICENSE-modern-web-guidance) (the CC BY 4.0 notice and upstream's Apache-2.0 text), and `skills/impeccable/LICENSE` + `skills/impeccable/NOTICE.md` (Apache-2.0 requires both be retained).

### Notes per source

**hallmark** (MIT) - the design skill every web UI in the estate is redesigned with (the
owner's call of 2026-11-10). It brings the Floor (16 rules a page never ships without:
tokens, focus, reduced motion, no invented facts, a phone layout that holds, and more), a
tiered browser lint (`scripts/sloplint.mjs`, a static tier and a render tier), themes dealt
per page, pages built from the business's job, and credited, openly licensed photographs.
`skills/hallmark/` is upstream's skill folder at `407fa68`, copied verbatim; its folder name
already matches its frontmatter `name`. 185 files, 7.2 MB.

- **Left out:** the rest of the upstream repo (`site/`, 57 MB, the project's website;
  `docs/`, `eval/`, its README, roadmap and plugin manifests). No photographs are bundled:
  `scripts/photos.json` indexes 755 Wikimedia Commons files (CC0, public domain, CC BY,
  CC BY-SA) by link. The 5 MB of JPEGs in `references/themes/` are the 50 theme previews
  the deal step looks at, so they stay.
- **Excluded for safety:** `scripts/install-hook.mjs`, which rewrites Claude Code's
  `settings.json` (the project's, or the user's with `--global`) to add a PostToolUse hook,
  and `scripts/install.mjs`, which copies the skill into `~/.claude/skills/` and other
  agents' folders, beside the plugin's own copy. Skills are installed only through this
  plugin, and the plugin's hooks do the edit-time work. `references/flow.md` (Edit-time
  linting, the harness table) still names `install-hook.mjs`; the file is absent, which is
  harmless. No other file, script or test refers to either. `scripts/lint-hook.mjs` stays: it runs only when something calls it.
- **The guard:** `scripts/imagegen.mjs` stays. Whenever `TOGETHER_API_KEY` is set, the
  comp step (signal 9) sends a description of the planned first screen to Together AI's
  image API. The estate does not set the key, and setting it is the owner's choice alone.
  Never set `TOGETHER_API_KEY`, never run `imagegen.mjs` unless the owner asks, never
  install anything globally, and keep `puppeteer-core` and Chrome per repo (the skill's
  own text offers `npm i -g puppeteer-core`; install it in the repo instead).
- **Needs:** Node 18 or later and no packages for the static tier. The render tier
  (`sloplint --render`, `capture.mjs`) needs `puppeteer-core` (in the repo, or named by
  `HALLMARK_PUPPETEER`) and Chrome or Chromium (`CHROME_PATH` when it is somewhere
  unusual). Its other network use is design work: `theme.mjs photos --save` downloads
  from `upload.wikimedia.org` only, and the brand-truth step reads a named brand's
  homepage and stylesheets under its own address checks.
- **What it writes in a project:** a `.hallmark/` folder (pre-flight cache, build log,
  before and after records and screenshots, its own `.gitignore`), `tokens.css` and
  `base.css` beside the stylesheet, and a stamp comment at the top of the CSS.
- **It runs on an existing design only when named:** `/hallmark redesign <path>` or
  `/hallmark audit <path>` (its description keeps it off existing designs otherwise).

**impeccable** (Apache-2.0) — the design build engine, 23 sub-commands and a
deterministic anti-pattern detector. Vendored from the repo's own `plugin/` output, so
the skill, its `scripts/`, `reference/`, and its four agents match an upstream install.
It expects `npx impeccable` for some paths and a browser for live mode.

**taste-skill** (MIT) — vendored verbatim; directories are named for each skill's
**frontmatter `name`** rather than its upstream folder (`taste-skill/` → `design-taste-frontend/`,
`soft-skill/` → `high-end-visual-design/`, `brutalist-skill/` → `industrial-brutalist-ui/`,
`minimalist-skill/` → `minimalist-ui/`), because Claude Code resolves skills by directory.
Contents are unmodified apart from one frontmatter line: since v0.40.0 each carries
`disable-model-invocation: true`, so the four run only when called by name, the change
upstream made to its classics in 2.1.x.

**Held at `72e2995` on purpose** (2026-11-10). Upstream has moved on: 2.5 rebuilt
`design-taste-frontend` as a 40 MB company-website system, and the classics moved to
Leonxlnx/taste-skill-classics. Hallmark is now the design skill, and 2.5's useful ideas
are adopted, not vendored (see [Influences](#influences)), so the four are kept as they
are and not re-pinned. Upstream's `redesign-skill/` was vendored until v0.39.0 and retired
in v0.40.0, since Hallmark redesigns and audits by path.

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

**pstack: no-comments and what it needs** (MIT, Lauren Tan; the license text is the one in
[LICENSE-cursor](LICENSE-cursor)) - added on the owner's ask of 2026-11-20. `no-comments`
spawns Comment Sicko, an agent that deletes every comment except licence headers, comments
about an outside rule the code can't change, `prettier-ignore`, doc comments that define a
public API and issue links, and flags the code a deleted comment excused (`MUST KILL`) for a
rename or reshape. Vendored from cursor/plugins' generated Claude Code tree,
`harness/pstack/claude-code/` at `aaeb0ea`, which is what Claude Code installs for pstack:
each skill there points at the Claude Code adapter. Folder names already match each
frontmatter `name`.

- **In:** `skills/no-comments/`, `skills/why/`, `skills/architect/`, `skills/poteto-mode/`
  (`SKILL.md`, `worker.md`, 22 playbooks, `references/bugbot-triage.md`),
  `agents/comment-sicko.md`, and the adapter at `docs/harness/claude-code.md`. The skills link
  to it as `../../docs/harness/claude-code.md`, so it sits at the plugin root. `no-comments`
  needs the agent, poteto-mode's Subagents section (the model for each subagent) and `why`
  (Comment Sicko traces a "do not remove" claim with it); it hands a reshape to `architect`.
- **Cost:** all four skills carry `disable-model-invocation: true`, so they load only when
  called by name. The agent's description joins the agent list (about 30 tokens).
- **Left out, for safety:** `skills/poteto-mode/scripts/`. `watch-pr` installs its packages
  with bun into its own folder, which here is the plugin cache, and `worktree-audit.sh` reads
  Cursor's transcript folder. They serve the babysit and worktree-cleanup playbooks only.
- **Left out, not needed by no-comments:** the rest of pstack, including `poteto-agent`
  (poteto-mode's delegate; its `model:` line is a Cursor name), `setup-pstack` (it writes
  `~/.claude/rules/pstack-models.md`), `arena` (architect sends a large design there),
  `principle-fix-root-causes` and `principle-redesign-from-first-principles` (no-comments names
  them for intent only) and the skills poteto-mode's playbooks call (`swarm`, `interrogate`,
  `figure-it-out` and more). `/poteto-mode` run on its own finds those missing; here it is the
  reference no-comments reads.
- **Local lines:** the adapter names the agents and commands with the `personal-skills:` prefix
  instead of `pstack:`, in three rows (running another skill, the agent names, the
  `poteto-agent` model line). Nothing else is edited.
- **The guard:** poteto-mode's shipping, babysit, autopilot-full, autopilot-stack and
  opening-a-pr playbooks push branches and open or merge PRs, and worktree-cleanup deletes
  worktrees and simulators. Agents in the estate never push and use no worktrees, so those
  playbooks don't run here.
- **The conflict:** Comment Sicko deletes the comments house-style rule 24 asks for (why in
  full sentences, documented exports, dated decisions). house-style is unchanged. Run
  `/no-comments` by choice, on a scope you name, and read its diff before keeping it.
- **Models:** without `~/.claude/rules/pstack-models.md`, the adapter maps poteto-mode's
  defaults: Opus at xhigh for code, prose and judgment, Opus at high for small edits. It passes
  an `effort` on every spawn, which this library's rule turns down (decisions.md, "Review runs
  on Opus": a dispatch names a model, never an effort). The rule governs the library's own
  skills; inside a `/no-comments` run, pstack's routing applies as vendored.
- **Not shipped here:** the adapter's Paths row says the plugin ships pstack's `docs/guide/` and
  `README.md`; neither is vendored, so a pointer to them means the GitHub copy.

**security-audit** (MIT, Cloudflare) - the skill that seeded Cloudflare's vulnerability
discovery harness, read at `c1c8a8c` (2026-09-14, "Clarify guidance and full audit modes") and
vendored verbatim from `skills/security-audit/` at `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`: 20 files, byte for byte, including
its two zero-dependency validators and their tests. Its folder name already matches its
frontmatter `name`. The skill has two modes: guidance (the default, no files written) and a
six-phase full audit (reconnaissance and a coverage ledger, coverage-led hunting, candidate
validation by a fresh verifier, `findings.json` checked against `report-schema.json`,
independent record verification, a target-neutral report), which runs only when the user asks
for an audit or a report.

- **Left out:** the rest of upstream's repo (its README and LICENSE; the license is kept as
  `LICENSE-cloudflare`).
- **Validators:** `validate-findings.cjs` and `validate-coverage-ledger.cjs` use only `fs`,
  `path` and `util`, read the one file they are given and write nothing; their tests write
  only to a temporary folder and spawn `node` and `mkfifo`. Run them with
  `node --test skills/security-audit/*.test.cjs` (Node 24 reads a bare folder as one
  file; use the glob).
- **Routing:** `improve` points to it for a dedicated security audit, and `orchestrate` has a
  security audit intent. Nothing inside the vendored folder is edited.

**diagram-design** (MIT) — 39 editorial diagram types rendering to self-contained
HTML+SVG. PNG export needs Playwright + Chromium; some scripts need Python 3. It
*imports* Mermaid/draw.io but does not emit them.

**awesome-design-md** (MIT) — vendored complete: all 74 `DESIGN.md` files plus their
per-brand `README.md`, byte-identical to upstream. Each file is the upstream authors' *interpretation* of a public brand, not an
official design system; the brands are their owners' trademarks. See the skill's own
boundary section on reference-vs-imitation.

**modern-web-guidance** ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) for the guides; Apache-2.0 for upstream's code, none of
which is vendored) - 20 of upstream's 211 web platform guides, copied at `2b4aa13` into the
first-party `web-platform` skill, whose `SKILL.md` (the browser policy, seven rules and an index
of the 20) is written fresh. The research and the reasons are on
[corpus/wiki/modern-web-guidance-2026-11-23.md](corpus/wiki/modern-web-guidance-2026-11-23.md).
The licence notice, the credit to MDN Web Docs and the W3C, WHATWG and IETF specifications,
and upstream's `LICENSE` are in [LICENSE-modern-web-guidance](LICENSE-modern-web-guidance).

- **In:** from `skills/modern-web-guidance/guides/`, five in `performance/`
  (`performance`, `improve-next-page-load-performance`, `break-up-long-tasks`,
  `identify-inp-causes`, `defer-rendering-heavy-content`), four in `security/` (`security`,
  `sanitize-untrusted-html`, `trusted-types`, `validate-origins`), three in `forms/`
  (`ime-safe-enter-submit`, `autofill-sign-in-form`, `autofill-sign-up-form`), three in `js/`
  (`coordinate-global-events`, `capture-location-agnostic-data`,
  `calculate-event-differentials`), `accessibility/respect-os-text-scale`, three in
  `ui-behaviors/` (`same-document-transitions`, `cross-document-transitions`,
  `search-hidden-content`) and `ui-atoms/responsive-table`. About 190 KB, read one at a time.
- **Left out:** upstream's own `SKILL.md`, which runs the CLI on every web task; the CLI, its
  search, `legacy-scan` and the telemetry watchdog (`watchdog/main.js`), all in the npm package;
  the plugin manifests for nine agents and `policies/`; the `chrome-extensions` skill (no
  extension work here); and 191 guides. By category: `ui-components` (23, native dialog,
  popover, menu, select, tabs and toast, where base-ui rule 13 says Base UI), `css` (18,
  Tailwind and base-ui rule 5 own CSS structure), `visual-design` (22, Hallmark's,
  impeccable's and base-ui `theme.md`'s ground; the WebGL and canvas guides are gated upstream
  as origin-trial or volatile), `ui-behaviors` (37 more: dialog and top-layer behaviour is Base
  UI's, and the scroll, drag, swipe and motion effects were not picked), `forms` (16 more:
  control styling is Base UI's, validation display is `Field`'s), `performance` (21 more: the
  analytics and A/B guides have no user here, and image and LCP priority is covered by
  web-design-guidelines and Hallmark), `security` (13 more: the seven passkey guides wait until
  Ward wants passkeys), `ui-atoms` (12 more: `single-line-overflow` truncates content, which the
  design gates forbid), `accessibility` (3 more, covered by web-design-guidelines, impeccable
  and Hallmark), `js` (3 more, not picked), `built-in-ai` and `webmcp` (8: Chrome-only, and
  Wicket is the estate's one LLM door), and `html`, `privacy`, `pwa`, `wasm` and
  `user-experience` (15: web components aren't used, the rest is general or has no user).
- **Local lines:** `scripts/vendor-modern-web-guidance.mjs` makes the copy and every change. Each
  file gains a first line, an HTML comment with its upstream path, the commit and the licence.
  The 12 pointers that ran the CLI (`` `<id>` (via `npx -y modern-web-guidance@latest retrieve
  "<id>"`) ``) became links on the id: 7 relative links to vendored guides, 5 GitHub URLs at
  `2b4aa13` (`schedule-tasks-by-priority`, `local-network-access`,
  `secure-external-subresources`, `single-line-overflow`, `fluid-scaling`). The 3
  `import('https://esm.sh/temporal-polyfill')` lines in the Temporal guides became
  `import('temporal-polyfill')`. Nothing else differs from upstream. The script refuses to write
  when a copied line still holds `npx`, `@latest`, `unpkg.com`, `esm.sh`, `cdn.jsdelivr.net` or a
  pointer of another shape.
- **The guard:** never run `npx modern-web-guidance` (any version), never install its plugin or
  its skill, and never read a guide from upstream's `main`. A new pin is a reviewed diff: clone
  the commit into an empty scratch folder, read the change on the kept paths, rerun the script.

**vercel-labs/agent-skills** (MIT) — two of the nine skills vendored: `web-design-guidelines` and
`writing-guidelines`. Neither carries its rules: each is a ~39-line shim that fetches them from
[web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) and
[writing-guidelines](https://github.com/vercel-labs/writing-guidelines) on every run, so they
need network access. Since v0.68.0 each fetch reads `command.md` at a pinned commit, not `main`
(the two pins are the last rows of the table; `git ls-remote` gave the commits on 2026-11-24, so
the dates are the day they were read). **Local line:** the fetch URL in each `SKILL.md` has the
commit where upstream's shim has `main`. The fetched rules move only through
[docs/vendoring.md](docs/vendoring.md), Part 2. v0.62.0 removed the four self-contained React skills
(`composition-patterns`, `react-best-practices`, `react-native-skills`, `react-view-transitions`):
no session called them. They can be vendored again from upstream.

*Licensing note:* the repo ships **no `LICENSE` file**; MIT is declared in its `README.md`
and in the frontmatter of five of the nine skills. Vendored on that basis — if you want the
stricter reading, the two guidelines skills are trivially replaceable.

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
- **[multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)**
  (read at `2c60614`, 2026-04-20; no license file, so ideas only, no text copied) — the
  "surgical changes" and "simplicity first" principles from Andrej Karpathy's post on LLM
  coding pitfalls, behind the scope-discipline block, the "Noticed, not touched" list and
  the scope and proportion checks in `plan-split-dispatch`.
- **[mattpocock/skills](https://github.com/mattpocock/skills)** (MIT, read at `4ae2317`,
  2026-10-31; ideas only, no text copied) — the `diagnosing-bugs` method (the feedback loop
  first, ten ways to build one, stop and ask when none can be built, redaction) behind
  `diagnose`, and its guidance on writing for agents behind `docs/writing-skills.md`. The
  `diagnose` skill also follows obra/superpowers' `systematic-debugging` (root cause before
  any fix, one hypothesis at a time).
- **[pingdotgg/t3code](https://github.com/pingdotgg/t3code)** (MIT, read at `077fd622`,
  2026-11-09; ideas only, no text or code copied) - the shape of `evals/`: one folder per
  eval with a README (what it measures, how to run it, how to add a case, what a run
  costs), unit-tested graders, a gitignored `runs/`, evals never in CI, and a
  prompt-injection eval. The injection eval here is modelled on its `pr-content`.
  Superpowers' pressure scenarios and ECC's `skill-comply` compliance rates (see
  `stocktake`) are the idea behind the cases.
- **[thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)** (Apache-2.0, read at
  `ffab839`, 2026-11-09) — the progressive-disclosure index: a session starts with a compact
  index and fetches detail on demand. Idea only; `hooks/session-start.mjs` injects the
  corpus catalog, not automatic observations.
- **[mattpocock/skills](https://github.com/mattpocock/skills)** — the frontier-round
  interview method and "find facts yourself, ask only for decisions" rule in `grill-me`,
  plus the glossary/ADR discipline (`domain-modeling`, `grill-with-docs`) now expressed
  as `corpus/wiki/glossary.md` and the three-part decision test in `corpus-flow`.
- **[fastify/demo](https://github.com/fastify/demo)** (MIT) and **Matteo Collina's
  `fastify-best-practices`** in [mcollina/skills](https://github.com/mcollina/skills) (MIT) —
  the app and server split, plugin order, feature folders, schemas on every route and the
  production list behind `code-structure`; with mattpocock/skills' `setup-ts-deep-modules`
  for its import boundaries. Pins and dates are in `skills/code-structure/references/research.md`.

- **[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) 2.5.1** (`f6b7657`, MIT) -
  palettes and type dealt by the client's trade, and its copy layer (a fact sheet before
  the copy, a voice card per client, a budget for each rhetorical device, the rival test),
  written fresh for Hallmark runs in `design-md-library/references/dealt-by-trade.md` and
  `copy-layer.md`. No text, palette values or names copied; 2.5.1 itself is not vendored.

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

- **[affaan-m/ecc](https://github.com/affaan-m/ecc)** (MIT, read at `d2ef268`, ideas
  only, no code or text copied) — `skill-stocktake` (a quick scan of changed skills and a
  full pass in batches) behind the `stocktake` skill; `skill-comply` (scenarios at three
  levels of prompt strictness, scored by compliance) behind its scenario files; and
  `mcp-dependency-review` (a static check for unpinned MCP package references) behind
  `check-mcp-pins.mjs`.

## History

Through **v0.23.0** this plugin vendored an earlier frontend design suite. **v0.24.0**
removed all vendored code to leave a first-party workflow library; **v0.25.0** pruned
three unused skills. **v0.27.0** deliberately re-introduced vendoring for the design,
diagram, review and writing layers above, and **v0.28.0** added the Vercel suite plus the
`corpus-flow` §9 domain-modeling layer. All removals remain recoverable from git history.
