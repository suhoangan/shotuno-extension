import { Group, Rect, Text } from 'react-konva';
import { useEffect, useRef } from 'react';
import type { StickerShape as StickerShapeType } from '../../../../store/editorTypes';
import { getStickerLayout, STICKER_EMOJI_FONT } from './stickerLayout';
import { refreshTransformersForNode } from '../transformerSync';

interface StickerShapeProps {
  shape: StickerShapeType;
  commonProps: any;
}

export const StickerShape = ({ shape, commonProps }: StickerShapeProps) => {
  const groupRef = useRef<any>(null);
  const { width, height, fontSize, glyphBox, textX, textY } = getStickerLayout(
    shape.width,
    shape.height,
    shape.emoji,
  );

  // Transformer must use the square bounds, not the oversized emoji text box —
  // but id/drag stay on the group so the selection box moves with the sticker.
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.getClientRect = function getStickerClientRect(config?: any) {
      const bounds = this.findOne('.sticker-bounds');
      if (bounds) return bounds.getClientRect(config);
      return {
        x: this.x(),
        y: this.y(),
        width,
        height,
      };
    };
    refreshTransformersForNode(node);
  }, [width, height]);

  return (
    <Group
      ref={groupRef}
      {...commonProps}
      width={width}
      height={height}
      clipX={0}
      clipY={0}
      clipWidth={width}
      clipHeight={height}
    >
      <Rect
        name="sticker-bounds"
        width={width}
        height={height}
        fill="transparent"
      />
      <Text
        text={shape.emoji}
        x={textX}
        y={textY}
        width={glyphBox}
        height={height}
        align="center"
        verticalAlign="middle"
        fontSize={fontSize}
        fontFamily={STICKER_EMOJI_FONT}
        listening={false}
      />
    </Group>
  );
};
