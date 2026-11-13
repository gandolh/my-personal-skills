# Query, ingest, lint and verify (§5 to §8)

Moved out of `SKILL.md` verbatim.

## 5 — Query the wiki (answer a question against the corpus)

When the user asks "what does the corpus/wiki say about X" / "how does Y work
here".

1. **Read `index.md` first**; triage on the `summary:` lines. Respect the
   **retrieval budget** — index plus at most 2–3 pages.
2. Drill into the **wiki pages**, not the codebase — unless the wiki points you
   at specific code, or you need to verify a claim (see §8).
3. **Structural questions are not wiki questions.** "Who calls X", "what breaks if
   I change X", "where does feature Y live" go to the code graph (§0b), and
   "did I get *every* usage" goes to `grep`. Check `routing.md` first.
4. If the answer is non-trivial **and reusable**, file it back as a new or
   updated wiki page rather than letting it disappear into chat. Then answer.
5. Honor the **source-of-truth ordering** (see Conventions) when pages disagree.

---

## 6 — Ingest a finding (new source / new knowledge)

When the user shares a result, a decision, an exploration outcome, or a brief
lands — anything that should become standing knowledge. Triggers: "ingest
this", "remember that we decided…", "fold this into the wiki", or naturally at
the end of §4.

1. If it's a spec, drop the raw artifact in `briefs/`. Otherwise summarize the
   finding inline.
2. **Update the affected wiki pages** — `status.md`, the relevant entity/concept
   page, `open-questions.md`. Edit freely; the wiki is the LLM's to curate.
3. If the concept is **named but has no page yet**, create one (one concept per
   file) and cross-link it from `index.md`.
4. **Append a `log.md` entry**: `## [<YYYY-MM-DD>] ingest | <short title>`.
5. Keep `decisions.md` for locked tech/design choices; don't relitigate a
   decision recorded there without flagging it explicitly.

---

## 7 — Lint the corpus (periodic health check)

When the user says "lint the corpus" / "is the wiki stale".

**Run `bash corpus/lint.sh` first** — it mechanically catches missing frontmatter,
broken relative links, oversized pages, abandoned path roots, and the
`blocked/` rules below. Fix those, then
sweep by hand for what a script can't see:

- **Contradictions** between pages (e.g. `decisions.md` vs `status.md`).
- **Stale claims** — verify by reading the actual code or running the relevant
  command before trusting (see §8). The nastiest kind is a page whose *top-ranked
  finding* was silently obsoleted by later work; the links still resolve, so only
  reading the code catches it.
- **Orphan pages** — no inbound link from `index.md` or another wiki page.
- **Named-but-pageless concepts** — mentioned repeatedly, no page of their own.
- **Drifted briefs** — a `done/` brief whose work has since been undone or
  replaced → move to `superseded/` with a one-line note.
- **Straddling pages** — two topics in one file → split, even under the line cap.
- **Duplicated catalogs** — a list `index.md` maintains that another page owns.
- **Vocabulary drift** — a concept the wiki calls two names, or a `glossary.md`
  term the code and docs no longer use that way. Two live meanings for one term is
  two terms; give the second one its own name rather than widening the definition.
- **Undefended decisions** — a `decisions.md` entry with no *why* recorded. It
  cannot be revisited intelligently, only obeyed or broken; reconstruct the reason
  from `log.md` or mark it for a revisit.

The `blocked/` rules (§2b) are mechanical, so `lint.sh` carries them:

- Every file in `briefs/blocked/` has a `**Blocked by:**` line with a
  condition, and every file in `todos/blocked/` has a `blocked-by:` key with
  one.
- No file outside a `blocked/` folder has one.
- No brief number appears twice across `todo/`, `blocked/`, `done/` and
  `superseded/`.
- Links to blocked files are checked like any other link, so a move that
  breaks one is reported.

A large repo reorganization invalidates paths *en masse*; when the lint reports
many broken links, resolve them by basename against the real tree rather than
one at a time. Mark obsolete findings **obsolete** — don't delete the reasoning.

Report findings as a short list; fix the cheap ones inline, surface the rest for
the user to decide. Append a `## [<YYYY-MM-DD>] lint | …` entry to `log.md`
noting what was swept and changed.

---

## 8 — Verify before quoting the wiki

A wiki page that names a specific file, function, or commit may have **drifted**.
The wiki reflects what was true when written — it is not authoritative over the
code. Before acting on a wiki claim:

- Names a **path** → check it exists.
- Names a **function / flag** → grep for it.
- Names a **commit** → `git log --oneline | grep <hash>`.

If a claim is stale, fix the page (it's the LLM's to curate) and note it in
`log.md`. Never recommend an action based on an unverified wiki claim about
specific code.
