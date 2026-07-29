import { describe, expect, it } from 'vitest';
import type { ToolType } from '@/store/editorTypes';
import {
  canMoveShapesWith,
  cursorForTool,
  findShapeIdFromTarget,
  isCanvasLevelTool,
} from '@/content/components/canvas/toolInteraction';

const ALL_TOOLS: ToolType[] = [
  'select',
  'pan',
  'arrow',
  'measure',
  'rect',
  'circle',
  'triangle',
  'text',
  'brush',
  'blur',
  'image',
  'crop',
  'counter',
  'magnifier',
  'highlight',
  'ocr',
];

describe('toolInteraction', () => {
  it('marks pan/crop/ocr as canvas-level', () => {
    expect(ALL_TOOLS.filter(isCanvasLevelTool)).toEqual(['pan', 'crop', 'ocr']);
  });

  it('allows moving shapes with drawing tools but not canvas-level', () => {
    expect(canMoveShapesWith('arrow')).toBe(true);
    expect(canMoveShapesWith('select')).toBe(true);
    expect(canMoveShapesWith('pan')).toBe(false);
    expect(canMoveShapesWith('crop')).toBe(false);
    expect(canMoveShapesWith('ocr')).toBe(false);
  });

  it('maps cursors per tool family', () => {
    expect(cursorForTool('pan')).toBe('grab');
    expect(cursorForTool('select')).toBe('default');
    expect(cursorForTool('text')).toBe('text');
    expect(cursorForTool('highlight')).toBe('text');
    expect(cursorForTool('arrow')).toBe('crosshair');
    expect(cursorForTool('blur')).toBe('crosshair');
  });

  it('walks Konva parents to find known shape ids', () => {
    const stage = {
      getClassName: () => 'Stage',
      id: () => 'stage',
      getParent: () => null,
    };
    const shape = {
      getClassName: () => 'Group',
      id: () => 'shape-1',
      getParent: () => stage,
    };
    const child = {
      getClassName: () => 'Line',
      id: () => '',
      getParent: () => shape,
    };

    expect(findShapeIdFromTarget(child, ['shape-1', 'shape-2'])).toBe('shape-1');
    expect(findShapeIdFromTarget(child, new Set(['other']))).toBeNull();
    expect(findShapeIdFromTarget(stage, ['shape-1'])).toBeNull();
  });
});

