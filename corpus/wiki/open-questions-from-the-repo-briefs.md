---
summary: The estate-wide questions and facts that the repo-local briefs of 2026-11-09/10 raised (Almanac, Satchel, the-board, Newspapper, wicket, Shelfmark, Postern, lantern, ward-auth), grouped by theme, for the owner's grilling. They add to open-questions.md (Q1-46). Each answer lands in the skills library's brief 02, 03 or 27, then in each repo's brief.
updated: 2026-11-10
---

# Questions from the repo briefs (Round 8)

These are cross-repo questions and facts. Each repo's own questions are in its
briefs, under "Owner decisions". The numbering continues from
[open-questions.md](open-questions.md).

## Facts to fold into the skills-library briefs (no decision needed)

- **The zod type provider.**
  - Its serializer throws on any `.transform()` in a response schema. This
    hits Almanac (`occurrenceSchema`) and Shelfmark (`savedViewSchema.state`).
  - It also resolves a second zod copy (the-board), so a root `overrides`
    entry dedupes it.
- **A declared status becomes a 500.** If a response schema declares a status
  the handler doesn't send itself (a guard's 401), that reply becomes a 500
  (wicket). Declare only the statuses each handler sends.
- **`connectionTimeout` cuts long responses:** wicket's 25 s long poll,
  lantern's 26 s record route, ward-auth's slow SMTP. Set it per repo.
- **The `.parse(request.` regex misses helper parsing:** wicket has 5 such
  sites and lantern 13. The structure checker needs a better test than
  grep.
- **Env loaders fail quietly.** Copied `REPO_ROOT` and env loaders swallow
  ENOENT, so a moved file silently drops `.env` (Shelfmark, lantern). The
  server brief centralises them in `config.ts`, which fails loudly.
- **`npm test` fails on a fresh clone** without a prior build in Satchel, the
  Board, Shelfmark and lantern. Every repo gets a `pretest`.
- **Newspapper's tsconfigs exclude its tests,** hiding 117 errors: an
  eleventh "green because nothing ran".
- **`erasableSyntaxOnly` costs parameter properties:** Satchel has 10 and
  wicket 3. Brief 27 said the house had none.
- **Unlayered legacy CSS beats Tailwind's utilities,** so a migration imports
  all old CSS into one `layer(legacy)` and empties it file by file
  (Postern's method, which the estate should adopt).

## Lint strictness

47. **Non-null `!`** is an error in source and a warning in tests. The
    counts: the-board 65, Shelfmark 123, Postern 536 (454 of them in tests),
    wicket 58 (51 in tests), Newspapper 187 in tests. Agree?
48. **`switch-exhaustiveness-check`** with `considerDefaultExhaustiveForUnions:
    true`? It takes Shelfmark from 7 findings to 0, and all 4 of wicket's are
    open unions.
49. **React components with default exports** (Newspapper has 46 files):
    allowed, or move to named exports?
50. **`noUncheckedIndexedAccess`** where it is off (Newspapper: 139 errors in
    source and about 270 in tests): adopt now, or defer?

## Formatter width (refines Q8)

51. **One estate width, or a width per repo?** The least-churn widths
    measured were:

    | Repo | Least churn | Detail |
    |---|---|---|
    | Almanac | 130 | about 1.3% |
    | wicket | 130 | 0.8% |
    | the-board | 150 | 7.3% at 130 |
    | Postern | 180 | at least 160 files change at any width |
    | Newspapper | 100 | its current width |

    Default: one width (120 or 130), with the reformat commit accepted as a
    one-off.

## Server structure

52. **Validation before authorisation.** Route schemas validate before the
    owner checks run, on three of Satchel's routes. Accept that?
53. **Streams and binary routes** (Newspapper has 7 streams, lantern has
    posters): exempt from response schemas, with a `conventions.json`
    entry?
54. **A big `store.ts`:** split it by feature, or keep it whole in `db/`?
    Satchel's has 24 methods and one transaction across 3 tables, and the
    Board's tickets and runs import each other's stores. Default: keep it
    whole.
55. **Where do zod schemas live** in a repo with no `shared/` (Newspapper):
    a new `shared/`, or in `api/`?
56. **The `ApiError` class, and decorators as a test seam:** keep or drop?
    Can a feature's CLI live beside the feature?

## Base UI and Tailwind

57. **An always-one-chosen filter:** `RadioGroup`, or a guarded
    `ToggleGroup`? This recurs in Almanac, Newspapper, lantern and wicket.
58. **Inline confirms** (Satchel, Shelfmark): move to `AlertDialog`? And do
    form dialogs get `disablePointerDismissal`?
59. **Where the wrappers live** in a repo with feature folders (Postern):
    still `components/ui/`?
60. **A DOM test environment** for Base UI behaviour (the-board, wicket), or
    only Playwright checks?
61. **The small-tools family's token names:** `bg-bg` and `text-text`, or
    `page` and `ink`? Does a family name promise a value, or only a role?
    Does the family use width 150?
62. **A named type scale** (Satchel uses 13 sizes), a `phone` custom variant
    for "≤640" breakpoints (Tailwind's `max-sm:` is `<640`), and
    `data-testid` for class-based test selectors (Postern has 60)?
