---
summary: Whether four outside skill sources belong in the library (asked 2026-11-20) - anidoodle (code-drawn art and film), pstack's no-comments and statechart (cursor/plugins and the backnotprop mirror), and Google's Elephant-Goldfish Model (eight skills) - with each one's cost, conflicts, first use in the estate and a verdict, and the owner's answers the same day (anidoodle kept for later, no-comments vendored, statechart and EGM dropped).
updated: 2026-11-20
---

# Four skill sources, 2026-11-20

The owner asked whether these belong in the library and whether any project would use
them. The repos were cloned and read at the commits below. Nothing was installed, and the
one hands-on trial (statechart) did not run; its section says why.

| Source | Read at | Licence | Age and activity |
|---|---|---|---|
| alexgreensh/anidoodle | `4ae27d2` (2026-11-05, v0.10.1) | Apache-2.0 | Created 2026-09-22; v0.9.6, v0.10.0 and v0.10.1 came out between 2026-10-23 and 2026-10-31; about 1.9k stars, 7 open issues |
| cursor/plugins, `pstack/` | `aaeb0ea` (2026-11-19, pstack 0.15.46) | MIT | Several releases a week |
| backnotprop/pstack | `4a4f41c` (2026-11-19, synced to 0.15.44) | MIT | A community mirror of the row above, one sync behind |
| google/elephant-goldfish-model | `70406c4` (2026-11-17, v0.1.1) | Apache-2.0 | Created 2026-09-13, about 21.5k stars, 132 open issues and PRs, "not an officially supported Google product" |

The verdicts use the outcomes in [decisions.md](decisions.md): vendor pinned, adopt ideas
without copying text, or no.

| Skill | Verdict | First use in the estate |
|---|---|---|
| anidoodle | Not now; the owner's taste call | None filed |
| no-comments | No; one idea for house-style's review checks | None |
| statechart | Vendor from cursor/plugins, after a trial | imbatranimOS's terminal reattach, if the owner takes it |
| EGM, eight skills | Don't install; adopt three ideas | Brief runs: a cold read of each brief before dispatch |

