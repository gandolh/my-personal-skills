# Pass bar

Check every line before committing. A failure in the first group blocks the commit.

## Blocking

- [ ] **Identity:** the first sentence under the title says what the project is and who it is for, with no badge wall, logo or slogan before it.
- [ ] **Commands run:** every command in "Run it locally" (and any usage example) was run in this repo and did what the README says. Long-running commands (`dev`, `start`) were started, reached their ready line or answered on the stated URL, and were stopped. Anything that could not be run is named in the report.
- [ ] **Claims checked:** every script name, path, env var, port, URL and behaviour in the README and docs matches the source. Live URLs answered (`curl -sI`) before they were linked.
- [ ] **Status is honest:** maturity is stated, and nothing implies more stability than the commit log and the wiki support.
- [ ] **License:** named and linked, or the README says there is none.
- [ ] **No secrets, no personal data:** grep the diff for passwords, tokens, emails and local account names; look at every image and GIF frame.
- [ ] **Links resolve:** every relative link and image path in README.md and docs/ exists on disk.

```bash
# from the repo root: list relative links/images that do not resolve, per file
for f in README.md docs/*.md docs/*/*.md; do
  [ -f "$f" ] || continue; d=$(dirname "$f")
  grep -oE '\]\([^)#]+\)|src="[^"]+"' "$f" | sed -E 's/^\]\(//; s/\)$//; s/^src="//; s/"$//' \
    | grep -vE '^(https?:|mailto:)' | while read -r p; do [ -e "$d/$p" ] || echo "missing in $f: $p"; done
done
```

## Quality

- [ ] **Hero** right after the one-liner, with alt text that describes it.
- [ ] **Order:** what → why → proof → how it works → run it → docs → license.
- [ ] **Length:** README about 150 lines or fewer; anything longer moved to `docs/`.
- [ ] **Differentiation:** one sentence on why this instead of the obvious alternative, and what it does not do.
- [ ] **Images:** WebP or SVG (GIF for motion), under 400 KB each (GIF under 5 MB), readable at 360 px wide, recorded in `docs/images/shots.md`.
- [ ] **Nothing only in an image:** every instruction or fact in a picture is also in text.
- [ ] **No hand-written table of contents; badges four or fewer and earned.**
- [ ] **docs/README.md** lists every file in `docs/` and nothing that is not there.
- [ ] **Repo checks pass:** corpus lint (`corpus/lint.sh` or the `lint:corpus` script) if the repo has one; typecheck/build only if you changed code or scripts.
- [ ] **Prose** run through the `unslop` skill.

## Cold-reader test

Read the README top to bottom as someone who has never seen the project, in one minute, and answer:

1. What is this?
2. Why would I use it instead of what I already use?
3. Can I run it, and what do I need?
4. What is the first command?
5. Is it alive?

A wrong or missing answer points at the section to fix: 1 → one-liner, 2 → What it does, 3–4 → Run it locally, 5 → Status.
