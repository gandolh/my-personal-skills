import { Menu } from "@base-ui/react/menu";
import { Popover } from "@base-ui/react/popover";
import { Tooltip } from "@base-ui/react/tooltip";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { IoClose } from "react-icons/io5";
import { MoreIcon } from "./MoreIcon";

// An icon is decoration inside the trigger's button, not a control wrapped in it.
export function Toolbar() {
  return (
    <>
      <Menu.Root>
        <Menu.Trigger aria-label="More">
          <ChevronDown aria-hidden="true" />
        </Menu.Trigger>
      </Menu.Root>
      <Popover.Root>
        <Popover.Trigger aria-label="Filters">
          <SlidersHorizontal aria-hidden="true" />
        </Popover.Trigger>
        <Popover.Trigger aria-label="Close">
          <IoClose aria-hidden="true" />
        </Popover.Trigger>
      </Popover.Root>
      <Tooltip.Root>
        <Tooltip.Trigger aria-label="Options">
          <MoreIcon />
        </Tooltip.Trigger>
      </Tooltip.Root>
    </>
  );
}
