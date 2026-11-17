# The `corpus/routing.md` template

What `orchestrate`'s Step 0 writes on a bootstrap. Fill each `<...>` from the repo
scan. Take `Branching` and `Worktrees` from the repo's instruction file; where it
says nothing, ask the user once.

```markdown
# Routing — how work routes in this project
<!-- Read by the orchestrate skill. Tune freely; keep it short. -->

**Implement skill:** plan-split-dispatch      <!-- or a repo-specific implement skill -->
**Brief folders:** corpus/briefs/{todo,blocked,done,superseded}   <!-- only todo/ is open work -->
**Review skill:** <repo review cmd, or "a general-purpose agent over the diff">
**PR skill:** <repo PR cmd, or "propose git commands">
**Issue tracker:** <none | Jira/Linear/GitHub Issues + how to query>
**Code host:** <GitHub (gh) | GitLab (glab) | none>
**Branching:** <main only | a branch per task, named <pattern>>   <!-- where a build commits -->
**Worktrees:** <no | yes>   <!-- may parallel chunks use an isolated worktree -->

## Intent routing
| Signal | Intent | Route to |
|--------|--------|----------|
| New idea/task to capture | capture | corpus-flow: add todo |
| Park work until something outside happens / unblock / what's blocked | capture | corpus-flow §2b: block and unblock |
| Ready to build, ≥3 chunks | build | brief → plan-split-dispatch |
| Ready to build, 1–2 files | build (small) | brief → implement inline |
| Research a topic / compare options / sourced report | research | inline web search (gated — see below) |
| "what should we work on" / audit the repo / find the debt | audit | improve (gated — returns a ranked list) |
| Security audit / find vulnerabilities / audit auth | security audit | security-audit (full audit only on an explicit audit request; findings go to the owner as options, never an auto-fix) |
| Redesign an existing web UI / audit one by path | redesign | hallmark, called by name: `/hallmark redesign <path>` or `/hallmark audit <path>`; in the estate, through the repo's redesign brief and the estate redesign board (the skills library's brief 28) |
| Design a new frontend / UI polish | design | impeccable (+ design-md-library for direction) |
| Accessibility / UI-compliance check on code | design (check) | web-design-guidelines |
| Docs or prose need a style pass | docs | writing-guidelines (+ unslop if AI-drafted) |
| Need a diagram for docs or a design | docs | diagram-design |
| MR/PR open, not ready | review | <review skill> |
| Branch ahead, ship intent | PR open | <PR skill> |
| "what do we call this" / define a term / record a decision | domain | corpus-flow §9 |
| "what does the wiki say about X" | query | corpus-flow: query wiki |

## Knowledge routing — which layer answers which question
<!-- The corpus is the WHY; a code graph is the WHAT. Neither substitutes. -->
| Question shape | Route to |
|---|---|
| "Why is it built this way?" / "what was decided?" | `corpus/wiki/` (start at `index.md`; budget: ≤3 pages) |
| "Who calls X?" / "blast radius of X?" / "where does feature Y live?" | the `codegraph` **project** skill, if bootstrapped |
| **"Did I get _every_ usage?"** (rename/refactor/delete) | **`grep -rnw`** — the graph undercounts |
| A symbol name exported by two sibling packages | **`grep`**, scoped by path — the graph conflates them |
| A correctness invariant (dependency rule, determinism, palette) | **run the guard test** |

## READ / SKIP / SKILLS
| Task type | READ | SKIP | SKILLS |
|-----------|------|------|--------|
| feature   | corpus/wiki/decisions.md, the brief, <key dirs> | unrelated areas | <skills to load> |
```
