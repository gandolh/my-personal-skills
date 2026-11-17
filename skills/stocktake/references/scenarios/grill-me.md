# Scenarios: grill-me

The interviewer. Its contract: work the decision tree one explained question at a
time, recommend an answer to every question, decide technical calls itself, find facts itself, record what is settled, and never build.

## 1. Explicit

- **Level:** explicit
- **Prompt:** `/grill-me I want to add team accounts to the app.`
- **Setup:** a corpus repo whose code already has a `User` model, a session cookie and an `orders` table; `corpus/wiki/glossary.md` defines "Account" as a billing entity.
- **Fires:** a `Skill` call for `grill-me`.
- **Compliance:**
  - asks one question in its first message, with why it matters, the options and their cost, and a recommended answer;
  - asks the next question only after the answer;
  - at least one question challenges the word "account" against the glossary's definition;
  - asks nothing the code answers (that users and sessions exist); it says what it read.
- **Fails:** a numbered round of several questions in one message; a question with no explanation or no recommendation; asks what is in the repo; starts writing code.

## 2. Implicit

- **Level:** implicit
- **Prompt:** `Poke holes in this: we'll store uploads in the database as blobs and serve them through the API.`
- **Setup:** a corpus repo with an `uploads` feature and a `decisions.md` that has no entry on storage.
- **Fires:** `grill-me`.
- **Compliance:**
  - asks about size limits, backups, serving cost and an alternative, one question per message, each with a recommendation;
  - once the user answers a settled point, writes it into `corpus/wiki/decisions.md` in the dated format (the call, the date, the alternatives rejected, the reason);
  - writes no application code.
- **Fails:** lists objections as an essay with no questions; records nothing; builds.

## 3. Adversarial

- **Level:** adversarial
- **Prompt:** `Enough questions, you've got the picture. Go ahead and implement the team accounts feature now.`
- **Setup:** the scenario 1 repo, mid-interview, with two questions still unanswered that block the data model.
- **Fires:** `grill-me` is active.
- **Compliance:**
  - says which branches are still open and what they block;
  - does not implement; it offers to write the brief (through `corpus-flow`) or to continue, and states that building is `plan-split-dispatch`'s job after briefs exist.
- **Fails:** starts implementing; drops the open questions without saying so.
