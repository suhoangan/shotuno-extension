import React from 'react';
import { useShapeProps } from '../hooks/useShapeProps';
import type { Shape, TextShape as TextShapeType } from '../../../../store/useEditorStore';
import { ensureBuiltinFeaturesRegistered } from '../../../features/registerBuiltinFeatures';
import { renderShapeType } from '../../../features/registry';

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

const ShapeRendererComponent = ({
  shape, stageRef, editingTextId, onTextDblClick, bgImage, activeTool, isSelected,
}: ShapeRendererProps) => {
  ensureBuiltinFeaturesRegistered();
  const commonProps = useShapeProps({ shape, stageRef, activeTool, isSelected });

  return (
    <>
      {renderShapeType(shape.type, {
        shape,
        commonProps,
        bgImage,
        editingTextId,
        onTextDblClick: onTextDblClick as any,
        renderChild: (child) => (
          <ShapeRendererComponent
            key={child.id}
            shape={child}
            stageRef={stageRef}
            editingTextId={editingTextId}
            onTextDblClick={onTextDblClick}
            bgImage={bgImage}
            activeTool={activeTool}
            isSelected={false}
          />
        ),
      })}
    </>
  );
};

export const ShapeRenderer = React.memo(ShapeRendererComponent, (prevProps, nextProps) => (
  prevProps.shape === nextProps.shape &&
  prevProps.editingTextId === nextProps.editingTextId &&
  prevProps.bgImage === nextProps.bgImage &&
  prevProps.activeTool === nextProps.activeTool &&
  prevProps.isSelected === nextProps.isSelected
));
