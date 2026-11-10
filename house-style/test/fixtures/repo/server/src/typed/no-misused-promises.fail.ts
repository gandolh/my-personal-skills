import { work } from "./work.js";

export function runAll(items: number[]): void {
  items.forEach(async (n) => {
    await work(n);
  });
}
