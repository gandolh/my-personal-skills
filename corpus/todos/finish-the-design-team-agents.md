---
title: Finish the design team agents after the pipeline pilot
created: 2026-11-12
status: promoted
---

# Finish the design team agents after the pipeline pilot

v0.45.0 added four draft agents: `design-director`, `design-sketcher`, `design-judge` and `design-critic`. They were written during the estate redesign board (brief 28), before the first app went through the whole pipeline (director → three sketches → two reversed judges → full build → critic → fix). Once the pilot (the brief-board app) is done:

- **Fold in the prompt changes the pilot needed.** The estate build keeps its working copies beside its other build notes.
- **Drop "DRAFT" from the four descriptions.**
- **Add a skill that runs the pipeline:**
  - the order and the hand-offs;
  - the judge's two reversed runs, with today as a contestant;
  - the calibration case;
  - the token cost per app the pilot measured;
  - when to use 2 directions instead of 3.
- **Bump the plugin version,** and say in `docs/history.md` what changed from the drafts.

Promoted to [brief 30](../briefs/todo/30-finish-the-design-team-and-a-design-pipeline-skill.md) on 2026-11-12.
