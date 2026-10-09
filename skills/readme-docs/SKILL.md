---
name: readme-docs
description: Write or refresh a project's README and its docs/ folder to one shared standard — a short landing-page README ordered so a newcomer can decide in a minute, a docs/ folder holding everything the README links to (guides, diagrams, screenshots, GIFs), and real captures of the app with no personal data in them. Use when the user says "refresh the README", "rewrite the readme", "make the README presentable", "add screenshots to the README", "add a docs folder", "make this repo look good for newcomers", "apply the README standard", or "/readme-docs". Works on one repo or a whole estate of repos, the same way each time.
---

# README + docs standard

A README is a landing page, not the documentation. It answers three questions on the first screen: what is this, why would I use it, what do I look at next. Everything longer moves into `docs/` and the README links to it.

This skill fixes one structure so every repo looks the same to a reader who moves between them. It borrows its rules from samber's `readme-optimization` (claim checks, honest status, badge discipline), noffle's *Art of README* (the decision funnel), `beautify-github-readme` (value → proof → mechanism → first use) and coder/xum's regenerable screenshots. See [Influences](#influences).

## The structure

```
<repo>/
├── README.md               landing page, about 150 lines at most
└── docs/
    ├── README.md           index of everything in docs/
    ├── images/             every image the README embeds + shots.md (how each was made)
    ├── diagrams/           diagram sources when they are not the embedded file itself
    ├── getting-started.md  full setup the README shortens            (only if there is setup)
    ├── architecture.md     how it works, one screen, links deeper     (only if there is code)
    └── <topic>.md          deploy, configuration, ... only when real content exists
```

Details, the docs-site case and the two index templates: [references/docs-layout.md](references/docs-layout.md).

The README section order, what each section must and must not contain, and worked examples: [references/readme-template.md](references/readme-template.md).

How to take screenshots, GIFs and video without leaking personal data: [references/capture.md](references/capture.md).

The pass bar to check before committing: [references/checklist.md](references/checklist.md).

## Procedure

Run these in order for each repo. On a multi-repo run, do steps 1–6 per repo (they parallelize) and step 7 one repo at a time when apps share ports or a sign-in service.

### 1. Pre-flight

- `git status`. If the tree is dirty, note which files are the owner's. Never overwrite or stage them. If `README.md` itself is dirty, build on the owner's edit rather than discarding it.
- Read the repo's `CLAUDE.md` (root and `corpus/`) for rules on commits, branches and wording.
- Grep scripts, tests and lint for `README` — some repos pin README content. Know what is pinned before restructuring.
- Find what already exists: an old README, a `docs/` folder (and whether it is a docs-site workspace), `corpus/wiki`, existing images, a live URL, a deployed docs site.

### 2. Read the project, not the old README

Classify it, because the hero and the section set depend on it:

| Kind | Hero | Usually has |
|---|---|---|
| Web app / site / game | real screenshot or short GIF of the main screen | Screenshots, Run it locally, How it works |
| Service / API | diagram of the request flow, or the UI if it has one | Run it locally, How it works |
| CLI / deploy tool | real command output as a text block | Usage, Run it locally |
| Library / skill pack | the smallest real usage example | Usage, Install |
| Research note / thesis / idea | diagram of the idea | What it is, Status, Next steps |

Gather the facts the README will claim: the one-line purpose (from manifests, `PRODUCT.md`, `corpus/wiki/overview.md`), the run commands (from `package.json` scripts and the real entry points), the live URL, the honest status (from `corpus/wiki/status.md` and recent commits), and what the project deliberately does not do.

### 3. Write the README

Follow [references/readme-template.md](references/readme-template.md). The non-negotiables:

- Name, then one sentence saying what it is and who it is for. No badge row, logo or slogan before it.
- A hero visual right after the one-liner, with alt text that says what it shows.
- An honest status line. Never "production ready" unless the owner said so.
- Every command, path, script name, env var and URL is checked against the source. Every command in "Run it locally" is actually run (step 6).
- Overflow moves to `docs/`, it is not deleted. One home per fact: link `corpus/wiki` pages and docs-site pages instead of copying them.
- No hand-written table of contents. No more than four badges, and only ones backed by a real check; personal projects usually need none.

### 4. Build `docs/`

Follow [references/docs-layout.md](references/docs-layout.md): create `docs/README.md` and `docs/images/`, move long setup into `getting-started.md`, write a one-screen `architecture.md` when there is code worth explaining, and keep only topic files that have real content.

### 5. Make the visuals

Follow [references/capture.md](references/capture.md). Screenshots and GIFs come from the running app with demo or seed data. Diagrams are Mermaid blocks in Markdown (GitHub renders them) or an SVG in `docs/images/` for a hero. Record how each image was made in `docs/images/shots.md` so the next refresh is a re-run, not a rediscovery.

If an image cannot be made without showing personal data, leave it out and say so in the report. A missing screenshot is better than a leaked name.

### 6. Verify

Work through [references/checklist.md](references/checklist.md): run the commands, resolve every relative link and image path, check images at phone width, run the repo's own lint (corpus lint, typecheck if a script was touched), and run the prose through the `unslop` skill. Then read the README top to bottom as a stranger and note where you would stop reading; if the stop points come in the wrong order, the order is wrong.

### 7. Commit

Stage only the files you created or changed (`git add README.md docs/...`, never `git add -A`). One commit per repo, in the repo's own message style, for example `docs: rewrite README and add docs/ folder`, with a body listing what moved where. Do not push.

### 8. Report

Per repo: what changed, what moved where, which commands were run and which could not be, which images could not be taken and why, and any fact you could not verify.

## Rules that apply everywhere

- **No secrets.** No passwords, tokens, local test accounts or private hostnames in the README, docs or images. Commands read credentials from env vars.
- **No personal data in images.** No real people's names, messages, emails, phone numbers, addresses, faces or private places. Use seed data or staged neutral content.
- **No drift-prone numbers in images.** Versions, star counts and dates go in text, where they can be updated.
- **Nothing only in an image.** Every command, instruction or fact a reader needs also exists as text.
- **Plain voice.** Short sentences, concrete nouns, no marketing adjectives ("blazing", "seamless", "powerful"). Run `unslop` before committing.

## Influences

Ideas adopted, no text copied: [samber/developer-relations-skills `readme-optimization`](https://github.com/samber/developer-relations-skills) (MIT), noffle's *Art of README*, [oil-oil/beautify-github-readme](https://github.com/oil-oil/beautify-github-readme), [livlign/claude-skills `repo-visuals` and `readme-doctor`](https://github.com/livlign/claude-skills), [coder/xum `generate-readme-screenshots`](https://github.com/coder/xum), [github/awesome-copilot `ui-screenshots`](https://github.com/github/awesome-copilot) and [softaworks/agent-toolkit `crafting-effective-readmes`](https://github.com/softaworks/agent-toolkit).
