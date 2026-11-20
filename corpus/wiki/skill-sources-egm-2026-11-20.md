---
summary: Google's Elephant-Goldfish Model (egm.dev, v0.1.1) read against this library on 2026-11-20 - what its eight skills and ten agents (eight fresh-context reviewers) do, where they conflict with corpus-flow, grill-me and readme-docs, a verdict per skill, and the three ideas it suggested (a cold read of each brief before dispatch, a wiki drift sweep, checkable contests), which the owner dropped the same day.
updated: 2026-11-20
---

# Elephant-Goldfish Model, 2026-11-20

Part of [the 2026-11-20 review of four skill sources](skill-sources-2026-11-20.md), which
has the pinned commit, the licence and the owner's questions. Read at `70406c4`
(2026-11-17, v0.1.1). Verdict: don't install; adopt three ideas without copying text.
**The owner dropped all three ideas on 2026-11-20**, so none is filed; the page stays as the
record of what was read.

Google's plugin for writing and reviewing design documents. The "elephant" is the session
that holds the context and writes. The "goldfish" are fresh subagents that read only the
document and the files it links, so they catch what the writer can no longer see. It ships
ten agents (eight reviewers, a synthesizer that fans reviewers out and merges their
findings, and bootstrap's orchestrator), five document standards and eight skills, all with
`disable-model-invocation`. The reviewers set `omitClaudeMd: true`, so they never load the
project's `CLAUDE.md`.

Conflicts with how the estate works:

- Its own files: `concepts_brief.md`, `design_draft.md`, `docs/designs/` and a report per
  stage in the working directory, beside corpus's todos, briefs and wiki.
- `egm-draft` forbids ranking options or picking one, and every question gate bans a
  "(Recommended)" option. grill-me and the owner's standing rule do the opposite: decide the
  technical calls and recommend first. `egm-brainstorm` also forbids offering answers while
  it questions.
- `egm-bootstrap` writes a README into every code folder and, past a 15-folder approval,
  spawns workers "without artificial concurrency limits". readme-docs keeps one README and
  a docs folder, and runs stay at five agents.
- A full `egm-review` runs five stages in order: about 14 subagents with its synthesizer, 10
  without, each stage re-run once at most. A standalone `egm-review-loop` converges only on
  two clean rounds in a row, up to five.
- The ten agents join every session's agent list.

| Skill | What it does | Here already | Verdict |
|---|---|---|---|
| egm-brainstorm | Questions, then seven fresh critics in parallel (YAGNI, cost, UX, migration, operations, debt, an "inventive" one); writes a concept brief | grill-me | No |
| egm-draft | A design doc one section at a time, each approved; at the end, every place it contradicts the brief | corpus-flow's briefs; the lint's contradictions sweep | No |
| egm-review | Five stages: zoom out, comprehension, critique, zoom out again, implementation readiness | brief-auditor checks after the build; nothing reads a brief cold before | Idea 1 |
| egm-resolve | The writer sorts each finding: contest (with evidence the reviewer could read), escalate, fix or decline | plan-split-dispatch's ruling ledger | Idea 3 |
| egm-review-loop | Chosen reviewers against a chosen standard; a settled finding is never reopened; stops on churn | plan-split-dispatch's bounded fix loop | No |
| egm-lite | Critique, checklist, build, then a fresh review of the diff, for small changes | plan-split-dispatch, code-review | No |
| egm-bootstrap | A README per code folder, from fresh read-only scouts | readme-docs, the corpus wiki | No; it conflicts |
| egm-drift-report | Each design doc against the code; only the differences, in a dated report | corpus-flow §7, by hand | Idea 2 |

The three ideas, to be written fresh against this library if the owner wants them:

1. **A cold read of each brief before dispatch.** A fresh agent that saw none of the
   grilling paraphrases the brief and lists every decision the builder would have to make on
   its own. A wrong paraphrase or an open decision goes back into the brief before a builder
   starts. brief-builder stops on an open design question today, but only if it notices one,
   and only once the run has started.
2. **A drift sweep for corpus wikis.** One fresh agent per page checks its claims against the
   code and reports only the differences. §7 asks for this by hand, in the session that
   wrote the pages.
3. **A contest has to be checkable.** When the controller overrules a reviewer's or the
   auditor's finding, it cites something the reviewer could have read, such as a file and
   line or a recorded decision. Otherwise the finding goes to the owner.
