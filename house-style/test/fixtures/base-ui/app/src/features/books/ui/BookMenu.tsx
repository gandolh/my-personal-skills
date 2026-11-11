// A composite only the books feature uses may live in the feature's own ui/ folder.
import { Menu } from "@base-ui/react/menu";

export function BookMenu() {
  return (
    <Menu.Root>
      <Menu.Trigger>Actions</Menu.Trigger>
    </Menu.Root>
  );
}
