# Task 49: lint wiki pages older than the code they link, measured first

**Depends on:** none.

**Builder:** opus, for new design whose acceptance has gaps: the warning rule takes its shape from the measurement,
and the verdict on each warning is a reading of a page against a diff.

## Context

From the odysseus research of 2026-11-23, written up in Wicket's corpus (`corpus/wiki/research-odysseus.md` there),
and [the todo](../../todos/lint-pages-older-than-the-code-they-link.md). Odysseus is AGPL-3.0: the idea only, nothing
copied. Its `specs/` pages for coding agents each name the commit they were last checked against, so a reader can
tell whether a page predates the code it describes.

corpus-flow asks the §7 lint sweep to look for stale claims by hand
([`query-ingest-lint.md`](../../../skills/corpus-flow/references/query-ingest-lint.md)). A commit stamp as a third
frontmatter key would break the "exactly two keys" rule every corpus and `lint.sh` keep. The same signal needs no new
key: for each wiki page, take the files it links to outside `corpus/`, and warn when one has a commit dated after the
page's `updated:`. The warning names the page, the file and both dates, and never fails the lint.

As of 2026-11-23, Wicket's `corpus/wiki/providers.md` said `updated: 2026-11-04` and linked
`server/src/config.ts` and `server/src/features/queue/runner.ts`, both last changed 2026-11-11 by the server move
(Wicket brief 13), which fixed the page's links but kept its date. The page has been re-dated 2026-11-24 since, so it
no longer warns. It shows the noise question: a reformat or a file move touches files without changing what a page
says. Each of the three corpora below has a `.git-blame-ignore-revs` listing its reformat commits; moves have no such
list.

## Files you OWN

- This brief: a "Measurement" section with the results.
- A throwaway script in your scratch folder, never committed.
- Only if step 4 says build: `skills/corpus-flow/references/bootstrap.md` (the `lint.sh` list),
  `skills/corpus-flow/references/query-ingest-lint.md` (§7), this repo's `corpus/lint.sh`, `README.md` (the version
  line), `docs/history.md`, both plugin files.
- `corpus/` (the closeout).

## Files you must NOT touch

- The three corpora you measure (Wicket, brief-board, almanac): read only. Fixing a stale page you find there is a
  note in the outcome, not an edit.
- `skills/corpus-flow/SKILL.md` (the lint rules live in its references), and the two-key frontmatter rule.

## What to do

1. **The check, as a script.** For a corpus: for each `corpus/wiki/*.md`, read `updated:`; collect its relative
   links that resolve to a file git tracks outside `corpus/`; for each, take the newest commit that touched it and
   compare its committer date (`%cs`) with `updated:`. A commit on the same day doesn't count. Two modes:
   - **raw:** every commit counts;
   - **filtered:** drop commits listed in the repo's `.git-blame-ignore-revs`, and commits that only renamed the
     file (`git log --follow`, keeping commits whose change to it is a modification).
   Print one line per warning: page, file, page date, commit date, commit hash and subject. Keep `.md` targets
   apart from code targets, so the verdict can drop them if they are mostly noise.
2. **Run it** over Wicket, brief-board and almanac.
3. **Judge each filtered warning.** Read what the page says about that file, then the commits since `updated:`.
   Verdict: **stale** (the page says something the code no longer does), **fine** (the commits don't touch what the
   page says) or **noise** (a kind the filter missed, named). Record under "Measurement": per corpus, the pages,
   links checked, warnings raw and filtered, and the three verdict counts; then one line per warning. If the
   per-warning list passes about 60 lines, put it in a new wiki page and link it.
