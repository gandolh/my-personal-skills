# Task 52: each app keeps its own theme key

**Depends on:** none.

**Builder:** sonnet. A reference page, one rule's wording and one source check with its tests.

## Context

Filed 2026-11-25. The owner reported that the colour-mode picker acts per account rather than per app: picking Dark in
one app turns the others dark too. Ward stores no display settings (its `theme.ts` says so). The cause is
storage. Every app served under a path of the shared domain has one localStorage, and seven of them keep the choice
under the same bare key, `theme`: brief-board, Mercatus (comercial-website), Gazette, Lantern, ro-housing, Wicket and
Solstice (3D-sandbox). Each of those apps gets its own brief to rename its key. This brief fixes the source they
copied it from.

[`skills/base-ui/references/theme.md`](../../../skills/base-ui/references/theme.md) gives the boot script
`localStorage.getItem("theme")` and the store `const KEY = "theme"`. Rule 14 in the base-ui skill says the choice is
"kept on the device" and is enforced by review only. The apps that already got it right picked their own prefix:
`almanac.theme`, `shelfmark.theme`, `sports-app.theme`, `gatehouse.mode`. Apps on their own host (Satchel, Postern,
Ward, imbatranimOS) can't collide, but nothing in the reference says why the key needs a name.

## Decisions

All settled. None of them is open.

- **The key is `<app>.theme`**, where `<app>` is the app's path name on the shared domain (`lantern.theme`,
  `piataro.theme`). An app on its own host uses its name the same way. One rule for every app, so nobody has to know
  where an app is served.
- **A first load after the rename carries the old value over once**: if `<app>.theme` is empty and the bare `theme`
  holds `light`, `dark` or `system`, the app writes that value to its own key and uses it. It never deletes or
  writes the bare key, since an app not yet renamed may still read it. The reference shows this in both the boot
  script and the store.
- **check-base-ui gets a rule 14 error** for a bare `"theme"` storage key in source: a `localStorage.getItem` or
  `setItem` call whose first argument is the literal `"theme"`, or a constant named `*KEY` set to it. Test files are
  skipped, as for the other rules. The legacy read in the carry-over must pass, so the check allows the literal
  inside a function or constant whose name says legacy (`LEGACY_THEME_KEY`, `readLegacyTheme`). The tests cover
  both cases.
- house-style goes to 1.4.0 (a new error). Repos take it when they next run `house-style:sync`. A repo the new error
  fires on renames its key in the same change. Satchel and Ward are the two known cases, both on their own host.

## Files you OWN

- `skills/base-ui/references/theme.md`, `skills/base-ui/SKILL.md` (rule 14's text and enforcement column)
- `house-style/bin/check-base-ui.mjs`, `house-style/test/check-base-ui.test.mjs`, `house-style/package.json`,
  `house-style/CHANGELOG.md`, `house-style/README.md` if it lists the rules
- The plugin version (`.claude-plugin/plugin.json`, both places in `.claude-plugin/marketplace.json`), the version
  line in `README.md` and `docs/history.md`, as every skill change does
- `corpus/wiki/status.md`, `corpus/log.md`

## Files you must NOT touch

- Any app repo. Each app's rename is its own brief.
- The other skills.

## Steps

1. Rewrite the boot script and the store in `theme.md` with `<app>.theme` and the one-time carry-over, and say in
   two sentences why the key carries the app's name (one localStorage per origin, apps share the origin).
2. Rule 14 in `SKILL.md`: the choice is kept on the device under the app's own key; the enforcement column names
   check-base-ui.
3. Add the check to `checkSource`, with the message: `rule 14: a bare "theme" storage key is shared by every app on
   the domain; use "<app>.theme"`.
4. Tests: a bare key in `getItem`, in `setItem` and in a `KEY` constant fails; `lantern.theme` passes; a legacy
   read named as such passes; a test file is skipped.
5. Bump house-style to 1.4.0 and the plugin's minor version the way `corpus/CLAUDE.md` says; the changelog and
   `docs/history.md` name the seven apps and the two own-host ones.

## Acceptance

- [ ] `npm test` in `house-style/` passes, with the new cases.
- [ ] Run against a scratch copy of Lantern's web app, the check fires on its `theme.ts`; against Almanac's it stays
      quiet.
- [ ] The reference's boot script and store agree on the key and the carry-over, and its code still runs: paste both
      into a scratch Vite app and check that a stored bare `dark` comes back as `dark` under `<app>.theme`.
- [ ] `bash corpus/lint.sh` passes.

## Owner steps

- None. Repos take house-style 1.4.0 through their own briefs or syncs.

## Owner decisions

- Settled 2026-11-25 (owner): "color-mode picker should be per app, not per ward account." The key's form, the
  carry-over and the check are the controller's calls.
