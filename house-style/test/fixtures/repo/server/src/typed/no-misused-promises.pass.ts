import { work } from "./work.js";

export function runAll(items: number[]): void {
  items.forEach((n) => {
    void work(n);
  });
}
