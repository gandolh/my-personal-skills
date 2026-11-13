---
name: diagnose
description: Debug a bug or a flaky failure by building a fast, deterministic pass/fail loop first, then testing one hypothesis at a time, then fixing and keeping the loop as a regression test. Use when the user says "debug this", "diagnose", "it's broken", "this test fails sometimes", "why does this fail", "find the root cause", "it works on my machine" or reports an error, a wrong result or a regression. Stops and asks when no loop can be built. Not for a failing chunk inside a plan-split-dispatch run (its bounded fix loop covers that) and not for new features.
---

# Diagnose: the feedback loop is the skill

A bug is fixed when a signal that was red goes green and stays green. Without
that signal every fix is a guess. So the work has three phases, in order, and
no fix is proposed before phase 1 is done.

## Phase 1: build the loop

A loop is a command that exits non-zero on this bug and zero without it,
fast enough to run dozens of times, and the same answer each run. Pick the
first of these that fits the bug and the repo:

1. **A failing test** (`vitest`, or `node --test`): the cheapest, and the one
   to keep. Write the smallest test that goes red.
2. **A script against the running service**: `curl` (or `fetch`) against a
   server started with `tsx watch`, asserting on the status and the body.
3. **A CLI run on a fixture**: the tool, a saved input, a diff against the
   expected output.
4. **A headless browser**: a Playwright script (see `ui-test-plans`) that
   drives the page and checks the DOM or the console.
5. **Replay a captured trace**: a saved request, log line or event stream fed
   back through the code.
6. **A throwaway harness**: a 20-line script that calls the one function with
   the bad input, outside the app.
7. **A fuzz loop**: random or exhaustive inputs against an invariant, when
   the bug depends on data you can't name.
8. **A bisection harness**: `git bisect run <loop>` when it worked before.
9. **A differential run**: the same input through the old and new code, or
   two environments, diffing the output.
10. **A human-in-the-loop script**: when only a person can see the symptom,
    `scripts/hitl-loop.template.sh` asks them one question per run and exits
    on the answer.

**Make it deterministic.** A flaky failure gets its source pinned first:
a fixed seed, a frozen clock, a stubbed network, one worker, a repeat count
high enough that it fails every time (run it 50 times and count).

**Make it fast.** Cut the loop until one run takes seconds: a narrower test
path, a smaller fixture, no build step it doesn't need.

**Redact.** Everything you show or write down (logs, requests, fixtures,
the finding) has secrets, tokens, cookies and personal data removed first.

**When no loop can be built, stop.** List what you tried and why each failed,
and ask for exactly what is missing: access to the environment, a captured
artifact, the failing input, a reproduction from the person who saw it. Do
not move to phase 2 on a guess.

Done when: one command goes red on the bug, and you have seen it go red more
than once.

## Phase 2: one hypothesis at a time

1. Write the hypothesis in one sentence, with a **prediction the loop can
   check**: "if the cache returns a stale row, then logging the row's
   `updated_at` shows a value older than the write".
2. Test only that: add the one log, assertion or breakpoint, run the loop,
   read the result.
3. Confirmed: go to phase 3. Refuted: remove the instrumentation, write
   down what you ruled out, and form the next hypothesis from what the
   result showed. Never change two things between runs.

After three refuted hypotheses, stop and re-read the failing path end to
end, or ask the owner; don't widen the search by trying fixes.

Done when: the root cause is named, with the run that showed it.

## Phase 3: fix, and keep the loop

1. Make the smallest change that fixes the root cause (not the symptom).
   Run the loop: green. Run the repo's checks: still green.
2. **Keep the loop as a regression test** where the repo's test decisions
   allow it. Some repos decide against it (Shelfmark's "nothing boots the
   app" is one); there, keep the loop's assertion as a unit test of the
   function, or say in the finding that no test was added and why.
3. Remove every temporary log, flag and harness you added.

## Phase 4: the finding goes in the corpus

- A `log.md` entry of kind `incident`: the symptom, the root cause, the
  fix's commit, and the loop that proves it.
- The wiki page for the area gets the lesson if it changes how the code
  should be read or changed (`corpus-flow` §4 says how).

## Credit

The loop-first method follows mattpocock/skills' `diagnosing-bugs` and
obra/superpowers' `systematic-debugging` (root cause before any fix, one
hypothesis at a time). Written fresh, no text copied; see `ATTRIBUTION.md`.
