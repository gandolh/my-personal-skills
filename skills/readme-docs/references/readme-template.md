# README template

The order puts the facts that let a reader decide fastest at the top. A reader who leaves after the one-liner because the project is not for them is a success, not a failure.

Required in every README: **name, one-liner, hero, status, What it does, Docs, License.** Every other section appears only when there is real content for it. A short idea note keeps a short README; padding a small project with empty sections makes it look abandoned, not serious.

````markdown
# <Name>

<One sentence: what it is, and who it is for.>

<p align="center">
  <img src="docs/images/hero.webp" width="100%" alt="<what the image shows, in words>">
</p>

**Status:** <honest maturity>. <Live link if deployed.>

## What it does

- <concrete outcome 1>
- <concrete outcome 2>
- <concrete outcome 3>

<One or two sentences: why this instead of the obvious alternative, and what it deliberately does not do.>

## Screenshots                      ← UI projects only

| <caption> | <caption> |
|---|---|
| ![<alt>](docs/images/<a>.webp) | ![<alt>](docs/images/<b>.webp) |

## How it works                     ← when there is code worth explaining

<One paragraph naming the parts and how a request or action flows through them.>
<Optional small Mermaid block.> More in [docs/architecture.md](docs/architecture.md).

## Run it locally                   ← when there is something to run

Requires <runtime + version, other services>.

```bash
<= 5 commands, each one run before this was committed>
```

Then open <URL>. Full setup, env vars and tests: [docs/getting-started.md](docs/getting-started.md).

## Project layout                   ← monorepos only, one short table

| Path | What lives there |
|---|---|

## Docs

- [docs/](docs/README.md) — guides, diagrams and the images used here
- <Docs site: https://...>  ← if one is deployed
- <Project wiki: [corpus/](corpus/index.md) — decisions, status, roadmap>  ← if one exists

## License

<License name, linked to the file. Or "No license yet; all rights reserved." when there is no LICENSE file.>
````

## Section by section

### Name and one-liner

The first sentence names the category and the job in plain words. Define or link any unusual term in it.

- Good: "A trip planner for multi-city holidays: day-by-day plans, maps and costs in one page."
- Bad: "Trips, reimagined." (slogan, says nothing)
- Bad: "A Vite + React 19 + Zustand SPA." (stack, not purpose; the reader still does not know what it does)

### Hero

The single image that shows the project working. Pick by kind:

- Web app, site, game: the main screen with realistic demo data, or a GIF of the core action (10 seconds or less).
- Phone-first app: a phone-sized screenshot, or two side by side.
- Service with no UI: a diagram of the flow.
- CLI or tool: skip the image and put a real command with its real output in a code block instead.
- Research or idea note: a diagram of the idea.

Never a logo the size of a screen, never a badge row, never a stock picture.

### Status

One line a reader can trust. Examples:

- "Personal project, used daily. Live at https://example.com/app/."
- "Early prototype. Sign-in and the library view work; sharing is not built yet."
- "Idea draft for a thesis, written 2026-10-07. No code yet."

Take it from `corpus/wiki/status.md` and the commit log, not from hope.

### What it does

Three to five bullets, each an outcome the reader gets, not a feature name. Then the differentiation sentence: why use this instead of the obvious alternative, and what it deliberately leaves out. This is the rarest content in READMEs and the most useful.

### Screenshots

Two to four images beyond the hero, each with a caption saying what it shows. A two-column table keeps them compact. Do not repeat the hero.

### How it works

One paragraph: the main parts and how they connect. A small Mermaid diagram is fine here; the full version goes in `docs/architecture.md`. Link the deep wiki pages rather than summarising them at length.

### Run it locally

The shortest path from clone to seeing it work. State the runtime version and any service that must be running. Five commands at most; everything else goes to `docs/getting-started.md`. Every command here was run before the commit. If a step needs a secret, say which env var and where its example lives (`.env.example`), never the value.

### Project layout

Only for monorepos. One table, top-level folders only, one line each.

### Docs

A short list of where to go next. Always `docs/README.md`; add the live docs site and the project wiki when they exist.

### License

Name it and link the file. If there is no LICENSE file, say so plainly rather than inventing one.

## What does not belong in the README

| Content | Where it goes |
|---|---|
| Full setup, env var tables, test commands | `docs/getting-started.md` |
| Architecture deep dive, data model | `docs/architecture.md`, or link `corpus/wiki` |
| Deploy runbooks | `docs/deploy.md` or the deploy repo |
| Design decisions and history | `corpus/wiki/decisions.md` (link it) |
| Contribution rules | `CONTRIBUTING.md` if the project wants contributors |
| Changelog | `CHANGELOG.md` or the corpus log |
| Hand-written table of contents | nothing; GitHub builds one from the headings |
| Credentials, local accounts | nowhere in the repo |

## Before and after

**Before** (constructed):

```markdown
# shelf
![badge][badge][badge][badge][badge]
Shelf is a modern, powerful platform built with React and Fastify.
## Tech stack
...
## Installation
npm install
```

The reader still does not know what Shelf is for, there is no picture, "modern, powerful" is noise, and the install command has no runtime version and no way to check it worked.

**After** (constructed):

```markdown
# Shelf

A private reading room for your own e-books: upload EPUBs, read them in the browser, and pick up where you left off on any device.

<img src="docs/images/hero.webp" width="100%" alt="Shelf library view: a grid of book covers with a reading-progress bar under each">

**Status:** Personal project, used daily. Live at https://example.com/shelf/ (sign-in required).

## What it does

- Keeps your EPUB library in one place you control
- Opens books in a clean in-browser reader with adjustable type
- Syncs your position between phone and laptop

Use it when you want your own files off a store's platform. It does not sell, convert or share books.
```

Purpose first, proof second, honest status, concrete outcomes, and a sentence on what it is not.
