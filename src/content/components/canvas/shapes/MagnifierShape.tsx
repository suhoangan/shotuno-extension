import { Group, Circle, Rect, Image as KonvaImage } from 'react-konva';
import { useEffect, useRef } from 'react';
import type { MagnifierShape as MagnifierShapeType } from '../../../../store/useEditorStore';
import { refreshTransformersForNode } from '../transformerSync';

interface MagnifierShapeProps {
  shape: MagnifierShapeType;
  commonProps: any;
  bgImage: HTMLImageElement | null;
  allShapes?: any[];
  renderShape?: (shape: any) => React.ReactNode;
}

/**
 * Magnifier uses top-left (x, y) + radius — same origin model as the Transformer /
 * stickers — so the selection box stays aligned with the lens.
 */
export const MagnifierShape = ({ shape, commonProps, bgImage, allShapes = [], renderShape }: MagnifierShapeProps) => {
  const groupRef = useRef<any>(null);
  const radius = shape.radius || (shape.strokeWidth ? shape.strokeWidth * 10 : 60);
  const zoomLevel = shape.zoomLevel || 2;
  const strokeWidth = shape.isSolid ? 0 : (shape.strokeWidth || 6);
  const size = radius * 2;
  const centerX = shape.x + radius;
  const centerY = shape.y + radius;

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    node.getClientRect = function getMagnifierClientRect(config?: any) {
      const bounds = this.findOne('.magnifier-bounds');
      if (bounds) return bounds.getClientRect(config);
      return {
        x: this.x(),
        y: this.y(),
        width: size,
        height: size,
      };
    };
    node.width(size);
    node.height(size);
    refreshTransformersForNode(node);
  }, [radius, size]);

  return (
    <Group
      {...commonProps}
      ref={groupRef}
      x={shape.x}
      y={shape.y}
      width={size}
      height={size}
    >
      <Rect
        name="magnifier-bounds"
        x={0}
        y={0}
        width={size}
        height={size}
        fill="transparent"
      />
      <Group
        clipFunc={(ctx) => {
          ctx.arc(radius, radius, radius, 0, Math.PI * 2, false);
        }}
        listening={false}
      >
        <Circle x={radius} y={radius} radius={radius} fill="white" listening={false} />
        <Group
          x={radius - centerX * zoomLevel}
          y={radius - centerY * zoomLevel}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
          listening={false}
        >
          {bgImage && (
            <KonvaImage
              image={bgImage}
              x={0}
              y={0}
              width={bgImage.width}
              height={bgImage.height}
            />
          )}

          {renderShape &&
            allShapes
              .filter((s) => s.id !== shape.id && s.type !== 'magnifier')
              .map((s) => {
                const staticShape = { ...s, id: s.id + '-magnified' };
                return renderShape(staticShape);
              })}
        </Group>
      </Group>

      <Circle
        x={radius}
        y={radius}
        radius={radius}
        fill="transparent"
        stroke={shape.isSolid ? undefined : shape.color}
        strokeWidth={strokeWidth}
        shadowColor={shape.isSolid ? undefined : 'rgba(0,0,0,0.5)'}
        shadowBlur={shape.isSolid ? 0 : 15}
        shadowOffset={shape.isSolid ? undefined : { x: 0, y: 5 }}
        hitStrokeWidth={20}
      />
    </Group>
  );
};