**The owner's answers, the same day.** anidoodle stays out, with its own page for later:
[anidoodle.md](anidoodle.md). no-comments was vendored after all, with the agent, poteto-mode,
why and architect, in v0.66.0 ([decisions.md](decisions.md)). statechart is dropped: the owner
doesn't expect it to pay off here, and asked instead whether brief-board could show its flow
the same way (researched in brief-board's own wiki). The three EGM ideas are dropped.

## anidoodle

One skill that draws stills, drawing timelapses, films, 3D motion graphics, interactive web
pieces and drawing lessons in 32 styles, all in code. Each frame is a pure function of the
frame number and a seeded random, so a render repeats exactly. Scores are written as note
data and played by an in-code synth. The craft it carries is the strong part: a table of
tells that make art look mechanical, one approved still before anything is built, a fresh
critic after each scene, and `ship.mjs`, which checks the delivered file for text cut by the
frame edge, audio sync, peak level and seconds where nothing moves.

Cost:

- The repo is 57 MB and the skill folder 17 MB (1,310 files). The plugin copy it installs
  is 7.1 MB, about the size of Hallmark.
- Rendering needs Playwright and Chromium. Some tools need `npm install` in the engine
  folder, which in a plugin install is the plugin cache. The optional Remotion backend is
  under Remotion's own licence, not Apache-2.0; read it before using that backend.
- The network is used only on request. The sound pack (233 to 373 MB, hash-checked) asks
  first and remembers a no. Narration sends text to Gemini, OpenAI or ElevenLabs only when
  that service's key is set; local voices exist. A Figma import needs `FIGMA_TOKEN`. No
  telemetry.
- It writes outside the project: the sound pack and its "declined" flag go to a dot folder
  in the home directory. Under the vendoring rule that needs a guard, as Hallmark's
  `imagegen.mjs` has.
- It has no `disable-model-invocation`, so its description costs about 60 tokens a session.

Fit: nothing in the estate asks for drawn art. A search of the open todos and briefs in
each repo's corpus and the apps' `DESIGN.md` files for illustrations, spot art, mascots or
hand-drawn work found only closed game-engine items (a hand-drawn-feeling map, painted
backgrounds). sports-app shows no exercise images, and its licensing page already names a
public-domain source with photos if it ever wants them. readme-docs wants real captures. If
the owner wants a drawn look, the candidates are empty states and 404 pages in a redesign
(Hallmark deals photographs, not drawings), spot art on scoala-ramna or presentation-sites,
and art for game-engine's games.

Recommendation: don't add it now. If the owner names a page that should be drawn, try it
there in a scratch project first, then vendor the plugin copy, pinned, with the guard.

## no-comments (pstack)

A skill the user runs by name. It spawns "Comment Sicko", an agent that deletes every
comment except licence headers, comments about an outside rule the code can't change,
`prettier-ignore`, doc comments that define a public API, and issue links. A surprise in our
own code is fair game: the comment goes and the symbol is flagged `MUST KILL` for a rename
or a reshape. A constraint comment ("do not remove") is turned into a type, test or lint
where that is cheap, then deleted.

Conflicts:

- house-style rule 24: comments explain why in full sentences, every exported member is
  documented, and a decision carries its date. Those are the comments Comment Sicko deletes.
  The estate has thousands of them. In a sample from one app's server, a comment saying why
  a check runs before a lookup, on purpose, would be deleted and its function flagged; one
  about a library that throws when a timer fires on a closing socket would probably stay,
  as an outside rule.
- The dated temporary exceptions in code-structure and house-style read to it as "fine for
  now" excuses, which it deletes.

It can't be taken alone. It needs Comment Sicko's agent file, poteto-mode's subagent rules
(Cursor model names), the `why` and `architect` skills and two principle skills, and in
Claude Code a name-mapping adapter. The mirror bundles Comment Sicko's prompt for
harnesses without the agent and carries one community fix: a comment about an outside rule
it can't check is kept and marked `REVIEW`, and a second rejected report no longer fails
the run.

house-style already covers its overlap: rule 12 (no `@ts-ignore`; `@ts-expect-error` with a
reason), rule 13 (no TODO or FIXME) and rule 24's "no commented-out code".

Recommendation: no. One idea is worth a line in house-style's review checks, if the owner
wants it: a "do not remove" or "talk to X first" comment is a check nobody wrote. Offer the
cheapest type, test or lint that enforces it, and keep the comment only for the why.

## statechart (pstack)

The agent writes a TLA+ model of something that moves between states, plus a small view
module that names states and steps in the reader's words. A TypeScript driver runs TLC, the
TLA+ model checker, checks each rule, re-runs without each broken rule to find the next one,
and writes a Mermaid statechart (500 states at most, about 20 arrows as the aim) and a report
with the shortest path to each broken rule. The hand-off says to replay each bug path
against the real code as a test, and to assume the model is wrong if it doesn't reproduce.
From its test corpus, a media player that must never be loud while stopped:

```
## LoudWhenStopped breaks
The shortest path has 1 step:
0. Playback Stopped, Volume Normal volume
1. you turn it up: Playback Stopped, Volume Loud
```

Cost:

- It stands alone: unlike no-comments it names no other pstack skill. 4.1 MB: 31 runtime
  files on Node built-ins (its launcher wants Node 22.18+ or 23.6+, so Node 24 passes),
  plus 377 test and fixture files.
- `disable-model-invocation: true`, so nothing loads until it is called.
- It needs Java 11 or later and TLC 1.7.4. By default it runs `mise install` for Temurin 25
  and a sha-pinned `tla2tools.jar`, which writes to mise's own folders; the estate doesn't
  use mise. Setting `TLA2TOOLS` and `JAVA` skips it.
- SVG output uses the `pele` npm package, installed once outside the repo. The Mermaid text
  needs nothing.
- The real cost is modelling. The example models are 60 to 100 lines of TLA+ and a view of
  one to three lines. A model can be wrong, which is why the replay rule matters.

Which copy: cursor/plugins. Its generated Claude Code tree has the same statechart files,
byte for byte. The mirror is one sync behind: its SKILL.md lacks the Windows line, three
scripts and two tests differ, and upstream's newer `janitor.ts` and `kill.ts` are missing.
The Windows fix the mirror once carried is upstream now.

Fit, where the risk is two things happening in the wrong order:

- imbatranimOS: the terminal reattach from its 2026-11-20 Ghostty research (a 30 s grace and
  a replay, so a reload keeps its shell) is a protocol not built yet. Rules a model would
  check: a reconnect inside the grace never gets a fresh shell, no pty outlives the grace
  without a socket, and a pty has one socket at most.
- Retro-tests of built work: vps-deploy's one-deploy-at-a-time lock and its failed-deploy
  rollback (briefs 23, 25 and 26), and Shelfmark's shutdown with a lookup in flight
  (brief 10). A check and an act split by an `await` is the bug class it finds fastest.
- Not a fit: brief-board's move table has 12 rows and no concurrency, so it gets a chart but
  TLC adds nothing.

Trial: not run. The session's permission mode refused downloading a JRE and the TLC jar into
a scratch folder, and Docker was down. The trial: put a Temurin JRE and the sha-checked jar in
a scratch folder, set `JAVA` and `TLA2TOOLS`, run the bundled MediaPlayer model to prove the
toolchain, then model one built fix before and after, from the code at those commits, and see
whether the bug path comes out. It is a retro-test, since the bug is already known.

Recommendation: vendor it, pinned to cursor/plugins, once the trial gives a useful report on
an estate model. Record one guard in ATTRIBUTION.md: it never runs `mise install`; Java and
TLC come from `JAVA` and `TLA2TOOLS`.

## Elephant-Goldfish Model (EGM)

Its eight skills, their conflicts with the estate and the three ideas worth writing fresh
are on [their own page](skill-sources-egm-2026-11-20.md).

## Noticed on the way

The library's `unslop` came from cursor/plugins at `4612556` (2026-08-20) and is 80 lines.
At `aaeb0ea`, pstack has an `unslop` of 40 lines, last changed on 2026-11-16. Whether to
compare and re-pin is a separate question.

## The owner's questions

Answered the same day; see the answers under the verdict table.


1. Should anything in the estate be drawn, and which page? Recommendation: not now.
2. May the statechart trial download a JRE and the TLC jar into a scratch folder?
   Recommendation: yes, and vendor only if the retro-test report is useful.
3. Which [EGM ideas](skill-sources-egm-2026-11-20.md) become todos? Recommendation: idea 1
   (a cold read of each brief before dispatch) first, then idea 2 (a wiki drift sweep).
