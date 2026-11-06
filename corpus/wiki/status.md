---
summary: Snapshot of the skills library as of 2026-11-06 - version, what the open brief changes, and what the owner does to ship it.
updated: 2026-11-06
---

# Status

As of 2026-11-06 the library is at v0.34.0 once brief 01 lands (v0.33.0
before it): 26 skills.

| Brief | State |
|---|---|
| 01 The corpus skills learn blocked briefs and todos | built, v0.34.0 |

Where things stand: `corpus-flow`, `plan-split-dispatch`, `orchestrate`,
`improve` and `grill-me` know the `blocked/` folders. About 26 other repos
copy the old layout into their own `corpus/CLAUDE.md` and `lint.sh`; each
adopts the folders when something there is first blocked, and vps-deploy goes
first (its four hardware todos).

Owner steps: push, then update the plugin. Nothing is deployed.
