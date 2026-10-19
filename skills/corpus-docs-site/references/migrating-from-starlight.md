# Migrating a Starlight docs site to Docusaurus

The recipe for moving an existing `corpus-docs-site` site (Astro + Starlight) to
Docusaurus without changing what it publishes: same base path, same page URLs,
same `dist/` directory, same corpus sync, same generated reference.

**Verified 2026-10-18** on Docusaurus 3.10.2 (React 19, Node 24): a deployed
light-only docs site was ported end to end and served under its `/PROJECT/docs/`
base by a plain static server, and ten real corpora (from ten repos with a
Starlight site) were built through the new sync script. Every gotcha below was
hit during that run, not predicted. There is no official Starlight → Docusaurus guide (Astro documents only
the opposite direction), so this file is the reference.

## What stays the same

- **The URLs.** `baseUrl` takes the old `base`, and `trailingSlash: true`
  reproduces Starlight's `/wiki/overview/` → `wiki/overview/index.html` layout.
  Compare the set of `index.html` files before and after (see Verify); the only
  addition should be `/search/`.
- **The deploy contract.** `docusaurus build --out-dir dist` writes to the same
  `dist/`. The base is still baked into the config and overridable by
  `DOCS_BASE`.
- **The two halves.** The corpus sync still renders `corpus/` (into `docs/wiki/`
  instead of `src/content/docs/wiki/`), and TypeDoc/Compodoc still emit static
  HTML (into `static/reference/` instead of `public/reference/`).

## What changes, and what it costs

| | Starlight | Docusaurus |
|---|---|---|
| Hashed assets | `<base>_astro/` | `<base>assets/{js,css,fonts}/` — vps-deploy's `generator` must follow |
| Search | Pagefind, built in | `@easyops-cn/docusaurus-search-local` (offline, no service) |
| Code blocks | Expressive Code (frames, terminal chrome) | Prism; `title="…"` and `{2,4}` line highlights still work, frames do not |
| Root-absolute links in MDX | **not** prefixed with `base` (they 404 under a sub-path) | prefixed with `baseUrl` automatically |
| Broken links | silent | `onBrokenLinks` / `onBrokenMarkdownLinks: 'throw'` fail the build |
| Light-only | two component overrides | three `colorMode` keys |
| Page JS | near zero | a React SPA (hydrated, client-side navigation) |
| Build time | — | ~6 s for a 12-page site with Docusaurus Faster (Rspack) |
| Install | — | ~1,300 packages, ~460 MB `node_modules` for the docs package alone |

## File map

| Starlight | Docusaurus |
|---|---|
| `astro.config.mjs` | `docusaurus.config.ts` + `sidebars.ts` |
| `src/content.config.ts` | delete |
| `src/content/docs/*.mdx` | `docs/*.mdx` |
| `src/content/docs/index.mdx` (`template: splash`) | `src/pages/index.mdx` with `<Hero>` (a page has no docs sidebar, like splash), **or** `docs/index.mdx` with `slug: /` if it should keep the sidebar |
| `src/content/docs/wiki/` (generated) | `docs/wiki/` (generated) |
| `public/` | `static/` |
| `src/styles/theme.css` | `src/css/custom.css` |
| `src/components/*.astro` | `src/components/*.tsx` (+ `*.module.css` for scoped styles) |
| `ThemeProvider.astro`, `ThemeSelect.astro` | delete — `themeConfig.colorMode` |
| `tsconfig.json` (`astro/tsconfigs/strict`) | `extends: "@docusaurus/tsconfig"` |
| `.astro/` (cache) | `.docusaurus/` (cache) |

## Config map

| `starlight({ … })` | Docusaurus |
|---|---|
| `title` | `title` and `themeConfig.navbar.title` |
| `tagline` / `description` | `tagline` |
| `base` (Astro) | `baseUrl` (keep the `DOCS_BASE ??` form) |
| `site` (Astro) | `url` |
| `customCss` | `presets[classic].theme.customCss` |
| `social: [{ icon: 'github', href }]` | `navbar.items: [{ href, label: 'GitHub', position: 'right' }]` |
| `sidebar` group `{ label, items }` | `{ type: 'category', label, collapsible: false, items }` |
| sidebar `{ label, link: '/wiki/x/' }` | `{ type: 'doc', id: 'wiki/x', label }` — checked at build time |
| sidebar link to static HTML, `attrs: { target: '_blank' }` | `{ type: 'link', label, href: 'pathname:///reference/x/' }` — opens in a new tab and keeps the base |
| `components: { ThemeProvider, ThemeSelect }` | `colorMode` (below) |

