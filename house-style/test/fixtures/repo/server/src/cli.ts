export function greet(): void {
  console.log(`hello from a CLI on ${process.env.HOSTNAME ?? "this machine"}`);
}
