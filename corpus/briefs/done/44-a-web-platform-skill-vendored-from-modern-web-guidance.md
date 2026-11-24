# Task 44: a web-platform skill, vendored from modern-web-guidance

## Context

GoogleChrome/modern-web-guidance holds 211 guides to current web platform features, each
with its browser support and a fallback. Its own delivery is a skill that runs
`npx -y modern-web-guidance@latest` on every web task, sends the agent's queries to Google
and asks for plugin auto-update. The owner won't install it (2026-11-23). The research is on
[modern-web-guidance-2026-11-23.md](../../wiki/modern-web-guidance-2026-11-23.md).

What the library lacks today, read on 2026-11-23:

- **No browser policy.** No skill and no repo's `.claude/rules/` file says "Chrome on
  Android first, Safari on iPhone kept working", though each guide's advice turns on it.
- **Missing topics.** Nothing in `base-ui`, `impeccable`, `hallmark`, `house-style`,
  `code-structure` or `web-design-guidelines` covers speculation rules, view transitions,
  `hidden="until-found"`, `<meta name="text-scale">`, the Sanitizer API, Trusted Types,
  Temporal or IME-safe Enter. impeccable's `reference/optimize.md` says "break up long
  tasks" with no `scheduler.yield()` and no long animation frames.
- **First uses.** postern (`web/src/composer/RecipientInput.tsx`) and shelfmark
  (`web/src/book/TagsField.tsx`) act on Enter with no composition check; postern renders
  mail HTML with DOMPurify; almanac pins `temporal-polyfill` 1.0.6.

## Files you OWN

- `skills/web-platform/` (new): `SKILL.md` and `references/mwg/`.
- `scripts/vendor-modern-web-guidance.mjs` and its test (new).
- `LICENSE-modern-web-guidance` (new), `ATTRIBUTION.md`.
- `skills/base-ui/SKILL.md`: one line under "The references", nothing else.
- `README.md` (the version line, the skill count, one table row), `docs/history.md`, both
  plugin files, `corpus/` (including a `wiki/decisions.md` entry).

## Files you must NOT touch

- Every other skill, and every file under `references/mwg/` by hand: the script writes them.
- Any file inside the upstream clone. Read it; run nothing from it.

## What to do

1. **Clone** `https://github.com/GoogleChrome/modern-web-guidance` with `--depth 1` into a
   new, empty scratch folder and check `git -C <clone> rev-parse HEAD` is
   `2b4aa13a72dd47cd135b06ce5abfccd92e19b24f`. If `main` has moved, fetch that commit; don't
   take a newer one in this brief.
2. **Write the script**, zero dependencies:
   `node scripts/vendor-modern-web-guidance.mjs <clone> <sha>`.
   - It checks `<sha>` against the clone's HEAD and copies the 20 files in the table below,
     from `skills/modern-web-guidance/guides/<path>` to
     `skills/web-platform/references/mwg/<path>`. It deletes any other file under
     `references/mwg/`, so a dropped guide shows in the diff.
   - Each pointer of the shape `` `<id>` (via `npx -y modern-web-guidance@latest retrieve "<id>"`) ``
     becomes a link on the id: a relative link when `<id>` is in the list, else the GitHub
     URL of that guide at `<sha>` (find its category in the clone). At `2b4aa13` there are 12
     pointers: 7 to vendored guides, 5 to others.
   - `import('https://esm.sh/<pkg>')` becomes `import('<pkg>')` (3 lines, the Temporal guides).
   - Each file gets a first line: an HTML comment naming the upstream path, the commit,
     CC BY 4.0 and the two kinds of change, worded so it contains none of the strings the
     next check flags.
   - It exits 1 and lists file and line when a copied file still contains `npx`, `@latest`,
     `unpkg.com`, `esm.sh` or `cdn.jsdelivr.net`, or a pointer of another shape.
   - A `node:test` file runs it on a small fixture tree: both pointer kinds, the import, and
     a leftover `npx` line that makes it exit 1.
