import { useEditorStore } from '../../../store/useEditorStore';
import type { ToolType } from '../../../store/editorTypes';
import type { MoveDrawContext } from '../types';

export function moveCrop(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing) return false;
  useEditorStore.getState().setCropRect({
    x: Math.min(ctx.startPos.x, ctx.pos.x),
    y: Math.min(ctx.startPos.y, ctx.pos.y),
    width: Math.abs(ctx.pos.x - ctx.startPos.x),
    height: Math.abs(ctx.pos.y - ctx.startPos.y),
  });
  return true;
}

export function moveOcr(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing) return false;
  useEditorStore.getState().setOcrRect({
    x: Math.min(ctx.startPos.x, ctx.pos.x),
    y: Math.min(ctx.startPos.y, ctx.pos.y),
    width: Math.abs(ctx.pos.x - ctx.startPos.x),
    height: Math.abs(ctx.pos.y - ctx.startPos.y),
  });
  return true;
}

export function moveArrow(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing || !ctx.currentShapeId) return false;
  ctx.updateShape(ctx.currentShapeId, {
    points: [ctx.startPos.x, ctx.startPos.y, ctx.pos.x, ctx.pos.y],
  });
  return true;
}

export function moveMeasure(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing) {
    if (ctx.findEdges) {
      const now = Date.now();
      if (now - ctx.lastEdgeCheckTime.current > 16) {
        ctx.lastEdgeCheckTime.current = now;
        useEditorStore.getState().setSmartMeasureBounds(
          ctx.findEdges(ctx.pos.x, ctx.pos.y) as any,
        );
      }
    } else if (useEditorStore.getState().smartMeasureBounds) {
      useEditorStore.getState().setSmartMeasureBounds(null);
    }
    return true;
  }
  if (!ctx.currentShapeId) return false;
  let snapX = ctx.pos.x;
  let snapY = ctx.pos.y;
  const dx = Math.abs(ctx.pos.x - ctx.startPos.x);
  const dy = Math.abs(ctx.pos.y - ctx.startPos.y);
  if (!ctx.e.evt?.shiftKey) {
    if (dy < dx * 0.26) snapY = ctx.startPos.y;
    else if (dx < dy * 0.26) snapX = ctx.startPos.x;
  }
  ctx.updateShape(ctx.currentShapeId, {
    points: [ctx.startPos.x, ctx.startPos.y, snapX, snapY],
  });
  return true;
}

export function moveBox(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing || !ctx.currentShapeId) return false;
  ctx.updateShape(ctx.currentShapeId, {
    x: Math.min(ctx.startPos.x, ctx.pos.x),
    y: Math.min(ctx.startPos.y, ctx.pos.y),
    width: Math.abs(ctx.pos.x - ctx.startPos.x),
    height: Math.abs(ctx.pos.y - ctx.startPos.y),
  });
  return true;
}

export function moveMagnifier(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing || !ctx.currentShapeId) return false;
  const radius = Math.sqrt(
    (ctx.pos.x - ctx.startPos.x) ** 2 + (ctx.pos.y - ctx.startPos.y) ** 2,
  );
  ctx.updateShape(ctx.currentShapeId, {
    x: ctx.startPos.x - radius,
    y: ctx.startPos.y - radius,
    radius,
  });
  return true;
}

export function moveStroke(_tool: ToolType, ctx: MoveDrawContext): boolean {
  if (!ctx.isDrawing || !ctx.currentShapeId) return false;
  const shape = useEditorStore.getState().shapes.find((s) => s.id === ctx.currentShapeId);
  if (shape && (shape.type === 'brush' || shape.type === 'highlight') && 'points' in shape) {
    ctx.updateShape(ctx.currentShapeId, { points: [...shape.points, ctx.pos.x, ctx.pos.y] });
  }
  return true;
}
