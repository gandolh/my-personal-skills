# The hand-offs, step by step

Each step names what the controller gives the agent and what it checks
before the next step starts. Paths are relative to one working folder for
the redesign run (the estate keeps its own beside its build notes). Keep it
outside every repo.

```
<run>/
  registry.md               faces, accents and skeletons each app holds
  directions/<app>.md
  sketches/<app>/<L>/       one per direction
  judge/<app>/{j1,j2}/      pairs, verdicts.md
  judge/<app>/KEY.json  RESULT.md
  critiques/<app>.md  <app>-controller.md
```

## 1. Directions (`design-director`)

Give it: the app's repository, its redesign brief, today's shots with what
each shows, the house rules for redesigns, the registry, the path to write,
and "two directions" (or three, when the owner asked).

Check before sketching:
- today's strengths are specific (what is grouped, raised, easy to find, how
  much fits on the first screen), not praise;
- A keeps today's skeleton, and B's skeleton differs from A's;
- the fixture is word for word from today's shot, with the same counts;
- no accent family or display face another app holds;
- a direction that reopens a recorded decision says so. Those go to the owner
  as questions on the board page; they don't block the sketches.

## 2. Sketches (`design-sketcher`, one per direction)

Give it: the directions file, its letter, today's shots, the house rules for
tokens, theming, fonts and icons, and its folder `sketches/<app>/<L>/`.

Check: `light-1280.png` is 1280×800 and `dark-390.png` is 390×844
(`file *.png`), the Floor numbers in its report are green, and nothing in
the images names the option. Look at both renders beside today's yourself.

## 3. Pairs and 4. judges

See [judging.md](judging.md).

## 5. Tally and rulings

The controller writes `RESULT.md` with the rulings for the build. This is
where density is decided: the pilot's winner was the boldest structure, and
both judges named the same weakness, too little on the first screen. Write
the first-screen target as a ruling ("the first lane head shows above the
bottom bar at 390").

## 6. The winner's full build

A sonnet builder with the hallmark skill (`/hallmark redesign`) and the
project's rules for redesign proposals. Give it:
- the directions file (the fixture, today's strengths, the winning direction);
- `RESULT.md`, saying its rulings override the directions file;
- the winning sketch folder, saying "start from it: keep its type, palette
  and character, and apply the rulings";
- the screens to draw (the main screen plus two that carry the design), with
  today's shots of each;
- any decisions the build reopens, as questions for the owner.

The build draws each screen at 1280, 1024, 768, 390 and 360 in both themes,
with HTML twins the critic can render. The pilot's build took ~244k tokens
before the critic and ~308k with two fix rounds.

## 7. Critique (`design-critic`)

Give it: today's shots at both widths, the build's renders and twins, the
manifest, `RESULT.md` (who won and on what), the app's recorded decisions,
and `critiques/<app>.md` to write.

The pilot's critic found what the gates missed: at 1280 the build showed one
lane above the fold where today showed three. The critic now counts the first
desktop and phone screen against today before anything else.

## 8. Rulings over the critic

The controller reads the critic's file against `RESULT.md` and writes
`critiques/<app>-controller.md`: "take every finding except where these
override it", then the overrides, then the controller's own notes. Override
any fix that would bring back what lost the judging or take away what won
it. The pilot's rulings:

1. **Never truncate text.** The critic proposed an ellipsis on the queue's
   reasons and a 2-line clamp on the blocked reason to buy height. Today had
   lost on G3 for exactly that. Rule: wrap, no ellipsis, no clamp; buy the
   height back with 13/18 type and tighter padding.
2. **The phone keeps the winning feature.** The critic proposed hiding the
   reasons on the phone. The judges had picked the winner on the phone for
   them. Rule: keep them, on a third line in a smaller muted type, rows
   tighter, show four then "Show all N".
3. Everything else stands as the critic wrote it.

## 9. Fix rounds

Resume the same builder with both files. Before a round that changes what
the owner has already seen, archive the shown version beside it so the
board keeps round 1 next to round 2; a round nobody saw needs no archive.
The pilot needed two rounds: the critic's fixes, then small ones (dark wells,
gaps between islands, a callout).

## 10. The controller's look

Before publishing, put today and the build side by side at the judged
viewports (1280 light, 390 dark) and ask the critic's question once more:
what did today do better? Check the first-screen target from the rulings on
the viewport shots, not the full-page ones.

## 11. Publish

Publish the winner where the owner reviews redesigns, with:
- the runner-up's sketch in a row of its own under the winner (its 1280
  light and 390 dark renders), with a note on how it placed: the tally, and
  the judges' one-line reason;
- the questions for the owner (decisions the winner reopens) as an ask;
- a line in the registry for the winner's faces, accent and skeleton.

Then the owner approves, sends back, or picks the runner-up. The app's
redesign brief is built only after that.
