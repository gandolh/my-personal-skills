# Task 04: Every repo on Base UI 1.9.0 (tracker)

This brief is a **tracker**. Each repo's own bump brief does the work, in
that repo's corpus. Phase B of the estate rollout builds these first, since
every later brief (harness, conventions, Tailwind, redesign) assumes
`@base-ui/react` at exactly 1.9.0 and rule 1 of brief 02 passing.

## Context

On 2026-11-09 the owner asked for every repo on the latest stable Base UI.
That day npm's `latest` for `@base-ui/react` was **1.9.0**, published
2026-10-09; there was no `next` tag. Brief 02's rule 1 says every repo pins
it exactly. Between 1.4 and 1.9 two things broke: `OTPFieldPreview` became
`OTPField` (`@base-ui/react/otp-field`), and `sanitizeValue()` became
`normalizeValue()`. A grep of every repo on 2026-11-09 found neither in use.
Each bump brief re-runs the grep.

Size a bump from the **lockfile**, not the range. ImbatranimOS says `^1.4.1`
and resolves 1.6.0.

Decided 2026-11-10: the work happens on `main` in each repo's main checkout,
committed and pushed there. There are no PRs (Q4). No private repo uses Base
UI (Q2), so the table is complete.

## The table

Briefs are named "<repo> brief NN, *Title*" and live in that repo's
`corpus/briefs/todo/`.

| Repo | Bump brief | What it changes | Order constraint |
|---|---|---|---|
| mini-projects (`literally-a-todo-app/frontend`) | brief 01, *Base UI 1.9.0 in the todo frontend* | `^1.4.1` (1.4.1) to exact 1.9.0 | none |
| comercial-website (`frontend`) | brief 10, *Base UI 1.9.0* | `^1.4.1` (1.4.1) to exact 1.9.0 | none |
| imbatranimOS (`packages/ui`, `apps/core`) | brief 85, *Base UI to 1.9.0* | `^1.4.1` (resolves 1.6.0) to exact 1.9.0 | **first of the two**; imbatranim-apps follows |
| imbatranim-apps | brief 07, *Base UI 1.9.0 through kit sync* | 1.6.0 to 1.9.0, by `kit:sync` to an imbatranimOS commit that has the bump; never edit `vendor/` by hand | after imbatranimOS brief 85 |
| ro-housing (`web`) | brief 21, *Base UI 1.9.0* | 1.5.0 to 1.9.0 | none |
| newspapper (`ui`) | brief 07, *Base UI 1.9.0* | 1.5.0 to 1.9.0 | none |
| atrium (`apps/web`) | brief 01, *Base UI 1.9.0* | 1.6.0 to 1.9.0 | none |
| public-resource-map (`ui`) | brief 02, *Base UI 1.9.0* | 1.6.0 to 1.9.0 | none |
| sports-app (`client`) | brief 01, *Base UI 1.9.0* | 1.6.0 to 1.9.0 | none |
| 3D-sandbox (`apps/web`) | brief 04, *Base UI 1.9.0* | 1.8.0 to 1.9.0 | none |
| presentation-sites (`sites/saloon`) | brief 02, *Pin Base UI exactly* | `^1.9.0` to exact 1.9.0 | none |
| churchix (`packages/ui`, its own corpus) | brief 02, *Pin Base UI exactly* | `^1.9.0` to exact 1.9.0 | none |
| SocialEvents | brief 16, *Base UI adopted by the conventions* | adoption at 1.9.0 (no Base UI today; Tailwind only) | with its conventions brief |
| almanac, shelfmark, ward-auth, the-board, wicket, postern, lantern, satchel | none | already 1.9.0, exact | none |
| presentation-sites' `auto-service`, `tractari`, `subcort` | none | already 1.9.0, exact | none |
| game-engine, just-a-bot | none | no Base UI | none |

## What each bump brief does

1. Re-run the grep for `OTPFieldPreview`, `otp-field` and `sanitizeValue`.
2. Set `"@base-ui/react": "1.9.0"` exactly (`--save-exact`). The lockfile
   resolves 1.9.0 and changes nothing beyond Base UI's own dependency tree.
3. Run the repo's `typecheck`, `test`, `lint` and `build`.
4. Open the app and check each Base UI component: open, close, Esc, keyboard,
   phone width. Record any behaviour difference.
5. Commit `chore(deps): @base-ui/react 1.9.0` and add a `log.md` line.

No restyling and no other dependency changes in a bump.

## Acceptance (for this tracker)

- Every row's brief is in its repo's `done/`.
- Every `package.json` that declares `@base-ui/react` reads exactly
  `"1.9.0"` and every lockfile resolves 1.9.0.
- imbatranim-apps' `vendor/imbatranim-ui/COMMIT` names an imbatranimOS
  commit that has the bump.
- The outcome note lists each repo's behaviour differences, or says none.


## Progress (2026-11-12)

