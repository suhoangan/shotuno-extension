import { useEffect } from 'react';
import type { ToolType } from '../../../store/editorTypes';
import { isEditableKeyboardTarget } from '../canvas/isEditableKeyboardTarget';

function keyToTool(e: KeyboardEvent): ToolType | null {
  const key = e.key.toLowerCase();
  const combo = e.shiftKey ? `shift+${key}` : key;
  
  const keyMap: Record<string, ToolType> = {
    'v': 'select',
    'h': 'pan',
    'shift+h': 'highlight',
    'a': 'arrow',
    't': 'text',
    'b': 'brush',
    'c': 'counter',
    'shift+c': 'crop',
    'm': 'measure',
    'e': 'ocr',
    'r': 'rect',
    'o': 'circle',
    'y': 'triangle',
    's': 'blur',
    'z': 'magnifier'
  };

  return keyMap[combo] || keyMap[key] || null;
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
