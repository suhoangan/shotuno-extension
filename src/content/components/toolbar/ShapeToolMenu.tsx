import { Square, Circle, Triangle, ChevronDown } from 'lucide-react';
import type { ToolType } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON, ICON_SM, ICON_XS } from './toolbarUi';
import { StickerPicker } from './StickerMenu';

const SHAPE_TOOLS: ToolType[] = ['rect', 'circle', 'triangle'];

interface ShapeToolMenuProps {
  activeTool: ToolType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (tool: ToolType) => void;
  onAddSticker?: (emoji: string) => void;
  isVertical?: boolean;
}

export function ShapeToolMenu({
  activeTool,
  open,
  onOpenChange,
  onSelect,
  onAddSticker,
  isVertical,
}: ShapeToolMenuProps) {
  const isShape = SHAPE_TOOLS.includes(activeTool);
  const ActiveIcon =
    activeTool === 'circle' ? Circle : activeTool === 'triangle' ? Triangle : Square;

  return (
    <div className={`relative flex items-stretch ${isVertical ? 'flex-col' : ''}`}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={isShape ? 'default' : 'ghost'}
              size="icon"
              onClick={() => {
                if (isShape) onOpenChange(!open);
                else onSelect('rect');
              }}
              className={`h-8 w-8 transition-colors flex items-center justify-center ${isVertical ? 'rounded-b-none' : 'rounded-r-none'} ${
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
          Shapes
        </TooltipContent>
      </Tooltip>
      <Button
        variant={isShape ? 'default' : 'ghost'}
        onClick={() => onOpenChange(!open)}
        className={`px-0 transition-colors flex items-center justify-center ${isVertical ? 'h-4 w-8 rounded-t-none border-t' : 'h-8 w-6 rounded-l-none border-l'} ${
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
              ['rect', Square, 'Rectangle (R)'],
              ['circle', Circle, 'Circle (O)'],
              ['triangle', Triangle, 'Triangle (Y)'],
            ] as const
          ).map(([tool, Icon, label]) => (
            <Button
              key={tool}
              variant="ghost"
              onClick={() => {
                onSelect(tool);
                onOpenChange(false);
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
          <div className="h-px bg-border/40 my-0.5" />
          <StickerPicker
            onPicked={() => onOpenChange(false)}
            onAddSticker={onAddSticker}
          />
        </div>
      )}
    </div>
  );
}
