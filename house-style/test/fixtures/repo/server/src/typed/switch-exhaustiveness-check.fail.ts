import type { Shape } from "./work.js";

export function corners(shape: Shape): number {
  switch (shape) {
    case "square":
      return 4;
  }
  return 0;
}
