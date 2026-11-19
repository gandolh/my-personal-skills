---
title: house-style 1.3.0's notes count three wzd_auth routes; it is four
created: 2026-11-19
status: done
tags: [house-style, docs]
---

# house-style 1.3.0's notes count three wzd_auth routes; it is four

The 1.3.0 entry in `house-style/CHANGELOG.md` ("check-structure rule 6, a computed path", its **May fire**, and step 2 of "To move a repo from 1.2.0") says wzd_auth's `api/src/oidc/interaction.ts` fires on three GET routes. The sync on 2026-11-19 found four: `/:uid/abort` fires too (it goes through `loadInteraction`'s `uidParams.safeParse`, like the other three). wzd_auth's sync commit added four exceptions.

Fold the correction into the next house-style release's notes; not worth a release of its own.

Done 2026-11-19 by the controller: the 1.3.0 entry on main names the four routes. Vendored copies come from the `house-style-v1.3.0` tag, so the correction ships with the next tag.
