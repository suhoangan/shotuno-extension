import { textMinHeight } from '../../../../store/editorDefaults';
import { applyStickerGroupTransform } from '../shapes/stickerLayout';
import { refreshTransformersForNode, getActiveTransformerAnchor } from '../transformerSync';
import { useEditorStore } from '../../../../store/useEditorStore';

type ShapeLike = {
  id: string;
  type: string;
  emoji?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  radius?: number;
  tailX?: number;
  tailY?: number;
};

/** Drag / transform handlers shared by every Konva shape via useShapeProps. */
export function buildShapeDragHandlers(opts: {
  shape: ShapeLike;
  stageRef: React.RefObject<any>;
  updateShape: (id: string, props: Record<string, unknown>) => void;
  saveHistory: () => void;
  setIsDragging: (v: boolean) => void;
  setSelectedShapeIds: (ids: string[]) => void;
}) {
  const {
    shape, stageRef, updateShape, saveHistory, setIsDragging, setSelectedShapeIds,
  } = opts;

  return {
    onDragStart: (e: any) => {
      setIsDragging(true);
      const store = useEditorStore.getState();
      let currentSelected = store.selectedShapeIds;
      if (!currentSelected.includes(shape.id)) {
        setSelectedShapeIds([shape.id]);
        currentSelected = [shape.id];
      }

      const currentShapes = store.shapes;
      const lastShapes = currentShapes.slice(-currentSelected.length);
      if (!lastShapes.every((s) => currentSelected.includes(s.id))) {
        const unselected = currentShapes.filter((s) => !currentSelected.includes(s.id));
        const selected = currentShapes.filter((s) => currentSelected.includes(s.id));
        store.setShapes([...unselected, ...selected]);
      }

      const nodes = currentSelected
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean);
      nodes.forEach((n: any) => {
        n.setAttr('dragStartX', n.x());
        n.setAttr('dragStartY', n.y());
      });
      e.target.setAttr('dragStartX', e.target.x());
      e.target.setAttr('dragStartY', e.target.y());
    },
    onDragMove: (e: any) => {
      const node = e.target;
      const dx = node.x() - (node.getAttr('dragStartX') || 0);
      const dy = node.y() - (node.getAttr('dragStartY') || 0);

      const currentSelected = useEditorStore.getState().selectedShapeIds;
      if (currentSelected.includes(shape.id)) {
        currentSelected.forEach((id: string) => {
          if (id === shape.id) {
            updateShape(id, { x: node.x(), y: node.y() });
            return;
          }
          const otherNode = stageRef.current?.findOne(`#${id}`);
          if (otherNode) {
            const newX = (otherNode.getAttr('dragStartX') || 0) + dx;
            const newY = (otherNode.getAttr('dragStartY') || 0) + dy;
            otherNode.x(newX);
            otherNode.y(newY);
            updateShape(id, { x: newX, y: newY });
          }
        });
      } else {
        updateShape(shape.id, { x: node.x(), y: node.y() });
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
      saveHistory();
    },
    onTransform: (e: any) => {
      if (shape.type === 'sticker') {
        const anchor = getActiveTransformerAnchor(e.target);
        const next = applyStickerGroupTransform(e.target, shape.emoji || '', anchor);
        if (next) updateShape(shape.id, next);
        refreshTransformersForNode(e.target);
        return;
      }

      if (shape.type === 'blur' || shape.type === 'text') {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const prevW = node.width();
        const prevH = node.height();
        const minH = shape.type === 'text' ? textMinHeight(shape.fontSize || 20) : 20;
        const newWidth = Math.max(20, prevW * scaleX);
        const newHeight = Math.max(minH, prevH * scaleY);

        node.width(newWidth);
        node.height(newHeight);
        node.scaleX(1);
        node.scaleY(1);

        if (shape.type === 'blur') {
          const rectNode = node.findOne('Rect');
          if (rectNode) {
            rectNode.width(newWidth);
            rectNode.height(newHeight);
          }
        }

        if (shape.type === 'text') {
          // Transformer measures .callout-bounds — keep it in sync while scaling
          const bounds = node.findOne('.callout-bounds');
          if (bounds) {
            bounds.width(newWidth);
            bounds.height(newHeight);
          }
        }

        const patch: Record<string, unknown> = {
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        };

        // Keep the callout tip in the same relative place as the box grows/shrinks
        if (shape.type === 'text' && prevW > 0 && prevH > 0) {
          const latest = useEditorStore.getState().shapes.find((s) => s.id === shape.id) as ShapeLike | undefined;
          if (latest?.tailX !== undefined && latest?.tailY !== undefined) {
            patch.tailX = latest.tailX * (newWidth / prevW);
            patch.tailY = latest.tailY * (newHeight / prevH);
          }
        }

        updateShape(shape.id, patch);
        refreshTransformersForNode(node);
      }
    },
    onTransformEnd: (e: any) => {
      const node = e.target;

      if (shape.type === 'sticker') {
        const anchor = getActiveTransformerAnchor(node);
        const next = applyStickerGroupTransform(node, shape.emoji || '', anchor);
        if (next) updateShape(shape.id, next);
        refreshTransformersForNode(node);
        saveHistory();
        return;
      }

      // Text size is already baked in onTransform — don't re-apply stale shape.width * scale
      if (shape.type === 'text') {
        node.scaleX(1);
        node.scaleY(1);
        const minH = textMinHeight(shape.fontSize || 20);
        const width = Math.max(20, node.width());
        const height = Math.max(minH, node.height());
        const bounds = node.findOne('.callout-bounds');
        if (bounds) {
          bounds.width(width);
          bounds.height(height);
        }
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          width,
          height,
          rotation: node.rotation(),
        });
        refreshTransformersForNode(node);
        saveHistory();
        return;
      }

      // Magnifier: bake transformer scale into radius (top-left + keepRatio)
      if (shape.type === 'magnifier') {
        const scale = Math.max(Math.abs(node.scaleX() || 1), Math.abs(node.scaleY() || 1));
        const baseRadius = shape.radius || 60;
        const newRadius = Math.max(10, baseRadius * scale);
        const size = newRadius * 2;
        node.scaleX(1);
        node.scaleY(1);
        node.width(size);
        node.height(size);
        const bounds = node.findOne('.magnifier-bounds');
        if (bounds) {
          bounds.width(size);
          bounds.height(size);
        }
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          radius: newRadius,
          scaleX: 1,
          scaleY: 1,
        });
        refreshTransformersForNode(node);
        saveHistory();
        return;
      }

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      if (
        shape.type === 'rect' ||
        shape.type === 'circle' ||
        shape.type === 'triangle' ||
        shape.type === 'blur' ||
        shape.type === 'image'
      ) {
        node.scaleX(1);
        node.scaleY(1);

        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(5, node.height() * scaleY),
          rotation: node.rotation(),
        });
      } else {
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          scaleX,
          scaleY,
          rotation: node.rotation(),
        });
      }
      saveHistory();
    },
  };
}
