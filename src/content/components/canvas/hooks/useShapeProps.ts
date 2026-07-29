import { useEditorStore } from '../../../../store/useEditorStore';
import type { ToolType } from '../../../../store/editorTypes';
import { canMoveShapesWith, cursorForTool } from '../toolInteraction';
import { buildShapeDragHandlers } from './shapeDragHandlers';

interface UseShapePropsOptions {
  shape: any;
  stageRef: React.RefObject<any>;
  /** From parent so memoized renderers refresh listening with the tool. */
  activeTool?: string;
  /** Selected shapes stay movable even while a drawing tool is active. */
  isSelected?: boolean;
}

export function useShapeProps({
  shape,
  stageRef,
  activeTool: activeToolProp,
  isSelected: _isSelected = false,
}: UseShapePropsOptions) {
  const activeToolFromStore = useEditorStore((state) => state.activeTool);
  const activeTool = activeToolProp ?? activeToolFromStore;
  const setSelectedShapeIds = useEditorStore((state) => state.setSelectedShapeIds);
  const updateShape = useEditorStore((state) => state.updateShape);
  const saveHistory = useEditorStore((state) => state.saveHistory);
  const setIsDragging = useEditorStore((state) => state.setIsDragging);

  const canMove = canMoveShapesWith(activeTool as ToolType);

  const dragHandlers = buildShapeDragHandlers({
    shape,
    stageRef,
    updateShape,
    saveHistory,
    setIsDragging,
    setSelectedShapeIds,
  });

  return {
    id: shape.id,
    x: shape.x || 0,
    y: shape.y || 0,
    rotation: shape.rotation || 0,
    scaleX: shape.scaleX || 1,
    scaleY: shape.scaleY || 1,
    draggable: canMove,
    listening: canMove,
    onMouseDown: (e: any) => {
      if (!canMove) return;

      e.cancelBubble = true;
      const store = useEditorStore.getState();
      let newSelected = [shape.id];

      if (e.evt.shiftKey) {
        const currentSelected = store.selectedShapeIds;
        newSelected = currentSelected.includes(shape.id)
          ? currentSelected.filter((id: string) => id !== shape.id)
          : [...currentSelected, shape.id];
      }

      const currentShapes = store.shapes;
      const lastShapes = currentShapes.slice(-newSelected.length);
      const alreadyAtEnd =
        newSelected.length > 0 && lastShapes.every((s) => newSelected.includes(s.id));

      if (!alreadyAtEnd && newSelected.length > 0) {
        const unselected = currentShapes.filter((s) => !newSelected.includes(s.id));
        const selected = currentShapes.filter((s) => newSelected.includes(s.id));
        store.setShapes([...unselected, ...selected]);
        store.saveHistory();
      }
    },
    onClick: (e: any) => {
      if (!canMove) return;
      if (e.evt.shiftKey) {
        const currentSelected = useEditorStore.getState().selectedShapeIds;
        const alreadySelected = currentSelected.includes(shape.id);
        setSelectedShapeIds(
          alreadySelected
            ? currentSelected.filter((id: string) => id !== shape.id)
            : [...currentSelected, shape.id],
        );
      } else {
        setSelectedShapeIds([shape.id]);
      }
    },
    onMouseEnter: (e: any) => {
      if (canMove) {
        e.target.getStage().container().style.cursor = 'move';
      }
    },
    onMouseLeave: (e: any) => {
      if (canMove) {
        e.target.getStage().container().style.cursor = cursorForTool(activeTool as ToolType);
      }
    },
    onDragStart: dragHandlers.onDragStart,
    onDragMove: dragHandlers.onDragMove,
    onDragEnd: dragHandlers.onDragEnd,
    onTransform: dragHandlers.onTransform,
    onTransformEnd: dragHandlers.onTransformEnd,
  };
}
