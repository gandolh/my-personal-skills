---
summary: What anidoodle is (alexgreensh/anidoodle, Apache-2.0, read at 4ae27d2, v0.10.1), how its engine and method work, what adopting it would cost, the steps to bring it in when a project needs drawn art or animation, and whether it can serve game-engine's animation engine (not at run time; possibly as a third contestant in game-engine's brief 13 sprite trial for animated frames, plus two edge rules brief 11 lacks). Not in the library as of 2026-11-20.
updated: 2026-11-20
---

# anidoodle

**Status:** not in the library. On 2026-11-20 the owner agreed it has no use yet and asked
for this page, so a new project or feature can start from it. The review of four skill
sources it came from is [skill-sources-2026-11-20.md](skill-sources-2026-11-20.md).

## What it is

One skill by one author ([alexgreensh/anidoodle](https://github.com/alexgreensh/anidoodle),
Apache-2.0, created 2026-09-22), read at `4ae27d2` (2026-11-05, v0.10.1). It makes, entirely
in code:

- **Stills:** hero art, spot art, empty states, 404 pages, cards, a series from one program.
- **Drawing films:** the picture drawn in the order an artist in that medium works, ending on
  the still, pixel for pixel.
- **Loops and stickers,** story films of any length, explainers, and "machines" that come apart
  to explain an idea.
- **Interactive web pieces:** one ES module and an `<ani-doodle>` element, such as a mascot that
  follows the cursor or a form companion that covers its eyes at the password field, with
  reduced-motion and keyboard paths.
- **Drawing lessons:** a step sheet and a captioned timelapse.
- **Launch films** for a product, 3D motion graphics through three.js, and narration with
  word-timed subtitles.

It has 32 styles, each a way of making marks rather than a palette: pencil and watercolour,
risograph, woodcut, sumi-e, pixel art, toy brick and more. Each has a recipe in
`references/styles/` and a plate in the engine. Every format comes from one source: PNG, MP4
with its score, GIF, WebM and APNG with transparency, and a self-contained HTML player.

## How it works

- **The contract.** A frame is a pure function of `(frame, env)`, with randomness only from
  `rng(seed)` and no clock. A still is that function called once, a loop is the function over a
  period, a film adds a story and a score. `gate.mjs` renders twice and compares hashes, scans
  the film's code for clocks and network calls, and fails a stretch where nothing moves.
- **The engine.** `engine/src/canvas-core` is the art core and knows nothing of the DOM;
  `three-core` draws three.js onto the same frame. Four backends render it: headless Chromium
  through Playwright (the default), an offline HTML player, Remotion and Hyperframes. The tools
  are in `engine/tools`: `scaffold`, `still`, `render`, `gate`, `emit`, `ship`, `music`,
  `narrate`, `launch` and more.
- **Music.** Scores are note data written in one of 21 style vocabularies and played by an
  in-code synth. `music.mjs check` gates key, loudness, masking, balance and novelty. An optional
  sound pack adds recorded instruments (CC0, and rooms under CC BY 4.0).
- **The method.** Ask one question at a time, prove the look on one still, then build the whole
  piece. A fresh critic, a subagent that saw none of the building, reviews it. There are three
  approval gates at most, and `ship.mjs` runs every check on the delivered file: text cut by the
  frame, audio sync, peak level, facts on screen.
- **Characters.** A 3D skeleton whose joint limits come from orthopaedic tables, so an
  impossible pose fails at load. Proportions are declared rows: a realistic canon by age, or a
  named stylised row. A walk is solved from footsteps with analytic IK, so a planted foot never
  slides. "Hands" redraw the same character as pencil, marker, riso, brick or pixel art, and
  each hand has an identity check (the pixel one compares silhouettes).

## What adopting it costs

- **Size:** the repo is 57 MB and the skill folder 17 MB. The plugin copy it installs
  (`plugins/anidoodle/`) is 7.1 MB, about Hallmark's size.
- **Tools:** rendering needs Playwright and Chromium. Some tools need `npm install` in the
  engine folder, which in a plugin install is the plugin cache.
- **Network, only on request:** the sound pack (233 to 373 MB, hash-checked) asks first and
  remembers a no. Narration sends text to Gemini, OpenAI or ElevenLabs only when that service's
  key is set; local voices exist. A Figma import needs `FIGMA_TOKEN`. No telemetry.
- **Outside the project:** the sound pack and its "declined" flag go to a dot folder in the home
  directory.
- **Licences:** Apache-2.0 for the skill, so a vendored copy keeps its `LICENSE` and `NOTICE`.
  The optional Remotion backend is under Remotion's own licence; read it before using that
  backend.
- **Session cost:** no `disable-model-invocation`, so its description costs about 60 tokens a
  session.

## Bringing it in when a need appears

1. Name the page or feature, the output (a still, a loop, a film, an interactive piece) and the
   style.
2. Try it outside the library first: `scaffold.mjs` a scratch project, render one still at
   `--scale 2`, run `gate.mjs`, and judge it on the page it is for. Hallmark's Floor still
   governs the page around the art.
3. If it earns a place, vendor the plugin copy, pinned and verbatim, under
   [decisions.md](decisions.md). Record the guards in `ATTRIBUTION.md`: the sound pack only on
   the owner's yes, no narration key or Figma token set by an agent, and the Remotion backend
   only after its licence is read. A local `disable-model-invocation: true` line, as the taste
   presets have, would keep it to calls by name.
4. Commit the piece's source next to the rendered files, so it can be drawn again.

Uses it could serve, none filed: empty-state and 404 art in an app redesign (Hallmark deals
photographs, not drawings); spot art on scoala-ramna or presentation-sites; a mascot or form
companion on a web app; a drawing lesson. It is the wrong tool for README captures, which
readme-docs wants real, and for sports-app's exercises, where the public-domain photo set its
licensing page names is the cheaper source.

## Could it serve game-engine's animation engine?

What the engine is (game-engine's wiki and corpus, read 2026-11-20): `@engine/core/animation`
holds a stateless `AnimationClip` (frames with durations, `sampleAt`), easing curves and frame
events, sampled on the render side by the wall clock. Sprites are code too: each is a
`PixelRecipe`, an ASCII grid in the game's palette, baked into an atlas. A walk is a four-phase
stride built from three frames per facing, and an action is an `-a`/`-b` pair. On 2026-06-12
the engine turned down a part-based skeletal rig at run time, since rotating parts breaks the
pixel grid, and the 24×24 action-pose pass closed as won't-do until a fresh brief reopens it.
On 2026-11-20 game-engine planned its asset work: brief 11 (recipe checks as tests), brief 13
(a blind trial of sprite-gen's `pixel-draw` against recipes an agent writes, with a `grid.txt`
importer), and two todos, animation tags in the atlas manifest and a recipe-to-PNG round trip.

- **As the run-time engine: no.** anidoodle draws every frame from scratch through Canvas 2D,
  at film size, with no atlas, no WebGL and no state per entity. The game draws atlas sprites in
  WebGL2 and samples a clip per entity. Swapping one for the other gains nothing and would not
  fit the frame budget.
- **As an offline drafter of animated frames: possible, untested.** Its edge over sprite-gen
  and over an agent writing recipes is motion: one figure posed across frames, walk poses timed
  from footsteps (contact, down, passing, up), action swings with every joint in range, and an
  identity check per frame. Its pixel hand turns each pose into whole cells with a two-step ramp
  per part, an outline, and eyes stamped as single pixels. The glue now has a home: draw with
  ramps from the game's palette, export PNGs, and read them in through the round-trip todo's
  `recipe-import` (or brief 13's `grid.txt` importer from a cell grid), which refuses
  off-palette colours. Its walk plan would also fill the animation-tags todo's frame list and
  durations. The output is static frames, so the run-time decision stands, and at 16 to 32
  pixels a hand pass still decides the result.
- **Where it would slot in:** as a third contestant in brief 13's blind trial, for animated
  characters only (a walk and one action for one figure), since a single still is what
  sprite-gen and agents already draw. That needs the trial reopened with a subject that moves.
- **Ideas to take without it.** Brief 11 already plans lone-pixel, floor-row and safe-area
  checks. anidoodle's pixel kit adds two edge rules that brief 11 lacks: no doubled corners, and
  even staircase runs along a curve (1-1-2-2-3, never 2-1-3). It also suggests a real "down"
  pose, the walk's lowest point just after contact, which today's stride lacks: it reuses the
  neutral frame for passing and has no down or up.

Elsewhere in the estate, "animation engine" also names newspapper's anime.js, which runs its UI
moments. anidoodle doesn't replace that: its web pieces are drawn illustrations that react to
input, not a library for animating an interface.
