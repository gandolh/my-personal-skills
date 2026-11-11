import { expect, it } from "vitest";

function expectEven(value: number): void {
  expect(value % 2, "the remainder").toBe(0);
}

it("checks through a helper", () => {
  expectEven(4);
});
