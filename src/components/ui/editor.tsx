import { FlowState } from "@/stores";
import useFlowStore from "@/stores/flow-store";
import {
  Background,
  Connection,
  Edge,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  getViewportForBounds,
} from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import ObjectNode from "../nodes/object-node";
import { ProjectOpenedEvent } from "@/types/events";
import { emit, listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toPng } from "html-to-image";
import { useStore } from "zustand";
import { Button } from "./button";
import { Undo, Redo, Focus, Trash2, FolderPlus } from "lucide-react";
import { useProjectStore } from "@/stores/project-store";
import EditorControls from "./editor-controls";
import { useSettingsStore } from "@/stores/settings-store";
import GeneralizationEdge from "../edges/generalization-edge";
import CustomConnectionLine from "../connection-lines/custom-connection-line";
import useMousePosition from "@/hooks/use-mouse-position";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import AssociationEdge from "../edges/association-edge";
import AssociationArrow from "@/components/ui/icons/arrows/association-arrow";
import CompositionArrow from "./icons/arrows/composition-arrow";
import ImplementationArrow from "./icons/arrows/implementation-arrow";
import GeneralizationArrow from "./icons/arrows/generalization-arrow";
import ImplementationEdge from "../edges/implementation-edge";
import CompositionEdge from "../edges/composition-edge";

import GroupNode from "../nodes/group-node";

const nodeTypes = {
  object: ObjectNode,
  group: GroupNode,
};

const edgeTypes = {
  generalization: GeneralizationEdge,
  association: AssociationEdge,
  implementation: ImplementationEdge,
  composition: CompositionEdge,
};

const defaultEdgeOptions = {
  type: "generalization",
};

const connectionLineStyle = {
  stroke: "var(--foreground)",
  strokeWidth: 2,
  strokeDasharray: "5 5",
};

