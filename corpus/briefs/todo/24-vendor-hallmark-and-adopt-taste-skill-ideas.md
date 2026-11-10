# Task 24: Vendor Hallmark, and adopt taste-skill 2.5's ideas

> Revised 2026-11-10 (Q39 and Q33). The owner chose **Hallmark** as the design
> skill for every web UI, keeping what is useful from taste-skill 2.5. The
> bake-off in presentation-sites' brief 01 is cancelled (that brief is
> superseded). The original re-pin plan is below; the decisions section says
> what replaces it.

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed, and
**leonxlnx/taste-skill** was on the list. This library vendors it.
`ATTRIBUTION.md` pins it at `72e2995` (2026-08-22). Five skills were
vendored verbatim and renamed to their frontmatter names:

- `design-taste-frontend`;
- `high-end-visual-design`;
- `minimalist-ui`;
- `industrial-brutalist-ui`;
- `redesign-existing-projects`.

Upstream at `f6b7657` (2026-11-07, **2.5.1**, MIT) has changed a lot:

- **`design-taste-frontend` was rebuilt in 2.5.0** around professional
  company websites "at the figma.com and x.ai bar". The skill folder now
  holds:
  - a page system (`starter.html`, `system.css`, `system.js`);
  - palettes and type dealt by trade;
  - real product-UI fragments and curated licensed photographs (bundled as
    WebP);
  - motion, a copy layer;
  - a browser checker (`consistency.mjs`, over 100 checks at 1440, 1024,
    768 and 390) and a finish gate (`gate.mjs`).

  `SKILL.md` went from 1,206 lines (the vendored one) to 381, and **the
  folder is 40 MB**.
- **The classics moved** to Leonxlnx/taste-skill-classics:
  `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui` and
  others. In 2.1.x they became opt-in (`disable-model-invocation: true`).
  `redesign` was folded into taste-skill's own redesign route.
- 2.1.4 fixed an unquoted `: ` in the description that stopped the skill
  loading in Claude Code. Check whether the vendored copy has it (brief
  21's checker will tell).

The estate's main use for a company-website skill is presentation-sites:
static Astro sites for small businesses in Gorj (a nail salon, a BMW
garage, a towing firm, a tent rental, and Churchix for parishes). That is
exactly 2.5's target. Hallmark (presentation-sites' brief 01, "Hallmark against taste-skill 2.5 on one site") is the
other candidate, and the two need comparing before either is vendored
whole.

## Decisions of 2026-11-10 (these replace the defaults below)

1. **Vendor Hallmark** (`nutlope/hallmark`, pinned at `407fa68`, MIT) as the
   design skill, with its licence kept. Hallmark brings a tiered browser lint,
   the **Floor** that never ships (contrast, focus, reduced motion, invented
   facts, a broken phone layout), a page built from its job, and credited,
   openly licensed photographs. Vendor it verbatim and check its size first;
   if photographs make the folder large, vendor without them and say so in
   `ATTRIBUTION.md`.
2. **Adopt taste-skill 2.5's ideas, not its text.** Palettes and type dealt by
   trade, and its copy layer, go into the library's own design guidance
   (`design-md-library` or a Hallmark companion reference), written fresh with
   the source credited. taste-skill 2.5.1 is not vendored.
3. **The taste suite stays opt-in at its current pin** (`72e2995`):
   `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui` and
   `industrial-brutalist-ui` stay as vendored, marked superseded upstream in
   `ATTRIBUTION.md`, and run only when called by name. They are not re-pinned.
4. **`redesign-existing-projects` retires**, since Hallmark redesigns and
   audits by path. Grep the library for references (impeccable, the README,
   `orchestrate`) and update them. It stays in git history.
5. **Routing.** `orchestrate` gets a "redesign" intent that points at Hallmark
   and at brief 28 (the estate redesign board).
6. Hallmark is the design skill that every repo's redesign brief uses (each
   repo's "A redesign with Hallmark on the estate board").

Work that follows from steps 1-4 replaces the "What to do" below; where they
disagree, this section wins. Re-pinning the three classics from
taste-skill-classics and the 2.5.1 install notes are dropped.

## Defaults before 2026-11-10 (superseded where they disagree)

1. **Vendor 2.5.1 whole?** Default: **no, not yet.** A 40 MB folder in
   every install of this plugin is a real cost, and the bake-off in presentation-sites' brief 01
   decides between taste 2.5.1 and Hallmark for presentation-sites first.
   Until then:
   - keep the vendored 2.1-era `design-taste-frontend`, and mark it as
     superseded upstream in `ATTRIBUTION.md`;
   - document installing 2.5.1 with upstream's `install.sh` for the
     bake-off.

   Alternatives: vendor 2.5.1 without `assets/photos/`, letting
   `photos.mjs` fetch them; or vendor it whole.
2. **The classics.** Default: re-pin `high-end-visual-design`,
   `minimalist-ui` and `industrial-brutalist-ui` from taste-skill-classics,
   with `disable-model-invocation: true` as upstream now ships them, so they
   run only when called by name. Retire `redesign-existing-projects`, whose
   job impeccable's redesign and upstream's redesign route cover. Its row
   in the README goes.

## Files you OWN

- `skills/high-end-visual-design/`, `skills/minimalist-ui/`,
  `skills/industrial-brutalist-ui/`: re-vendored from taste-skill-classics
  at a pinned commit.
- `skills/redesign-existing-projects/`: removed, per decision 2. It stays in
  git history.
- `skills/design-taste-frontend/`: untouched under decision 1, or
  re-vendored under the alternatives.
- `ATTRIBUTION.md` (the table, pins and notes), `LICENSE-taste-skill`
  (refresh if upstream's changed), `README.md`, `docs/history.md`, both
  plugin files, `corpus/wiki/decisions.md` (a revisit of "Vendor third-party
  skills, with pins" for this source), `corpus/`.

## Files you must NOT touch

- `impeccable` and its agents, which are a separate upstream.

## What to do

1. Clone taste-skill-classics, pin a commit, and copy the three classics
   verbatim, renaming directories to their frontmatter names as before.
   Diff each against the vendored copy, and summarise the changes in
   `docs/history.md`.
2. Remove `redesign-existing-projects`, and grep the library for references
   to it (impeccable, the README, `orchestrate`) and update them.
3. In `ATTRIBUTION.md`:
   - record that `design-taste-frontend` is held at `72e2995` on purpose
     while presentation-sites' brief 01 runs;
   - add how to install upstream 2.5.1 for the bake-off.
4. Run brief 21's `check-skills.mjs` if it exists, or check the YAML by
   hand.
5. Bump the minor version.

## Acceptance

- The three classics match taste-skill-classics byte for byte at the
  recorded pin, apart from the directory rename.
- No file in the library still names `redesign-existing-projects`, apart
  from `docs/history.md` and the decision entry.
- `ATTRIBUTION.md` pins both upstreams and says why `design-taste-frontend`
  is held.
- `bash corpus/lint.sh` passes, and the version is bumped.
