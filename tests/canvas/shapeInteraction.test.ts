import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import { isEditableKeyboardTarget } from '@/content/components/canvas/isEditableKeyboardTarget';
import type { Shape } from '@/store/editorTypes';

describe('Canvas Core - Shape Selection, Deletion and Hotkeys', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    vi.stubGlobal('HTMLElement', class HTMLElement {});
    vi.stubGlobal('HTMLInputElement', class HTMLInputElement extends (globalThis.HTMLElement as any) {});
    vi.stubGlobal('HTMLTextAreaElement', class HTMLTextAreaElement extends (globalThis.HTMLElement as any) {});
    vi.stubGlobal('HTMLSelectElement', class HTMLSelectElement extends (globalThis.HTMLElement as any) {});
  });

  describe('Shape Selection & Style Preservation', () => {
    it('sets selectedShapeIds and preserves active tool defaults upon deselection', () => {
      const store = useEditorStore.getState();
      store.setActiveTool('arrow');
      const defaultArrowColor = store.selectedColor;

      const s1: Shape = { id: 'shape-1', tool: 'rect', x: 0, y: 0, width: 20, height: 20, color: '#123456', strokeWidth: 10 };
      store.setShapes([s1]);

      // Select shape-1
      store.setSelectedShapeIds(['shape-1']);
      expect(useEditorStore.getState().selectedShapeIds).toEqual(['shape-1']);

      // Deselect -> restores arrow tool default color without leaking '#123456'
      store.setSelectedShapeIds([]);
      expect(useEditorStore.getState().selectedShapeIds).toEqual([]);
      expect(useEditorStore.getState().selectedColor).toBe(defaultArrowColor);
    });
  });

  describe('Shape Deletion', () => {
    it('deletes targeted shapes and removes their ids from selection', () => {
      const s1: Shape = { id: 's1', tool: 'rect', x: 0, y: 0, width: 10, height: 10, color: '#f00', strokeWidth: 2 };
      const s2: Shape = { id: 's2', tool: 'rect', x: 20, y: 20, width: 10, height: 10, color: '#0f0', strokeWidth: 2 };
      const s3: Shape = { id: 's3', tool: 'rect', x: 40, y: 40, width: 10, height: 10, color: '#00f', strokeWidth: 2 };

      useEditorStore.getState().setShapes([s1, s2, s3]);
      useEditorStore.getState().setSelectedShapeIds(['s2']);

      // Delete s2
      const remaining = useEditorStore.getState().shapes.filter((s) => s.id !== 's2');
      useEditorStore.getState().setShapes(remaining);
      useEditorStore.getState().setSelectedShapeIds([]);

      expect(useEditorStore.getState().shapes).toHaveLength(2);
      expect(useEditorStore.getState().shapes.map((s) => s.id)).toEqual(['s1', 's3']);
      expect(useEditorStore.getState().selectedShapeIds).toEqual([]);
    });
  });

  describe('isEditableKeyboardTarget Guard', () => {
    it('returns true when event target is an INPUT, TEXTAREA, or contentEditable element', () => {
      const InputClass = globalThis.HTMLInputElement as unknown as new () => any;
      const TextareaClass = globalThis.HTMLTextAreaElement as unknown as new () => any;
      const ElementClass = globalThis.HTMLElement as unknown as new () => any;

      const inputTarget = new InputClass();
      const textareaTarget = new TextareaClass();
      const editableDiv = new ElementClass();
      editableDiv.isContentEditable = true;

      const regularDiv = new ElementClass();
      regularDiv.isContentEditable = false;

      const makeEvent = (target: any) => ({
        target,
        composedPath: () => [target],
      } as unknown as KeyboardEvent);

      expect(isEditableKeyboardTarget(makeEvent(inputTarget))).toBe(true);
      expect(isEditableKeyboardTarget(makeEvent(textareaTarget))).toBe(true);
      expect(isEditableKeyboardTarget(makeEvent(editableDiv))).toBe(true);
      expect(isEditableKeyboardTarget(makeEvent(regularDiv))).toBe(false);
    });
  });
});
