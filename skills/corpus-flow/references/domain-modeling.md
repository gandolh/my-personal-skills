# Domain modeling (§9)

Moved out of `SKILL.md` verbatim.

## 9 — Domain modeling (the project's vocabulary + its locked calls)

The wiki records *how things work*. This section is about the **language** used to
say it, and the **decisions** that language encodes. Both live in the wiki spine —
`glossary.md` and `decisions.md` — and both are maintained **actively, mid-session**,
not swept up afterwards.

Vague language is not a documentation problem, it is a design problem wearing a
disguise. A team that has not decided whether an *account* is a Customer or a User
has not finished the design, and every brief written on top of that ambiguity
inherits it.

### 9a — The active discipline (during any grill, brief, or review)

Four moves, run continuously — most belong inside `grill-me`, but they apply
whenever the project is being discussed:

- **Challenge conflicts.** A term used against its glossary definition is a finding,
  not a typo. *"`glossary.md` defines cancellation as X; you're describing Y —
  which is it?"*
- **Sharpen fuzzy terms.** When a word is overloaded, propose the precise one.
  *"You said 'account' — Customer or User? Those are different things."*
- **Stress-test with concrete scenarios.** Invent the awkward case and force the
  boundary. *"What happens if they cancel after partial fulfilment?"* Boundaries
  discovered this way are the ones worth writing down.
- **Cross-reference with code.** If the user states how something works and the
  source disagrees, surface it. That contradiction is either a stale mental model
  or a real bug, and both are worth the interruption.

### 9b — `glossary.md` entry format

Be **opinionated**: when several words exist for one concept, pick one and list the
losers so they stop coming back.

```markdown
# Glossary

**Order**:
A customer's committed request for goods, after payment authorisation.
_Avoid_: purchase, transaction

**Invoice**:
A request for payment sent after delivery.
_Avoid_: bill, payment request
```

Rules:

- **Definitions, not behavior.** Say what it *is*, not what it does. The moment an
  entry explains mechanism, that belongs on a concept page — link to it instead.
- **One or two sentences.** A long definition means the term is doing two jobs.
- **Only project-specific terms.** "Cache", "retry", "timeout" do not belong here
  however much the project uses them. Ask: *is this concept peculiar to this
  project, or general programming?* Only the former earns an entry.
- **`_Avoid_` is the load-bearing half.** Listing the rejected synonyms is what
  actually stops drift; a glossary without them just documents one more option.
- **Group under subheadings** once natural clusters appear; a flat list is fine
  while it stays short.

### 9c — Multi-context repos

Most repos have one vocabulary. A monorepo spanning genuinely separate domains
(ordering vs billing vs fulfilment) often has several, and forcing them into one
glossary is how you get a term with three meanings.

When that happens, keep a **glossary map** at `corpus/wiki/glossary.md` that points
at per-context pages rather than defining everything itself:

```markdown
# Glossary map

## Contexts
- [Ordering](./glossary-ordering.md) — receives and tracks customer orders
- [Billing](./glossary-billing.md) — invoices and payments

## Relationships
- **Ordering → Billing**: Ordering emits `OrderPlaced`; Billing consumes it to invoice
- **Shared**: `CustomerId`, `Money` — same meaning in both, defined here
```

The **relationships** block is the valuable part: it is where the same word having
two meanings becomes visible, and where integration decisions get their names.
Split only when a real second vocabulary exists — a map over one context is
ceremony.

### 9d — `decisions.md` entry format

The three-part test (hard to reverse · surprising without context · a real
trade-off) governs what gets in. Format:

```markdown
## Postgres for the read model
_2026-08-14_ — Projections land in Postgres, not the event store.
Rejected: querying the event log directly (too slow past ~10k events),
Elasticsearch (a second operational dependency for no gain yet).
```

One to three sentences is a complete entry. The value is recording **that** the call
was made and **why** — not filling in sections. Add `Status: superseded by <entry>`
only when a decision is actually revisited.

**What qualifies**, concretely:

- **Architectural shape** — "monorepo with npm workspaces"; "event-sourced writes".
- **Integration patterns** — "Ordering and Billing talk via events, never HTTP".
- **Technology with lock-in** — database, queue, auth, deploy target. Not every
  library; the ones that would take a quarter to swap.
- **Boundary and scope calls** — "Customer data is owned by Customer; others hold
  an ID only". The explicit *no*s are as valuable as the yeses.
- **Deliberate deviations** — "manual SQL, not an ORM, because X". Anything a
  reasonable reader would assume the opposite of. These stop the next agent from
  "fixing" something intentional.
- **Constraints invisible in code** — compliance, a partner's latency contract.
- **Non-obvious rejections** — picked REST over GraphQL for subtle reasons? Record
  it, or someone proposes GraphQL again in six months.

### 9e — Where this shows up elsewhere

- **`grill-me`** does most of the capturing, mid-interview.
- **`improve`** reads `decisions.md` before vetting, so locked calls are never
  reported as tech debt.
- **`plan-split-dispatch`** carries the relevant terms into each chunk's context —
  a subagent that does not know the vocabulary invents its own.
- **`writing-guidelines`** flags terminology drift in docs; the fix belongs here,
  not in the three pages that drifted.
- **`corpus-docs-site`** can render `glossary.md` as a reference page directly.
