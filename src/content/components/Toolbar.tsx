import { lazy, Suspense } from 'react';
import { StyleToolbar } from './toolbar/StyleToolbar';
import { UndoRedoControls } from './toolbar/UndoRedoControls';
import { ExportActions } from './toolbar/ExportActions';
import { DeleteControls } from './toolbar/DeleteControls';
import { BAR, BAR_GAP, CHROME } from './toolbar/toolbarUi';
import { TooltipProvider } from '../../components/ui/tooltip';
import { ProSubscriptionModal } from './toolbar/ProSubscriptionModal';
import { FilenameInput } from './toolbar/FilenameInput';
import { CreditsBadge } from './toolbar/CreditsBadge';
import { ClearAllDialog } from './toolbar/ClearAllDialog';
import { useToolbarState } from './toolbar/hooks/useToolbarState';
import { ToolbarToolGroup, ToolDivider } from './toolbar/ToolbarToolGroup';

const SendToAIModal = lazy(() => import('./SendToAIModal'));

export default function Toolbar({ onClose }: { onClose: () => void }) {
  const {
    activeTool, setActiveTool, setSelectedShapeIds, setShapes, saveHistory,
    historyStep, history, shapes, selectedShapeIds, undo, redo, runPro,
    exportBusy, filename, setFilename, showShapeMenu, setShowShapeMenu,
    showDeleteMenu, setShowDeleteMenu, showBorderMenu, setShowBorderMenu,
    showWatermarkMenu, setShowWatermarkMenu, isAIModalOpen, setIsAIModalOpen,
    isClearAllOpen, setIsClearAllOpen, isUserFreeTier, featureEnabled, creditsRemaining,
    showSubscriptionPopup, setShowSubscriptionPopup, subscriptionMessage,
    throttle, handleSave, handleToolSelect, handleClose,
  } = useToolbarState(onClose);

  return (
    <TooltipProvider delay={300}>
      <div className="fixed top-4 left-0 right-0 z-[9999999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <div className={`${CHROME} ${BAR} flex flex-wrap justify-center w-fit max-w-full ${BAR_GAP} items-center relative z-50 pointer-events-auto`}>
          <UndoRedoControls
            canUndo={historyStep > 0} canRedo={historyStep < history.length - 1}
            onUndo={throttle('undo', 300, undo)} onRedo={throttle('redo', 300, redo)}
          />
          <ToolDivider />

          <ToolbarToolGroup
            activeTool={activeTool}
            handleToolSelect={handleToolSelect}
            featureEnabled={featureEnabled}
            isUserFreeTier={isUserFreeTier}
            runPro={runPro}
            showShapeMenu={showShapeMenu}
            setShowShapeMenu={setShowShapeMenu}
            showBorderMenu={showBorderMenu}
            setShowBorderMenu={setShowBorderMenu}
            showWatermarkMenu={showWatermarkMenu}
            setShowWatermarkMenu={setShowWatermarkMenu}
            setIsAIModalOpen={setIsAIModalOpen}
            setActiveTool={setActiveTool}
          />

          <DeleteControls
            canDeleteSelected={selectedShapeIds.length > 0} canClearAll={shapes.length > 0}
            menuOpen={showDeleteMenu} onMenuOpenChange={setShowDeleteMenu}
            onDeleteSelected={throttle('delete-selected', 300, () => {
              if (selectedShapeIds.length === 0) return;
              setShapes(shapes.filter((s) => !selectedShapeIds.includes(s.id)));
              setSelectedShapeIds([]);
              saveHistory();
            })}
            onRequestClearAll={() => setIsClearAllOpen(true)}
          />

          <ToolDivider />
          <ExportActions
            onCopy={featureEnabled('export_copy') ? () => handleSave('copy') : undefined}
            onDownload={featureEnabled('export_download') ? () => handleSave('download') : undefined}
            onClose={handleClose} busy={exportBusy}
          />
        </div>
        <StyleToolbar />
      </div>

      <FilenameInput filename={filename} onChange={setFilename} />
      <CreditsBadge creditsRemaining={creditsRemaining} />
      <ProSubscriptionModal open={showSubscriptionPopup} onOpenChange={setShowSubscriptionPopup} message={subscriptionMessage} />
      {isAIModalOpen && (
        <Suspense fallback={null}>
          <SendToAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
        </Suspense>
      )}
      <ClearAllDialog
        open={isClearAllOpen} onOpenChange={setIsClearAllOpen} shapeCount={shapes.length}
        onConfirm={() => { setShapes([]); setSelectedShapeIds([]); saveHistory(); }}
      />
    </TooltipProvider>
  );
}
