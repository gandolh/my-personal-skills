# Bootstrap and the code-graph layer (§0 and §0b)

Moved out of `SKILL.md` verbatim, with one added line in §0b (the pin check).

## 0 — Bootstrap (first use in a project)

`corpus/` always lives at the **repo root** (`./corpus`). Before any operation,
ensure the skeleton exists:

```bash
mkdir -p corpus/todos/blocked corpus/briefs/todo corpus/briefs/blocked \
         corpus/briefs/done corpus/briefs/superseded corpus/wiki
```

If they're missing, create:

- **`corpus/CLAUDE.md`** — the schema/conventions for this corpus. Adapt the
  **Conventions** and **Workflows** sections at the bottom of this skill into a
  concise per-project version (so a fresh agent opening the repo learns the
  rules without this skill loaded). Note the source-of-truth ordering and tell
  agents to read `index.md` first.
- **`corpus/index.md`** — the content catalog (what lives where), starting with
  links to CLAUDE.md, log.md, and the wiki pages. This is the front door.
- **`corpus/log.md`** — a `# Log` heading and nothing else yet.
- **`corpus/wiki/glossary.md`** — created **lazily**: the moment the first term is
  settled (usually mid-`grill-me`), not as an empty stub at bootstrap. An empty
  glossary teaches a fresh agent nothing; a missing one at least prompts the
  question. Same for `decisions.md`.
- **`corpus/routing.md`** — the routing profile read by the `orchestrate` skill
  (the front door): implement/review/PR skill choices, an intent table, a
  READ/SKIP/SKILLS table, and the **knowledge-routing table** (§0b). Seed it with
  `Implement skill: plan-split-dispatch` and stub the rest — see the template in
  the `orchestrate` skill. If `orchestrate` does the bootstrap it enriches this by
  scanning the repo; created here so the file always exists. Link it from `index.md`.
- **`corpus/lint.sh`** — the health check (§7). Write it at bootstrap so the
  invariants are enforceable from day one, not aspirational prose. It must check:
  every wiki page has `summary:` + `updated:` frontmatter; every relative link
  resolves; no page exceeds ~200 **body** lines (frontmatter excluded); no page
  references a directory layout the repo has since abandoned. `--index`
  regenerates `index.md`'s catalog block from the summaries. Exit non-zero on
  failure so it can gate a commit.
- **The wiki spine** — at minimum seed `corpus/wiki/status.md` (the living
  dashboard). Also seed `overview.md`, `architecture.md`, `decisions.md`, and
  `open-questions.md` when you have enough to say — even a stub paragraph each is
  better than a missing page, because it gives ingest (§6) a home to grow into.
  See the wiki section above for what each page is for. Don't fabricate content
  to fill them; a one-line "TODO: …" stub is fine. **Every page gets frontmatter**,
  stubs included.

Keep index.md and log.md minimal — they are navigation aids, not content.
Tell the user you bootstrapped the corpus; don't make it a ceremony. Do **not**
commit anything in this skill unless the user explicitly asks — the user
controls when corpus changes land in git.

---

## 0b — Add the code-graph layer (the *what*)

The corpus is the **why** layer (synthesis, decisions, status). A generated code
graph is the complementary **what** layer — call graph and impact/blast radius
for change-planning. A corpus without it leaks tokens on structural questions
("who calls X", "what breaks if I change Y"). During bootstrap, or when the user
asks to add it, stand this layer up.

**The method lives in the personal [`codegraph`](../../codegraph/SKILL.md) skill** —
the graph-first / grep-verify loop, the pinned install, the accuracy-envelope
benchmark, and the when-to-trust-vs-verify triggers. Follow it; do **not**
re-derive it here. This section is only how the result plugs into the corpus:

1. **Bootstrap per the `codegraph` skill, and commit the wiring.** Install pinned
   (`@colbymchenry/codegraph@<pin>`, MIT but effectively single-maintainer, a
   supply-chain surface even offline), `codegraph init`, telemetry off, confirm
   the native backend, gitignore `.codegraph/`. **Commit the MCP registration into
   the repo `.mcp.json`** rather than leaning on a per-dev `codegraph install`: a
   manual per-dev step reliably never gets run, so the graph tool silently stays
   absent from most sessions and the whole layer goes dead (the failure mode this
   skill exists to prevent). Point the server at the index with an
   env-overridable path so **one canonical index is shared read-only across
   worktrees** instead of re-`init`ed per throwaway tree:
   `serve --mcp --no-watch --path ${CODEGRAPH_INDEX_PATH:-<index-dir>}` (Claude
   Code expands `${VAR:-default}` in `.mcp.json`, so the committed default works
   for a single checkout while worktree users export the absolute path once). Wrap
   the build in a one-command task-runner script (e.g. `npm run codegraph:init` /
   `codegraph:sync`) so onboarding is one line, not a hunt through the docs.
   **Do not skip its benchmark**: the tool is `tree-sitter + a heuristic
   resolver`, not a compiler, so token-savings claims hold only for the queries it
   is good at and it is silently wrong elsewhere. The envelope is per-repo.
   **Check that the pin holds** with
   `node ${CLAUDE_PLUGIN_ROOT}/skills/stocktake/scripts/check-mcp-pins.mjs`: it
   fails on an unversioned `npx`, `@latest` or a git URL with no commit.

2. **Write the per-repo project skill** at `.claude/skills/codegraph/SKILL.md`
   carrying the *measured* envelope: a *use it for* table (callers, impact/blast
   radius, first map of an unfamiliar area) and an explicit *do NOT use it for*
   list — rename/"every usage" completeness (use `grep -rnw`), the conflated
   duplicate-name list from the benchmark, and any correctness invariant a guard
   test already covers. It lives in the **project**, never in personal skills:
   its whole value is the repo-specific accuracy numbers, which cannot be written
   once and reused. (The personal `codegraph` skill supplies the method; the
   project skill records what the method measured *here*.)

3. **Make the numbers durable in the corpus.** File the benchmark as a
   `wiki/code-graph.md` page, and add the knowledge-routing table to
   `corpus/routing.md` (question shape → layer: wiki / code graph / grep / tests)
   so the graph becomes a first-class member of this project's structure, not a
   rediscovered afterthought.

**The working rule, everywhere:** lead with the graph to *locate* and *scope*;
verify with `grep` or a guard test before *acting* on completeness. A cheap wrong
answer is worse than no answer.
