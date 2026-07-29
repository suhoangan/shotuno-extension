import { Group, Rect, Path, Text as KonvaText, Circle } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { TEXT_PADDING, textDefaultHeight, textDefaultWidth } from '../../../../store/editorDefaults';
import type { TextShape as TextShapeType } from '../../../../store/editorTypes';
import { computeCalloutTailLayout, calloutTextFill, resolveCalloutTailTip } from '../calloutTailLayout';
import { refreshTransformersForNode } from '../transformerSync';

interface TextShapeProps {
  shape: TextShapeType;
  commonProps: any;
  isEditing: boolean;
  onDblClick: (e: any, shape: TextShapeType) => void;
}

export const TextShape = ({ shape, commonProps, isEditing, onDblClick }: TextShapeProps) => {
  const { selectedShapeIds, updateShape, saveHistory } = useEditorStore();
  const [localTail, setLocalTail] = useState<{ x: number; y: number } | null>(null);
  const groupRef = useRef<any>(null);

  const isSelected = selectedShapeIds.includes(shape.id);
  const isSolid = shape.isSolid;
  const padding = TEXT_PADDING;
  const fontSize = shape.fontSize || 20;

  const shapeWidth = shape.width || textDefaultWidth(fontSize);
  const shapeHeight = shape.height || textDefaultHeight(fontSize);

  const currentTailX = localTail ? localTail.x : shape.tailX;
  const currentTailY = localTail ? localTail.y : shape.tailY;
  const { x: tailTargetX, y: tailTargetY } = resolveCalloutTailTip(
    shapeWidth,
    shapeHeight,
    currentTailX,
    currentTailY,
    fontSize,
  );
  const bubble = computeCalloutTailLayout(
    shapeWidth,
    shapeHeight,
    tailTargetX,
    tailTargetY,
    fontSize,
  );

  const textWidth = shapeWidth - padding * 2;
  const textHeight = shapeHeight - padding * 2;

  const bgFill = shape.color;
  const textFill = isSolid ? calloutTextFill(shape.color) : shape.color;

  // Transformer must size to the text box only — never the protruding tail.
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.getClientRect = function getCalloutClientRect(config?: any) {
      const bounds = this.findOne('.callout-bounds');
      if (bounds) return bounds.getClientRect(config);
      return {
        x: this.x(),
        y: this.y(),
        width: shapeWidth,
        height: shapeHeight,
      };
    };
    // Keep node attrs aligned with React props so a later reselect can still resize
    node.width(shapeWidth);
    node.height(shapeHeight);
    node.scaleX(commonProps.scaleX || 1);
    node.scaleY(commonProps.scaleY || 1);
    refreshTransformersForNode(node);
  }, [shapeWidth, shapeHeight, bubble.visible, bubble.tipX, bubble.tipY, commonProps.scaleX, commonProps.scaleY, isSelected]);

  return (
    <Group
      ref={groupRef}
      {...commonProps}
      width={shapeWidth}
      height={shapeHeight}
      onDblClick={(e) => {
        if (commonProps.onDblClick) commonProps.onDblClick(e);
        onDblClick(e, shape);
      }}
    >
      <Rect
        name="callout-bounds"
        x={0}
        y={0}
        width={shapeWidth}
        height={shapeHeight}
        fill="transparent"
      />
      {isSolid && (
        <Path
          data={bubble.path}
          fill={bgFill}
          lineJoin="round"
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={10}
          shadowOffset={{ x: 0, y: 4 }}
        />
      )}

      {(!isEditing && shape.text) && (
        <KonvaText
          text={shape.text}
          x={padding}
          y={padding}
          width={Math.max(10, textWidth)}
          height={Math.max(10, textHeight)}
          fill={textFill}
          fontSize={fontSize}
          fontFamily="sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
          fontStyle="600"
          align="left"
          verticalAlign="top"
          wrap="word"
        />
      )}

      {isSelected && isSolid && (
        <Circle
          name="selection-handle"
          x={bubble.tipX}
          y={bubble.tipY}
          radius={Math.max(5, Math.round(fontSize * 0.3))}
          fill="#3b82f6"
          stroke="white"
          strokeWidth={2}
          draggable
          onMouseDown={(e: any) => { e.cancelBubble = true; }}
          onDragMove={(e) => {
            e.cancelBubble = true;
            setLocalTail({ x: e.target.x(), y: e.target.y() });
          }}
          onDragEnd={(e) => {
            e.cancelBubble = true;
            updateShape(shape.id, {
              tailX: e.target.x(),
              tailY: e.target.y(),
            } as Partial<TextShapeType>);
            setLocalTail(null);
            saveHistory();
          }}
          onMouseEnter={(e: any) => { e.target.getStage().container().style.cursor = 'move'; }}
          onMouseLeave={(e: any) => { e.target.getStage().container().style.cursor = 'default'; }}
        />
      )}
    </Group>
  );
};
