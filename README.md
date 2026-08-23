# personal-skills

A repo-agnostic **workflow** skill library for [Claude Code](https://claude.com/claude-code),
built around one front door.

`/orchestrate` is the entry point. It ensures the repo has a `corpus/` workspace, reads
`corpus/routing.md` to learn how this project routes work, classifies your request, proposes
a plan, and hands off — capture to `corpus-flow`, build to `plan-split-dispatch`, questions
to the wiki. It routes; it never does the work itself.

## Install

This repository is a Claude Code plugin marketplace. Install it directly from GitHub:

```
/plugin marketplace add gandolh/my-personal-skills
/plugin install personal-skills@personal-skills-marketplace
```

Then restart Claude Code (or reload) so the command and skills are picked up.

To update later:

```
/plugin marketplace update personal-skills-marketplace
```

## What's inside

### The front door

- **`/orchestrate`** — work-intake router. Bootstraps `corpus/` if missing, reads
  `corpus/routing.md`, classifies intent, presents a Route Plan, hands off after approval.
- **`init-personal-repo`** — wire a repo into this workflow. Idempotently adds a delimited
  managed block to the repo-root `CLAUDE.md` (start with `/orchestrate`; intent→skill map),
  bootstraps `corpus/`, and offers the codegraph layer. Only ever adds or updates its own
  block — it never rewrites your `CLAUDE.md`.

### The core loop

- **`corpus-flow`** — an LLM-maintained project wiki plus a todos→briefs→done+log work
  lifecycle. The LLM owns synthesis; you curate sources and ask questions.
- **`plan-split-dispatch`** — implementation orchestrator. Opus plans a task, splits it into
  independent chunks and verifies the result; Sonnet executes chunks by default (including
  medium-hard ones), Opus takes only the novel or risky ones. Routes cheap tokens to cheap work.
- **`grill-me`** — interview-style stress-testing of a plan or design, before briefs get written.

### Documentation

- **`corpus-docs-site`** — scaffold a light-themed Starlight docs site over a corpus-flow
  project: the *narrative* (architecture, decisions, status, roadmap) rendered from the
  `corpus/` wiki, and the *API reference* generated from the TypeScript (Compodoc for a
  NestJS backend, TypeDoc for a package barrel), wired as one monorepo task so both stay current.

### Research, performance & code understanding

- **`web-research`** — sourced, fact-checked research reports. Web searches run inline
  (token-efficient); subagents are used only for codebase exploration, gated before fanning
  out beyond 5. Ships a comprehensive Markdown report plus a concise, results-first HTML digest.
- **`codegraph`** — understand and safely change unfamiliar code: lead with a code knowledge
  graph to scope (impact, blast radius, callers), verify with grep+read where correctness
  matters. Pairs with `corpus-flow`'s per-repo code-graph layer.
- **`performance-analysis`** — measure a live page with Chrome DevTools MCP (Core Web Vitals,
  traces, Lighthouse, network), then rank fixes by measured impact. Local, Chrome-only.

### Shipping

- **`ui-test-plans`** — plain-text UI test plans paired with a Playwright run-hub, screenshots
  kept out of git.
- **`bootstrap-vps-deploy`** — a zero-dependency static-client + pm2-service deploy behind Caddy.

## Why this shape

Grilled, immutable briefs and a curated wiki for **quality**; model-routed dispatch and scoped
context for **token efficiency**; one front door for **UX**.

## History

Through v0.23.0 this plugin also vendored a frontend design-and-ship suite (`impeccable`,
`ui-ux-pro-max`, the taste-skill style presets, and a set of designer-skills audit primitives),
along with the `/the-one-move`, `/improve-platform`, and `/ui-check` commands that drove them.
v0.24.0 removed all of it to leave a focused, first-party workflow library. Those skills are
still available from their upstream sources, and the removal is recoverable from git history.
