---
name: corpus-docs-site
description: Scaffold a Docusaurus documentation site into a corpus-flow project — the NARRATIVE (architecture, decisions, status, roadmap) rendered from the corpus/ wiki, and the API REFERENCE generated from the TypeScript (Compodoc for a NestJS backend, TypeDoc for a package's public barrel), wired as one monorepo task so both stay current. Also migrates an existing Starlight site of this shape to Docusaurus without changing its URLs. Use when the user says "write docs for this project", "build a docs site", "docs from the corpus", "generate API docs", "a docs site like the OS one", "move the docs to Docusaurus", "migrate off Starlight", or "/corpus-docs-site". Assumes a corpus/ (see corpus-flow) and a TypeScript codebase; adapts the reference half to whatever exists.
---

# Corpus Docs Site (Docusaurus + generated reference)

Drop a documentation site into any **corpus-flow** project. Two halves, kept
honest by construction:

- **Narrative → rendered.** Architecture, decisions, status, roadmap already
  live as markdown in `corpus/wiki/` (+ `status.md`, `log.md`). A sync script
  renders them into the site. Design intent is *authored*, never
  reverse-engineered from code.
- **Reference → generated.** Module/route/DI graphs and the public API surface
  are *in the code*. Generators emit them on every build so they can't drift:
  **Compodoc** for a NestJS backend, **TypeDoc** for a TypeScript package's
  public barrel. Both emit static HTML that the site links to.

The house style is **short and graphic** (a hero, stat tiles, card grids, one
archify diagram per mechanism) in the project's own visual language, **light
only** unless the project's design says otherwise.

**Migrating an existing Starlight site?** Read
[`references/migrating-from-starlight.md`](references/migrating-from-starlight.md)
first. It holds the verified file/config/content maps and ten gotchas from a real
port. Then follow the phases below as a checklist, keeping the site's URLs.

## When to use / not

- **Use:** a project that already has a `corpus/` (or will — bootstrap it with
  `corpus-flow` first) and TypeScript source, and wants a browsable docs site
  that regenerates from source. Ideal for the corpus-flow + monorepo shape
  (npm workspaces + turbo/nx), with a NestJS backend and/or a shared TS package.
- **Don't use:** a project with no corpus (use `corpus-flow` to create one, or
  just write a README); a non-TypeScript codebase (the reference half won't
  apply — you can still do the narrative half); or when the user explicitly
  wants a single throwaway HTML file (hand-render one page, don't scaffold a
  framework).

## Prerequisites (verify first)

- **Node ≥ 20** (`@docusaurus/core` 3.10 engines; Compodoc 2.x needs ≥ 20.19).
- A `corpus/` at the repo root with a `wiki/` directory (and usually
  `status.md`, `log.md`). If absent, run `corpus-flow` first — this skill
  *renders* a corpus, it doesn't invent one.
- The task runner in use (turbo, nx, or plain npm workspaces) and the
  workspace globs in the root `package.json`.

