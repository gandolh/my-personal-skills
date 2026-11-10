---
summary: Snapshot of the skills library as of 2026-11-09 - version 0.34.0, the 26 briefs filed that day (02-27) and what each is for, and that nothing is built until the owner's grilling on 2026-11-10.
updated: 2026-11-10
---

# Status

As of 2026-11-09 the library is at v0.34.0, with 26 skills. Brief 01 is
done. Briefs 02-27 were filed on 2026-11-09 and are **specs only**: the
owner asked for research and briefs, with a grilling on 2026-11-10 before
anything is built. The questions for it are in
[open-questions.md](open-questions.md).

| Brief | What it is for | State |
|---|---|---|
| 01 The corpus skills learn blocked briefs and todos | | built, v0.34.0 |
| 02 A base-ui skill, styled with Tailwind | conventions, patterns, checker | todo |
| 03 A code-structure skill for Fastify + React | layout, zod route schemas, boundaries | todo |
| 04 Every repo on Base UI 1.9.0 | version bump across the estate | todo |
| 05-14 Whole apps to Tailwind | Shelfmark, Almanac, Postern, Newspapper, ward-auth, Satchel, wicket, the-board, lantern, the mini todo app | todo |
| 15 Enforce the two skills in every repo | checkers, rules files, gates | todo |
| 16 Fastify servers adopt the structure | 16 servers, smallest first | todo |
| 17 Review comments and finishing a branch | from obra/superpowers | todo |
| 18 A diagnose skill and an owner-steps wizard | from mattpocock/skills | todo |
| 19 A skills stocktake and MCP pin review | from affaan-m/ecc | todo |
| 20 Surgical changes in the chunk contract | from andrej-karpathy-skills | todo |
| 21 The Agent Skills format | from anomalyco/opencode | todo |
| 22 A second model in the review gate | from stablyai/orca | todo |
| 23 A session-start hook on the corpus | from thedotmack/claude-mem | todo |
| 24 Re-pin the taste suite | leonxlnx/taste-skill 2.5.1 | todo |
| 25 Cloudflare's security audit, on ward-auth first | cloudflare/security-audit-skill | todo |
| 26 Model evals for the library's prompts | pingdotgg/t3code, `claude plugin eval` | todo |
| 27 A house style and a quality harness | the measured style, lint, format, hooks | todo |

Other repos got their own briefs on the same day:

- **Shelfmark 04:** book recommendations.
- **Newspapper 06:** a post as a video (heygen-com/hyperframes).
- **public-resource-map 01:** a source registry and map links that can be
  shared (bilawalsidhu/gods-eye-view).
- **presentation-sites 01:** Hallmark against taste-skill on one site
  (nutlope/hallmark).

Where things stand: the research is in the briefs, each with its sources
and dates. The measurements are in brief 27 (style, Prettier churn) and
brief 19 (the plugin's token cost: about 5,322 tokens always-on). The
spikes (Base UI 1.9.0 types; Fastify with the zod provider) are recorded
in briefs 02 and 03.

Owner steps: the grilling on 2026-11-10, then review the PRs. Nothing is
deployed.

## 2026-11-10: grilled, trackers written

The owner's grilling of 2026-11-10 is done (Q1-62 answered; see
[grilling-2026-11-10.md](grilling-2026-11-10.md) and
[grilling-2026-11-10-technical-calls.md](grilling-2026-11-10-technical-calls.md)).
The corpus follows it, still specs only, nothing built:

- Briefs 04, 15 and 16 are **trackers** of each repo's own briefs.
- Briefs 05-14 are **superseded** by each repo's own Tailwind brief.
- Briefs 02, 03 and 27 carry the answers and the Round 8 and later facts as
  dated decisions. Brief 19 takes Q30, 25 takes Q34, 26 takes Q35.
- Brief 17 is now "finish on main" (Q31). Brief 24 is now "Vendor Hallmark,
  and adopt taste-skill 2.5's ideas" (Q39).
- Brief 22 is **blocked**: no second vendor's CLI is installed (Q32).
- Brief 28, *The estate redesign board*, is new and depends on 24.
- The work happens on `main` in each repo, with no PRs (Q4). Phase B builds
  the Base UI bumps first.
