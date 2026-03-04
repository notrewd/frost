import { BaseEdge, useInternalNode, type EdgeProps } from "@xyflow/react";

import { getEdgeParams, getSmartBezierPath } from "../../lib/utils";
import ArrowOpen from "../ui/icons/markers/arrow-open";

function AssociationEdge({ id, source, target, style }: EdgeProps) {
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
      <ArrowOpen />
      <BaseEdge
        id={id}
        className="react-flow__edge-path"
        path={path}
        markerEnd={"url(#arrow-open)"}
        style={style}
      />
    </>
  );
}

export default AssociationEdge;
