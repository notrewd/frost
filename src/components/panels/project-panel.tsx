import { Folder, FolderRoot, SquareChartGantt, Trash } from "lucide-react";
import TreeView, { TreeViewItem } from "../ui/tree-view";
import { FC, useEffect, useMemo, useState } from "react";

const iconMap = {
  root: <FolderRoot className="size-4" />,
  folder: <Folder className="size-4" />,
  node: <SquareChartGantt className="size-4" />,
};

interface ProjectPanelProps {
  initialData?: TreeViewItem[];
  onDelete?: (id: string) => void;
}

const ProjectPanel: FC<ProjectPanelProps> = ({ initialData, onDelete }) => {
  const [data, setData] = useState<TreeViewItem[]>([]);

  const menuItems = useMemo(() => {
    return {
      node: [
        {
          id: "delete",
          label: "Delete",
          icon: <Trash className="size-4" />,
          action: (items: TreeViewItem[]) => {
            items.forEach((item) => {
              if (onDelete) {
                onDelete(item.id);
              }
            });
          },
        },
      ],
    };
  }, [onDelete]);

  useEffect(() => {
    if (initialData) {
      const rootItem: TreeViewItem = {
        id: "root",
        name: "Project",
        type: "root",
        children: initialData,
      };

      setData([rootItem]);
    }
  }, [initialData]);

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
