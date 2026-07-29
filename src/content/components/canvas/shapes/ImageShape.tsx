import { useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Rect } from 'react-konva';
import type { ImageShape as ImageShapeType } from '../../../../store/useEditorStore';
import { defaultToolSettings } from '../../../../store/editorDefaults';
import { refreshTransformersForNode } from '../transformerSync';

interface ImageShapeProps {
  shape: ImageShapeType;
  commonProps: any;
}

const IMAGE_DEFAULTS = defaultToolSettings.image;

/** Dropped/pasted image; optional colored stroke when border is on (`isSolid === false`). */
export const ImageShape = ({ shape, commonProps }: ImageShapeProps) => {
  const groupRef = useRef<any>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const w = shape.width;
  const h = shape.height;
  // Explicit false = border on; missing/true = no border (legacy images stay borderless)
  const showBorder = shape.isSolid === false;
  const strokeWidth = shape.strokeWidth || IMAGE_DEFAULTS.strokeWidth;
  const color = shape.color || IMAGE_DEFAULTS.color;

  useEffect(() => {
    const image = new window.Image();
    image.src = shape.src;
    image.onload = () => setImg(image);
  }, [shape.src]);

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.getClientRect = function getImageClientRect(config?: any) {
      const bounds = this.findOne('.image-bounds');
      if (bounds) return bounds.getClientRect(config);
      return { x: this.x(), y: this.y(), width: w, height: h };
    };
    refreshTransformersForNode(node);
  }, [w, h, showBorder, strokeWidth]);

  return (
    <Group ref={groupRef} {...commonProps} width={w} height={h}>
      <Rect name="image-bounds" width={w} height={h} fill="transparent" />
      <KonvaImage image={img || undefined} width={w} height={h} listening={false} />
      {showBorder && (
        <Rect
          width={w}
          height={h}
          fillEnabled={false}
          stroke={color}
          strokeWidth={strokeWidth}
          listening={false}
        />
      )}
    </Group>
  );
};
