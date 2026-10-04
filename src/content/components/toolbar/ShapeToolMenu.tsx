import { Square, Circle, Triangle, ChevronDown } from 'lucide-react';
import type { ToolType } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON, ICON_SM, ICON_XS } from './toolbarUi';
import { StickerPicker } from './StickerMenu';
import { useUIStore } from '../../../store/useUIStore';
import { useTranslation } from '../../../lib/i18n';

const SHAPE_TOOLS: ToolType[] = ['rect', 'circle', 'triangle'];

interface ShapeToolMenuProps {
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  onAddSticker?: (emoji: string) => void;
  isVertical?: boolean;
}

export function ShapeToolMenu({
  activeTool,
  onSelect,
  onAddSticker,
  isVertical,
}: ShapeToolMenuProps) {
  const { t } = useTranslation();
  const { activeMenu, setActiveMenu } = useUIStore();
  const open = activeMenu === 'shape';
  const isShape = SHAPE_TOOLS.includes(activeTool);
  const ActiveIcon =
    activeTool === 'circle' ? Circle : activeTool === 'triangle' ? Triangle : Square;

  return (
    <div className={`relative flex items-stretch ${isVertical ? 'flex-col' : ''}`}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              data-tool="shape"
              variant={isShape ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                if (isShape) setActiveMenu(open ? null : 'shape');
                else onSelect('rect');
              }}
              className={`h-8 w-8 flex items-center justify-center ${isVertical ? 'rounded-b-none' : 'rounded-r-none'} ${
                isShape
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            />
          }
        >
          <ActiveIcon size={ICON} />
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {t('toolbar.shapesTooltip')}
        </TooltipContent>
      </Tooltip>
      <Button
        data-tool="shape-toggle"
        variant={isShape ? 'default' : 'ghost'}
        onClick={() => setActiveMenu(open ? null : 'shape')}
        className={`px-0 flex items-center justify-center ${isVertical ? 'h-4 w-8 rounded-t-none border-t' : 'h-8 w-6 rounded-l-none border-l'} ${
          isShape
            ? 'bg-primary text-primary-foreground hover:bg-primary/80 border-primary/50'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground border-border'
        }`}
      >
        <ChevronDown size={ICON_XS} />
      </Button>

      {open && (
        <div className={`absolute bg-background border border-border rounded-lg shadow-xl p-0.5 flex flex-col gap-0.5 z-[9999] w-44 overflow-hidden ${isVertical ? 'top-0 left-full ml-1.5' : 'top-full mt-1.5 left-0'}`}>
          {(
            [
              ['rect', Square, t('toolbar.shapes.rectangle')],
              ['circle', Circle, t('toolbar.shapes.circle')],
              ['triangle', Triangle, t('toolbar.shapes.triangle')],
            ] as const
          ).map(([tool, Icon, label]) => (
            <Button
              key={tool}
              data-tool={tool}
              variant="ghost"
              onClick={() => {
                onSelect(tool);
                setActiveMenu(null);
              }}
              className={`h-8 justify-start gap-2 px-2 ${
                activeTool === tool
                  ? 'bg-primary/50 text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >

              <Icon size={ICON_SM} /> <span className="text-sm whitespace-nowrap">{label}</span>
            </Button>
          ))}
          {onAddSticker && (
            <>
              <div className="h-px bg-border/40 my-0.5" />
              <StickerPicker
                onPicked={() => setActiveMenu(null)}
                onAddSticker={onAddSticker}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
