import { afterEach, beforeEach, expect, it } from "vitest";

const store: string[] = [];

beforeEach(() => {
  store.push("seed");
  expect(store, "the seeded store").toHaveLength(1);
});

afterEach(() => {
  store.length = 0;
  expect(store, "the emptied store").toHaveLength(0);
});

it("starts from the seed", () => {
  expect(store[0], "the seed").toBe("seed");
});
