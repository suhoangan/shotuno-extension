import type { ReactNode } from 'react';
import { Group, Path, Text, Circle, Rect } from 'react-konva';
import type { CounterShape as CounterShapeType } from '../../../../store/editorTypes';
import { defaultToolSettings } from '../../../../store/editorDefaults';

interface CounterShapeProps {
  shape: CounterShapeType;
  commonProps: any;
}

const COUNTER_DEFAULT_SIZE = defaultToolSettings.counter.strokeWidth;

export const CounterShape = ({ shape, commonProps }: CounterShapeProps) => {
  const style = shape.counterStyle || 'circle';
  // Default stroke width = 1x badge size; Size slider scales relative to it
  const sizeMultiplier = Math.max(0.5, (shape.strokeWidth || COUNTER_DEFAULT_SIZE) / COUNTER_DEFAULT_SIZE);
  const r = 16 * sizeMultiplier;
  const fontSize = 14 * sizeMultiplier;
  const fill = shape.color || '#ef4444';
  const textColor = fill === '#ffffff' ? '#333333' : 'white';

  const commonShadow = {
    shadowColor: "rgba(0,0,0,0.3)",
    shadowBlur: 5,
    shadowOffset: { x: 0, y: 2 },
    shadowOpacity: 1,
  };

  const backgrounds: Record<string, ReactNode> = {
    waterpoint: (
      <Path
        data={`M 0 0 C ${-0.75 * r} ${-0.75 * r} ${-r} ${-1.25 * r} ${-r} ${-1.75 * r} A ${r} ${r} 0 1 1 ${r} ${-1.75 * r} C ${r} ${-1.25 * r} ${0.75 * r} ${-0.75 * r} 0 0 Z`}
        fill={fill}
        {...commonShadow}
      />
    ),
    circle: <Circle x={0} y={0} radius={r} fill={fill} {...commonShadow} />,
    square: (
      <Rect
        x={-r * 0.9}
        y={-r * 0.9}
        width={r * 1.8}
        height={r * 1.8}
        cornerRadius={4 * sizeMultiplier}
        fill={fill}
        {...commonShadow}
      />
    ),
  };

  const textYMap: Record<string, number> = {
    waterpoint: -1.75 * r - fontSize / 2,
    circle: -fontSize / 2,
    square: -fontSize / 2,
  };

  const backgroundElement = backgrounds[style] || backgrounds.circle;
  const textY = textYMap[style] || textYMap.circle;

  return (
    <Group {...commonProps} x={shape.x} y={shape.y}>
      {backgroundElement}
      <Text
        text={shape.count.toString()}
        x={-r}
        y={textY}
        width={r * 2}
        height={fontSize}
        align="center"
        verticalAlign="middle"
        fontSize={fontSize}
        fontStyle="bold"
        fill={textColor}
        fontFamily="sans-serif"
      />
    </Group>
  );
};
