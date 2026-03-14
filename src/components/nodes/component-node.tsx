import { FC } from "react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";
import { Component } from "lucide-react";
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
import NodeConnectionHandle from "../ui/nodes/node-connection-handle";
import NodeSelectionRing from "../ui/nodes/node-selection-ring";

export interface ComponentNodeData extends Record<string, unknown> {
  name: string;
}

interface ComponentNodeProps {
  id: string;
  data: ComponentNodeData;
  selected: boolean;
}

const ComponentNode: FC<ComponentNodeProps> = ({ id, data, selected }) => {
  const { nodeBorderRadius } = useSettingsStore(
    useShallow((state) => ({
      nodeBorderRadius: state.node_border_radius,
    })),
  );

  return (
    <>
      <NodeContextMenu>
        <NodeContextMenuContent>
          <div
            className={cn(
              "relative flex flex-col p-4 bg-background border border-border shadow-sm min-w-37.5 min-h-20",
            )}
            style={{ borderRadius: `${nodeBorderRadius}px` }}
          >
            <NodeSelectionRing visible={selected} />
            <div className="absolute top-2 right-2">
              <Component className="w-5 h-5 opacity-50" />
            </div>
            <div className="flex-1 flex items-center justify-center pt-2">
              <p className="text-center font-semibold text-sm wrap-break-word outline-hidden">
                {data.name || "Component"}
              </p>
            </div>
            <NodeConnectionHandle nodeId={id} />
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

export default ComponentNode;
