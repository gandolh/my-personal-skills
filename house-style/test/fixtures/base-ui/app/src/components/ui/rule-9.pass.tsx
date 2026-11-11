import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import { Tooltip } from "@base-ui/react/tooltip";
import { Button } from "./Button";

export function Hint() {
  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button />}>Help</Tooltip.Trigger>
      </Tooltip.Root>
      <Popover.Root>
        <Popover.Trigger className="rounded-sm">
          Open
        </Popover.Trigger>
        <Popover.Trigger render={(props) => <Button {...props} />} />
      </Popover.Root>
      <Select.Root items={{ apple: "Apple" }}>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
      </Select.Root>
    </>
  );
}
