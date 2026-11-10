import { expect, it } from "vitest";

function parse(text: string): number {
  if (text === "") throw new Error("empty");
  return Number(text);
}

it("rejects an empty string", () => {
  try {
    parse("");
    expect.unreachable("parse should throw");
  } catch (error) {
    expect(error, "the error").toBeInstanceOf(Error);
  }
});
