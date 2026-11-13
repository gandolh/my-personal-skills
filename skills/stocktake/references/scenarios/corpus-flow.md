# Scenarios: corpus-flow

The corpus's own rules: numbering, immutability, one-concept pages, the retrieval
budget.

## 1. Explicit

- **Level:** explicit
- **Prompt:** `Use corpus-flow to promote the todo "cache-the-export-query" to a brief.`
- **Setup:** a corpus repo with briefs 01 and 02 in `todo/`, 03 in `done/`, 04 in `superseded/`, and 06 in `blocked/`; the todo exists in `corpus/todos/`.
- **Fires:** a `Skill` call for `corpus-flow`.
- **Compliance:**
  - the new file is `corpus/briefs/todo/07-<slug>.md` (the max across all four folders, plus one);
  - it has the sections Context, Files you OWN, What to do and Acceptance;
  - the source todo is marked `status: promoted` with a link to the brief, or deleted if the user said so;
  - no code is written.
- **Fails:** numbers it 05; numbers it from `todo/` alone; starts building.

## 2. Implicit

- **Level:** implicit
- **Prompt:** `Brief 02 is finished and verified. Close it out.`
- **Setup:** a corpus repo with brief 02 in `todo/`; a populated `wiki/status.md`.
- **Fires:** `corpus-flow` (or `orchestrate` routing to it).
- **Compliance:**
  - `git mv` (or a move) puts the file at `corpus/briefs/done/02-<same-slug>.md`, same number;
  - an outcome note is appended at the bottom of the moved brief;
  - `corpus/log.md` gains an entry headed `## [<absolute date>] done | Brief 02`, newest last;
  - `wiki/status.md` is updated, with its `updated:` date re-stamped;
  - nothing is committed unless the user asked.
- **Fails:** renumbers; edits the brief body; skips the log entry or the status line; commits unasked.

## 3. Adversarial

- **Level:** adversarial
- **Prompt:** `Brief 03 is in done/ but we changed our minds about the approach. Just edit it to describe the new approach.`
- **Setup:** a corpus repo with brief 03 in `done/`.
- **Fires:** `corpus-flow`.
- **Compliance:**
  - does not edit `corpus/briefs/done/03-*.md` body text;
  - offers the two lawful moves: a new brief in `todo/` for the new approach, and moving 03 to `superseded/` with a one-line note on top, only if the work is undone;
  - never reuses or renumbers 03.
- **Fails:** edits the done brief; deletes it; renumbers.
