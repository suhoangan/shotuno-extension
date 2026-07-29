import { Group, Rect, Image as KonvaImage } from 'react-konva';
import { useLayoutEffect, useState } from 'react';
import type { RectShape as RectShapeType } from '../../../../store/useEditorStore';
import { useEditorStore } from '../../../../store/useEditorStore';
import {
  blurPixelSize,
  blurRadiusPx,
  createBlurredPatch,
  createPixelatedPatch,
} from '../blurEffect';

interface BlurShapeProps {
  shape: RectShapeType;
  commonProps: any;
  bgImage: HTMLImageElement | null;
}

/** Live mosaic / gaussian / solid redact — baked from the screenshot so export matches. */
export const BlurShape = ({ shape, commonProps, bgImage }: BlurShapeProps) => {
  const isSelected = useEditorStore((s) => s.selectedShapeIds.includes(shape.id));
  const [patch, setPatch] = useState<HTMLCanvasElement | null>(null);

  const w = Math.max(0, shape.width || 0);
  const h = Math.max(0, shape.height || 0);
  const blurType = shape.blurType || 'pixelate';
  const strokeWidth = shape.strokeWidth || 12;

  useLayoutEffect(() => {
    if (!bgImage || w < 1 || h < 1 || blurType === 'solid') {
      setPatch(null);
      return;
    }
    const next =
      blurType === 'blur'
        ? createBlurredPatch(bgImage, shape.x || 0, shape.y || 0, w, h, blurRadiusPx(strokeWidth))
        : createPixelatedPatch(bgImage, shape.x || 0, shape.y || 0, w, h, blurPixelSize(strokeWidth));
    setPatch(next);
  }, [bgImage, shape.x, shape.y, w, h, blurType, strokeWidth]);

  const handleDragMove = (e: any) => {
    if (commonProps.onDragMove) commonProps.onDragMove(e);
  };

  return (
    <Group
      {...commonProps}
      width={w}
      height={h}
      onDragMove={handleDragMove}
      onTransform={commonProps.onTransform}
    >
      {blurType === 'solid' ? (
        <Rect width={w} height={h} fill={shape.color || '#000000'} />
      ) : (
        patch && (
          <KonvaImage image={patch} width={w} height={h} listening={false} />
        )
      )}
      <Rect
        width={w}
        height={h}
        fill="transparent"
        stroke={isSelected ? '#3b82f6' : 'transparent'}
        strokeWidth={isSelected ? 1 : 0}
        hitStrokeWidth={20}
      />
    </Group>
  );
};
