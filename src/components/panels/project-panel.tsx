import {
  Focus,
  Folder,
  FolderRoot,
  SquareChartGantt,
  Trash,
} from "lucide-react";
import TreeView, {
  TreeViewItem,
  TreeViewMenuItemsByType,
} from "../ui/tree-view";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProjectStore } from "@/stores/project-store";
import useFlowStore from "@/stores/flow-store";
import { useShallow } from "zustand/react/shallow";
import { FlowState } from "@/stores";

const iconMap = {
  root: <FolderRoot className="size-4" />,
  folder: <Folder className="size-4" />,
  node: <SquareChartGantt className="size-4" />,
};

const ProjectPanel = () => {
  const projectName = useProjectStore((state) => state.projectName);

  const selector = useShallow((state: FlowState) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    instance: state.instance,
  }));

  const { setNodes, setEdges, nodes, instance } = useFlowStore(selector);

  const treeData = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      type: "node" as const,
      selected: node.selected,
    }));
  }, [nodes]);

  const treeSelectedIds = useMemo(() => {
    return new Set(
      nodes.filter((node) => node.selected).map((node) => node.id),
    );
  }, [nodes]);

  const handleSelectionChange = useCallback(
    (selectedItems: TreeViewItem[]) => {
      const selectedIds = new Set(selectedItems.map((item) => item.id));
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          selected: selectedIds.has(node.id),
        })),
      );
    },
    [setNodes],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== id && edge.target !== id),
      );
    },
    [setNodes, setEdges],
  );

  const [data, setData] = useState<TreeViewItem[]>([]);

  const menuItems: TreeViewMenuItemsByType = useMemo(() => {
    return {
      node: [
        {
          id: "focus",
          label: "Focus",
          icon: <Focus className="size-4" />,
          action: (items: TreeViewItem[]) => {
            instance?.fitView({
              nodes: items.map((item) => ({ id: item.id })),
            });
          },
        },
        {
          id: "delete",
          label: "Delete",
          icon: <Trash className="size-4" />,
          variant: "destructive",
          action: (items: TreeViewItem[]) => {
            items.forEach((item) => {
              handleDelete(item.id);
            });
          },
        },
      ],
    };
  }, [handleDelete, instance]);

  useEffect(() => {
    const rootItem: TreeViewItem = {
      id: "root",
      name: projectName || "Project",
      type: "root",
      children: treeData,
    };

    setData([rootItem]);
  }, [treeData, projectName]);

  return (
    <TreeView
      data={data}
      showExpandAll={false}
      iconMap={iconMap}
      menuItemsByType={menuItems}
      searchPlaceholder="Search project..."
      className="bg-transparent"
      selectedIds={treeSelectedIds}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default ProjectPanel;
