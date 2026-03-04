import {
  BaseEdge,
  getBezierPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react";

import { getEdgeParams } from "../../lib/utils";
import DiamondFilled from "../ui/icons/markers/diamond-filled";

function CompositionEdge({ id, source, target, style }: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  );

  const [path] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });

  return (
    <>
      <DiamondFilled />
      <BaseEdge
        id={id}
        className="react-flow__edge-path"
        path={path}
        markerEnd={"url(#diamond-filled)"}
        style={style}
      />
    </>
  );
}

export default CompositionEdge;
