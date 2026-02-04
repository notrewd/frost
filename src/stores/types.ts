import { ObjectNodeData } from "@/components/nodes/object-node";
import {
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
} from "@xyflow/react";

export interface FlowState {
  nodes: Node<ObjectNodeData>[];
  edges: Edge[];
  instance: ReactFlowInstance<Node<ObjectNodeData>, Edge> | null;
  onNodesChange: OnNodesChange<Node<ObjectNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (
    fn: (prev: Node<ObjectNodeData>[]) => Node<ObjectNodeData>[],
  ) => void;
  setEdges: (fn: (prev: Edge[]) => Edge[]) => void;
  setInstance: (
    instance: ReactFlowInstance<Node<ObjectNodeData>, Edge>,
  ) => void;
}
