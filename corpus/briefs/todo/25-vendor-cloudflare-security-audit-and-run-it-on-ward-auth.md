# Task 25: Vendor Cloudflare's security-audit skill, and run it on ward-auth first

## Context

On 2026-11-09 the owner asked for popular repos to be reviewed for ideas.
**cloudflare/security-audit-skill** was read at `c1c8a8c` (2026-09-14,
MIT, Cloudflare). It is the skill that seeded Cloudflare's vulnerability
discovery harness. It runs a security audit in six phases, with isolated
agents:

1. **Reconnaissance:** `architecture.md` and a `coverage-ledger.json`.
2. **Coverage-led hunting:** hunters assigned from ledger units, and
   coverage critics.
3. **Candidate validation:** a fresh verifier tries to *disprove* each
   candidate.
4. **Structured output:** `findings.json`, with verdicts `confirmed`,
   `needs_validation` or `rejected`, checked against `report-schema.json`.
5. **Independent record verification.**
6. **A target-neutral report.**

It has attack-class references:

- web and auth protocols;
- client side;
- supply chain and release;
- cloud and deployment;
- AI and LLM;
- data isolation;
- resource exhaustion;
- and others.

It also ships zero-dependency validators with tests
(`validate-findings.cjs`, `validate-coverage-ledger.cjs`). Runs are
additive: a later run targets the gaps the ledger records.

This library has no security skill. `improve` lists security as one lens
among six. The estate has real targets:

- **ward-auth:** the estate's own OIDC provider. Every app's "Sign in with
  Ward" depends on it, and it holds passwords, refresh tokens, lockout and
  grants.
- **Fastify servers with their own local accounts:** the vendored
  `wardAuth` plugin in Shelfmark, Almanac, Satchel and others.
- **Servers that fetch user-supplied URLs:** Newspapper's scraper (its
  brief 04, "A fetch connects only to the address it checked", was a fix
  of exactly that class) and Shelfmark's cover downloads.

## Owner decisions (defaults)

1. **Vendor or install.** Default: vendor it verbatim under
   `skills/security-audit/`, pinned, MIT kept, like the other vendored
   skills. It is about 20 files of Markdown and two validators, small.
2. **First target.** Default: ward-auth (`api/` and `shared-library/`),
   because a flaw there is a flaw in every app. The run happens in a
   ward-auth session. Its output goes to ward-auth's
   `corpus/security/<date>/`, and confirmed findings become ward-auth
   briefs. This brief stops at "the run is done and its findings are
   filed".
3. **Routing.** Default: `improve` gets a pointer ("for a security audit,
   use `security-audit`"), and `orchestrate` gets a "security audit"
   intent.

## Files you OWN

- `skills/security-audit/**`: vendored verbatim at `c1c8a8c`.
- `ATTRIBUTION.md` (the table and notes), `LICENSE-cloudflare` (new),
  `README.md`, `docs/history.md`, both plugin files.
- `skills/improve/SKILL.md` and `skills/orchestrate/SKILL.md`: one line
  each (decision 3).
- `corpus/`.
- In ward-auth, in its own session: `corpus/security/<date>/` and the briefs
  for confirmed findings.

## Files you must NOT touch

- The vendored files' content. Adapting to this library happens in
  `improve` and `orchestrate`, not inside the vendored skill.
- ward-auth's code. Fixes are their own briefs there.

## What to do

1. Copy `skills/security-audit/` verbatim. Run its validator tests with
   `node --test skills/security-audit/`, and record the result.
2. Add the license file, the `ATTRIBUTION.md` row and notes, the README row,
   the history entry and the routing lines. Bump the minor version.
3. In a ward-auth session, run the skill on `api/` and `shared-library/`.
   - Put the artefacts in `corpus/security/<date>/`, with its own redaction
     rules: no secrets, no real users.
   - Then file one brief per confirmed finding, and one todo per
     `needs_validation` item with its unresolved fact.
4. Record in this repo's `log.md` how long the run took, how many agents it
   used, and its rough cost. That decides whether the next targets run (the
   `wardAuth` plugin, Newspapper's scraper, Shelfmark's cover fetch).

## Acceptance

- `skills/security-audit/` matches upstream at `c1c8a8c` byte for byte, and
  its tests pass.
- The skill loads on "security audit", "find vulnerabilities", "audit
  auth".
- ward-auth has a dated `corpus/security/` folder with a valid
  `findings.json` (its validator passes) and a report, and a brief or todo
  for each confirmed or `needs_validation` finding.
- `bash corpus/lint.sh` passes, and the version is bumped.
