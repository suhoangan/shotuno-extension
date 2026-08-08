import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ToolType } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { BTN, ICON } from './toolbarUi';
import { ProBadge } from './ProBadge';

type IconComponent = LucideIcon | ((props: { size?: number; className?: string }) => ReactNode);

interface ToolButtonProps {
  tool?: ToolType;
  activeTool?: ToolType;
  icon: IconComponent;
  label: string;
  onSelect?: (tool: ToolType) => void;
  onClick?: () => void;
  isPro?: boolean;
}

export function ToolButton({ tool, activeTool, icon: Icon, label, onSelect, onClick, isPro }: ToolButtonProps) {
  const isActive = Boolean(tool && activeTool === tool);
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (tool && onSelect) {
      onSelect(tool);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={isActive ? 'default' : 'ghost'}
            size="icon"
            onClick={handleClick}
            className={`${BTN} relative overflow-visible rounded-lg transition-colors flex items-center justify-center ${
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon size={ICON} className="size-5" />
            <ProBadge show={isPro} />
          </Button>
        }
      />
      <TooltipContent side="bottom" sideOffset={8} className="z-[99999999]">
        {label} {isPro && <span className="ml-1 text-primary font-bold">PRO</span>}
      </TooltipContent>
    </Tooltip>
  );
}
