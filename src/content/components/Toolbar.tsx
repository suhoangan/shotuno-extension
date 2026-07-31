import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '../../store/useEditorStore';
import type { ToolType } from '../../store/useEditorStore';
import { snapStrokeWidth } from '../../store/editorDefaults';
import { toUiAnnotationSize } from './canvas/annotationSize';
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
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toolProFeatureId } from '../../lib/entitlements/proFeatures';
import { requestEndTextEdit } from './canvas/commitTextEdit';
import { useProGate } from './hooks/useProGate';
import { useToolHotkeys } from './hooks/useToolHotkeys';
import { useHardLoadingStore } from '../../store/useHardLoadingStore';
import { Crown } from 'lucide-react';

function ToolDivider() {
  return <Separator orientation="vertical" className="h-6 w-px mx-1 bg-border/40" />;
}

function ProBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-0.5 shadow-sm z-50 pointer-events-none">
      <Crown size={10} fill="currentColor" />
    </div>
  );
}

export default function Toolbar({ onClose }: { onClose: () => void }) {
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

  useEffect(() => {
    chrome.storage.local.get('authUser').then(({ authUser }) => {
      if (authUser?.entitlements?.planTier && authUser.entitlements.planTier !== 'FREE') {
        setIsUserFreeTier(false);
      }
    });
  }, []);

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
    const featureId = type === 'copy' ? 'export_copy' : 'export_download';
    void runPro(featureId, () => {
      throttle(`save-${type}`, 1500, () => {
        document.dispatchEvent(new CustomEvent('export-canvas', { detail: { type, filename: filename.trim() } }));
      })();
    });
  };

  const handleToolSelect = useCallback((tool: ToolType) => {
    const apply = () => {
      requestEndTextEdit();
      setActiveTool(tool);
      setSelectedShapeIds([]);
    };
    const featureId = toolProFeatureId(tool);
    if (featureId) {
      void runPro(featureId, apply);
      return;
    }
    apply();
  }, [runPro, setActiveTool, setSelectedShapeIds]);

  useToolHotkeys(handleToolSelect);

  return (
    <TooltipProvider delay={300}>
      <div className="fixed top-4 left-0 right-0 z-[9999999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <div className={`${CHROME} ${BAR} flex flex-wrap justify-center w-fit max-w-full ${BAR_GAP} items-center relative z-50 pointer-events-auto`}>
          <UndoRedoControls
            canUndo={historyStep > 0}
            canRedo={historyStep < history.length - 1}
            onUndo={throttle('undo', 300, undo)}
            onRedo={throttle('redo', 300, redo)}
          />
          <ToolDivider />

          <ToolButton tool="select" activeTool={activeTool} icon={MousePointer2} label="Select (V)" onSelect={handleToolSelect} />
          <ToolButton tool="pan" activeTool={activeTool} icon={Hand} label="Pan Canvas (H)" onSelect={handleToolSelect} />

          <ToolDivider />

            <ToolButton tool="arrow" activeTool={activeTool} icon={MoveDiagonal} label="Arrow / Line (A)" onSelect={handleToolSelect} />
            <ShapeToolMenu
              activeTool={activeTool}
              open={showShapeMenu}
              onOpenChange={setShowShapeMenu}
              onSelect={handleToolSelect}
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
              tool="counter"
              activeTool={activeTool}
              label="Counter Marker (C)"
              onSelect={handleToolSelect}
              icon={({ size = ICON, className = '' }) => (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                  <circle cx="12" cy="12" r="9" />
                  <text x="12" y="16.5" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="bold">1</text>
                </svg>
              )}
            />

          <ToolDivider />

            <ToolButton tool="blur" activeTool={activeTool} icon={Droplets} label="Manual Blur (S)" onSelect={handleToolSelect} />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void runPro('smart_blur', () => {
                      document.dispatchEvent(new CustomEvent('trigger-smart-blur'));
                    })}
                    className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
                  />
                }
              >
                <div className="relative">
                  <Wand2 size={ICON} />
                  <ProBadge show={isUserFreeTier && !!toolProFeatureId('smart_blur')} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>Smart Blur Sensitive Data</TooltipContent>
            </Tooltip>
            <ToolButton tool="magnifier" activeTool={activeTool} icon={Search} label="Magnifier (Z)" onSelect={handleToolSelect} isPro={isUserFreeTier && !!toolProFeatureId('magnifier')} />
            <ToolButton tool="ocr" activeTool={activeTool} icon={ScanText} label="Extract Text (E)" onSelect={handleToolSelect} isPro={isUserFreeTier && !!toolProFeatureId('ocr')} />
            <ToolButton tool="measure" activeTool={activeTool} icon={Ruler} label="Measure / Distance (M)" onSelect={handleToolSelect} isPro={isUserFreeTier && !!toolProFeatureId('measure')} />

          <ToolDivider />

            <BorderMenu
              showBorderMenu={showBorderMenu}
              setShowBorderMenu={(open) => {
                if (open) void runPro('window_border', () => setShowBorderMenu(true));
                else setShowBorderMenu(false);
              }}
            />
            <WatermarkMenu
              showWatermarkMenu={showWatermarkMenu}
              setShowWatermarkMenu={(open) => {
                if (open) void runPro('watermark', () => setShowWatermarkMenu(true));
                else setShowWatermarkMenu(false);
              }}
            />

          <ToolDivider />

            <ToolButton tool="crop" activeTool={activeTool} icon={Crop} label="Crop Image (Shift+C)" onSelect={handleToolSelect} />
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void runPro('resize', () => {
                      document.dispatchEvent(new CustomEvent('open-resize'));
                    })}
                    className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  />
                }
              >
                <div className="relative">
                  <Scaling size={ICON} />
                  <ProBadge show={isUserFreeTier && !!toolProFeatureId('resize')} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>Resize Image</TooltipContent>
            </Tooltip>

          <ToolDivider />

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void runPro('send_to_ai', () => setIsAIModalOpen(true))}
                    className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  />
                }
              >
                <div className="relative">
                  <Sparkles size={ICON} />
                  <ProBadge show={isUserFreeTier && !!toolProFeatureId('send_to_ai')} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>Smart Parse</TooltipContent>
            </Tooltip>

          <DeleteControls
            canDeleteSelected={selectedShapeIds.length > 0}
            canClearAll={shapes.length > 0}
            menuOpen={showDeleteMenu}
            onMenuOpenChange={setShowDeleteMenu}
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
            onCopy={() => handleSave('copy')}
            onDownload={() => handleSave('download')}
            onClose={throttle('close', 500, onClose)}
            busy={exportBusy}
          />
        </div>
        <StyleToolbar />
      </div>

      <div className="fixed bottom-6 left-4 z-[9999999] pointer-events-auto">
        <div className={`${CHROME} px-2 py-0.5 text-sm flex items-center ${BAR_GAP}`}>
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-transparent border-none outline-none text-left w-48 text-foreground focus-visible:ring-1 focus-visible:ring-ring rounded h-8 shadow-none font-medium px-1.5"
          />
          <span className="text-muted-foreground pr-1.5">.png</span>
        </div>
      <div className="fixed bottom-6 right-4 z-[9999999] pointer-events-auto">
        {creditsRemaining !== null && (
          <div className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-md">
            {creditsRemaining} Credits Remaining
          </div>
        )}
      </div>

      <AlertDialog open={showSubscriptionPopup} onOpenChange={setShowSubscriptionPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Subscription Required</AlertDialogTitle>
            <AlertDialogDescription>
              {subscriptionMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Wait and continue use free feature</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open('https://shotuno.suhoangan.com/#pricing', '_blank');
              }}
            >
              See Pro Benefits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SendToAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all annotations?</AlertDialogTitle>
            <AlertDialogDescription>
              {shapes.length === 1
                ? 'This removes the 1 annotation on this screenshot. You can still undo it afterwards.'
                : `This removes all ${shapes.length} annotations on this screenshot. You can still undo it afterwards.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setShapes([]);
                setSelectedShapeIds([]);
                saveHistory();
              }}
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
