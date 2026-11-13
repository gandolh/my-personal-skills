---
summary: The first full stocktake of the library at v0.48.0 (2026-11-13) - always-on and on-invoke token costs, which descriptions are over the limit (none), what sits past the 5,000-token compaction cut, and 13 ranked findings with a file and line each; the owner picks which become briefs.
updated: 2026-11-13
---

# Stocktake, 2026-11-13

A full run of the [stocktake skill](../../skills/stocktake/SKILL.md) on this
repo, against its [rubric](../../skills/stocktake/references/rubric.md). Nothing here
is fixed: each finding is a candidate brief, and the owner picks. The run was made by
the builder of brief 19 directly (no subagent batches), with the mechanical half from
the scripts and the judgement items read from the files.

## The numbers

Measured with `claude plugin details personal-skills` (Claude Code 2.1.312) on the
v0.47.0 plugin, and with `scripts/measure.mjs` on the tree (characters / 2.7, which the
library's own figures bracket at 2.6 to 3.1).

- **Always-on: about 6,919 tokens in every session**, against 5,322 on 2026-11-09 at
  v0.35.0. The growth is `code-structure` (~480), `design-pipeline` (~470), `base-ui`
  (~400) and `hallmark` (~100), which did not exist then.
- Skills: 30, plus the `orchestrate` command, which the tool counts as a second entry
  (~120 tokens). Agents: 12.
- The five largest always-on costs are `code-structure` ~480, `design-pipeline` ~470,
  `design-md-library` ~420, `base-ui` ~400 and `codegraph` ~370: about 2,140 tokens, a
  third of the total. Next are `improve` ~360, `plan-split-dispatch` ~330, `grill-me`
  ~320 and `impeccable` ~320.
- Largest on invoke: `design-taste-frontend` ~33.6k, `diagram-design` ~14.8k,
  `corpus-flow` ~16k before this run (3.5k after), `plan-split-dispatch` ~9.7k before
  (4.4k after), `hallmark` ~6.9k, `orchestrate` ~6.7k, `code-structure` ~7.4k,
  `base-ui` ~6.3k, `house-style` ~5.8k, `corpus-docs-site` ~5.8k.

## Descriptions over the limit

**None.** On 2026-11-09 `codegraph` and `design-md-library` were over 1,024
characters; brief 21 moved their trigger text into `when_to_use`. Today:

| Skill | `description` | with `when_to_use` |
|---|---|---|
| `plan-split-dispatch` | 910 | 910 |
| `impeccable` | 895 | 895 |
| `code-structure` | 871 | 1,343 |
| `design-pipeline` | 870 | 1,308 |
| `orchestrate` | 769 | 769 |
| `design-md-library` | 757 | 1,172 |
| `codegraph` | 607 | 1,020 |

The longest `description` is 910 and the longest listing 1,343, both under the 1,024
and 1,536 limits. `node scripts/check-skills.mjs` agrees.

## Done in this run

Q30 of the grilling: the load-bearing rules of the two long skills moved into each
skill's first 5,000 tokens, the rest into `references/`. Estimated position of the last
load-bearing rule:

| Skill | Before | After |
|---|---|---|
| `corpus-flow` | Conventions block at ~14.9k, the step templates from ~3k | whole file ~3.5k, §4 ends at ~3.0k |
| `plan-split-dispatch` | fix loop from ~4.7k, ruling ledger ~5.9k, verify gate ~6.4k, wave mode and pause ~8.2k | whole file ~4.4k, the pause rule ends at ~4.3k |

## Findings, ranked

### Tokens paid in every session

**F1. Four Vercel skills cost ~620 tokens a session and have no recorded use.**
`vercel-composition-patterns` (~120), `vercel-react-best-practices` (~130),
`vercel-react-native-skills` (~120) and `vercel-react-view-transitions` (~250); see
`skills/vercel-react-best-practices/SKILL.md:3` for one. The transcripts show no Skill
call for any of them, and nothing in the library points at them. Vendored and pinned, so
the owner decides: prune, or keep and accept the cost. Saves ~620.

**F2. Trim the five largest descriptions by a third.** `skills/code-structure/SKILL.md:3-4`,
`skills/design-pipeline/SKILL.md:3-4`, `skills/design-md-library/SKILL.md:3-4`,
`skills/base-ui/SKILL.md:3-4`, `skills/codegraph/SKILL.md:3-4`. Their `when_to_use` is as
long as the description. Keep the first sentence of the use case and four or five trigger
phrases each. Saves ~700.

**F3. `codegraph` has no recorded Skill call.** `skills/codegraph/SKILL.md:3`, ~370
tokens always-on. It is loaded by instruction (`corpus-flow` §0b says to follow it), which
leaves no Skill call, so this is a question for the owner and not a verdict.

**F4. The `orchestrate` command and skill are listed twice.**
`commands/orchestrate.md:1` costs ~120 tokens beside the skill's ~270. The skill alone
answers `/personal-skills:orchestrate`. Owner's call: the short `/orchestrate` form is
the front door the README shows.

### Rules lost after compaction

**F5. `orchestrate`: the mandatory gate sits past the cut.**
`skills/orchestrate/SKILL.md:225` (Step 5, the Route Plan gate), `:258` (Step 6, hand
off) and `:275` (Principles, including the commit rule) start at about 5.4k tokens and end
at 6.7k. The Step 0 `routing.md` template (`:83-132`, about 1.7k tokens) is only needed on
a bootstrap. Move it to `references/` and the gate, the hand-off and the principles all
fall under 5,000. This is the front door, and the long runs are where it matters.

**F6. `house-style`: "The hooks" section is past the cut.**
`skills/house-style/SKILL.md:166` ends at about 5.8k tokens. Small: the rules
(`:30-84`) are well inside. Move the section's detail to `references/`.

**F7. `corpus-docs-site`: the deliverables checklist is past the cut.**
`skills/corpus-docs-site/SKILL.md:246`, about 5.3k tokens. The Gotchas (`:194`) fit.
Low.

### Wrong or contradictory text

**F8. `orchestrate` contradicts itself on a trivial edit.** `skills/orchestrate/SKILL.md:138`
says a 1-2 file, non-sensitive change is made inline with the diff shown and no Route
Plan; `:205` says nothing is written until the user has agreed "on *every* path ... including
the ones that look too small to bother with". One of them has to give. The adversarial
scenarios avoid the ambiguity by using a six-file change.

**F9. `orchestrate` says to branch first.** `skills/orchestrate/SKILL.md:295`: "If the work
isn't on a feature branch yet, branch first." The estate works on main with no branches
(the owner's rule of 2026-11-06). Brief 17 ("finish on main", Q31) is the place to fix it;
`skills/plan-split-dispatch/references/wave-mode-and-configuration.md:98` carries the same
"ask the user to branch first" for a worktree on a protected branch, which is still right
for worktrees and is not a conflict.

**F10. `orchestrate` "loop until `go`".** `skills/orchestrate/SKILL.md:271`. It has a
named exit, so it passes the "no unbounded loop" check. Noted, not a finding to fix.

### Overlap and unused

**F11. The three taste presets and `design-taste-frontend` ship 4 skills for one idea.**
`skills/minimalist-ui`, `skills/industrial-brutalist-ui`, `skills/high-end-visual-design`
and `skills/design-taste-frontend` (the last is ~33.6k on invoke). They load only by name
since v0.40.0, so the always-on cost is ~380 tokens together; the cost is the ~33.6k
when one is called, which is more than a compaction keeps. Pinned upstream and held. Only
the owner knows if they are still used: `minimalist-ui` was called on 2026-11-13, the
other three never.

**F12. `design-taste-frontend` is a 1,207-line body with no `references/`.**
`skills/design-taste-frontend/SKILL.md:1`. After a compaction it keeps 5,000 of about
32,000 tokens. Vendored and held; a local split is the only fix.

**F13. `diagram-design`: 583 lines, ~14.5k on invoke, the 5,000 cut at line 166.**
`skills/diagram-design/SKILL.md:1`. Vendored from upstream; it already has 200 files
under `references/`. Report only.

## Last seen used

Counts of Skill tool calls (`personal-skills:<name>` or the bare name) over 403 session
transcripts, and the latest transcript write date. The date is the file's last write, not
the call. A zero may be a skill loaded by instruction, by a hook or by a subagent.

| Skill | Calls | Latest |
|---|---|---|
| `unslop` | 159 | 2026-11-13 |
| `grill-me` | 37 | 2026-11-13 |
| `impeccable` | 28 | 2026-11-02 |
| `base-ui` | 26 | 2026-11-13 |
| `corpus-flow` | 24 | 2026-11-04 |
| `plan-split-dispatch` | 15 | 2026-11-13 |
| `code-structure` | 8 | 2026-11-11 |
| `readme-docs` | 7 | 2026-11-04 |
| `ui-test-plans` | 5 | 2026-10-27 |
| `web-design-guidelines` | 3 | 2026-10-27 |
| `improve`, `design-md-library`, `corpus-docs-site`, `minimalist-ui` | 2 each | 2026-10-16, 2026-10-14, 2026-10-21, 2026-11-13 |
| the rest (13) | 0 | none |

`orchestrate` is run as a command, which the Skill-call search does not count.
`hallmark` and `design-pipeline` are new, and `house-style` runs through its hooks.

## Not findings

- **No stale paths found.** Every `${CLAUDE_PLUGIN_ROOT}/...` path in the first-party
  skills exists. The links that did not resolve in `references/` files were examples in
  templates. One was a real break from this run's own move (`corpus-flow`'s reference
  to `ui-test-plans`) and is fixed.
- **No emphasis problem.** The first-party skills use ALL CAPS rarely (3 or fewer a
  skill; `plan-split-dispatch` has one "MANDATORY" on a real gate).
- **Overlap by design:** `corpus-flow` §0b points at `codegraph`, and §3a at `grill-me`,
  as the owner of each method. That is a pointer, not a second copy.
- **AgentShield, `security-scan`, "instincts", `verification-loop`:** weighed in
  brief 19 and left out (see the brief).
