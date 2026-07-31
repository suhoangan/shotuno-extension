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
import { useEditorStore } from '../../../../store/useEditorStore';
import type { Shape, TextShape as TextShapeType } from '../../../../store/useEditorStore';

interface ShapeRendererProps {
  shape: Shape;
  stageRef: React.RefObject<any>;
  editingTextId: string | null;
  onTextDblClick: (e: any, shape: TextShapeType) => void;
  bgImage: HTMLImageElement | null;
  /** Bust memo when tool changes so listening/draggable update immediately. */
  activeTool: string;
  isSelected: boolean;
}

/**
 * The magnifier is the only shape that needs to see its siblings. Subscribing here rather
 * than taking them as a prop keeps the ever-changing `shapes` array out of every other
 * shape's memo check, so editing one shape no longer re-renders all of them.
 */
const ConnectedMagnifierShape = ({
  shape, commonProps, stageRef, editingTextId, onTextDblClick, bgImage, activeTool,
}: Omit<ShapeRendererProps, 'isSelected'> & { commonProps: any }) => {
  const allShapes = useEditorStore((s) => s.shapes);

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
          activeTool={activeTool}
          isSelected={false}
        />
      )}
    />
  );
};

const ShapeRendererComponent = ({ shape, stageRef, editingTextId, onTextDblClick, bgImage, activeTool, isSelected }: ShapeRendererProps) => {
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
        <ConnectedMagnifierShape
          shape={shape}
          commonProps={commonProps}
          stageRef={stageRef}
          editingTextId={editingTextId}
          onTextDblClick={onTextDblClick}
          bgImage={bgImage}
          activeTool={activeTool}
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
    prevProps.activeTool === nextProps.activeTool &&
    prevProps.isSelected === nextProps.isSelected
  );
});
