import { FC } from "react";
import { User } from "lucide-react";
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

export interface ActorNodeData extends Record<string, unknown> {
  name: string;
}

interface ActorNodeProps {
  id: string;
  data: ActorNodeData;
  selected: boolean;
}

const ActorNode: FC<ActorNodeProps> = ({ id, data, selected }) => {
  return (
    <>
      <NodeContextMenu>
        <NodeContextMenuContent>
          <div className="relative flex flex-col items-center justify-center min-w-15 gap-1 p-2 pb-6 bg-transparent text-foreground">
            <NodeSelectionRing visible={selected} />
            <User className="w-10 h-10 stroke-1" />
            <p className="text-center font-medium text-sm wrap-break-word outline-hidden max-w-30">
              {data.name || "Actor"}
            </p>
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

export default ActorNode;
