import { type Shape } from "./work.js";

export function echo(shape: Shape): Shape {
  return shape;
}

export let lazy: typeof import("./work.js") | undefined;
