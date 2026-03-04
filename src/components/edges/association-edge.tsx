import {
  BaseEdge,
  useInternalNode,
  type EdgeProps,
  getStraightPath,
  getSmoothStepPath,
} from "@xyflow/react";

import { getEdgeParams, getSmartBezierPath } from "../../lib/utils";
import ArrowOpen from "../ui/icons/markers/arrow-open";
import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";

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

  const { edgeStyle } = useSettingsStore(
    useShallow((state) => ({
      edgeStyle: state.edge_style,
    })),
  );

  let path;
  if (edgeStyle === "straight") {
    [path] = getStraightPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
    });
  } else if (edgeStyle === "smoothstep") {
    [path] = getSmoothStepPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty,
    });
  } else {
    [path] = getSmartBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty,
    });
  }

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
