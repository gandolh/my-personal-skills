import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

export function Dialog({ title, children }: { title: string; children: ReactNode }) {
  return (
    <BaseDialog.Root>
      <BaseDialog.Portal>
        <BaseDialog.Popup className="bg-surface text-ink">
          <BaseDialog.Title>{title}</BaseDialog.Title>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
