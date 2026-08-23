---
name: design-md-library
description: A library of 74 real-brand DESIGN.md design-system documents (Stripe, Linear, Vercel, Notion, Apple, Ferrari, Nintendo-2001, …) plus the method for using one — pick a reference brand, adapt its tokens into the project's own system, and hand the result to impeccable or the taste presets to build against. Also covers writing a DESIGN.md for a project that has no design system yet. Use when the user says "make it look like <brand>", "I want a Linear-style UI", "give me a design system", "what should the palette be", "write a DESIGN.md", "pick a visual direction", or "/design-md-library". Reference data, not a renderer — it decides the vocabulary, something else builds the screen.
when_to_use: A frontend needs a coherent visual vocabulary — colors, type, spacing, radii, motion — and the project either has no design system or wants to borrow the feel of a known brand. Gives a concrete, agent-readable starting point instead of inventing tokens ad hoc. Not for auditing an existing UI (that is impeccable/critique) and not a licence to clone a brand wholesale — see the boundary below.
---

# The DESIGN.md library

74 design-system documents extracted from real brands, in the Stitch `DESIGN.md`
format: YAML frontmatter carrying `colors`, type, spacing and radius scales, then
prose describing the brand's structural moves. Agent-readable by design — an agent
reads one and produces consistent UI without a Figma round-trip.

They live in [`references/design-md/<brand>/DESIGN.md`](references/design-md/).

## The boundary (read this first)

These are **references, not skins**. Copying a brand's exact palette, type and
layout onto someone else's product is trade-dress imitation — it makes the work
look derivative and can be a real legal problem for a commercial site.

Use one to **calibrate**, then move off it:

- **Borrow** the structural decisions — contrast strategy, how much whitespace,
  where the one decorative move lives, the type-scale ratio.
- **Adapt** the tokens — reuse the *relationships* (how far the mute grey sits from
  body, how tight the hairline is), not the literal hex codes.
- **Never** ship a competitor's palette + type + logo lockup as your own.

Historical entries (`dell-1996`, `nintendo-2001`) are for deliberate period pieces.

## Picking a reference

Ask what the product needs to *feel* like, then map it:

| If the product should feel… | Start from |
|---|---|
| Developer-native, stark, technical | `vercel`, `linear.app`, `warp`, `opencode.ai` |
| Calm, editorial, document-first | `notion`, `mintlify`, `sanity`, `theverge` |
| Trustworthy, financial, dense | `stripe`, `wise`, `revolut`, `mastercard` |
| Playful, saturated, consumer | `spotify`, `pinterest`, `airbnb`, `figma` |
| Premium, restrained, physical | `apple`, `bmw`, `ferrari`, `starbucks` |
| AI-native, soft-gradient, new | `claude`, `cohere`, `mistral.ai`, `elevenlabs` |
| Period piece (deliberate retro) | `dell-1996`, `nintendo-2001` |

Full list: `ls references/design-md/`. If the user names a brand that is in the
library, just use it. If they name one that is not, pick the two nearest neighbours
and say which you chose and why.

## Method

1. **Pick** one reference (two at most — blending three produces mush).
2. **Read** its `DESIGN.md` frontmatter. The `colors` block is the load-bearing part.
3. **Adapt into the project's own tokens** — same *relationships*, project's own
   values. Write them where the project already keeps design tokens (Tailwind
   config, CSS custom properties, a tokens file). If the project has none, create
   one file; do not scatter hex codes through components.
4. **Name the one structural move** you are borrowing — the single thing that makes
   the reference recognisable (Vercel's mesh gradient at hero scale only; Linear's
   hairline-on-near-black; Stripe's dense tabular rhythm). Borrowing *everything*
   is how you get imitation; borrowing one move is how you get direction.
5. **Hand off to build.** `impeccable` (`/impeccable craft`) or a taste preset
   (`minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design`) does the
   building. On any conflict, **impeccable's anti-slop bans win** — see its SKILL.md.

## Writing a DESIGN.md for a project with none

Same format, derived from what the project already is rather than a brand:

1. Pull the palette that is *actually* in the code today (`grep` the CSS/Tailwind
   config), not the one someone intended.
2. Note what is inconsistent — that list is the real design debt, and belongs in
   `corpus/briefs/todo/` via `improve` or `corpus-flow`, not silently "fixed" here.
3. Write `DESIGN.md` at the repo root with the frontmatter shape used in this
   library, then keep it current — a stale design system is worse than none,
   because agents will follow it.

If the project uses `corpus-flow`, link the `DESIGN.md` from `corpus/wiki/index.md`
so it is discoverable, and record the direction choice in `corpus/wiki/decisions.md`
— picking a visual direction is exactly the kind of call future work should not
relitigate.

## Attribution

Vendored from [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(MIT), vendored complete and unmodified — every brand's `DESIGN.md` and `README.md`.

Each `DESIGN.md` is an *interpretation* of a public brand by the upstream authors,
not an official design system, and the brands themselves are the trademarks of
their owners.
