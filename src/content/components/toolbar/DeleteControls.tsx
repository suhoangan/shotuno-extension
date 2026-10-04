import { Eraser, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON, ICON_SM, ICON_XS } from './toolbarUi';
import { useUIStore } from '../../../store/useUIStore';
import { useTranslation } from '../../../lib/i18n';

interface DeleteControlsProps {
  canDeleteSelected: boolean;
  canClearAll: boolean;
  onDeleteSelected: () => void;
  onRequestClearAll: () => void;
  isVertical?: boolean;
}

export function DeleteControls({
  canDeleteSelected,
  canClearAll,
  onDeleteSelected,
  onRequestClearAll,
  isVertical,
}: DeleteControlsProps) {
  const { t } = useTranslation();
  const { activeMenu, setActiveMenu } = useUIStore();
  const menuOpen = activeMenu === 'delete';

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
              className={`h-8 w-8 ${isVertical ? 'rounded-b-none' : 'rounded-r-none'} ${
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
          {t('toolbar.deleteTooltip')}
        </TooltipContent>
      </Tooltip>
      <Button
        variant="ghost"
        onClick={() => setActiveMenu(menuOpen ? null : 'delete')}
        className={`px-0 flex items-center justify-center text-destructive hover:bg-destructive/20 ${isVertical ? 'h-4 w-8 rounded-t-none border-t border-destructive/20' : 'h-8 w-6 rounded-l-none border-l border-destructive/20'}`}
      >
        <ChevronDown size={ICON_XS} />
      </Button>
      {menuOpen && (
        <div className={`absolute bg-background border border-border rounded-lg shadow-xl p-0.5 flex flex-col gap-0.5 z-[9999] ${isVertical ? 'top-0 left-full ml-1.5' : 'top-full mt-1.5 right-0'}`}>
          <Button
            variant="ghost"
            disabled={!canClearAll}
            onClick={() => {
              setActiveMenu(null);
              onRequestClearAll();
            }}
            className="h-8 justify-start gap-2 px-3 text-destructive hover:bg-destructive/20"
          >
            <Trash2 size={ICON_SM} />{' '}
            <span className="text-sm whitespace-nowrap font-medium">{t('toolbar.clear')}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
