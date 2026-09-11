import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { canMoveShapesWith, findShapeIdFromTarget } from '../toolInteraction';
import type { ToolType } from '../../../../store/editorTypes';
import { commitTextEdit, suppressNextTextBlurCommit } from '../commitTextEdit';
import { cancelPendingTextEdit } from '../scheduleTextEdit';
import { getStagePointerPos } from '../pointerPos';
import { toImageAnnotationSize } from '../annotationSize';
import { startDrawingShape } from './drawingStart';
import { updateDrawingOnMove } from './drawingMove';
import { useProGate } from '../../hooks/useProGate';
import { toolProFeatureId } from '../../../../lib/entitlements/proFeatures';

interface UseCanvasDrawingProps {
  stageRef: React.RefObject<any>;
  scale: number;
  bounds: { x: number; y: number; width: number; height: number };
  editingText: any | null;
  setEditingText: (text: any | null) => void;
  findEdges?: (
    x: number,
    y: number,
  ) => {
    top: number;
    bottom: number;
    left: number;
    right: number;
    centerX: number;
    centerY: number;
    hasVertical: boolean;
    hasHorizontal: boolean;
  } | null;
}

export function useCanvasDrawing({
  stageRef,
  scale,
  bounds,
  editingText,
  setEditingText,
  findEdges,
}: UseCanvasDrawingProps) {
  const {
    activeTool, shapes, addShape, updateShape, saveHistory,
    toolSettings, setSelectedShapeIds,
  } = useEditorStore();
  const { runPro } = useProGate();

  const [selectionBox, setSelectionBox] = useState({
    x: 0, y: 0, width: 0, height: 0, visible: false,
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShapeId, setCurrentShapeId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const lastEdgeCheckTime = useRef(0);
  const pendingTextEditTimer = useRef<number | null>(null);
  const drawingMoveRef = useRef<(e: MouseEvent) => void>(() => {});
  const drawingUpRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (activeTool === 'text') return;
    cancelPendingTextEdit(pendingTextEditTimer);
  }, [activeTool]);

  const getPointerPos = (e: any) => getStagePointerPos(stageRef, scale, bounds, e);

  /** Keep OCR selection alive when the pointer leaves the canvas; finish only on real mouseup. */
  useEffect(() => {
    if (!isDrawing || activeTool !== 'ocr') return;

    const onMove = (e: MouseEvent) => drawingMoveRef.current(e);
    const onUp = () => drawingUpRef.current();
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDrawing, activeTool]);

  const handleMouseDown = (e: any) => {
    if (editingText) {
      const editingId = editingText.id;
      commitTextEdit(editingText);
      suppressNextTextBlurCommit();
      setEditingText(null);

      if (activeTool === 'text') {
        const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-image');
        if (!clickedOnEmpty) {
          const hitId = findShapeIdFromTarget(e.target, shapes.map((s) => s.id));
          // Click stayed on the callout being edited — just end edit
          if (!hitId || hitId === editingId) return;
          // Clicked another shape — fall through to normal select/move
        }
        // Empty canvas while text tool: fall through and create a new callout now
      }
    }

    if (
      canMoveShapesWith(activeTool as ToolType) &&
      e.target.getParent()?.className === 'Transformer'
    ) {
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('bg-image');
    const shapeIds = shapes.map((s) => s.id);
    const hitShapeId = clickedOnEmpty ? null : findShapeIdFromTarget(e.target, shapeIds);

    if (e.target.hasName?.('selection-handle')) return;

    // Hover/click on an existing shape: let shape props handle select + drag/resize
    if (hitShapeId && canMoveShapesWith(activeTool as ToolType)) {
      return;
    }

    if (clickedOnEmpty && activeTool === 'select') {
      const pos = getPointerPos(e.evt);
      setSelectionBox({ x: pos.x, y: pos.y, width: 0, height: 0, visible: true });
      if (!e.evt.shiftKey) setSelectedShapeIds([]);
      return;
    }

    if (activeTool === 'select' || activeTool === 'pan') return;

    setSelectedShapeIds([]);
    setIsDrawing(true);
    const pos = getPointerPos(e.evt);
    setStartPos(pos);

    const settings = toolSettings[activeTool]
      || useEditorStore.getState().toolSettings[activeTool];
    startDrawingShape({
      activeTool,
      pos,
      selectedColor: settings.color,
      strokeWidth: toImageAnnotationSize(settings.strokeWidth),
      addShape,
      saveHistory,
      setIsDrawing,
      setCurrentShapeId,
      setEditingText,
      pendingTextEditTimer,
    });

    if (activeTool === 'counter') {
      void runPro('counter', () => {});
    }
  };

  const handleMouseMove = (e: any) => {
    const pos = getPointerPos(e);
    updateDrawingOnMove({
      e,
      pos,
      activeTool,
      isDrawing,
      currentShapeId,
      startPos,
      selectionBox,
      shapes,
      stageRef,
      findEdges,
      lastEdgeCheckTime,
      updateShape,
      setSelectedShapeIds,
      setSelectionBox,
    });
  };

  const handleMouseUp = () => {
    if (selectionBox.visible) {
      setSelectionBox({ ...selectionBox, visible: false });
      return;
    }
    if (!isDrawing) return;
    const finishedId = currentShapeId;
    setIsDrawing(false);
    if (activeTool === 'crop' || activeTool === 'ocr') return;
    if (finishedId) setSelectedShapeIds([finishedId]);
    setCurrentShapeId(null);
    saveHistory();

    const proId = toolProFeatureId(activeTool);
    if (proId && finishedId && proId !== 'counter' && proId !== 'ocr') {
      void runPro(proId, () => {});
    }
  };

  drawingMoveRef.current = handleMouseMove;
  drawingUpRef.current = handleMouseUp;

  return {
    selectionBox,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
