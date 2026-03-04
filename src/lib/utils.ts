import {
  MarkerType,
  Position,
  type InternalNode,
  type XYPosition,
  type Node,
  type Edge,
  getBezierPath,
} from "@xyflow/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertProjectNameToFileName(name: string) {
  if (!name || name.trim().length === 0) {
    return "untitled.frost";
  }

  if (!name.trim().includes(" ")) {
    return name.endsWith(".fr") ? name.trim() : `${name.trim()}.fr`;
  }

  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .concat(".fr");
}

export function generateUniqueParameterId() {
  return `param-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateUniqueAttributeId() {
  return `attr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function generateUniqueMethodId() {
  return `method-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// this helper function returns the intersection point
// of the line between the center of the intersectionNode and the target node
function getNodeIntersection(
  intersectionNode: InternalNode,
  targetNode: InternalNode,
) {
  // https://math.stackexchange.com/questions/1724792/an-algorithm-for-finding-the-intersection-point-between-a-center-of-vision-and-a
  const { width: intersectionNodeWidth, height: intersectionNodeHeight } =
    intersectionNode.measured ?? { width: 0, height: 0 };
  const intersectionNodePosition = intersectionNode.internals.positionAbsolute;
  const targetPosition = targetNode.internals.positionAbsolute;

  const w = (intersectionNodeWidth ?? 0) / 2;
  const h = (intersectionNodeHeight ?? 0) / 2;

  const x2 = intersectionNodePosition.x + w;
  const y2 = intersectionNodePosition.y + h;
  const x1 = targetPosition.x + (targetNode.measured?.width ?? 0) / 2;
  const y1 = targetPosition.y + (targetNode.measured?.height ?? 0) / 2;

  const xx1 = (x1 - x2) / (2 * w) - (y1 - y2) / (2 * h);
  const yy1 = (x1 - x2) / (2 * w) + (y1 - y2) / (2 * h);
  const a = 1 / (Math.abs(xx1) + Math.abs(yy1) || 1);
  const xx3 = a * xx1;
  const yy3 = a * yy1;
  const x = w * (xx3 + yy3) + x2;
  const y = h * (-xx3 + yy3) + y2;

  return { x, y };
}

// returns the position (top,right,bottom or right) passed node compared to the intersection point
function getEdgePosition(node: InternalNode, intersectionPoint: XYPosition) {
  const n = { ...node.internals.positionAbsolute, ...node };
  const nx = Math.round(n.x);
  const ny = Math.round(n.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + (n.measured?.width ?? 0) - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= n.y + (n.measured?.height ?? 0) - 1) {
    return Position.Bottom;
  }

  return Position.Top;
}

// returns the parameters (sx, sy, tx, ty, sourcePos, targetPos) you need to create an edge
export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}

export function getSmartBezierPath({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
}: {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
}) {
  const lineLength = 20;

  let tx_offset = targetX;
  let ty_offset = targetY;
  if (targetPosition === Position.Left) tx_offset -= lineLength;
  if (targetPosition === Position.Right) tx_offset += lineLength;
  if (targetPosition === Position.Top) ty_offset -= lineLength;
  if (targetPosition === Position.Bottom) ty_offset += lineLength;

  let sx_offset = sourceX;
  let sy_offset = sourceY;
  if (sourcePosition === Position.Left) sx_offset -= lineLength;
  if (sourcePosition === Position.Right) sx_offset += lineLength;
  if (sourcePosition === Position.Top) sy_offset -= lineLength;
  if (sourcePosition === Position.Bottom) sy_offset += lineLength;

  const [bezierPath, labelX, labelY] = getBezierPath({
    sourceX: sx_offset,
    sourceY: sy_offset,
    sourcePosition,
    targetX: tx_offset,
    targetY: ty_offset,
    targetPosition,
  });

  const path = `M ${sourceX} ${sourceY} L ${sx_offset} ${sy_offset} ${bezierPath.substring(bezierPath.indexOf("C"))} L ${targetX} ${targetY}`;

  return [path, labelX, labelY] as [string, number, number];
}

export function createNodesAndEdges() {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  nodes.push({ id: "target", data: { label: "Target" }, position: center });

  for (let i = 0; i < 8; i++) {
    const degrees = i * (360 / 8);
    const radians = degrees * (Math.PI / 180);
    const x = 250 * Math.cos(radians) + center.x;
    const y = 250 * Math.sin(radians) + center.y;

    nodes.push({ id: `${i}`, data: { label: "Source" }, position: { x, y } });

    edges.push({
      id: `edge-${i}`,
      target: "target",
      source: `${i}`,
      type: "floating",
      markerEnd: {
        type: MarkerType.Arrow,
      },
    });
  }

  return { nodes, edges };
}
