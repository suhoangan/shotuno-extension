import { Group, Text } from 'react-konva';
import {
  measureWatermarkText,
  tiledWatermarkPositions,
  WATERMARK_TILE_ANGLE,
  WATERMARK_TILE_FONT_SIZE,
  WATERMARK_TILE_GAP_X,
  WATERMARK_TILE_GAP_Y,
  WATERMARK_TILE_OPACITY,
} from './tiledWatermark';

interface TiledTextWatermarkProps {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Diagonal repeating text watermark (staggered grid), clipped to content bounds. */
export function TiledTextWatermark({ text, x, y, width, height }: TiledTextWatermarkProps) {
  const trimmed = text.trim();
  if (!trimmed || width <= 0 || height <= 0) return null;

  const fontSize = WATERMARK_TILE_FONT_SIZE;
  const metrics = measureWatermarkText(trimmed, fontSize);
  const stepX = Math.max(metrics.width * WATERMARK_TILE_GAP_X, fontSize * 4);
  const stepY = Math.max(fontSize * WATERMARK_TILE_GAP_Y, fontSize * 2.5);
  const positions = tiledWatermarkPositions(width, height, stepX, stepY);

  return (
    <Group
      x={x}
      y={y}
      clipX={0}
      clipY={0}
      clipWidth={width}
      clipHeight={height}
      listening={false}
    >
      {positions.map((pos, i) => (
        <Text
          key={i}
          text={trimmed}
          x={pos.x}
          y={pos.y}
          offsetX={metrics.width / 2}
          offsetY={fontSize / 2}
          rotation={WATERMARK_TILE_ANGLE}
          fill={`rgba(0, 0, 0, ${WATERMARK_TILE_OPACITY})`}
          fontSize={fontSize}
          fontFamily="sans-serif"
          listening={false}
        />
      ))}
    </Group>
  );
}
