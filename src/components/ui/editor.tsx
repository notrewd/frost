import { FlowState } from "@/stores";
import useFlowStore from "@/stores/flow-store";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import ObjectNode from "../nodes/object-node";

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
    setInstance: state.setInstance,
  }));

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setInstance } =
    useFlowStore(selector);

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