4. **Decide.** Build only if, across the three corpora, more than half of the filtered warnings are stale (the
   todo's "most of them").
5. **If yes, build it:**
   - `bootstrap.md`'s `lint.sh` list: a WARN check (never a FAIL) with the rule from step 1 in filtered mode, as a
     short bash function an adopter can copy.
   - `query-ingest-lint.md` §7: `lint.sh` prints these warnings, and the sweep reads each one against the code;
     `updated:` moves only after that read.
   - This repo's `corpus/lint.sh` gets the function, so it runs here first; warnings don't change its exit code.
   - The plugin's next minor version in both plugin files, the README's version line and a `docs/history.md`
     paragraph.
6. **If no:** no skill change. The outcome says why, with the counts, and that the idea is closed.

## Acceptance

- The "Measurement" section has a row for each of the three corpora and a verdict for every filtered warning.
- `bash corpus/lint.sh` passes; nothing in the three measured repos changed (`git status` clean in each).
- If built: `bash corpus/lint.sh` here prints the warnings and exits 0 when they are the only findings;
  `node scripts/check-skills.mjs` passes; the version matches in both plugin files, the README and
  `docs/history.md`.

## Owner steps

- If built: update the plugin, and run the paid evals for `corpus-flow` (a front-door skill) by hand, recorded in
  `wiki/evals.md`.
- If not built: none.

## Owner decisions

- Settled 2026-11-24 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-24:
  - The threshold is the todo's: more than half of the filtered warnings stale.
  - A linked file is any file git tracks outside `corpus/`; `.md` targets are counted apart.
  - The date compared is the committer date, after dropping `.git-blame-ignore-revs` commits and pure renames.
  - The warning never fails the lint, and no frontmatter key is added.

## Measurement (2026-11-24)

The step 1 script ran in a scratch folder (never committed) over each repo's committed history: Wicket at `89349e1`,
brief-board at `0bad447`, almanac at `8369357`. Links are the pairs of a wiki page and a file git tracks outside
`corpus/`; a link to a folder is skipped (two in Wicket: `web/src/components/` and `web/src/components/ui/`).

| Corpus | Pages | Links (code / md) | Warnings raw | Warnings filtered (code / md) | Stale | Fine | Noise |
|---|---|---|---|---|---|---|---|
| Wicket | 12 | 35 (31 / 4) | 13 | 13 (12 / 1) | 1 | 11 | 1 |
| brief-board | 15 | 5 (3 / 2) | 0 | 0 | 0 | 0 | 0 |
| almanac | 16 | 5 (0 / 5) | 0 | 0 | 0 | 0 | 0 |
| All three | 43 | 45 (34 / 11) | 13 | 13 (12 / 1) | 1 | 11 | 1 |

The verdict rule: each warning is judged on what the page says about its own file, not on the page as a whole.
**Stale:** a claim the page makes about that file no longer holds, counting an explicit list (settings, functions)
the code has since grown. **Fine:** the commits since `updated:` change nothing the page says about the file.
**Noise:** a commit that changes no behaviour, of a kind the filter missed. Every page date below is 2026-11-11
except `decisions.md` (2026-11-13); "also" names the other filtered commits since that date.

1. `architecture.md` → `docs/owner-setup.md` (md), 2026-11-24 `89349e1` (also `777e74e`): fine. The page says only
   that vps-deploy's stack is written from it; the commits add the reasoning-level and answer-format steps.
2. `architecture.md` → `infrastructure/Dockerfile`, 2026-11-24 `c6ced3b`: fine. The deps stage now installs only
   the server, on a pinned base; one container, no docs toolchain in the image, the dated size all hold.
3. `architecture.md` → `server/src/config.ts`, 2026-11-24 `777e74e`: **stale**. The Settings paragraph lists the
   cloud settings as the key, the URL, the model and a timeout; `config.ts` now also reads `WICKET_CLOUD_THINK`.
4. `architecture.md` → `server/src/db/open.ts`, 2026-11-24 `32957d7`: fine. A third migration (the calls column);
   still "open and migrate".
5. `architecture.md` → `server/src/features/queue/queue.ts`, 2026-11-24 `32957d7`: fine. The queue counts each
   job's calls; one job at a time in ticket order, the record written at the end, all hold.
6. `architecture.md` → `server/src/features/queue/runner.ts`, 2026-11-24 `32957d7` (also `c43094a`, `777e74e`):
   fine. A JSON job may ask twice under one timeout, a reasoning-only reply fails as `thinking-only`, the `think`
   field; asking the cloud with a timeout, a failure ending the job with its reason, and a cancel told from a
   timeout by its signal all hold.
7. `architecture.md` → `server/src/features/records/store.ts`, 2026-11-24 `32957d7`: fine. Records gain a calls
   count; still counts and timings only.
8. `architecture.md` → `web/src/QueuePage.tsx`, 2026-11-13 `d8cf979` (also `e358fce`, `1a75a45`): fine. The
   redesign restyled it; it still sits over `QueueView` with the `ConfirmDialog` and `RadioGroup` wrappers. The same
   `1a75a45` added `web/src/components/Card.tsx`, so the page's list of shared pieces (`Facts`, `Table`,
   `ThemeSwitch`) misses `Card`; that link is a folder, which the rule skips.
9. `architecture.md` → `web/src/QueueView.tsx`, 2026-11-13 `d8cf979` (also `1a75a45`): fine. Restyled only.
10. `architecture.md` → `web/src/lib/cn.ts`, 2026-11-13 `a139c08` (also `1a75a45`): fine. Its token-name lists
    changed; it still merges classes.
11. `architecture.md` → `web/src/styles/index.css`, 2026-11-13 `d8cf979` (also `a139c08`, `1a75a45`, `a908a80`):
    fine. New token values; still the one stylesheet that holds the tokens.
12. `decisions.md` → `web/src/components/ui/RadioGroup.tsx`, 2026-11-24 `4ee11e3`: noise, a lint clean-up (an
    unused type unexported for knip), not in `.git-blame-ignore-revs`.
13. `sign-in.md` → `server/src/config.ts`, 2026-11-24 `777e74e`: fine. The new setting is the cloud's; the sign-in
    checks the page names are unchanged.

What the numbers show:

- **1 of 13 filtered warnings is stale**, against a threshold of more than half. A first run at Wicket's `4dfaa0f`,
  before its brief 20 landed, gave 10 warnings with the same single stale one.
- **Raw equals filtered in all three corpora.** The three Prettier reformats and Wicket's server move are all
  dated 2026-11-11, on or before the date of every page that links code, so the filter had nothing to drop. This
  data can't say how much it would save elsewhere.
- **The warnings follow link count, not staleness.** Wicket's `architecture.md` links 23 files and gave 11 of the 13
  warnings, mostly from the 2026-11-13 restyle and the 2026-11-24 server briefs. Its one stale claim is in a
  paragraph that doesn't link `config.ts`; the `Card` gap sits behind a folder link.
- **Two corpora barely link code.** brief-board's wiki links 3 code files and writes 20 code paths in backticks;
  almanac's links none and writes 48. The rule sees only links. brief-board's three code links (all in `tags.md`)
  last changed the same day as that page, which the rule doesn't count.

Decision (step 4): not built. The stale share is 1 of 13, far under half.
