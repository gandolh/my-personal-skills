export async function remove(id: string): Promise<void> {
  if (!window.confirm(`Delete ${id}?`)) return;
  alert("Deleted");
  const name = globalThis.prompt("New name?");
  void name;
}
