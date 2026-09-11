import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useUIStore } from '../../../../store/useUIStore';
import { useEditorStore, type ToolType } from '../../../../store/useEditorStore';
import {
  toolFeatureId,
  toolProFeatureId,
} from '../../../../lib/entitlements/proFeatures';
import { editorActions } from '../../../editorActions';
import { requestEndTextEdit } from '../../canvas/commitTextEdit';
import { useProGate } from '../../hooks/useProGate';
import { useToolHotkeys } from '../../hooks/useToolHotkeys';
import { useHardLoadingStore } from '../../../../store/useHardLoadingStore';
import { useToolbarEntitlements } from './useToolbarEntitlements';
import { useShallow } from 'zustand/react/shallow';

/**
 * Manages core toolbar interactions: tool selection, history (undo/redo), 
 * export handlers, and entitlement gating. 
 * 
 * Note: Style swatches and tool highlight rendering are handled by 
 * StyleToolbar and ToolbarToolGroup respectively, which read from the store directly.
 */
export function useToolbarState(onClose: () => void) {
  const {
    setActiveTool,
    selectedShapeIds, setSelectedShapeIds, saveHistory, setShapes,
    undo, redo, history, historyStep, shapes,
  } = useEditorStore(useShallow((state) => ({
    setActiveTool: state.setActiveTool,
    selectedShapeIds: state.selectedShapeIds,
    setSelectedShapeIds: state.setSelectedShapeIds,
    saveHistory: state.saveHistory,
    setShapes: state.setShapes,
    undo: state.undo,
    redo: state.redo,
    history: state.history,
    historyStep: state.historyStep,
    shapes: state.shapes,
  })));
  const { runPro, checkProAccess, creditsRemaining } = useProGate();
  const exportBusy = useHardLoadingStore((s) => s.loading != null);

  const lastClickRef = useRef<Record<string, number>>({});
  const { isUserFreeTier, featureEnabled } = useToolbarEntitlements();

  const throttle = (key: string, delay: number, callback: () => void) => {
    return (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      const now = Date.now();
      if (now - (lastClickRef.current[key] || 0) >= delay) {
        lastClickRef.current[key] = now;
        callback();
      }
    };
  };



  const handleSave = (type: 'download' | 'copy') => {
    const filename = useUIStore.getState().filename;
    if (!filename.trim()) {
      toast.error('Vui lòng nhập tên file trước khi lưu!');
      return;
    }
    throttle(`save-${type}`, 1500, () => {
      editorActions.emitExportCanvas({ type, filename: filename.trim() });
    })();
  };

  const handleToolSelect = useCallback(async (tool: ToolType) => {
    const catalogId = toolFeatureId(tool);
    if (catalogId && !featureEnabled(catalogId)) return;

    if (toolProFeatureId(tool)) {
      const allowed = await checkProAccess();
      if (!allowed) return;
    }

    requestEndTextEdit();
    setActiveTool(tool);
    setSelectedShapeIds([]);
  }, [featureEnabled, checkProAccess, setActiveTool, setSelectedShapeIds]);


  useToolHotkeys(handleToolSelect);

  const handleClose = throttle('close', 500, onClose);

  return {
    historyStep,
    history,
    shapes,
    selectedShapeIds,
    setSelectedShapeIds,
    setShapes,
    saveHistory,
    undo,
    redo,
    runPro,
    checkProAccess,
    exportBusy,
    isUserFreeTier,
    featureEnabled,
    creditsRemaining,
    throttle,
    handleSave,
    handleToolSelect,
    handleClose,
  };
}
