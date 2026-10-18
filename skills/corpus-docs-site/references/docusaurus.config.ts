import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

// The deployed base path, baked in rather than injected at deploy time: the
// deploy verifies it instead of setting it, so a wrong base fails the deploy by
// name. DOCS_BASE overrides it, for building a copy to serve somewhere else.
const baseUrl = process.env.DOCS_BASE ?? '/PROJECT/docs/'

const config: Config = {
  title: 'PROJECT',
  tagline: 'One line on what the project is.',
  url: 'https://example.org', // the origin; only used for absolute URLs (sitemap, og tags)
  baseUrl,
  // Directory-style URLs (/wiki/overview/ → wiki/overview/index.html), which is
  // what a sub-path static deploy serves and what Starlight sites already used.
  trailingSlash: true,
  // Opt in to the v4 behaviour now (Docusaurus Faster, CSS cascade layers,
  // namespaced storage) so the v4 upgrade is a version bump, not a migration.
  future: { v4: true },
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: {
    // .md (the synced corpus) parses as CommonMark, .mdx (hand-authored) as MDX.
    // 'mdx' for everything breaks on corpus prose: a bare `<` or `{` is JSX.
    format: 'detect',
    hooks: { onBrokenMarkdownLinks: 'throw' },
  },
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // docs-only site: no /docs/ prefix under the base
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  // Local, offline search (Starlight shipped Pagefind; Docusaurus ships nothing).
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      { hashed: true, docsRouteBasePath: '/', indexBlog: false, indexPages: false },
    ],
  ],
  themeConfig: {
    // Pick ONE of the three theme modes:
    //   light only : { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false }
    //   dark only  : { defaultMode: 'dark',  disableSwitch: true, respectPrefersColorScheme: false }
    //   both       : { defaultMode: 'light', disableSwitch: false, respectPrefersColorScheme: true }
    // With disableSwitch the inline script hard-codes the mode: no toggle, and a
    // stored preference is never read.
    colorMode: { defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false },
    navbar: {
      title: 'PROJECT',
      items: [{ href: 'https://github.com/OWNER/REPO', label: 'GitHub', position: 'right' }],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
