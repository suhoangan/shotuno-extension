import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { startBoxTool } from '@/content/features/draw/drawStartHandlers';
import { moveBox } from '@/content/features/draw/drawMoveHandlers';
import {
  getStickerLayout,
  STICKER_MIN_SIZE,
  STICKER_GLYPH_RATIO,
} from '@/content/components/canvas/shapes/stickerLayout';
import type { StartDrawContext, MoveDrawContext } from '@/content/features/types';

describe('Canvas Core - Highlight Area and Sticker Layouts', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    vi.stubGlobal('document', {
      createElement: vi.fn().mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            getContext: () => ({
              font: '',
              textBaseline: '',
              measureText: () => ({
                actualBoundingBoxAscent: 70,
                actualBoundingBoxDescent: 20,
              }),
            }),
          };
        }
        return {};
      }),
    });
  });

  describe('Highlight Area Spotlight Creation', () => {
    it('creates highlight-area shape and tracks spotlight crop coordinates', () => {
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 50, y: 80 },
        selectedColor: '#000',
        strokeWidth: 0,
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

      startBoxTool('highlight-area', startCtx);

      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 50, y: 80 },
        pos: { x: 350, y: 280 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };

      moveBox('highlight-area', moveCtx);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect(shape?.type).toBe('highlight-area');
      expect((shape as any).x).toBe(50);
      expect((shape as any).y).toBe(80);
      expect((shape as any).width).toBe(300);
      expect((shape as any).height).toBe(200);
    });
  });

  describe('getStickerLayout Calculations', () => {
    it('computes proportional font size based on STICKER_GLYPH_RATIO and centers glyph', () => {
      const layout = getStickerLayout(100, 100, '🔥');

      expect(layout.width).toBe(100);
      expect(layout.height).toBe(100);
      expect(layout.fontSize).toBeCloseTo(100 * STICKER_GLYPH_RATIO, 1);
      expect(layout.glyphBox).toBe(layout.fontSize * 3);
      expect(layout.textX).toBe((100 - layout.glyphBox) / 2);
    });

    it('enforces minimum boundary values for tiny dimensions', () => {
      const layout = getStickerLayout(0, 0, '⭐');
      expect(layout.width).toBe(1);
      expect(layout.height).toBe(1);
      expect(layout.fontSize).toBe(4); // min font size floor
    });

    it('defines standard STICKER_MIN_SIZE of 20px', () => {
      expect(STICKER_MIN_SIZE).toBe(20);
    });
  });

  describe('Sticker Shape Store Integration', () => {
    it('spawns and adds sticker shape to store with emoji and dimensions', () => {
      const store = useEditorStore.getState();
      const id = 'sticker-test-1';
      store.addShape({
        id,
        type: 'sticker',
        x: 150,
        y: 200,
        width: 80,
        height: 80,
        emoji: '🔥',
      });
      store.setSelectedShapeIds([id]);

      const added = useEditorStore.getState().shapes.find((s) => s.id === id);
      expect(added).toBeDefined();
      expect(added?.type).toBe('sticker');
      expect((added as any).emoji).toBe('🔥');
      expect(useEditorStore.getState().selectedShapeIds).toEqual([id]);
    });
  });
});
