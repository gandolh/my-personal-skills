# Task 17: Taking review comments, and finishing on main (from obra/superpowers)

> Revised 2026-11-10 (Q31): the owner works on `main` only and there are no
> PRs, so "ship a branch" becomes **finish on main**. The skill verifies,
> commits and pushes to `main`. It never merges, and never approves a PR. The
> branch, PR-body and base-branch parts below apply only where a repo does
> use a PR (a repo the owner doesn't control); the skill names this as the
> exception. The skill is `finish-on-main` (decision 1's name changes with it).

## Context

On 2026-11-09 the owner asked for popular skill repos to be reviewed for
ideas, and for each idea worth taking to become a brief.
**obra/superpowers** was read at `22f0b46` (2026-11-03, v7.0.2, MIT, Jesse
Vincent).

This library already took three ideas from it (`ATTRIBUTION.md`,
Influences):

- the review gate, the bounded fix loop and the ruling ledger in
  `plan-split-dispatch`;
- "evidence before claims" on its verify gate;
- the approval gate in `orchestrate`.

Two of its skills cover ground this library still lacks, and the owner's
same-day ask, "one PR per repository, and work on that PR until it's
merged", makes both matter now:

- **`receiving-code-review`.**
  - Verify before implementing, and ask before assuming.
  - Treat external reviewers with scepticism, but check what they say
    carefully.
  - Apply a YAGNI check to "professional" features a reviewer asks for.
  - Push back when the review is wrong, and say so plainly.
  - No performative agreement: state the fix, not "thanks".
  - Work in a set order: clarify everything unclear first, then fix.
- **`finishing-a-development-branch`.** Verify the tests, detect the
  environment, find the base branch, then offer a fixed set of choices:
  merge locally, push and open a PR, keep as is, or discard (with a
  confirmation). Clean up the worktree afterwards.

This library has nothing on what happens after `plan-split-dispatch`
reports done: no PR body standard, no rule for review comments, no step
that ends a branch. Cloud sessions add their own rules (a designated
branch per repo, PR activity arriving as events, never merging or
approving), which a skill can't hard-code but can defer to.

Other superpowers skills were weighed and left out:

- **`systematic-debugging`**: brief 18 builds one debugging skill from
  Pocock's version and this one, so there is one, not two.
- **`writing-skills`'s test-first method for skills**: it feeds brief 26's
  evals.
- **`using-git-worktrees`**: not needed in cloud sessions, which already
  run one container per session.

Claude Code now ships two built-ins this skill should call rather than
rebuild (best-practices page, 2026-11-09):

- **`/code-review`** reviews the diff in a fresh subagent that never saw
  the conversation;
- **`/verify`** builds and runs the app and looks at the result.

"Finish" runs the repo's check (brief 27's `npm run check`), then
`/code-review`, then `/verify` for a UI change. The PR body records all
three. The skill has side effects (a push, a PR), so it takes
`disable-model-invocation: true` and runs only when the owner types it.

## Decisions of 2026-11-10 (Q31)

- **Finish on main.** Steps: run the repo's `npm run check` (brief 27) and,
  for a UI change, `/verify`; run `/code-review`; commit with the repo's
  message style; write the `log.md` entry; push to `main`. The owner pushes
  where a repo's rules say so (this repo's rule: commit locally, the owner
  pushes), and the skill follows the repo's rule.
- **Never merge or approve a PR.** If a repo does have one, the skill stops at
  a green, reviewed PR.
- **Review comments** stay as written: classify, verify, answer with evidence.
- Routing: `orchestrate` gets a `finish` intent ("finish this", "commit and
  push", "answer the review").

## Files you OWN

- `skills/ship-a-branch/SKILL.md` (new; the name is decision 1).
- `skills/plan-split-dispatch/SKILL.md`: one hand-off line at the end of its
  final step.
- `ATTRIBUTION.md` (Influences), `README.md`, `docs/history.md`, both plugin
  files.
- This repo's `corpus/` (status, log, decisions).

## Files you must NOT touch

- Vendored skills.
- `orchestrate`'s routing table, except adding a "ship" intent row if
  decision 3 is taken.

## Owner decisions (defaults)

1. **One skill or two.** Default: one skill, `ship-a-branch`, with three
   parts:
   - **finish:** verify, then pick merge, PR, keep or discard;
   - **the PR body:** what changed, why, how it was verified, what was not
     done;
   - **review comments:** the receiving-code-review rules, adapted.

   Alternative: two skills, `finish-branch` and `review-comments`.
2. **Who merges.** Default: never the agent. The skill stops at a green,
   reviewed PR and says so. This matches the cloud session rule.
3. **Routing.** Default: `orchestrate` gets a `ship` intent ("open a PR",
   "finish this branch", "answer the review").

## What to do

1. Write the skill fresh against this library's vocabulary: briefs, the
   corpus `log.md`, the verify gate. Take the ideas, copy no text, as with
   the earlier superpowers influences.
2. **Finish:**
   - Run the repo's verify commands (from `corpus/routing.md` where it
     exists) and show their output.
   - Find the base branch.
   - Offer the choices. In a cloud session, defer to the session's
     branch-and-PR rules.
   - Write the `log.md` entry.
3. **The PR body:**
   - Mirror the repo's PR template headings when there is one.
   - Link the brief by its repo-relative path.
   - List what was verified, with the commands.
   - List what was deferred.
4. **Review comments:**
   - Classify each comment: correct, unclear, wrong, or out of scope.
   - Verify a "correct" one against the code before changing anything.
   - Answer an "unclear" one with one question.
   - Answer a "wrong" one with the evidence.
   - Turn an "out of scope" one into a todo in the corpus, and say so on
     the thread.
   - One commit per comment or per tight group. Rerun the repo's checks
     before each push.
5. `plan-split-dispatch`'s last step ends with "to ship it, use
   `ship-a-branch`".
6. Credit superpowers in `ATTRIBUTION.md`, and bump to the next minor
   version.

## Acceptance

- The skill loads on "open a PR for this", "answer the review", "finish
  this branch".
- A dry run on a scratch repo, with a branch and three made-up review
  comments (one correct, one wrong, one out of scope), produces:
  - the right classification for each comment;
  - a fix commit only for the correct one;
  - a reply with evidence for the wrong one;
  - a corpus todo for the out-of-scope one.
- `bash corpus/lint.sh` passes, and the version is bumped in both plugin
  files.
