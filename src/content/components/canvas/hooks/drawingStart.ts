import type { ToolType } from '../../../../store/editorTypes';
import { ensureBuiltinFeaturesRegistered } from '../../../features/registerBuiltinFeatures';
import { startDrawForTool } from '../../../features/registry';

type Point = { x: number; y: number };

/** Create the shape (or crop/counter/text) for a new draw gesture. */
export function startDrawingShape(opts: {
  activeTool: string;
  pos: Point;
  selectedColor: string;
  strokeWidth: number;
  addShape: (shape: any) => void;
  saveHistory: () => void;
  setIsDrawing: (v: boolean) => void;
  setCurrentShapeId: (id: string | null) => void;
  setEditingText: (text: any | null) => void;
  pendingTextEditTimer: React.MutableRefObject<number | null>;
}): boolean {
  ensureBuiltinFeaturesRegistered();
  const {
    activeTool, pos, selectedColor, strokeWidth,
    addShape, saveHistory, setIsDrawing, setCurrentShapeId, setEditingText, pendingTextEditTimer,
  } = opts;

  const handled = startDrawForTool(activeTool as ToolType, {
    pos,
    selectedColor,
    strokeWidth,
    addShape,
    saveHistory,
    setIsDrawing,
    setCurrentShapeId,
    setEditingText,
    pendingTextEditTimer,
  });
  if (!handled) setIsDrawing(false);
  return true;
}
