import { Rect, Ellipse, Line } from 'react-konva';
import type { RectShape as RectShapeType } from '../../../../store/useEditorStore';

interface RectShapeProps {
  shape: RectShapeType;
  commonProps: any;
}

export const RectShape = ({ shape, commonProps }: RectShapeProps) => {
  // Transparent fill keeps hollow shapes hittable for move/resize under drawing tools
  const fill = shape.isSolid ? `${shape.color}40` : 'transparent';

  if (shape.type === 'circle') {
    return (
      <Ellipse
        {...commonProps}
        offsetX={-shape.width / 2}
        offsetY={-shape.height / 2}
        radiusX={shape.width / 2}
        radiusY={shape.height / 2}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fill}
        hitStrokeWidth={20}
      />
    );
  }

  if (shape.type === 'triangle') {
    return (
      <Line
        {...commonProps}
        points={[
          shape.width / 2, 0,
          shape.width, shape.height,
          0, shape.height,
        ]}
        closed={true}
        stroke={shape.color}
        strokeWidth={shape.strokeWidth}
        fill={fill}
        lineJoin="round"
        hitStrokeWidth={20}
      />
    );
  }

  return (
    <Rect
      {...commonProps}
      width={shape.width}
      height={shape.height}
      stroke={shape.color}
      strokeWidth={shape.strokeWidth}
      fill={fill}
      cornerRadius={8}
      hitStrokeWidth={20}
    />
  );
};