Confirm versions before installing (they move): `npm view @docusaurus/core
version engines`, `npm view typedoc peerDependencies` (TypeDoc must support the
repo's TypeScript major), `npm view @compodoc/compodoc engines`.

## Procedure

### Phase 0 — Detect the project shape (report before writing)

Inspect and decide:
- **Corpus pages:** list `corpus/wiki/*.md` + whether `status.md`/`log.md`
  exist. These become the narrative pages (the sync script auto-discovers them).
  Grep the corpus for links that leave the repo (`](../../../`) — each sibling
  needs an `OTHER_REPOS` entry or is reduced to text. List any page that should
  stay unpublished (working notes, backlogs, history snapshots) for `DENY`.
- **Backend reference?** Is there a NestJS app (a `nest-cli.json`, `@nestjs/*`
  deps, a `tsconfig.json`)? → Compodoc applies. Note its path + tsconfig.
- **Package reference?** Is there a TS package with a deliberate *public barrel*
  (e.g. `apps/core/src/index.ts`, an `exports`/`types` entry)? → TypeDoc applies.
  Note the entry point + the tsconfig that compiles it.
- **Where the site lives:** a new workspace package, conventionally
  `apps/docs/` (or `docs-site/` when `docs/` is taken). **Check existing
  workspace package names for a collision** before naming it — see Gotchas.
- **Base path** if it deploys under a sub-path (e.g. `/<project>/docs/`).
- **Theme mode** — light only, dark only, or both — and the accent + faces, from
  the project's design doc if it has one.

Tell the user the detected shape (which reference generators apply, the site
path, the base, the theme mode) before scaffolding.

### Phase 1 — Scaffold the site package

Create the site directory (`apps/docs/` below). Copy the reference files:

| From `references/` | To |
|---|---|
| `docusaurus.config.ts` | `apps/docs/docusaurus.config.ts` |
| `sidebars.ts` | `apps/docs/sidebars.ts` |
| `custom.css` | `apps/docs/src/css/custom.css` |
| `sync-corpus.mjs` | `apps/docs/scripts/sync-corpus.mjs` |
| `Metrics.tsx` + `Metrics.module.css` | `apps/docs/src/components/` |
| `Cards.tsx`, `Hero.tsx` | `apps/docs/src/components/` |
| `Diagram.tsx` + `build-diagrams.mjs` | `src/components/` + `scripts/` (only if the site embeds archify diagrams) |
| `typedoc.json` | `apps/docs/typedoc.json` (only if TypeDoc applies) |

Then edit the placeholders: `PROJECT`/`OWNER/REPO`, `baseUrl`, and `colorMode` in
`docusaurus.config.ts`; `GITHUB_REPO`, `OTHER_REPOS` and `DENY` in `sync-corpus.mjs`; the
accent ramp in `custom.css` and `Metrics.module.css`; `entryPoints`/`tsconfig`/
`name` in `typedoc.json`.

**`apps/docs/package.json`** — name it to avoid a collision (Gotchas), **no
`"type": "module"`**, keep the `browserslist`, and include only the generators
that apply. The full template, with the reasons, is in the migration guide's
"Package and scripts". The scripts:

```jsonc
{
  "sync-corpus": "node scripts/sync-corpus.mjs",
  "diagrams": "node scripts/build-diagrams.mjs",
  "ref:core": "typedoc",
  "ref:backend": "compodoc -p ../backend/tsconfig.json -d static/reference/backend -n \"Backend API\" --hideGenerator --coverageTest 35 --theme material",
  "ref": "npm run ref:core && npm run ref:backend",
  "prestart": "npm run sync-corpus && npm run diagrams",
  "start": "docusaurus start",
  "dev": "npm run start",
  "docs": "npm run sync-corpus && npm run diagrams && npm run ref && docusaurus build --out-dir dist",
  "typecheck": "tsc",
  "clear": "docusaurus clear"
}
```

**`apps/docs/tsconfig.json`:**
```json
{
  "extends": "@docusaurus/tsconfig",
  "compilerOptions": { "baseUrl": ".", "ignoreDeprecations": "6.0", "strict": true },
  "exclude": [".docusaurus", "build", "dist", "static"]
}
```

`docusaurus.config.ts` sets the decisions that matter: `routeBasePath: '/'`
(docs-only, no `/docs/` prefix under the base), `trailingSlash: true`
(directory-style URLs), `markdown.format: 'detect'` (the corpus parses as
CommonMark, hand-authored `.mdx` as MDX), `onBrokenLinks: 'throw'`,
`future: { v4: true }`, local search, and one of the three `colorMode` settings.

### Phase 2 — Author the few hand-written pages (short + graphic)

Keep these punchy — the deep prose is the synced corpus. Write `.mdx`, import
components as `@site/src/components/X`:
- **The landing page.** `src/pages/index.mdx` with `<Hero>` + a `<Metrics>` row +
  a `<CardGrid>` of 3–4 "core ideas" + a two-card "docs in two halves" block. A
  page has no docs sidebar (the old Starlight "splash"); with `routeBasePath: '/'`
  there must then be **no** doc with `slug: /`. Prefer `docs/index.mdx` +
  `slug: /` instead when the landing should keep the sidebar.
- **`docs/architecture.mdx`** — one-line thesis + one diagram (an archify
  artifact through `<Diagram>`, or a bespoke React component with a CSS module) +
  card grids for the key concepts + admonitions linking into `/wiki/` for depth.
- **`docs/reference.mdx`** — two cards linking to the generated reference with
  `href="pathname:///reference/backend/"` (static HTML must use `pathname://`),
  the regenerate command, and one admonition on the coverage gate.

Built in, no new deps: admonitions (`:::note[Title]`, `:::tip`, `:::caution`,
`:::danger`), `@theme/Tabs` + `@theme/TabItem`, code blocks with `title="…"` and
`{2,4}` line highlights, Infima's `badge` and `button` classes. Root-absolute
links (`/wiki/status/`) get the base added automatically.

### Phase 3 — Wire the monorepo + gitignore

- Add the site to the root `package.json` `workspaces` (e.g. `"apps/docs"`).
- Add a root script. **turbo:** `"docs": "turbo run docs"` (note `run` — see
  Gotchas) and a `docs` task in `turbo.json` with `inputs` covering `docs/**`,
  `src/**`, `static/**`, `scripts/**`, `docusaurus.config.ts`, `sidebars.ts`,
  `typedoc.json`, the referenced `../<pkg>/src/**`, and `../../corpus/**`;
  `outputs` = `dist/**`, `static/reference/**`. **nx/npm:** an equivalent target.
- **Gitignore the generated artifacts** (they rebuild): `apps/docs/dist/`,
  `apps/docs/.docusaurus/`, `apps/docs/static/reference/`, `apps/docs/docs/wiki/`,
  plus Compodoc's stray `.compodoc/` / `documentation/` if they appear. archify
  output in `static/diagrams/` is committed (archify is not an npm dependency).
- Add an `apps/docs/README.md` stating the two-halves contract and "edit the
  corpus, not `docs/wiki/`".

### Phase 4 — Install, run, verify

```bash
npm install                    # from repo root (registers the new workspace)
cd apps/docs && npm run docs   # sync + generate reference + docusaurus build
npm run typecheck
```
Then **verify visually** — this house style is a visual deliverable. Serve
`dist/` under its base path with a plain static server, **not**
`docusaurus serve` (it mangles hashed font URLs with `trailingSlash: true`):
```bash
mkdir -p /tmp/serve/PROJECT && ln -sfn "$PWD/dist" /tmp/serve/PROJECT/docs
python3 -m http.server 3418 --directory /tmp/serve   # http://localhost:3418/PROJECT/docs/
```
Open the landing, the architecture page and one synced corpus page; screenshot.
Check: the project's background and faces (not Docusaurus blue and system
fonts — see Gotchas), the theme mode (no toggle when light/dark only), stat
tiles legible, diagram loads, a search query returns results, and
`/reference/…` loads. Confirm the root `npm run docs` is green too.

