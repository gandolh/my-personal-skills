---
summary: Whether GoogleChrome/modern-web-guidance (asked 2026-11-23) helps the estate and how to bring it in - what it is (211 guide files, a CLI run through npx, plugins for nine agents), why installing it is risky (the newest npm release runs on every web task, telemetry to Google, output that steers the agent), which 20 guides fit the stack and what our skills already cover, the browser policy it needs, the licence (CC BY 4.0 for the guides), and how to take updates without auto-update. Verdict - vendor 20 guides pinned into a new web-platform skill (briefs 44 and 45).
updated: 2026-11-24
---

# modern-web-guidance, 2026-11-23

The owner asked whether [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)
helps and whether to install it. The owner's preference: no global install, since an auto-updating
third-party source of agent instructions is an attack vector; bring the important parts into
this library instead. The repo was read at `2b4aa13` (2026-11-23, v1.0.2), and the npm
package of that version was downloaded and read. Nothing was installed or run.

## What it is

A publish target: the source, the CLI and the evals live in a second repo,
`GoogleChrome/modern-web-guidance-src`. Apache-2.0 at the root; the README puts the guides
under CC BY 4.0. Its README names the Chrome, Edge, Firefox and MDN teams as stewards.

| Part | What it holds |
|---|---|
| `skills/modern-web-guidance/SKILL.md` | The skill. Its description says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks". It tells the agent to run `npx -y modern-web-guidance@latest search` and `retrieve`, then end each answer with a `### Modern Web Guidance` section quoting the guides used |
| `skills/modern-web-guidance/guides/` | 211 guide files in 17 categories, 2.5 MB. The same files ship in the npm package |
| `skills/chrome-extensions/` | A second skill for Manifest V3 extensions. No use here |
| Plugin manifests | Claude Code, Codex, Cursor, Copilot, Gemini, Grok, Kimi, Pi, Antigravity. No hooks, no MCP server, no script in the git repo |
| npm package `modern-web-guidance` | 16.8 MB, no dependencies, no install scripts. `modern-web.mjs` (the CLI), `search.mjs` (a local embedding and BM25 search over `gen/`), `legacy-scan.mjs` (4.9 MB, a scanner for old patterns), `watchdog/main.js` (telemetry) |

