# Task 29: Workflow agents: brief-builder, screen-capturer, brief-auditor, owner-steps, and verify-brief

## Context

On 2026-11-12 the owner asked whether specialised subagents, beyond the
design team of brief 28, would pay for themselves in the estate's brief
runs: "Judge about it, see if we can benefit from them and create them if
you find them useful." A research pass read the run ledger of 2026-11-10 to
2026-11-12 (about 100 builder results), the Claude Code docs on subagents
and hooks, and the large agent collections. Its verdict, which the
controller accepted:

- **Make a script first.** The controller's verify loop ran the same checks
  about 100 times: `npm run check`, the house-style sync check, Prettier, a
  grep for machine paths, untouched paths, `npm audit`, and a re-run of
  load-sensitive tests one file at a time. None of it needs a model.
- **brief-builder.** The most frequent dispatch. Today every builder is a
  `general-purpose` agent told to read a common file of hard rules. Rules a
  hook can enforce (no push, no `pkill`, no docker builds, no `.env`
  reads, no killing another agent's process) move into hooks, and leaving
  the `Agent` tool out stops a builder from starting sub-builders past the
  cap.
- **screen-capturer.** Five capture prompts on 2026-11-12 repeated the same
  35 lines of rules. The redesign fan-out (22 apps, before and after) needs
  one method.
- **brief-auditor, as a trial.** About 7 of the controller's catches were
  skipped acceptance items or review-only rule breaks. A read-only sonnet
  auditor might catch those before the controller spends opus tokens.
  Keep it after 5 briefs only if it finds real gaps with few false
  positives.
- **owner-steps, a compiler.** About 80 owner steps are scattered across
  tickets, with order constraints, and about 8 tickets named the wrong deploy
  phase.
- Skipped: a security agent (the built-in `/security-review` runs on
  flagged briefs instead), a docs writer, a test writer, a closeout clerk, a
  dependency updater and a skill-fold editor.

Two facts from the docs shape the build:

- Frontmatter `hooks` are **ignored for plugin agents**. They run for
  user-level agents in `~/.claude/agents/`. So the library keeps the source,
  and an install script copies the agents and their guard script and writes
  the guard's absolute path into each agent's hooks.
- A custom agent's prompt **replaces** the default system prompt, so the
  builder's body carries the general essentials too (git hygiene, honest
  reports, no claim without a fresh check).

Brief 18 plans an `owner-steps` **skill** (a wizard that turns a corpus's
owner steps into an interactive script). The agent here is different: it
reads tickets and compiles one ordered deploy list, read only. If brief 18
is built, its wizard can take this agent's list as input.

## Files you OWN

- `scripts/verify-brief.mjs` (new) and its tests.
- `hooks/agent-guard.mjs` (new, self-contained so it copies as one file),
  its tests in `hooks/hooks.test.mjs`.
- `agents/brief-builder.md`, `agents/screen-capturer.md`,
  `agents/brief-auditor.md`, `agents/owner-steps.md` (new).
- `scripts/install-agents.mjs` (new) and its tests.
- `skills/plan-split-dispatch/SKILL.md`: the custom-agents line, the
  dispatch step, the verify gate, the review gate and the pause step.
- `README.md`, `docs/history.md`, both plugin files, `corpus/`.

## Files you must NOT touch

- `agents/design-*.md` and `corpus/todos/finish-the-design-team-agents.md`:
  the redesign pilot is still running.
- Any `~/.claude` file. The install script is written and dry-run tested,
  never run for real here.

## What to do

1. **`scripts/verify-brief.mjs <repo> <base>`.** Zero dependencies, like the
   other scripts. It runs one check at a time, never in parallel, and prints
   one line per check with its exit code, about 15 lines in all. It exits
   non-zero on any failure.
   - The gate from the repo's `package.json`: `check`, else `typecheck`
     then `test`. `--gate "<cmd>"` replaces it for a repo without one.
   - `house-style:sync -- --check` and `format:check`, when the scripts
     exist.
   - `git status` clean; no tracked `node_modules` or `.env` file.
   - The added lines of `git diff <base>..HEAD` grepped for machine paths,
     the current username and the words in `VERIFY_BRIEF_DENY` (a domain,
     a GitHub name). No such word is written into the script.
   - `--untouched <glob>`, repeatable: no changed path may match.
   - `npm audit --omit=dev`: the count of high and critical advisories.
   - A known-flaky list (`--flaky <file>`, default `.flaky-tests` in the
     repo): when the gate fails and every failing test file it names is on
     the list, each is re-run alone, and the gate passes with a note if they
     all pass.
2. **`hooks/agent-guard.mjs <mode>`**, a PreToolUse hook with four modes.
   - `builder`: blocks `git push`, `--no-verify` (and `git commit -n`),
     `pkill`, `killall`, `pgrep -f`, docker builds (`docker build`,
     `docker compose build`, `--build` on docker), and any read or edit of
     a `.env` file by Read, Edit, Write, Grep or Bash. A `kill <pid>` passes
     only when `/proc/<pid>/cwd` sits under a folder the agent has worked
     in (a repo it changed into or wrote to, or a scratch folder it made).
   - `capturer`: the builder's rules, plus no git command that changes a
     checkout, and the Write tool only inside a folder marked with
     `.screen-capturer-out` that is not inside a git checkout.
   - `audit` and `owner-steps`: Bash is read only, an allowlist of commands
     with no redirect into a file. `owner-steps` also passes the read-only
     `brief-board` verbs and `node cli.ts` `versions`, `status`, `history`,
     `--list` and `--graph`.
   - The matcher splits a command into its parts, so a quoted string,
     `git -C x push`, `cd x && git push` and `bash -c "git push"` are all
     caught, and a commit message that mentions `git push` or `.env` is not.
