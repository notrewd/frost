import { FC } from "react";
import { cn } from "@/lib/utils";
import NodeContextMenu, {
  NodeContextMenuContent,
  NodeContextMenuDeleteOption,
  NodeContextMenuFocusOption,
  NodeContextMenuExportOption,
  NodeContextMenuGroupOption,
  NodeContextMenuOptions,
  NodeContextMenuUngroupOption,
} from "../ui/nodes/node-context-menu";
import { ContextMenuSeparator } from "../ui/context-menu";
import NodeSelectionRing from "../ui/nodes/node-selection-ring";

export interface UseCaseNodeData extends Record<string, unknown> {
  name: string;
}

interface UseCaseNodeProps {
  id: string;
  data: UseCaseNodeData;
  selected: boolean;
}

const UseCaseNode: FC<UseCaseNodeProps> = ({ id, data, selected }) => {
  return (
    <>
      <NodeContextMenu>
        <NodeContextMenuContent>
          <div
            className={cn(
              "relative flex items-center justify-center p-4 min-w-30 min-h-15 bg-background border-2 border-foreground shadow-sm",
            )}
            style={{ borderRadius: "50%" }}
          >
            <NodeSelectionRing visible={selected} />
            <p className="text-center font-semibold text-sm wrap-break-word px-2 outline-hidden">
              {data.name || "Use Case"}
            </p>
          </div>
        </NodeContextMenuContent>
        <NodeContextMenuOptions>
          <NodeContextMenuFocusOption nodeId={id} />
          <NodeContextMenuGroupOption nodeId={id} />
          <NodeContextMenuUngroupOption nodeId={id} />
          <ContextMenuSeparator />
          <NodeContextMenuExportOption nodeId={id} />
          <ContextMenuSeparator />
          <NodeContextMenuDeleteOption nodeId={id} />
        </NodeContextMenuOptions>
      </NodeContextMenu>
    </>
  );
};

export default UseCaseNode;
