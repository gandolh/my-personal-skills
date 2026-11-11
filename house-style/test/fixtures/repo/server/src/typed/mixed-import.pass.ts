import { type Shape, work } from "./work.js";

export async function fresh(n: number): Promise<Shape> {
  return (await work(n)) > 0 ? "circle" : "square";
}
