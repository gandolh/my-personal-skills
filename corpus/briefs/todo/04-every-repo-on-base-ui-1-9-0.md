# Task 04: Every repo on Base UI 1.9.0

## Context

On 2026-11-09 the owner asked for every repo on the latest stable Base UI.
That day npm's `latest` for `@base-ui/react` was **1.9.0**, published
2026-10-09; there was no `next` tag. Brief 02's rule 1 says every repo pins
it exactly.

The versions resolved in each repo's lockfile on 2026-11-09:

| Repo (workspace) | Spec in package.json | Resolved | Work |
|---|---|---|---|
| comercial-website (`frontend`) | `^1.4.1` | 1.4.1 | bump, pin |
| mini-projects (`literally-a-todo-app/frontend`) | `^1.4.1` | 1.4.1 | bump, pin |
| ImbatranimOS (`packages/ui`, `apps/core`) | `^1.4.1` | 1.6.0 | bump, pin, then re-sync the kit (below) |
| ro-housing (`web`) | `1.5.0` | 1.5.0 | bump |
| newspapper (`ui`) | `1.5.0` | 1.5.0 | bump |
| atrium (`apps/web`) | `1.6.0` | 1.6.0 | bump |
| public-resource-map (`ui`) | `1.6.0` | 1.6.0 | bump |
| imbatranim-apps (root) | `1.6.0` | 1.6.0 | bump after ImbatranimOS |
| sports-app (`client`) | `1.6.0` | 1.6.0 | bump |
| 3D-sandbox (`apps/web`) | `1.8.0` | 1.8.0 | bump |
| presentation-sites (`sites/saloon`, `churchix/packages/ui`) | `^1.9.0` | 1.9.0 | pin only |
| shelfmark, ward-auth, the-board, almanac, wicket, postern, lantern, Satchel; presentation-sites' `auto-service`, `tractari`, `subcort` | `1.9.0` | 1.9.0 | none |

Not checked: the owner's private repos (theme-200177-j5, uni-master,
master-thesis-research, dwh-finance, educational-platform), and repos the
survey found no Base UI in. Check the private ones in a session that has
them, and add a row if any uses Base UI.

There are two breaking changes between 1.4 and 1.9:

- `OTPFieldPreview` became `OTPField`, imported from
  `@base-ui/react/otp-field`.
- `sanitizeValue()` became `normalizeValue()`.

A grep of every repo above on 2026-11-09 found neither in use. Re-run the
grep before bumping. Everything else in the changelog from v1.5.0 to v1.9.0
is a fix or an addition, but read those sections anyway for behaviour
changes in the components each repo uses: focus, dismissal, animations and
positioning.

**The kit.** imbatranim-apps vendors ImbatranimOS's `packages/ui/src`
byte-for-byte at a commit recorded in `vendor/imbatranim-ui/COMMIT`. It is
written by `npm run kit:sync -- <os-checkout> <commit>` and must not be
hand-edited. So ImbatranimOS bumps first and commits, then imbatranim-apps
bumps its own dependency and re-syncs to that commit.

## Files you OWN

In each repo in the table with work to do:

- the `package.json` that declares `@base-ui/react`, and that repo's
  lockfile;
- any source file a breaking change or a behaviour change forces;
- one `corpus/log.md` entry in that repo, where it has a corpus.

## Files you must NOT touch

- Styling. The Tailwind moves are briefs 05-14. A bump that needs a visual
  change is a finding to log, not a restyle.
- `vendor/imbatranim-ui/` in imbatranim-apps, except through `kit:sync`.
- Other dependencies. Don't run a general `npm update`.

## What to do

One repo per session (a session that has that repo). In each:

1. Re-run the grep for `OTPFieldPreview`, `otp-field` and `sanitizeValue`.
2. Set `"@base-ui/react": "1.9.0"` exactly, then
   `npm install @base-ui/react@1.9.0 --save-exact` in the workspace. Check
   that the lockfile resolves 1.9.0 and nothing else changed beyond Base
   UI's own dependency tree (`@floating-ui/*` and the like).
3. Run that repo's `typecheck`, `test`, `lint` and `build` scripts, whichever
   exist. Fix what the bump broke, and keep each fix to what the bump needs.
4. Open the app, using the repo's `ui-test-plans` hub if it has one, and
   check each Base UI component it uses. Open and close it, press Esc, use
   the keyboard, and look at it at phone width. Write down anything that
   behaves differently.
5. Commit with `chore(deps): @base-ui/react 1.9.0`, and add a line to the
   repo's `corpus/log.md`.
6. ImbatranimOS, then imbatranim-apps (`kit:sync` to the new commit, then
   steps 2-5).

## Acceptance

- Every `package.json` in the estate that declares `@base-ui/react` reads
  exactly `"1.9.0"`, and every lockfile resolves 1.9.0. Check with this
  brief's grep, plus the lockfile read from the survey.
- In each repo, the scripts in step 3 pass, or the outcome note says which
  already failed before the bump.
- imbatranim-apps' `vendor/imbatranim-ui/COMMIT` names an ImbatranimOS
  commit that has the bump.
- The outcome note lists every behaviour difference found in step 4, or
  says none was found.
