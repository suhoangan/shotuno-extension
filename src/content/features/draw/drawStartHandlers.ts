import { useEditorStore } from '../../../store/useEditorStore';
import {
  textDefaultHeight,
  textDefaultWidth,
  textFontSizeFromStrokeWidth,
} from '../../../store/editorDefaults';
import type { Shape, ToolType } from '../../../store/editorTypes';
import { buildSmartMeasureShape } from '../../components/canvas/measureTool';
import { scheduleTextEditEntry } from '../../components/canvas/scheduleTextEdit';
import type { StartDrawContext } from '../types';

export function startCrop(_tool: ToolType, ctx: StartDrawContext): boolean {
  useEditorStore.getState().setCropRect({
    x: ctx.pos.x, y: ctx.pos.y, width: 0, height: 0,
  });
  return true;
}

export function startOcr(_tool: ToolType, ctx: StartDrawContext): boolean {
  useEditorStore.getState().setOcrRect({
    x: ctx.pos.x, y: ctx.pos.y, width: 0, height: 0,
  });
  return true;
}

export function startCounter(_tool: ToolType, ctx: StartDrawContext): boolean {
  const id = Date.now().toString();
  const store = useEditorStore.getState();
  const existing = store.shapes.filter((s) => s.type === 'counter') as { count: number }[];
  const nextCount = existing.length > 0 ? Math.max(...existing.map((c) => c.count)) + 1 : 1;
  const settings = store.toolSettings.counter;
  ctx.addShape({
    id,
    type: 'counter',
    x: ctx.pos.x,
    y: ctx.pos.y,
    count: nextCount,
    color: ctx.selectedColor,
    strokeWidth: ctx.strokeWidth,
    counterStyle: settings?.counterStyle || store.counterStyle || 'circle',
  });
  store.setSelectedShapeIds([id]);
  ctx.setIsDrawing(false);
  ctx.saveHistory();
  return true;
}

export function startMeasure(_tool: ToolType, ctx: StartDrawContext): boolean {
  const store = useEditorStore.getState();
  if (store.smartMeasureBounds) {
    const shape = buildSmartMeasureShape(
      ctx.pos, store.smartMeasureBounds, ctx.selectedColor, ctx.strokeWidth,
    );
    if (shape) {
      ctx.addShape(shape as Shape);
      store.setSelectedShapeIds([shape.id]);
      ctx.saveHistory();
    }
    ctx.setIsDrawing(false);
    return true;
  }
  const id = Date.now().toString();
  ctx.setCurrentShapeId(id);
  ctx.addShape({
    id,
    type: 'measure',
    points: [ctx.pos.x, ctx.pos.y, ctx.pos.x, ctx.pos.y],
    color: ctx.selectedColor,
    strokeWidth: ctx.strokeWidth,
  });
  return true;
}

export function startArrow(_tool: ToolType, ctx: StartDrawContext): boolean {
  const id = Date.now().toString();
  ctx.setCurrentShapeId(id);
  const store = useEditorStore.getState();
  const settings = store.toolSettings.arrow;
  ctx.addShape({
    id,
    type: 'arrow',
    points: [ctx.pos.x, ctx.pos.y, ctx.pos.x, ctx.pos.y],
    color: ctx.selectedColor,
    strokeWidth: ctx.strokeWidth,
    isTwoWay: settings?.isTwoWay ?? store.isTwoWay,
    isLine: settings?.isLine ?? store.isLine,
  });
  return true;
}

export function startBoxTool(tool: ToolType, ctx: StartDrawContext): boolean {
  const id = Date.now().toString();
  ctx.setCurrentShapeId(id);
  const store = useEditorStore.getState();
  const settings = store.toolSettings[tool];
  ctx.addShape({
    id,
    type: tool as 'rect' | 'circle' | 'triangle' | 'blur' | 'magnifier',
    x: ctx.pos.x,
    y: ctx.pos.y,
    width: 0,
    height: 0,
    radius: 0,
    zoomLevel: 2,
    fontSize: 24,
    color: ctx.selectedColor,
    strokeWidth: ctx.strokeWidth,
    isSolid: settings?.isSolid ?? store.isSolid,
    blurType: settings?.blurType ?? store.blurType,
  } as Shape);
  return true;
}

export function startStrokeTool(tool: ToolType, ctx: StartDrawContext): boolean {
  const id = Date.now().toString();
  ctx.setCurrentShapeId(id);
  ctx.addShape({
    id,
    type: tool as 'brush' | 'highlight',
    points: [ctx.pos.x, ctx.pos.y],
    color: ctx.selectedColor,
    strokeWidth: ctx.strokeWidth,
  });
  return true;
}

export function startText(_tool: ToolType, ctx: StartDrawContext): boolean {
  const id = Date.now().toString();
  const fontSize = textFontSizeFromStrokeWidth(ctx.strokeWidth);
  const initialWidth = textDefaultWidth(fontSize);
  const initialHeight = textDefaultHeight(fontSize);
  ctx.addShape({
    id,
    type: 'text',
    x: ctx.pos.x,
    y: ctx.pos.y,
    text: '',
    color: ctx.selectedColor,
    fontSize,
    width: initialWidth,
    height: initialHeight,
    isSolid: true,
  });
  scheduleTextEditEntry(ctx.pendingTextEditTimer, ctx.setEditingText as any, {
    id,
    x: ctx.pos.x,
    y: ctx.pos.y,
    fontSize,
    color: ctx.selectedColor,
    width: initialWidth,
    height: initialHeight,
  });
  useEditorStore.getState().setSelectedShapeIds([id]);
  ctx.setIsDrawing(false);
  ctx.setCurrentShapeId(null);
  return true;
}
