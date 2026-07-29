import React from 'react';
import { Line, Circle } from 'react-konva';
import type { BrushShape as BrushShapeType, HighlightShape } from '../../../../store/editorTypes';
import { useEditorStore } from '../../../../store/useEditorStore';

interface BrushShapeProps {
  shape: BrushShapeType | HighlightShape;
  commonProps: any;
}

export const BrushShape = ({ shape, commonProps }: BrushShapeProps) => {
  const isHighlight = shape.type === 'highlight';
  const { selectedShapeIds, updateShape, saveHistory } = useEditorStore();
  const isSelected = selectedShapeIds.includes(shape.id);
  const lastIdx = shape.points.length >= 2 ? shape.points.length - 2 : 0;
  
  return (
    <React.Fragment>
      <Line 
        {...commonProps} 
        points={shape.points} 
        stroke={shape.color} 
        strokeWidth={shape.strokeWidth} 
        tension={0.5} 
        lineCap={isHighlight ? "square" : "round"}
        globalCompositeOperation={isHighlight ? "multiply" : "source-over"}
        opacity={isHighlight ? 0.4 : 1} 
        lineJoin="round" 
        hitStrokeWidth={20} 
        perfectDrawEnabled={false}
      />
      {isSelected && shape.points.length >= 4 && (
        <>
          <Circle
            name="selection-handle"
            x={(shape.x || 0) + shape.points[0] * (shape.scaleX || 1)}
            y={(shape.y || 0) + shape.points[1] * (shape.scaleY || 1)}
            radius={6} fill="#3b82f6" stroke="white" strokeWidth={2} draggable
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
            x={(shape.x || 0) + shape.points[lastIdx] * (shape.scaleX || 1)}
            y={(shape.y || 0) + shape.points[lastIdx+1] * (shape.scaleY || 1)}
            radius={6} fill="#3b82f6" stroke="white" strokeWidth={2} draggable
            onMouseDown={(e: any) => { e.cancelBubble = true; }}
            onDragMove={(e) => {
              const newPoints = [...shape.points];
              newPoints[lastIdx] = (e.target.x() - (shape.x || 0)) / (shape.scaleX || 1);
              newPoints[lastIdx+1] = (e.target.y() - (shape.y || 0)) / (shape.scaleY || 1);
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
