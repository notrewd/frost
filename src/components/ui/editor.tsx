import { FlowState } from "@/stores";
import useFlowStore from "@/stores/flow-store";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import ObjectNode from "../nodes/object-node";
import { ProjectOpenedEvent } from "@/types/events";
import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const nodeTypes = {
  object: ObjectNode,
};

const FlowEditor = () => {
  const selector = useShallow((state: FlowState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    setInstance: state.setInstance,
  }));

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    setInstance,
  } = useFlowStore(selector);

  useEffect(() => {
    invoke("toggle_menu_item", { item: "select_all_nodes", enabled: true });

    const fetchProjectData = async () => {
      try {
        const data = await invoke<string>("request_project_data");
        if (!data) return;

        const flowData = JSON.parse(data);
        if (!flowData) return;
        setNodes(() => flowData.nodes || []);
        setEdges(() => flowData.edges || []);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    };

    fetchProjectData();

    const unlisten = listen<ProjectOpenedEvent>(
      "project-opened",
      async (event) => {
        const { data } = event.payload;

        console.log("Received project data:", data);

        if (!data) {
          setNodes(() => []);
          setEdges(() => []);
          return;
        }

        try {
          const flowData = JSON.parse(data);
          if (!flowData) return;

          setNodes(() => flowData.nodes || []);
          setEdges(() => flowData.edges || []);
        } catch (error) {
          console.error("Failed to load project data:", error);
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <ReactFlow
      className="frost-editor-flow"
      nodes={nodes}
      edges={edges}
      colorMode="dark"
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onInit={(instance) => setInstance(instance)}
      proOptions={{
        hideAttribution: true,
      }}
      fitView
      zoomOnScroll
      selectionOnDrag
      panOnDrag={[1, 2]}
    >
      <MiniMap />
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default FlowEditor;
