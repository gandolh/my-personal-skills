---
name: grill-me
description: Interview the user relentlessly about a plan or design until every branch of the decision tree is settled, asking one explained question per message in dependency order, finding facts and deciding technical calls itself instead of asking, and recording the durable outcomes as corpus decisions and glossary terms as it goes. Use when the user wants to stress-test a plan, resolve a design before building, says "grill me", "interview me about this", "poke holes in this", "what am I missing", or "/grill-me". Ends in shared understanding plus a written trail — not in code.
when_to_use: A plan or design has unresolved decisions and building now would bake in a guess. Best run before briefs are written (corpus-flow §2) and before any dispatch. Produces settled decisions, a sharper vocabulary, and — where warranted — entries in corpus/wiki/decisions.md and glossary.md. Not for a task whose shape is already obvious, and never a licence to start implementing.
---

# Grill me

Interview the user relentlessly until you reach shared understanding. Every branch
of the design tree visited, nothing left silently assumed.

**This skill does not build anything.** It ends when the tree is settled and the
user confirms. Implementation is `plan-split-dispatch`'s job, after briefs exist.

## Ask one question per message, in dependency order

Model the design as a **tree**: each decision branches into the decisions that hang
off it. The **frontier** is every decision whose prerequisites are already
settled: the questions you can ask *now* without guessing at answers you have not
heard yet.

**Ask one frontier question per message, then wait.** Pick the one the most other
decisions hang off. Write it in this shape, in plain words, and run it through
`unslop` before you send it:

```
**<short title>** (question <n>, about <m> left)

<Why it matters: one or two sentences on what this decides and what hangs off it.>

<The options, one line each, with what each one costs.>

Recommend: <your answer, and the one-line reason>
```

Where the session has a question tool (`AskUserQuestion`), put the options in it,
with the recommended one first, and keep the explanation in the message above it.

These rules hold for every question (review checks them):

1. **One question per message.** A list of defaults to accept in one go ("accept
   these five?") is a round too. Ask them one by one.
2. **Explain before you ask.** Say why it matters first, never a bare question.
3. **Keep it short.** If the user has to scroll to reach the options, cut it.
4. **Never ask a question whose answer depends on one still open.** It collects a
   guess. Ask the one it depends on first.

Each answer reshapes the tree: a settled decision pushes the frontier outward and
unblocks what depended on it. Recompute the frontier after every answer. The
session is done when the frontier is empty.

### Why one at a time

A numbered round reads as a wall of text, and the owner stopped answering them
(2026-10-16). You hold the tree and its order. The user answers one thing.

## Find facts and make technical calls yourself; ask only for decisions

**Facts are your job. Technical calls are yours too. Decisions are the user's.**

If a frontier question could be answered by reading the codebase, the corpus, or
the filesystem — **go read it**. Never ask the user something you could look up.
Dispatch a subagent for anything that needs real exploration.

A **technical call** is a format, a name, a layout or a mechanism that a well-known
convention or the codebase already answers. Decide it by that convention, write it
into the brief (or the decisions page, if it passes the test below) and tell the
user in one line: "Decided: <call>, as <the convention>. Say so if you want it
otherwise." Ask the user about taste (the look, the wording, how it feels to use),
about scope, and about anything hard to reverse that no convention settles.

**Do not block on it.** A running exploration is an unsettled prerequisite, so only
the questions *downstream* of it wait. Ask the next frontier question that does not
depend on it, and fold the finding in when the subagent reports.

Before the first question, read what the project already decided:
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

Capture as you go, not in a batch at the end: a term settled by the third answer
gets written then.

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

An answer like "later, once X" is not an open question. Hand it to `corpus-flow` §2b
as a blocked todo or brief, with X as the condition.

## Failure modes

- **Asking a round.** Several questions in one message, or a bundle of defaults to
  accept at once. The user stops answering.
- **Asking a technical call.** A format or a name that a convention settles is
  yours to decide and report.
- **Asking what you could look up.** The fastest way to lose the user's patience.
- **Batching the write-up to the end.** You will forget the precise wording that
  made a term click, and the session's value leaks away.
- **Recording every answer as a decision.** See the three-part test.
- **Sliding into implementation** because the design "seems clear now." The
  confirm step exists precisely for the moment it seems clear.
