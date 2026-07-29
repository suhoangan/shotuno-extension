import { Group, Line, Label, Tag, Text, Circle } from 'react-konva';
import { useEditorStore } from '../../../../store/useEditorStore';
import type { MeasureShape as MeasureShapeType } from '../../../../store/useEditorStore';
import { defaultToolSettings } from '../../../../store/editorDefaults';

interface MeasureShapeProps {
  shape: MeasureShapeType;
  commonProps: any;
}

const MEASURE_DEFAULT_STROKE = defaultToolSettings.measure.strokeWidth;

export const MeasureShape = ({ shape, commonProps }: MeasureShapeProps) => {
  const isSelected = useEditorStore(state => state.selectedShapeIds.includes(shape.id));
  const updateShape = useEditorStore(state => state.updateShape);
  const saveHistory = useEditorStore(state => state.saveHistory);

  const [x1, y1, x2, y2] = shape.points;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);

  const stroke = Math.max(1, shape.strokeWidth || MEASURE_DEFAULT_STROKE);
  // Thinner/shorter rule; px label keeps its own readable size
  const ruleStroke = Math.max(1, stroke * 0.5);
  const tickLength = Math.max(3, stroke * 0.75);
  const fontSize = Math.max(9, stroke * 2);
  const labelPad = Math.max(2, stroke * 0.75);
  const labelOffset = fontSize + labelPad * 2 + 2;

  const angle = Math.atan2(dy, dx);
  const perpX = Math.cos(angle + Math.PI / 2) * tickLength;
  const perpY = Math.sin(angle + Math.PI / 2) * tickLength;

  const t1x1 = x1 + perpX;
  const t1y1 = y1 + perpY;
  const t1x2 = x1 - perpX;
  const t1y2 = y1 - perpY;

  const t2x1 = x2 + perpX;
  const t2y1 = y2 + perpY;
  const t2x2 = x2 - perpX;
  const t2y2 = y2 - perpY;

  const dash = Math.max(2, ruleStroke * 2);

  return (
    <Group {...commonProps}>
      <Line points={[x1, y1, x2, y2]} stroke={shape.color} strokeWidth={ruleStroke} dash={[dash, dash]} />
      <Line points={[t1x1, t1y1, t1x2, t1y2]} stroke={shape.color} strokeWidth={ruleStroke} />
      <Line points={[t2x1, t2y1, t2x2, t2y2]} stroke={shape.color} strokeWidth={ruleStroke} />

      <Label
        x={x1 + dx / 2}
        y={y1 + dy / 2}
        offsetX={0}
        offsetY={labelOffset}
      >
        <Tag fill="rgba(15, 23, 42, 0.9)" cornerRadius={Math.max(2, stroke * 0.5)} />
        <Text
          text={`${Math.round(distance)}px`}
          fontSize={fontSize}
          fill="white"
          padding={labelPad}
          fontFamily="sans-serif"
          fontStyle="bold"
        />
      </Label>

      {isSelected && (
        <>
          <Circle
            name="selection-handle"
            x={x1}
            y={y1}
            radius={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
            draggable
            onMouseDown={(e: any) => { e.cancelBubble = true; }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const newPoints = [...shape.points];
              newPoints[0] = e.target.x();
              newPoints[1] = e.target.y();
              updateShape(shape.id, { points: newPoints });
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              saveHistory();
            }}
            onMouseEnter={(e: any) => { e.target.getStage().container().style.cursor = 'move'; }}
            onMouseLeave={(e: any) => { e.target.getStage().container().style.cursor = 'default'; }}
          />
          <Circle
            name="selection-handle"
            x={x2}
            y={y2}
            radius={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
            draggable
            onMouseDown={(e: any) => { e.cancelBubble = true; }}
            onDragMove={(e) => {
              e.cancelBubble = true;
              const newPoints = [...shape.points];
              newPoints[2] = e.target.x();
              newPoints[3] = e.target.y();
              updateShape(shape.id, { points: newPoints });
            }}
            onDragEnd={(e) => {
              e.cancelBubble = true;
              saveHistory();
            }}
            onMouseEnter={(e: any) => { e.target.getStage().container().style.cursor = 'move'; }}
            onMouseLeave={(e: any) => { e.target.getStage().container().style.cursor = 'default'; }}
          />
        </>
      )}
    </Group>
  );
};
