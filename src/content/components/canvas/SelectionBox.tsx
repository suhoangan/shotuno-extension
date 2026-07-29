import { Rect } from 'react-konva';

interface SelectionBoxProps {
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const SelectionBox = ({ visible, x, y, width, height }: SelectionBoxProps) => {
  if (!visible) return null;

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.2)"
      stroke="#3b82f6"
      strokeWidth={1}
      id="selection-box"
    />
  );
};
