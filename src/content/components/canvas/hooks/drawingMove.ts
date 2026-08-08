import { useEditorStore } from '../../../../store/useEditorStore';
import type { ToolType } from '../../../../store/editorTypes';
import { ensureBuiltinFeaturesRegistered } from '../../../features/registerBuiltinFeatures';
import { moveDrawForTool } from '../../../features/registry';

type Point = { x: number; y: number };
type SelectionBox = { x: number; y: number; width: number; height: number; visible: boolean };

function haveIntersection(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number },
) {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
}

/** Update crop rect / selection marquee / in-progress shape while the pointer moves. */
export function updateDrawingOnMove(opts: {
  e: { evt?: { shiftKey?: boolean } };
  pos: Point;
  activeTool: string;
  isDrawing: boolean;
  currentShapeId: string | null;
  startPos: Point;
  selectionBox: SelectionBox;
  shapes: { id: string }[];
  stageRef: React.RefObject<{ findOne: (sel: string) => any; getLayer?: () => any } | null>;
  findEdges?: (x: number, y: number) => unknown;
  lastEdgeCheckTime: React.MutableRefObject<number>;
  updateShape: (id: string, props: Record<string, unknown>) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  setSelectionBox: (updater: (prev: SelectionBox) => SelectionBox) => void;
}): boolean {
  ensureBuiltinFeaturesRegistered();
  const {
    e, pos, activeTool, isDrawing, currentShapeId, startPos, selectionBox,
    shapes, stageRef, findEdges, lastEdgeCheckTime, updateShape, setSelectedShapeIds, setSelectionBox,
  } = opts;

  // Select marquee stays in the shell (not a feature module).
  if (selectionBox.visible && activeTool === 'select') {
    const newWidth = pos.x - selectionBox.x;
    const newHeight = pos.y - selectionBox.y;
    setSelectionBox((prev) => ({ ...prev, width: newWidth, height: newHeight }));
    const box = {
      x: Math.min(selectionBox.x, selectionBox.x + newWidth),
      y: Math.min(selectionBox.y, selectionBox.y + newHeight),
      width: Math.abs(newWidth),
      height: Math.abs(newHeight),
    };
    const selectedIds = shapes
      .filter((shape) => {
        const node = stageRef.current?.findOne(`#${shape.id}`);
        if (!node) return false;
        const nodeRect = node.getClientRect({ relativeTo: stageRef.current?.getLayer?.() });
        return haveIntersection(box, nodeRect);
      })
      .map((s) => s.id);
    setSelectedShapeIds(selectedIds);
    return true;
  }

  const handled = moveDrawForTool(activeTool as ToolType, {
    e,
    pos,
    isDrawing,
    currentShapeId,
    startPos,
    updateShape,
    findEdges,
    lastEdgeCheckTime,
  });

  if (handled) return true;

  // Clear measure hover when leaving the measure tool.
  if (!isDrawing && useEditorStore.getState().smartMeasureBounds && activeTool !== 'measure') {
    useEditorStore.getState().setSmartMeasureBounds(null);
  }

  return true;
}
