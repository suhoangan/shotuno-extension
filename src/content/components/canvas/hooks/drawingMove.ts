import { useEditorStore } from '../../../../store/useEditorStore';

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
  const {
    e, pos, activeTool, isDrawing, currentShapeId, startPos, selectionBox,
    shapes, stageRef, findEdges, lastEdgeCheckTime, updateShape, setSelectedShapeIds, setSelectionBox,
  } = opts;

  if (isDrawing && activeTool === 'crop') {
    useEditorStore.getState().setCropRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    });
    return true;
  }

  if (isDrawing && activeTool === 'ocr') {
    useEditorStore.getState().setOcrRect({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    });
    return true;
  }

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

  if (!isDrawing) {
    if (activeTool === 'measure' && findEdges) {
      const now = Date.now();
      if (now - lastEdgeCheckTime.current > 16) {
        lastEdgeCheckTime.current = now;
        useEditorStore.getState().setSmartMeasureBounds(findEdges(pos.x, pos.y) as any);
      }
    } else if (useEditorStore.getState().smartMeasureBounds) {
      useEditorStore.getState().setSmartMeasureBounds(null);
    }
    return true;
  }

  if (!currentShapeId) return true;

  if (activeTool === 'arrow') {
    updateShape(currentShapeId, { points: [startPos.x, startPos.y, pos.x, pos.y] });
  } else if (activeTool === 'measure') {
    let snapX = pos.x;
    let snapY = pos.y;
    const dx = Math.abs(pos.x - startPos.x);
    const dy = Math.abs(pos.y - startPos.y);
    if (!e.evt?.shiftKey) {
      if (dy < dx * 0.26) snapY = startPos.y;
      else if (dx < dy * 0.26) snapX = startPos.x;
    }
    updateShape(currentShapeId, { points: [startPos.x, startPos.y, snapX, snapY] });
  } else if (['rect', 'circle', 'triangle', 'blur'].includes(activeTool)) {
    updateShape(currentShapeId, {
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      width: Math.abs(pos.x - startPos.x),
      height: Math.abs(pos.y - startPos.y),
    });
  } else if (activeTool === 'magnifier') {
    // startPos is lens center; store top-left so Transformer bounds stay aligned
    const radius = Math.sqrt((pos.x - startPos.x) ** 2 + (pos.y - startPos.y) ** 2);
    updateShape(currentShapeId, {
      x: startPos.x - radius,
      y: startPos.y - radius,
      radius,
    });
  } else if (['brush', 'highlight'].includes(activeTool)) {
    const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
    if (shape && (shape.type === 'brush' || shape.type === 'highlight') && 'points' in shape) {
      updateShape(currentShapeId, { points: [...shape.points, pos.x, pos.y] });
    }
  }

  return true;
}
