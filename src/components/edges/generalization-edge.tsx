import {
  BaseEdge,
  getBezierPath,
  useInternalNode,
  type EdgeProps,
} from "@xyflow/react";

import { getEdgeParams } from "../../lib/utils";
import ArrowClosed from "../ui/icons/markers/arrow-closed";

function GeneralizationEdge({ id, source, target, style }: EdgeProps) {
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
      <ArrowClosed />
      <BaseEdge
        id={id}
        className="react-flow__edge-path"
        path={path}
        markerEnd={"url(#arrow-closed)"}
        style={style}
      />
    </>
  );
}

export default GeneralizationEdge;
