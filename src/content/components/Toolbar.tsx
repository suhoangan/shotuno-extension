import {
  MousePointer2, Hand, Type, PenTool, MoveDiagonal, Droplets,
  Crop, Ruler, Sparkles, Search, Highlighter, Scaling, ScanText, Wand2,
} from 'lucide-react';
import SendToAIModal from './SendToAIModal';
import { StyleToolbar } from './toolbar/StyleToolbar';
import { BorderMenu } from './toolbar/BorderMenu';
import { WatermarkMenu } from './toolbar/WatermarkMenu';
import { ToolButton } from './toolbar/ToolButton';
import { UndoRedoControls } from './toolbar/UndoRedoControls';
import { ExportActions } from './toolbar/ExportActions';
import { ShapeToolMenu } from './toolbar/ShapeToolMenu';
import { DeleteControls } from './toolbar/DeleteControls';
import { BAR, BAR_GAP, ICON, CHROME } from './toolbar/toolbarUi';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { toolProFeatureId } from '../../lib/entitlements/proFeatures';
import { ProSubscriptionModal } from './toolbar/ProSubscriptionModal';
import { FilenameInput } from './toolbar/FilenameInput';
import { CreditsBadge } from './toolbar/CreditsBadge';
import { ClearAllDialog } from './toolbar/ClearAllDialog';
import { ProBadge } from './toolbar/ProBadge';
import { useToolbarState } from './toolbar/hooks/useToolbarState';

function ToolDivider() {
  return <Separator orientation="vertical" className="h-6 w-px mx-1 bg-border/40" />;
}

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

          <ToolButton tool="select" activeTool={activeTool} icon={MousePointer2} label="Select (V)" onSelect={handleToolSelect} />
          <ToolButton tool="pan" activeTool={activeTool} icon={Hand} label="Pan Canvas (H)" onSelect={handleToolSelect} />
          <ToolDivider />

          <ToolButton tool="arrow" activeTool={activeTool} icon={MoveDiagonal} label="Arrow / Line (A)" onSelect={handleToolSelect} />
          <ShapeToolMenu
            activeTool={activeTool} open={showShapeMenu} onOpenChange={setShowShapeMenu} onSelect={handleToolSelect}
            onAddSticker={(emoji) => {
              void runPro('stickers', () => {
                document.dispatchEvent(new CustomEvent('add-sticker', { detail: emoji }));
                setActiveTool('select');
                setShowShapeMenu(false);
              });
            }}
          />
          <ToolButton tool="text" activeTool={activeTool} icon={Type} label="Text / Callout (T)" onSelect={handleToolSelect} />
          <ToolButton tool="brush" activeTool={activeTool} icon={PenTool} label="Brush (B)" onSelect={handleToolSelect} />
          <ToolButton tool="highlight" activeTool={activeTool} icon={Highlighter} label="Highlight (Shift+H)" onSelect={handleToolSelect} />
          <ToolButton
            tool="counter" activeTool={activeTool} label="Counter Marker (C)" onSelect={handleToolSelect}
            icon={({ size = ICON, className = '' }) => (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <circle cx="12" cy="12" r="9" />
                <text x="12" y="16.5" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="bold">1</text>
              </svg>
            )}
          />
          <ToolDivider />

          <ToolButton tool="blur" activeTool={activeTool} icon={Droplets} label="Manual Blur (S)" onSelect={handleToolSelect} />
          {featureEnabled('smart_blur') && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => void runPro('smart_blur', () => { document.dispatchEvent(new CustomEvent('trigger-smart-blur')); })}
                    className="h-8 w-8 overflow-visible text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative"
                  >
                    <Wand2 size={ICON} />
                    <ProBadge show={isUserFreeTier && !!toolProFeatureId('smart_blur')} />
                  </Button>
                }
              />
              <TooltipContent side="bottom" sideOffset={8}>Smart Blur Sensitive Data</TooltipContent>
            </Tooltip>
          )}
          <ToolButton tool="magnifier" activeTool={activeTool} icon={Search} label="Magnifier (Z)" onSelect={handleToolSelect} />
          {featureEnabled('ocr') && (
            <ToolButton tool="ocr" activeTool={activeTool} icon={ScanText} label="Extract Text (E)" onSelect={handleToolSelect} isPro={isUserFreeTier && !!toolProFeatureId('ocr')} />
          )}
          <ToolButton tool="measure" activeTool={activeTool} icon={Ruler} label="Measure / Distance (M)" onSelect={handleToolSelect} />
          <ToolDivider />

          {featureEnabled('window_border') && (
            <BorderMenu
              showBorderMenu={showBorderMenu}
              isPro={isUserFreeTier && !!toolProFeatureId('window_border')}
              setShowBorderMenu={(open) => {
                if (open) void runPro('window_border', () => setShowBorderMenu(true));
                else setShowBorderMenu(false);
              }}
            />
          )}
          {featureEnabled('watermark') && (
            <WatermarkMenu
              showWatermarkMenu={showWatermarkMenu}
              isPro={isUserFreeTier && !!toolProFeatureId('watermark')}
              setShowWatermarkMenu={(open) => {
                if (open) void runPro('watermark', () => setShowWatermarkMenu(true));
                else setShowWatermarkMenu(false);
              }}
            />
          )}
          <ToolDivider />

          <ToolButton tool="crop" activeTool={activeTool} icon={Crop} label="Crop Image (Shift+C)" onSelect={handleToolSelect} />
          {featureEnabled('resize') && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => void runPro('resize', () => { document.dispatchEvent(new CustomEvent('open-resize')); })}
                    className="h-8 w-8 overflow-visible text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative"
                  >
                    <Scaling size={ICON} />
                    <ProBadge show={isUserFreeTier && !!toolProFeatureId('resize')} />
                  </Button>
                }
              />
              <TooltipContent side="bottom" sideOffset={8}>Resize Image</TooltipContent>
            </Tooltip>
          )}
          <ToolDivider />

          {featureEnabled('send_to_ai') && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => void runPro('send_to_ai', () => setIsAIModalOpen(true))}
                    className="h-8 w-8 overflow-visible text-muted-foreground hover:bg-accent hover:text-foreground transition-colors relative"
                  >
                    <Sparkles size={ICON} />
                    <ProBadge show={isUserFreeTier && !!toolProFeatureId('send_to_ai')} />
                  </Button>
                }
              />
              <TooltipContent side="bottom" sideOffset={8}>Smart Parse</TooltipContent>
            </Tooltip>
          )}

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
            onCopy={() => handleSave('copy')} onDownload={() => handleSave('download')}
            onClose={handleClose} busy={exportBusy}
          />
        </div>
        <StyleToolbar />
      </div>

      <FilenameInput filename={filename} onChange={setFilename} />
      <CreditsBadge creditsRemaining={creditsRemaining} />
      <ProSubscriptionModal open={showSubscriptionPopup} onOpenChange={setShowSubscriptionPopup} message={subscriptionMessage} />
      <SendToAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
      <ClearAllDialog
        open={isClearAllOpen} onOpenChange={setIsClearAllOpen} shapeCount={shapes.length}
        onConfirm={() => { setShapes([]); setSelectedShapeIds([]); saveHistory(); }}
      />
    </TooltipProvider>
  );
}
