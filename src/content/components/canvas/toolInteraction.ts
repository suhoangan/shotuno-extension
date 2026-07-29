import type { ToolType } from '../../../store/editorTypes';

// These tools operate on the canvas as a whole, so a click on top of a shape
// must reach the stage instead of grabbing that shape.
const CANVAS_LEVEL_TOOLS: ToolType[] = ['pan', 'crop', 'ocr'];

/**
 * Drawing tools still let you grab existing shapes on hover/click.
 * Empty-canvas clicks keep creating with the active tool.
 */
export function canMoveShapesWith(tool: ToolType) {
  return !isCanvasLevelTool(tool);
}

export function isCanvasLevelTool(tool: ToolType) {
  return CANVAS_LEVEL_TOOLS.includes(tool);
}

export function cursorForTool(tool: ToolType) {
  if (tool === 'pan') return 'grab';
  if (tool === 'select') return 'default';
  if (tool === 'text' || tool === 'highlight') return 'text';
  return 'crosshair';
}

/** Walk up from a Konva event target to a known shape id, if any. */
export function findShapeIdFromTarget(
  target: any,
  knownIds: Set<string> | string[],
): string | null {
  const ids = knownIds instanceof Set ? knownIds : new Set(knownIds);
  let node = target;
  while (node && typeof node.getClassName === 'function' && node.getClassName() !== 'Stage') {
    const id = typeof node.id === 'function' ? node.id() : node.attrs?.id;
    if (id != null && ids.has(String(id))) return String(id);
    node = node.getParent?.();
  }
  return null;
}
