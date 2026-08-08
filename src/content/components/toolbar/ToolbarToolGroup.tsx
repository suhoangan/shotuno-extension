import {
  MousePointer2, Hand, Type, PenTool, MoveDiagonal, Droplets,
  Crop, Ruler, Sparkles, Search, Highlighter, Scaling, ScanText, Wand2,
} from 'lucide-react';
import { ToolButton } from './ToolButton';
import { ShapeToolMenu } from './ShapeToolMenu';
import { BorderMenu } from './BorderMenu';
import { WatermarkMenu } from './WatermarkMenu';
import { Separator } from '../../../components/ui/separator';
import { ICON } from './toolbarUi';
import { toolProFeatureId, type ProFeatureId } from '../../../lib/entitlements/proFeatures';
import type { ToolType } from '../../../store/editorTypes';

export function ToolDivider() {
  return <Separator orientation="vertical" className="h-6 w-px mx-1 bg-border/40" />;
}

interface ToolbarToolGroupProps {
  activeTool: ToolType;
  handleToolSelect: (tool: ToolType) => void;
  featureEnabled: (id: string) => boolean;
  isUserFreeTier: boolean;
  runPro: (featureId: ProFeatureId, action: () => void | Promise<void>) => Promise<boolean>;
  showShapeMenu: boolean;
  setShowShapeMenu: (open: boolean) => void;
  showBorderMenu: boolean;
  setShowBorderMenu: (open: boolean) => void;
  showWatermarkMenu: boolean;
  setShowWatermarkMenu: (open: boolean) => void;
  setIsAIModalOpen: (open: boolean) => void;
  setActiveTool: (tool: ToolType) => void;
}

export function ToolbarToolGroup({
  activeTool,
  handleToolSelect,
  featureEnabled,
  isUserFreeTier,
  runPro,
  showShapeMenu,
  setShowShapeMenu,
  showBorderMenu,
  setShowBorderMenu,
  showWatermarkMenu,
  setShowWatermarkMenu,
  setIsAIModalOpen,
  setActiveTool,
}: ToolbarToolGroupProps) {
  return (
    <>
      <ToolButton tool="select" activeTool={activeTool} icon={MousePointer2} label="Select (V)" onSelect={handleToolSelect} />
      <ToolButton tool="pan" activeTool={activeTool} icon={Hand} label="Pan Canvas (H)" onSelect={handleToolSelect} />
      <ToolDivider />

      {featureEnabled('arrow') && (
        <ToolButton tool="arrow" activeTool={activeTool} icon={MoveDiagonal} label="Arrow / Line (A)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('shapes') && (
        <ShapeToolMenu
          activeTool={activeTool} open={showShapeMenu} onOpenChange={setShowShapeMenu} onSelect={handleToolSelect}
          onAddSticker={featureEnabled('stickers') ? (emoji) => {
            void runPro('stickers', () => {
              import('../../editorActions').then(({ editorActions }) => {
                editorActions.emitAddSticker(emoji);
                setActiveTool('select');
                setShowShapeMenu(false);
              });
            });
          } : undefined}
        />
      )}
      {featureEnabled('text') && (
        <ToolButton tool="text" activeTool={activeTool} icon={Type} label="Text / Callout (T)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('brush') && (
        <ToolButton tool="brush" activeTool={activeTool} icon={PenTool} label="Brush (B)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('highlight') && (
        <ToolButton tool="highlight" activeTool={activeTool} icon={Highlighter} label="Highlight (Shift+H)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('counter') && (
        <ToolButton
          tool="counter" activeTool={activeTool} label="Counter Marker (C)" onSelect={handleToolSelect}
          icon={({ size = ICON, className = '' }) => (
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
              <circle cx="12" cy="12" r="9" />
              <text x="12" y="16.5" fontSize="11" textAnchor="middle" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="bold">1</text>
            </svg>
          )}
        />
      )}
      <ToolDivider />

      {featureEnabled('blur') && (
        <ToolButton tool="blur" activeTool={activeTool} icon={Droplets} label="Manual Blur (S)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('smart_blur') && (
        <ToolButton
          icon={Wand2}
          label="Smart Blur Sensitive Data"
          onClick={() => void runPro('smart_blur', () => {
            import('../../editorActions').then(({ editorActions }) => editorActions.emitSmartBlur());
          })}
          isPro={isUserFreeTier && !!toolProFeatureId('smart_blur')}
        />
      )}
      {featureEnabled('magnifier') && (
        <ToolButton tool="magnifier" activeTool={activeTool} icon={Search} label="Magnifier (Z)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('ocr') && (
        <ToolButton tool="ocr" activeTool={activeTool} icon={ScanText} label="Extract Text (E)" onSelect={handleToolSelect} isPro={isUserFreeTier && !!toolProFeatureId('ocr')} />
      )}
      {featureEnabled('measure') && (
        <ToolButton tool="measure" activeTool={activeTool} icon={Ruler} label="Measure / Distance (M)" onSelect={handleToolSelect} />
      )}
      <ToolDivider />

      {featureEnabled('window_border') && (
        <BorderMenu
          showBorderMenu={showBorderMenu}
          isPro={isUserFreeTier && !!toolProFeatureId('window_border')}
          setShowBorderMenu={setShowBorderMenu}
        />
      )}
      {featureEnabled('watermark') && (
        <WatermarkMenu
          showWatermarkMenu={showWatermarkMenu}
          isPro={isUserFreeTier && !!toolProFeatureId('watermark')}
          setShowWatermarkMenu={setShowWatermarkMenu}
        />
      )}
      <ToolDivider />

      {featureEnabled('crop') && (
        <ToolButton tool="crop" activeTool={activeTool} icon={Crop} label="Crop Image (Shift+C)" onSelect={handleToolSelect} />
      )}
      {featureEnabled('resize') && (
        <ToolButton
          icon={Scaling}
          label="Resize Image"
          onClick={() => void runPro('resize', () => {
            import('../../editorActions').then(({ editorActions }) => editorActions.emitOpenResize());
          })}
          isPro={isUserFreeTier && !!toolProFeatureId('resize')}
        />
      )}
      <ToolDivider />

      {featureEnabled('send_to_ai') && (
        <ToolButton
          icon={Sparkles}
          label="Smart Parse"
          onClick={() => void runPro('send_to_ai', () => setIsAIModalOpen(true))}
          isPro={isUserFreeTier && !!toolProFeatureId('send_to_ai')}
        />
      )}
    </>
  );
}
