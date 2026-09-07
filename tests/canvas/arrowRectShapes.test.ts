import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { startArrow, startBoxTool } from '@/content/features/draw/drawStartHandlers';
import { moveArrow, moveBox } from '@/content/features/draw/drawMoveHandlers';
import type { StartDrawContext, MoveDrawContext } from '@/content/features/types';

describe('Canvas Core - Arrow and Rectangle Shapes', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Arrow Shape Creation & Drag', () => {
    it('creates arrow shape with start position and updates end points on drag', () => {
      let createdShape: any = null;
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 100, y: 150 },
        selectedColor: '#ff0000',
        strokeWidth: 6,
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

      startArrow('arrow', startCtx);

      expect(createdShape).toBeDefined();
      expect(createdShape.type).toBe('arrow');
      expect(createdShape.points).toEqual([100, 150, 100, 150]);
      expect(createdShape.color).toBe('#ff0000');
      expect(createdShape.strokeWidth).toBe(6);
      expect(currentShapeId).toBe(createdShape.id);

      // Move arrow to (300, 450)
      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 100, y: 150 },
        pos: { x: 300, y: 450 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };

      const moved = moveArrow('arrow', moveCtx);
      expect(moved).toBe(true);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect((shape as any).points).toEqual([100, 150, 300, 450]);
    });
  });

  describe('Rectangle Box Tool Creation & Normalized Bounds', () => {
    it('creates rectangle shape and calculates normalized x, y, width, height when dragged in any direction', () => {
      let createdShape: any = null;
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 200, y: 200 },
        selectedColor: '#0000ff',
        strokeWidth: 4,
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

      startBoxTool('rect', startCtx);

      expect(createdShape).toBeDefined();
      expect(createdShape.type).toBe('rect');
      expect(createdShape.x).toBe(200);
      expect(createdShape.y).toBe(200);

      // Drag to top-left: from (200, 200) to (50, 80)
      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 200, y: 200 },
        pos: { x: 50, y: 80 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };

      moveBox('rect', moveCtx);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect((shape as any).x).toBe(50); // min(200, 50)
      expect((shape as any).y).toBe(80); // min(200, 80)
      expect((shape as any).width).toBe(150); // abs(50 - 200)
      expect((shape as any).height).toBe(120); // abs(80 - 200)
    });
  });
});
