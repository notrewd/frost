import { FC, useState, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "@/stores/flow-store";
import { FlowState } from "@/stores/types";
import PropertiesEmptyView from "../views/properties-empty-view";
import { Input } from "../ui/input";
import { NumberInput } from "../ui/number-input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ObjectNodeDialog from "../ui/dialogs/object-node-dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Edit2,
  ArrowRight,
  ArrowRightLeft,
  ChevronDown,
  Box,
  Hash,
} from "lucide-react";
import { ObjectNodeData } from "@/components/nodes/object-node";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { cn } from "@/lib/utils";

const Section = ({
  title,
  children,
  icon: Icon,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  icon?: any;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col border-b last:border-0 border-border/50"
    >
      <CollapsibleTrigger className="flex items-center justify-between px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors w-full cursor-pointer outline-none">
        <div className="flex items-center">
          {Icon && <Icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            !open && "-rotate-90",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col pb-2 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const PropRow = ({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <div
    className={cn(
      "flex items-center justify-between px-3 py-1.5 focus-within:bg-muted/5 transition-colors",
      disabled && "opacity-50 pointer-events-none",
    )}
  >
    <span className="text-xs text-muted-foreground w-1/3 truncate font-medium">
      {label}
    </span>
    <div className="w-2/3 flex items-center justify-end gap-2">{children}</div>
  </div>
);

const PropertiesPanel: FC = () => {
  const { nodes, edges, setNodes, setEdges } = useFlowStore(
    useShallow((state: FlowState) => ({
      nodes: state.nodes,
      edges: state.edges,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [selectedNodeForDialog, setSelectedNodeForDialog] = useState<
    string | null
  >(null);

  const selectedNodes = nodes.filter((node) => node.selected);
  const selectedEdges = edges.filter((edge) => edge.selected);

  const bulkNodeX = useMemo(() => {
    if (selectedNodes.length === 0) return "";
    const firstX = Math.round(selectedNodes[0].position.x);
    return selectedNodes.every((n) => Math.round(n.position.x) === firstX)
      ? firstX.toString()
      : "";
  }, [selectedNodes]);

  const bulkNodeY = useMemo(() => {
    if (selectedNodes.length === 0) return "";
    const firstY = Math.round(selectedNodes[0].position.y);
    return selectedNodes.every((n) => Math.round(n.position.y) === firstY)
      ? firstY.toString()
      : "";
  }, [selectedNodes]);

  const bulkEdgeType = useMemo(() => {
    if (selectedEdges.length === 0) return "";
    const firstType = selectedEdges[0].type;
    return selectedEdges.every((e) => e.type === firstType)
      ? firstType || "generalization"
      : "";
  }, [selectedEdges]);

  const bulkEdgeLabel = useMemo(() => {
    if (selectedEdges.length === 0) return "";
    const firstLabel = selectedEdges[0].data?.label as string;
    return selectedEdges.every((e) => (e.data?.label as string) === firstLabel)
      ? firstLabel || ""
      : "";
  }, [selectedEdges]);

  const bulkSourceCardinality = useMemo(() => {
    if (selectedEdges.length === 0) return "";
    const firstSourceCard = selectedEdges[0].data?.sourceCardinality as string;
    return selectedEdges.every(
      (e) => (e.data?.sourceCardinality as string) === firstSourceCard,
    )
      ? firstSourceCard || ""
      : "";
  }, [selectedEdges]);

  const bulkTargetCardinality = useMemo(() => {
    if (selectedEdges.length === 0) return "";
    const firstTargetCard = selectedEdges[0].data?.targetCardinality as string;
    return selectedEdges.every(
      (e) => (e.data?.targetCardinality as string) === firstTargetCard,
    )
      ? firstTargetCard || ""
      : "";
  }, [selectedEdges]);

  if (selectedNodes.length === 0 && selectedEdges.length === 0) {
    return <PropertiesEmptyView />;
  }

  const handleNodeEditClick = (nodeId: string) => {
    setSelectedNodeForDialog(nodeId);
    setNodeDialogOpen(true);
  };

  const handleBulkNodePositionChange = (axis: "x" | "y", value: string) => {
    if (value.trim() === "") return;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.selected
          ? {
              ...node,
              position: {
                ...node.position,
                [axis]: numValue,
              },
            }
          : node,
      ),
    );
  };

  const handleBulkEdgeTypeChange = (newType: string) => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.selected ? { ...edge, type: newType } : edge,
      ),
    );
  };

  const handleBulkEdgeLabelChange = (label: string) => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.selected
          ? {
              ...edge,
              data: {
                ...edge.data,
                label,
              },
            }
          : edge,
      ),
    );
  };

  const handleBulkEdgeCardinalityChange = (
    key: "sourceCardinality" | "targetCardinality",
    value: string,
  ) => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.selected
          ? {
              ...edge,
              data: {
                ...edge.data,
                [key]: value,
              },
            }
          : edge,
      ),
    );
  };

  const handleReverseEdges = () => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.selected
          ? {
              ...edge,
              source: edge.target,
              target: edge.source,
              sourceHandle: edge.targetHandle,
              targetHandle: edge.sourceHandle,
              data: {
                ...edge.data,
                sourceCardinality: edge.data?.targetCardinality,
                targetCardinality: edge.data?.sourceCardinality,
              },
            }
          : edge,
      ),
    );
  };

  const getSelectedNodeForDialog = () => {
    if (!selectedNodeForDialog) return null;
    return nodes.find((node) => node.id === selectedNodeForDialog);
  };

  const selectedNodeDialog = getSelectedNodeForDialog();

  return (
    <>
      <ScrollArea className="h-full">
        <div className="flex flex-col pb-6">
          {selectedNodes.length > 0 && (
            <Section
              title={`Node Properties (${selectedNodes.length})`}
              icon={Box}
            >
              <div className="px-3 py-2 mb-1 flex items-center justify-between">
                <span className="font-mono text-sm truncate max-w-[120px]">
                  {selectedNodes.length === 1
                    ? (selectedNodes[0].data.name as string)
                    : "Multiple selected"}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={selectedNodes.length > 1}
                  onClick={() =>
                    selectedNodes.length === 1 &&
                    handleNodeEditClick(selectedNodes[0].id)
                  }
                >
                  <Edit2 className="size-3 mr-1.5" />
                  Edit Data
                </Button>
              </div>
              <PropRow label="Position X">
                <NumberInput
                  value={bulkNodeX}
                  placeholder={bulkNodeX === "" ? "Mixed" : ""}
                  onChange={(val) => handleBulkNodePositionChange("x", val)}
                  variant="small"
                  step={10}
                />
              </PropRow>
              <PropRow label="Position Y">
                <NumberInput
                  value={bulkNodeY}
                  placeholder={bulkNodeY === "" ? "Mixed" : ""}
                  onChange={(val) => handleBulkNodePositionChange("y", val)}
                  variant="small"
                  step={10}
                />
              </PropRow>
            </Section>
          )}

          {selectedEdges.length > 0 && (
            <Section
              title={`Edge Properties (${selectedEdges.length})`}
              icon={ArrowRight}
            >
              <div className="px-3 py-2 mb-1 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Connection
                  </p>
                  <p className="font-mono text-xs mt-0.5 opacity-80 truncate max-w-[150px]">
                    {selectedEdges.length === 1
                      ? `${selectedEdges[0].source} -> ${selectedEdges[0].target}`
                      : "Multiple selected"}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleReverseEdges}
                  title="Reverse Connection"
                >
                  <ArrowRightLeft className="size-3.5" />
                </Button>
              </div>
              <PropRow label="Type">
                <Select
                  value={bulkEdgeType}
                  onValueChange={handleBulkEdgeTypeChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Mixed types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generalization">
                      Generalization
                    </SelectItem>
                    <SelectItem value="association">Association</SelectItem>
                    <SelectItem value="composition">Composition</SelectItem>
                    <SelectItem value="implementation">
                      Implementation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </PropRow>
              <PropRow label="Label">
                <Input
                  value={bulkEdgeLabel}
                  placeholder={
                    selectedEdges.length > 1 && bulkEdgeLabel === ""
                      ? "Mixed labels"
                      : "Optional label"
                  }
                  onChange={(e) => handleBulkEdgeLabelChange(e.target.value)}
                  variant="small"
                />
              </PropRow>
            </Section>
          )}

          {selectedEdges.length > 0 && (
            <Section title={`Cardinality`} icon={Hash} defaultOpen={false}>
              <PropRow label="Source">
                <Input
                  value={bulkSourceCardinality}
                  placeholder={
                    selectedEdges.length > 1 && bulkSourceCardinality === ""
                      ? "Mixed"
                      : "e.g. 1..*"
                  }
                  onChange={(e) =>
                    handleBulkEdgeCardinalityChange(
                      "sourceCardinality",
                      e.target.value,
                    )
                  }
                  variant="small"
                />
              </PropRow>
              <PropRow label="Target">
                <Input
                  value={bulkTargetCardinality}
                  placeholder={
                    selectedEdges.length > 1 && bulkTargetCardinality === ""
                      ? "Mixed"
                      : "e.g. 0..1"
                  }
                  onChange={(e) =>
                    handleBulkEdgeCardinalityChange(
                      "targetCardinality",
                      e.target.value,
                    )
                  }
                  variant="small"
                />
              </PropRow>
            </Section>
          )}
        </div>
      </ScrollArea>

      {selectedNodeDialog && (
        <ObjectNodeDialog
          id={selectedNodeDialog.id}
          data={selectedNodeDialog.data as ObjectNodeData}
          open={nodeDialogOpen}
          onOpenChange={(open) => {
            setNodeDialogOpen(open);
            if (!open) {
              const timer = setTimeout(
                () => setSelectedNodeForDialog(null),
                150,
              );
              return () => clearTimeout(timer);
            }
          }}
        />
      )}
    </>
  );
};

export default PropertiesPanel;
