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
  const {
    borderEnabled,
    borderStyle,
    borderPadding,
    borderPaddingSize,
    includeUrl,
    urlPosition,
    cropRect,
    activeTool,
  } = useEditorStore();

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
