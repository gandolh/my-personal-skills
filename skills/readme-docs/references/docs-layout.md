# docs/ layout

`docs/` holds everything the README links to. The README stays short because this folder exists.

```
docs/
├── README.md           index — always
├── images/             every image the README or docs embed — always when there are images
│   └── shots.md        how each image was made — always when there are images
├── diagrams/           diagram sources that are not themselves the embedded file
├── getting-started.md  full local setup — when there is something to set up
├── architecture.md     how it works — when there is code worth explaining
└── <topic>.md          deploy.md, configuration.md, usage.md ... — only with real content
```

## Rules

- **Images live in `docs/images/`, nowhere else.** The README never points at `assets/`, `public/` or a root-level PNG. If an old image elsewhere is still used, move it here and fix the links. Pick this one name; do not keep a second `screenshots/` folder.
- **Names are lowercase and hyphenated**, and say what they show: `hero.webp`, `library-grid.webp`, `reader-mobile.webp`, `checkout-flow.gif`, `architecture.svg`.
- **`docs/diagrams/` is for sources** — Mermaid `.mmd` files, archify JSON, the HTML a hero was rendered from. A hand-written SVG that the README embeds directly goes in `images/`, since it is both source and output.
- **One home per fact.** If the project already has a wiki (`corpus/wiki/`) or a docs site, `architecture.md` is a one-screen overview that links to those pages; it does not copy them.
- **Move, don't delete.** Content cut from the old README lands in a docs file with a pointer left behind.
- **No empty files.** Do not create `deploy.md` or `configuration.md` just to fill the shape.

## When `docs/` is already a docs-site workspace

Some repos use `docs/` as the package that builds a documentation website (Starlight, Docusaurus, VitePress: a `package.json`, `astro.config.*` and `src/` inside `docs/`). Do not move or rename it; the build and the deploy depend on that path.

In that case:

- Add `docs/README.md` and `docs/images/` beside the site files. The site build ignores both.
- The guides stay in the site's content folder (`docs/src/content/docs/` for Starlight). The README links to the deployed site page and, for readers on GitHub, the source file.
- Existing `docs/diagrams/` sources keep feeding the site. For the README, export a static SVG or PNG of the diagram into `docs/images/`; interactive HTML diagrams do not render on GitHub.
- Do not add `getting-started.md` or `architecture.md` at the `docs/` root if the site already has those pages. Link the site pages instead.

## When docs live somewhere else already

If the repo keeps Markdown guides in another folder (`docs/<area>/`, a sibling `docs-site/`), keep them where they are and list them in `docs/README.md`. Do not duplicate.

## `docs/README.md` template

```markdown
# <Project> docs

Start with the [main README](../README.md). This folder holds what it links to.

| File | What it covers |
|---|---|
| [getting-started.md](getting-started.md) | Full local setup: prerequisites, env vars, running, tests |
| [architecture.md](architecture.md) | How the parts fit together |
| [images/](images/shots.md) | Screenshots and diagrams used in the README, and how each was made |

Going deeper:

- Docs site: <https://...> (built from <path>)
- Project wiki: [corpus/](../corpus/index.md) — decisions, status, roadmap
```

Drop rows that do not apply. Add a row per topic file.

## `docs/images/shots.md` template

```markdown
# README images

How each image was made, so the next refresh is a re-run. Re-take an image when the screen it shows changes.

| File | Shows | How to reach that state | Viewport | Data | Taken |
|---|---|---|---|---|---|
| hero.webp | Library grid with covers | `npm run dev`, open /app/, sign in | 1440×900 @2x | seed data (`npm run seed`) | 2026-10-09 |
| checkout.gif | Adding an item and paying | same, then click "Add" on the first item | 1280×800 | seed data | 2026-10-09 |
| architecture.svg | Request flow | hand-written SVG, source in this folder | — | — | 2026-10-09 |

Capture method: <tool and command>, see the readme-docs skill's capture guide.
```

## `getting-started.md` shape

1. Prerequisites (runtime and version, services, accounts) — as a list.
2. Install.
3. Configure: env vars as a table with name, purpose and where to get the value. Never the value of a secret.
4. Run (dev), with the URL to open.
5. Test, lint, typecheck.
6. Common problems, if any are known.

## `architecture.md` shape

1. One paragraph: the parts and what each does.
2. A Mermaid diagram (GitHub renders ```` ```mermaid ```` blocks) or an SVG from `images/`.
3. The main flow, step by step, in five to eight lines.
4. Where to read more: wiki pages, docs-site pages, key source files.

Keep it to one screen. Depth lives in the wiki.
