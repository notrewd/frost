import { create } from "zustand";
import { FlowState } from "./types";
import { initialNodes } from "@/templates/initial-nodes";
import { initialEdges } from "@/templates/initial-edges";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { temporal } from "zundo";

const useFlowStore = create<FlowState>()(
  temporal(
    (set, get) => ({
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
    }),
    {
      partialize: (state) => {
        const { nodes, edges } = state;
        return { nodes, edges };
      },
      equality: (pastState, currentState) => {
        // Basic shallow check for nodes/edges arrays to avoid duplicates
        // This checking if the arrays are strictly equal or if the length is different
        // If we want deep comparison we would need lodash.isEqual or similar, but shallow check is often enough
        // if immutability is respected.
        return (
          pastState.nodes === currentState.nodes &&
          pastState.edges === currentState.edges
        );
      },
    },
  ),
);

export default useFlowStore;
