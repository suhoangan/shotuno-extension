import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { startCounter, startBoxTool } from '@/content/features/draw/drawStartHandlers';
import { moveBox } from '@/content/features/draw/drawMoveHandlers';
import type { StartDrawContext, MoveDrawContext } from '@/content/features/types';

describe('Canvas Core - Blur, Smart Blur and Counter Badges', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Sequential Counter Badges', () => {
    it('automatically starts with count 1 when no counters exist', () => {
      let createdShape: any = null;

      const startCtx: StartDrawContext = {
        pos: { x: 50, y: 50 },
        selectedColor: '#10b981',
        strokeWidth: 4,
        addShape: (s: any) => {
          createdShape = s;
          useEditorStore.getState().addShape(s);
        },
        setCurrentShapeId: vi.fn(),
        setIsDrawing: vi.fn(),
        saveHistory: vi.fn(),
        pendingTextEditTimer: { current: null },
        setEditingText: vi.fn(),
      };

      startCounter('counter', startCtx);

      expect(createdShape).toBeDefined();
      expect(createdShape.type).toBe('counter');
      expect(createdShape.count).toBe(1);
      expect(createdShape.x).toBe(50);
      expect(createdShape.y).toBe(50);
    });

    it('auto-increments count when subsequent counter badges are placed', () => {
      const createCounterAt = (x: number, y: number) => {
        let created: any = null;
        const ctx: StartDrawContext = {
          pos: { x, y },
          selectedColor: '#10b981',
          strokeWidth: 4,
          addShape: (s: any) => {
            created = s;
            useEditorStore.getState().addShape(s);
          },
          setCurrentShapeId: vi.fn(),
          setIsDrawing: vi.fn(),
          saveHistory: vi.fn(),
          pendingTextEditTimer: { current: null },
          setEditingText: vi.fn(),
        };
        startCounter('counter', ctx);
        return created;
      };

      const c1 = createCounterAt(10, 10);
      const c2 = createCounterAt(20, 20);
      const c3 = createCounterAt(30, 30);

      expect(c1.count).toBe(1);
      expect(c2.count).toBe(2);
      expect(c3.count).toBe(3);
    });

    it('starts at count 1 when continueCounter is set to false', () => {
      const createCounterAt = (x: number, y: number) => {
        let created: any = null;
        const ctx: StartDrawContext = {
          pos: { x, y },
          selectedColor: '#10b981',
          strokeWidth: 4,
          addShape: (s: any) => {
            created = s;
            useEditorStore.getState().addShape(s);
          },
          setCurrentShapeId: vi.fn(),
          setIsDrawing: vi.fn(),
          saveHistory: vi.fn(),
          pendingTextEditTimer: { current: null },
          setEditingText: vi.fn(),
        };
        startCounter('counter', ctx);
        return created;
      };

      const c1 = createCounterAt(10, 10);
      const c2 = createCounterAt(20, 20);
      expect(c1.count).toBe(1);
      expect(c2.count).toBe(2);

      // Disable continueCounter
      useEditorStore.getState().setContinueCounter(false);
      const c3 = createCounterAt(30, 30);
      expect(c3.count).toBe(1);
    });
  });

  describe('Manual Blur Shape Creation', () => {
    it('creates blur shape with selected blurType and calculated dimensions', () => {
      let createdShape: any = null;
      let currentShapeId: string | null = null;

      const startCtx: StartDrawContext = {
        pos: { x: 100, y: 100 },
        selectedColor: '#000000',
        strokeWidth: 0,
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

      useEditorStore.getState().setBlurType('pixelate');
      startBoxTool('blur', startCtx);

      expect(createdShape.type).toBe('blur');
      expect(createdShape.blurType).toBe('pixelate');

      const moveCtx: MoveDrawContext = {
        isDrawing: true,
        currentShapeId,
        startPos: { x: 100, y: 100 },
        pos: { x: 250, y: 160 },
        updateShape: (id: string, props: any) => {
          useEditorStore.getState().updateShape(id, props);
        },
        e: { evt: {} } as any,
        lastEdgeCheckTime: { current: 0 },
      };
      moveBox('blur', moveCtx);

      const shape = useEditorStore.getState().shapes.find((s) => s.id === currentShapeId);
      expect(shape).toBeDefined();
      expect((shape as any).width).toBe(150);
      expect((shape as any).height).toBe(60);
    });
  });

  describe('Sensitive Pattern Regex Matching', () => {
    it('matches email addresses and api tokens accurately', () => {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i;
      expect(emailRegex.test('contact@shotuno.com')).toBe(true);
      expect(emailRegex.test('not_an_email')).toBe(false);

      const githubTokenRegex = /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/;
      expect(githubTokenRegex.test('ghp_1234567890abcdef1234567890abcdef1234')).toBe(true);
      expect(githubTokenRegex.test('regular_text_token')).toBe(false);
    });
  });
});
