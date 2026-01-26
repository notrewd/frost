import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "@xyflow/react/dist/style.css";
import "./editor-route.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
  type Node,
  type Edge,
} from "@xyflow/react";
import PropertiesPanel from "@/components/panels/properties-panel";
import LibraryPanel from "@/components/panels/library-panel";
import PanelBar from "@/components/ui/panel-bar";
import ProjectPanel from "@/components/panels/project-panel";
import ObjectNode from "@/components/nodes/object-node";
import type { ObjectNodeData } from "@/components/nodes/object-node";
import type { DragEventData } from "@neodrag/react";
import type { LibraryPaletteItem } from "@/components/panels/library-panel";
import { useEditorActions } from "@/components/providers/editor-actions-provider";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useProject } from "@/components/providers/project-provider";

const nodeTypes = {
  object: ObjectNode,
};

type ProjectOpenedEvent = {
  name: string;
  path: string;
  data: string;
};

const initialNodes: Node<ObjectNodeData>[] = [
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

const EditorRoute = () => {
  const { setProjectEdited } = useProject();
  const { setHandlers, setState } = useEditorActions();

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<ObjectNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const data = await invoke<string>("request_project_data");
        if (!data) return;

        const flowData = JSON.parse(data);
        if (!flowData) return;
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    };

    fetchProjectData();

    const unlisten = listen<ProjectOpenedEvent>(
      "project-opened",
      async (event) => {
        const { data } = event.payload;
        try {
          const flowData = JSON.parse(data);
          if (!flowData) return;

          setNodes(flowData.nodes || []);
          setEdges(flowData.edges || []);
        } catch (error) {
          console.error("Failed to load project data:", error);
        }
      },
    );

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  useEffect(() => {
    setProjectEdited(true);
  }, [nodes, edges]);

  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<{
    nodes: Node<ObjectNodeData>[];
    edges: Edge[];
  } | null>(null);
  const pasteCountRef = useRef(0);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    Node<ObjectNodeData>,
    Edge
  > | null>(null);

  const onConnect = useCallback(
    (params: any) => setEdges((els) => addEdge(params, els)),
    [],
  );

  useEffect(() => {
    const unlisten = listen("save-as-requested", async () => {
      if (!reactFlowInstance) return;
      const flowData = reactFlowInstance.toObject();
      const serializedData = JSON.stringify(flowData, null, 2);

      try {
        await invoke("save_file_as", { data: serializedData });
        setProjectEdited(false);
      } catch (error) {
        console.error("Failed to save file as:", error);
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [reactFlowInstance]);

  const cloneData = useCallback(<T,>(value: T): T => {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value)) as T;
  }, []);

  const getSelectedNodes = useCallback(() => {
    return nodes.filter((node) => node.selected);
  }, [nodes]);

  const copyNodes = useCallback(() => {
    const selectedNodes = getSelectedNodes();

    if (selectedNodes.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedNodes.map((node) => node.id));
    const selectedEdges = edges.filter(
      (edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target),
    );

    clipboardRef.current = {
      nodes: selectedNodes.map((node) => ({
        ...node,
        data: cloneData(node.data),
        position: { ...node.position },
        selected: false,
      })),
      edges: selectedEdges.map((edge) => ({
        ...edge,
        data: edge.data ? cloneData(edge.data) : edge.data,
        selected: false,
      })),
    };

    pasteCountRef.current = 0;
    setState((prev) => ({ ...prev, canPaste: true }));
  }, [cloneData, edges, getSelectedNodes, setState]);

  const selectAllNodes = useCallback(() => {
    setNodes((nds) => nds.map((node) => ({ ...node, selected: true })));
    setEdges((eds) => eds.map((edge) => ({ ...edge, selected: true })));
  }, [setEdges, setNodes]);

  const cutNodes = useCallback(() => {
    const selectedNodes = getSelectedNodes();

    if (selectedNodes.length === 0) {
      return;
    }

    const selectedIds = new Set(selectedNodes.map((node) => node.id));

    clipboardRef.current = {
      nodes: selectedNodes.map((node) => ({
        ...node,
        data: cloneData(node.data),
        position: { ...node.position },
        selected: false,
      })),
      edges: edges
        .filter(
          (edge) =>
            selectedIds.has(edge.source) && selectedIds.has(edge.target),
        )
        .map((edge) => ({
          ...edge,
          data: edge.data ? cloneData(edge.data) : edge.data,
          selected: false,
        })),
    };

    pasteCountRef.current = 0;
    setState((prev) => ({ ...prev, canPaste: true }));

    setNodes((nds) => nds.filter((node) => !selectedIds.has(node.id)));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedIds.has(edge.source) && !selectedIds.has(edge.target),
      ),
    );
  }, [cloneData, edges, getSelectedNodes, setEdges, setNodes, setState]);

  const pasteNodes = useCallback(() => {
    const clipboard = clipboardRef.current;

    if (!clipboard || clipboard.nodes.length === 0) {
      return;
    }

    pasteCountRef.current += 1;
    const offset = 24 * pasteCountRef.current;
    const timestamp = Date.now().toString(36);
    const idMap = new Map<string, string>();

    const newNodes = clipboard.nodes.map((node, index) => {
      const newId = `n${timestamp}${index}${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      idMap.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        selected: true,
      };
    });

    const newEdges: Edge[] = [];

    clipboard.edges.forEach((edge, index) => {
      const source = idMap.get(edge.source);
      const target = idMap.get(edge.target);

      if (!source || !target) {
        return;
      }

      newEdges.push({
        ...edge,
        id: `e${timestamp}${index}${Math.random().toString(36).slice(2, 7)}`,
        source,
        target,
        selected: true,
      });
    });

    setNodes((nds) => {
      const resetNodes = nds.map((node) => ({
        ...node,
        selected: false,
      })) as Node<ObjectNodeData>[];
      return resetNodes.concat(newNodes);
    });
    setEdges((eds) => {
      const resetEdges = eds.map((edge) => ({
        ...edge,
        selected: false,
      })) as Edge[];
      return resetEdges.concat(newEdges);
    });
  }, [setEdges, setNodes]);

  useEffect(() => {
    const hasSelection = nodes.some((node) => node.selected);
    setState((prev) => ({ ...prev, canCutCopy: hasSelection }));
  }, [nodes, setState]);

  useEffect(() => {
    setHandlers({
      cut: cutNodes,
      copy: copyNodes,
      paste: pasteNodes,
      selectAll: selectAllNodes,
    });

    return () => {
      setHandlers(null);
    };
  }, [copyNodes, cutNodes, pasteNodes, selectAllNodes, setHandlers]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      if (!isModifier) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        !!target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      if (isEditableTarget) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "x":
          event.preventDefault();
          cutNodes();
          break;
        case "c":
          event.preventDefault();
          copyNodes();
          break;
        case "v":
          event.preventDefault();
          pasteNodes();
          break;
        case "a":
          event.preventDefault();
          selectAllNodes();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [copyNodes, cutNodes, pasteNodes, selectAllNodes]);

  const treeData = useMemo(() => {
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
        eds.filter((edge) => edge.source !== id && edge.target !== id),
      );
    },
    [setNodes, setEdges],
  );

  const handleLibraryItemDropped = useCallback(
    (item: LibraryPaletteItem, drag: DragEventData) => {
      if (!reactFlowInstance) return;

      const bounds = reactFlowWrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const { clientX, clientY } = drag.event;
      const isInside =
        clientX >= bounds.left &&
        clientX <= bounds.right &&
        clientY >= bounds.top &&
        clientY <= bounds.bottom;

      if (!isInside) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      const id = `n${Date.now().toString(36)}${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      setNodes((nds) =>
        nds.concat([
          {
            id,
            type: item.template.type,
            position,
            data: item.template.data,
          },
        ]),
      );
    },
    [reactFlowInstance, setNodes],
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
          <LibraryPanel onItemDropped={handleLibraryItemDropped} />
        </div>
      </ResizablePanel>
      <ResizablePanel className="flex flex-col" minSize={300}>
        <div ref={reactFlowWrapperRef} className="flex flex-col flex-1">
          <ReactFlow
            className="frost-editor-flow"
            nodes={nodes}
            edges={edges}
            colorMode="dark"
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance) => setReactFlowInstance(instance)}
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
        </div>
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
              <ProjectPanel initialData={treeData} onDelete={handleDelete} />
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
