---
summary: The second page of estate-wide facts from the 2026-11-10 repo brief sets (game-engine, just-a-bot and the later sets and revisions): Prettier's own churn, a program-neutral reformat check, test runners that read production env, typecheck scripts that check nothing. Read with the first facts page before revising briefs 02, 03, 16 or 27.
updated: 2026-11-10
---

# Facts from the repo briefs of 2026-11-10, part 2

The first page is
[facts-from-the-repo-briefs-2026-11-10.md](facts-from-the-repo-briefs-2026-11-10.md).

From game-engine and just-a-bot:

- **Prettier churns code already in house style.** It normalises number
  literals (`0xA11CE0` to `0xa11ce0`, `0.40` to `0.4`) and rewraps long lines:
  66% of game-engine's files change though it already uses double quotes and
  semicolons.
- **A program-neutral reformat check.** Bundle each file with esbuild before
  and after the reformat and compare the output. 4 of 1,476 game-engine files
  differ, each explainable. The estate's reformat commits can use this as
  their acceptance.
- **Reformat hazards in a deterministic codebase.** Turning parameter
  properties into fields can change key order (`JSON.stringify`,
  `Object.keys`), so the new fields follow the existing ones in parameter
  order. Deleting an "unused" `const x = rng.next()` shifts every later draw,
  so the call stays as a bare statement.
- **`.prettierignore` needs non-TypeScript sources:** AssemblyScript (its
  decorators don't parse), generated files, and sources a hash test checks
  against committed binaries.
- **`.gitignore` with `.claude/*`** needs a `!.claude/rules/` line.
- **Tests that read production env.** Two just-a-bot tests import the env
  loader, which reads the checkout's `.env`, and that file holds production
  values. A `Stop` hook or `check` that runs `npm test` there would read
  production secrets. Such a repo runs its tests in a copy without `.env*`
  (`test:clean`), and the harness says so.
- **`--workspaces --if-present` can check nothing.** just-a-bot's root
  `typecheck` checked only the docs site, because the bot's own workspaces had
  no `typecheck` script.
- **A Docusaurus workspace breaks the exact-pin rule** (`~6.0.2`
  TypeScript, 16 `^` ranges) even where the main code pins exactly.
- **"todo" as vocabulary.** In game-engine "todo" names a spec, so
  `no-warning-comments` matches prose 18 times. The rule matches `TODO:` only.
