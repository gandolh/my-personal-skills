# Review gate and verify gate, in full

Moved out of `SKILL.md` verbatim. The rules that gate a run are in `SKILL.md`.

## Step 7: the finder fan-out

### Step 7 — Review gate

If the run was non-trivial (or the user asks), review the cumulative diff
(`git diff <base>...HEAD` — also `git diff HEAD` if uncommitted). For a substantial
multi-file build, **don't rely on one broad review agent** — dispatch **2–3 focused
finder agents in parallel, scoped by area/risk** (e.g. one on cross-file integration +
wiring correctness, one on the new module's own logic, one on reuse/cleanup/conventions),
each returning concrete `{file, line, summary, failure_scenario}` findings. **Finders
default to sonnet** — reading a diff and pattern-matching for bugs is mostly junior work;
reserve **opus for at most one finder on the highest-risk integration/correctness lens**,
or to adversarially verify an uncertain finding before acting. Then **consolidate + dedup**
their findings yourself, and dispatch **one fix agent whose tier follows the fix**
(haiku/sonnet for mechanical fixes — dead code, padding, a guard; opus only for subtle
correctness/integration/security), re-verify the gates, and stop. The scoped-finder shape catches integration bugs a single
generalist pass routinely misses (it has, every time). A repo review skill/command can
stand in for a finder. In a TypeScript repo, give the conventions finder the `house-style`
skill's review checklist (`${CLAUDE_PLUGIN_ROOT}/skills/house-style/references/review-checklist.md`)
and tell it to skip style the linter and formatter already enforce.

**For a brief-backed run** (Backlog / wave mode), the review gate is `brief-auditor` on
each brief, plus the built-in `/security-review` on briefs flagged auth, tokens,
cookies or personal data. The finder fan-out above is for a fresh chunked task.

**Scope, proportion and read-only.** Two checks run on every diff:
- **Scope:** compare the diff with the chunk's declared files. A file outside them
  is a finding unless the hand-back justifies it.
- **Proportion:** a diff much larger than the plan's estimate is flagged for a second look.

Reviewers report gaps against the brief and correctness problems, not style: the
formatter and linter own style, and a reviewer asked to find problems always finds
something. Fixing every finding adds layers and tests for cases that cannot happen.
Make a reviewer read-only through its tool list (`Read, Grep, Glob`, and Bash for the
checks), not by instruction.

**Review comments and findings.** Classify each one before acting:
- **Correct:** verify it against the code before any change.
- **Unclear:** ask one question; change nothing yet.
- **Wrong:** reply with the evidence (a file and line, a command's output).
- **Out of scope:** write a corpus todo, and say so in the reply.

A builder's "Noticed, not touched" items are filed the same way, as todos.

**This gate is mandatory for any multi-file run.** Skip it only on a genuinely small
run (1–2 files, one chunk), and say so explicitly rather than silently dropping it.

## Verify gate: the passes

For a brief-backed run, the gate per brief result is three passes, in this order:

- **`verify-brief`** (`node ${CLAUDE_PLUGIN_ROOT}/scripts/verify-brief.mjs <repo> <base>`):
  the repo's check gate, the house-style sync check, `format:check`, a clean tree, no
  tracked `node_modules` or `.env`, a grep of the added lines for machine paths and the
  words in `VERIFY_BRIEF_DENY`, `--untouched <glob>` paths, and `npm audit` high and
  above. It runs them one at a time, prints one line each with its exit code, and
  re-runs a test file on the repo's known-flaky list alone. You run it, so the iron law
  holds without spending a model's tokens.
- **`brief-auditor`** (a light slot, read only): each acceptance line met, unmet or
  unverifiable with its evidence, plus the review-only rules for the brief's kind. Hand
  it the brief, the range, the builder's report and the `verify-brief` output.
- **Your own pass:** read the risky diffs (auth, tokens, personal data), look at one or
  two screenshots, and make the rulings.

For a chunked run, run in order, and do **not** proceed past a failure:

1. **Typecheck** the whole workspace (the repo's typecheck cmd, e.g. `npm run typecheck`).
2. **Build** every package that emits artifacts dependents consume (a downstream
   wave often resolves a dependency from its built `dist/`, not source).
3. **Tests** for the packages touched this wave — and confirm prior waves still pass.
4. **Tracked, not just on-disk** (the silent-ignore check): `git status --porcelain`
   must list the expected new files, and `git check-ignore <new-source-dir>` must be
   empty for any new source directory. A chunk can build and test green entirely from
   files git is **ignoring** (e.g. an over-broad `store/` rule that also hides
   `src/store/`); this step catches that before it ships as "done".

On failure: fix in place — re-dispatch the owning chunk with the specific error —
before the next wave. Never let unverified breakage flow into a dependent wave; that
cascade is the whole reason this gate exists.
