# personal-skills

A lean, repo-agnostic **frontend design-and-ship** skill library for [Claude Code](https://claude.com/claude-code).

It bundles three entry-point commands, a design build engine, a taste/style suite, a
searchable design-intelligence database, and a small set of audit primitives — so you can
go from idea to a polished, shipped frontend without leaving Claude Code.

## Install

This repository is a Claude Code plugin marketplace. Install it directly from GitHub:

```
/plugin marketplace add gandolh/my-personal-skills
/plugin install personal-skills@personal-skills-marketplace
```

Then restart Claude Code (or reload) so the commands, skills, and agent are picked up.

To update later:

```
/plugin marketplace update personal-skills-marketplace
```

## What's inside

### Commands

- **`/the-one-move`** — commit a non-generic *structure* before building a new frontend, then hand off to `impeccable`.
- **`/improve-platform`** — audit + phased improvement of AI-generated platforms.
- **`/ui-check`** — quick single-screen UI review with proposed changes.

### Build engine

- **`impeccable`** — design fluency with 22 sub-commands. (Apache-2.0)

### Taste / style suite

- **`design-taste-frontend`** — flagship anti-slop frontend skill.
- **`minimalist-ui`**, **`industrial-brutalist-ui`**, **`high-end-visual-design`** — style presets.
- **`redesign-existing-projects`** — audit-and-upgrade an existing site to premium quality.

Each preset defers to `impeccable`'s anti-slop bans on conflict.

### Design intelligence

- **`ui-ux-pro-max`** — searchable design-intelligence database.

### Audit primitives

- **`accessibility-audit`** (WCAG 2.2), **`heuristic-evaluation`** (Nielsen), **`information-architecture`**, **`design-debt-audit`**, and the four `critique-*` single-screen reviews.

### Workflow extras

- **`corpus-flow`** — an LLM-maintained project wiki + todos→briefs→done work lifecycle.
- **`bootstrap-vps-deploy`** — a zero-dependency static-client + pm2-service deploy behind Caddy.
- **`grill-me`** — interview-style plan/design stress-testing.
- **`ui-test-plans`** — plain-text UI test plans + a Playwright run-hub, screenshots gitignored.
- **`plan-split-dispatch`** — repo-agnostic implementation orchestrator: opus plans and splits a task into independent chunks, then dispatches hard chunks to a subagent on opus and easy chunks to a subagent on sonnet — routing cheap tokens to cheap work.
- **`init-personal-repo`** — wire a repo into this workflow: idempotently adds a delimited managed block to the repo-root `CLAUDE.md` (start with `/orchestrate`; intent→skill map), bootstraps the `corpus/` workspace, and offers the codegraph layer. Only ever adds/updates its own block — never rewrites your `CLAUDE.md`.

### Research, performance & code understanding

- **`web-research`** — sourced, fact-checked research reports: web searches run inline (token-efficient), subagents only for codebase exploration (with a gate before fanning out beyond 5), model-routed (Opus for synthesis/verification, Sonnet for lookups). Ships a comprehensive Markdown report plus a concise, results-first HTML digest.
- **`performance-analysis`** — measure a live web page with Chrome DevTools MCP (Core Web Vitals, performance traces, Lighthouse, network/console), then rank fixes by measured impact. Local, Chrome-only.
- **`codegraph`** — understand and safely change unfamiliar code: lead with a code knowledge graph to scope (impact/blast radius, callers), verify with grep+read where correctness matters. Repo-agnostic method; pairs with `corpus-flow`'s per-repo code-graph layer.

## Licensing & attribution

This plugin vendors third-party skills, each retaining its original license (MIT / Apache-2.0).
See [ATTRIBUTION.md](ATTRIBUTION.md) for the full breakdown.
