import {
  BaseEdge,
  useInternalNode,
  type EdgeProps,
  getStraightPath,
  getSmoothStepPath,
} from "@xyflow/react";

import { getEdgeParams, getSmartBezierPath } from "../../lib/utils";
import ArrowClosed from "../ui/icons/markers/arrow-closed";
import { useSettingsStore } from "@/stores/settings-store";
import { useShallow } from "zustand/react/shallow";

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
