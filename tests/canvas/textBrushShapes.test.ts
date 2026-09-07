import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { startText, startStrokeTool } from '@/content/features/draw/drawStartHandlers';
import { moveStroke } from '@/content/features/draw/drawMoveHandlers';
import type { StartDrawContext, MoveDrawContext } from '@/content/features/types';

describe('Canvas Core - Text and Brush Shapes', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    vi.stubGlobal('window', {
      setTimeout: (fn: Function) => setTimeout(fn, 0),
      clearTimeout: (id: any) => clearTimeout(id),
    });
  });

  describe('Text Shape Initialization & Direct Editing', () => {
    it('creates text shape with dynamic font size calculated from stroke width', () => {
      let createdShape: any = null;
      const setEditingTextMock = vi.fn();

      const startCtx: StartDrawContext = {
        pos: { x: 150, y: 220 },
        selectedColor: '#3b82f6',
        strokeWidth: 4,
        addShape: (s: any) => {
          createdShape = s;
          useEditorStore.getState().addShape(s);
        },
        setCurrentShapeId: vi.fn(),
        setIsDrawing: vi.fn(),
        saveHistory: vi.fn(),
        pendingTextEditTimer: { current: null },
        setEditingText: setEditingTextMock,
      };

      startText('text', startCtx);

      expect(createdShape).toBeDefined();
      expect(createdShape.type).toBe('text');
      expect(createdShape.x).toBe(150);
      expect(createdShape.y).toBe(220);
      expect(createdShape.fontSize).toBeGreaterThan(0);
      expect(createdShape.color).toBe('#3b82f6');
      expect(useEditorStore.getState().selectedShapeIds).toContain(createdShape.id);
    });
  });

  describe('Brush Freehand Stroke Collection', () => {
    it('initializes brush point array on start and appends points along drag path', () => {
      let createdShape: any = null;
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 50, y: 50 },
        selectedColor: '#ef4444',
        strokeWidth: 5,
        addShape: (s: any) => {
          createdShape = s;
          useEditorStore.getState().addShape(s);
        },
        setCurrentShapeId: (id: string | null) => {
          currentShapeId = id;
        },
        setIsDrawing: vi.fn(),
        saveHistory: vi.fn(),
        pendingTextEditTimer: { current: null },
        setEditingText: vi.fn(),
      };

      startStrokeTool('brush', startCtx);

      expect(createdShape).toBeDefined();
      expect(createdShape.type).toBe('brush');
      expect(createdShape.points).toEqual([50, 50]);

      // Move point 1: (60, 65)
      const moveCtx1: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 50, y: 50 },
        pos: { x: 60, y: 65 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };
      moveStroke('brush', moveCtx1);

      // Move point 2: (75, 80)
      const moveCtx2: MoveDrawContext = {
        ...moveCtx1,
        pos: { x: 75, y: 80 },
      };
      moveStroke('brush', moveCtx2);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect((shape as any).points).toEqual([50, 50, 60, 65, 75, 80]);
    });
  });
});
