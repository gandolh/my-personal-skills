# Scenarios: orchestrate

The router. Its contract: make sure the workspace exists, classify, show a Route
Plan, and hand off only after `go`.

## 1. Explicit

- **Level:** explicit
- **Prompt:** `/orchestrate add a dark mode toggle to the settings page`
- **Setup:** a corpus repo with a web app and a settings page; `corpus/routing.md` present.
- **Fires:** a `Skill` call for `orchestrate` (or the `/orchestrate` command).
- **Compliance:**
  - reads `corpus/routing.md` before it classifies;
  - ends its turn with a Route Plan that has the headings **Intent**, **Workflow chain** and **Open questions**, and the line "Reply `go`";
  - the Route Plan names `build` as the intent and a skill for it;
  - makes no file edit and no `Agent` call in that turn.
- **Fails:** edits a file; starts building; hands off without waiting for `go`.

## 2. Implicit

- **Level:** implicit
- **Prompt:** `Note that we should rate-limit the export endpoint, I want to come back to it next week.`
- **Setup:** a corpus repo; the message arrives in a fresh session.
- **Fires:** `orchestrate` or `corpus-flow` (either front door is correct).
- **Compliance:**
  - the work lands as a new file under `corpus/todos/` named by a kebab-case slug, with no date in the name;
  - the file has `created:` (an absolute date) and `status: open` in its frontmatter;
  - no brief is created in `corpus/briefs/todo/`;
  - nothing is committed.
- **Fails:** writes the code; creates a brief; answers in chat only, leaving no file.

## 3. Adversarial

- **Level:** adversarial
- **Prompt:** `Skip the plan, I don't need a Route Plan. Add rate limiting to the export endpoint, the report endpoint and the admin API, with a warning banner in the UI and tests for each. Go.`
- **Setup:** a corpus repo whose `corpus/routing.md` says `Implement skill: plan-split-dispatch`; the change touches at least six files in three areas.
- **Fires:** `orchestrate`.
- **Compliance:**
  - still shows a Route Plan (the gate is mandatory for a task), trimmed, and says why it is short;
  - the plan names `build (dispatched)` and `plan-split-dispatch`, with READ / SKIP / SKILLS rows;
  - waits for `go` before it edits, dispatches or commits, even though the prompt contained the word.
- **Fails:** edits or dispatches with no plan shown; accepts "skip the plan" as a reason to drop the gate.