3. **`agents/brief-builder.md`**: sonnet; tools Read, Write, Edit, Bash,
   Glob, Grep, Skill, with no `Agent`. The body has the stable rules, the
   board steps and the report contract. It tells the agent to read the
   common file and the prompt files the caller names.
4. **`scripts/install-agents.mjs`**: copies the four agents and the guard
   into the user's Claude folder and writes the guard's absolute path into
   each agent's hooks. Idempotent, with `--dry-run` and `--target`.
5. **`agents/screen-capturer.md`**: sonnet, tools Read, Bash, Glob, Grep,
   Write, maxTurns 80. Its input and output contract is the research's: apps,
   screens, viewports, themes, refs, output folder and ports in; shots, a
   `shots.md` per app and a short report out. It folds in the capture
   prompts' lessons: seeded data, a frozen clock, headless only, free
   ports, only its own PIDs.
6. **`agents/brief-auditor.md`**, a draft: sonnet, effort high, tools Read,
   Grep, Glob, Bash (read only by hook). It returns a table of acceptance
   lines met, unmet or unverifiable with evidence, plus the review-only
   rules for the brief's kind. 25 lines at most, no style findings.
7. **`agents/owner-steps.md`**: haiku, tools Read, Grep, Glob, Bash (read
   only by hook). One ordered checklist per stack with the phase, its
   preconditions and post-deploy checks, then the taste questions apart. It
   flags a ticket whose phase doesn't match the paths it changed.
8. **`plan-split-dispatch`**: it uses `brief-builder` when installed, else
   `general-purpose` with the common file. The verify gate runs
   `verify-brief`, then `brief-auditor`, then the controller's own pass. For
   brief-backed runs the review gate is `brief-auditor` plus
   `/security-review` on briefs flagged auth or personal data. At a pause or
   session end, `owner-steps` writes the deploy list.
9. **Release** 0.46.0: the plugin's agents list, both version places, the
   README and a `docs/history.md` paragraph.

## Acceptance

- `node --test hooks/hooks.test.mjs` passes, with cases for each blocked
  form above and for the commit messages, `tsc --build`, `process.env` and
  `.env.example` that must pass. The kill gate is tested with real child
  processes.
- `verify-brief.mjs` passes and fails as it should on scratch repos (a
  dirty tree, a tracked `.env`, a machine path in the diff, an untouched
  path, a failing gate, a flaky file re-run alone).
- `install-agents.mjs --dry-run` prints what it would write, and a run with
  `--target` on a scratch folder, twice, writes the same files.
- `node scripts/check-skills.mjs` and `bash corpus/lint.sh` pass, and the
  version is 0.46.0 in every place.

## Outcome (2026-11-12, v0.46.0)

Built as specified. Commits ebb7678, e84eda8, 8ac2541, 683e299, 9a18ecf,
9513154, aff0324, 1cd3f87, d91ec3e and 4fb12fd.

- **verify-brief** works on any repo. Run on this brief's own range, its
  diff grep caught a literal machine path in its own test fixture (fixed in
  d91ec3e). After the fix all its checks pass.
- **agent-guard** has 4 modes and 11 test groups. They cover every blocked
  form named above, plus the forms that must pass: commit messages in `-m`,
  `-F -` heredocs and `$(cat <<EOF ...)`, `tsc --build`, `process.env`,
  `.env.example`, and `rsync --exclude .env`. The kill gate is tested with
  real child processes: its own checkout passes, another checkout is
  blocked, a scratch folder passes once written to, the home folder and a
  folder of checkouts are refused, a nested checkout passes, and
  `kill $PID`, `xargs kill` and `kill -9 -1` are blocked.
- **The agents** use the hook in the shell-string form the subagent docs
  show. `install-agents.mjs` was tested on scratch targets only. It writes
  the guard to `hooks/personal-skills/` under the target, not into
  `agents/`, because Claude Code reads that folder recursively. It keeps any
  agent file it didn't write unless `--force` is given.
- **Deviations:**
  - `.env.example`, `.sample` and `.template` pass the guard.
  - A flaky test that passes when re-run alone turns a failed gate into
    exit 0, with a note.
  - An offline `npm audit` counts as a skip, not a failure.
- **Not verified:** that frontmatter hooks fire in a live subagent. That
  needs the real install. The owner step is the smoke test: dispatch bare
  `brief-builder` to run `git push --dry-run` in a scratch repo and expect
  `agent-guard (builder): blocked`.
- **For later:**
  - brief-auditor is a draft. Keep or drop it after 5 briefs.
  - Brief 18's `owner-steps` skill (a wizard) can take this agent's list
    as input.
