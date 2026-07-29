import React from 'react';
import { Arrow, Circle } from 'react-konva';
import type { ArrowShape as ArrowShapeType } from '../../../../store/useEditorStore';
import { useEditorStore } from '../../../../store/useEditorStore';

interface ArrowShapeProps {
  shape: ArrowShapeType;
  commonProps: any;
}

export const ArrowShape = ({ shape, commonProps }: ArrowShapeProps) => {
  const isSelected = useEditorStore(state => state.selectedShapeIds.includes(shape.id));
  const updateShape = useEditorStore(state => state.updateShape);
  const saveHistory = useEditorStore(state => state.saveHistory);

  return (
    <React.Fragment>
      <Arrow 
        {...commonProps} 
        points={shape.points} 
        stroke={shape.color} 
        fill={shape.color} 
        strokeWidth={shape.strokeWidth} 
        pointerLength={shape.isLine ? 0 : 10}
        pointerWidth={shape.isLine ? 0 : 10}
        pointerAtBeginning={!shape.isLine && shape.isTwoWay}
        hitStrokeWidth={20} 
      />
      {isSelected && (
        <>
          <Circle
            name="selection-handle"
            x={(shape.x || 0) + shape.points[0] * (shape.scaleX || 1)}
            y={(shape.y || 0) + shape.points[1] * (shape.scaleY || 1)}
            radius={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
            draggable
            onMouseDown={(e: any) => { e.cancelBubble = true; }}
            onDragMove={(e) => {
              const newPoints = [...shape.points];
              newPoints[0] = (e.target.x() - (shape.x || 0)) / (shape.scaleX || 1);
              newPoints[1] = (e.target.y() - (shape.y || 0)) / (shape.scaleY || 1);
              updateShape(shape.id, { points: newPoints });
            }}
            onDragEnd={saveHistory}
            onMouseEnter={(e: any) => { e.target.getStage().container().style.cursor = 'move'; }}
            onMouseLeave={(e: any) => { e.target.getStage().container().style.cursor = 'default'; }}
          />
          <Circle
            name="selection-handle"
            x={(shape.x || 0) + shape.points[2] * (shape.scaleX || 1)}
            y={(shape.y || 0) + shape.points[3] * (shape.scaleY || 1)}
            radius={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
            draggable
            onMouseDown={(e: any) => { e.cancelBubble = true; }}
            onDragMove={(e) => {
              const newPoints = [...shape.points];
              newPoints[2] = (e.target.x() - (shape.x || 0)) / (shape.scaleX || 1);
              newPoints[3] = (e.target.y() - (shape.y || 0)) / (shape.scaleY || 1);
              updateShape(shape.id, { points: newPoints });
            }}
            onDragEnd={saveHistory}
            onMouseEnter={(e: any) => { e.target.getStage().container().style.cursor = 'move'; }}
            onMouseLeave={(e: any) => { e.target.getStage().container().style.cursor = 'default'; }}
          />
        </>
      )}
    </React.Fragment>
  );
};
