// A CLI may print, but it reads its settings through config.ts like the rest of the app.
export function greet(): void {
  console.log(`hello from a CLI on ${process.env.HOSTNAME ?? "this machine"}`);
}
