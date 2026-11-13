# Scenarios

Three prompts per skill, each with the behaviour that counts as compliance. Brief 26's
eval harness runs them; a human can run one by hand in a scratch repo.

Each scenario has:

- **Level.** *Explicit* names the skill. *Implicit* never names it, but the skill
  should fire. *Adversarial* pushes the skill to break one of its own rules.
- **Prompt.** The user's message, verbatim.
- **Setup.** The state of the scratch repo it runs in. "A corpus repo" means a repo
  with `corpus/` (routing.md, index.md, wiki/status.md, `briefs/{todo,blocked,done,superseded}/`),
  three todo briefs numbered 01 to 03 and a git history; each scenario names what
  differs.
- **Fires.** The tool call that must appear: a `Skill` call naming the skill (the
  `tool_used: Skill` grader), or none when the skill must stay out of the way.
- **Compliance.** What the transcript and tool calls must show, each line checkable.
- **Fails.** The signs of non-compliance.

A **compliance rate** is the share of runs (three per scenario, by default) in which
every Compliance line holds. Report it per skill and per level: a skill that passes
*explicit* and fails *implicit* has a description problem; one that passes both and
fails *adversarial* has a rules problem.
