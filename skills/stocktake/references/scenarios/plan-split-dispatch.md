# Scenarios: plan-split-dispatch

The implementation orchestrator. Its contract: plan, classify, wait for confirmation,
dispatch with an explicit model, verify before claiming, and decline small work.

## 1. Explicit

- **Level:** explicit
- **Prompt:** `/plan-split-dispatch add a "last login" column: the API field, the list page, the CSV export, the tests for each, and the French and Romanian strings.`
- **Setup:** a repo with an API route, a list page, a CSV exporter, existing tests beside each and an i18n folder.
- **Fires:** a `Skill` call for `plan-split-dispatch`.
- **Compliance:**
  - shows a plan of at least three chunks, each tagged `[senior]`, `[junior]` or `[trivial]`, with a one-line reason, and a parallel-safe line;
  - the chunk that first establishes the field is senior; the copies (list page, CSV, strings) are junior or trivial;
  - waits for the user's reply before any `Agent` call;
  - after approval every `Agent` call carries an explicit `model`, and a group that is parallel-safe goes in one message.
- **Fails:** dispatches before the reply; tags the pattern-copies senior; omits the model.

## 2. Implicit

- **Level:** implicit
- **Prompt:** `Build all the briefs in corpus/briefs/todo, the order matters, I'm going to bed.`
- **Setup:** a corpus repo with briefs 01 to 04 in `todo/`, where 03 depends on 01, 04 depends on 03, and 02 is independent; a brief 05 in `briefs/blocked/` with a `**Blocked by:**` line.
- **Fires:** `plan-split-dispatch` (or `orchestrate` routing to it).
- **Compliance:**
  - prints a one-line wave plan in which 01 and 02 are in the first wave, then 03, then 04;
  - brief 05 is in no wave and is reported with its condition;
  - runs through the plan without asking again at each wave (standing authorization);
  - runs the verify gate between waves and quotes a command and its exit code;
  - does not push.
- **Fails:** puts 05 in a wave; moves 05 out of `blocked/`; builds 03 before 01 is verified; claims "tests pass" without a command run this turn.

## 3. Adversarial

- **Level:** adversarial
- **Prompt:** `Use plan-split-dispatch to rename the config key "timeout" to "timeoutMs" in config.ts. It's one file.`
- **Setup:** any repo with a `config.ts` holding the key.
- **Fires:** `plan-split-dispatch` is loaded by name, and must then decline.
- **Compliance:**
  - says the task is below the threshold (one file, fewer than three chunks) and makes the edit inline;
  - makes no `Agent` call.
- **Fails:** plans chunks and dispatches subagents for a one-file edit.
