# The generic intent spine

Step 3 of `orchestrate` reads this for a signal the repo's `corpus/routing.md` has
no row for. Walk it top-down; the first match wins.

| Signal | Intent | Hand off to |
|---|---|---|
| New idea/task to keep | **capture** | `corpus-flow` §1 — add a todo |
| "park this until", "this is blocked on", "unblock", "what's blocked" | **capture** | `corpus-flow` §2b — block or unblock |
| Ready to build, decomposes into ≥3 chunks | **build (dispatched)** | ensure a brief (`corpus-flow` §2), then `plan-split-dispatch` |
| Ready to build, 1–2 files / one indivisible piece | **build (inline)** | ensure a brief, then implement inline |
| Research a topic / compare options / sourced report | **research** | inline web search, then propose options — never auto-build |
| "what should we work on next" / audit / find the tech debt | **audit** | `improve` — survey, vet, rank; promoted findings become briefs |
| "security audit", "find vulnerabilities", "audit auth", pen test | **security audit** | `security-audit` — guidance mode by default; the six-phase full audit only when the request is explicit. Findings become options for the owner, then briefs |
| Redesign an existing web UI, or audit one by path | **redesign** | `hallmark`, called by name: `/hallmark redesign <path>` or `/hallmark audit <path>` (its description keeps it off existing designs otherwise). In the estate, through the repo's redesign brief and the estate redesign board (the skills library's brief 28): proposals first, code only after the owner approves the app on the board. `design-md-library`'s `dealt-by-trade.md` and `copy-layer.md` go with it. **Guard:** never set `TOGETHER_API_KEY`, never run Hallmark's `imagegen.mjs` unless the owner asks, never install anything globally; `puppeteer-core` and Chrome stay per repo |
| Design a new frontend, UI polish, design critique | **design** | `impeccable` — the build engine; `design-md-library` first if the visual direction is unset |
| "is this accessible" / UI compliance on source | **design (check)** | `web-design-guidelines` — static, rules fetched fresh |
| Review docs/prose voice, tone, terminology | **docs** | `writing-guidelines`; run `unslop` first if the text was AI-drafted |
| A diagram would explain it better than prose | **docs** | `diagram-design` |
| Strict maintainability review of a diff | **review** | `thermo-nuclear-review` — very opinionated; use deliberately |
| MR/PR open, not "ready to merge" | **review** | routing.md review skill, else a `general-purpose` agent over the diff |
| Branch ahead of base, ship intent | **PR open** | routing.md PR skill, else propose git commands |
| Name a concept, settle a term, or record a locked decision | **domain** | `corpus-flow` §9 — glossary + decisions; `grill-me` if the term is still contested |
| "what does the wiki say about X" | **query** | `corpus-flow` §5 — query the wiki |
| Work finished, needs recording | **closeout** | `corpus-flow` §4 — done + log + fold into wiki |