Not moved to `done/`: Acceptance bullet 2 fails for one repo outside the
table (websites/trips, below). Everything the table asked is done. Read from
each repo's `package.json` and lockfile on 2026-11-12, and from each bump
brief's outcome note in its own corpus.

| Repo | Bump brief, done commit (the pin) | `package.json` | Lockfile | Behaviour differences |
|---|---|---|---|---|
| mini-projects | 01, `d21ed45` (`95f1e3a`) | `frontend`: `1.9.0` | 1.9.0 | none recorded; browser check not run, later covered by the Playwright specs of briefs 03 and 04 |
| comercial-website | 10, `a92f7d0` (`c4dd42c`) | `frontend`: `1.9.0` | 1.9.0 | none recorded; walk left to the owner; `CityAutocomplete` and `Tooltip` were compile-checked only |
| imbatranimOS | 85, `250311f` (`dcdb648`) | `packages/ui`: `1.9.0` (core's copy went in brief 87) | 1.9.0 | none recorded; the walk was not run, so 1.6.0 to 1.9.0 in the seven screens was unwalked then; brief 87's screenshots at 1.9.0 followed |
| imbatranim-apps | 07, `b64323a` (`40450da`, kit sync) | root: `1.9.0` | 1.9.0 | none recorded; `vendor/imbatranim-ui/COMMIT` is now ea84fac, which has the bump (`dcdb648` is its ancestor, and `packages/ui` there pins `1.9.0`) |
| ro-housing | 21, `26b1c23` (`17b1e27`) | `web`: `1.9.0` | 1.9.0 | none; `Tabs` still carries `data-active` in 1.9.0 (read from the package) |
| newspapper | 07, `6eb7b34` (`c6bdca9`) | `ui`: `1.9.0` | 1.9.0 | none recorded; 944 tests before and after; walk left to the owner |
| atrium | 01, `5270504` (`4299ea1`) | `apps/web`: `1.9.0` | 1.9.0 | none recorded; walk not run (sign-in); atrium's brief 03 walked it in Chromium |
| public-resource-map | 02, `4527cd1` (`4339a3f`) | `ui`: `1.9.0` | 1.9.0 | none recorded; Playwright not run in the bump; brief 04's 38 specs pass on 1.9.0 |
| sports-app | 01, `588a715` (`d4088c7`) | `client`: `1.9.0` | 1.9.0 | none recorded; the three forms were not walked in the bump |
| 3D-sandbox | 04, `ccce579` (`f9a65a7`) | `apps/web`: `1.9.0` | 1.9.0 | none recorded; the `ScrollArea` thumb not looked at |
| presentation-sites (saloon) | 02, `4abcdcf` (`c4d539e`) | `sites/saloon`: `1.9.0` | 1.9.0 | none; no runtime change |
| churchix | 02, `6e7472f` (`bbcf247`) | `packages/ui`: `1.9.0` | 1.9.0 | none; no runtime change |
| SocialEvents | 16 (adoption), `429be02` (`00c90ea`) | `client`: `1.9.0` | 1.9.0 | no bump: adopted at 1.9.0, all its parts walked in brief 16 |
| almanac, shelfmark, wzd_auth, the-board, wicket, postern, lantern, satchel | none | `1.9.0` (one `package.json` each) | 1.9.0 | none: already 1.9.0, exact |
| presentation-sites: auto-service, tractari, subcort | none | `1.9.0` each | 1.9.0 | none |
| game-engine, just-a-bot | none | no `package.json` declares it | - | none |

No bump brief recorded a behaviour difference, and none found a renamed API
(`OTPFieldPreview`, `otp-field`, `sanitizeValue` printed nothing in every
repo). Most ran typecheck, tests and the build before and after, and skipped
the per-wrapper changelog read (GitHub was out of reach) and the browser walk,
which they left for the owner after the deploy. The Base UI briefs that
followed (rule-by-rule, with Chromium walks and before-and-after screenshots)
used every component at 1.9.0 and recorded no 1.9.0-specific regression.

**Acceptance.**

- Every row's brief is in its repo's `done/`: yes.
- Every `package.json` that declares `@base-ui/react` reads exactly `"1.9.0"`
  and every lockfile resolves 1.9.0: yes for the 24 manifests and 21 lockfiles
  of the table's repos (the library's own `house-style/test/fixtures` carry
  deliberately wrong pins). **No for websites/trips**: `package.json` says
  `^1.6.0` and the lockfile resolves 1.8.0. Trips uses Base UI (`src/ui/Modal.tsx`),
  is not in the table above, and is not among the private repos the owner's Q2
  listed. This tracker's 2026-11-10 table was therefore incomplete.
- imbatranim-apps' `COMMIT` names an imbatranimOS commit with the bump: yes.
- Behaviour differences, or none: written above.

**To close it:** a trips brief that pins `1.9.0` exactly (`--save-exact`) and
runs its typecheck, tests, build and a look at the `Modal`, or the owner
ruling trips out of scope. Then this brief moves to `done/` with the table
above as its outcome.
