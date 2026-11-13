---
name: stocktake
description: Audit this skill library for quality and cost, and review MCP pins. A quick mode checks the skills changed since a git ref; a full mode scores every skill in batches of five against a rubric (description triggers and length, body size and what sits past the first 5,000 tokens, numbered rules, stale paths, overlap, last use) and writes a ranked, dated wiki page. Use when the user says "stocktake", "audit the skills", "which skills are too big", "what is the plugin's token cost", "prune the skills", "check the MCP pins" or "/stocktake". Reports only; nothing is fixed automatically.
---

# Stocktake: what the library costs and what is worth fixing

A skill library rots two ways: it grows heavier (every description is paid for in
every session) and it drifts (a path, a version or a rule that nobody checks). This
skill measures both and **reports**. It never edits a skill: the owner picks
findings, and each pick becomes a brief.

The measuring facts it relies on, and the rubric itself, are in
[`references/rubric.md`](references/rubric.md). Read that first.

## Modes

**Quick.** For the skills changed since a git ref (default: the last tag, else
`HEAD~10`).

1. `git diff --name-only <ref> -- skills agents commands hooks`, mapped to skill
   names.
2. `node ${CLAUDE_PLUGIN_ROOT}/skills/stocktake/scripts/measure.mjs`, and keep the
   rows of those skills.
3. Score only those skills against the rubric. Print the findings in the reply;
   write no wiki page unless asked.

**Full.** Every skill, in batches.

1. Run the mechanical half once, yourself:
   - `node ${CLAUDE_PLUGIN_ROOT}/skills/stocktake/scripts/measure.mjs` (description,
     `when_to_use` and listing length, lines, estimated tokens, where the 5,000-token
     cut falls);
   - `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-skills.mjs` (the portable limits);
   - `claude plugin details personal-skills` (Claude Code's own always-on and
     on-invoke figures, which the estimate is calibrated against);
   - `/doctor prompt-audit` when the Claude Code version has it (2.1.283 or later),
     which audits `.claude/` content. Run it first; the rubric adds what it can't see.
   - `node ${CLAUDE_PLUGIN_ROOT}/skills/stocktake/scripts/check-mcp-pins.mjs`.
2. Split the skills into batches of **five**, in directory order. Start **one
   subagent per batch** (a sonnet-tier agent), one batch at a time. Give each the
   rubric, its five skill folders, and the measure rows. Ask for findings in the
   format below and for no edits.
3. Add "last seen used" yourself (rubric, item 6), consolidate, de-duplicate, rank.
4. Write `corpus/wiki/stocktake-<YYYY-MM-DD>.md` (format below), regenerate the
   index with `bash corpus/lint.sh --index`, and say what the owner can pick.

Without an agent tool, work the batches yourself in the same order and say so on
the page.

## The finding format

Every finding names a file and a line, and says what to do and what it saves or
protects. A finding with no line is a note, not a finding.

```markdown
### F3. orchestrate: the gate sits past the 5,000-token cut
- **Where:** `skills/orchestrate/SKILL.md:225` (Step 5), cut at about line 211
- **Rubric:** 2, body size and push-down
- **Why it matters:** after auto-compaction the skill keeps only its first 5,000 tokens
- **Suggested brief:** move the Step 0 template to `references/`, keeping Steps 5 and 6 above the cut
- **Size:** medium (about 1.7k tokens moved)
```

## The page

- Frontmatter with `summary:` and `updated:`, like any wiki page, and a body of at
  most 200 lines (`corpus/lint.sh` caps it).
- **The numbers:** version, skill count, always-on and on-invoke tokens (from
  `claude plugin details`), and the largest of each, with the measuring date.
- **Findings, ranked** by leverage: tokens saved in every session first, then rules
  lost after compaction, then wrong or stale text, then overlap, then tidiness.
- **Descriptions over the limit:** the skills whose `description` passes 1,024
  characters or whose listing passes 1,536, with the measured lengths, or the
  sentence "none, the longest is X at N characters".
- **Last seen used**, from the transcripts: counts only, with the caveat the rubric
  gives. A zero is a question for the owner, never a verdict.
- **Not findings:** what was weighed and left alone, so the next run doesn't redo it.

## MCP pins

`scripts/check-mcp-pins.mjs [file-or-folder ...]` is a static review of
`.mcp.json`, `.cursor/mcp.json` and `.vscode/mcp.json`. It never runs a server. It
fails on a package runner (`npx`, `bunx`, `pnpm dlx`, `pnpx`, `yarn dlx`,
`npm exec`) whose package has no exact version, is pinned to `@latest`, a tag or a
range, or is a git URL or a github shorthand with no commit sha. `corpus-flow` §0b
and `codegraph` commit the codegraph server pinned as
`@colbymchenry/codegraph@<pin>`; this is the check that the pin holds. Run it in
the repo that commits the file, before approving a change to it. Its test is
`node --test scripts/check-mcp-pins.test.mjs`.

## Scenarios

`references/scenarios/<skill>.md` holds three prompts for a skill: **explicit**
(names the skill), **implicit** (never names it, but the skill should fire) and
**adversarial** (pushes the skill to break one of its own rules). Each lists what
counts as compliance, in terms a grader can check from the transcript and the tool
calls. They are written for the five front-door skills (`orchestrate`,
`corpus-flow`, `plan-split-dispatch`, `grill-me`, `improve`); the eval harness
(brief 26) runs them. Write one for a skill by copying the shape of the others.