const FlowEditor = () => {
  const mousePosition = useMousePosition();

  const [edgeTypesMenuPosition, setEdgeTypesMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [selectionMenuPosition, setSelectionMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [currentConnection, setCurrentConnection] = useState<Connection | null>(
    null,
  );

  const {
    nodes,
    edges,
    instance,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    setInstance,
  } = useFlowStore(
    useShallow((state: FlowState) => ({
      nodes: state.nodes,
      edges: state.edges,
      instance: state.instance,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setInstance: state.setInstance,
    })),
  );

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

  const {
    theme,
    panOnScroll,
    showMinimap,
    showControls,
    showGrid,
    snapToGrid,
    gridSize,
  } = useSettingsStore(
    useShallow((state) => ({
      theme: state.theme,
      panOnScroll: state.pan_on_scroll,
      showMinimap: state.show_minimap,
      showControls: state.show_controls,
      showGrid: state.show_grid,
      snapToGrid: state.snap_to_grid,
      gridSize: state.grid_size,
    })),
  );
  useEffect(() => {
    console.log("Settings changed:", { theme, panOnScroll, showMinimap });
  }, [theme, panOnScroll, showMinimap]);

  const [isLocked, setIsLocked] = useState(false);

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
    console.log(theme, panOnScroll, showMinimap);
  }, [theme, panOnScroll, showMinimap]);

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

    const exportUnlisten = listen<{
      transparentBackground?: boolean;
      padding?: number;
    }>("request-export-image", async (event) => {
      const { transparentBackground = true, padding = 10 } =
        event.payload || {};

      const nodes = useFlowStore.getState().nodes;
      if (!nodes || nodes.length === 0) {
        emit("export-image-ready", "");
        return;
      }

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      nodes.forEach((node) => {
        let x = node.position.x;
        let y = node.position.y;
        let pId = node.parentId;

        while (pId) {
          const parent = nodes.find((n) => n.id === pId);
          if (parent) {
            x += parent.position.x;
            y += parent.position.y;
            pId = parent.parentId;
          } else {
            pId = undefined;
          }
        }

        const width = Number(
          node.measured?.width || node.style?.width || node.width || 200,
        );
        const height = Number(
          node.measured?.height || node.style?.height || node.height || 200,
        );

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      const nodesBounds = {
        x: minX === Infinity ? 0 : minX,
        y: minY === Infinity ? 0 : minY,
        width: maxX === -Infinity ? 10 : Math.max(0, maxX - minX),
        height: maxY === -Infinity ? 10 : Math.max(0, maxY - minY),
      };
      const imageWidth = 1024;
      const imageHeight = 768;

      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2,
        padding / 100,
      );

      const viewportElement: HTMLElement | null = document.querySelector(
        ".react-flow__viewport",
      );

      if (!viewportElement) {
        emit("export-image-ready", "");
        return;
      }

      try {
        const dataUrl = await toPng(viewportElement, {
          backgroundColor: transparentBackground ? "transparent" : "#1a365d",
          width: imageWidth,
          height: imageHeight,
          style: {
            width: imageWidth.toString() + "px",
            height: imageHeight.toString() + "px",
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          },
          filter: (node) => {
            if (
              node?.classList?.contains("react-flow__handle") ||
              node?.classList?.contains("react-flow__ring")
            ) {
              return false;
            }
            if (
              node?.classList &&
              typeof node.classList.remove === "function"
            ) {
              node.classList.remove("selected");
            }
            return true;
          },
        });
        emit("export-image-ready", dataUrl);
      } catch (error) {
        console.error("Export failed:", error);
        emit("export-image-ready", "");
      }
    });

    return () => {
      projectOpenedUnlisten.then((f) => f());
      undoUnlisten.then((f) => f());
      redoUnlisten.then((f) => f());
      exportUnlisten.then((f) => f());
    };
  }, []);

  const handleOnConnect = useCallback(
    (connection: Connection) => {
      setCurrentConnection(connection);
      setEdgeTypesMenuPosition({
        x: mousePosition.x || 0,
        y: mousePosition.y || 0,
      });
    },
    [onConnect, mousePosition],
  );

  const handleSelectionContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setSelectionMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const handleSelectionGroup = useCallback(() => {
    const selectedNodesAll = nodes.filter((node) => node.selected);
    if (selectedNodesAll.length === 0) return;

    const selectedNodes = selectedNodesAll.filter((node) => {
      let current = node.parentId;
      while (current) {
        if (selectedNodesAll.some((n) => n.id === current)) return false;
        const parent = nodes.find((n) => n.id === current);
        current = parent?.parentId;
      }
      return true;
    });

    if (selectedNodes.length === 0) return;

    const parentIds = [...new Set(selectedNodes.map((n) => n.parentId))];
    const commonParentId = parentIds.length === 1 ? parentIds[0] : undefined;

    // Calculate bounding box
    const minX = Math.min(...selectedNodes.map((n) => n.position.x));
    const minY = Math.min(...selectedNodes.map((n) => n.position.y));
    const maxX = Math.max(
      ...selectedNodes.map((n) => n.position.x + (n.measured?.width || 200)),
    );
    const maxY = Math.max(
      ...selectedNodes.map((n) => n.position.y + (n.measured?.height || 200)),
    );

    const padding = 40;
    const groupX = minX - padding;
    const groupY = minY - padding;
    const groupWidth = maxX - minX + padding * 2;
    const groupHeight = maxY - minY + padding * 2;

    const groupId = `group-${Date.now()}`;
    const newGroup = {
      id: groupId,
      type: "group",
      position: { x: groupX, y: groupY },
      style: {
        width: groupWidth,
        height: groupHeight,
        border: "none",
        background: "transparent",
      },
      zIndex: -1,
      data: { name: "New Group" },
      ...(commonParentId ? { parentId: commonParentId } : {}),
    };

    setNodes((currentNodes) => {
      const selectedIds = selectedNodes.map((n) => n.id);
      const minIndex = currentNodes.findIndex((n) =>
        selectedIds.includes(n.id),
      );
      // Add parent to selected nodes, update their position to relative, unselect them
      const updatedNodes = currentNodes.map((node) => {
        if (selectedIds.includes(node.id)) {
          return {
            ...node,
            parentId: groupId,
            position: {
              x: node.position.x - groupX,
              y: node.position.y - groupY,
            },
            selected: false,
          };
        }
        return node;
      });
      const finalNodes = [...updatedNodes];
      finalNodes.splice(minIndex !== -1 ? minIndex : 0, 0, {
        ...newGroup,
        selected: true,
      } as any);
      return finalNodes;
    });
    setSelectionMenuPosition(null);
  }, [nodes, setNodes]);

  const handleSelectionFocus = useCallback(() => {
    instance?.fitView({
      nodes: nodes.filter((node) => node.selected).map((n) => ({ id: n.id })),
    });
    setSelectionMenuPosition(null);
  }, [instance, nodes]);

  const handleSelectionDelete = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => !node.selected));
    setEdges((edges) => edges.filter((edge) => !edge.selected));
    setSelectionMenuPosition(null);
  }, [setNodes, setEdges]);

  const addEdge = useCallback(
    (edgeType: string, marker: MarkerType) => {
      if (!currentConnection) return;

      const edge: Edge = {
        id: `${currentConnection.source}-${currentConnection.sourceHandle}-${currentConnection.target}-${currentConnection.targetHandle}`,
        source: currentConnection.source,
        sourceHandle: currentConnection.sourceHandle,
        target: currentConnection.target,
        targetHandle: currentConnection.targetHandle,
        type: edgeType,
        style: { stroke: "var(--foreground)", strokeWidth: 2 },
        markerEnd: {
          color: "var(--foreground)",
          type: marker,
        },
      };

      onConnect(edge);

      setEdgeTypesMenuPosition(null);
      setCurrentConnection(null);
    },
    [onConnect, currentConnection],
  );

  const mappedEdges = useMemo(
    () => edges.map((edge) => ({ ...edge }) as Edge),
    [edges],
  );

  return (
    <>
      <ReactFlow
        className="frost-editor-flow"
        nodes={nodes}
        edges={mappedEdges}
        colorMode={theme === "system" ? undefined : theme}
        panOnScroll={panOnScroll}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={["Backspace", "Delete"]}
        defaultEdgeOptions={defaultEdgeOptions}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleOnConnect}
        onSelectionContextMenu={handleSelectionContextMenu}
        onInit={(instance) => setInstance(instance as any)}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        proOptions={{
          hideAttribution: true,
        }}
        fitView
        selectionOnDrag={!isLocked}
        panOnDrag={[1, 2]}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
        connectionLineComponent={CustomConnectionLine}
        connectionLineStyle={connectionLineStyle}
      >
        {showControls && (
          <>
            <EditorControls isLocked={isLocked} setIsLocked={setIsLocked} />
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
          </>
        )}
        {showMinimap && <MiniMap hidden={false} />}
        {showGrid && <Background />}
      </ReactFlow>

      <DropdownMenu
        open={!!edgeTypesMenuPosition}
        onOpenChange={() => {
          setEdgeTypesMenuPosition(null);
          setCurrentConnection(null);
        }}
      >
        <DropdownMenuContent
          className="absolute"
          style={{
            top: edgeTypesMenuPosition?.y || 0,
            left: edgeTypesMenuPosition?.x || 0,
          }}
        >
          <DropdownMenuItem
            onClick={() => addEdge("generalization", MarkerType.ArrowClosed)}
          >
            <GeneralizationArrow className="size-4" />
            Generalization
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addEdge("association", MarkerType.Arrow)}
          >
            <AssociationArrow className="size-4" />
            Association
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addEdge("composition", MarkerType.ArrowClosed)}
          >
            <CompositionArrow className="size-4" />
            Composition
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => addEdge("implementation", MarkerType.ArrowClosed)}
          >
            <ImplementationArrow className="size-4" />
            Implementation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu
        open={!!selectionMenuPosition}
        onOpenChange={() => {
          setSelectionMenuPosition(null);
        }}
      >
        <DropdownMenuContent
          className="absolute"
          style={{
            top: selectionMenuPosition?.y || 0,
            left: selectionMenuPosition?.x || 0,
          }}
        >
          <DropdownMenuItem onClick={handleSelectionFocus}>
            <Focus className="size-4" />
            Focus
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSelectionGroup}>
            <FolderPlus className="size-4" />
            Group
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSelectionDelete}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default FlowEditor;
