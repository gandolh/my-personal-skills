import { expect, it } from "vitest";

const items = [1];

it("reads the first item", () => {
  expect(items[0]!, "the first item").toBe(1);
});
