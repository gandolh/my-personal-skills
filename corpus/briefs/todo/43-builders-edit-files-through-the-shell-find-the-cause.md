# Task 43: builders edit files through the shell, find the cause

## Context

A month of the owner's subagent runs (2026-10-19 to 2026-11-17, 624 runs)
shows builders writing code with shell commands where the Edit and Write
tools were on offer.

| Runs | Edit | Write | Bash |
|---|---|---|---|
| sonnet, all 293 | 3 | 66 | 16,357 |
| opus, all 205 | 369 | 911 | 15,225 |
| `brief-builder` on sonnet, 37 | 0 | 4 | 3,263 |
| `brief-builder` on opus, 11 | 8 | 41 | 1,941 |

- 6,178 sonnet shell commands look like file writes (a heredoc into a file,
  `sed -i`, an inline script that writes). In a sample of 400, 224 targeted
  repo source or config, 32 a corpus or markdown file, 13 a scratch file, and
  131 had no target the sampler could read.
- Opus does it too, less: about 3,160 such commands.

What is ruled out:

- **The tool list.** `brief-builder` lists Edit and Write on both models.
- **Denials.** One Write was denied in the whole month.
- **Deferred tools.** No run searched for Edit or Write.
- **The definition's text.** `agents/brief-builder.md` says nothing that
  steers toward the shell.

The cause is not known. It may be a habit of the model in a long agent run,
or something in the prompt files the estate's builds pass in, which are not
in this repo.

Why it matters here:

- The plugin's `PostToolUse` hook matches `Edit|Write`. It formats the saved
  file with the repo's Prettier and notes the file for the `Stop` check. A
  file written through the shell gets neither.
- A heredoc resends the whole file as output tokens. Edit sends the changed
  lines.
- The guard hook does read shell redirects, so its blocks still hold.

## Files you OWN

- This brief, for the findings.
- After the cause is known: `agents/brief-builder.md` (one rule, if a rule is
  the fix), or `hooks/` (if a hook should also see shell writes), then
  `README.md`, `docs/history.md`, both plugin files, `corpus/`.

## What to do

1. Read one sonnet and one opus `brief-builder` transcript from the first
   file change onward: which tool, what came just before it, any hook output.
2. Run one small brief twice on sonnet with `brief-builder`: once as today,
   once with one added line, "Change files with Edit and Write; use the
   shell for commands." Compare tools used, output tokens and calls.
3. Write the cause, or the best-supported guess, under "Findings".
4. Recommend one fix to the owner: the added line in the definition, a hook
   that formats files the shell wrote, both, or nothing.

## Acceptance

- "Findings" names the cause or says what was tried and ruled out, with the
  two runs' numbers.
- The owner has one recommendation to pick.
- No skill, agent or hook file changes before that pick.

## Findings

**Step 1, 2026-11-17 (the transcripts).** The 48 `brief-builder` runs were
read from their first change to a repo file.

- Both models were offered the same tools: Read, Write, Edit, Bash, Skill and
  the hand-back tool. Glob and Grep, which the definition lists, were not in
  the offered set.
- On sonnet, the first repo write in all 37 runs was a shell heredoc that
  appended an entry to `corpus/log.md`. Appending is the one write the shell
  does in a single call where Edit needs a Read first. No sonnet run used
  Edit afterwards.
- On opus the first write was a heredoc in 7 runs, Write in 4 and Edit in 2.

**Step 2, 2026-11-17 (two runs).** One small brief (an optional field across
a model, a store, a formatter, their tests and a README, in a throwaway repo
with no prompt files) was built twice by `brief-builder` on sonnet. The second
prompt added one line: "Change files with Edit and Write; use the shell for
commands."

| Run | API calls | Read | Edit | Write | Bash | Output tokens | Result |
|---|---|---|---|---|---|---|---|
| as today | 6 | 0 | 0 | 0 | 5 | 3,172 | 10 of 10 tests, one commit |
| with the line | 6 | 0 | 0 | 0 | 4 | 3,361 | 10 of 10 tests, one commit |

- **The line changed nothing.** Both builders read every file with `cat` and
  wrote every file in one or two shell commands of about 3,000 characters.
  Neither called Read, Edit or Write once.
- **The habit is batching.** A whole brief took six API calls: the builder
  read several files in one command and wrote several in another. What the
  same brief costs through Read and Edit was not measured, because neither
  run used them. Brief 42 found that the number of calls is the largest cost,
  so a rule that splits these commands into more calls could cost more. That
  is an inference.
- **So the cause is the model's own way of working in this agent**, not a
  prompt file, a hook or a missing tool. It shows on a six-call run with no
  prompt files at all. The log append of step 1 is a symptom, not the cause.

One pair of runs on a toy brief is thin. It is enough to say a one-line rule
will not move it.

**What the habit skips.** The plugin's `Stop` check finds each
project's `check:fast` from the files the `PostToolUse` hook noted, and that
hook fires only on Edit and Write. A builder that never calls either leaves
no note, so the turn can end without `check:fast`, and nothing formats the
file on save. A repo on the house-style harness still catches both later:
`npm run check` runs `format:check`, and the builder runs it before the
hand-back.

**Recommendation for the owner's pick.**

1. **No rule for the builder (recommended).** The measured part: the added
   line did not change the tools used, on one pair of runs. A stronger rule
   (a hook that refuses shell writes) was not tried and may add calls.
2. **Optionally, on the hook side:** the `Stop` check also reads
   `git status` for changed files, so a shell-written file triggers
   `check:fast` like a saved one. Worth a brief only if a build is found
   that ended its turn with a failing `check:fast`; none was looked for here.
