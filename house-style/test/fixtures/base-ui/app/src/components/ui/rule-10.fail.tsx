import { Select as BaseSelect } from "@base-ui/react/select";

export function SortPicker({ value }: { value: string }) {
  return (
    <BaseSelect.Root value={value}>
      <BaseSelect.Trigger />
    </BaseSelect.Root>
  );
}
