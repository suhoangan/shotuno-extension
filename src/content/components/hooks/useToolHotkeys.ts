import { useEffect } from 'react';
import type { ToolType } from '../../../store/editorTypes';
import { isEditableKeyboardTarget } from '../canvas/isEditableKeyboardTarget';

function keyToTool(e: KeyboardEvent): ToolType | null {
  const key = e.key.toLowerCase();
  if (key === 'v') return 'select';
  if (key === 'h' && !e.shiftKey) return 'pan';
  if (key === 'h' && e.shiftKey) return 'highlight';
  if (key === 'a') return 'arrow';
  if (key === 't') return 'text';
  if (key === 'b') return 'brush';
  if (key === 'c' && !e.shiftKey) return 'counter';
  if (key === 'c' && e.shiftKey) return 'crop';
  if (key === 'm') return 'measure';
  if (key === 'e') return 'ocr';
  if (key === 'r') return 'rect';
  if (key === 'o') return 'circle';
  if (key === 'y') return 'triangle';
  if (key === 's') return 'blur';
  if (key === 'z') return 'magnifier';
  return null;
}

/** Tool hotkeys — use the same selectTool path as toolbar buttons (includes Pro gates). */
export function useToolHotkeys(selectTool: (tool: ToolType) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditableKeyboardTarget(e)) return;
      const tool = keyToTool(e);
      if (!tool) return;
      selectTool(tool);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectTool]);
}
