---
summary: Locked calls for the skills library, each with the date, the alternative and the reason. Vendoring over first-party-only (2026-08), pinned upstreams with licenses kept, ideas adopted but not copied, a prune of unused skills, and blocked work in its own folders.
updated: 2026-11-06
---

# Decisions

## Vendor third-party skills, with pins
_2026-08-22_ (v0.27.0) - The library vendors upstream skills (impeccable, the
taste suite, the Vercel skills, diagram-design, unslop) instead of staying
first-party only. Each keeps its license, and ATTRIBUTION.md records the
upstream and the pinned commit. Rejected: first-party only, the rule from
v0.24.0 to v0.26.0. It left the owner without a design layer, and the upstream
work was good enough to carry whole. The reason to pin is that an upstream
change then arrives only when someone updates the pin on purpose.

## Adopt ideas, copy no text, when a source is not vendored
_2026-08-20_ (v0.26.0, v0.30.0) - `improve`, the review gate in
`plan-split-dispatch` and `readme-docs` took ideas from shadcn/improve,
obra/superpowers and others, written fresh against this suite's conventions.
Rejected: vendoring them. Their shape (audit then plan, a fixed review gate)
fit, but their wording did not match the corpus vocabulary.

## Prune skills the transcripts show are unused
_2026-08_ (v0.24.0, v0.25.0) - The frontend ship suite, `web-research`,
`init-personal-repo` and `performance-analysis` were removed once a month of
transcripts showed they never ran or had been superseded. They stay in git
history. Rejected: keeping them "in case". Unused skills still cost
description tokens at every session start.

## Blocked work lives in `blocked/` folders
_2026-11-06_ (v0.34.0) - A brief or todo that waits on an outside condition
goes to `briefs/blocked/` or `todos/blocked/` with a condition line, instead of
sitting in `todo/` with a tag. Rejected: a `later` tag or a bold line under the
title (nothing reads it, and `plan-split-dispatch` puts the brief in a wave).
Existing corpora adopt the folders the first time something there is blocked,
not in one sweep.