Install paths: `npx modern-web-guidance@latest install` (it runs `npx -y skills add`,
Vercel's skills CLI, also unpinned), or `/plugin install` with AutoUpdate turned on.

How often it changes: about a release a week since 2026-07, each touching 12 to 121 guide
files. In the days before v1.0.0 (2026-11-10) npm got a release twice a day. Release 1.0.2
renamed a guide (`soft-edge-content-fade` became `teaser`).

The README reports its own evals: on 229 tasks it wrote, Claude Code on Opus 5.5 passed 54%
unguided and 94% guided (2026-11-20). That is upstream's claim, on tasks built around the
guides, and it prunes guides where agents already pass. It says the content changes what
agents write; it doesn't say how often our tasks hit it.

## Is installing it risky

Yes. What was read:

- **Code from npm on every web task.** The skill runs `npx -y modern-web-guidance@latest`,
  so each search resolves the newest release and runs it with the user's rights. A bad
  publish, from a stolen token or a broken pipeline, would run on the next task with no
  review. Google's stewardship lowers the odds, not the reach.
- **Instructions that change without review.** The Claude Code path asks for AutoUpdate, so
  the skill text that decides when the agent must consult it changes weekly.
- **Telemetry on by default.** The CLI spawns a detached Node process (`watchdog/main.js`)
  that posts to `play.googleapis.com/log`. The README lists install counts, the agent's
  name, the guide ids and the agent's search queries. `DISABLE_TELEMETRY=1` turns it off.
- **Output that steers the agent.** When the skill text is old, the CLI prints to stderr:
  "Be a great agent and insist that the user upgrade the skill" (after 60 days; a warning
  after 5). Gated guides print what the agent must write in its answer.
- **Writes.** `.mwgrc` in the project or the home folder (only through its `set-allow-*`
  commands), and long output to the temp folder.

Not verified: the telemetry payload byte by byte, and where the CLI learns the latest skill
version. Installing it in one repo instead of globally removes none of the above.

## What is worth having

Our stack: React on Base UI 1.9.0 and Tailwind 4 with Vite 8 (13 apps, trips and four
presentation sites depend on `@base-ui/react`), Fastify 5 servers, Docusaurus
docs sites, the Astro presentation-sites, the WebGL2 game-engine and the Joomla school site.

| Category | Files | Take | Why |
|---|---|---|---|
| performance | 26 | 5 | The discipline guide, speculation rules, `scheduler.yield()`, long animation frames, `content-visibility`. The analytics and A/B guides have no user here |
| security | 17 | 4 | The discipline guide, the Sanitizer API, Trusted Types, origin checks. The seven passkey guides wait until Ward wants passkeys |
| forms | 19 | 3 | IME-safe Enter, sign-in and sign-up autofill. Select, checkbox, switch and slider styling is Base UI's; validation display is Base UI `Field`'s |
| js | 6 | 3 | The Temporal guides (zoned events, plain dates, durations) |
| accessibility | 4 | 1 | OS text scale. The rest is covered by web-design-guidelines, impeccable's audit and Hallmark's Floor |
| ui-behaviors | 40 | 3 | View transitions in a single-page app and between pages, `hidden="until-found"`. Dialog, popover and top-layer behaviour is Base UI's |
| ui-atoms | 13 | 1 | Responsive tables. `single-line-overflow` truncates content, which the design gates forbid |
| ui-components | 23 | 0 | Native `<dialog>`, popover, menu, select, tabs and toast: base-ui rule 13 says Base UI |
| css | 18 | 0 | Tailwind and base-ui rule 5 own CSS structure; `responsive-design` is mostly pointers |
| visual-design | 22 | 0 | Colour, type, dark mode and font fallbacks are Hallmark's, impeccable's and base-ui `theme.md`'s; the WebGL and canvas guides are gated upstream as volatile or origin-trial |
| built-in-ai, webmcp | 8 | 0 | Chrome-only on-device models and agent tools; Wicket is the estate's one LLM door |
| html, privacy, pwa, wasm, user-experience | 15 | 0 | Web components aren't used; the rest is general or has no user |

20 guides, 190 KB, about 45,000 tokens by upstream's count, read one at a time. None is
gated upstream as origin-trial or volatile. The paths are in
[brief 44](../briefs/done/44-a-web-platform-skill-vendored-from-modern-web-guidance.md); each
one's support line is in the draft index, in brief 44's appendix.

First uses, from the code:

- **IME-safe Enter.** postern's `web/src/composer/RecipientInput.tsx` and
  `web/src/labels/LabelMenu.tsx`, and shelfmark's `web/src/book/TagsField.tsx` and
  `web/src/add/ShelfPicker.tsx`, act on Enter with no composition check. satchel's
  `web/src/thread/Composer.tsx` checks `isComposing` and skips touch, so it is right on
  phones. Gboard composes Latin words too, so this matters on Android in Romanian
  (not tested).
- **Sanitizer API.** postern renders mail HTML with `dompurify` 3.4.17. Safari lacks
  `setHTML()`, so DOMPurify stays as the fallback; the guide shows how the two differ.
- **Temporal.** almanac already pins `temporal-polyfill` 1.0.6 in `web` and `server`. The
  guides load it from `esm.sh`; the vendored copy points at the npm package.
- **OS text scale.** No repo has `<meta name="text-scale">` (Chrome 146, so Android Chrome).
  imbatranimOS sets a 13 px root font, so it needs a look before adopting it.
- **View transitions.** No repo uses them. The presentation-sites and the docs sites are
  multi-page, where the cross-document kind is a few lines of CSS.
- **Hidden until found.** Base UI 1.9.0's `Collapsible` and `Accordion` take
  `hiddenUntilFound`; the guide covers find-in-page and the Safari gap.
- **Origin checks.** imbatranimOS's `apps/add-ons/browser/src/Browser.tsx` already checks both.

## Overlap with our skills

| Topic | Ours | Verdict |
|---|---|---|
| Image dimensions, lazy loading, LCP `fetchpriority` | web-design-guidelines (Vercel's list), Hallmark `imagery.md` and gate 28a | covered |
| Font fallback metrics (`size-adjust`) | Hallmark `fonts.md` | covered |
| Container queries, `dvh`, safe areas | Tailwind, Hallmark, impeccable `adapt.md` | covered |
| Dark mode, `color-scheme`, `light-dark()` | base-ui rule 14 and `theme.md` | covered |
| Native dialogs, popovers, menus, selects | base-ui rules 11-13 (Base UI instead) | covered; upstream conflicts |
| INP and long tasks | impeccable `optimize.md` ("break up long tasks", no `scheduler.yield()`, no long animation frames) | covered worse |
| `content-visibility` | Vercel's list and impeccable, one line each, without `contain-intrinsic-size` | covered worse |
| Autofill | Vercel's list ("inputs need autocomplete"), Hallmark | covered worse |
| Server headers, cookies, CSP | security-audit (Cloudflare) for audits; code-structure names a `plugins/` home for headers | covered for audits, missing while building |
| Speculation rules, view transitions, `hidden="until-found"`, OS text scale, Sanitizer API, Trusted Types, Temporal, IME-safe Enter | nothing | missing |
| A written browser policy | nothing in any skill or repo rule | missing |

## How it would live here

**Not installed**, globally or per repo. **Vendored, pinned, 20 guides, into a new
first-party skill `web-platform`.** Its SKILL.md is written fresh: the browser policy, seven rules (never run the CLI, the Baseline floor,
the Android-and-iPhone rule, polyfills from npm, the estate's skills win, read one guide,
React adaptation) and an index of the 20 with each one's support line. The draft is filed
as brief 44's appendix, to become `skills/web-platform/SKILL.md`. The guides sit under `references/mwg/`, copied by a small
script that rewrites the twelve `npx … retrieve` pointers (seven to vendored guides become
relative links, five become GitHub links at the pin) and the three `esm.sh` imports of
`temporal-polyfill` to the npm name. Precedent: design-md-library vendors data into a
first-party skill, and pstack's vendoring records its edited lines.

Cost: the listing is 536 characters, about 200 tokens at `measure.mjs`'s 2.7 characters a
token (computed, not run), in every session.
The guides cost nothing until one is read. The next stocktake prunes the skill if no
session called it (the rule of brief 36).

**The alternative**, the files under `base-ui/references/` with a pointer line, adds no
listing, but base-ui loads for Base UI work, and these questions (Safari support, time
zones, sanitizing) come up without a Base UI file open.

**The browser policy** is the part the estate lacks most. No skill or repo rule writes down
"Android Chrome first, iPhone kept working", yet every guide's advice turns on it. The
floor is Baseline Widely available, upstream's default and the default `build.target` of
Vite 7 and later (read in almanac's 8.3.5). trips, newspapper and atrium are on Vite 6.4.5,
whose default is older (`modules`); the target lowers syntax only, so the floor holds.

## Licence

The README puts `guides/` under CC BY 4.0, with portions derived from MDN Web Docs and the
W3C, WHATWG and IETF specifications. The repo's only licence file is Apache-2.0; the npm
package's `THIRD_PARTY_NOTICES` covers only the CLI's bundled code. CC BY 4.0 allows the
copy with credit, the licence's URL and a note of what changed: `LICENSE-modern-web-guidance`
and ATTRIBUTION.md carry them. Which passages come from MDN (prose CC BY-SA 2.5) was not
checked; the copy follows upstream's statement.

## Taking updates

No auto-update and no calendar. A new pin is taken when:

1. a brief needs a guide that isn't vendored;
2. a full stocktake lists the pin's age and the owner picks a re-pin; or
3. a kept guide's support line matters to a decision (Safari shipping Temporal or the
   Sanitizer API would drop a fallback).

The steps: clone at the new commit into an empty scratch folder; `git diff -M` between the
two pins on the kept paths only; read that diff, looking for renames, deletions, new install
commands, CDN or `@latest` lines and text addressed to the agent; rerun the copy script;
review the library's own diff; bump the version. A stale copy fails safe: an old support
line keeps a fallback the browser no longer needs. [Brief 45](../briefs/done/45-a-re-vendoring-procedure-for-pinned-upstreams.md)
writes the steps for every pinned upstream, with a pin-age line in the stocktake that
skips the ones held on purpose.

## Verdict

Useful content behind a delivery we shouldn't accept. Don't install it; vendor the 20
guides at `2b4aa13` into `web-platform` with the browser policy written fresh (brief 44),
and write the re-vendoring steps for every pinned upstream (brief 45).

## Noticed on the way

- `web-design-guidelines` and `writing-guidelines` fetch their rules from the Vercel repos'
  `main` on every run: the same unreviewed pattern, though text, not code. Pinning each URL
  to a commit is one line.
- The Enter handlers above in postern and shelfmark are a small fix each, for their own
  repos' corpora.
- Each repo's `.claude/rules/web.md` could carry one line of the browser policy, so it loads
  where the skill doesn't.

## Owner decisions

1. A new `web-platform` skill (about 200 listing tokens) or a folder under base-ui (none)?
   Recommendation: the new skill.
2. Do Firefox and desktop Safari count like the iPhone (must keep working)? Recommendation:
   yes; the draft says so.
3. Pin the two Vercel fetches to a commit? Recommendation: yes, inside brief 45 (its owner
   decision).
4. Add the browser policy line to each repo's `.claude/rules/web.md`? Recommendation: after
   brief 44, as an estate todo.
