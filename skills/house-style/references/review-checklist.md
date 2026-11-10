# House-style review checklist

What a reviewer checks by reading, because lint can't. These are the house
style's rules 20-25 (SKILL.md) and the comment rules of brief 27's
decision 5. `plan-split-dispatch`'s review gate points its finders here.

**Skip style the tools enforce.** Formatting, quotes, `any`, `!`, enums,
`TODO`s, `console`, default exports, unawaited promises and every other rule
1-19 are the linter's and the formatter's. A finding about them is noise. A
reviewer asked to find problems will always find something; report only what
a reader would want changed, each with its file, line and reason.

## Comments

- [ ] **Why, not what.** A comment says why the code is shaped this way: the
      constraint, the trade-off, the bug it avoids. A comment that restates the
      next line goes.
- [ ] **Full sentences**, capitalised and punctuated, in the repo's voice.
- [ ] **Every exported member is documented**: each exported function, type,
      interface member and constant has a JSDoc block saying what it is for.
      Almanac (848 blocks) and Shelfmark (1,250) are the model.
- [ ] **A decision carries its date**, and the reason or the brief behind it:
      "Kept on the device, not the server (2026-11-10): a theme is per screen."
- [ ] **No commented-out code.** Git has the history.
- [ ] **No brief numbers in code comments** ("brief 05"). Say what the code
      does and why; the history belongs in the corpus log.

## Shapes

- [ ] **Factories, not classes.** A store or service is a function that takes
      its dependencies and returns a documented `interface`:
      `createCalendarStore(db): CalendarStore`. Classes are for `Error`
      subclasses. A new class needs a reason a factory can't meet.
- [ ] **The interface is the contract.** Callers and tests depend on the
      interface, never on the factory's internals; a test's fake is a plain
      object that satisfies it.
- [ ] **`interface` for object shapes, `type` for unions** and mapped or
      computed types.
- [ ] **A component's file is PascalCase** (`QueueView.tsx`); every other
      module is lowercase or kebab-case.
- [ ] **Named exports.** A new default export is a framework's or a runtime
      contract's, and the lint config's `defaultExports` glob names it.

## Tests

- [ ] **Beside the source**, as `name.test.ts`, on the repo's runner (vitest;
      atrium uses `node:test` under `test/`).
- [ ] **The test proves the behaviour**, not the implementation: it asserts on
      what a caller sees (a return value, a response body, rendered text), not
      on private state or class names.
- [ ] A test that only passes against a built sibling package has a `pretest`
      that builds it.

## Dependencies

- [ ] **Exact pins.** A new dependency is pinned exactly (`.npmrc` has
      `save-exact=true`), and a new devDependency for the harness matches the
      version the house-style README lists.
- [ ] Nothing imports from `vendor/house-style/` except the root configs and
      `package.json`'s scripts, and nothing in it was edited by hand
      (`npm run house-style:sync -- --check`).
