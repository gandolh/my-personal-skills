# Vendoring third-party skills

How to bring an upstream's files into this library, and how to move a pinned
upstream to a new commit. For the agent doing the work. The reasons are in
`corpus/wiki/decisions.md` ("Vendor third-party skills, with pins"); the list of pins is
[ATTRIBUTION.md](../ATTRIBUTION.md). Same shape as [writing-skills.md](writing-skills.md):
numbered rules, each with its check.

No third-party source of agent instructions updates itself here. An upstream change
arrives as a diff someone read, on a pin someone chose.

## Part 1. Vendoring a new source

1. **Copy verbatim, at one commit.** Record the full commit, its date and the upstream's
   version in the pins table of `ATTRIBUTION.md`. The copy differs from upstream only in
   the lines rule 3 names. Check: `git diff --no-index <clone path> <vendored path>` shows only those lines.
2. **Leave out any upstream file that installs, updates itself or writes outside the project
   it works on.** That covers installers, hook writers, package-runner or `@latest` calls,
   telemetry and anything that edits a settings file or a folder in the user's home. Leave out
   what the plugin has no use for too. Check: `grep -rnE 'npx |@latest|unpkg\.com|esm\.sh|cdn\.jsdelivr\.net|curl |wget |settings\.json' <vendored path>`
   prints nothing, or every hit is explained in rule 3.
3. **Record each exclusion and each local line in `ATTRIBUTION.md`**, under the source's
   note: what was left out and why, and each edited line with the reason. A local line is a
   last resort; prefer leaving the file out. Check: `node scripts/check-skills.mjs` exits 0, and a
   reader of the note can rebuild the copy from upstream.
4. **Keep the licence.** Add `LICENSE-<name>` at the plugin root with the upstream's text
   (or its declared licence, when it ships no file, and say so in the note), and list it under
   "License texts". Apache-2.0 also keeps the `NOTICE`. Check: `ls LICENSE-*` names the source.
5. **Hold a script that does the copy, when the source moves fast.** A script makes the same
   copy at any pin, applies the local lines itself and refuses to write while a banned
   line remains. `scripts/vendor-modern-web-guidance.mjs` is the model: exit 0 written, 1 a check
   failed (file and line listed, nothing written), 2 a usage error. Check: `node --test scripts/*.test.mjs` exits 0.
6. **Credit, bump, record.** The skill change bumps the version in both plugin files, the
   README line and `docs/history.md`, as `corpus/CLAUDE.md` ("Skill changes") says, and the
   decision goes on `decisions.md` when it settles a rule. Check: `bash corpus/lint.sh` exits 0.

## Part 2. Taking a new pin

Do this only when one of three things holds:

- a brief needs something the pinned copy lacks;
- the owner picks a pin from the stocktake's list of pins and their age;
- an upstream change matters to a decision this library holds.

Age alone is not a trigger.

1. **Check the row is not held.** A row marked held in the pins table is never moved by this
   procedure. Its note in `ATTRIBUTION.md` says why it is held; only the owner reopens it.
   Check: the row has no "held".
2. **Clone into a new, empty scratch folder**, with history back to the old pin:
   `git clone --filter=blob:none <url> <folder>`, or `--shallow-since=<date before the old pin>`.
   Install nothing from it and run nothing from it, no `npm install`, no package script, no
   hook. Check: `git -C <folder> cat-file -t <old pin>` prints `commit`.
3. **List what changed on the vendored paths only.**
   `git -C <folder> diff -M --stat <old pin> <new pin> -- <vendored paths>`, then
   `--name-status` for the renames (`R`) and deletions (`D`). A renamed or removed file
   may be one a local line or a skill's index points at. Check: every `R` and `D` is answered
   (the index row, the link or the local line is updated, or the file stays out).
4. **Read the diff** (`git diff -M <old> <new> -- <paths>`) for install commands, hooks,
   scripts, network fetches, `npx`, `@latest`, CDN lines and text addressed to the agent
   ("you must", "always run", "tell the user"). A hit goes to rule 2 of Part 1: it stays out or
   gets a local line. Check: `git diff <old> <new> -- <paths> | grep -nE '^\+.*(npx|@latest|unpkg|esm\.sh|jsdelivr|curl |wget |settings\.json)'`
   prints nothing, or each line is answered.
5. **Compare the licence files** at both pins:
   `git diff <old> <new> -- LICENSE* NOTICE*`, and read the README's licence line. A change of
   licence is the owner's call, so stop and report. Check: the diff is empty, or the owner has
   answered.
6. **Copy.** Where the source has a script, run it:
   `node scripts/vendor-modern-web-guidance.mjs <clone> <full sha>`. Where it has none,
   copy by hand, then reapply every local line `ATTRIBUTION.md` lists. Never edit a vendored file
   by hand when a script made it. Check: the script exits 0, or the hand copy differs from
   upstream in the recorded lines only (Part 1, rule 1).
7. **Run the checks and any tests the source ships**, from the library: `node scripts/check-skills.mjs`,
   `node --test scripts/*.test.mjs`, `bash corpus/lint.sh`. A test file from upstream runs
   only if the vendored note says it is safe, as `security-audit`'s validators are. Check: all
   exit 0.
8. **Move the pin.** Update the pins table (commit, date, version), the note's pinned-commit
   text, any link that names the old commit (a GitHub URL at the pin), the skill's version
   line and the history paragraph, and bump the plugin version. Check: `grep -rn <old short sha> .`
   finds nothing outside `docs/history.md` and the brief that records the move.
9. **Delete the scratch clone.** Check: the folder is gone.

## Held pins

`taste-skill` (the four style presets) is held at `72e2995`: upstream's 2.5 is a different
product, and its useful ideas are adopted, not vendored. The note in `ATTRIBUTION.md` is the
record. When the owner holds another row, the note says why and what would reopen it.
