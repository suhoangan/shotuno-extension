import { useMemo } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { getStageBounds, type StageBounds } from '../stageBounds';

const EMPTY_BOUNDS: StageBounds = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  content: { x: 0, y: 0, width: 0, height: 0 },
};

export function useCanvasBounds(image: HTMLImageElement | null): StageBounds {
  const borderEnabled = useEditorStore((s) => s.borderEnabled);
  const borderStyle = useEditorStore((s) => s.borderStyle);
  const borderPadding = useEditorStore((s) => s.borderPadding);
  const borderPaddingSize = useEditorStore((s) => s.borderPaddingSize);
  const includeUrl = useEditorStore((s) => s.includeUrl);
  const urlPosition = useEditorStore((s) => s.urlPosition);
  const cropRect = useEditorStore((s) => s.cropRect);
  const activeTool = useEditorStore((s) => s.activeTool);

  return useMemo(() => {
    if (!image) return EMPTY_BOUNDS;

    return getStageBounds(image, cropRect, activeTool, {
      borderEnabled,
      borderStyle,
      borderPadding,
      borderPaddingSize,
      includeUrl,
      urlPosition,
    });
  }, [
    image,
    borderEnabled,
    borderStyle,
    borderPadding,
    borderPaddingSize,
    includeUrl,
    urlPosition,
    cropRect,
    activeTool,
  ]);
}
