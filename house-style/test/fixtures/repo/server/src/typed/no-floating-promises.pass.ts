import { work } from "./work.js";

export async function run(): Promise<void> {
  await work(1);
  void work(2);
}
