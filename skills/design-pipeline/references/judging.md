# Judging: the pairs, the two judges, the tally

## The pairs

Run `scripts/pairs.mjs` once the sketches are in. Its inputs:

- today's main screen at 1280×800, light, as a viewport shot (not full page);
- today's main screen at 390×844, dark, as a viewport shot;
- the sketches folder, with `<L>/light-1280.png` and `<L>/dark-390.png` for
  each direction letter.

Check today's shots with `file *.png` first: a real viewport shot is 1280×800
or 390×844 at scale 1. A 2× render or a full-page shot gives the script
unequal widths (it stops) or a pair cropped at the wrong place. Use the
shots of the same route, with the same data, that the director named as the
main screen.

The plan, with two directions:

| Pair | 1280 light | 390 dark |
|---|---|---|
| T v A | p1 | p4 |
| B v T | p2 | p5 |
| A v B | p3 | p6 |

With three: T v A, B v T, T v C, B v A, A v C, C v B, then the same at 390
(p1 to p12). Today sits on the left, then the right, then the left again.
j2 gets every pair with A and B swapped.

## Dispatching the judges

Two `design-judge` agents, one on `j1/` and one on `j2/`, with the same
words. The prompt names only:

- **the product**, one paragraph: what it is, who uses it, how often, on what
  devices;
- **the screen's job**, one sentence (for example "the week view: see what's
  on this week at a glance, and add an event");
- **the pairs**: which numbers are at 1280 light and which at 390 dark, each
  `pN-A.png` and `pN-B.png`, cropped to the same height;
- **the folder**, and "open nothing else in that tree".

Never tell a judge which side is today, what the directions are called, or
who drew them. The judge has no Write tool: it returns its JSON lines and
`DONE <n> pairs`, and the controller saves them as `verdicts.md` in the
judge's folder.

## The tally

1. Map each verdict back through `KEY.json`: `j1/p1` winner `A` is the
   contestant in `A` for `j1/p1`.
2. A pair counts only when both judges name the same contestant. Note each
   pair's deciding gate (`decided_by_gate`) from both.
3. **On a split**, the controller looks at both images itself, decides, and
   writes down why in the result. It is never a tie by default. A split on a
   G1 or G3 pair usually means one judge missed something in the image: find
   it.
4. Count wins per contestant. The winner has the most wins; the runner-up is
   the best of the other directions.
5. If today wins against every direction, no direction is built. Tell the
   owner, with the judges' reasons, and ask whether to redirect.

## The result file

`judge/<app>/RESULT.md`, short:

- one line on the run (two opus judges, j2 reversed, how many verdicts agreed);
- a table of the pairs at both viewports with the winner of each;
- the wins (for example "B 4, A 2, T 0"), the winner and the runner-up by name;
- any gate a side failed, with what in the image failed it;
- **the rulings for the build**: what both judges asked of the winner
  (`improve_winner`) and what the loser did better (`loser_better_at`), turned
  into concrete instructions, plus what the winner must keep because it won
  on it.

The rulings override the directions file for the build. Write them so the
builder can act without the verdicts. For example, from the-board: "Needs you
becomes a compact queue, one row per need (kind pill with count, key, title,
reason), not a 2×2 of tall tiles"; "at 390 the first lane head must show
above the bottom bar on the viewport shot".

## What the pilot showed

- **The-board, three directions:** 24 of 24 verdicts agreed across the
  reversal. Wins B 6, C 4, A 2, today 0. One judge failed today on G3 (the
  clipped "Blocked by: Wai…" badge, a wrapped "Ready for deploy 1"). No
  proposal failed a gate. Both judges named the winner's one weakness:
  density.
- **Atrium, two directions:** 12 of 12 agreed. Wins B 4, A 2, today 0. Today
  failed G1 in every pair: its header shared the page fill, held off only by
  a hairline.

In both apps B, the boldest structural direction, won and A beat today.
That is two apps, not a rule: keep A in every run, because it is the safe
answer when B overreaches.