## Gotchas (hard-won — do not relearn)

1. **Package-name collision.** Corpus projects often already have a `docs`
   workspace. Naming the site package `@scope/docs` fails npm install with
   `EDUPLICATEWORKSPACE`. Use `@scope/docs-site`. Check existing names first:
   `grep -r '"name"' apps/*/package.json`.
2. **No `"type": "module"` in the site package.** It breaks `docusaurus build`
   with `require.resolveWeak is not a function`.
3. **Keep `browserslist` in the site package.** Without it, `future.v4`'s CSS
   cascade layers get polyfilled per file and Infima's tokens outrank every
   `--ifm-*` override in `custom.css`: the site renders Docusaurus-blue.
4. **`turbo docs` is ambiguous** — turbo reads `docs` as a subcommand and errors
   (`required arguments: <QUERY>`). Use **`turbo run docs`**.
5. **Corpus frontmatter ≠ Docusaurus frontmatter.** Corpus pages use
   `summary:`/`updated:`; the sync derives `title` from the first `# H1` (and
   strips it), maps `summary` → `description`, and adds a "rendered from" note.
   Don't point the docs plugin at `corpus/` directly.
6. **`markdown.format: 'detect'`, always.** As MDX, most real corpora fail on a
   bare `<` or `{` in prose.
