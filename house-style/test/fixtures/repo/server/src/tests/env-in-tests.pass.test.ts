import { expect, it } from "vitest";

it("reads the port the test set", () => {
  process.env.PORT = "8080";
  expect(process.env.PORT, "the port").toBe("8080");
});
