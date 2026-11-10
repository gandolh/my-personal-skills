# Task 19: A stocktake of the library, and a review of MCP pins (from affaan-m/ecc)

## Context

On 2026-11-09 the owner asked for popular skill repos to be reviewed for
ideas. **affaan-m/ecc** ("ECC") was read at `d2ef268` (2026-11-06, v2.2.3,
MIT). It is very large: 314 skills, 71 agents, hooks, a memory system and
the AgentShield scanner, in 16 languages. Almost all of it is
stack-specific (Django, Laravel, Spring, Kotlin) or duplicates what this
library has. Three pieces fit:

- **`skill-stocktake`.** An audit of skills and commands for quality: a
  quick scan of changed skills only, or a full stocktake in sequential
  subagent batches. This library prunes by hand from transcripts. Its
  decision "Prune skills the transcripts show are unused" (2026-08) is the
  only check there is, and nothing checks quality.
- **`skill-comply`.** It generates scenarios for each skill at three levels
  of prompt strictness, runs agents on them, classifies what they did, and
  reports a compliance rate: is the skill actually followed? Brief 26
  builds the eval harness. This brief only defines the scenarios'
  format, so 26 can run them.
- **`mcp-dependency-review`.** A static review of MCP configuration for
  mutable package references (`npx some-server` with no version), done
  before approval and without running anything. `corpus-flow` §0b and
  `codegraph` tell every repo to commit `.mcp.json` with the codegraph
  server pinned (`@colbymchenry/codegraph@<pin>`), but nothing checks that
  the pin holds.

### Measured on 2026-11-09 with `claude plugin details personal-skills` (Claude Code 2.1.319)

**The plugin's always-on cost is about 5,322 tokens in every session**,
before any skill runs. That cost is the descriptions. The largest are:

| Skill | Always-on |
|---|---|
| `design-md-library` | ~390 |
| `codegraph` | ~370 |
| `improve` | ~360 |
| `plan-split-dispatch` | ~330 |
| `grill-me` | ~330 |
| `impeccable` | ~320 |

On-invoke costs:

| Skill | On invoke |
|---|---|
| `design-taste-frontend` | ~33.7k |
| `corpus-flow` | ~16.1k |
| `diagram-design` | ~14.9k |
| `plan-split-dispatch` | ~8.6k |
| `orchestrate` | ~6.2k |
| `corpus-docs-site` | ~5.8k |
| `redesign-existing-projects` | ~5.7k |

`orchestrate` is listed twice, once as the skill and once as the command
(~120 tokens).

Claude Code's skills docs give the rubric two hard facts:

- After auto-compaction, **each re-attached skill keeps only its first
  5,000 tokens**, within a shared 25,000-token budget. `corpus-flow`
  (16.1k) and `plan-split-dispatch` (8.6k) lose their tails exactly in the
  long runs where they matter most. Their load-bearing rules must sit in the
  first 5k tokens, with the rest in `references/`.
- `description` plus `when_to_use` is truncated at **1,536 characters** in
  the listing, so the key use case goes first.

The best-practices page also lists advice to drop, which the rubric checks
for:

- emphasis such as IMPORTANT and ALL CAPS ("mostly makes Claude
  over-apply the rule");
- "loop until done";
- "think harder";
- architecture described in prose that Claude could read from the repo.

`/doctor prompt-audit` (≥2.1.283) runs a similar audit on `.claude/`
contents. The stocktake runs it first and adds what it can't see.

Weighed and left out:

- AgentShield and `security-scan`: brief 25's security-audit covers code,
  and this library ships no hooks to scan.
- `continuous-learning-v2`'s "instincts": against this library's
  "corpus over personal memory" rule.
- `verification-loop`: already `plan-split-dispatch`'s verify gate.
- The rest: off-stack.

## Decision of 2026-11-10 (Q30)

Yes: the load-bearing rules of `corpus-flow` and `plan-split-dispatch` move
into each skill's first 5,000 tokens, with the rest in `references/`. This
brief does that work itself, ahead of the stocktake, so the two skills'
bodies are an exception to "Files you must NOT touch" below. Nothing else
changes in them. Check the result by counting tokens up to each skill's last
load-bearing rule.

## Files you OWN

- `skills/stocktake/SKILL.md` (new) and its `references/rubric.md`.
- `skills/stocktake/scripts/check-mcp-pins.mjs` (new), with fixtures and a
  test.
- `skills/corpus-flow/SKILL.md` §0b and `skills/codegraph/SKILL.md`: one
  line each pointing at the pin check.
- `README.md`, `docs/history.md`, both plugin files, `ATTRIBUTION.md`
  (Influences), `corpus/`.

## Files you must NOT touch

- Other skills' bodies. The stocktake reports findings; fixes become briefs.

## What to do

1. **The rubric** (`references/rubric.md`). Each skill is scored on:
   - its description: triggers, specificity, length ≤1024 (brief 21);
   - body size and the push-down of detail into `references/`;
   - numbered rules with checks;
   - stale paths or versions;
   - overlap with another skill;
   - "last seen used", from the owner's session transcripts when available;
     otherwise unknown.
2. **The skill.**
   - A **quick** mode: skills changed since a git ref.
   - A **full** mode: every skill, in batches of five, one subagent per
     batch, using the rubric.

   The output is `corpus/wiki/stocktake-<YYYY-MM-DD>.md`, a ranked list in
   which every finding names a file and line. The owner picks which
   findings become briefs. Nothing is fixed automatically.
3. **Scenarios for brief 26.** For each skill, `references/scenarios/<skill>.md`
   holds three prompts (explicit, implicit, adversarial), each with the
   behaviour that counts as compliance. Write them for the five
   front-door skills first: `orchestrate`, `corpus-flow`,
   `plan-split-dispatch`, `grill-me`, `improve`.
4. **`check-mcp-pins.mjs`.** It reads `.mcp.json` and similar files
   (`.cursor/mcp.json`, `.vscode/mcp.json`) and fails on:
   - an `npx`/`bunx`/`pnpm dlx` package with no exact version;
   - `@latest`;
   - a git URL with no commit.

   It never runs a server.
5. Credit ECC in `ATTRIBUTION.md` (Influences, ideas only), and bump the
   minor version.

## Acceptance

- A full stocktake run on this repo writes the dated wiki page with at
  least the two descriptions over 1024 characters found on 2026-11-09
  (`codegraph`, `design-md-library`) among its findings.
- `check-mcp-pins.mjs` passes on a pinned fixture and fails on `@latest`
  and on unversioned `npx` fixtures. `node --test` passes.
- Scenario files exist for the five front-door skills.
- `bash corpus/lint.sh` passes, and the version is bumped.
