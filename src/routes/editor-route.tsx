import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "@xyflow/react/dist/style.css";
import "./editor-route.css";
import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import PropertiesPanel from "@/components/panels/properties-panel";
import LibraryPanel from "@/components/panels/library-panel";
import PanelBar from "@/components/ui/panel-bar";
import ProjectPanel from "@/components/panels/project-panel";
import ObjectNode from "@/components/nodes/object-node";

const nodeTypes = {
  object: ObjectNode,
};

const initialNodes = [
  {
    id: "n1",
    type: "object",
    position: { x: 0, y: 0 },
    data: {
      name: "Person",
      attributes: [
        { name: "firstName", type: "string", accessModifier: "private" },
        { name: "lastName", type: "string", accessModifier: "private" },
        {
          name: "age",
          type: "number",
          accessModifier: "private",
          defaultValue: "0",
        },
      ],
      methods: [
        {
          name: "setFullName",
          accessModifier: "public",
          returnType: "void",
          parameters: [
            { name: "firstName", type: "string" },
            { name: "lastName", type: "string" },
          ],
        },
        {
          name: "getFullName",
          accessModifier: "public",
          returnType: "string",
          parameters: [],
        },
        {
          name: "setAge",
          accessModifier: "public",
          returnType: "void",
          parameters: [{ name: "age", type: "number" }],
        },
      ],
    },
  },
  {
    id: "n2",
    type: "object",
    position: { x: 0, y: 100 },
    data: {
      name: "Employee",
      attributes: [
        { name: "employeeId", type: "string", accessModifier: "private" },
      ],
      methods: [
        {
          name: "getEmployeeDetails",
          accessModifier: "public",
          returnType: "string",
          parameters: [],
        },
      ],
    },
  },
  {
    id: "n3",
    type: "object",
    position: { x: 300, y: 200 },
    data: {
      name: "Status",
      stereotype: "enumeration",
      attributes: [
        {
          name: "Active",
          accessModifier: "public",
          defaultValue: "1",
          static: true,
        },
        {
          name: "Inactive",
          accessModifier: "public",
          defaultValue: "0",
          static: true,
        },
        {
          name: "Pending",
          accessModifier: "public",
          defaultValue: "2",
          static: true,
        },
      ],
      methods: [],
    },
  },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const EditorRoute = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((els) => addEdge(params, els)),
    []
  );

  const projectData = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      name: node.data.name,
      type: "node" as const,
    }));
  }, [nodes]);

  const handleDelete = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== id && edge.target !== id)
      );
    },
    [setNodes, setEdges]
  );

  return (
    <ResizablePanelGroup orientation="horizontal" className="text-sm">
      <ResizablePanel
        className="bg-secondary flex flex-col"
        minSize={300}
        defaultSize={300}
      >
        <PanelBar>Library</PanelBar>
        <div className="flex flex-col flex-1 px-4 py-3">
          <LibraryPanel />
        </div>
      </ResizablePanel>
      <ResizablePanel className="flex flex-col" minSize={300}>
        <ReactFlow
          className="frost-editor-flow"
          nodes={nodes}
          edges={edges}
          colorMode="dark"
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          proOptions={{
            hideAttribution: true,
          }}
          fitView
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
        >
          <MiniMap />
          <Background />
          <Controls />
        </ReactFlow>
      </ResizablePanel>
      <ResizablePanel className="bg-secondary" minSize={300} defaultSize={300}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel
            className="flex flex-col"
            minSize={200}
            defaultSize={150}
          >
            <PanelBar>Project</PanelBar>
            <div className="flex flex-col h-full pl-4 py-2 pb-7">
              <ProjectPanel initialData={projectData} onDelete={handleDelete} />
            </div>
          </ResizablePanel>
          <ResizableHandle className="bg-muted-foreground/25" />
          <ResizablePanel
            className="flex flex-col"
            minSize={200}
            defaultSize={200}
          >
            <PanelBar>Properties</PanelBar>
            <div className="flex flex-col flex-1 px-4 py-2">
              <PropertiesPanel />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default EditorRoute;
