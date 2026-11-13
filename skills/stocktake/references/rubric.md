# The rubric

Each skill is scored on six items. A skill that passes an item produces no finding
for it. Scores are not summed: the page ranks findings, not skills.

## What is measured, and how

| Fact | Source |
|---|---|
| The plugin's always-on cost (descriptions and `when_to_use`, in every session) and each skill's on-invoke cost | `claude plugin details personal-skills` (Claude Code reports estimates) |
| The same per skill, from the tree, before an install | `scripts/measure.mjs` (characters divided by 2.7; across the library that ratio ranged 2.6 to 3.1 against the figures above) |
| Description and listing length, name rules, frontmatter | `scripts/check-skills.mjs` and `measure.mjs` |
| The tokens up to a skill's last load-bearing rule | `node measure.mjs --upto <SKILL.md> "<text of the last rule>"` |

Two facts from Claude Code's skills documentation set the limits:

- After auto-compaction **each re-attached skill keeps only its first 5,000
  tokens**, within a shared 25,000-token budget. A rule past that point is gone in
  exactly the long runs where it matters.
- `description` plus `when_to_use` is cut at **1,536 characters** in the listing.
  This library's own limit for `description` alone is **1,024** (brief 21).

## 1. The description

- It opens with what the skill does, then the phrases a user says (triggers), and
  names the skill's boundary ("Not for ...") when a neighbour overlaps.
- `description` is at most 1,024 characters, and `description` plus `when_to_use`
  at most 1,536.
- It is specific. A description that would also fit three other skills is a finding.
- It has no emphasis words. Always-on cost counts: report the five largest, with
  what trimming a third of each would save.

## 2. Body size and push-down

- The load-bearing rules (the ones whose loss changes behaviour) sit in the first
  5,000 tokens. For a skill whose total is past that, find the last load-bearing
  rule and measure its position with `measure.mjs --upto`.
- Detail that is only needed in one branch lives in `references/`, linked from the
  line that needs it.
- A body past 500 lines is a finding unless it is vendored and pinned (then it is a
  note: the owner decides whether to split it locally).

## 3. Numbered rules with checks

- A skill that states conventions states them as numbered rules, each with its
  reason and what enforces it (a script, a lint rule, or review), as `base-ui`,
  `code-structure` and `house-style` do.
- A rule that nothing checks and no reviewer could is a finding.

## 4. Stale text

- A path, command, flag, version or count that the tree no longer matches. Verify
  each by looking: a link target exists, a script is where it is said to be, a
  pinned version is the one the repo vendors.
- Rules that contradict a recorded decision (`corpus/wiki/decisions.md`) or
  another skill.
- A relative link in a `references/` file that was written for `SKILL.md`'s folder.

## 5. Overlap

- Two skills whose descriptions would both fire on the same prompt, or whose bodies
  teach the same method. A deliberate pointer (one skill linking to the other as the
  owner of a method) is not overlap. Overlap is two copies of the method.

## 6. Last seen used

- Search the owner's session transcripts for `"skill":"<name>"` and
  `"skill":"personal-skills:<name>"` (a Skill tool call), and for
  `<command-name>/<name>` (a slash command). Report **counts and the latest
  transcript date**, never content.
- Caveats to print with the numbers: the date is the transcript file's last write,
  not the call; skills read through an instruction ("follow the `codegraph` skill")
  or loaded by a subagent or a hook leave no Skill call; a new skill has had no time.
- A zero is a question for the owner. A skill is a prune candidate only when it is
  zero **and** costs always-on tokens **and** nothing in the library points at it.

## Advice to drop (check for these in first-party skills)

- Emphasis (IMPORTANT, ALL CAPS, repeated NEVER): "mostly makes Claude over-apply
  the rule".
- "Loop until done" and "think harder" with no bound. (A loop with a named
  exit, such as an approval gate, is fine.)
- Architecture written out in prose that Claude could read from the repo.

## Ranking

1. Tokens paid in every session (descriptions), largest saving first.
2. A load-bearing rule past the 5,000-token cut of a skill that runs long.
3. Text that is wrong or contradicts a decision.
4. Overlap and unused skills.
5. Tidiness (a long body that loses nothing at the cut).

A vendored skill (named in `ATTRIBUTION.md`) is reported but its fixes are the
owner's call: the upstream is pinned and changed there.
