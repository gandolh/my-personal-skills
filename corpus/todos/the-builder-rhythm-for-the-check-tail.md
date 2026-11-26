---
title: The builder rhythm for the check tail
created: 2026-11-24
status: promoted
tags: [agents, harness]
---

# The builder rhythm for the check tail

Promoted 2026-11-24 to [brief 48](../briefs/done/48-the-builder-rhythm-for-the-check-tail.md).

From [check-speed-2026-11-23.md](../wiki/check-speed-2026-11-23.md), recommendation 2. Inner loop after each step:
`npm run check:fast` and the test file beside each changed source; the full `npm run check` once after the last code
change; after a failure, fix, re-run the failing step alone, then the gate once more; read the kept log instead of
re-running. This changes `agent-sources/brief-builder.md`, the build instructions and the per-commit green gate in
briefs (a middle commit can then fail a step only the full gate runs, such as knip). Measured saving: about 2.5% of
active build time over two weeks.
