import { Menu } from "@base-ui/react/menu";
import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function Hint({ trigger }: { trigger: ReactNode }) {
  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {/* the Button nests inside the trigger's own button */}
          <Button>Help</Button>
        </Tooltip.Trigger>
      </Tooltip.Root>
      <Menu.Root>
        <Menu.Trigger render={(props) => <span {...props}>{trigger}</span>} />
      </Menu.Root>
    </>
  );
}