**Theme modes.** There are three, and each maps to one setting:

| Mode | `themeConfig.colorMode` |
|---|---|
| light only | `{ defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }` |
| dark only | `{ defaultMode: 'dark', disableSwitch: true, respectPrefersColorScheme: false }` |
| both, with a toggle | `{ defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true }` |

With `disableSwitch: true` the inline script hard-codes the mode. Verified: no
toggle renders, and a stored `theme=dark` is ignored.

## Content map

**Frontmatter.** `title`, `description`, `slug` carry over. Then:

| Starlight | Docusaurus |
|---|---|
| `tableOfContents: false` | `hide_table_of_contents: true` |
| `tableOfContents: { maxHeadingLevel: 3 }` | `toc_max_heading_level: 3` |
| `sidebar: { label, order }` | `sidebar_label`, `sidebar_position` |
| `template: splash` + `hero:` | move to `src/pages/`, render `<Hero title tagline actions />` |
| `hero.actions[].variant` primary / secondary / minimal | `Hero` maps them to `button--primary` / `button--secondary` / a plain link |

**Admonitions.** `:::note[Title]`, `:::tip`, `:::caution`, `:::danger` are the same
syntax in both. Inline code in the title carries over only in `.mdx` pages; see
gotcha 11.

**Starlight components** (`@astrojs/starlight/components`):

| Starlight | Docusaurus |
|---|---|
| `Card`, `CardGrid` | `references/Cards.tsx` (`import { Card, CardGrid } from '@site/src/components/Cards'`) — the `icon` prop is dropped |
| `LinkCard` | `<Card title href>` |
| `Aside` | an admonition |
| `Tabs`, `TabItem` | `@theme/Tabs`, `@theme/TabItem` — every `TabItem` needs a `value` |
| `Steps` | an ordered list (optionally wrapped in a styled `<div className="doc-steps">`) |
| `Badge` | `<span className="badge badge--secondary">…</span>` (Infima) |
| `Icon` | drop, or inline the SVG |

**Local Astro components → React.** `class` → `className`; the scoped
`<style>` → a CSS module (`X.module.css`, `import styles from './X.module.css'`);
`Astro.props` → function props; `import.meta.env.BASE_URL` → `useBaseUrl()` from
`@docusaurus/useBaseUrl`; the `not-content` class → nothing (Docusaurus does not
restyle custom components). MDX imports change from a relative
`'../../components/X.astro'` to `'@site/src/components/X'`. Literal HTML in MDX
(`<dl class="doc-facts">`) keeps working.

**Links.** Root-absolute links in MDX (`/wiki/overview/`) get the base added, and
so do `<Card href>` and `<Link to>`. Static HTML (TypeDoc, Compodoc, archify
diagrams opened full-screen) must use `pathname:///reference/core/`; a plain
`/reference/core/` goes through the router and 404s.

## Package and scripts

```jsonc
{
  "name": "@scope/docs-site",
  "private": true,
  // NO "type": "module" — see gotcha 1. The scripts are .mjs and don't need it.
  "scripts": {
    "sync-corpus": "node scripts/sync-corpus.mjs",
    "diagrams": "node scripts/build-diagrams.mjs",
    "ref": "typedoc",
    "prestart": "npm run sync-corpus && npm run diagrams",
    "start": "docusaurus start",
    "dev": "npm run start",
    "docs": "npm run sync-corpus && npm run diagrams && npm run ref && docusaurus build --out-dir dist",
    "typecheck": "tsc",
    "clear": "docusaurus clear"
  },
  "dependencies": {
    "@docusaurus/core": "^3.10.2",
    "@docusaurus/faster": "^3.10.2",
    "@docusaurus/preset-classic": "^3.10.2",
    "@easyops-cn/docusaurus-search-local": "^0.55.3",
    "@mdx-js/react": "^3.1.0",
    "clsx": "^2.1.1",
    "prism-react-renderer": "^2.4.1",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "^3.10.2",
    "@docusaurus/tsconfig": "^3.10.2",
    "@docusaurus/types": "^3.10.2",
    "@types/react": "^19.2.0",
    "typescript": "~6.0.2"
  },
  // Keep this — see gotcha 2.
  "browserslist": {
    "production": [">0.5%", "not dead", "not op_mini all"],
    "development": ["last 3 chrome version", "last 3 firefox version", "last 5 safari version"]
  },
  "engines": { "node": ">=20.0" }
}
```

