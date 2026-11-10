import { expect, it } from "vitest";

it("adds", () => {
  expect(1 + 1, "the sum", "one argument too many").toBe(2);
});
