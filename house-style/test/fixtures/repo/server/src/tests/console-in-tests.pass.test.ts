import { expect, it } from "vitest";

it("may print while it runs", () => {
  console.error("a test may print what it is doing");
  expect(1 + 1, "the sum").toBe(2);
});
