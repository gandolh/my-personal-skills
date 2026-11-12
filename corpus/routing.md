# Routing profile: my-personal-skills

Read by the `orchestrate` skill at the start of a work request.

## Skill choices

| Purpose | Skill |
|---|---|
| Implement | inline (a skill change is prose; most briefs are one to three files) |
| Capture | `corpus-flow` |
| Query knowledge | `corpus-flow` §5 |
| Block or unblock work | `corpus-flow` §2b |
| Review | inline |
| Pre-PR | none (single-user repo) |

**Brief folders:** corpus/briefs/{todo,blocked,done,superseded}. Only `todo/`
is open work.

## Intent table

| The user says | Route to |
|---|---|
| "add a todo", "note this for later" | `corpus-flow` §1 |
| "park this until", "unblock", "what's blocked" | `corpus-flow` §2b |
| "let's build brief NN" | `corpus-flow` §3, then build |
| "what does the wiki say about X" | `corpus-flow` §5 |
| "grill me" | `grill-me` |
| "redesign <app>", "the estate redesign board" | brief 28, with `hallmark` called by name (`/hallmark redesign <path>`, `/hallmark audit <path>`) inside each repo's redesign brief |
| "run the design pipeline", "let the judges pick" | `design-pipeline` (director, sketchers, reversed judges, build, critic) |

## READ / SKIP / SKILLS

| Always READ | Always SKIP | Load SKILL |
|---|---|---|
| [index.md](index.md) | `skills/impeccable/`, `skills/hallmark/`, `skills/design-md-library/references/design-md/` (vendored) | `corpus-flow` for any capture or completion |
| [wiki/status.md](wiki/status.md) | `briefs/` wholesale | `readme-docs` for README.md and `docs/` |
| [CLAUDE.md](CLAUDE.md) skill-change rules | | `unslop` for prose |

## Knowledge routing

| Question shape | Layer | Why |
|---|---|---|
| "Why is it built this way?" | `wiki/` | The corpus is the why. |
| "Where does a rule live?" | `grep` over `skills/` | Structural. Never ask the wiki. |
| "Did I update every skill?" | `grep -rn` | Completeness needs exhaustive search. |

**Code graph:** not installed. The repo is prose and a few scripts.
