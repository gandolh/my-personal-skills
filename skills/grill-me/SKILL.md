---
name: grill-me
description: Interview the user relentlessly about a plan or design until every branch of the decision tree is settled — working the tree in dependency-ordered rounds, finding facts itself instead of asking, and recording the durable outcomes as corpus decisions and glossary terms as it goes. Use when the user wants to stress-test a plan, resolve a design before building, says "grill me", "interview me about this", "poke holes in this", "what am I missing", or "/grill-me". Ends in shared understanding plus a written trail — not in code.
when_to_use: A plan or design has unresolved decisions and building now would bake in a guess. Best run before briefs are written (corpus-flow §2) and before any dispatch. Produces settled decisions, a sharper vocabulary, and — where warranted — entries in corpus/wiki/decisions.md and glossary.md. Not for a task whose shape is already obvious, and never a licence to start implementing.
---

# Grill me

Interview the user relentlessly until you reach shared understanding. Every branch
of the design tree visited, nothing left silently assumed.

**This skill does not build anything.** It ends when the tree is settled and the
user confirms. Implementation is `plan-split-dispatch`'s job, after briefs exist.

## Work the tree in rounds, not one question at a time

Model the design as a **tree**: each decision branches into the decisions that hang
off it. The **frontier** is every decision whose prerequisites are already
settled — the questions you can ask *now* without guessing at answers you have not
heard yet.

**Ask the whole frontier in one round.** Number each question and give your
recommended answer. Then wait.

```
❓ **Q1 — <short title>**: <the question. Include the options you see,
and what each one costs. Multiple paragraphs are fine.>

➡️ **Recommend:** <your answer, and the one-line reason>

---

❓ **Q2 — <short title>**: <…>

➡️ **Recommend:** <…>
```

Each round of answers reshapes the tree: settled decisions push the frontier
outward and unblock what depended on them. Recompute the frontier and ask the next
round. **A question whose answer depends on another question still open in this
round belongs to a later round** — asking it now just collects a guess.

The session is done when the frontier is empty.

### Why rounds beat one-at-a-time

One question at a time makes the user do the dependency ordering in their head and
turns a ten-decision design into a forty-message conversation. Rounds put every
*currently answerable* question in front of them at once, so they can answer six
things in one message and see how the decisions relate.

## Find facts yourself; ask only for decisions

**Facts are your job. Decisions are the user's.**

If a frontier question could be answered by reading the codebase, the corpus, or
the filesystem — **go read it**. Never ask the user something you could look up.
Dispatch a subagent for anything that needs real exploration.

**Do not block on it.** A running exploration is an unsettled prerequisite, so only
the questions *downstream* of it wait. Ask the rest of the frontier now, and fold
the finding in when the subagent reports.

Before the first round, read what the project already decided:
`corpus/wiki/decisions.md` and `glossary.md` if a corpus exists. **A question whose
answer is already a locked decision is not a question** — say so and move on, or
raise it explicitly as a revisit if you think the decision is now wrong.

## Sharpen the vocabulary while you go

Half of what makes a design vague is language, not logic. As you interview:

- **Challenge terms that conflict.** "Your glossary defines *cancellation* as X, but
  you seem to mean Y. Which is it?"
- **Split overloaded words.** "You said *account* — do you mean the Customer or the
  User? Those are different things."
- **Stress-test with concrete scenarios.** Invent the awkward edge case and make
  the boundary explicit: "What happens if they cancel after partial fulfilment?"
- **Check the code agrees.** If the user states how something works and the source
  disagrees, surface the contradiction — it is usually a real finding.

## What to write down

Capture as you go, not in a batch at the end — a term resolved in round 2 gets
written in round 2.

**Glossary term** → `corpus/wiki/glossary.md` whenever a term is defined, split, or
renamed. Definitions only; no implementation detail — and record the synonyms it
displaces under `_Avoid_`, which is the half that actually stops the drift.
Format: `corpus-flow` §9b.

**Decision** → `corpus/wiki/decisions.md`, but **only when all three hold**:

1. **Hard to reverse** — changing your mind later has real cost.
2. **Surprising without context** — a future reader will ask "why this way?"
3. **A genuine trade-off** — there were real alternatives and you picked one.

If any of the three is missing, do not record it. A decisions page padded with
obvious choices stops being read, and the whole point is that future briefs and
reviews *don't relitigate what's on it*. Format and the qualifying categories:
`corpus-flow` §9d.

**Everything else** stays in the conversation. Not every answer is durable.

If the project has no corpus, offer to bootstrap one (`corpus-flow` §0) — but don't
force it; a grilling session is still worth having without one.

## Finishing

End with a short summary of what got settled, then **stop and confirm**:

```
## Settled
- <decision> → recorded in decisions.md
- <decision> → conversational only
## Vocabulary
- <term>: <definition> → glossary.md
## Still open (deliberately)
- <thing the user chose to defer>

Ready to write briefs?
```

Do not act on the design until the user confirms shared understanding. Then hand
off to `corpus-flow` §2 to write the briefs, and `plan-split-dispatch` to build them.

## Failure modes

- **Asking one question at a time.** Turns a design session into an interrogation
  and hides the structure of the decision from the user.
- **Asking what you could look up.** The fastest way to lose the user's patience.
- **Batching the write-up to the end.** You will forget the precise wording that
  made a term click, and the session's value leaks away.
- **Recording every answer as a decision.** See the three-part test.
- **Sliding into implementation** because the design "seems clear now." The
  confirm step exists precisely for the moment it seems clear.