3. **Run it** on the clone. Read three of the output files whole to see the links resolve.
4. **Write `skills/web-platform/SKILL.md`** from the draft in this brief's appendix (kept
   here, not in `skills/`, so the skill can't go live before its references exist): the seven rules and the index of the 20. Check each index row's support line
   against its guide, and rule 7's `flushSync` advice against React's docs (it comes from
   React, not from the guides). Run `unslop` over the text and keep the listing near its
   536 characters. If brief 45 isn't built yet, drop the draft's sentence that points at
   `docs/vendoring.md`.
5. **Licence.** `LICENSE-modern-web-guidance` holds a header (the guides are CC BY 4.0,
   https://creativecommons.org/licenses/by/4.0/; the credit line from upstream's README,
   naming MDN Web Docs and the W3C, WHATWG and IETF specifications; what was changed) and
   upstream's root `LICENSE` (Apache-2.0) as shipped.
6. **ATTRIBUTION.md.** A row in "Vendored, with upstream pins": `web-platform/references/mwg/`
   (20 guides), the upstream link, CC BY 4.0, `2b4aa13` (2026-11-23, v1.0.2). A note in
   "Notes per source" in the shape of the others: **In** (the 20), **Left out** (the CLI,
   `legacy-scan`, the telemetry watchdog, the plugin manifests, `chrome-extensions`, 191
   guides and why, by category), **Local lines** (the pointer and import rewrites, the header
   line), **The guard** (never run `npx modern-web-guidance`, never install the plugin).
   Add `web-platform` to the "Original to this plugin" list the way `design-md-library` is
   there (the skill is first-party; its data is vendored).
7. **base-ui** gets one line under "The references": platform features beyond Base UI
   (browser support, time zones, sanitizing, view transitions) are in the web-platform skill.
8. **decisions.md**: "Vendor modern-web-guidance's guides, not its CLI" with the date, the
   alternatives (install it; fold the guides into base-ui; ideas only) and the reason.
   A second entry, "The browser policy": Chrome on Android decides what to build; Safari on iPhone,
   Firefox and desktop Safari must keep working (owner, 2026-11-23; rejected: best effort for desktop
   Firefox and Safari).
9. **Version.** A minor bump in both plugin files (both places in the marketplace file), the
   README version line and skill count (34), a README row beside `base-ui`, a paragraph in
   `docs/history.md`, and `web-platform` named in the plugin descriptions where `base-ui` is.

### The 20 guides

Under `skills/modern-web-guidance/guides/` at `2b4aa13`. Tokens are upstream's count in the
npm package's `gen/guides.json`.

