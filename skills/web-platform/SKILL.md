---
name: web-platform
description: The estate's browser policy (Chrome on Android first, Safari on iPhone kept working) and 20 web platform guides vendored from GoogleChrome/modern-web-guidance at a pinned commit, each with the feature's browser support and its fallback.
when_to_use: Use when the user says "does Safari support", "will this work on iPhone", "Enter to send", "sanitize this HTML", "time zones", "INP", "view transition", "sign-in autofill", or a brief says to follow the web-platform skill. Not for Base UI components (base-ui) or visual design (hallmark, impeccable).
---

# Web platform: the browser policy and the vendored guides

Models write web code from training data that lags the platform. They miss
features that shipped this year and guess at which browsers support them. This
skill holds the estate's browser policy and 20 guides from
[GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)
(CC BY 4.0), copied at a pinned commit into `references/mwg/`. The library
doesn't use upstream's installer, which runs the newest npm release on every web
task and reports the agent's queries to Google. Why, and what was left out, is on
[modern-web-guidance-2026-11-23.md](../../corpus/wiki/modern-web-guidance-2026-11-23.md).

## The rules

| # | Rule | Why | Checked by |
|---|---|---|---|
| 1 | Never run `npx modern-web-guidance`, never install its plugin, never read a guide from upstream's `main`. Read the vendored copy. Read a guide that isn't vendored at the pinned commit's GitHub URL; the vendored files link to it | The CLI runs the newest npm release each time, spawns a telemetry process and tells the agent to push the user to upgrade | `grep -rn 'npx' references/` finds nothing; review |
| 2 | The floor is Baseline Widely available, the default `build.target` of Vite 7 and later. A feature at the floor ships with no fallback. Baseline Newly available is above the floor. Every current browser has it, older iPhones don't | Every browser has had a floor feature for 30 months; a fallback for it is dead code | review |
| 3 | Above the floor, Chrome on Android decides what to build and Safari on iPhone decides what must still work. Firefox and desktop Safari count like the iPhone. A feature one of them lacks ships either as an addition that does nothing when absent, or behind feature detection with the guide's fallback. The table below says which | Android is the main phone; the iPhone must keep working | review; try it on Android Chrome, then in Safari |
| 4 | A polyfill or fallback library comes from npm, pinned exactly, loaded with `import()` only when the feature is missing. Never a CDN URL, never `@latest`. A guide's CDN line means the npm package of the same name | house-style rule 25; a CDN script is third-party code that changes under you at run time | house-style's `.npmrc`; review |
| 5 | The estate's skills win over a guide: base-ui rule 13 over native `<dialog>`, popover, menu or select (those guides are not vendored); house-style over a guide's code style; the design gates (nothing clipped, no ellipsis on content) over a guide's advice to truncate | Each was decided with evidence; the guides are written for plain HTML | review |
| 6 | Read the one guide the task needs. Open a discipline guide (`performance`, `security`) only when the task spans that area | One guide is 700 to 8,300 tokens; the 20 together are about 45,000 | review |
| 7 | In React, adapt a guide without dropping its feature: spread an attribute React's types lack in from a typed object (never `any`, house-style rule 10), and call a DOM method on a ref. Where Base UI has a prop for the feature (`hiddenUntilFound`), use the prop. On React 19.2, a view transition wraps the state update in `flushSync` inside `document.startViewTransition()`. On React 19.3 and later, use React's `<ViewTransition>` and never call `startViewTransition()` yourself | The guides are vanilla; the feature is the point. React's docs keep `flushSync` for browser APIs that read the DOM when their callback ends, and from 19.3 React starts view transitions itself and interrupts any other | review |

## The guides

Paths are under `references/mwg/`. The last column is the guide's own support
line at the pin. "Limited" means a browser lacks the feature, "Newly" means
every current browser has it but older ones don't. "Additive" ships as is,
since the feature does nothing where it's missing. "Fallback" ships with the
guide's fallback. "Floor" needs neither.

| Task | Guide | Support |
|---|---|---|
| Loading and responsiveness as a whole: the critical path, LCP, INP, fonts, images, code-splitting | `performance/performance.md` | per section |
| Prefetch or prerender the likely next page | `performance/improve-next-page-load-performance.md` | Limited (Firefox, Safari): additive |
| Keep a long loop from blocking input (`scheduler.yield()`) | `performance/break-up-long-tasks.md` | Limited (Safari): fallback (`setTimeout`) |
| Find what makes an interaction slow (long animation frames) | `performance/identify-inp-causes.md` | Limited (Firefox, Safari): measure in Chrome |
| Skip rendering long feeds off screen (`content-visibility`) | `performance/defer-rendering-heavy-content.md` | Newly (2025-09): `auto` additive, `hidden` fallback |
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
library's `ATTRIBUTION.md`. `scripts/vendor-modern-web-guidance.mjs` makes the
copy from a clone at the new pin. Never edit a file under `references/mwg/` by
hand.
