import { Eraser, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON, ICON_SM, ICON_XS } from './toolbarUi';

interface DeleteControlsProps {
  canDeleteSelected: boolean;
  canClearAll: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onDeleteSelected: () => void;
  onRequestClearAll: () => void;
  isVertical?: boolean;
}

export function DeleteControls({
  canDeleteSelected,
  canClearAll,
  menuOpen,
  onMenuOpenChange,
  onDeleteSelected,
  onRequestClearAll,
  isVertical,
}: DeleteControlsProps) {
  return (
    <div className={`relative flex items-stretch ${isVertical ? 'flex-col' : ''}`}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteSelected}
              disabled={!canDeleteSelected}
              className={`h-8 w-8 transition-colors ${isVertical ? 'rounded-b-none' : 'rounded-r-none'} ${
                !canDeleteSelected
                  ? 'text-muted-foreground/50'
                  : 'text-destructive hover:bg-destructive/20'
              }`}
            />
          }
        >
          <Eraser size={ICON} />
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Delete Selected (Del)
        </TooltipContent>
      </Tooltip>
      <Button
        variant="ghost"
        onClick={() => onMenuOpenChange(!menuOpen)}
        className={`px-0 transition-colors flex items-center justify-center text-destructive hover:bg-destructive/20 ${isVertical ? 'h-4 w-8 rounded-t-none border-t border-destructive/20' : 'h-8 w-6 rounded-l-none border-l border-destructive/20'}`}
      >
        <ChevronDown size={ICON_XS} />
      </Button>
      {menuOpen && (
        <div className={`absolute bg-background border border-border rounded-lg shadow-xl p-0.5 flex flex-col gap-0.5 z-[9999] ${isVertical ? 'top-0 left-full ml-1.5' : 'top-full mt-1.5 right-0'}`}>
          <Button
            variant="ghost"
            disabled={!canClearAll}
            onClick={() => {
              onMenuOpenChange(false);
              onRequestClearAll();
            }}
            className="h-8 justify-start gap-2 px-3 text-destructive hover:bg-destructive/20"
          >
            <Trash2 size={ICON_SM} />{' '}
            <span className="text-sm whitespace-nowrap font-medium">Clear All</span>
          </Button>
        </div>
      )}
    </div>
  );
}
