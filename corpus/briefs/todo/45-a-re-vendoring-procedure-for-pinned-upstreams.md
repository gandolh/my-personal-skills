# Task 45: a re-vendoring procedure for pinned upstreams

## Context

`ATTRIBUTION.md` pins nine upstreams, from `72e2995` (taste-skill, held on purpose since
2026-11-10) to `aaeb0ea` (pstack, 2026-11-19). `decisions.md` ("Vendor third-party skills,
with pins") says why: an upstream change arrives only when someone updates the pin on
purpose. Nothing says how. Each vendoring so far (briefs 24 and 25, pstack on 2026-11-20)
worked out its own steps, and
[skill-sources-2026-11-20.md](../../wiki/skill-sources-2026-11-20.md) left the question of
re-pinning unslop open.

Brief 44 adds a tenth source that moves fast: modern-web-guidance ships a release a week and
changes 12 to 121 guide files each time, and its 1.0.2 renamed a guide
([modern-web-guidance-2026-11-23.md](../../wiki/modern-web-guidance-2026-11-23.md),
"Taking updates"). The owner's preference of 2026-11-23: no third-party source of agent
instructions updates itself; each update is a reviewed diff.

## Files you OWN

- `docs/vendoring.md` (new).
- `skills/stocktake/SKILL.md`: one line in the full mode's mechanical step, and the report
  section it feeds.
- `README.md`, `docs/history.md`, both plugin files, `corpus/`.
- The fetch URL line in
  `skills/web-design-guidelines/SKILL.md` and `skills/writing-guidelines/SKILL.md`, and
  their `ATTRIBUTION.md` note.

## Files you must NOT touch

- Every other vendored file, and every pin: this brief writes the procedure, it re-pins
  nothing.

## What to do

1. **Write `docs/vendoring.md`**, agent-facing, under the rules of
   [docs/writing-skills.md](../../../docs/writing-skills.md). Two parts:
   - **Vendoring a new source.** The rules `decisions.md` already holds, in one place:
     verbatim and pinned; leave out any upstream file that installs, updates itself or
     writes outside the project it works on; record each exclusion and each local line in
     `ATTRIBUTION.md`; a `LICENSE-<name>` file; the version bump.
   - **Taking a new pin.** The triggers (a brief needs something not vendored; the owner
     picks a pin from the stocktake's list; an upstream change matters to a decision) and
     the steps: clone into a new, empty scratch folder with history back to the old pin
     (`--filter=blob:none` or `--shallow-since`); `git diff -M` between the two pins on the
     vendored paths only, with renames and deletions listed; read that diff for install
     commands, hooks, scripts, network fetches, `npx` or `@latest` or CDN lines and text
     addressed to the agent; compare the licence files at both pins; copy with the source's
     script where it has one (`scripts/vendor-modern-web-guidance.mjs`), else by hand with
     the local lines reapplied; run the checks and any tests the source ships; update the
     pin, its date and the history paragraph. Nothing from the clone is installed or run.
   - Held pins: a row marked held is never re-pinned by this procedure; the note in
     `ATTRIBUTION.md` says what would reopen it.
2. **stocktake.** In the full mode's first step, add: list each row of `ATTRIBUTION.md`'s
   pins table with its pin date and its age in days, and "held" for held rows. The report
   prints the list; it is not a finding.
3. Link `docs/vendoring.md` from `ATTRIBUTION.md`'s opening lines and from the
   decisions.md entry on pins (one line each; the entry's text stays).
4. **Pin the two Vercel fetches** (owner decision 1): in `skills/web-design-guidelines/SKILL.md` and
   `skills/writing-guidelines/SKILL.md`, replace `main` in the fetch URL with the commit `git ls-remote` reports
   for each repo's `main` when the brief runs, and add both as pinned rows with local lines in `ATTRIBUTION.md`.

## Acceptance

- `docs/vendoring.md` exists, follows the numbered-rule shape of `docs/writing-skills.md`,
  and its steps name a check for each.
- `node skills/stocktake/scripts/measure.mjs` shows stocktake's rules still before the
  5,000-token cut; `node scripts/check-skills.mjs` and `bash corpus/lint.sh` are clean.
- No existing pin in `ATTRIBUTION.md` changed; the two Vercel fetches are pinned, and
  `grep -rn 'githubusercontent.com/vercel-labs/[^/]*/main/' skills/` prints nothing.
- The version is bumped in both plugin files, the README and `docs/history.md`.

## Owner decisions

Settled with the owner on 2026-11-23:

1. **Pin both Vercel fetches** in this brief. `web-design-guidelines` and `writing-guidelines` swap `main` in
   their `raw.githubusercontent.com` URL for the commit each file is at when the brief runs (read it with
   `git ls-remote`, no API calls), recorded as local lines with the pin and its date in `ATTRIBUTION.md`. From then
   on they move only through this procedure.
