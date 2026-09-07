import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { startBoxTool } from '@/content/features/draw/drawStartHandlers';
import { moveMagnifier, moveMeasure } from '@/content/features/draw/drawMoveHandlers';
import {
  canMeasureHeight,
  canMeasureWidth,
  pickSmartMeasureAxis,
  buildSmartMeasureShape,
  SmartMeasureBounds,
} from '@/content/components/canvas/measureTool';
import type { StartDrawContext, MoveDrawContext } from '@/content/features/types';

describe('Canvas Core - Magnifier and Measure Shapes', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Magnifier Circular Lens Geometry', () => {
    it('calculates radius and center offsets when dragged', () => {
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 300, y: 300 },
        selectedColor: '#000',
        strokeWidth: 2,
        addShape: (s: any) => {
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

      startBoxTool('magnifier', startCtx);

      // Drag 30px horizontally and 40px vertically -> distance sqrt(30^2 + 40^2) = 50px
      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 300, y: 300 },
        pos: { x: 330, y: 340 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };

      moveMagnifier('magnifier', moveCtx);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect((shape as any).radius).toBe(50);
      expect((shape as any).x).toBe(250); // startPos.x - radius (300 - 50 = 250)
      expect((shape as any).y).toBe(250); // startPos.y - radius (300 - 50 = 250)
    });
  });

  describe('Measure Tool & Smart Measure Bounds', () => {
    const mockBounds: SmartMeasureBounds = {
      top: 100,
      bottom: 300,
      left: 150,
      right: 450,
      centerX: 300,
      centerY: 200,
      hasVertical: true,
      hasHorizontal: true,
    };

    it('determines dimension feasibility with canMeasureHeight and canMeasureWidth', () => {
      expect(canMeasureHeight(mockBounds)).toBe(true);
      expect(canMeasureWidth(mockBounds)).toBe(true);

      const collapsed: SmartMeasureBounds = { ...mockBounds, top: 100, bottom: 101 };
      expect(canMeasureHeight(collapsed)).toBe(false);
    });

    it('picks height axis when pointer is closer to top/bottom edges', () => {
      const posNearTop = { x: 300, y: 110 }; // 10px from top vs 150px from left
      const axis = pickSmartMeasureAxis(posNearTop, mockBounds);
      expect(axis).toBe('height');
    });

    it('picks width axis when pointer is closer to left/right edges', () => {
      const posNearLeft = { x: 160, y: 200 }; // 10px from left vs 100px from top
      const axis = pickSmartMeasureAxis(posNearLeft, mockBounds);
      expect(axis).toBe('width');
    });

    it('builds smart measure shape with exact coordinate span', () => {
      const shape = buildSmartMeasureShape({ x: 250, y: 110 }, mockBounds, '#ef4444', 3);
      expect(shape).toBeDefined();
      expect(shape?.type).toBe('measure');
      expect(shape?.points).toEqual([250, 100, 250, 300]); // vertical line along x=250 from top(100) to bottom(300)
    });
  });

  describe('Manual Measure Axis Snapping', () => {
    it('snaps to horizontal line when vertical displacement is small and Shift is not pressed', () => {
      const shapeId = 'measure-1';
      useEditorStore.getState().addShape({
        id: shapeId,
        tool: 'measure',
        points: [100, 100, 100, 100],
        color: '#000',
        strokeWidth: 2,
      });

      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId: shapeId,
        startPos: { x: 100, y: 100 },
        pos: { x: 300, y: 105 }, // dx = 200, dy = 5 (< 200 * 0.26)
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: { shiftKey: false } } as any,
        lastEdgeCheckTime: { current: 0 },
      };

      moveMeasure('measure', moveCtx);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === shapeId);
      expect((shape as any).points).toEqual([100, 100, 300, 100]); // snapped Y to 100
    });
  });
});
