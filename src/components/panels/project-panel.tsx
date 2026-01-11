import TreeView from "../ui/tree-view";

const data = [
  {
    id: "1",
    name: "Project",
    type: "region",
    children: [
      {
        id: "1.1",
        name: "Folder 1",
        type: "store",
        children: [
          {
            id: "1.1.1",
            name: "Subfolder",
            type: "department",
            children: [
              { id: "1.1.1.1", name: "File 1", type: "item" },
              { id: "1.1.1.2", name: "File 2", type: "item" },
            ],
          },
        ],
      },
    ],
  },
];

const ProjectPanel = () => {
  return (
    <TreeView
      data={data}
      showExpandAll={false}
      searchPlaceholder="Search project..."
      className="bg-transparent"
    />
  );
};

export default ProjectPanel;
