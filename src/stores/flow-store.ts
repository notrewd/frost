import { create } from "zustand";
import { FlowState } from "./types";
import { addEdge, applyEdgeChanges, applyNodeChanges } from "@xyflow/react";
import { temporal } from "zundo";

const useFlowStore = create<FlowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      instance: null,
      onNodesChange: (changes) => {
        const isOnlyVisual = changes.every(
          (c) =>
            c.type === "dimensions" ||
            c.type === "select" ||
            (c.type === "position" && c.dragging),
        );

        if (isOnlyVisual) {
          const temporalStore = (
            useFlowStore as unknown as any
          ).temporal?.getState();
          if (temporalStore) temporalStore.pause();
          set({
            nodes: applyNodeChanges(changes, get().nodes),
          });
          if (temporalStore) temporalStore.resume();
        } else {
          set({
            nodes: applyNodeChanges(changes, get().nodes),
          });
        }
      },
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      onConnect: (edge) => {
        set({
          edges: addEdge(edge, get().edges),
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
