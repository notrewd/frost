import { FlowState } from "@/stores";
import useFlowStore from "@/stores/flow-store";
import { Background, Controls, MiniMap, Panel, ReactFlow } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import ObjectNode from "../nodes/object-node";
import { ProjectOpenedEvent } from "@/types/events";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "zustand";
import { Button } from "./button";
import { Undo, Redo } from "lucide-react";
import { useProjectStore } from "@/stores/project-store";

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

  // Undo/Redo hooks
  const { undo, redo, pause, resume, canUndo, canRedo } = useStore(
    (useFlowStore as any).temporal,
    useShallow((state: any) => ({
      undo: state.undo,
      redo: state.redo,
      pause: state.pause,
      resume: state.resume,
      canUndo: state.pastStates.length > 0,
      canRedo: state.futureStates.length > 0,
    })),
  );

  const { setCanUndo, setCanRedo } = useProjectStore(
    useShallow((state) => ({
      setCanUndo: state.setCanUndo,
      setCanRedo: state.setCanRedo,
    })),
  );

  useEffect(() => {
    setCanUndo(canUndo);
    setCanRedo(canRedo);
  }, [canUndo, canRedo, setCanUndo, setCanRedo]);

  const onNodeDragStart = useCallback(() => {
    // Snapshot current state before drag
    setNodes((nodes) => [...nodes]);
    pause();
  }, [setNodes, pause]);

  const onNodeDragStop = useCallback(() => {
    resume();
  }, [resume]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

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

    const projectOpenedUnlisten = listen<ProjectOpenedEvent>(
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

    const undoUnlisten = listen("undo", () => {
      if (useProjectStore.getState().canUndo) undo();
    });

    const redoUnlisten = listen("redo", () => {
      if (useProjectStore.getState().canRedo) redo();
    });

    return () => {
      projectOpenedUnlisten.then((f) => f());
      undoUnlisten.then((f) => f());
      redoUnlisten.then((f) => f());
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
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      proOptions={{
        hideAttribution: true,
      }}
      fitView
      zoomOnScroll
      selectionOnDrag
      panOnDrag={[1, 2]}
    >
      <Panel position="top-left" className="flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </Panel>
      <MiniMap />
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default FlowEditor;
