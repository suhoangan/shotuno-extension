import { textFontSizeFromStrokeWidth, textDefaultHeight } from '../../../../store/editorDefaults';
import { toImageAnnotationSize } from '../../canvas/annotationSize';
import type { Shape } from '../../../../store/editorTypes';

export function handleStrokeWidthUpdate(
  newWidth: number,
  appliesToText: boolean,
  selectedShapeIds: string[],
  shapes: Shape[],
  setStrokeWidth: (w: number, opts: { persistToTool: boolean }) => void,
  updateShape: (id: string, patch: Record<string, unknown>) => void,
  saveHistory: () => void,
  applyToSelection: (props: Record<string, unknown>) => void
) {
  setStrokeWidth(newWidth, { persistToTool: true });
  const imageWidth = toImageAnnotationSize(newWidth);
  if (!appliesToText) {
    applyToSelection({ strokeWidth: imageWidth });
    return;
  }

  const fontSize = textFontSizeFromStrokeWidth(imageWidth);
  if (selectedShapeIds.length === 0) return;

  selectedShapeIds.forEach((id) => {
    const s = shapes.find((sh) => sh.id === id);
    if (!s || s.type !== 'text') {
      updateShape(id, { strokeWidth: imageWidth });
      return;
    }
    const oldFont = s.fontSize || 20;
    const oldH = s.height || textDefaultHeight(oldFont);
    const newH = textDefaultHeight(fontSize);
    const ratio = oldFont > 0 ? fontSize / oldFont : 1;
    const hRatio = oldH > 0 ? newH / oldH : ratio;
    const patch: Record<string, unknown> = {
      strokeWidth: imageWidth,
      fontSize,
      height: newH,
    };
    if (s.tailX !== undefined && s.tailY !== undefined) {
      patch.tailX = s.tailX * ratio;
      patch.tailY = s.tailY * hRatio;
    }
    updateShape(id, patch);
  });
  saveHistory();
}
