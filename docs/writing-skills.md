# Writing skills and agent-facing text

The rules for text an agent reads: a `SKILL.md`, a `references/` file, an
agent's prompt, a `CLAUDE.md`. Text for people (a README, a docs page) follows
the `writing-guidelines` skill instead. Each rule below names what checks it;
"review" means a person or `stocktake` looks.

The headings follow mattpocock/skills' guidance on writing for agents, written
fresh here.

## The rules

1. **The description is written for the agent deciding whether to load.**
   Say what the skill does, then when to use it with the phrases a user
   actually types, then what it is not for. Under 1,024 characters, and
   description plus `when_to_use` under 1,536. Check: `node scripts/check-skills.mjs`.
2. **Hold the load-bearing rules in the first 5,000 tokens.** After
   auto-compaction a re-attached skill keeps only that much. Check:
   `node skills/stocktake/scripts/measure.mjs`, which prints where the cut falls.
3. **Keep the body under about 300 lines.** Push long templates, commands and
   worked examples into `references/`, and link them from the step that needs
   them, so the agent looks them up instead of carrying them. Check: `measure.mjs`.
4. **Split what the agent must hold from what it looks up.** Rules, order and
   stop conditions are held; syntax, tables and examples are looked up.
   Review.
5. **Order by importance.** The rule that prevents the costliest mistake goes
   first, not last. Review.
6. **Number the rules, and tie each one to a check or to "review".** A rule
   nothing can check is advice; say so. Check: `stocktake` item 3.
7. **Give each step a completion criterion.** "Done when: one command goes
   red" beats "build the loop". Review.
8. **Say where a file lives, once.** A pointer names the file and the section
   (`references/templates.md`, "Step 4"), never a copy of its text. Check: `stocktake` item 4 (stale text).
9. **Lead with the verb.** "Run the loop" over "the loop should be run".
   One instruction per sentence. Review.
10. **Prune.** Delete what the agent would do anyway, what a hook or linter
    already enforces, and anything the last stocktake found unused. Check: `stocktake`.
11. **No machine paths, no usernames, no domain, and no path into another
    repo.** Name the repo or the skill. Check: `bash corpus/lint.sh`, and the
    commit-time deny list in `verify-brief`.
12. **Plain, direct English, absolute dates.** No filler, no "simply", no
    praise. Run `unslop` over the draft. Review.
13. **Credit what you adopt, and copy no text.** Ideas from a repo without a
    licence file are credited in `ATTRIBUTION.md` and written fresh. Review.
14. **A skill change bumps the version in both plugin files, the README line
    and `docs/history.md`.** Check: `corpus/CLAUDE.md`, "Skill changes".

## Before you commit a skill

- `node scripts/check-skills.mjs` exits 0.
- `node skills/stocktake/scripts/measure.mjs` shows the load-bearing rules
  before the 5,000-token cut.
- `bash corpus/lint.sh` exits 0.
- You can state, for each numbered rule, its check.
