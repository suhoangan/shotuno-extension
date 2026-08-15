import { Rect } from 'react-konva';
import type { HighlightAreaShape as HighlightAreaShapeType } from '../../../../store/editorTypes';

interface HighlightAreaShapeProps {
  shape: HighlightAreaShapeType;
  commonProps: any;
}

export const HighlightAreaShape = ({ shape, commonProps }: HighlightAreaShapeProps) => {
  const isDimmedBg = !shape.isSolid; // Dimming is ON by default

  return (
    <Rect
      {...commonProps}
      width={shape.width}
      height={shape.height}
      fill={isDimmedBg ? 'transparent' : shape.color}
      globalCompositeOperation={isDimmedBg ? 'source-over' : 'multiply'}
      opacity={isDimmedBg ? 1 : 0.4}
      perfectDrawEnabled={false}
      hitStrokeWidth={20}
    />
  );
};
