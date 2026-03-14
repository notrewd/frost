import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";
import NodeContextMenu, {
  NodeContextMenuContent,
  NodeContextMenuDeleteOption,
  NodeContextMenuFocusOption,
  NodeContextMenuExportOption,
  NodeContextMenuGroupOption,
  NodeContextMenuOptions,
  NodeContextMenuUngroupOption,
} from "../ui/nodes/node-context-menu";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { FC } from "react";
import { ContextMenuSeparator } from "../ui/context-menu";
import NodeSelectionRing from "../ui/nodes/node-selection-ring";
import NodeConnectionHandle from "../ui/nodes/node-connection-handle";
import { Archive } from "lucide-react";

interface PackageNodeData {
  name: string;
}

interface PackageNodeProps {
  id: string;
  data: PackageNodeData;
  selected: boolean;
}

const PackageNode: FC<PackageNodeProps> = ({ id, data, selected }) => {
  const { compactNodes, nodeBorderRadius } = useSettingsStore(
    useShallow((state) => ({
      compactNodes: state.compact_nodes,
      nodeBorderRadius: state.node_border_radius,
    })),
  );

  return (
    <NodeContextMenu>
      <NodeContextMenuContent>
        <Card
          className={cn(
            "flex flex-col relative px-4 size-32",
            compactNodes
              ? "gap-0.5 py-2 font-mono text-xs"
              : "gap-2 py-4 font-mono pb-6 text-lg",
          )}
          style={{
            borderRadius: `${nodeBorderRadius}px`,
          }}
        >
          <NodeSelectionRing visible={selected} />
          <NodeConnectionHandle nodeId={id} />
          <p className="size-full flex flex-col justify-center items-center text-center font-bold">
            {data.name.trim() === "" ? "Package" : data.name}
          </p>
          <div className="absolute inset-0 text-muted-foreground items-center gap-2 p-4 opacity-10">
            <Archive className="size-full" />
          </div>
        </Card>
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
  );
};

export default PackageNode;