Drop `astro`, `@astrojs/starlight`, `sharp` and `cookie` from the docs package —
but first grep the rest of the workspace for imports of `sharp`/`cookie` that
were resolving through the docs package's hoisted copy, and declare them where
they are used. Keep `typedoc` / `@compodoc/compodoc` / `@fontsource*` as they are.
A repo that pins exact versions keeps pinning them (drop the `^`).

- **Corpus sync.** Use `references/sync-corpus.mjs` when the site's script is the
  stock one. It discovers pages instead of reading a list, so a site that kept
  a hand-written list will publish every wiki page it left out. Diff the old
  list against `corpus/wiki/` first, and put each page that was left out on
  purpose into `DENY`; the rest are new routes, which is the point. When a site renders extra sources (ADRs, `docs/**`, a site's own
  `README.md`/`DESIGN.md`), keep its page list and port only the output: the
  directory (`docs/…`), the frontmatter keys (`toc_max_heading_level`, not
  `tableOfContents`), and the link rewriting (file links for rendered pages,
  repo URLs for the rest, cross-repo links through `OTHER_REPOS`).
- **Diagrams.** `build-diagrams.mjs` writes to `static/diagrams/` instead of
  `public/diagrams/`; move the committed artifacts with `git mv`.
- **TypeDoc / Compodoc.** `out` / `-d` → `static/reference/…`.

## Gotchas (each one hit during the verification run)

1. **`"type": "module"` in the docs package breaks the build** —
   `TypeError: require.resolveWeak is not a function` during SSG. The Starlight
   scaffold has it. Remove it; the `.mjs` scripts are ESM by extension and
   `docusaurus.config.ts` is loaded by Docusaurus itself.
2. **Without `browserslist`, `custom.css` silently loses to Infima.** With
   `future.v4`, Infima lives in a CSS cascade layer. Browserslist's defaults
   include browsers without `@layer`, so `postcss-preset-env` polyfills it per
   file and gives Infima's `:root` a specificity of `:root:not(#\#):not(#\#)`,
   which beats every `--ifm-*` override. Symptom: the site renders in Docusaurus
   blue and system fonts while your own `--color-*` tokens are defined. Fix: the
   template's `browserslist` (above), in the docs package itself.
3. **`markdown.format: 'detect'` is required.** Built as MDX, 8 of the 10 test
   corpora fail to compile (a bare `<` or `{` in prose). As `.md` (CommonMark),
   all ten build.
4. **Links that leave the repo fail the build.** Four of the test corpora link
   into a sibling checkout (`../../../auth-service/corpus/wiki/overview.md`). The
   old Starlight sync turned those into a wrong `blob/main/corpus/auth-service/…`
   URL that 404s on GitHub. Docusaurus refuses an unresolvable `.md` link. The new
   sync maps a sibling through `OTHER_REPOS` (local directory name → GitHub repo
   URL; the two need not match) and reduces anything unmapped to its link text,
   with a warning.
5. **Link text wraps.** `[brief⏎74](../briefs/…)` is one link across two lines; a
   line-by-line rewrite misses it and the build fails on the raw `../briefs/` link.
   The sync matches over whole prose blocks, skipping fenced code.
