import { Select } from "@base-ui/react/select";
import type { ComponentProps } from "react";

const labels = { newest: "Newest first", oldest: "Oldest first" };

export function SortPicker({ value }: { value: string }) {
  return (
    <Select.Root value={value} items={labels}>
      <Select.Trigger />
    </Select.Root>
  );
}

// A wrapper that spreads its props passes the caller's items through.
export function AnySelect(props: ComponentProps<typeof Select.Root>) {
  return <Select.Root {...props} />;
}
