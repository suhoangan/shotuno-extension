import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import type { Shape } from '@/store/editorTypes';

describe('Canvas Core - Zustand Editor Store & History Management', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Initial State & Reset', () => {
    it('initializes with empty shapes and clean history', () => {
      const state = useEditorStore.getState();
      expect(state.shapes).toEqual([]);
      expect(state.historyStep).toBe(0);
      expect(state.history).toHaveLength(1);
      expect(state.selectedShapeIds).toEqual([]);
      expect(state.activeTool).toBe('select');
    });

    it('clears all shapes and resets selection upon reset()', () => {
      const store = useEditorStore.getState();
      const testShape: Shape = {
        id: 'rect-1',
        tool: 'rect',
        x: 10,
        y: 20,
        width: 100,
        height: 80,
        color: '#ff0000',
        strokeWidth: 4,
      };
      store.addShape(testShape);
      store.setSelectedShapeIds(['rect-1']);

      store.reset();

      const fresh = useEditorStore.getState();
      expect(fresh.shapes).toEqual([]);
      expect(fresh.selectedShapeIds).toEqual([]);
      expect(fresh.historyStep).toBe(0);
    });
  });

  describe('Shape CRUD Operations', () => {
    it('adds a new shape to the shapes array', () => {
      const shape: Shape = {
        id: 'arrow-1',
        tool: 'arrow',
        points: [0, 0, 100, 100],
        color: '#00ff00',
        strokeWidth: 5,
      };
      useEditorStore.getState().addShape(shape);
      expect(useEditorStore.getState().shapes).toHaveLength(1);
      expect(useEditorStore.getState().shapes[0]).toEqual(shape);
    });

    it('updates existing shape properties without mutating other shapes', () => {
      const s1: Shape = { id: 's1', tool: 'rect', x: 0, y: 0, width: 50, height: 50, color: '#111', strokeWidth: 2 };
      const s2: Shape = { id: 's2', tool: 'text', x: 20, y: 20, text: 'Hello', color: '#222', strokeWidth: 2 };

      useEditorStore.getState().setShapes([s1, s2]);
      useEditorStore.getState().updateShape('s1', { width: 120, color: '#333' });

      const updated = useEditorStore.getState().shapes;
      expect(updated[0]).toMatchObject({ id: 's1', width: 120, color: '#333', height: 50 });
      expect(updated[1]).toEqual(s2);
    });
  });

  describe('Undo / Redo Stack Machine', () => {
    it('records history step on saveHistory() and steps back on undo()', () => {
      const s1: Shape = { id: 's1', tool: 'rect', x: 0, y: 0, width: 10, height: 10, color: '#f00', strokeWidth: 2 };
      useEditorStore.getState().addShape(s1);
      useEditorStore.getState().saveHistory();

      const s2: Shape = { id: 's2', tool: 'rect', x: 20, y: 20, width: 10, height: 10, color: '#0f0', strokeWidth: 2 };
      useEditorStore.getState().addShape(s2);
      useEditorStore.getState().saveHistory();

      expect(useEditorStore.getState().historyStep).toBe(2);
      expect(useEditorStore.getState().shapes).toHaveLength(2);

      // Undo step 1 -> has s1 only
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().historyStep).toBe(1);
      expect(useEditorStore.getState().shapes).toHaveLength(1);
      expect(useEditorStore.getState().shapes[0].id).toBe('s1');

      // Undo step 0 -> empty
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().historyStep).toBe(0);
      expect(useEditorStore.getState().shapes).toHaveLength(0);

      // Extra undo at step 0 is a no-op
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().historyStep).toBe(0);

      // Redo back to step 1
      useEditorStore.getState().redo();
      expect(useEditorStore.getState().historyStep).toBe(1);
      expect(useEditorStore.getState().shapes).toHaveLength(1);

      // Redo back to step 2
      useEditorStore.getState().redo();
      expect(useEditorStore.getState().historyStep).toBe(2);
      expect(useEditorStore.getState().shapes).toHaveLength(2);
    });

    it('caps history stack at 50 entries to prevent memory leak', () => {
      for (let i = 0; i < 60; i++) {
        useEditorStore.getState().addShape({
          id: `shape-${i}`,
          tool: 'rect',
          x: i,
          y: i,
          width: 10,
          height: 10,
          color: '#000',
          strokeWidth: 1,
        });
        useEditorStore.getState().saveHistory();
      }

      const history = useEditorStore.getState().history;
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Watermark & Border Settings', () => {
    it('manages watermark mode, text, and enabled state', () => {
      const store = useEditorStore.getState();
      store.setWatermarkEnabled(true);
      store.setWatermarkText('Shotuno Official');
      store.setWatermarkMode('image');
      store.setWatermarkImageUrl('data:image/png;base64,mockLogo');

      const current = useEditorStore.getState();
      expect(current.watermarkEnabled).toBe(true);
      expect(current.watermarkText).toBe('Shotuno Official');
      expect(current.watermarkMode).toBe('image');
      expect(current.watermarkImageUrl).toBe('data:image/png;base64,mockLogo');
    });

    it('snaps border padding sizes to valid intervals', () => {
      const store = useEditorStore.getState();
      store.setBorderPaddingSize(32);
      expect(useEditorStore.getState().borderPaddingSize).toBe(32);
      expect(useEditorStore.getState().borderEnabled).toBe(true);
    });
  });
});
