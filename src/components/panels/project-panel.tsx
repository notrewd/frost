import { Folder, FolderRoot, SquareChartGantt, Trash } from "lucide-react";
import TreeView, {
  TreeViewItem,
  TreeViewMenuItemsByType,
} from "../ui/tree-view";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProject } from "../providers/project-provider";
import useFlowStore from "@/stores/flow-store";
import { useShallow } from "zustand/react/shallow";
import { FlowState } from "@/stores";

const iconMap = {
  root: <FolderRoot className="size-4" />,
  folder: <Folder className="size-4" />,
  node: <SquareChartGantt className="size-4" />,
};

const ProjectPanel = () => {
  const { projectName } = useProject();

  const selector = useShallow((state: FlowState) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  const { setNodes, setEdges, nodes } = useFlowStore(selector);

  const treeData = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      type: "node" as const,
    }));
  }, [nodes]);

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
  }, [handleDelete]);

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
    />
  );
};

export default ProjectPanel;
