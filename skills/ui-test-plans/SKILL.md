---
name: ui-test-plans
description: Set up and run a lightweight, browser-driven UI testing + audit practice for a web app — plain-text test plans (what to test) paired with a Playwright "how to run" hub (server bring-up, fixtures, conventions), with screenshots kept out of git. Use when the user wants to "test the UI", "audit the UI", "write test plans", "set up Playwright testing", "validate the frontend in a browser", check design fidelity/accessibility/responsiveness, or capture findings from a UI walkthrough. Produces a reusable testing structure and a results report; files durable findings back into the project's knowledge base or tracker.
---

# UI Test Plans + Playwright audit

A lightweight practice for validating a web UI in a real browser and keeping the
knowledge reusable. It separates two concerns that usually get tangled:

- **What to test** → plain-text **test plans** (human-readable, durable, reviewable).
- **How to run** → a **Playwright hub** (bring up the app, fixtures, routes,
  conventions) that the plans point at.

Screenshots and traces are **build artifacts**: kept on disk for the current run,
**gitignored**, never committed unless explicitly asked.

This pairs naturally with any project knowledge base or tracker (a `corpus/`, a
`docs/` folder, an issue tracker): test plans live next to the project's other
written knowledge; durable findings get filed back as todos/issues.

---

## When to use

- "Test / audit / validate the UI", "write test plans", "set up Playwright".
- After building or changing UI, to confirm it works *and* looks/behaves right.
- For a design-fidelity / accessibility / responsiveness / states audit, not just
  happy-path clicking.

## The two-part structure

```
<knowledge-base>/test-plans/      ← WHAT to test (plain text)
  index.md                        ← catalog of plans + how a run works
  TP-01-<area>.md … TP-NN-…       ← one plan per feature area
  RESULTS.md                      ← latest run outcome + findings
playwright/                       ← HOW to run (at repo root)
  README.md                       ← server bring-up, fixtures, routes, conventions
  scripts/                        ← helper(s), e.g. start a seeded test server
  screenshots/                    ← captured PNGs (gitignored; keep .gitkeep)
```

Put `test-plans/` wherever the project keeps written knowledge (e.g. inside a
`corpus/` or `docs/`). Keep `playwright/` at the repo root. **Cross-link them**:
each plan links to the Playwright README for setup; the README links back to the
plans.

---

## 1 — Scaffold (first use)

1. Create the directories above.
2. **Gitignore the artifacts, keep the structure.** Add to `.gitignore`:
   ```
   playwright/screenshots/
   playwright/**/*.png
   playwright/**/*.jpeg
   playwright/**/*.webm
   playwright/**/*.zip
   .playwright-mcp/
   ```
   Add `playwright/screenshots/.gitkeep` so the empty dir survives in git.
3. Write `playwright/README.md` — the **"how to run" hub**. Include:
   - **Bring up a test app** — exact commands to build and start the app on a known
     port/URL, against a **throwaway/seeded** datastore (don't touch real data).
   - **Fixtures** — seeded users/credentials, sample records, and any
     gotchas (e.g. seeded dates in a different month than "today").
   - **Routes** — a table of URL → screen.
   - **Conventions** — screenshot naming `screenshots/<plan-id>-<step>.png` so a
     shot traces back to a plan; how to reset state; expected benign console noise;
     which integrations run in mock mode without keys.
   - **Tear down** — stop the process, delete the throwaway datastore.
4. Optionally add `playwright/scripts/start-test-server.sh` (or equivalent) that
   builds, seeds a disposable DB, and starts the server on a test port.

> Keep secrets out: use obviously-fake test secrets/keys in examples.

## 2 — Write test plans (what to test)

One file per feature area, numbered with a stable prefix (`TP-01`, `TP-02`, …).
Each plan is plain text a human can read and a fresh agent can execute:

```markdown
# TP-NN — <Area>

Run setup & fixtures: [<relative path to playwright/README.md>].

## Goal
<One sentence: what this plan verifies.>

## Cases
1. **<Case name>** — <observable behavior to check>.
2. …

## Pass criteria
<What "all good" looks like; note expected mock/benign behavior.>
```

Cover the **functional** flows (auth, CRUD, the core feature loop, permissions)
**and** a dedicated **UI/UX audit** plan: design fidelity vs. the design source,
typography, empty states, loading states, modal/focus behavior, keyboard a11y,
responsive breakpoints, and contrast.

Write an `index.md` cataloging the plans and describing how a run works
(bring up server → walk cases → screenshot → record → file findings).

## 3 — Run the audit (browser-driven)

Prefer a **Playwright MCP/browser tool** for interactive, exploratory runs.

1. **Bring up the seeded test server** per the hub README. Verify health before
   driving the UI.
2. Walk each plan's cases in order. For interactive flows, actually perform them
   (log in, create a record, toggle a control) — don't just look at static pages.
3. **Screenshot** key states to `playwright/screenshots/<plan-id>-<step>.png`.
   View each shot and judge it against the design source, not just "it rendered".
4. **Verify round-trips two ways** when it matters: confirm a UI action in the UI
   **and** via a direct API/DB check (e.g. the created record exists, a
   notification was written). This catches optimistic-UI lies.
5. For the UI/UX audit plan: resize to mobile/tablet widths, trigger empty and
   loading states, check focus/Escape/backdrop on modals, and capture an
   accessibility snapshot if the tool offers one.
6. **Tear down**: close the browser, stop the server, delete the throwaway DB,
   remove any tool scratch dir (e.g. `.playwright-mcp/`).

> Screenshots from MCP tools often land at the repo root — move them into
> `playwright/screenshots/` (gitignored) at the end so they don't get committed.

## 4 — Record results + file findings

1. Write/update `test-plans/RESULTS.md`: a dated table (plan → PASS / PASS w/
   findings / FAIL) with a one-line note each, plus an **evidence** list naming the
   screenshots, and a **Findings** section (id, severity, description, where filed).
2. **File durable findings** back into the project's tracker — as todos/issues/
   briefs in the knowledge base — don't leave them only in the results file. Each
   finding: what's wrong, where (file/component), and an acceptance criterion.
3. If the knowledge base has a changelog/log, add a one-line entry for the run.

## 5 — Re-runs

Plans are durable; re-run them after changes. Re-seed for a clean state each time.
Update `RESULTS.md` in place (it's the *latest* run); the log/tracker holds history.
Resolved findings get closed in the tracker, not erased from history.

---

## Conventions (load-bearing)

- **Plain text plans, runnable by a human or a fresh agent.** No framework lock-in;
  these describe intent, not code.
- **Screenshots are artifacts** — gitignored, regenerated each run, never committed
  unless explicitly requested.
- **Throwaway data only.** Always test against a seeded/disposable datastore on a
  test port; never against real/production data.
- **Stable plan numbers.** Don't renumber a plan when adding others.
- **Relative cross-links** between plans and the Playwright hub so both render in
  the repo browser.
- **Findings get filed**, not buried — the audit's value is the tracked follow-ups.
- **Separate "what" from "how"**: behavior changes edit the plan; environment
  changes edit the Playwright hub.
