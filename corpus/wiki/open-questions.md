---
summary: The open questions behind the 2026-11-09 briefs (02-27 here, plus Shelfmark 04, Newspapper 06, public-resource-map 01, presentation-sites 01), in dependency order for the grilling on 2026-11-10. Each has the default its brief builds, the evidence, and the briefs it unblocks. Delete a question once it is answered.
updated: 2026-11-10
---

# Open questions: the grilling of 2026-11-10

**How to use this page:**

- Answer in round order. A later round assumes the earlier answers.
- Each question gives the **default** its brief already builds. "Yes" keeps
  it, and anything else is a revisit of that brief before it is built.
- Answered questions move to [decisions.md](decisions.md) (the ones that
  pass its three-part test) or into the brief itself. Then they leave this
  page.

The questions the repo briefs raised (Q47-62), and the facts to fold into briefs 02, 03, 16 and 27, are on [open-questions-from-the-repo-briefs.md](open-questions-from-the-repo-briefs.md).

## Round 0: facts only the owner has

1. **How does vps-deploy start each Node service?** Does pm2 start
   `npm start`, or a file path such as `dist/index.js`? And does a deploy
   run the project's tests or lint first? *Unblocks* brief 15 (the deploy
   gate) and brief 16 (renaming `index.ts` to `server.ts`). vps-deploy
   wasn't readable from this session.
2. **Do any private repos use Base UI or Fastify?** The candidates are
   theme-200177-j5, uni-master, master-thesis-research, dwh-finance and
   educational-platform. *Unblocks* brief 04's table, and 15 and 16's scope.
3. **May the cloud environment reach openlibrary.org?** It was blocked on
   2026-11-09. *Unblocks* Shelfmark 04's step 1, or decides it runs on the
   owner's machine.
4. **PRs.** One per repo, as asked on 2026-11-09. Draft until the grilling
   settles the briefs, then ready for review. Do you merge them yourself,
   and do you want the briefs merged before any building starts?

## Round 1: the foundations (everything below depends on these)

5. **Tooling is shared, and UI is not.** Default: yes. The morning's
   verdict (no shared component library, because each app has its own
   look) stands, and brief 27 adds one shared *tooling* package.
   *Unblocks* 27, 15, 02, 03.
6. **`house-style` as its own public repo, used as an exact git
   dependency** (27.1)? The alternative is configs copied into each repo
   with a version header. *Unblocks* 27, 15.
7. **The Claude Code layer in this plugin** (27.0)? The plugin's `Stop`
   hook runs a repo's `check:fast` and exits 2 on a failure, and the
   `PostToolUse` hook formats the saved file. Docs: hooks are the
   deterministic layer and `CLAUDE.md` is advisory. The alternative is a
   committed `.claude/settings.json` per repo. *Unblocks* 27, 15, 23.
8. **A formatter at all, and which** (27.2)? Default: Prettier at the width
   with the least churn. On 2026-11-09, width 120 changed 1.4-2.5% of lines
   in Almanac, Satchel and wicket, and 130 changed about 1.3% in Almanac.
   Pick one width for the estate. *Unblocks* 27.
9. **Do the outliers move to the house format** (double quotes,
   semicolons)? Default: yes, in their one reformat commit. The outliers
   are Newspapper, ro-housing, sports-app and imbatranim-apps. *Unblocks*
   27, 15.
10. **How strict is `check:fast`?** Default: a typecheck plus ESLint on the
    changed files, under about 15 s on Almanac. Is a longer `Stop` gate
    acceptable? *Unblocks* 27.

## Round 2: TypeScript and lint

11. **The tsconfig additions** (27.3): `verbatimModuleSyntax` and
    `erasableSyntaxOnly` now, `exactOptionalPropertyTypes` only after
    counting its errors per repo. Agree?
12. **Six typed rules**, not all of `recommendedTypeChecked`:
    `no-floating-promises`, `no-misused-promises`, `await-thenable`,
    `switch-exhaustiveness-check`, `no-unnecessary-type-assertion`,
    `consistent-type-imports`. This keeps ward-auth's "thin config, the
    compiler first" rule. Agree?
13. **The house shapes as errors** (27.4): no `enum`, no `any`, no `!`
    assertions, `@ts-expect-error` only with a reason, no
    `TODO`/`FIXME` (they go to the corpus), no `console` outside scripts,
    no default exports except where a framework needs one. Any you would
    keep as warnings?
14. **Comments as prose** (27.5): why-not-what, every exported member
    documented. This is checked by the review gate's checklist, not by
    `eslint-plugin-jsdoc`. Agree?

## Round 3: Base UI and Tailwind

15. **Base UI imported only under `ui/` folders** (02 rule 3)? atrium
    imports it in 5 reader files, and postern in 7 feature files, which
    would move behind wrappers. Is that worth it?
16. **Where native controls stay** (02 rule 13): text, date and time
    inputs, and `<select>` where an app's decisions keep it native on
    phones. Almanac does today. Agree?
17. **Token names.** Migrations keep each app's values. Should the names
    converge on one semantic vocabulary (`surface`, `ink`, `accent`,
    `line`, `danger`), or stay per app? Default: converge for the small
    tools family (wicket, the-board, lantern), and keep per-app names
    elsewhere.
