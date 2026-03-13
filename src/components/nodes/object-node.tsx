import { FC, useCallback, useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import {
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Focus,
  FolderPlus,
  Spline,
  Trash2,
  Ungroup,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ObjectNodeDialog from "../ui/dialogs/object-node-dialog";
import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";
import { Handle, Position, useConnection } from "@xyflow/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import useFlowStore from "@/stores/flow-store";

export interface ObjectNodeProperty {
  id: string;
  name: string;
  type?: string;
  static?: boolean;
  defaultValue?: string;
}

export interface ObjectNodeAttribute extends ObjectNodeProperty {
  accessModifier: "public" | "private" | "protected";
  stereotype?: string;
}

export interface ObjectNodeMethod {
  id: string;
  name: string;
  accessModifier: "public" | "private" | "protected";
  abstract?: boolean;
  static?: boolean;
  returnType: string;
  parameters: ObjectNodeProperty[];
}

export interface ObjectNodeData extends Record<string, unknown> {
  name: string;
  stereotype?: string;
  attributes?: ObjectNodeAttribute[];
  methods?: ObjectNodeMethod[];
  abstract?: boolean;
  note?: string;
}

interface ObjectNodeProps {
  id: string;
  data: ObjectNodeData;
  selected: boolean;
}

const ObjectNode: FC<ObjectNodeProps> = ({ id, data, selected }) => {
  const connection = useConnection();

  const isTarget = useMemo(
    () => connection.inProgress && connection.fromNode.id !== id,
    [connection, id],
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const { nodes, setNodes, instance } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
      instance: state.instance,
    })),
  );

  const { coloredNodes, compactNodes, nodeBorderRadius } = useSettingsStore(
    useShallow((state) => ({
      coloredNodes: state.colored_nodes,
      compactNodes: state.compact_nodes,
      nodeBorderRadius: state.node_border_radius,
    })),
  );

  const handleFocus = useCallback(() => {
    instance?.fitView({
      nodes: nodes
        .filter((node) => node.selected || node.id === id)
        .map((node) => ({ id: node.id })),
    });
  }, [instance, id, nodes]);

  const handleDelete = useCallback(() => {
    const nodesToDelete = nodes
      .filter((node) => node.selected || node.id === id)
      .map((node) => node.id);
    setNodes((nodes) =>
      nodes.filter((node) => !nodesToDelete.includes(node.id)),
    );
  }, [setNodes, id, nodes]);

  const handleGroup = useCallback(() => {
    const selectedNodes = nodes.filter(
      (node) => node.selected || node.id === id,
    );
    if (selectedNodes.length === 0) return;

    const parentIds = [...new Set(selectedNodes.map((n) => n.parentId))];
    const commonParentId = parentIds.length === 1 ? parentIds[0] : undefined;

    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(
      ...selectedNodes.map((n) => n.position.x + (n.measured?.width || 200)),
    );
    const maxY = Math.max(
      ...selectedNodes.map((n) => n.position.y + (n.measured?.height || 200)),
    );

    const padding = 40;
    const groupX = minX - padding;
    const groupY = minY - padding;
    const groupWidth = maxX - minX + padding * 2;
    const groupHeight = maxY - minY + padding * 2;

    const groupId = `group-${Date.now()}`;
    const newGroup = {
      id: groupId,
      type: "group",
      position: { x: groupX, y: groupY },
      style: {
        width: groupWidth,
        height: groupHeight,
        border: "none",
        background: "transparent",
      },
      zIndex: -1,
      data: { name: "New Group" },
      ...(commonParentId ? { parentId: commonParentId } : {}),
    };

    setNodes((currentNodes) => {
      const selectedIds = selectedNodes.map((n) => n.id);
      const minIndex = currentNodes.findIndex((n) => selectedIds.includes(n.id));
      const updatedNodes = currentNodes.map((node) => {
        if (selectedIds.includes(node.id)) {
          return {
            ...node,
            parentId: groupId,
            position: {
              x: node.position.x - groupX,
              y: node.position.y - groupY,
            },
            selected: false,
          };
        }
        return node;
      });
      const finalNodes = [...updatedNodes];
      finalNodes.splice(minIndex !== -1 ? minIndex : 0, 0, { ...newGroup, selected: true } as any);
      return finalNodes;
    });
  }, [nodes, setNodes, id]);

  const handleUngroup = useCallback(() => {
    // If part of a group, remove just these from the group
    const targetNodes = nodes.filter((node) => node.selected || node.id === id);
    const nodesToUngroup = targetNodes.filter((n) => n.parentId);
    if (nodesToUngroup.length === 0) return;

    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        if (nodesToUngroup.find((n) => n.id === node.id)) {
          const parent = currentNodes.find((p) => p.id === node.parentId);
          return {
            ...node,
            parentId: parent?.parentId,
            position: {
              x: (parent?.position.x || 0) + node.position.x,
              y: (parent?.position.y || 0) + node.position.y,
            },
          };
        }
        return node;
      });
    });
  }, [nodes, setNodes, id]);

  const showUngroup = nodes.some(
    (n) => (n.selected || n.id === id) && n.parentId,
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            className={cn(
              "flex flex-col relative",
              compactNodes
                ? "gap-0.5 py-2 font-mono text-xs"
                : "gap-2 py-4 font-mono pb-6",
            )}
            style={{
              borderRadius: `${nodeBorderRadius}px`,
            }}
            onDoubleClick={() => setDialogOpen(true)}
          >
            {selected && (
              <div className="absolute inset-0 ring rounded-md react-flow__ring" />
            )}

            {data.stereotype && (
              <div
                className={cn(
                  "px-4 w-full flex items-center justify-center text-muted-foreground",
                  compactNodes ? "text-[10px]" : "text-sm",
                )}
              >
                <ChevronsLeft
                  className={cn(compactNodes ? "size-3" : "size-4")}
                />
                <span>{data.stereotype}</span>
                <ChevronsRight
                  className={cn(compactNodes ? "size-3" : "size-4")}
                />
              </div>
            )}
            <p
              className={cn(
                "px-4 w-full text-center font-semibold",
                compactNodes ? "text-sm" : "text-base",
              )}
            >
              {data.name}
            </p>
            <Separator className={cn(compactNodes ? "my-1" : "my-2")} />
            {data.attributes?.map((attr, index) => (
              <p key={index} className="px-4">
                <span
                  className={cn(
                    coloredNodes && "text-green-600 dark:text-green-400",
                  )}
                >
                  {attr.accessModifier === "public"
                    ? "+"
                    : attr.accessModifier === "private"
                      ? "-"
                      : "#"}{" "}
                </span>
                <span
                  className={cn({
                    underline: attr.static,
                  })}
                >
                  {attr.name}
                  {attr.type && (
                    <>
                      <span
                        className={cn(
                          coloredNodes && "text-red-600 dark:text-red-400",
                        )}
                      >
                        :
                      </span>{" "}
                      <span
                        className={cn(
                          coloredNodes && "text-blue-600 dark:text-blue-400",
                        )}
                      >
                        {attr.type}
                      </span>
                    </>
                  )}
                  {attr.defaultValue && (
                    <>
                      {" = "}
                      <span
                        className={cn(
                          coloredNodes &&
                            "text-purple-600 dark:text-purple-400",
                        )}
                      >
                        {attr.defaultValue}
                      </span>
                    </>
                  )}
                </span>
              </p>
            ))}
            {data.methods && data.methods.length > 0 && (
              <Separator className={cn(compactNodes ? "my-1" : "my-2")} />
            )}
            {data.methods?.map((method, index) => (
              <p key={index} className="px-4">
                <span
                  className={cn(
                    coloredNodes && "text-green-600 dark:text-green-400",
                  )}
                >
                  {method.accessModifier === "public"
                    ? "+"
                    : method.accessModifier === "private"
                      ? "-"
                      : "#"}{" "}
                </span>
                <span
                  className={cn({
                    underline: method.static,
                    italic: method.abstract,
                  })}
                >
                  {method.name}(
                  {method.parameters.map((param, index) => (
                    <>
                      <span
                        className={cn(
                          coloredNodes &&
                            "text-orange-600 dark:text-orange-400",
                        )}
                      >
                        {param.name}
                      </span>
                      <span
                        className={cn(
                          coloredNodes && "text-red-600 dark:text-red-400",
                        )}
                      >
                        :
                      </span>{" "}
                      <span
                        className={cn(
                          coloredNodes && "text-blue-600 dark:text-blue-400",
                        )}
                      >
                        {param.type}
                      </span>
                      {param.defaultValue && (
                        <>
                          {" = "}
                          <span
                            className={cn(
                              coloredNodes &&
                                "text-purple-600 dark:text-purple-400",
                            )}
                          >
                            {param.defaultValue}
                          </span>
                        </>
                      )}
                      {index < method.parameters.length - 1 ? ", " : ""}
                    </>
                  ))}
                  )
                  <span
                    className={cn(
                      coloredNodes && "text-red-600 dark:text-red-400",
                    )}
                  >
                    :
                  </span>{" "}
                  <span
                    className={cn(
                      coloredNodes && "text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {method.returnType}
                  </span>
                </span>
              </p>
            ))}
            {!data.attributes?.length && !data.methods?.length && (
              <p className="px-4 italic text-muted-foreground">
                No attributes or methods
              </p>
            )}
            {!connection.inProgress && (
              <Handle
                type="source"
                position={Position.Right}
                style={{
                  position: "absolute",
                  top: "unset",
                  right: "1em",
                  bottom: "0",
                  background: "none",
                  border: "none",
                  width: "1em",
                  height: "1em",
                }}
              >
                <div className="rounded-md bg-muted size-8 flex flex-col items-center justify-center">
                  <Spline className="size-4 text-foreground" />
                </div>
              </Handle>
            )}
            {(!connection.inProgress || isTarget) && (
              <Handle
                type="target"
                position={Position.Left}
                isConnectableStart={false}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: "0",
                  left: "0",
                  background: "none",
                  border: "none",
                  zIndex: "50",
                  transform: "none",
                }}
              />
            )}
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setDialogOpen(true)}>
            <Edit2 className="size-4" />
            Edit Data
          </ContextMenuItem>
          <ContextMenuItem onClick={handleFocus}>
            <Focus className="size-4" />
            Focus
          </ContextMenuItem>
          <ContextMenuItem onClick={handleGroup}>
            <FolderPlus className="size-4" />
            Group
          </ContextMenuItem>
          {showUngroup && (
            <ContextMenuItem onClick={handleUngroup}>
              <Ungroup className="size-4" />
              Ungroup (from parent)
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <ObjectNodeDialog
        id={id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
      />
    </>
  );
};

export default ObjectNode;
