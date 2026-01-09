import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "@xyflow/react/dist/style.css";
import { useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  MiniMap,
  Background,
} from "@xyflow/react";
import PropertiesPanel from "@/components/panels/properties-panel";
import LibraryPanel from "@/components/panels/library-panel";
import PanelBar from "@/components/ui/panel-bar";
import ProjectPanel from "@/components/panels/project-panel";

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const EditorRoute = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = (
    changes: NodeChange<{
      id: string;
      position: { x: number; y: number };
      data: { label: string };
    }>[]
  ) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (
    changes: EdgeChange<{ id: string; source: string; target: string }>[]
  ) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  return (
    <ResizablePanelGroup orientation="horizontal" className="text-sm">
      <ResizablePanel
        className="bg-secondary flex flex-col"
        minSize={300}
        defaultSize={300}
      >
        <PanelBar>Library</PanelBar>
        <div className="flex flex-col flex-1 px-4 py-2">
          <LibraryPanel />
        </div>
      </ResizablePanel>
      <ResizablePanel className="flex flex-col" minSize={300}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          colorMode="dark"
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
            <div className="flex flex-col flex-1 px-4 py-2">
              <ProjectPanel />
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
