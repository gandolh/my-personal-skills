# my-personal-skills corpus index

Start here. Triage on the summary lines and open at most 2-3 pages.

- [CLAUDE.md](CLAUDE.md) - the rules for this corpus
- [routing.md](routing.md) - which skill runs the work, which layer answers which question
- [log.md](log.md) - chronological record of meaningful changes

## Wiki

<!-- BEGIN CATALOG -->

- [wiki/decisions.md](wiki/decisions.md) - Locked calls for the skills library, each with the date, the alternative and the reason. Vendoring over first-party-only (2026-08), pinned upstreams with licenses kept, ideas adopted but not copied, a prune of unused skills, and blocked work in its own folders; Base UI conventions as a skill instead of a shared component library (2026-11-09); Hallmark as the estate's design skill, house-style as a library folder vendored into each repo, Prettier at one width of 120, and the house tsconfig flags (2026-11-10).
- [wiki/facts-from-the-repo-briefs-2026-11-10-part-2.md](wiki/facts-from-the-repo-briefs-2026-11-10-part-2.md) - The second page of estate-wide facts from the 2026-11-10 repo brief sets (game-engine, just-a-bot and the later sets and revisions): Prettier's own churn, a program-neutral reformat check, test runners that read production env, typecheck scripts that check nothing. Read with the first facts page before revising briefs 02, 03, 16 or 27.
- [wiki/facts-from-the-repo-briefs-2026-11-10.md](wiki/facts-from-the-repo-briefs-2026-11-10.md) - Estate-wide facts found while writing the repo-local brief sets on 2026-11-10 (mini-projects, atrium, comercial-website, public-resource-map, sports-app, ro-housing, 3D-sandbox and later sets): lint, tsconfig, Tailwind layering, Fastify and zod traps, each with its repo and evidence. Read before revising briefs 02, 03, 16 or 27.
- [wiki/grilling-2026-11-10-technical-calls.md](wiki/grilling-2026-11-10-technical-calls.md) - The technical calls made by convention for open questions Q1-62 on 2026-11-10 (formatter, lint, tsconfig, Base UI, Tailwind tokens, server structure, library order), each with its reason, for the owner to overrule. Read with grilling-2026-11-10.md before revising a brief.
- [wiki/grilling-2026-11-10.md](wiki/grilling-2026-11-10.md) - The owner's answers to open questions Q1-62 from the grilling of 2026-11-10, and the facts looked up instead of asked. Each answer names the briefs it changes. Read this before revising any brief built on a default from open-questions.md.
- [wiki/house-style-part-2.md](wiki/house-style-part-2.md) - Part 2 of the house-style measurements (brief 27), collated from the repo harness briefs - each repo's lint findings for the typed rules and the house shapes, the timings of tsc, ESLint (projectService against project), Prettier and the tests, the knip results, what no brief measured, and the two convention checkers' counts per rule on ro-housing, Almanac, atrium and wicket (2026-11-11, for brief 16's table).
- [wiki/house-style.md](wiki/house-style.md) - The house-style measurements for brief 27, collated from the 23 repo harness briefs of 2026-11-09 and 2026-11-10 (not re-measured) - Prettier churn per repo at width 120 and its least-churn width, the TypeScript flag error counts, and the calls made on the four rules whose counts looked wrong. Rule findings, timings, knip and the gaps are on house-style-part-2.md.
- [wiki/open-questions-from-the-repo-briefs.md](wiki/open-questions-from-the-repo-briefs.md) - Questions Q47-62 from the repo-local briefs (Round 8) were answered on 2026-11-10, and their facts folded into briefs 02, 03, 16 and 27. Read it only to find where.
- [wiki/open-questions.md](wiki/open-questions.md) - Open questions Q1-46 for the grilling of 2026-11-10 are all answered; this page points at where the answers are. Read it only to find that out.
- [wiki/overview.md](wiki/overview.md) - What the my-personal-skills library holds (one front door, a corpus workflow, design and docs layers, vendored skills), how it ships, and what it leaves out.
- [wiki/status.md](wiki/status.md) - Snapshot of the skills library - on 2026-11-09 version 0.35.0 and the 26 briefs filed that day (02-27) with what each is for; after the grilling of 2026-11-10, the trackers, brief 27's library half at version 0.36.0 (the house-style skill and the plugin's hooks), and brief 02's base-ui skill at version 0.37.0 (2026-11-11).

<!-- END CATALOG -->

## Work

- The snapshot is in [wiki/status.md](wiki/status.md). Specs are in
  [briefs/](briefs/) and run in number order.
