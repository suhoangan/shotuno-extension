import { useEffect } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { imageShapeStyleFromTool } from '../../../../store/editorDefaults';
import { toImageAnnotationSize } from '../annotationSize';
import { isEditableKeyboardTarget } from '../isEditableKeyboardTarget';

interface UseCanvasEventsProps {
  bounds: { x: number; y: number; width: number; height: number };
  editingText: any | null;
}

export function useCanvasEvents({ bounds, editingText }: UseCanvasEventsProps) {
  const { 
    selectedShapeIds, setSelectedShapeIds, 
    addShape, saveHistory, setActiveTool 
  } = useEditorStore();

  // Handle Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shadow DOM retargets e.target to the host — use composedPath.
      if (isEditableKeyboardTarget(e)) return;
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeIds.length > 0 && !editingText) {
        useEditorStore.getState().setShapes(useEditorStore.getState().shapes.filter((s: any) => !selectedShapeIds.includes(s.id)));
        setSelectedShapeIds([]);
        saveHistory();
        return;
      }

      if (editingText) return;

      const key = e.key.toLowerCase();
      if (key === 'v') setActiveTool('select');
      else if (key === 'h' && !e.shiftKey) setActiveTool('pan');
      else if (key === 'h' && e.shiftKey) setActiveTool('highlight');
      else if (key === 'a') setActiveTool('arrow');
      else if (key === 't') setActiveTool('text');
      else if (key === 'b') setActiveTool('brush');
      else if (key === 'c' && !e.shiftKey) setActiveTool('counter');
      else if (key === 'c' && e.shiftKey) setActiveTool('crop');
      else if (key === 'm') setActiveTool('measure');
      else if (key === 'e') setActiveTool('ocr');
      else if (key === 'r') setActiveTool('rect');
      else if (key === 'o') setActiveTool('circle');
      else if (key === 'y') setActiveTool('triangle');
      else if (key === 's') setActiveTool('blur');
      else if (key === 'z') setActiveTool('magnifier');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeIds, editingText, setSelectedShapeIds, saveHistory, setActiveTool]);

  useEffect(() => {
    const handleImageFile = (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (!src) return;
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          const maxDim = 600;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = (maxDim / w) * h; w = maxDim; } 
            else { w = (maxDim / h) * w; h = maxDim; }
          }
          const style = imageShapeStyleFromTool(useEditorStore.getState().toolSettings);
          addShape({
            id: Date.now().toString(),
            type: 'image',
            x: bounds.x + 50,
            y: bounds.y + 50,
            width: w,
            height: h,
            src,
            color: style.color,
            strokeWidth: toImageAnnotationSize(style.strokeWidth),
            isSolid: style.isSolid,
          });
          saveHistory();
          setActiveTool('select');
        };
      };
      reader.readAsDataURL(file);
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [bounds, addShape, saveHistory, setActiveTool]);
}
