export async function answer(): Promise<number> {
  const n = await Promise.resolve(42);
  return n;
}