6. **`docusaurus serve` is not a faithful preview with `trailingSlash: true`.** It
   redirects hashed files such as `x.woff2` to `x.woff2/` (404), and search hangs
   on "loading". Preview `dist/` the way Caddy serves it — any static server
   mounted at the base path:
   ```bash
   mkdir -p /tmp/serve/PROJECT && ln -sfn "$PWD/dist" /tmp/serve/PROJECT/docs
   python3 -m http.server 3418 --directory /tmp/serve   # → http://localhost:3418/PROJECT/docs/
   ```
7. **`--ifm-link-decoration: underline` underlines the sidebar, TOC and navbar.**
   Put the underline on `.markdown a`.
8. **`.menu__link--active` is also on the current page's parent category.**
   Styling it as an inverted "you are here" cell paints the category label
   invisible. Target `.menu__link[aria-current='page']`.
9. **Broken anchors are now reported** (as warnings). Three of the ten test
   corpora had a few stale `#anchor` links that Starlight never mentioned. Fix
   them in the corpus, not in the rendered page.
10. **Doc ids drop numeric prefixes.** A file named `01-intro.md` becomes the id
    and URL `intro`. No corpus here uses them; a site that does needs `slug:`.

Found in the estate-wide migration (2026-10-19):

11. **Inline code in a `.md` admonition title breaks the title.** Under
    `format: 'detect'`, `:::note[Rendered from \`corpus/x.md\`]` renders a
    heading that reads "note" with the title pushed into the body. Keep
    titles in synced pages plain text; the reference sync does.
12. **A page named `readme.md` takes its folder's URL.** Docusaurus serves
    `wiki/readme.md` at `/wiki/`, not `/wiki/readme/`. A sync that publishes a
    README must write `slug:` into its front matter to keep the old URL.
13. **TypeScript 6 rejects `@docusaurus/tsconfig`'s `baseUrl`** (TS5101). Set
    `"ignoreDeprecations": "6.0"` in the docs `tsconfig.json`, as the
    template in SKILL.md does.
14. **Build through the workspace script.** `npx docusaurus build docs` from the
    repo root skips the docs package's `browserslist`, and the site comes out
    in Docusaurus blue (gotcha 2). Use `npm run docs -w <docs package>`.
15. **Prism sets each code block's background inline.** A themed code
    background in `custom.css` needs `!important` to win.
16. **Compodoc's `--coverageTest` stops before writing HTML.** Run the gate as
    its own script, then generate; SKILL.md's scripts show the split.

## Deploy (vps-deploy)

`DocsSite` asserts that `index.html` references `<base>_astro/` for Starlight or
`<base>assets/` for Docusaurus. A migrated site's `DocsStack` in `app.ts` must
set `generator: "docusaurus"` before its next deploy (the default is still
`"starlight"`), or the deploy fails with `(a Starlight build) — wrong build
base` even though the base is right.

## Verify (acceptance for any migrated site)

1. **URL parity.** Before touching anything, record the old routes:
   `(cd dist && find . -name index.html | sort) > /tmp/routes-before.txt`. After
   the migration, the same command must produce the same list plus
   `./search/index.html`.
2. `npm run docs` exits 0 with `onBrokenLinks: 'throw'`, and the sync prints no
   "link leaves the repo" warning that was not deliberately accepted.
3. `grep -c '<base>assets/' dist/index.html` is non-zero (what vps-deploy checks).
4. In a browser, under the base path (gotcha 6): the landing page, one synced
   corpus page, one hand-authored page, an archify diagram, `/reference/…` if the
   site has one, and a search query that returns results. Check the theme mode
   (no toggle on light-only and dark-only sites; the toggle works on a both-modes
   site) and that the custom fonts load (no 404s in the network panel).
5. `npm run typecheck` (tsc) is clean in the docs package.

## Sources

- Docusaurus config reference — https://docusaurus.io/docs/api/docusaurus-config
- Docusaurus 3.10 release notes — https://docusaurus.io/blog/releases/3.10
- Routing, `pathname://` and docs-only mode — https://docusaurus.io/docs/advanced/routing
- Sidebar items — https://docusaurus.io/docs/sidebar/items
- Static assets — https://docusaurus.io/docs/static-assets
- Astro's guide for the opposite direction — https://docs.astro.build/en/guides/migrate-to-astro/from-docusaurus/
