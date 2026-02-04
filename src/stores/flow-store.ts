import { create } from "zustand";
import { FlowState } from "./types";
import { initialNodes } from "@/templates/initial-nodes";
import { initialEdges } from "@/templates/initial-edges";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  instance: null,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => {
    set((state) => ({ nodes: nodes(state.nodes) }));
  },
  setEdges: (edges) => {
    set((state) => ({ edges: edges(state.edges) }));
  },
  setInstance: (instance) => {
    set({ instance });
  },
}));

export default useFlowStore;
