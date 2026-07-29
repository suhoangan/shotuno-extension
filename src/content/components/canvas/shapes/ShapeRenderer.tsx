import React from 'react';
import { ArrowShape } from './ArrowShape';
import { MeasureShape } from './MeasureShape';
import { RectShape } from './RectShape';
import { BlurShape } from './BlurShape';
import { BrushShape } from './BrushShape';
import { TextShape } from './TextShape';
import { StickerShape } from './StickerShape';
import { ImageShape } from './ImageShape';
import { CounterShape } from './CounterShape';
import { MagnifierShape } from './MagnifierShape';
import { useShapeProps } from '../hooks/useShapeProps';
import type { Shape, TextShape as TextShapeType } from '../../../../store/useEditorStore';

interface ShapeRendererProps {
  shape: Shape;
  stageRef: React.RefObject<any>;
  editingTextId: string | null;
  onTextDblClick: (e: any, shape: TextShapeType) => void;
  bgImage: HTMLImageElement | null;
  allShapes: Shape[];
  /** Bust memo when tool changes so listening/draggable update immediately. */
  activeTool: string;
  isSelected: boolean;
}

const ShapeRendererComponent = ({ shape, stageRef, editingTextId, onTextDblClick, bgImage, allShapes, activeTool, isSelected }: ShapeRendererProps) => {
  const commonProps = useShapeProps({ shape, stageRef, activeTool, isSelected });

  switch (shape.type) {
    case 'arrow':
      return <ArrowShape shape={shape} commonProps={commonProps} />;
    case 'measure':
      return <MeasureShape shape={shape} commonProps={commonProps} />;
    case 'blur':
      return <BlurShape shape={shape} commonProps={commonProps} bgImage={bgImage} />;
    case 'rect':
    case 'circle':
    case 'triangle':
      return <RectShape shape={shape} commonProps={commonProps} />;
    case 'brush':
    case 'highlight':
      return <BrushShape shape={shape as any} commonProps={commonProps} />;
    case 'text':
      return (
        <TextShape 
          shape={shape} 
          commonProps={commonProps} 
          isEditing={editingTextId === shape.id}
          onDblClick={onTextDblClick}
        />
      );
    case 'sticker':
      return <StickerShape shape={shape} commonProps={commonProps} />;
    case 'image':
      return <ImageShape shape={shape} commonProps={commonProps} />;
    case 'counter':
      return <CounterShape shape={shape as any} commonProps={commonProps} />;
    case 'magnifier':
      return (
        <MagnifierShape 
          shape={shape as any} 
          commonProps={commonProps} 
          bgImage={bgImage}
          allShapes={allShapes}
          renderShape={(s) => (
            <ShapeRendererComponent
              key={s.id}
              shape={s}
              stageRef={stageRef}
              editingTextId={editingTextId}
              onTextDblClick={onTextDblClick}
              bgImage={bgImage}
              allShapes={allShapes}
              activeTool={activeTool}
              isSelected={false}
            />
          )}
        />
      );
    default:
      return null;
  }
};

export const ShapeRenderer = React.memo(ShapeRendererComponent, (prevProps, nextProps) => {
  // Only re-render if the shape reference changes (which happens when updateShape is called on it)
  // or if its editing / tool / selection state changes (listening depends on those)
  return (
    prevProps.shape === nextProps.shape &&
    prevProps.editingTextId === nextProps.editingTextId &&
    prevProps.bgImage === nextProps.bgImage &&
    prevProps.allShapes === nextProps.allShapes &&
    prevProps.activeTool === nextProps.activeTool &&
    prevProps.isSelected === nextProps.isSelected
  );
});
