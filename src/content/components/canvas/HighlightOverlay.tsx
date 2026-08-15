
import { Shape as KonvaShape } from 'react-konva';
import type { Shape } from '../../../store/editorTypes';
import type { StageBounds } from './stageBounds';

interface HighlightOverlayProps {
  shapes: Shape[];
  bounds: StageBounds;
}

export function HighlightOverlay({ shapes, bounds }: HighlightOverlayProps) {
  // Only apply to highlight-area (rectangular).
  // Freehand highlights ('highlight') with hundreds of points are omitted to prevent lag.
  const highlights = shapes.filter(
    (s) => s.type === 'highlight-area' && !s.isSolid
  );

  if (highlights.length === 0) {
    return null;
  }

  return (
    <KonvaShape
      listening={false}
      perfectDrawEnabled={false}
      sceneFunc={(context) => {
        const maxOpacity = Math.max(...highlights.map(h => h.opacity ?? 0.2), 0.2);
        context.fillStyle = `rgba(0, 0, 0, ${maxOpacity})`;
        const targetX = bounds.content ? bounds.content.x : bounds.x;
        const targetY = bounds.content ? bounds.content.y : bounds.y;
        const targetW = bounds.content ? bounds.content.width : bounds.width;
        const targetH = bounds.content ? bounds.content.height : bounds.height;
        context.fillRect(targetX, targetY, targetW, targetH);

        // Punch holes for each highlight area
        context.globalCompositeOperation = 'destination-out';
        context.fillStyle = 'black';

        for (const h of highlights) {
          if (h.type !== 'highlight-area') continue;
          
          context.save();
          context.translate(h.x || 0, h.y || 0);
          if (h.rotation) {
            context.rotate((h.rotation * Math.PI) / 180);
          }
          if (h.scaleX !== undefined || h.scaleY !== undefined) {
            context.scale(h.scaleX ?? 1, h.scaleY ?? 1);
          }
          context.fillRect(0, 0, h.width || 0, h.height || 0);
          context.restore();
        }

        // Reset to default
        context.globalCompositeOperation = 'source-over';
      }}
    />
  );
}