| Upstream path | Tokens | Keep for |
|---|---|---|
| `performance/performance.md` | 5,219 | the loading and responsiveness discipline guide |
| `performance/improve-next-page-load-performance.md` | 1,646 | speculation rules (Astro, Docusaurus) |
| `performance/break-up-long-tasks.md` | 724 | `scheduler.yield()` with its `setTimeout` fallback |
| `performance/identify-inp-causes.md` | 1,618 | long animation frames |
| `performance/defer-rendering-heavy-content.md` | 1,447 | `content-visibility` with `contain-intrinsic-size` |
| `security/security.md` | 8,288 | DOM sinks, cookies, framing, `postMessage`, CSP rollout |
| `security/sanitize-untrusted-html.md` | 1,314 | `setHTML()` with DOMPurify as the Safari fallback (postern) |
| `security/trusted-types.md` | 1,795 | Trusted Types |
| `security/validate-origins.md` | 3,243 | origin comparison |
| `forms/ime-safe-enter-submit.md` | 1,513 | Enter-to-send (postern, shelfmark, satchel) |
| `forms/autofill-sign-in-form.md` | 2,426 | Ward's and the apps' sign-in |
| `forms/autofill-sign-up-form.md` | 2,636 | sign-up |
| `js/coordinate-global-events.md` | 971 | Temporal, zoned events (almanac) |
| `js/capture-location-agnostic-data.md` | 2,443 | Temporal, plain dates |
| `js/calculate-event-differentials.md` | 2,181 | Temporal, durations |
| `accessibility/respect-os-text-scale.md` | 1,684 | `<meta name="text-scale">` on Android |
| `ui-behaviors/same-document-transitions.md` | 1,927 | view transitions in the React apps |
| `ui-behaviors/cross-document-transitions.md` | 1,083 | view transitions between pages |
| `ui-behaviors/search-hidden-content.md` | 1,731 | `hidden="until-found"` (Base UI's `hiddenUntilFound`) |
| `ui-atoms/responsive-table.md` | 1,126 | tables on a phone |

## Acceptance

- `node scripts/vendor-modern-web-guidance.mjs <clone> 2b4aa13a72dd47cd135b06ce5abfccd92e19b24f`
  exits 0 and writes 20 files; a second run leaves `git status` clean.
- `grep -rnE 'npx|@latest|unpkg\.com|esm\.sh|cdn\.jsdelivr\.net' skills/web-platform/references/`
  prints nothing, and every relative link in `references/mwg/` resolves to a file.
- `node --test scripts/vendor-modern-web-guidance.test.mjs` passes.
- `node scripts/check-skills.mjs` counts one more skill with 0 failing and lists
  `web-platform` as first-party (no `[vendored]`); `node skills/stocktake/scripts/measure.mjs`
  shows its listing under 600 characters and its rules before the 5,000-token cut;
  `bash corpus/lint.sh` is clean.
- `ATTRIBUTION.md` and `LICENSE-modern-web-guidance` carry the pin, the licence URL, the
  credit and the changed lines; the version is bumped in all four places.
- No other skill changed apart from base-ui's one line.

## Owner decisions

Settled with the owner on 2026-11-23:

1. **A new skill**, not a folder under `base-ui/references/`: the listing cost (about 200 tokens) is accepted so
   the guides trigger on any web task, React or not. The next stocktake prunes it if no session calls it.
2. **Firefox and desktop Safari must keep working**, like the iPhone. The draft's rule 3 stands as written.

## Appendix: the draft SKILL.md

Written by the 2026-11-23 research. In the skill, make the research page's path a link
(`../../corpus/wiki/modern-web-guidance-2026-11-23.md` from `skills/web-platform/`).

````markdown
---
name: web-platform
description: The estate's browser policy (Chrome on Android first, Safari on iPhone kept working) and 20 web platform guides vendored from GoogleChrome/modern-web-guidance at a pinned commit, each with the feature's browser support and its fallback.
when_to_use: Use when the user says "does Safari support", "will this work on iPhone", "Enter to send", "sanitize this HTML", "time zones", "INP", "view transition", "sign-in autofill", or a brief says to follow the web-platform skill. Not for Base UI components (base-ui) or visual design (hallmark, impeccable).
---

# Web platform: the browser policy and the vendored guides

Models write web code from training data that lags the platform: they miss
features that shipped this year and guess at which browsers support them. This
skill holds the estate's browser policy and 20 guides from
[GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)
(CC BY 4.0), copied at a pinned commit into `references/mwg/`. Upstream's own
installer is not used: it runs the newest npm release on every web task and
reports the agent's queries to Google. Why, and what was left out, is on
`corpus/wiki/modern-web-guidance-2026-11-23.md`.

## The rules

| # | Rule | Why | Checked by |
|---|---|---|---|
| 1 | Never run `npx modern-web-guidance`, never install its plugin, never read a guide from upstream's `main`. Read the vendored copy. A guide that isn't vendored is read at the pinned commit's GitHub URL, which the vendored files link to | The CLI runs the newest npm release each time, spawns a telemetry process and tells the agent to push the user to upgrade | `grep -rn 'npx' references/` finds nothing; review |
| 2 | The floor is Baseline Widely available, the default `build.target` of Vite 7 and later. A feature at the floor ships with no fallback. Baseline Newly available is above the floor: every current browser has it, older iPhones don't | Every browser has had a floor feature for 30 months; a fallback for it is dead code | review |
| 3 | Above the floor, Chrome on Android decides what to build and Safari on iPhone decides what must still work. Firefox and desktop Safari count like the iPhone. A feature one of them lacks ships either as an addition that does nothing when absent, or behind feature detection with the guide's fallback. The table below says which | Android is the main phone; the iPhone must keep working | review; try it on Android Chrome, then in Safari |
| 4 | A polyfill or fallback library comes from npm, pinned exactly, loaded with `import()` only when the feature is missing. Never a CDN URL, never `@latest`. A guide's CDN line means the npm package of the same name | house-style rule 25; a CDN script is third-party code that changes under you at run time | house-style's `.npmrc`; review |
| 5 | The estate's skills win over a guide: base-ui rule 13 over native `<dialog>`, popover, menu or select (those guides are not vendored); house-style over a guide's code style; the design gates (nothing clipped, no ellipsis on content) over a guide's advice to truncate | Each was decided with evidence; the guides are written for plain HTML | review |
| 6 | Read the one guide the task needs. Open a discipline guide (`performance`, `security`) only when the task spans that area | One guide is 700 to 8,300 tokens; the 20 together are about 45,000 | review |
| 7 | In React, adapt a guide without dropping its feature: an attribute React's types lack is spread in from a typed object (never `any`, house-style rule 10), a DOM method is called on a ref, and a view transition wraps the state update in `flushSync` inside `document.startViewTransition()`. Where Base UI has a prop for the feature (`hiddenUntilFound`), use the prop | The guides are vanilla; the feature is the point | review |

## The guides

Paths are under `references/mwg/`. The last column is the guide's own support
line at the pin. "Limited" means a browser lacks the feature, "Newly" means
every current browser has it but older ones don't. "Additive" ships as is: the
feature does nothing where it's missing. "Fallback" ships with the guide's
fallback. "Floor" needs neither.

| Task | Guide | Support |
|---|---|---|
| Loading and responsiveness as a whole: the critical path, LCP, INP, fonts, images, code-splitting | `performance/performance.md` | per section |
| Prefetch or prerender the likely next page | `performance/improve-next-page-load-performance.md` | Limited (Firefox, Safari): additive |
| Keep a long loop from blocking input (`scheduler.yield()`) | `performance/break-up-long-tasks.md` | Limited (Safari): fallback (`setTimeout`) |
| Find what makes an interaction slow (long animation frames) | `performance/identify-inp-causes.md` | Limited (Firefox, Safari): measure in Chrome |
| Skip rendering long feeds off screen (`content-visibility`) | `performance/defer-rendering-heavy-content.md` | Newly (2025-09): fallback |
| Front-end security as a whole: DOM sinks, cookies, framing, `postMessage`, CSP rollout | `security/security.md` | per section |
| Show untrusted HTML (`setHTML()`) | `security/sanitize-untrusted-html.md` | Limited (Safari): fallback (DOMPurify) |
| Enforce Trusted Types | `security/trusted-types.md` | Newly (2026-02): fallback |
| Compare origins safely (`postMessage`, URLs) | `security/validate-origins.md` | Limited (Firefox): fallback (`URL`) |
| Enter-to-send that doesn't fire mid-composition | `forms/ime-safe-enter-submit.md` | Limited (Safari): fallback (`keyCode` 229) |
| A sign-in form that autofills | `forms/autofill-sign-in-form.md` | Floor; `autocorrect` Newly (2026-09): additive |
| A sign-up form that autofills | `forms/autofill-sign-up-form.md` | Floor; `autocorrect` Newly (2026-09): additive |
| An event fixed to a time zone | `js/coordinate-global-events.md` | Limited (Safari): fallback (`temporal-polyfill`) |
| A date or a time with no zone (birthdays, all-day events) | `js/capture-location-agnostic-data.md` | Limited (Safari): fallback (`temporal-polyfill`) |
| Durations and "in 3 days" between dates | `js/calculate-event-differentials.md` | Limited (Safari): fallback (`temporal-polyfill`) |
| Follow the phone's text size setting (`<meta name="text-scale">`) | `accessibility/respect-os-text-scale.md` | Limited (Firefox, Safari): additive |
| Animate between states of a single-page app | `ui-behaviors/same-document-transitions.md` | Newly (2025-10): fallback |
| Animate between pages of a multi-page site (Astro, Docusaurus) | `ui-behaviors/cross-document-transitions.md` | Limited (Firefox): additive |
| Collapsed content that find-in-page still reaches (Base UI's `hiddenUntilFound`) | `ui-behaviors/search-hidden-content.md` | Limited (Safari): additive |
| A data table that holds up on a phone | `ui-atoms/responsive-table.md` | Floor |

## Taking updates

The pin, the list of files and the lines changed from upstream are in the
library's `ATTRIBUTION.md`. The copy is made by
`scripts/vendor-modern-web-guidance.mjs` from a clone at the new pin; never edit
a file under `references/mwg/` by hand. `docs/vendoring.md` has the steps for
a new pin.
````

## Outcome (2026-11-24)

**Built, v0.67.0** (commit 4996fed). `skills/web-platform/` holds the SKILL.md from the
appendix and the 20 guides under `references/mwg/`, copied from the clone at `2b4aa13` by
`scripts/vendor-modern-web-guidance.mjs` (`node scripts/vendor-modern-web-guidance.mjs <clone>
<sha> [--out <folder named mwg>]`; exit 1 lists file and line and writes nothing, exit 2 on a
usage error or a clone not at the sha). The run rewrote 12 pointers (7 relative, 5 GitHub URLs
at the pin) and 3 imports; the 20 files differ from upstream in those 15 lines and the header
line. A second run left `git status` clean. The test file has 5 cases on a fixture clone built
with `git init`. `LICENSE-modern-web-guidance`, the ATTRIBUTION row and note, base-ui's one
line, both decisions, the version in the four places, `web-platform` in both plugin
descriptions.

Changed from the appendix, each checked against its source:

- **Rule 7.** React 19.3's docs list `<ViewTransition>` as stable and say React calls
  `startViewTransition()` itself, so code must never call it and a `flushSync` mid-sequence
  skips the transition. React 19.3.1 exports it; 19.2.8 doesn't. The rule now keeps `flushSync`
  inside `document.startViewTransition()` for React 19.2 and names `<ViewTransition>` from 19.3.
  React's `flushSync` page backs the 19.2 half (browser APIs that read the DOM when their
  callback ends).
- **The `content-visibility` row** says "`auto` additive, `hidden` fallback": the guide says
  `auto` needs no fallback and `hidden` needs feature detection.
- **The `docs/vendoring.md` sentence** is dropped: brief 45 isn't built.
- `unslop` rewrote four prose sentences (colons as connectors, two passives). The listing stays
  at 536 characters; the whole skill is about 2,761 tokens, before the 5,000-token cut.

The other 18 support lines match their guides. `search-hidden-content` stays "additive": the
guide offers an expand-all fallback, but in Safari the attribute acts as plain `hidden`, the
collapsed state the control already toggles.

Checks: the script's run and rerun, the acceptance grep (nothing), 7 relative links resolve,
`node --test scripts/*.test.mjs` 21 of 21, `check-skills` 34 skills with 0 failing and
`web-platform` first-party, `measure.mjs`, `corpus/lint.sh` clean. Owner step: update the
plugin to 0.67.0. Left for later: the README's licence sentence and `plugin.json`'s `license`
field name MIT and Apache-2.0 only; the CC BY 4.0 guides are credited in ATTRIBUTION.md and
`LICENSE-modern-web-guidance`.
