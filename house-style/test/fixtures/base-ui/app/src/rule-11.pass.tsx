import { useConfirm } from "./components/ui/useConfirm";

// "alert(" in a comment, or in a string, is not a call: "window.confirm(x)".
export function useRemove() {
  const confirm = useConfirm();
  return async (id: string) => {
    if (await confirm({ title: `Delete ${id}?` })) return "window.alert(gone)";
    return null;
  };
}

export const dialogs = {
  prompt(message: string): string {
    return message;
  },
};
