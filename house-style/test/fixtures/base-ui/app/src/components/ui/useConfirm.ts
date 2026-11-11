export function useConfirm() {
  return async (_options: { title: string }): Promise<boolean> => true;
}
