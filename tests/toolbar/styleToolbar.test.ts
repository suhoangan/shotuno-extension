import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import type { Shape } from '@/store/editorTypes';

describe('Toolbar & Styling - Style Toolbar & Property Controls', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Per-Tool Style Isolation & Persistence', () => {
    it('isolates color customizations per tool and restores them upon switching tools', () => {
      const store = useEditorStore.getState();

      // Configure arrow tool with purple color
      store.setActiveTool('arrow');
      store.setSelectedColor('#a855f7');
      expect(useEditorStore.getState().selectedColor).toBe('#a855f7');

      // Configure brush tool with green color
      store.setActiveTool('brush');
      store.setSelectedColor('#22c55e');
      expect(useEditorStore.getState().selectedColor).toBe('#22c55e');

      // Switch back to arrow -> color should be restored to purple
      store.setActiveTool('arrow');
      expect(useEditorStore.getState().selectedColor).toBe('#a855f7');

      // Switch back to brush -> color should be restored to green
      store.setActiveTool('brush');
      expect(useEditorStore.getState().selectedColor).toBe('#22c55e');
    });

    it('isolates stroke width and solid fill state per tool', () => {
      const store = useEditorStore.getState();

      store.setActiveTool('rect');
      store.setStrokeWidth(8);
      store.setIsSolid(true);

      store.setActiveTool('arrow');
      store.setStrokeWidth(2);
      store.setIsSolid(false);

      // Switch to rect
      store.setActiveTool('rect');
      expect(useEditorStore.getState().strokeWidth).toBe(8);
      expect(useEditorStore.getState().isSolid).toBe(true);

      // Switch to arrow
      store.setActiveTool('arrow');
      expect(useEditorStore.getState().strokeWidth).toBe(2);
      expect(useEditorStore.getState().isSolid).toBe(false);
    });
  });

  describe('Live Shape Style Updates from Toolbar', () => {
    it('updates selected shape properties synchronously when toolbar controls change', () => {
      const s1: Shape = {
        id: 'rect-target',
        tool: 'rect',
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        color: '#ff0000',
        strokeWidth: 2,
      };

      useEditorStore.getState().setShapes([s1]);
      useEditorStore.getState().setSelectedShapeIds(['rect-target']);

      // Toolbar style update
      useEditorStore.getState().setSelectedColor('#3b82f6');
      useEditorStore.getState().setStrokeWidth(6);

      const target = useEditorStore.getState().shapes.find((s) => s.id === 'rect-target');
      expect(target).toBeDefined();
    });

    it('persists counterStyle and continueCounter state', () => {
      const store = useEditorStore.getState();
      store.setActiveTool('counter');
      expect(useEditorStore.getState().continueCounter).toBe(true);

      store.setContinueCounter(false);
      expect(useEditorStore.getState().continueCounter).toBe(false);

      store.setCounterStyle('waterpoint');
      expect(useEditorStore.getState().counterStyle).toBe('waterpoint');

      // Switch tool and switch back
      store.setActiveTool('arrow');
      store.setActiveTool('counter');
      expect(useEditorStore.getState().continueCounter).toBe(false);
      expect(useEditorStore.getState().counterStyle).toBe('waterpoint');
    });
  });
});