18. **Dark mode.** Default: `prefers-color-scheme` (Tailwind's default
    `dark:`), with Postern keeping its `data-theme` switch through
    `@custom-variant`. Standardise on one?
19. **Visual parity.** What counts as done for a Tailwind migration?
    Default: before and after screenshots at 1280 and 390 px, with every
    difference fixed or listed with its reason. Should any differences be
    allowed?
20. **The order of the migrations** (05-14). Default: the mini todo app
    first (a dry run), then wicket → the-board → lantern, Satchel,
    ward-auth, Almanac, Shelfmark, Postern, Newspapper.
21. **ward-auth's sign-in CSS budget** (09): a second stylesheet if the
    public pages grow by more than about 5 kB gzipped?
22. **lantern adopts Base UI** for its hand-built widgets (13), or drops the
    unused dependency?

## Round 4: the server structure

23. **`features/<name>/`**, named for Almanac's `FeatureContext`, rather
    than `modules/` (atrium, comercial-website)? (03.1)
24. **Dependencies as typed plugin options, not decorators** (03.2), and
    **explicit registration, not autoload** (03.3)?
25. **Zod route schemas with a response schema on every route** (03.4).
    The spike showed fields not in the schema are stripped. Any route that
    must send unknown keys (pass-through JSON)?
26. **Shelfmark's "nothing boots the app" against `inject()` tests**
    (03.5, 16). Keep Shelfmark's rule, or revisit it now that the harness
    has a fast and a full check?
27. **The test runner.** Default: keep atrium on `node:test`, and vitest
    everywhere else. Unify?
28. **sports-app's plain-JS server**: its own conversion brief, or leave
    it?

## Round 5: the skills library itself (17-26)

29. **Order and releases.** Default: one minor version per brief, in
    roughly this order:
    1. 21 (format check);
    2. 19 (stocktake);
    3. 02 and 03 (the skills);
    4. 27 (harness);
    5. 23 (session hook);
    6. 20 (scope discipline);
    7. 17 (ship-a-branch);
    8. 18 (diagnose);
    9. 26 (evals);
    10. 25 (security);
    11. 24 (taste);
    12. 22 (second reviewer).

    Reorder?
30. **Restructure `corpus-flow` and `plan-split-dispatch`** so their
    load-bearing rules sit in the first 5k tokens, which is what survives
    compaction? They are 16.1k and 8.6k today. This may be the
    highest-leverage finding of the day. (19)
31. **`ship-a-branch` never merges** (17.2)?
32. **A second reviewer from another vendor** (22): do you have Codex or
    Gemini set up? If not, park it.
33. **The taste suite** (24): hold the 2.1-era copy until presentation-sites'
    bake-off, re-pin the classics as opt-in, and retire
    `redesign-existing-projects`?
34. **The security audit** (25): vendor Cloudflare's skill, and run it on
    ward-auth first. What budget will you accept for one run, in time and
    usage?
35. **Evals** (26): `claude plugin eval` publishes its HTML report to
    claude.ai by default. Publish, or `--no-publish`? What `--max-cost-usd`
    per run?

## Round 6: the app features

36. **Shelfmark recommendations** (Shelfmark 04):
    - a third place in the navigation, which revisits "Two places only";
    - catalogs only, no language model;
    - refresh only on a press;
    - "next in a series" as the first source.

    And is the Romanian catalogs' author search worth its pace (5-10 s
    between requests)?
37. **Newspapper video** (Newspapper 06): is it wanted at all? 9:16 or 1:1?
    Rendered on the server, which puts a second Chrome and FFmpeg in the
    image, or only from the CLI?
38. **public-resource-map's source registry** (prm 01): may it gate
    publishing, so a source pending permission never reaches the public
    map? Does the map state go in the URL?
39. **presentation-sites' bake-off** (presentation-sites 01): the
    auto-service home page as the test, with you as the judge. A different
    page?

## Round 7: raised while writing the repo briefs (2026-11-09)

From Almanac's briefs, the reference set:

40. **The phone drawer:** keep it as a Dialog, or move to Base UI 1.9.0's
    `Drawer` with swipe-to-close?
41. **A picker that saves on every choice.** Base UI's radios choose on the
    arrow keys. Record an exception, or use a ToggleGroup instead?
42. **Vendor CSS on first paint.** Is FullCalendar's 5.4 kB of gzipped CSS on
    every page's first paint acceptable, or should it load with the calendar
    only?
43. **Error bodies.** Does the code-structure skill prescribe an error-body
    shape, or only "one handler, keep the repo's shape"? Default: the latter.
44. **A root font size other than 16 px** (Almanac's is 15 px): set Tailwind's
    `--spacing` to match, or move the size onto `body`?
45. **Markdown.** Is Markdown (corpus pages) left out of Prettier? Default:
    yes, because the corpus has its own lint.
46. **A root `CLAUDE.md`.** Should a repo whose only `CLAUDE.md` is under
    `corpus/` get a short root one with the commands? Default: yes, per
    Claude Code's guidance.
