import { useEffect } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { snapStrokeWidth } from '../../../../store/editorDefaults';
import { toUiAnnotationSize } from '../../canvas/annotationSize';

/**
 * Mirrors a single selected shape's visual properties (color, strokeWidth, etc.)
 * into the editor store's UI swatches with `persistToTool: false` so the toolbar
 * controls reflect the shape being inspected without contaminating the active
 * tool's saved defaults.
 *
 * Designed to run inside `StyleToolbar` — the component that renders the swatches
 * this effect populates. The inverse flow (restoring tool defaults on deselect)
 * is handled by `setSelectedShapeIds` in the Zustand store.
 */
export function useShapeStyleSync() {
  const selectedShapeIds = useEditorStore((s) => s.selectedShapeIds);
  const shapes = useEditorStore((s) => s.shapes);
  const setSelectedColor = useEditorStore((s) => s.setSelectedColor);
  const setStrokeWidth = useEditorStore((s) => s.setStrokeWidth);
  const setIsSolid = useEditorStore((s) => s.setIsSolid);
  const setIsTwoWay = useEditorStore((s) => s.setIsTwoWay);
  const setIsLine = useEditorStore((s) => s.setIsLine);
  const setOpacity = useEditorStore((s) => s.setOpacity);
  const setBlurType = useEditorStore((s) => s.setBlurType);

  useEffect(() => {
    if (selectedShapeIds.length !== 1) return;
    const shape = shapes.find((s) => s.id === selectedShapeIds[0]);
    if (!shape) return;

    const uiOnly = { persistToTool: false } as const;
    if ('color' in shape && shape.color) setSelectedColor(shape.color as string, uiOnly);
    if ('strokeWidth' in shape && shape.strokeWidth) {
      setStrokeWidth(snapStrokeWidth(toUiAnnotationSize(shape.strokeWidth as number)), uiOnly);
    }
    if ('isSolid' in shape && shape.isSolid !== undefined) setIsSolid(shape.isSolid as boolean, uiOnly);
    if ('isTwoWay' in shape && shape.isTwoWay !== undefined) setIsTwoWay(shape.isTwoWay as boolean, uiOnly);
    if ('isLine' in shape && shape.isLine !== undefined) setIsLine(shape.isLine as boolean, uiOnly);
    if ('opacity' in shape && shape.opacity !== undefined) setOpacity(shape.opacity as number, uiOnly);
    if ('blurType' in shape && shape.blurType) {
      setBlurType(shape.blurType as 'pixelate' | 'blur' | 'solid', uiOnly);
    }
  }, [selectedShapeIds, shapes, setSelectedColor, setStrokeWidth, setIsSolid, setIsTwoWay, setIsLine, setOpacity, setBlurType]);
}
