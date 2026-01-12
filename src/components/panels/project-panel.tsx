import { Folder, FolderRoot, SquareChartGantt } from "lucide-react";
import TreeView, { TreeViewItem } from "../ui/tree-view";
import { FC, useEffect, useState } from "react";

const iconMap = {
  root: <FolderRoot className="size-4" />,
  folder: <Folder className="size-4" />,
  node: <SquareChartGantt className="size-4" />,
};

interface ProjectPanelProps {
  initialData?: TreeViewItem[];
}

const ProjectPanel: FC<ProjectPanelProps> = ({ initialData }) => {
  const [data, setData] = useState<TreeViewItem[]>([]);

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
      searchPlaceholder="Search project..."
      className="bg-transparent"
    />
  );
};

export default ProjectPanel;
