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
