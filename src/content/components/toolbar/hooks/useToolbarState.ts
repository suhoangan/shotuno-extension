import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useEditorStore, type ToolType } from '../../../../store/useEditorStore';
import { snapStrokeWidth } from '../../../../store/editorDefaults';
import { toUiAnnotationSize } from '../../canvas/annotationSize';
import {
  isProFeatureEnabled,
  toolFeatureId,
  type ProFeaturesMap,
} from '../../../../lib/entitlements/proFeatures';
import { editorActions } from '../../../editorActions';
import { isUserFreeTier as computeFreeTier } from '../../../../lib/entitlements/license';
import { loadProFeatures } from '../../../../lib/entitlements/fetchProFeatures';
import { requestEndTextEdit } from '../../canvas/commitTextEdit';
import { useProGate } from '../../hooks/useProGate';
import { useToolHotkeys } from '../../hooks/useToolHotkeys';
import { useHardLoadingStore } from '../../../../store/useHardLoadingStore';
import { storage } from '../../../../lib/chromeStorage';


export function useToolbarState(onClose: () => void) {
  const {
    activeTool, setActiveTool, setSelectedColor, setStrokeWidth,
    selectedShapeIds, setSelectedShapeIds, saveHistory, setShapes,
    setIsSolid, setIsTwoWay, setIsLine, setBlurType, undo, redo, history, historyStep, shapes,
  } = useEditorStore();
  const { runPro, showSubscriptionPopup, setShowSubscriptionPopup, subscriptionMessage, creditsRemaining } = useProGate();
  const exportBusy = useHardLoadingStore((s) => s.loading != null);
  const [filename, setFilename] = useState(`Screenshot_${new Date().toISOString().slice(0, 10)}`);
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showBorderMenu, setShowBorderMenu] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);

  const lastClickRef = useRef<Record<string, number>>({});
  const [isUserFreeTier, setIsUserFreeTier] = useState(true);
  const [proFeatures, setProFeatures] = useState<ProFeaturesMap | null>(null);

  useEffect(() => {
    const refresh = () => {
      storage.local.get('authUser').then(({ authUser }) => {
        setIsUserFreeTier(computeFreeTier(authUser as object));
      });
    };
    refresh();
    void loadProFeatures().then(setProFeatures);
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === 'local' && changes.authUser) refresh();
    };
    storage.onChanged.addListener(onChange);
    return () => storage.onChanged.removeListener(onChange);
  }, []);

  const featureEnabled = useCallback(
    (featureId: string) =>
      !proFeatures || isProFeatureEnabled(proFeatures, featureId),
    [proFeatures],
  );

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

  useEffect(() => {
    if (selectedShapeIds.length !== 1) return;
    const shape = shapes.find((s) => s.id === selectedShapeIds[0]);
    if (!shape) return;
    const uiOnly = { persistToTool: false } as const;
    if ('color' in shape && shape.color) setSelectedColor(shape.color as string, uiOnly);
    if ('strokeWidth' in shape && shape.strokeWidth) {
      setStrokeWidth(snapStrokeWidth(toUiAnnotationSize(shape.strokeWidth as number)), uiOnly);
    }
    if ('isSolid' in shape && shape.isSolid !== undefined) setIsSolid(shape.isSolid as boolean, uiOnly);
    if ('isTwoWay' in shape && shape.isTwoWay !== undefined) setIsTwoWay(shape.isTwoWay as boolean, uiOnly);
    if ('isLine' in shape && shape.isLine !== undefined) setIsLine(shape.isLine as boolean, uiOnly);
    if ('blurType' in shape && shape.blurType) {
      setBlurType(shape.blurType as 'pixelate' | 'blur' | 'solid', uiOnly);
    }
  }, [selectedShapeIds, shapes, setSelectedColor, setStrokeWidth, setIsSolid, setIsTwoWay, setIsLine, setBlurType]);

  const handleSave = (type: 'download' | 'copy') => {
    if (!filename.trim()) {
      toast.error('Vui lòng nhập tên file trước khi lưu!');
      return;
    }
    throttle(`save-${type}`, 1500, () => {
      editorActions.emitExportCanvas({ type, filename: filename.trim() });
    })();
  };

  const handleToolSelect = useCallback((tool: ToolType) => {
    const catalogId = toolFeatureId(tool);
    if (catalogId && !featureEnabled(catalogId)) return;

    requestEndTextEdit();
    setActiveTool(tool);
    setSelectedShapeIds([]);
  }, [featureEnabled, setActiveTool, setSelectedShapeIds]);

  useToolHotkeys(handleToolSelect);

  const handleClose = throttle('close', 500, onClose);

  return {
    activeTool,
    setActiveTool,
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
    exportBusy,
    filename,
    setFilename,
    showShapeMenu,
    setShowShapeMenu,
    showDeleteMenu,
    setShowDeleteMenu,
    showBorderMenu,
    setShowBorderMenu,
    showWatermarkMenu,
    setShowWatermarkMenu,
    isAIModalOpen,
    setIsAIModalOpen,
    isClearAllOpen,
    setIsClearAllOpen,
    isUserFreeTier,
    featureEnabled,
    creditsRemaining,
    showSubscriptionPopup,
    setShowSubscriptionPopup,
    subscriptionMessage,
    throttle,
    handleSave,
    handleToolSelect,
    handleClose,
  };
}
