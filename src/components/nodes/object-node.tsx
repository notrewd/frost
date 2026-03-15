import { memo } from 'react';
import { FC, useState } from "react";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { ChevronsLeft, ChevronsRight, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ObjectNodeDialog from "../ui/dialogs/object-node-dialog";
import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";
import { ContextMenuItem, ContextMenuSeparator } from "../ui/context-menu";
import NodeContextMenu, {
  NodeContextMenuContent,
  NodeContextMenuDeleteOption,
  NodeContextMenuFocusOption,
  NodeContextMenuExportOption,
  NodeContextMenuGroupOption,
  NodeContextMenuOptions,
  NodeContextMenuUngroupOption,
} from "../ui/nodes/node-context-menu";
import NodeConnectionHandle from "../ui/nodes/node-connection-handle";
import NodeSelectionRing from "../ui/nodes/node-selection-ring";

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
  const [dialogOpen, setDialogOpen] = useState(false);

  const { coloredNodes, compactNodes, nodeBorderRadius } = useSettingsStore(
    useShallow((state) => ({
      coloredNodes: state.colored_nodes,
      compactNodes: state.compact_nodes,
      nodeBorderRadius: state.node_border_radius,
    })),
  );

  return (
    <>
      <NodeContextMenu>
        <NodeContextMenuContent>
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
            <NodeSelectionRing visible={selected} />
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
            {data.attributes && data.attributes.length > 0 && (
              <Separator className={cn(compactNodes ? "my-1" : "my-2")} />
            )}
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
            <NodeConnectionHandle nodeId={id} />
          </Card>
        </NodeContextMenuContent>
        <NodeContextMenuOptions>
          <ContextMenuItem onClick={() => setDialogOpen(true)}>
            <Edit2 className="size-4" />
            Edit Data
          </ContextMenuItem>
          <ContextMenuSeparator />
          <NodeContextMenuFocusOption nodeId={id} />
          <NodeContextMenuGroupOption nodeId={id} />
          <NodeContextMenuUngroupOption nodeId={id} />
          <ContextMenuSeparator />
          <NodeContextMenuExportOption nodeId={id} />
          <ContextMenuSeparator />
          <NodeContextMenuDeleteOption nodeId={id} />
        </NodeContextMenuOptions>
      </NodeContextMenu>
      <ObjectNodeDialog
        id={id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        data={data}
      />
    </>
  );
};

export default memo(ObjectNode);

