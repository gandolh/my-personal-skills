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

- Settled 2026-11-25 (owner): promote it ("promote what's possible").
- The planner's technical calls, 2026-11-25:
  - The threshold is the todo's: more than half of the filtered warnings stale.
  - A linked file is any file git tracks outside `corpus/`; `.md` targets are counted apart.
  - The date compared is the committer date, after dropping `.git-blame-ignore-revs` commits and pure renames.
  - The warning never fails the lint, and no frontmatter key is added.
