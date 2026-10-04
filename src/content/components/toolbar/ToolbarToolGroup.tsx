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
import type { ToolType } from '../../../store/editorTypes';
import { useUIStore } from '../../../store/useUIStore';
import { useTranslation } from '../../../lib/i18n';
import { useEditorStore } from '../../../store/useEditorStore';

export function ToolDivider() {
  return <Separator orientation="vertical" className="h-6 w-px mx-1 bg-border/40" />;
}

interface ToolbarToolGroupProps {
  handleToolSelect: (tool: ToolType) => void;
  featureEnabled: (id: string) => boolean;
}

export function ToolbarToolGroup({
  handleToolSelect,
  featureEnabled,
}: ToolbarToolGroupProps) {
  const { t } = useTranslation();
  const activeTool = useEditorStore(s => s.activeTool);
  const setActiveTool = useEditorStore(s => s.setActiveTool);
  const { setActiveMenu, setIsAIModalOpen } = useUIStore();

  return (
    <>
      <ToolButton tool="select" activeTool={activeTool} icon={MousePointer2} label={`${t('toolbar.select')} (V)`} onSelect={handleToolSelect} />
      <ToolButton tool="pan" activeTool={activeTool} icon={Hand} label={`${t('toolbar.pan')}`} onSelect={handleToolSelect} />
      <ToolDivider />

      {featureEnabled('arrow') && (
        <ToolButton tool="arrow" activeTool={activeTool} icon={MoveDiagonal} label={`${t('toolbar.arrow')} (A)`} onSelect={handleToolSelect} />
      )}
      {featureEnabled('shapes') && (
        <ShapeToolMenu
          activeTool={activeTool}
          onSelect={handleToolSelect}
          onAddSticker={
            featureEnabled('stickers')
              ? (emoji) => {
                  import('../../editorActions').then(({ editorActions }) => {
                    editorActions.emitAddSticker(emoji);
                    setActiveTool('select');
                    setActiveMenu(null);
                  });
                }
              : undefined
          }
        />
      )}
      {featureEnabled('text') && (
        <ToolButton tool="text" activeTool={activeTool} icon={Type} label={`${t('toolbar.text')} (T)`} onSelect={handleToolSelect} />
      )}
      {featureEnabled('brush') && (
        <ToolButton tool="brush" activeTool={activeTool} icon={PenTool} label={`${t('toolbar.brush')}`} onSelect={handleToolSelect} />
      )}
      {featureEnabled('highlight') && (
        <>
          <ToolButton tool="highlight" activeTool={activeTool} icon={Highlighter} label={`${t('toolbar.highlighter')} (Shift+H)`} onSelect={handleToolSelect} />
          <ToolButton
            tool="highlight-area" activeTool={activeTool} label={t('toolbar.highlighter')} onSelect={handleToolSelect}
            icon={({ size = ICON, className = '' }) => (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.4" />
                <path d="M4 8h16M4 16h16M8 4v16M16 4v16" strokeOpacity="0.2" />
              </svg>
            )}
          />
        </>
      )}
      {featureEnabled('counter') && (
        <ToolButton
          tool="counter"
          activeTool={activeTool}
          label={`${t('toolbar.counter')} (C)`}
          onSelect={handleToolSelect}
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
        <ToolButton
          tool="blur"
          activeTool={activeTool}
          icon={Droplets}
          label={`${t('toolbar.blur')} (S)`}
          onSelect={handleToolSelect}
        />
      )}
      {featureEnabled('smart_blur') && (
        <ToolButton
          tool="smart_blur"
          icon={Wand2}
          label={t('toolbar.blur')}
          onClick={() => {
            import('../../editorActions').then(({ editorActions }) => editorActions.emitSmartBlur());
          }}
        />
      )}
      {featureEnabled('magnifier') && (
        <ToolButton
          tool="magnifier"
          activeTool={activeTool}
          icon={Search}
          label={`${t('toolbar.magnifier')}`}
          onSelect={handleToolSelect}
        />
      )}
      {featureEnabled('ocr') && (
        <ToolButton tool="ocr" activeTool={activeTool} icon={ScanText} label={`${t('toolbar.ocr')}`} onSelect={handleToolSelect} />
      )}
      {featureEnabled('measure') && (
        <ToolButton
          tool="measure"
          activeTool={activeTool}
          icon={Ruler}
          label={`${t('toolbar.measure')}`}
          onSelect={handleToolSelect}
        />
      )}
      <ToolDivider />

      {featureEnabled('window_border') && (
        <BorderMenu />
      )}
      {featureEnabled('watermark') && (
        <WatermarkMenu />
      )}
      <ToolDivider />

      {featureEnabled('crop') && (
        <ToolButton tool="crop" activeTool={activeTool} icon={Crop} label={`${t('toolbar.crop')} (Shift+C)`} onSelect={handleToolSelect} />
      )}
      {featureEnabled('resize') && (
        <ToolButton
          tool="resize"
          icon={Scaling}
          label={t('toolbar.resize')}
          onClick={() => {
            import('../../editorActions').then(({ editorActions }) => editorActions.emitOpenResize());
          }}
        />
      )}
      <ToolDivider />

      {featureEnabled('send_to_ai') && (
        <ToolButton
          tool="send_to_ai"
          icon={Sparkles}
          label={t('toolbar.sendToAI')}
          onClick={() => {
            setIsAIModalOpen(true);
          }}
        />
      )}
    </>
  );
}
