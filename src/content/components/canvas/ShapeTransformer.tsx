import { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { textMinHeight } from '../../../store/editorDefaults';

interface ShapeTransformerProps {
  shapeId: string;
  isMulti: boolean;
  shapes: any[];
}

export const ShapeTransformer = ({ shapeId, isMulti, shapes }: ShapeTransformerProps) => {
  const trRef = useRef<any>(null);
  
  const shape = shapes.find(s => s.id === shapeId);

  useEffect(() => {
    if (!trRef.current) return;
    const node = trRef.current.getStage()?.findOne(`#${shapeId}`);
    if (!node) return;

    trRef.current.nodes([node]);
    trRef.current.forceUpdate();
    trRef.current.getLayer()?.batchDraw();
  }, [shapeId, isMulti, shape?.x, shape?.y, shape?.width, shape?.height, shape?.radius, shape?.rotation]);

  const shapeType = shapes.find(s => s.id === shapeId)?.type as string | undefined;
  const isText = shapeType === 'text';
  const isMagnifier = shapeType === 'magnifier';
  const isCallout = shapeType === 'callout';
  const isSticker = shapeType === 'sticker';
  const isLineLike = ['arrow', 'measure', 'brush', 'highlight'].includes(shapeType as string);

  // Line-like shapes: no transformer box — each shape renders start/end handles only
  if (isLineLike) {
    return null;
  }

  const cornerAnchors = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];
  const allAnchors = [...cornerAnchors, 'middle-left', 'middle-right', 'top-center', 'bottom-center'];

  // Stickers / text / magnifier: corners only (no mid-edge centers). Stickers+magnifier keep ratio.
  const enabledAnchors = isMulti ? [] : isSticker || isText || isCallout || isMagnifier ? cornerAnchors : allAnchors;
  
  return (
    <Transformer 
      ref={trRef} 
      resizeEnabled={true}
      rotateEnabled={false}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox;

        // Text callouts: lock at one-line min height — do not 1:1-snap (that fights short boxes).
        if (isText || isCallout) {
          const minH = textMinHeight(shape?.fontSize || 20);
          if (newBox.height < minH) return oldBox;
          return newBox;
        }

        if (isSticker) return newBox;

        let isSnapped = false;
        
        // Auto-snap to 1:1 if width and height are within 4 pixels of each other
        if (Math.abs(newBox.width - newBox.height) <= 4) {
          isSnapped = true;
          const size = Math.max(newBox.width, newBox.height);
          const dw = size - newBox.width;
          const dh = size - newBox.height;
          
          const activeAnchor = trRef.current?.getActiveAnchor();
          if (activeAnchor) {
            const rad = newBox.rotation * Math.PI / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            
            let localDx = 0;
            let localDy = 0;
            
            if (activeAnchor.includes('left')) localDx = -dw;
            else if (!activeAnchor.includes('right')) localDx = -dw / 2;
            
            if (activeAnchor.includes('top')) localDy = -dh;
            else if (!activeAnchor.includes('bottom')) localDy = -dh / 2;
            
            newBox.x += localDx * cos - localDy * sin;
            newBox.y += localDx * sin + localDy * cos;
          }
          
          newBox.width = size;
          newBox.height = size;
        }
        
        if (trRef.current) {
          const stroke = isSnapped ? '#10b981' : (isText || isCallout ? 'red' : '#3b82f6');
          const strokeWidth = isSnapped ? 2 : 1;
          trRef.current.setAttr('borderStroke', stroke);
          trRef.current.setAttr('borderStrokeWidth', strokeWidth);
        }
        
        return newBox;
      }}
      borderStroke={isText || isCallout ? 'red' : '#3b82f6'}
      borderDash={isText || isCallout ? [6, 4] : undefined}
      enabledAnchors={enabledAnchors}
      keepRatio={isMagnifier || isSticker}
      anchorFill={isText ? 'green' : '#ffffff'}
      anchorStroke={isText ? 'white' : '#3b82f6'}
      anchorSize={12}
      anchorCornerRadius={6}
      rotateAnchorOffset={30}
    /> 
  );
};
