import { useEffect } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { imageShapeStyleFromTool } from '../../../../store/editorDefaults';
import { toImageAnnotationSize } from '../annotationSize';
import { isEditableKeyboardTarget } from '../isEditableKeyboardTarget';
import { limitImageResolution, MAX_IMPORT_EDGE } from '../../../../lib/limitImageResolution';



interface UseCanvasEventsProps {
  bounds: { x: number; y: number; width: number; height: number };
  editingText: any | null;
}

export function useCanvasEvents({ bounds, editingText }: UseCanvasEventsProps) {
  const {
    selectedShapeIds, setSelectedShapeIds,
    addShape, saveHistory, setActiveTool,
  } = useEditorStore();

  // Delete / Backspace — tool hotkeys live in Toolbar (Pro-gated).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableKeyboardTarget(e)) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedShapeIds.length === 0 || editingText) return;

      useEditorStore.getState().setShapes(useEditorStore.getState().shapes.filter((s: any) => !selectedShapeIds.includes(s.id)));
      setSelectedShapeIds([]);
      saveHistory();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeIds, editingText, setSelectedShapeIds, saveHistory]);

  useEffect(() => {
    const handleImageFile = (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const src = e.target?.result as string;
        if (!src) return;
        
        // Pasted at most 600px wide, keep at MAX_IMPORT_EDGE for hygiene
        const sized = await limitImageResolution(src, { maxEdge: MAX_IMPORT_EDGE }).catch(() => null);
        if (!sized) return;

        let w = sized.width;
        let h = sized.height;
        const maxDim = 600;
        if (w > maxDim || h > maxDim) {
          const factor = maxDim / Math.max(w, h);
          w *= factor;
          h *= factor;
        }
        const style = imageShapeStyleFromTool(useEditorStore.getState().toolSettings);
        addShape({
          id: Date.now().toString(),
          type: 'image',
          x: bounds.x + 50,
          y: bounds.y + 50,
          width: w,
          height: h,
          src: sized.dataUrl,
          color: style.color,
          strokeWidth: toImageAnnotationSize(style.strokeWidth),
          isSolid: style.isSolid,
        });
        saveHistory();
        setActiveTool('select');
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
