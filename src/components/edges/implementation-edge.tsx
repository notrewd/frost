import { useInternalNode, type EdgeProps } from "@xyflow/react";

import { getEdgeParams, getSmartBezierPath } from "../../lib/utils";
import ArrowClosed from "../ui/icons/markers/arrow-closed";
import DashedBaseEdge from "./dashed-base-edge";

function ImplementationEdge({ id, source, target, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const [path] = getSmartBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <ArrowClosed />
      <DashedBaseEdge
        id={id}
        className="react-flow__edge-path"
        path={path}
        markerEnd={"url(#arrow-closed)"}
        style={{
          strokeDasharray: "5 5",
          ...style,
        }}
      />
    </>
  );
}

export default ImplementationEdge;
