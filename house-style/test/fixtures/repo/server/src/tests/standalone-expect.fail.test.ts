import { describe, expect, it } from "vitest";

describe("a suite", () => {
  expect(1, "an expect outside any test or hook").toBe(1);

  it("asserts", () => {
    expect(2, "two").toBe(2);
  });
});
