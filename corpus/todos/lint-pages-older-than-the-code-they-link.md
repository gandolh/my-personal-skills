---
title: Lint wiki pages older than the code they link
created: 2026-11-23
status: promoted
tags: [corpus-flow]
---

# Lint wiki pages older than the code they link

Promoted 2026-11-25 to [brief 49](../briefs/todo/49-lint-wiki-pages-older-than-the-code-they-link.md).

From the odysseus research of 2026-11-23, written up in Wicket's corpus (`corpus/wiki/research-odysseus.md`
there). Odysseus is AGPL-3.0: the idea only, nothing copied.

Odysseus keeps a `specs/` folder for coding agents in which every page names the commit it was last checked
against, and a list of triggers says which pages a kind of change must update (`specs/_readme.md@17ff9ea`).
A reader can tell whether a page predates the code it describes.

corpus-flow already asks the §7 lint sweep to look for stale claims, by hand
(`skills/corpus-flow/references/query-ingest-lint.md`). A commit stamp as a third frontmatter key would break
the "exactly two keys" rule every corpus and `lint.sh` keep. The same signal is available without one: for
each wiki page, take the code files it links to, and warn when one of them has a commit dated after the
page's `updated:`. The warning names the page, the file and both dates, and it never fails the lint.

An example of what it would flag: Wicket's `corpus/wiki/providers.md` says `updated: 2026-11-04` and links
`server/src/config.ts` and `server/src/features/queue/runner.ts`, both last changed 2026-11-11 by the server
move (brief 13). Brief 13's corpus commit fixed the page's link but kept its date, so the content may still
hold. That is
the noise question: a reformat or a file move touches every file without changing what a page says.
`.git-blame-ignore-revs` lists the reformat commits and could be skipped, moves could not.

Measure first: run the check by hand over three corpora (Wicket, brief-board, almanac) and count how many
warnings point at a page whose content is really out of date. Build it into corpus-flow's `lint.sh` guidance
only if most of them do.
