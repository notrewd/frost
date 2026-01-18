import { Folder, FolderRoot, SquareChartGantt, Trash } from "lucide-react";
import TreeView, {
  TreeViewItem,
  TreeViewMenuItemsByType,
} from "../ui/tree-view";
import { FC, useEffect, useMemo, useState } from "react";
import { useProject } from "../providers/project-provider";

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
  const { projectName } = useProject();

  useEffect(() => {
    console.log("ProjectPanel mounted with projectName:", projectName);
  }, [projectName]);

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
        name: projectName || "Project",
        type: "root",
        children: initialData,
      };

      setData([rootItem]);
    }
  }, [initialData, projectName]);

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
