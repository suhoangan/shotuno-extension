import { useEditorStore } from '../../../../store/useEditorStore';
import {
  textDefaultHeight,
  textDefaultWidth,
  textFontSizeFromStrokeWidth,
} from '../../../../store/editorDefaults';
import { buildSmartMeasureShape } from '../measureTool';
import { scheduleTextEditEntry } from '../scheduleTextEdit';

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
  const {
    activeTool, pos, selectedColor, strokeWidth,
    addShape, saveHistory, setIsDrawing, setCurrentShapeId, setEditingText, pendingTextEditTimer,
  } = opts;

  if (activeTool === 'crop') {
    useEditorStore.getState().setCropRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    return true;
  }

  if (activeTool === 'ocr') {
    useEditorStore.getState().setOcrRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    return true;
  }

  if (activeTool === 'counter') {
    const id = Date.now().toString();
    const store = useEditorStore.getState();
    const existingCounters = store.shapes.filter((s) => s.type === 'counter') as { count: number }[];
    const nextCount = existingCounters.length > 0
      ? Math.max(...existingCounters.map((c) => c.count)) + 1
      : 1;
    const settings = store.toolSettings.counter || store.toolSettings[activeTool];
    addShape({
      id,
      type: 'counter',
      x: pos.x,
      y: pos.y,
      count: nextCount,
      color: selectedColor,
      strokeWidth,
      counterStyle: settings?.counterStyle || store.counterStyle || 'circle',
    });
    store.setSelectedShapeIds([id]);
    setIsDrawing(false);
    saveHistory();
    return true;
  }

  if (activeTool === 'measure' && useEditorStore.getState().smartMeasureBounds) {
    const store = useEditorStore.getState();
    const measureBounds = store.smartMeasureBounds!;
    const shape = buildSmartMeasureShape(pos, measureBounds, selectedColor, strokeWidth);
    if (shape) {
      addShape(shape);
      store.setSelectedShapeIds([shape.id]);
      saveHistory();
    }
    setIsDrawing(false);
    return true;
  }

  const id = Date.now().toString();
  setCurrentShapeId(id);
  const store = useEditorStore.getState();
  const settings = store.toolSettings[activeTool];

  if (activeTool === 'arrow') {
    addShape({
      id,
      type: 'arrow',
      points: [pos.x, pos.y, pos.x, pos.y],
      color: selectedColor,
      strokeWidth,
      isTwoWay: settings?.isTwoWay ?? store.isTwoWay,
      isLine: settings?.isLine ?? store.isLine,
    });
  } else if (activeTool === 'measure') {
    addShape({
      id,
      type: 'measure',
      points: [pos.x, pos.y, pos.x, pos.y],
      color: selectedColor,
      strokeWidth,
    });
  } else if (['rect', 'circle', 'triangle', 'blur', 'magnifier'].includes(activeTool)) {
    addShape({
      id,
      type: activeTool,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      radius: 0,
      zoomLevel: 2,
      fontSize: 24,
      color: selectedColor,
      strokeWidth,
      isSolid: settings?.isSolid ?? store.isSolid,
      blurType: settings?.blurType ?? store.blurType,
    });
  } else if (['brush', 'highlight'].includes(activeTool)) {
    addShape({
      id,
      type: activeTool,
      points: [pos.x, pos.y],
      color: selectedColor,
      strokeWidth,
    });
  } else if (activeTool === 'text') {
    const fontSize = textFontSizeFromStrokeWidth(strokeWidth);
    const initialWidth = textDefaultWidth(fontSize);
    const initialHeight = textDefaultHeight(fontSize);

    addShape({
      id,
      type: 'text',
      x: pos.x,
      y: pos.y,
      text: '',
      color: selectedColor,
      fontSize,
      width: initialWidth,
      height: initialHeight,
      isSolid: true,
    });

    scheduleTextEditEntry(pendingTextEditTimer, setEditingText, {
      id,
      x: pos.x,
      y: pos.y,
      fontSize,
      color: selectedColor,
      width: initialWidth,
      height: initialHeight,
    });
    useEditorStore.getState().setSelectedShapeIds([id]);
    setIsDrawing(false);
    setCurrentShapeId(null);
  }

  return true;
}
