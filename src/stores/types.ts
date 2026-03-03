import { ObjectNodeData } from "@/components/nodes/object-node";
import {
  Edge,
  Node,
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
  onConnect: (edge: Edge) => void;
  setNodes: (
    fn: (prev: Node<ObjectNodeData>[]) => Node<ObjectNodeData>[],
  ) => void;
  setEdges: (fn: (prev: Edge[]) => Edge[]) => void;
  setInstance: (
    instance: ReactFlowInstance<Node<ObjectNodeData>, Edge>,
  ) => void;
}

export interface ProjectState {
  projectName: string;
  projectPath: string;
  projectData: string;
  projectEdited: boolean;
  canUndo: boolean;
  canRedo: boolean;
  setProjectName: (name: string) => void;
  setProjectPath: (path: string) => void;
  setProjectData: (data: string) => void;
  setProjectEdited: (edited: boolean) => void;
  setCanUndo: (canUndo: boolean) => void;
  setCanRedo: (canRedo: boolean) => void;
}

export interface SettingsState {
  theme: "light" | "dark" | "system";
  pan_on_scroll: boolean;
  show_minimap: boolean;
  colored_nodes: boolean;
  show_controls: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setPanOnScroll: (enabled: boolean) => void;
  setShowMinimap: (enabled: boolean) => void;
  setColoredNodes: (enabled: boolean) => void;
  setShowControls: (enabled: boolean) => void;
}