7. **Cross-repo corpus links fail the build** (`onBrokenMarkdownLinks: 'throw'`).
   Map each sibling checkout in `OTHER_REPOS`; anything unmapped becomes plain
   text with a warning. That is the sync working, not a bug to silence.
8. **Static HTML needs `pathname://`.** TypeDoc/Compodoc/archify output is not a
   Docusaurus route; a plain `/reference/core/` link goes through the router and
   404s. `pathname:///reference/core/` keeps the base and opens a new tab.
9. **Compodoc has no `--disableCoverage=false` flag.** Coverage is on by
   default; set `--coverageTest <n>` **just below the current coverage** (run
   once, read the %, set a hair under it). Ratchet it up over time.
10. **TypeDoc rejects unknown config keys** (no notes field in `typedoc.json` —
    put rationale in the README). Its coverage is **warnings** by default
    (`validation.notDocumented`); flip `treatWarningsAsErrors: true` only once
    the barrel is documented.
11. **Never edit `docs/wiki/*`** — it's overwritten every sync. The source is
    `corpus/`.
12. **The generated reference sub-sites have their own theming.** Compodoc's
    `material` theme is light; **TypeDoc follows the visitor's OS preference**.
    For a strict light-only site, inject a small `customCss` into TypeDoc that
    forces its light variables. Mention the trade-off rather than silently
    leaving a dark-mode escape.
13. **Styling hooks.** Underline prose links on `.markdown a`, not with
    `--ifm-link-decoration` (that also underlines the sidebar). Style "you are
    here" on `.menu__link[aria-current='page']`, not `.menu__link--active` (Infima
    also puts that on the parent category).
14. **Deploying with vps-deploy:** hashed assets live under `<base>assets/`, so
    the `DocsSite` stack takes `assetDir: "assets"` (Starlight's was `_astro`).

## Deliverables checklist

- [ ] Site package scaffolded; workspace + root `docs` script + turbo/nx task.
- [ ] `sync-corpus.mjs` renders every `corpus/wiki/*` (+ status/log); links
      resolved; cross-repo links mapped or reduced; generated dir gitignored.
- [ ] Reference generated for each half that applies (Compodoc / TypeDoc) into
      `static/reference/`; coverage threshold set just under current.
- [ ] Theme mode set in `colorMode`; project tokens win over Infima's.
- [ ] Landing + architecture + reference pages authored, short and graphic.
- [ ] `npm run docs` green from root with `onBrokenLinks: 'throw'`;
      `npm run typecheck` clean; verified in a browser under the base path.

## Diagrams and prose quality

Two companion skills finish the docs rather than duplicate them:

- **`archify` / `diagram-design`** — the narrative half of a docs site is where a
  diagram earns its place: architecture, data flow, lifecycle, decision trees.
  Keep the archify JSON in `diagrams/`, compile it with `build-diagrams.mjs`
  into `static/diagrams/`, and embed it with `<Diagram name title caption />`.
  Prefer one diagram that shows the real mechanism over three that restate the
  headings. Regenerate when `corpus/wiki/architecture.md` changes — a diagram that
  disagrees with the page it sits on is worse than no diagram.
- **`writing-guidelines`** — run over `docs/` and `src/pages/` before a docs
  release. Because the narrative is *generated from* `corpus/wiki/`, findings
  usually belong upstream: fix the wiki page, re-run the sync, don't patch the
  rendered output. Terminology findings in particular are a
  `corpus/wiki/glossary.md` problem.
